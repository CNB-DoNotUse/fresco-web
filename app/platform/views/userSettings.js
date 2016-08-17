import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app.js';
import TopBar from '../components/topbar';
import QuickSupport from '../components/global/quick-support';
import PasswordDialog from '../components/dialogs/password';
import DynamicInput from '../components/global/dynamic-input';
import utils from 'utils';
import _ from 'lodash';
import '../../sass/platform/user.scss';;

/**
 * User Settings parent object
 */
class UserSettings extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			avatar: props.user.avatar || utils.defaultAvatar,
			user: props.user,
			passwordToggled: false,
			verify_password: null,
			changes: [],
			disabled: true
		}

		this.updateSettings = this.updateSettings.bind(this);
		this.updateInfo = this.updateInfo.bind(this);
		this.updateAvatar = this.updateAvatar.bind(this);
		this.avatarInputChange = this.avatarInputChange.bind(this);
		this.clickProfileImgInput = this.clickProfileImgInput.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		//If the verified password was added, then update the settings
		if(prevState.verify_password === null && this.state.verify_password !== null) {
			this.updateSettings();
		}
	}

	/**
	 * Input change event for tracking changes in state
	 * @param {String} value Value of the field
	 * @param {String} originalValue The original value to compare against
	 * @param {String} source Unique source for tracking changes
	 */
	onInputChange(value, originalValue, source) {
		const { changes } = this.state
		const changed = value !== originalValue;

		if(changed && !changes.includes(source)) {
			this.setState({
				disabled: false,
				changes: changes.concat(source)
			});
		} else if(!changed) {
			if(changes.length <= 1 && changes.includes(source)) {
				this.setState({ 
					disabled: true, 
					changes: []
				});
			} else {			
				this.setState({ 
					changes: changes.filter(change => change !== source)
				});
			}
		}
	}

 	/**
 	 * Change listener for file upload input
 	 */
	avatarInputChange(e) {
		const file = this.refs.avatarFileInput.files[0];
		const reader = new FileReader();

		reader.onloadend = ()=>{
		    this.setState({
		    	avatar: reader.result
		    });

		    this.onInputChange(reader.result, '', 'avatar')
		}

		reader.readAsDataURL(file);
	}

	clickProfileImgInput() {
 		this.refs.avatarFileInput.click();
 	}

	onPasswordSubmit(verify_password) {
		this.setState({
			verify_password,
			passwordToggled: false
		});
	}

	onPasswordToggle() {
		this.setState({
			passwordToggled: !this.state.passwordToggled
		});
	}

	/**
	 * Sends update to API
	 */
 	updateSettings() {
 		if(this.state.disabled) return;

 		const { 
 			avatarFileInput, 
 			name, 
 			bio, 
 			email, 
 			username, 
 			phone 
 		} = this.refs;
 		
 		const avatarFiles = avatarFileInput.files;
 		const params = {
 			full_name: name.value,
 			bio: bio.value,
 			email: email.value,
 			username: username.value
 		}

 		if(!utils.isEmptyString(phone.value)) {
	 		params.phone = this.refs.phone.value;
 		}

 		//Check if objects are the same to prevent hitting user/update, and just avatar update instead
 		if(utils.compareObjects(params, this.state.user)) {
 		    if(avatarFiles.length) {
 		    	this.updateAvatar(avatarFiles);
 		    }
 		} else {
 			//Check if password isn't set
	 		if(!this.state.verify_password) {
		 		return this.setState({
		 			passwordToggled: true
		 		});
	 		}

	 		//Assign to params
	 		//Why not before? so we can compare objects `without` the password
	 		params.verify_password = this.state.verify_password

 			this.updateInfo(avatarFiles, params);
 		}
 	}

 	updateInfo(avatarFiles, params) {
 		if(utils.isEmptyString(params.full_name)){
 			return $.snackbar({ content: 'You must have a name!' });
 		} else if(utils.isEmptyString(params.email)){
 			return $.snackbar({ content: 'You must have an email!' });
 		}

 		this.setState({ disabled: true });

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
 		    	const permissions = this.state.user.permissions;
 		    	response.permissions = permissions;

 		        this.setState({ user: response });

 		        return $.snackbar({ content: 'Your info has been successfully saved!' });
 		    }
 		})
 		.fail((error) => {
 			const { responseJSON: { msg = utils.resolveError(err) } } = error;

 			this.setState({ verify_password: null });

 		    return $.snackbar({ content: msg || 'There was an error updating your information!' });
 		})
 		.always(() => {
 			this.setState({ disabled: false });
 		})
 	}

 	/**
 	 * Updates the outlet's avatar
 	 * @param  {BOOL} calledWithInfo Context for the error message
 	 */
 	updateAvatar(avatarFiles, calledWithInfo) {
 	    let files = new FormData();
 	    files.append('avatar', avatarFiles[0]);
 	    this.setState({ disabled: true });

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
 	    .done(response => {
 	    	const permissions = this.state.user.permissions;
 	    	response.permissions = permissions;

 	    	this.setState({ user: response });

 	        return $.snackbar({
 	            content: `Your ${calledWithInfo ? 'info' : 'avatar'} has been successfully updated!`
 	        });
 	    })
 	    .fail(error => {
 	    	this.setState({ verify_password: null });

 	        return $.snackbar({ 
 	        	content: `There was an error updating your avatar! ${calledWithInfo ? 'But we were able to update your information.' : ''}` 
 	        });
 	    })
 	    .always(() => {
 	    	this.setState({ disabled: false });
 	    })
 	}

 	render() {
 		const { user, disabled } = this.state;

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
								onKeyUp={(e) => this.onInputChange(e.target.value,  user.full_name, 'name')}
								className="floating-label"
								ref="name"
								placeholder="Name"
								defaultValue={user.full_name} />

							<textarea
								className="floating-label"
								onKeyUp={(e) => this.onInputChange(e.target.value, user.bio, 'bio')}
								ref="bio"
								rows="2"
								placeholder="Bio"
								defaultValue={user.bio}>
							</textarea>

							<button
								className={`btn btn-save changed ${disabled ? 'disabled' : ''}`}
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
								onKeyUp={(e) => this.onInputChange(e.target.value, user.email, 'email')}
								placeholder="Email address"
								defaultValue={user.email} />

							<input
								type="text"
								ref="username"
								maxLength={40}
								onKeyUp={(e) => this.onInputChange(e.target.value, user.username, 'username')}
								placeholder="Username"
								defaultValue={user.username} />

							<input
								type="text"
								ref="phone"
								maxLength={15}
								onKeyUp={(e) => this.onInputChange(e.target.value, user.phone, 'phone')}
								placeholder="Phone number"
								defaultValue={user.phone} />

							<button
								className={`btn btn-save changed ${disabled ? 'disabled' : ''}`}
								onClick={this.updateSettings}
								ref="accountSaveBtn">SAVE CHANGES
							</button>
						</div>
					</div>

					<QuickSupport />
				</div>

				<PasswordDialog
					onSubmit={(password) => this.onPasswordSubmit(password)}
					toggle={() => this.onPasswordToggle()}
					toggled={this.state.passwordToggled} />
 			</App>
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