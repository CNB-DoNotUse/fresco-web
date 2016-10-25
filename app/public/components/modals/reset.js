import utils from 'utils';

/**
 * Reset prototype object
 */
let Reset = function(){
    this.form = document.getElementById('reset-form');
    this.passwordField = document.getElementById('reset-password');
    this.hasOutlet = document.getElementById('reset-hasOutlet').value;
    this.tokenField = document.getElementById('reset-token');
    this.disabled = false;
    this.processing = false;

    return this;
};

/**
 * Init function
 */
Reset.prototype.init = function() {
    this.form.addEventListener('submit', this.reset.bind(this));
}

/**
 * Resets password
 */
Reset.prototype.reset = function(e) {
    e.preventDefault();
    if(this.processing) return;
    this.processing = true;

    const password = this.passwordField.value;
    const token = this.tokenField.value;

    if(utils.isEmptyString(password)){
        this.reEnable();
        return $.snackbar({ content: 'Please enter a password!'})
    }

    $.ajax({
        url: "/scripts/user/reset",
        data: JSON.stringify({ 
            password, 
            token, 
            login: this.hasOutlet === 'true' 
        }),
        method: "POST",
        contentType: 'application/json'
    })
    .done((response) => {
        if(this.hasOutlet === 'true'){
            window.location.replace('/archive');
        } else {
            window.location.replace('/reset/success');
        }
    })
    .fail((error) => {
        this.reEnable();
        $.snackbar({content: error.responseJSON.msg});
    });
}

/**
 * Re-enables form
 */
Reset.prototype.reEnable = function() {
    this.processing = false;
}


module.exports = Reset;