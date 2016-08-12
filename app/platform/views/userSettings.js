import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import TopBar from '../components/topbar'
import QuickSupport from '../components/global/quick-support'
import PasswordDialog from '../components/dialogs/password'
import utils from 'utils'
import _ from 'lodash'
import '../../sass/platform/user.scss';

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
			saving: false
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

	onPasswordSubmit(verify_password) {
		this.setState({
			verify_password,
			passwordToggled: false
		});
	}

	onPasswordToggle() {
		this.setState({
			passwordToggled: !this.state.passwordToggled
		})
	}

	/**
	 * Sends update to API
	 */
 	updateSettings() {
 		if(this.state.saving) return;

 		const avatarFiles = this.refs['avatarFileInput'].files;
 		const params = {
 			full_name: this.refs.name.value,
 			bio: this.refs.bio.value,
 			email: this.refs.email.value,
 			username: this.refs.username.value
 		}

 		if(this.refs.phone.value !== '') {
	 		params.phone = this.refs.phone.value;
 		}

 		//Check if objects are the same
 		if(utils.compareObjects(params, this.props.user)) {
 		    if(avatarFiles.length) {
 		    	this.updateAvatar(avatarFiles);
 		    } else {
 		    	return $.snackbar({ content: 'Trying making a few changes to your user, then try saving!' });
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

 		this.setState({ saving: true });

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

 		        this.setState({
 		        	user: response,
 		        	verify_password: null
 		        });

 		        return $.snackbar({ content: 'Your info has been successfully saved!' });
 		    }
 		})
 		.fail((error) => {
 			const { responseJSON: { msg = utils.resolveError(err) } } = error;

 		    return $.snackbar({ content: msg || 'There was an error updating your information!' });
 		})
 		.always(() => {
 			this.setState({ saving: false });
 		})
 	}

 	/**
 	 * Updates the outlet's avatar
 	 * @param  {BOOL} calledWithInfo Context for the error message
 	 */
 	updateAvatar(avatarFiles, calledWithInfo) {
 	    let files = new FormData();
 	    files.append('avatar', avatarFiles[0]);
 	    this.setState({ saving: true });

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

 	    	this.setState({
 	    		user: response,
 	    		verify_password: null
 	    	});

 	        return $.snackbar({
 	            content: `Your ${calledWithInfo ? 'info' : 'avatar'} has been successfully updated!`
 	        });
 	    })
 	    .fail(error => {
 	        return $.snackbar({ content: utils.resolveError(error, 'There was an error updating your avatar!') });
 	    })
 	    .always(() => {
 	    	this.setState({ saving: false });
 	    })
 	}

 	render() {
 		const { user, saving } = this.state;

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
								className={`btn btn-save changed ${saving ? 'disabled' : ''}`}
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
								ref="username"
								maxLength={40}
								placeholder="Username"
								defaultValue={user.username} />

							<input
								type="text"
								ref="phone"
								maxLength={15}
								placeholder="Phone number"
								defaultValue={user.phone} />

							<button
								className={`btn btn-save changed ${saving ? 'disabled' : ''}`}
								onClick={this.updateSettings}
								ref="accountSaveBtn">SAVE CHANGES
							</button>
						</div>
					</div>

					<QuickSupport />
				</div>

				<PasswordDialog
					onSubmit={this.onPasswordSubmit.bind(this)}
					toggle={this.onPasswordToggle.bind(this)}
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
