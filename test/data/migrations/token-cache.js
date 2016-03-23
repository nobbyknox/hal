'use strict';

exports.up = function(knex) {
    return knex.schema.createTable('token_cache', function (t) {
        t.string('id').primary();
        t.string('token').notNullable();
        t.integer('userId').notNullable();
        t.string('dateCreated').nullable();
        t.string('dateUpdated').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('token_cache');
};
