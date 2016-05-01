'use strict';

//let log = require('bunyan').createLogger({ "name": "hal", "level": "info", "src": true });
let moment = require('moment');

function currentDatestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Gets the relevant environmental configuration. When no argument is specified,
 * the MALACHITE_ENV environment variable is used to determine which config to return.
 *
 * @param {string} env
 * @returns configuration of the relevant environment
 */
function getConfig(env) {

    let theEnv = env || process.env.HAL_ENV || 'development';
    let config = null;

    if (theEnv === 'development') {
        try {
            config = require('../config/private.json');
        } catch (exc) {
            //log.info('No "private.json" config found');
        }
    }

    if (!config) {
        config = require('../config/' + theEnv + '.json');
    }

    return config;

}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    currentDatestamp: currentDatestamp,
    getConfig: getConfig
};
