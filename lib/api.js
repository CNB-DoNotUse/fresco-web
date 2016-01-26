var config  = require('./config'),
    fs      = require('fs'),
    request = require('superagent');

var API = {

  /**
   * Express middleware, sends requests directly to the api, and sends response to the client
   * @param  {Request} req Express request object
   * @param  {Response} res Express response object
   */
  proxy: (req, res) => {
    API.request({req}, (err, response) => {
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

  /**
   * Send a request to the api. The options object is as follows
   * options
   * 	- req     {Request} The request to base the api call off of
   * 	- url     {string}  The url to call
   * 	- body    {object}  The payload to send (if applicable)
   * 	- method  {string}  The http verb to use
   * 	- files   {object}  An associative map of files, like multer gives
   * 	- token   {string}  The api authtoken to use
   *
   * Either the req field must be set, or all the other fields must be set.
   * Setting the fields manually overrides the req fields
   *
   * NOTE: When files are sent, the files are automatically deleted
   *
   * @param  {object}   options  Request options
   * @param  {Function} callback Function to call when the request is completed
   */
  request: (options, callback) => {
    if (options.req) {
      options.token = options.token || options.req.session.user ? options.req.session.user.token ? options.req.session.user.token : '' : '';
      options.url = options.url || options.req.url;
      options.body = options.body || options.req.body;
      options.method = options.method || options.req.method;
      options.files = options.files || options.req.files;
    }

    var message = request(options.method, config.API_URL + '/' + config.API_VERSION + options.url)
      .set('authtoken', options.token || '');

    // Checks to see if there are any files to upload
    if (options.method == 'POST' && Object.keys(options.files || {}).length > 0) {
      var i = 0;
      var cleanupFiles = [];
      for (index in options.files) {
        cleanupFiles.push(options.files[index].path);
        message.attach(i, options.files[index].path);
        i++;
      }

      for (index in options.body) {
        message.field(index, options.body[index]);
      }

      message.end((err, response) => {
        // Only delete files if they sent successfully
        if (!err) {
          for (var index in cleanupFiles) {
            fs.unlink(cleanupFiles[index]);
          }
        }

        callback(err, response);
      });
    }
    else {
        message.send(options.body)
          .end(callback);
    }
  }
}

module.exports = API;
