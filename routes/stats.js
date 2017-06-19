const express   = require('express');
const config    = require('../lib/config');
const utils     = require('../lib/utils');
const router    = express.Router();
const helper = require('../lib/helpers');

/**
 * Master stats page
 */
router.get('/', (req, res, next) => {
    //Check if Admin
    if (!helper.isAdmin(req.session.user)) {
        return next({
            status: 401,
            message: config.ERR_PAGE_MESSAGES[401]
        });
    }

    const props = {
        user: helper.userAdminRoles(req.session.user),
        title: 'Stats'
    }

    //Render dispatch page
    res.render('app', {
        title: props.title,
        props: JSON.stringify(props),
        alerts: req.alerts,
        referral: req.session.referral,
        page : 'stats'
    });
});

module.exports = router;
