var express = require('express'),
    config = require('../lib/config'),
    router = express.Router(),
    request = require('request')

/** //

	Description : Gallery Specific Routes ~ prefix /gallery/~

// **/

/**
 * Gallery Detail Page
 * @param Gallery ID
 */

router.get('/:id', function(req, res, next) {

  request({
    url: config.API_URL + "/v1/gallery/get?stories=true&stats=1&id=" + req.params.id,
    json: true
  }, function(err, response, body) {

    //Check for error, 404 if true
    if (err || !body || body.err) {

      return res.render('error', {
        user: req.session.user,
        error_code: 404,
        error_message: config.ERR_PAGE_MESSAGES[404]
      });

    }

    var gallery = body.data;
 
    var title = '';

    if (gallery.owner)
      title += 'Gallery by ' + gallery.owner.firstname + ' ' + gallery.owner.lastname;
    else
      title += 'Imported by ' + gallery.curator.firstname + ' ' + gallery.curator.lastname;

    //User is logged in, show full gallery page
    if (req.session && req.session.user) {

      var purchases = null;

      if (req.session.user.outlet && req.session.user.outlet.verified) {
        purchases = req.session.user.outlet.purchases || [];
        purchases = purchases.map(function(purchase) {
          return purchase.post;
        });
      }

      var props = {
        user: req.session.user,
        purchases: purchases,
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

      res.render('public_gallery', {
        gallery: gallery,
        title: title,
        config: config,
        alerts: req.alerts,
        page: 'public_gallery'
      });

    }

  });

});

module.exports = router;
