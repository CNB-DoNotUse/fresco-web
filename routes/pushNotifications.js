const express = require('express');
const router = express.Router();
// const API = require('../lib/api');

router.get('/', (req, res) => {
    const props = {
        user: req.session.user,
    };

    res.render('app', {
        title: 'Push Notifications',
        alerts: req.alerts,
        page: 'pushNotifications',
        props: JSON.stringify(props),
    });
});

module.exports = router;

