var express    = require('express'),
    config     = require('../lib/config'),
    Purchases  = require('../lib/purchases'),
    request    = require('request-json'),
    router     = express.Router(),
    api        = request.createClient(config.API_URL);

/** //

  Description : Post Specific Routes ~ prefix /gallery/~

// **/

/**
 * Post Detail Page
 * @param Post ID
 */

router.get('/:id', (req, res, next) => {

    var post = {},
        title = '',
        gallery = {},
        purchases = [],
        verifier = '';

    //Make request for post
    api.get('/v1/post/get?id=' + req.params.id, doWithPostInfo);

    function doWithPostInfo(error, response, body) {

        if (error || !body || body.err){
          req.session.alerts = ['Error connecting to server'];
          return req.session.save(() => {
            res.redirect(req.headers.Referer || config.DASH_HOME);
          });
        }

        post = body.data;

        if (post.owner)
          title += 'Post by ' + post.owner.firstname + ' ' + post.owner.lastname;
        else if(post.curator)
          title += 'Imported by ' + post.curator.firstname + ' ' + post.curator.lastname;
        else
          title = post.byline;

        //Make request for gallery
        api.get('/v1/post/gallery?id=' + req.params.id, doWithGallery);
    }

    function doWithGallery (error, response, body) {

        //return res.render('error', {user: req.session.user, error_code: 404, error_message: config.ERR_PAGE_MESSAGES[404]});
        if (error || !body || body.err) {
          return next(error || body.err);
        }

        gallery = body.data;

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
                api.get('/v1/user/profile?id=' + verifierId, doWithUserProfile);
            } else {
                render();
            }

        } else {
          render();
        }
    }

    function doWithUserProfile(error, response, body) {
        if (!error && body && !body.err) {
            verifier = body.data.firstname + ' ' + body.data.lastname;
            render();
        }
    }

    function render() {

        var props = {
            user: req.session.user,
            post: post,
            gallery: gallery,
            verifier: verifier,
            title: title,
            purchases: Purchases.mapPurchases(req.session)
        };

        res.render('app', {
            props: JSON.stringify(props),
            title: title,
            config: config,
            alerts: req.alerts,
            page: 'postDetail',
        });
    }
});

module.exports = router;
