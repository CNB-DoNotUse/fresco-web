var config = require('./config'),
	ObjectID = require('mongodb').ObjectID;
/*
	DATABASE STRUCTURE-----------

	_id				Unique object ID
	user			ID of the user
	type			Type of notification
	title			Title of the notification
	body			Body of the notification
	meta			Other data included with this notification
	seen			Boolean for if the notification has been seen
	time_created	Timestamp of the notification
	active			Is not deleted (true/false)
*/

/*
	Constructor
*/
function Notification(_id, user, type, title, body, meta, seen, time_created){
	this._id = _id;
	this.user = user;
	this.type = type;
	this.title = title;
	this.body = body;
	this.meta = meta;
	this.seen = seen;
	this.time_created = time_created;
};

//Requires format variable in options
Notification.push = function(db, options){
	var request = require('request');
	
	request(
		{
			url: 'https://api.parse.com/1/user?frescoUserId=' + options.id,
  			headers: {
				'X-Parse-Application-Id': config.PARSE_APP_ID,
				'X-Parse-REST-API-Key': config.PARSE_API_KEY,
				'Content-Type': 'application/json'
  			}
		},
		function(error, response, body){
			if (error)
				return console.log("Failed GET USER from Parse at " + new Date().getTime() + ".  User: " + options.id);
			
			request.post(
				{
					url: 'https://api.parse.com/1/push',
		  			headers: {
						'X-Parse-Application-Id': config.PARSE_APP_ID,
						'X-Parse-REST-API-Key': config.PARSE_API_KEY
		  			}
				},
				{
					form: {
						where: {
							objectId: body.objectId
						},
						data: options.format
					}
				},
				function(error, response, body){
					if (error)
						return console.log("Failed SEND NOTIF via Parse at " + new Date().getTime() + ".  User: " + options.id);
				}
			);
		}
	);
};

//Requires format variable in options
Notification.pushNear = function(db, options){
	var request = require('request');
	
	var reqOptions = {
		url: 'https://api.parse.com/1/push',
		headers: {
			'X-Parse-Application-Id': config.PARSE_APP_ID,
			'X-Parse-REST-API-Key': config.PARSE_API_KEY,
			'Content-Type': 'application/json'
		},
		method: 'post',
		json: 'true',
		body: {
			where: {
				owner: {
					'$inQuery': {
						location: {
							'$nearSphere': {
								'__type': 'GeoPoint',
								latitude: options.lat,
								longitude: options.lon
							},
							'$maxDistanceInMiles': options.radius
						}
					}
				}
			},
			data: options.format
		}
	};
	
	// request(reqOptions, function(err, res, body){
	// 	if (err){
	// 		console.log(err);
	// 		console.log(JSON.stringify(res));
	// 		return console.log("Failed SEND NOTIF via Parse at " + new Date().getTime() + ".  User: " + options.id);
	// 	}
	// 	console.log(JSON.stringify(res));
	// });
	
	// request.post(
	// 	{
	// 		url: 'https://api.parse.com/1/push',
  	// 		headers: {
	// 			'X-Parse-Application-Id': config.PARSE_APP_ID,
	// 			'X-Parse-REST-API-Key': config.PARSE_API_KEY
  	// 		}
	// 	},
	// 	{
	// 		form: {
	// 			where: {
	// 				user: {
	// 					'$inQuery': {
	// 						location: {
	// 							'$nearSphere': {
	// 								'__type': 'GeoPoint',
	// 								latitude: options.lat,
	// 								longitude: options.lon
	// 							},
	// 							'$maxDistanceInMiles': options.radius
	// 						}
	// 					}
	// 				}
	// 			},
	// 			data: options.format
	// 		}
	// 	},
	// 	function(error, response, body){
	// 		if (error){
	// 			console.log(error);
	// 			console.log(JSON.stringify(response));
	// 			return console.log("Failed SEND NOTIF via Parse at " + new Date().getTime() + ".  User: " + options.id);
	// 		}
	// 	}
	// );
};

/*
	Returns a new notification object and stores the data in the database.
	Params:
		db			The database object
		options
			
		callback	Callback for handling the response.  Returns an error object, and notification object on success or null on fail
*/
Notification.send = function(db, options, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (!ObjectID.isValid(options.user))
		return callback({err:"Invalid user ID"}, {});
	if (!config.isValidNotifType(options.type))
		return callback({err:"Invalid notification type"}, {});
	if (typeof options.title != 'string')
		return callback({err:"Invalid notification title"}, {});
	if (typeof options.body != 'string')
		return callback({err:"Invalid notification body"}, {});	
	
	var coll = db.get(config.COLLECTION_NOTIFICATIONS);

	coll.insert(
		{
			user: new ObjectID(options.user),
			type: options.type,
			title: options.title,
			body: options.body,
			meta: options.meta,
			seen: false,
			time_created: new Date().getTime(),
			active: true		
		},
		function(err, data){
			callback(err, err ? {} : new Notification(data._id, data.user, data.type, data.title, data.body, data.meta, data.seen, data.time_created));
		}
	);
};

Notification.sendParse = function(options, user){
	if(!user.parse_id) return;
	
	var request = require('request');
	
	var body = {
		where: {
			owner: {
				"__type":"Pointer",
				"className":"_User",
				"objectId": user.parse_id
			},
		},
		data: options.format
	};
	
	var reqOptions = {
		url: 'https://api.parse.com/1/push',
		headers: {
			'X-Parse-Application-Id': config.PARSE_APP_ID,
			'X-Parse-REST-API-Key': config.PARSE_API_KEY,
			'Content-Type': 'application/json'
		},
		method: 'post',
		body: JSON.stringify(body),
	};
	
	request(reqOptions, function(err, res, body){
		if (err || res.statusCode != 200){
			console.log(err);
			console.log(JSON.stringify(res));
			return console.log("Failed SEND NOTIF via Parse at " + new Date().getTime() + ".  User: " + user.id);
		}
	});
}

//Requires format variable in options
Notification.sendNear = function(db, options){
	if (!db)
		return console.log('NOTIF-SENDNEAR: Could not connect to database');
	
	var async = require('async'),
		coll_users = db.get(config.COLLECTION_USERS);
	console.log('#####BEGIN');
	coll_users.find(
		{
			'last_loc.geo': {
				$geoWithin: {
					$centerSphere: [options.geo.coordinates, config.convertMilesToRadians(options.radius + config.MAX_ASSIGNMENT_RADIUS)]
				}
			}
		},
		function(err, docs){
			if (err)
				return console.log('NOTIF-SENDNEAR: Error retriecing users', err);
			
			async.filter(
				docs,
				function(user, filterCB){console.log('#####', user.settings.radius + options.radius, user.settings.radius + options.radius >= config.geodesicDistanceMiles(user.last_loc.geo, options.geo));
					filterCB(user.settings.radius + options.radius >= config.geodesicDistanceMiles(user.last_loc.geo, options.geo));
				},
				function(docs){console.log('#####', docs);
					docs.forEach(function(user){
						Notification.send(db, {
							user: user._id.toString(),
							type: options.type,
							title: options.title,
							body: options.body,
							meta: options.meta
						}, function(err){
							if(err) console.log(err);
						});
			
						Notification.sendParse(options, user);
					});
				}
			);
		}
	);
};

/*
	Returns an array of notifications for the given user, sorted by newest first
	Params:
		db			The database object
		_id			The ID of the post to be queried for
		callback	Callback for handling the response.  Returns null if not found, or the post as an object if found
*/
Notification.getByUser = function(db, options, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, []);
	if (!ObjectID.isValid(options.user))
		return callback({err:"Invalid user ID"}, []);
		
	options.offset = options.offset || 0;
	options.limit = options.limit || 10;
		
	if (options.seen && typeof options.seen != 'boolean')
		return callback({err: 'Invalid "seen" flag'}, []);
	if (typeof options.limit != 'number')
		return callback({err: 'Invalid limit'}, []);
	if (typeof options.offset != 'number')
		return callback({err: 'Invalid offset'}, []);
	
	var coll = db.get(config.COLLECTION_NOTIFICATIONS),
		params = {
			active: true,
			user: new ObjectID(options.user)
		};
		
	if (options.seen != null)
		params.seen = options.seen;
	
	coll.find(
		params,
		{
			sort: {
				time_created: -1
			},
			skip: options.offset,
			limit: options.limit
		},
		function(err, docs){
			if (err)
				return callback(err, []);
				
			var notifs = [];
			
			for (var index in docs)
				notifs.push(new Notification(docs[index]._id, docs[index].user, docs[index].type, docs[index].title, docs[index].body, docs[index].meta, docs[index].seen, docs[index].time_created));

			callback(null, notifs);
		}
	);	
};

/*
	Deletes the post object with the given ID
	Params:
		db			The database object
		_id			The ID of the post to be deleted
		callback	Callback for handling the response.  Returns true if successful, else false
*/
Notification.remove = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err:"Invalid notification ID"}, false);
		
	var coll = db.get(config.COLLECTION_NOTIFICATIONS);

	coll.update(
		{
			active: true,
			_id : new ObjectID(_id)
		},
		{
			active: false
		},
		function(err, count, status){
			if (err)
				return callback(err, false);
			if (count == 0)
				return callback({err: 'Notification not found'}, false);
			
			callback(null, true);
		}
	);	
};

/*
	Deletes the post object with the given ID
	Params:
		db			The database object
		_id			The ID of the post to be deleted
		callback	Callback for handling the response.  Returns true if successful, else false
*/
Notification.see = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err:"Invalid notification ID"}, false);
		
	var coll = db.get(config.COLLECTION_NOTIFICATIONS);

	coll.update(
		{
			active: true,
			_id : new ObjectID(_id)
		},
		{
			$set: {
				seen: true
			}
		},
		function(err, count, status){
			if (err)
				return callback(err, false);
			if (count == 0)
				return callback({err: 'Notification not found'}, false);
				
			callback(null, true);
		}
	);	
};

//Export the Notification class
module.exports = Notification;