const config = require('./config');
const API = require('./api');
const utils = require('../lib/utils');
const _ = require('lodash');

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
            const user = response.body;

            //Update session user
            req.session.user = user;
            //Update TTL 
            req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;

            req.session.save(() => {
                next();
            });
        })
        .catch((error) => {
            this.logout(req, res, next);
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
