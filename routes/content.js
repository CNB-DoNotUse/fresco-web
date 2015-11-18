var express = require('express'),
    config = require('../lib/config'),
    request = require('request-json'),
    router = express.Router(),
    api = request.createClient(config.API_URL),
    React = require('react'),
    ReactDOMServer = require('react-dom/server'),
    photos = require('../app/server/photos.js'),
    videos = require('../app/server/videos.js'),
    stories = require('../app/server/stories.js');
    galleries = require('../app/server/galleries.js');

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

  var props = {
    user : req.session.user
  };

  var element = React.createElement(galleries, props, null);

  var reactString = ReactDOMServer.renderToString(element);

  res.render('galleries', {
    user: req.session.user,
    title: 'Galleries',
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

  var props = {
    user : req.session.user
  };

  var element = React.createElement(stories, props, null);

  var reactString = ReactDOMServer.renderToString(element);

  res.render('stories', {
    user: req.session.user,
    title: 'Stories',
    config: config,
    alerts: req.alerts,
    page: 'stories',
    react: reactString,
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

  var purchases = null;

  if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified) {

    purchases = req.session.user.outlet.purchases || [];

    purchases = purchases.map(function(purchase) {
      return purchase.post;
    });

  }

  var props = {
    user : req.session.user,
    purchases : purchases
  };

  //Load photos page
  if (req.params.filter == 'photos') {

      var reactString = ReactDOMServer.renderToString(
                          React.createElement(
                            photos, 
                            props, 
                            null
                          )
                        ),
          title = 'Photos';

  }
  //Load videos page
  else if(req.params.filter == 'videos'){

    var reactString = ReactDOMServer.renderToString(
                        React.createElement(
                          videos, 
                          props, 
                          null
                        )
                      ),
        title = 'Videos';

  }

  res.render('photos', {
    title: title,
    user: req.session.user,
    page : 'photos',
    config: config,
    alerts: req.alerts,
    react : reactString,
    props : JSON.stringify(props)
  });


});

module.exports = router;
