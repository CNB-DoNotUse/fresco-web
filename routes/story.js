const express = require('express');
const config = require('../lib/config');
const api = require('../lib/api');
const request = require('request');
const router = express.Router();
const helper = require('../lib/helpers');

/**
 * Description : Story Specific Routes ~ prefix /story/endpoint
 */

router.get('/:id', (req, res, next) => {
    api.request({
        token: req.session.token.token,
        url: `/story/${req.params.id}/?expand[]=owner`,
        method: "GET",
    }).then(response => {
        const props = {
            story: JSON.parse(response.text),
            user: helper.userAdminRoles(req.session.user)
        };
        res.render('app', {
            props: JSON.stringify(props),
            config: config,
            alerts: req.alerts,
            referral: req.session.referral,
            page: 'storyDetail',
            title : 'Story'
        });
    }).catch( (err) => {

        console.log("err: " + JSON.stringify(err));
        next({
            message: error.status === 404 ? 'Story not found!' : 'Unable to load story!',
            status: error.status,
            stack: error.stack
        });
    })
});

module.exports = router;
