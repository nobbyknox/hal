'use strict';

let dataStore = require('../dao/data-store.js');
let models = require('../dao/models.js');

let util = require('util');


function deleteScene(id) {
    return new Promise((resolve, reject) => {

        let sql = 'select count(*) as scheduleCount from schedules where sceneId = ?';

        dataStore.raw(sql, [id], function(err, data) {
            if (err) {
                reject(err);
            } else {
                if (data[0].scheduleCount > 0) {
                    reject(new Error('This scene is used in a schedule. Unable to delete.'));
                } else {
                    resolve();
                }
            }
        });
    });
}

function saveSceneLight(sceneLight) {

    return new Promise((resolve, reject) => {

        let where = {
            'sceneId': sceneLight.sceneId,
            'lightId': sceneLight.lightId
        };

        let whereNot = {
            'id': sceneLight.id
        };

        dataStore.get(models.SceneLightModel, where, whereNot, (err, sceneLights) => {
            if (err) {
                reject(err);
            } else {
                if (sceneLights && sceneLights.length > 0) {
                    reject(new Error('Light has already been added to the scene'))
                } else {
                    resolve();
                }
            }
        });
    });
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    deleteScene: deleteScene,
    saveSceneLight: saveSceneLight
};
