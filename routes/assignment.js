var express    = require('express'),
    config     = require('../lib/config'),
    Purchases  = require('../lib/purchases'),
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

    let notFoundUserID = true;

    for(let a of body.data.outlets) {
      if(a._id == req.session.user.outlet._id) {
        notFoundUserID = false;
        break;
      }
    }

    if (err || !body || body.err){

      return next(error);

    }
    //Check if the assignment is the user's and they're not a CM or Admin
    else if(notFoundUserID && req.session.user.rank <= 1){
      return next(error);
    }

    // Don't show info of other outlets
    delete body.data.outlets;

    var assignment = body.data,
        title = assignment.title,
        props = {
          user: req.session.user,
          purchases: Purchases.mapPurchases(),
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
