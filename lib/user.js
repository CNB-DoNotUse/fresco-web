const Promise = require('bluebird');

const config = require('../lib/config');
const API = require('../lib/api');


/**
 * User library used around the site
 */
const user = {

    /**
     * Retrieves the user   
     * @param {String} token Bearer token belonging to theuser
     * @return {Promise} returns promise from API request
     */
    get(token) {
        return API.request({
            url: '/user/me',
            method: 'GET',
            token
        })
        .then((response) => Promise.resolve(response.body))
    },


    /**
     * Refreshes a user's bearer token. 
     * @param {Object} req Express request, in order access the session token and save it
     * @return {Promise}
     */
    refreshBearer: (req)  => {
        return API.request({
            method: 'POST',
            url: '/auth/token',
            body: {
                grant_type: 'refresh_token',
                refresh_token: req.session.token.refresh_token
            }
        })
        .then(response => {
            const { access_token } = response.body;

            return user.saveSession(req, null, access_token)
        })
    },

    /**
     * Log a user in
     * @description Will get beraer, get the user object, and then save to the express session
     * @param {String} email [description]
     * @param  {[type]}  req  Request the login is originating from
     * @return {Promise}        [description]
     */
    login(username, password, req = null) {  
        return API.request({
            method: 'POST',
            url: '/auth/token',
            body: {
                grant_type: 'password',
                scope: 'write',
                username,
                password
            }
        })
        .then(response => {
            const { access_token } = response.body;

            return user
            .get(access_token.token)
            .then(userObject => {
                if(!req) {
                    return Promise.resolve({
                        user: userObject, 
                        token: access_token
                    })
                } else{         
                    return user
                    .saveSession(req, userObject, access_token)
                    .then(() => Promise.resolve({
                        user: userObject, 
                        token: access_token
                    }))
                }

            })
        })
    },

    /**
     * Saves users to session
     * @param  {Object} req  Express request object
     * @param  {Object} user User object to save
     * @param  {String} token User API Token
     * @return {Promise}  Resolve/Reject
     */
    saveSession(req, user = {}, token = null) {
        return new Promise((resolve, reject) => {
            req.session.user = user || req.session.user; //Optional
            req.session.token = token || req.session.token; //Optional

            //Set TTL on user
            req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;
            
            //Save session and return
            req.session.save(error => {
                if(error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    },
}

module.exports = user;