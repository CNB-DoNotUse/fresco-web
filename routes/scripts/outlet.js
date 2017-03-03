const express = require('express');
const config = require('../../lib/config');
const API = require('../../lib/api');
const userLib = require('../../lib/user');
const router = express.Router();

router.post('/invite/accept', (req, res, next) => {
    const { accept, updates } = req.body;

    userLib
        .login(accept.username, accept.password, req)
        .then(response => {
            let { user, token } = response;

            //Accept the invite
            API.request({
                url: '/outlet/invite/accept',
                method: 'POST',
                token: token.token,
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
                        token: token.token,
                        body: {
                            verify_password: accept.password,
                            full_name: updates.full_name,
                            phone: updates.phone
                        }
                    })
                    .then(response => {
                        let updatedUser = response.body;
                        updatedUser.roles = user.roles;

                        end(req, updatedUser)
                    })
                    .catch(error => API.handleError(error, res));
                } else {
                    end(req, user);
                }
            })
            .catch(error => API.handleError(error, res));
        })
        .catch(error => API.handleError(error, res));


    //Ending function
    const end = (req, user) => {
        userLib
        .saveSession(req, user)
        .then(() => {
            return res.status(200).send({success: true});
        })
        .catch(() => {
            return res.status(500).send({success: false});
        })
    }
});


module.exports = router;
