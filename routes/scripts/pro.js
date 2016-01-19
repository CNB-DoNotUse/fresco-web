var express = require('express'),
    requestJson = require('request-json'),
    request = require('superagent'),
    config = require('../../lib/config'),
    validator = require('validator'),
    router = express.Router();


/**
 * Adds a pro user as a lead into zoho
 */

router.post('/pro/signup', function(req, res, next) {

    

});

module.exports = router;