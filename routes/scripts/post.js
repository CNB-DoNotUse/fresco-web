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

//---------------------------vvv-POST-ENDPOINTS-vvv---------------------------//
router.get('/post/list', function(req, res, next){
  var api = requestJson.createClient(config.API_URL),
      url = "/v1/post/list?";

  for (var index in req.query)
    url += index + '=' + req.query[index] + '&';

  api.get(url,
    function (err, response, body){
      res.json(body).end();
    });
});
router.get('/post/gallery', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  var query = 'id=' + req.query.id;
  api.headers['authtoken'] = req.session.user.token;
  api.get('/v1/post/gallery?' + query, function(error, response, body){
    if (error)
      return res.json({err: error}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();
    res.json(body).end();
  });
});
//---------------------------^^^-POST-ENDPOINTS-^^^---------------------------//

module.exports = router;