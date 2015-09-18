
var config = require('../../lib/config'),
	User = require('../../lib/user'),
	AuthToken = require('../../lib/authtoken'),
	routeLogger = require('../../lib/logger').child({route: 'user'}),
	express = require('express'),
	passport = require('passport'),
	router = express.Router();

/* Create user */
router.post('/create', function(req, res, next) {
	var db = req.db,
		params = {
			avatar : null,
			email : req.body.email ? (''+req.body.email).trim() : undefined,
			firstname : req.body.firstname,
			lastname : req.body.lastname,
			password : req.body.password,
			twitter : req.body.twitter,
			parse_id : req.body.parse_id,
			avatar: req.body.avatar || null
		},
		outlet_title = req.body.outlet || null,
		logger = routeLogger.child({endpoint: 'create', params: params, req_id: req.req_id});
	
	logger.info('User create called');
	
	if (!params.email)
		delete params.email;
	
	var finish = function(){
		User.add(db, params, function(err, user){
			if(err)
				return res.json({err: err.err, data: {}}).end();
			if (!outlet_title)
				return res.json({err: err ? err.err : null, data: user}).end();
			
			var Outlet = require('../../lib/outlet');
			
			Outlet.add(db, { title: outlet_title, owner: user._id }, function(err, outlet){
				if (err)
					return res.json({err: err ? err.err : null, data: {}}).end();
				
				user.outlet = outlet;
				return res.json({err: err ? err.err : null, data: user}).end();
			});
		});
	};
	
	if (params.avatar){
		var request = require('request'),
			fs = require('fs'),
			filename = id + '.' + params.avatar.split('.').pop();
			
		request(params.avatar)
		.on('end', function(){
			uploadAvatar('./' + filename, filename);
		})
		.on('error', function(err){
			fs.unlinkSync('./' + filename);
			res.json({err: err, data: {}}).end();
		})
		.pipe(fs.createWriteStream(filename));
	}else{
		var file = null;
		
		for (var index in req.files)
			file = req.files[index];
		
		if (file == null)
			return finish(db, params, res);
			
		uploadAvatar(file.path, file.name);
	}
		
	function uploadAvatar(path, name){
		var aws = require('aws-sdk'),
			s3 = new aws.S3(),
			fs = require('fs');
		
		aws.config.loadFromPath('./.aws/credentials');
		aws.config.region = 'us-east-1';
		
		if (['jpeg', 'jpg', 'jfif', 'jpe', 'png'].indexOf(name.split('.').pop().toLowerCase()) == -1){
			fs.unlinkSync(path);
			return res.json({err: 'INVALID_MEDIA_FORMAT', data: {}}).end();
		}
		
		config.cropAvatar(path, function(err){
			if (err)
				return res.json({err: 'CROPPING_ERROR', data: {}}).end();
			
			var uploadedFile = fs.readFileSync(path);
			
			name = new Date().getTime() + '_' + name;
			
			s3.putObject({
				ACL : 'public-read',
				Bucket : config.BUCKET_AVATARS,
				Key : name,
				Body : uploadedFile,
				ContentType : 'metaData',
				CacheControl : 'max-age=86400'
			}, function(err, response){
				fs.unlinkSync(path);
		
				if (err)
					return res.json({err: 'FILE_UPLOAD_FAILED', data: {}}).end();
		
				params.avatar = config.CLOUDFRONT_AVATARS + name;
				finish(db, params, res);
			});
		});
	}
});

/* Update user */
router.post('/update', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next) {
	var db = req.db,
		id = (""+req.body.id).trim(),
		authtoken = req.authtoken,
		params = { };
	var logger = routeLogger.child({endpoint: 'update', params: params, req_id: req.req_id});

	// Authentication
	if (authtoken.user_id != id) {
		logger.info('User is not authorized');
		return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
	}
	
	if (req.body.lat && req.body.lon)
		params.last_loc = {
			type: "Point",
			coordinates: [parseFloat(req.body.lon), parseFloat(req.body.lat)]	
		};
	if (req.body.username)
		params.username = req.body.username;
	if (req.body.firstname)
		params.firstname = req.body.firstname;
	if (req.body.lastname)
		params.lastname = req.body.lastname;
	if (req.body.email)
		params.email = req.body.email;
	if (req.body.password)
		params.password = req.body.password;
	if (req.body.twitter)
		params.twitter = req.body.twitter;
	if (req.body.outlet)
		params.twitter = req.body.outlet;
	if (req.body.parse_id)
		params.parse_id = req.body.parse_id;
	if (req.body.avatar)
		params.avatar = req.body.avatar;

	logger.info('User update called');
	
	function finish(db, id, params, res){
		User.update(db, id, params, function(err, user){
			if(err) logger.warn(err.err);
			return res.json({err: err ? err.err : null, data: user}).end();
		});
	}
	
	if (params.avatar){
		var request = require('request'),
			fs = require('fs'),
			filename = id + '.' + params.avatar.split('.').pop();
			
		request(params.avatar)
		.on('end', function(){
			uploadAvatar('./' + filename, filename);
		})
		.on('error', function(err){
			fs.unlinkSync('./' + filename);
			res.json({err: err, data: {}}).end();
		})
		.pipe(fs.createWriteStream(filename));
	}else{
		var file = null;
		
		for (var index in req.files)
			file = req.files[index];
		
		if (file == null)
			return finish(db, id, params, res);
		
		uploadAvatar(file.path, file.name);
	}
	
	function uploadAvatar(path, name){
		var aws = require('aws-sdk'),
			s3 = new aws.S3(),
			fs = require('fs');
		
		aws.config.loadFromPath('./.aws/credentials');
		aws.config.region = 'us-east-1';
		
		if (['jpeg', 'jpg', 'jfif', 'jpe', 'png'].indexOf(name.split('.').pop().toLowerCase()) == -1)
			return res.json({err: 'INVALID_MEDIA_FORMAT', data: {}}).end();
		
		config.cropAvatar(path, function(err){
			if (err){
				fs.unlinkSync(path);
				return res.json({err: 'CROPPING_ERROR', data: {}}).end();
			}
			
			var uploadedFile = fs.readFileSync(path);
			
			name = new Date().getTime() + '_' + name;
			
			s3.putObject({
				ACL : 'public-read',
				Bucket : config.BUCKET_AVATARS,
				Key : name,
				Body : uploadedFile,
				ContentType : 'metaData',
				CacheControl : 'max-age=86400'
			}, function(err, response){
				fs.unlinkSync(path);
		
				if (err)
					return res.json({err: 'FILE_UPLOAD_FAILED', data: {}}).end();
		
				params.avatar = config.CLOUDFRONT_AVATARS + name;
				finish(db, id, params, res);
			});
		});
	}
});

/* Update user setting(s) */
router.post('/settings', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next) {
	var db = req.db,
		id = (""+req.body.id).trim(),
		authtoken = req.authtoken,
		params = {
			settings: {}
		};
		
	var logger = routeLogger.child({endpoint: 'settings', params: params, req_id: req.req_id});

	logger.info('User update settings called');

	// Authentication
	if (authtoken.user_id != id) {
		logger.info('User is not authenticated');
		return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
	}
	
	//Update as settings are added
	if (req.body.radius){
		params.settings.radius = parseInt(req.body.radius);
		
		if (typeof params.settings.radius != 'number')
			return res.json({err: 'Invalid assignment notification radius', data: {}}).end();
	}

	User.update(db, id, params, function(err, user){
		if(err) logger.warn(err.err);
		return res.json({err: err ? err.err : null, data: user}).end();
	});
});

/* Mobile get user */
router.get('/profile', function(req, res, next) {
	var db = req.db,
		id = (''+req.query.id).trim(),
		logger = routeLogger.child({endpoint: 'profile', id: id, req_id: req.req_id});
	
	logger.info('User profile called');
	
	User.get(db, id, function(err, user){
		if(err) logger.warn(err.err);
		
		User.unpack(db, user, function(err, user_unpacked){console.log(err);
			if(err) logger.warn(err.err);
			return res.json({err: err ? err.err : null, data: user_unpacked}).end();
		});
	});
});

/* Mobile get user */
router.post('/locate', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next) {
	var db = req.db,
		id = (''+req.body.id).trim(),
		authtoken = req.authtoken,
		updates = {
			last_loc: {
				geo: {
					type: "Point",
					coordinates: [parseFloat(req.body.lon), parseFloat(req.body.lat)]
				},
				timestamp: new Date().getTime()
			}	
		},
		logger = routeLogger.child({endpoint: 'locate', updates: updates, req_id: req.req_id});
	
	logger.info('User locate called');
	
	// Authentication
	if (authtoken.user_id != id) {
		logger.info('User is not authorized');
		return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
	}
	
	User.update(db, id, updates, function(err, user){
		if(err) logger.warn(err.err);
		return res.json({err: err ? err.err : null, data: user}).end();
	});
});

/* Mobile follow user */
router.post('/follow', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next){
	var db = req.db,
		self = (''+req.body.self).trim(),
		other = (''+req.body.other).trim(),
		authtoken = req.authtoken,
		logger = routeLogger.child({endpoint: 'follow', self: self, other: other, req_id: req.req_id});
		
	logger.info('User follow called');
	
	// Authentication
	if (authtoken.user_id != self) {
		logger.info('User is not authorized');
		return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
	}
	
	User.toggleFollow(db, self, other, function(err, result){
		if(err) logger.warn(err.err);
		return res.json({err: err ? err.err : null, data: result}).end();
	});
});

/* Mobile unfollow user */
router.post('/unfollow', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next){
	var db = req.db,
		self = (''+req.body.self).trim(),
		other = (''+req.body.other).trim(),
		authtoken = req.authtoken,
		logger = routeLogger.child({endpoint: 'unfollow', self: self, other: other, req_id: req.req_id});
		
	logger.info('User unfollow called');
	
	// Authentication
	if (authtoken.user_id != self) {
		logger.info('User is not authorized');
		return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
	}
	
	User.toggleFollow(db, self, other, function(err, result){
		if(err) logger.warn(err.err);
		return res.json({err: err ? err.err : null, data: result}).end();
	});
});

/* Mobile get user's galleries */
router.get('/galleries', function(req, res, next) {
	var gallery = require('../../lib/gallery'),
		async = require('async'),
		db = req.db,
		id = (''+req.query.id).trim(),
		params = {
			sort : {time_created : -1},
			skip: req.query.offset ? parseInt(req.query.offset) : 0,
			limit: req.query.limit ? parseInt(req.query.limit) : 10 
		},
		logger = routeLogger.child({endpoint: 'galleries', id: id, params: params, req_id: req.req_id});

	logger.info('User galleries called');

	gallery.query(db, {owner : id}, params, function(err, galleries){
		if (err){
			logger.warn({step: "query"}, err.err);
			return res.json({err : err.err, data : []}).end();
		}
		
		async.each(galleries,
			function(shallow_gallery, cb1){
				gallery.unpack(db, shallow_gallery, function(err, gallery){
					if (err)
						return cb1(err);
					
					shallow_gallery = gallery;
					cb1();
				});
			},
			function(err){
				if(err) logger.warn({step: "unpack"}, err.err);
				return res.json({err: err ? err.err : null, data: galleries}).end();
			}
		);
	});
});

router.get('/findInRadius', function(req, res, next){
	var db = req.db,
		options = {
			lat: parseFloat(req.query.lat),
			lon: parseFloat(req.query.lon),
			radius: parseFloat(req.query.radius)
		},
		logger = routeLogger.child({endpoint: 'findInRadius', options: options});
		
	logger.info('User findInRadius called');
	
	if(!options.lat || isNaN(options.lat))
		return res.json({err: 'ERR_INVALID_ARGUMENT', data: null}).end();
	if(!options.lon || isNaN(options.lon))
		return res.json({err: 'ERR_INVALID_ARGUMENT', data: null}).end();
	if(!options.radius || isNaN(options.radius))
		return res.json({err: 'ERR_INVALID_ARGUMENT', data: null}).end();
	
	User.findInRadius(db, options, function(err, users){
		if(err) logger.warn(err);
		res.json({err: err, data: users}).end();
	});
});

module.exports = router;