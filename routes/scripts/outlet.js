const express = require('express');
const config = require('../../lib/config');
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


router.get('/export/email', (req, res) => {
    if (!checkOutlet(req, res)) return;

    req.url = '/outlet/export/email?id=' + req.session.user.outlet.id;
    API.proxy(req, res);
});

router.post('/invite/accept', function(req, res, next) {

});



router.post('/payment/create', (req, res) => {

});

module.exports = router;
