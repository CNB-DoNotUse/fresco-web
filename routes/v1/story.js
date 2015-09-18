var config = require('../../lib/config'),
	Story = require('../../lib/story'),
	routeLogger = require('../../lib/logger').child({route: 'story'}),
	async = require('async'),
	express = require('express'),
	router = express.Router();

/* Mobile get story script. */
router.post('/create', function(req, res, next) {
	var db = req.db,
		params = {
			curator: (''+req.body.curator).trim(),
			title: (''+req.body.title).trim(),
			caption: (''+req.body.caption).trim(),
			galleries: req.body.galleries ? (Array.isArray(req.body.galleries) ? req.body.galleries : [req.body.galleries]) : [],
			tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : [],
			articles: req.body.articles ? (Array.isArray(req.body.articles) ? req.body.articles : [req.body.articles]) : []
		},
		logger = routeLogger.child({endpoint: 'create', params: params, req_id: req.req_id});
		
	//WE ALSO NEED TO DETECT TAGS IN THE HEADER AND ADD THEM TO THE LIST OF TAGS	
	
	logger.info({endpoint: 'create', params: params}, 'Story create called');

	Story.add(db, params, function(err, story){
		if (err){
			logger.warn({step: 'add'}, err.err);
			return res.json({err: err.err, data: {}}).end();
		}
		
		Story.unpack(db, story, function(err, deep_story){
			if(err) logger.warn({step: 'unpack'}, err.err);
			return res.json({err: err ? err.err : null, data: deep_story}).end();
		});
	});
});

/* Mobile get story script. */
router.get('/get', function(req, res, next) {
	var db = req.db,
		id = (''+req.query.id).trim(),
		logger = routeLogger.child({endpoint: 'get', id: id});

	logger.info('Story get called');

	Story.get(db, id, function(err, story_obj){
		if (err){
			logger.warn({step: 'get'}, err.err);
			return res.json({err: err.err, data: {}}).end();
		}
		
		Story.unpack(db, story_obj, function(err, deep_story){
			if(err) logger.warn({step: 'unpack'}, err.err);
			return res.json({err: err ? err.err : null, data: deep_story || {}}).end();
		});
	});
});

/* Get stories that reference the given gallery */
router.get('/getFromGallery', function(req, res, next){
	var db = req.db,
		gallery_id = (''+req.query.gallery_id).trim(),
		logger = routeLogger.child({endpoint: 'getFromGallery', gallery_id: gallery_id});
	
	logger.info('Story getFromGallery called');
	
	Story.query(db, {
		galleries: gallery_id
	},{}, function(err, stories){
		if(err){
			logger.warn({step: 'query'}, err.err);
			return res.json({err: err.err, data: stories}).end();
		}
		return res.json({err: {}, data: stories}).end();
	});
});

/* Get highlights */
router.get('/recent', function(req, res, next) {
	var db = req.db,
		notags = req.query.notags == 'true',
		query = { },
		options = {
			sort : {time_created : -1},
			limit : req.query.limit ? parseInt(req.query.limit) : 10,
			skip : req.query.offset ? parseInt(req.query.offset) : 0
		},
		logger = routeLogger.child({endpoint: 'recent', options: options, req_id: req.req_id});

	logger.info('Recent stories called');

	Story.query(db, query, options,
		function(err, stories){
			if (err){
				logger.warn({step: 'query'}, err.err);
				return res.json({err: err.err, data: stories}).end();
			}
			
			async.each(stories,
				function(shallow_story, cb1){
					Story.unpack(db, shallow_story, function(err, story){
						if (err)
							return cb1(err);
						
						if (notags) delete story.tags;
						shallow_story = story;
						
						Story.getThumbnailPosts(
							db,
							shallow_story.galleries,
							15,
							function(err, posts){
								if (err)
									return cb1(err);
								
								shallow_story.thumbnails = posts;
								cb1();
							}
						);
					});
				},
				function(err){
					if(err) logger.warn({step: 'unpack'}, err.err);
					return res.json({err: err ? err.err : null, data: stories}).end();
				}
			);
		}
	);
});

module.exports = router;