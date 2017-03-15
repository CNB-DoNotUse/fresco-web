const express = require('express');
const config = require('../lib/config');

const router = express.Router();

/**
 * Root purchases page
 */
router.get('/', (req, res, next) => {
    if (!req.session.user.roles.includes('admin')) {
        return next({
            message: config.ERR_PAGE_MESSAGES[403],
            status: 403,
        });
    }

    const title = 'Purchases';
    const props = {
        user: req.session.user,
        title,
    };

    res.render('app', {
        user: req.session.user,
        title,
        alerts: req.alerts,
        referral: req.session.referral,
        page: 'purchases',
        props: JSON.stringify(props),
    });
});

module.exports = router;
