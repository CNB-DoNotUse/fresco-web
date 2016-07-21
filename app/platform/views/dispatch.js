import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import DispatchMap from '../components/dispatch/dispatch-map'
import DispatchAssignments from '../components/dispatch/dispatch-assignments'
import DispatchSubmit from '../components/dispatch/dispatch-submit'
import DispatchRequest from '../components/dispatch/dispatch-request'
import TopBar from '../components/topbar'
import LocationDropdown from '../components/global/location-dropdown';
import utils from 'utils'
import 'sass/platform/_dispatch'

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
			lastChangeSource: '',
			shouldMapUpdate: false,
			displaySubmissionCard: false,
			currentPlace: null,
			viewMode: 'active',
		}

		this.mapShouldUpdate = this.mapShouldUpdate.bind(this);
		this.findAssignments = this.findAssignments.bind(this);
		this.updateMapPlace = this.updateMapPlace.bind(this);
		this.updateCurrentBounds = this.updateCurrentBounds.bind(this);
		this.updateViewMode = this.updateViewMode.bind(this);
		this.setActiveAssignment = this.setActiveAssignment.bind(this);
		this.updateNewAssignment = this.updateNewAssignment.bind(this);
		this.toggleSubmissionCard = this.toggleSubmissionCard.bind(this);
	}

	/**
	 * Tells the main dispatch map to update
	 * @param  {BOOL} `should` Should, or Should not update
	 */
	mapShouldUpdate(should) {
		this.setState({
			shouldMapUpdate: should
		});
	}

	/**
	 * Sets active assignment
	 * @description Dispatch map needs to know which assignment was clicked on the assignment
	 * list component
	 */
	setActiveAssignment(assignment) {
		this.setState({
			activeAssignment: assignment
		});
	}

	/**
	 * Updates the location of the new assignment to be passed
	 * back and forth from the mini map to the main map
	 * @param {Object} location The new location
	 * @param {Integer} radius The radius to update the new assignment with
	 * @param {String} source where the change comes from
	 */
	updateNewAssignment(location = null, radius = 0, zoom = 0, lastChangeSource = null) {
		let newAssignment = null;

		//Clear the new assignment if there's no location
		if(location == null) {
			newAssignment = null
		} else if (location == 'new') {
			newAssignment = 'unset';
		} else {
			newAssignment = { location, radius, zoom };
		}

		this.setState({ newAssignment, lastChangeSource });
	}

	/**
	 * Updates the stateful google maps place used in the component and its children
	 */
	updateMapPlace(place) {
		this.setState({ mapPlace: place });
	}

	/**
	 * Updates states bounds for other components
	 */
	updateCurrentBounds(map) {
		this.setState({
			bounds: map.getBounds()
		})
	}

	/**
	 * Updates view mode on map for assignment type filtering
	 */
	updateViewMode(viewMode) {
		//Do nothing if the same view mode
		if(viewMode === this.state.viewMode) return;

		this.setState({ viewMode });
	}

	/**
	 * Data call for retrieving assignments
	 * @param  {Google Maps object}   map
	 * @param  {Function} callback callback with data, error
	 */
	findAssignments(map = null, params = {}, callback = function(){}) {
		//Update view mode on params
		const { viewMode } = this.state;

		if(viewMode === 'pending') {
			params.rating = 0;
		} else if(viewMode === 'active'){
			params.ends_after = Date.now();
			params.rating = 1;
		} else {
			params.rating = 1;
			params.ends_before = Date.now();
		}

		//Add map params
		if(map) {
			params.geo = {
				type : "Polygon",
				coordinates :  utils.generatePolygonFromBounds(map.getBounds())
			};
		} else {
			params.sortBy = params.rating == 0 ? 'created_at' : 'ends_at';
			params.direction = viewMode === 'active' ? 'asc' : 'desc'; //Switch sort when viewing non-active `history`
			params.limit = 10;	
		}

		$.ajax({
			url: '/api/assignment/find',
			type: 'GET',
			data: $.param(params),
			success: (response, status, xhr) => {
				if(response && !response.err) {
					callback(map ? response  : utils.mergeAssignments(response, params.sortBy, params.direction))
				} else {
					callback([]);
				}
			},
			error: (xhr, status, error) => {
				$.snackbar({content: utils.resolveError(error)});
			}
		});
	}

	/**
	 * Retrieves users from the API
	 * @param  {Google Maps object}   map
	 * @param  {Function} callback callback with data, error
	 */
	findUsers(map, callback) {
		const params = {
			geo: {
				type : "Polygon",
				coordinates :  utils.generatePolygonFromBounds( map.getBounds())
			}
		};

		$.ajax({
			url: '/api/user/locations/find',
			type: 'GET',
			data: $.param(params),
			success: (response, status, xhr) => {
				callback(
					!response.err && response.length > 0 ? response : []
				);
			},
			error: (xhr, status, error) => {
				$.snackbar({content: utils.resolveError(error)});
			}
		});
	}

	/**
	 * Toggles Assignment submission window
	 * @param  {BOOL} show To show or hide the window
	 */
	toggleSubmissionCard(show, event) {
		this.setState({
			displaySubmissionCard: !this.state.displaySubmissionCard,
			newAssignment: this.state.newAssignment == null ? 'unset' : null
		})
	}

	/**
	 * Downloads stats when button is clicked
	 */
	downloadStats() {
		window.open('/scripts/assignment/report', '_blank');
	}

	render() {
		const { user } = this.props;
		let cards = [];
		let key = 0;

		//Check if the user has an outlet and they're enabled for dispatch
		if (user.outlet && user.outlet.dispatch_enabled) {

			cards.push(
				<DispatchAssignments
					key={key++}
					user={this.props.user}
					viewMode={this.state.viewMode}

					updateViewMode = {this.updateViewMode}
					setActiveAssignment={this.setActiveAssignment}
					toggleSubmissionCard={this.toggleSubmissionCard}
					findAssignments={this.findAssignments}
				/>
			);

			cards.push(
				<DispatchSubmit
					user={this.props.user}
					newAssignment={this.state.newAssignment}
					rerender={this.state.newAssignment == 'unset'}
					displaySubmissionCard={this.state.displaySubmissionCard}
					bounds={this.state.bounds}
					lastChangeSource={this.state.lastChangeSource}
					updateCurrentBounds={this.updateCurrentBounds}
					updateViewMode = {this.updateViewMode}
					setActiveAssignment={this.setActiveAssignment}
					toggleSubmissionCard={this.toggleSubmissionCard}
					updateNewAssignment={this.updateNewAssignment}
					mapShouldUpdate={this.mapShouldUpdate}
					key={key++}
				/>
			);
		}
		else{
			cards.push(
				<DispatchRequest
					key={key++} />
			);
		}

		return (
			<App user={this.props.user}>
				<TopBar
					locationInput={true}
					mapPlace={this.state.mapPlace}
					bounds={this.state.bounds}
					updateMapPlace={this.updateMapPlace} >

					<LocationDropdown
						user={this.props.user}
						outlet={this.props.outlet}
						updateMapPlace={this.updateMapPlace}
                        mapPlace={this.state.mapPlace}
						addLocationButton
                    />

					{this.props.user.rank > 1 ?
						<button
							className="btn btn-flat pull-right mt12 mr16"
							onClick={this.downloadStats} >Download Stats (.xlsx)</button>
						:
						''
					}
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
					updateCurrentBounds={this.updateCurrentBounds}
					findUsers={this.findUsers}
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
		outlet={window.__initialProps__.outlet}
		title={window.__initialProps__.title} />,
	document.getElementById('app')
);
