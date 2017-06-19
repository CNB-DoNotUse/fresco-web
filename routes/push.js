const express = require('express');
const router = express.Router();
const helper = require('../lib/helpers');


router.get('/', (req, res, next) => {
    const { user } = req.session;

    if (helper.isAdmin(user)) {
        res.render('app', {
            title: 'Push Notifications',
            alerts: req.alerts,
            referral: req.session.referral,
            page: 'pushNotifs',
            props: JSON.stringify({ user: helper.userAdminRoles(user) }),
        });
    } else {
        next({
            message: 'Not authorized to create push notifications.',
            status: 401,
        });
    }
});

module.exports = router;
