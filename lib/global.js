var moment = require('moment');

/** //
  Description : Global functions used across the app, no context needed
// **/

module.exports = {

    CDN:    "https://d1dw1p6sgigznj.cloudfront.net",

    defaultAvatar: "https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png",

    postCount: 32,

    //Ranks
    RANKS: {
      INACTIVE: -1,
      BASIC: 0,
      CONTENT_MANAGER: 1,
      ADMIN: 2
    },

    mapStyles: [{"featureType": "all", "elementType":"all", "stylers": [{"gamma":1.54}]},
            {"featureType":"road.highway","elementType":"all","stylers":[{"gamma":1.54}]},
            {"featureType":"poi.park","elementType":"all","stylers":[{"gamma":1.26}]},
            {"featureType":"poi.park","elementType":"labels.text","stylers":[{"saturation":-54}]}],

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
            var lastDay = Date.now() - 86400000;

            if(timestamp < lastDay) {
                return moment(timestamp).format('MMMM Do, YYYY')
            } else {
                return moment(timestamp).format('h:mm A');
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
    formatImg: function(img, size){

        var img = img || '';

        if (!size || size == 'original')
    		return img;
    	if (img.indexOf('d2j1l98c0ybckw.cloudfront.net') == -1)
    		return img;

    	return img.replace('images/', 'images/' + size + '/');
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
        var points = [],
            degreeStep = 360 / numSides;

        center = new google.maps.LatLng(center.lat, center.lng);

        for(var i = 0; i < numSides; i++){
            var gpos = google.maps.geometry.spherical.computeOffset(center, radius, degreeStep * i);
            points.push([gpos.lng(), gpos.lat()]);
        };

        // Duplicate the last point to close the geojson ring
        points.push(points[0]);

        return [points];
    },

    generatePolygonFromBounds: function(bounds) {
        //Generate the polygon from the google maps bounds
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
      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[day];
    }

}
