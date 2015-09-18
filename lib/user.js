var config = require('./config'),
	mongodb = require('mongodb'),
	bcrypt = require('bcryptjs'),
	ObjectID = require('mongodb').ObjectID;

/*
	DATABASE STRUCTURE-----------

	_id			Unique object ID
	email		User's email account
	verified	User's email verification status
	username	User's unique, self-defined username
	password	User's SALTED password
	avatar		User's avatar URL
	firstname	User's first name
	lastname	User's last name
	outlet		User's affiliated outlet
	twitter		User's twitter account
	last_loc	User's last recorded location (GeoJSON or null), and the timestamp of that location update
	rank		User's permission level
	following	
		users	Users which this user is following
		outlets	Outlets which this user is following
	settings	Users app, web and account settings
	active		Whether or not the user is active or deleted (true/false)
	parse_id	User's Parse ID
*/

/*
	Constructor
*/
function User(_id, email, verified, username, avatar, firstname, lastname, outlet, twitter, last_loc, rank, following, settings, parse_id){
	this._id = _id;
	this.email = email;
	this.verified = verified;
	this.username = username;
	this.avatar = avatar;
	this.firstname = firstname;
	this.lastname = lastname;
	this.outlet = outlet;
	this.twitter = twitter;
	this.last_loc = last_loc;
	this.rank = rank;
	this.following = following;
	this.settings = settings;
	this.parse_id = parse_id;
};

/*
	Returns a new user object and stores the user data in the database.
	Params:
		db			The database object
		options
			email		The new user's email
			username	The new user's username
			firstname	The new user's first name
			password	The user's access password
			lastname	The new user's last name
			twitter		The new user's twitter handle
			outlet		The new user's outlet ID
		callback	Callback for handling the response.  Returns an error object, and user object on success or null on fail
*/
User.add = function(db, options, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (options.email && !config.isValidEmail(options.email))
		return callback({err:"Please enter a valid email"}, {});
	if (options.firstname && !config.isValidName(options.firstname))
		return callback({err:"Please enter a valid first name"}, {});
	if (options.lastname && !config.isValidName(options.lastname))
		return callback({err:"Please enter a valid last name"}, {});
	if (options.last_loc && (!config.isValidUserLocation(options.last_loc)))
		return callback({err:"Please enter a valid location"}, {});
	if (options.outlet && !ObjectID.isValid(options.outlet))
		return callback({err:"Please enter a valid outlet"}, {});
	if (options.password && !config.isValidPassword(options.password)){
		return callback({err:"Please enter a valid password"}, {});
	}else if (options.password){
		var hash = bcrypt.hashSync(options.password, 8);
		options.password = hash;
	}
	if(options.parse_id && typeof options.parse_id != 'string')
		return callback({err:"Please enter a valid Parse ID"}, {});
	
	var coll = db.get(config.COLLECTION_USERS),
		insertUser = function(){
			options.verified = false;
			options.rank = config.RANKS.BASIC;
			options.following = {
				users: [],
				outlets: []
			};
			options.active = true;
			options.settings = config.DEFAULT_SETTINGS;
			options.time_created = new Date().getTime();
			
			coll.insert(options, function(err, data){
				callback(err, err ? {} : new User(''+data._id, data.email, data.verified, data.username, data.avatar, data.firstname, data.lastname, data.outlet, data.twitter, data.last_loc, data.rank, data.following, data.settings, data.parse_id));
			});
		},
		checkOutlet = function(){
			var Outlet = require('./outlet');
			Outlet.get(db, options.outlet, function(err, outlet){
				if (err)
					return callback(err, {});
					
				insertUser();
			});
		};

	if (options.email){
		coll.find(
			{
				email: options.email
			},
			function(err, docs){
				if (err)
					return callback(err, null);
				if (docs.length > 0)
					return callback({err: 'EMAIL_IN_USE'}, {});
					
				if (options.outlet){
					checkOutlet();
				}else{
					insertUser();
				}
			}
		);
	}else{
		if (options.outlet){
			checkOutlet(db, options, callback);
		}else{
			insertUser(options, callback);
		}
	}
};

/*
	Returns a user object containing the user's data based on the given ID.
	Params:
		db			The database object
		_id			The ID of the user to be queried for
		callback	Callback for handling the response.  Returns null if not found, or the user as an object if found
*/
User.get = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (_id == null)
		return callback({err:"Please provide a valid account"}, {});

	db.get(config.COLLECTION_USERS).find(
		{
			active: true,
			_id : new ObjectID(_id)
		},
		{
			password : 0
		},
		function(err, doc){
			if (err)
				return callback(err, {});
			else if (doc.length == 0)
				return callback({err: "User not found"}, {});
			else if (doc.length > 1)
				return callback({ err: "ID matches multiple users" }, {});

			callback(err, err ? {} : new User(doc[0]._id, doc[0].email, doc[0].verified, doc[0].username, doc[0].avatar, doc[0].firstname, doc[0].lastname, doc[0].outlet, doc[0].twitter, doc[0].last_loc, doc[0].rank, doc[0].following, doc[0].settings, doc[0].parse_id));
		}
	);	
};

User.findByEmail = function(db, email, callback){
	if(!db)
		return callback({err:"ERR_DB"}, {});
		
	db.get(config.COLLECTION_USERS).find(
		{
			active: true,
			email: email
		},
		function(err, doc){
			if (err)
				return callback(err, {});
			else if (doc.length == 0)
				return callback({err: "ERR_NOT_FOUND"}, {});
			else if (doc.length > 1)
				return callback({ err: "ERR_MULTIPLE_USERS" }, {});

			callback(err, err ? {} : doc[0]);
		}
	);
};

User.getAdmins = function(db, callback){
	if(!db)
		return callback({err:"ERR_DB"}, {});
		
	db.get(config.COLLECTION_USERS).find(
		{
			rank: config.RANKS.ADMIN,
			active: true
		},
		function(err, docs){
			if (err)
				return callback(err, []);
			
			var users = [];
			
			for (var index in docs)
				users.push(new User(docs[index]._id, docs[index].email, docs[index].verified, docs[index].username, docs[index].avatar, docs[index].firstname, docs[index].lastname, docs[index].outlet, docs[index].twitter, docs[index].last_loc, docs[index].rank, docs[index].following, docs[index].settings, docs[index].parse_id));
			
			callback(err, err ? [] : users);
		}
	);
};

/*
	Deletes the given user from the database
	Params:
		db			The database object
		_id			The ID of the user to be deleted
		callback	Callback for handling the response.  Returns null if successful, or an error if not
*/
User.remove = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err:"Invalid user ID"}, false);

	var coll = db.get(config.COLLECTION_USERS),
		coll_out = db.get(config.COLLECTION_OUTLETS);
		
	coll.update(
		{
			active: true,
			_id: new ObjectID(_id)
		},
		{
			$set: {
				active: false
			}
		},
		function(err, count, status){
			if (err)
				return callback(err, false);
			if (count == 0)
				return callback({err: 'User not found'}, false);
				
			coll_out.update(
				{
					users: {
						$in: [
							_id
						]
					}
				},
				{
					$pull: {
						users: _id
					}
				},
				function(err, count, status){
					callback(err, !err);
				}
			);
		}
	);
};

/*
	Updates the database with the new user info.
	Params:
		db			The database object
		_id			The ID of the user to update
		updates		The updates to be applied.  Any non-null field is considered an update, excluding ID
		callback	Callback for handling the response.  Returns true is successful, false if not
*/
User.update = function(db, _id, updates, callback){
	if (!db)
		return callback({err: "Error connecting to database"}, {});
	if (updates == {})
		return callback({err:"No updates provided"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err: "Invalid user ID"}, {});
	if (updates.last_loc && !config.isValidUserLocation(updates.last_loc))
		return callback({err: "Invalid location"}, {});
	if (updates.username && !config.isValidUsername(updates.username))
		return callback({err: "Invalid username"}, {});
	if (updates.firstname && !config.isValidName(updates.firstname))
		return callback({err: "Invalid first name"}, {});
	if (updates.lastname && !config.isValidName(updates.lastname))
		return callback({err: "Invalid last name"}, {});
	if (updates.email && !config.isValidEmail(updates.email))
		return callback({err: "Invalid email"}, {});
	if (updates.password && !config.isValidPassword(updates.password))
		return callback({err: "Invalid password"}, {});
	if (updates.twitter && !config.isValidTwitter(updates.twitter))
		return callback({err: "Invalid Twitter handle"}, {});
	if (updates.rank && !config.isValidRank(updates.rank))
		return callback({err: "Invalid rank"}, {});
	if (updates.parse_id && typeof updates.parse_id != 'string')
		return callback({err: "Invalid Parse ID"}, {});
		
	var coll = db.get(config.COLLECTION_USERS),
		insertUser = function(){
			coll.findAndModify(
				{
					query: { 
						_id: new ObjectID(_id)
					},
					update: {
						$set : updates
					},
					options: {
						new: true,
						upsert: false
					}
				},
				{
					new: true,
					upsert: false
				},
				function(err, doc){
					if (!err && !doc)
						return callback({err: 'User not found'}, {});
					
					callback(err, err ? {} : new User(doc._id, doc.email, doc.verified, doc.username, doc.avatar, doc.firstname, doc.lastname, doc.outlet, doc.twitter, doc.last_loc, doc.rank, doc.following, doc.settings, doc.parse_id));
				}
			);
		},
		checkOutlet = function(){
			var Outlet = require('./outlet');
			Outlet.get(db, updates.outlet, function(err, outlet){
				if (err)
					return callback(err, {});
					
				insertUser();
			});
		};
	
	if (updates.outlet){
		checkOutlet();
	}else{
		insertUser();
	}
};

/*
	Verifies the user's email address
	Params:
		db			The database object
		id			The ID of the user to verify
		callback	Callback for handling the response
*/
User.verify = function(db, id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (!ObjectID.isValid(id))
		return callback({err: 'Invalid user ID'}, {});

	db.get(config.COLLECTION_USERS).findAndModify( 
		{
			query: { 
				active: true,
				_id: new ObjectID(id)
			}, 
			updates: {
				$set : 	{
							verified : true
						}
			},
			options: {
				new: true,
				upsert: false
			}
		},
		function(err, doc){
			if (!err && !doc)
				return callback({err: 'User not found'}, {});
				
			callback(err, err ? {} : new User(doc._id, doc.email, doc.verified, doc.username, doc.avatar, doc.firstname, doc.lastname, doc.outlet, doc.twitter, doc.last_loc, doc.rank, doc.following, doc.settings, doc.parse_id));
		});
};

/*
	Toggles a user's following of another user
	Params:
		db 			The database object
		self_id 	The ID of the user who is following another user
		other_id	The ID of the user being followed
		callback 	The callback to be run after the operation is finished.
			Params:
				err 		Any error that has occurred, or null is none
				bool		Signals if the user is now following the other user (true), or has unfollowed them (false)
*/
User.toggleFollow = function(db, self_id, other_id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, false);
	if (!self_id || !other_id)
		return callback({err:"Invalid user account"}, false);

	db.get(config.COLLECTION_USERS).find(
		{_id : new ObjectID(other_id)},
		{},
		function(err, docs){
			if (err)
				return callback(err, false);
			else if (docs.length != 1)
				return callback({err:"Followed user not found"}, false);

			var other_user = docs[0];

			db.get(config.COLLECTION_USERS).find(
				{_id : new ObjectID(self_id)},
				{},
				function(err, docs){
					if (err)
						return callback(err, false);
					else if (docs.length != 1)
						return callback({err : "User's account not found"}, false);

					var user = docs[0],
						updates = { following : user.following },
						index = user.following.indexOf(other_user._id);

					if (index > 0)
						updates.following.splice(index, 1);
					else
						updates.following.push(other_user._id);

					db.get(config.COLLECTION_USERS).update(
						{ _id : user._id },
						{ $set : { following : updates } },
						function(err, docs){
							if (err)
								return callback(err, false);

							callback(null, index > 0);
						}
					);
				}
			);
		}
	);
};

User.findInRadius = function(db, options, callback){
	if(!db)
		return callback({err:"Error connecting to database"}, null);
	db.get(config.COLLECTION_USERS).find(
		{
			'last_loc.timestamp': {
				$gt: new Date().getTime() - (1000 * 60 * 60 * 24) //1day
			},
			'last_loc.geo': {
				$geoWithin: {
					$centerSphere: [[options.lon, options.lat], config.convertMilesToRadians(options.radius)]
				}
			}
		},
		function(err, users){
			if(err)
				return callback(err, null);
			return callback(null, users.map(function(user) {
				return user.last_loc.geo;
			}));
		}
	);
}

User.unpack = function(db, user, callback){
	var Outlet = require('./outlet'),
		async = require('async');
	
	async.parallel(
		[
			//Get user's outlet
			function(cb1){
				if (!user.outlet)
					return cb1();
				
				Outlet.get(db, user.outlet, function(err, outlet){
					user.outlet = outlet;
					return cb1();
				});
			},
			//Get user's followed outlets
			function(cb1){
				if (!user.following.outlets)
					return cb1();
				
				var outlets = [];
				
				async.eachSeries(
					user.following.outlets,
					function(outlet, cb2){
						Outlet.get(db, outlet, function(err, outlet){
							if (err) return cb2(err);
							outlets.push(outlet);
							cb2();
						});
					},
					function(err){
						user.following.outlets = outlets;
						cb1(err);
					}
				);
			},
			//Get user's followed users
			function(cb1){
				if (!user.following.users)
					return cb1();
				
				var followed_users = [];
				
				async.eachSeries(
					user.following.users,
					function(user_id, cb2){
						User.get(db, user_id, function(err, followed){
							if (err) return cb2(err);
							followed_users.push(followed);
							cb2();
						});
					},
					function(err){
						user.following.users = followed_users;
						cb1(err);
					}
				);
			}
		],
		function(err){
			callback(err, user);
		}
	);
};

//Export the User class
module.exports = User;