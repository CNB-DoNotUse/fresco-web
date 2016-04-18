var express   = require('express'),
    config      = require('../lib/config'),
    global      = require('../lib/global'),
    request     = require('request-json'),
    router      = express.Router(),
    api         = request.createClient(config.API_URL);

/**
 * Root purcahses page
 */
router.get('/', (req, res, next) => {
    //Check if an Admin
    if (req.session.user.rank < global.RANKS.ADMIN) {
        //Return error
        return next({
            message: config.ERR_PAGE_MESSAGES[403],
            status: 403
        });
    }

    var title = 'Purchases',
        props = {
            user : req.session.user,
            title: title
        };

    res.render('app', {
        title: title,
        alerts: req.alerts,
        page: 'purchases',
        props: JSON.stringify(props)
    });
});


/**
 * Outlet purchases page
 */
router.get('/outlets', (req, res, next) => {
    //Check if an Admin
    if (req.session.user.rank < global.RANKS.ADMIN) {
        //Return error
        return next({
            message: config.ERR_PAGE_MESSAGES[403],
            status: 403
        });
    }

    var title = 'Outlet Purchases',
        props = {
            user : req.session.user,
            title: title
        };

    res.render('app', {
        title: title,
        alerts: req.alerts,
        page: 'outletStats',
        props: JSON.stringify(props)
    });
});


module.exports = router;
