var express = require('express'),
    requestJson = require('request-json'),
    request = require('request'),
    config = require('../../lib/config'),
    async = require('async'),
    Request = require('request'),
    querystring = require('querystring'),
    validator = require('validator'),
    fs = require('fs'),
    xlsx = require('node-xlsx'),
    User = require('../../lib/user'),
    router = express.Router();
	
//---------------------------vvv-OUTLET-ENDPOINTS-vvv---------------------------//
router.post('/outlet/checkout', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.status(400).json({err: 'ERR_INVALID_OUTLET'}).end();

  req.body.outlet = req.session.user.outlet._id;

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post(
    '/v1/outlet/checkout',
    req.body,
    function(error, response, checkout_body){
      if (error)
        return res.json({err: error, data: []}).end();
      if (!checkout_body)
        return res.json({err: 'ERR_MISSING_BODY', data: []}).end();

      api.get('/v1/outlet/purchases?shallow=true&id=' + req.session.user.outlet._id, function(purchase_err,purchase_response,purchase_body){
        if (!purchase_err && purchase_body && !purchase_body.err)
          req.session.user.outlet.purchases = purchase_body.data;

        req.session.save(function(err) {
            res.json(checkout_body).end();
        });

      });
    }
  );
});

router.post('/outlet/create', function(req, res, next) {
  var api = requestJson.createClient(config.API_URL),
      parse = requestJson.createClient(config.PARSE_API);
  
  var userData = {
    email: req.body.contact_email,
    password: req.body.contact_password,
    firstname: req.body.contact_firstname,
    lastname: req.body.contact_lastname, 
    token: null
  };

  async.waterfall(
    [
      //Create/Fetch the user
      function(cb){

        User.registerUser(userData, function(error, user_body, register_body) {
          if (error){
            if (error == 'ERR_EMAIL_IN_USE' ||
                error == 'username ' + req.body.contact_email + ' already taken'){
              parse.headers['X-Parse-Application-Id'] = config.PARSE_APP_ID;
              parse.headers['X-Parse-REST-API-Key'] = config.PARSE_API_KEY;
              parse.headers['X-Parse-Revocable-Session'] = "1";
              return parse.get('/1/login?username=' + querystring.escape(req.body.contact_email) + '&password=' + querystring.escape(req.body.contact_password), function(err,response,parse_body){
                if(err)
                  return res.json({err: err}).end();
                if (response.statusCode == 401)
                  return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
                if (!parse_body)
                  return res.json({err: 'ERR_EMPTY_BODY'}).end();
          
                api.post('/v1/auth/loginparse', {parseSession: parse_body.sessionToken}, function(err,response,login_body){
                  if (err)
                    return cb(err);
                  if (response.statusCode == 401)
                    return cb('ERR_UNAUTHORIZED');
                  if (!login_body)
                    return cb('ERR_EMPTY_BODY');
                  if (login_body.err)
                    return cb(login_body.err);
          
                  return cb(null, login_body.data);
                });
              });
            } else {
              return cb(error);
            }
          }
          if (!register_body)
            return cb('ERR_EMPTY_BODY');
            
          cb(null, register_body.data);
        });
      },
      //Create the outlet
      function(authtoken, cb){
        api.post(
          '/v1/outlet/create',
          {
            owner: authtoken.user._id,
            title: req.body.title,
            link: req.body.link,
            type: req.body.type,
            state: req.body.state,
            contact_name: (''+req.body.contact_firstname + ' ' + req.body.contact_lastname).trim(),
            contact_first_name: req.body.contact_firstname,
            contact_last_name: req.body.contact_lastname,
            contact_phone: req.body.contact_phone,
            contact_email: authtoken.user.email,
          },
          function(error, response, outlet_body){
            if (error)
              return cb(error);
            if (!outlet_body)
              return cb('ERR_EMPTY_BODY');
            if (outlet_body.err)
              return cb(outlet_body.err);
              
            authtoken.user.outlet = outlet_body.data;
              
            cb(null, authtoken);
          }
        );
      }
    ],
    function(err, authtoken){
      if (err)
        return res.json({err: err, data: {}}).end();
      
      req.session.alerts = ['Your outlet request has been submitted. We will be in touch with you shortly!'];
      req.session.user = authtoken.user;
      req.session.user.token = authtoken.token;
      req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;
      req.session.save(function(){
        res.json({err: err}).end();
      });
    }
  );
});

router.post('/outlet/dispatch/request', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.status(402).json({err: 'ERR_UNAUTHORIZED'}).end();

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post(
    '/v1/outlet/dispatch/request',
    req.body,
    function(error, response, body){
      res.json({err: error || (!body ? 'ERR_EMPTY_BODY' : null) || body.err}).end();
    }
  );
});

router.get('/outlet/export', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.status(400).json({err: 'ERR_INVALID_OUTLET'}).end();

  req.body.outlet = req.session.user.outlet._id;

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  
  var url = '/v1/outlet/export?'
  if(req.query.outlets){
    req.query.outlets.forEach(function(outlet){
      url += 'outlets[]=' + outlet + '&';
    });
  }
  
  api.get(url, function(err, response, body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();
    
    var lines = body.data;
    if(req.query.format == 'xlsx'){
      var data = [['time', 'type', 'price', 'assignment', 'outlet']];
      
      lines.forEach(function(line){
        data.push([line.time, line.type, line.price, line.assignment, line.outlet]);
      });
      
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.set('Content-Disposition', 'inline; filename="export.xlsx"')
      return res.send(xlsx.build([{name: 'Purchases', data: data}])).end();
    }
    else { //CSV
      var output = "time,type,price,assignment,outlet\r\n";
      
      lines.forEach(function(line){
        output += line.time + ',' + line.type + ',' + line.price + ',' + line.assignment + ',' + line.outlet + '\r\n';
      });
      
      res.set('Content-Type', 'text/csv');
      res.set('Content-Disposition', 'inline; filename="export.csv"')
      return res.send(output).end();
    }
  });
});

router.get('/outlet/export/email', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.status(400).json({err: 'ERR_INVALID_OUTLET'}).end();

  var id = req.session.user.outlet._id;

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.get(
    '/v1/outlet/export/email?id=' + id,
    function(error, response, body){
      if (error)
        return res.json({err: error, data: []}).end();
      if (!body)
        return res.json({err: 'ERR_MISSING_BODY', data: []}).end();
      return res.json(body).end();
    }
  );
});

router.post('/outlet/invite', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);

  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/outlet/invite', { emails: req.body.emails, id: req.session.user.outlet._id }, function(err,response,body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json({}).end();
  });
});

router.post('/outlet/invite/accept', function(req, res, next) {
  if(!req.body.token)
      return res.send({err: 'ERR_INVALID_TOKEN'});
  if(!req.body.password)
      return res.send({err: 'ERR_INVALID_PASSWORD'});
  if(!req.body.email)
      return res.send({err: 'ERR_INVALID_EMAIL'});

  var api = requestJson.createClient(config.API_URL),
      apiLoginToken = '';

  api.get('/v1/outlet/invite/get?token=' + req.body.token, getInviteTokenCB);

  function getInviteTokenCB(err, response, token_body) {
    if(err)
        return res.send({err: err.err});
    if(!token_body)
      return res.send({err: 'ERR_EMPTY_BODY'});
    if(!token_body.data.user)
      return res.send({err: 'ERR_NOT_FOUND'});

    var parse = requestJson.createClient(config.PARSE_API);
    parse.headers['X-Parse-Application-Id'] = config.PARSE_APP_ID;
    parse.headers['X-Parse-REST-API-Key'] = config.PARSE_API_KEY;
    parse.headers['X-Parse-Revocable-Session'] = "1";

    parse.get('/1/login?username=' + querystring.escape(token_body.data.user.email) + '&password=' + querystring.escape(req.body.password), parseLoginCB);

  }

  function parseLoginCB(err, response, parse_body) {
    if(err)
      return res.send({err: err});
    if (response.statusCode == 401)
      return res.status(401).send({err: 'ERR_UNAUTHORIZED'});
    if (!parse_body)
      return res.send({err: 'ERR_EMPTY_BODY'});

    api.post('/v1/auth/loginparse', {parseSession: parse_body.sessionToken}, apiLoginCB);

  }

  function apiLoginCB(err, response, login_body) {
    if (err)
      return res.send({err: err.err});
    if (response.statusCode == 401)
      return res.send({err: 'ERR_UNAUTHORIZED'});
    if (!login_body)
      return res.send({err: 'ERR_EMPTY_BODY'});
    if (login_body.err)
      return res.send({err: login_body.err});

    apiLoginToken = login_body.data.token;

    api.post('/v1/outlet/invite/accept', { token: req.body.token }, inviteAcceptCB);
  }

  function inviteAcceptCB(err, response, accept_body) {
    if (err)
      return res.send({err: err.err});
    if (!accept_body)
      return res.send({err: 'ERR_EMPTY_BODY'});
    if (accept_body.err)
      return res.send({err: accept_body.err});

    req.session.user = accept_body.data;
    req.session.user.token = apiLoginToken;
    req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;

    if (!req.session.user.outlet) {
      return  req.session.save(function(){
        res.send({err: null});
      });
    }

    finishAccept();
  }

  function finishAccept() {
    api.get('/v1/outlet/purchases?shallow=true&id=' + req.session.user.outlet._id, function (purchase_err,purchase_response,purchase_body) {
      if (!purchase_err && purchase_body && !purchase_body.err)
        req.session.user.outlet.purchases = purchase_body.data;
      
      req.session.save(function(){
        res.send({err: null});
      });

    });
  }

});

router.get('/outlet/list', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.get('/v1/outlet/list', function(err,response,body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json(body).end();
  });
});

router.post('/outlet/location/create', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/outlet/location/create', req.body, function(err,response,body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json(body).end();
  });
});
router.post('/outlet/location/remove', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/outlet/location/remove', req.body, function(err,response,body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json(body).end();
  });
});
router.get('/outlet/location/stats', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.get('/v1/outlet/location/posts?since=' + (req.query.since || Date.now()), function(err,response,body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json(body).end();
  });
});
router.post('/outlet/location/update', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/outlet/location/update', req.body, function(err,response,body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json(body).end();
  });
});

router.post('/outlet/location/remove', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/outlet/location/remove', req.body, function(err,response,body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json(body).end();
  });
});

router.get('/outlet/location/stats', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet) 
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.get('/v1/outlet/location/posts?since=' + (req.query.since || Date.now()), function(err,response,body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json(body).end();
  });
});

router.post('/outlet/location/update', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/outlet/location/update', req.body, function(err,response,body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json(body).end();
  });
});

router.get('/outlet/locations', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.get('/v1/outlet/location/list?offset=' + (req.query.offset || '0') + '&limit=' + (req.query.limit || '') + '&since=' + (req.query.since || ''), function(err,response,body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json(body).end();
  });
});

router.get('/outlet/purchases', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL),
      url = "/v1/outlet/purchases?";
      
  for (var index in req.query)
    url += index + '=' + req.query[index] + '&';

  api.headers['authtoken'] = req.session.user.token;
  
  api.get(url, function(err, response, body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();
      
    res.json(body).end();
  });
});

router.get('/outlet/purchases/list', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();
  
  var api = requestJson.createClient(config.API_URL),
      url = "/v1/outlet/purchases/list?";
      
  for (var index in req.query){
    if(index != 'outlets') {
      url += index + '=' + req.query[index] + '&';
    }
    else{
      req.query.outlets.forEach(function(outlet){
        url += 'outlets[]=' + outlet + '&';
      });
    }
  }
  
  api.headers['authtoken'] = req.session.user.token;
  api.get(url, function(err, response, body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();
    
    res.json(body).end();
  });
});

router.post('/outlet/user/remove', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL);

  api.headers['authtoken'] = req.session.user.token;
  api.post('/v1/outlet/user/remove', req.body, function(err,response,body){
    if (err)
      return res.json({err: err.err}).end();
    if (!body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    res.json(body).end();
  });
});

router.post('/outlet/update', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.status(400).json({err: 'ERR_INVALID_OUTLET'}).end();

  var fs = require('fs'),
      request = require('request'),
      params = {
        id: req.session.user.outlet._id
      };

     //Check if link is valid
     if(req.body.link){
          if(!validator.isURL(req.body.link)){
               return res.json({
                 err: 'ERR_INVALID_URL'
          });
          } else{
               params.link = req.body.link
          }
     }


  if (req.body.title) params.title = req.body.title;
  if (req.body.bio) params.bio = req.body.bio;
  if (req.body.stripe_token) params.stripe_token = req.body.stripe_token;

  var file = null;

  for (var index in req.files)
    file = req.files[index];

  if (file) params.avatar = fs.createReadStream(file.path);

  request.post({ url: config.API_URL + '/v1/outlet/update', headers: { authtoken: req.session.user.token }, formData: params }, function(error, response, body){
    if (error)
      return res.json({err: error}).end();
    
    try{
      body = JSON.parse(body);
    }catch(e){
      return res.json({err: e.msg}).end();
    }

    for (var index in req.files)
      fs.unlink(req.files[index].path, function(){});

    if (error)
      return res.json({err: error}).end();
    if (!body)
      return res.json({err: 'ERR_MISSING_BODY'}).end();
    if (body.err)
      return res.json({err: body.err}).end();

    req.session.user.outlet = body.data;
    req.session.save(function(){
      res.json({}).end();
    });
  });
});
//---------------------------^^^-OUTLET-ENDPOINTS-^^^---------------------------//

module.exports = router;