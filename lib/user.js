const config = require('./config');
const async = require('async');
const requestJson = require('request-json');
const API = require('./api');
const global = require('../lib/global');
const _ = require('lodash');

const User = {

	/**
	 * Refreshes a user's session with new data
	 */
	refresh(req, res, next) {
		var options = {
			  url: '/user/profile?id=' + req.session.user.id,
			  token: req.session.token,
			  method: 'GET'
			},
			now = Date.now(),
			err = new Error();

		err.status = 500;

		API.request(options, (err, response) => {
			//Check request
			if (err || !response.body) {
				err.message = err;
				return next(err);
			}

			//Check for error on api payload
			if (response.body.err || !response.body.data.id) {
			    delete req.session.user;

			    return req.session.save(() => {
			        res.redirect('/');
			    });
			}

			var user = response.body.data;

			//Configure new session config for user
			req.session.token = req.session.user && req.session.token ? req.session.token : null;
			req.session.user = user;
			req.session.user.TTL = now + config.SESSION_REFRESH_MS;

			//Check if the user has an outlet, otherwise save session and move onward
			if (!req.session.user.outlet) {
			    return req.session.save(() => {
			    	next();
			    });
			}

			//Grab purchases because user does have an outlet, then move onward
			API.request({
				url: '/v1/outlet/purchases?shallow=true&id=' + req.session.user.outlet.id,
				method: 'GET'
			}, (err, response) => {
			    if (!err && response.body && !response.body.err){
			        req.session.user.outlet.purchases = body.data;
			    }

			    return req.session.save(() => {
			    	next();
			    });
			});
		});
	},

	/**
	 * Registers a user, adds to outlet if token is passed.
	 * @param  	{Object}	userData
	 * @param 	{String}	userData.email
	 * @param 	{String}	userData.password
	 * @param 	{String}	userData.firstname
	 * @param 	{String}	userData.lastname
	 * @param 	{String}	userData.token
	 * @param  	{Function}	callback
	 */
	registerUser(userData, callback) {
		var api = requestJson.createClient(config.API_URL),
			parse = requestJson.createClient(config.PARSE_API);

		//Santize before registering
		userData.email = global.sanitizeEmail(userData.email);

		async.waterfall(
		[

			//Register user on parse
			function (cb) {
				parse.headers['X-Parse-Application-Id'] = config.PARSE_APPid;
				parse.headers['X-Parse-REST-API-Key'] = config.PARSE_API_KEY;
				parse.headers['X-Parse-Revocable-Session'] = "1";
				parse.post(
					'/1/users',
					{
						username: userData.email,
						email: userData.email,
						password: userData.password
					},
					function (error, response, parse_body) {
						if (error)
							return cb(error);
						if (!parse_body)
							return cb('ERR_EMPTY_BODY');
						if (parse_body.error) {
							if(parse_body.code == 202 || parse_body.code == 203)
								return cb('ERR_EMAIL_TAKEN')
							else
								return cb('ERR_PARSE');
						}

						cb(null, parse_body);
					}
				);
			},
			//Register user on fresco
			function (parse_body, cb) {
				var body = {
					email: userData.email,
					password: userData.password,
					firstname: userData.firstname,
					lastname: userData.lastname,
					phone: userData.phone,
					token: userData.token,
					parseid: parse_body.objectId
				};

				api.post('/v1/user/create', body, function (error,response,user_body) {
					if (error || !user_body || user_body.err) {
						parse.headers['X-Parse-Session-Token'] = parse_body.sessionToken;
						parse.del(
							'/1/users/' + parse_body.objectId,
							function (error, response, del_body) {
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
			function (parse_body, user_body, cb) {
				parse.headers['X-Parse-Session-Token'] = parse_body.sessionToken;
				parse.put(
					'/1/users/' + parse_body.objectId,
					{
						frescoUserId: user_body.data.id
					},
					function (error, response, parse_update_body) {
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
			function (parse_body, user_body, cb) {
				api.post('/v1/auth/loginparse', {parseSession: parse_body.sessionToken}, function (err,response,login_body) {
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
			function (user_body, login_body, cb) {
				if (!userData.token)
					return cb(null, user_body, login_body);

				api.post('/v1/outlet/invite/accept', { token: userData.token, email: userData.email }, function (err, response, invite_body) {
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
		function (err, user_body, login_body) {
			callback(err, user_body, login_body);
		});
	},

    updateRank(req, cb) {
        if (req.session.user && req.session.user.permissions) {
            let user = _.cloneDeep(req.session.user);
            let rank = -1;
            rank = _.max(_.values(global.permissions).map((v) => {
                if (user.permissions.includes(v.name)) {
                    return v.rank;
                }

                return null;
            }));

            user = _.set(user, 'rank', rank);
            req.session.user = user;
        }

        cb();
    },
};

module.exports = User;
