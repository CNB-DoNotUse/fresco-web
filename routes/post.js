var express = require('express'), 
    config = require('../lib/config'),
    Gallery = require('../lib/gallery'),
    
    request = require('request-json'),
    archiver = require('archiver'),
    async = require('async'),
    
    router = express.Router(),
    api = request.createClient(config.API_URL);

router.get('/:id', function(req, res, next){
	api.get('/v1/post/get?id='+req.params.id, function(error, response, post_body){
    if (error || !post_body){
      req.session.alerts = ['Error connecting to server'];
      return req.session.save(function(){
        res.redirect(req.headers['Referer'] || config.DASH_HOME);
      });
    }
    if (post_body.err){
      req.session.alerts = [config.resolveError(post_body.err)];
      return req.session.save(function(){
        res.redirect(req.headers['Referer'] || config.DASH_HOME);
      });
    }

  	api.get('/v1/post/gallery?id='+req.params.id, function(error, response, gallery_body){
  	  if (error || !gallery_body || gallery_body.err)
        gallery_body.data = {};//return res.render('error', {user: req.session.user, error_code: 404, error_message: config.ERR_PAGE_MESSAGES[404]});

      var purchases = null;
      if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified){
        purchases = req.session.user.outlet.purchases || [];
        purchases = purchases.map(function(purchase){
          return purchase.post;
        });
      }
      
      var post = post_body.data;
      var title = 'Post by ';
      if (post.owner) {
        title += post.owner.firstname + ' ' + post.owner.lastname;
      }
      else {
        title += post.curator.firstname + ' ' + post.owner.lastname;
      }
      
      res.render('post', { user: req.session.user, post: post, gallery: gallery_body.data, title: title, purchases: purchases, config: config, alerts: req.alerts });
    });
  });
});

module.exports = router;
