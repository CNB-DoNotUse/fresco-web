var express = require('express'),
    config = require('../../lib/config'),
    global = require('../../lib/global'),
    API = require('../../lib/api'),
    csv = require('../../lib/csv'),
    router = express.Router();
	
router.get('/assignment/stats', (req, res, next) => {
    API.request({
        method: 'GET',
        url: '/assignment/stats',
        token: 'c328b663-42f9-48e3-bff7-195d800329d5'
    }, (err, response) => {
        if(err) {
            return next({ 
                message: 'Error downloading stats!', 
                status: 500 
            });        
        }

        csv(response.body, (err, csv) => {
            if(err) {
                return next({ message: err, status: 500 });
            }

            res.set('Content-Type', 'text/csv');
            res.set('Content-Disposition', 'inline; filename="assignments.csv"');
            res.send(csv).end();
        });
    });
});

module.exports = router;