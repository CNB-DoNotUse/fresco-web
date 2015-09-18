var config = require('./config'),
	mongodb = require('mongodb'),
	ObjectID = require('mongodb').ObjectID;

/*
	DATABASE STRUCTURE-----------

	_id				Unique object ID
	outlet			The outlet responsible for this assignment (null for Fresco)
	title			Title of assignment
	caption			Caption of assignment
	charged
		image		Whether or not the outlet was charged for a video
		video		Whether or not the outlet was charged for an image
	posts			List of posts relevant to this assignment
	purchased		List of posts purchased from this assignment
	active			Boolean, is the assignment currently active
	location
		geocode		GeoJSON Point object
		radius		Radius of the assignment (in miles)
		googlemaps	Name of location in google maps, displayed to content managers
		address		Street address of assignment
	time_created	UTC timestamp (ms) of when the assignment was created
	time_edited		UTC timestamp (ms) of when the assignment was last edited
	expiration_time	UTC timestamp (ms) of when the assignment should be marked as expiried
	visibility		The degree of visibility of the post
 */

function Assignment(_id, outlet, title, caption, charged, posts, purchased, active, location, radius, time_created, time_edited, expiration_time, visibility){
	this._id = _id;
	this.outlet = outlet;
	this.title = title;
	this.caption = caption;
	this.charged = charged;
	this.posts = posts;
	this.purchased = purchased;
	this.active = active;
	this.location = location;
	this.radius = radius;
	this.time_created = time_created;
	this.time_edited = time_edited;
	this.expiration_time = expiration_time;
	this.visibility = visibility;
}

/*
	Returns a new assignment object and stores it in the database.
	Params:
		db			The database object
		options
			outlet			The new assignment's creator outlet		(Default: null)
			title			The new assignment's title 				(Required)
			location		The new assignment's location 			(Required)
			caption			The new assignment's caption 			(Default: '')
			radius			The new assignment's radius				(Default: 1)
			active			The new assignment's status				(Default: true)
			expiration_time	The new assignment's expiration time	(Default: null)
		callback	Callback for handling the response. Returns an error object,
					and assignment object on success or null on fail
 */
Assignment.add = function(db, options, callback){
	if (!db)
		return callback({err:"Could not connect to database"}, {});
	if (!config.isValidAssignmentTitle(options.title))
		return callback({err:"Invalid title"}, {});
	if (!config.isGeoJSON(options.location.geo))
		return callback({err:"Invalid location"}, {});
	if(typeof options.location.radius != 'number' || options.location.radius <= 0)
		return callback({err:"Invalid radius"}, {});
	if(options.location.googlemaps && typeof options.location.googlemaps != 'string')
		return callback({err:"Invalid Google Maps name"}, {});
	if(options.location.address && typeof options.location.address != 'string')
		return callback({err:"Invalid address"}, {});
	if (options.caption && !config.isValidCaption(options.caption))
		return callback({err: 'Invalid caption'}, {});
		
	var coll = db.get(config.COLLECTION_ASSIGNMENTS),
		Outlet = require('./outlet');
	
	var finish = function(coll, options){
		coll.insert({
			outlet: options.outlet,
			title : options.title,
			caption : options.caption || '',
			charged: {
				image: false,
				video: false
			},
			location : options.location,
			active : options.active == 'true',
			time_created : new Date().getTime(),
			time_edited : null,
			expiration_time: options.expiration_time,
			posts : [],
			purchased : [],
			visibility : config.VISIBILITY_PENDING
		}, function(err, data) {
			require('./notification').pushNear(
				db,
				{
					lat: options.location.geo.coordinates[1],
					lon: options.location.geo.coordinates[0],
					radius: options.location.radius
				}
			);
			callback(err, err ? {} : new Assignment(''+data._id, data.outlet, data.title, data.caption, data.charged, data.posts, data.purchased, data.active, data.location, data.radius, data.time_created, data.time_edited, data.expiration_time, data.visibility));
		});
	};
	
	if (!options.outlet)
		return finish(coll, options);
	
	Outlet.get(db, options.outlet, function(err, outlet){
		if (err)
			return callback(err, null);
			
		finish(coll, options);
	});
};

/*
	Returns an assignment object with the given ID.
	Params:
		db			The database object
		_id			The ID of the assignment to be queried for
		callback	Callback for handling the response. Returns null if not found,
					or the assignment as an object if found
 */
Assignment.get = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});

	if (!ObjectID.isValid(_id))
		return callback({err:"Invalid assignment ID"}, {});
		
	var coll = db.get(config.COLLECTION_ASSIGNMENTS);

	coll.find(
		{
			_id : new ObjectID(_id)
		},
		function(err, doc){
			if (err)
				return callback(err, {});
			if (doc.length > 1)
				return callback({err:"ID matches multiple assignments"}, {});
			if (doc.length == 0)
				return callback({err:"Assignment not found"}, {});
			
			callback(err, !doc ? {} : new Assignment(''+doc[0]._id, doc[0].outlet, doc[0].title, doc[0].caption, doc[0].charged, doc[0].posts, doc[0].purchased, doc[0].active, doc[0].location, doc[0].radius, doc[0].time_created, doc[0].time_edited, doc[0].expiration_time, doc[0].visibility));
		}
	);
};

/*
TO BE CHANGED!!!!!!!!!!!!
*/
Assignment.getAll = function(db, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
		var coll = db.get(config.COLLECTION_ASSIGNMENTS);

		coll.find({},
			function(err, doc){
				if (err)
					return callback(err, {});
				callback(err, doc);
			}
		);
};
Assignment.getAllExpired = function(db, outlet_id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (outlet_id && !ObjectID.isValid(outlet_id))
		return callback({err:"Invalid assignment ID"}, {});
	
	var coll = db.get(config.COLLECTION_ASSIGNMENTS);

	var query = {};

	if(outlet_id) query.outlet = outlet_id;

	coll.find(query, function(err, doc){
			if (err)
				return callback(err, []);
			callback(err, doc.filter(function(item){
				return item.expiration_time  && item.expiration_time < Date.now();
			}));
		}
	);
};
Assignment.getAllPending = function(db, outlet_id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (outlet_id && !ObjectID.isValid(outlet_id))
		return callback({err:"Invalid assignment ID"}, {});
	
	var coll = db.get(config.COLLECTION_ASSIGNMENTS);
	var query = { visibility: 0, expiration_time: { $gt: new Date().getTime() } };

	if(outlet_id) query.outlet = outlet_id;

	coll.find(query, function(err, doc){
			if (err)
				return callback(err, []);
			
			var assignments = [];
			
			for (var index in doc)
				assignments.push(new Assignment(''+doc[index]._id, doc[index].outlet, doc[index].title, doc[index].caption, doc[index].charged, doc[index].posts, doc[index].purchased, doc[index].active, doc[index].location, doc[index].radius, doc[index].time_created, doc[index].time_edited, doc[index].expiration_time, doc[index].visibility));
			
			return callback(null, assignments);
		}
	);
};

/*
	Updates the database with the new assignment info.
	Params:
		db			The database object
		_id			The ID of the assignment to update
		updates		The updates to be applied.  Any non-null field is considered an update, excluding ID
		callback	Callback for handling the response. Returns true is successful, false if not
*/
Assignment.update = function(db, _id, updates, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err: 'Invalid assignment ID'}, {});
	if (updates == {})
		return callback({err:"No updates provided"}, {});
	if (updates.title && !config.isValidAssignmentTitle(updates.title))
		return callback({err: 'Invalid assignment title'}, {});
	if (updates.caption && !config.isValidCaption(updates.caption))
		return callback({err: 'Invalid assignment caption'}, {});
	if (updates['location.googlemaps'] && typeof updates['location.googlemaps'] != 'string')
		return callback({err: 'Invalid Google Maps location name'}, {});
	if (updates['location.address'] && typeof updates['location.address'] != 'string')
		return callback({err: 'Invalid address'}, {});
	if (updates['location.radius'] && (typeof updates['location.radius'] != 'number' || updates['location.radius'] <= 0))
		return callback({err: 'Invalid assignment radius'}, {});
	if (updates['location.geo'] && !config.isGeoJSON(updates['location.geo']))
		return callback({err: 'Invalid assignment location'}, {});
	if (updates.expiration_time && (typeof (updates.expiration_time) != 'number' || updates.expiration_time < new Date().getTime()))
		//console.log(updates.expiration_time + " " );
		return callback({err: 'Invalid assignment expiration time'}, {});
	if (updates.active)
		updates.active = updates.active == 'true';
	if(updates.visibility && !config.isValidVisibility(updates.visibility))
		return callback({err: 'Invalid assignment visibility'}, {});
		
	updates.time_edited = new Date().getTime();
			
	//Update the document
	db.get(config.COLLECTION_ASSIGNMENTS).findAndModify(
		{
			query: { 
				_id: new ObjectID(_id)
			},
			update: {
				$set : updates
			}
		},
		{
			new: true,
			upsert: false
		},
		function(err, assignment){
			if (!err && !assignment)
				return callback({err: 'ERR_NOT_FOUND'}, {});
			
			callback(err, assignment);
		}
	);
};

/*
	Removes the assignment with the give id from the database
	Params:
		db			The database object
		_id			The ID of the assignment to delete
		callback	Callback for handling the response. Is called with an error if one occured
*/
Assignment.remove = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err: "Invalid assignment ID"}, false);
	
	db.get(config.COLLECTION_ASSIGNMENTS).update(
		{
			_id: new ObjectID(_id)
		},
		{
			$set: {
				active: false
			}
		},
		function(err, count, status){
			callback(err, !err && count == 1);
		}
	);
};

/*
	Add the post to the given assignment
	Params:
		db			The database object
		_id			The ID of the assignment to add the post to
		post_id	The ID of the post to add
		callback	Callback for handling the response. Returns true is successful, false if not 
*/
Assignment.addPost = function(db, _id, post_id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err: "Invalid assignment ID"}, false);
	
	var coll = db.get(config.COLLECTION_ASSIGNMENTS),
		Post = require('./post');
	
	Post.get(db, post_id, function(err, post){
		if (err)
			return callback(err, false);
		
		coll.update(
			{
				_id: new ObjectID(_id)
			},
			{
				$push: {
					posts: post_id
				}
			},
			function(err, count, status){
				if (err)
					callback(err, false);
				if (count == 0)
					callback({err: 'Assignment not found'}, false);
				
				callback(null, true);
			}
		);
	});
};
/*
	Add the post to the given assignment
	Params:
		db			The database object
		_id			The ID of the assignment to add the post to
		post_id	The ID of the post to add
		callback	Callback for handling the response. Returns true is successful, false if not 
*/
Assignment.buyPost = function(db, _id, post_id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err: "Invalid assignment ID"}, false);
	
	var coll = db.get(config.COLLECTION_ASSIGNMENTS),
		Post = require('./post');
	
	Post.get(db, post_id, function(err, post){
		if (err)
			return callback(err, false);
		
		coll.update(
			{
				_id: new ObjectID(_id)
			},
			{
				$push: {
					purchased: post_id
				}
			},
			function(err, count, status){
				if (err)
					callback(err, false);
				if (count == 0)
					callback({err: 'Assignment not found'}, false);
				
				callback(null, true);
			}
		);
	});
};

/*
	Add the post to the given assignment
	Params:
		db			The database object
		_id			The ID of the assignment to remove the post from
		post_id	The ID of the post to remove
		callback	Callback for handling the response. Returns true is successful, false if not 
*/
Assignment.removePost = function(db, _id, post_id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err: "Invalid assignment ID"}, false);
	
	db.get(config.COLLECTION_ASSIGNMENTS).update(
		{
			_id: new ObjectID(_id)
		},
		{
			$pull: {
				posts: post_id
			}
		},
		function(err, count, status){
			if (err)
				callback(err, false);
			if (count == 0)
				callback({err: 'Assignment not found'}, false);
			
			callback(null, true);
		}
	);
};
/*
	Add the post to the given assignment
	Params:
		db			The database object
		_id			The ID of the assignment to remove the post from
		post_id	The ID of the post to remove
		callback	Callback for handling the response. Returns true is successful, false if not 
*/
Assignment.returnPost = function(db, _id, post_id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err: "Invalid assignment ID"}, false);
	
	db.get(config.COLLECTION_ASSIGNMENTS).update(
		{
			_id: new ObjectID(_id)
		},
		{
			$pull: {
				purchased: post_id
			}
		},
		function(err, count, status){
			if (err)
				callback(err, false);
			if (count == 0)
				callback({err: 'Assignment not found'}, false);
			
			callback(null, true);
		}
	);
};

/*
	Find any assignments in the given user's range
	Params:
		db				The database object
		user			The object of the user
		user_geocode	The user's current location, as a GeoJSON point object
		callback		Callback for handling the response
*/
Assignment.queryUser = function(db, user, user_geocode, active, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, []);
	if(!config.isGeoJSON(user_geocode))
		return callback({err: "Invalid Location"}, []);
	
	var async = require('async'),
		radius = user.radius || 2;
	
	// This is a two step process, as mongo doesn't have a circle intersection query. First,
	// we find all assignments that it could possibly be (by adding the user's radius to the
	// maximum assignment radius), and then check each of those individually.
	findInRadius(db, user_geocode, config.MAX_ASSIGNMENT_RADIUS + radius, active, function(err, data){
		if (err) return callback({err: err}, null);
		async.filter(data, function(assignment, filterCB){
			filterCB(assignment.location.radius + radius >= config.geodesicDistanceMiles(user_geocode, assignment.location.geo));
		}, function(results){
			callback(null, results);
		});
	});
};

/*
	(BETA) Find 'clusters' of assignments, within the given radius.
	Params:
		db					The database object
		geocode				A GeoJSON point indicating where to search from
		radius				How far away to look for assignments
		params
			init_radius		Initial clustering radius of assignment
			starting_radius	Radius where clustering starts, used for scaling
			zoom			Zoom factor (higher means more zoomed in), use instead of starting_radius
		callback			Callback for handling results
*/
Assignment.findClusters = function(db, geocode, radius, params, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, []);
	if(!config.isGeoJSON(geocode))
		return callback({err: "Invalid Location"}, []);
		
	findInRadius(db, geocode, radius, params.active, function(err, data){
		if(err) return callback(err, []);
		var scale = params.zoom || params.starting_radius / radius;
		var clusters = [];
		for (var i = 0; i < data.length; i++) {
			var assign_geo = data[i].location.geo;
			var addedToCluster = false;
			for (var j = 0; j < clusters.length; j++) {
				var cluster = clusters[j];
				if (config.geodesicDistanceMiles(assign_geo, cluster.geo) < (2 * params.init_radius) / scale) {
					addedToCluster = true;
					var mid = config.geodesicMidpoint(assign_geo, cluster.geo);
					var rad = (2 * params.init_radius) + config.geodesicDistanceMiles(mid, cluster.geo);
					clusters[j] = {geo: mid, radius: rad};
					break;
				}
			}
			if(!addedToCluster) {
				clusters.push({geo: assign_geo, radius: params.init_radius});
			}
		}
		
		callback(null, clusters);
	});
};

/*
	Runs a geospatial query, returning all points within the radius from the given point
	Params:
		db			The database object
		geocode		A GeoJSON point object indicating where to search from
		radius		How far away to look for assignments (in miles)
		callback	Callback for handling results
*/
function findInRadius(db, geocode, radius, active, callback){
	if(geocode === null)
		return callback({err: "Invalid Location"}, null);
	
	var query = { };
		
	if (active){
		query.visibility = config.VISIBILITY_VERIFIED;
		query.expiration_time = { $gt: Date.now() };
	}
	
	query['location.geo'] = {
		$nearSphere: {
			$geometry: geocode,
			$maxDistance: config.convertMilesToMeters(radius)
		}
	};
		
	db.get(config.COLLECTION_ASSIGNMENTS).find(
		query,
		function(err, doc){
			return callback(err, err ? null : doc);
		}
	);
}

Assignment.unpack = function(db, assignment, callback){
	var Outlet = require('./outlet'),
		Post = require('./post'),
		async = require('async');
	
	async.parallel(
		[
			function(cb1){
				if (!assignment.outlet)
					return cb1();
				
				Outlet.get(db, assignment.outlet, function(err, outlet){
					assignment.outlet = outlet;
					return cb1();
				});
			},
			function(cb1){
				if (!assignment.posts)
					return cb1();
				
				var posts = [];
				
				async.eachSeries(
					assignment.posts,
					function(post, cb2){
						Post.get(db, post, function(err, post){
							if (err) return cb2(err);
							posts.push(post);
							cb2();
						});
					},
					function(err){
						assignment.posts = posts;
						cb1(err);
					}
				);
			}
		],
		function(err){
			callback(err, assignment);
		}
	);
};

module.exports = Assignment;