var express = require('express'),
    config = require('../lib/config'),
    request = require('request-json'),
    router = express.Router(),
    api = request.createClient(config.API_URL),
    React = require('react'),
    ReactDOMServer = require('react-dom/server'),
    photos = require('../app/server/photos.js');

/** //

	Description : Contnet Specific Routes ~ prefix /content/~

// **/


/**
 * Index Content Page
 */

router.get('/', function(req, res, next) {

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

  var purchases = null;

  if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified) {

    purchases = req.session.user.outlet.purchases || [];

    purchases = purchases.map(function(purchase) {
      return purchase.post;
    });

  }

  //Load photos page
  if (req.params.filter == 'photos') {

      var props = {
        user : req.session.user,
        purchases : purchases
      };

      var element = React.createElement(photos, props, null);

      console.log(photos);

      var reactString = ReactDOMServer.renderToString(element);

      res.render('photos', {
        title: 'Photos',
        user: req.session.user,
        page : 'photos',
        config: config,
        alerts: req.alerts,
        react : reactString,
        props : JSON.stringify(props)
      });

  }
  //Load videos page
  else if(req.params.filter == 'videos'){

      res.render('videos', {
        user: req.session.user,
        title: 'Videos',
        page : 'content',
        config: config,
        purchases: purchases,
        alerts: req.alerts,
      });

  }
  //Invalid paramaters
  else{

    return res.render('error', {
      error_code: 404,
      error_message: config.ERR_PAGE_MESSAGES[404]
    });
  }

});

module.exports = router;
