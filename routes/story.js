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
    },
    function(err, response, body) {
			
      if (err || !body || body.err){
        
        return res.render('error', {
          user: req.session.user,
          error_code: 404,
          error_message: config.ERR_PAGE_MESSAGES[404]
        });

			}

      console.log(body.data);

			var story = body.data,
          purchases = config.mapPurchases();
          props = {
            story: body.data,
            purchases: config.mapPurchases(),
            user: req.session.user
          }

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
