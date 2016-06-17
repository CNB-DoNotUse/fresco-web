/**
 * Resolves a user facing error message from the error key
 * @param  {string} errorType Error type
 * @param  {string} _default  Default error to give back if nothing matches
 * @return {string} A string for the error message
 */
function resolveError(errorType, _default) {
    if(typeof(errors[errorType]) !== 'undefined') {
        return errors[errorType];
    } else {
        return _default || 'Seems like we ran into an error!';
    }
}

const errors = {
    'authentication_error' : 'The email or password you entered isn\'t correct!',
    'invalid_request_error': 'Please check your inputs and try again!'
}

module.exports = resolveError;
