'use strict';

exports.up = function(knex) {
    return knex.schema.createTable('users', function (t) {
        t.string('id').primary();
        t.string('email').notNullable();
        t.string('screenName').nullable();
        t.string('password').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
