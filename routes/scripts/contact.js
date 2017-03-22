const express       = require('express');
const superagent    = require('superagent');
const router        = express.Router();
const zendesk       = require('node-zendesk');
const validator     = require('validator');

const config = require('../../lib/config');
const redis = require('../../lib/redis');
const CONTACT_PREFIX = 'CONTACT_FORM_IP_';

/**
 * Reset password endpoint
 * Takes an email in the body
 */
router.post('/', (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    redis.get(CONTACT_PREFIX + ip, (err, reply) => {
        if(!reply){
            return sendMessage(ip, req, res);
        } else{
            const previousTimestamep = reply;
            const currentTimestamp = new Date().getTime();

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

    const client = zendesk.createClient({
        username:  'elmir@fresconews.com',
        token:     'P16GkstwMdW3oaQOmmim2f7mbuU7aKVO0QLclOnX',
        remoteUri: 'https://fresco.zendesk.com/api/v2'
    });

    const subject = req.body.inquiryType + ' Inquiry from ' + req.body.name;
    const name = req.body.name;
    const message = req.body.message;
    const ticket = {
        ticket: {
            subject,
            requester: {
                name,
                email : req.body.from
            },
            comment: { 
                body: message
            }
        }
    };

    //Save IP to redis now that we're sending
    redis.set(CONTACT_PREFIX + ip, new Date().getTime());
    
    client.tickets.create(ticket,  (err, req, result) => {

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