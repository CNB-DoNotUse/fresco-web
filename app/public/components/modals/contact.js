/**
 * Contact prototype object
 */
let Contact = function(screen){
	this.form = document.getElementById('contact-form');
	this.emailField = document.getElementById('contact-email');
	this.nameField = document.getElementById('contact-name');
	this.inquiryType = document.getElementById('contact-inquiry-type');
	this.messageField = document.getElementById('contact-message');
	
	this.processing = false;
	return this;
};

Contact.prototype.init = function() {
	this.form.addEventListener('submit', this.handleForm.bind(this));
}

/**
 * Handles form submission
 */
Contact.prototype.handleForm = function(e) {
	e.preventDefault();

	if(this.processing) return;
	this.processing = true;

	const params = [
		{
			value: this.emailField.value,
			name: 'email',
			key: 'from'
		},
		{
			value: this.nameField.value,
			name: 'name',
			key: 'name'
		},
		{
			value: this.inquiryType.dataset.option,
			name: 'type of inquiry',
			key: 'inquiryType'
		},
		{
			value: this.messageField.value,
			name: 'message',
			key: 'message'
		},
	];

	//Check all the fields
	for (var i = 0; i < params.length; i++) {
		const value = params[i].value;

		if(!/\S/.test(value) || typeof(value) == 'undefined'){
			this.processing = false;
			
			return $.snackbar({content: 'Please enter a '+ params[i].name + '!'});
		}
	}
	
	let newParams = {};
	params.forEach((param) =>{
		newParams[param.key] = param.value;
	})

	$.ajax({
		url: "/scripts/contact/",
		contentType: "application/json",
		data: JSON.stringify(newParams),
		method: "post",
		success: (response) => {
			if(response.err)
				$.snackbar({ content: resolveError(response.err)});
			else
				$.snackbar({ content: 'We\'ve received your message and will be in contact soon!'});

			this.processing = false;

		},
		error: (xhr, status, err) => {
			$.snackbar({ content: resolveError('') });
			this.processing = false;
		}
	});
}

module.exports = Contact;

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