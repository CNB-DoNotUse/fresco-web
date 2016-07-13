/**
 * Forgot prototype object
 */
let Forgot = function(){
	this.form = document.getElementById('forgot-form');
	this.emailField = document.getElementById('forgot-email');
	this.disabled = false;
	
	this.processing = false;

	return this;
};

Forgot.prototype.init = function() {
	this.form.addEventListener('submit', this.handleForm.bind(this));
}

/**
 * Handles form submission
 */
Forgot.prototype.handleForm = function(e) {
	e.preventDefault();

	if(this.processing) return;

	this.processing = true;

	const email = this.emailField.value;

	if(!/\S/.test(email)){
		this.processing = false;

		return $.snackbar({content: 'Please enter an email!'})
	}

	$.ajax({
		url: "/scripts/user/reset",
		dataType: "JSON",
		data: { email },
		type: "POST",
		success: (response) => {
			if(response.err){
				let error = response.err.charAt(0).toUpperCase() + response.err .slice(1);

				$.snackbar({ content: error});
			}
			else{
				$.snackbar({ content: 'Password request successfuly sent! Please check your email'});
			}

			this.processing = false;
		},
		error: function(xhr, status, err) {
			$.snackbar({ content: 'An error occured and we can\'t reset your password right now. Please try again in a bit.' });
		}
	});
}

module.exports = Forgot;