import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import every from 'lodash/every';

import * as notificationSettings from 'app/redux/actions/notificationSettings';

/**
 * Outlet notifications component for managing notification settings
 */
class Notifications extends React.Component {

	static propTypes = {
	    notificationSettings: PropTypes.array,
	    loadNotifications: PropTypes.func
	};

	componentDidUpdate(prevProps, prevState) {
		//Need to init everytime because of the checkboxes
		$.material.init();
	}

	componentDidMount() {
		//Retrieve notifications
		this.props.loadNotifications();
	}

	/**
	 * Updates specific notification by event key, or all locations if no index is passed
	 * @param {String} option The option that is being modified
	 * @param {Integer} index The index of the notificaton object to find in the array of notifs
	 */
	updateNotification = (option, index = null) => (e) => {
		this.props.updateNotification(option, index, e);
	};

	/**
	 * Checks if a setting is applied to all notificaiton settings
	 * @param  {String} setting The setting to check
	 * @return {Bool} Yes if all are check, no if not
	 */
	allSelected = (setting) => {
		for (var i = 0; i < this.props.notificationSettings.length; i++) {
			let notifSetting = this.props.notificationSettings[i];

			//Check if the option exist first, and if it's set
			if(notifSetting.options.hasOwnProperty(setting) && !notifSetting['options'][setting]) {
				return false;
			}
		}

		return true;
	}

	renderNotificationList(notifications) {
	    if (!notifications.length) {
	        return <div className="outlet-locations-container" />;
	    }

	    return (
	        <div className="outlet-notifications-container">
	            <ul className="outlet-notifications">
	                {notifications.map((n, i) => {
	                    return (
	                    	<NotificaitonItem
	                    		key={i}
	                    		index={i}
	                    		notification={n}
	                    		updateNotification={this.updateNotification} />
	                    );
	                })}
	            </ul>
	        </div>
	    );
	}

	render () {
		const { notificationSettings } = this.props;

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

				{this.renderNotificationList(notificationSettings)}

				<div className="footer">
					<div className="notification-options">
						<div className="checkbox check-sms">
							<label>
								<input
									type="checkbox"
									checked={this.allSelected('send_sms')}
									onChange={this.updateNotification('send_sms')} />
							</label>
						</div>

						<div className="checkbox check-email">
							<label>
								<input
									type="checkbox"
									checked={this.allSelected('send_email')}
									onChange={this.updateNotification('send_email')} />
							</label>
						</div>

						<div className="checkbox check-fresco">
							<label>
								<input
									type="checkbox"
									checked={this.allSelected('send_fresco')}
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

/**
 * Single notification item
 */
const NotificaitonItem = ({ notification, updateNotification, index }) => {
	const { title, description, options} = notification;

	return (
		<li className="notification">
			<div className="info">
				<p className="title">{title}</p>

				<span className="description">{description}</span>
			</div>

			<div className="notification-options form-group-default">
				<div className="checkbox check-sms">
					<label>
						<input
							type="checkbox"
							disabled={!options.hasOwnProperty('send_sms')}
							checked={options.send_sms || false}
							onChange={updateNotification('send_sms', index)} />
					</label>
				</div>

				<div className="checkbox check-email">
					<label>
						<input
							type="checkbox"
							disabled={!options.hasOwnProperty('send_email')}
							checked={options.send_email || false}
							onChange={updateNotification('send_email', index)} />
					</label>
				</div>

				<div className="checkbox check-fresco">
					<label>
						<input
							type="checkbox"
							disabled={!options.hasOwnProperty('send_fresco')}
							checked={options.send_fresco || false}
							onChange={updateNotification('send_fresco', index)} />
					</label>
				</div>
			</div>
		</li>
	);
}

Notifications.defaultProps = {
	notificationSettings: []
}

const mapStateToProps = (state) => {
    return {
        ui: state.ui,
        notificationSettings: state.notificationSettings
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        receiveNotifications: (notifications) => {
            dispatch(notifications)
        },
        loadNotifications: () => {
            dispatch(notificationSettings.loadNotifications());
        },
        updateNotification: (option, index, e) => {
            dispatch(notificationSettings.updateNotification(option,index,e))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
