// based on https://github.com/fullstackreact/google-maps-react
/* global google */

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createHandlerName } from 'app/lib/helpers';

const evtNames = ['ready', 'click', 'dragend'];

class Map extends React.Component {
    static propTypes = {
        initialLocation: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }).isRequired,
        zoom: PropTypes.number.isRequired,
        children: PropTypes.node,
        scrollwheel: PropTypes.bool.isRequired,
        mapTypeControl: PropTypes.bool.isRequired,
        streetViewControl: PropTypes.bool.isRequired,
        draggable: PropTypes.bool.isRequired,
        zoomControl: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        initialLocation: { lng: -74, lat: 40.7 },
        zoom: 14,
        scrollwheel: false,
        mapTypeControl: false,
        streetViewControl: false,
        draggable: true,
        zoomControl: true,
    }

    constructor(props) {
        super(props);

        evtNames.forEach((e) => { Map.propTypes[createHandlerName(e)] = PropTypes.func; });
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
            const {
                zoom,
                scrollwheel,
                mapTypeControl,
                streetViewControl,
                draggable,
            } = this.props;
            const { currentLocation: { lat, lng } } = this.state;

            const maps = google.maps;
            const node = ReactDOM.findDOMNode(this.mapCtr);
            const center = new maps.LatLng({ lat, lng });
            const mapConfig = Object.assign({}, {
                center,
                zoom,
                scrollwheel,
                mapTypeControl,
                streetViewControl,
                zoomControl,
                draggable,
            });

            this.map = new maps.Map(node, mapConfig);

            evtNames.forEach((e) => {
                this.map.addListener(e, this.handleEvent(e));
            });

            maps.event.trigger(this.map, 'ready');
            this.setState({ loaded: true });
        }
    }

    /**
     * returns event handler that calls prop callback
     * uses timeout to limit event cbs being executed to one at a time
     *
     * @param {String} evtName
     */
    handleEvent(evtName) {
        let timeout;

        return (e) => {
            const handlerName = createHandlerName(evtName);
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

