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
    static propTypes = {
        onDataChange: PropTypes.func,
        updateCurrentBounds: PropTypes.func,
        radius: PropTypes.number,
        location: PropTypes.object,
        address: PropTypes.string,
        draggable: PropTypes.bool,
        type: PropTypes.string,
        zoom: PropTypes.number,
        rerender: PropTypes.bool,
    };

    static defaultProps = {
        onDataChange() {},
        updateCurrentBounds() {},
        radius: null,
        location: { lng: -74, lat: 40.7 },
        draggable: false,
        type: 'active',
        zoom: 12,
        rerender: false,
    };

    defaultCenter = { lng: -74, lat: 40.7 };

    constructor(props) {
        super(props);

        this.geocoder = new google.maps.Geocoder();
        this.getCenter(this.props.location, this.props.address);
    }

    state = { center: this.defaultCenter }

    componentDidMount() {
        const { updateCurrentBounds } = this.props;

        updateCurrentBounds(this.map ? this.map.getBounds() : {});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location && (nextProps.location !== this.props.location)) {
            this.getCenter(nextProps.location, nextProps.address);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.radius !== this.props.radius) {
            if (this.map && this.circle) this.map.fitBounds(this.circle.getBounds());
        }

        if (this.map && this.props.rerender) {
            google.maps.event.trigger(this.map.props.map, 'resize');
        }
    }

    onDragend(e) {
        const { onDataChange, updateCurrentBounds } = this.props;
        const location = { lng: e.latLng.lng(), lat: e.latLng.lat() };
        this.getCenter(location);

        onDataChange({ location, source: 'markerDrag' });

        updateCurrentBounds(this.map ? this.map.getBounds() : {});
    }

    getCenter(location, address) {
        // If location, get centroid of polygon, or use the point passed.
        // Otherwise use NYC for center.
        new Promise((resolve) => {
            if (location && location.type && location.coordinates.length) {
                switch (location.type.toLowerCase()) {
                    case 'polygon':
                        resolve(utils.getCentroid(location.coordinates));
                    case 'multipoint':
                        resolve(utils.getAvgFromMultipoint(location));
                    case 'point':
                        resolve({ lng: location.coordinates[0], lat: location.coordinates[1] });
                    default:
                        resolve({ lng: -74, lat: 40.7 });
                }
            } else if (location && location.lat && location.lng) {
                resolve({ lng: location.lng, lat: location.lat });
            } else if (address) {
                this.geocoder.geocode({ address }, (results, status) => {
                    if (status === 'OK') {
                        const loc = results[0].geometry.location;
                        resolve({ lng: loc.lng(), lat: loc.lat() });
                    } else {
                        resolve(this.defaultCenter);
                    }
                });
            } else {
                resolve(this.defaultCenter);
            }
        })
        .then(center => this.setState({ center }));
    }

    renderMarker() {
        const { draggable } = this.props;
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
                ref={(m) => { this.marker = m; }}
                position={center}
                draggable={draggable}
                icon={markerImage}
                onDragend={(e) => this.onDragend(e)}
            />
        );
    }

    renderCircle() {
        const { radius, type } = this.props;
        const { center } = this.state;
        const circleOptions = {
            radius: utils.feetToMeters(radius) || 0,
            fillColor: utils.assignmentColor[type],
            fillOpacity: 0.26,
            strokeWeight: 0,
            draggable: false,
        };

        return (
            <Circle
                ref={(c) => { this.circle = c; }}
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

export default GMap;

