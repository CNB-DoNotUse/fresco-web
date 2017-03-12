const Promise = require('bluebird');

const config = require('../lib/config');
const API = require('../lib/api');

/**
 * Oauth library used for facilitating OAuth authorization for 3rd parties
 */
const oauth = {

    /**
     * Retrieves an authorization code for a user
     * @param {String} token Bearer token belonging to the user
     * @param {String} client_id The ID of the client obtaining the authorization code
     * @param {String} redirect_uri Redirect URI of the client
     * @return {Promise} Returns promise from API request
     */
    getAuthorizationCode(token, client_id, redirect_uri, scope) {
        return API.request({
            url: '/auth/authorize',
            method: 'POST',
            body: { client_id, redirect_uri, scope: 'write' },
            token
        });
    },

    /**
     * Generates a url to return to after obtaining an authorization code
     * @param  {String} redirect_uri Redirect URI of the authenticating application
     * @param  {String} authorization_code Authorization code to assemble with
     * @return {String} URI formatted correctly for the 3rd party application
     */
    generateReturnURI(redirect_uri, authorization_code) {
        return `${redirect_uri}?authorization_code=${authorization_code}&status=granted`;
    }
}

module.exports = oauth;