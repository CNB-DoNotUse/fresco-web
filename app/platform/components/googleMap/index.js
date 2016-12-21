// based on https://github.com/fullstackreact/google-maps-react
/* global google */

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import camelCase from 'lodash/camelCase';

const createHandlerName = evtName => camelCase(`on${evtName.toUpperCase()}`);

class Map extends React.Component {
    static propTypes = {
        initialLocation: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }),
        zoom: PropTypes.number,
        children: PropTypes.node,
    }

    static defaultProps = {
        initialLocation: { lng: -74, lat: 40.7 },
        zoom: 14,
    }

    static evtNames = ['ready', 'click', 'dragend']

    constructor(props) {
        super(props);

        Map.evtNames.forEach((e) => { Map.propTypes[createHandlerName(e)] = PropTypes.func; });
    }

    state = {
        currentLocation: this.props.initialLocation,
        loaded: false,
    }

    componentDidMount() {
        this.loadMap();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentLocation !== this.state.currentLocation) {
            this.recenterMap();
        }
    }

    loadMap() {
        if (google) {
            const { zoom } = this.props;
            const { currentLocation: { lat, lng } } = this.state;

            const maps = google.maps;
            const node = ReactDOM.findDOMNode(this.mapCtr);
            const center = new maps.LatLng({ lat, lng });
            const mapConfig = Object.assign({}, { center, zoom });

            this.map = new maps.Map(node, mapConfig);

            Map.evtNames.forEach((e) => {
                this.map.addListener(e, this.handleEvent(e));
            });

            maps.event.trigger(this.map, 'ready');
            this.setState({ loaded: true });
        }
    }

    handleEvent(evtName) {
        let timeout;
        const handlerName = createHandlerName(evtName);

        return (e) => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            timeout = setTimeout(() => {
                if (this.props[handlerName]) {
                    this.props[handlerName](this.props, this.map, e);
                }
            }, 0);
        };
    }

    recenterMap() {
        const map = this.map;
        const { lat, lng } = this.state.currentLocation;

        const maps = google.maps;

        if (map) {
            const center = new maps.LatLng(lat, lng);
            map.panTo(center);
        }
    }

    renderChildren() {
        const { children } = this.props;

        if (!this.map || !children) return null;

        return React.Children.map(children, c => (
            React.cloneElement(c, {
                map: this.map,
                mapCenter: this.state.currentLocation,
            })
        ));
    }

    render() {
        return (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                }}
                ref={(r) => { this.mapCtr = r; }}
            >
                {this.state.loaded && this.renderChildren()}
            </div>
        );
    }
}

export default Map;

