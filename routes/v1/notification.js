
var config = require('../../lib/config'),
	Notification = require('../../lib/notification'),
	routeLogger = require('../../lib/logger').child({route: 'notification'}),
	express = require('express'),
	router = express.Router();

/* List notifications */
router.get('/list', function(req, res, next) {
	var db = req.db,
		params = {
			user : (''+req.query.id).trim(),
			offset: req.query.offset ? parseInt(req.query.offset) : 0,
			limit: req.query.limit ? parseInt(req.query.limit) : 10
		},
		logger = routeLogger.child({endpoint: 'list', params: params, req_id: req.req_id});

	logger.info('Notification list called');

	Notification.getByUser(db, params, function(err, result){
		if(err) logger.warn(err.err);
		res.json({err: err ? err.err : null, data: result}).end();
	});
});

/* See notification */
router.post('/see', function(req, res, next) {
	var db = req.db,
		id = (''+req.body.id).trim(),
		logger = routeLogger.child({endpoint: 'see', id: id, req_id: req.req_id});

	logger.info('Notification see called');

	Notification.see(db, id, function(err, result){console.log(err);
		if(err) logger.warn(err.err);
		res.json({err: err ? err.err : null, data: result}).end();
	});
});

/* Delete notification */
router.post('/delete', function(req, res, next) {
	var db = req.db,
		id = (''+req.body.id).trim(),
		logger = routeLogger.child({endpoint: 'delete', id: id, req_id: req.req_id});

	logger.info('Notification delete called');

	Notification.remove(db, id, function(err, result){
		if(err) logger.warn(err.err)
		res.json({err: err ? err.err : null, data: result}).end();
	});
});

module.exports = router;