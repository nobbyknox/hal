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

function createSceneLight(sceneLight, next) {
    dataStore.create(models.SceneLightModel, sceneLight, (err, createdObj) => {
        next(err, createdObj);
    });
}

function update(scene, next) {
    dataStore.update(models.SceneModel, { 'id': scene.id }, {}, scene, (err, data) => {
        next(err, scene);
    });
}

function updateSceneLight(sceneLight, next) {
    dataStore.update(models.SceneLightModel, { 'id': sceneLight.id }, {}, sceneLight, (err, updatedObj) => {
        next(err, updatedObj);
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
    let sql = 'select lights.* from lights join scenes_lights as sl on lights.id = sl.lightId where sl.sceneId = ?';
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
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    find: find,
    get: get,
    findSceneLight: findSceneLight,
    getLightsOfScene: getLightsOfScene,
    getSceneLights: getSceneLights,
    create: create,
    createSceneLight: createSceneLight,
    update: update,
    updateSceneLight: updateSceneLight
};
