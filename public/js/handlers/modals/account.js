var accountModal = document.getElementById('_account'),
	presentation = document.getElementById('_presentation'),
	login = document.getElementById('_login'),
	signup = document.getElementById('_signup'),
	signUpFormHeader = document.getElementById('_signup-form-header'),
	loginFormHeader = document.getElementById('_login-form-header'),
	signUpLoader = document.getElementById('signup-loader'),
	loginLoader = document.getElementById('login-loader'),
	signUpForm = document.getElementById('signupForm');
	loginForm = document.getElementById('loginForm'),
	loginButton = document.getElementById('login-password');

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

		//Check if we're in a desktop view to adjust the top margin
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

    const outletParams = [
        {
            value: document.getElementById('outlet-title').value,
            name: 'Title',
            key: 'title'
        },
        {
            value: document.getElementById('outlet-url').value,
            name: 'URL',
            key: 'link'
        }
        // TODO uncomment me when these keys are added to API
        // {
        //     value: document.getElementById('outlet-medium').dataset.option,
        //     name: 'medium of communcation',
        //     key: 'medium'
        // },
        // {
        //     value: document.getElementById('outlet-state').dataset.option,
        //     name: 'State',
        //     key: 'state'
        // }
    ];

	const params = [
		{
			value: document.getElementById('outlet-member-name').value.split(' ')[0],
			name: 'first name',
			key: 'firstname'
		},
		{
			value: document.getElementById('outlet-member-name').value.split(' ').slice(1).join(' '),
			name: 'last name',
			key: 'lastname'
		},
		{
			value: document.getElementById('outlet-phone').value,
			name: 'phone number',
			key: 'phone'
		},
		{
			value: document.getElementById('outlet-email').value,
			name: 'email',
			key: 'email'
		},
        {
			value: document.getElementById('outlet-username').value,
			name: 'username',
			key: 'username'
		},
		{
			value: document.getElementById('outlet-password').value,
			name: 'password',
			key: 'password'
		}
	];

    // Validate params
    const invalid = R.anyPass([R.not, R.test(/^\s*$/)]);

    outletParams.forEach(function(param) {
        if (invalid(param.value)) {
            reEnableSignup();
            $.snackbar({content: "Please enter a " + param.name + "!"});
        }
    });

    params.forEach(function(param) {
        if (invalid(param.value)) {
            reEnableSignup();
            $.snackbar({content: "Please enter a " + param.name + " for your outlet!"});
        }
    });

    // Convert validated param lists into API payload
    const flatten = R.reduce(function(payload, next) {
        return R.assoc(next.key, next.value, payload);
    }, {})
    const apiParams = R.merge(flatten(params), { outlet: flatten(outletParams) });


 	signUpHeaderText.innerHTML = '';
 	signUpLoader.style.display = 'block';

	$.ajax({
		url: "/scripts/auth/register",
		method: 'post',
		contentType: "application/json",
		data: JSON.stringify(apiParams),
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
				content: resolveError(error, 'Seems like we ran into an error registering your outlet! Please try again in a bit.')
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

	var username = document.getElementById('login-username').value,
		password = document.getElementById('login-password').value;

	if(!/\S/.test(username) || !/\S/.test(password)){
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
			username: username,
			password: password,
		}),
		dataType: 'json',
		success: function(response, status, xhr){
			if(response.success){
				var next = getParameterByName('next');
				window.location.replace(next.length ? next : '/archive');
			}
		},
		error: function(xhr, status, error){
			reEnableLogin();

			return $.snackbar({
				content: error
			});
		}
	});

}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
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
