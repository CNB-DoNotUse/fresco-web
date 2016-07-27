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
                            <Marker
                                draggable={draggable}
                            />
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

