var express = require('express'),
  router = express.Router(),
  requestJson = require('request-json'),
  config = require('../lib/config'),
  head = require('../lib/head'),
  api = requestJson.createClient(config.API_URL)

/**
 * Main highlights page
 */

router.get('/', function(req, res, next) {

  var title = 'Highlights',
      props = {
        user : req.session.user,
        title: title
      };

  res.render('app', {
    user: req.session ? req.session.user : null,
    config: config,
    alerts: req.alerts,
    page : 'highlights',
    title : title,
    props : JSON.stringify(props)
  });

});

module.exports = router;