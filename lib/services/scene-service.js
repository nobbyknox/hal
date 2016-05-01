'use strict';

let dataStore = require('../dao/data-store.js');
let models = require('../dao/models.js');
let validator = require('../validators/scene-validator.js');

let util = require('util');

function find(id, next) {
    if (!id) {
        next(new Error('ID not supplied'));
    } else {
        dataStore.get(models.SceneModel, { id: id }, {}, (err, scenes) => {
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

function createSceneLight(sceneLight, next) {
    validator.saveSceneLight(sceneLight)
        .then(function() {
            dataStore.create(models.SceneLightModel, sceneLight, (err, createdObj) => {
                next(err, createdObj);
            });
        }, function(response) {

            next(response);
        });
}

function update(scene, next) {
    dataStore.update(models.SceneModel, { id: scene.id }, {}, scene, (err, data) => {
        next(err, scene);
    });
}

function updateSceneLight(sceneLight, next) {
    validator.saveSceneLight(sceneLight)
        .then(function() {
            dataStore.update(models.SceneLightModel, { id: sceneLight.id }, {}, sceneLight, (err, updatedObj) => {
                next(err, updatedObj);
            });
        }, function(err) {

            next(err);
        });
}

function deleteScene(id, next) {
    validator.deleteScene(id)
        .then(function() {

            deleteSceneLights(id)
                .then(function() {
                    dataStore.remove(models.SceneModel, { id: id }, {}, true, function(err) {
                        next(err);
                    });
                }, function(err) {

                    next(err);
                });

        }, function(err) {

            next(err);
        });
}

function deleteSceneLight(id, next) {
    dataStore.remove(models.SceneLightModel, { id: id }, {}, true, function(err) {
        if (err) log.error(err);  // TODO: Remove after testing
        next(err);
    });
}

/**
 * Find the specific scene light object (light of join table combo).
 */
function findSceneLight(sceneLightId, next) {
    let sql = 'select lights.*, sl.id as scenesLightsId, sl.enabled as enabledInScene ' +
              'from scenes_lights as sl join lights on lights.id = sl.lightId where sl.id = ?';

    dataStore.raw(sql, [sceneLightId], (err, lights) => {
        if (err || lights.length === 0) {
            next(new Error(util.format('Invalid ID %s', sceneLightId)));
        } else {
            next(null, lights[0]);
        }
    });
}

/**
 * Gets the light object of the specified scene.
 */
function getLightsOfScene(sceneId, next) {
    let sql = 'select lights.*, sl.enabled as enabledInScene from lights join scenes_lights as sl on lights.id = sl.lightId where sl.sceneId = ?';
    let bindings = [sceneId];

    dataStore.raw(sql, bindings, function(err, lights) {
        next(err, lights);
    });
}

/**
 * Gets the "scene light" objects of the specified scene.
 *
 * This function is similar as the "getLightsOfScene" function,
 * but it returns join table details as well. The "enabled" field
 * is the most important bitty.
 */
function getSceneLights(sceneId, next) {
    let sql = 'select lights.*, sl.id as scenesLightsId, sl.enabled as enabledInScene ' +
              'from scenes_lights as sl join lights on lights.id = sl.lightId where sl.sceneId = ?';

    dataStore.raw(sql, [sceneId], (err, lights) => {
        next(err, lights);
    });
}


// -----------------------------------------------------------------------------
// Private functions
// -----------------------------------------------------------------------------

function deleteSceneLights(sceneId) {
    return new Promise((resolve, reject) => {
        dataStore.remove(models.SceneLightModel, { sceneId: sceneId }, {}, true, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    create: create,
    deleteScene: deleteScene,
    deleteSceneLight: deleteSceneLight,
    find: find,
    findSceneLight: findSceneLight,
    get: get,
    getLightsOfScene: getLightsOfScene,
    getSceneLights: getSceneLights,
    saveSceneLight: createSceneLight,
    update: update,
    updateSceneLight: updateSceneLight
};
