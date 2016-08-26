const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    const { user } = req.session;

    if (user.permissions.includes('update-other-content')) {
        res.render('app', {
            title: 'Push Notifications',
            alerts: req.alerts,
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

