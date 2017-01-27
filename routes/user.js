const express = require('express');
const API = require('../lib/api');
const router = express.Router();

/**
 * User settings page
 */
router.get('/settings', (req, res) => {
    const props = {
        user: req.session.user,
        title: 'User Settings',
    };

    res.render('app', {
        props: JSON.stringify(props),
        title: props.title,
        page: 'userSettings',
    });
});

/**
 * Renders user page
 * @param  {object} user user to render on page
 */
function renderUserDetail(detailUser, user, res) {
    const title = detailUser.full_name;
    const props = {
        user,
        editable: user.id === detailUser.id,
        title,
        detailUser,
    };

    res.render('app', {
        title,
        props: JSON.stringify(props),
        page: 'userDetail',
    });
}

/**
 * Detail page for a user
 */
router.get('/:id?', (req, res, next) => {
    // If the user id is passed, render user with id
    if (req.params.id) {
        API.request({
            token: req.session.token.token,
            url: `/user/${req.params.id}`,
        }).then(response => {
            renderUserDetail(response.body, req.session.user, res);
        }).catch(() => {
            next({
                message: 'User not found!',
                status: 404,
            });
        });
    } else {
        // Render currently logged in user otherwise
        const user = req.session.user;
        renderUserDetail(user, user, res);
    }
});

module.exports = router;

