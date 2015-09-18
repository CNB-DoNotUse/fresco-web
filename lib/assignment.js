var config = require('./config'),
	request = require('request-json').createClient(config.API_URL);

var Assignment = {
	get: function(id, callback){
		request.get('/v1/assignment/get?id=' + id, function(err, res, body){
			if (err) return callback(err, null);
			if(body.err) return callback(body.err, body.data);
			return callback(null, body.data);
		});
	}
};

module.exports = Assignment;