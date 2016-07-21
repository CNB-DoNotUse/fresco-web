const express = require('express');
const config = require('../../lib/config');
const utils = require('../../lib/utils');
const API = require('../../lib/api');
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
        csv(response.body)
        .then((csv) => {
            res.set('Content-Type', 'text/csv');
            res.set('Content-Disposition', 'inline; filename="assignments.csv"');
            res.send(csv).end();
        })
        .catch((error) => {
            return next({ message: error, status: 500 });
        });
    })
    .catch((error) => {
        return next({
            message: 'Could not download report!',
            status: 500
        });
    });
});

module.exports = router;