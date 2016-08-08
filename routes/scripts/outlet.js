const express = require('express');
const config = require('../../lib/config');
const User = require('../../lib/user');
const API = require('../../lib/api');
const router = express.Router();

/**
 * Make sure a user is signed in and is part of an outlet
 * @param  {Request}  req Express request object
 * @param  {Response} res Express response object
 * @return {boolean}      True if everything is kosher, false if not
 */
function checkOutlet(req, res) {
    if (!req.session.user || !req.session.user.outlet) {
        res.status(400).json({ err: 'ERR_INVALID_OUTLET' }).end();
        return false;
    }
    return true;
}


router.post('/invite/accept', (req, res, next) => {
    const { accept, updates } = req.body;

    //Sign in user with creds first
    API.request({
        method: 'POST',
        url: '/auth/signin',
        body: {
            username: accept.username,
            password: accept.password
        }
    })
    .then(response => {
        let { user } = response.body;

        API.request({
            url: '/outlet/invite/accept',
            method: 'POST',
            token: response.body.token,
            body: {
                token: accept.token //Invite token
            }
        })
        .then(response => {

            console.log(user);

            if(Object.keys(updates).length) {

                API.request({
                    url: `/user/${user.username}/update`,
                    method: 'POST',
                    token: response.body.token,
                    body: {
                        verify_password: accept.password,
                        full_name: accept.full_name,
                        phone: accept.phone
                    }
                })
                .then(response => {
                    console.log(response);
                })
                 .catch(error => API.handleError(error, res));

                console.log(updates);

            } else {

            }

        })
        .catch(error => API.handleError(error, res));
    })
    .catch(error => API.handleError(error, res));

});


router.post('/payment/create', (req, res) => {

});

module.exports = router;
