var express = require('express'),
    config = require('../lib/config'),
    request = require('request-json'),
    router = express.Router(),
    api = request.createClient(config.API_URL);

/** //

Description : User Specific Routes ~ prefix /user/endpoint

// **/

/**
 * User settings page
 */

router.get('/settings', function(req, res, next) {

    var props = {
        user: req.session.user,
        title: 'User Settings'
    }

    res.render('app', {
        props: JSON.stringify(props),
        title: props.title,
        page: 'userSettings'
    });

});

/**
 * Detail page for a user
 */

router.get('/:id?', function(req, res, next) {

  var userId = req.params.id;

  //If the user id is passed
  if(userId){

    //Grab profile from API
    api.get('/v1/user/profile?id=' + req.params.id, function(error, response, body) {

      if (error || !body.data._id || body.err) {

        return req.session.save(function() {
          res.redirect(req.headers.Referer || config.DASH_HOME);
        });

      }
    
      //Render page
      renderUserPage(body.data, req, res)

    });

  }
  //Render currently logged in user otherwise
  else{

    //Check if user is logged in 
    if (!req.session || !req.session.user)
      return res.redirect('/');

    //Render page
    renderUserPage(req.session.user, req, res)

  }

});


/**
 * Renders user page
 * @param  {object} user user to render on page
 */
function renderUserPage(user, req, res){

  console.log(req.session.user);

  var title = user.firstname + ' ' + user.lastname,
      props = {
        purchases: config.mapPurchases(user),
        title: title,
        user: req.session.user,
        detailUser: user,
        editable: req.session.user._id == user._id
     };

  res.render('app', {
    title: title,
    props: JSON.stringify(props),
    page: 'userDetail'
  });

}

module.exports = router;
