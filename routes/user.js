var express = require('express'),
    config = require('../lib/config'),
    utils = require('../lib/utils'),
    Purchases = require('../lib/purchases'),
    router = express.Router(),
    API = require('../lib/api');

/** //

Description : User Specific Routes ~ prefix /user/endpoint

// **/

/**
 * User settings page
 */
router.get('/settings', (req, res, next) => {
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
router.get('/:id?', (req, res, next) => {
    var userId = req.params.id;

    //If the user id is passed
    if(userId){
        //Set options for API request
        var options = {
            body: null,
            method: 'GET',
            token: req.session.token,
            files: null
        }

        //Set secure URL for Admins/CMS
        // if(req.session.user.rank >= global.RANKS.CONTENT_MANAGER) {
            options.url =  '/user/profileSecure?id=' + req.params.id;
        // } 
        // //Otherwise regular URL for regular users
        // //Note: Secure API endpoint will fail with a regular user as well
        // else {
        //     options.url =  '/user/profile?id=' + req.params.id;
        // }

        API.request(options, (err, response) => {
            if (err || !response.body.data.id || response.body.err) {
                return req.session.save(() => {
                    res.redirect(req.headers.Referer || config.DASH_HOME);
                });
            }

            //Render page
            renderUserPage(response.body.data, req, res)
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

    var title = user.firstname + ' ' + user.lastname,
        props = {
            purchases: Purchases.mapPurchases(user),
            title: title,
            user: req.session.user,
            detailUser: user,
            editable: req.session.user.id == user.id
        };

    res.render('app', {
        title: title,
        props: JSON.stringify(props),
        page: 'userDetail'
    });
}

module.exports = router;