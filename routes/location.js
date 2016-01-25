var express    = require('express'),
    config     = require('../lib/config'),
    superagent = require('superagent'),
    router     = express.Router()

router.get('/:id', (req, res, next) => {

    console.log(req.session.user.token);
    superagent
    .get(config.API_URL + '/v1/outlet/location/get?id=' + req.params.id)
    .set('authtoken', req.session.user.token)
    .set('Accept', 'application/json')
    .end((err, response) => {
      
        //Check if the response checks
        if (err || !response || response.err || !response.body.data){
            var error = new Error(config.ERR_PAGE_MESSAGES[404]);
            error.status = 404;

            return next(error);
        }

        var location = response.body.data,
            title = location.title,
            props = {
              user: req.session.user,
              purchases: config.mapPurchases(),
              title: title,
              location: location
            };


        res.render('app', {
          props: JSON.stringify(props),
          config: config,
          alerts: req.alerts,
          page: 'locationDetail',
          title : title
        });

    });
});

module.exports = router;