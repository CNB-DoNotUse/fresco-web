const express = require('express');
const config = require('../lib/config');
const api = require('../lib/api');

const router = express.Router();

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

        // fetch accepted users for given assignment id
        api.request({ token, url: `/assignment/${req.params.id}/accepted` })
        .then((acceptedUsersRes) => {
            acceptedUsers = acceptedUsersRes.body;
        })
        .catch(() => {
            alerts.push('Unable to fetch accepted users');
        })
        .then(() => {
            const props = { user, assignment, acceptedUsers };
            if (user.permissions.includes('view-all-assignments')
                || assignment.outlets.some(o => o.id === user.outlet.id)) {
                res.render('app', {
                    props: JSON.stringify(props),
                    title: assignment.title,
                    page: 'assignmentDetail',
                    config,
                    alerts,
                });
            } else {
                next({
                    message: 'Not authorized to view assignment.',
                    status: 401,
                });
            }
        });
    }).catch(() => {
        next({
            message: 'Assignment not found!',
            status: 404,
        });
    });
});

module.exports = router;

