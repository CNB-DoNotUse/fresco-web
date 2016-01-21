var formWrap = document.getElementById('_form-wrap'),
	form = document.getElementById('pro-form'),
	circle = document.getElementById('_circle'),
	zipField = document.getElementById('pro-zip'),
	nameField = document.getElementById('pro-name'),
	emailField = document.getElementById('pro-email'),
	phoneField = document.getElementById('pro-phone'),
	timeField = document.getElementById('pro-time'),
	submit = document.getElementById('pro-submit'),
	loader = document.getElementById('pro-loader'),
	finishedState = document.getElementById('_form-completion');
	disabled = false;

Waves.attach('.button', [ 'waves-block', 'waves-classic']);
Waves.init();

submit.addEventListener('click', function(e) {
	e.preventDefault();

	if(disabled) return;

	disabled = true;

	signup(e);
}, false);

function signup(e) {
	submit.value = '';
	loader.style.display = 'block';

	var name = nameField.value.split(' '),
		params = {
			firstname : name[0],
			lastname  : name.slice(1).join(' '),
			zip       : zipField.value,
			email     : emailField.value,
			time      : timeField.value,
			phone     : phoneField.value
		};

	//Check all fields for input
	for (var key in params){
		if(!/\S/.test(params[key])){
			if(key == 'firstname' || key == 'lastname'){
				reEnable();
				return $.snackbar({ content: 'Please enter in a first and last name!'});
			}
			else {
				reEnable();
				return $.snackbar({ content: 'Please enter in all fields!' });
			}
		}
	}

	$.ajax({
		method: "POST",
		url: "/scripts/pro/signup",
		data: params,
		success: function(response) {
			if (response.err || !response.success)
				return this.error(null, null, response.err);
			else{
				animateCompletion(e);
			}
		},
		error: function(xhr, status, error) {
			$.snackbar({content: resolveError(error),});

			reEnable();
		},
		complete: function(xhr, status, error) {
			reEnable();
		}
	});
}

function reEnable() {
	disabled = false;
	loader.style.display = 'none';
	submit.value = 'SIGN UP';
}

function animateCompletion(e) {
    var parentPosition = animation.getPosition(form);
    var xPosition = form.clientWidth/2 - circle.clientWidth/2;
    var yPosition = form.clientHeight - 5;

	circle.style.left = xPosition + "px";
	circle.style.top = yPosition + "px";
	circle.style.display = 'block';

	width = $(form).width();
	height = $(form).height();
	r = Math.sqrt(width * width + height * height);

	circle.style.width = r*2 + 'px';
	circle.style.height = r*2 + 'px';
	circle.style.marginLeft = -r + 'px';
	circle.style.marginTop =-r + 'px';

	setTimeout(function(){
		finishedState.style.display = 'block';
		formWrap.style.maxHeight = '';
		form.style.display = 'none';

		setTimeout(function() {
			finishedState.style.opacity = 1;
		}, 300);
	}, 400);
}


function resolveError(err) {
	switch(err){
		case 'ERR_EMAIL_TAKEN':
			return 'This email is taken! Please use another one.'
		case 'ERR_INVALID_ZIP':
			return 'Please enter a valid zip code!'
		case 'ERR_INVALID_EMAIL':
			return 'Please enter a valid email!'
		case 'ERR_INVALID_PHONE':
			return 'Please enter a valid phone number!'
	    default:
	        return 'An error occured! Please try again in a bit.'   
	}
}
