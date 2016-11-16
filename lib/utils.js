const moment = require('moment-timezone');
const difference = require('lodash/difference');
const get = require('lodash/get');
const omit = require('lodash/omit');

/**
 * Global functions used across the app, no context needed
 * @type {Object}
 */
const utils = {

    CDN: 'https://cdn.fresconews.com/static',

    defaultAvatar: 'https://cdn.fresconews.com/static/images/user-1.png',

    defaultSmallAvatar: 'https://cdn.fresconews.com/static/images/user-1-small.png',

    postCount: 32,

    RATINGS: {
        VERIFIED: 2,
        SKIPPED: 1,
    },

    limits: {
        galleryItems: 10,
    },

    permissions: {
        IMPORT_CONTENT: { name: 'import-content', rank: 1 },
        RATE_CONTENT: { name: 'rate-content', rank: 1 },
        UPDATE_OTHER_CONTENT: { name: 'update-other-content', rank: 1 },
        DELETE_OTHER_CONTENT: { name: 'delete-other-content', rank: 1 },
        DISPATCH_ENABLED: { name: 'dispatch-enabled', rank: 1 },
        VIEW_ALL_ASSIGNMENTS: { name: 'view-all-assignments', rank: 1 },
        CREATE_STORY: { name: 'create-story', rank: 1 },
        DELETE_STORY: { name: 'delete-story', rank: 1 },
        UPDATE_STORY: { name: 'update-story', rank: 1 },
        CREATE_RECAP: { name: 'create-recap', rank: 1 },
        DELETE_RECAP: { name: 'delete-recap', rank: 1 },
        UPDATE_RECAP: { name: 'update-recap', rank: 1 },
        CREATE_ASSIGNMENT: { name: 'create-assignment', rank: 1 },
        DELETE_ASSIGNMENT: { name: 'delete-assignment', rank: 1 },
        EXPIRE_ASSIGNMENT: { name: 'expire-assignment', rank: 1 },
        UPDATE_ASSIGNMENT: { name: 'update-assignmnet', rank: 1 },
        GET_ALL_PURCHASES: { name: 'get-all-purchases', rank: 2 },
    },

    mapStyles: [],

    assignmentColor: {
        drafted: '#0047bb',
        active: '#ffc600',
        expired: '#d0021b',
        pending: '#b3b3b3`'
    },

    assignmentImage: {
        drafted: '/images/assignment-drafted.png',
        active: '/images/assignment-active.png',
        expired: '/images/assignment-expired.png',
        pending: '/images/assignment-pending.png'
    },

    getFaviconForUrl: function(url) {
        return "http://www.google.com/s2/favicons?domain=" + url;
    },

    isValidUrl: function(url){

        return true;

        // var expression = /@(https?|ftp)://(-\/.)?([^\s/?\.#-]+\.?)+(/[^\s]*)?$@iS/;

        // var regex = new RegExp(expression);

        // if (url.match(regex))
        //     return true
        // else
        //     return false
    },

    /**
     * Check if passed radius is valid
     * @param  {double}  radius Radius in miles
     * @return {Boolean} YES if valid, NO if not valid
     */
    isValidRadius: function(radius){
        //If not a number, or radius is less than 250 feet miles
        if (isNaN(radius) || radius < 0.0473485) //0.0473485 IS 250 FEET IN MILES
            return false;
        else
            return true;
    },

    /**
     * Checks if passed value is valid float
     * @return {Boolean} true if a float, false if not a float
     */
    isValidFloatInput: function(value){

       return (!isNaN(value) && value.toString().indexOf('.') != -1)

    },

    /**
     * Sets the windows time formatting style
     * @param {string} timeFormat `Absolute` or `Relative`
     */
    setTimeDisplayType(timeFormat) {
        // Set the windows time format
        window.timeFormat = timeFormat;

        const timeStrings = document.getElementsByClassName('timestring');

        //Change all timestamps to new format
        for (var i = timeStrings.length - 1; i >= 0; i--) {
            const timestamp = timeStrings[i].dataset.timestamp;
            timeStrings[i].innerHTML = this.formatTime(timestamp);
        };
    },

    formatTime(timestamp, absolute = false) {
        const userTimezone = moment.tz.guess();

        if (!absolute &&
            (typeof window === 'undefined' || !window.timeFormat || window.timeFormat === 'relative')) {
            return moment(timestamp).fromNow();
        } else if (window.timeFormat === 'absolute' || absolute) {
            if (moment(Date.now()).startOf('day').isSame(moment(timestamp).startOf('day'))) {
                return moment.tz(timestamp, userTimezone).format('h:mm A z');
            }

            return moment.tz(timestamp, userTimezone).format('MMM Do, YYYY, h:mm A z');
        }

        return '';
    },

    sanitizeEmail: function(email) {
        email = email.toLowerCase()

        //Check if not gmail, and return same email
        if(email.indexOf('gmail') == -1) {
          return email;
        } else {
            var emailParts = email.split('@');
            emailParts[0] = emailParts[0].replace('.', '').split('+')[0];

            sanitizedEmail = emailParts.join('@');

            return sanitizedEmail;
        }
    },

    /**
     * Checks is passed string is completley empty, also checks for just whitespace
     * @return {Boolean} True if empty, False is not empty
     */
    isEmptyString: function(string){
        return !/\S/.test(string)
    },

    /**
     * Formats Image URL
     * @param  {string} img  passed image URL
     * @param  {string} size size to return URL at
     * @return {string} URL string of the image file
     */
    formatImg(img, size) {
        let formatted = img || '';
        // TODO: resolutions need to be updated
        const sizeToRes = {
            thumb: '50',
            small: '350',
            medium: '700',
            large: '1000',
        };

        // for dev env
        if (formatted.indexOf('https://cdn.dev') !== -1) {
            formatted = formatted.replace('https', 'http');
        }

        if (formatted.indexOf('cloudfront') !== -1 && ['small', 'medium', 'large'].includes(size)) {
            return formatted.replace('images/', `images/${size}/`);
        }

        if (formatted.indexOf('fresconews') !== -1) {
            if (!size || size === 'original' || !sizeToRes[size]) return formatted;
            return formatted.replace('images/', `images/${sizeToRes[size]}/`);
        }

        return formatted;
    },

    /**
     * Formats Video URL
     * @param  {string} video Video URL
     * @return {string} URL string of the vide file, pointing to the mp4 representation
     */
    streamToMp4(url) {
        if (url.includes('cloudfront')) {
            return url.replace(/streams\/|videos\//, 'videos/mp4/').replace('.m3u8', '.mp4');
        }
        return url.replace(/streams\/|videos\//, 'videos/').replace('.m3u8', '.mp4');
    },

    /**
     * Returns a check if the count is plural
     * @param  {int} count The intenger count to check
     * @return {BOOL} YES if it us plural, NO if it's not
     */
    isPlural(count) {
        if(count == 0 || count > 1 || count == null) return true;
        else return false;
    },

    milesToMeters: function(miles){
        return 1609.34 * miles;
    },

    feetToMeters: function(feet){
        return feet * 0.3048;
    },

    feetToMiles: function(feet){
        return feet * 0.000189394;
    },

    milesToFeet: function(miles){
        return miles * 5280;
    },

    /**
     * Converts Google Maps `circle` to a polygon
     */
    circleToPolygon: function(center, radius, numSides) {
        let points = [];
        const degreeStep = 360 / numSides;

        center = new google.maps.LatLng(center.lat, center.lng);

        for(let i = 0; i < numSides; i++){
            const gpos = google.maps.geometry.spherical.computeOffset(center, radius, degreeStep * i);
            points.push([gpos.lng(), gpos.lat()]);
        };

        // Duplicate the last point to close the geojson ring
        points.push(points[0]);

        return [points];
    },

    /**
     * Generate the polygon from the google maps bounds
     */
    generatePolygonFromBounds: function(bounds) {
        return [
            [
                [bounds.getNorthEast().lng(), bounds.getNorthEast().lat()],
                [bounds.getNorthEast().lng(), bounds.getSouthWest().lat()],
                [bounds.getSouthWest().lng(), bounds.getSouthWest().lat()],
                [bounds.getSouthWest().lng(), bounds.getNorthEast().lat()],
                [bounds.getNorthEast().lng(), bounds.getNorthEast().lat()]
            ]
        ];
    },

	// Returns centroid for passed polygon
    getCentroid(polygon) {
        if (!polygon.length) {
            return new google.maps.LatLng(-73.9, 40);
        }

        let path;
        let lat = 0;
        let lng = 0;

        if (Array.isArray(polygon)) {
            const newPolygon = new google.maps.Polygon({ paths: polygon });
            path = newPolygon.getPath();
        } else {
            path = polygon.getPath();
        }

        for (var i = 0; i < path.getLength() - 1; ++i) {
            lat += path.getAt(i).lat();
            lng += path.getAt(i).lng();
        }

        lat /= path.getLength() - 1;
        lng /= path.getLength() - 1;
        return new google.maps.LatLng(lat, lng);
    },

    getGeoFromCoord(coords) {
        if (!coords || !coords.lat || !coords.lng) return null;

        return {
            type: 'Point',
            coordinates: [coords.lng, coords.lat],
        };
    },

    /**
     * Returns number of hours till current timesteamp
     * @param {timestampe} timestamp Expiration timestamp
     */
    hoursToExpiration(timestamp){
        var expirationDate = new Date(timestamp),
            expirationHours = Math.ceil((expirationDate - Date.now()) / 1000 / 60 / 60);

        return expirationHours > 0 ? expirationHours : 0;
    },

    /**
     * Compares multiline values
     */
    compareMultiline(text1, text2) {
        text1 = text1 ? text1.split('\n') : [];
        text2 = text2 ? text2.split('\n') : [];

        var limit =  text1.length > text2.length ?  text1.length : text2.length;
        if(text1.length != text2.length) return false;

        for(var i=0;i<limit ; i++)
        {
            if(text1[i].replace('\r', '') !== text2[i].replace('\r', ''))
            {
                return false;
            }
        }

        return true;
    },

    resolveError(err, _default){
        switch(err){
            case 'ERR_OUTLET_UNVERIFIED':
                return 'This outlet is in demo mode. Purchases and downloads are currently disabled.';
            case 'ERR_USER_UNVERIFIED':
                return 'You must verify your email in order to perform this action.';
            case 'ERR_INCOMPLETE':
                return 'There was an error while completing your purchase.';
            case 'ERR_INVALID_LOGIN':
                return 'Invalid email or password!';
            case 'ERR_MISSING_PAYMENT_INFO':
                return 'We couldn\'t seem to find your payment info. Please check your outlet settings.';
            case 'ERR_NO_UPDATES':
                return 'No changes we\'re found!';
            case 'ERR_DUPLICATE_TWEET':
                return 'This tweet has already been imported!';
            case 'ERR_LOCATION_EXISTS':
                return 'Your outlet is already tracking this location.';
            case 'ERR_UNSUPPORTED_LOCATION':
                return 'We can\'t support this location at the moment! Please enter a broader area';
            case 'ERR_INVALID_EMAIL':
                return 'Please enter a valid email!'
            case 'ERR_INVALID_URL':
                return 'Please enter a valid url!'
            case 'ERR_EMAIL_TAKEN':
                  return 'This email is taken! Please use another one.'
            case 'ERR_INVALID_PHONE':
                  return 'Please enter a valid phone number!'
            default:
                return _default || 'Seems like we ran into an error!'
        }
    },

    getWeekDay(day) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return days[day];
    },

    /**
     * Compares two different objects by key
     * @return {BOOL} True if the same, False if different
     */
    compareObjects(obj1, obj2) {
        for (let key in obj1) {
            if(obj1[key] !== obj2[key]) {
                return false;
                break;
            }
        }
        return true;
    },

    /**
     * getRemoveAddParams
     *
     * @param {string} name name of plural model relation (eg 'outlets')
     * @param {array} original array of original/existing models
     * @param {array} current array of new/current models
     * @return {object} name_add for models to be addeed, name_remove for models to be removed
     */
    getRemoveAddParams(name, original, current) {
        const originalIds = original.filter(o => !o.hasOwnProperty('new')).map(o => o.id);
        const currentIds = current.filter(c => !c.hasOwnProperty('new')).map(c => c.id);
        const newModels = current.filter((m) => m.hasOwnProperty('new')).map(c => omit(c, 'new'));

        return newModels.length
            ? {
                [`${name}_new`]: newModels,
                [`${name}_add`]: difference(currentIds, originalIds),
                [`${name}_remove`]: difference(originalIds, currentIds),
            }
            : {
                [`${name}_add`]: difference(currentIds, originalIds),
                [`${name}_remove`]: difference(originalIds, currentIds),
            };
    },

    /**
     * Util function for getting byline for a gallery
     * @return {String} Byline
     */
    getBylineFromGallery({
        external_account_name = '',
        external_source = '',
        owner = { full_name: '', username: '' },
    } = {}) {
        if (external_account_name) {
            if (external_source) return `${external_account_name} via ${external_source}`;
            return external_account_name;
        }
        if (owner && owner.full_name) return owner.full_name;
        if (owner && owner.username) return owner.username;

        return '';
    },

    getBylineFromPost({
        parent = {
            external_account_name: '',
            external_source: '',
        },
        owner = { full_name: '', username: '' },
        curator = { full_name: '' },
    }, prefix = false) {
        if (parent && parent.external_account_name) {
            if (parent.external_source) return `${parent.external_account_name} via ${parent.external_source}`;
            return `Post by ${parent.external_account_name}`;
        }
        if (owner && owner.full_name) return `${prefix ? 'Post by' : ''} ${owner.full_name}`;
        if (owner && owner.username) return `${prefix ? 'Post by' : ''} ${owner.username}`;
        if (curator && curator.full_name) return `${prefix ? 'Imported by' : ''} ${curator.full_name}`;

        return '';
    },


    getAvgFromMultipoint(loc) {
        let lng;
        let lat;
        if (!loc || !loc.coordinates) return null;
        if (loc.coordinates.length > 1) {
            lng = loc.coordinates.reduce((p, c) => p[0] + c[0])
                / loc.coordinates.length;
            lat = loc.coordinates.reduce((p, c) => p[1] + c[1])
                / loc.coordinates.length;
        } else {
            lng = loc.coordinates[0][0];
            lat = loc.coordinates[0][1];
        }

        return { lat, lng };
    },

    getTitleFromGallery(gallery) {
        if (!gallery) return 'Gallery';
        const { posts, owner } = gallery;
        const titleFrom = (
            gallery.adress
                || (get(posts, 'length')
                    && get(posts.find(p => !!p.address), 'address'))
                || (!!owner ? (owner.full_name || owner.username) : null)
        );
        const title = titleFrom ? `Gallery from ${titleFrom}` : 'Gallery';

        return title;
    },

    pluralToSingularModel(plural) {
        const pluralMap = {
            assignments: 'assignment',
            galleries: 'gallery',
            users: 'user',
            posts: 'post'
        };

        return pluralMap[plural];
    }
};

module.exports = utils;

