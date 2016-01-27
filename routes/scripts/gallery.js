var express = require('express'),
    request = require('request'),
    Twitter = require('twitter'),
    config = require('../../lib/config'),
    async = require('async'),
    fs = require('fs'),
    http = require('http'),
    API = require('../../lib/api'),
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
      req.body.time_captured = new Date(Date.parse(tweet.created_at)).getTime()
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
 * Skip verifiying a gallery
 */
router.post('/gallery/skip', (req, res, next) => {
  req.body.visibility = config.VISIBILITY.PENDING;
  req.body.rated = '1';
  req.url = '/gallery/update';
  API.proxy(req, res);
});

/**
 * Verify a gallery
 */
router.post('/gallery/verify', (req, res, next) => {
  req.body.visibility = config.VISIBILITY.VERIFIED,
  req.body.rated = '1';
  req.url= '/gallery/update';
  API.proxy(req, res);
});
//---------------------------^^^-GALLERY-ENDPOINTS-^^^---------------------------//

module.exports = router;
