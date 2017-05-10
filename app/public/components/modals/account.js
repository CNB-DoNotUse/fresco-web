/**
 * Account page prototype function
 * @param {Object} screen Screen dimensions to run against
 */
let Account = function(screen){
	this.screen = screen;

	//State vars to disable signup/login after clicking
	this.signupProcessing = false;
	this.loginProcessing = false;

	this.accountModal = document.getElementById('_account');
	this.presentation = document.getElementById('_presentation');
	this.login = document.getElementById('_login');
	this.signup = document.getElementById('_signup');
	this.signUpFormHeader = document.getElementById('_signup-form-header');
	this.loginFormHeader = document.getElementById('_login-form-header');
	this.signUpLoader = document.getElementById('signup-loader');
	this.loginLoader = document.getElementById('login-loader');
	this.signUpForm = document.getElementById('signupForm');
	this.loginForm = document.getElementById('loginForm');
	this.loginButton = document.getElementById('login-password');

	//Grab the `h3` tag out of the header div so we can hide the text to show the spinner
	this.signUpHeaderText = this.signUpFormHeader.children[0];
	this.loginHeaderText = this.loginFormHeader.children[0];
}

Account.prototype.init = function() {
	//Run on load
	// this.updatePosition(window.innerWidth);

	// opens the signup form if it finds an element with "signup-auto"
	const openSignup = document.getElementById('signup-auto');
	if (openSignup) this.openSignUp(false);

	window.addEventListener('resize', () => {
		this.updatePosition(window.innerWidth);
	});
	this.enableLogin();
	this.enableSignup();
}

Account.prototype.enableLogin = function() {
	this.loginForm.addEventListener('submit', this.processLogin);

	this.loginButton.addEventListener('keydown', (e) => {
		if(e.keyCode == 13) {
			this.processLogin();
		}
	});

	this.loginFormHeader.addEventListener('click', () => {
		if(loginForm.style.display === 'none') {
			//Slide down login form
			$(this.loginForm).velocity("slideDown", { duration: 500 });
			//Bring back top margin
			$(this.login).velocity({'margin-top' : '12%'}, {duration: 500});

			//Slide up and hide the `Sign Up` form
			$(this.signUpForm).velocity("slideUp", {
				duration: 500,
				complete: () => {
					//Swap sign up title back to normal
					$(this.signUpFormHeader).find('h3').velocity({opacity : 0}, function(){
						this[0].innerHTML = 'TRY OUT FRESCO NEWS';
						$(this).velocity({opacity : 1});
					});

				}
			});
		}
		//Process Login
		else
			this.processLogin();
	});
}

// made this a class function, so that it can be used to open the sign up by default
Account.prototype.openSignUp = function(delay = true) {
	if(this.signUpForm.style.display == 'none' || this.signUpForm.style.display == ''){
		//Check if we're in a desktop view to adjust the top margin
		if(window.innerWidth > this.screen.tablet){
			$(this.loginForm).velocity("slideUp", { duration: 500 });
			$(this.login).velocity({'margin-top' : '10px'}, {duration: 500});
		}

		//Slide downt the sign up form
		$(this.signUpForm).velocity("slideDown", {
			duration: delay ? 500 : 0,
			complete: () => {
				//Swap the title
				$(this.signUpFormHeader).find('h3').velocity({opacity : 0}, function(){
					this[0].innerHTML = 'START MY DEMO';
					$(this).velocity({opacity : 1});
				});
			}
		});
	}
	else{
		this.processSignup();
	}
}

Account.prototype.enableSignup = function() {
	this.signUpForm.addEventListener('submit', this.processSignup);

	this.signUpFormHeader.addEventListener('click', this.openSignUp.bind(this));
}

/**
 * Calls signup to process
 */
Account.prototype.processSignup = function() {
	if(this.signupProcessing) return;

	this.signupProcessing = true;

	//Set up fields
	let params = {
		'title': {
			value: document.getElementById('outlet-title').value,
			name: 'title'
		},
		'link' : {
			value: document.getElementById('outlet-url').value,
			name: 'URL'
		},
		'type' : {
			value: document.getElementById('outlet-medium').dataset.option,
			name: 'medium of communcation'
		},
		'state' : {
			value: document.getElementById('outlet-state').dataset.option,
			name: 'state'
		},
		'full_name' : {
			value: document.getElementById('outlet-member-name').value,
			name: 'name'
		},
		'username' : {
			value: document.getElementById('outlet-username').value
		},
		'phone': {
			value: document.getElementById('outlet-phone').value,
			name: 'phone number'
		},
		'email' : {
			value: document.getElementById('outlet-email').value
		},
		'password' : {
			value: document.getElementById('outlet-password').value
		}
	};

	//Validate params
	for (const key in params) {
		const value = params[key].value;
		const name = params[key].name || key;

		if(!/\S/.test(value) || typeof(value) == 'undefined'){
			this.reEnableSignup();

			if(['full_name','username','email'].indexOf(key) > -1)
				return $.snackbar({content: `Please enter a ${name}!`});
			else
				return $.snackbar({content: `Please enter a ${name} for your outlet!`});
		}
	}

	//Define updated params
	params = {
	    email: params.email.value,
	    username: params.username.value,
	    password: params.password.value,
	    full_name: params.full_name.value,
	    phone: params.phone.value,
	    outlet: {
	    	title: params.title.value,
	    	link: params.link.value,
		    state: params.state.value,
		    type: params.type.value
	    }
	};

	//Hide the text
 	this.signUpHeaderText.innerHTML = '';
 	//Show the spinner
 	this.signUpLoader.style.display = 'block';

 	$.ajax({
 	    url: "/scripts/user/register",
 	    method: 'POST',
 	    data: JSON.stringify(params),
 	    contentType: 'application/json'
 	})
 	.done((response) => {
 	   	window.location.replace('/archive');
 	})
 	.fail(response => {
 	    this.reEnableSignup();

		return $.snackbar({
			content: response.responseJSON.msg
		});
 	});
}

//Re-enables login
Account.prototype.reEnableSignup = function() {
	this.signupProcessing = false;
	this.signUpLoader.style.display = 'none';
	this.signUpHeaderText.innerHTML = 'START MY DEMO';
}

/**
 * Calls login to process
 */
Account.prototype.processLogin = function() {
	if(this.loginProcessing) return;

	this.loginProcessing = true;

	const email = document.getElementById('login-email').value;
	const password = document.getElementById('login-password').value;

	if(!/\S/.test(email) || !/\S/.test(password)){
		this.reEnableLogin();

		return $.snackbar({ content: 'Please enter an email and password!' });
	}

	this.loginHeaderText.innerHTML = '';
	this.loginLoader.style.display = 'block';

	$.ajax({
 	    url: "/scripts/user/login",
		method: 'post',
		contentType: "application/json",
		data: JSON.stringify({ email, password }),
		dataType: 'json'
 	})
 	.done((response) => {
		window.location.replace(response.redirect ? response.redirect : '/archive');
 	})
 	.fail((error) => {
 	    this.reEnableLogin();

 	    return $.snackbar({
 	    	content: resolveError(error.responseJSON.error.msg, 'There was an error logging you in. Please try again in a bit.')
 	    });
 	});
}

/**
 * Re-enables login elements
 */
Account.prototype.reEnableLogin = function() {
	this.loginProcessing = false;
	this.loginLoader.style.display = 'none';
	this.loginHeaderText.innerHTML = 'LOG IN';
}

/**
 * Updates the postion of the account modal elements
 * @param {float} width current width of the window
 */
Account.prototype.updatePosition = function(width) {
	if(window.innerWidth > this.screen.tablet){
		this.presentation.style.display = 'block';
		this.accountModal.insertBefore(this.presentation, this.login);
	}
	else if(window.innerWidth > this.screen.mobile && window.innerWidth < this.screen.tablet){
		if(this.signUpForm.style.display == 'block')
			this.presentation.style.display = 'none';
		else
			this.accountModal.insertBefore(login, presentation);
	}
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function resolveError(err, _default){
	switch(err){
	    case 'Invalid credentials':
	        return 'Your username or password is incorrect!';
	    case 'email':
	    	return 'It seems like there\'s an account with this email already, please try a different one.'
	    case 'Unauthorized':
	    	return 'The email or password you entered isn\'t correct!'
	    default:
	    	return _default || 'Seems like we ran into an error!'
	}
}


module.exports = Account;
