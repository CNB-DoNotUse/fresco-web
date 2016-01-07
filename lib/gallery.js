var config = require('./config'),
	request = require('request-json').createClient(config.API_URL);
	
var Gallery = {
	get: function (id, callback) {
		request.get('/v1/gallery/get?id=' + id, function (err, res, body) {
			if (err) return callback(err, null);
			if(body.err) return callback(body.err, null);
			return callback(null, body.data);
		});
	},
	getStories: function (id, callback) {
		request.get('/v1/story/getFromGallery?gallery_id=' + id, function (err, res, body) {
			if (err) return callback(err, null);
			if(body.err) return callback(body.err, null);
			return callback(null, body.data);
		});
	}
}

module.exports = Gallery;