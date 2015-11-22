var express = require('express'),
    config = require('../lib/config'),
    global = require('../lib/global'),
    request = require('request-json'),
    router = express.Router(),
    api = request.createClient(config.API_URL)

/** //

	Description : Contnet Specific Routes ~ prefix /content/~

// **/


/**
 * Index Content Page
 */

router.get('/', function(req, res, next) {

  var title = 'All content'; 
      purchases = config.mapPurchases(req.session),
      props = {
        user : req.session.user,
        purchases : purchases,
        title:title
      };

  res.render('app', {
    title: title,
    page : 'content',
    config: config,
    alerts: req.alerts,
    props : JSON.stringify(props)
  });

});

/**
 * Page for all galleries
 */

router.get('/galleries', function(req, res, next) {

  var title = 'Galleries',
      props = {
        user : req.session.user,
        title: title
      };

  res.render('app', {
    user: req.session.user,
    title: title,
    config: config,
    alerts: req.alerts,
    page: 'galleries',
    props : JSON.stringify(props)
  });

});

/**
 * Page for all stories
 */

router.get('/stories', function(req, res, next) {

  var title = 'Stories',
      props = {
        user : req.session.user
      };

  res.render('app', {
    title: title,
    config: config,
    alerts: req.alerts,
    page: 'stories',
    props : JSON.stringify(props)
  });

});

/**
 * Filters between photos or videos
 * @param {string} filter Filter of content type i.e. videos/photos
 */

router.get('/:filter', function(req, res, next) {

  //Check if the filter is valid first
  if(req.params.filter != 'videos' && req.params.filter != 'photos'){

    return res.render('error', {
      error_code: 404,
      error_message: config.ERR_PAGE_MESSAGES[404]
    });

  }

  var props = {
    user : req.session.user,
    purchases : config.mapPurchases(req.session)
  };

  //Load photos page
  if (req.params.filter == 'photos') {

    var title = 'Photos';

  }
  //Load videos page
  else if(req.params.filter == 'videos'){

    var title = 'Videos';

  }

  res.render('app', {
    title: title,
    user: req.session.user,
    page : req.params.filter,
    config: config,
    alerts: req.alerts,
    props : JSON.stringify(props)
  });


});


module.exports = router;
