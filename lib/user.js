const config = require('./config');
const API = require('./api');
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
        .then(response => {
            User
                .saveSession(req, response.body)
                .then(next())
                // TODO: was causing app to crash on startup
                // .catch(error => next({
                //     message: 'Unable to save session!',
                //     status: 500
                // }))
        })
        .catch(error => User.logout(req, res, next))
    },

    login(req, res, next) {
        API.request({
            method: 'POST',
            url: '/auth/signin',
            body: {
                username: req.body.email || req.body.username,
                password: req.body.password,
            },
        })
        .then(response => {
            const { token, user } = response.body;

            User
                .saveSession(req, user, token)
                .then(() => {
                    res.status(response.status).json({
                        success: true,
                        redirect: req.session.redirect || null
                    });
                })
                .catch(error => {
                    res.status(response.status).json({ success: false, error });
                });
        })
        .catch(error => API.handleError(error, res));
    },

    /**
     * Saves users to session
     * @param  {Object} req  Express request
     * @param  {Object} user User object to save
     * @param  {String} token User API Token
     * @return {Promise}  Resolve/Reject
     */
    saveSession(req, user = {}, token = null) {
        return new Promise((resolve, reject) => {
            req.session.user = user;
            req.session.token = token || req.session.token;
            req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;

            //Save session and return
            req.session.save((error) => {
                if(error) {
                    reject(error);
                } else {
                    resolve();
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
