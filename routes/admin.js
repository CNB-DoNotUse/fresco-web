var express   = require('express'),
    config    = require('../lib/config'),
    request   = require('request-json'),
    router    = express.Router(),
    api       = request.createClient(config.API_URL);

/* GET home page. */
router.get('/', (req, res, next) => {

  if (!req.session.user || req.session.user.rank < 1){
    return next({
      message: config.ERR_PAGE_MESSAGES[403],
      status: 403
    })
  }

  var title = 'Admin',
    props = {
    user : req.session.user,
    title: title
  };

  res.render('app', {
    title: title,
    alerts: req.alerts,
		page: 'admin',
    props: JSON.stringify(props)
  });

});

/**
 * Convienence route to send session token when developing.
 */
router.get('/token', (req, res, next) => {

  if(!req.session.user || req.session.user.rank < 1) {

    return res.send({});

  }

  return res.send(req.session.token);

});

module.exports = router;
