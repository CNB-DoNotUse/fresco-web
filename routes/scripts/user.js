const express     = require('express');
const validator   = require('validator');
const config      = require('../../lib/config');
const User        = require('../../lib/user');
const API         = require('../../lib/api');
const resolveError = require('../../lib/resolveError');
const utils      = require('../../lib/utils');
const router      = express.Router();

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
    .then((response) => {
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
router.get('/logout', (req, res) => {
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
    .then(response => end())
    .catch(error => end());
});

router.post('/user/register', (req, res, next) => {
    let body = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        full_name: req.body.firstname + ' ' + req.body.lastname,
        phone: req.body.phone,
        outlet: req.body.outlet
    };

    if(!validator.isEmail(body.email)){
        return res.json({
            error: 'ERR_INVALID_EMAIL'
        });
    }

    API.request({
        method: 'POST',
        url: '/auth/register',
        body: body
    })
    .then(response => {
        let { body, status } = response;

        req.session.save(() => {
            return res.status(status).json({ success: true });
        });
    })
    .catch(error => {
        return res.status(error.status).json({
            error: resolveError(error.type || ''),
            success: false
        });
    });
});

router.get('/refresh', (req, res, next) => {
    User.refresh(req, res, (err) => {
        if(err)
            return res.json({
                err: 'ERR_REFRESH_FAIL',
                data: null
            });
        else
            return res.json({
                data: req.session.user,
                err: null
            });
    });
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