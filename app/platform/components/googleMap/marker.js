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
        map: React.PropTypes.object,
        icon: React.PropTypes.object,
        pannedIcon: React.PropTypes.object,
        panned: React.PropTypes.bool,
        zIndex: React.PropTypes.number.isRequired,
    }

    static defaultProps = {
        zIndex: 1,
    };

    componentDidMount() {
        this.renderMarker();
    }

    componentDidUpdate(prevProps) {
        const { map, position, panned, pannedIcon, icon, zIndex } = this.props;
        if ((map !== prevProps.map) ||
            (position !== prevProps.position)) {
            this.renderMarker();
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
        } = this.props;

        const pos = position || mapCenter;
        const latLng = new google.maps.LatLng(pos.lat, pos.lng);

        const config = {
            position: latLng,
            map,
            zIndex,
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

