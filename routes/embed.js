require('babel-core/register');

var fs                = require('fs'),
    express           = require('express'),
    config            = require('../lib/config'),
    Purchases         = require('../lib/purchases'),
    head              = require('../lib/head'),
    global            = require('../lib/global'),
    React             = require('react'),
    ReactDOMServer    = require('react-dom/server'),
    request           = require('request'),
    embed             = require('../app/views/embed.js'),
    router            = express.Router();

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
            var err = new Error('Embed not found!');
            err.status = 404;
            return next(err);
        }

        var props = {
                gallery: body.data,
                userAgent: req.headers['user-agent'],
                cycle: req.query.cycle,
                start: req.query.start
            },
            element = React.createElement(embed, props),
            react = ReactDOMServer.renderToString(element);

        res.render('embed', {
            page: 'embed',
            react: react,
            props: JSON.stringify(props)
        });
    });
});

module.exports = router;