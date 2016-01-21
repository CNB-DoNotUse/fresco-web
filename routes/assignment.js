var express    = require('express'),
    config     = require('../lib/config'),
    request    = require('request'),
    router     = express.Router()

router.get('/:id', (req, res, next) => {

  request({
      url: config.API_URL + '/v1/assignment/get?id=' + req.params.id,
      json: true
    }, doWithGetAssignments);
  
  function doWithGetAssignments(err, response, body) {
    
    if (err || !body || body.err){
      var error = new Error(config.ERR_PAGE_MESSAGES[404]);
      error.status = 404;

      return next(error);
    }

    var assignment = body.data,
        title = assignment.title,
        props = {
          user: req.session.user,
          purchases: config.mapPurchases(),
          title: title,
          assignment: assignment
        };

    res.render('app', {
      props: JSON.stringify(props),
      config: config,
      alerts: req.alerts,
      page: 'assignmentDetail',
      title : title
    });
  }
});

module.exports = router;