'use strict';

exports.up = function(knex) {
    return knex.schema.createTable('lights', function (t) {
        t.string('id').primary();
        t.string('name').nullable();
        t.integer('enabled').notNullable();
        t.integer('device').notNullable();
        t.integer('instance').notNullable();
        t.string('controllerHost').notNullable();
        t.integer('controllerPort').notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('lights');
};
