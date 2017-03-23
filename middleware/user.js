const Promise = require('bluebird');

const config = require('../lib/config');
const API = require('../lib/api');
const userLib = require('../lib/user');


/**
 * User middleware used around the site
 */
const userMiddleware = {

    /**
     * Middleware for refreshing token
     */
    refreshBearer: (req, res, next)  => {
        userLib
            .refreshBearer(req)
            .then(() => next())
            .catch(() => userMiddleware.logout(req, res))
    },

    /**
     * Refreshes a user's session with new data
     */
    refresh(req, res, next) {
        API
            .request({
                url: '/user/me',
                token: req.session.token.token,
                method: 'GET',
            })
            .then(response => {
                userLib
                    .saveSession(req, response.body)
                    .then(() => next())
                    .catch(() => userMiddleware.logout(req, res))
            })
            .catch(() => userMiddleware.logout(req, res))
    },

    /**
     * User log in middleware
     */
    login(req, res) {
        userLib
            .login(req.body.email || req.body.username, req.body.password, req)
            .then(response => {
                res.status(200).json({
                    success: true,
                    redirect: req.session.redirect || null
                });
            })
            .catch(error => {
                res.status(error.status).json({ success: false, error });
            });
    },


    /**
     * Logs the user out and redirects
     */
    logout(req, res) {
        const end = () => {
            req.session.destroy(() => {
                res.redirect('/');
            });
        }

        if (!req.session.user) {
            return end();
        }

        API.request({
            method: 'DELETE',
            url: '/auth/token',
            token: req.session.token.token
        })
        .then(end)
        .catch(end);
    }
}

module.exports = userMiddleware;