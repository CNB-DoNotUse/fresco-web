var express = require('express'),
  config = require('../lib/config'),
  request = require('request-json'),

  router = express.Router(),
  api = request.createClient(config.API_URL);

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session.user || req.session.user.rank < 1)
    return res.render('error', {
      error_code: 403,
      error_message: config.ERR_PAGE_MESSAGES[403]
    });

  res.render('admin', {
    user: req.session.user,
    title: 'Admin',
    config: config,
    alerts: req.alerts,
		page : 'admin'
  });

});

module.exports = router;
