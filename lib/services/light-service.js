'use strict';

let dataStore = require('../dao/data-store.js');
let models = require('../dao/models.js');

let util = require('util');

function find(id, next) {
    if (!id) {
        next(new Error('ID not supplied'));
    } else {
        dataStore.get(models.LightModel, { id: id }, {}, (err, lights) => {
            if (err) {
                next(err);
            } else {
                if (lights.length > 0) {
                    next(null, lights[0]);
                } else {
                    // TODO: Check that all services that issue a similar message
                    // changes from an int (%d) placeholder to string placeholder.
                    next(new Error(util.format('Invalid ID %s', id)));
                }
            }
        });
    }
}

// TODO: This function should accept a superGet options object.
// Also, create other methods for things like getting all enabled
// lights, or visible this or that.
function get(enabled, next) {

    let where = {};

    if (enabled != undefined) {
        where.enabled = enabled;
    }

    dataStore.get(models.LightModel, where, {}, (err, lights) => {
        next(err, lights);
    });
}

function create(light, next) {
    dataStore.create(models.LightModel, light, (err, id) => {
        next(err, light);
    });
}

function update(light, next) {
    dataStore.update(models.LightModel, { id: light.id }, {}, light, (err, data) => {
        next(err, light);
    });
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    find: find,
    get: get,
    create: create,
    update: update
};
