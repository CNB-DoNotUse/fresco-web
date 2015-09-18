var config = require('./config'),
	ObjectID = require('mongodb').ObjectID;
/*
	DATABASE STRUCTURE-----------

	_id				Unique object ID
	curator			The ID of the curator who compiled this story
	title			Title of story
	caption			Caption of story
	tags			Tags applied to this story
	galleries		List of galleries relevant to this story
	articles		List of external articles relevant to this story
	time_edited		MS timestamp of when story was edited
	time_created	MS timestamp of when story was created
	active			Whether or not the story is active or deleted (true/false)
*/

/*
	Constructor
*/
function Story(_id, curator, title, caption, tags, galleries, articles, time_edited, time_created){
	this._id = _id;
	this.curator = curator;
	this.title = title;
	this.caption = caption;
	this.tags = tags;
	this.galleries = galleries;
	this.articles = articles;
	this.time_edited = time_edited;
	this.time_created = time_created;
};

/*
	Returns a new story object and stores the story data in the database.
	Params:
		db			The database object
		options
			curator		ID of the curator who created this story
			title		The new story's title
			caption		The new story's caption
			tags		The new story's array of tags
			galleries	The new story's array of gallery ID's
			articles	The new story's array of articles
		callback	Callback for handling the response.  Returns an error object, and story object on success or null on fail
*/
Story.add = function(db, options, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (!ObjectID.isValid(options.curator))
		return callback({err:"Invalid curator"}, {});
	if (!config.isValidTitle(options.title))
		return callback({err:"Invalid story title"}, {});
	if (!config.isValidCaption(options.caption))
		return callback({err:"Invalid story caption"}, {});
	if (!Array.isArray(options.galleries))
		return callback({err:"Invalid story galleries"}, {});
	if (options.tags && !Array.isArray(options.tags))
		return callback({err:"Invalid story tags"}, {});
	if (options.articles && !Array.isArray(options.articles))
		return callback({err:"Invalid story articles"}, {});

	db.get(config.COLLECTION_STORIES).insert(
		{
			curator: options.curator,
			title : options.title,
			caption : options.caption,
			tags : options.tags || [],
			galleries : options.galleries,
			articles : options.articles || [],
			time_edited : null,
			time_created : new Date().getTime(),
			active: true
		},
		function(err, data){
			callback(err, err ? {} : new Story(data._id, data.curator, data.title, data.caption, data.tags, data.galleries, data.articles, data.time_edited, data.time_created));
		}
	);
};

/*
	Returns a story object containing the story's data based on the given ID.
	Params:
		db			The database object
		_id			The ID of the story to be queried for
		callback	Callback for handling the response.  Returns null if not found, or the story as an object if found
*/
Story.get = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err:"Invalid story ID"}, {});

	db.get(config.COLLECTION_STORIES).find(
		{
			active: true,
			_id : new ObjectID(_id)
		},
		function(err, doc){
			if (err)
				return callback(err, {});
			else if (doc.length > 1)
				return callback({ err : "ID matches multiple stories" }, {});
			else if (doc.length == 0)
				return callback({ err : "No stories found!" }, {});

			callback(null, new Story(doc[0]._id, doc[0].curator, doc[0].title, doc[0].caption, doc[0].tags, doc[0].galleries, doc[0].articles, doc[0].time_edited, doc[0].time_created));
		}
	);	
};

/*
	Sets the story's active flag to false, removing it.
	Params:
		db			The database object
		_id			The ID of the story to be queried for
		callback	Callback for handling the response.  Returns null if not found, or the story as an object if found
*/
Story.remove = function(db, _id, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err:"Invalid story ID"}, false);

	db.get(config.COLLECTION_STORIES).update(
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
			else if (count > 1)
				return callback({ err : "ID matches multiple stories" }, false);
			else if (count == 0)
				return callback({ err : "No stories found!" }, false);
			
			callback(null, true);
		}
	);	
};

/*
	NOTE this function will be using a search engine with search scores, so changes WILL be made
	Returns an array of stories based on the given parameters
	Params:
		db			The database object
		options
			title		The title search query
			caption		The caption search query
			tags		The tags to search for
			offset		The offset of the search
			length		The maximum number of results to return
		callback	Callback for handling the response.  Returns null if not found, or the story as an object if found
*/
Story.list = function(db, options, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, []);

	options.offset = options.offset || 0;
	options.limit = options.limit || 10;

	if (typeof options.offset != 'number' || options.offset < 0)
		return callback({err:"Invalid offset"}, []);
	if (typeof options.limit != 'number' || options.limit < 0)
		return callback({err:"Invalid limit"}, []);

	var params = { };
	if (options.title != null && options.title != '') params.title = { regex : options.title };
	if (options.caption != null && options.caption != '') params.caption = { regex : options.caption };
	if (options.tags != null && options.tags.length > 0) params.tags = { $in : options.tags };

	db.get(config.COLLECTION_STORIES).find(
		params,
		{
			sort : { time_created : -1 },
			skip : options.offset,
			limit : options.limit
		},
		function(err, doc){
			if (err)
				return callback(err, []);

			var stories = [];
			
			for (var index in doc)
				stories.push(new Story(doc[index]._id, doc[index].curator, doc[index].title, doc[index].caption, doc[index].tags, doc[index].galleries, doc[index].articles, doc[index].time_edited, doc[index].time_created));

			callback(null, stories);
		}
	);
};

/*
	Returns an array of stories based on the given query
	Params:
		db			The database object
		query		The MongoDB query
		options
			skip	The offset of the search
			limit	The length of the search
		callback	Callback for handling the response.  Returns null if not found, or the stories as objects if found
*/
Story.query = function(db, query, options, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, []);

	options.skip = options.skip || 0;
	options.limit = options.limit || 10;

	if (typeof options.skip != 'number' || options.skip < 0)
		options.skip = 0;
	if (typeof options.limit != 'number' || options.limit < 1)
		options.limit = 10;

	db.get(config.COLLECTION_STORIES).find(
		query,
		options,
		function(err, doc){
			if (err)
				return callback(err, []);

			var stories = [];

			for (var index in doc)
				stories.push(new Story(doc[index]._id, doc[index].curator, doc[index].title, doc[index].caption, doc[index].tags, doc[index].galleries, doc[index].articles, doc[index].time_edited, doc[index].time_created));

			callback(null, stories);
		}
	);
};

/*
	Returns an array of stories based on the given query
	Params:
		callback	Callback for handling the response.  Returns null if not found, or the stories as objects if found
*/
Story.getThumbnailPosts = function(db, ids, max, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, []);
		
	var async = require('async'),
		Post = require('../lib/post');
		
	for (var i = 0; i < ids.length; ids[i] = new ObjectID(ids[i]), ++i);

	db.get(config.COLLECTION_GALLERIES).find(
		{
			_id: {
				$in: ids
			}
		},
		{
			posts: 1
		},
		function(err, docs){
			if (err)
				return callback(err, null);
			if (docs.length == 0)
				return callback(null, []);
				
			var posts = [];
			
			for (var i = 0; i < docs.length; ++i){
				if (!docs[i].posts) continue;
				
				for (var j = 0; j < docs[i].posts.length; ++j)
					posts.push(new ObjectID(docs[i].posts[j]))
			}
			
			db.get(config.COLLECTION_POSTS).find(
				{
					_id: {
						$in: posts
					},
					video: null
				},
				{},
				function(err, posts){
					if (err)
						return callback(err, []);
						
					var output = [];
					
					if (posts.length > max){
						while (output.length < max && posts.length > 0){
							var index = Math.floor(Math.random() * posts.length);
							output.push(posts[index]);
							posts.splice(index, 1);
						}
					}else{
						output = posts;
					}
					
					async.each(
						posts,
						function(post, cb){
							Post.unpack(db, post, function(err, unpacked_post){
								if (err)
									return cb(err);
								
								post = unpacked_post;
								cb();
							});
						},
						function(err){
							callback(err, posts);
						}
					);
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
Story.update = function(db, _id, uid, updates, callback){
	if (!db)
		return callback({err:"Error connecting to database"}, {});
	if (updates == {})
		return callback({err:"No updates provided"}, {});
	if (updates.title && !config.isValidTitle(updates.title))
		return callback({err:"Invalid story title"}, {});
	if (updates.caption && !config.isValidCaption(updates.caption))
		return callback({err:"Invalid story caption"}, {});
	if (updates.tags && !Array.isArray(updates.tags))
		return callback({err:"Invalid story tags"}, {});
	if (updates.articles && !Array.isArray(updates.articles))
		return callback({err:"Invalid story articles"}, {});
	if (updates.galleries && !Array.isArray(updates.galleries))
		return callback({err:"Invalid story galleries"}, {});
	if (updates.galleries && updates.galleries.size == 0)
		return callback({err: 'Story cannot have no galleries'}, {});
		
	updates.time_edited = new Date().getTime();

	//Update the document
	db.get(config.COLLECTION_STORIES).findAndModify(
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
		function(err, story){
			callback(err, err ? {} : story);
		}
	);
};

/*
	Takes the given shallow story object, and dereference its fields, and the fields' fields
	Params:
		db			The database object
		gallery		The shallow story object
		callback	The function to be called upon completion or error
*/
Story.unpack = function(db, story, callback){
	var async = require('async'),
	User = require('./user'),
	Article = require('./article'),
	Gallery = require('./gallery');
	
	async.parallel([
		//Extract story's articles
		function(cb1){
			if (!story.articles)
				return cb1();
				
			var story_articles = [];
			
			async.eachSeries(story.articles,
				function(article, cb2){
					Article.getArticle(db, article, function(err, article_obj){
						if (err)
							return cb2(err);
						
						Article.unpack(db, article_obj, function(err, article_unpacked){
							if (err)
								return cb2(err);
							
							story_articles.push(article_unpacked);
							cb2();
						});
					});
				},
				function(err){
					if (err)
						return cb1(err);
						
					story.articles = story_articles;
					cb1();
				}
			);
		},
		//Extract story's curator
		function(cb1){
			if (!story.curator)
				return cb1();
			
			User.get(db, story.curator, function(err, curator){
				if (err){
					if (err.err == 'User not found'){
						story.curator = null;
						return cb1();
					}else
						return cb1(err);
				}
					
				story.curator = curator;
				cb1();
			});
		}],
		function(err){
			callback(err, story);
		}
	);
};

//Export the Story class
module.exports = Story;