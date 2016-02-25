var config = require('./config'),
	API = require('./api'),
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
	},
	update: function(req, params, callback) {
		var updateOptions = {
			req,
			url: '/gallery/update',
			body: params,
			method: 'POST',
			files: null
		}
		API.request(updateOptions, (err, response) => {
			if (err) {
				callback(err, null);
			}
			else if (response.statusCode !== 200) {
				callback(response.text, null);
			}
			else {
				callback(err, response ? JSON.parse(response.text) : null);
			}
		})
	}
}

module.exports = Gallery;
