var config = require('./config'),
  API = require('./api');

var Story = {
  create: function(req, params, callback) {
    var createOptions = {
      req,
      url: '/story/create',
      body: params,
      method: 'POST',
      files: null
    }
    API.request(createOptions, (err, response) => {
      callback(err, response ? JSON.parse(response.text) : null);
    });
  }
}

module.exports = Story;
