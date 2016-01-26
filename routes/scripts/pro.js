var express         = require('express'),
    requestJson     = require('request-json'),
    superagent      = require('superagent'),
    config          = require('../../lib/config'),
    validator       = require('validator'),
    router          = express.Router(),
    xml2js          = require("xml2js").parseString,
    mandrill        = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(config.MANDRILL);

/**
 * Adds a pro user as a lead into zoho
 */

router.post('/pro/signup', (req, res, next) => {
    var params = {
            firstname : req.body.firstname,
            lastname  : req.body.lastname,
            zip       : req.body.zip,
            phone     : req.body.phone,
            email     : req.body.email,
            time      : req.body.time
        };

    /*
    Check fields
     */
    if(!params.firstname || !params.lastname || !params.time){
        return res.json({
            err: 'ERR_INVALID_PARAMETERS',
            success: false
        }).end();
    } else if(!validator.isNumeric(params.phone)){
        return res.json({
            err: 'ERR_INVALID_PHONE',
            success: false
        }).end();
    } else if(!validator.isEmail(params.email)){
        return res.json({
            err: 'ERR_INVALID_EMAIL',
            data: {}
        }).end();
    } else if(!validator.isNumeric(params.zip)){
        return res.json({
            err: 'ERR_INVALID_ZIP',
            success: false
        }).end();
    }

    //Make the XML Data
    var proUser = 
        '<CustomModule1>' +
            '<row no="1">' +
                '<FL val="CustomModule1 Name">'+ params.firstname + ' ' + params.lastname + '</FL>' +
                '<FL val="First Name">' + params.firstname + '</FL>' +
                '<FL val="Last Name">' + params.lastname + '</FL>' +
                '<FL val="Email">' + params.email + '</FL>' +
                '<FL val="Zip Code">' + params.zip + '</FL>' +
                '<FL val="Phone Number">' + params.phone + '</FL>' +
                '<FL val="Best Time To Call">' + params.time + '</FL>' +
            '</row>' +
        '</CustomModule1>';

    //Send request to ZOHO
    superagent
    .post(config.ZOHO.CREATE_LEAD + '&xmlData=' + proUser)
    .end((err, response) => {

        //Response comes back as XML, we `indexOf` for the success message inside
        if(err || response.text.indexOf('Record(s) added successfully') == -1) {
             return res.json({
                err: 'ERR_FAILED',
                success: false
            }).end();
        } else{

            var rowId;

            xml2js(response.text, function (err, result) {
                var field = result.response.result[0].recorddetail[0]['FL'][0];
                
                //Check if field key is correct
                if(field['$']['val'] == 'Id'){
                    rowId = field['_'];
                }

                //Respond with row id after parsing
                return res.json({
                    err: null,
                    success: true,
                    rowId: rowId
                }).end();

                sendEmail(params, (success) => {

                });
            });

        }
    });
});

/**
 * Sends response email to the pro user
 */

function sendEmail(params, callback) {
    mandrill_client.messages.sendTemplate({
        template_name: 'notification-prouser-signup',
        template_content: [
            {
                name: 'name',
                content: params.firstname + ' ' + params.lastname
            },
            {
                name: 'zip',
                content: params.zip
            },
            {
                name: 'email',
                content: params.email
            },
            {
                name: 'phone',
                content: params.zip
            },
            {
                name: 'time',
                content: params.time
            }
        ],
        message: {
            from_email: "donotreply@fresconews.com",
            from_name: 'Fresco News',
            to: [{
                email: params.email
            }]
        }
    }, (response) => {
        var response = response[0];

        //Callback for success or failure
        if(response.status === 'sent')
            callback(true)
        else
            callback(false);
    });
}

/**
 * Updates a pro user on zoho
 */

router.post('/pro/update', (req, res, next) => { 
    var params = {
            day     : req.body.day,
            morning : req.body.morning == 'true', //BOOL gets converted to a string afterwards :(
            evening : req.body.evening == 'true',
            id      : req.body.id,
            time    : ''
        };

    if(params.morning && params.evening)
        params.time = config.PRO.MORNING + ' and ' + config.PRO.EVENING;
    else if(params.morning)
        params.time = config.PRO.MORNING
    else if(params.evening)
        params.time = config.PRO.EVENING
    else 
        params.time = 'None';

    if(!params.day || !params.time || !params.id){
        return res.json({
            err: 'ERR_INVALID_PARAMETERS',
            success: false
        }).end();
    }

    //Make the XML Data
    var proUser = 
        '<CustomModule1>' +
            '<row no="1">' +
                '<FL val="'+ params.day +'">' + params.time + '</FL>' +
            '</row>' +
        '</CustomModule1>';

    //Send request to ZOHO
    superagent
    .post(config.ZOHO.UPDATE_LEAD + '&id=' + params.id + '&xmlData=' + proUser)
    .end((err, response) => {
        //Response comes back as XML, we `indexOf` for the success message inside
        if(err || response.text.indexOf('Record(s) updated successfully') == -1) {
             return res.json({
                err: 'ERR_FAILED',
                success: false
            }).end();
        } else{
            return res.json({
                err: null,
                success: true
            }).end();
        }
    });

});

module.exports = router;