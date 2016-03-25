'use strict';

let bookshelf = require('./bookshelf.js');

let LightModel = bookshelf.Model.extend({tableName: 'lights'});
let SceneModel = bookshelf.Model.extend({tableName: 'scenes'});
let ScheduleModel = bookshelf.Model.extend({tableName: 'schedules'});
let TokenCacheModel = bookshelf.Model.extend({tableName: 'token_cache'});
let UserModel = bookshelf.Model.extend({tableName: 'users'});


// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    LightModel: LightModel,
    SceneModel: SceneModel,
    ScheduleModel: ScheduleModel,
    TokenCacheModel: TokenCacheModel,
    UserModel: UserModel
};
