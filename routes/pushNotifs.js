const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const props = {
        user: req.session.user,
    };

    res.render('app', {
        title: 'Push Notifications',
        alerts: req.alerts,
        page: 'pushNotifs',
        props: JSON.stringify(props),
    });
});

module.exports = router;

