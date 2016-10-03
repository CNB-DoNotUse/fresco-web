const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    const { user } = req.session;

    // TODO is this the correct permission
    if (user.permissions.includes('update-other-content')) {
        res.render('app', {
            title: 'Moderate Content',
            alerts: req.alerts,
            page: 'moderate',
            props: JSON.stringify({ user }),
        });
    } else {
        next({
            message: 'Not authorized to moderate content.',
            status: 401,
        });
    }
});

module.exports = router;

