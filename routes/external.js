var express 	= require('express'),
	config 		= require('../lib/config'),
	router 		= express.Router();

router.get('/parse/iframe/782658465784', (req, res, next) => {
   res.render('parse/user_management');
});

router.get('/parse/changepass/093824579359', (req, res, next) => {
  res.render('parse/password_change');
});

router.get('/parse/passupdated/738475292836', (req, res, next) => {
  res.render('parse/password_updated');
});

module.exports = router;
