var passport = require('passport'),
    util = require('util');

/*
    Custom passport strategy for authenticating based on a value in a request header.
    Basically a functional copy of passport-localapikey, except it pull the authtoken
    from a header, rather than the post body or query string
*/
function Strategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
        options.passReqToCallback = true;
    }
    if (!verify) throw new Error('local authentication strategy requires a verify function');
    
    this._authTokenField = options.authTokenField || 'authtoken';
    
    passport.Strategy.call(this);
    this.name = 'authtoken';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback;
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req, options) {
    options = options || {};
    var authToken = req.headers[this._authTokenField];
    
    if (!authToken) {
        //return this.success(null, null);
        return this.fail('Missing AuthToken');
    }
    
    var self = this;
    
    function verified(err, user, info) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(info); }
        self.success(user, info);
    }
        
    if (self._passReqToCallback) {
        this._verify(req, authToken, verified);
    } else {
        this._verify(authToken, verified);
    }
};

module.exports = Strategy;
