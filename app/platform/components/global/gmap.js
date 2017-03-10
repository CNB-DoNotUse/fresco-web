import React, { PropTypes } from 'react';
import GoogleMapLoader from 'react-google-maps/lib/GoogleMapLoader';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Circle from 'react-google-maps/lib/Circle';
import Marker from 'react-google-maps/lib/Marker';
import api from 'app/lib/api';
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
        zoomControl: PropTypes.bool,
        rerender: PropTypes.bool,
        containerElement: PropTypes.node,
        markers: PropTypes.array,
        fitBoundsOnMount: PropTypes.bool,
        panTo: PropTypes.object,
    };

    static defaultProps = {
        onDataChange() {},
        updateCurrentBounds() {},
        radius: null,
        location: { lng: -74, lat: 40.7 },
        draggable: false,
        type: 'active',
        zoom: 12,
        zoomControl: true,
        rerender: false,
        containerElement: <div className="map-container" />,
        fitBoundsOnMount: false,
        panTo: null,
    };

    defaultCenter = { lng: -74, lat: 40.7 };

    constructor(props) {
        super(props);

        this.geocoder = new google.maps.Geocoder();
        this.getCenter(this.props.location, this.props.address);
    }

    hasFitBounds = false;

    state = {
        center: this.defaultCenter,
        hasFitBounds: false,
    };

    componentDidMount() {
        this.props.updateCurrentBounds(this.map ? this.map.getBounds() : {});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location && (nextProps.location !== this.props.location)) {
            this.getCenter(nextProps.location, nextProps.address);
        }

        if (nextProps.panTo !== this.props.panTo) {
            if (nextProps.panTo) this.map.panTo(nextProps.panTo);
            else this.map.panTo(this.state.center);
        }

        if (this.map && this.props.rerender) {
            google.maps.event.trigger(this.map.props.map, 'resize');
        }
    }

    componentDidUpdate(prevProps) {
        const { radius, fitBoundsOnMount } = this.props;
        const fitBounds = fitBoundsOnMount && !this.hasFitBounds && radius;
        const radiusChanged = prevProps.radius !== radius;
        if (fitBounds || radiusChanged) {
            if (this.map && this.circle) {
                this.hasFitBounds = true;
                this.map.fitBounds(this.circle.getBounds());
            }
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
                    return resolve(utils.getCentroid(location.coordinates));
                case 'multipoint':
                    return resolve(utils.getAvgFromMultipoint(location));
                case 'point':
                    return resolve({ lng: location.coordinates[0], lat: location.coordinates[1] });
                default:
                    return resolve({ lng: -74, lat: 40.7 });
                }
            } else if (location && location.lat && location.lng) {
                return resolve({ lng: location.lng, lat: location.lat });
            } else if (address && address !== 'No Address') {
                this.geocoder.geocode({ address }, (results, status) => {
                    if (status === 'OK') {
                        const loc = results[0].geometry.location;
                        return resolve({ lng: loc.lng(), lat: loc.lat() });
                    }

                    return resolve(this.defaultCenter);
                });
            } else {
                return resolve(this.defaultCenter);
            }
        })
        .then(center => this.setState({ center }));
    }

    renderCenterMarker() {
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
                onDragend={e => this.onDragend(e)}
                zIndex={2}
            />
        );
    }

    renderRadiusCircle() {
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
        const {
            zoom,
            zoomControl,
            draggable,
            containerElement,
            fitBoundsOnMount,
            markers,
        } = this.props;
        const { center } = this.state;
        const mapOptions = {
            mapTypeControl: false,
            streetViewControl: false,
            disableDoubleClickZoom: true,
            scrollwheel: draggable,
            draggable,
            zoomControl,
        };

        const mapProps = {
            defaultZoom: zoom,
            options: mapOptions,
        };

        if (fitBoundsOnMount) mapProps.defaultCenter = center;
        else mapProps.center = center;

        return (
            <section style={{ height: '100%' }}>
                <GoogleMapLoader
                    containerElement={containerElement}
                    googleMapElement={
                        <GoogleMap
                            ref={(map) => { this.map = map; }}
                            {...mapProps}
                        >
                            {this.renderCenterMarker()}
                            {this.renderRadiusCircle()}
                            {markers}
                        </GoogleMap>
                    }
                />
            </section>
        );
    }
}

export default GMap;
