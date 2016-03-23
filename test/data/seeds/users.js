'use strict';

exports.seed = function (knex, Promise) {
    return Promise.join(
        // Deletes ALL existing entries
        knex('users').del(),

        // Inserts seed entries
        knex('users').insert({
            id: 'dbc23146-7467-4656-a843-5523dfa016cf',
            email: 'user1@host.com',
            screenName: 'User 1',
            password: '6367c48dd193d56ea7b0baad25b19455e529f5ee'  // abc123
        }),
        knex('users').insert({
            id: 'c189ab5c-fbf4-4c79-b3c8-38f18c806de3',
            email: 'user2@host.com',
            screenName: 'User 2',
            password: '6367c48dd193d56ea7b0baad25b19455e529f5ee'  // abc123
        })
    );
};
