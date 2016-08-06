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
        .catch(() => {
            delete req.session.user;

            return req.session.save(() => {
                res.redirect('/');
            });
        });
    }
};

module.exports = User;
