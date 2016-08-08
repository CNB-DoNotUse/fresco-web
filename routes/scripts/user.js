const express = require('express');
const router = express.Router();
const validator = require('validator');
const config = require('../../lib/config');
const User = require('../../lib/user');
const API = require('../../lib/api');
const resolveError = require('../../lib/resolveError');
const utils = require('../../lib/utils');

/**
 * Reset password endpoint
 * @description Takes an email in the body
 */
router.post('/user/reset', (req, res, next) => {

});

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
        let { body } = response;

        //Save to session
        req.session.token = body.token;

        //Send request for user object
        API.request({
            method: 'GET',
            url: '/user/me',
            token: body.token
        })
        .then((response) => {
            req.session.user = response.body;
            req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;

            //Save session and return
            req.session.save(() => {
                return res
                .status(response.status)
                .json({ success: true });
            });
        })
        .catch(error => API.handleError(error, res));
    })
    .catch(error => API.handleError(error, res));
});

/**
 * Logs the user out or redirects
 */
router.get('/logout', User.logout);

/**
 * Registers a new user account, optionally with an outlet
 */
router.post('/register', (req, res, next) => {
    const { body } = req;

    API.request({
        method: 'POST',
        url: '/auth/register',
        body
    })
    .then(response => {
        let { body, status } = response;

        req.session.token = body.token;
        req.session.user = body.user;
        req.session.save((error) => {
            if(error) {
                return res.status(status).json({ success: false, error });
            } else {
                return res.status(status).json({ success: true });
            }
        });
    })
    .catch(error => API.handleError(error, res));
});


router.get('/verify/resend', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.json({err: 'ERR_UNAUTHORIZED'}).end();
  }

  API.proxy(req, res, (body) => {
    var end = () => {
      res.redirect(req.headers['Referer'] || config.DASH_HOME);
      res.end();
    };

    if (err) {
      req.session.alerts = [config.resolveError(body.err)];
      return req.session.save(end);
    }
    if (!body) {
      req.session.alerts = ['Could not connect to server'];
      return req.session.save(end);
    }

    req.session.alerts = ['A comfirmation email has been sent to your email.  Please click the link within it in order to verify your email address.'];
    return req.session.save(end);
  });
});


module.exports = router;