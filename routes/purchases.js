const express = require('express');
const config = require('../lib/config');
const get = require('lodash/get');

const router = express.Router();

/**
 * Root purchases page
 */
router.get('/', (req, res, next) => {
    // Check if an Admin
    if (!get(req, 'session.user.permissions.get-all-purchases')) {
        next({
            message: config.ERR_PAGE_MESSAGES[403],
            status: 403,
        });

        return;
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
        page: 'purchases',
        props: JSON.stringify(props),
    });
});

module.exports = router;
