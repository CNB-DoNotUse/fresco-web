import React, { PropTypes } from 'react';
import GoogleMapLoader from 'react-google-maps/lib/GoogleMapLoader';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';
import utils from 'utils';

/**
 * Single Edit-Map Element
 * @description Map element that is found in Gallery Edit, Admin Panel, etc.
 */
class GMap extends React.Component {

    onPositionChanged() {
        const pos = this._marker.getPosition();
        this.props.onDataChange({
            location: {
                lat: pos.lat(),
                lng: pos.lng(),
            },
            source: 'markerDrag',
        });
    }

    getCenter() {
        // If location, get centroid of polygon, or use the point passed.
        // Otherwise use NYC for center.
        const { location } = this.props;
        if (location) {
            if (location.type.toLowerCase() === 'polygon') {
                return utils.getCentroid(location.coordinates);
            }

            if (location.type.toLowerCase() === 'point') {
                return { lng: location.coordinates[0], lat: location.coordinates[1] };
            }
        }

        return { lat: 40.7, lng: -74 };
    }

    renderMarker() {
        const { draggable } = this.props;
        // Marker image
        // const markerImage = {
        //     url: utils.assignmentImage[this.props.type],
        //     size: new google.maps.Size(108, 114),
        //     scaledSize: new google.maps.Size(36, 38),
        //     origin: new google.maps.Point(0, 0),
        //     anchor: new google.maps.Point(18, 19)
        // };

        return (
            <Marker
                ref={(m) => this._marker = m}
                position={this.getCenter()}
                draggable={draggable}
                onPositionChanged={() => this.onPositionChanged()}
            />
        );
    }

    render() {
        const { zoom, draggable } = this.props;

        return (
            <section style={{ height: '100%' }}>
                <GoogleMapLoader
                    containerElement={<div className="map-container" />}
                    googleMapElement={
                        <GoogleMap
                            ref={(map) => this._map = map }
                            defaultZoom={zoom}
                            defaultCenter={this.getCenter()}
                            draggable={draggable}
                            scrollwheel={draggable}
                            mapTypeControl={false}
                            disableDoubleClickZoom
                        >
                            {this.renderMarker()}
                        </GoogleMap>
                    }
                />
            </section>
        );
    }
}

GMap.propTypes = {
    onDataChange: PropTypes.func,
    radius: PropTypes.number,
    location: PropTypes.object,
    draggable: PropTypes.bool,
    type: PropTypes.string,
    zoom: PropTypes.number,
};

GMap.defaultProps = {
    onDataChange() {},
    radius: null,
    location: null,
    draggable: false,
    type: 'active',
    zoom: 12,
};

export default GMap;

