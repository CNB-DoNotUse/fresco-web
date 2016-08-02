const express = require('express');
const config = require('../lib/config');
const router = express.Router();
const API = require('../lib/api');

/**
 *  Outlet settings page for current logged in user
 */
router.get('/settings', (req, res, next) => {
    const { user, token } = req.session;

    if (!user.outlet) {
        next({
            message: 'No outlet found!',
            status: 500,
        });

        return;
    }

    // Chain promises for two API calls
    Promise.all([
        API.request({
            url: '/outlet',
            token,
        }),
        // API.request({
        //     url: '/outlet/payment',
        //     token,
        // })
    ])
    .then(responses => {
        console.log(responses);

        const outlet = responses[0];
        // const payment = responses = [1];

        const title = 'Outlet Settings';
        const props = {
            title,
            user,
            outlet,
            // payment,
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

