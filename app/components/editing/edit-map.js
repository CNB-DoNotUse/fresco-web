import React from 'react'

/**
 * Single Edit-Map Element
 * @description Map element that is found in Gallery Edit, Admin Panel, etc.
 */

export default class EditMap extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			mapID: null,
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
		this.setState({
			mapID: Date.now() + Math.floor(Math.random() * 100)
		})
	}


	componentDidUpdate(prevProps, prevState) {

		// console.log('-----START----');

		// console.log(prevProps.location);

		// console.log(this.props.location);

		// console.log('----END-----');

		//Check if there is a radius, and it is not the same as the previous one
		if(this.props.radius && prevProps.radius != this.props.radius){
			this.state.circle.setRadius(this.props.radius);
			this.state.map.fitBounds(this.state.circle.getBounds());
		}

		//Check if locations are the same from what was previsouly set
		if(JSON.stringify(prevProps.location) == JSON.stringify(this.props.location)) {
			return;
		}

		//No location is present
		if(!this.props.location){
			this.state.marker.setMap(null);
			this.state.polygon.setMap(null);
			return;
		}

		//Check if the passed location is a set of points
		//Then set the polygon  path, and set the marker to center of the polygon
		if(Array.isArray(this.props.location)) {
			this.state.polygon.setPath(this.props.location);
			this.state.marker.setPosition(this.getCentroid(this.state.polygon));
			this.state.map.fitBounds(this.getBounds(this.state.polygon));
		} 
		//Otherwise just set the marker to the passed positio
		else {
			this.state.marker.setPosition(
				new google.maps.LatLng(this.props.location.lat, this.props.location.lng)
			);
			this.state.map.setCenter(this.state.marker.getPosition());
		}

		//Update the circles position
		this.state.circle.setCenter(this.state.marker.getPosition());

	}

	//Returns centroid for passed polygon
	getCentroid(polygon) {

		var path = polygon.getPath(),
			lat = 0,
			lon = 0;

		for (var i = 0; i < path.getLength() - 1; ++i) {
			lat += path.getAt(i).lat();
			lon += path.getAt(i).lng();
		}

		lat /= path.getLength() - 1;
		lon /= path.getLength() - 1;

		return new google.maps.LatLng(lat, lon);

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

		var styles = [{"featureType": "all", "elementType":"all", "stylers": [{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"all","stylers":[{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#e0e0e0"}]},
			{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#bdbdbd"}]},
			{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
			{"featureType":"poi.park","elementType":"all","stylers":[{"gamma":1.26}]},
			{"featureType":"poi.park","elementType":"labels.text","stylers":[{"saturation":-54}]}];

		var mapOptions = {
			center: this.props.location || {lat: 40.7, lng: -74},
			zoom: 16,
			mapTypeControl: false,
			draggable: false,
			scrollwheel: false,
			disableDoubleClickZoom: true,
			styles: styles
		};

		//Instantiate google maps object
		var map = new google.maps.Map(
			document.getElementById('edit-map-canvas'),
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

		//Set default marker to NYC
		var marker = new google.maps.Marker({
			position: this.props.location || map.getCenter(),
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
			<div id="edit-map-canvas" className="map-container"></div>
		);
		
	}
}

EditMap.defaultProps = {
	radius: null,
	location: null
}
