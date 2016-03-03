import React from 'react';
import ReactDOM from 'react-dom/server'
import DispatchMapCallout from './dispatch-map-callout'
import _ from 'lodash'
import global from '../../../lib/global' 

/**
* Description : The container for the map element in the dispatch page
**/

/**
 * Dispatch Map component
 */

export default class DispatchMap extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			assignments: [],
			users: [],
			uniqueUsers: [],
			markers: [],
			circles: [],
			activeCallout: null,
			map: null,
			newAssignmentMarker: null,
			newAssignmentCircle: null
		}

		this.isOpeningCallout = false;

		this.updateMap = this.updateMap.bind(this);
		this.clearAssignments = this.clearAssignments.bind(this);
		this.clearCallout = this.clearCallout.bind(this);
		this.updateAssignmentMarkers = this.updateAssignmentMarkers.bind(this);
		this.updateUserMarkers = this.updateUserMarkers.bind(this);
		this.focusOnAssignment = this.focusOnAssignment.bind(this);
		this.addAssignmentsToMap = this.addAssignmentsToMap.bind(this);
		this.addAssignmentToMap = this.addAssignmentToMap.bind(this);
		this.addAssignmentMarker = this.addAssignmentMarker.bind(this);
		this.saveMapLocation = this.saveMapLocation.bind(this);
	}

	componentDidMount() {

		//Set up session storage for location
		if(!window.sessionStorage.dispatch){
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
		google.maps.event.addListener(map, 'idle',() => {
			this.updateMap();
			this.saveMapLocation();
		});

		//10 Second interval update
		setTimeout(() => {
			this.updateMap();
		}, 10000);

		this.setState({ map: map });	
	}

	componentDidUpdate(prevProps, prevState) {

		//Check if there is an active assignment or the acive assignment has `changed`
		if(!this.isOpeningCallout && 
			this.props.activeAssignment && 
			(!prevProps.activeAssignment || prevProps.activeAssignment._id != this.props.activeAssignment._id)) 
		{	
			this.focusOnAssignment(this.props.activeAssignment);
		}

		//The map center has changed on the prop, telling the map to reposition
		if(JSON.stringify(prevProps.mapPlace) != JSON.stringify(this.props.mapPlace)){
			var place = this.props.mapPlace;

			//Check if the place has a viewport, then use that, otherwsie use the location and a regular zoom
			if(place.geometry.viewport){
				this.state.map.fitBounds(place.geometry.viewport);
			}
			else{
				this.state.map.panTo(place.geometry.location);
				this.state.map.setZoom(18);
			}

			this.saveMapLocation();
		}

		//Check if the map should update forcefully from the parent
		if(this.props.shouldMapUpdate){
			this.updateMap();
			this.props.mapShouldUpdate(false); //Send back up saying the map has been updated
		}

		//Check if view mode has changed to see if the map should needs to update the assignments
		if(this.props.viewMode !== prevProps.viewMode){
			//Clear assignments
			this.clearAssignments();
			//Close callout
			this.clearCallout();
		}

		//Pass down previous for diff check
		this.updateAssignmentMarkers(prevState.assignments);

		this.updateUserMarkers(prevState.users);

		/* Event Listeners Needed in the page */
		var selector = document.getElementById('callout-selector');

		if(selector) {
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
					circle.setRadius(
						global.milesToMeters(this.props.newAssignment.radius)
					);
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
					this.state.map.getZoom(),
					'markerDrag'
				);	
			});
		}
	}

	/**
	 * Saves the map's current location to local storage
	 * @return {[type]} [description]
	 */
	saveMapLocation() {
		//Save new map center to storage
		window.sessionStorage.dispatch = JSON.stringify({
			mapCenter: this.state.map.getCenter(),
			mapZoom: this.state.map.getZoom()
		});
	}

	/**
	 * Clears all relevant assignment data from the map
	 */
	clearAssignments(){

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
	 * Clears callout if exists
	 */
	clearCallout() {
		if(this.state.activeCallout) {
			this.state.activeCallout.close();
			this.setState({
				activeCallout: null
			});
		}
	}

	/**
	 * Updates the map with new users/assignments
	 */
	updateMap() {
		//Check if we have map in state
		if(!this.state.map) return;

		this.props.findAssignments(this.state.map, null, (assignments) => {
			
			this.props.findUsers(this.state.map, (users, error) => {

				var changedState = {},
					currentAssignments = _.clone(this.state.assignments);

				//Map out passed assignment IDs
				var newAssignmentIds = assignments.map((assignment) => {
					return assignment._id;
				});

				//Map out current assignment IDs
				var currentAssignmentIds = currentAssignments.map((assignment) => {
					return assignment._id;
				});

				//Check if there's a difference
				if(_.difference(newAssignmentIds, currentAssignmentIds).length){
					
					//Loop through new assignmt ids to push into current list of assignment Ids
					for (var i = 0; i < newAssignmentIds.length; i++) {
						//Check if the current assignments has this new assignment
						if(currentAssignmentIds.indexOf(newAssignmentIds[i]) == -1){
							//If not, push into current assignments list
							currentAssignments.push(assignments[i]);
						}
					}
				}

				//Check if there are any new assignments by comparing length
				if(currentAssignments.length > this.state.assignments.length)
					changedState.assignments = currentAssignments;

				//Map out all of the previous users
				var	uniqueUsers = [],
					currentUsers = _.clone(this.state.users),
					currentUserLocs = currentUsers.map((user) => {
						return JSON.stringify(user.coordinates);
					});

				//Loop through all the pulled users, and add into the state set
				for (var i = 0; i < users.length; i++) {
					var userLoc = JSON.stringify(users[i].coordinates);
					//Check if the user doesn't exist in the current state of users
					if(currentUserLocs.indexOf(userLoc) == -1) {
						//Add it in
						uniqueUsers.push(users[i]);
						currentUsers.push(users[i]);
					}
				}

				//Update state to have newly pushed in users
				changedState.users = currentUsers;
				changedState.uniqueUsers = uniqueUsers;

				this.setState(changedState);
			});
		});
	}

	/**
	 * Updates all assignment markers on the map, using the previously set ones to remove any repeats
	 */
	updateAssignmentMarkers(prevAssignments) {
		var assignments = [];

		//Map out all of the previous assignmnets
		var prevAssignmentIds = prevAssignments.map((assignment) => {
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
	 * Updates all the user markers on the map, using the unique set 
	 */
	updateUserMarkers(prevUsers) {
		//Loop through all the new users, and add all of the new ones
		for (var i = 0; i < this.state.uniqueUsers.length; i++) {
			//Add it to the map
			this.addUserMarker(this.state.uniqueUsers[i]);
		}
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
		if (assignment.expiration_time && assignment.expiration_time < Date.now()) {
			
			status = 'expired';
			zIndex = 100;

		}
		//Not expired assignment
		else {

			//Assignment is pending
			if(assignment.visibility == 0) {
				status = 'pending';
				zIndex = 200;
			}
			//Assignment has 'active' or unchecked status
			else {
				status = 'active'
				zIndex = 300;
			}

		}

		//Check if the status matches the view mode
		if(status != this.props.viewMode) 
			return;

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
			this.focusOnAssignment.bind(null, assignment)
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
				size: new google.maps.Size(108, 114),
				scaledSize: new google.maps.Size(36, 38),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(18, 19)
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
	 * @param {integer} radius Circle radius in meters
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
				url: "/images/assignment-user@3x.png",
				size: new google.maps.Size(30, 33),
				scaledSize: new google.maps.Size(10, 11),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(5, 5.5),
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
	 * Focuses on the passed assignment
	 * @param  {Object} assignment     Assignment focus on. Assumes assignment has Lat / Lng
	 */
	focusOnAssignment(assignment) {

		this.isOpeningCallout = true;
		var map = this.state.map,
			lat = assignment.location.geo.coordinates[1],
			lng = assignment.location.geo.coordinates[0];

		//Close the active callout if it exists yet
		if(this.state.activeCallout)
			this.clearCallout();

		map.panTo({
			lat: lat,
			lng: lng
		});

		var calloutContent = ReactDOM.renderToString(
			<DispatchMapCallout assignment={assignment} onClick />
		);

		var callout = new google.maps.InfoWindow({
			content: calloutContent,
			position: {
				lat: lat,
				lng: lng
			}
		});

		google.maps.event.addListener(callout, 'closeclick', () => {

			this.clearCallout();

		});

		callout.open(map);
		
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
