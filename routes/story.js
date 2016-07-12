const express = require('express');
const config = require('../lib/config');
const api = require('../lib/api');
const request = require('request');
const router = express.Router();

/**
 * Description : Story Specific Routes ~ prefix /story/endpoint
 */
router.get('/:id', (req, res, next) => {
    api.request({
        token: req.session.token,
        url: '/story/' + req.params.id,
    }).then(response => {
        const props = {
            story: response.body,
            user: req.session.user
        };

        res.render('app', {
            props: JSON.stringify(props),
            config: config,
            alerts: req.alerts,
            page: 'storyDetail',
            title : 'Story'
        });
    });
});

module.exports = router;
