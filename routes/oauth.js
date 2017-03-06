const express = require('express');
const utils = require('../lib/utils');
const API = require('../lib/api');
const router = express.Router();

/**
 * OAuth page
 */
router.get('/', (req, res, next) => {
    res.render('app', {
        title: 'OAuth',
        page: 'oauth',
        props: JSON.stringify({}),
    });
});

module.exports = router;
