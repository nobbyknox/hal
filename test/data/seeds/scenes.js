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
            enabled: 1,
            buttonClass: 'btn-primary',
            iconClass: 'glyphicon glyphicon-off',
            action: 'ON'
        }),
        knex('scenes').insert({
            id: 2,
            name: 'All Off',
            description: 'Turn off all lights',
            visible: 1,
            enabled: 1,
            buttonClass: 'btn-primary',
            iconClass: 'glyphicon glyphicon-film',
            action: 'OFF'
        }),
        knex('scenes').insert({
            id: 3,
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
