var config = require('../../lib/config'),
	Post = require('../../lib/post'),
	User = require('../../lib/user'),
	AuthToken = require('../../lib/authtoken'),
	routeLogger = require('../../lib/logger').child({route: 'post'}),
	async = require('async'),
	express = require('express'),
	router = express.Router();

/* Mobile get post script. */
router.get('/get', function(req, res, next) {
	var db = req.db,
		id = (''+req.query.id).trim(),
		logger = routeLogger.child({endpoint: 'get', id: id});

	logger.info('Post get called');

	Post.get(db, id, function(err, post_obj){
		if (err){
			logger.warn({step: 'get'}, err.err);
			return res.json({err: err.err, data: {}}).end();
		}
		
		Post.unpack(db, post_obj, function(err, deep_post){
			if(err) logger.warn({step: 'unpack'}, err.err);
			return res.json({err: err ? err.err : null, data: deep_post}).end();
		});
	});
});

/* Mobile get post script. */
router.get('/gallery', function(req, res, next) {
	var db = req.db,
		id = req.query.id,
		logger = routeLogger.child({endpoint: 'get', id: id}),
		Gallery = require('../../lib/gallery');

	logger.info('Post get gallery called');

	db.get(config.COLLECTION_GALLERIES).find(
		{
			posts: {
				$in: [
					id
				]
			}
		},
		{
			limit: 1,
			sort: {
				time_created: -1
			}
		},
		function(err, doc){
			if (err)
				return res.json({err: err.err, data: {}}).end();
			if (doc.length == 0)
				return res.json({err: 'ERR_NOT_FOUND', data: {}}).end();
			
			var gallery = new Gallery(doc[0]._id, doc[0].owner, doc[0].caption, doc[0].tags, doc[0].articles, doc[0].posts, doc[0].time_created, doc[0].edits, doc[0].visibility);
			Gallery.unpack(db, gallery, function(err, gal_unpacked){
				res.json({err: null, data: gal_unpacked}).end();
			});
		}
	);
});

/* Mobile get post script. */
router.post('/update', function(req, res, next) {
	var db = req.db,
		id = (''+req.body.id).trim(),
		params = { owner: (''+req.body.owner).trim() },
		logger = routeLogger.child({endpoint: 'update', params: params, req_id: req.req_id});
	
	logger.info({endpoint: 'update', params: params}, 'Post update called');
	
	var authtoken = req.authtoken;
	if (authtoken && (authtoken.user_id != params.owner || !AuthToken.checkScope('post_update', authtoken))) {
		logger.info('User is not authenticated');
		return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
	}
	
	if (req.body.byline)
		params.byline = req.body.byline;
	if (req.body.source)
		params.source = req.body.source;
	if (req.body.license)
		params.license = req.body.license;
	if (req.body.visibility)
		params.license = parseInt(req.body.visibility);
	if (req.body.lat && req.body.lon && req.body.address){
		params.location = {
			geo: {
				type: "Point",
				coordinates: [parseFloat(req.body.lon),parseFloat(req.body.lat)]
			},
			address: req.body.address
		};
	}

	User.get(db, authtoken.user_id, function(err, user){
		if (params.owner && user._id != params.owner && user.rank < config.RANKS.CONTENT_MANAGER)
			return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
		
		Post.get(db, id, function(err, post){
			if (user._id != post.owner && user.rank < config.RANKS.CONTENT_MANAGER)
				return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
				
			Post.update(db, id, user, params, function(err, post){
				if (err){
					logger.warn({step: 'update'}, err.err);
					return res.json({err: err.err, data: {}}).end();
				}
				
				Post.unpack(db, post, function(err, deep_post){
					if(err) logger.warn({step: 'unpack'}, err.err);
					return res.json({err: err ? err.err : null, data: deep_post}).end();
				});
			});
		});
	});
});

module.exports = router;