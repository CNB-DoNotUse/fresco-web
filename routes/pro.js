var express       = require('express'),
    router        = express.Router(),
    xml2js        = require("xml2js").parseString;
    config        = require('../lib/config'),
    routes        = require('../lib/routes'),
    head          = require('../lib/head'),
    superagent    = require('superagent');

/**
 * Pro User Page
 */
router.get('/', (req, res, next) => {

    //Check if Zoho record exists
    if(req.query.id) {

        //Assemble corresponding value for each day
        var dayValues = {
            'Sunday' : null,
            'Monday' : null,
            'Tuesday' : null,
            'Wednesday' : null,
            'Thursday' : null,
            'Friday' : null,
            'Saturday' : null
        },
        firstname = '',
        lastname = '';

        //Send request to ZOHO
        superagent
        .post(config.ZOHO.FETCH_LEAD + '&id=' + req.query.id)
        .end((err, response) => {
            xml2js(response.text, function (err, result) {
                //Redirect because there's an error in the xml
                if(result.response.error || !result.response.result) {
                    return res.redirect('/');
                } else {
                    //Grab fields from the messy zoho xml that is now js 
                    var fields = result.response.result[0].CustomModule1[0].row[0]['FL'];
                   
                    for (var i = 0; i < fields.length; i++) {
                        //Assemble key/val vars
                        var key = fields[i]["$"]["val"],
                            val = fields[i]['_'];
                        //Check if key exists
                        if(typeof(dayValues[key]) !== 'undefined'){
                            //Check if the zoho value is not set
                            if(val !== 'None' && val !== 'TBD'){
                                //Set corresponding key in object
                                dayValues[key] = {
                                    morning: val.indexOf(config.PRO.MORNING) > -1,
                                    evening: val.indexOf(config.PRO.EVENING) > -1,
                                }
                            }
                        } else if(key == 'First Name'){
                            firstname = val;
                        } else if(key == 'Last Name'){
                            lastname = val;
                        }
                    }
                }
                res.render('pro/pro', {
                    head: head,
                    page: 'pro',
                    dayValues: dayValues,
                    proId: req.query.id,
                    name : firstname + ' ' + lastname,
                    alerts: req.alerts
                });
            });
        });
    } else {
        res.render('pro/pro', {
            head: head,
            page: 'pro',
            proId: req.query.id,
            alerts: req.alerts
        });
    }

});

module.exports = router;
