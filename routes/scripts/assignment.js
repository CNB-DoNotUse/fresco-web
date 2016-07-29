const express = require('express');
const config = require('../../lib/config');
const utils = require('../../lib/utils');
const API = require('../../lib/api');
const router = express.Router();
const csv = require('../../lib/csv');

/**
 * Retrieves assignment report
 */
router.get('/report', (req, res, next) => {
    API.request({
        method: 'GET',
        url: `/assignment${req.path}`,
        token: req.session.token
    })
    .then(response => csv.middleware(response, res, next))
    .catch((error) => {
        return next({
            message: 'Could not download report!',
            status: 500
        });
    });
});

module.exports = router;