const express = require('express');
const utils = require('../lib/utils');
const config = require('../lib/config');
const API = require('../lib/api');
const router = express.Router();
const helper = require('../lib/helpers');

/**
 * Description : Post Specific Routes ~ prefix /gallery/~
 * Post Detail Page
 * @param Post ID
 */
router.get('/:id', (req, res, next) => {
    let post;
    let gallery;
    let title = '';
    let verifier;

    // Make request for post
    API.request({
        url: `/post/${req.params.id}`,
        token: req.session.token.token
    })
    .then(response => {
        post = response.body || {};
        return API.request({
            url: `/gallery/${response.body.parent_id}`,
            token: req.session.token.token
        });
    })
    .then(response => {
        gallery = response.body || {};
        title = utils.getBylineFromPost(post, true);

        res.render('app', {
            props: JSON.stringify({
                gallery,
                post,
                title,
                user: helper.userAdminRoles(req.session.user),
            }),
            title,
            og: {
                title,
                image: utils.formatImg(post.image, 'large'),
                url: req.originalUrl,
                description: gallery.caption,
            },
            twitter: {
                title,
                description: gallery.caption,
                image: utils.formatImg(post.image, 'large'),
            },
            alerts: req.alerts,
            referral: req.session.referral,
            page: 'postDetail'
        });
    })
    .catch(error => {
        console.log('post Error: ' + JSON.stringify(error));
        let message = 'Unable to load post!';

        if(error.status === 404)
            message = 'Post not found!';
        else if(error.msg !== '')
            message = error.msg;

        next({
            message,
            status: error.status,
            stack: error.stack
        });
    });
});

module.exports = router;
