'use strict';

exports.up = function(knex) {
    return knex.schema.createTable('schedules', function(t) {
        t.string('id').primary();
        t.string('cron').notNullable();
        t.integer('sceneId').notNullable();
        t.integer('enabled').notNullable();
        t.string('description').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('schedules');
};
