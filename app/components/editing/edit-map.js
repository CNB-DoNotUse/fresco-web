import React from 'react';
import global from './../../../lib/global';

/**
 * Single Edit-Map Element
 * @description Map element that is found in Gallery Edit, Admin Panel, etc.
 */

export default class EditMap extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			mapID: 	 Date.now() + Math.floor(Math.random() * 100),
			map: 	 null,
			polygon: null,
			circle:  null,
			marker:  null,
		};

		this.getCentroid = this.getCentroid.bind(this);
		this.getBounds = this.getBounds.bind(this);
		this.initializeMap = this.initializeMap.bind(this);
	}

	componentDidMount() {
		this.initializeMap();
	}

    componentDidUpdate(prevProps) {
        if(this.props.rerender) {

            if(this.state.map) {
                google.maps.event.trigger(this.state.map, 'resize');
				if(this.state.marker) this.state.map.panTo(this.state.marker.getPosition(), 12);
			}
		}

		//Check if there is a radius, and it is not the same as the previous one
		if(this.props.radius && prevProps.radius != this.props.radius) {
			this.state.circle.setRadius(global.feetToMeters(this.props.radius));
			this.state.map.fitBounds(this.state.circle.getBounds());
		}

		//Check if locations are the same from what was previsouly set
		if(JSON.stringify(prevProps.location) == JSON.stringify(this.props.location) &&
			JSON.stringify(prevProps.radius) == JSON.stringify(this.props.radius)) {
			return;
		}

		//No location is present
		if(!this.props.location) {
			this.state.marker.setMap(null);
			this.state.polygon.setMap(null);
			return;
		} else if(!prevProps.location) {
			this.state.marker.setMap(this.state.map);
			this.state.polygon.setMap(this.state.map);
		}

		//Check if the passed location is a set of points
		//Then set the polygon  path, and set the marker to center of the polygon
		if(Array.isArray(this.props.location)) {
			// If location array doesn't have any points, set to default location.
			if(!this.props.location.length) {
				return this.state.map.panTo({
					lat: -73.9,
					lng: 40
				})
			}

			if(!this.props.location[0].lat) {
				var locationArr = this.props.location.map((loc) => {
					return {
						lat: loc[1],
						lng: loc[0]
					}
				});
			}
			this.state.marker.setPosition(this.getCentroid(locationArr || this.props.location));
			this.state.map.panTo(this.getCentroid(locationArr || this.props.location));
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

	//Returns centroid for passed polygon
	getCentroid(polygon) {
		if(!polygon.length) {
			return new google.maps.LatLng(-73.9, 40);
		}

		var path, lat = 0, lng = 0;

		if (Array.isArray(polygon)) {
			var newPolygon = new google.maps.Polygon({paths: polygon});
			path = newPolygon.getPath();
		} else {
			path = polygon.getPath();
		}

		for (var i = 0; i < path.getLength() - 1; ++i) {
			lat += path.getAt(i).lat();
			lng += path.getAt(i).lng();
		}

		lat /= path.getLength() - 1;
		lng /= path.getLength() - 1;

		return new google.maps.LatLng(lat, lng);
	}

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
		// If location, check if is array and get centroid of polygon, or use the point passed. Otherwise use NYC for center.
        let center;
        if (this.props.location && Array.isArray(this.props.location)) {
            // TODO: make this try/catch unnecessary
            try {
                center = this.getCentroid(this.props.location)
            } catch(e) {
                center = this.props.location;
            }
        } else {
            center = {lat: 40.7, lng: -74};
        }
        let mapOptions = {
				center: center,
				zoom: this.props.zoom || 12,
				mapTypeControl: false,
				draggable: this.props.draggable ? true : false,
				scrollwheel: this.props.draggable ? true : false,
				disableDoubleClickZoom: true,
				styles: global.mapStyles
			};

		//Instantiate google maps object
		var map = new google.maps.Map(
			document.getElementById('edit-map-canvas-' + this.state.mapID),
			mapOptions
		);

		//Marker image
		var markerImage = {
			url: global.assignmentImage[this.props.type],
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
			draggable: this.props.draggable
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
			radius: global.feetToMeters(this.props.radius) || 0,
			strokeWeight: 0,
			fillColor: global.assignmentColor[this.props.type],
			fillOpacity: 0.26
		});

		this.setState({
			map: map,
			circle: circle,
			polygon: polygon,
			marker: marker
		});

		// Pass data back up
		this.props.updateCurrentBounds(map);
	}

	render() {
		return (
			<div id={"edit-map-canvas-" + this.state.mapID} className="map-container"></div>
		);

	}
}

EditMap.defaultProps = {
	onDataChange: function() {},
	radius: null,
	location: null,
	draggable: false,
	type: 'active'
}
