'use strict';

let dataStore = require('../dao/data-store.js');
let models = require('../dao/models.js');

let util = require('util');

function find(id, next) {
    if (!id) {
        next(new Error('ID not supplied'));
    } else {
        dataStore.get(models.ScheduleModel, { 'id': id }, {}, (err, schedules) => {
            if (err) {
                next(err);
            } else {
                if (schedules.length > 0) {
                    next(null, schedules[0]);
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

    dataStore.get(models.ScheduleModel, where, {}, (err, schedules) => {
        next(err, schedules);
    });
}


// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    find: find,
    get: get
};
