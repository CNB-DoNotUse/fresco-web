

/**
 * General helper methods for authentication strategies
 */
module.exports = {

    /**
     * Returns a basic authentication header
     * @param  {String} clientID
     * @param  {String} clientSecret
     * @return {String} Authentication header value for basic authentication
     */
    basicAuthentication: (clientID = '', clientSecret = '') => {
        return `Basic ${new Buffer(`${clientID}:${clientSecret}`).toString('base64')}`;
    },

    /**
     * Returns a bearer authentication header
     * @param  {String} bearer token
     * @return {String} Authentication header value for bearer authentication
     */
    bearerAuthentication: (bearerToken = '') => {
        return `Bearer ${new Buffer(clientID + clientSecret).toString('base64')}`;
    }
}