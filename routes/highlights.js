const express = require('express');
const router = express.Router();
const config = require('../lib/config');
const head  = require('../lib/head');

/**
 * Main highlights page
 */

router.get('/', (req, res, next) => {
    const title = 'Highlights';
    const props = {
        user : req.session.user,
        title: title
    };

    res.render('app', {
        alerts: req.alerts,
        referral: req.session.referral,
        page : 'highlights',
        title : title,
        props : JSON.stringify(props)
    });
});

module.exports = router;
