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

function render(req, res, props) {
    res.render('app', {
        props: JSON.stringify(props),
        alerts: req.alerts,
        page: 'postDetail',
    });
}

router.get('/:id', (req, res) => {
    let post;
    let gallery;
    let title = '';
    let verifier;

    const token = req.session.token;

    // Make request for post
    api.request({
        token,
        url: '/post/' + req.params.id,
    }).then(response => {
        post = response.body || {};
        return api.request({ token, url: '/gallery/' + response.body.parent_id });
    }).then(response => {
        gallery = response.body || {};
        if (post.owner) {
            title += 'Post by ' + (post.owner.full_name || post.owner.username);
        } else if (post.curator) {
            title += 'Imported by ' + post.curator.full_name;
        } else {
            title = post.byline;
        }

        verifier = post.curator ? post.curator.full_name : '';

        return render(req,
                      res,
                      { gallery,
                          post,
                          title,
                          verifier,
                          user: req.session.user,
                          purchases: Purchases.mapPurchases(req.session),
                      });
    }).catch(() => (
        req.session.save(() => res.redirect(req.headers.Referer || config.DASH_HOME))
    ));
});

module.exports = router;

