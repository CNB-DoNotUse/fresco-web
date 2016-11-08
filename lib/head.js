const utils = require('./utils');

var head = {

    title: 'Fresco News',

    meta: {
        "description": "Photos and videos from real people on the scenes of breaking news events.",
        "keywords"   : "news, photojournalism, photography, crowdsourced, app, iphone, android",
        "reply-to"   : "info@fresconews.com",
        "copyright"  : "Fresco News",
        "web_author" : "Fresco News",
        "language"   : "english",
        "viewport"   : "width=device-width, initial-scale=1.0, maximum-scale=1.0"
    },

    og: {
        "title"      : "Fresco News",
        "image"      : `${utils.CDN}/images/icon-opengraph.png`,
        "url"        : "http://fresconews.com",
        "description": "Photos and videos from real people on the scenes of breaking news events.",
        "locale"     : "en_US",
    },

    twitter: {
        "card"           : "summary_large_image",
        "site"           : "@fresconews",
        "creator"        : "@fresconews",
        "title"          : "Fresco News",
        "description"    : "Photos and videos from real people on the scenes of breaking news events.",
        "image"          : `${utils.CDN}/images/icon-twitter.png`,
        "app:country"    : "US",
        "app:name:iphone": "Fresco News",
        "app:id:iphone"  : "872040692"
    }

};

module.exports = head;
