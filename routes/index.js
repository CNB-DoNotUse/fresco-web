const express       = require('express');
const router        = express.Router();
const config        = require('../lib/config');
const routes        = require('../lib/routes');
const API  = require('../lib/api');

/**
 * Root index for the landing page
 */
router.get('/:modal?', (req, res, next) => {
    if(req.params.modal){
        if(req.params.modal == 'partners') {
            res.redirect('/account');
        }
        //Not a modal, pass onto route sequence
        else if(routes.modals.indexOf(req.params.modal) == -1 && routes.aliases[req.params.modal] == null) {
            return next();
        }
    }
    //Redirect to dashboard home if the user is already logged in, instead of the landing page
    else if(req.session.user !== null && typeof(req.session.user) !== 'undefined') {
        return res.redirect('/highlights');
    }

    res.render('index', {
        page: 'index',
        loggedIn: req.session.user ? true : false,
        modal: req.params.modal,
        modals: routes.modals,
        aliases: routes.aliases
    });
});

/**
 * Outlet join page
 */
router.get('/join/:token', (req, res, next) => {
    if (!req.params.token) {
        return res.redirect('/');
    }

    // Make request for invite
    API.request({
        method: 'GET',
        url: `/outlet/invite/${req.params.token}`,
        token: req.session.token
    })
    .then((response) => {
        const { body } = response;

        return res.render('index', {
            page: 'index',
            invite: body,
            modal: 'join',
            aliases: routes.aliases,
            modals: routes.modals.concat('join'),
        });
    })
    .catch(error => {
        req.session.alerts = ['This invitation could not be loaded! Please contact support@fresconews.com for assistance.'];

        return req.session.save(() => {
            res.redirect('/');
            res.end();
        });
    });
});

/**
 * Email verify page
 */
router.get('/verify', (req, res, next) => {

    // //Check if the user is logged in already
    // if (req.session && req.session.user && req.session.user.verified) {
    //     req.session.alerts = ['Your email is already verified!'];

    //     return req.session.save(() => {
    //         res.redirect('/');
    //         res.end();
    //     });
    // }

    // //Check if the verification link query is valid
    // if (!req.query.t) {
    //     req.session.alerts = ['Invalid verification link'];
    //     return req.session.save(() => {
    //         res.redirect('/');
    //         res.end();
    //     });
    // }

    // api.post('/v1/user/verify', { token: req.query.t}, doAfterUserVerify);

    // function doAfterUserVerify(error, response, body) {
    //     if (error || !body) {
    //       req.session.alerts = ['Error connecting to server'];

    //       return req.session.save(() => {
    //         res.redirect('/');
    //         res.end();
    //       });
    //     }

    //     if (body.err) {
    //         req.session.alerts = [config.resolveError(body.err)];

    //         return req.session.save(() => {
    //             res.redirect('/');
    //             res.end();
    //         });
    //     }

    //     req.session.alerts = ['Your email has been verified!'];

    //     if (req.session && req.session.user) {
    //         req.session.user = body.data;
    //     }

    //     return req.session.save(() => {
    //         res.redirect('/');
    //         res.end();
    //     });
    // }
});

module.exports = router;