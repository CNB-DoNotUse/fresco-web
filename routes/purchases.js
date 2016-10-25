const express     = require('express');
const config      = require('../lib/config');
const utils       = require('../lib/utils');
const request     = require('request-json');
const router      = express.Router();
const api         = request.createClient(config.API_URL);

/**
 * Root purchases page
 */
router.get('/', (req, res, next) => {
    //Check if an Admin
    if (!req.session.user.permissions.includes('get-all-purchases')) {
        return next({
            message: config.ERR_PAGE_MESSAGES[403],
            status: 403
        });
    }

    const title = 'Purchases';
    const props = {
        user : req.session.user,
        title
    };

    res.render('app', {
        user: req.session.user,
        title,
        alerts: req.alerts,
        page: 'purchases',
        props: JSON.stringify(props)
    });
});

module.exports = router;
