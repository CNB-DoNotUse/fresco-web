const express = require('express');
const config = require('../lib/config');
const resolveError = require('../lib/resolveError');
const router = express.Router();
const API = require('../lib/api');

/**
 *  Outlet settings page for current logged in user
 */
router.get('/settings', (req, res, next) => {
    const { user, token } = req.session;

    console.log(user.outlet);

    if (!user.outlet) {
        return next({
            message: 'No outlet found!',
            status: 500
        });
    }

    //Chain promises for two API calls
    Promise.all([
        API.request({
            url: '/outlet/me',
            method: 'GET',
            token,
        }),
        API.request({
            url: '/outlet/payment',
            method: 'GET',
            token
        })
    ])
    .then(responses => { 
        const outlet = responses[0].body;
        const payment = responses[1].body;

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
    .catch((error) => {
        console.log(error);

        next({
            message: 'Outlet not found!',
            status: error.status || 500,
        })
    });
});

/**
 * Outlet page for currently logged in user or for passed outlet
 * @description
 */
router.get('/:id?', (req, res, next) => {
    const id = req.params.id || '';

    //Make request for full outlet object
    API.request({
        method: 'GET',
        url: `/outlet/${id || 'me'}`,
        token: req.session.token
    })
    .then((response) => {
        const outlet = response.body;
        const { user } = req.session;
        const title = outlet.title;
        const props = JSON.stringify({ user, title, outlet });

        return res.render('app', {
            title,
            props,
            alerts: req.alerts,
            page: 'outlet',
        });
    })
    .catch((error) => {
        return next({
            message: 'It seems like we couldn\'t locate your outlet!',
            status: error.status || 500
        });
    });
});


module.exports = router;