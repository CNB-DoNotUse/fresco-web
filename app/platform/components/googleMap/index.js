// inspired by https://github.com/fullstackreact/google-maps-react
/* global google */

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import 'app/sass/platform/_publicGallery.scss';

class Map extends React.Component {
    static propTypes = {
        lat: PropTypes.number,
        lng: PropTypes.number,
        zoom: PropTypes.number,
    }

    static defaultProps = {
        lat: 37.774929,
        lng: -122.419416,
        zoom: 14,
    }

    componentDidMount() {
        this.loadMap();
    }

    loadMap() {
        if (google && google.maps) {
            const { lat, lng, zoom } = this.props;
            const maps = google.maps;
            const node = ReactDOM.findDOMNode(this.mapCtr);
            const center = new maps.LatLng(lat, lng);
            const mapConfig = Object.assign({}, { center, zoom });
            this.map = new maps.Map(node, mapConfig);
        }
    }

    render() {
        return (
            <div
                className="test"
                style={{
                    height: '100%',
                    width: '100%',
                }}
                ref={(r) => { this.mapCtr = r; }}
            />
        );
    }
}

export default Map;

