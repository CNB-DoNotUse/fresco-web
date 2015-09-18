var bunyan = require('bunyan');
var logger = bunyan.createLogger({name: "fresco-api"});

module.exports = logger;