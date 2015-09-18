var config = require('./config'),
	mongodb = require('mongodb'),
	ObjectID = require('mongodb').ObjectID;
/*
	DATABASE STRUCTURE-----------

	_id				Unique object ID
	owner			Owner of the gallery
	caption			Caption of gallery
	tags			Tags applied to this gallery
	articles		List of external articles relevant to this gallery
	posts			List of posts contained within this gallery
	time_created	Timestamp of the time the gallery was created
	edits			Timestamps of the time the gallery was edited and who edited them
	visibility		The degree of vivsibility of the gallery
	active			Whether or not the gallery is active or deleted (true or false)
*/

/*
	Constructor
*/
function Gallery(_id, owner, caption, tags, articles, posts, time_created, edits, visibility){
	this._id = _id;
	this.owner = owner;
	this.caption = caption;
	this.tags = tags;
	this.articles = articles;
	this.posts = posts;
	this.time_created = time_created;
	this.edits = edits;
	this.visibility = visibility;
};

/*
	Returns a new gallery object and stores the gallery data in the database.
	Params:
		db			The database object
		options
			title		The new gallery's title
			caption		The new gallery's caption
			tags		The new gallery's array of tags
			posts		The new gallery's array of post ID's
			articles	The new gallery's array of articles
		callback	Callback for handling the response.  Returns an error object, and user object on success or null on fail
*/
Gallery.add = function(db, options, callback){
	if (!db)
		return callback({err:"ERR_DATABASE"}, {});
	if (!ObjectID.isValid(options.owner))
		return callback({err:"ERR_INVALID_USER"}, {});
	if (!Array.isArray(options.posts))
		return callback({err: 'ERR_INVALID_POSTS'}, {});
	if (options.caption && !config.isValidCaption(options.caption))
		return callback({err: 'ERR_INVALID_CAPTION'}, {});
	if (options.tags && !Array.isArray(options.tags))
		return callback({err: 'ERR_INVALID_TAGS'}, {});
	if (options.articles && !Array.isArray(options.articles))
		return callback({err: 'ERR_INVALID_ARTICLES'}, {});

	db.get(config.COLLECTION_GALLERIES).insert(
		{
			owner : options.owner,
			caption : options.caption || "",
			tags : options.tags || [],
			articles : options.articles || [],
			posts : options.posts,
			time_created : new Date().getTime(),
			edits : [],
			visibility: options.highlight ? config.VISIBILITY_HIGHLIGHT : config.VISIBILITY_PENDING,
			active: true
		},
		function(err, data){
			callback(err, err ? {} : new Gallery(data._id, data.owner, data.caption, data.tags, data.articles, data.posts, data.time_created, data.edits, data.visibility));
		}
	);
};

/*
	Returns a gallery object containing the gallery's data based on the given ID.
	Params:
		db			The database object
		_id			The ID of the gallery to be queried for
		callback	Callback for handling the response.  Returns null if not found, or the gallery as an object if found
*/
Gallery.get = function(db, _id, callback){
	if (!db)
		return callback({err:"ERR_DATABASE"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err:"ERR_INVALID_GALLERY"}, {});

	db.get(config.COLLECTION_GALLERIES).find(
		{
			active: true,
			_id : new ObjectID(_id)
		},
		function(err, doc){
			if (err)
				return callback(err, {});
			if (doc.length > 1)
				return callback({ err : "ERR_MULTIPLE_RESULTS" }, {});
			if (doc.length == 0)
				return callback({ err : "ERR_NOT_FOUND" }, {});

			callback(err, err ? {} : new Gallery(doc[0]._id, doc[0].owner, doc[0].caption, doc[0].tags, doc[0].articles, doc[0].posts, doc[0].time_created, doc[0].edits, doc[0].visibility));
		}
	);	
};

/*
	Sets the gallery's active flag to false, deleting it
	Params:
		db			The database object
		_id			The ID of the gallery to delete
		callback	Callback for handling the response.  Returns the error, and true success/false if fail
*/
Gallery.remove = function(db, _id, callback){
	if (!db)
		return callback({err:"ERR_DATABASE"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err:"ERR_INVALID_GALLERY"}, false);
		
	var coll = db.get(config.COLLECTION_GALLERIES),
		coll_sto = db.get(config.COLLECTION_STORIES);

	coll.update(
		{
			active: true,
			_id : new ObjectID(_id)
		},
		{
			$set: {
				active: false
			}
		},
		function(err, count, status){
			if (err)
				return callback(err, false);
			if (count > 1)
				return callback({ err : "ERR_MULTIPLE_RESULTS" }, false);
			if (count == 0)
				return callback({ err : "ERR_NOT_FOUND" }, false);
			
			coll_sto.update(
				{
					active: true,
					galleries: {
						$in: [
							_id
						]
					}
				},
				{
					$pull: {
						galleries: _id
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
	Returns an array of galleries based on the given query
	Params:
		db			The database object
		query		The MongoDB query
		options
			skip	The offset of the search
			limit	The length of the search
		callback	Callback for handling the response.  Returns null if not found, or the galleries as objects if found
*/
Gallery.query = function(db, query, options, callback){
	if (!db)
		return callback({err:"ERR_DATABASE"}, []);

	options.skip = options.skip || 0;
	options.limit = options.limit || 10;

	if (typeof options.skip != 'number' || options.skip < 0)
		options.skip = 0;
	if (typeof options.limit != 'number' || options.limit < 1)
		options.limit = 10;

	db.get(config.COLLECTION_GALLERIES).find(
		query,
		options,
		function(err, doc){
			if (err)
				return callback(err, []);

			var galleries = [];

			for (var gallery in doc)
				galleries.push(new Gallery(doc[gallery]._id, doc[gallery].owner, doc[gallery].caption, doc[gallery].tags, doc[gallery].articles, doc[gallery].posts, doc[gallery].time_created, doc[gallery].edits, doc[gallery].visibility));

			callback(err, galleries);
		}
	);
};

/*
	Updates the database with the new gallery info.
	Params:
		db			The database object
		_id			The ID of the gallery to update
		user		The ID of the user editing the gallery
		updates		The updates to be applied.  Any non-null field is considered an update, excluding ID
		callback	Callback for handling the response.  Returns true is successful, false if not
*/
Gallery.update = function(db, _id, user, updates, callback){
	if (!db)
		return callback({err:"ERR_DATABASE"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err: 'ERR_INVALID_GALLERY'}, {});
	if (!ObjectID.isValid(user))
		return callback({err: 'ERR_INVALID_USER'}, {});
	if (updates.caption && !config.isValidCaption(updates.caption))
		return callback({err: 'ERR_INVALID_CAPTION'}, {});
	if (updates.tags && !Array.isArray(updates.tags))
		return callback({err: 'ERR_INVALID_TAGS'}, {});
	if (updates.articles && !Array.isArray(updates.articles))
		return callback({err: 'ERR_INVALID_ARTICLES'}, {});
	if (updates.posts && (!Array.isArray(updates.posts) || updates.posts.length == 0))
		return callback({err: 'ERR_INVALID_POSTS'}, {});

	//Update the document
	db.get(config.COLLECTION_GALLERIES).findAndModify(
		{
			query: {
				active: true,
				_id: new ObjectID(_id)
			},
			updates: {
				$set : updates,
				$push : {
					edits: {
						editor: user,
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
		function(err, gallery){
			if (!err && !gallery)
				return callback({err: 'ERR_NOT_FOUND'}, {});
				
			callback(err, err ? {} : gallery._id, gallery.owner, gallery.caption, gallery.tags, gallery.articles, gallery.posts, gallery.time_created, gallery.edits, gallery.visibility);
		}
	);
};

/*
	Takes the given shallow gallery object, and dereference its fields, and the fields' fields
	Params:
		db			The database object
		gallery		The shallow gallery object
		callback	The function to be called upon completion or error
*/
Gallery.unpack = function(db, gallery, callback){
	var async = require('async'),
	User = require('./user'),
	Article = require('./article'),
	Post = require('./post');
	
	async.parallel([
		//Extract gallery's articles
		function(cb1){
			var gallery_articles = [];
			
			async.eachSeries(gallery.articles,
				function(article, cb2){
					Article.get(db, article, function(err, article_obj){
						if (err){
							console.log(err);
							return cb2();
						}
						
						Article.unpack(db, article_obj, function(err, article_unpacked){
							if (err){
								console.log(err);
								return cb2();
							}
							
							gallery_articles.push(article_unpacked);
							cb2();
						});
					});
				},
				function(err){
					if (err)
						return cb1(err);
						
					gallery.articles = gallery_articles;
					cb1();
				}
			);
		},
		//Extract gallery's owner
		function(cb1){
			User.get(db, gallery.owner, function(err, owner){
				if (err){
					if (err.err != "ERR_NOT_FOUND") {
						console.log(err);
					}
					gallery.owner = null;
					return cb1();
				}
					
				gallery.owner = owner;
				cb1();
			});
		},
		//Extract gallery's posts
		function(cb1){
			var gallery_posts = [];
			
			async.eachSeries(gallery.posts,
				function(post, cb2){
					Post.get(db, post, function(err, post_obj){
						if (err) {
							console.log(err);
							return cb2();
						}
												
						Post.unpack(db, post_obj, function(err, post_unpacked){
							if (err) {
								console.log(err);
								return cb2();
							}
							
							gallery_posts.push(post_unpacked);
							cb2();
						});
					});
				},
				function(err){
					if (err)
						return cb1(err);
					
					gallery.posts = gallery_posts;
					cb1();
				});
		}],
		function(err){
			callback(err, gallery);
		}
	);
};

//Export the Gallery class
module.exports = Gallery;