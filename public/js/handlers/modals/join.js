var form = document.getElementById('join-form'),
	emailField = document.getElementById('join-email'),
	passwordField = document.getElementById('join-password'),
	accountType = document.getElementById('join-account-type'),
	nameField = document.getElementById('join-name'),
	phoneField = document.getElementById('join-phone'),
	disabled = false;

form.addEventListener('submit', function(e) {

	e.preventDefault();

	if(accountType.dataset.option == 'New Account'){
		registerUser();
	} else if(accountType.dataset.option == 'Existing Account'){
		acceptInvite();
	}

});


function registerUser(){

	console.log('Registering');

	var name = nameField.value.split(' ');

	var params = {
		firstname : name[0],
		lastname  : name.slice(1).join(' '),
		email     : emailField.value,
		password  : passwordField.value,
		token: token
	}

	for (var key in params){
		if(!/\S/.test(params[key])){
			return $.snackbar({ content: 'Please enter in all fields!' });
		}
	}

	$.ajax({
		method: "POST",
		url: "/scripts/user/register",
		data: params,
		success: function(response){

			console.log(response);
		
			if (response.err)
				return this.error(null, null, response.err);
			
			window.location.replace('/archive');
		},
		error: function(xhr, status, error){
			$.snackbar({content: resolveError(error)});
		}
	});

}

function acceptInvite(){

	console.log('Accepting');

	var params = {
			password: passwordField.value,
			token: token
		};
		
	$.ajax({
		url: "/scripts/outlet/invite/accept",
		data: params,
		method: "POST",
		success: function(response){

			console.log(response);
			
			if (response.err)
				return this.error(null, null, response.err);
			
			window.location.replace('/highlights');
		},
		error: function(xhr, status, error){
			$.snackbar({content: resolveError(error)});
		}
	});
	
}


function resolveError() {

}
