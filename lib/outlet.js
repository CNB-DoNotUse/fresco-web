var config = require('./config'),
	mongodb = require('mongodb'),
	ObjectID = require('mongodb').ObjectID;

/*
	DATABASE STRUCTURE-----------

	_id				Unique object ID
	owner			The account who created this outlet
	card			The info regarding the user's active card
	stripe
		customer	The Stripe customer token for this user, used for transactions
		card		The Stripe card object to be used for payments
	users			The members of this outlet
	invitations		Invitation object (token, user)
	galleries
	avatar			A CDN link to the profile picture of this outlet
	link			A link to the outlet's website
	title			Outlet's title
	transactions	Array of the outlet's transactions
	time_created	Millisecond timestamp for when the outlet was created
	active			Whether or not the article is active (not deleted)
*/

function Outlet(_id, owner, card, users, galleries, avatar, link, title, time_created){
	this._id = _id;
	this.owner = owner;
	this.card = card;
	this.users = users;
	this.galleries = galleries;
	this.avatar = avatar;
	this.link = link;
	this.title = title;
	this.time_created = time_created;
}

/*
	Returns a new outlet object and stores the outlet data in the database.
	Params:
		db			The database object
		options
			owner	New outlet's owner
			avatar	New outlet's avatar
			link 	New outlet URL (optional)
			title 	New outlet title
		callback	Callback for handling the response.  Returns an error object, and outlet object on success or null on fail
*/
Outlet.add = function(db, options, callback){
	if (!db)
		return callback({err:"ERR_DB"}, {});
	if (!ObjectID.isValid(options.owner))
		return callback({err:"ERR_INVALID_OWNER"}, {});
	if (!config.isValidOutletTitle(options.title))
		return callback({err:"ERR_INVALID_TITLE"}, {});
		
	var coll = db.get(config.COLLECTION_OUTLETS),
		User = require('./user');

	coll.find(
		{
			title: options.title
		},
		function(err, docs){
			if (err)
				return callback(err, {});
			if (docs.length > 0)
				return callback({err: 'ERR_NAME_TAKEN'}, {});
				
			User.get(db, options.owner, function(err, user){
				if (err)
					return callback(err, {});
				if (user.outlet != null)
					return callback({err: 'ERR_ALREADY_OWNER'}, {});
					
				coll.insert(
					{
						owner: options.owner,
						card: options.card_info,
						stripe: {
							customer: options.stripe_customer || null,
							card: options.stripe_card || null
						},
						title: options.title,
						link: options.link,
						avatar: options.avatar,
						users: [],
						galleries: [],
						invitations: [],
						transactions: [],
						time_created: new Date().getTime(),
						active: true
					},
					function(err, outlet){
						if (err)
							return callback(err, {});
						
						User.update(db, options.owner, { outlet: outlet._id.toString() }, function(err, newuser){
							return callback(err, err ? {} : new Outlet(outlet._id, outlet.owner, outlet.card, outlet.users, outlet.galleries, outlet.avatar, outlet.link, outlet.title, outlet.time_created));
						});
					}
				);
			});
		}
	);
};

/*
	Returns a outlet object containing the outlet's data based on the given ID.
	Params:
		db			The database object
		_id			The ID of the outlet to be queried for
		callback	Callback for handling the response.  Returns null if not found, or the outlet as an object if found
*/
Outlet.get = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err:"Invalid outlet ID"}, {});
		
	db.get(config.COLLECTION_OUTLETS).find(
		{
			active: true,
			_id : new ObjectID(_id)
		},
		function(err, docs){
			if (err)
				return callback(err, {});
			if (docs.length == 0)
				return callback({ err : "Outlet not found" }, {});
			if (docs.length > 1)
				return callback({ err : "ID matches multiple outlets" }, {});

			callback(null, new Outlet(docs[0]._id, docs[0].owner, docs[0].card, docs[0].users, docs[0].galleries, docs[0].avatar, docs[0].link, docs[0].title, docs[0].time_created));
		});	
};

/*
	Returns a outlet object containing the outlet's data based on the given ID.
	Params:
		db			The database object
		_id			The ID of the outlet to be queried for
		callback	Callback for handling the response.  Returns null if not found, or the outlet as an object if found
*/
Outlet.getStripe = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err:"Invalid outlet ID"}, {});
		
	db.get(config.COLLECTION_OUTLETS).find(
		{
			active: true,
			_id : new ObjectID(_id)
		},
		{
			stripe: 1
		},
		function(err, docs){
			if (err)
				return callback(err, {});
			if (docs.length == 0)
				return callback({ err : "Outlet not found" }, {});
			if (docs.length > 1)
				return callback({ err : "ID matches multiple outlets" }, {});

			callback(null, docs[0].stripe);
		}
	);	
};

/*
	Adds a user to the outlet's list of members.  This user will be able to perform administrative actions on the outlet
	Params:
		db			The database object
		outlet		The outlet's ID
		user		The user's ID
		callback	Callback for handling the response.  Returns the updates outlet, or the error encountered
*/
Outlet.addUser = function(db, outlet, user, callback){
	if (!db)
		return callback({err: 'ERR_DATABASE'}, {});
	if (!ObjectID.isValid(outlet))
		return callback({err: 'ERR_INVALID_OUTLET_ID'}, {});
	if (!ObjectID.isValid(user))
		return callback({err: 'ERR_INVALID_USER_ID'}, {});
	
	var User = require('./user'),
		coll = db.get(config.COLLECTION_OUTLETS);
		
	Outlet.get(db, outlet, function(err, outlet_obj){
		if (err)
			return callback(err, {});
		if (outlet_obj.users.indexOf(user) != -1)
			return callback({err: 'ERR_USER_IS_MEMBER'}, {});
			
		User.get(db, user, function(err, user_obj){
			if (err)
				return callback(err, {});
				
			coll.findAndModify(
				{
					query: {
						_id: new ObjectID(outlet)
					},
					update: {
						$push: {
							users: user
						}
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
				function(err, outlet_new){
					if (err)
						return callback(err, {});
							
					User.update(db, user, {outlet: outlet}, function(err, user){
						if (err)
							return callback(err, {});
							
						callback(err, err ? {} : new Outlet(outlet_new._id, outlet_new.owner, outlet_new.card, outlet_new.users, outlet_new.galleries, outlet_new.avatar, outlet_new.link, outlet_new.title, outlet_new.time_created));
					});
				}
			);
		});
	});
};

/*
	Removes a user from the outlet's list of members.
	Params:
		db			The database object
		outlet		The outlet's ID
		user		The user's ID
		callback	Callback for handling the response.  Returns the updates outlet, or the error encountered
*/
Outlet.removeUser = function(db, outlet, user, callback){
	if (!db)
		return callback({err: 'Could not connect to database'}, {});
	if (!ObjectID.isValid(outlet))
		return callback({err: 'ERR_INVALID_OUTLET_ID'}, {});
	if (!ObjectID.isValid(user))
		return callback({err: 'ERR_INVALID_USER_ID'}, {});
	
	var User = require('./user'),
		coll = db.get(config.COLLECTION_OUTLETS);
		
	Outlet.get(db, outlet, function(err, outlet_obj){
		if (err)
			return callback(err, {});
		if (outlet_obj.users.indexOf(user) == -1)
			return callback({err: 'ERR_USER_NOT_MEMBER'}, {});
			
		User.get(db, user, function(err, user_obj){
			if (err)
				return callback(err, {});
			
			coll.findAndModify(
				{
					query: {
						_id: new ObjectID(outlet)
					},
					update: {
						$pull: {
							users: user
						}
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
				function(err, outlet){
					if (err)
						return callback(err, {});
					User.update(db, user, {outlet: null}, function(err, user){
						if (err)
							return callback(err, {});
							
						callback(err, err ? {} : new Outlet(outlet._id, outlet.owner, outlet.card, outlet.users, outlet.galleries, outlet.avatar, outlet.link, outlet.title, outlet.time_created));
					});
				}
			);
		});
	});
};

Outlet.getPosts = function(db, _id, options, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, []);
	if (!ObjectID.isValid(_id))
		return callback({err: 'Invalid outlet ID'}, []);
		
	var Gallery = require('./gallery');
		
	db.get(config.COLLECTION_OUTLETS).find(
		{
			active: true,
			_id: new ObjectID(_id)
		},
		{
			galleries: 1
		},
		function(err, outlet){
			if (err)
				return callback(err, []);
			if (outlet.length == 0)
				return callback({err: 'ERR_NOT_FOUND'}, []);
			if (outlet.length > 1)
				return callback({err: 'ERR_MULTIPLE_MATCHES'}, []);
			
			outlet = outlet[0];
			
			if (outlet.galleries.length == 0)
				return callback(null, []);
			
			var posts = [],
				index = options.offset;
			
			function compile(){
				if (index == outlet.galleries.length)
					return callback(err, posts);
				
				db.get(config.COLLECTION_GALLERIES).find(
					{
						_id: new ObjectID(outlet.galleries[index])
					},
					function(err, gal){
						if (err)
							return callback(err, []);
						if (gal.length == 0){
							++index;
							return compile();
						}
						
						gal = gal[0];
							
						Gallery.unpack(
							db,
							gal,
							function(err, gallery){
								if (err)
									return callback(err, []);
									
								gallery.posts.reverse();
								
								while (options.limit > 0 && gallery.posts.length > 0){
									posts.push(gallery.posts.pop());
									--options.limit;
								}
								
								if (options.limit == 0)
									return callback(null, posts);
								else{
									++index;
									compile();
								}
							}
						);
					}
				);
				++index;
			};
			
			compile();
		}
	);
};

/*
	Updates the database with the new outlet info.
	Params:
		db			The database object
		_id			The ID of the outlet to update
		updates		The updates to be applied.  Any non-null field is considered an update
		callback	Callback for handling the response.  Returns true is successful, false if not
*/
Outlet.update = function(db, _id, updates, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err: 'Invalid outlet ID'}, {});
	if (updates == {})
		return callback({err:"No updates provided"}, {});
	if (updates.owner && !ObjectID.isValid(updates.owner))
		return callback({err: 'Invalid outlet owner'}, {});
	if (updates.title && !config.isValidOutletTitle(updates.title))
		return callback({err: 'Invalid outlet title'}, {});
	if (updates.users && !Array.isArray(updates.users))
		return callback({err: 'Invalid list of members'}, {});

	var coll = db.get(config.COLLECTION_OUTLETS);

	var finish = function(coll, _id, updates, callback){
		coll.findAndModify(
			{
				query: { 
					active: true,
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
			function(err, outlet){
				if (!err && !outlet)
					callback({err: 'Outlet not found'}, {});
				
				callback(err, err ? {} : new Outlet(outlet._id, outlet.owner, outlet.card, outlet.users, outlet.galleries, outlet.avatar, outlet.link, outlet.title, outlet.time_created));
			}
		);
	};
	
	if (updates.owner){
		var User = require('./user');
		User.get(db, updates.owner, function(err, outlet){
			if (err)
				return callback({err: 'New owner account does not exist'}, {});
				
			finish(coll, _id, updates, callback);
		});
	}else{
		finish(coll, _id, updates, callback);
	}
};

/*
	Deletes the given outlet from the database
	Params:
		db			The database object
		_id			The ID of the outlet to be deleted
		callback	Callback for handling the response.  Returns err and true or false if successful/unsuccessful
*/
Outlet.remove = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err:"Invalid outlet ID"}, {});

	var coll = db.get(config.COLLECTION_OUTLETS);
	
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
				return callback(err, {});
			if (count != 1)
				return callback({err: 'Outlet not found'}, {});
			
			callback(err, !err);
		}
	);
};

Outlet.unpack = function(db, outlet, callback){
	var User = require('./user'),
		async = require('async');
	
	async.parallel(
		[
			//Get owner
			function(cb1){
				User.get(db, outlet.owner, function(err, user){
					if (err){
						if (err.err == 'User not found'){
							outlet.owner = null;
							return cb1();
						}else
							return cb1(err);
					}
					
					outlet.owner = user;
					cb1();
				});
			},
			//Get members
			function(cb1){
				var users = [];
				
				async.eachSeries(
					outlet.users,
					function(user_id, cb2){
						User.get(db, user_id, function(err, user){
							if (err)
								return cb2(err);
								
							users.push(user);
							cb2();
						});
					},
					function(err){
						if (err)
							return cb1(err);
							
						outlet.users = users;
						cb1();
					}
				);
			}
		],
		function(err){
			callback(err, err ? null : outlet);
		}
	);
};

Outlet.generateInvitation = function(db, outlet_id, email, callback){
	require('crypto').randomBytes(48, function(ex, buf) {
		var token = buf.toString('hex');
		
		Outlet.get(db, outlet_id, function(err, outlet){
			if (err)
				return callback(err, '');
				
			db.get(config.COLLECTION_OUTLETS).update(
				{
					_id: new ObjectID(outlet_id)
				},
				{
					$push: {
						invitations: {
							email: email,
							token: token
						}
					}
				},
				function(err, result){
					return callback(err, err ? '' : token);
				}
			);
		});
	});
};

Outlet.getInvitation = function(db, token, callback){
	db.get(config.COLLECTION_OUTLETS).find(
		{
			'invitations.token': token
		},
		function(err, results){
			if (err)
				return callback(err, {});
			if (results.length == 0)
				return callback({err: 'ERR_NOT_FOUND', data: {}});
			
			for (var index in results[0].invitations){
				if (results[0].invitations[index].token == token){
					results[0].invitations[index].outlet_title = results[0].title;
					return callback(null, results[0].invitations[index]);
				}
			}
			
			return callback({err: 'ERR_NOT_FOUND', data: {}});
		}
	);
};

Outlet.resolveInvitation = function(db, token, callback){
	db.get(config.COLLECTION_OUTLETS).find(
		{
			'invitations.token': token
		},
		function(err, outlet){
			if (err)
				return callback(err, {});
			if (outlet.length == 0)
				return callback({err: 'ERR_NOT_FOUND', data: {}});
			console.log('RESOLVE: ', outlet);
			outlet = outlet[0];
			return callback(null, new Outlet(''+outlet._id, outlet.owner, outlet.card, outlet.users, outlet.galleries, outlet.avatar, outlet.link, outlet.title, outlet.time_created));
		}
	);
};

Outlet.revokeInvitation = function(db, email, token, callback){
	db.get(config.COLLECTION_OUTLETS).update(
		{
			invitations: {
				$in: [
					{
						email: email,
						token: token
					}
				]
			}
		},
		{
			$pull: {
				invitations: {
					email: email,
					token: token
				}
			}
		},
		function(err, result){
			if (err)
				return callback(err, false);
			if (result == 0)
				return callback({err: 'ERR_NOT_FOUND'}, false);
			
			return callback(null, true);
		}
	);
};

module.exports = Outlet;