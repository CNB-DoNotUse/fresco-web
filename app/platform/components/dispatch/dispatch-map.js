import React from 'react';
import ReactDOM from 'react-dom/server'
import DispatchMapCallout from './dispatch-map-callout'
import _ from 'lodash'
import utils from 'utils'


/**
 * Dispatch Map component
 * @description The container for the map element in the dispatch page
 */
 export default class DispatchMap extends React.Component {

 	constructor(props) {
 		super(props);

 		this.state = {
 			assignments: [],
 			markers: [],
 			circles: [],
 			users: {},
 			userMarkers: {},
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
 		this.addAssignment = this.addAssignment.bind(this);
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

		//Grab dispatch info saved in local storage
		const dispatch = JSON.parse(window.sessionStorage.dispatch);

		//Set up the map object
		const map = new google.maps.Map(
			document.getElementById('map-canvas'),
			{
				zoom: dispatch.mapZoom,
				zoomControl: true,
				zoomControlOptions: {
					position: google.maps.ControlPosition.LEFT_TOP
				},
				streetViewControl: false,
				fullscreenControl: true,
				center: dispatch.mapCenter,
				styles: utils.mapStyles
			}
			);

		//Add event listeners for map life cycle
		google.maps.event.addListener(map, 'idle',() => {
			this.updateMap();
			this.saveMapLocation();
		});

		//10 Second interval update
		// setTimeout(() => {
		// 	this.updateMap();
		// }, 10000);

		this.setState({ map });
	}

	componentWillReceiveProps(nextProps) {
		//Check if there is an active assignment or the acive assignment has `changed`
		if(!this.isOpeningCallout && nextProps.activeAssignment){
			//No current active assignment
			if(!this.props.activeAssignment) {
				this.focusOnAssignment(nextProps.activeAssignment);
			}
			//If there is currently an active assignment and it has changed
			else if(nextProps.activeAssignment.id !== this.props.activeAssignment.id) {
				this.focusOnAssignment(nextProps.activeAssignment);
			}
		}

	    //The map center has changed on the prop, telling the map to reposition
	    if(JSON.stringify(nextProps.mapPlace) !== JSON.stringify(this.props.mapPlace)){
	    	const place = nextProps.mapPlace;

	    	//Check if the place has a viewport, then use that, otherwsie use the location and a regular zoom
	    	if(place.geometry.viewport){
	    		this.state.map.fitBounds(place.geometry.viewport);
	    	} else{
	    		this.state.map.panTo(place.geometry.location);
	    		this.state.map.setZoom(18);
	    	}

	    	this.saveMapLocation();
	    }

	    //Check if the map should update forcefully from the parent
	    if(nextProps.shouldMapUpdate){
	    	this.updateMap();
	    	this.props.mapShouldUpdate(false); //Send back up saying the map has been updated
	    }

	    //Check if view mode has changed to see if the map should needs to update the assignments
	    if(nextProps.viewMode !== this.props.viewMode){
	    	//Clear assignments and update map
	    	this.clearAssignments();
	    	//Close callout
	    	this.clearCallout();
	    }
	}

	componentDidUpdate(prevProps, prevState) {
		/* Event Listeners Needed in the page */
		let selector = document.getElementById('callout-selector');

		if(selector) {
			selector.addEventListener('click', (e) => {
				window.location.assign(`/assignment/${selector.dataset.id}`);
			});
		}

		const {
			newAssignmentMarker,
			newAssignmentCircle,
			map
		} = this.state;

		if(this.props.newAssignment) {
			const { newAssignment, updateNewAssignment } = this.props;
			const prevNewAssignment = prevProps.newAssignment;

			//Check if there's already a new assignment marker and a previous new assignment
			if(newAssignmentMarker && newAssignmentCircle && prevNewAssignment){
				//Compare to make sure we don't change the marker unless its position hasn't actually changed
				if(JSON.stringify(newAssignment.location) !== JSON.stringify(prevNewAssignment.location)){
					newAssignmentMarker.setPosition(newAssignment.location);
					newAssignmentCircle.setCenter(newAssignmentMarker.getPosition());

					map.setCenter(newAssignmentMarker.getPosition());
				}

				//Check if circle radius has changed
				if(prevNewAssignment.radius !== newAssignment.radius){
					newAssignmentCircle.setRadius(
						utils.milesToMeters(newAssignment.radius)
						);
				}
			}
			//None existing, so create a new marker and circle
			else {
				//Create the marker with a null position
				const newAssignmentMarker = this.createAssignmentMarker(map);
				const newAssignmentCircle = this.createCircle(map, null, 0, 'drafted', null);
				const location = {
					lat: newAssignmentMarker.getPosition().lat(),
					lng: newAssignmentMarker.getPosition().lng()
				};

				//Update the maps center to reflect the new positon of the marker
				map.setCenter(newAssignmentMarker.getPosition());

				google.maps.event.addListener(newAssignmentMarker, 'dragend', (ev) => {
					//Send up location to the parent
					updateNewAssignment({
						lat: ev.latLng.lat(),
						lng: ev.latLng.lng()
					},
					newAssignment.radius,
					map.getZoom(),
					'markerDrag'
					);
				});

				//Set marker to state of map so we can manage its location
				this.setState({  newAssignmentMarker, newAssignmentCircle });

				//Update the position to the parent component
				updateNewAssignment(location, null, null);
			}
		} else if(prevProps.newAssignment) {
			newAssignmentMarker.setMap(null);
			newAssignmentCircle.setMap(null);
			this.setState({
				newAssignmentMarker: null,
				newAssignmentCircle: null
			});
		}
	}

	handleNewAssignment() {


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
	 * Clears all relevant assignment data from the map and runs an update at the end
	 */
	 clearAssignments(){
	 	this.state.markers.forEach((marker) => {
	 		marker.setMap(null);
	 	});
	 	this.state.circles.forEach((circle) => {
	 		circle.setMap(null);
	 	});

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
	 * @description Makes ajax call for both assignments and users separately
	 */
	 updateMap() {
		//Check if we have map in state or are loading
		if(!this.state.map) return;

		//Send bounds for dispatch parent state
		this.props.updateCurrentBounds(this.state.map.getBounds());

		//Get assignments
		if(!this.loadingAssignments){
			this.loadingAssignments = true;

			this.props.findAssignments(this.state.map, {}, (assignments) => {
				this.loadingAssignments = false;

				this.updateAssignmentMarkers(assignments);
			});
		}

		//Get users
		if(!this.loadingUsers){
			this.loadingUsers = true;

			this.props.findUsers(this.state.map, (users, error) => {
				this.loadingUsers = false;

				if(users == null) return;

				let formattedUsers = {};

				//Set object keys by hash
				users.forEach((user) => {
					formattedUsers[user.hash] = user;
				});

				//Update the user markers, then update state on callback
				this.updateUserMarkers(formattedUsers, (markers) => {
					this.setState({
						userMarkers: markers,
						users: formattedUsers
					});
				});
			});
		}
	}

	/**
	 * Updates all assignment markers on the map, using the previously set ones to remove any repeats
	 * @param {array} newAssignments List of new assignments to update
	 */
	 updateAssignmentMarkers(newAssignments) {
	 	let assignments = _.clone(this.state.assignments);

		//Iterate backwards, because we slice as we go
		let i = newAssignments.length;
		while (i--) {
			const assignment = newAssignments[i];


		    //If it exists, remove it from the new assignments
		    if(_.find(assignments, ['id' , assignment.id]) || !assignment.location) {
		    	newAssignments.splice(i, 1);
		    }
		    //If it doesn't, push it into the list of assignments in state, and keep it in new assignments
		    else {
		    	assignments.push(assignment);
		    }
		}

		this.setState({ assignments });

		//Add cleaned assignments to the map
		this.addAssignmentsToMap(newAssignments);
	}

	/**
	 * Adds passed array of assignments to the map,
	 * then sets state from concatted response from `addAssignmentToMap` on each assignment
	 */
	 addAssignmentsToMap(assignments){
	 	let markers = [];
	 	let circles = [];

		//Loop and add assignments to map
		assignments.forEach((assignment) => {
			const assignmentMapData = this.addAssignment(assignment, false);

			//Push into local marker and circles
			markers.push(assignmentMapData.marker);
			circles.push(assignmentMapData.circle);
		});

		//Update state
		this.setState({
			markers: this.state.markers.concat(markers),
			circles: this.state.circles.concat(circles)
		});
	}

	/**
	 * Makes a marker with the passed assignment and adds it to the map
	 * @return adds a google maps marker, with the passed geo-location
	 */
	 addAssignment(assignment, draggable) {
		//Lat/Lng will default to center if for a created assignment
		const { map } = this.state;
		let title = assignment.title || 'No title';
		let zIndex;
		let status;
		let position = new google.maps.LatLng(
			assignment.location.coordinates[1],
			assignment.location.coordinates[0]
			);
		let radius = assignment.radius;

		//Check if the assignment is expired
		if (new Date(assignment.ends_at).getTime() < Date.now() && assignment.rating !== 0) {
			status = 'expired';
			zIndex = 100;
		} else {
			if(assignment.rating == 0) { //Assignment is pending
				status = 'pending';
				zIndex = 200;
			} else { //Assignment has 'active' or unchecked status
			status = 'active'
			zIndex = 300;
		}
	}

		//Create the rendered circle
		const circle = this.createCircle(
			map,
			position,
			utils.milesToMeters(radius),
			status,
			assignment.id
			);
		//Create the marker
		const marker = this.createAssignmentMarker(
			map,
			position,
			title,
			status,
			zIndex,
			draggable,
			assignment.id
			);

		//Add event handler to display callout when clicekd
		google.maps.event.addListener(
			marker,
			'click',
			this.focusOnAssignment.bind(null, assignment)
			);

		return { circle, marker }
	}

	/**
	 * Creates a marker from passed params
	 */
	 createAssignmentMarker(map, position, title, status, zIndex, draggable, assignmentId) {
		//Create the marker image
		const image = {
			url: status ? utils.assignmentImage[status] : utils.assignmentImage.drafted,
			size: new google.maps.Size(108, 114),
			scaledSize: new google.maps.Size(36, 38),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(18, 19)
		};

		//Default to position or center of map
		if(!position){
			position = {lat: map.getCenter().lat(), lng: map.getCenter().lng()};
		}

		return new google.maps.Marker({
			position: position,
			map: map,
			title: title || 'No title',
			icon: image,
			zIndex: zIndex || 0,
			draggable: draggable !== undefined ? draggable : true,
			assignmentId: assignmentId !== undefined ? assignmentId : true
		});
	}

	/**
	 * Adds circle to the map given a center and a radius
	 * @param {dictionary} center Center of the circle
	 * @param {integer} radius Circle radius in meters
	 * @param {Assignment status} status active/pending/expired
	 */
	 createCircle(map, center, radius, status, assignmentId) {
	 	return new google.maps.Circle({
	 		map: map,
	 		center: center || map.getCenter(),
	 		radius: radius || 0,
	 		strokeWeight: 0,
	 		fillColor: utils.assignmentColor[status],
	 		fillOpacity: 0.3,
	 		assignmentId: assignmentId !== undefined ? assignmentId : true
	 	});
	 }

	/**
	 * Updates all the user markers on the map
	 * @description Compares the passed in new users, to the current state users
	 */
	 updateUserMarkers(newUsers, callback) {
	 	var keys = Object.keys(newUsers),
	 	markers = _.clone(this.state.userMarkers);

		//Make keys after the loop, because keys may have been deleted
		var currentUsers = _.clone(this.state.users),
		currentUserKeys = Object.keys(currentUsers);

		for (var i = 0; i < keys.length; i++) {
			let key = keys[i];
			let user = newUsers[key];
			let prevUser = currentUsers[key];

			//If the user already exists
			if(prevUser !== null && typeof(prevUser) !== 'undefined') {
				//If the location has changed, move it, otherwise do nothing
				if(prevUser.curr_geo.coordinates[0] !== user.curr_geo.coordinates[0] || prevUser.curr_geo.coordinates[1] !== user.curr_geo.coordinates[1]){
					var marker = markers[key];

					//Update the marker's position
					marker.setPosition(new google.maps.LatLng(user.curr_geo.coordinates[1], user.curr_geo.coordinates[0]));
				}
			}
			//If the user doesn't exist in the new data set
			else {
				//If the marker exists, but the user doesn't, remove the marker and delete from current set
				if(markers[key]){
					markers[key].setMap(null);
					delete currentUsers[key];
				}

				const marker = this.createUserMarker(this.state.map, user.curr_geo); //Add user to map

				markers[key] = marker; //Save marker to state
			}
		}

		//If the length changed, reset the keys to avoid
		//iterating over keys that do no exist any more
		if(currentUsers.length !== this.state.users.length)
			currentUserKeys = Object.keys(currentUsers);

		//Loop through current users and remove them if they're not in the new set
		for (var i = 0; i < currentUserKeys.length; i++) {
			var key = currentUserKeys[i];

			//Check if the user's aren't in the new set by the key
			if(newUsers[key] == null && markers[key]) {
				markers[key].setMap(null);
				delete markers[key];
			}
		}

		callback(markers);
	}

	/**
	 * Makes a marker for a user
	 * @return a google maps marker for a user, with the passed geo-location
	 */
	 createUserMarker(map, geo) {
	 	const image = {
	 		url: "/images/assignment-user@3x.png",
	 		size: new google.maps.Size(30, 33),
	 		scaledSize: new google.maps.Size(10, 11),
	 		origin: new google.maps.Point(0, 0),
	 		anchor: new google.maps.Point(5, 5.5),
	 	};

	 	return new google.maps.Marker({
	 		position: new google.maps.LatLng(geo.coordinates[0], geo.coordinates[1]),
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

	 	if(assignment.location == null) {
	 		return this.isOpeningCallout = false;
	 	}

	 	const map = this.state.map;
	 	const lat = assignment.location.coordinates[1];
	 	const lng = assignment.location.coordinates[0];

		//Close the active callout if it exists yet
		if(this.state.activeCallout)
			this.clearCallout();

		map.panTo({ lat, lng });

		let calloutContent = ReactDOM.renderToString(
			<DispatchMapCallout assignment={assignment} />
			);

		const callout = new google.maps.InfoWindow({
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

DispatchMap.defaultProps = {
	activeAssignment: {}
}
