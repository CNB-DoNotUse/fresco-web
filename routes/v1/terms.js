var fs = require('fs'),
	routeLogger = require('../../lib/logger').child({route: 'terms'}),
	async = require('async'),
	express = require('express'),
	router = express.Router();

/* Mobile get post script. */
router.get('/', function(req, res, next) {
	var id = (''+req.query.id).trim(),
		logger = routeLogger.child({endpoint: 'terms', id: id});

	logger.info('Terms called');

	fs.readFile(
		'public/terms',
		'utf8',
		function(err, data){
			if (err)
				return res.json({err: err, data: ''}).end();
			
			res.json({err: null, data: data}).end();
		}
	);
});

module.exports = router;