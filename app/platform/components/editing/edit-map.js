import React from 'react';
import utils from 'utils';

/**
    * Single Edit-Map Element
* @description Map element that is found in Gallery Edit, Admin Panel, etc.
    */

class EditMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mapID: 	 Date.now() + Math.floor(Math.random() * 100),
            map: 	 null,
            polygon: null,
            circle:  null,
            marker:  null,
        };

        this.getBounds = this.getBounds.bind(this);
        this.initializeMap = this.initializeMap.bind(this);
    }

    componentDidMount() {
        this.initializeMap();
    }

    componentDidUpdate(prevProps) {
        if (this.props.rerender) {
            if (this.state.map) {
                google.maps.event.trigger(this.state.map, 'resize');
                if (this.state.marker) this.state.map.panTo(this.state.marker.getPosition(), 12);
            }
        }

        if(this.props.disabled) {
            this.state.map.setOptions({
                draggable: false,
                zoomControl: false
            })
        } else {
            this.state.map.setOptions({
                draggable: true,
                zoomControl: true
            })
        }

        //Check if there is a radius, and it is not the same as the previous one
        if (this.props.radius && prevProps.radius != this.props.radius) {
            this.state.circle.setRadius(utils.feetToMeters(this.props.radius));
            this.state.map.fitBounds(this.state.circle.getBounds());
        }

        //Check if locations are the same from what was previsouly set
        if (JSON.stringify(prevProps.location) == JSON.stringify(this.props.location) &&
            JSON.stringify(prevProps.radius) == JSON.stringify(this.props.radius)) {
            return;
        }

        //No location is present
        if (!this.props.location) {
            this.state.marker.setMap(null);
            this.state.polygon.setMap(null);
            return;
        } else if (!prevProps.location) {
            this.state.marker.setMap(this.state.map);
            this.state.polygon.setMap(this.state.map);
        }

        // Check if the passed location is a set of points
        // Then set the polygon  path, and set the marker to center of the polygon
        if (Array.isArray(this.props.location)) {
            // If location array doesn't have any points, set to default location.
            if (!this.props.location.length) {
                return this.state.map.panTo({
                    lat: -73.9,
                    lng: 40,
                });
            }

            let locationArr;
            if (!this.props.location[0].lat) {
                locationArr = this.props.location.map((loc) => (
                    { lat: loc[1], lng: loc[0] }
                ));
            }
            this.state.marker.setPosition(utils.getCentroid(locationArr || this.props.location));
            this.state.map.panTo(utils.getCentroid(locationArr || this.props.location));
        }
        //Otherwise just set the marker to the passed position
        else {
            this.state.marker.setPosition(
                new google.maps.LatLng(this.props.location.lat, this.props.location.lng)
            );
            this.state.map.panTo(this.state.marker.getPosition(), 12);
        }

        //Update the circles position
        this.state.circle.setCenter(this.state.marker.getPosition());

        // Pass data back up
        this.props.updateCurrentBounds(this.state.map);
    }

    // Returns centroid for passed polygon
    getBounds(polygon) {
        var bounds = new google.maps.LatLngBounds();
        var paths = polygon.getPaths();
        var path;

        for (var i = 0; i < paths.getLength(); i++) {
            path = paths.getAt(i);
            for (var ii = 0; ii < path.getLength(); ii++) {
                bounds.extend(path.getAt(ii));
            }
        }
        return bounds;
    }

    initializeMap() {
        const { location, zoom, draggable } = this.props;
        let center;

        if (location && Array.isArray(location)) {
            // If location, check if is array and get centroid of polygon, or use the point passed. Otherwise use NYC for center.
            try {
                // TODO: make this try/catch unnecessary
                center = utils.getCentroid(location);
            } catch (e) {
                center = location;
            }
        } else {
            center = { lat: 40.7, lng: -74 };
        }

        let mapOptions = {
            center,
            zoom: zoom || 12,
            mapTypeControl: false,
            draggable: draggable ? true : false,
            scrollwheel: draggable ? true : false,
            disableDoubleClickZoom: true,
            styles: utils.mapStyles,
        };

        // Instantiate google maps object
        var map = new google.maps.Map(
            document.getElementById('edit-map-canvas-' + this.state.mapID),
            mapOptions
        );

        //Marker image
        var markerImage = {
            url: utils.assignmentImage[this.props.type],
            size: new google.maps.Size(108, 114),
            scaledSize: new google.maps.Size(36, 38),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(18, 19)
        };

        //Instantiate polygon
        var polygon = new google.maps.Polygon({
            paths: [],
            strokeColor: "#FFB500",
            strokeOpacity: 0.8,
            strokeWeight: 0,
            fillColor: "#FFC600",
            fillOpacity: 0.35,
            map: map
        });

        // Set default marker to NYC if location is not set.
        // If location is set and it's an array, get the centroid. Otherwise use the point.
        var marker = new google.maps.Marker({
            position: center,
            map: map,
            icon: markerImage,
            draggable: this.props.draggable,
        });

        if(this.props.draggable){
            google.maps.event.addListener(marker, 'dragend', (ev) => {
                // Pass data back up when the marker is moved
                this.props.onDataChange({
                    location: {
                        lat: ev.latLng.lat(),
                        lng: ev.latLng.lng()
                    },
                    source: 'markerDrag'
                });
            });
        }

        var circle = new google.maps.Circle({
            map: map,
            center: marker.getPosition(),
            radius: utils.feetToMeters(this.props.radius) || 0,
            strokeWeight: 0,
            fillColor: utils.assignmentColor[this.props.type],
            fillOpacity: 0.26,
        });

        this.setState({
            map: map,
            circle: circle,
            polygon: polygon,
            marker: marker,
        });

        // Pass data back up
        this.props.updateCurrentBounds(map);
    }

    render() {
        return <div id={'edit-map-canvas-' + this.state.mapID} className='map-container' />;
    }
}

EditMap.defaultProps = {
    onDataChange: function() {},
    radius: null,
    location: null,
    draggable: false,
    type: 'active',
};

export default EditMap;

