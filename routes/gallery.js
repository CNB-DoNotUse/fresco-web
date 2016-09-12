require('babel-core/register');
const express = require('express');
const router = express.Router();
const utils = require('../lib/utils');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const PublicGallery = require('../app/platform/views/publicGallery.js');
const API = require('../lib/api');

/**
 * Gallery page, passed a unique gallery id
 */
router.get('/:id', (req, res, next) => {
    API.request({
        token: req.session.token,
        url: `/gallery/${req.params.id}`
    }).then(response => {
        render(response.body, req.session.user, req, res);
    }).catch(error => {
        next({
            message: error.status === 404 ? 'Gallery not found!' : 'Unable to load gallery!',
            status: error.status,
            stack: error.stack
        });
    });
});


/**
 * Renders gallery from route
 */
function render(gallery, user, req, res) {
    const title = utils.getTitleFromGallery(gallery);

    // User is logged in, show full gallery page
    if (user) {
        const props = { gallery, title, user };

        res.locals.section = 'platform';
        res.render('app', {
            title,
            alerts: req.alerts,
            page: 'galleryDetail',
            props: JSON.stringify(props),
        });
    } else {
        // User is not logged in, show public gallery page
        const props = {
            gallery,
            title,
            userAgent: req.headers['user-agent'],
        };
        const element = React.createElement(PublicGallery, props);
        const react = ReactDOMServer.renderToString(element);

        res.render('app', {
            title, gallery, react,
            og: {
                title,
                image: utils.formatImg(gallery.posts[0].image, 'large'),
                url: req.originalUrl,
                description: gallery.caption,
            },
            twitter: {
                title,
                description: gallery.caption,
                image: utils.formatImg(gallery.posts[0].image, 'large'),
            },
            page: 'publicGallery',
            props: JSON.stringify(props),
        });
    }
}

module.exports = router;