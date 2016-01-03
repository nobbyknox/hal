'use strict';

exports.seed = function (knex, Promise) {
    return Promise.join(
        // Deletes ALL existing entries
        knex('lights').del(),

        // Inserts seed entries
        knex('lights').insert({
            id: 1,
            name: 'Front Flood Light',
            enabled: 1,
            device: 2,
            instance: 0,
            controllerHost: '192.168.10.221',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: 2,
            name: 'Side Passage',
            enabled: 1,
            device: 3,
            instance: 0,
            controllerHost: '192.168.10.221',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: 3,
            name: 'Side Passage Door',
            enabled: 1,
            device: 3,
            instance: 0,
            controllerHost: '192.168.10.223',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: 4,
            name: 'TV Room',
            enabled: 1,
            device: 4,
            instance: 0,
            controllerHost: '192.168.10.223',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: 5,
            name: 'Art Room',
            enabled: 0,
            device: 4,
            instance: 0,
            controllerHost: '192.168.10.221',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: 6,
            name: 'Front Lounge',
            enabled: 0,
            device: 5,
            instance: 1,
            controllerHost: '192.168.10.221',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: 7,
            name: 'Main Bedroom',
            enabled: 0,
            device: 6,
            instance: 0,
            controllerHost: '192.168.10.221',
            controllerPort: 8083
        })
    );
};
