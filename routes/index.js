var express = require('express');
var router = express.Router();
var requestJson = require('request-json');
var config = require('../lib/config');
var api = requestJson.createClient(config.API_URL);

/* Home page. */
router.get('/', function(req, res, next) {
  api.get('/v1/gallery/highlights', function(error, response, body){
    var highlights = [];
    
    if (!error && body && !body.err)
      highlights = body.data
    
    res.render('index', { user: req.session.user, highlights: highlights, config: config, alerts: req.alerts, partner: false });
  });
});

router.get('/partners', function(req, res, next){
  api.get('/v1/gallery/highlights', function(error, response, body){
    var highlights = [];
    
    if (!error && body && !body.err)
      highlights = body.data
    
    res.render('index', { user: req.session.user, highlights: highlights, config: config, alerts: req.alerts, partner: true });
  });
});

/* Highlights page. */
router.get('/highlights', function(req, res, next) {
	var purchases = null;
	if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified){
		purchases = req.session.user.outlet.purchases || [];
		purchases = purchases.map(function(purchase){
			return purchase.post;
		});
	}
  
  res.render('highlights', {user: req.session.user, purchases: purchases, config : config, alerts: req.alerts});
});

/* Register page. */
router.get('/join', function(req, res, next) {
  if (!req.query.o)
    return res.redirect('/');
    
  api.get('/v1/outlet/invite/get?token='+req.query.o, function(error, response, body){console.log(body);
    if (error || !body){
      req.session.alerts = ['Error connecting to server'];
      return req.session.save(function(){
        res.redirect(req.headers['Referer'] || '/join');
        res.end();
      });
    }
    if (body.err){
      req.session.alerts = [config.resolveError(body.err)];
      return req.session.save(function(){
        res.redirect(req.headers['Referer'] || '/join');
        res.end();
      });
    }
    
    return res.render('join', { user: body.data.user, email: body.data.email, token: req.query.o, outlet_title: body.data.outlet_title, alerts: req.alerts });
  });
});

/* Email verify page. */
router.get('/verify', function(req, res, next) {
  if (req.session && req.session.user && req.session.user.verified){
      req.session.alerts = ['Your email is already verified!'];
      return req.session.save(function(){
        res.redirect('/');
        res.end();
      });
  }
  if (!req.query.t){
      req.session.alerts = ['Invalid verification link'];
      return req.session.save(function(){
        res.redirect('/');
        res.end();
      });
  }
  
  api.post('/v1/user/verify', { token: req.query.t }, function(error, response, body){
    if (error || !body){
      req.session.alerts = ['Error connecting to server'];
      return req.session.save(function(){
        res.redirect('/');
        res.end();
      });
    }
    if (body.err){
      req.session.alerts = [config.resolveError(body.err)];
      return req.session.save(function(){
        res.redirect('/');
        res.end();
      });
    }
    
    req.session.alerts = ['Your email has been verified!'];
    if (req.session && req.session.user){
      var token = req.session.user.token;
      req.session.user = body.data;
      req.session.user.token = token;
    }
    return req.session.save(function(){
      res.redirect('/');
      res.end();
    });
  });
});

module.exports = router;