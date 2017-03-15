const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    const { user } = req.session;

    if (user.roles.includes('admin')) {
        res.render('app', {
            title: 'Push Notifications',
            alerts: req.alerts,
            referral: req.session.referral,
            page: 'pushNotifs',
            props: JSON.stringify({ user }),
        });
    } else {
        next({
            message: 'Not authorized to create push notifications.',
            status: 401,
        });
    }
});

module.exports = router;
