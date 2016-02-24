var path = require('path');
var Configurator = require('nconfigurator');

var config = {
    buildConfig: function() {
        Configurator.use('file', path.join(__dirname, '../config/base.json'));
        Configurator.use('file', path.join(__dirname, '../config/dev.json'));

        Configurator.use('env', {whitelist:['PORT']});
        Configurator.use('cli');

        return Configurator.build()
            .then(builtConfig => {
                Object.assign(this, builtConfig);
            })
    }
}

module.exports = config;
