
var config = require('../../lib/config'),
	Outlet = require('../../lib/outlet'),
	AuthToken = require('../../lib/authtoken'),
	routeLogger = require('../../lib/logger').child({route: 'user'}),
	express = require('express'),
	passport = require('passport'),
	router = express.Router();

/* Get outlet */
router.get('/get', function(req, res, next) {
	var db = req.db,
		id = (''+req.query.id).trim(),
		logger = routeLogger.child({endpoint: 'get', id: id, req_id: req.req_id});
	
	logger.info('Outlet get called');
	
	Outlet.get(db, id, function(err, outlet){
		if(err){
			logger.warn(err.err);
			return res.json({err: err.err, data: {}}).end();
		}
		
		Outlet.unpack(db, outlet, function(err, outlet_unpacked){
			if (err)
				return res.json({err: err.err, data: {}}).end();
			
			db.get(config.COLLECTION_USERS).find(
				{
					'following.outlets': {
						$in: [
							outlet_unpacked._id
						]
					}
				},
				{
					_id: 1
				},
				function(err, result){
					if (err)
						return res.json({err: err.err, data: {}}).end();
						
					outlet_unpacked.followers = result.length;
					return res.json({err: null, data: outlet_unpacked}).end();
				}
			);
		});
	});
});

/* Invite user to outlet */
router.post('/invite', function(req, res, next) {
	var Mandrill = require('mandrill-api'),
		mandrill_client = new Mandrill.Mandrill(config.MANDRILL_API_KEY),
		db = req.db,
		async = require('async'),
		id = (''+req.body.id).trim(),
		emails = req.body.emails,
		logger = routeLogger.child({endpoint: 'invite', req_id: req.req_id});
	
	if (!Array.isArray(emails))
		emails = [emails];
	logger.info('Outlet invite called');
	
	Outlet.get(db, id, function(err, outlet){
		if (err)
			return res.json({err: err.err, data: false}).end();
		
		async.each(
			emails,
			function(email, cb){
				Outlet.generateInvitation(db, id, email, function(err, token){
					if(err){
						logger.warn(err.err);
						return cb(err.err);
					}
					
					var url = config.FRESCO_ROOT + 'register?o=' + token;
						
					mandrill_client.messages.sendTemplate(
						{
							template_name: 'outlet-invite-1',
							template_content: [
								{
									name: 'OUTLET',
									content: outlet.title
								},
								{
									name: 'LINK',
									content: '<a href="'+url+'">'+url+'</a>'
								}
							],
							message: {
								subject: "You've been invited!",
								from_email: "donotreply@fresconews.com",
								from_name: 'Fresco News',
								to: [{email: email}]
							}
						},
						function(result){console.log(result);
							if (result[0].status == 'rejected' || result[0].status == 'invalid')
								return cb({err: 'ERR_INVALID_EMAIL'});
								
							cb();
						}
					);
				});
			},
			function(err){
				res.json({err: err}).end();
			}
		);
	});
});

/* Get outlet */
router.post('/invite/revoke', function(req, res, next) {
	var db = req.db,
		token = req.body.token,
		email = req.body.email,
		logger = routeLogger.child({endpoint: 'invite/revoke', req_id: req.req_id});
	
	logger.info('Outlet revoke invite called');
	
	Outlet.revokeInvitation(db, email, token, function(err, result){
		res.json({err: err, data: result}).end();
	});
});

/* Get outlet */
router.post('/invite/resolve', function(req, res, next) {
	var db = req.db,
		token = req.body.token,
		logger = routeLogger.child({endpoint: 'invite/revoke', req_id: req.req_id});
	
	logger.info('Outlet revoke invite called');
	
	Outlet.resolveInvitation(db, token, function(err, result){
		res.json({err: err, data: result}).end();
	});
});

/* Get outlet */
router.post('/invite/get', function(req, res, next) {
	var db = req.db,
		token = req.body.token,
		logger = routeLogger.child({endpoint: 'invite/revoke', req_id: req.req_id});
	
	logger.info('Outlet revoke invite called');
	
	Outlet.getInvitation(db, token, function(err, result){
		res.json({err: err, data: result}).end();
	});
});

/* Charge outlet SECURE THIS ENDPOINT WITH PASSPORT, CHECK IF OWNEER OR MEMBER OF OUTLET IS MAKING CHARGE */
/*router.post('/charge', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next) {
	var db = req.db,
		outlet = (''+req.body.outlet).trim(),
		user = (''+req.body.user).trim(),
		cents = parseInt(req.body.cents),
		logger = routeLogger.child({endpoint: 'charge', outlet: outlet, user: user, req_id: req.req_id});
	
	logger.info('Outlet charge called');
	
	// Authentication
	var authtoken = req.authtoken;
	if (authtoken && (authtoken.user_id != user || !AuthToken.checkScope('outlet_charge', authtoken))) {
		logger.info('User is not authenticated');
		return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
	}
	
	Outlet.get(db, outlet, function(err, outletObj){
		if(err){
			logger.warn(err.err);
			return res.json({err: err.err, data: ''}).end();
		}
		if(authtoken && outletObj.owner != authtoken.user_id && outletObj.users.indexOf(authtoken.user_id) == -1){
			logger.info('User ' + user + ' is not a member of outlet ' + outlet);
			return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
		}
		
		Outlet.getStripe(db, outlet, function(err, stripe){
			if(err)
				return res.json({err: err.err, data: ''}).end();
			if (!stripe.customer || !stripe.card)
				return res.json({err: 'ERR_PAYMENT_METHOD_NOT_SET'}).end();
			
			var Stripe = require("stripe")(config.STRIPE_SECRET);
			
			Stripe.charges.create(
				{
					amount: cents,
					currency: 'usd',
					customer: stripe.customer,
					source: stripe.card,
					description: 'Fresco News $5 assignment creation fee',
					metadata: {
						outlet: outlet,
						content_manager: user
					}
				},
				function(err, charge){
					res.json({err: err, data: err ? '' : charge.id});
				}
			);
		});
	});
});*/

/* Charge outlet SECURE THIS ENDPOINT WITH PASSPORT, CHECK IF OWNEER OR MEMBER OF OUTLET IS MAKING CHARGE */
router.post('/purchase', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next) {
	var db = req.db,
		authtoken = req.authtoken,
		outlet = (''+req.body.outlet).trim(),
		post = (''+req.body.post).trim(),
		assignment = (''+req.body.assignment).trim(),
		logger = routeLogger.child({endpoint: 'charge', outlet: outlet, user: authtoken.user_id, req_id: req.req_id});
	
	logger.info('Outlet charge called');
	
	var Assignment = require('../../lib/assignment'),
		Post = require('../../lib/post');
	
	Assignment.get(db, assignment, function(err, assignment){
		Post.get(db, post, function(err, post_obj){
			if (err)
				return res.json({err: err.err, data: ''}).end();
			
			Outlet.get(db, outlet, function(err, outletObj){
				if(err)
					return res.json({err: err.err, data: ''}).end();
				if(outletObj.owner != authtoken.user_id && outletObj.users.indexOf(authtoken.user_id) == -1){
					logger.info('User is not a member of the outlet');
					return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
				}
				
				if (assignment.posts && assignment.purchased.indexOf(post) != -1)
					return res.json({err: null, data: 'No charge'}).end();
					
				Outlet.getStripe(db, outlet, function(err, stripe){
					if(err){
						logger.warn(err.err);
						return res.json({err: err.err, data: ''}).end();
					}
					if (!stripe.customer || !stripe.card)
						return res.json({err: 'ERR_PAYMENT_METHOD_NOT_SET'}).end();
					
					var Stripe = require("stripe")(config.STRIPE_SECRET);
					
					Stripe.charges.create(
						{
							amount: !post_obj.video ? 2000 : 5000,
							currency: 'usd',
							customer: stripe.customer,
							source: stripe.card,
							description: 'Fresco News billing for post #' + post + ' on assignment #' + assignment,
							metadata: {
								outlet: outlet._id,
								content_manager: authtoken.user_id,
								post: post._id,
								assignment: assignment._id
							}
						},
						function(err, charge){
							if(charge){
								Assignment.buyPost(db, ''+assignment._id, ''+post._id, function(err, result){
									console.log('PURCHASING POST', err, result);
								});
								
								var Gallery = require('../../lib/gallery');
								Gallery.query(db,
								{
									posts: { $in: [post] },
									owner: post_obj.owner
								},
								function(err, galleries){
									if (galleries.length === 0) {
										return logger.warn("Error sending notification");
									}
									var gallery = galleries[0];
									if(err)	console.log(JSON.stringify(err));
									var Notif = require('../../lib/notification');
									var body = outletObj.title + " has used your content";
									Post.unpack(db, post_obj, function(err, unpacked_post){
										Notif.sendParse({
											format:{
												"aps": {
													"alert": { 
														"body": body, 
														"title": "Photo Used"
													}, 
													"sound": "chime.aiff",
													"category": "USE_CATEGORY" 
												}, 
												"gallery": gallery._id.toString(),
												"post": post,
												"type": "use"
											}
										}, unpacked_post.owner);
										
										Notif.send(db, {
											user: post_obj.owner._id.toString(),
											type: "use",
											title: "Photo Used",
											body: body,
											meta: {
												gallery: gallery._id.toString(),
												post: post,
												icon: outletObj.avatar
											}
										}, function(err, data){
											if(err) console.log(err);
										});
									});
								});
							}
							return res.json({err: err ? err : null, data: err ? null : charge.id}).end();
						}
					);
				});
			});
		});
	})
});

/* Charge outlet SECURE THIS ENDPOINT WITH PASSPORT, CHECK IF OWNEER OR MEMBER OF OUTLET IS MAKING CHARGE */
/*router.post('/refund', function(req, res, next) {
	var charge = req.body.charge,
		logger = routeLogger.child({endpoint: 'refund', req_id: req.req_id});
	
	logger.info('Outlet refund called');
	
	var Stripe = require("stripe")(config.STRIPE_SECRET);
		
	Stripe.charges.createRefund(
		charge,
		{},
		function(err, refund){
			console.log('REFUND: ', refund);
			res.json({err: err});
		}
	);
});*/

/* Get outlet */
router.get('/posts', function(req, res, next) {
	var db = req.db,
		id = (''+req.query.id).trim(),
		offset = parseInt(req.query.offset || '0'),
		limit = parseInt(req.query.limit || '10'),
		logger = routeLogger.child({endpoint: 'posts', id: id, req_id: req.req_id});
	
	logger.info('Outlet posts called');
	
	Outlet.getPosts(db, id, { offset: offset, limit: limit }, function(err, posts){
		if(err){
			logger.warn(err.err);
			return res.json({err: err.err, data: []}).end();
		}
		
		res.json({err: null, data: posts}).end();
	});
});

/* Get outlet */
router.get('/galleries', function(req, res, next) {
	var async = require('async'),
		Gallery = require('../../lib/gallery'),
		db = req.db,
		id = (''+req.query.id).trim(),
		offset = parseInt(req.query.offset || '0'),
		limit = parseInt(req.query.limit || '10'),
		galleries = [],
		logger = routeLogger.child({endpoint: 'galleries', id: id, req_id: req.req_id});
	
	logger.info('Outlet galleries called');
	
	Outlet.get(
		db,
		id,
		function(err, outlet){
			if (err)
				return res.json({err: err.err, data: []}).end();
				
			async.eachSeries(
				outlet.galleries,
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
										
									galleries.push(unpacked);
									cb();
								}
							);
						}
					);
				},
				function(err){
					if (err)
						return res.json({err: err.err, data: []});
						
					galleries.sort(function(a, b){return b.time_created - a.time_created;});
					galleries.splice(offset, offset + limit);
					
					res.json({err: null, data: galleries}).end();
				}
			);
		}
	);
});

/* Create outlet */
router.post('/create', function(req, res, next) {
	var db = req.db,
		params = {
			owner: req.body.owner,
			title: req.body.title ? (''+req.body.title).trim() : null,
			link: req.body.link ? (''+req.body.link).trim() : null
		},
		logger = routeLogger.child({endpoint: 'create', params: params, req_id: req.req_id});
	
	logger.info('Outlet create called');
	
	var finish = function(db, params, res){
		Outlet.add(db, params, function(err, outlet){
			if(err)
				return res.json({err: err.err, data: {}}).end();
			
			Outlet.unpack(db, outlet, function(err, outlet_unpacked){
				return res.json({err: err ? err.err : null, data: outlet_unpacked}).end();
			});
		});
	};
	
	var file = null;
	
	for (var index in req.files)
		file = req.files[index];
	
	if (file == null)
		return finish(db, params, res);
		
	var aws = require('aws-sdk'),
		s3 = new aws.S3(),
		fs = require('fs');
	
	aws.config.loadFromPath('./.aws/credentials');
	aws.config.region = 'us-east-1';
	
	if (['jpeg', 'jpg', 'jfif', 'jpe', 'png'].indexOf(file.name.split('.').pop().toLowerCase()) == -1)
		return res.json({err: 'INVALID_MEDIA_FORMAT', data: {}}).end();
	
	config.cropAvatar(file.path, function(err){
		if (err)
			return res.json({err: 'CROPPING_ERROR', data: {}}).end();
		
		var uploadedFile = fs.readFileSync(file.path);
		
		file.name = new Date().getTime() + '_' + file.name;
		
		s3.putObject({
			ACL : 'public-read',
			Bucket : config.BUCKET_AVATARS,
			Key : file.name,
			Body : uploadedFile,
			ContentType : 'metaData',
			CacheControl : 'max-age=86400'
		}, function(err, response){
			fs.unlinkSync(file.path);
	
			if (err)
				return res.json({err: 'FILE_UPLOAD_FAILED', data: {}}).end();
	
			params.avatar = config.CLOUDFRONT_AVATARS + file.name;
			finish(db, params, res);
		});
	});
});

/* Update outlet */
router.post('/update', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next) {
	var db = req.db,
		id = (""+req.body.id).trim(),
		authtoken = req.authtoken,
		params = { };
	
	if (req.body.link !== undefined)
		params.link = req.body.link;
	if (req.body.title !== undefined)
		params.title = req.body.title;
	//if (req.body.owner)
	//	params.owner = req.body.owner; IMPLEMENT PASSWORD PROTECTION FOR CHANGING OWNER

	var logger = routeLogger.child({endpoint: 'update', params: params, req_id: req.req_id});
	Outlet.get(db, id, function(err, _outlet){
		if (err)
			return res.json({err: err.err, data: {}}).end();

		// Authentication
		if (authtoken.user_id != _outlet.owner) {
			logger.info('User is not the owner of the outlet');
			return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
		}
	
		function updateOutlet(){
			logger.info('Outlet update called');
			
			function finish(db, id, params, res){
				Outlet.update(db, id, params, function(err, outlet_new){
					if(err)
						return res.json({err: err.err, data: {}}).end();
					
					Outlet.unpack(db, outlet_new, function(err, outlet_unpacked){
						return res.json({err: err ? err.err : null, data: outlet_unpacked}).end();
					});
				});
			}
			
			var file = null;
			
			for (var index in req.files)
				file = req.files[index];
			
			if (file == null)
				return finish(db, id, params, res);
				
			var aws = require('aws-sdk'),
				s3 = new aws.S3(),
				fs = require('fs');
			
			aws.config.loadFromPath('./.aws/credentials');
			aws.config.region = 'us-east-1';
			
			if (['jpeg', 'jpg', 'jfif', 'jpe', 'png'].indexOf(file.name.split('.').pop().toLowerCase()) == -1)
				return res.json({err: 'INVALID_MEDIA_FORMAT', data: {}}).end();
			
			config.cropAvatar(file.path, function(err){
				if (err)
					return res.json({err: 'CROPPING_ERROR', data: {}}).end();
				
				var uploadedFile = fs.readFileSync(file.path);
				
				file.name = new Date().getTime() + '_' + file.name;
				
				s3.putObject({
					ACL : 'public-read',
					Bucket : config.BUCKET_AVATARS,
					Key : file.name,
					Body : uploadedFile,
					ContentType : 'metaData',
					CacheControl : 'max-age=86400'
				}, function(err, response){
					fs.unlinkSync(file.path);
			
					if (err)
						return res.json({err: 'FILE_UPLOAD_FAILED', data: {}}).end();
			
					params.avatar = config.CLOUDFRONT_AVATARS + file.name;
					finish(db, id, params, res);
				});
			});
		}
		
		if (req.body.stripe_token){
			var Stripe = require('stripe')(config.STRIPE_SECRET);
			
			params.stripe = {};
			
			Outlet.getStripe(db, id, function(err, outlet_stripe){
				if (err)
					return res.json({err: err.err}).end();
				
				if (outlet_stripe.customer)
					Stripe.customers.update(
						outlet_stripe.customer,
						{
							source: req.body.stripe_token
						},
						function(err, customer){
							if (err)
								return res.json({err: err, data: {}}).end();

							params.stripe.card = customer.default_source;
							
							for (var index in customer.sources.data){
								if (customer.sources.data[index].id == params.stripe.card){
									params.card = {
										last4: customer.sources.data[0].last4,
										brand: customer.sources.data[0].brand
									};
									
									break;
								}
							}

							updateOutlet();
						}
					);
				else{
					var User = require('../../lib/user');
					
					User.get(db, _outlet.owner, function(err, user){
						if (err)
							return res.json({err: err.err, data: {}}).end();
							
						Stripe.customers.create(
							{
								email: user.email,
								source: req.body.stripe_token
							},
							function(err, customer){
								if (err)
									return res.json({err: err, data: {}}).end();
	
								params.stripe.customer = customer.id;
								params.stripe.card = customer.default_source;
								params.card = {
									last4: customer.sources.data[0].last4,
									brand: customer.sources.data[0].brand
								};
								
								updateOutlet();
							}
						);
					});
				}
			});
		}else
			return updateOutlet();
	});
});

/* Outlet add user */
router.post('/user/add', /*passport.authenticate('v1_authtoken', {session: false}), */function(req, res, next){
	var db = req.db,
		id = (''+req.body.id).trim(),
		user = (''+req.body.user).trim(),
		invitetoken = req.body.invitetoken,
		authtoken = req.authtoken,
		logger = routeLogger.child({endpoint: 'follow', id: id, user: user, req_id: req.req_id});
		
	logger.info('Outlet add user called');
	if (invitetoken){
		return Outlet.getInvitation(db, invitetoken, function(err, invitation){
			if (err)
				return res.json({err: err.err, data: {}}).end();
			var User = require('../../lib/user');
			
			User.get(db, user, function(err, user_obj){
				if (err)
					return res.json({err: err.err, data: {}}).end();
				if (invitation.email != user_obj.email)
					return res.json({err: 'ERR_INVALID_TOKEN', data: {}}).end();
					
				Outlet.resolveInvitation(db, invitetoken, function(err, outlet){
					if(err)
						return res.json({err: err.err, data: {}}).end();
						
					Outlet.revokeInvitation(db, invitation.email, invitation.token, function(err, result){
						if (err)
							return res.json({err: err.err, data: {}}).end();
						if (!result)
							return res.json({err: 'ERR_CANNOT_REVOKE_INVITATION', data: {}}).end();
							
						Outlet.addUser(db, outlet._id, user, function(err, result){
							if (err)
								return res.json({err: err.err, data: {}}).end();
							
							Outlet.unpack(db, result, function(err, outlet_unpacked){
								return res.json({err: err ? err.err : null, data: outlet_unpacked}).end();
							});
						});
					});
				});
			});
		});
	}else{
		return Outlet.get(db, id, function(err, outlet){
			// Authentication
			if (authtoken && (authtoken.user_id != outlet.owner || !AuthToken.checkScope('outlet_add_user', authtoken))) {
				logger.info('User is not authenticated');
				return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
			}
			
			if (user == outlet.owner)
				return res.json({err: 'ERR_RECRUIT_OWNER', data: {}}).end();
			
			Outlet.addUser(db, id, user, function(err, result){
				if(err)
					return res.json({err: err.err, data: {}}).end();
				
				Outlet.unpack(db, result, function(err, outlet_unpacked){
					return res.json({err: err ? err.err : null, data: outlet_unpacked}).end();
				});
			});
		});
	}
});

/* Outlet remove user */
router.post('/user/remove', /*passport.authenticate('v1_authtoken', {session: false}), */function(req, res, next){
	var db = req.db,
		id = (''+req.body.id).trim(),
		user = (''+req.body.user).trim(),
		authtoken = req.authtoken,
		logger = routeLogger.child({endpoint: 'follow', id: id, user: user, req_id: req.req_id});
		
	logger.info('Outlet remove user called');
	
	Outlet.get(db, id, function(err, outlet){
		// Authentication
		if (authtoken && (authtoken.user_id != outlet.owner || !AuthToken.checkScope('outlet_add_user', authtoken))) {
			logger.info('User is not authenticated');
			return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
		}
		
		Outlet.removeUser(db, id, user, function(err, result){
			if(err)
				return res.json({err: err.err, data: {}}).end();
			
			Outlet.unpack(db, result, function(err, outlet_unpacked){
				return res.json({err: err ? err.err : null, data: outlet_unpacked}).end();
			});
		});
	});
});

module.exports = router;
