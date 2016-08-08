import utils from 'utils';

/**
 * Join prototype object
 */
let Join = function(){
	this.form = document.getElementById('join-form');
	this.emailField = document.getElementById('join-email');
	this.passwordField = document.getElementById('join-password');
	this.accountType = document.getElementById('join-account-type');
	this.nameField = document.getElementById('join-name');
	this.phoneField = document.getElementById('join-phone');
	this.disabled = false;
	this.submit = document.getElementById('join_submit');
	this.loader = document.getElementById('join-loader');
	
	this.processing = false;

	return this;
};

/**
 * Init function
 */
Join.prototype.init = function() {
	this.form.addEventListener('submit', this.handleForm.bind(this));
}

/**
 * Handles form submission
 */
Join.prototype.handleForm = function(e) {
	e.preventDefault();

	if(this.processing) return;

	this.processing = true;

	if(this.accountType.dataset.option == 'New Account'){
		this.registerUser();
	} else if(this.accountType.dataset.option == 'Existing Account'){
		this.acceptInvite();
	}
}

/**
 * Re-enables form
 * @return {[type]} [description]
 */
Join.prototype.reEnable = function() {
	this.processing = false;
	this.loader.style.display = 'none';
	this.submit.value = 'JOIN';
}

/**
 * Registers the user with a new profile
 */
Join.prototype.registerUser = function() {
	this.submit.value = '';
	this.loader.style.display = 'block';

	const params = {
		full_name : this.nameField.value,
		username : name,
		email : this.emailField.value,
		password : this.passwordField.value,
		phone : this.phoneField.value,
		outlet: {
			token
		}
	};

	//Check all fields for input
	for (let key in params){
		if(!/\S/.test(params[key])){
			this.reEnable();

			if(key == 'firstname' || key == 'lastname'){
				return $.snackbar({ content: 'Please enter a first and last name!' });
			}
			else {
				return $.snackbar({ content: 'Please enter all fields!' });
			}
		}
	}

	$.ajax({
		method: "POST",
		url: "/scripts/user/register",
		data: params,
		success: function(response) {
			if (response.err)
				return this.error(null, null, response.err);
			
			window.location.replace('/archive');
		},
		error: (xhr, status, error) => {
			$.snackbar({content: resolveError(error)});
		},
		complete: (jqXHR, textStatus) => {

			this.reEnable();
		}
	});
}

/**
 * Accepts invitation, does not register
 */
Join.prototype.acceptInvite = function() {
	this.submit.value = '';
	this.loader.style.display = 'block';

	const params = {
		accept: {
			password: this.passwordField.value,
			username: this.emailField.value,
			token
		},
		updates: {}
	};

	if(!utils.isEmptyString(this.nameField.value)){
		updates.full_name = this.nameField.value
	}
	if(!utils.isEmptyString(this.phoneField.value)){
		updates.phone = this.phoneField.value
	}

	if(utils.isEmptyString(params.accept.password)){
		this.reEnable();
		return $.snackbar({ content: 'Please enter in a password!' });
	} else if(utils.isEmptyString(params.accept.email)){
		this.reEnable();
		return $.snackbar({ content: 'Please enter in an email!' });
	}

	$.ajax({
 	    url: "/scripts/outlet/invite/accept",
		data: JSON.stringify(params),
		method: "POST",
		contentType: 'application/json'
 	})
 	.done((response) => {
		window.location.replace('/archive');
 	})
 	.fail((error) => {
 	    this.reEnable();

 	    $.snackbar({content: resolveError(error)});
 	});
}

function resolveError(err) {
	switch(err){
		case 'ERR_EMAIL_TAKEN':
			return 'There is already an account with this email! Please use another one.'
		case 'ERR_INVALID_EMAIL':
			return 'Please enter a valid email!'
		case 'ERR_INVALID_EMAIL_MATCH':
			return 'Please use the email you were invited from to join this outlet, or choose the option to create a new account.'
		case 'ERR_INVALID_PHONE':
			return 'Please enter a valid phone number!'
		case 'ERR_USER_IS_MEMBER':
			return 'You\'re already a member of this outlet!'
		case 'ERR_UNAUTHORIZED':
		case 'ERR_INVALID_LOGIN':
		case 'Unauthorized':
			return 'Invalid email or password!'
	    default:
	        return 'An error occured! Please try again in a bit.'   
	}
}

module.exports = Join;