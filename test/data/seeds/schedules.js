'use strict';

exports.seed = function (knex, Promise) {
    return Promise.join(
        // Deletes ALL existing entries
        knex('schedules').del(),

        // Inserts seed entries
        knex('schedules').insert({
            id: 1,
            cron: '0 32 4 * * 1-5',
            sceneId: 1,
            description: 'Wake-up lights',
            enabled: 1
        }),
        knex('schedules').insert({
            id: 2,
            cron: '0 30 23 * * 1-5',
            sceneId: 2,
            description: 'Sleepy all off',
            enabled: 1
        }),
        knex('schedules').insert({
            id: 3,
            cron: '0 0 13 * * 1-5',
            sceneId: 3,
            description: 'Test schedule',
            enabled: 0
        })
    );
};
