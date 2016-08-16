/**
 * Forgot form prototype object
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

	const username = this.emailField.value;

	if(!/\S/.test(username)){
		this.processing = false;
		return $.snackbar({content: 'Please enter in an email!'})
	}

	$.ajax({
	    url: "/scripts/user/reset/request",
	    data: { username },
	    method: "POST"
	})
	.done((response) => {
		$.snackbar({ content: 'Please check your email for a password reset link!'});
	})
	.fail((error) => {
	    $.snackbar({content: error.responseJSON.msg});
	})
	.always(() => {
		this.processing = false;
	});
}

module.exports = Forgot;