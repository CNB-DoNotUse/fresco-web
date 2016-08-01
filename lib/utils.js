const moment = require('moment');
const difference = require('lodash/difference');

/**
 * Global functions used across the app, no context needed
 * @type {Object}
 */
const utils = {

    CDN: 'https://d1dw1p6sgigznj.cloudfront.net',

    defaultAvatar: 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png',

    defaultSmallAvatar: 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1-small.png',

    postCount: 32,

    RATINGS: {
        VERIFIED: 1,
        SKIPPED: 2
    },

    limits: {
        galleryItems: 10,
    },

    // Ranks
    RANKS: {
        INACTIVE: -1,
        BASIC: 0,
        CONTENT_MANAGER: 1,
        ADMIN: 2,
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
    setTimeDisplayType: function(timeFormat) {
        //Set the windows time format
        window.timeFormat = timeFormat;

        var timeStrings = document.getElementsByClassName('timestring');

        //Change all timestamps to new format
        for (var i = timeStrings.length - 1; i >= 0; i--) {
            var timestamp = parseInt(timeStrings[i].dataset.timestamp);
            timeStrings[i].innerHTML = this.formatTime(timestamp);
        };
    },

    formatTime: function(timestamp, relative) {
        if(typeof(relative) == 'undefined') relative = false;

        if (!relative && (typeof(window) === 'undefined' || !window.timeFormat || window.timeFormat == 'relative')) {
            return moment(timestamp).fromNow();
        } else if (window.timeFormat == 'absolute' || relative) {
            if(moment(Date.now()).startOf('day').isSame(moment(timestamp).startOf('day'))) {
                return moment(timestamp).format('h:mm A');
            } else {
                return moment(timestamp).format('MMM Do, YYYY, h:mm A')
            }
        }
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
            thumb: '50x50',
            small: '100x100',
            medium: '500x500',
            large: '1000x1000',
        };

        // for dev env
        if (formatted.indexOf('cdn.dev') !== -1) {
            if (location.protocol !== 'https:' && formatted.indexOf('https') !== -1) {
                formatted = formatted.replace('https', 'http');
            }
        }

        if (!size || size === 'original' || !sizeToRes[size]) return formatted;
        return formatted.replace('photo/', `photo/${sizeToRes[size]}/`);
    },

    /**
     * Formats Video URL
     * @param  {string} video Video URL
     * @return {string} URL string of the vide file, pointing to the mp4 representation
     */
    formatVideo: function(video){
       return video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4')
    },

    /**
     * Returns a check if the count is plural
     * @param  {int} count The intenger count to check
     * @return {BOOL} YES if it us plural, NO if it's not
     */
    isPlural: function(count){
        if(count == 0 || count > 1)
            return true;
        else
            return false;
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
    hoursToExpiration: function(timestamp){
        var expirationDate = new Date(timestamp),
            expirationHours = Math.ceil((expirationDate - Date.now()) / 1000 / 60 / 60);

        return expirationHours > 0 ? expirationHours : 0;
    },

    /**
     * Returns byline based on passed ByLine component
     * @param  {object} Gallery
     * @param  {React Component} ByLine
     */
    getBylineFromComponent: function(Gallery, ByLine) {

        // If a submission, return the byline.
        if(ByLine.refs.byline) {
            return {
                byline: ByLine.refs.byline.value
            }
        }

        // Check if is gallery created from multiple posts.
        var postIdOccurances = {};

        // Loop through gallery posts
        for(var p in Gallery.posts) {
          // Assign each parent as key in object.
          postIdOccurances[Gallery.posts[p].parent] = 1;

          // If there is more than one parent, hide.
          if(Object.keys(postIdOccurances).length > 1) {
            return {};
          }
        }

        var name            = ByLine.refs.name.value,
            affiliation     = ByLine.refs.affiliation.value.trim(),
            params          = {};

        //From twitter
        if(Gallery.posts[0].meta && Gallery.posts[0].meta.twitter) {
            if(affiliation.length === 0) {
                params.byline = name + ' via Fresco News';
            } else {
                params.byline = name + ' / ' + affiliation;
            }
        }

        params.other_origin_name = name;
        params.other_origin_affiliation = affiliation;

        return params;
    },

    /**
     * Compares multiline values
     */
    compareMultiline: function(text1, text2) {
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

    resolveError: function(err, _default){
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
     * Merges assignments between `global` & `nearby`
     * @param {string} fieldToSortBy The Date field to sort on
     * @return {array} The merged array of assignments
     */
    mergeAssignments(assignments, fieldToSortBy, direction = 'asc') {
        return assignments.nearby.concat(assignments.global).sort((a1, a2) => {
            if (direction === 'desc') {
                return new Date(a2[fieldToSortBy]) - new Date(a1[fieldToSortBy]);
            }

            return new Date(a1[fieldToSortBy]) - new Date(a2[fieldToSortBy]);
        });
    },

    /**
     * getRemoveAddParams
     *
     * @param {string} name name of plural model relation (eg 'outlets')
     * @param {array} oldIds array of original/existing model ids
     * @param {array} newIds array of new/current model ids
     * @return {object} name_add for models to be addeed, name_remove for models to be removed
     */
    getRemoveAddParams(name, original, current) {
        const newModels = current.filter((m) => m.hasOwnProperty('new'));
        const originalIds = original.filter(o => !o.hasOwnProperty('new')).map(o => o.id);
        const currentIds = current.filter(c => !c.hasOwnProperty('new')).map(c => c.id);

        return {
            [`${name}_new`]: newModels,
            [`${name}_add`]: difference(currentIds, originalIds),
            [`${name}_remove`]: difference(originalIds, currentIds),
        };
    },
};

module.exports = utils;
