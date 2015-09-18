var config = {
	//Database constants
	//DB : 'localhost:27017/fresco',
	DB : 'db.fresconews.com:27017/fresco',
	DB_USER : 'frescoUser',
	DB_PASS : 'kjs9^&IUb87*&$G978gdfeg87gfe87s3##', //

	FRESCO_ROOT : 'https://beta.fresconews.com/',

	//CDN Constants
	AVATAR_DEFAULT : 'https://d2t62bltxqtzkl.cloudfront.net/avatar_default.png',
	CLOUDFRONT_POSTS : 'https://d2j1l98c0ybckw.cloudfront.net/',
	CLOUDFRONT_AVATARS : 'https://d2t62bltxqtzkl.cloudfront.net/',
	CDN_BUCKET : 'fresconews',
	BUCKET_AVATARS: 'com.fresconews.avatars',
	BUCKET_POSTS: 'com.fresconews.posts',
	BUCKET_RAW : 'com.fresconews.raw',
	CDN_IMAGES : 'images/',
	CDN_VIDEOS : 'videos/',
	CDN_VIDEOS_STREAM : '',
	CDN_VIDEOS_MP4 : 'mp4/',
	CDN_THUMBS : 'thumbnails/',
	UPLOAD_PATH : '/home/ubuntu/fresco/uploads/',
	SMALL_IMG_MAX_HEIGHT : 288,

	//Stripe keys
	//STRIPE_PUBLIC: 'pk_test_o4pMXyj95Vqe5NgV3hb7qmdo',
	//STRIPE_SECRET: 'sk_test_3gia4iCZFnNXl0tQyGwEggVM',
	STRIPE_PUBLIC: 'pk_live_saSjliYnCbjFwYfriTzhTQiO',
	STRIPE_SECRET: 'sk_live_QKR23bLkkyHQPF75o6EE36Rp',

	//Twitter constants
	CONSUMER_KEY : '94rpzX0nPHcRVncdP5tBRHUIp',
	CONSUMER_SECRET : 'ke11m42OxmHI1YGu9it9nKPuGNtDMsVUizCd1ZQtTi5g7IOeF6',
	OAUTH_TOKEN : '2871169317-5vcv8P4tlcRaFCmDsRFNHylSR3vT6hOmovKurVP',
	OAUTH_SECRET : '5vC7Z3ik5xgdslult5wfVCofHjJprkypBOofTzghNN5z4',

	//Parse keys
	PARSE_USER: 'https://api.parse.com/1/users',
	//PARSE_APP_ID: 'ttJBFHzdOoPrnwp8IjrZ8cD9d1kog01jiSDAK8Fc',
	//PARSE_API_KEY: '7zNIxJKt1sNjO1VFj4bYh0sVi3pAfURSZcldf2IN',
	PARSE_APP_ID: 'XYBXNv2HLxukd5JGbE6bK4vXy1JlwUVjeTKQEzZU',
	PARSE_API_KEY: 'tpZzCZJCTCk5IJNmNsEMSgxT3nqT4TCjOsZltI0C',
	
	DEFAULT_SETTINGS: {
		radius: 0
	},
	
	//Mandrill keys
	MANDRILL_API_KEY: 'uUhHD_y81DmLKYdHMhxDcQ',

	//Google constants
	MAP_KEY : 'AIzaSyDpbDJf7Dzj4fIwk37QUAVl7PNGMFk5sbg',
	REVERSEGEO_PATH : 'https://maps.googleapis.com/maps/api/geocode/json?result_type=political&latlng=[LAT],[LON]&key=AIzaSyDpbDJf7Dzj4fIwk37QUAVl7PNGMFk5sbg',

	//Misc Constants
	PHOTOPATH : 'uploads/',
	RE_CAPTCHA : '6Lc9Z_MSAAAAAKP7EsW7Ecocl7IeUrOoHkA_6T4L',
	//COOKIE_TIME : 60 * 60 * 24,
	COOKIE_KEY : 'session.sess',
	COOKIE_SECRET : ']6U4Q8N~}i1G*]%T>D013~}nE>DcB3Bb)sS?{teMCQr74`ZlGr<088>Gs*P!<k$',
	COOKIE_MAX_AGE : 60 * 60 * 1000,

	//Ranks
	RANKS: {
		INACTIVE: -1,
		BASIC: 0,
		CONTENT_MANAGER: 1,
		ADMIN: 2
	},
	
	//Notification types
	NOTIF_ASSIGNMENT_NEW: "assignment",
	NOTIF_ASSIGNMENT_UPDATED: "assignment-updated",
	NOTIF_ASSIGNMENT_EXPIRED: "assignment-expired",
	NOTIF_BREAKING_NEWS: "breaking-news",
	NOTIF_SOCIAL: "social",
	NOTIF_USE: "use",

	//PATHS
	PATH_ROOT : 'http://localhost:3000',

	//DB COLLECTIONS
	COLLECTION_USERS : 'users',
	COLLECTION_STORIES : 'stories',
	COLLECTION_GALLERIES : 'galleries',
	COLLECTION_POSTS : 'posts',
	COLLECTION_ARTICLES : 'articles',
	COLLECTION_OUTLETS : 'outlets',
	COLLECTION_ASSIGNMENTS : 'assignments',
	COLLECTION_TOKENS: 'tokens',
	COLLECTION_NOTIFICATIONS: 'notifications',
	COLLECTION_AUTHTOKENS: 'authtokens',

	//VISIBILITY CONSTANTS
	VISIBILITY_DELETED : -1,
	VISIBILITY_PENDING : 0,
	VISIBILITY_VERIFIED : 1,
	VISIBILITY_HIGHLIGHT : 2,
	
	//ASSIGNMENT CONSTANTS
	EARTH_RADIUS_MILES: 3963.2,
	MAX_ASSIGNMENT_RADIUS: 5,

	//FUNCTIONS
	extractTags: function(caption){
		return caption.trim != '' ? caption.trim().split(' ') : [];	
	},
	resizeToThumbnail: function(size){
		var ratio = size.width / size.height;
		size.height = config.SMALL_IMG_MAX_HEIGHT;
		size.width = Math.floor(size.height * ratio);
	},
	cropAvatar: function(path, callback){
		var gm = require('gm');
			//faced = new require('faced').Faced();
			
		gm(path).size(function(err, size){
			if (err) return callback(err);
			
			var landscape = size.width > size.height,
				newsize = 1024 > size.height ? size.height : 1024;
				
			var crop = landscape ? size.height : size.width;
			
			return gm(path).crop(crop, crop, landscape ? Math.floor((size.width - crop) / 2) : 0, Math.floor(landscape ? 0 : Math.floor((size.width - crop) / 2)))
							.resize(newsize)
							.write(path, function(err){callback(err);});
			
			/*faced.detect(path, function(faces, image){
				
				if (!faces || faces.length == 0){
					
				}else{
					var crop = {
						left : faces[0].getX(),
						right : faces[0].getX2(),
						top : faces[0].getY(),
						bottom : faces[0].getY2(),
						width: faces[0].getX2() - faces[0].getX(),
						height: faces[0].getY2() - faces[0].getY(),
					};
					
					for (var i = 1; i < faces.length; ++i){
						if (faces[i].getX() < crop.left)
							crop.left = faces[i].getX();
						if (faces[i].getX2() > crop.right)
							crop.right = faces[i].getX2();
						if (faces[i].getY() < crop.top)
							crop.top = faces[i].getY();
						if (faces[i].getY2() < crop.bottom)
							crop.bottom = faces[i].getY2();
							
						crop.height = crop.bottom - crop.top;
						crop.width = crop.right - crop.left;
					}
					
					
				}
			});*/
		});
	},
	
	//VALIDATORS
	isValidRank: function(rank){
		return typeof rank == 'number';
	},
	isValidCaption: function(caption){
		return typeof caption == 'string';
	},
	isValidNotifType: function(type){
		return 	type == config.NOTIF_ASSIGNMENT_EXPIRED ||
				type == config.NOTIF_ASSIGNMENT_NEW ||
				type == config.NOTIF_ASSIGNMENT_UPDATED ||
				type == config.NOTIF_BREAKING_NEWS ||
				type == config.NOTIF_SOCIAL ||
				type == config.NOTIF_USE;	
	},
	isValidArticleTitle: function(title){
		return typeof title == 'string';
	},
	isValidOutletTitle: function(title){
		return typeof title == 'string';
	},
	isValidAssignmentTitle: function(title){
		return typeof title == 'string';
	},
	isValidGalleryTitle: function(title){
		return typeof title == 'string';
	},
	isValidUsername: function(username){
		return typeof username == 'string';
	},
	isValidTwitter: function(twitter){
		return typeof twitter == 'string';
	},
	isValidPostType: function(type){
		return 	type == 'image' ||
				type == 'video';
	},
	isValidEmail: function(email){
		return 	typeof email == 'string' &&
				/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(email);
	},
	isValidName: function(name){
		return 	typeof name == 'string';// &&
				///^([A-Za-z, .'-]{0,30})$/.test(name);
	},
	isValidPassword: function(passwd){
		return	typeof passwd == 'string';
	},
	isValidArrayString: function(tagstr){
		return 	typeof tagstr == 'string' &&
				/^[a-zA-Z0-9,]*$/.test(tagstr);
	},
	isValidPostArray: function(arr){
		for (var key in arr){
			if (!(
					(typeof arr[key].byline == "string" || arr[key].byline == null) &&
					(typeof arr[key].source == "string" || arr[key].source == null) &&
					(arr[key].type == 'image' || arr[key].type == 'video') &&
					typeof arr[key].lat == 'number' &&
					typeof arr[key].lon == 'number'
				))
				return false;
		}
	
		return true;
	},
	isGeoJSON: function(obj){
		return 	obj &&
				obj.type == "Point" &&
				Array.isArray(obj.coordinates) &&
				typeof obj.coordinates[0] == "number" &&
				typeof obj.coordinates[1] == "number";
	},
	isValidUserLocation: function(loc){
		return 	typeof loc.timestamp == "number" &&
				this.isGeoJSON(loc.geo);
	},
	isValidVisibility: function(visibility){
		return (typeof visibility == 'number') && visibility >= -1 && visibility <= 2; 
	},
	
	//UTILS
	getContentTypeByFile: function(fileName) {
		var rc = 'application/octet-stream';
		var fn = fileName.toLowerCase();
		if (fn.indexOf('.html') >= 0) rc = 'text/html';
		else if (fn.indexOf('.css') >= 0) rc = 'text/css';
		else if (fn.indexOf('.json') >= 0) rc = 'application/json';
		else if (fn.indexOf('.js') >= 0) rc = 'application/x-javascript';
		else if (fn.indexOf('.png') >= 0) rc = 'image/png';
		else if (fn.indexOf('.jpg') >= 0) rc = 'image/jpg';

		return rc;
	},
	convertMilesToRadians: function(miles){
		return miles / this.EARTH_RADIUS_MILES;
	},
	convertRadiansToMiles: function(radians){
		return radians * this.EARTH_RADIUS_MILES;
	},
	convertMilesToMeters: function(miles){
		return miles * 1609.34;
	},
	degreesToRadians: function(deg){
		return (deg * Math.PI) / 180;
	},
	geodesicDistanceMiles: function(point1, point2) {
		var lat1 = this.degreesToRadians(point1.coordinates[1]);
		var lat2 = this.degreesToRadians(point2.coordinates[1]);
		
		var gamma = this.degreesToRadians(point2.coordinates[0] - point1.coordinates[0]);
		return Math.acos( Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2) * Math.cos(gamma) ) * this.EARTH_RADIUS_MILES;
	},
	//THIS IS A BIG FAT LIE, IT JUST DOES AN EULARIAN MIDPOINT
	geodesicMidpoint: function(point1, point2) {
		return {
			type:"Point", 
			coordinates:[
				(point1.coordinates[0] + point2.coordinates[0]) / 2,
				(point1.coordinates[1] + point2.coordinates[1]) / 2
			]
		};
	}
};

module.exports = config;