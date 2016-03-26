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
                    next(new Error(util.format('Invalid ID %s', id)));
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

function getLightsOfScene(sceneId, next) {
    // select lights.name from lights join scenes_lights as sl on lights.id = sl.lightId where sl.sceneId = '7830d3fc-bd6b-436e-a006-03b0619008a0'
    // TODO: Maybe we need an "enabled" column on "scenes_lights"
    let sql = 'select lights.* from lights join scenes_lights as sl on lights.id = sl.lightId where sl.sceneId = ?';
    let bindings = [sceneId];

    dataStore.raw(sql, bindings, function(err, lights) {
        next(err, lights);
    });
}


// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    find: find,
    get: get,
    getLightsOfScene: getLightsOfScene,
    create: create,
    update: update
};
