var express   = require('express'),
    config    = require('../lib/config'),
    router    = express.Router();

/**
 * Master dispatch page
 */

router.get('/', (req, res, next) => {

  //Check if logged in
  if (!req.session.user)
    return res.redirect('/');

  //Check if the user is part of an outlet or they are at least an admin
  if (!(req.session.user.outlet || req.session.user.rank >= config.RANKS.CONTENT_MANAGER)){

      var error = error(config.ERR_PAGE_MESSAGES[401]);
      error.status = 401;

      return next(error);

  }

  var props = {
    user: req.session.user,
    title: 'Dispatch'
  }

  //Render dispatch page
  res.render('app', {
    title: 'Dispatch',
    user: req.session.user,
    props: JSON.stringify(props),
    config: config,
    alerts: req.alerts,
    page : 'dispatch'
  });

});

module.exports = router;
