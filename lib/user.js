const config = require('./config');
const async = require('async');
const requestJson = require('request-json');
const API = require('./api');
const utils = require('../lib/utils');
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

    updateRank(req, cb) {
        if (req.session.user && req.session.user.permissions) {
            let user = _.cloneDeep(req.session.user);
            let rank = -1;
            rank = _.max(_.values(utils.permissions).map((v) => {
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
