require('babel-core/register');

var fs                = require('fs'),
    express           = require('express'),
    config            = require('../lib/config'),
    Purchases         = require('../lib/purchases'),
    head              = require('../lib/head'),
    router            = express.Router(),
    global            = require('../lib/global'),
    React             = require('react'),
    ReactDOMServer    = require('react-dom/server'),
    request           = require('request'),
    PublicGallery     = require('../app/views/publicGallery.js'),
    api               = require('../lib/api');

/** //

	Description : Gallery Specific Routes -- prefix /gallery/~

// **/

/**
 * Gallery Detail Page
 * @param Gallery ID
 */

function render(gallery, user, req, res) {
    var title = 'Gallery';

    if(gallery.posts && gallery.posts[0].location && gallery.posts[0].location.address) {
        title += ' from ' + gallery.posts[0].location.address;
    }

    //User is logged in, show full gallery page
    if (user) {
        var props = {
            gallery, title, user,
            purchases: Purchases.mapPurchases(req.session)
        };

        res.locals.section = 'platform';
        res.render('app', {
            title,
            alerts: req.alerts,
            page: 'galleryDetail',
            props: JSON.stringify(props)
        });

    } else { //User is not logged in, show public gallery page
        var props = {
            gallery, title,
            userAgent: req.headers['user-agent']
        };
        var element = React.createElement(PublicGallery, props);
        var react = ReactDOMServer.renderToString(element);

        res.render('app', {
            title, gallery, react,
            og: {
                title,
                image: global.formatImg(gallery.posts[0].image, 'large'),
                url: req.originalUrl,
                description: gallery.caption
            },
            twitter: {
                title,
                description: gallery.caption,
                image: global.formatImg(gallery.posts[0].image, 'large')
            },
            page: 'publicGallery',
            props: JSON.stringify(props)
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
