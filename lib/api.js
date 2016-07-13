const config     = require('./config'),
      fs         = require('fs'),
      superagent = require('superagent'),
      Promise     = require("bluebird");

var API = {

    /**
    * Express middleware, sends requests directly to the api, and sends response to the client
    * @param  {Request} req Express request object
    * @param  {Response} res Express response object
    * @param {Function} callback Optional callback one can override
    */
    proxy: (req, res, callback) => {
        //Check if there is no callback, or it is from middlewhere i.e. it has `next` as the function name
        //And set a callback to send back the body
        if(!callback || callback.name == 'next'){
            //Error check callsback with body of request
            callback = (body) => {
                return res.send(body);
            }
        }

        // Send request
        API.request({ req, res })
        .then(response => callback(response.body))
        .catch(err => {
            res.status(err.status).send(err);
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
    */
    request: (options) => {
        return new Promise((resolve, reject) => {
            const end = (error, response) => {
                if (error) reject(error);
                else resolve(response);
            };

            if (options.req) {
                options.url = options.url || options.req.url;
                options.body = options.body || options.req.body;
                options.method = options.method || options.req.method;
                options.files = options.files || options.req.files;

                if(!options.token && options.req.session.user !== null && options.req.session.token !== '')
                    options.token = options.req.session.token
                else
                    options.token = '';
            }

            var request = superagent(options.method || 'GET',
                                     config.API_URL + '/' + config.API_VERSION + options.url);

            //Set Authorization Header
            if(options.token === '' || typeof(options.token) == 'undefined') {
                request.set('Authorization', 'Basic ' + config.API_TOKEN);
            } else {
                request.set('Authorization', 'Bearer ' + options.token)
            }

            // Checks to see if there are any files to upload
            if (options.method == 'POST' && Object.keys(options.files || {}).length > 0) {
                var cleanupFiles = [];

                for (index in options.files) {
                    cleanupFiles.push(options.files[index].path);
                    request.attach(options.files[index].filename, options.files[index].path);
                }

                for (index in options.body) {
                    request.field(index, options.body[index]);
                }

                //Override end function to delete files when finished
                request.end((err, response) => {
                    // Only delete files if they sent successfully
                    if (!err) {
                        for (var index in cleanupFiles) {
                            fs.unlink(cleanupFiles[index]);
                        }
                    }

                    end(err, response);
                });
            } else {  // Send reuqest normally without files
                request.send(options.body).end(end);
            }
        });
    },
};

module.exports = API;
