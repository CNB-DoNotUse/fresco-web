const express   = require('express');
const config    = require('../lib/config');
const router    = express.Router();

/**
 * Master dispatch page
 */
router.get('/', (req, res, next) => {
    //Check if the user is part of an outlet or they are at least aa CM
    if (!req.session.user.outlet) {
        return next({
            status: 401,
            message: config.ERR_PAGE_MESSAGES[401]
        });
    }

    var props = {
        user: req.session.user,
        outlet : req.session.user.outlet,
        title: 'Dispatch'
    }

    //Render dispatch page
    res.render('app', {
        title: 'Dispatch',
        props: JSON.stringify(props),
        alerts: req.alerts,
        referral: req.session.referral,
        page : 'dispatch'
    });
});

module.exports = router;
