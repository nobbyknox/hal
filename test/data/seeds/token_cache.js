'use strict';

exports.seed = function (knex, Promise) {
    return Promise.join(
        // Deletes ALL existing entries
        knex('token_cache').del(),

        // Inserts seed entries
        knex('token_cache').insert({
            token: 'abc123',
            userId: 1,
            dateCreated: '2015-12-30 19:10:00',
            dateUpdated: null
        }),
        knex('token_cache').insert({
            token: 'def456',
            userId: 2,
            dateCreated: '2015-12-30 19:11:00',
            dateUpdated: null
        })
    );
};
