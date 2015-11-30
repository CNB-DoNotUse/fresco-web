/** //

    Description : Global functions used across the app, regardless of context

// **/

module.exports = {

    /**
     * Converts timestamp to formatted date
     */
    timestampToDate: function(timestamp){
    	
        var a = new Date(timestamp);
    	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    	var year = a.getFullYear();
    	var month = months[a.getMonth()];
    	var date = a.getDate();
    	var hour = a.getHours() == 0 ? 12 : a.getHours() % 12;
    	var ampm = a.getHours() >= 12 ? 'PM' : 'AM';
    	var min = a.getMinutes();
    	min = min < 10 ? '0' + min : min;
    	var sec = a.getSeconds();
    	sec = sec < 10 ? '0' + sec : sec;
    	var time = month + ' ' + date + ' ' + hour + ':' + min + ampm ;
    	
        return time;
    },

    /**
     * Returns relative timestamp string
     */
    getTimeAgo: function(timestamp){
        
        var intervals = {
    	        year: 31556926, month: 2629744, week: 604800, day: 86400, hour: 3600, minute: 60
    		};

        var diff = Date.now() - timestamp;
    	diff = Math.floor(diff / 1000);

        //now we just find the difference
        if (diff <= 0)
            return 'Just now';
        if (diff < 60)
            return diff == 1 ? diff + ' second ago' : diff + ' seconds ago';
        if (diff >= 60 && diff < intervals['hour']){
            diff = Math.floor(diff/intervals['minute']);
            return diff == 1 ? diff + ' minute ago' : diff + ' minutes ago';
        }
        if (diff >= intervals['hour'] && diff < intervals['day']){
            diff = Math.floor(diff/intervals['hour']);
            return diff == 1 ? diff + ' hour ago' : diff + ' hours ago';
        }
    	if (diff >= intervals['day'] && diff < intervals['week']){
            diff = Math.floor(diff/intervals['day']);
            return diff == 1 ? diff + ' day ago' : diff + ' days ago';
        }
        if (diff >= intervals['week'] && diff < intervals['month']){
            diff = Math.floor(diff/intervals['week']);
            return diff == 1 ? diff + ' week ago' : diff + ' weeks ago';
        }
        if (diff >= intervals['month'] && diff < intervals['year']){
            diff = Math.floor(diff/intervals['month']);
            return diff == 1 ? diff + ' month ago' : diff + ' months ago';
        }
        if (diff >= intervals['year']){
            diff = Math.floor(diff/intervals['year']);
            return diff == 1 ? diff + ' year ago' : diff + ' years ago';
        }
    },

    isEmptyString: function(string){
        return /\S/.test(string)
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
     * Returns a plural value ending of either `s` or nothing
     * @param  {array} array The array to check
     * @return {char} character at the end
     */
    isPlural: function(count){
        if(count == 0 || count > 1)
            return true;
        else
            return false;
    },

    /**
     * Formats Video URL
     * @param  {string} video Video URL
     * @return {string} URL string of the vide file, pointing to the mp4 representation
     */
    formatVideo: function(video){

	   return video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4')

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
    }
	
}