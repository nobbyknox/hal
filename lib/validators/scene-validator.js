'use strict';

let dataStore = require('../dao/data-store.js');
let models = require('../dao/models.js');
let helper = require('../helper.js');
let config = helper.getConfig();
let log = require('bunyan').createLogger(config.loggerOptions);

let util = require('util');


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
    saveSceneLight: saveSceneLight
};
