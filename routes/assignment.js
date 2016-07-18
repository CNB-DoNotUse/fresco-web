const express = require('express');
const config = require('../lib/config');
const router = express.Router();
const api = require('../lib/api');

function render(assignment, user, req, res) {
    const title = assignment.title;
    const props = {
        user: req.session.user,
        title,
        assignment,
    };

    res.render('app', {
        props: JSON.stringify(props),
        config,
        alerts: req.alerts,
        page: 'assignmentDetail',
        title,
    });
}

router.get('/:id', (req, res, next) => {
    let user;
    let token;
    if (req.session) {
        token = req.session.token;
        user = req.session.user;
    }

    api.request({
        token,
        url: '/assignment/' + req.params.id,
    }).then(response => {
        render(response.body, user, req, res);
    }).catch(() => (
        next({
            message: 'Assignment not found!',
            status: 404,
        })
    ));
});

module.exports = router;
