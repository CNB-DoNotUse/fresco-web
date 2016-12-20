const express = require('express');
const config = require('../lib/config');
const api = require('../lib/api');

const router = express.Router();

const fetchAcceptedUsers = ({ permissions, assignmentId, token }) => {
    // only market managers should see this data
    if (!permissions.includes('update-other-content')) {
        return Promise.resolve([]);
    }
        // fetch accepted users for given assignment id
    return api
    .request({ token, url: `/assignment/${assignmentId}/accepted` })
    .then((acceptedUsersRes) => {
        return acceptedUsersRes.body;
    });
};

router.get('/:id', (req, res, next) => {
    let user;
    let token;
    if (req.session) {
        token = req.session.token;
        user = req.session.user;
    }

    api.request({ token, url: `/assignment/${req.params.id}` })
    .then((assignmentRes) => {
        const assignment = assignmentRes.body;
        const alerts = req.alerts || [];
        let acceptedUsers = [];


        if (!(user.permissions.includes('view-all-assignments')
            || assignment.outlets.some(o => o.id === user.outlet.id))) {
            return next({
                message: 'Not authorized to view assignment.',
                status: 401,
            });
        }


        fetchAcceptedUsers({ token, permissions: user.permissions, assignmentId: assignment.id })
        .then((acceptedRes) => {
            acceptedUsers = acceptedRes;
        })
        .catch(() => {
            alerts.push('Unable to fetch accepted users');
        })
        .then(() => {
            res.render('app', {
                props: JSON.stringify({ user, assignment, acceptedUsers }),
                title: assignment.title,
                page: 'assignmentDetail',
                config,
                alerts,
            });
        });
    }).catch(() => {
        next({
            message: 'Assignment not found!',
            status: 404,
        });
    });
});

module.exports = router;

