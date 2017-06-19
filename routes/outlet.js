const express = require('express');
const config = require('../lib/config');
const router = express.Router();
const API = require('../lib/api');
const helper = require('../lib/helpers');

/**
 *  Outlet settings page for current logged in user
 */
router.get('/settings', (req, res, next) => {
    const { user, token } = req.session;
    const { outlet } = user;

    if (!outlet) {
        return next({
            message: 'You\'re not part of an outlet!',
            status: 500,
        });
    }

    //Chain promises for two API calls
    Promise.all([
        API.request({
            url: '/outlet/me',
            method: 'GET',
            token: token.token,
        }, req),
        API.request({
            url: '/outlet/payment',
            method: 'GET',
            token: token.token,
        }, req)
    ])
    .then(responses => {
        const outlet = responses[0].body;
        const payment = responses[1].body;
        const title = 'Outlet Settings';
        const props = {
            title,
            user: helper.userAdminRoles(user),
            outlet,
            payment,
            stripePublishableKey: config.STRIPE_PUBLISHABLE,
        };

        return res.render('app', {
            title,
            page: 'outletSettings',
            alerts: req.alerts,
            referral: req.session.referral,
            remoteScripts: ['https://js.stripe.com/v2/'],
            props: JSON.stringify(props),
        });
    })
    .catch(error => {
        next({
            message: 'Outlet not found!',
            status: error.status || 500,
        });
    });
});

/**
 * Outlet page for currently logged in user or for passed outlet
 * @description
 */
router.get('/:id?', (req, res, next) => {
    const { user } = req.session;

    // Make request for full outlet object
    API.request({
        method: 'GET',
        url: `/outlet/${req.params.id || 'me'}`,
        token: req.session.token.token
    }, req)
    .then(response => {
        const outlet = response.body;
        const title = outlet.title;
        const props = JSON.stringify({ user: helper.userAdminRoles(user), title, outlet });

        return res.render('app', {
            title,
            props,
            alerts: req.alerts,
            referral: req.session.referral,
            page: 'outlet',
        });
    })
    .catch(error => {
        console.log("outlet error: " + JSON.stringify(error));
        next({
            message: 'It seems like we couldn\'t locate your outlet!',
            status: error.status || 500,
            stack: error.stack
        })
    });
});


module.exports = router;
