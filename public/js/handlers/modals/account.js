var accountModal = document.getElementById('_account'),
	presentation = document.getElementById('_presentation'),
	login = document.getElementById('_login'),
	signup = document.getElementById('_signup'),
	signUpFormHeader = document.getElementById('_signup-form-header'),
	loginFormHeader = document.getElementById('_login-form-header'),
	signUpLoader = document.getElementById('signup-loader'),
	loginLoader = document.getElementById('login-loader'),
	signUpForm = document.querySelector('#signupForm');
	loginForm = document.querySelector('#loginForm'),
	loginButton = document.querySelector('#login-password');

//Grab the `h3` tag out of the header div so we can hide the text to show the spinner
var signUpHeaderText = signUpFormHeader.children[0],
	loginHeaderText = loginFormHeader.children[0];

//State vars to disable signup/login after clicking
var signupProcessing = false,
	loginProcessing = false;

//Run on load
updatePosition(window.innerWidth);

window.addEventListener('resize', function() {

	updatePosition(window.innerWidth);

});

loginForm.addEventListener('submit', processLogin);
loginButton.addEventListener('keydown', function (e) {

	if(e.keyCode == 13) {
		processLogin();
	}
});

signUpForm.addEventListener('submit', processSignup);

signUpFormHeader.addEventListener('click', function() {

	if(signUpForm.style.display == 'none' || signUpForm.style.display == ''){
		
		//Check if we're in a deskptop view to adjust the top margin
		if(window.innerWidth > screen.tablet){
			$(loginForm).velocity("slideUp", { duration: 500 });
			$(login).velocity({'margin-top' : '10px'}, {duration: 500});
		}
		//Slide downt the sign up form
		$(signUpForm).velocity("slideDown", { 
			duration: 500,
			complete: function() {
				//Swap the title
				$(signUpFormHeader).find('h3').velocity({opacity : 0}, function(){
					this[0].innerHTML = 'START MY DEMO';
					$(this).velocity({opacity : 1});
				});
			}
		});

	}
	else
		processSignup();

});

loginFormHeader.addEventListener('click', function() {

	if(loginForm.style.display === 'none') {
		//Slide down login form
		$(loginForm).velocity("slideDown", { duration: 500 });
		//Bring back top margin
		$(login).velocity({'margin-top' : '12%'}, {duration: 500});

		//Slide up and hide the `Sign Up` form
		$(signUpForm).velocity("slideUp", { 
			duration: 500,
			complete: function() {

				//Swap sign up title back to normal
				$(signUpFormHeader).find('h3').velocity({opacity : 0}, function(){
					this[0].innerHTML = 'TRY OUT FRESCO NEWS';
					$(this).velocity({opacity : 1});
				});

			}
		});
	} 
	//Process Login
	else
		processLogin();
	
});


/**
 * Calls signup to process
 */
function reEnableSignup() {
	signupProcessing = false;
	signUpLoader.style.display = 'none';
	signUpHeaderText.innerHTML = 'START MY DEMO';
}

var processSignup = function() {
	if(signupProcessing) return;
	
	signupProcessing = true;

	//Set up fields
	var params = [
		{
			value: document.getElementById('outlet-title').value,
			name: 'Title',
			key: 'title'
		},
		{
			value: document.getElementById('outlet-url').value,
			name: 'URL',
			key: 'link'
		},
		{
			value: document.getElementById('outlet-medium').dataset.option,
			name: 'medium of communcation',
			key: 'medium'
		},
		{
			value: document.getElementById('outlet-state').dataset.option,
			name: 'State',
			key: 'state'
		},
		{
			value: document.getElementById('outlet-member-name').value.split(' ')[0],
			name: 'first name',
			key: 'contact_firstname'
		},
		{
			value: document.getElementById('outlet-member-name').value.split(' ').slice(1).join(' '),
			name: 'last name',
			key: 'contact_lastname'
		},
		{
			value: document.getElementById('outlet-phone').value,
			name: 'phone number',
			key: 'contact_phone'
		},
		{
			value: document.getElementById('outlet-email').value,
			name: 'email',
			key: 'contact_email'
		},
		{
			value: document.getElementById('outlet-password').value,
			name: 'password',
			key: 'contact_password'
		}
	];

	//Check all the fields
	for (var i = 0; i < params.length; i++) {
		value = params[i].value,
		key = params[i].key;

		if(!/\S/.test(value) || typeof(value) == 'undefined'){
			reEnableSignup();

			if(key === 'contact_lastname' || key == 'contact_firstname')
				return $.snackbar({content: 'Please enter a '+ params[i].name + '!'});
			else
				return $.snackbar({content: 'Please enter a '+ params[i].name + ' for your outlet!'});
		}
	}
	
	var newParams = {};

	for (var i = 0; i < params.length; i++) {
		newParams[params[i].key] = params[i].value;
 	};

 	signUpHeaderText.innerHTML = '';
 	signUpLoader.style.display = 'block';

	$.ajax({
		url: "/scripts/outlet/create",
		method: 'post',
		contentType: "application/json",
		data: JSON.stringify(newParams),
		dataType: 'json',
		success: function(response, status, xhr) {
			if (response.err){
				return this.error(null, null, response.err);
			}
			else {
				window.location.replace('/archive');
			}
		},
		error: function(xhr, status, error) {
			reEnableSignup();

			return $.snackbar({
				content: resolveError(error)
			});
		}
	});

}

/**
 * Calls login to process
 */
function reEnableLogin() {
	loginProcessing = false;
	loginLoader.style.display = 'none';
	loginHeaderText.innerHTML = 'LOG IN';
}

var processLogin = function() {
	if(loginProcessing) return;

	loginProcessing = true;

	var email = document.getElementById('login-email').value,
		password = document.getElementById('login-password').value;

	if(!/\S/.test(email) || !/\S/.test(password)){
		reEnableLogin();

		return $.snackbar({ content: 'Please enter in all fields!' });
	}

	loginHeaderText.innerHTML = '';
	loginLoader.style.display = 'block';

	$.ajax({
		url: "/scripts/user/login",
		method: 'post',
		contentType: "application/json",
		data: JSON.stringify({
			email: email,
			password: password,
		}),
		dataType: 'json',
		success: function(response, status, xhr){
			if(response.err){
				return this.error(null, null, response.err);
			}
			//Redirect
			else {
				var next = getParameterByName('next');
				window.location.replace(next.length ? next : '/archive');
			}
		}, 
		error: function(xhr, status, error){
			reEnableLogin();

			if(error == 'Unauthorized'){
				return $.snackbar({ content: 'Invalid email or password!'});
			} else{
				return $.snackbar({ content: 'There was an error logging you in. Please try again in a bit.'});
			}
		}
	});

}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function resolveError(err){
	switch(err){
	    case 'ERR_TITLE_TAKEN':
	        return 'This outlet title is taken!';
	    case 'ERR_EMAIL_TAKEN':
	    	return 'It seems like there\'s an account with this email already, please try a different one.'
	    default:
	        return 'Seems like we ran into an error registering your outlet! Please try again in a bit.'    
	}
}

/**
 * Updates the postion of the account modal elements
 * @param {float} width current width of the window
 */

function updatePosition(width) {
	if(window.innerWidth > screen.tablet){
		presentation.style.display = 'block';
		accountModal.insertBefore(presentation, login);
	}
	else if(window.innerWidth > screen.mobile && window.innerWidth < screen.tablet){
		if(signUpForm.style.display == 'block')
			presentation.style.display = 'none';
		else
			accountModal.insertBefore(login, presentation);
	}
}
