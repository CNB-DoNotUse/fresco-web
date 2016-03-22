var express   = require('express'),
    config    = require('../lib/config'),
    global    = require('../lib/global'),
    router    = express.Router();

/**
 * Master stats page
 */

router.get('/', (req, res, next) => {

    //Check if the user is part of an outlet or they are at least aa CM
    if (req.session.user.rank < global.RANKS.ADMIN) {
        var error = error(config.ERR_PAGE_MESSAGES[401]);
        error.status = 401;

        return next(error);
    }

    var props = {
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
