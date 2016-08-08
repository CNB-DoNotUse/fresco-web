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
			avatar: props.user.avatar || utils.defaultAvatar,
			user: props.user
		}
		
		this.updateSettings = this.updateSettings.bind(this);
		this.updateInfo = this.updateInfo.bind(this);
		this.updateAvatar = this.updateAvatar.bind(this);
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

	clickProfileImgInput() {
 		this.refs.avatarFileInput.click();
 	}

	/**
	 * Sends update to API
	 */
 	updateSettings() {
 		if(this.updating) return;

 		const avatarFiles = this.refs['avatarFileInput'].files;
 		const params = {
 			full_name: this.refs.name.value,
 			bio: this.refs.bio.value,
 			email: this.refs.email.value,
 			phone: this.refs.phone.value == '' ? null : this.refs.phone.value
 		}

 		//Check if objects aren't the same
 		if(!utils.compareObjects(params, this.props.user)) {
 		    this.updateInfo(avatarFiles, params);
 		} else {
 		    if(avatarFiles.length) {
 		        this.updateAvatar(avatarFiles);
 		    } else {
 		        return $.snackbar({ content: 'Trying making a few changes to your user, then try saving!' });
 		    }
 		}
 	}

 	updateInfo(avatarFiles, params) {
 		if(utils.isEmptyString(params.full_name)){
 			return $.snackbar({ content: 'You must have a name!' });
 		} else if(utils.isEmptyString(params.email)){
 			return $.snackbar({ content: 'You must have an email!' });
 		}

 		this.updating = true;

 		$.ajax({
 		    url: "/api/user/update",
 		    method: 'POST',
 		    data: JSON.stringify(params),
 		    contentType: 'application/json',
 		    beforeSend: (xhr) => {
 		        xhr.setRequestHeader('TTL', '0');
 		    }
 		})
 		.done((response) => {
 		    if(avatarFiles.length) {
 		        this.updateAvatar(avatarFiles, true);
 		    } else {
 		        this.setState({ user: response });
 		        return $.snackbar({ content: 'Your info has been successfully saved!' });
 		    }
 		})
 		.fail((error) => {
 		    return $.snackbar({ content: utils.resolveError(error, 'There was an error updating your information!') });
 		})
 		.always(() => {
 			this.updating = false;
 		})
 	}

 	/**
 	 * Updates the outlet's avatar
 	 * @param  {BOOL} calledWithInfo Context for the error message
 	 */
 	updateAvatar(avatarFiles, calledWithInfo) {
 	    let files = new FormData();
 	    files.append('avatar', avatarFiles[0]);
 	    this.updating = true;

 	    $.ajax({
 	        url: "/api/user/avatar",
 	        method: 'POST',
 	        data: files,
 	        contentType: false,
 	        processData: false,
 	        beforeSend: (xhr) => {
 	            xhr.setRequestHeader('TTL', '0');
 	        }
 	    })
 	    .done((response) => {
 	        return $.snackbar({ 
 	            content: `Your ${calledWithInfo ? 'info' : 'avatar'} has been successfully updated!`
 	        });
 	    })
 	    .fail((error) => {
 	        return $.snackbar({ content: utils.resolveError(error, 'There was an error updating your avatar!') });
 	    })
 	    .always(() => {
 	    	this.updating = false;
 	    })
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