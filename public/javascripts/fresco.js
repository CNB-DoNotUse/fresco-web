/*  To-do:
	• Optimize event delegations to $([s]).on(click, [child], [handler]);
*/

// var API_URL = 'https://api.fresconews.com';
var API_URL = 'http://staging.fresconews.com',
	FEET_PER_MILE = 5280;

/*
Custom prototype methods
*/
String.prototype.capitalize = function(){
	return ;
};

/*
Event Listeners
*/
function attachOnImageLoadError(img, size){
	size = size || 'medium';

	img.error(function(){
		var _this = $(this),
				timeout = parseInt(_this.prop('data-t') || 1),
				lasttimeout = parseInt(_this.prop('data-lt') || 1);
				
		_this.prop('data-lt', timeout);
		_this.prop('data-t', timeout + lasttimeout);
		_this.prop('data-src', _this.prop('src'));
		_this.prop('src','https://d2j1l98c0ybckw.cloudfront.net/images/'+size+'/missing.png');

		setTimeout(function(){
			_this.prop('src', _this.prop('data-src'));
		}, timeout * 1000);
	});
}

/*
Utility functions
*/
function resetFileElement(e) {
  e.wrap('<form>').closest('form').get(0).reset();
  e.unwrap();
}

function milesToMeters(miles){
	return 1609.34 * miles;
}
function feetToMeters(feet){
	return feet * 0.304;
}
function feetToMiles(feet){
	return feet * 0.000189394;
}
function milesToFeet(miles){
	return miles * 5280;
}

function timestampToDate(UNIX_timestamp){
	var a = new Date(UNIX_timestamp);
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
}

function getTimeAgo(now, timestamp){
    var intervals = {
	        year: 31556926, month: 2629744, week: 604800, day: 86400, hour: 3600, minute: 60
		};
		
    var diff = now - timestamp;
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
}

function resolveError(err, _default){
	switch(err){
		case 'ERR_OUTLET_UNVERIFIED':
			return 'This outlet is in demo mode. Purchases and downloads are currently disabled.';
		case 'ERR_USER_UNVERIFIED':
			return 'You must verify your email in order to perform this action.';
		case 'ERR_INCOMPLETE':
			return 'There was an error while completing your purchase.';
		case 'ERR_MISSING_PAYMENT_INFO':
			return 'Payment info not found.';
		default:
			return _default || err.toString().capitalize();
	}
}
	
function formatImg(img, size){
	if (!size || size == 'original')
		return img;
	if (img.indexOf('d2j1l98c0ybckw.cloudfront.net') == -1)
		return img;

	return img.replace('images/', 'images/' + size + '/');
}

function getUrlVars(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

$(document).ready(function() {
	//img links
	$('.img-link').click(function(){
		window.location.assign($(this).data('href'));
	});

	//Numberic input fields
	$('input.integer').keypress(function(e){
        if ([8,9,13,37,39,48,49,50,51,52,53,54,55,56,57].indexOf(e.which) == -1)
            e.preventDefault();
    });
	//Float input field
	$('input.float').keypress(function(e){
        if (!([8,9,13,37,39,48,49,50,51,52,53,54,55,56,57].indexOf(e.which) >= 0 ||
              (e.which == 46 && $(this).val().indexOf('.') == -1)))
            e.preventDefault();
    });
	
	//Auto-resize textarea fields
	$('textarea').on('change textInput input', function(e){
		$(this).css('height', Math.min($(this).prop('scrollHeight'), 250) + 'px');
	});
});