var express = require('express'),
    Purchases = require('../lib/purchases'),
    router = express.Router();

router.get('/', (req, res, next) => {
    var purchases = null;

    if (req.session.user.outlet && req.session.user.outlet.verified) {
        purchases = Purchases.mapPurchases(req.session);
    }

    var query = req.query.q,
        tags = req.query.tags || [],
        location = {};

    if (!isNaN(req.query.lat) && !isNaN(req.query.lon) && !isNaN(req.query.radius)){
        location = {
            coordinates: {
                lat: parseFloat(req.query.lat),
                lng: parseFloat(req.query.lon)
            },
            radius: parseFloat(req.query.radius)
        };
    }

    var props = {
        user: req.session.user,
        location: location,
        tags: tags,
        purchases: purchases,
        query: query
    }

    res.render('app', {
        title: 'Search',
        alerts: req.alerts,
        props: JSON.stringify(props),
        page : 'search'
    });
});

module.exports = router;
