const config = require('./config');
const API = require('./api');
const utils = require('../lib/utils');
const _ = require('lodash');
const Promise = require('bluebird');

/**
 * User middleware used around the site
 */
const User = {
    
    /**
     * Refreshes a user's session with new data
     */
    refresh(req, res, next) {
        API.request({
            url: '/user/me',
            token: req.session.token,
            method: 'GET',
        })
        .then((response) => {
            User
                .saveSession(req, response.body)
                .then(next())
                .catch(null)
        })
        .catch((error) => {
            User.logout(req, res, next);
        });
    },

    /**
     * Saves users to session
     * @param  {Object} req  Express request
     * @param  {Object} user User object to save
     * @return {Promise}  Resolve/Reject
     */
    saveSession(req, user = null, token = null) {
        return new Promise((resolve, reject) => {
            req.session.user = user;
            req.session.token = token || req.session.token;
            req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;

            //Save session and return
            req.session.save((error) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(null)
                }
            });
        });
    },

    /**
     * Logs the user out and redirects
     */
    logout(req, res, next) {
        const end = () => {
            req.session.destroy(() => {
                res.redirect('/');
            });
        }

        if (!req.session.user) {
            return end();
        }

        API.request({
            method: 'POST',
            url: '/auth/logout',
            token: req.session.token
        })
        .then(end)
        .catch(end);
    }
};

module.exports = User;
