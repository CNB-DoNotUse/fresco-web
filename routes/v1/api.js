var config = require('../../lib/config');
var User = require('../../lib/user');
var Story = require('../../lib/story');
var Gallery = require('../../lib/gallery');
var Article = require('../../lib/article');
var Post = require('../../lib/post');
var async = require('async');
var aws = require('aws-sdk');
var fs = require('fs');
var gm = require('gm');
var request = require('request');
var Parser = require('exif-parser');
var sizeOf = require('image-size');
var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

aws.config.loadFromPath('./.aws/credentials');
var s3 = new aws.S3();

router.get('/', function(req, res, next){
  	res.render('api');
  	res.end();
});

router.get('/elmir', function(req, res, next){
	var db = req.db,
		count = 0;
		
	function killPost(postid){
		db.get(config.COLLECTION_GALLERIES).update(
			{
				
			},
			{
				$pull: {
					posts: postid
				}
			},
			{
				multi: true
			},
			function(err){
				console.log('PULLED ');
			}
		);
	}
	
	db.get(config.COLLECTION_POSTS).find(
		{
			video: null
		},
		{
			_id: 1,
			image: 1
		},
		function(err, posts){
			async.eachSeries(
				posts,
				function(post, cb){
					var filename = post.image.split('/').pop();
					
					try{
						request.get('http://' + post.image).pipe(fs.createWriteStream('./' + filename));
					}catch(e){
						console.log(e);
						//killPost(post._id);
						return cb();
					}
					var exifData = Parser.create(fs.createReadStream(filename)).parse();
					console.log(exifData, exifData.tags.Orientation);
					return cb();
					gm(filename).size(
						function(err, size){
							fs.unlinkSync(filename);
							if (err) return cb(err);
							
							db.get(config.COLLECTION_POSTS).update(
								{
									_id: post._id
								},
								{
									$set: {
										meta: {
											width: size.width,
											height: size.height
										}
									}
								},
								{
									
								},
								function(err, docs){
									fs.unlinkSync(filename);
									if (err) return cb(err);
									
									++count;
									cb();
								}
							);
						}
					);
				},
				function(err){
					return res.json({err: err, count: count}).end();
				}
			);
		}
	);
});

module.exports = router;