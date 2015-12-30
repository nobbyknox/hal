'use strict';

exports.seed = function (knex, Promise) {
    return Promise.join(
        // Deletes ALL existing entries
        knex('scenes').del(),

        // Inserts seed entries
        knex('scenes').insert({
            id: 1,
            name: 'All On',
            description: 'Turn on all lights',
            visible: 1,
            buttonClass: 'some-class',
            iconClass: 'icon-class',
            action: 'ON'
        }),
        knex('scenes').insert({
            id: 2,
            name: 'All Off',
            description: 'Turn off all lights',
            visible: 1,
            buttonClass: 'some-class',
            iconClass: 'icon-class',
            action: 'OFF'
        })
    );
};
