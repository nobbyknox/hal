'use strict';

exports.up = function(knex) {
    return knex.schema.createTable('schedules', function(t) {
        t.increments().primary();
        t.string('cron').notNullable();
        t.integer('sceneId').notNullable();
        t.string('description').nullable();
        t.integer('enabled').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('schedules');
};
