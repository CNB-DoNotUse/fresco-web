var express = require('express'),
  config = require('../lib/config'),
  router = express.Router();

router.get('/', function(req, res, next) {
  if (!req.session.user)
    return res.redirect('/');

  var purchases = null;
  if (req.session.user.outlet && req.session.user.outlet.verified) {
    purchases = req.session.user.outlet.purchases || [];
    purchases = purchases.map(function(purchase) {
      return purchase.post;
    });
  }

  var query = req.query.q,
    tags = req.query.tags || '',
    location = null;

  if (!isNaN(req.query.lat) && !isNaN(req.query.lon) && !isNaN(req.query.r))
    location = {
      latlng: {
        lat: parseFloat(req.query.lat),
        lng: parseFloat(req.query.lon)
      },
      radius: parseFloat(req.query.r)
    };
    
    var props = {
      user: req.session.user,
      title: query,
      location: location,
      purchases: purchases,
      config: config,
      query: query
    }

  res.render('app', {
    user: req.session.user,
    query: query,
    tags: tags,
    title: query,
    location: location,
    purchases: purchases,
    config: config,
    alerts: req.alerts,
    props: JSON.stringify(props),
		page : 'search'
  });
});

module.exports = router;
