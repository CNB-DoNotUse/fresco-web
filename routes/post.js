const express = require('express');
const utils = require('../lib/utils');
const config = require('../lib/config');
const api = require('../lib/api');
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

    const token = req.session.token;

    // Make request for post
    api.request({
        token,
        url: `/post/${req.params.id}`,
    }).then(response => {
        post = response.body || {};
        return api.request({
            token,
            url: `/gallery/${response.body.parent_id}`,
        });
    }).then(response => {
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
