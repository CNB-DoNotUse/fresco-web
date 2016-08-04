const express   = require('express');
const config    = require('../lib/config');
const utils     = require('../lib/utils');
const router    = express.Router();

/**
 * Master stats page
 */
router.get('/', (req, res, next) => {
    //Check if the user is part of an outlet or they are at least aa CM
    if (req.session.user.rank < utils.RANKS.ADMIN) {
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
