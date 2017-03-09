const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/user');
const oauthLib = require('../../lib/user');
const API = require('../../lib/api');

/**
 * Processes oauth request
 */
router.post('/',(req, res, next) => {
    const { username, password } = req.body;

    

});



module.exports = router;
