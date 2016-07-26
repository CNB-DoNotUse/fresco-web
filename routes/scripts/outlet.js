const express = require('express');
const requestJson = require('request-json');
const config = require('../../lib/config');
const async = require('async');
const querystring = require('querystring');
const xlsx = require('node-xlsx');
const User = require('../../lib/user');
const API = require('../../lib/api');
const router = express.Router();

/**
 * Make sure a user is signed in and is part of an outlet
 * @param  {Request}  req Express request object
 * @param  {Response} res Express response object
 * @return {boolean}      True if everything is kosher, false if not
 */
function checkOutlet(req, res) {
    if (!req.session.user || !req.session.user.outlet) {
        res.status(400).json({ err: 'ERR_INVALID_OUTLET' }).end();
        return false;
    }
    return true;
}

//---------------------------vvv-OUTLET-ENDPOINTS-vvv---------------------------//
router.post('/outlet/purchase', (req, res) => {
    if (!checkOutlet(req, res)) return;

    API.proxy(req, res);
});

router.get('/outlet/export', (req, res) => {
    if (!checkOutlet(req, res)) return;

    API.proxy(req, res, (body) => {
        var lines = body.data;
        if(req.query.format == 'xlsx'){
            var data = [['time', 'type', 'price', 'assignment', 'outlet', 'user', 'user id']];

            lines.forEach(function(line){
                var x = new Date(line.time),
                formattedTime = (x.getMonth() + 1) + '/' + x.getDate() + '/' + x.getFullYear();
                data.push([formattedTime, line.type, line.price.replace('$', ''), line.assignment, line.outlet, line.user, line.userid]);
            });

            res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.set('Content-Disposition', 'inline; filename="export.xlsx"')
            return res.send(xlsx.build([{name: 'Purchases', data: data}])).end();
        }
        else { //CSV
            var output = "time,type,price,assignment,outlet\r\n";

            lines.forEach(function(line){
                var x = new Date(line.time),
                formattedTime = (x.getMonth() + 1) + '/' + x.getDate() + '/' + x.getFullYear();
                output += formattedTime + ',' + line.type + ',' + line.price.replace('$', '') + ',' + line.assignment + ',' + line.outlet + ',' + line.user + ',' + line.userid + '\r\n';
            });

            res.set('Content-Type', 'text/csv');
            res.set('Content-Disposition', 'inline; filename="export.csv"')
            return res.send(output).end();
        }
    });
});

router.get('/outlet/export/email', (req, res) => {
    if (!checkOutlet(req, res)) return;

    req.url = '/outlet/export/email?id=' + req.session.user.outlet.id;
    API.proxy(req, res);
});

router.post('/outlet/invite/accept', function(req, res, next) {

});

router.post('/outlet/update', (req, res) => {

});

router.post('/outlet/payment/create', (req, res) => {

});

module.exports = router;