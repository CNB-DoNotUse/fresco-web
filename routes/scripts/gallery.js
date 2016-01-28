var express = require('express'),
    requestJson = require('request-json'),
    request = require('request'),
    config = require('../../lib/config'),
    async = require('async'),
    Request = require('request'),
    querystring = require('querystring'),
    fs = require('fs'),
    xlsx = require('node-xlsx'),
    User = require('../../lib/user'),
    
    router = express.Router();
	
//---------------------------vvv-GALLERY-ENDPOINTS-vvv---------------------------//
router.post('/gallery/addpost', function(req, res, next){
  var params = {
    gallery: req.body.gallery
  };
  
  var cleanupFiles = [];

  function upload(cb) {
    request.post({ url: config.API_URL + '/v1/gallery/addpost', headers: { authtoken: req.session.user.token }, formData: params }, (err, response, body) => {

      if(err || !body || body.err) {
        return cb('Error uploading files');
      }

      for (var index in cleanupFiles) {
        fs.unlink(cleanupFiles[index], function(){});
      }

      body = JSON.parse(body);

      cb(err || body.err, body.data);
    });
  }
  
  var i = 0;
  for (var index in req.files){
    cleanupFiles.push(req.files[index].path);
    params[i] = fs.createReadStream(req.files[index].path);
    ++i;
  }

  upload(function(err, gallery){
    res.json({err: err, data: gallery}).end();
  });
});
router.post('/gallery/bulkupdate', function(req, res, next) {
  var galleries = req.body.galleries;
  var caption = req.body.caption;
  var tags = req.body.tags || [];
  var tags_to_remove = req.body.tags_removed || [];
  var stories = [];
  var stories_to_remove = req.body.stories_removed || [];
  
  for(var s in req.body.stories) {
    var story = req.body.stories[s];

    if (story.indexOf('NEW') != -1) {
      new_stories.push(story);
    } else {
      stories.push(story);
    }

  }
  
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.headers['Content-Type'] = 'application/json';
  
  async.series([
    makeStories,
    updateGalleries
  ],
  function() {
    res.json({}).end();
  });
  
  function makeStories(cb) {
    async.each(new_stories, function(new_story, cb2) {
      var title = JSON.parse(new_story.split('NEW=')[1]).title;
      var story_params = {
        title: title,
        caption: ''
      }
      
      api.post('/v1/story/create', story_params, function(err, response, body) {
        if (err || body.err) {
          console.log(err || body.err);
          return cb();
        }
        
        stories.push(body.data._id);
        cb();
      });
    }, function(err) {
      cb();
    })
  }
  
  function updateGalleries(cb) {
    async.each(galleries, function(gallery_id, cb2) {
      api.get('/v1/gallery/get?id=' + gallery_id, function(err, response, body) {
        if (err || body.err) {
          console.log("Error: " + err || body.err);
          return cb2(); //Ignore errors, continue processing other galleries
        }
        var gallery = body.data;
        
        var gallery_story_ids = [];
        gallery.related_stories.forEach(function(story) {
          gallery_story_ids.push(story._id);
        });
        
        var params = {
          id: gallery_id,
          caption: caption,
          tags: removeAddArray(gallery.tags, tags, tags_to_remove),
          stories: removeAddArray(gallery_story_ids, stories, stories_to_remove),
        }
        
        api.post("/v1/gallery/update", params, function (err, response, body){
          cb2();
        });
        
      });
    }, function(err) {
      cb();
    });
  }
  
  function removeAddArray(items, toAdd, toRemove) {
    toRemove.forEach(function(item) {
      var pos = items.indexOf(item);
      if (pos !== -1) {
        items.splice(pos, 1);
      }
    });
    
    return unionArrays(items, toAdd);
  }
  
  function unionArrays(array1, array2) {
    array2.forEach(function(item) {
      if (array1.indexOf(item) == -1) {
        array1.push(item);
      }
    });
    
    return array1;
  }
});
router.post('/gallery/create', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;

  console.log(req.body);
  
  api.post("/v1/gallery/create/", req.body, function (err, response, body){

      console.log(body);

      res.json(body).end();
  });
});
router.post('/gallery/import', function(req, res, next){
  var request = require('request'),
      params = {
        caption: req.body.caption,
        visibility: req.body.visibility || 0,
        imported: '1',
        posts: {}
      },
      cleanupFiles = [];

  function upload(cb){
    params.posts = JSON.stringify(params.posts);
    request.post({ url: config.API_URL + '/v1/gallery/assemble', headers: { authtoken: req.session.user.token }, formData: params }, function(err, response, body){
      for (var index in cleanupFiles)
        fs.unlink(cleanupFiles[index], function(){});
      
      try{
        body = JSON.parse(body);
      }catch(e){
        return cb('INVALID_JSON');
      }

      cb(err || body.err, body.data);
    });
  }

  if (req.body.tweet){
    var Twitter = require('twitter'),
        tClient = new Twitter({
          consumer_key: config.TWITTER.CONSUMER_KEY,
          consumer_secret: config.TWITTER.CONSUMER_SECRET,
          access_token_key: config.TWITTER.ACCESS_TOKEN_KEY,
          access_token_secret: config.TWITTER.ACCESS_TOKEN_SECRET
        }),
        twitterId = req.body.tweet.split('/').pop();

    tClient.get('/statuses/show/' + twitterId + '.json', function(error, tweet, response){
      if (error)
        return res.json({err: 'ERR_TWITTER', data: {}}).end();

      var async = require('async'),
          http = require('http'),
          media = tweet.extended_entities ? tweet.extended_entities.media : [],
          handle = '@' + tweet.user.screen_name;

      params.source = 'Twitter';
      params.caption = tweet.text;
      params.time_captured = new Date(Date.parse(tweet.created_at)).getTime();

      /**
       * Dev API has a new twitter structure.
      */
      params.twitter_id = tweet.id_str;
      params.twitter_user_id = tweet.user.id_str;
      params.twitter_url = req.body.tweet;
      params.twitter_handle = handle;
      params.twitter_name = tweet.user.name;

      // DEPRECATED
      params.twitter = JSON.stringify({
        id: tweet.id_str,
        url: req.body.tweet,
        handle: handle,
        user_name: tweet.user.name
      });

      if (tweet.coordinates){
        params.lon = tweet.coordinates.coordinates[0];
        params.lat = tweet.coordinates.coordinates[1];
      }
      
      if (media.length == 0)
        return res.json({err: 'ERR_NO_MEDIA'}).end();

      var i = 0;
      async.eachSeries(
        media,
        function(m,cb){
          var tempName = './uploads/' + Date.now()
          if(m.media_url.indexOf('.png') != -1)
            tempName += '.png';
          else
            tempName += '.jpeg';
          
          var file = fs.createWriteStream(tempName);
          cleanupFiles.push(tempName);
          params.posts[i] = {
            external_url: req.body.tweet
          };

          http.get(m.media_url, function(response){
            response.pipe(file);
            file.on('finish', function(){
              file.close(function(){
                params[i] = fs.createReadStream(tempName);
                ++i;
                cb();
              });
            });
          });
        },
        function(err){
          if (err)
            return res.json({err: err, data: {}}).end();

          upload(function(err, gallery){
             res.json({err: err, data: gallery}).end();
          });
        }
      );
    });
  }else{
    var i = 0;
    for (var index in req.files){
      cleanupFiles.push(req.files[index].path);
      params[i] = fs.createReadStream(req.files[index].path);
      params.posts[i] = {};
      ++i;
    }

    upload(function(err, gallery){
      res.json({err: err, data: gallery}).end();
    });
  }
});
router.get('/gallery/imports', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.get("/v1/gallery/imports?rated=0",
    req.query,
    function (err, response, body){
      res.json(body).end();
    });
});
router.get('/gallery/list', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  // api.headers['authtoken'] = req.session.user.token;

  var params = Object.keys(req.query).map(function(key){
    return encodeURIComponent(key) + '=' + encodeURIComponent(req.query[key]);
  }).join('&');

  api.get('/v1/gallery/list?' + params, function(err, response, body){
    res.json(body).end();
  });
});
router.get('/gallery/resolve', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;

  var params = req.query.galleries.map(function(gallery) {
    return 'galleries[]=' + gallery;
  }).join('&');

  api.get('/v1/gallery/resolve?' + params, function(err, response, body){
    res.json(body).end();
  });
});
router.post('/gallery/remove', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post("/v1/gallery/remove",
    { id: req.body.id },
    function (err, response, body){
      res.json(body).end();
    });
});
router.get('/gallery/search', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  var params = Object.keys(req.query).map(function(key){
    return encodeURIComponent(key) + '=' + encodeURIComponent(req.query[key]);
  }).join('&');
  
  api.get('/v1/gallery/search?' + params, function(err, response, body){
    res.json(body).end();
  });
});
router.post('/gallery/skip', function(req, res, next){
  req.body.visibility = config.VISIBILITY.PENDING;
  req.body.rated = '1';
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.headers['Content-Type'] = 'application/json';
  api.post("/v1/gallery/update",
    req.body,
    function (err, response, body){
      res.json(body).end();
    });
});
router.post('/gallery/update', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.headers['Content-Type'] = 'application/json';
  api.post("/v1/gallery/update",
    req.body,
    function (err, response, body){
      if(err)
        console.log(err);

      res.json(body).end();
    });
});
router.post('/gallery/verify', function(req, res, next){
  req.body.visibility = config.VISIBILITY.VERIFIED;
  req.body.rated = '1';
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.headers['Content-Type'] = 'application/json';
  api.post("/v1/gallery/update",
    req.body,
    function (err, response, body){
      res.json(body).end();
    });
});
//---------------------------^^^-GALLERY-ENDPOINTS-^^^---------------------------//

module.exports = router;