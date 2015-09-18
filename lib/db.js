var config = require('./config');
var mongo = require('mongodb');
var monk = require('monk');

var db = monk(config.DB, {
	username: config.DB_USER,
	password: config.DB_PASS
});

module.exports = db;