
/**
 * Select provider for email channel based on provider
 * @param {String} provider - mail provider, for ex- smtp, amazon ses, o365, etc
 */
function mailSelector(provider) {
    let mod;
    if (provider === 'smtp') {
        mod = require('./smtp');
    }
    /**Define other types of mail providers like amazon ses, etc */
    // else if(type === 'defineothertypes')
    return mod;
}

module.exports = {
    /**
     * Initialize email channel with the specified provider
     * @param {String} provider - email provider
     * @param {Object} config - configuration of the mail provider
     * @param {Object} _log - logger module
     * @param {Object} _crypt - encryption module
     */
    init: function (provider, config, _log, _crypt, _settings) {
        log = _log;
        crypt = _crypt;
        settings = _settings;

        mailModule = mailSelector(provider);
        if (mailModule) {
            mailModule.init(_log, _crypt, _settings);
            mailModule.loadConfig(config);
        } else {
            log.error('Email Module Initialization Failed : email module of type ' + type + ' not found');
        }

    },
    /**
     * Update exisiting provider's config or initialize a new provider
     * by replacing the old one.
     * @param {String} provider - email provider
     * @param {Object} cnfg - email provider's configuration
     */
    updateConfig: function (provider, cnfg) {
        if (mailModule && mailModule.name) {
            if (provider === mailModule.name) {
                mailModule.loadConfig(cnfg);
            } else {
                mailModule.destroy();
                mailModule = null;
                this.init(provider, cnfg, log, crypt, settings); //Initialize another provider
            }
        } else {
            this.init(provider, cnfg, log, crypt, settings);
        }
    },
    /**Send Email */
    send: function (...arguments) {
        if (mailModule) {
            mailModule.send(...arguments);
        }
        //TODO: debug or warn log if mail module not found
    },
    /**Destroy existing email provider */
    destroy: function () {
        if (mailModule) {
            mailModule.destroy();
            mailModule = null;
        }
    },
    /**Test configured mail provider */
    test: function (...arguments) {
        return when.promise((resolve, reject) => {
            if (mailModule) {
                mailModule.test(...arguments).then((data) => {
                    return resolve(data);
                }).otherwise((err) => {
                    return reject(err);
                });
            } else {
                return reject({ error: { code: "", msg: "Provider is missing for the channel" } });
            }
        });
    }
}
