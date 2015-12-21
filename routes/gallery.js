require('babel-core/register');

var fs                = require('fs'),
    express           = require('express'),
    config            = require('../lib/config'),
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
  }, doWithGalleryGetStories);

  function doWithGalleryGetStories(err, response, body) {

    //Check for error, 404 if true
    if (err || !body || body.err) {

      var err = new Error('Gallery not found!');
      err.status = 404;
      return next(err);

    }

    var gallery = body.data;

    var title = '';

    if (gallery.owner)
      title += 'Gallery by ' + gallery.owner.firstname + ' ' + gallery.owner.lastname;
    else if(gallery.curator)
      title += 'Imported by ' + gallery.curator.firstname + ' ' + gallery.curator.lastname;

    //User is logged in, show full gallery page
    if (req.session && req.session.user) {

      var props = {
            user: req.session.user,
            purchases: config.mapPurchases(),
            gallery: gallery,
            title: title
          };

      res.render('app', {
        title: title,
        alerts: req.alerts,
        page: 'galleryDetail',
        props: JSON.stringify(props)
      });

    }
    //User is not logged in, show public gallery page
    else {

      res.locals.section = 'public';
      
      var props = {
            gallery: gallery,
            title: title
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
        page: 'publicGallery',
        props: JSON.stringify(props)
      });
    
    }

  }

});

module.exports = router;
