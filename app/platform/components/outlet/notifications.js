import React from 'react';
import utils from 'utils';
import every from 'lodash/every';

/**
 * Outlet notifications component for managing notification settings
 */
class Notifications extends React.Component {

	state = {
		notifications: []
	}

	componentDidUpdate(prevProps, prevState) {
		//Need to init everytime because of the checkboxes
		$.material.init();
	}

	componentDidMount() {
		//Retrieve notifications
		this.loadNotifications();
	}

	/**
	 * Updates specific notification by event key, or all locations if no index is passed
	 * @param {String} option The option that is being modified
	 * @param {Integer} index The index of the notificaton object to find in the array of notifs
	 */
	updateNotification = (option, index = null) => (e) => {
		const singleNotification = index !== null;
		let params = {};
		let notifications = _.cloneDeep(this.state.notifications);
		let oldNotifications = _.cloneDeep(this.state.notifications);

		if(singleNotification) {
		    notifications[index].options[option] = e.target.checked;

		    params = { 
		    	[notifications[index].type] : {
		    		[option]: e.target.checked
		    	} 
		    }
		} else {
			for (let notif of notifications) {
		        notif['options'][option] = e.target.checked;
		        params[notif.type] = {
		        	[option]: e.target.checked
		        }
			}
		}

		//Set new notifications, failure will set back to original state
		this.setState({ notifications });

		$.ajax({
		    url: '/api/user/settings/update',
		    method: 'post',
		    contentType: 'application/json',
		    dataType: 'json',
		    data: JSON.stringify(params),
		})
		.fail((xhr, status, error) => {
		    //Set back due to failure
		    this.setState({
		        notifications: oldNotifications
		    });

		    $.snackbar({ content: 'We\'re unable to update your notifications at the moment! Please try again in a bit.' });
		});
	}

	/**
	 * Loads notifications for the outlet
	 */
	loadNotifications = () => {
		$.ajax({ 
		    url: '/api/user/settings',
		    data: {
		    	types_like: 'notify-outlet%'
		    }
		})
		.done((res) => {
		    this.setState({ notifications: res });
		});
	}


	render () {
		const { notifications } = this.state;

		return (
			<div className="card settings-outlet-notifications">
				<div className="header">
					<span className="title">NOTIFICATIONS</span>

					<div className="labels">
						<span>SEND VIA:</span>
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
									checked={every(notifications, 'options.send_sms')}
									onChange={this.updateNotification('send_sms')} />
							</label>
						</div>

						<div className="checkbox check-email">
							<label>
								<input
									type="checkbox"
									checked={every(notifications, 'options.send_email')}
									onChange={this.updateNotification('send_email')} />
							</label>
						</div>

						<div className="checkbox check-fresco">
							<label>
								<input
									type="checkbox"
									checked={every(notifications, 'options.send_fresco')}
									onChange={this.updateNotification('send_fresco')} />
							</label>
						</div>
					</div>

					<span className="sub-title">SELECT ALL:</span>
				</div>
			</div>
		)
	}
}

const OutletNotificationsList = ({ notifications, updateNotification }) => (
	<div className="outlet-notifications-container">
		<ul className="outlet-notifications">
			{notifications.map((notification, i) => {
				const { options, type } = notification;

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
										checked={options.send_sms || false}
										onChange={updateNotification('send_sms', i)} />
								</label>
							</div>

							<div className="checkbox check-email">
								<label>
									<input
										type="checkbox"
										checked={options.send_email || false}
										onChange={updateNotification('send_email', i)} />
								</label>
							</div>

							<div className="checkbox check-fresco">
								<label>
									<input
										type="checkbox"
										checked={options.send_fresco || false}
										onChange={updateNotification('send_fresco', i)} />
								</label>
							</div>
						</div>
					</li>
				)
			})}
		</ul>
	</div>	
);


export default Notifications;