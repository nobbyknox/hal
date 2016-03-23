'use strict';

exports.seed = function (knex, Promise) {
    return Promise.join(
        // Deletes ALL existing entries
        knex('scenes').del(),

        // Inserts seed entries
        knex('scenes').insert({
            id: '1ecaee1f-b324-4407-a024-1019e84060f8',
            name: 'All On',
            description: 'Turn on all lights',
            visible: 1,
            enabled: 1,
            buttonClass: 'btn-primary',
            iconClass: 'glyphicon glyphicon-off',
            action: 'ON'
        }),
        knex('scenes').insert({
            id: '8c504974-aa46-43cf-b891-dd84bdd5edc8',
            name: 'All Off',
            description: 'Turn off all lights',
            visible: 1,
            enabled: 1,
            buttonClass: 'btn-primary',
            iconClass: 'glyphicon glyphicon-film',
            action: 'OFF'
        }),
        knex('scenes').insert({
            id: '6c20efec-d661-4b58-9570-578e62e00c5c',
            name: 'Emergency',
            description: 'Outside lights on',
            visible: 1,
            enabled: 0,
            buttonClass: 'btn-warning',
            iconClass: 'glyphicon glyphicon-warning-sign',
            action: '50'
        })
    );
};
