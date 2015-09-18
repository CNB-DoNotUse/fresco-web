var config = require('../../lib/config'),
	Gallery = require('../../lib/gallery'),
	AuthToken = require('../../lib/authtoken'),
	routeLogger = require('../../lib/logger').child({route: 'gallery'}),
	async = require('async'),
	express = require('express'),
	passport = require('passport'),
	router = express.Router();

/* Mobile get gallery script. */
router.get('/get', function(req, res, next) {
	var db = req.db,
		id = (''+req.query.id).trim(),
		showStories = req.query.stories == 'true',
		logger = routeLogger.child({endpoint: 'get', id: id, req_id: req.req_id});

	logger.info('Gallery get called');

	Gallery.get(db, id, function(err, _gallery){
		if (err){
			logger.warn(err.err);
			return res.json({err: err.err, data: {}}).end();
		}
		
		Gallery.unpack(db, _gallery, function(err, deep_gallery){
			if (err) logger.warn({step: 'unpack'}, err.err);
			if (err || !showStories)
				return res.json({err: err ? err.err : null, data: deep_gallery}).end();
				
			var Story = require('../../lib/story');
			
			Story.query(
				db,
				{
					galleries: {
						$in: [
							id
						]
					}
				},
				{
					_id: 1,
					title: 1
				},
				function(err, stories){
					if (err)
						return res.json({err: err.err, data: {}}).end();
					
					var ids = [];
					for (var i = 0; i < stories.length; ids.push({_id: stories[i]._id,title: stories[i].title}), ++i);
					deep_gallery.related_stories = ids;
					return res.json({err: null, data: deep_gallery}).end();
				}
			);
		});
	});
});

router.post('/create', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next) {
	var db = req.db,
		params = {
			owner: (''+req.body.owner).trim(),
			title: req.body.title ? req.body.title.trim() : null,
			caption: req.body.caption ? req.body.caption.trim() : null,
			posts: req.body.posts,
			tags: req.body.tags,
			articles: req.body.articles,
			highlight: req.body.highlight
		},
		logger = routeLogger.child({endpoint: 'create', params: req.body, req_id: req.req_id});
	
	logger.info("Gallery create called");
	
	// Authentication
	var authtoken = req.authtoken;
	if (authtoken.user_id != params.owner) {
		logger.info('User is not authenticated');
		return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
	}
	
	Gallery.add(db, params, function(err, gallery){
		res.json({err: err ? err.err : null, data: gallery}).end();
	});
});

router.post('/update', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next) {
	var User = require('../../lib/user'),
		db = req.db,
		id = (''+req.body.id).trim(),
		params = { owner: (''+req.body.owner).trim() },
		logger = routeLogger.child({endpoint: 'update', params: req.body, req_id: req.req_id});
	
	logger.info("Gallery update called");
	
	// Authentication
	var authtoken = req.authtoken;
	if (authtoken.user_id != params.owner) {
		logger.info('User is not authenticated');
		return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
	}
	
	if (req.body.caption)
		params.caption = req.body.caption;
	if (req.body.tags)
		params.tags = req.body.tags;
	if (req.body.articles)
		params.articles = req.body.articles;
	if (req.body.posts)
		params.posts = req.body.posts;
	
	User.get(db, authtoken.user_id, function(err, user){
		if (params.owner && user._id != params.owner && user.rank < config.RANKS.CONTENT_MANAGER)
			return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
		
		Gallery.get(db, id, function(err, gallery){
			if (user._id != gallery.owner && user.rank < config.RANKS.CONTENT_MANAGER)
				return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
			
			Gallery.update(db, id, authtoken.user_id, params, function(err, gallery_new){
				res.json({err: err ? err.err : null, data: gallery_new}).end();
			});
		});
	});
});

/* Create gallery and posts */
router.post('/assemble', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next) {
	var logger = routeLogger.child({endpoint: 'assemble', params: req.body, req_id: req.req_id});
	
	logger.info("Gallery assemble called");
	
	if (typeof done == 'undefined'){
		logger.warn('No files were uploaded');
		return res.json({err: "ERR_NO_FILES", data: {}}).end();
	}
	
	// Authentication
	var authtoken = req.authtoken;
	if (authtoken.user_id != req.body.owner) {
		logger.info('User is not authenticated');
		return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
	}
	
	if (done){
		var fs = require('fs'),
			gm = require('gm'),
			post = require('../../lib/post'),
			aws = require('aws-sdk'),
			request = require('request'),
			db = req.db,
			posts = [],
			params = {
				owner : (''+req.body.owner).trim(),
				caption : (''+req.body.caption).trim(),
				articles: req.body.articles ? (Array.isArray(req.body.articles) ? req.body.articles : [req.body.articles]) : [],
				visibility : config.VISIBILITY_PRIVATE
			};
			
		try{
			var post_info = JSON.parse(req.body.posts);
		}catch(e){
			logger.warn('Invalid JSON in posts string');
			return res.json({err: 'ERR_INVALID_JSON', data: {}}).end();
		}

		params.tags = config.extractTags(params.caption);
		
		if (!config.isValidPostArray(post_info)){
			logger.warn('Improperly formatted post data');
			return res.json({ err : "ERR_POST_DATA", data: {}}).end();
		}
		if (req.files.length != post_info.length){
			logger.warn('Number of files does not match number of posts');
			return res.json({ err : "ERR_FILE_KEY_MISMATCH", data: {}}).end();
		}
		
		params.tags = config.extractTags(params.caption);

		var files = [];

		for (var key in req.files){
			if (post_info[key] == undefined){
				logger.warn("File/post key missmatch at key: " + key + ".");
				return res.json({err:"ERR_FILE_KEY_MISMATCH", data: {}}).end();
			}

			req.files[key].post_data = post_info[key];
			files.push(req.files[key]);
		}
		
		var User = require('../../lib/user'),
			Parser = require('exif-parser');
		
		User.get(db, params.owner, function(err, user){
			if (err){
				logger.warn({step: 'user_get'}, err.err);
				return res.json({ err : err.err, data: {}}).end();
			}
			
			aws.config.loadFromPath('./.aws/credentials');
			aws.config.region = 'us-east-1';
			
			var s3 = new aws.S3(),
				elastictranscoder = new aws.ElasticTranscoder();
			
			async.each(files, function(file, cb1){
				var postParams = {
						owner : params.owner,
						byline : (user.twitter || user.firstname + ' ' + user.lastname),
						source : null,
						license: "Fresco News",
						type : file.post_data.type,
						meta : {},
						geo : {
							type : "Point",
							coordinates : [parseFloat(file.post_data.lon), parseFloat(file.post_data.lat)]
						},
						visibility : config.VISIBILITY_PRIVATE
					},
					geo_url = config.REVERSEGEO_PATH
						.replace('[LAT]', postParams.geo.coordinates[1])
						.replace('[LON]', postParams.geo.coordinates[0]);
	
				request({
					url: geo_url,
					json: true
				}, function(error, response, body){
					if (error)
						return cb1(error);
					if (response.statusCode != 200)
						return cb1('ERR_REVERSE_GEO');
					
					if (body.results.length > 0){
						var address_components = body.results[0].address_components,
							results = {};
						
						for (var index in address_components)
							results[address_components[index].types[0]] = {
								short: address_components[index].short_name,
								long: address_components[index].long_name
							};
						
						if (results.country){
							if (results.country.short == 'US')
								postParams.address = (results.locality ? results.locality.long + ', ' : '') + (results.administrative_area_level_1 ? results.administrative_area_level_1.short : '');
							else
								postParams.address = (results.administrative_area_level_1 ? results.administrative_area_level_1.long + ', ' : '') + (results.country ? results.country.long : '');
						}else
							postParams.address = '';
					}else
						postParams.address = '';
					
					var uploadedFile = fs.readFileSync(file.path),
						newName = params.owner + '_' + file.name;
						
					if (postParams.type == 'image'){
						gm(file.path).size(function(err, size){
							if (err)
								return cb1(err);
								
							if (['jpeg', 'jpg', 'jfif', 'jpe'].indexOf(file.name.split('.').pop().toLowerCase()) == -1){
								postParams.meta.width = size.width;
								postParams.meta.height = size.height;
							}else{
								var exifData = Parser.create(uploadedFile).parse();
								
								if (exifData.tags.Orientation == 6 || exifData.tags.Orientation == 8){
									postParams.meta.width = size.height;
									postParams.meta.height = size.width;
								}else{
									postParams.meta.width = size.width;
									postParams.meta.height = size.height;
								}
							}
							
							s3.putObject({
								ACL : 'public-read',
								Bucket : config.BUCKET_POSTS,
								Key : config.CDN_IMAGES + newName,
								Body : uploadedFile,
								ContentType : 'metaData',
								CacheControl : 'max-age=86400'
							}, function(err, response){
								fs.unlinkSync(file.path);
				
								if (err)
									return cb1({err: err});
				
								postParams.image = config.CLOUDFRONT_POSTS + config.CDN_IMAGES + newName;
								delete postParams.type;
				
								post.add(db, postParams, function(err, post){
									if (err)
										return cb1(err);
										
									posts.push(""+post._id);
									cb1();
								});
							});
						});
					}else if (postParams.type == 'video'){
							newName = params.owner + '_' + file.name;
						
							s3.putObject({
								ACL : 'public-read',
								Bucket : config.BUCKET_RAW,
								Key : newName,
								Body : uploadedFile,
								ContentType : 'metaData',
								CacheControl : 'max-age=86400'
							}, function(err, response){
								if (err)
									return cb1({err: err});
								
								var inputKey = newName,
									outputKey = newName.split('.')[0];
								
								elastictranscoder.createJob(
									{ 
										PipelineId: "1433786195763-ywfmfg",
										OutputKeyPrefix: config.CDN_VIDEOS,
										Input: { 
											Key: inputKey,
											FrameRate: 'auto', 
											Resolution: 'auto', 
											AspectRatio: 'auto', 
											Interlaced: 'auto', 
											Container: 'auto'
										}, 
										Outputs: [
											{ 
												Key: 'mp4/' + outputKey + '.mp4',
												ThumbnailPattern: config.CDN_THUMBS + outputKey + '-thumb{count}', 
												PresetId: '1434472454422-z1vaw3',
												Rotate: 'auto'
											},
											{ 
												Key: 'hls2000k/' + outputKey, 
												SegmentDuration: '5',
												PresetId: '1433875360222-vnyg67',
												Rotate: 'auto'
											},
											{ 
												Key: 'hls1500k/' + outputKey, 
												SegmentDuration: '5',
												PresetId: '1433875418518-hccoms',
												Rotate: 'auto'
											},
											{ 
												Key: 'hls1000k/' + outputKey, 
												SegmentDuration: '5',
												PresetId: '1433875450686-xsy4ai',
												Rotate: 'auto'
											},
											{ 
												Key: 'hls0600k/' + outputKey, 
												SegmentDuration: '5',
												PresetId: '1433875487111-2j8itu',
												Rotate: 'auto'
											},
											{ 
												Key: 'hls0400k/' + outputKey, 
												SegmentDuration: '5',
												PresetId: '1433875517538-0mjftp',
												Rotate: 'auto'
											},
											{ 
												Key: 'hlsAudio/' + outputKey, 
												SegmentDuration: '5',
												PresetId: '1433875550205-ytf3gz',
												Rotate: 'auto'
											}
										],
										Playlists: [
											{
												Format: "HLSv3",
												Name: outputKey,
												OutputKeys: [
													'hls2000k/' + outputKey,
													'hls1500k/' + outputKey,
													'hls1000k/' + outputKey,
													'hls0600k/' + outputKey,
													'hls0400k/' + outputKey,
													'hlsAudio/' + outputKey,
												]
											}
										]
									}, function(err, data) {
										fs.unlinkSync(file.path);
						
										if (err)
											return cb1({err: err});
						
										postParams.video = config.CLOUDFRONT_POSTS + config.CDN_VIDEOS + outputKey + '.m3u8';
										postParams.image = config.CLOUDFRONT_POSTS + config.CDN_VIDEOS + config.CDN_THUMBS + outputKey + '-thumb00001.jpg';
										delete postParams.type;
										
										post.add(db, postParams, function(err, post){
											if (err)
												return cb1(err);
												
											posts.push(""+post._id);
											cb1();
										});
									}
								);
							}
						);
					}
				});
			},
			function(err){
				if (err){
					logger.warn({step: 'assemble'}, err.err);
					return res.json({err: err.err, data: {}}).end();
				}
				var assignment = require('../../lib/assignment'),
					galleryParams = {
						owner : params.owner,
						caption : params.caption,
						title: params.title || '',
						tags : params.tags,
						articles : params.articles,
						posts : posts,
						visibility : params.visibility
					};
					
				Gallery.add(db, galleryParams, function(err, new_gallery){
					if (err){
						logger.warn({step: 'add_gallery'}, err.err);
						return res.json({err: err.err, data: {}}).end();
					}
					Gallery.unpack(db, new_gallery, function(err, gallery_unpacked){
						if (!req.body.assignment){
							if (err) logger.warn({step: 'unpack'}, err.err);
							return res.json({err: err ? err.err : null, data: gallery_unpacked}).end();
						}
						
						async.each(
							new_gallery.posts,
							function(post, cb){
								assignment.addPost(db, req.body.assignment, ''+post._id, function(err, result){
									cb(err);
								});
							},
							function(err){
								if(err) logger.warn({step: 'add_gallery_to_assignment'}, err.err);
								return res.json({err: err ? err.err : null, data: gallery_unpacked}).end();
							}
						);
					});
				});
			});
		});
	}
});

/* Get highlights */
router.get('/highlights', function(req, res, next) {
	var db = req.db,
		showStories = req.query.stories == 'true',
		query = {
			visibility : config.VISIBILITY_HIGHLIGHT
		},
		options = {
			sort : {time_created : -1},
			limit : req.query.limit ? parseInt(req.query.limit) : 10,
			skip : req.query.offset ? parseInt(req.query.offset) : 0
		},
		logger = routeLogger.child({endpoint: 'highlights', options: options, req_id: req.req_id});

	logger.info('Gallery highlights called');

	Gallery.query(db, query, options,
		function(err, galleries){
			if (err){
				logger.warn({step: 'query'}, err.err);
				return res.json({err: err.err, data: []}).end();
			}
			
			async.each(galleries,
				function(shallow_gallery, cb1){
					Gallery.unpack(db, shallow_gallery, function(err, gallery){
						if (err)
							return cb1(err);
						
						shallow_gallery = gallery;
						if (!showStories) return cb1();
						
						var Story = require('../../lib/story');
						
						Story.query(
							db,
							{
								galleries: {
									$in: [
										''+shallow_gallery._id
									]
								}
							},
							{
								_id: 1,
								title: 1
							},
							function(err, stories){
								if (err)
									return cb1(err);
								
								var ids = [];
								for (var i = 0; i < stories.length; ids.push({_id: stories[i]._id,title: stories[i].title}), ++i);
								shallow_gallery.related_stories = ids;
								cb1();
							}
						);
					});
				},
				function(err){
					if (err) logger.warn({step: 'unpack'}, err.err);
					return res.json({err: err ? err.err : null, data: galleries}).end();
				}
			);
		}
	);
});

/* Mobile get gallery script. */
router.get('/resolve', function(req, res, next) {
	var db = req.db,
		showStories = req.query.stories == 'true',
		gallery_ids = req.query.galleries,
		sort = req.query.sort == 'true',
		galleries = [],
		logger = routeLogger.child({endpoint: 'get', req_id: req.req_id});

	logger.info('Gallery resolve called');
	
	async.eachSeries(
		gallery_ids,
		function(id, cb){
			Gallery.get(
				db,
				id,
				function(err, gal){
					if (err){
						if (err.err == 'ERR_NOT_FOUND')
							return cb();
						else
							return cb(err);
					}
						
					Gallery.unpack(
						db,
						gal,
						function(err, unpacked){
							if (err)
								return cb(err);
							
							if (!showStories){
								galleries.push(unpacked);
								return cb();
							}
							
							var Story = require('../../lib/story');
							
							Story.query(
								db,
								{
									galleries: {
										$in: [
											''+unpacked._id
										]
									}
								},
								{
									_id: 1,
									title: 1
								},
								function(err, stories){
									if (err)
										return cb(err);
									
									var ids = [];
									for (var i = 0; i < stories.length; ids.push({_id: stories[i]._id,title: stories[i].title}), ++i);
									unpacked.related_stories = ids;
									galleries.push(unpacked);
									cb();
								}
							);
						}
					);
				}
			);
		},
		function(err){
			if (err)
				return res.json({err: err.err, data: []});
			if (galleries.length == 0)
				return res.json({err: 'ERR_NOT_FOUND', data: []});
			if (sort)
				galleries.sort(function(a, b){return b.time_created - a.time_created;});
			
			res.json({err: null, data: galleries}).end();
		}
	);
});

module.exports = router;