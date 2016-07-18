require('babel-core/register');

const express = require('express');
const router = express.Router();
const utils = require('../lib/utils');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const PublicGallery = require('../app/platform/views/publicGallery.js');
const api = require('../lib/api');

/** //

	Description : Gallery Specific Routes -- prefix /gallery/~

// **/

/**
 * Gallery Detail Page
 * @param Gallery ID
 */

function render(gallery, user, req, res) {
    let title = 'Gallery';

    if (gallery.posts && gallery.posts[0].location && gallery.posts[0].location.address) {
        title += ' from ' + gallery.posts[0].location.address;
    }

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

router.get('/:id', (req, res, next) => {
    let user;
    let token;
    if (req.session) {
        token = req.session.token;
        user = req.session.user;
    }

    api.request({
        token,
        url: '/gallery/' + req.params.id,
    }).then(response => {
        render(response.body, user, req, res);
    }).catch(() => (
        next({
            message: 'Gallery not found!',
            status: 404,
        })
    ));
});

module.exports = router;
