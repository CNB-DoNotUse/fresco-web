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
			lastChangeSource: '',
			shouldMapUpdate: false,
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
	updateNewAssignment(location, radius, zoom, source) {
		if(typeof source == 'undefined')source = '';

		this.setState({
			newAssignment: {
				location: location,
				radius: radius,
				zoom: zoom
			},
			lastChangeSource: source
		});
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

		this.setState({ viewMode : viewMode });
	}

	/**
	 * Data call for retrieving assignments
	 * @param  {Google Maps object}   map      
	 * @param  {Function} callback callback with data, error
	 */
	findAssignments(map, params, callback) {
		//Check if params are set, otherwise default to empty dictionary
		const params = params || {};

		//Update view mode on params
		params.expired = this.state.viewMode == 'expired';
		params.active = this.state.viewMode == 'active';
		params.pending = this.state.viewMode == 'pending';

		//Add map params
		if(map) {
			const bounds = map.getBounds();
			
			if(!bounds) callback('No bounds');
			
			const proximityMeter = google.maps.geometry.spherical.computeDistanceBetween (
				bounds.getSouthWest(), 
				bounds.getNorthEast()
			);

			const radius = global.metersToMiles(proximityMeter) / 2;
			const mapCenter = map.getCenter();
			const center = new google.maps.LatLng(mapCenter .lat(), mapCenter .lng());

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
				if(response.data && !response.err) {
					callback(response.data);
				}
				else {
					callback([]);
				}
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
			}
		});	
	}

	/**
	 * Retrieves users from the API
	 * @param  {Google Maps object}   map      
	 * @param  {Function} callback callback with data, error
	 */
	findUsers(map, callback) {
		
		const bounds = map.getBounds();
		const proximitymeter = google.maps.geometry.spherical.computeDistanceBetween(
			bounds.getSouthWest(), 
			bounds.getNorthEast()
		);
		const proximitymiles = proximitymeter * 0.000621371192;
		const radius = proximitymiles / 2;
		const mapCenter = map.getCenter();
		const center = new google.maps.LatLng(mapCenter .lat(), mapCenter .lng());

		if(!center) 
			return callback(null, 'No center');

		const query = `lat=${center.lat()}&lon=${center.lng()}&radius=${radius}`;
		
		//Should be authed
		$.ajax(`/api/user/findInRadius?${query}`, {
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

	/**
	 * Downloads stats when button is clicked
	 */
	downloadStats() {
		window.open('/scripts/assignment/stats', '_blank');
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

		let statsDownloadButton = '';

		if(this.props.user.rank > 1) {
			statsDownloadButton = (
				<button 
					className="btn btn-flat pull-right mt12 mr16" 
					onClick={this.downloadStats} >Download Stats (.xlsx)</button>
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
						addLocationButton={true}

						updateMapPlace={this.updateMapPlace}
						mapPlace={this.state.mapPlace} />

					{statsDownloadButton}
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