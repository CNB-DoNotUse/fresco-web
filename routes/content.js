var express = require('express'),
  config = require('../lib/config'),
  request = require('request-json'),
  router = express.Router(),
  api = request.createClient(config.API_URL);

/**
 * Main content page
 */

router.get('/', function(req, res, next) {
  // if (!req.session.user || req.session.user.rank < config.RANKS.CONTENT_MANAGER)
  // 	return res.render('error', {error_code: 403, error_message: config.ERR_PAGE_MESSAGES[403]});
  var purchases = null;
  if (req.session && req.session.user && req.session.user.outlet && req.session
    .user.outlet.verified) {
    purchases = req.session.user.outlet.purchases || [];
    purchases = purchases.map(function(purchase) {
      return purchase.post;
    });
  }

  res.render('content', {
    user: req.session.user,
    title: 'All content',
    config: config,
    purchases: purchases,
    alerts: req.alerts,
    page: 'content'
  });

});

/**
 * Page for all galleries
 */

router.get('/galleries', function(req, res, next) {
  // if (!req.session.user || req.session.user.rank < config.RANKS.CONTENT_MANAGER)
  // 	return res.render('error', {error_code: 403, error_message: config.ERR_PAGE_MESSAGES[403]});

  res.render('galleries', {
    user: req.session.user,
    title: 'Galleries',
    config: config,
    alerts: req.alerts,
    page: 'galleries'
  });

});

/**
 * Page for all stories
 */

router.get('/stories', function(req, res, next) {
  // if (!req.session.user || req.session.user.rank < config.RANKS.CONTENT_MANAGER)
  // 	return res.render('error', {error_code: 403, error_message: config.ERR_PAGE_MESSAGES[403]});

  res.render('stories', {
    user: req.session.user,
    title: 'Stories',
    config: config,
    alerts: req.alerts,
    page: 'stories'
  });

});

/**
 * Filters between photos or videos
 */

router.get('/:filter', function(req, res, next) {
  // if (!req.session.user || req.session.user.rank < config.RANKS.CONTENT_MANAGER)
  // 	return res.render('error', {error_code: 403, error_message: config.ERR_PAGE_MESSAGES[403]});

  if (req.params.filter != 'photos' && req.params.filter != 'videos') {
    return res.render('error', {
      error_code: 404,
      error_message: config.ERR_PAGE_MESSAGES[404]
    });
  }

  var purchases = null;
  if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified) {
    purchases = req.session.user.outlet.purchases || [];
    purchases = purchases.map(function(purchase) {
      return purchase.post;
    });
  }

  res.render('content', {
    user: req.session.user,
    title: (req.params.filter == 'photos' ? 'Photos' : 'Videos'),
		page : 'content',
    config: config,
    purchases: purchases,
    alerts: req.alerts,
  });

});

module.exports = router;
