var express       = require('express'),
    config        = require('../../lib/config'),
    superagent    = require('superagent'),
    router        = express.Router(),
    nodemailer    = require('nodemailer'),
    redis         = require('redis'),
    zendesk = require('node-zendesk'),
    RedisStore    = require('connect-redis'),
    validator     = require('validator');

var CONTACT_PREFIX = 'CONTACT_FORM_IP_';

// If in dev mode, use local redis server as session store
var rClient = redis.createClient(6379, config.REDIS.SESSIONS, { enable_offline_queue: false });
var redisConnection = { client: rClient };

/**
 * Reset password endpoint
 * Takes an email in the body
 */

router.post('/contact', (req, res, next) => {

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    rClient.get(CONTACT_PREFIX + ip, (err, reply) => {

        if(!reply){

            return sendMessage(ip, req, res);

        } else{

            var previousTimestamep = reply,
                currentTimestamp = new Date().getTime();

            //Check to make sure it's been 5 seconds between requests
            if(currentTimestamp - previousTimestamep > 5000){
                return sendMessage(ip, req, res);
            }
            else{
                return res.json({
                    err: 'ERR_CONTACT_FAILED'
                });
            }
        }
    });

    return;
});

function sendMessage(ip, req, res){
    if(!req.body.from || !req.body.name || !req.body.message || !req.body.inquiryType){
        return res.json({
            err: 'ERR_CONTACT_PARAMS'
        });
    }

    //Validate fields
    if(!validator.isEmail(req.body.from)){
        return res.json({
            err: 'ERR_CONTACT_EMAIL'
        });
    } else if(req.body.message.length > 500){
        return res.json({
            err: 'ERR_CONTACT_LENGTH'
        });
    }

    var client = zendesk.createClient({
      username:  'elmir@fresconews.com',
      token:     'P16GkstwMdW3oaQOmmim2f7mbuU7aKVO0QLclOnX',
      remoteUri: 'https://fresco.zendesk.com/api/v2'
    });

    var subject = req.body.inquiryType + ' Inquiry from ' + req.body.name,
        name = req.body.name,
        message = req.body.message,
        ticket = {
            "ticket": {
                "subject": subject, 
                "requester" : {
                    "name" : name,
                    "email" : req.body.from
                },
                "comment": { 
                    "body":  message
                }
            }
         };

    client.tickets.create(ticket,  (err, req, result) => {
        //Save IP to redis now that we're sending
        rClient.set(CONTACT_PREFIX + ip, new Date().getTime());

        if(err){
            return res.json({
                err: 'ERR_CONTACT_FAILED'
            });
        } else{
            //Return success
            return res.json({
                err: null
            });
        }
    });
}

module.exports = router;