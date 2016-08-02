const express = require('express');
const config = require('../lib/config');
const router = express.Router();
const API = require('../lib/api');

/**
 *  Outlet settings page for current logged in user
 */
router.get('/settings', (req, res, next) => {
    const { user, token } = req.session;
    const { outlet } = user;

    if (!user || !outlet) {
        next({
            message: 'No outlet found!',
            status: 500,
        });
    }

    API.request({
        url: `/outlet/payment/${outlet.id}`,
        token,
    })
    .then(response => {
        const title = 'Outlet Settings';
        const props = {
            title,
            user,
            outlet,
            paymentSources: response.body || [],
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
    const id = req.params.id
        || (user.outlet ? user.outlet.id : '');

    // Make request for full outlet object
    API.request({
        method: 'GET',
        url: `/outlet/${id}`,
        token: req.session.token,
    })
    .then((response) => {
        const outlet = response.body;
        const title = outlet.title;
        const props = JSON.stringify({ user, title, outlet });

        return res.render('app', {
            title,
            props,
            alerts: req.alerts,
            page: 'outlet',
        });
    })
    .catch((error) => (
        next({
            message: 'It seems like we couldn\'t locate your outlet!',
            status: error.status || 500,
        })
    ));
});


module.exports = router;

