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
                    next(new Error(util.format('Invalid ID %s', id)));
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

function create(schedule, next) {
    dataStore.create(models.ScheduleModel, schedule, (err, id) => {
        next(err, schedule);
    });
}

function update(schedule, next) {
    dataStore.update(models.ScheduleModel, { 'id': schedule.id }, {}, schedule, (err, data) => {
        next(err, schedule);
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
