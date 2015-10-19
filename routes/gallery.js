var express = require('express'),
    config = require('../lib/config'),
    router = express.Router(),
    archiver = require('archiver'),
    Gallery = require('../lib/gallery'),
    request = require('request'),
    async = require('async');

router.get('/:id', function(req, res, next){
  request(
    {
      url: config.API_URL + "/v1/gallery/get?stories=true&stats=1&id=" + req.params.id,
      json: true
    },
    function (err, response, body){
      if (err || !body || body.err)
        return res.render('error', { user: req.session.user, error_code: 404, error_message: config.ERR_PAGE_MESSAGES[404] });
      
      if(req.session && req.session.user){
        var purchases = null;
        if (req.session.user.outlet && req.session.user.outlet.verified){
          purchases = req.session.user.outlet.purchases || [];
          purchases = purchases.map(function(purchase){
            return purchase.post;
          });
        }
  
        res.render('gallery', { user: req.session.user, gallery: body.data, title: 'Gallery', purchases: purchases, config: config, alerts: req.alerts });
      
      }
      else
        res.render('public_gallery', {gallery: body.data, title: 'Gallery', config: config, alerts: req.alerts})
    }
  );
});

module.exports = router;
