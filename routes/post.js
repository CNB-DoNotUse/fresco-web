var express = require('express'),
    config = require('../lib/config'),
    request = require('request-json'),
    router = express.Router(),
    api = request.createClient(config.API_URL);

/** //

  Description : Post Specific Routes ~ prefix /gallery/~

// **/

/**
 * Post Detail Page
 * @param Post ID
 */

router.get('/:id', function(req, res, next){
	 
  //Make request for post
  api.get('/v1/post/get?id=' + req.params.id, function(error, response, body){
   
    if (error || !body || body.err){
      req.session.alerts = ['Error connecting to server'];
      return req.session.save(function(){
        res.redirect(req.headers.Referer || config.DASH_HOME);
      });
    }

    var post = body.data;

    var title = 'Post by ';
    
    if (post.owner)
      title += post.owner.firstname + ' ' + post.owner.lastname;
    else if(post.curator)
      title += post.curator.firstname + ' ' + post.curator.lastname;
   
    //Make request for gallery
  	api.get('/v1/post/gallery?id='+req.params.id, function(error, response, body){
  	  
      //return res.render('error', {user: req.session.user, error_code: 404, error_message: config.ERR_PAGE_MESSAGES[404]});
      if (error || !body || body.err){
          return res.render('error', {
             user: req.session.user,
             error_code: 404,
             error_message: config.ERR_PAGE_MESSAGES[404]
           });
      }

      var gallery = body.data,
          purchases = [],
          verifier = '';
     
      if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified){
     
        purchases = req.session.user.outlet.purchases || [];
     
        purchases = purchases.map(function(purchase){
          return purchase.post;
        });
     
      }

      //Check if post has approvals in place
      if (post.approvals) {
        
        var verifierId = null;
        
        //Loop through edits to find edit for visibility change of `1` i.e. verified
        for (var i in gallery.edits) {
          
          var edit = gallery.edits[i];
          
          //Check if the edit is setting visibility to 1
          if (edit.changes.visibility == 1) {
            verifierId = edit.editor;
            break;
          }

        }
        if (verifierId) {
          
          //Retrieve profile in order to get verifier
          api.get('/v1/user/profile?id=' + verifierId, function(error, response, body) {
          
            if (!error && body && !body.err) {
              verifier = body.data;
              render();
            }
          
          });

        }
        else 
          render();
      }
      else 
        render();

      var props = {
        user : req.session.user,
        post: post,
        gallery: gallery,
        verifier: verifier,
        config: config,
        title: title,
        purchases: purchases
      };

      function render() {
        res.render('post', {
          props: JSON.stringify(props),
          title: title,
          config: config,
          alerts: req.alerts,
          page: 'postDetail',
        });
      }

    });

  });

});

module.exports = router;
