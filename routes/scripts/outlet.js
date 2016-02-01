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
    API = require('../../lib/api'),

    router = express.Router();

//---------------------------vvv-OUTLET-ENDPOINTS-vvv---------------------------//
router.post('/outlet/checkout', (req, res) => {
  if (!checkOutlet(req, res)) 
    return;

  req.body.outlet = req.session.user.outlet._id;
  
  API.proxyRaw(req, res, (data) => {

    var options = {
      url: '/outlet/purchases?shallow=true&id=' + req.session.user.outlet._id,
      method: 'GET'
    };

    API.request(options, (err, response) => {
      console.log(response);
      if (!err) {
        req.session.user.outlet.purchases = response.body.data;
      }

      req.session.save(() => {
        res.json(data).end();
      })
    });
  });
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

router.get('/outlet/export', (req, res) => {
  if (!checkOutlet(req, res)) return;

  API.proxyRaw(req, res, (body) => {
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

router.get('/outlet/export/email', (req, res) => {
  if (!checkOutlet(req, res)) return;

  req.url = '/outlet/export/email?id=' + req.session.user.outlet._id;
  API.proxy(req, res);
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

router.post('/outlet/update', (req, res) => {
  if (!checkOutlet(req, res)) return;

  req.body.id = req.session.user.outlet._id;

  API.proxyRaw(req, res, (body) => {
    req.session.user.outlet = body.data;
    req.session.save(function(){
      res.json({}).end();
    });
  });
});
//---------------------------^^^-OUTLET-ENDPOINTS-^^^---------------------------//

/**
 * Make sure a user is signed in and is part of an outlet
 * @param  {Request}  req Express request object
 * @param  {Response} res Express response object
 * @return {boolean}      True if everything is kosher, false if not
 */
function checkOutlet(req, res) {
  if (!req.session.user || !req.session.user.outlet) {
    res.status(400).json({err: 'ERR_INVALID_OUTLET'}).end();
    return false;
  }
  return true;
}

module.exports = router;
