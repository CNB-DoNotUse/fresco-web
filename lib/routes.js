/**
 * Site route directory
 *
 * @description A key defines a  part of the site i.e. `platform` is any page inside the platform
 *
 * `aliases` are urls that can be accessed but just point to a modal i.e. 'privacy' will just load the `legal` modal
 *
 * See the loops in the `app.js` for how these routes are accessed
 *
 */

module.exports = {
    public: [
        'index',
        'pro',
        'gallery'
    ],

    modals: [
        'account',
        'contact',
        'press',
        'forgot',
        'team',
        'reset-success',
        'faq',
        'legal'
    ],

    aliases: {
        'privacy' : 'legal',
        'terms'   : 'legal'
    },

    scripts: [
        'report',
        'outlet',
        'user',
        'pro',
        'contact'
    ],

    platform: [
        'highlights',
        'archive',
        'dispatch',
        'assignment',
        'location',
        'outlet',
        'story',
        'stats',
        'user',
        'post',
        'purchases',
        'search',
        'admin',
        'push'
    ]
};

