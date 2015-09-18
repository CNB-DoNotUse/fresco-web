var Parse = require('parse').Parse,
	config = require('./config');
	
Parse.initialize(config.PARSE_APP_ID, config.PARSE_JS_API_KEY);

module.exports = Parse;