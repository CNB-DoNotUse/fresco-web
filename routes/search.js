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
		tags = req.query.tags || '';

	res.render('search', { user: req.session.user, query: query, tags: tags, title: query, purchases: purchases, config: config, alerts: req.alerts });
});

module.exports = router;