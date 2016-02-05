var express = require('express'),
    request = require('request'),
    Twitter = require('twitter'),
    config = require('../../lib/config'),
    async = require('async'),
    fs = require('fs'),
    http = require('http'),
    API = require('../../lib/api'),
    Story = require('../../lib/story'),
    Gallery = require('../../lib/gallery'),
    router = express.Router();

//---------------------------vvv-GALLERY-ENDPOINTS-vvv---------------------------//

router.post('/gallery/import', (req, res) => {
  req.body.visibility = req.body.visibility || 0;
  req.body.imported = '1';
  req.body.posts = {};

  req.url = "/gallery/assemble";

  var upload = () => {
    req.body.posts = JSON.stringify(req.body.posts);
    API.proxy(req, res);
  }

  if (!req.body.tweet) {
    for (var index in req.files) {
      req.body.posts[req.files[index].fieldname] = {};
    }
    return upload();
  }
  else { //Twitter import
    var tClient = new Twitter({
      consumer_key: config.TWITTER.CONSUMER_KEY,
      consumer_secret: config.TWITTER.CONSUMER_SECRET,
      access_token_key: config.TWITTER.ACCESS_TOKEN_KEY,
      access_token_secret: config.TWITTER.ACCESS_TOKEN_SECRET
    });
    var twitterId = req.body.tweet.split('/').pop();

    tClient.get('/statuses/show/' + twitterId + '.json', (error, tweet, response) => {
      if (error) {
        return res.json({err: 'ERR_TWITTER', data: {}}).end();
      }

      var media = tweet.extended_entities ? tweet.extended_entities.media : [];
      var handle = '@' + tweet.user.screen_name;

      req.body.source = 'Twitter';
      req.body.caption = tweet.text;
      req.body.time_captured = new Date(Date.parse(tweet.created_at)).getTime();

      /**
       * Dev API has a new twitter structure.
      */
      req.body.twitter_id = tweet.id_str;
      req.body.twitter_user_id = tweet.user.id_str;
      req.body.twitter_url = req.body.tweet;
      req.body.twitter_handle = handle;
      req.body.twitter_name = tweet.user.name;

      // DEPRECATED
      req.body.twitter = JSON.stringify({
        id: tweet.id_str,
        url: req.body.tweet,
        handle: handle,
        user_name: tweet.user.name
      });

      if (tweet.coordinates){
        req.body.lon = tweet.coordinates.coordinates[0];
        req.body.lat = tweet.coordinates.coordinates[1];
      }

      if (media.length == 0)
        return res.json({err: 'ERR_NO_MEDIA'}).end();

      var i = 0;
      var files = {};
      async.eachSeries(
        media,
        function(m,cb){
          var tempName = './uploads/' + Date.now()
          if(m.media_url.indexOf('.png') != -1)
            tempName += '.png';
          else
            tempName += '.jpeg';

          var file = fs.createWriteStream(tempName);
          req.body.posts[i] = {
            external_url: req.body.tweet
          };

          http.get(m.media_url, function(response){
            response.pipe(file);
            file.on('finish', function(){
              file.close(function(){
                files[i] = {fieldname: i, path: tempName};
                ++i;
                cb();
              });
            });
          });
        },
        function(err){
          if (err) {
            return res.json({err: err, data: {}}).end();
          }

          req.files = files;
          upload();
        }
      );
    });
  }
});

 /**
  * Update multiple galleries at once. Only supports captions, tags, and stories
  */
router.post('/gallery/bulkupdate', function(req, res, next) {
  var galleries = req.body.galleries;
  var caption = req.body.caption;
  var tags = req.body.tags || [];
  var tags_to_remove = req.body.tags_removed || [];
  var stories = req.body.stories || [];
  var stories_to_remove = req.body.stories_removed || [];

  var new_stories = stories.filter(function(story) {
    return story.indexOf('NEW') != -1;
  });

  stories = stories.filter(function(story) {
    return story.indexOf('NEW') == -1;
  });

  // We can't let gallery update make the stories, as we'd have a ton of
  // duplicates. So we make all the stories and get their ids first, and then we
  // update the galleries

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

      Story.create(req, story_params, (err, body) => {
        if (err || body.err) {
          console.log(err || body.err);
          return cb(); //Ignore errors
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
      Gallery.get(gallery_id, (err, body) => {
        if (err || body.err) {
          console.log("Error: " + err || body.err);
          return cb2(); //Ignore errors, continue processing other galleries
        }
        var gallery = body;

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

        Gallery.update(req, params, (err, body) => {
          cb2(); //Ignore errors
        });

      });
    }, function(err) {
      cb();
    });
  }

  /**
   * First remove things from the array, then add some other items to it. Used
   * to make sure that if a user removes and then adds a tag back, it doesn't
   * get deleted mistakenly
   *
   * @param  {Array} items    Base items
   * @param  {Array} toAdd    Items to add
   * @param  {Array} toRemove Items to remove
   * @return {Array}          The result after the removal and addition
   */
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

/**
 * Skip verifiying a gallery
 */
router.post('/gallery/skip', (req, res, next) => {
  req.body.visibility = config.VISIBILITY.PENDING;
  req.body.rated = '1';
  req.url = '/gallery/update';
  API.proxy(req, res);
});


module.exports = router;
