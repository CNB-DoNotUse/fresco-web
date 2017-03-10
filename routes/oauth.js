const express = require('express');
const utils = require('../lib/utils');
const API = require('../lib/api');
const router = express.Router();

/**
 * OAuth page
 */
router.get('/', (req, res, next) => {
    if(!req.query.client_id || !req.query.scope || !req.query.redirect_uri || !req.query.scope ) {
        return next({ message: 'Invalid OAuth URL!'});
    }

    const { client_id, redirect_uri, scope } = req.query;

    //Grab the client
    API.request({
        url: `/auth/authorize?client_id=${req.query.client_id}`
    })
    .then(response => {
        const props = {
            client_id,
            redirect_uri,
            scope,
            outlet: response.body.outlet,
            loggedIn: req.session.user !== null && typeof(req.session.user) !== 'undefined',
            hasGranted: false
        };

        res.render('app', {
            title: 'OAuth',
            page: 'oauth',
            props: JSON.stringify(props),
        });
    })  
    .catch(error => {
        return next({ message: 'Please check your OAuth parameters!' })
    })
});

module.exports = router;
