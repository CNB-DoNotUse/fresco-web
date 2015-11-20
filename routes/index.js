var express = require('express'),
  router = express.Router(),
  requestJson = require('request-json'),
  config = require('../lib/config'),
  api = requestJson.createClient(config.API_URL),
  React = require('react'),
  ReactDOMServer = require('react-dom/server'),
  highlights = require('../app/server/highlights')

/** //

Description : Client Index Routes

// **/

/**
 * Root index for the landing page
 */

router.get('/', function(req, res, next) {

  api.get('/v1/gallery/highlights', function(error, response, body) {
    var highlights = [];

    if (!error && body && !body.err)
      highlights = body.data;


    res.render('app', {
      user: req.session ? req.session.user : null,
      highlights: highlights,
      config: config,
      alerts: req.alerts,
      partner: false
    });

  });

});

/**
 * Partners page, loads on top of landing page
 */

router.get('/partners', function(req, res, next) {
  api.get('/v1/gallery/highlights', function(error, response, body) {

    var highlights = [];

    if (!error && body && !body.err)
      highlights = body.data;

    res.render('index', {
      user: req.session ? req.session.user : null,
      highlights: highlights,
      config: config,
      alerts: req.alerts,
      partner: true
    });

  });
});

/**
 * Promo page
 */

router.get('/promo', function(req, res, next) {
  res.render('promo', {
    user: req.session ? req.session.user : null,
    config: config,
    alerts: req.alerts
  });
});

/**
 * Main highlights page
 */

router.get('/highlights', function(req, res, next) {

  var  props = {
        user : req.session.user,
        title:title
      },
      elm = React.createElement(highlights, props, null),
      react = ReactDOMServer.renderToString(elm),
      title = 'Highlights';

  res.render('app', {
    user: req.session ? req.session.user : null,
    config: config,
    alerts: req.alerts,
    react: '',
    page : 'highlights',
    title : title,
    props : JSON.stringify(props)
  });

});


/**
 * Outlet join page
 */

router.get('/join', function(req, res, next) {

  if (!req.query.o)
    return res.redirect('/');

  api.get('/v1/outlet/invite/get?token=' + req.query.o, function(error, response, body) {

    if (error || !body) {
      req.session.alerts = ['Error connecting to server'];
      return req.session.save(function() {
        res.redirect(req.headers.Referer || '/join');
        res.end();
      });
    }
    if (body.err) {
      req.session.alerts = [config.resolveError(body.err)];
      return req.session.save(function() {
        res.redirect(req.headers.Referer || '/join');
        res.end();
      });
    }

    return res.render('join', {
      user: body.data.user,
      email: body.data.email,
      token: req.query.o,
      outlet_title: body.data.outlet_title,
      alerts: req.alerts
    });

  });
});

/**
 * Email verify page
 */

router.get('/verify', function(req, res, next) {

  //Check if the user is logged in already
  if (req.session && req.session.user && req.session.user.verified) {

    req.session.alerts = ['Your email is already verified!'];

    return req.session.save(function() {
      res.redirect('/');
      res.end();
    });

  }

  //Check if the verification link query is valid
  if (!req.query.t) {
    req.session.alerts = ['Invalid verification link'];
    return req.session.save(function() {
      res.redirect('/');
      res.end();
    });
  }

  api.post('/v1/user/verify', {
    token: req.query.t
  }, function(error, response, body) {

    if (error || !body) {
      req.session.alerts = ['Error connecting to server'];
      return req.session.save(function() {
        res.redirect('/');
        res.end();
      });
    }

    if (body.err) {
      req.session.alerts = [config.resolveError(body.err)];
      return req.session.save(function() {
        res.redirect('/');
        res.end();
      });
    }

    req.session.alerts = ['Your email has been verified!'];
    if (req.session && req.session.user) {
      var token = req.session.user.token;
      req.session.user = body.data;
      req.session.user.token = token;
    }
    return req.session.save(function() {
      res.redirect('/');
      res.end();
    });
  });

});

module.exports = router;
