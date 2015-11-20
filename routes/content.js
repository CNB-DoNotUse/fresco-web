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
    galleries = require('../app/server/galleries.js'),
    content = require('../app/server/content.js');

/** //

	Description : Contnet Specific Routes ~ prefix /content/~

// **/


/**
 * Index Content Page
 */

router.get('/', function(req, res, next) {

  var purchases = mapPurchases(req.session),
      elm = React.createElement(content, props, null),
      react = ReactDOMServer.renderToString(elm),
      title = 'All content',
      props = {
        user : req.session.user,
        purchases : purchases,
        title:title
      };

  res.render('app', {
    title: title,
    user: req.session.user,
    page : 'content',
    config: config,
    alerts: req.alerts,
    react : reactString,
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

  var props = {
        user : req.session.user
      },
      elm = React.createElement(galleries, props, null),
      react = ReactDOMServer.renderToString(elm),
      title = 'Stories';

  res.render('app', {
    user: req.session.user,
    title: title,
    config: config,
    alerts: req.alerts,
    page: 'galleries',
    react: react,
    props : JSON.stringify(props)
  });

});

/**
 * Page for all stories
 */

router.get('/stories', function(req, res, next) {

  var props = {
        user : req.session.user
      },
      elm = React.createElement(stories, props, null),
      react = ReactDOMServer.renderToString(elm),
      title = 'Stories';

  res.render('app', {
    user: req.session.user,
    title: title,
    config: config,
    alerts: req.alerts,
    page: 'stories',
    react: react,
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
    purchases : mapPurchases(req.session)
  };

  //Load photos page
  if (req.params.filter == 'photos') {

    var elm = React.createElement(photos, props, null),
        react = ReactDOMServer.renderToString(elm),
        title = 'Photos';

  }
  //Load videos page
  else if(req.params.filter == 'videos'){

    var elm = React.createElement(videos, props, null),
        react = ReactDOMServer.renderToString(elm),
        title = 'Videos';

  }

  res.render('app', {
    title: title,
    user: req.session.user,
    page : req.params.filter,
    config: config,
    alerts: req.alerts,
    react : react,
    props : JSON.stringify(props)
  });


});

function mapPurchases(session){

  var purchases = [];

  if (session && session.user && session.user.outlet && session.user.outlet.verified) {

    purchases = session.user.outlet.purchases || [];

    purchases = purchases.map(function(purchase) {
      return purchase.post;
    });

  }

  return purchases;

}

module.exports = router;
