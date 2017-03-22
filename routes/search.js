const express = require('express');

const router = express.Router();

/**
 * Search page
 * @description Can take query, tags or location in the url
 */
router.get('/', (req, res) => {
    const query = req.query.q || '';
    const tags = req.query.tags || [];
    let location = {};

    // Check if location is vali
    if (!isNaN(req.query.lat) && !isNaN(req.query.lon) && !isNaN(req.query.radius)) {
        location = {
            lat: parseFloat(req.query.lat),
            lng: parseFloat(req.query.lon),
            radius: parseFloat(req.query.radius),
        };
    }

    const props = {
        user: req.session.user,
        location,
        tags,
        query,
    };

    res.render('app', {
        title: 'Search',
        alerts: req.alerts,
        referral: req.session.referral,
        props: JSON.stringify(props),
        page: 'search',
    });
});

module.exports = router;
