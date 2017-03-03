const express = require('express');
const config = require('../lib/config');
const request = require('request-json');
const router = express.Router();

/**
 * Admin page
 */
router.get('/', (req, res, next) => {
    if (!req.session.user || !req.session.user.roles.includes('admin')) {
        return next({
            message: config.ERR_PAGE_MESSAGES[403],
            status: 403
        });
    }

    const title = 'Admin';
    const props = {
        user : req.session.user,
        title
    };

    res.render('app', {
        title,
        alerts: req.alerts,
        page: 'admin',
        props: JSON.stringify(props)
    });
});

/**
 * Convienence route to send session token when developing.
 */
router.get('/token', (req, res, next) => {
    if(!req.session.user || req.session.user.rank < 1) {
        return res.send({});
    }

    return res.send(req.session.token);
});

module.exports = router;
