import React from 'react'

/**
 * Single Edit-Map Element
 * @description Map element that is found in Gallery Edit, Admin Panel, etc.
 */

export default class EditMap extends React.Component {

	constructor(props) {
		super(props);
		this.getCentroid = this.getCentroid.bind(this);
		this.getBounds = this.getBounds.bind(this);
		this.initializeMap = this.initializeMap.bind(this);
	}

	componentDidMount() {
		this.initializeMap();
	}

	componentDidUpdate(prevProps, prevState) {
		this.initializeMap();
	}

	render() {

		return (
			<div id="gallery-map-canvas" className="map-container"></div>
		);
		
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
			center: {lat: 40.7, lng: -74},
			zoom: 12,
			mapTypeControl: false,
			styles: styles
		};

		//Instantiate google maps object
		var map = new google.maps.Map(
			document.getElementById('gallery-map-canvas'), 
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
			position: new google.maps.LatLng(40.7, -74),
			map: map,
			icon: markerImage
		});


		//Location is present
		if (this.props.location) {
			
			var coordinates = [];

			if(!Array.isArray(this.props.location)) {
				console.log('Location prop is not an array, pushing coordinates to an array.');
				coordinates.push(this.props.location);

			} else {
				console.log('Location prop is an array. Setting coordinates var to location prop');
				coordinates = this.props.location;
			}

			console.log('Coordinates of map: ', coordinates);

			polygon.setMap(map);
			
			polygon.setPath(coordinates);
			
			marker.setPosition(this.getCentroid(polygon));
			map.fitBounds(this.getBounds(polygon));
			map.setZoom(12);

		}
		//No location is present
		else {
			polygon.setMap(null);
		}
	}

}