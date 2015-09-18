
var config = require('../lib/config'),
	express = require('express'),
	router = express.Router();

/* Create user */
router.post('/parse/user/create', function(req, res, next) {
	var db = req.db,
		user = require('../lib/user'),
		params = {
			email : req.body.object.email,
			password: '0x' + req.body.object.objectId,
			username : req.body.object.username
		};

	user.add(db, params, function(err, user){
		if (err)
			return res.json({error: err.err}).end();
		else{
			req.body.object.frescoUserId = user._id;
			return res.json({success: req.body.object}).end();
		}
	});
});
/* Create user INCOMPLETE*/
router.post('/parse/user/login', function(req, res, next) {
	var db = req.db,
		user = require('../lib/user'),
		params = {
			email : req.body.object.email,
			password: '0x' + req.body.object.objectId,
			username : req.body.object.username
		};

	user.add(db, params, function(err, user){
		if (err)
			return res.json({error: err.err}).end();
		else{
			req.body.object.frescoUserId = user._id;
			return res.json({success: req.body.object}).end();
		}
	});
});

module.exports = router;