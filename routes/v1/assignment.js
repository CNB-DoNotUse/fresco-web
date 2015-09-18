var config = require('../../lib/config'),
	routeLogger = require('../../lib/logger').child({route: 'assignment'}),
	Assignment = require('../../lib/assignment'),
	express = require('express'),
	passport = require('passport'),
	router = express.Router();

/*
	Return a dummy assignment
*/
router.get('/', function(req, res, next){
	var assignment = new Assignment('id_exampleStory', 'id_exampleOutlet', 'Test Assignment', 'Test Caption', [], 'active', {geocode:{type: "Point", cordinates: [-70, 40]}, radius: 5}, 5, new Date().getTime(), null, null);
	res.send(JSON.stringify({err: null, data: assignment}, null, 4)).end();
});

/*
	Return the assignment with the given id (passed as a query parameter)
	EX: /api/assignments/get?id=<ID_HERE>
*/
router.get('/get', function(req, res, next){
	var db = req.db,
		id = req.query.id ? (''+req.query.id).trim() : null,
		logger = routeLogger.child({endpoint: 'get', id: id, req_id: req.req_id});
	
	logger.info('Assignment get called');
	
	Assignment.get(db, id, function(err, assignment){
		if (err) return res.json({err: err.err}).end();
		Assignment.unpack(db, assignment, function(err, unpacked_assignment){
			if (err) return res.json({err: err.err}).end();
			return res.json({err: err ? err.err : null, data: assignment}).end();
		});
	});
});

/* Get outlet ***IMPLEMENT PASSPORT SECURITY TO ALLOW ONLY ADMINS TO MAKE CHANGE*** */
router.post('/approve', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next) {
	var User = require('../../lib/user'),
		db = req.db,
		id = req.body.id,
		logger = routeLogger.child({endpoint: 'approve', req_id: req.req_id});
	
	logger.info('Assignment approve called');
	
	User.get(db, req.authtoken.user_id, function(err, user){
		if (err)
			return res.json({err: err.err, data: user}).end();
		if (user.rank < config.RANKS.CONTENT_MANAGER)
			return res.status(401).json({err: 'ERR_UNAUTHORIZED', data: {}}).end();
		
		Assignment.get(db, id, function(err, assignment){
			if (err)
				return res.json({err: err.err, data: {}}).end();
			
			// var Outlet = require('../../lib/outlet');
			
			// Outlet.getStripe(db, assignment.outlet, function(err, outlet){
			// 	if (err)
			// 		return res.json({err: err.err, data: {}}).end();
					
			// 	var Stripe = require("stripe")(config.STRIPE_SECRET);
				
			// 	Stripe.charges.create(
			// 		{
			// 			amount: 500,
			// 			currency: 'usd',
			// 			customer: outlet.customer,
			// 			source: outlet.card,
			// 			description: 'Fresco News $5 assignment creation fee',
			// 			metadata: {
			// 				outlet: ''+assignment.outlet,
			// 				assignment: ''+assignment._id
			// 				//content_manager: user IMPLEMENT AFTER PASSPORT
			// 			}
			// 		},
			// 		function(err, charge){
			// 			if (err)
			// 				return res.json({err: err, data: {}});
							
						Assignment.update(db, id, { visibility: 1 }, function(err, result){
							if (err){
								// return Stripe.charges.createRefund(
								// 	charge.id,
								// 	{},
								// 	function(error, refund){
								// 		if (error){
								// 			console.log('URGENT, UNABLE TO REFUND FAILED APPROVAL FOR ASSIGNMENT ' + assignment._id);
								// 			return res.json({err: 'ERR_REFUND', data: {}}).end();
								// 		}
										
								// 		res.json({err: err, data: result});
								// 	}
								// );
								return res.json({err: err, data: {}}).end();
							}
							
							var Notif = require('../../lib/notification');
							
							var format = { 
								"aps": {
									"alert": {
										"body": assignment.title,
										"title": "Fresco News"
									},
									"sound": "chime.aiff",
									"category": "ASSIGNMENT_CATEGORY"
								},
								"assignment": assignment._id.toString(),
								"type": "assignment"
							};
							
							Notif.sendNear(db, {
								geo: assignment.location.geo,
								radius: assignment.location.radius,
								type: config.NOTIF_ASSIGNMENT_NEW,
								title: "Fresco News",
								body: assignment.caption,
								format: format,
								meta: { assignment: assignment._id.toString(), event: assignment.title }
							});
							
							res.json({err: err, data: result}).end();
						});
			// 		}
			// 	);
			// });
		});
	});
});

/* Get outlet */
router.post('/deny', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next) {
	var User = require('../../lib/user'),
		db = req.db,
		id = req.body.id,
		logger = routeLogger.child({endpoint: 'deny', req_id: req.req_id});
	
	logger.info('Assignment deny called');
	
	User.get(db, req.authtoken.user_id, function(err, user){
		if (err)
			return res.json({err: err.err, data: {}}).end();
		if (user.rank < config.RANKS.CONTENT_MANAGER)
			return res.status(401).json({err: 'ERR_UNAUTHORIZED', data: {}}).end();
				
		Assignment.update(db, id, { active: false, visibility: -1 }, function(err, result){
			res.json({err: err, data: result}).end();
		});
	});
});

/*
TO BE CHANGED!!!!!!!!!!!!
*/
router.get('/getAll', function(req, res, next){
	var db = req.db,
		logger = routeLogger.child({endpoint: 'getAll', req_id: req.req_id});
	
	logger.info('Assignment getAll called');
	
	Assignment.getAll(db, function(err, assignment){
		if (err) logger.warn(err.err);
		return res.json({err: err ? err.err : null, data: assignment}).end();
	});
});
router.get('/getAllExpired', function(req, res, next){
	var db = req.db,
		outlet_id = req.query.outlet,
		logger = routeLogger.child({endpoint: 'getAllExpired', req_id: req.req_id});
	
	logger.info('Assignment getAllExpired called');
	
	Assignment.getAllExpired(db, outlet_id, function(err, assignment){
		if (err) logger.warn(err.err);
		return res.json({err: err ? err.err : null, data: assignment}).end();
	});
});
router.get('/pending', function(req, res, next){
	var db = req.db,
		outlet_id = req.query.outlet,
		logger = routeLogger.child({endpoint: 'pending', req_id: req.req_id});
	
	logger.info('Assignment get pending called');
	
	Assignment.getAllPending(db, outlet_id, function(err, assignments_packed){
		var async = require('async'),
			assignments = [];
		
		if (err) logger.warn(err.err);
		
		async.eachSeries(
			assignments_packed,
			function(assignment, cb){
				Assignment.unpack(db, assignment, function(err, assignment){
					if (err)
						return cb(err);
					
					assignments.push(assignment);
					cb();
				});
			},
			function(err){
				return res.json({err: err ? err.err : null, data: assignments}).end();
			}
		);
	});
});

/*
	Create an assignment with the given information (passed as JSON in the POST body)
*/
router.post('/create', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next){
	var Mandrill = require('mandrill-api'),
		mandrill_client = new Mandrill.Mandrill(config.MANDRILL_API_KEY),
		User = require('../../lib/user'),
		Outlet = require('../../lib/outlet'),
		db = req.db,
		params = {
			outlet: req.body.outlet ? (''+req.body.outlet).trim() : null,
			title: (''+req.body.title).trim(),
			caption: (''+req.body.caption).trim(),
			location: {
				geo: {
					type: "Point",
					coordinates: [parseFloat(req.body.lon), parseFloat(req.body.lat)]
				},
				radius: parseFloat(req.body.radius),
				googlemaps: req.body.googlemaps,
				address: req.body.address,
			},
			active: req.body.active == 'true',
			expiration_time: parseInt(req.body.expiration_time)
		},
		logger = routeLogger.child({endpoint: 'create', params: params, req_id: req.req_id});
		
	logger.info('Assignment create called');
	
	Outlet.get(db, params.outlet, function(err, outlet){
		if (err)
			return res.json({err: err.err, data: outlet}).end();
		if (outlet.owner != req.authtoken.user_id && outlet.users.indexOf(req.authtoken.user_id) == -1)
			return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
		
		Assignment.add(db, params, function(err, assignment){
			if (err){
				logger.warn(err.err);
				return res.json({err: err.err, data: {}}).end();
			}
			
			res.json({err: null, data: assignment}).end();
			
			if(assignment.visibility == config.VISIBILITY_VERIFIED){
				var Notif = require('../../lib/notification');
				
				var format = { 
					"aps": {
						"alert": {
							"body": assignment.title,
							"title": "Fresco News"
						},
						"sound": "chime.aiff",
						"category": "ASSIGNMENT_CATEGORY"
					},
					"assignment": assignment._id.toString(),
					"type": "assignment"
				};
				
				Notif.sendNear(db, {
					lat: params.location.geo.coordinates[1],
					lon: params.location.geo.coordinates[0],
					radius: params.location.radius,
					type: config.NOTIF_ASSIGNMENT_NEW,
					title: "Fresco News",
					body: assignment.caption,
					format: format,
					meta: { assignment: assignment._id.toString(), event: assignment.title }
				});
			}
			
			User.getAdmins(db,
				function(err, admins){
					var emails = [];
					
					for (var i = 0; i < admins.length; emails.push({email:admins[i].email}), ++i);
					
					mandrill_client.messages.sendTemplate(
						{
							template_name: 'assignment-create-cm-alert',
							template_content: [
								{
									name: 'ASSIGNMENT',
									content: assignment.title
								}
							],
							message: {
								subject: "Assignment Created",
								from_email: "donotreply@fresconews.com",
								from_name: 'Fresco News',
								to: emails
							}
						},
						function(result){
							
						}
					);
				}
			);
		});
	});
});

/*
	Update the assignment with the given information (passed as JSON in the POST body)
	If you want to update a single field of the the location object, then you need to
	use 'dot notation': {'location.radius': 2}. If you pass an object in for the
	location field, the whole object will be replaced.
	
	The ID of the object to be replaced should be passed as the 'id' property of the 
	update object
*/
router.post('/update', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next){
	var Outlet = require('../../lib/outlet'),
		User = require('../../lib/user'),
		db = req.db,
		id = (''+req.body.id).trim(),
		params = {},
		logger = routeLogger.child({endpoint: 'update', params: params, req_id: req.req_id});
	
	Assignment.get(db, id, function(err, assignment){
		if (err)
			return res.json({err: err, data: {}}).end();
		
		User.get(db, req.authtoken.user_id, function(err, user){
			if (err)
				return res.json({err: err, data: {}}).end();
				
			Outlet.get(db, assignment.outlet, function(err, outlet){
				if (err)
					return res.json({err: err, data: {}}).end();
				if (user.rank < config.RANKS.CONTENT_MANAGER && req.authtoken.user_id != outlet.owner && outlet.users.indexOf(req.authtoken.user_id) == -1)
					return res.status(401).json({err: 'ERR_UNAUTHORIZED', data: {}}).end();
					
				if(req.body.title)
					params.title = req.body.title;
				if(req.body.caption)
					params.caption = req.body.caption;
				if(req.body.active)
					params.active = req.body.active;
				if(req.body.expiration_time)
					params.expiration_time = parseInt(req.body.expiration_time);
				if(req.body.radius)
					params['location.radius'] = parseFloat(req.body.radius);
				if(req.body.googlemaps)
					params['location.googlemaps'] = req.body.googlemaps;
				if(req.body.visibility)
					params.visibility = parseInt(req.body.visibility);
					
				if (req.body.lat && req.body.lon){
					params['location.geo'] = {
						type: "Point",
						coordinates: [parseFloat(req.body.lon), parseFloat(req.body.lat)]
					};
				}
				
				logger.info('Assignment update called');
				
				Assignment.update(db, id, params, function(err, assignment){
					if(err) logger.warn(err.err);
					if (params.visibility == config.VISIBILITY_VERIFIED){
						var Notif = require('../../lib/notification');
						Notif.sendNear(db, {
							lat: assignment.location.geo.coordinates[1],
							lon: assignment.location.geo.coordinates[0],
							radius: assignment.location.radius,
							type: config.NOTIF_ASSIGNMENT_NEW,
							title: "Fresco News",
							body: assignment.title,
							format: { 
								"aps": {
									"alert": { 
										"body": assignment.title, 
										"title": "Fresco News"
									}, 
									"sound": "chime.aiff",
									"category": "ASSIGNMENT_CATEGORY" 
								}, 
								"assignment": assignment._id.toString(),
								"type": "assignment" 
							}
						});
					}
					return res.json({err: err ? err.err : null, data: assignment}).end();
				});
			});
		});
	});
});

/*
	Delete the assignment with the given id (passed as JSON in the POST body)
*/
router.post('/delete', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next){
	var Outlet = require('../../lib/outlet'),
		User = require('../../lib/user'),
		db = req.db,
		id = req.body.id ? (''+req.body.id).trim() : null,
		logger = routeLogger.child({endpoint: 'delete', id: id, req_id: req.req_id});
		
	logger.info('Assignment delete called');
	
	Assignment.get(db, id, function(err, assignment){
		if (err)
			return res.json({err: err, data: {}}).end();
		
		User.get(db, req.authtoken.user_id, function(err, user){
			if (err)
				return res.json({err: err, data: {}}).end();
				
			Outlet.get(db, assignment.outlet, function(err, outlet){
				if (err)
					return res.json({err: err, data: {}}).end();
				if (user.rank < config.RANKS.CONTENT_MANAGER && req.authtoken.user_id != outlet.owner && outlet.users.indexOf(req.authtoken.user_id) == -1)
					return res.status(401).json({err: 'ERR_UNAUTHORIZED', data: {}}).end();
				
				Assignment.remove(db, id, function(err, result){
					if (err) logger.warn(err.err);
					return res.json({err: err ? err.err : null, data: result}).end();
				});
			});
		});
	});
});

/*
	Add a post to the assignment with the given id (passed as JSON in the POST body)
*/
router.post('/post/add', function(req, res, next){
	var Mandrill = require('mandrill-api'),
		mandrill_client = new Mandrill.Mandrill(config.MANDRILL_API_KEY),
		Outlet = require('../../lib/outlet'),
		User = require('../../lib/user'),
		db = req.db,
		id = req.body.id ? (''+req.body.id).trim() : null,
		post_id = req.body.post,
		logger = routeLogger.child({endpoint: 'post/add', id: id, post: post_id, req_id: req.req_id});
		
	logger.info('Assignment gallery add called');
	
	Assignment.get(db, id, function(err, assignment){
		if (err)
			return res.json({err: err, data: {}}).end();
		
		User.get(db, req.authtoken.user_id, function(err, user){
			if (err)
				return res.json({err: err, data: {}}).end();
				
			Outlet.get(db, assignment.outlet, function(err, outlet){
				if (err)
					return res.json({err: err, data: {}}).end();
				if (user.rank < config.RANKS.CONTENT_MANAGER && req.authtoken.user_id != outlet.owner && outlet.users.indexOf(req.authtoken.user_id) == -1)
					return res.status(401).json({err: 'ERR_UNAUTHORIZED', data: {}}).end();
				
				Assignment.addPost(db, id, post_id, function(err, result){
					if(err) logger.warn(err.err);
					
					var url = config.FRESCO_ROOT + 'assignment/' + assignment._id;
					
					if (!assignment.posts || assignment.posts.length == 0)
						User.get(db, outlet.owner, function(err, owner){
							mandrill_client.messages.sendTemplate(
								{
									template_name: 'assignment-new-content',
									template_content: [
										{
											name: 'ASSIGNMENT',
											content: assignment.title
										},
										{
											name: 'LINK',
											content: '<a href="' + url + '">Assignment Page</a>'
										}
									],
									message: {
										subject: "You have new content!",
										from_email: "donotreply@fresconews.com",
										from_name: 'Fresco News',
										to: [{email: owner.email}]
									}
								},
								function(result){console.log(result);}
							);
						});
						
					return res.json({err: err ? err.err : null, data: result}).end();
				});
			});
		});
	});
});

/*
	Remove a post from the assignment with the given id (passed as JSON in the POST body)
*/
router.post('/post/remove', function(req, res, next){
	var Outlet = require('../../lib/outlet'),
		User = require('../../lib/user'),
		db = req.db,
		id = req.body.id ? (''+req.body.id).trim() : null,
		post_id = (''+req.body.post).trim(),
		logger = routeLogger.child({endpoint: 'post/remove', id: id, post: post_id, req_id: req.req_id});
		
	logger.info('Assignment post remove called');
	
	Assignment.get(db, id, function(err, assignment){
		if (err)
			return res.json({err: err, data: {}}).end();
		
		User.get(db, req.authtoken.user_id, function(err, user){
			if (err)
				return res.json({err: err, data: {}}).end();
				
			Outlet.get(db, assignment.outlet, function(err, outlet){
				if (err)
					return res.json({err: err, data: {}}).end();
				if (user.rank < config.RANKS.CONTENT_MANAGER && req.authtoken.user_id != outlet.owner && outlet.users.indexOf(req.authtoken.user_id) == -1)
					return res.status(401).json({err: 'ERR_UNAUTHORIZED', data: {}}).end();
				
				Assignment.removePost(db, id, post_id, function(err, result){
					if(err) logger.warn(err.err);
					return res.json({err: err ? err.err : null, data: result}).end();
				});
			});
		});
	});
});

/*
	Find all assignments that overlap with the given location and radius (passed
	in the query string)
*/
router.get('/find', function(req, res, next){
	var db = req.db,
		geocode = {
			type: "Point",
			coordinates: [parseFloat(req.query.lon), parseFloat(req.query.lat)]
		},
		active = req.query.active == 'true',
		radius = parseFloat(req.query.radius),
		logger = routeLogger.child({endpoint: 'find', radius: radius, geocode: geocode, req_id: req.req_id});
		
	logger.info('Assignment find called');
		
	Assignment.queryUser(db, {radius: radius}, geocode, active, function(err, data){
		if(err) logger.warn(err.err);
		return res.json({err: err ? err.err : null, data: data}).end();
	});
});

/*
	Find 'clusters' of assignments, for when the user is looking at a zoomed out 
	view of the map. 
*/
router.get('/findclustered', function(req, res, next){
	var db = req.db,
	geocode = {
		type: "Point",
		coordinates: [parseFloat(req.query.lon), parseFloat(req.query.lat)]
	},
	params = {
		init_radius: req.query.init_radius ? parseFloat(req.query.init_radius) : 10,
		starting_radius: req.query.starting_radius ? parseFloat(req.query.starting_radius) : 500,
		zoom: req.query.zoom ? parseFloat(req.query.zoom) : null,
		active: req.query.active == 'true'
	},
	radius = parseFloat(req.query.radius),
	logger = routeLogger.child({endpoint: 'find', radius: radius, geocode: geocode, params: params, req_id: req.req_id});
	
	logger.info({endpoint: 'find', radius: radius, geocode: geocode, params: params}, 'Assignment findclustered called');
	
	Assignment.findClusters(db, geocode, radius, params, function(err, data){
		if(err) logger.warn(err.err);
		return res.json({err: err ? err.err : null, data: data}).end();
	});
});

module.exports = router;