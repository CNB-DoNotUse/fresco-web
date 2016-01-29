var form = document.getElementById('forgot-form'),
	emailField = document.getElementById('forgot-email'),
	disabled = false;

form.addEventListener('submit', function(e) {

	e.preventDefault();

	if(disabled) return;

	disabled = true;

	var email = emailField.value;

	if(!/\S/.test(email)){
		$.snackbar({content: 'Please enter an email!'})
		disabled = false;
		return;
	}

	$.ajax({
		url: "/scripts/user/reset",
		dataType: "JSON",
		data: {
			email: email
		},
		type: "POST",
		success: function(response) {

			if(response.err){

				var error = response.err.charAt(0).toUpperCase() + response.err .slice(1);

				$.snackbar({ content: error});

			}
			else
				$.snackbar({ content: 'Password request successfuly sent! Please check your email'});


			disabled = false;

		},
		error: function(xhr, status, err) {
			$.snackbar({ content: 'An error occured and we can\'t reset your password right now. Please try again in a bit.' });
		}
		
	}); // end ajax

});