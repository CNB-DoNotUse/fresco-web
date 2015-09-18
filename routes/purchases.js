var express = require('express'), config = require('../lib/config');
var router = express.Router();
var request = require('request-json');
var async = require('async');
var api = request.createClient(config.API_URL);

router.get('/', function(req, res, next){
  if(!req.session.user || req.session.user.rank < 1)
    return res.render('error', {error_code: 403, error_message: config.ERR_PAGE_MESSAGES[403]});
  
  res.render('purchases', {user: req.session.user, title: 'Purchases', config: config, alerts: req.alerts});
});

module.exports = router;
