import React from 'react'
import global from '../../../lib/global'

export default class OutletLocations extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			locations: []
		}

		this.loadLocations = this.loadLocations.bind(this);
		this.addLocation = this.addLocation.bind(this);
		this.removeLocation = this.removeLocation.bind(this);
		this.updateLocationNotifications = this.updateLocationNotifications.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		//Need to init everytime because of the fucking checkboxes
		$.material.init();  
	}

	componentDidMount() {
		//Retreive locations		
		this.loadLocations();

		var autocomplete = new google.maps.places.Autocomplete(this.refs['outlet-location-input']);

        // Bind place_changed event to locationChanged
        google.maps.event.addListener(autocomplete, 'place_changed', ()=> {

        	this.addLocation(autocomplete.getPlace())
 
        });
	}

	/**
	 * Adds a location to the outlet's saved locations
	 * @param {object} place Google Autocomplete place
	 */
	addLocation(place) {
		var autocomplete = this.refs['outlet-location-input'],
			self = this;

		//Run checks on place and title
		if (!place || !place.geometry || !place.geometry.viewport){
			return $.snackbar({content: global.resolveError('ERR_UNSUPPORTED_LOCATION')});
		} else if(!autocomplete.value){
			$.snackbar({content: 'Please enter a valid location title'});
		}
		
		var bounds = place.geometry.viewport,
			params = {
				title: autocomplete.value,
				notify_fresco: this.refs['location-fresco-check'].checked,
				notify_email: this.refs['location-email-check'].checked,
				notify_sms: this.refs['location-sms-check'].checked,
				polygon: global.generatePolygonFromBounds(bounds)
			};
		
		$.ajax({
			url: '/scripts/outlet/location/create',
			method: 'post',
			contentType: 'application/json',
			data: JSON.stringify(params),
			success: function(response){

				if (response.err) 
					return this.error(null, null, response.err);
				
				//Clear field
				autocomplete.value = '';

				//Update locations
				self.loadLocations();

			},
			error: (xhr, status, error)=> {
				$.snackbar({ content: global.resolveError(error) });
			}
		});
	}

	/**
	 * Removes a location 
	 */
	removeLocation(locationId) {

		var self = this;

		$.ajax({
			url: '/scripts/outlet/location/remove',
			method: 'post',
			data: {
				id: locationId
			},
			success: function(response){

				if (response.err)
					return this.error(null, null, response.err);

				//Remove location from state
				var locations = self.state.locations.filter((locations) => {
					return locations._id !== locationId;
				});

				//Update state
				self.setState({
					locations: locations
				});
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
			}
		});
	}

	/**
	 * Loads locations for the outlet
	 */
	loadLocations(){

		//`since` is the last time they've seen the locations page,
		//eitehr grabbed from location storage, or defaults to the current timestamp
		var self = this;

		$.ajax({
			url: '/api/outlet/location/list',
			method: 'GET',
			success: function(response){

				if (response.err || !response.data)
					return this.error(null, null, response.err);
				
				//Update state
				self.setState({ locations: response.data });
			},
			error: (xhr, status, error) => {
				console.log(error);
				$.snackbar({
					content: global.resolveError(error,  'We\'re unable to load your locations at the moment! Please try again in a bit.')
				});
			}
		});
	}

	/**
	 * Updates the notification type for the passed location id
	 */
	updateLocationNotifications(locationId, notifType, e) {
		var self = this,
			params = {
				id: locationId
			};
		
		//Set the passed notif type to true
		params[notifType] = e.target.checked;

		var stateLocations = this.state.locations;

		// Update notification setting in state, if update fails, loadLocations will revert the check
		for(var x in stateLocations) {
			var location = stateLocations[x];
			if(location._id == locationId) {
				location.notifications[notifType.split('_')[1]] = e.target.checked;

				this.setState({
					locations: stateLocations
				});

				break; // Break ya legs
			}
		}

		$.ajax({
			url: '/api/outlet/location/update',
			method: 'post',
			data: params,
			success: function(response) {
				if (response.err)
					return this.error(null, null, response.err);

				//Run update to get latest data and update the checkboxes
				self.loadLocations();
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
			}
		});
	}
				
	render () {
		return (
			<div className="card settings-outlet-locations">
				<div className="header">
					<span className="title">SAVED LOCATIONS</span>

					<div className="labels">
						<span>NOTIFICATIONS:</span>
						<span>SMS</span>
						<span>EMAIL</span>
						<span>FRESCO</span>
					</div>
				</div>
				
				<OutletLocationsList 
					locations={this.state.locations}

					updateLocationNotifications={this.updateLocationNotifications}
					removeLocation={this.removeLocation} />

				<div className="footer">
					<input type="text"
						ref="outlet-location-input"
						placeholder="New location" />
					<span className="sub-title">SELECT ALL:</span>
					<div className="location-options">
						<div className="checkbox check-sms">
							<label>
								<input
									ref="location-sms-check"
									type="checkbox" />
							</label>
						</div>
						
						<div className="checkbox check-email">
							<label>
								<input
									ref="location-email-check"
									type="checkbox" />
							</label>
						</div>
						
						<div className="checkbox check-fresco">
							<label>
								<input
									ref="location-fresco-check"
									type="checkbox" />
							</label>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

class OutletLocationsList extends React.Component {

	render () {

		var locations = this.props.locations.map((location, i) => {

			var unseenCount = location.unseen_count || 0,
				notifications = location.notifications;

			unseenCount = global.isPlural(unseenCount) ? unseenCount + ' unseen items' : unseenCount + ' unseen item';
			
			return(
				<li className="location" key={i}>
					<div className="info">
						<a href={"/location/" + location._id}>
							<p className="area">{location.title}</p>
						
							<span className="count">{unseenCount}</span>
						</a>
					</div>

					<div className="location-options form-group-default">
						<span 
							onClick={this.props.removeLocation.bind(null, location._id)} 
							className="remove-location mdi mdi-delete"></span>
						
						<div className="checkbox check-sms">
							<label>
								<input
									type="checkbox" 
									checked={notifications.sms || false}
									onChange={this.props.updateLocationNotifications.bind(this, location._id, 'notify_sms')} />
							</label>
						</div>
						
						<div className="checkbox check-email">
							<label>
								<input
									type="checkbox" 
									checked={notifications.email || false}
									onChange={this.props.updateLocationNotifications.bind(this, location._id, 'notify_email')}/>
							</label>
						</div>
						
						<div className="checkbox check-fresco">
							<label>
								<input
									type="checkbox" 
									checked={notifications.fresco || false}
									onChange={this.props.updateLocationNotifications.bind(this, location._id, 'notify_fresco')} />
							</label>
						</div>
					</div>
				</li>
			);
		});	

		if(locations.length == 0) {
			return (
				<div className="outlet-locations-container">
					<h3 className="empty-title">There are currently no saved locations for your outlet!</h3>
				</div>
			)
		}
		
		return (
			<div className="outlet-locations-container">
				<ul className="outlet-locations">
					{locations}
				</ul>
			</div>
		)
	}
}