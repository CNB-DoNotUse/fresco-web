var express = require('express'),
    request = require('request'),
    config = require('../../lib/config'),
    async = require('async'),
    fs = require('fs'),
    API = require('../../lib/api'),
    router = express.Router();

//---------------------------vvv-GALLERY-ENDPOINTS-vvv---------------------------//
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
      params.time_captured = new Date(Date.parse(tweet.created_at)).getTime()
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
