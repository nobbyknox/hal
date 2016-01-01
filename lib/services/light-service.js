'use strict';

let helper = require('../helper.js');
let dataStore = require('../dao/data-store.js');
let models = require('../dao/models.js');

let util = require('util');

function find(id, next) {
    if (!id) {
        next(new Error('ID not supplied'));
    } else {
        dataStore.get(models.LightModel, { 'id': id }, {}, (err, lights) => {
            if (err) {
                next(err);
            } else {
                if (lights.length > 0) {
                    next(null, lights[0]);
                } else {
                    next(new Error(util.format('Invalid ID %d', id)));
                }
            }
        });
    }
}

function get(enabled, next) {

    let where = {};

    if (enabled != undefined) {
        where.enabled = enabled;
    }

    dataStore.get(models.LightModel, where, {}, (err, lights) => {
        next(err, lights);
    });
}


// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    find: find,
    get: get
};
