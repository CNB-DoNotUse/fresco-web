var config = require('./config'),
	async = require('async'),
	requestJson = require('request-json');

var User = {
	registerUser: function(email, password, firstname, lastname, token, callback){
		var api = requestJson.createClient(config.API_URL),
			parse = requestJson.createClient(config.PARSE_API);
		
		var parse_id = '';
		
		async.waterfall(
		[
		//Resolve the email address if there is a token
		function(cb){
			if (!token)
			return cb();
			
			api.get('/v1/outlet/invite/get?token='+token, function(error,response,body){
			if (error)
				return cb(error);
			if (!body)
				return cb('ERR_EMPTY_BODY');
			if (body.data.user)
				return cb('ERR_EMAIL_TAKEN');
			if (body.err)
				return cb(body.err);
				
			email = body.data.email; 
			cb();
			});
		},
		//Register user on parse
		function(cb){
			parse.headers['X-Parse-Application-Id'] = config.PARSE_APP_ID;
			parse.headers['X-Parse-REST-API-Key'] = config.PARSE_API_KEY;
			parse.headers['X-Parse-Revocable-Session'] = "1";
			parse.post(
			'/1/users',
			{
				username: email,
				email: email,
				password: password
			},
			function(error, response, parse_body){
				if (error)
				return cb(error);
				if (!parse_body)
				return cb('ERR_EMPTY_BODY');
				if (parse_body.error)
				return cb(parse_body.error);
		
				parse_id = parse_body.objectId;
				cb(null, parse_body);
			});
		},
		//Register user on fresco
		function(parse_body, cb){
			var body = {
				email: email,
				password: password,
				firstname: firstname,
				lastname: lastname,
				token: token,
			}
			api.post('/v1/user/create', body, function(error,response,user_body){
			if (error || !user_body || user_body.err){
				parse.headers['X-Parse-Session-Token'] = parse_body.sessionToken;
				parse.del(
				'/1/users/' + parse_body.objectId,
				function(error, response, del_body){
					//Do nothing
				}
				);
	
				if (error)
				return cb(error);
				if (!user_body)
				return cb('ERR_EMPTY_BODY');
				if (user_body.err)
				return cb(user_body.err);
			}
				
			cb(null, parse_body, user_body);
			});
		},
		//Send Parse the user's Fresco ID
		function(parse_body, user_body, cb){
			parse.headers['X-Parse-Session-Token'] = parse_body.sessionToken;
			parse.put(
				'/1/users/' + parse_body.objectId,
				{
				frescoUserId: user_body.data._id
				},
				function(error, response, parse_update_body){
				if (error)
					return cb(error);
				if (!parse_update_body)
					return cb('ERR_EMPTY_BODY');
				if (parse_update_body.error)
					return cb(parse_update_body.error);
					
				cb(null, parse_body, user_body);
			}
			);
		},
		//Log the user in
		function(parse_body, user_body, cb){
			api.post('/v1/auth/loginparse', {parseSession: parse_body.sessionToken}, function(err,response,login_body){
			if (err)
				return cb(err.err);
			if (!login_body)
				return cb('ERR_EMPTY_BODY');
			if (login_body.err)
				return cb(login_body.err);
				
			cb(null, user_body, login_body);
			});
		},
		//Add the user to their outlet
		function(user_body, login_body, cb){
			if (!token)
			return cb(null, user_body, login_body);
	
			api.post('/v1/outlet/invite/accept', { token: token }, function(err, response, invite_body){
			if (err)
				return cb(err.err);
			if (!invite_body)
				return cb('ERR_EMPTY_BODY');
			if (invite_body.err)
				return cb(invite_body.err);
	
			user_body.data.outlet = invite_body.data.outlet
			cb(null, user_body, login_body);
			});
		}
		],
		function(err, user_body, login_body){
			callback(err, user_body, login_body);
		}
	);
	}
}

module.exports = User;