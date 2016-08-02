import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import TopBar from '../components/topbar'
import QuickSupport from '../components/global/quick-support'
import utils from 'utils'
import _ from 'lodash'
import '../../sass/platform/userSettings.scss';

/**
 * User Settings parent object
 */
class UserSettings extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			avatar: this.props.user.avatar || utils.defaultAvatar,
			user: this.props.user
		}
		
		this.updateSettings = this.updateSettings.bind(this);
		this.avatarInputChange = this.avatarInputChange.bind(this);
		this.clickProfileImgInput = this.clickProfileImgInput.bind(this);
	}

 	/**
 	 * Change listener for file upload input
 	 */
	avatarInputChange(e) {
		const { profileSaveBtn } = this.refs;
		
		if(profileSaveBtn.className.indexOf(' changed ') == -1) {
			profileSaveBtn.className += ' changed ';
		}

		const file = this.refs.avatarFileInput.files[0];
		const reader = new FileReader();

		reader.onloadend = ()=>{
		    this.setState({
		    	avatar: reader.result
		    })
		}

		reader.readAsDataURL(file);
	}

	/**
	 * Sends update to API
	 */
 	updateSettings() {
 		if(this.updating) return;

 		this.updating = true;

 		const userData = new FormData();
 		const user = this.props.user;
 		const full_name = this.refs.name.value;
 		const bio = this.refs.bio.value;
 		const email = this.refs.email.value;
 		const phone = this.refs.phone.value == '' ? null : this.refs.phone.value;
 		const self = this;

 		if(utils.isEmptyString(full_name)){
 			return $.snackbar({ content: 'You must have a name!' });
 		} else if(utils.isEmptyString(email)){
 			return $.snackbar({ content: 'You must have an email!' });
 		}

 		userData.append('id', user.id);
 		userData.append('full_name', full_name);
 		userData.append('bio', bio);
 		userData.append('email', email);
 		userData.append('phone', phone);
 		userData.append('avatar', this.refs.avatarFileInput.files[0]);

 		$.ajax({
 			url: "/api/user/update",
 			type: 'POST',
 			cache: false,
 			processData: false,
 			contentType: false,
 			data : userData,
 			success: function(response, status, xhr) {
 				self.updating = false;

 				if(response.err) {
 					return this.error(null, null, response.err);
	 			} 
	 			else {
	 				$.snackbar({ content: 'Settings successfuly saved!' });

	 				//Update the user
	 				user.firstname = firstname,
	 				user.lastname = lastname,
	 				user.avatar = self.state.avatar;

	 				//Update state, so everything else updates
	 				self.setState({ user: user });
	 			}
 			},
 			error: function(xhr, status, error) {
 				self.updating = false;
 				$.snackbar({
 					content: utils.resolveError(error, 'We couldn\'t save your settings!')
 				});
 			}
 		});
 	}

 	clickProfileImgInput() {
 		this.refs.avatarFileInput.click();
 	}

 	render() {
 		const { user } = this.state

 		console.log(user);

 		return ( 
 			<App user={this.state.user}>
 				<TopBar 
 					title={this.state.user.full_name}
					saveButton={true}
					updateSettings={this.updateSettings} />

				<div className="user-settings">
					<div className="card settings-info">
						
						<div 
							className="avatar" 
							ref="outlet-avatar-image" 
							style={{backgroundImage: 'url(' + this.state.avatar + ')'}} 
						>
							<div className="overlay" onClick={this.clickProfileImgInput}>
								<span className="mdi mdi-upload"></span>
							</div>
						</div>

						<div className="card-form">
							<input 
								type="file" 
								className="outlet-avatar-input changed" 
								ref="avatarFileInput"  
								accept="image/png,image/jpeg" 
								onChange={this.avatarInputChange} 
								multiple={false} />

							<input 
								type="text" 
								className="floating-label" 
								ref="name" 
								placeholder="Name" 
								defaultValue={user.full_name} />
							
							<textarea 
								className="floating-label" 
								ref="bio" 
								rows="2"
								placeholder="Bio" 
								defaultValue={user.bio}>
							</textarea>
							
							<button 
								className="btn btn-save changed" 
								ref="profileSaveBtn" 
								onClick={this.updateSettings}
								>SAVE CHANGES</button>
						</div>
					</div>

					<div className="card settings-user-account">
						<div className="header">
							<span className="title">Account Information</span>
						</div>
						
						<div className="card-form">
							<input 
								type="text" 
								ref="email" 
								placeholder="Email address" 
								defaultValue={user.email} />

							<input 
								type="text" 
								ref="phone" 
								maxLength={15}
								placeholder="Phone number" 
								defaultValue={user.phone} />
		
							<button 
								className="btn btn-save changed" 
								onClick={this.updateSettings} 
								ref="accountSaveBtn">SAVE CHANGES
							</button>
						</div>
					</div>

					<QuickSupport />
				</div>
 			</App>
 		);
 	}
}

class ChangePasswordCard extends React.Component {
	render() {
		return (
			<div className="card">
				<div className="f-card-content full">
					<div className="header">
						<span>Change Password</span>
					</div>
					
					<div className="padding">
						<div className="content-info-input">
							<input 
								type="password" 
								className="form-control floating-label" 
								placeholder="Current password" />
							
							<input 
								type="password" 
								className="form-control floating-label" 
								placeholder="New password" 
							/>
						</div>
						
						<div className="content-info-box">
							<span>New passwords must:</span>
							
							<ul>
								<li>• Be at least 12 characters long</li>
								<li>• Contain at least one number</li>
								<li>• Contain at least one symbol</li>
								<li>• Be entered the same twice</li>
							</ul>
						</div>
					</div>
					
					<button className="btn btn-save">SAVE CHANGES</button>
				</div>
			</div>
		);
	}
}

UserSettings.propTypes = {
    user: PropTypes.object
};

ReactDOM.render(
  	<UserSettings 
  		user={window.__initialProps__.user} 
  		title={window.__initialProps__.title} />,
  	document.getElementById('app')
);