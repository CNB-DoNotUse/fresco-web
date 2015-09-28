var express = require('express'),
    config = require('../lib/config'),
    request = require('request-json'),
    
    router = express.Router(),
    api = request.createClient(config.API_URL);

/* GET users listing. */
router.get('/settings', function(req, res, next){
  res.render('user-settings', { user: req.session.user, title: 'Profile Settings', config: config, alerts: req.alerts });
});

/* GET users listing. */
router.get('/:id', function(req, res, next){
  api.get('/v1/user/profile?id=' + req.params.id, function(error, response, body){
    if (error || !body){
      req.session.alerts = ['Error connecting to server'];
      return req.session.save(function(){
        res.redirect(req.headers['Referer'] || config.DASH_HOME);
      });
    }
    if (body.err){
      req.session.alerts = [config.resolveError(body.err)];
      return req.session.save(function(){
        res.redirect(req.headers['Referer'] || config.DASH_HOME);
      });
    }
    
    var purchases = null;
    if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified){
      purchases = req.session.user.outlet.purchases || [];
      purchases = purchases.map(function(purchase){
        return purchase.post;
      });
    }

    res.render('user', { title: body.data.firstname + ' ' + body.data.lastname, user: req.session.user, page_user: body.data, config: config, purchases: purchases, alerts: req.alerts });
  });
});

/* GET users listing. */
router.get('/', function(req, res, next){
  if (!req.session || !req.session.user)
    return res.redirect('/');
    
  var purchases = null;
	if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified){
		purchases = req.session.user.outlet.purchases || [];
		purchases = purchases.map(function(purchase){
			return purchase.post;
		});
	}
  
  res.render('user', { title: req.session.user.firstname + ' ' + req.session.user.lastname, user: req.session.user, page_user: req.session.user, config: config, purchases: purchases, alerts: req.alerts });
});

module.exports = router;
