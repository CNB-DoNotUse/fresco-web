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
        let { user, token } = response.body;

        //Accept the invite
        API.request({
            url: '/outlet/invite/accept',
            method: 'POST',
            token,
            body: {
                token: accept.token //Outlet Invite token
            }
        })
        .then(response => {
            //Attach outlet to user
            if(response.body.outlet){
                user.outlet = response.body.outlet
            } else {
                return res.status(500).send({success: false});
            }

            //Send updates if there are any
            if(Object.keys(updates).length) {
                API.request({
                    url: '/user/update',
                    method: 'POST',
                    token,
                    body: {
                        verify_password: accept.password,
                        full_name: updates.full_name,
                        phone: updates.phone
                    }
                })
                .then(response => {
                    let updatedUser = response.body;
                    updatedUser.permissions = user.permissions;

                    end(req, updatedUser, token)
                })
                .catch(error => API.handleError(error, res));
            } else {
                end(req, user, token);
            }
        })
        .catch(error => API.handleError(error, res));
    })
    .catch(error => API.handleError(error, res));

    //Ending function
    const end = (req, user, token) => {
        User
            .saveSession(req, user, token)
            .then(() => {
                return res.status(200).send({success: true});
            })
            .catch(() => {
                return res.status(500).send({success: false});  
            })
    }
});


router.post('/payment/create', (req, res) => {

});

module.exports = router;
