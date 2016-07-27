import React, { PropTypes } from 'react';
import GoogleMapLoader from 'react-google-maps/lib/GoogleMapLoader';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';
import Circle from 'react-google-maps/lib/Circle';
import utils from 'utils';

/**
 * Single Edit-Map Element
 * @description Map element that is found in Gallery Edit, Admin Panel, etc.
 */
class GMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = { center: this.getCenter(props.location) };
    }

    componentDidMount() {
        const { updateCurrentBounds } = this.props;

        updateCurrentBounds(this.map ? this.map.getBounds() : {});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location && (nextProps.location !== this.props.location)) {
            this.setState({ center: this.getCenter(nextProps.location) });
        }
    }

    onDragMarker(e) {
        const { onDataChange, updateCurrentBounds } = this.props;
        const location = { lng: e.latLng.lng(), lat: e.latLng.lat() };

        this.setState({ center: this.getCenter(location) });

        onDataChange({
            location,
            source: 'markerDrag',
        });

        updateCurrentBounds(this.map ? this.map.getBounds() : {});
    }

    getCenter(location) {
        // If location, get centroid of polygon, or use the point passed.
        // Otherwise use NYC for center.
        if (location && location.type) {
            if (location.type.toLowerCase() === 'polygon') {
                return utils.getCentroid(location.coordinates);
            }

            if (location.type.toLowerCase() === 'point') {
                return { lng: location.coordinates[0], lat: location.coordinates[1] };
            }
        } else if (location && location.lat && location.lng) {
            return { lng: location.lng, lat: location.lat };
        }

        return { lng: -74, lat: 40.7 };
    }

    renderMarker() {
        const { draggable, location } = this.props;
        const { center } = this.state;
        const markerImage = {
            url: utils.assignmentImage[this.props.type],
            size: new google.maps.Size(108, 114),
            scaledSize: new google.maps.Size(36, 38),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(18, 19),
            crossOnDrag: false,
        };

        return (
            <Marker
                ref={(m) => this.marker = m}
                position={center}
                draggable={draggable}
                icon={markerImage}
                onDragend={(e) => this.onDragMarker(e)}
            />
        );
    }

    renderCircle() {
        const { location } = this.props;
        const { center } = this.state;
        const circleOptions = {
            radius: utils.feetToMeters(this.props.radius) || 0,
            fillColor: utils.assignmentColor[this.props.type],
            fillOpacity: 0.26,
            strokeWeight: 0,
            draggable: false,
        };

        return (
            <Circle
                ref={(c) => this.circle = c}
                center={center}
                options={circleOptions}
            />
        );
    }

    render() {
        const { zoom, draggable } = this.props;
        const { center } = this.state;
        const mapOptions = {
            mapTypeControl: false,
            disableDoubleClickZoom: true,
            scrollwheel: draggable,
            draggable,
        };

        return (
            <section style={{ height: '100%' }}>
                <GoogleMapLoader
                    containerElement={<div className="map-container" />}
                    googleMapElement={
                        <GoogleMap
                            ref={(map) => this.map = map}
                            defaultZoom={zoom}
                            center={center}
                            options={mapOptions}
                        >
                            {this.renderMarker()}
                            {this.renderCircle()}
                        </GoogleMap>
                    }
                />
            </section>
        );
    }
}

GMap.propTypes = {
    onDataChange: PropTypes.func,
    updateCurrentBounds: PropTypes.func,
    radius: PropTypes.number,
    location: PropTypes.object,
    draggable: PropTypes.bool,
    type: PropTypes.string,
    zoom: PropTypes.number,
};

GMap.defaultProps = {
    onDataChange() {},
    updateCurrentBounds() {},
    radius: null,
    location: { lng: -74, lat: 40.7 },
    draggable: false,
    type: 'active',
    zoom: 12,
};

export default GMap;

