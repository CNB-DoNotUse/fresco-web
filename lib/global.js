var moment = require('moment');

/** //

    Description : Global functions used across the app, no context needed

// **/

module.exports = {

    defaultAvatar: "https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png",

    assignmentColor: {
        drafted: '#0047bb',
        active: '#ffc600',
        expired: '#d0021b',
        pending: '#d8d8d8'
    },

    assignmentImage: {
        drafted: '/images/assignment-drafted.png',
        active: '/images/assignment-active.png',
        expired: '/images/assignment-expired.png',
        pending: '/images/assignment-pending.png'
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

    formatTime: function(timestamp) {
        if (!window.timeFormat || window.timeFormat == 'relative') {
            return moment(timestamp).fromNow();
        }
        else if (window.timeFormat == 'absolute') {
            return moment(timestamp).format('MMM Do YYYY, h:mm:ss a');
        }
    },

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
        return feet * 0.304;
    },
    
    feetToMiles: function(feet){
        return feet * 0.000189394;
    },

    milesToFeet: function(miles){
        return miles * 5280;
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

    resolveError: function(err, _default){
        switch(err){
            case 'ERR_OUTLET_UNVERIFIED':
                return 'This outlet is in demo mode. Purchases and downloads are currently disabled.';
            case 'ERR_USER_UNVERIFIED':
                return 'You must verify your email in order to perform this action.';
            case 'ERR_INCOMPLETE':
                return 'There was an error while completing your purchase.';
            case 'ERR_MISSING_PAYMENT_INFO':
                return 'We couldn\'t seem to find your payment info. Please check your outlet settings.';
            case 'ERR_NO_UPDATES':
                return 'No changes we\'re found!';
            default:
                return _default || 'Seems like we ran into an error!'    

        }
    }

}