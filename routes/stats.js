const express   = require('express');
const config    = require('../lib/config');
const utils     = require('../lib/utils');
const router    = express.Router();

/**
 * Master stats page
 */
router.get('/', (req, res, next) => {
    //Check if Admin
    if (!req.session.user.roles.includes('admin')) {
        return next({
            status: 401,
            message: config.ERR_PAGE_MESSAGES[401]
        });
    }

    const props = {
        user: req.session.user,
        title: 'Stats'
    }

    //Render dispatch page
    res.render('app', {
        title: props.title,
        props: JSON.stringify(props),
        alerts: req.alerts,
        page : 'stats'
    });
});

module.exports = router;
