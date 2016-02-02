var express = require('express'),
    config = require('../lib/config'),
    request = require('request'),
    router = express.Router();

/** //

	Description : Story Specific Routes ~ prefix /story/endpoint

// **/

router.get('/:id', function(req, res, next) {

  request({
      url: config.API_URL + '/v1/story/get?id=' + req.params.id,
      json: true
    }, function(err, response, body) {
			
      if (err || !body || body.err){
          var error = new Error('Story not found!');
          error.status = 404;
          
          return next(error);
			}

			var props = {
            story: body.data,
            purchases: config.mapPurchases(),
            user: req.session.user
          };

			res.render('app', {
        props: JSON.stringify(props),
        config: config,
        alerts: req.alerts,
        page: 'storyDetail',
				title : 'Story'
      });

    }

  );

});

module.exports = router;
