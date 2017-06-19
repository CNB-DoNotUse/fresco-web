const express = require('express');
const config = require('../lib/config');
const router = express.Router();
const helper = require('../lib/helpers');

/**
 * Root purchases page
 */
router.get('/', (req, res, next) => {
    if (!helper.isAdmin(req.session.user)) {
        return next({
            message: config.ERR_PAGE_MESSAGES[403],
            status: 403,
        });
    }

    const title = 'Purchases';
    const props = {
        user: helper.userAdminRoles(req.session.user),
        title,
    };
// @ttention why is used being rendered twice
    res.render('app', {
        user: helper.userAdminRoles(req.session.user),
        title,
        alerts: req.alerts,
        referral: req.session.referral,
        page: 'purchases',
        props: JSON.stringify(props),
    });
});

module.exports = router;
