var config = require('../../lib/config'),
	AuthToken = require('../../lib/authtoken'),
	routeLogger = require('../../lib/logger').child({route: 'auth'}),
	db = require('../../lib/db'),
	
	Parse = require('../../lib/parse'),
	express = require('express'),
	passport = require('passport'),
	request = require('request'),
	AuthTokenStrategy = require('../../lib/authtokenStrategy'),
	LocalStrategy = require('passport-local').Strategy,
	bcrypt = require('bcryptjs'),
	router = express.Router();
	
passport.use('v1_authtoken', new AuthTokenStrategy(function(req, authtoken, done){
    var AuthToken = require('../../lib/authtoken');
	var logger = routeLogger.child({route: 'authorization', req_id: req.req_id});
    AuthToken.getToken(db, authtoken, function(err, authtoken){
        if(err){
            logger.warn(err.err);
            return done(err);
        }
        if(!authtoken){ 
            logger.info('Invalid AuthToken provided');
            return done(null, false);
        }
		AuthToken.keepAlive(db, authtoken._id.toString(), function(err, authtoken){
			if(err)
				return logger.warn({step: 'keepAlive'}, err.err);
			logger.info({step: 'keepAlive'}, 'AuthToken activity recorded');
		});
		req.authtoken = authtoken;
		var User = require('../../lib/user');
		User.get(db, authtoken.user_id, function(err, user){
			if (err) {
				logger.warn({step: 'getUser'}, err.err);
				return done(null, false);
			}
			return done(null, user);
		});
    });
}));

passport.use('v1_local', new LocalStrategy({usernameField: 'email', passReqToCallback: true}, function(req, email, password, done){
	var logger = routeLogger.child({endpoint: 'login', email: email, req: req.req_id});
	logger.info('Login called');
	
    var User = require('../../lib/user');
    User.findByEmail(db, email, function(err, user){
        if(err){
			logger.warn(err.err);
			return done(null, false);
		}
        if(!bcrypt.compareSync(password, user.password)){
			logger.info('Invalid password');
			return done(null, false);
		};
        return done(null, user);
    });
}));

/*
	Logs a user in, by generating and returning and AuthToken.
	Username and password passed in POST data
*/
router.post('/login', passport.authenticate('v1_local', {session: false}), function(req, res, next){
	var db = req.db,
		user = req.user,
		logger = routeLogger.child({endpoint: 'login', user_id: user._id.toString(), req_id: req.req_id});
	
	logger.info('Login successfull');
	
	AuthToken.add(db, user._id.toString(), function(err, token){
		if (err) logger.warn(err.err);
		
		var User = require('../../lib/user');
		
		delete user.password;
		delete token.user_id;
		
		User.unpack(
			db,
			user,
			function(err, user_unpacked){
				token.user = user_unpacked;
				return res.json({err: err ? err.err : null, data: token}).end();
			}
		);
	});
});

/*
	Authenticate and login a user via a parse session token
*/
router.post('/loginparse', function(req, res, next){
	var db = req.db,
	parseSession = req.body.parseSession,
	logger = routeLogger.child({endpoint: 'loginparse', req_id: req.req_id});
	
	logger.info('Login Parse called');
	
	request.get({
		url: 'https://api.parse.com/1/users/me',
		headers: {
			'X-Parse-Application-Id': config.PARSE_APP_ID,
			'X-Parse-REST-API-Key': config.PARSE_API_KEY,
			'X-Parse-Session-Token': parseSession,
		}
	}, function(err, response, body){
		if(err || !body){
			logger.warn({body: body, response: response}, err);
			return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
		}
		body = JSON.parse(body);
		if(body.code) return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
		
		//Try frescoUserId first, fallback to frescoUserData
		var id = null;
		
		if(body.frescoUserId)
			id = body.frescoUserId;
		else
			return res.status(401).json({err: 'ERR_UNAUTHORIZED'}).end();
		
		AuthToken.add(db, id, function(err, authtoken){
			if(err) logger.warn(err.err);console.log(err, authtoken);
			return res.json({err: err ? err : null, data: authtoken}).end();
		});
	});
});

/*
	Logs a user out.
*/
router.post('/logout', passport.authenticate('v1_authtoken', {session: false}), function(req, res, next){
	var db = req.db,
		authtoken = req.authtoken,
		logger = routeLogger.child({endpoint: 'logout', user_id: authtoken.user_id, req_id: req.req_id});
	
	logger.info('Logout called');
	
	AuthToken.remove(db, authtoken._id.toString(), function(err){
		if (err) logger.warn(err.err);
		return res.json({err: err ? err.err : null}).end();
	});
});

module.exports = router;
