var express     = require('express'),
    config      = require('../lib/config'),
    global      = require('../lib/global'),
    outer       = express.Router(),
    request     = require('request-json'),
    config      = require('../lib/config'),
    client      = request.createClient(config.API_URL),
    router      = express.Router();

/** //

	Description : Outlet Specific Routes ~ prefix /outlet/endpoint

// **/

/**
 * Outlet page for currently logged in user
 */

 router.get('/', (req, res, next) => {

  //Check if we're logged n
  if (!req.session || !req.session.user || !req.session.user.outlet)
    return res.redirect(config.DASH_HOME);

  //Retrieve outlet object from api
  client.get('/v1/outlet/get?id=' + req.session.user.outlet._id, doWithOutletInfo);

  function doWithOutletInfo(error, response, body) {

    if (error || !body || body.err){

        var error = new Error(config.ERR_PAGE_MESSAGES[404]);
        error.status = 404;

        return next(error);

    }

    var purchases = null;

    if (req.session.user.outlet.verified) {
      
      purchases = config.mapPurchases();

    } else {
      req.alerts.push(req.session.user._id == req.session.user.outlet.owner ?
        'This outlet is in demo mode. We’ll be in touch shortly to verify your account.' :
        'This outlet is in demo mode. Purchases and downloads are currently disabled.');
    }

      var title = 'Outlet',
          props = {
            title: title,
            user: req.session.user,
            outlet: body.data,
            purchases: purchases
          }

    res.render('app', {
      title: title,
      config: config,
      alerts: req.alerts,
      props: JSON.stringify(props),
      page: 'outlet'
    });

  }

});

/**
 * Displays galleries for a specified outlet
 */

 router.get('/:id/galleries', (req, res, next) => {

  client.get('/v1/outlet/get?id=' + req.params.id, doWithOutletInfo);

  function doWithOutletInfo(error, response, body) {

    if (error || !body || body.err){
      var err = new Error(config.ERR_PAGE_MESSAGES[404]);
      err.status = 403;
      return next(err);
    }

    var purchases = null;

    if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified) {
      purchases = req.session.user.outlet.purchases || [];
      purchases = purchases.map((purchase) => {
        return purchase.post;
      });
    }

    res.render('outlet-galleries', {
      user: req.session.user,
      title: 'Outlet',
      outlet: body.data,
      purchases: purchases,
      config: config,
      alerts: req.alerts,
      page: 'outlet-galleries'
    });
  
  }

});

/**
 *  Outlet settings page for current logged in user
 */

 router.get('/settings', (req, res, next) => {
  
  if (!req.session.user.outlet){

    var err = new Error('No outlet found!');
    err.status = 500;
    return next(err);

  }

  client.get('/v1/outlet/get?id=' + req.session.user.outlet._id, doWithOutletInfo);
  
  function doWithOutletInfo(error, response, body) {

    if (error || !body || body.err || body.data.owner._id != req.session.user._id){
      var err = new Error('Unauthorized');
      err.status = 403;
      return next(err);
    }

    var title = 'Outlet Settings',
        props = {
          title: title,
          user: req.session.user,
          outlet: body.data,
          stripePublishableKey: config.STRIPE_PUBLISHABLE
        }

    res.render('app', {
      user: req.session.user,
      outlet: body.data,
      title: title,
      page: 'outletSettings',
      alerts: req.alerts,
      remoteScripts: ['https://js.stripe.com/v2/'],
      props: JSON.stringify(props)
    });

  }

});

/**
 *  Outlet page for specified outlet
 */

 router.get('/:id', (req, res, next) => {
  if (!req.session || !req.session.user || req.session.user.rank < global.RANKS.CONTENT_MANAGER)
    return res.redirect('/outlet');

  client.get('/v1/outlet/get?id=' + req.params.id, doWithOutletInfo);

  function doWithOutletInfo(error, response, body) {
    if (error || !body || body.err){

      var err = new Error(config.ERR_PAGE_MESSAGES[404]);
      err.status = 404;
      return next(err);

    }
 
    res.render('outlet', {
      user: req.session.user,
      title: 'Outlet',
      outlet: body.data,
      purchases:  config.mapPurchases(),
      config: config,
      alerts: req.alerts
    });
  
  }

});

module.exports = router;