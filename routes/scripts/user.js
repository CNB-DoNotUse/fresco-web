var express = require('express'),
    requestJson = require('request-json'),
    validator = require('validator'),
    config = require('../../lib/config'),
    User = require('../../lib/user'),
    API = require('../../lib/api'),
    router = express.Router();

//---------------------------vvv-USER-ENDPOINTS-vvv---------------------------//

/**
 * Reset password endpoint
 * Takes an email in the body
 */

router.post('/user/reset', function(req, res, next) {

    var request  = require('superagent'),
        email = req.body.email;

    if(!email){
        return res.json({
            err: 'Invalid Data',
            data: {}
        }).end();
    }

    request
    .post('https://api.parse.com/1/requestPasswordReset')
    .send({ email: email })
    .set('X-Parse-Application-Id', config.PARSE_APP_ID)
    .set('X-Parse-REST-API-Key', config.PARSE_API_KEY)
    .set('X-Parse-Revocable-Session', "1")
    .set('Accept', 'application/json')
    .end(function(err, response){

       //No error, return success
       if(!response.body && !err){
           return res.json({
               success: true,
               err: false
           });
       }

       //Return the error
       return res.json({
           err: response.body.error
       });

    });

});

router.post('/user/login', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.json({err: 'ERR_MISSING_INFO'}).end();
  }

  var parse = requestJson.createClient(config.PARSE_API);

  parse.headers['X-Parse-Application-Id'] = config.PARSE_APP_ID;
  parse.headers['X-Parse-REST-API-Key'] = config.PARSE_API_KEY;
  parse.headers['X-Parse-Revocable-Session'] = "1";

  parse.get('/1/login?username=' + req.body.email + '&password=' + req.body.password, (err, response, parse_body) => {
    if(err) {
      return res.json({err: err}).end();
    }
    if (response.statusCode == 401) {
      return res.status(401).send({err: 'ERR_UNAUTHORIZED'});
    }
    if (!parse_body) {
      return res.json({err: 'ERR_EMPTY_BODY'}).end();
    }

    var options = {
      url: '/auth/loginparse',
      body: {parseSession: parse_body.sessionToken},
      method: 'POST',
      res
    }
    API.request(options, (login_body) => {
      if(!login_body) {
            return res.json({
                "err" : "ERR_LOGIN"
            }).end();
      }

      req.session.token = login_body.data.token;
      req.session.user = login_body.data.user;
      req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;

      if (!req.session.user.outlet) {
        return req.session.save(function(){
          res.json({err: null, data: login_body.data.user}).end();
        });
      }

      var purchase_options = {
        url: '/outlet/purchases?shallow=true&id=' + req.session.user.outlet._id,
        method: 'GET'
      };

      API.request(purchase_options, (err, response) => {
        if (!err) {
          var purchases = JSON.parse(response.text);
          req.session.user.outlet.purchases = purchases.data;
        }
        req.session.save(() => {
          res.json({err: null, data: login_body.data.user}).end();
        });
      });
    })
  });
});

router.get('/user/logout', (req, res) => {
    var end = () => {
        req.session.destroy(() => { 
            res.redirect('/');
        });
    }

    if (!req.session.user) {
        return end();
    }

    API.request({
      method: 'POST',
      url: '/auth/logout',
      token: req.session.token
    }, () => {
      end();
    });

});

router.post('/user/register', function(req, res, next) {
  var userData = {
    password: req.body.password,
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
    token: req.body.token
  };

  if(!validator.isEmail(userData.email)){
    return res.json({
      err: 'ERR_INVALID_EMAIL'
    });
  }

  User.registerUser(userData, function(err, user_body, login_body){
    if (err)
      return res.json({err: err, data: {}}).end();

    req.session.token = login_body.data.token;
    req.session.user = user_body.data;
    req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;
    req.session.save(function(){
      res.json(login_body).end();
    });
  });
});

router.post('/user/update', (req, res) => {
    // When no picture is uploaded, avatar gets set, which confuses the API
    if (req.body.avatar) delete req.body.avatar;

    API.proxyRaw(req, res, (body) => {
      var user = body.data;

      req.session.user.firstname = user.firstname;
      req.session.user.lastname = user.lastname;
      req.session.user.bio = user.bio;
      req.session.user.email = user.email;
      req.session.user.phone = user.phone;
      req.session.user.avatar = user.avatar;

      req.session.save(() => {
          res.json({}).end();
      });
    });
});

router.get('/user/verify/resend', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.json({err: 'ERR_UNAUTHORIZED'}).end();
  }

  API.proxyRaw(req, res, (body) => {
    var end = () => {
      res.redirect(req.headers['Referer'] || config.DASH_HOME);
      res.end();
    };

    if (err) {
      req.session.alerts = [config.resolveError(body.err)];
      return req.session.save(end);
    }
    if (!body) {
      req.session.alerts = ['Could not connect to server'];
      return req.session.save(end);
    }

    req.session.alerts = ['A comfirmation email has been sent to your email.  Please click the link within it in order to verify your email address.'];
    return req.session.save(end);
  });
});
//---------------------------^^^-USER-ENDPOINTS-^^^---------------------------//

module.exports = router;
