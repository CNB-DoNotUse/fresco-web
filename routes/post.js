const express = require('express');
const utils = require('../lib/utils');
const config = require('../lib/config');
const API = require('../lib/api');
const router = express.Router();

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

        verifier = post.curator ? post.curator.full_name : '';

        res.render('app', {
            props: JSON.stringify({
                gallery,
                post,
                title,
                verifier,
                user: req.session.user,
            }),
            alerts: req.alerts,
            page: 'postDetail',
        });
    }).catch(error => {
        next({
            message: error.status === 404 ? 'Post not found!' : 'Unable to load post!',
            status: error.status,
            stack: error.stack
        });
    });
});

module.exports = router;
