var express = require('express'),
  config = require('../lib/config'),
  Purchases = require('../lib/purchases'),
  router = express.Router();

router.get('/', function(req, res, next) {
    if (!req.session.user)
        return res.redirect('/');

    var purchases = null;

    if (req.session.user.outlet && req.session.user.outlet.verified) {
        purchases = Purchases.mapPurchases(req.session);
    }

    var query = req.query.q,
        tags = req.query.tags || '',
        location = null;

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
        title: query || tags,
        location: location,
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
