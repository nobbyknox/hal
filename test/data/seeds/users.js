'use strict';

exports.seed = function (knex, Promise) {
    return Promise.join(
        // Deletes ALL existing entries
        knex('users').del(),

        // Inserts seed entries
        knex('users').insert({
            id: 1,
            email: 'user1@host.com',
            screenName: 'User 1',
            password: '6367c48dd193d56ea7b0baad25b19455e529f5ee'  // abc123
        }),
        knex('users').insert({
            id: 2,
            email: 'user2@host.com',
            screenName: 'User 2',
            password: '6367c48dd193d56ea7b0baad25b19455e529f5ee'  // abc123
        })
    );
};
