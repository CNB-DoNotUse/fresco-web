const express = require('express');
const config = require('../lib/config');
const API = require('../lib/api');
const router = express.Router();

router.get('/:id', (req, res, next) => {
    let user = req.session.user;
    let token = req.session.token.token;

    API.request({
        token,
        url: `/outlet/locations/${req.params.id}`,
    }).then(response => {
        const location = response.body;
        const props = {
            user,
            outlet: user.outlet,
            location,
        };

        res.render('app', {
            props: JSON.stringify(props),
            config,
            alerts: req.alerts,
            title: location.title,
            page: 'locationDetail',
        });
    }).catch(() => (
        next({
            message: 'Outlet location not found!',
            status: 404,
        })
    ));
});

module.exports = router;
