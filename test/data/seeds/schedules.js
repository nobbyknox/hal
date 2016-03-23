'use strict';

exports.seed = function (knex, Promise) {
    return Promise.join(
        // Deletes ALL existing entries
        knex('schedules').del(),

        // Inserts seed entries
        knex('schedules').insert({
            id: '9bcfdf86-1a12-4062-9420-3192325cfd2d',
            cron: '0 32 4 * * 1-5',
            sceneId: 1,
            enabled: 1,
            description: 'Wake-up lights'
        }),
        knex('schedules').insert({
            id: 'd29d0faf-d96a-433e-bc79-42e49a3d1079',
            cron: '0 30 23 * * 1-5',
            sceneId: 2,
            enabled: 1,
            description: 'Sleepy all off'
        }),
        knex('schedules').insert({
            id: '37952b5a-d739-4d49-8f09-e56ceb561cda',
            cron: '0 0 13 * * 1-5',
            sceneId: 3,
            enabled: 0,
            description: 'Test schedule'
        })
    );
};
