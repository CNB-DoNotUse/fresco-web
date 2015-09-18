var config = require('./config'),
	ObjectID = require('mongodb').ObjectID;
/*
	DATABASE STRUCTURE-----------

	_id				Unique object ID
	owner			ID of user who created this post
	byline			Byline for the story (i.e. @miket via Fresco)
	source			URL linking to the source of the post (null for Fresco sources)
	image			The image of the post, either the content itself or a thumbnail of the video
	video			The video url, if exists
	meta			Metadata regarding the original media, like width, height, video length, etc.
	license			The license under which the media is shared (Twitter, Fresco, None)
	location		geo: 	JSON object containing the coordinates as well as a canonical name of the location
					address: JSON object for location names (i.e. street, city, country, etc)
	time_created	UNIX timestamp in seconds of when the post was created
	visibility		Visibility of the content (private, public, highlight, etc)
	uses			Records of how/when this post was used
	active			Whether the post is active (not deleted) or not
*/

/*
	Constructor
*/
function Post(_id, owner, byline, source, image, video, meta, license, location, time_created, edits, visibility, uses){
	this._id = _id;
	this.owner = owner;
	this.byline = byline;
	this.source = source;
	this.image = image;
	this.video = video;
	this.meta = meta;
	this.license = license;
	this.location = location;
	this.time_created = time_created;
	this.edits = edits;
	this.visibility = visibility;
	this.uses = uses;
};

/*
	Returns a new post object and stores the post data in the database.
	Params:
		db			The database object
		options
			owner		The owner of the post
			byline 		The byline of the post
			source 		The source URL of the post (twitter, facebook, etc) (optional)
			type 		The type of media
			image		Image of post
			video		Video of post (optional)
			meta 		Any meta data regarding the data (optional)
			license 	The license under which the content was shared
			geo 		The GeoJSON point where this post was created/taken
			address 	The GeoJSON point where this post was created/taken
			visibility	The visibility of this post (optional)
		callback	Callback for handling the response.  Returns an error object, and user object on success or null on fail
*/
Post.add = function(db, options, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (!ObjectID.isValid(options.owner))
		return callback({err:"Invalid owner ID"}, {});
	if (options.byline == null)
		return callback({err:"Missing byline"}, {});
	if (!config.isGeoJSON(options.geo))
		return callback({err:"Invalid media location"}, {});
		
	var coll = db.get(config.COLLECTION_POSTS);

	coll.insert(
		{
			owner : options.owner,
			byline : options.byline,
			image : options.image,
			video : options.video,
			meta : options.meta || [],
			license : options.license,
			location : {
				geo: options.geo,
				address: options.address
			},
			time_created : new Date().getTime(),
			edits : [],
			visiblilty : options.visibility || config.VISIBILITY_PENDING,
			uses : [],
			active: true
		},
		function(err, data){
			callback(err, err ? {} : new Post(data._id, data.owner, data.byline, data.source, data.image, data.video, data.meta, data.license, data.location, data.time_created, data.edits, data.visibility, data.uses));
		}
	);
};

/*
	Returns a post object containing the post's data based on the given ID.
	Params:
		db			The database object
		_id			The ID of the post to be queried for
		callback	Callback for handling the response.  Returns null if not found, or the post as an object if found
*/
Post.get = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err:"Invalid post ID"}, {});
		
	var coll = db.get(config.COLLECTION_POSTS);

	coll.find(
		{
			active: true,
			_id : new ObjectID(_id)
		},
		function(err, doc){
			if (err)
				return callback(err, {});
			else if (doc.length > 1)
				return callback({ err : "ID matches multiple posts" }, {});
			else if (doc.length == 0)
				return callback({ err : "Post does not exist" }, {});

			callback(err, doc == null ? {} : new Post(doc[0]._id, doc[0].owner, doc[0].byline, doc[0].source, doc[0].image, doc[0].video, doc[0].meta, doc[0].license, doc[0].location, doc[0].time_created, doc[0].edits, doc[0].visibility, doc[0].uses));
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
Post.remove = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err:"Invalid post ID"}, false);
		
	var coll = db.get(config.COLLECTION_POSTS),
		coll_gal = db.get(config.COLLECTION_GALLERIES);

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
				return callback({err: 'Post not found'}, false);
			
			coll_gal.update(
				{
					active: true,
					posts: {
						$in: [
							_id
						]
					}
				},
				{
					$set: {
						$pull: {
							posts: _id
						}
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
	Updates the database with the new story info.
	Params:
		db			The database object
		_id			The ID of the story to update
		updates		The updates to be applied.  Any non-null field is considered an update, excluding ID
		callback	Callback for handling the response.  Returns true is successful, false if not
*/
Post.update = function(db, _id, uid, updates, callback){
	if (!db)
		return callback({err:"ERR_DATABASE"}, {});
	if (updates == {})
		return callback({err:"ERR_NO_UPDATES"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err:"ERR_INVALID_POST"}, {});
	if (!ObjectID.isValid(uid))
		return callback({err:"ERR_INVALID_USER"}, {});
	if (updates.location && !config.isGeoJSON(updates.location.geo))
		return callback({err:"ERR_INVALID_LOCATION"}, {});
	if (updates.visibility && (typeof updates.visibility != 'number' || updates.visibility < config.VISIBILITY_DELETED || updates.visibility > config.VISIBILITY_HIGHLIGHT))
		return callback({err:"ERR_INVALID_VISIBILITY"}, {});

	//Update the document
	db.get(config.COLLECTION_POSTS).findAndModify(
		{
			query: {
				active: true,
				_id: new ObjectID(_id)
			},
			update: {
				$set : updates,
				$push: {
					edits: {
						editor: uid,
						time: new Date().getTime(),
						changes: updates
					}
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
		function(err, post){
			callback(err, err ? {} : post);
		}
	);
};

Post.unpack = function(db, post, callback){
	var User = require('./user');
	
	User.get(db, post.owner, function(err, owner){
		if (err){
			if (err.err == 'User not found'){
				post.owner = null;
				return callback(null, post);
			}else
				return callback(err, null);
		}
		post.owner = owner;
		callback(null, post);
	});
};

//Export the Post class
module.exports = Post;