'use strict';

exports.seed = function (knex, Promise) {
    return Promise.join(
        // Deletes ALL existing entries
        knex('lights').del(),

        // Inserts seed entries
        knex('lights').insert({
            id: 'bd59cf73-8fbe-4505-a8d0-42018cab3820',
            name: 'Front Flood Light',
            enabled: 1,
            device: 2,
            instance: 0,
            controllerHost: '192.168.10.221',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: '6c7fc3fa-6624-4b44-b87c-0611c741599c',
            name: 'Side Passage',
            enabled: 1,
            device: 3,
            instance: 0,
            controllerHost: '192.168.10.221',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: '2bed4206-4d7f-4b10-ad80-f4cc70f4659b',
            name: 'Side Passage Door',
            enabled: 1,
            device: 3,
            instance: 0,
            controllerHost: '192.168.10.223',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: '59cc2ee8-3cde-4be4-877d-37ed04d453da',
            name: 'TV Room',
            enabled: 1,
            device: 4,
            instance: 0,
            controllerHost: '192.168.10.223',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: '70666dac-c2b4-4fe7-9bbf-2e6a9a76410e',
            name: 'Art Room',
            enabled: 0,
            device: 4,
            instance: 0,
            controllerHost: '192.168.10.221',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: 'b2b36153-044a-4156-b63b-5015ec6d952b',
            name: 'Front Lounge',
            enabled: 0,
            device: 5,
            instance: 1,
            controllerHost: '192.168.10.221',
            controllerPort: 8083
        }),
        knex('lights').insert({
            id: '7fc3e3a6-f0fd-44d3-b319-04a8d7026874',
            name: 'Main Bedroom',
            enabled: 0,
            device: 6,
            instance: 0,
            controllerHost: '192.168.10.221',
            controllerPort: 8083
        })
    );
};
