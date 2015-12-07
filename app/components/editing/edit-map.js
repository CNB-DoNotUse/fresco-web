import React from 'react'

/**
 * Single Edit-Map Element
 * @description Map element that is found in Gallery Edit, Admin Panel, etc.
 */

export default class EditMap extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			mapID: Date.now() + Math.floor(Math.random() * 100),
			map: null,
			polygon: null,
			marker: null
		}

		this.getCentroid = this.getCentroid.bind(this);
		this.getBounds = this.getBounds.bind(this);
		this.initializeMap = this.initializeMap.bind(this);
	}

	componentDidMount() {
		this.initializeMap();
	}

	componentDidUpdate(prevProps, prevState) {

		/*console.log('-----START----');

		console.log(prevProps.location);

		console.log(this.props.location);

		console.log('----END-----');*/

		if(this.props.rerender){
			google.maps.event.trigger(this.state.map, 'resize');
		}


		//Check if there is a radius, and it is not the same as the previous one
		if(this.props.radius && prevProps.radius != this.props.radius) {
			this.state.circle.setRadius(this.props.radius);
			this.state.map.fitBounds(this.state.circle.getBounds());
		}

		//Check if locations are the same from what was previsouly set
		if(JSON.stringify(prevProps.location) == JSON.stringify(this.props.location)) {
			return;
		}

		//No location is present
		if(!this.props.location) {
			this.state.marker.setMap(null);
			this.state.polygon.setMap(null);
			return;
		} else {
			this.state.marker.setMap(this.state.map);
			this.state.polygon.setMap(this.state.map);
		}

		//Check if the passed location is a set of points
		//Then set the polygon  path, and set the marker to center of the polygon
		if(Array.isArray(this.props.location)) {
			this.state.polygon.setPath(this.props.location);
			this.state.marker.setPosition(this.getCentroid(this.state.polygon));
			this.state.map.panTo(this.getCentroid(this.props.location));
		} 
		//Otherwise just set the marker to the passed position
		else {
			this.state.marker.setPosition(
				new google.maps.LatLng(this.props.location.lat, this.props.location.lng)
			);
			this.state.map.setZoom(this.props.zoom || 12);
			this.state.map.panTo(this.state.marker.getPosition());
		}

		//Update the circles position
		this.state.circle.setCenter(this.state.marker.getPosition());

	}

	//Returns centroid for passed polygon
	getCentroid(polygon) {
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
		var styles = [
			{"featureType": "all", "elementType":"all", "stylers": [{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"all","stylers":[{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#e0e0e0"}]},
			{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#bdbdbd"}]},
			{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
			{"featureType":"poi.park","elementType":"all","stylers":[{"gamma":1.26}]},
			{"featureType":"poi.park","elementType":"labels.text","stylers":[{"saturation":-54}]}
		];

		// If location, check if is array and get centroid of polygon, or use the point passed. Otherwise use NYC for center.
		var center = this.props.location ? Array.isArray(this.props.location) ? this.getCentroid(this.props.location) : this.props.location : {lat: 40.7, lng: -74};
		var mapOptions = {
			center: center,
			zoom: this.props.zoom || 12,
			mapTypeControl: false,
			draggable: false,
			scrollwheel: false,
			disableDoubleClickZoom: true,
			styles: styles
		};

		//Instantiate google maps object
		var map = new google.maps.Map(
			document.getElementById('edit-map-canvas-' + this.state.mapID),
			mapOptions
		);

		//Marker image
		var markerImage = {
			url: "/images/assignment-active@2x.png",
			size: new google.maps.Size(114, 114),
			scaledSize: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(30, 30)
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
			icon: markerImage
		});

		var circle = new google.maps.Circle({
			map: map,
			center: marker.getPosition(),
			radius: this.props.radius || 0,
			strokeWeight: 0,
			fillColor: '#ffc600',
			fillOpacity: 0.26
		});

		this.setState({
			map: map,
			circle: circle,
			polygon: polygon,
			marker: marker
		});

	}

	render() {
		return (
			<div id={"edit-map-canvas-" + this.state.mapID} className="map-container"></div>
		);
		
	}
}

EditMap.defaultProps = {
	radius: null,
	location: null
}
