var config = require('./config'),
	mongodb = require('mongodb'),
	ObjectID = require('mongodb').ObjectID;

/*
	DATABASE STRUCTURE-----------

	_id				Unique object ID
	title			Article Title
	link			Article link
	outlet			Outlet creating for article
	uses 			Tracked uses of this article
	time_created	Millisecond timestamp of the time the article was created
	active			If this is an active object (false = deleted)
*/

/*
	Constructor
*/
function Article(_id, title, link, outlet, uses, time_created){
	this._id = _id;
	this.title = title;
	this.link = link;
	this.outlet = outlet;
	this.uses = uses;
	this.time_created = time_created;
};

/*
	Returns a new article object and stores the article data in the database.
	Params:
		db			The database object
		options
			title 	New article title
			link 	New article URL
			outlet	New article's outlet (optional)

		callback	Callback for handling the response.  Returns an error object, and article object on success or null on fail
*/
Article.add = function(db, options, callback){
	if (!db)
		return callback({err:"ERR_DATABASE"}, {});
	if (!config.isValidUrl(options.link))
		return callback({err:"ERR_INVALID_LINK"}, {});
	if (options.outlet && !ObjectID.isValid(options.outlet))
		return callback({err:"ERR_INVALID_OUTLET"}, {});
	if (options.title && !config.isValidArticleTitle(options.title))
		return callback({err:"ERR_INVALID_TITLE"}, {});
		
	var coll = db.get(config.COLLECTION_ARTICLES);

	coll.find(
		{
			active: true,
			link : options.link,
			outlet: options.outlet || null
		},
		function(err, doc){
			var finish = function(coll, doc, callback){
				if (doc.length == 0){
					coll.insert(
						{
							title: options.title,
							link: options.link,
							outlet: options.outlet || null,
							uses: [],
							active: true,
							time_created: new Date().getTime()
						},
						function(err, article){
							return callback(err, err ? {} : new Article(article._id, article.title, article.link, article.outlet, article.uses, article.time_created));
						}
					);
				}else{
					return callback(err, err ? {} : new Article(doc[0]._id, doc[0].title, doc[0].link, doc[0].outlet, doc[0].uses, doc[0].time_created));
				}	
			};
			
			if (options.outlet){
				var Outlet = require('./outlet');
				Outlet.get(db, options.outlet, function(err, outlet){
					if (err)
						return callback({err: 'ERR_NOT_FOUND'}, {});
						
					finish(coll, doc, callback);
				});
			}else{
				finish(coll, doc, callback);
			}
		}
	);
};

/*
	Returns a article object containing the article's data based on the given ID.
	Params:
		db			The database object
		_id			The ID of the article to be queried for
		callback	Callback for handling the response.  Returns null if not found, or the article as an object if found
*/
Article.get = function(db, _id, callback){
	if (!db)
		return callback({err:"ERR_DATABASE"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err:"ERR_ARTICLE_ID"}, {});

	db.get(config.COLLECTION_ARTICLES).find(
		{
			active: true,
			_id : new ObjectID(_id)
		},
		function(err, doc){
			if (err)
				return callback(err, {});
			if (doc.length == 0)
				return callback({ err : "ERR_NOT_FOUND" }, {});
			if (doc.length > 1)
				return callback({ err : "ERR_MULTIPLE_MATCHES" }, {});

			callback(err, !doc ? {} : new Article(doc[0]._id, doc[0].title, doc[0].link, doc[0].outlet, doc[0].uses, doc[0].time_created));
		}
	);	
};

/*
	Deletes the given article from the database
	Params:
		db			The database object
		_id			The ID of the article to be deleted
		callback	Callback for handling the response.  Returns err and true or false if successful/unsuccessful
*/
Article.remove = function(db, _id, callback){
	if (!db)
		return callback({err:"ERR_DATABASE"}, false);
	if (!ObjectID.isValid(_id))
		return callback({err:"ERR_INVALID_ARTICLE"}, false);

	var coll = db.get(config.COLLECTION_ARTICLES);
	
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
			if (count != 1)
				return callback({err: 'ERR_NOT_FOUND'}, false);
				
			var coll_sto = db.get(config.COLLECTION_STORIES);
			coll_sto.update(
				{
					active: true,
					articles: {
						$in: [
							_id
						]
					}
				},
				{
					$set: {
						$pull: {
							articles: _id
						}
					}
				},
				function(err, count, status){
					if (err)
						return callback(err, false);
						
					var coll_gal = db.get(config.COLLECTION_GALLERIES);
					coll_gal.update(
						{
							active: true,
							articles: {
								$in: [
									_id
								]
							}
						},
						{
							$set: {
								$pull: {
									articles: _id
								}
							}
						},
						function(err, count, status){
							callback(err, !err);
						}
					);
				}
			);
		}
	);
};

/*
	Updates the database with the new article info.
	Params:
		db			The database object
		_id			The ID of the article to update
		updates		The updates to be applied.  Any non-null field is considered an update
		callback	Callback for handling the response.  Returns true is successful, false if not
*/
Article.update = function(db, _id, updates, callback){
	if (!db)
		return callback({err:"ERR_DATABASE"}, {});
	if (!ObjectID.isValid(_id))
		return callback({err: 'ERR_INVALID_ARTICLE'}, {});
	if (updates == {})
		return callback({err:"ERR_NO_UPDATES"}, {});
	if (updates.title && !config.isValidArticleTitle(updates.title))
		return callback({err: 'ERR_INVALID_TITLE'}, {});
	if (updates.link && !config.isValidUrl(updates.link))
		return callback({err: 'ERR_INVALID_LINK'}, {});
	if (updates.outlet && !ObjectID.isValid(updates.outlet))
		return callback({err: 'ERR_INVALID_OUTLET'}, {});

	var coll = db.get(config.COLLECTION_ARTICLES);

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
			function(err, doc){
				if (!err && !doc)
					callback({err: 'ERR_NOT_FOUND'}, {});
				
				callback(err, err ? {} : new Article(doc._id, doc.title, doc.link, doc.outlet, doc.uses, doc.time_created));
			}
		);
	};
	
	if (updates.outlet){
		var Outlet = require('./outlet');
		Outlet.get(db, updates.outlet, function(err, outlet){
			if (err)
				return callback({err: 'ERR_NOT_FOUND'}, {});
				
			finish(coll, _id, updates, callback);
		});
	}else{
		finish(coll, _id, updates, callback);
	}
};

Article.unpack = function(db, article, callback){
	if (!article || !article.outlet)
		return callback(null, article);
	
	var Outlet = require('./outlet');
	
	Outlet.get(db, article.outlet, function(err, outlet){
		if (err){
			//If the creator outlet is no longer active, switch the outlet to null
			if (err.err == 'ERR_NOT_FOUND'){
				article.owner = null;
				return callback(null, article);
			}
			
			return callback(err, {});
		}
		
		Outlet.unpack(db, outlet, function(err, outlet){
			article.outlet = outlet;
			callback(null, article);
		});
	});
};

//Export the Article class
module.exports = Article;