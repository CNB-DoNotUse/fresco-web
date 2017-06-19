const express = require('express');
const config = require('../lib/config');
const API = require('../lib/api');
const helper = require('../lib/helpers');
const router = express.Router();

const fetchAcceptedUsers = ({ roles, assignmentId, token }) => {
    //Only admins should see this data
    if (!helper.rolesHasAdmin(roles)) {
        return Promise.resolve([]);
    }

    //Fetch accepted users for given assignment id
    return API
        .request({ token, url: `/assignment/${assignmentId}/accepted` })
        .then((acceptedUsersRes) => {
            return acceptedUsersRes.body;
        });
};

router.get('/:id', (req, res, next) => {
    let user = req.session.user;
    let token = req.session.token.token;

    API
        .request({ token, url: `/assignment/${req.params.id}/?expand[]=outlets` })
        .then((assignmentRes) => {
            const assignment = assignmentRes.body;
            const alerts = req.alerts || [];
            let acceptedUsers = [];

            fetchAcceptedUsers({
                token,
                roles: user.roles,
                assignmentId: assignment.id
            })
            .then((acceptedRes) => {
                acceptedUsers = acceptedRes;
            })
            .catch(() => {
                alerts.push('Unable to fetch accepted users!');
            })
            .then(() => {
                res.render('app', {
                    props: JSON.stringify({ user: helper.userAdminRoles(user), assignment, acceptedUsers }),
                    title: assignment.title,
                    page: 'assignmentDetail',
                    config,
                    alerts,
                    referral: req.session.referral,
                });
            });
        })
        .catch((err) => {
            console.log("error: " + JSON.stringify(err));
            next({
                message: 'Assignment not found!',
                status: 404,
            });
        });
});

module.exports = router;
