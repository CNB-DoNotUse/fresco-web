import utils from 'utils';

/**
 * Join prototype object
 */
let Join = function(){
	this.form = document.getElementById('join-form');
	this.emailField = document.getElementById('join-email');
	this.passwordField = document.getElementById('join-password');
	this.accountDropdown = document.getElementById('join-account-type');
	this.nameField = document.getElementById('join-name');
	this.usernameField = document.getElementById('join-username');
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

	window.MutationObserver = window.MutationObserver
	    || window.WebKitMutationObserver
	    || window.MozMutationObserver;

	let observer = new MutationObserver((mutations) => {
	    if(mutations[0].attributeName === 'data-option') {
	    	if(this.accountDropdown.dataset.option == 'New Account') {
	    		this.form.className = 'new';
	    	} else if(this.accountDropdown.dataset.option == 'Existing Account'){
	    		this.form.className = 'exists';
	    	}
	    }
	});

	let config = {
	    attributes: true
	};

	// pass in the element you wanna watch as well as the options
	observer.observe(this.accountDropdown, {
	    attributes: true
	});


}

/**
 * Handles form submission
 */
Join.prototype.handleForm = function(e) {
	e.preventDefault();

	if(this.processing) return;

	this.processing = true;

	if(this.accountDropdown.dataset.option == 'New Account'){
		this.registerUser();
	} else if(this.accountDropdown.dataset.option == 'Existing Account'){
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
		email : this.emailField.value,
		username: this.usernameField.value,
		password : this.passwordField.value,
		phone : this.phoneField.value,
		outlet: { token }
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
 	    url: "/scripts/user/register",
			data: JSON.stringify(params),
			method: "POST",
			contentType: 'application/json'
 	})
 	.done((response) => {
		window.location.replace('/archive');
 	})
 	.fail((error) => {
 	  this.reEnable();

 		$.snackbar({content: error.responseJSON.msg});
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
		params.updates.full_name = this.nameField.value
	}
	if(!utils.isEmptyString(this.phoneField.value)){
		params.updates.phone = this.phoneField.value
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

 	    $.snackbar({content: error.responseJSON.msg});
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
