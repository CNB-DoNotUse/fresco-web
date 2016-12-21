// based on https://github.com/fullstackreact/google-maps-react
/* global google */

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

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
    }

    componentDidMount() {
        this.renderMarker();
    }

    componentDidUpdate(prevProps) {
        if ((this.props.map !== prevProps.map) ||
            (this.props.position !== prevProps.position)) {
            this.renderMarker();
        }
    }

    renderMarker() {
        const {
            map,
            position,
            mapCenter,
        } = this.props;

        const pos = position || mapCenter;
        const latLng = new google.maps.LatLng(pos.lat, pos.lng);

        const config = {
            map,
            position: latLng,
        };

        this.marker = new google.maps.Marker(config);
    }

    render() {
        return null;
    }
}

export default Marker;

