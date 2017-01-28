const Promise = require('bluebird');

const config = require('../lib/config');
const API = require('../lib/api');
const user = require('../lib/user');


/**
 * User middleware used around the site
 */
module.exports = {

    /**
     * Middleware for refreshing token
     */
    refreshBearer: (req, res, next)  => {
        user
            .refreshBearer(req)
            .then(() => next())
            .catch(() => User.logout(req, res))
    },

    /**
     * User log in middleware
     */
    login(req, res) {
        user
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