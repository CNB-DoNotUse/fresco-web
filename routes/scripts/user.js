const express = require('express');
const router = express.Router();
const validator = require('validator');
const config = require('../../lib/config');
const User = require('../../lib/user');
const API = require('../../lib/api');
const resolveError = require('../../lib/resolveError');
const utils = require('../../lib/utils');

/**
 * Processes login in for web platform users
 */
router.post('/login', (req, res, next) => {
    API.request({
        method: 'POST',
        url: '/auth/signin',
        body: {
            username: req.body.email,
            password: req.body.password
        }
    })
    .then(response => {
        let { token, user } = response.body;

        User
            .saveSession(req, user, token)
            .then(() => {
                return res.status(response.status).json({ success: true });
            })
            .catch(error => {
                return res.status(response.status).json({ success: false, error });
            })
    })
    .catch(error => API.handleError(error, res));
});

/**
 * Logs the user out and redirects
 */
router.get('/logout', User.logout);

/**
 * Registers a new user account, optionally with an outlet
 */
router.post('/register', (req, res, next) => {
    API.request({
        method: 'POST',
        url: '/auth/register',
        body: req.body
    })
    .then(response => {
        const { token } = response.body;

        //Make request for full user object for session
        API.request({
            method: 'GET',
            url: '/user/me',
            token
        })
        .then(response => {
            const user = response.body;

            User
                .saveSession(req, user, token)
                .then(() => {
                    return res.status(response.status).json({ success: true });
                })
                .catch((error) => {
                    return res.status(response.status).json({ success: false, error });
                });
        })
        .catch(error => API.handleError(error, res));
    })
    .catch(error => API.handleError(error, res));
});

/**
 * Reset password endpoint
 * @description Takes an email in the body
 */
router.post('/user/reset', (req, res, next) => {

});

/**
 * Re-sends a verification email
 */
router.get('/verify/resend', (req, res) => {

});


module.exports = router;