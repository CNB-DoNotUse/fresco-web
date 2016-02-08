var express    = require('express'),
    config     = require('../lib/config'),
    request    = require('request'),
    router     = express.Router(),
    global     = require('../lib/global');

router.get('/:id', (req, res, next) => {

  request({
      url: config.API_URL + '/v1/assignment/get?id=' + req.params.id,
      json: true
    }, doWithGetAssignments);
  
  function doWithGetAssignments(err, response, body) {

    var error = new Error(config.ERR_PAGE_MESSAGES[404]);
    error.status = 404;

    if (err || !body || body.err){

      return next(error);

    } 
    //Check if the assignment is the user's and they're not a CM or Admin
    else if(body.data.outlet._id !== req.session.user.outlet._id && req.session.user.rank < global.RANKS.CONTENT_MANAGER){
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