const express = require('express');
const config = require('../../lib/config');
const utils = require('../../lib/utils');
const API = require('../../lib/api');
const xlsx = require('node-xlsx');
const router = express.Router();
const csv = require('../../lib/csv');

/**
 * Retrieves assignment report
 */
router.get('/assignment/report', (req, res, next) => {
    API.request({
        method: 'GET',
        url: '/assignment/report',
        token: req.session.token
    }).then((response) => {
        csv(response.body, (err, csv) => {
            if(err) {
                return next({ message: err, status: 500 });
            }

            res.set('Content-Type', 'text/csv');
            res.set('Content-Disposition', 'inline; filename="assignments.csv"');
            res.send(csv).end();
        });
    })
    .catch((error) => {
        return next({
            message: 'Could not download report!',
            status: 500
        });
    });
});
//---------------------------^^^-ASSIGNMENT-ENDPOINTS-^^^---------------------------//

module.exports = router;
