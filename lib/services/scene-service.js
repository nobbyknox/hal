'use strict';

let dataStore = require('../dao/data-store.js');
let models = require('../dao/models.js');

let util = require('util');

function find(id, next) {
    if (!id) {
        next(new Error('ID not supplied'));
    } else {
        dataStore.get(models.SceneModel, { 'id': id }, {}, (err, scenes) => {
            if (err) {
                next(err);
            } else {
                if (scenes.length > 0) {
                    next(null, scenes[0]);
                } else {
                    next(new Error(util.format('Invalid ID %d', id)));
                }
            }
        });
    }
}

function get(next) {
    dataStore.get(models.SceneModel, {}, {}, (err, scenes) => {
        next(err, scenes);
    });
}

function create(scene, next) {
    dataStore.create(models.SceneModel, scene, (err, id) => {
        next(err, scene);
    });
}

function update(scene, next) {
    dataStore.update(models.SceneModel, { 'id': scene.id }, {}, scene, (err, data) => {
        next(err, scene);
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
