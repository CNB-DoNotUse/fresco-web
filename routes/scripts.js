var express = require('express'),
    requestJson = require('request-json'),
    config = require('../lib/config'),
    async = require('async'),
    Request = require('request'),
    querystring = require('querystring'),
    fs = require('fs'),
    xlsx = require('node-xlsx'),
    User = require('../lib/user'),
    
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

//---------------------------vvv-GALLERY-ENDPOINTS-vvv---------------------------//
router.post('/gallery/addpost', function(req, res, next){
  var request = require('request');
  var params = {
    gallery: req.body.gallery,
    posts: {}
  };
  
  var cleanupFiles = [];

  function upload(cb){
    params.posts = JSON.stringify(params.posts);
    request.post({ url: config.API_URL + '/v1/gallery/addpost', headers: { authtoken: req.session.user.token }, formData: params }, function(err, response, body){
      for (var index in cleanupFiles)
        fs.unlink(cleanupFiles[index], function(){});
        
      body = JSON.parse(body);

      cb(err || body.err, body.data);
    });
  }
  
  var i = 0;
  for (var index in req.files){
    cleanupFiles.push(req.files[index].path);
    params[i] = fs.createReadStream(req.files[index].path);
    params.posts[i] = {lat:0,lon:0};
    ++i;
  }

  upload(function(err, gallery){
    res.json({err: err, data: gallery}).end();
  });
});
router.post('/gallery/create', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post("/v1/gallery/create/",
    req.body,
    function (err, response, body){
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
        
      body = JSON.parse(body);

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

    tClient.get('/statuses/show/' + twitterId, function(error, tweet, response){
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
            lat: 0,
            lon: 0,
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
      params.posts[i] = {lat:0,lon:0};
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
      res.json(body).end();
    });
});
router.post('/gallery/verify', function(req, res, next){
  req.body.visibility = config.VISIBILITY.VERIFIED;
  req.body.rated = '1';
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  api.post("/v1/gallery/update",
    req.body,
    function (err, response, body){
      res.json(body).end();
    });
});
//---------------------------^^^-GALLERY-ENDPOINTS-^^^---------------------------//

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
        req.session.save(function(){
          res.json(checkout_body).end();
        });
      });
    }
  );
});
router.post('/outlet/create', function(req, res, next){
  var api = requestJson.createClient(config.API_URL),
      parse = requestJson.createClient(config.PARSE_API);
  
  async.waterfall(
    [
      //Create/Fetch the user
      function(cb){
        User.registerUser(req.body.contact_email, req.body.contact_password, req.body.contact_firstname, req.body.contact_lastname, null, function(error, user_body, register_body){
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
            }else{
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
          function(error, response, outlet_body){console.log(error, outlet_body);
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
router.post('/outlet/invite/accept', function(req, res, next){
  if (!req.body.token)
    return res.json({err:'ERR_INVALID_TOKEN'}).end();
  if (!req.body.password)
    return res.json({err:'ERR_INVALID_PASSWORD'}).end();
  
  var api = requestJson.createClient(config.API_URL);

  api.get('/v1/outlet/invite/get?token='+req.body.token, function(err, response, token_body){
    if (err)
      return res.json({err: err.err}).end();
    if (!token_body)
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    if (!token_body.data.user)
      return res.json({err: 'ERR_NOT_FOUND'}).end();
    if (token_body.err)
      return res.json({err: token_body.err}).end();
    
    var querystring = require('querystring'),
        parse = requestJson.createClient(config.PARSE_API);

    parse.headers['X-Parse-Application-Id'] = config.PARSE_APP_ID;
    parse.headers['X-Parse-REST-API-Key'] = config.PARSE_API_KEY;
    parse.headers['X-Parse-Revocable-Session'] = "1";
    parse.get('/1/login?username=' + querystring.escape(token_body.data.user.email) + '&password=' + querystring.escape(req.body.password), function(err,response,parse_body){
      if(err)
        return res.json({err: err}).end();
      if (response.statusCode == 401)
        return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
      if (!parse_body)
        return res.json({err: 'ERR_EMPTY_BODY'}).end();

      api.post('/v1/auth/loginparse', {parseSession: parse_body.sessionToken}, function(err,response,login_body){
        if (err)
          return res.json({err: err.err}).end();
        if (response.statusCode == 401)
          return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
        if (!login_body)
          return res.json({err: 'ERR_EMPTY_BODY'}).end();
        if (login_body.err)
          return res.json({err: login_body.err}).end();

        api.post('/v1/outlet/invite/accept', { token: req.body.token }, function(err, response, accept_body){
          if (err)
            return res.json({err: err.err}).end();
          if (!accept_body)
            return res.json({err: 'ERR_EMPTY_BODY'}).end();
          if (accept_body.err)
            return res.json({err: accept_body.err}).end();
          
          req.session.user = accept_body.data;
          req.session.user.token = login_body.data.token;
          req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;
  
          if (!req.session.user.outlet)
            return  req.session.save(function(){
                      res.json({err: null}).end();
                    });
  
          api.get('/v1/outlet/purchases?shallow=true&id=' + req.session.user.outlet._id, function(purchase_err,purchase_response,purchase_body){
            if (!purchase_err && purchase_body && !purchase_body.err)
              req.session.user.outlet.purchases = purchase_body.data;
            req.session.save(function(){
              res.json({err: null}).end();
            });
          });
        })
      });
    });
  });
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
router.get('/outlet/purchases', function(req, res, next){
  if (!req.session.user || !req.session.user.outlet)
    return res.json({err: 'ERR_INVALID_OUTLET'}).end();

  var api = requestJson.createClient(config.API_URL),
      url = "/v1/outlet/purchases?";
      
  for (var index in req.query)
    url += index + '=' + req.query[index] + '&';

  api.headers['authtoken'] = req.session.user.token;
  console.log(url);
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

  if (req.body.title) params.title = req.body.title;
  if (req.body.link) params.link = req.body.link;
  if (req.body.stripe_token) params.stripe_token = req.body.stripe_token;

  var file = null;

  for (var index in req.files)
    file = req.files[index];

  if (file) params.avatar = fs.createReadStream(file.path);

  request.post({ url: config.API_URL + '/v1/outlet/update', headers: { authtoken: req.session.user.token }, formData: params }, function(error, response, body){console.log(error, body);
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
router.get('/story/search', function(req, res, next){
  var api = requestJson.createClient(config.API_URL);
  api.headers['authtoken'] = req.session.user.token;
  var params = Object.keys(req.query).map(function(key){
    return encodeURIComponent(key) + '=' + encodeURIComponent(req.query[key]);
  }).join('&');

  api.get('/v1/story/autocomplete?' + params, function(err, response, body){console.log(err, body);
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
      res.writeHead(301, {Location: '/'});
      res.end();
    });
  });
});
router.post('/user/register', function(req, res, next) {console.log(req.body);
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
  	  email: req.body.email
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
console.log(req.session.user.token);
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

// router.get('/gallery/download/:id', function(req, res, next){
//   var gallery_id = req.params.id;
//   Gallery.get(gallery_id, function(err, gallery){
//     if (err) return res.status(404).send('Not Found').end();

//     var archive = archiver('zip');

//     archive.on('error', function(err) {
//       if(res.headersSent) return;
//       res.status(500).send({error: err.message}).end();
//     });

//     res.on('close', function(){
//       if(res.headersSent) return;
//       return res.status(200).send('OK').end();
//     });

//     res.attachment('gallery.zip');

//     archive.pipe(res);

//     gallery.posts.forEach(function(post){
//       var url = post.image;

//       var name = url.split('/').reverse()[0];

//       //Use the mp4 video, instead of the hls playlist
//       if (post.video) {
//         url = toMP4(post.video);
//         name = url.split('/').reverse()[0];
//       }
//       //If no extension, assume jpeg
//       else if(name.indexOf('.') == -1){
//         name += '.jpg';
//       }

//       archive.append(request.get(url), {name: name});
//     });

//     archive.finalize();
//   });
// });
