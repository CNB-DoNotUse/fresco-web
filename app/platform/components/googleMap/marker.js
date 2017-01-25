// based on https://github.com/fullstackreact/google-maps-react
/* global google */

import React, { PropTypes } from 'react';
import { createHandlerName } from 'app/lib/helpers';

const evtNames = ['click', 'dragend', 'mouseover', 'mouseout'];

class Marker extends React.Component {
    static propTypes = {
        position: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }),
        mapCenter: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }),
        map: PropTypes.object,
        icon: PropTypes.object,
        pannedIcon: PropTypes.object,
        panned: PropTypes.bool,
        zIndex: PropTypes.number.isRequired,
        draggable: PropTypes.bool,
    }

    static defaultProps = {
        zIndex: 1,
        draggable: false,
    };

    componentDidMount() {
        this.renderMarker();
    }

    componentDidUpdate(prevProps) {
        const { map, position, panned, pannedIcon, icon, zIndex } = this.props;
        if ((map !== prevProps.map)) {
            this.renderMarker();
        }

        if (position !== prevProps.position) {
            this.marker.setPosition(position);
        }

        if (panned !== prevProps.panned) {
            if (!panned) {
                this.marker.setIcon(icon);
                this.marker.setZIndex(zIndex);
            }
            if (panned && pannedIcon) {
                this.marker.setIcon(pannedIcon);
                this.marker.setZIndex(zIndex + 1);
            }
        }
    }

    componentWillUnmount() {
        if (this.marker) {
            this.marker.setMap(null);
        }
    }

    /**
     * returns event handler that calls prop callback
     *
     * @param {String} evtName
     */
    handleEvent(evtName) {
        return (e) => {
            const handlerName = createHandlerName(evtName);

            if (this.props[handlerName]) {
                this.props[handlerName](this.props, this.map, e);
            }
        };
    }

    renderMarker() {
        const {
            map,
            position,
            mapCenter,
            icon,
            zIndex,
            draggable,
        } = this.props;

        const pos = position || mapCenter;
        const latLng = new google.maps.LatLng(pos.lat, pos.lng);

        const config = {
            position: latLng,
            map,
            zIndex,
            draggable,
        };

        if (icon) config.icon = icon;

        this.marker = new google.maps.Marker(config);

        evtNames.forEach((e) => {
            this.marker.addListener(e, this.handleEvent(e));
        });
    }

    render() {
        return null;
    }
}

export default Marker;

