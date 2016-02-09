var form = document.getElementById('join-form'),
	emailField = document.getElementById('join-email'),
	passwordField = document.getElementById('join-password'),
	accountType = document.getElementById('join-account-type'),
	nameField = document.getElementById('join-name'),
	phoneField = document.getElementById('join-phone'),
	disabled = false;

form.addEventListener('submit', function(e) {

	e.preventDefault();

	if(disabled) return;

	disabled = true;

	if(accountType.dataset.option == 'New Account'){
		registerUser();
	} else if(accountType.dataset.option == 'Existing Account'){
		acceptInvite();
	}

});


function registerUser() {

	var name = nameField.value.split(' '),
		params = {
			firstname : name[0],
			lastname  : name.slice(1).join(' '),
			email     : emailField.value,
			password  : passwordField.value,
			phone     : phoneField.value,
			token	  : token
		};

	//Check all fields for input
	for (var key in params){
		if(!/\S/.test(params[key])){
			
			disabled = false;

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
		error: function(xhr, status, error) {
			$.snackbar({content: resolveError(error)});
		},
		complete: function(jqXHR, textStatus) {

			disabled = false;
		}
	});

}

function acceptInvite(){
	var params = {
			password: passwordField.value,
			token: token,
			email: emailField.value
		};

	if(!/\S/.test(params.password)){
		disabled = false;
		return $.snackbar({ content: 'Please enter in a password!' });
	} else if(!/\S/.test(params.email)){
		disabled = false;
		return $.snackbar({ content: 'Please enter in an email!' });
	}
		
	$.ajax({
		url: "/scripts/outlet/invite/accept",
		data: params,
		method: "POST",
		success: function(response){
			if (response.err)
				return this.error(null, null, response.err);
			
			window.location.replace('/archive');
		},
		error: function(xhr, status, error){
			$.snackbar({content: resolveError(error)});
		},
		complete: function(jqXHR, textStatus) {
			disabled = false;
		}
	});
}

function resolveError(err) {
	switch(err){
		case 'ERR_EMAIL_TAKEN':
			return 'This email is taken! Please use another one.'
		case 'ERR_INVALID_EMAIL':
			return 'Please enter a valid email!'
		case 'ERR_INVALID_EMAIL_MATCH':
			return 'Please use the email you were invited from to join this outlet, or choose the option to create a new account.'
		case 'ERR_INVALID_PHONE':
			return 'Please enter a valid phone number!'
		case 'ERR_UNAUTHORIZED':
		case 'ERR_INVALID_LOGIN':
		case 'Unauthorized':
			return 'Invalid email or password!'
	    default:
	        return 'An error occured! Please try again in a bit.'   
	}
}
