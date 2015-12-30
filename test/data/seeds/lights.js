'use strict';

exports.seed = function (knex, Promise) {
    return Promise.join(
        // Deletes ALL existing entries
        knex('lights').del(),

        // Inserts seed entries
        knex('lights').insert({
            id: 1,
            name: 'Lounge',
            device: 1,
            instance: 0,
            controllerHost: 'localhost',
            controllerPort: 8080
        }),
        knex('lights').insert({
            id: 2,
            name: 'Front Flood Light',
            device: 2,
            instance: 0,
            controllerHost: 'localhost',
            controllerPort: 8080
        }),
        knex('lights').insert({
            id: 3,
            name: 'Side Passage',
            device: 3,
            instance: 0,
            controllerHost: 'otherhost',
            controllerPort: 9090
        }),
        knex('lights').insert({
            id: 4,
            name: 'Side Entrance',
            device: 4,
            instance: 0,
            controllerHost: 'otherhost',
            controllerPort: 9090
        })
    );
};
