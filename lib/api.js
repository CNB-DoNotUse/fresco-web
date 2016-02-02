var config     = require('./config'),
    fs         = require('fs'),
    superagent = require('superagent');

var API = {

  /**
   * Express middleware, sends requests directly to the api, and sends response to the client
   * @param  {Request} req Express request object
   * @param  {Response} res Express response object
   */
  proxy: (req, res) => {
    API.proxyRaw(req, res, (data) => {
      return res.send(data);
    });
  },

  /**
   * Convienence method for automatic error handling. Callback is only called
   * when no error has occured, otherwise appropriate response is sent to the
   * client
   * @param  {Request}  req      Express request object
   * @param  {Response} res      Express response object
   * @param  {Function} callback Function(data) to call when request completed successfully
   */
  proxyRaw: (req, res, callback) => {
    if(!callback) callback = () => {};
    API.request({req}, (err, response) => {
      API.utils.checkErrors(res, err, response, callback);
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
   * @param  {Function} callback Function(err, response) to call when the request is completed
   */
  request: (options, callback) => {
    if (options.req) {
      options.token = options.token || options.req.session.user ? options.req.session.user.token ? options.req.session.user.token : '' : '';
      options.url = options.url || options.req.url;
      options.body = options.body || options.req.body;
      options.method = options.method || options.req.method;
      options.files = options.files || options.req.files;
    }

    var end = (err, response) => {

      if (options.res) {
        return API.utils.checkErrors(options.res, err, response, callback);
      }
      
      callback(err, response);

    }

    var request = superagent(options.method || 'GET', config.API_URL + '/' + config.API_VERSION + options.url)
                  .set('authtoken', options.token || '');

    // Checks to see if there are any files to upload
    if (options.method == 'POST' && Object.keys(options.files || {}).length > 0) {
      var cleanupFiles = [];
      
      for (index in options.files) {
        cleanupFiles.push(options.files[index].path);
        request.attach(options.files[index].fieldname, options.files[index].path);
      }

      for (index in options.body) {
        request.field(index, options.body[index]);
      }

      request.end((err, response) => {
        // Only delete files if they sent successfully
        if (!err) {
          for (var index in cleanupFiles) {
            fs.unlink(cleanupFiles[index]);
          }
        }

        end(err, response);
      });
    }
    else {
        request.send(options.body)
               .end(end);
    }
  },

  utils: {
    checkErrors: (res, err, response, callback) => {
      if(err) {

        if (config.DEV) {
            console.log('API Error: ', response.text);
        }
        switch (err.status) {
            case 401:
                return res.status(401).json({err: 'ERR_UNAUTHORIZED'})
                break;
            case 403:
                return res.status(403).json({err: 'ERR_FORBIDDEN'})
                break;
            case 404:
                return res.status(404).json({err: 'ERR_NOT_FOUND'})
                break;
            default:
                return res.json({err: 'API Error'});
        }
      }

      var data = '';

      try {
        data = JSON.parse(response.text);
      } catch (ex) {
        return res.send({err: 'API Parse Error'});
      }

      return callback(data);
    }
  }
}

module.exports = API;
