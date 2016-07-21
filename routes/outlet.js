const express = require('express');
const config = require('../lib/config');
const router = express.Router();
const api = require('../lib/api');

/** //

    Description : Outlet Specific Routes ~ prefix /outlet/endpoint

// **/

/**
    * Outlet page for currently logged in user
*/

router.get('/', (req, res, next) => {
    let user;
    let token;
    if (req.session) {
        token = req.session.token;
        user = req.session.user;
    }

    if (!user.outlet) return res.redirect(config.DASH_HOME);

    return api.request({
        url: '/outlet/',
        token,
    }).then(response => {
        if (!user.outlet.verified) {
            req.alerts.push(user.id === user.outlet.owner
                            ? 'This outlet is in demo mode. We’ll be in touch shortly to verify your account.'
                            : 'This outlet is in demo mode. Purchases and downloads are currently disabled.');
        }

        const props = {
            user,
            outlet: response.body,
        };

        return res.render('app', {
            title: 'Outlet',
            alerts: req.alerts,
            props: JSON.stringify(props),
            page: 'outlet',
        });
    }).catch(() => (
        next({
            message: 'Outlet not found!',
            status: 404,
        })
    ));
});

/**
    *  Outlet settings page for current logged in user
*/

router.get('/settings', (req, res, next) => {
    let user;
    let token;
    let outlet;
    let payment;

    if (req.session) {
        token = req.session.token;
        user = req.session.user;
    }

    if (!user.outlet) {
        const err = new Error('No outlet found!');
        err.status = 500;
        return next(err);
    }

    return api.request({
        url: '/outlet/',
        token,
    })
    .then(response => {
        outlet = response.body;
        return api.request({
            url: '/outlet/payment',
            token,
        });
    })
    .then(response => {
        payment = response.body;
        const title = 'Outlet Settings';
        const props = {
            title,
            user,
            outlet,
            payment,
            stripePublishableKey: config.STRIPE_PUBLISHABLE,
        };


        return res.render('app', {
            title,
            page: 'outletSettings',
            alerts: req.alerts,
            remoteScripts: ['https://js.stripe.com/v2/'],
            props: JSON.stringify(props),
        });
    })
    .catch(() => (
        next({
            message: 'Outlet not found!',
            status: 404,
        })
    ));
});

module.exports = router;
