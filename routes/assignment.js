const express = require('express');
const config = require('../lib/config');
const API = require('../lib/api');

const router = express.Router();

const fetchAcceptedUsers = ({ roles, assignmentId, token }) => {
    //Only admins should see this data
    if (!roles.includes('admin')) {
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
        .request({ token, url: `/assignment/${req.params.id}` })
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
                    props: JSON.stringify({ user, assignment, acceptedUsers }),
                    title: assignment.title,
                    page: 'assignmentDetail',
                    config,
                    alerts,
                    referral: req.session.referral,
                });
            });
        })
        .catch(() => {
            next({
                message: 'Assignment not found!',
                status: 404,
            });
        });
});

module.exports = router;
