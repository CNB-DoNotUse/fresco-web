var path = require('path');
var Configurator = require('nconfigurator');

var config = {
    buildConfig: function() {
        Configurator.use('file', path.join(__dirname, '../config/'));

        Configurator.use('env', {
            whitelist:['PORT', 'API_URL', 'REDIS_SESSIONS'],
            transformer: (config, key, value) => {
                if (key == 'REDIS_SESSIONS') {
                    if (!config.REDIS) config.REDIS = {};
                    config.REDIS.SESSIONS = value;
                    return true;
                }
                return false;
            }
        });
        Configurator.use('cli');

        return Configurator.build()
            .then(builtConfig => {
                Object.assign(this, builtConfig);
            })
    }
}

module.exports = config;
