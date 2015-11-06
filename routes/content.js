var express = require('express'),
	config = require('../lib/config'),
	request = require('request-json'),
	
	router = express.Router(),
	api = request.createClient(config.API_URL);

/* GET home page. */
router.get('/', function(req, res, next) {
	// if (!req.session.user || req.session.user.rank < config.RANKS.CONTENT_MANAGER)
	// 	return res.render('error', {error_code: 403, error_message: config.ERR_PAGE_MESSAGES[403]});
	var purchases = null;
	if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified){
		purchases = req.session.user.outlet.purchases || [];
		purchases = purchases.map(function(purchase){
			return purchase.post;
		});
	}

	res.render('content', { pageindex: 1, user: req.session.user, title: 'All content', config: config, purchases: purchases, alerts: req.alerts });
});


/* GET home page. */
router.get('/galleries', function(req, res, next) {
	// if (!req.session.user || req.session.user.rank < config.RANKS.CONTENT_MANAGER)
	// 	return res.render('error', {error_code: 403, error_message: config.ERR_PAGE_MESSAGES[403]});

	res.render('galleries', { pageindex: 4, user: req.session.user, title: 'Galleries', config: config, alerts: req.alerts });
});

router.get('/stories', function(req, res, next) {
	// if (!req.session.user || req.session.user.rank < config.RANKS.CONTENT_MANAGER)
	// 	return res.render('error', {error_code: 403, error_message: config.ERR_PAGE_MESSAGES[403]});

	res.render('stories', { pageindex: 5, user: req.session.user, title: 'Stories', config: config, alerts: req.alerts });
});

/* GET home page. */
router.get('/:filter', function(req, res, next) {
	// if (!req.session.user || req.session.user.rank < config.RANKS.CONTENT_MANAGER)
	// 	return res.render('error', {error_code: 403, error_message: config.ERR_PAGE_MESSAGES[403]});
	if (req.params.filter != 'photos' && req.params.filter != 'videos')
		return res.render('error', {error_code: 404, error_message: config.ERR_PAGE_MESSAGES[404]});

	var purchases = null;
	if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified){
		purchases = req.session.user.outlet.purchases || [];
		purchases = purchases.map(function(purchase){
			return purchase.post;
		});
	}
	
	res.render('content', { pageindex: (req.params.filter === 'photos' ? 2 : 3), user: req.session.user, title: (req.params.filter === 'photos' ? 'Photos' : 'Videos'), config: config, purchases: purchases, alerts: req.alerts });
});

module.exports = router;
