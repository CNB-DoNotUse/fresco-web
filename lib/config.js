var config = {
	STATIC_CDN: 'https://d1dw1p6sgigznj.cloudfront.net/',
	SESSION_SECRET: 'Flerbelerbler heller falala laller',
	SESSION_REDIS: {
		ENDPOINT: 'fresco-sessions.cls0l1.ng.0001.use1.cache.amazonaws.com',
		PORT: 6379
	},

	API_URL: 'https://api.fresconews.com',
	WEB_ROOT : 'https://fresconews.com',
	STRIPE_SECRET: 'sk_live_QKR23bLkkyHQPF75o6EE36Rp',
	STRIPE_PUBLISHABLE: 'pk_live_saSjliYnCbjFwYfriTzhTQiO',
	PARSE_APP_ID: 'XYBXNv2HLxukd5JGbE6bK4vXy1JlwUVjeTKQEzZU',
	PARSE_API_KEY: 'tpZzCZJCTCk5IJNmNsEMSgxT3nqT4TCjOsZltI0C',
	PRICE_VIDEO: 7000,
	PRICE_IMAGE: 2000,

	// API_URL: 'http://staging.fresconews.com',
	// WEB_ROOT : 'http://alpha.fresconews.com',
	// //STRIPE_SECRET: 'sk_test_3gia4iCZFnNXl0tQyGwEggVM ',
	// //STRIPE_PUBLISHABLE: 'pk_test_o4pMXyj95Vqe5NgV3hb7qmdo',
	// PARSE_APP_ID: 'ttJBFHzdOoPrnwp8IjrZ8cD9d1kog01jiSDAK8Fc',
	// PARSE_API_KEY: '7zNIxJKt1sNjO1VFj4bYh0sVi3pAfURSZcldf2IN',
	// PRICE_VIDEO: 50,
	// PRICE_IMAGE: 50,

	TWITTER: {
		CONSUMER_KEY: '94rpzX0nPHcRVncdP5tBRHUIp',
		CONSUMER_SECRET: 'ke11m42OxmHI1YGu9it9nKPuGNtDMsVUizCd1ZQtTi5g7IOeF6',
		ACCESS_TOKEN_KEY: '2871169317-Mbv4U5wtRnWt9iCxkhehEEaRNaKqHGowyGBXeMx',
		ACCESS_TOKEN_SECRET: 'DB0OMAsgIeb4PdDafzk5ALedC3MsRPngU9v1FfjkXXLd0'
	},

	//VISIBILITY CONSTANTS
	VISIBILITY: {
		PENDING: 0,
		VERIFIED: 1,
		HIGHLIGHT: 2
	},

	SESSION_REFRESH_MS: 5,

	ERR_PAGE_MESSAGES: {
		403: "Unauthorized",
		404: "We've lost it!",
		500: "Internal server error"
	},

	//Parse
	PARSE_API: 'https://api.parse.com/',

	//Ranks
	RANKS: {
		INACTIVE: -1,
		BASIC: 0,
		CONTENT_MANAGER: 1,
		ADMIN: 2
	},
	
	DASH_HOME: '/highlights',

	formatImg: function (img, size){
		if (!size || size == 'original')
			return img;
		if (img.indexOf('d2j1l98c0ybckw.cloudfront.net') == -1)
			return img;

		return img.replace('images/', 'images/' + size + '/');
	},
	
	resolveError: function(err, _default){
		switch(err){
			case 'ERR_OUTLET_UNVERIFIED':
				return 'This outlet is in demo mode. Purchases and downloads are currently disabled.';
			case 'ERR_USER_UNVERIFIED':
				return 'You must verify your email in order to perform this action.';
			case 'ERR_INCOMPLETE':
				return 'There was an error while completing your purchase.';
			default:
				return _default || err;
		}
	},

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
	}
};

module.exports = config;
