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

    Description : Embed route

// **/

/**
 * Embed Detail Page
 * @param Gallery ID
 */

router.get('/:id', (req, res, next) => {
    if(!req.params.id) {
        return res.redirect('/');
    }

    request({
        url: config.API_URL + "/v1/gallery/get?id=" + req.params.id,
        json: true
    }, (err, response, body) => {
        //Check for error, 404 if true
        if (err || !body || body.err) {
            var err = new Error('Gallery not found!');
            err.status = 404;
            return next(err);
        }

        // element = React.createElement(PublicGallery, props),
        // react = ReactDOMServer.renderToString(element);
        // 
        //

        var props = {
                gallery: body.data,
                userAgent: req.headers['user-agent'],
                cycle: req.query.cycle,
                start: req.query.start
            };

        res.render('embed', {
            page: 'embed',
            props: JSON.stringify(props)
        });
    });
});

module.exports = router;