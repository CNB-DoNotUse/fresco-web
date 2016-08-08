const config = require('./config');
const fs = require('fs');
const superagent = require('superagent');
const Promise = require('bluebird');
const has = require('lodash/has');

/**
 * API Middleware case used to interface with our API in the webserver
 * @description All API requests should be made through this class to have consistency
 */
const API = {

    /**
     * Express middleware, sends requests directly to the api, and sends response to the client
     * @param {Request} req Express request object
     * @param {Response} res Express response object
     * @param {Function} callback Optional callback one can override
     */
    proxy: (req, res, cb) => {
        let callback = cb;

        // Check if there is no callback, or it is from middlewhere i.e. it has `next` as the function name
        // And set a callback to send back the body
        if (!cb || cb.name === 'next') {
            // Error check callsback with body of request
            callback = (response) => (res.send(response.body));
        }

        // Send request
        API.request({ req, res })
        .then(callback)
        .catch((error) => (
            res
            .status(error.status || 500)
            .send(error.response ? error.response.body : error)
        ));
    },

    /**
     * Send a request to the api. The options object is as follows options
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
     * @param  {object}  options  Request options
     */
    request: (options) => {
        return new Promise((resolve, reject) => {
            const end = (error, response) => {
                if(error) {
                    if(error.code === 'ECONNREFUSED' || !error.response) {
                        reject({type: 'Failed to connect to the API', status: 503});
                    } else {
                        if(!error.response.body.error) {
                            reject({
                                type: 'No API error sent',
                                status: error.status
                            })
                        } else {
                            reject(error.response.body.error);
                        }
                    }                  
                } else {
                    //Send back regular response
                    resolve(response);
                }
            }

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

            let request = superagent(options.method || 'GET',
                                     config.API_URL + '/' + config.API_VERSION + options.url);

            //Set Authorization Header
            if(options.token === '' || typeof(options.token) == 'undefined') {
                request.set('Authorization', 'Basic ' + config.API_TOKEN);
            } else {
                request.set('Authorization', 'Bearer ' + options.token)
            }

            // Checks to see if there are any files to upload
            if (options.method == 'POST' && Object.keys(options.files || {}).length > 0) {
                let cleanupFiles = [];

                //Attach files
                for(file of options.files) {
                    cleanupFiles.push(file.path);
                    request.attach(file.fieldname, file.path);
                }

                for (index in options.body) {
                    request.field(index, options.body[index]);
                }

                //Override end function to delete files when finished
                request.end((err, response) => {
                    // Only delete files if they sent successfully
                    if (!err) {
                        for (let index in cleanupFiles) {
                            fs.unlink(cleanupFiles[index]);
                        }
                    }

                    end(err, response);
                });
            } else {
                //Send reuqest normally without files
                request.send(options.body).end(end);
            }
        });
    },

    /**
     * Handles API error through `res`
     */
    handleError(error, res) {
        return res.status(error.status).json({
            error: error.type,
            msg: error.msg,
            code: error.status,
            stack: error.stack
        });
    },

    /**
     * Resets TTL on user
     * @description This exists so if a client-side interaction is made that requires us to fetch
     * an updated version of the user the next time we load a page, the web-server will know
     * to do it, because the TTL on the user is no longer valid
     */
    ttl(req, res, next) {
        req.session.user.TTL = null;
        req.session.save(() => {
            API.proxy(req, res, next);
        });
    }
};

module.exports = API;
