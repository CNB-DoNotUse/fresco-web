const config = require('./config');
const API = require('./api');
const utils = require('../lib/utils');
const _ = require('lodash');

const User = {
    /**
     * Refreshes a user's session with new data
     */
    refresh(req, res, next) {
        API.request({
            url: '/user/me',
            token: req.session.token,
            method: 'GET',
        })
        .then((response) => {
            if (!response || !response.body || !response.body.id) throw new Error();
            const user = response.body;
            const now = Date.now();
            // Configure new session config for user
            req.session.token = req.session.user && req.session.token ? req.session.token : null;
            req.session.user = user;
            req.session.user.TTL = now + config.SESSION_REFRESH_MS;

            req.session.save(() => {
                next();
            });
        })
        .catch(() => {
            delete req.session.user;

            return req.session.save(() => {
                res.redirect('/');
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
