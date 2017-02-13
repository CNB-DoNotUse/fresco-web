const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/user');
const userLib = require('../../lib/user');
const API = require('../../lib/api');

/**
 * Processes login in for web platform users
 */
router.post('/login', userMiddleware.login);

/**
 * Logs the user out and redirects
 */
router.get('/logout', userMiddleware.logout);

/**
 * Registers a new user account, optionally with an outlet
 */ 
router.post('/register', (req, res, next) => {
    API.request({
        method: 'POST',
        url: '/user/create',
        body: req.body,
    })
    .then(response => {
        const user = response.body;
        
        //Log in newly registered user
        userLib
            .login(user.username, req.body.password, req)
            .then(response => {
                res.status(200).json({
                    success: true
                });
            })
            .catch(error => {
                res.status(error.status).json({ success: false, error });
            });
    })
    .catch(error => API.handleError(error, res));
});

/**
 * Reset password endpoint
 * @description Takes an token in the body
 */
router.post('/reset', (req, res, next) => {
    API.request({
        method: 'POST',
        url: '/auth/reset',
        body: {
            password: req.body.password,
            token: req.body.token
        }
    })
    .then(response => {
        //Check if client sends request to log in
        if(!req.body.login) {
            return res.send({ success: true });
        }

        const { body } = response;

        //Set req.body for middleware
        req.body.username = body.username || body.email

        userMiddleware.login(req, res, next);
    })
    .catch(error => API.handleError(error, res));
});

/**
 * Reset request password endpoint
 * @description Takes a username in the body to send the request for a password reset email
 */
router.post('/reset/request', (req, res, next) => {
    API.request({
        method: 'POST',
        url: '/auth/reset/request',
        body: {
            username: req.body.username
        }
    })
    .then(response => {
        const { body } = response;

        res.status(200).json({ success: true });
    })
    .catch(error => API.handleError(error, res));
});

module.exports = router;
