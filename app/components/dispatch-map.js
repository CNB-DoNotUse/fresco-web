import React from 'react';
import ReactDOM from 'react-dom/server'
import global from '../../lib/global' 
import DispatchMapCallout from './dispatch-map-callout'

/** //

Description : The container for the map element in the dispatch page

// **/

/**
 * Dispatch Map component
 */

export default class DispatchMap extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			assignments: [],
			activeAssignment: null,
			activeCallout: null,
			map: null,
			viewMode: 'active'
		}

		this.updateMap = this.updateMap.bind(this);
		this.findAssignments = this.findAssignments.bind(this);
		this.updateAssignmentMarkers = this.updateAssignmentMarkers.bind(this);
		this.updateUserMarkers = this.updateUserMarkers.bind(this);
		this.focusOnAssignment = this.focusOnAssignment.bind(this);
	}

	componentDidMount() {
		
		var styles = [{"featureType": "all", "elementType":"all", "stylers": [{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"all","stylers":[{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#e0e0e0"}]},
			{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#bdbdbd"}]},
			{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
			{"featureType":"poi.park","elementType":"all","stylers":[{"gamma":1.26}]},
			{"featureType":"poi.park","elementType":"labels.text","stylers":[{"saturation":-54}]}];

		if(!window.sessionStorage.dispatch){
			window.sessionStorage.dispatch = JSON.stringify({
				map_center: {lat: 40.7, lng: -74},
				map_zoom: 12
			});
		}
		
		var savedViewport = JSON.parse(window.sessionStorage.dispatch);
		
		var mapOptions = {
			center: savedViewport.map_center,
			zoom: savedViewport.map_zoom,
			styles: styles
		};

		//Set up the map object
		var map = new google.maps.Map(
			document.getElementById('map-canvas'), 
			mapOptions
		);

		//Add event listeners for map life cycle
		google.maps.event.addListener(map, 'idle', this.updateMap);
		google.maps.event.addListener(map, 'dragend', this.updateMap);

		this.setState({ map: map });		

	}


	componentDidUpdate(prevProps, prevState) {

		if(prevState.assignments)
			this.updateAssignmentMarkers(prevState.assignments);

		if(prevState.users)
			this.updateUserMarkers(prevState.users);

		/* Event Listeners Needed in the page */
		var selector = document.getElementById('callout-selector');

		if(selector){
			selector.addEventListener('click', (e)=>{
				window.location.assign('/assignment/' + selector.dataset.id);
			});
		}

	}

	render() {

		return (

			<div className="map-group">
				<div className="map-container full">
					 <div id="map-canvas"></div>
				</div>
			</div>
			
		);
	}

	/**
	 * Updates the map with new users/assignments
	 */
	updateMap() {

		this.findAssignments((assignments) => {

			this.findUsers((users) => {
				
				this.setState({
					assignments: assignments,
					users: users
				});

			});

		});
	}

	/**
	 * Data call for retrieving assignments
	 */
	findAssignments(callback) {

		var map = this.state.map;

		var bounds = map.getBounds();
		var proximitymeter = google.maps.geometry.spherical.computeDistanceBetween (
			bounds.getSouthWest(), 
			bounds.getNorthEast()
		);
		var proximitymiles = proximitymeter * 0.000621371192;
		var radius = proximitymiles / 2;
		var center = map.getCenter();
		
		var query = "lat=" + center.lat() + "&lon=" + center.lng() + "&radius=" + radius;
			
		$.ajax("/scripts/assignment/getAll?" + query, {
			success: (response) => {

				//Do nothing, because of bad response
				if(!response.data || response.err)
					callback([]);
				else
					callback(response.data);

			},
			error: (xhr, status, error) => {
				return callback(error, null);
			}
		});
	}

	/**
	 * Retrieves users from the API
	 */
	findUsers(callback) {
		
		var map = this.state.map;

		var bounds = map.getBounds();
		
		var proximitymeter = google.maps.geometry.spherical.computeDistanceBetween (
			bounds.getSouthWest(), 
			bounds.getNorthEast()
		);
		var proximitymiles = proximitymeter * 0.000621371192;
		var radius = proximitymiles / 2;
		var center = map.getCenter();

		var query = "lat=" + center.lat() + "&lon=" + center.lng() + "&radius=" + radius;
		
		//Should be authed
		$.ajax(API_URL + "/v1/user/findInRadius?" + query, {
			success: (response) => {

				//Do nothing, because of bad response
				if(!response.data || response.err)
					callback([]);
				else
					callback(response.data);

			},
			error: (xhr, status, error) => {
				return callback(error, null);
			}
		});
		
	}

	/**
	 * Makes a marker with the passed conditiations
	 * @return a google maps marker, with the passed geo-location
	 */
	addAssignmentMarker(assignment, draggable) {

		var map = this.state.map,
			lng = assignment.location.geo.coordinates[0],
			lat = assignment.location.geo.coordinates[1],
			title = assignment.title || 'No title',
			markerURL,
			zIndex, 
			status,
			position = new google.maps.LatLng(lat, lng);

		//Check if the assignment is expired
		if (assignment.expiration_time && assignment.expiration_time < Date.now()){
			
			//Then check if we're in the right view mode
			if(this.state.viewMode == 'expired'){
				status = 'expired';
				markerURL = '/images/assignment-expired@2x.png';
				zIndex = 100;
			}
			//Otherwise break
			else
				return;
		}
		//Not expired assignment
		else{

			//Assignment is pending
			if(assignment.visibility == 0){
				status = 'pending';
				markerURL = '/images/assignment-pending@2x.png';
				zIndex = 200;
			}
			//Assignment has 'active' or uncheced status
			else{
				status = 'active;'
				zIndex = 300;
				markerURL = '/images/assignment-active@2x.png';
			}

		}

		var image = {
			url: markerURL,
			size: new google.maps.Size(114, 114),
			scaledSize: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(30, 30)
		};

		var circle = this.addCircle(
			position, 
			global.milesToMeters(assignment.location.radius), 
			status
		);
		
		var marker = new google.maps.Marker({
			position: position,
			map: map,
			title: title,
			icon: image,
			zIndex: zIndex,
			draggable: draggable
		});

		google.maps.event.addListener(marker, 'click',  this.focusOnAssignment.bind(null, marker, circle, assignment));

	}

	/**
	 * Adds circle to the map given a center and a radius
	 */
	addCircle(center, radius, status) {
		
		var fillColor;	
		
		if (status == 'pending')
			fillColor = '#d8d8d8';
		else if (status == 'expired')
			fillColor = '#d0021b';
		else
			fillColor = '#ffc600'
		
		return new google.maps.Circle({
			map: this.state.map,
			center: center,
			radius: radius,
			strokeWeight: 0,
			fillColor: fillColor,
			fillOpacity: 0.26
		});

	}

	/**
	 * Makes a marker for a user
	 * @return a google maps marker for a user, with the passed geo-location
	 */
	addUserMarker(user) {
		
		var map = this.state.map,
			lng = user.coordinates[0],
			lat = user.coordinates[1];

		var image = {
			url: "/images/assignment-user@2x.png",
			size: new google.maps.Size(70, 70),
			scaledSize: new google.maps.Size(30, 30),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(15, 15),
		};
		
		return new google.maps.Marker({
			position: new google.maps.LatLng(lat, lng),
			map: map,
			icon: image,
			zIndex: 0,
			clickable: false
		});
	}

	/**
	 * Updates all assignment markers on the map, using the previously set ones to remove any repeats
	 */
	updateAssignmentMarkers(prevAssignments) {

		var newMarkers = [];
		var prevAssignmentsIds = [];

		//Map out all of the previous assignmnets
		prevAssignments.map((assignment) => {
			prevAssignmentsIds.push(assignment._id.toString());
		});

		//Map out all the new assignments, and return all of the new ones
		this.state.assignments.map((assignment) => {
			var assignmentId = assignment._id.toString();
			if(prevAssignmentsIds.indexOf(assignmentId) == -1) {
				this.addAssignmentMarker(assignment, false);
			}
		});
	}

	/**
	 * Updates all the user markers on the map, using the previously set ones to remove any repeats
	 */
	updateUserMarkers(prevUsers) {

		var newMarkers = [];
		var prevUsersLocs = [];

		//Map out all of the previous assignmnets
		prevUsers.map((user) => {
			prevUsersLocs.push(user.coordinates.toString());
		})

		//Map out all the new assignments, and return all of the new ones
		this.state.users.map((user) => {
			var userLoc = user.coordinates.toString();
			if(prevUsersLocs.indexOf(userLoc) == -1) {
				this.addUserMarker(user);
			}
		});
	}

	focusOnAssignment(marker, circle, assignment) {

		//Check if the active assignment isn't the clicked again
		if(this.state.activeAssignment && this.state.activeAssignment._id == assignment._id)
			return;

		//Close the active callout if it exists yet
		if(this.state.activeCallout)
			this.state.activeCallout.close();

		var map = this.state.map;

		map.panTo(marker.getPosition());

		map.fitBounds(circle.getBounds());

		var callout = ReactDOM.renderToString(
			<DispatchMapCallout assignment={assignment} onClick />
		);

		console.log(marker.getPosition());

		callout = new google.maps.InfoWindow({
			content: callout,
			position: marker.getPosition(),
		});

		callout.open(map, marker);

		//Update the active assignment and callout
		this.setState({
			activeAssignment: assignment,
			activeCallout: callout
		})

		// var lat = assignment.location.geo.coordinates[1];
		// var lng = assignment.location.geo.coordinates[0];
		
		// var circle = PAGE_Dispatch.makeCircle(null, new google.maps.LatLng(lat, lng), milesToMeters(assignment.location.radius), status);
		
		// this.state.map.fitBounds(circle.getBounds());
		

	}


}

