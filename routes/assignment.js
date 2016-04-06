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

    let notFoundUserID = true, outlet = body.data.outlet;

    for(let o of body.data.outlets) {
      if(o._id == req.session.user.outlet._id) {
        outlet = o;
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

    // Use the outlet of the requesting outlet, or the default one if a CM.
    body.data.outlet = outlet;

    var assignment = body.data,
        title = assignment.title,
        props = {
          user: req.session.user,
          purchases: Purchases.mapPurchases(req.session),
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
