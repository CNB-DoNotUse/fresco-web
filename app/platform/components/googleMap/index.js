// based on https://github.com/fullstackreact/google-maps-react
/* global google */

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createHandlerName } from 'app/lib/helpers';
import isEqual from 'lodash/isEqual';

const evtNames = ['ready', 'click', 'dragend', 'tilesloaded', 'bounds_changed'];
const defaultLocation = { lng: -74, lat: 40.7 };

class Map extends React.Component {
    static propTypes = {
        initialLocation: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }).isRequired,
        location: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }),
        zoom: PropTypes.number.isRequired,
        children: PropTypes.node,
        scrollwheel: PropTypes.bool.isRequired,
        mapTypeControl: PropTypes.bool.isRequired,
        streetViewControl: PropTypes.bool.isRequired,
        draggable: PropTypes.bool.isRequired,
        zoomControl: PropTypes.bool.isRequired,
        panTo: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }),
        rerender: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        initialLocation: defaultLocation,
        zoom: 14,
        scrollwheel: false,
        mapTypeControl: false,
        streetViewControl: false,
        draggable: false,
        zoomControl: true,
        rerender: false,
    };

    constructor(props) {
        super(props);
        evtNames.forEach((e) => { Map.propTypes[createHandlerName(e)] = PropTypes.func; });
    }

    state = {
        currentLocation: [this.props.location, this.props.initialLocation, defaultLocation].find(loc => loc && loc.lat && loc.lng),
        loaded: false,
    };

    hasRerendered = false;

    componentDidMount() {
        this.loadMap();
    }

    componentWillReceiveProps(nextProps) {
        if (!isEqual(this.props.location, nextProps.location) && nextProps.location.lng && nextProps.location.lat) {
            this.setState({ currentLocation: nextProps.location });
        }

        if (!this.hasRerendered && this.map && this.props.rerender) {
            this.hasRerendered = true;
            google.maps.event.trigger(this.map, 'resize');
            this.recenterMap();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { panTo } = this.props;
        const { currentLocation } = this.state;

        if (prevState.currentLocation !== currentLocation) {
            this.recenterMap();
        }

        if (prevProps.panTo !== panTo) {
            this.panTo();
        }
    }

    panTo() {
        if (!this.map) return;
        const { panTo, initialLocation } = this.props;

        if (panTo) {
            const { lat, lng } = panTo;
            const location = new google.maps.LatLng({ lat, lng });
            this.map.panTo(location);
        } else {
            const { lat, lng } = initialLocation;
            const location = new google.maps.LatLng({ lat, lng });
            this.map.panTo(location);
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

    loadMap() {
        if (google) {
            const {
                zoom,
                scrollwheel,
                mapTypeControl,
                streetViewControl,
                draggable,
                zoomControl,
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

    renderChildren() {
        let { children } = this.props;
        if (!children) return null;
        children = Array.isArray(children) ? children.filter(c => !!c) : children;

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
                style={{ height: '100%', width: '100%' }}
                ref={(r) => { this.mapCtr = r; }}
            >
                {this.state.loaded && this.renderChildren()}
            </div>
        );
    }
}

export default Map;
