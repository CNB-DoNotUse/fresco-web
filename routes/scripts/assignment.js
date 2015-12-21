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
	
//---------------------------vvv-ASSIGNMENT-ENDPOINTS-vvv---------------------------//
router.post('/assignment/approve', function(req, res, next) {
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/assignment/approve', req.body, function(err,response,body){
    if(err)
      return res.json({err: err}).end();
    if (response.statusCode == 401)
      return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (!body.data)
      return res.json({err: 'ERR_EMPTY_RESPONSE'}).end();

    res.json({err: null}).end();
  });
});
router.post('/assignment/create', function(req, res, next){console.log(req.body);
  if (!req.session.user || !req.session.user.outlet)
  	return res.status(403).json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);
	req.body.outlet = req.session.user.outlet._id;

  api.headers['authtoken'] = req.session.user.token;
	api.post('/v1/assignment/create', req.body, function(error, response, body){
		if (error)
			return res.json({err: error}).end();
		if (!body)
			return res.json({err: 'ERR_EMPTY_BODY'}).end();
		if (body.err)
			return res.json({err: body.err}).end();

		res.json(body).end();
	});
});
router.post('/assignment/deny', function(req, res, next) {
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/assignment/deny', req.body, function(err,response,body){
    if(err)
      return res.json({err: err}).end();
    if (response.statusCode == 401)
      return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (!body.data)
      return res.json({err: 'ERR_EMPTY_RESPONSE'}).end();

    res.json({err: null}).end();
  });
});
router.post('/assignment/expire', function(req, res, next) {
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/assignment/expire', req.body, function(err,response,body){
    if(err)
      return res.json({err: err}).end();
    if (response.statusCode == 401)
      return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (!body.data)
      return res.json({err: 'ERR_EMPTY_RESPONSE'}).end();

    res.json({err: null}).end();
  });
});
router.get('/assignment/expired', function(req, res, next){
  if (!req.session.user)
    return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();

  var api = requestJson.createClient(config.API_URL);
  if (req.session.user.outlet) req.body.outlet = req.session.user.outlet._id;

  var options = {
    limit: 10,
    skip: 0
  }

  if (req.query.limit && !isNaN(req.query.limit))
		options.limit = parseInt(req.query.limit);
	if (req.query.offset && !isNaN(req.query.offset))
		options.skip = parseInt(req.query.offset);

  api.headers['authtoken'] = req.session.user.token;
  api.get('/v1/assignment/expired?limit=' + options.limit + '&offset=' + options.skip, function(error, response, body){
    if (error)
      return res.json({err: error, data: []}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY', data: []}).end();
    if (body.err)
      return res.json({err: body.err, data: []}).end();

    res.json(body).end();
  });
});
router.get('/assignment/find', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);

  var query = 'lat=' + req.query.lat + "&lon=" + req.query.lon + "&radius=" + req.query.radius;

  api.get('/v1/assignment/find?' + query, req.body, function(error, response, body){
    if (error)
      return res.json({err: error}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    if (!req.session.user)
      return res.json(body).end();

    var assignments = [];

    for (var index in body.data)
      if (req.session.user.rank == 2 || (req.session.user.outlet && req.session.user.outlet._id == body.data[index].outlet))
        assignments.push(body.data[index]);

    res.json({err: null, data: assignments}).end();
  });
});
router.get('/assignment/get', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  var query = 'id=' + req.query.id;
  api.headers['authtoken'] = req.session.user.token;
  api.get('/v1/assignment/get?' + query, function(error, response, body){
    if (error)
      return res.json({err: error}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();
    res.json(body).end();
  });
});
router.get('/assignment/getAll', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.get('/v1/assignment/getAll', function(error, response, body){
    if (error)
      return res.json({err: error}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();
    res.json(body).end();
  });
});
router.get('/assignment/search', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  var params = Object.keys(req.query).map(function(key){
    return encodeURIComponent(key) + '=' + encodeURIComponent(req.query[key]);
  }).join('&');

  api.get('/v1/assignment/search?' + params, function(err, response, body){
    res.json(body).end();
  });
});
router.post('/assignment/update', function(req, res, next){
  if (!req.session.user || (!req.session.user.outlet && req.session.user.rank < config.RANKS.CONTENT_MANAGER))
    return res.status(403).json({err: 'ERR_UNAUTHORIZED'}).end();

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/assignment/update', req.body, function(error, response, body){
    if (error)
      return res.json({err: error}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json(body).end();
  });
});
//---------------------------^^^-ASSIGNMENT-ENDPOINTS-^^^---------------------------//

module.exports = router;