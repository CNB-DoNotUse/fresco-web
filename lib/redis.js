const config = require('./config');
const redis = require('redis');
const rClient = redis.createClient(6379, config.REDIS.SESSIONS, { enable_offline_queue: false });

module.exports = rClient;