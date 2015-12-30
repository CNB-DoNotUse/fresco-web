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
	
//---------------------------vvv-ARTICLE-ENDPOINTS-vvv---------------------------//
router.get('/article/search', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;

  api.get('/v1/article/search?q=' + req.query.q, function(err, response, body){
    res.json(body).end();
  });
});
//---------------------------^^^-ARTICLE-ENDPOINTS-^^^---------------------------//

module.exports = router;