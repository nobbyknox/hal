'use strict';

exports.up = function(knex) {
    return knex.schema.createTable('scenes', function(t) {
        t.string('id').primary();
        t.string('name').notNullable();
        t.string('description').nullable();
        t.integer('visible').notNullable();
        t.integer('enabled').notNullable();
        t.string('buttonClass').nullable();
        t.string('iconClass').nullable();
        t.string('action').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('scenes');
};
