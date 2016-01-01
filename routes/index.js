var express       = require('express'),
    router        = express.Router(),
    requestJson   = require('request-json'),
    config        = require('../lib/config'),
    routes        = require('../lib/routes'),
    head          = require('../lib/head'),
    api           = requestJson.createClient(config.API_URL)

/** //

Description : Client Index Routes

// **/

/**
 * Root index for the landing page
 */

router.get('/:modal?', (req, res, next) => {

    var modal;

    if(req.params.modal){

        if(routes.modals.indexOf(req.params.modal) > -1) {
            
            modal = req.params.modal;

        }
        //Not a modal, pass onto route sequence
        else {
            return next();
        }
    }

    res.render('index', {
        head: head,
        page: 'index',
        loggedIn: req.session.user ? true : false,
        modal: modal,
        modals: routes.modals,
        alerts: req.alerts
    });

});

/**
 * Outlet join page
 */

router.get('/join', (req, res, next) => {

  if (!req.query.o)
    return res.redirect('/');

  api.get('/v1/outlet/invite/get?token=' + req.query.o, doWithOutletInviteToken);

  function doWithOutletInviteToken(error, response, body) {

    if (error || !body) {
      req.session.alerts = ['Error connecting to server'];
      return req.session.save(() => {
        res.redirect(req.headers.Referer || '/join');
        res.end();
      });
    }
    if (body.err) {
      req.session.alerts = [config.resolveError(body.err)]; /* TODO: Fix this */
      return req.session.save(() => {
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

  }

});

/**
 * Email verify page
 */

router.get('/verify', (req, res, next) => {

    //Check if the user is logged in already
    if (req.session && req.session.user && req.session.user.verified) {

        req.session.alerts = ['Your email is already verified!'];

    return req.session.save(() => {
      res.redirect('/');
      res.end();
    });

    }

  //Check if the verification link query is valid
  if (!req.query.t) {
    req.session.alerts = ['Invalid verification link'];
    return req.session.save(() => {
      res.redirect('/');
      res.end();
    });
  }

  api.post('/v1/user/verify', {
    token: req.query.t
  }, doAfterUserVerify);

  function doAfterUserVerify(error, response, body) {

    if (error || !body) {

      req.session.alerts = ['Error connecting to server'];
      
      return req.session.save(() => {
        res.redirect('/');
        res.end();
      });

    }

    if (body.err) {

      req.session.alerts = [config.resolveError(body.err)];

      return req.session.save(() => {
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

    return req.session.save(() => {
      res.redirect('/');
      res.end();
    });
  }

});

module.exports = router;