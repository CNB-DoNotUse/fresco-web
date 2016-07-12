import React from 'react'
import utils from 'utils'

export default class OutletNotifications extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			notifications: []
		}

		this.loadNotifications = this.loadNotifications.bind(this);
		this.updateAllNotifications = this.updateAllNotifications.bind(this);
		this.updateNotification = this.updateNotification.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		//Need to init everytime because of the fucking checkboxes
		$.material.init();  
	}

	componentDidMount() {
		//Retrieve notifications
		this.loadNotifications();
	}

	updateAllNotifications(medium, e) {
		var self = this,
			params = {
				medium: medium,
				enabled: e.target.checked
			},
			stateNotifications = this.state.notifications;

		// Update all notifications setting in state, 
		// if update fails, loadLocations will revert the check on ajax response
		for (let notification of stateNotifications) {
			notification.medium[medium] = e.target.checked;
		}

		this.setState({
			notifications: stateNotifications
		});


		$.ajax({
			url: '/api/notification/settings/update/all',
			method: 'post',
			data: params,
			success: function(response) {
				if (response.err)
					return this.error(null, null, response.err);

				//Run update to get latest data and update the checkboxes
				self.loadNotifications();
			},
			error: (xhr, status, error) => {
				$.snackbar({
					content: utils.resolveError(error, 'We ran into an error updating your notifications! Please try again in a bit.')
				});
			}
		});
	}

	/**
	 * Updates specific notficaiton by event key
	 */
	updateNotification(event_type, medium, e) {
		var self = this,
			params = {
				event_type: event_type,
				medium: medium,
				enabled: e.target.checked
			};

		var stateNotifications = this.state.notifications;
		// Update notification setting in state, 
		// if update fails, loadLocations will revert the check
		for (let notification of stateNotifications) {
			if(notification.event_type == event_type) {

				notification.medium[medium] = e.target.checked;

				this.setState({
					notifications: stateNotifications
				});

				break; // Break ya legs
			}
		}

		$.ajax({
			url: '/api/notification/settings/update',
			method: 'post',
			data: params,
			success: function(response) {
				if (response.err)
					return this.error(null, null, response.err);

				//Run update to get latest data and update the checkboxes
				self.loadNotifications();
			},
			error: (xhr, status, error) => {
				$.snackbar({content: utils.resolveError(error)});
			}
		});
	}

	/**
	 * Loads notifications for the outlet
	 */
	loadNotifications(){
		var self = this;

		$.ajax({
			url: '/api/notification/settings',
			method: 'GET',
			success: function(response){
				if (response.err || !response.data)
					return this.error(null, null, response.err);

				console.log(response);
				
				//Update state
				self.setState({ notifications: response.data });
			},
			error: (xhr, status, error) => {
				$.snackbar({
					content: utils.resolveError(error,  'We\'re unable to load your notifications at the moment! Please try again in a bit.')
				});
			}
		});
	}

				
	render () {
		var allSms = 1,
			allEmail = 1,
			allFresco = 1;

		for (var i = 0; i < this.state.notifications.length; i++) {
			var notif = this.state.notifications[i];

			if(notif.medium.sms == 0)
				allSms = 0;
			if(notif.medium.email == 0)
				allEmail = 0;
			if(notif.medium.fresco == 0)
				allFresco = 0;
		}


		return (
			<div className="card settings-outlet-notifications">
				<div className="header">
					<span className="title">NOTIFICATIONS</span>

					<div className="labels">
						<span>NOTIFICATIONS:</span>
						<span>SMS</span>
						<span>EMAIL</span>
						<span>FRESCO</span>
					</div>
				</div>

				<OutletNotificationsList 
					notifications={this.state.notifications}
					updateNotification={this.updateNotification} />

				<div className="footer">
					<div className="notification-options">
						<div className="checkbox check-sms">
							<label>
								<input
									type="checkbox"
									checked={allSms}
									onChange={this.updateAllNotifications.bind(this, 'sms')} />
							</label>
						</div>
						
						<div className="checkbox check-email">
							<label>
								<input
									type="checkbox" 
									checked={allEmail}
									onChange={this.updateAllNotifications.bind(this, 'email')} />
							</label>
						</div>
						
						<div className="checkbox check-fresco">
							<label>
								<input
									type="checkbox"
									checked={allFresco}
									onChange={this.updateAllNotifications.bind(this, 'fresco')} />
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

		var notifications = this.props.notifications.map((notification, i) => {
			var medium = notification.medium,
				eventType = notification.event_type;

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
									checked={medium.sms || false}
									onChange={this.props.updateNotification.bind(this, eventType, 'sms')} />
							</label>
						</div>
						
						<div className="checkbox check-email">
							<label>
								<input
									type="checkbox" 
									checked={medium.email || false}
									onChange={this.props.updateNotification.bind(this, eventType, 'email')}/>
							</label>
						</div>
						
						<div className="checkbox check-fresco">
							<label>
								<input
									type="checkbox" 
									checked={medium.fresco || false}
									onChange={this.props.updateNotification.bind(this, eventType, 'fresco')} />
							</label>
						</div>
					</div>
				</li>
			);
		});	
		
		return (
			<div className="outlet-notifications-container">
				<ul className="outlet-notifications">
					{notifications}
				</ul>
			</div>
		)
	}
}
