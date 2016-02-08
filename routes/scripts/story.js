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
	
//---------------------------vvv-STORY-ENDPOINTS-vvv---------------------------//
// router.get('/story/list', function(req, res, next){
//   var api = requestJson.createClient(config.API_URL);
//   api.headers['authtoken'] = req.session.user.token;

//   var params = Object.keys(req.query).map(function(key){
//     return encodeURIComponent(key) + '=' + encodeURIComponent(req.query[key]);
//   }).join('&');

//   api.get('/v1/story/list?' + params, function(err, response, body){
//     res.json(body).end();
//   });
// });
router.get('/story/autocomplete', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  var params = Object.keys(req.query).map(function(key){
    return encodeURIComponent(key) + '=' + encodeURIComponent(req.query[key]);
  }).join('&');

  api.get('/v1/story/autocomplete?' + params, function(err, response, body){
    res.json(body).end();
  });
});
router.get('/story/mostrecent', function(req, res, next) {
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  var params = 'id=' + req.query.id;
  
  api.get('/v1/story/get?' + params, function(err, response, body) {
    if (body.err) return res.json(body).end();
    
    var story = body.data;
    var mostRecentGalleryId = story.galleries[story.galleries.length - 1];
    params = 'id=' + mostRecentGalleryId;
    api.get('/v1/gallery/get?' + params, function(err, response, body) {
      if (body.err) return res.json(body).end();
      
      var gallery = body.data;
      var mostRecentPost = gallery.posts[gallery.posts.length - 1];
      return res.json({ data: mostRecentPost }).end();
    });
  });
});
router.get('/story/search', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  var params = Object.keys(req.query).map(function(key){
    return encodeURIComponent(key) + '=' + encodeURIComponent(req.query[key]);
  }).join('&');

  api.get('/v1/story/search?' + params, function(err, response, body){
    res.json(body).end();
  });
});
router.post('/story/update', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post("/v1/story/update",
    req.body,
    function (err, response, body){
      res.json(body).end();
    });
});
//---------------------------^^^-STORY-ENDPOINTS-^^^---------------------------//

module.exports = router;