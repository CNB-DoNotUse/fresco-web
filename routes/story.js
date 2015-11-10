var express = require('express'),
  config = require('../lib/config'),
  request = require('request'),
  router = express.Router();

/** //
	Description : Story Specific Routes ~ prefix /story/endpoint
// **/

router.get('/:id', function(req, res, next) {

	var purchases = null;

	if (req.session && req.session.user && req.session.user.outlet && req.session.user.outlet.verified) {
    purchases = req.session.user.outlet.purchases || [];
    purchases = purchases.map(function(purchase) {
      return purchase.post;
    });
  }

  request({
      url: config.API_URL + '/v1/story/get?id=' + req.params.id,
      json: true
    },
    function(err, response, body) {
			if (err || !body || body.err){
        return res.render('error', {
          user: req.session.user,
          error_code: 404,
          error_message: config.ERR_PAGE_MESSAGES[404]
        });
			}

			var story = body.data;

			res.render('story', {
        user: req.session.user,
        story_id: req.params.id,
        story: story,
        purchases: purchases,
        config: config,
        alerts: req.alerts,
        page: 'story',
				title : 'Story'
      });

    }
  );
});

module.exports = router;
