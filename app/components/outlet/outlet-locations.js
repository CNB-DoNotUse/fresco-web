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
		//Error message we'll use if the area doesn't have a bounds
		var unsupportedLocation = 'We can\'t support this location at the moment. Please enter a broader area',
			autocomplete = this.refs['outlet-location-input'],
			self = this;

		//Run checks on place and title
		if (!place || !place.geometry || !place.geometry.viewport){
			return $.snackbar({content: unsupportedLocation});
		} else if(!autocomplete.value){
			$.snackbar({content: 'Please enter a valid location title'});
		}
		
		var bounds = place.geometry.viewport,
			params = {
				title: this.refs['outlet-location-input'].value,
				notify_fresco: this.refs['location-fresco-check'].checked,
				notify_email: this.refs['location-email-check'].checked,
				notify_sms: this.refs['location-sms-check'].checked,
				polygon: []
			};
		
		//Generate the polygon from the google maps bounds
		params.polygon.push(
			[
				[bounds.getNorthEast().lng(), bounds.getNorthEast().lat()],
				[bounds.getNorthEast().lng(), bounds.getSouthWest().lat()],
				[bounds.getSouthWest().lng(), bounds.getSouthWest().lat()],
				[bounds.getSouthWest().lng(), bounds.getNorthEast().lat()],
				[bounds.getNorthEast().lng(), bounds.getNorthEast().lat()]
			]
		);

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

				//Update state
				self.setState({ 
					locations: self.state.locations.concat(response.data),
				});
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
		var self = this,
			since = window.sessionStorage.location_since ? JSON.parse(window.sessionStorage.location_since) : {};

		$.ajax({
			url: '/api/outlet/location/list?since=' + encodeURIComponent(JSON.stringify(since)),
			method: 'GET',
			success: function(response){

				console.log(response);

				if (response.err || !response.data)
					return this.error(null, null, response.err);
				
				//Loop through and add all the `since` data from the response
				response.data.forEach(function(location){
					if (!since[location._id])
						since[location._id] = Date.now();
				});

				//Update state
				self.setState({ locations: response.data });
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
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
		}
		//Set the passed notif type to true
		params[notifType] = e.target.checked;

		$.ajax({
			url: '/scripts/outlet/location/update',
			method: 'post',
			data: params,
			success: function(response){
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
			<div className="card outlet-locations">
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

		if(locations.length == 0){
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