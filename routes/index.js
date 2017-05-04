const express       = require('express');
const router        = express.Router();
const config        = require('../lib/config');
const routes        = require('../lib/routes');
const API  = require('../lib/api');

/**
 * Root index for the landing page
 */
router.get('/:modal?', (req, res, next) => {
    if(req.params.modal){
        const modal = req.params.modal;

        if(modal == 'partners') {
            res.redirect('/account');
        } else if((modal === 'account' || modal === 'login') && req.session.user) {
            res.redirect(config.DASH_HOME);
        }
        //Not a modal, pass onto route sequence
        else if(routes.modals.indexOf(modal) == -1 && routes.aliases[modal] == null) {
            return next();
        }
    }
    //Redirect to dashboard home if the user is already logged in, instead of the landing page
    else if(req.session.user !== null && typeof(req.session.user) !== 'undefined') {
        return res.redirect(config.DASH_HOME);
    }

    res.render('index', {
        page: 'index',
        loggedIn: req.session.user ? true : false,
        modal: req.params.modal,
        modals: routes.modals,
        aliases: routes.aliases
    });
});

/**
 * Outlet join page
 */
router.get('/join/:token', (req, res, next) => {
    if (!req.params.token) {
        return next();
    }

    // Make request for invite
    API.request({
        method: 'GET',
        url: `/outlet/invite/${req.params.token}`
    })
    .then((response) => {
        const { body } = response;

        if(body.status === 'used') {
            req.session.alerts = ['This invitation has already been used!'];

            return req.session.save(() => {
                res.redirect('/');
                res.end();
            });
        }

        return res.render('index', {
            page: 'index',
            invite: body,
            modal: 'join',
            aliases: routes.aliases,
            modals: routes.modals.concat('join'),
        });
    })
    .catch(error => {
        req.session.alerts = ['This invitation could not be loaded! Please contact support@fresconews.com for assistance.'];

        return req.session.save(() => {
            res.redirect('/');
            res.end();
        });
    });
});

/**
 * Reset password success page
 */
router.get('/reset/success', (req, res, next) => {
    return res.render('index', {
        page: 'index',
        modal: 'reset-success',
        aliases: routes.aliases,
        modals: routes.modals
    });
});

/**
 * Reset password page
 */
router.get('/reset/:token', (req, res, next) => {
    if (!req.params.token) {
        return next();
    }
    // Make request for invite
    API.request({
        method: 'GET',
        url: `/auth/reset/${req.params.token}`
    })
    .then((response) => {
        const { body } = response;

        return res.render('index', {
            page: 'index',
            modal: 'reset',
            token: req.params.token,
            hasOutlet: body.outlet !== undefined,
            aliases: routes.aliases,
            modals: routes.modals.concat('reset'),
        });
    })
    .catch(error => {
        req.session.alerts = ['That password reset link is invalid!'];

        return req.session.save(() => {
            res.redirect('/');
            res.end();
        });
    });
});

module.exports = router;
