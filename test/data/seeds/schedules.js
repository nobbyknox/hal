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
            enabled: 1,
            description: 'Wake-up lights'
        }),
        knex('schedules').insert({
            id: 2,
            cron: '0 30 23 * * 1-5',
            sceneId: 2,
            enabled: 1,
            description: 'Sleepy all off'
        }),
        knex('schedules').insert({
            id: 3,
            cron: '0 0 13 * * 1-5',
            sceneId: 3,
            enabled: 0,
            description: 'Test schedule'
        })
    );
};
