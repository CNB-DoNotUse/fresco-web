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
			activeCallout: null,
			map: null,
			newAssignmentMarker: null,
			newAssignmentCircle: null
		}

		this.updateMap = this.updateMap.bind(this);
		this.updateAssignmentMarkers = this.updateAssignmentMarkers.bind(this);
		this.updateUserMarkers = this.updateUserMarkers.bind(this);
		this.focusOnAssignment = this.focusOnAssignment.bind(this);
		this.addAssignmentToMap = this.addAssignmentToMap.bind(this);
	}

	componentDidMount() {
		
		var styles = [{"featureType": "all", "elementType":"all", "stylers": [{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"all","stylers":[{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#e0e0e0"}]},
			{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#bdbdbd"}]},
			{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
			{"featureType":"poi.park","elementType":"all","stylers":[{"gamma":1.26}]},
			{"featureType":"poi.park","elementType":"labels.text","stylers":[{"saturation":-54}]}];

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
				styles: styles
			}
		);

		//Add event listeners for map life cycle
		google.maps.event.addListener(map, 'idle', this.updateMap);
		google.maps.event.addListener(map, 'dragend', this.updateMap);

		this.setState({ map: map });	

	}

	componentDidUpdate(prevProps, prevState) {

		if(JSON.stringify(prevProps.mapCenter) != JSON.stringify(this.props.mapCenter)){
			this.state.map.setCenter(this.props.mapCenter);
		}

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

		//Check if there's already a new assignment marker 
		//Meaning the marker has already been added, and we don't need to add a new one
		if(this.state.newAssignmentMarker && this.state.newAssignmentCircle){

			var marker = this.state.newAssignmentMarker,
				circle = this.state.newAssignmentCircle,
				map = this.state.map;

			if(this.props.newAssignment){

				//Compare to make sure we don't change the marker unless its position hasn't actually changed
				//or there is no location
				if(!prevProps.newAssignment.location || 
					JSON.stringify(this.props.newAssignment.location) != JSON.stringify(prevProps.newAssignment.location))
				{
					marker.setPosition(this.props.newAssignment.location);	
					map.setCenter(
						marker.getPosition()
					);	     
					circle.setCenter(this.state.newAssignmentMarker.getPosition());
				}
				if(prevProps.newAssignment.radius != this.props.newAssignment.radius){
					circle.setRadius(this.props.newAssignment.radius);
				}

			}
			//Remove markers 
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
				circle = this.addCircle(null, 0, 'active'),
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
				this.props.updatePlace();
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
		}

	}

	/**
	 * Updates the map with new users/assignments
	 */
	updateMap() {

		this.props.findAssignments(this.state.map, (assignments) => {

			this.props.findUsers(this.state.map, (users, error) => {
				
				this.setState({
					assignments: assignments,
					users: users
				});

			});

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
			markerURL,
			zIndex, 
			status,
			position = new google.maps.LatLng(
						assignment.location.geo.coordinates[1], 
						assignment.location.geo.coordinates[0]
					  ),
			radius = assignment.location.radius;

		//Check if the assignment is expired
		if (assignment.expiration_time && assignment.expiration_time < Date.now()){
			//Then check if we're in the right view mode
			if(this.props.viewMode == 'expired'){
				status = 'expired';
				markerURL = '/images/assignment-expired@2x.png';
				zIndex = 100;
			}
			//Otherwise break
			else {
				return;
			}
		}
		//Not expired assignment
		else{

			//Assignment is pending
			if(assignment.visibility == 0){
				status = 'pending';
				markerURL = '/images/assignment-pending@2x.png';
				zIndex = 200;
			}
			//Assignment has 'active' or unchecked status
			else{
				status = 'active;'
				zIndex = 300;
				markerURL = '/images/assignment-active@2x.png';
			}

		}

		//Create the rendered circle
		var circle = this.addCircle(
			position, 
			global.milesToMeters(radius), 
			status
		);
		
		//Create the marker
		var marker = this.addAssignmentMarker(
			position, 
			title, 
			markerURL, 
			zIndex, 
			draggable
		);

		//Add event handler to display callout when clicekd
		google.maps.event.addListener(
			marker, 
			'click',  
			this.focusOnAssignment.bind(null, marker, circle, assignment)
		);

	}

	addAssignmentMarker(position, title, markerURL, zIndex, draggable) {

		//Create the marker image
		var image = {
			url: markerURL || '/images/assignment-active@2x.png',
			size: new google.maps.Size(114, 114),
			scaledSize: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(30, 30)
		};

		var position = position || {lat: this.state.map.getCenter().lat(), lng: this.state.map.getCenter().lng()};

		var marker = new google.maps.Marker({
			position: position,
			map: this.state.map,
			title: title || 'No title',
			icon: image,
			zIndex: zIndex || 0,
			draggable: draggable !== undefined ? draggable : true
		});

		return marker;

	}

	/**
	 * Adds circle to the map given a center and a radius
	 * @param {dictionary} center Center of the circle
	 * @param {integer} radius Circle radius in feet
	 * @param {Assignment status} status active/pending/expired
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
			center: center || this.state.map.getCenter(),
			radius: radius || 0,
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
				this.addAssignmentToMap(assignment, false);
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

	/**
	 * Focuses on the passed assignment
	 * @param  {Google Maps Marker} marker     The marker to focus in on
	 * @param  {Google Maps Circle} circle     The radius of the assignment
	 */
	focusOnAssignment(marker, circle, assignment) {

		var map = this.state.map;

		//Check if the active assignment isn't the clicked again
		if(this.props.activeAssignment && this.props.activeAssignment._id == assignment._id)
			return;

		//Close the active callout if it exists yet
		if(this.state.activeCallout)
			this.state.activeCallout.close();

		map.panTo(marker.getPosition());

		map.fitBounds(circle.getBounds());

		var callout = ReactDOM.renderToString(
			<DispatchMapCallout assignment={assignment} onClick />
		);

		callout = new google.maps.InfoWindow({
			content: callout,
			position: marker.getPosition(),
		});

		callout.open(map, marker);

		//Update the active assignment and callout
		this.props.setActiveAssignment(assignment);
		
		this.setState({
			activeCallout: callout
		});
		
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

