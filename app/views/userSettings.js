import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import TopBar from './../components/topbar'
import QuickSupport from './../components/global/quick-support'
import global from './../../lib/global'

/**
 * User Settings parent object
 */

class UserSettings extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			avatar: this.props.user.avatar || global.defaultAvatar,
			user: this.props.user
		}
		
		this.updateSettings = this.updateSettings.bind(this);
		this.avatarInputChange = this.avatarInputChange.bind(this);
		this.clickProfileImgInput = this.clickProfileImgInput.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
	}

	componentDidMount() {
		$('input, textarea').on('keyup', this.handleInputChange);
	}

	handleInputChange() {

		var newName = this.refs.name.value != (this.props.user.firstname + ' ' + this.props.user.lastname),
			newBio = !global.compareMultiline(this.refs.bio.value, this.props.user.bio),
			newAvatar = this.refs.avatarFileInput.files.length > 0,
			newEmail = this.refs.email.value != this.props.user.email,
			newPhone = this.refs.phone.value != this.props.user.phone;

		var profileSaveBtn = this.refs.profileSaveBtn,
			accountSaveBtn = this.refs.accountSaveBtn;

		if(newName || newBio || newAvatar) {
			if(profileSaveBtn.className.indexOf(' changed ') == -1) {
				profileSaveBtn.className += ' changed ';
				profileSaveBtn.disabled = false;
			}
		} else {
			if(profileSaveBtn.className.indexOf(' changed ') != -1) {
				profileSaveBtn.className = profileSaveBtn.className.replace(/\bchanged\b/,'');
				profileSaveBtn.disabled = true;
			}
		}

		if(newEmail || (newPhone && this.refs.phone.value != '')) {
			if(accountSaveBtn.className.indexOf(' changed ') == -1) {
				accountSaveBtn.className += ' changed ';
				accountSaveBtn.disabled = false;
			}
		} else {
			if(accountSaveBtn.className.indexOf(' changed ') != -1) {
				accountSaveBtn.className = accountSaveBtn.className.replace(/\bchanged\b/,'');
				accountSaveBtn.disabled = true;
			}
		}
	}

 	/**
 	 * Change listener for file upload input
 	 */
	avatarInputChange(e) {
		var profileSaveBtn = this.refs.profileSaveBtn;
		
		if(profileSaveBtn.className.indexOf(' changed ') == -1) {
			profileSaveBtn.className += ' changed ';
		}

		var file = this.refs.avatarFileInput.files[0],
			self = this;

		var reader = new FileReader();

		reader.onloadend = ()=>{
		    this.setState({
		    	avatar: reader.result
		    })
		}

		reader.readAsDataURL(file);
	}

	/**
	 * Sends update to user
	 */
 	updateSettings() {

 		console.log('test yo');

 		if(this.updating) return;
 		
 		this.updating = true;

 		var userData = new FormData(),
 			user = this.props.user,
 			id = user._id,
 			name = this.refs.name.value.split(' '),
 			firstname = name[0],
 			lastname = name.slice(1).join(' '),
 			bio = this.refs.bio.value,
 			email =  this.refs.email.value,
 			phone =  this.refs.phone.value,
 			self = this;

 		if(global.isEmptyString(firstname)){
 			$.snackbar({ content: 'You must have a firstname!' });
 			return
 		}
 		else if (global.isEmptyString(lastname)){
 			$.snackbar({ content: 'You must have a lastname!' });
 			return
 		}
 		else if(global.isEmptyString(email)){
 			$.snackbar({ content: 'You must have an email!' });
 			return;
 		}

 		userData.append('id', id);
 		userData.append('firstname', firstname);
 		userData.append('lastname', lastname);
 		userData.append('bio', bio);
 		userData.append('email', email);
 		userData.append('phone', phone);
 		userData.append('avatar', this.refs.avatarFileInput.files[0]);

 		$.ajax({
 			url: "/scripts/user/update",
 			type: 'POST',
 			cache: false,
 			processData: false,
 			contentType: false,
 			data : userData,
 			success: function(response, status, xhr) {
 				self.updating = false

 				if(response.err) {
	 				
	 				$.snackbar({
	 					content: global.resolveError(response.err, 'We couldn\'t save your settings!')
	 				});

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
 			}
 		});
 	}

 	clickProfileImgInput() {
 		this.refs.avatarFileInput.click();
 	}

 	render() {

 		var user = this.state.user,
 			removeButton = <button className="btn btn-danger">DELETE ACCOUNT</button>;

 		return ( 
 			<App user={this.state.user}>
 				<TopBar 
 					title={this.state.user.firstname + ' ' + this.state.user.lastname}
					saveButton={true}
					updateSettings={this.updateSettings} />

				<div className="user-settings">
					<div className="card settings-info">
						
						<div className="avatar" ref="outlet-avatar-image" style={{backgroundImage: 'url(' + this.state.avatar + ')'}} >
							<div className="overlay" onClick={this.clickProfileImgInput}>
								<span className="mdi mdi-upload"></span>
							</div>
						</div>

						<div className="card-form">
							<input 
								type="file" 
								className="outlet-avatar-input" 
								ref="avatarFileInput"  
								accept="image/png,image/jpeg" 
								onChange={this.avatarInputChange} 
								multiple />

							<input 
								type="text" 
								className="floating-label" 
								ref="name" 
								placeholder="Name" 
								defaultValue={user.firstname + ' ' + user.lastname} />
							
							<textarea 
								className="floating-label" 
								ref="bio" 
								rows="2"
								placeholder="Bio" 
								defaultValue={user.bio}></textarea>
							
							<button 
								className="btn btn-flat" 
								ref="profileSaveBtn" 
								onClick={this.updateSettings}
								disabled={true}>SAVE CHANGES</button>
						</div>
					</div>

					<div className="card settings-user-account">
							<div className="header">
								<span className="title">Account Information</span>
							</div>
							
							<div className="card-form">
								<input 
									type="text" 
									ref="email" placeholder="Email address" 
									defaultValue={user.email} />

								<input 
									type="text" 
									ref="phone" 
									placeholder="Phone number" 
									defaultValue={user.phone} />
			
								<button 
									className="btn btn-save" 
									onClick={this.updateSettings} 
									ref="accountSaveBtn">SAVE CHANGES</button>
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
							<input type="password" className="form-control floating-label" placeholder="Current password" />
							
							<input type="password" className="form-control floating-label" placeholder="New password" />
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

ReactDOM.render(
  	<UserSettings 
  		user={window.__initialProps__.user} 
  		purchases={window.__initialProps__.purchases} 
  		title={window.__initialProps__.title} />,
  	document.getElementById('app')
);