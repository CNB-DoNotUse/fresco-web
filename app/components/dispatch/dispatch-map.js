import React from 'react';
import ReactDOM from 'react-dom/server'
import DispatchMapCallout from './dispatch-map-callout'
import _ from 'lodash'
import global from '../../../lib/global' 

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
			users: [],
			markers: [],
			circles: [],
			activeCallout: null,
			map: null,
			newAssignmentMarker: null,
			newAssignmentCircle: null
		}

		this.isOpeningCallout = false;

		this.updateMap = this.updateMap.bind(this);
		this.clearMap = this.clearMap.bind(this);
		this.updateAssignmentMarkers = this.updateAssignmentMarkers.bind(this);
		this.updateUserMarkers = this.updateUserMarkers.bind(this);
		this.focusOnAssignment = this.focusOnAssignment.bind(this);
		this.addAssignmentsToMap = this.addAssignmentsToMap.bind(this);
		this.addAssignmentToMap = this.addAssignmentToMap.bind(this);
		this.addAssignmentMarker = this.addAssignmentMarker.bind(this);
	}

	componentDidMount() {

		//Set up session storage for location
		if(!window.sessionStorage.dispatch || !window.sessionStorage.dispatch.mapCenter || !window.sessionStorage.dispatch.mapZoom ){
			window.sessionStorage.dispatch = JSON.stringify({
				mapCenter: {lat: 40.7, lng: -74},
				mapZoom: 12
			});
		}
		
		var dispatch = JSON.parse(window.sessionStorage.dispatch);
		
		//Set up the map object
		var map = new google.maps.Map(
			document.getElementById('map-canvas'), 
			{
				zoom: dispatch.mapZoom,
				center: dispatch.mapCenter,
				styles: global.mapStyles
			}
		);

		//Add event listeners for map life cycle
		google.maps.event.addListener(map, 'idle', this.updateMap);
		google.maps.event.addListener(map, 'dragend', this.updateMap);

		this.setState({ map: map });	

	}

	componentDidUpdate(prevProps, prevState) {

		//Check if there is an active assignment and (there no previous assignment or the prev and current active assignmnet are not the same)
		if(!this.isOpeningCallout && this.props.activeAssignment && (!prevProps.activeAssignment || prevProps.activeAssignment._id != this.props.activeAssignment._id)) {
			this.focusOnAssignment(null, null, this.props.activeAssignment);
		}

		if(JSON.stringify(prevProps.mapCenter) != JSON.stringify(this.props.mapCenter)){
			this.state.map.setCenter(this.props.mapCenter);
		}

		//Check if the map should update
		if(this.props.shouldMapUpdate){
			this.updateMap();
			this.props.mapShouldUpdate(false);
		}

		//Check if view mode has changed
		if(this.props.viewMode !== prevProps.viewMode){
			this.clearMap();
		}

		//Pass down previous for diff check
		this.updateAssignmentMarkers(prevState.assignments);
		this.updateUserMarkers(prevState.users);

		/* Event Listeners Needed in the page */
		var selector = document.getElementById('callout-selector');

		if(selector){
			selector.addEventListener('click', (e)=>{
				window.location.assign('/assignment/' + selector.dataset.id);
			});
		}

		//Check if there's already a new assignment marker 
		//Meaning the marker has already been added, and we don't need to add a new one
		if(this.state.newAssignmentMarker && this.state.newAssignmentCircle){

			var marker = this.state.newAssignmentMarker,
				circle = this.state.newAssignmentCircle,
				map = this.state.map,
				prevMarkerLoc = {
					lat: marker.getPosition().lat(),
					lng: marker.getPosition().lng()
				},
				prevCircleLoc = {
					lat: circle.getCenter().lat(),
					lng: circle.getCenter().lng()
				}

			if(this.props.newAssignment){
				//Compare to make sure we don't change the marker unless its position hasn't actually changed
				if(JSON.stringify(this.props.newAssignment.location) !== JSON.stringify(prevMarkerLoc)){
					marker.setPosition(this.props.newAssignment.location);	
					map.setCenter(marker.getPosition());	     
				}

				//Check if circle center has changed
				if(JSON.stringify(this.props.newAssignment.location) !== JSON.stringify(prevCircleLoc)){
					circle.setCenter(marker.getPosition());	     
				}

				//Check if circle radius has changed
				if(prevProps.newAssignment.radius != this.props.newAssignment.radius){
					circle.setRadius(this.props.newAssignment.radius);
				}
			}
			//Remove marker, and radius on the new assignment
			else{
				marker.setMap(null);
				circle.setMap(null);
				this.setState({
					newAssignmentMarker: null,
					newAssignmentCircle: null
				});
			}

		}
		//Otherwise make the marker
		else if(this.props.newAssignment){

			//Create the marker with a null position
			var marker = this.addAssignmentMarker(),
				circle = this.addCircle(null, 0, 'drafted', null),
				location = {
					lat: marker.getPosition().lat(),
					lng: marker.getPosition().lng()
				};	

			//Update the position to the parent component
			this.props.updateNewAssignment(location, null, null);

			//Set marker to state of map so we can manage its location
			this.setState({ 
				newAssignmentMarker: marker,
				newAssignmentCircle: circle 
			});

			//Update the maps center to reflect the new positon of the marker
			this.state.map.setCenter(
				marker.getPosition()
			);	     

			google.maps.event.addListener(marker, 'drag', (ev) => {
				//Send up location to the parent
				this.props.updateNewAssignment(
					{
						lat: ev.latLng.lat(),
						lng: ev.latLng.lng()
					}, 
					this.props.newAssignment.radius,
					this.state.map.getZoom()
				);	
			});

			google.maps.event.addListener(marker, 'dragend', (ev) => {
				this.props.updatePlace();
			});
		}

	}

	/**
	 * Clears all relevant assignment data from the map
	 */
	clearMap(){

		for (var i = 0; i < this.state.markers.length; i++) {
			this.state.markers[i].setMap(null);
		};
		for (var i = 0; i < this.state.circles.length; i++) {
			this.state.circles[i].setMap(null);
		};

		this.setState({
			markers: [],
			circles: [],
			assignments: []
		});

		this.updateMap();
	}

	/**
	 * Updates the map with new users/assignments
	 */
	updateMap() {
		
		//Check if we have map in state
		if(!this.state.map) return;

		this.props.findAssignments(this.state.map, null, (assignments) => {
			
			this.props.findUsers(this.state.map, (users, error) => {

				var changedState = {};

				var newAssignmentIds = assignments.map((assignment) => {
					return assignment._id;
				});

				var assignmentIds = this.state.assignments.map((assignment) => {
					return assignment._id;
				});

				if(_.difference(newAssignmentIds, assignmentIds).length){
					changedState.assignments = assignments;
				}

				if(_.difference(this.state.users, users).length){
					changedState.users = users;
				}

				this.setState(changedState);

			});
		});
	}

	/**
	 * Adds passed array of assignments to the map, 
	 * then sets state from concatted response from `addAssignmentToMap` on each assignment
	 */
	addAssignmentsToMap(assignments){
		var markers = [],
			circles = [];

		for (var i = 0; i < assignments.length; i++) {
			
			var mapData = this.addAssignmentToMap(assignments[i], false);
			
			if(typeof(mapData) === 'undefined') continue;
			
			//Push into local marker and circles
			markers.push(mapData.marker);
			circles.push(mapData.circle);
		};

		//Update state
		this.setState({
			markers: this.state.markers.concat(markers),
			circles: this.state.circles.concat(circles)
		});
	}

	/**
	 * Makes a marker with the passed assignment
	 * @return adds a google maps marker, with the passed geo-location
	 */
	addAssignmentToMap(assignment, draggable) {

		//Lat/Lng will default to center if for a created assignment
		var map = this.state.map,
			title = assignment.title || 'No title',
			zIndex, 
			status,
			position = new google.maps.LatLng(
						assignment.location.geo.coordinates[1], 
						assignment.location.geo.coordinates[0]
					  ),
			radius = assignment.location.radius;

		//Check if the assignment is expired
		if (assignment.expiration_time && assignment.expiration_time < Date.now()){
			
			status = 'expired';
			zIndex = 100;

		}
		//Not expired assignment
		else{

			//Assignment is pending
			if(assignment.visibility == 0){
				status = 'pending';
				zIndex = 200;
			}
			//Assignment has 'active' or unchecked status
			else{
				status = 'active'
				zIndex = 300;
			}

		}

		//Check if the status matches the view mode
		if(status != this.props.viewMode) return;

		//Create the rendered circle
		var circle = this.addCircle(
			position, 
			global.milesToMeters(radius), 
			status,
			assignment._id
		);
		
		//Create the marker
		var marker = this.addAssignmentMarker(
			position, 
			title,
			status,
			zIndex, 
			draggable,
			assignment._id
		);

		//Add event handler to display callout when clicekd
		google.maps.event.addListener(
			marker, 
			'click',  
			this.focusOnAssignment.bind(null, marker, circle, assignment)
		);

		return {
			circle: circle,
			marker: marker
		}

	}

	addAssignmentMarker(position, title, status, zIndex, draggable, assignmentId) {

		//Create the marker image
		var image = {
				url: status ? global.assignmentImage[status] : global.assignmentImage.drafted,
				size: new google.maps.Size(114, 114),
				scaledSize: new google.maps.Size(60, 60),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(30, 30)
			},
			position = position || {lat: this.state.map.getCenter().lat(), lng: this.state.map.getCenter().lng()},
			marker = new google.maps.Marker({
				position: position,
				map: this.state.map,
				title: title || 'No title',
				icon: image,
				zIndex: zIndex || 0,
				draggable: draggable !== undefined ? draggable : true,
				assignmentId: assignmentId !== undefined ? assignmentId : true
			});

		return marker;

	}

	/**
	 * Adds circle to the map given a center and a radius
	 * @param {dictionary} center Center of the circle
	 * @param {integer} radius Circle radius in feet
	 * @param {Assignment status} status active/pending/expired
	 */
	addCircle(center, radius, status, assignmentId) {
		
		var fillColor = global.assignmentColor[status],
			circle =  new google.maps.Circle({
				map: this.state.map,
				center: center || this.state.map.getCenter(),
				radius: radius || 0,
				strokeWeight: 0,
				fillColor: fillColor,
				fillOpacity: 0.3,
				assignmentId: assignmentId !== undefined ? assignmentId : true
			});

		return circle;
	}

	/**
	 * Makes a marker for a user
	 * @return a google maps marker for a user, with the passed geo-location
	 */
	addUserMarker(user) {
		var map = this.state.map,
			lng = user.coordinates[0],
			lat = user.coordinates[1],
			image = {
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
		var assignments = [];

		//Map out all of the previous assignmnets
		var prevAssignmentIds = prevAssignments.map((assignment) =>{
			return assignment._id.toString();
		});

		for (var i = 0; i < this.state.assignments.length; i++) {
			//Check if it doesn't exist
			if(prevAssignmentIds.indexOf(this.state.assignments[i]._id.toString()) == -1) {
				assignments.push(this.state.assignments[i]);
			}
		}

		if(assignments.length == 0 ) return;

		this.addAssignmentsToMap(assignments);
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

	/**
	 * Focuses on the passed assignment
	 * @param  {Google Maps Marker} marker     The marker tfo focus in on
	 * @param  {Google Maps Circle} circle     The radius of the assignment
	 */
	focusOnAssignment(marker, circle, assignment) {
		this.isOpeningCallout = true;
		var map = this.state.map;

		if(!marker){
			var index = _.findIndex(this.state.markers, (marker) => {
				return marker.assignmentId == assignment._id;
			});
			
			if(index == -1){
				$.snackbar({content: 'We couldn\'t find this assignment!'});
				this.isOpeningCallout = false;
				return;
			}

			marker = this.state.markers[index];
		}
		if(!circle){
			index = _.findIndex(this.state.circles, (circle) => {
				return circle.assignmentId == assignment._id;
			});

			if(index == -1){
				$.snackbar({content: 'We couldn\'t find this assignment!'});
				this.isOpeningCallout = false;
				return;
			}

			circle = this.state.circles[index];
		}

		//Close the active callout if it exists yet
		if(this.state.activeCallout)
			this.state.activeCallout.close();

		map.panTo(marker.getPosition());

		map.fitBounds(circle.getBounds());

		var calloutContent = ReactDOM.renderToString(
			<DispatchMapCallout assignment={assignment} onClick />
		);

		var callout = new google.maps.InfoWindow({
			content: calloutContent,
			position: {
				lat: marker.getPosition().lat(),
				lng: marker.getPosition().lng()
			}
		});

		google.maps.event.addListener(callout, 'closeclick', () => {
			this.setState({
				activeCallout: null
			});

			this.props.setActiveAssignment(null);

		});

		callout.open(map);

		//Update the active assignment and callout
		this.props.setActiveAssignment(assignment);
		
		this.setState({
			activeCallout: callout
		});

		this.isOpeningCallout = false;
	}

	render() {

		return (
			<div className="map-group">
				<div className="map-container full dispatch">
					 <div id="map-canvas"></div>
				</div>
			</div>
		);
	}

}

