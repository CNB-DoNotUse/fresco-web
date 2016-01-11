var accountModal = document.getElementById('_account'),
	presentation = document.getElementById('_presentation'),
	login = document.getElementById('_login'),
	signup = document.getElementById('_signup'),
	signUpFormHeader = document.getElementById('_signup-form-header'),
	loginFormHeader = document.getElementById('_login-form-header'),
	signUpForm = signup.getElementsByTagName('form')[0],
	loginForm = login.getElementsByTagName('form')[0];

//Run on load
updatePosition(window.innerWidth);

window.addEventListener('resize', function() {

	updatePosition(window.innerWidth);

});

loginForm.addEventListener('submit', processLogin);

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
		$(login).velocity({'margin-top' : '13%'}, {duration: 500});

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

var processSignup = function() {

	//Set up fields
	var params = [
		{
			value: document.getElementById('outlet-name').value,
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
		value = params[i].value;
		if(!/\S/.test(value) || typeof(value) == 'undefined'){
			$.snackbar({content: 'Please enter a '+ params[i].name + ' for your outlet!'});
			return;
		}
	}
	
	var newParams = {};

	for (var i = 0; i < params.length; i++) {
		newParams[params[i].key] = params[i].value;
 	};

	$.ajax({
		url: "/scripts/outlet/create",
		method: 'post',
		contentType: "application/json",
		data: JSON.stringify(newParams),
		dataType: 'json',
		success: function(response, status, xhr){

			console.log(response);

			if (response.err){

				return $.snackbar({content: resolveError(response.err)});

			}
			else {

				window.location.replace('/archive');

			}
			
		}
	});

}

/**
 * Calls login to process
 */

var processLogin = function() {

	var email = document.getElementById('login-email').value,
		password = document.getElementById('login-password').value;

	if(!/\S/.test(email) || !/\S/.test(password)){
		$.snackbar({ content: 'Please enter in all fields!' });
	}

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

				$.snackbar({ content: 'An error occured. Please try again in a bit'});

			}
			//Redirect
			else {

				window.location.replace('/archive');

			}

		}, 
		error: function(xhr,status,error){
			if(error == 'Unauthorized'){
				$.snackbar({ content: 'Invalid email or password!'});
			}
		}
	});

}

function resolveError(err){

	switch(err){
	    case 'ERR_TITLE_TAKEN':
	        return 'This outlet title is taken!';
	    case 'ERR_EMAIL_TAKEN':
	    	return 'It seems like there\'s an account with this email already, please try a different one.'
	    default:
	        return 'Seems like we ran into an error registering your outlet!'    
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
