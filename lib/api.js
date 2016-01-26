var config  = require('./config');
    request = require('superagent');

var API = {
  proxy: (req, res) => {
    var options = {
      req,
      url: req.url,
      body: req.body,
      method: req.method
    }

    API.request(options, (err, response) => {
      if(err) {
        return res.json({err: 'API Error'});
      }

      var data = '';

      try {
        data = JSON.parse(response.text);
      } catch (ex) {
        return res.send({err: 'API Parse Error'});
      }

      return res.send(data);
    });
  },

  request: (options, callback) => {
    if (options.req) {
      options.token = options.token || options.req.session.user ? options.req.session.user.token ? options.req.session.user.token : '' : '';
      options.url = options.url || req.url;
      options.body = options.body || req.body;
      options.method = options.method || req.method;
    }

    request(options.method, config.API_URL + '/' + config.API_VERSION + options.url)
      .set('authtoken', options.token || '')
      .send(options.body)
      .end(callback);
  }
}

module.exports = API;
