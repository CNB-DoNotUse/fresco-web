import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import DispatchMap from '../components/dispatch/dispatch-map'
import DispatchAssignments from '../components/dispatch/dispatch-assignments'
import DispatchSubmit from '../components/dispatch/dispatch-submit'
import DispatchRequest from '../components/dispatch/dispatch-request'
import TopBar from '../components/topbar'
import LocationDropdown from '../components/global/location-dropdown';
import global from '../../lib/global'

/**
 * Dispatch Parent Component, contains the Dispatch Map, as well as a set of cards
 */

class Dispatch extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			assignments: [],
			users: [],
			activeAssignment: null,
			newAssignment: null,
			shouldUpdatePlace: false,
			shouldMapUpdate: false,
			currentPlace: null,
			viewMode: 'active',
		}
		
		this.mapShouldUpdate = this.mapShouldUpdate.bind(this);
		this.findAssignments = this.findAssignments.bind(this);
		this.updateAssignmentPlace = this.updateAssignmentPlace.bind(this);
		this.updateMapPlace = this.updateMapPlace.bind(this);
		this.updateViewMode = this.updateViewMode.bind(this);
		this.setActiveAssignment = this.setActiveAssignment.bind(this);
		this.updateNewAssignment = this.updateNewAssignment.bind(this);
		this.toggleSubmissionCard = this.toggleSubmissionCard.bind(this);
	}

	/**
	 * Tells the main dispatch map to update
	 * @param  {BOOL} should Should, or Should not update
	 */
	mapShouldUpdate(should) {
		this.setState({
			shouldMapUpdate: should
		});
	}

	setActiveAssignment(assignment) {
		this.setState({
			activeAssignment: assignment
		});
	}

	/**
	 * Updates the location of the new assignment to be passed 
	 * back and forth from the mini map to the main map
	 * @param {dictionary} location The new location
	 * @param {integer} radius The radius to update the new assignment with
	 */
	updateNewAssignment(location, radius, zoom) {
		this.setState({
			newAssignment: {
				location: location,
				radius: radius,
				zoom: zoom
			}
		});
	}

	//Tells the componenets to update their `Google Maps Place Autocomplete`
	//when the marker is finished dragging
	updateAssignmentPlace() {
		this.setState({ shouldUpdatePlace: true });
	}

	/**
	 * Takes a google maps place
	 */
	updateMapPlace(place) {
		this.setState({ mapPlace: place });
	}

	updateViewMode(viewMode) {
		//Do nothing if the same view mode
		if(viewMode === this.state.viewMode) return;

		this.setState({ viewMode : viewMode });
	}

	/**
	 * Data call for retrieving assignments
	 */
	findAssignments(map, params, callback) {
		
		//Check if params are set, otherwise default to empty dictionary
		var params = params || {};

		//Update view mode on params
		params.expired = this.state.viewMode == 'expired' ? true : false;
		params.active = this.state.viewMode == 'active' ? true : false;
		params.verified = this.state.viewMode == 'pending' ? false : true;
		params.now = Date.now();

		//Check if the user is not a CM or Greater
		if(this.props.user.rank < global.RANKS.CONTENT_MANAGER)
			params.outlet = this.props.user.outlet._id;

		//Add map params
		if(map) {

			var bounds = map.getBounds();
			if(!bounds) return;
			
			var proximitymeter = google.maps.geometry.spherical.computeDistanceBetween (
				bounds.getSouthWest(), 
				bounds.getNorthEast()
			);
			var proximitymiles = proximitymeter * 0.000621371192;
			var radius = proximitymiles / 2;
			var center = map.getCenter();

			params.lat = center.lat();
			params.lon =  center.lng();
			params.radius =	radius;
		}

		$.ajax({
			url: '/api/assignment/list',
			type: 'GET',
			data: params,
			dataType: 'json',
			success: (response, status, xhr) => {

				//Do nothing, because of bad response
				if(!response.data || response.err)
					callback([]);
				else {

					if(!params.verified) {
						response.data = response.data.filter(assignment => assignment.visibility == 0);
					}

					callback(response.data);
				}
			},
			error: (xhr, status, error) => {
				$.snackbar({content: resolveError(error)});
			}
		});	
	}

	/**
	 * Retrieves users from the API
	 * @param  {Google Maps object}   map      
	 * @param  {Function} callback callback with data, error
	 */
	findUsers(map, callback) {
		
		var bounds = map.getBounds();
		
		var proximitymeter = google.maps.geometry.spherical.computeDistanceBetween (
			bounds.getSouthWest(), 
			bounds.getNorthEast()
		);
		var proximitymiles = proximitymeter * 0.000621371192;
		var radius = proximitymiles / 2;
		var center = map.getCenter();

		if(!center) return callback(null, 'No center')

		var query = "lat=" + center.lat() + "&lon=" + center.lng() + "&radius=" + radius;
		
		//Should be authed
		$.ajax('/api/user/findInRadius?' + query, {
			success: (response) => {

				//Do nothing, because of bad response
				if(!response.data || response.err)
					callback(null, 'Error');
				else
					callback(response.data, null);

			},
			error: (xhr, status, error) => {
				return callback(null, error);
			}
		});
	}

	/**
	 * Toggles Assignment submission window
	 * @param  {BOOL} show To show or hide the window
	 */
	toggleSubmissionCard(show, event) {

		var dispatchSubmit = document.getElementById('dispatch-submit');

		if(show && this.state.newAssignment == null) {

			this.setState({
				newAssignment: 'unset'
			})

			dispatchSubmit.className = dispatchSubmit.className.replace(/\btoggled\b/,'');

		}
		else if(!show) {

			this.setState({
				newAssignment: null
			});

			dispatchSubmit.className += ' toggled';
		}
	}

	render() {

		var cards = [],
			key = 0;

		//Check if the user has an outlet and they're enabled for dispatch 
		if (this.props.user.outlet && this.props.user.outlet.dispatch_enabled) {

			cards.push(
				<DispatchAssignments 
					key={key++}
					user={this.props.user} 
					viewMode={this.state.viewMode}

					updateViewMode = {this.updateViewMode}
					setActiveAssignment={this.setActiveAssignment}
					toggleSubmissionCard={this.toggleSubmissionCard}
					findAssignments={this.findAssignments} />
			);

			cards.push(
				<DispatchSubmit 
					user={this.props.user} 
					newAssignment={this.state.newAssignment}
					rerender={this.state.newAssignment == 'unset'}
					shouldUpdatePlace={this.state.shouldUpdatePlace}
					
					updateViewMode = {this.updateViewMode}
					setActiveAssignment={this.setActiveAssignment}
					toggleSubmissionCard={this.toggleSubmissionCard}
					updateNewAssignment={this.updateNewAssignment}
					mapShouldUpdate={this.mapShouldUpdate}
					key={key++} />
			);
		}
		else{

			cards.push(
				<DispatchRequest key={key++} />
			);

		}

		console.log(this.props.outlet);
		
		return (
			<App user={this.props.user}>
				<TopBar 
					title={this.props.title}
					locationInput={true}
					updateMapPlace={this.updateMapPlace} >

					<LocationDropdown 
						user={this.props.user}
						outlet={this.props.outlet}
						addLocationButton={true}
						mapPlace={this.state.mapPlace} />
				</TopBar>
				
				<DispatchMap 
					user={this.props.user}
					activeAssignment={this.state.activeAssignment}
					mapPlace={this.state.mapPlace}
					viewMode={this.state.viewMode}
					newAssignment={this.state.newAssignment}
					shouldMapUpdate={this.state.shouldMapUpdate}

					mapShouldUpdate={this.mapShouldUpdate}
					setActiveAssignment={this.setActiveAssignment}
					findAssignments={this.findAssignments}
					findUsers={this.findUsers}
					updateAssignmentPlace={this.updateAssignmentPlace}
					updateNewAssignment={this.updateNewAssignment} />
				
				<div className="cards">{cards}</div>
			</App>
		);

	}

}


ReactDOM.render(
	<Dispatch 
		user={window.__initialProps__.user} 
		outlet={window.__initialProps__.outlet}
		title={window.__initialProps__.title} />,
	document.getElementById('app')
);