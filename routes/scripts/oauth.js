const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/user');
const userLib = require('../../lib/user');
const oauthLib = require('../../lib/oauth');
const API = require('../../lib/api');

/**
 * Processes oauth request
 */
router.post('/authorize',(req, res, next) => {
    if(!req.body.authorization_type || !req.body.client_id || !req.body.scope) {
        return res.status(500).json({ success: false, error: 'Invalid paramaters' })
    }

    const { authorization_type, client_id, redirect_uri, scope } = req.body;

    const getAuthorizationCode = (token, client_id, redirect_uri, scope) => {
        oauthLib
        .getAuthorizationCode(token, client_id, redirect_uri, scope)
        .then(response => {
            const authorization_code = response.body;

            res.status(200).json({ 
                success: true, 
                redirect_uri: oauthLib.generateReturnURI(redirect_uri, authorization_code.token) 
            })
        })
        .catch(error => {
            res.status(500).json({ success: false, error })
        })
    }

    if(authorization_type == 'login') {
        const { username, password } = req.body;

        //First log-in and get a bearer.
        userLib
        .login(username, password, null)
        .then(response => {
            let token = response.token.token;

            getAuthorizationCode(token, client_id, redirect_uri, scope)
        })
        .catch(error => {
            res.status(error.status).json({ success: false, error });
        });
    } else if(authorization_type == 'approval') {
        if(!req.session.user) {
            res.status(500).json({ success: false, error: 'No user is currently in session!' })
        } else {
            getAuthorizationCode(req.session.token.token, client_id, redirect_uri, scope);
        }
    }
});



module.exports = router;
