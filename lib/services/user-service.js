'use strict';

let helper = require('../helper.js');
let dataStore = require('../dao/data-store.js');
let models = require('../dao/models.js');
//let config = helper.getConfig();
//let log = require('bunyan').createLogger(config.loggerOptions);


function get(username, next) {

    dataStore.get(models.UserModel, {'email': username}, {}, function(err, userModels) {

        if (err) {
            next(err);
        } else {

            if (!userModels || userModels.length === 0) {
                next(new Error('Invalid username'));
            } else {
                next(null, userModels[0]);
            }
        }
    });
}

function getAll(next) {
    dataStore.get(models.UserModel, {}, {}, (err, users) => {
        next(err, users);
    });
}


// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    get: get,
    getAll: getAll
};
