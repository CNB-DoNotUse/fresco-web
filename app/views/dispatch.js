import React from 'react'
import ReactDOM from 'react-dom'
import TopBar from './../components/topbar'
import App from './app'
import DispatchMap from './../components/dispatch-map'
import DispatchAssignments from './../components/dispatch-assignments'
import DispatchSubmit from './../components/dispatch-submit'

/**
 * Dispatch Parent Component, contains the Dispatch Map, as well as a set of cards
 */

class Dispatch extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			activeAssignment: null,
			newAssignment: null,
			updatePlace: null,
			viewMode: 'active'
		}
		this.updatePlace = this.updatePlace.bind(this);
		this.setActiveAssignment = this.setActiveAssignment.bind(this);
		this.updateNewAssignment = this.updateNewAssignment.bind(this);
		this.toggleSubmissionCard = this.toggleSubmissionCard.bind(this);
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
	updateNewAssignment(location, radius){
		this.setState({
			newAssignment: {
				location: location,
				radius: radius
			}
		});
	}

	//Tells the componenets to update their `Google Maps Place Autocomplete`
	//when the marker is finished dragging
	updatePlace(){
		this.setState({
			updatePlace: true
		})
	}

	/**
	 * Data call for retrieving assignments
	 */
	findAssignments(map, callback) {

		var bounds = map.getBounds();
		if(!bounds) return;
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
	findUsers(map, callback) {
		
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
	 * Toggles Assignment submission window
	 * @param  {BOOL} show To show or hide the window
	 */
	toggleSubmissionCard(show, event) {

		var dispatchSubmit = document.getElementById('dispatch-submit');

		if(show && this.state.newAssignment == null){

			this.setState({
				newAssignment: 'unset'
			})

			dispatchSubmit.className = dispatchSubmit.className.replace(/\btoggled\b/,'');

		}
		else if(!show){

			this.setState({
				newAssignment: null
			})

			dispatchSubmit.className += 'toggled';

		}

	}

	render() {

		var cards = [],
			key = 0;

		//Check if the user has an outlet and they're enabled for dispatch 
		if (this.props.user.outlet && this.props.user.outlet.dispatch_enabled) {

			cards.push(
				<DispatchAssignments 
					user={this.props.user} 
					toggleSubmissionCard={this.toggleSubmissionCard}
					findAssignments={this.findAssignments}
					viewMode={this.state.viewMode}
					key={key++} />
			);

			cards.push(
				<DispatchSubmit 
					user={this.props.user} 
					newAssignment={this.state.newAssignment}
					updateNewAssignment={this.updateNewAssignment}
					updatePlace={this.state.updatePlace}
					key={key++} />
			);


		}
		else{

			cards.push(
				<DispatchRequest key={key++} />
			);

		}

		return (
			<App user={this.props.user}>
				<TopBar 
					title={this.props.title}
					location={true} />
				<DispatchMap 
					user={this.props.user}
					setActiveAssignment={this.setActiveAssignment}
					findAssignments={this.findAssignments}
					findUsers={this.findUsers}
					viewMode={this.state.viewMode}
					newAssignment={this.state.newAssignment}
					updatePlace={this.updatePlace}
					updateNewAssignment={this.updateNewAssignment} />
				<div className="cards">
					{cards}
				</div>
			</App>
		);

	}

}


ReactDOM.render(
	<Dispatch 
		user={window.__initialProps__.user} 
		title={window.__initialProps__.title} />,
	document.getElementById('app')
);