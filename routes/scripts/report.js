const express = require('express');
const config = require('../../lib/config');
const utils = require('../../lib/utils');
const API = require('../../lib/api');
const csv = require('../../middleware/csv');
const router = express.Router();

/**
 * Retrieves report request to generate CSV
 * @description Uses CSV middleware to interpret API response and respond with CSV
 * @param {string} u The url on the API to hit
 * @param {string} e The error to display on failure to download
 */
router.get('/', (req, res, next) => {
    API.request({
        method: 'GET',
        url: req.query.u,
        token: req.session.token
    })
    .then(response => csv.middleware(response, res, next))
    .catch((error) => {
        return next({
            message: req.query.e || 'Could not download report!',
            status: 500
        });
    });
});


module.exports = router;