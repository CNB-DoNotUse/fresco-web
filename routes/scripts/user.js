const
    express     = require('express'),
    validator   = require('validator'),
    config      = require('../../lib/config'),
    User        = require('../../lib/user'),
    API         = require('../../lib/api'),
    resolveError = require('../../lib/resolveError'),
    global      = require('../../lib/global'),
    router      = express.Router();

//---------------------------vvv-USER-ENDPOINTS-vvv---------------------------//

/**
 * Reset password endpoint
 * Takes an email in the body
 */

router.post('/user/reset', (req, res, next) => {

    var request  = require('superagent'),
        email = global.sanitizeEmail(req.body.email);

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
    API.request({
        method: 'POST',
        url: '/auth/signin',
        body: {
            username: req.body.username,
            password: req.body.password
        }
    })
    .then((response) => {
        let { body } = response;

        //Save to session
        req.session.token = body.token;


        //Send request for user object
        return API.request({
            method: 'GET',
            url: '/user/me',
            token: body.token
        }).then((response) => {
            req.session.user = response.body;
            req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;

            //Save session and return
            req.session.save(() => {
                return res.status(response.status).json({ success: true });
            });
        })
    })
    .catch((error) => {
        return res.status(error.status).json({
            error: resolveError(error.type || ''),
            success: false
        });
    });
});

router.get('/user/logout', (req, res) => {
    let end = () => {
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
    })
    .then(response => end())
    .catch(error => end());
});

router.post('/auth/register', (req, res, next) => {
    let body = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        full_name: req.body.firstname + ' ' + req.body.lastname,
        phone: req.body.phone,
        outlet: req.body.outlet
    };

    if(!validator.isEmail(body.email)){
        return res.json({
            error: 'ERR_INVALID_EMAIL'
        });
    }

    API.request({
        method: 'POST',
        url: '/auth/register',
        body: body
    }).then((response) => {
        console.log(response)
        let { body, status } = response;

        // req.session.token = login_body.data.token;
        // req.session.user = user_body.data;
        // req.session.user.TTL = Date.now() + config.SESSION_REFRESH_MS;
        // req.session.save(() => {
        //     res.json(login_body).end();
        // });

        req.session.save(() => {
            return res.status(status).json({ success: true });
        });
    }).catch((error) => {
        return res.status(error.status).json({
            error: resolveError(error.type || ''),
            success: false
        });
    });
});

router.get('/user/refresh', (req, res, next) => {
    User.refresh(req, res, (err) => {
        if(err)
            return res.json({
                err: 'ERR_REFRESH_FAIL',
                data: null
            });
        else
            return res.json({
                data: req.session.user,
                err: null
            });
    });
});

router.post('/user/update', (req, res) => {
    // When no picture is uploaded, avatar gets set, which confuses the API
    if(req.body.avatar)
        delete req.body.avatar;

    req.body.parseSessionToken = req.session.parseSessionToken;

    API.proxy(req, res, (body) => {
        if(body.err) return res.send({err: body.err});

        var user = body.data;

        //Update all fields
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

  API.proxy(req, res, (body) => {
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
