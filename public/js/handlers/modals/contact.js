var form = document.getElementById('contact-form'),
	emailField = document.getElementById('contact-email'),
	nameField = document.getElementById('contact-name'),
	inquiryType = document.getElementById('contact-inquiry-type'),
	messageField = document.getElementById('contact-message'),
	disabled = false;


form.addEventListener('submit', function(e) {

	e.preventDefault();

	if(disabled) return;

	disabled = true;

	var params = [
		{
			value: emailField.value,
			name: 'email',
			key: 'from'
		},
		{
			value: nameField.value,
			name: 'name',
			key: 'name'
		},
		{
			value: inquiryType.dataset.option,
			name: 'type of inquiry',
			key: 'inquiryType'
		},
		{
			value: messageField.value,
			name: 'message',
			key: 'message'
		},
	];

	//Check all the fields
	for (var i = 0; i < params.length; i++) {
		value = params[i].value;
		if(!/\S/.test(value) || typeof(value) == 'undefined'){
			$.snackbar({content: 'Please enter a '+ params[i].name});
			disabled = false;
			return;
		}
	}
	
	var newParams = {};

	for (var i = 0; i < params.length; i++) {
		newParams[params[i].key] = params[i].value;
 	};

	$.ajax({
		url: "/scripts/contact/",
		contentType: "application/json",
		data: JSON.stringify(newParams),
		method: "post",
		success: function(response) {

			if(response.err)
				$.snackbar({ content: resolveError(response.err)});
			else
				$.snackbar({ content: 'We\'ve received your message and will be in contact soon!'});

			disabled = false;

		},
		error: function(xhr, status, err) {
			$.snackbar({ content: resolveError('') });
			disabled = false;
		}
		
	});
});

function resolveError(err){
	switch(err){
		case 'ERR_CONTACT_PARAMS':
			return 'Please enter in all fields!';
	    case 'ERR_CONTACT_EMAIL':
	        return 'Please enter a valid email!';
	    case 'ERR_CONTACT_LENGTH':
	    	return 'Please enter a message under 500 characters!'
	    default:
	        return 'An error occured! Please try again in a bit.'   
	}
}