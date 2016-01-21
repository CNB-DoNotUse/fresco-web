var express   = require('express'),
    config      = require('../lib/config'),
    global      = require('../lib/global'),
    request     = require('request-json'),
    router      = express.Router(),
    api         = request.createClient(config.API_URL);

/**
 * Root purcahses page
 */

router.get('/', (req, res, next) => {
  
  //Check if an Admin
  if (req.session.user.rank < global.RANKS.ADMIN) {
      var error = new Error(config.ERR_PAGE_MESSAGES[403]);
      error.status = 403;
      return next(error);
  }

  var title = 'Purchases',
    props = {
    user : req.session.user,
    title: title
  };

  res.render('app', {
    user: req.session.user,
    title: title,
    config: config,
    alerts: req.alerts,
    page: 'purchases',
    props: JSON.stringify(props)

  });

});

module.exports = router;
