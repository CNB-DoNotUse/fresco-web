var express    = require('express'),
    config     = require('../lib/config'),
    Purchases  = require('../lib/purchases'),
    request    = require('request-json'),
    api        = require('../lib/api'),
    router     = express.Router();

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

    const token = req.session.token;

    //Make request for post
    const postPromise = api.request({
        token,
        url: '/post/' + req.params.id,
    }).then(response => {
        return api.request({ token, url: '/gallery/' + response.body.parent_id });
    }).then(response => {
        gallery = response.body;
        post = gallery.posts.find(p => p.id === req.params.id);
        if (post.owner) {
            title += 'Post by ' + post.owner.full_name;
        } else if (post.curator) {
            title += 'Imported by ' + post.curator.full_name;
        } else {
            title = post.byline;
        }

        const curatorId = post.curator_id;

        if (!curatorId) return render();

        return api.request({ token, url: '/user/' + curatorId }).then(user => {
          verifier = user.full_name;
          return render();
        });
    }).catch(e => {
        return req.session.save(() => {
            res.redirect(req.headers.Referer || config.DASH_HOME);
        });
    });

    function render() {
        var props = {
            gallery, post, title, verifier,
            user: req.session.user,
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
