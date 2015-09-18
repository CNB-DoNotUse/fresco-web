var express = require('express'), config = require('../lib/config');
var router = express.Router();

router.get('/:id', function(req, res, next) {
	var purchases = null;
	if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified){
		purchases = req.session.user.outlet.purchases || [];
		purchases = purchases.map(function(purchase){
			return purchase.post;
		});
	}
  
	res.render('story', {user: req.session.user,  story_id: req.params.id, purchases: purchases, config : config, alerts: req.alerts});
});

module.exports = router;