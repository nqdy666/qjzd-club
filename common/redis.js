var config = require('../config');
var redis = require('redis');

var client = redis.createClient(config.redis_port, config.redis_host, config.redis_options);

exports = module.exports = client;
