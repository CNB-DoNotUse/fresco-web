// based on https://github.com/fullstackreact/google-maps-react
/* global google */

import React, { PropTypes } from 'react';

class MarkerGroup extends React.Component {
    static propTypes = {
        mapCenter: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }),
        map: React.PropTypes.object,
        icon: React.PropTypes.object,
        zIndex: React.PropTypes.number.isRequired,
        markerData: PropTypes.array.isRequired,
    };

    static defaultProps = {
        zIndex: 1,
    };

    componentDidMount() {
        this.renderMarkers();
    }

    renderMarkers() {
        const { markerData, icon, map, zIndex } = this.props;

        markerData.forEach((m) => {
            const pos = m.position;
            const latLng = new google.maps.LatLng(pos.lat, pos.lng);

            const config = {
                position: latLng,
                map,
                zIndex,
            };

            if (m.icon || icon) {
                config.icon = m.icon ? m.icon : icon;
            }

            new google.maps.Marker(config);
        });
    }

    render() {
        return null;
    }
}

export default MarkerGroup;
