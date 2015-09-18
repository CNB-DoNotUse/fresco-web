var config = require('./config'),
	User = require('./user'),
	ObjectID = require('mongodb').ObjectID,
	uuid = require('uuid');

/*
	DATABASE STRUCTURE-----------

	_id			Unique object ID
	user_id		The ID of the user this token is valid for
	token		The actual token that the client sends with each request
	expiresAt		When the token expires
	scope		What token acecess level
*/

/*
	Constructor
*/
function AuthToken(_id, user_id, token, expiresAt, scope){
	this._id = _id;
	this.user_id = user_id;
	this.token = token;
	this.expiresAt = expiresAt;
	this.scope = scope;
}

/*
	Creates a new AuthToken, and stores it in the database. Will remove an existing token assigned
	to the user, if one exists
	Params:
		db			The database object
		user_id		The user to create the token for
		callback	Callback for handling the response.  Returns an error object, and user object on success or null on fail
*/
AuthToken.add = function(db, user_id, callback){
	if(!db)
		return callback({err: "Error connecting to database"}, {});
	if(!ObjectID.isValid(user_id))
		return callback({err: "Invalid user ID"}, {});
	
	User.get(db, user_id, function(err, user){
		if (err) return callback(err, {});
		var token = uuid.v4();
		var expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 30);
		db.get(config.COLLECTION_AUTHTOKENS).insert(
			{
				user_id: user_id,
				token: token,
				expiresAt: expiresAt,
				scope: '*'
			},
			function(err, data){
				callback(err, err ? {} : new AuthToken(data._id, data.user_id, data.token, data.expiresAt, data.scope));
			}
		);
	});
};

/*
	Retrieves info for the given token. If no token with that value exists, returns an error
	Params:
		db			The database object
		token		The value of the token to search for
		callback	Callback for handling the response.  Returns an error object, and user object on success or null on fail
*/
AuthToken.getToken = function(db, token, callback){
	if(!db)
		return callback({err: "Error connecting to database"}, {});
	if(!token)
		return callback({err: "Invalid token"}, {});
	
	db.get(config.COLLECTION_AUTHTOKENS).find(
		{
			token: token
		},
		function(err, doc){
			if (err)
				return callback(err, {});
			if (doc.length > 1)
				return callback({err:"Invalid state. Multiple tokens exist with that id"}, {});
			if (doc.length == 0)
				return callback(null, null);
				
			callback(null, new AuthToken(doc[0]._id, doc[0].user_id, doc[0].token, doc[0].expiresAt, doc[0].scope));
		}
	);
};

/*
	Updates the tokens expiration date, so keep the user logged in while they are using it
	Params:
		db			The database object
		_id			The id of the token to remove
		callback	Callback for handling the response.  Returns an error object, and user object on success or null on fail
*/
AuthToken.keepAlive = function(db, _id, callback){
	if(!db)
		return callback({err: "Error connecting to database"}, {});
	if(!ObjectID.isValid(_id))
		return callback({err: "Invalid token ID"}, {});
	
	var expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 30);
	db.get(config.COLLECTION_AUTHTOKENS).findAndModify(
		{
			query: {
				_id: new ObjectID(_id)
			},
			update: {
				$set: {
					expiresAt: expiresAt
				}
			}
		},
		{
			new: true,
			upsert: false
		},
		function(err, authtoken){
			if(!err && !authtoken)
				return callback({err: 'AuthToken not found'}, {});
			console.log(err);
			callback(err, authtoken);
		}
	);
};

/*
	Removes a given token. This effectively logs the user out
	Params:
		db			The database object
		_id			The id of the token to remove
		callback	Callback for handling the response.  Returns an error object, and user object on success or null on fail
*/
AuthToken.remove = function(db, _id, callback){
	if(!db)
		return callback({err: "Error connecting to database"}, {});
	if(!ObjectID.isValid(_id))
		return callback({err: "Invalid token ID"}, {});
		
	db.get(config.COLLECTION_AUTHTOKENS).remove(
		{
			_id: ObjectID(_id)
		},
		function(err){
			if(err) return callback({err: err});
			return callback(null);
		}
	);
};

/*
	Removes any tokens associated with the user from the db. Effectively logs the user out
	Params:
		db			The database object
		user_id		The user to remvoe tokens for
		callback	Callback for handling the response.  Returns an error object, and user object on success or null on fail
*/
AuthToken.removeUser = function(db, user_id, callback){
	if(!db)
		return callback({err: "Error connecting to database"}, {});
	if(!ObjectID.isValid(user_id))
		return callback({err: "Invalid user ID"}, {});
	
	db.get(config.COLLECTION_AUTHTOKENS).remove(
		{
			user_id: user_id
		},
		function(err){
			if (err) return callback({err: err});
			return callback(null);
		}
	);
};

/*
	Checks to see if the given authtoken allows the given operation
	Params:
		operation		The operation the user is requesting to perform
		authtoken		The user's authtoken
*/
AuthToken.checkScope = function(operation, authtoken){
	if (authtoken.scope.indexOf('no_' + operation) != -1) {
		return false;
	}
	return true;
};

module.exports = AuthToken;