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
            password: 'abc123'
        }),
        knex('users').insert({
            id: 2,
            email: 'user2@host.com',
            screenName: 'User 2',
            password: 'abc123'
        })
    );
};
