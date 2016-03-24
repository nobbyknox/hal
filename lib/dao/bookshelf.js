'use strict';

var knexConfig = require('./knex-config.js');
var knex = require('knex')(knexConfig[process.env.HAL_ENV]);
var bookshelf = require('bookshelf')(knex);


/*
 * For the unittest environment we perform a schema migration + loading
 * of the seed data. Each unit test can create additional data if it
 * wishes. However, the seed data should not be molested with too much
 * as most unit tests will rely on it.
 */
if (process.env.HAL_ENV === 'unittest') {
    global.unittestDataSeeded = false;

    console.log('##--> Migration starting...');

    knex.migrate.latest()
        .then(function() {

            console.log('##--> Migration just finished');

            // knex.seed.run().then(function() {

                console.log('##--> Seeding just finished');

                global.unittestDataSeeded = true;
            // });
        });
}

module.exports = bookshelf;
