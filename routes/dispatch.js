var express   = require('express'),
    config    = require('../lib/config'),
    global    = require('../lib/global'),
    router    = express.Router();

/**
 * Master dispatch page
 */

router.get('/', (req, res, next) => {

  //Check if the user is part of an outlet or they are at least aa CM
  if (!(req.session.user.outlet || req.session.user.rank >= global.RANKS.CONTENT_MANAGER)){
      var error = error(config.ERR_PAGE_MESSAGES[401]);
      error.status = 401;

      return next(error);
  }

  var props = {
    user: req.session.user,
    outlet : req.session.user.outlet,
    title: 'Dispatch'
  }

  //Render dispatch page
  res.render('app', {
    title: 'Dispatch',
    props: JSON.stringify(props),
    alerts: req.alerts,
    page : 'dispatch'
  });

});

module.exports = router;
