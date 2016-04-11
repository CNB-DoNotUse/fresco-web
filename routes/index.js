var express       = require('express'),
    router        = express.Router(),
    requestJson   = require('request-json'),
    config        = require('../lib/config'),
    routes        = require('../lib/routes'),
    head          = require('../lib/head'),
    api           = requestJson.createClient(config.API_URL),
    superagent    = require('superagent');

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

        } else if(req.params.modal == 'partners') {
            res.redirect('/account');
        }
        //Not a modal, pass onto route sequence
        else {
            return next();
        }
    }
    //Redirect to dashboard home if the user is already logged in, instead of the landing page 
    else if(req.session.user != null) {
        return res.redirect('/highlights');
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
 * Parse Account Management iFrame
 */

router.get('/manage', (req, res, next) => {
  res.render('parse/manage');
});

router.get('/parse/reset', (req, res, next) => {
  res.render('parse/reset', {
      head: head,
      page: 'index',
      alerts: req.alerts
  });
});

router.get('/parse/reset-success', (req, res, next) => {
  res.render('parse/reset-success', {
      head: head,
      page: 'index',
      alerts: req.alerts
  });
});

/**
 * Outlet join page
 */

router.get('/join', (req, res, next) => {

    if (!req.query.o)
        return res.redirect('/');

    superagent
    .get(config.API_URL + '/v1/outlet/invite/get?token=' + req.query.o)
    .set('Accept', 'application/json')
    .end(function(err, response){

        console.log(response.body);

        if (err || !response || response.body.err) {

          req.session.alerts = ['This invitation couldn\'t be loaded. Please contact support@fresconews.com'];

          return req.session.save(() => {
            res.redirect('/');
            res.end();
          });
        }

        var body = response.body;

        return res.render('index', {
            page: 'index',
            user: body.data.user,
            email: body.data.email,
            token: body.data.token,
            title: body.data.outlet_title,
            alerts: req.alerts,
            modal: 'join',
            modals: routes.modals.concat('join'),
        });
    });
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

      req.session.user = body.data;
      
    }

    return req.session.save(() => {
      res.redirect('/');
      res.end();
    });
  }

});

router.get('/embed', (req, res, next) => { 
    res.render('embed');
});

module.exports = router;