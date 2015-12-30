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

//---------------------------vvv-USER-ENDPOINTS-vvv---------------------------//
router.post('/user/follow', function(req, res, next) {
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/user/follow', req.body, function(err,response,body){
    if (err)
      return res.json({err: err, data: {}}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY', data: {}}).end();
    if (body.err)
      return res.json({err: body.err, data: {}}).end();

    req.session.user.following = body.data;
    req.session.save(function(){
      return res.json({err: null, data: body.data}).end();
    });
  });
});
router.post('/user/login', function(req, res, next) {
  if(req.body.email && req.body.password){
    var parse = requestJson.createClient(config.PARSE_API);

    parse.headers['X-Parse-Application-Id'] = config.PARSE_APP_ID;
    parse.headers['X-Parse-REST-API-Key'] = config.PARSE_API_KEY;
    parse.headers['X-Parse-Revocable-Session'] = "1";
    parse.get('/1/login?username=' + querystring.escape(req.body.email) + '&password=' + querystring.escape(req.body.password), function(err,response,parse_body){
      if(err)
        return res.json({err: err}).end();
      if (response.statusCode == 401)
        return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
      if (!parse_body)
        return res.json({err: 'ERR_EMPTY_BODY'}).end();

      var api = requestJson.createClient(config.API_URL);
      api.post('/v1/auth/loginparse', {parseSession: parse_body.sessionToken}, function(err,response,login_body){
        if (err)
          return res.json({err: err.err}).end();
        if (response.statusCode == 401)
          return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
        if (!login_body)
          return res.json({err: 'ERR_EMPTY_BODY'}).end();
        if (login_body.err)
          return res.json({err: login_body.err}).end();

        req.session.user = login_body.data.user;
        req.session.user.token = login_body.data.token;
        req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;

        if (!req.session.user.outlet)
          return  req.session.save(function(){
                    res.json({err: null, data: login_body.data.user}).end();
                  });

	      api.get('/v1/outlet/purchases?shallow=true&id=' + req.session.user.outlet._id, function(purchase_err,purchase_response,purchase_body){
          if (!purchase_err && purchase_body && !purchase_body.err)
            req.session.user.outlet.purchases = purchase_body.data;
          req.session.save(function(){
            res.json({err: null, data: login_body.data.user}).end();
          });
        });
      });
    });
  }else
    return res.json({err: 'ERR_MISSING_INFO'}).end();
});
router.get('/user/logout', function(req, res, next) {
  if (!req.session.user)
      return req.session.destroy(function(){
        res.redirect('/');
      });
  
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/auth/logout', { }, function(err,response,body){
  
    req.session.destroy(function(){
      res.redirect('/');
    });
  
  });

});
router.post('/user/register', function(req, res, next) {
  var password = req.body.password,
      email = req.body.email,
      firstname = req.body.firstname,
      lastname = req.body.lastname,
      token = req.body.token;
  
  User.registerUser(email, password, firstname, lastname, token, function(err, user_body, login_body){
    if (err)
      return res.json({err: err, data: {}}).end();
      
    req.session.user = user_body.data;
    req.session.user.token = login_body.data.token;
    req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;
    req.session.save(function(){
      res.json(login_body).end();
    });
  });
});
router.get('/user/search', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  var params = Object.keys(req.query).map(function(key){
    return encodeURIComponent(key) + '=' + encodeURIComponent(req.query[key]);
  }).join('&');

  api.get('/v1/user/search?' + params, function(err, response, body){
    res.json(body).end();
  });
});
router.post('/user/unfollow', function(req, res, next) {
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/user/unfollow', req.body, function(err,response,body){
    if (err)
      return res.json({err: err, data: {}}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY', data: {}}).end();
    if (body.err)
      return res.json({err: body.err, data: {}}).end();

    req.session.user.following = body.data;
    req.session.save(function(){
      return res.json({err: null, data: body.data}).end();
    });
  });
});
router.post('/user/update', function(req, res, next){
	var request = require('request'),
    formData = {
  	  id: req.body.id,
  	  firstname: req.body.firstname,
  	  lastname: req.body.lastname,
  	  email: req.body.email,
      phone: req.body.phone
  	};

	var file = null;

	for(var i in req.files) {
		file = req.files[i];
	}

	if (file) formData.avatar = fs.createReadStream(file.path);
	if(req.body.password) formData.password = req.body.password;
  if (formData.email == req.session.user.email) delete formData.email;

  request.post({ url: config.API_URL + '/v1/user/update', headers: { authtoken: req.session.user.token }, formData: formData }, function(error, response, body){
    body = JSON.parse(body);

    for (var index in req.files)
      fs.unlink(req.files[index].path, function(){});

    if (error)
      return res.json({err: error}).end();
    if (!body)
      return res.json({err: 'ERR_MISSING_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    var user = body.data;

		req.session.user.firstname = user.firstname;
		req.session.user.lastname = user.lastname;
		req.session.user.email = user.email;
		req.session.user.avatar = user.avatar;

    req.session.save(function(){
      res.json({}).end();
    });
  });
});
router.get('/user/verify/resend', function(req, res, next){
	if (!req.session || !req.session.user)
    return res.json({err: 'ERR_UNAUTHORIZED'}).end();

  var api = requestJson.createClient(config.API_URL);

  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/user/verify/resend', {}, function(err,response,body){
    if (err){
      req.session.alerts = [config.resolveError(body.err)];
      return req.session.save(function(){
        res.redirect(req.headers['Referer'] || config.DASH_HOME);
        res.end();
      });
    }
    if (!body){
      req.session.alerts = ['Could not connect to server'];
      return req.session.save(function(){
        res.redirect(req.headers['Referer'] || config.DASH_HOME);
        res.end();
      });
    }
    
      req.session.alerts = ['A comfirmation email has been sent to your email.  Please click the link within it in order to verify your email address.'];
      return req.session.save(function(){
        res.redirect(req.headers['Referer'] || config.DASH_HOME);
        res.end();
      });
  });
});
//---------------------------^^^-USER-ENDPOINTS-^^^---------------------------//

module.exports = router;