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

signUpFormHeader.addEventListener('click', function() {

	if(signUpForm.style.display == 'none' || signUpForm.style.display == ''){
		
		//Check if we're in a deskptop view to adjust the top margin
		if(window.innerWidth > screen.tablet){
			$(loginForm).velocity("slideUp", { duration: 500 });
			$(login).velocity({'margin-top' : '10px'}, {duration: 500});
		}
		//Swap the title
		$(signUpFormHeader).find('h3').velocity({opacity : 0}, function(){
			this[0].innerHTML = 'START MY DEMO';
			$(this).velocity({opacity : 1});
		});
		//Slide downt the sign up form
		$(signUpForm).velocity("slideDown", { duration: 500 });

	}
	else
		processSignup();

});

loginFormHeader.addEventListener('click', function() {

	if(loginForm.style.display === 'none'){
		//Slide down login form
		$(loginForm).velocity("slideDown", { duration: 500 });
		//Bring back top margin
		$(login).velocity({'margin-top' : '13%'}, {duration: 500});
		//Swap sign up title back to normal
		$(signUpFormHeader).find('h3').velocity({opacity : 0}, function(){
			this[0].innerHTML = 'TRY OUT FRESCO NEWS';
			$(this).velocity({opacity : 1});
		});
		//Slide up and hide the `Sign Up` form
		$(signUpForm).velocity("slideUp", { duration: 500 });
	} 
	//Process Login
	else
		processLogin();
	

});


/**
 * Calls signup to process
 */

var processSignup = function() {

	$.ajax({
		url: "/scripts/outlet/create",
		method: 'post',
		contentType: "application/json",
		data: JSON.stringify(params),
		dataType: 'json',
		success: function(result, status, xhr){
			if (result.err)
				return this.error(null, null, result.err);
			
			window.location.replace('/content');
		},
		error: function(xhr, status, error){
			console.log(error);
			
		},
		complete: function(){
			$(_this).attr('disabled', '');
			$(_this).html('Submit');
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

			console.log(response);

			if(response.err){

			}
			//Redirect
			else{

				window.location.replace('/archive');

			}

		}
	});

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
