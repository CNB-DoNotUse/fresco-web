var express = require('express'),
	config = require('../lib/config'),
	router = express.Router();

router.get('/', function(req, res, next){
	 if (!req.session.user)
	 	return res.redirect('/');

	var purchases = null;
	if (req.session.user.outlet && req.session.user.outlet.verified){
		purchases = req.session.user.outlet.purchases || [];
		purchases = purchases.map(function(purchase){
			return purchase.post;
		});
	}

	var query = req.query.q,
		tags = req.query.tags || '',
		location = {
			lat: isNaN(req.query.lat) ? 40.7 : parseFloat(req.query.lat),
			lon: isNaN(req.query.lon) ? -74 : parseFloat(req.query.lon),
			radius: isNaN(req.query.r) ? null : parseFloat(req.query.r) 
		};

	res.render('search', { user: req.session.user, query: query, tags: tags, title: query, location: location, purchases: purchases, config: config, alerts: req.alerts });
});

module.exports = router;