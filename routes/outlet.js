var express = require('express'), config = require('../lib/config');
var router = express.Router();
var request = require('request-json');
var config = require('../lib/config');
var client = request.createClient(config.API_URL);

router.get('/', function(req, res, next){
  if (!req.session || !req.session.user || !req.session.user.outlet)
    return res.redirect(config.DASH_HOME);
  
  client.get('/v1/outlet/get?id=' + req.session.user.outlet._id, function(error, response, body){
    if (error || !body || body.err)
      return res.status(404).render('error', {user: req.session.user, error_code: 404, error_message: config.ERR_PAGE_MESSAGES[404]});
    
    var purchases = null;
    
    if (req.session.user.outlet.verified){
      purchases = req.session.user.outlet.purchases || [];
      purchases = purchases.map(function(purchase){
        return purchase.post;
      });
    }else{
      req.alerts.push(req.session.user._id == req.session.user.outlet.owner ?
        'This outlet is in demo mode. We’ll be in touch shortly to verify your account.<div><a>OK</a></div>' :
        'This outlet is in demo mode. Purchases and downloads are currently disabled.<div><a>OK</a></div>');
    }
  
    res.render('outlet', { user: req.session.user, title: 'Outlet', outlet: body.data, purchases: purchases, config: config, alerts: req.alerts });
  });
});

router.get('/:id/galleries', function(req, res, next){
  client.get('/v1/outlet/get?id=' + req.params.id, function(error, response, body){
    if (error || !body || body.err)
      return res.status(404).render('error', {user: req.session.user, error_code: 404, error_message: config.ERR_PAGE_MESSAGES[404]});
    
    var purchases = null;
    if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified){
      purchases = req.session.user.outlet.purchases || [];
      purchases = purchases.map(function(purchase){
        return purchase.post;
      });
    }
    
    res.render('outlet-galleries', { user: req.session.user, title: 'Outlet', outlet: body.data, purchases: purchases, config: config, alerts: req.alerts });
  });
});

router.get('/settings', function(req, res, next){
  if (!req.session.user.outlet)
    return res.render('error', { user: req.session.user, error_code: 404, error_message: config.ERR_PAGE_MESSAGES[404] });
  
  client.get('/v1/outlet/get?id=' + req.session.user.outlet._id, function(error, response, body){
    if (error || !body || body.err || body.data.owner._id != req.session.user._id)
      return res.status(404).render('error', {user: req.session.user, error_code: 404, error_message: config.ERR_PAGE_MESSAGES[404]});
    
    res.render('outlet-settings', { user: req.session.user, outlet: body.data, title: 'Outlet', config: config, alerts: req.alerts });
  });
});

router.get('/:id', function(req, res, next){
  if (!req.session || !req.session.user || req.session.user.rank < config.RANKS.CONTENT_MANAGER)
    return res.redirect('/outlet');
  
  client.get('/v1/outlet/get?id=' + req.params.id, function(error, response, body){
    if (error || !body || body.err)
      return res.status(404).render('error', {user: req.session.user, error_code: 404, error_message: config.ERR_PAGE_MESSAGES[404]});
          
    var purchases = null;
    if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified){
      purchases = req.session.user.outlet.purchases || [];
      purchases = purchases.map(function(purchase){
        return purchase.post;
      });
    }
    
    res.render('outlet', { user: req.session.user, title: 'Outlet', outlet: body.data, purchases: purchases, config: config, alerts: req.alerts });
  });
});

module.exports = router;
