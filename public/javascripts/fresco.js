/*  To-do:
	• Optimize event delegations to $([s]).on(click, [child], [handler]);
*/

// var API_URL = 'https://api.fresconews.com',
var API_URL = 'http://staging.fresconews.com',
	FEET_PER_MILE = 5280;

String.prototype.capitalize = function(){
	return this.charAt(0).toUpperCase() + this.slice(1);
}

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

function setTimeDisplayType(timeFormat) {
	window.timeFormat = timeFormat;
	$('.timestring').each(function(i, elem) {
		var timestamp = parseInt($(elem).data('timestamp'));
		$(elem).text(formatTime(timestamp));
	});
}

function formatTime(timestamp) {
	if (!window.timeFormat || window.timeFormat == 'relative') {
		return getTimeAgo(Date.now(), timestamp);
	}
	else if (window.timeFormat == 'absolute') {
		return timestampToDate(timestamp);
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
			return 'We couldn\'t seem to find your payment info. Please check your outlet settings.';
		default:
			return _default || 'Seems like we ran into an error'	

	}
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
