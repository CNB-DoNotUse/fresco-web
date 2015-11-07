var express = require('express'),
  config = require('../lib/config');
var router = express.Router();

/**
 * Master dispatch page
 */

router.get('/', function(req, res, next) {

  //Check if logged in
  if (!req.session.user)
    return res.redirect('/');

  //Check if the user is part of an outlet or they are at least an admin
  if (!(req.session.user.outlet || req.session.user.rank >= config.RANKS.CONTENT_MANAGER)){

    return res.status(401).render('error', {
      user: req.session.user,
      error_code: 401,
      error_message: config.ERR_PAGE_MESSAGES[401]
    });

  }

  //Render dispatch page
  res.render('dispatch', {
    title: 'Dispatch',
    user: req.session.user,
    config: config,
    alerts: req.alerts,
    page : 'dispatch'
  });

});

module.exports = router;
