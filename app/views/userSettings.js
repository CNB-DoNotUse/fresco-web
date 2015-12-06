import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import TopBar from './../components/topbar'
import global from './../../lib/global'

/**
 * Story Detail Parent Object, made of a side column and PostList
 */

class UserSettings extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			avatar: this.props.user.avatar || global.defaultAvatar,
			user: this.props.user
		}
		this.updateSettings = this.updateSettings.bind(this);
		this.fileChanged = this.fileChanged.bind(this);
	}

 	render() {

 		return (
 			<App user={this.state.user}>
 				<TopBar 
 					title={this.state.user.firstname + ' ' + this.state.user.lastname}
					saveButton={true}
					updateSettings={this.updateSettings} />

				<div className="settings">
					<div className="col-xs-12 col-sm-6 col-md-4 col-md-offset-2 form-group-default">
						<div className="flex-row">
							<img 
								id="avatar" 
								className="img-circle" 
								src={this.state.avatar} />
							
							<div className="flexy">
								<input
									type="text" 
									readOnly={true}
									className="form-control floating-label" 
									placeholder="Profile image" />
								
								<input 
									type="file" 
									onChange={this.fileChanged}
									ref="avatarFileInput"
									id="user-profile-file" />
							</div>
						</div>
						<div className="flex-row">
							<div className="flexy">
								<input 
									type="text" 
									ref="firstname" 
									className="form-control floating-label"
									placeholder="First name"
									defaultValue={this.state.user.firstname} />
							</div>
							
							<div className="flexy">
								<input 
									type="text" 
									ref="lastname" 
									className="form-control floating-label"
									placeholder="Last name"
									defaultValue={this.state.user.lastname} />
							</div>
						</div>
					</div>

					<div className="col-xs-12 col-sm-6 col-md-4 form-group-default">
						<input 
							type="text" 
							ref="email" 
							className="form-control floating-label" 
							placeholder="Email address"
							defaultValue={this.state.user.email} />
					</div>
				</div>
 			</App>
 		);

 	}

 	/**
 	 * Change listener for file upload input
 	 */
 	fileChanged(e) {
	
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

 		var userData = new FormData(),
 			user = this.props.user,
 			id = user._id,
 			firstname = this.refs.firstname.value,
 			lastname = this.refs.lastname.value,
 			email =  this.refs.email.value
 			self = this;

 		console.log(user);

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
 		userData.append('email', email);
 		userData.append('avatar', this.refs.avatarFileInput.files[0]);
 			
 		console.log(userData);

 		$.ajax({
 			url: "/scripts/user/update",
 			type: 'POST',
 			cache: false,
 			processData: false,
 			contentType: false,
 			data : userData,
 			success: function(response, status, xhr){
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


}

ReactDOM.render(
  	<UserSettings 
  		user={window.__initialProps__.user} 
  		purchases={window.__initialProps__.purchases} 
  		title={window.__initialProps__.title} />,
  	document.getElementById('app')
);