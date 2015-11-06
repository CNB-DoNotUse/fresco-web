var express = require('express'),
    config = require('../lib/config');
var router = express.Router();

router.get('/', function(req, res, next) {  
  if (!req.session.user)
    return res.redirect('/');
  if (!(req.session.user.outlet || req.session.user.rank >= config.RANKS.CONTENT_MANAGER))
    return res.status(401).render('error', { user: req.session.user, error_code: 401, error_message: config.ERR_PAGE_MESSAGES[401] });
  
  res.render('dispatch', { pageindex: 6, title: 'Dispatch', user: req.session.user, config: config, alerts: req.alerts });
});

module.exports = router;
