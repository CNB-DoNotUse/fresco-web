const express = require('express');
const config = require('../lib/config');
const router = express.Router();
const api = require('../lib/api');

router.get('/:id', (req, res, next) => {
    let user;
    let token;
    if (req.session) {
        token = req.session.token;
        user = req.session.user;
    }

    Promise.all([
        api.request({ token, url: `/assignment/${req.params.id}` }),
        api.request({ token, url: `/assignment/${req.params.id}/accepted` }),
    ]).then((apiRes) => {
        const assignment = apiRes[0].body;
        const acceptedUsers = apiRes[1].body;
        const props = { user, assignment, acceptedUsers };

        if (user.permissions.includes('view-all-assignments')
            || assignment.outlets.some(o => o.id === user.outlet.id)) {
            res.render('app', {
                props: JSON.stringify(props),
                config,
                alerts: req.alerts,
                title: assignment.title,
                page: 'assignmentDetail',
            });
        } else {
            next({
                message: 'Not authorized to view assignment.',
                status: 401,
            });
        }
    }).catch(() => (
        next({
            message: 'Assignment not found!',
            status: 404,
        })
    ));
});

module.exports = router;
