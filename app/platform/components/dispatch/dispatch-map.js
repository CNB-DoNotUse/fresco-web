import React from 'react';
import ReactDOM from 'react-dom/server'
import DispatchMapCallout from './dispatch-map-callout'
import _ from 'lodash'
import utils from 'utils' 

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
		
		//Grab dispatch info saved in local storage	
		const dispatch = JSON.parse(window.sessionStorage.dispatch);
		//Set up the map object
		const map = new google.maps.Map(
			document.getElementById('map-canvas'), 
			{
				zoom: dispatch.mapZoom,
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
		setTimeout(() => {
			this.updateMap();
		}, 10000);

		this.setState({ map});	
	}

	componentWillReceiveProps(nextProps) {
		const activeAssignmentChanged = nextProps.activeAssignment.id !== this.props.activeAssignment.id;

		//Check if there is an active assignment or the acive assignment has `changed`
		if(!this.isOpeningCallout && nextProps.activeAssignment)
			//If there is currently an active assignment and it has changed
			if(nextProps.activeAssignment.id !== this.props.activeAssignment.id) {
				this.focusOnAssignment(nextProps.activeAssignment);
			} else if(!this.props.activeAssignment) {
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
	    	//Clear assignments
	    	this.clearAssignments();
	    	//Close callout
	    	this.clearCallout();
	    }
	}

	componentDidUpdate(prevProps, prevState) {

		//Pass down previous for diff check
		this.updateAssignmentMarkers(prevState.assignments);

		/* Event Listeners Needed in the page */
		let selector = document.getElementById('callout-selector');
		
		if(selector) {
			selector.addEventListener('click', (e) => {
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
						utils.milesToMeters(this.props.newAssignment.radius)
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

			google.maps.event.addListener(marker, 'dragend', (ev) => {
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
	 * Clears all relevant assignment data from the map and runs an update at the end
	 */
	clearAssignments(){
		this.state.markers.forEach((marker) => {
			market.setMap(null);
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
	 */
	updateMap() {
		//Check if we have map in state
		if(!this.state.map) return;

		this.props.updateCurrentBounds(this.state.map);

		//Get assignments
		this.props.findAssignments(this.state.map, {}, (assignments) => {
			let currentAssignments = _.clone(this.state.assignments);
			//Map out passed assignment IDs
			let currentAssignmentIds = currentAssignments.map(assignment => assignment.id );
			//Map out passed assignment IDs
			let newAssignmentIds = assignments.nearby.map(assignment => assignment.id);

			//Check if there's a difference
			if(_.difference(newAssignmentIds, currentAssignmentIds).length){
				//Loop through new assignmt ids to push into current list of assignment Ids
				for (var i = 0; i < newAssignmentIds.length; i++) {
					//Check if the current assignments has this new assignment
					if(currentAssignmentIds.indexOf(newAssignmentIds[i]) == -1){
						//If not, push into current assignments list
						currentAssignments.push(assignments.nearby[i]);
					}
				}
			}

			//Check if there are any new assignments by comparing length
			if(currentAssignments.length > this.state.assignments.length){
				this.setState({ 
					assignments: currentAssignments
				});
			}
		});

		//Get users
		this.props.findUsers(this.state.map, (users, error) => {
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

	/**
	 * Updates all assignment markers on the map, using the previously set ones to remove any repeats
	 */
	updateAssignmentMarkers(prevAssignments) {
		var assignments = [];

		//Map out all of the previous assignmnets
		var prevAssignmentIds = prevAssignments.map(assignment => assignment.id.toString());


		for (var i = 0; i < this.state.assignments.length; i++) {
			//Check if it doesn't exist
			if(prevAssignmentIds.indexOf(this.state.assignments[i].id.toString()) == -1) {
				assignments.push(this.state.assignments[i]);
			}
		}

		if(assignments.length == 0 ) return;

		this.addAssignmentsToMap(assignments);
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
			var key = keys[i],
				user = newUsers[key],
				prevUser = currentUsers[key];

			//If the location already exists
			if(prevUser !== null && typeof(prevUser) !== 'undefined') {
				//If the location has changed, move it, otherwise do nothing
				if(prevUser.geo.coordinates[0] !== user.geo.coordinates[0] || prevUser.geo.coordinates[1] !== user.geo.coordinates[1]){
					var marker = markers[key];

					//Update the marker's position
					marker.setPosition(new google.maps.LatLng(user.geo.coordinates[1], user.geo.coordinates[0]));
				}
			}
			//If the user doesn't exist in the new data set
			else { 
				//If the marker exists, but the user doesn't, remove the marker and delete from current set
				if(markers[key]){
					markers[key].setMap(null);
					delete currentUsers[key];
				}

				var marker = this.addUserMarker(user.geo); //Add user to map

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
	 * Adds passed array of assignments to the map, 
	 * then sets state from concatted response from `addAssignmentToMap` on each assignment
	 */
	addAssignmentsToMap(assignments){
		let markers = [];
		let circles = [];

		for (var i = 0; i < assignments.length; i++) {
			const mapData = this.addAssignmentToMap(assignments[i], false);
			
			if(typeof(mapData) === 'undefined') continue;
			
			//Push into local marker and circles
			markers.push(mapData.marker);
			circles.push(mapData.circle);
			assignments[i]
		}

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
		console.log(assignment);

		//Lat/Lng will default to center if for a created assignment
		let map = this.state.map;
		let title = assignment.title || 'No title';
		let zIndex; 
		let status;
		let position = new google.maps.LatLng(
			assignment.location.coordinates[1], 
			assignment.location.coordinates[0]
		);
		let radius = assignment.location.radius;

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
		if(status != this.props.viewMode) return;

		//Create the rendered circle
		const circle = this.addCircle(
			position, 
			utils.milesToMeters(radius), 
			status,
			assignment.id
		);
		
		//Create the marker
		const marker = this.addAssignmentMarker(
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

	addAssignmentMarker(position, title, status, zIndex, draggable, assignmentId) {

		//Create the marker image
		var image = {
				url: status ? utils.assignmentImage[status] : utils.assignmentImage.drafted,
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
		
		var fillColor = utils.assignmentColor[status],
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
			lat = assignment.location.coordinates[1],
			lng = assignment.location.coordinates[0];

		//Close the active callout if it exists yet
		if(this.state.activeCallout)
			this.clearCallout();

		map.panTo({
			lat: lat,
			lng: lng
		});

		var calloutContent = ReactDOM.renderToString(
			<DispatchMapCallout assignment={assignment} />
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

DispatchMap.defaultProps = {
	activeAssignment: {}
}
