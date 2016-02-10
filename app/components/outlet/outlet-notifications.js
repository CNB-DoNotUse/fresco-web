import React from 'react'
import global from '../../../lib/global'

export default class OutletNotifications extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			notifications: []
		}
		this.loadNotifications = this.loadNotifications.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		//Need to init everytime because of the fucking checkboxes
		$.material.init();  
	}

	componentDidMount() {
		//Retrieve notifications
		this.loadNotifications();
	}

	updateAllNotifications(event_type, medium, e) {



	}

	/**
	 * Updates specific notficaiton by event key
	 */
	updateNotification(event_type, medium, e) {
		var self = this,
			params = {
				event_type: event_type,
				mediun: medium,
				active: e.target.checked
			};

		var stateNotifications = this.state.notifications;

		// Update notification setting in state, 
		// if update fails, loadLocations will revert the check
		for (let notification of stateNotifications) {
			if(notification.event_type == event_type) {

				stateNotifications.settings[medium] = e.target.checked;

				this.setState({
					locations: stateLocations
				});

				break; // Break ya legs
			}
		}

		$.ajax({
			url: '/api/notification/update',
			method: 'post',
			data: params,
			success: function(response) {
				if (response.err)
					return this.error(null, null, response.err);

				//Run update to get latest data and update the checkboxes
				self.loadNotifications();
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
			}
		});

	}

	/**
	 * Loads locations for the outlet
	 */
	loadNotifications(){
		//`since` is the last time they've seen the locations page,
		//eitehr grabbed from location storage, or defaults to the current timestamp
		var self = this;

		$.ajax({
			url: '/api/notifications/settings',
			method: 'GET',
			success: function(response){
				if (response.err || !response.data)
					return this.error(null, null, response.err);
				
				//Update state
				self.setState({ notifications: response.data });
			},
			error: (xhr, status, error) => {
				$.snackbar({
					content: global.resolveError(error,  'We\'re unable to load your notifications at the moment! Please try again in a bit.')
				});
			}
		});
	}

				
	render () {
		return (
			<div className="card settings-outlet-locations">
				<div className="header">
					<span className="title">NOTIFICATIONS</span>

					<div className="labels">
						<span>NOTIFICATIONS:</span>
						<span>SMS</span>
						<span>EMAIL</span>
						<span>FRESCO</span>
					</div>
				</div>


				<div className="footer">
					<div className="location-options">
						<div className="checkbox check-sms">
							<label>
								<input
									ref="location-sms-check"
									type="checkbox"
									onChange={this.props.updateNotification.bind(this, notification.eventType, 'notify_email')} />
							</label>
						</div>
						
						<div className="checkbox check-email">
							<label>
								<input
									ref="location-email-check"
									type="checkbox" 
									onChange={this.props.updateNotification.bind(this, notification.eventType, 'notify_email')} />
							</label>
						</div>
						
						<div className="checkbox check-fresco">
							<label>
								<input
									ref="location-fresco-check"
									type="checkbox"
									onChange={this.props.updateNotification.bind(this, notification.eventType, 'notify_email')} />
							</label>
						</div>
					</div>

					<span className="sub-title">SELECT ALL:</span>
				</div>
			</div>
		)
	}
}

class OutletNotificationsList extends React.Component {

	render () {

		var notifications = this.props.notification.map((notification, i) => {

			var settings = notification.medium,
				eventType = notification.event_type;

			unseenCount = global.isPlural(unseenCount) ? unseenCount + ' unseen items' : unseenCount + ' unseen item';
			
			return(
				<li className="notification" key={i}>
					<div className="info">
						<p className="title">{notification.title}</p>
						
						<span className="description">{notification.description}</span>
					</div>

					<div className="notification-options form-group-default">
						<div className="checkbox check-sms">
							<label>
								<input
									type="checkbox" 
									checked={settings.sms || false}
									onChange={this.props.updateNotification.bind(this, notification.eventType, 'notify_sms')} />
							</label>
						</div>
						
						<div className="checkbox check-email">
							<label>
								<input
									type="checkbox" 
									checked={settings.email || false}
									onChange={this.props.updateNotification.bind(this, notification.eventType, 'notify_email')}/>
							</label>
						</div>
						
						<div className="checkbox check-fresco">
							<label>
								<input
									type="checkbox" 
									checked={settings.fresco || false}
									onChange={this.props.updateNotification.bind(this, notification.eventType, 'notify_fresco')} />
							</label>
						</div>
					</div>
				</li>
			);
		});	

		if(locations.length == 0) {
			return (
				<div className="outlet-locations-container"></div>
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
