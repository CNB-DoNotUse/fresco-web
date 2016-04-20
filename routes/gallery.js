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
    PublicGallery     = require('../app/views/publicGallery.js');

/** //

	Description : Gallery Specific Routes -- prefix /gallery/~

// **/

/**
 * Gallery Detail Page
 * @param Gallery ID
 */

router.get('/:id', (req, res, next) => {
    request({
        url: config.API_URL + "/v1/gallery/get?stories=true&stats=1&id=" + req.params.id,
        json: true
    }, doWithGalleryGet);

    function doWithGalleryGet(err, response, body) {
        //Check for error, 404 if true
        if (err || !body || body.err) {
            return next({
                message: 'Galelry not found!',
                status : 404
            });
        }

        var gallery = body.data,
            title = 'Gallery';

        if(gallery.posts && gallery.posts[0].location && gallery.posts[0].location.address) {
            title += ' from ' + gallery.posts[0].location.address;
        }

        //User is logged in, show full gallery page
        if (req.session && req.session.user) {
            var props = {
                user: req.session.user,
                purchases: Purchases.mapPurchases(req.session),
                gallery: gallery,
                title: title
            };

            res.locals.section = 'platform';
            res.render('app', {
                title: title,
                alerts: req.alerts,
                page: 'galleryDetail',
                props: JSON.stringify(props)
            });

        } else { //User is not logged in, show public gallery page
            var props = {
                    gallery: gallery,
                    title: title,
                    userAgent: req.headers['user-agent']
                },
                element = React.createElement(PublicGallery, props),
                react = ReactDOMServer.renderToString(element);

            res.render('app', {
                title: title,
                gallery: gallery,
                react: react,
                og: {
                    title: title,
                    image: global.formatImg(gallery.posts[0].image, 'large'),
                    url: req.originalUrl,
                    description: gallery.caption
                },
                twitter:{
                    title: title,
                    description: gallery.caption,
                    image: global.formatImg(gallery.posts[0].image, 'large')
                },
                page: 'publicGallery',
                props: JSON.stringify(props)
            });
        }
    }
});

module.exports = router;
