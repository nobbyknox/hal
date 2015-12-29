'use strict';

var knexConfig = require('./knex-config.js');
var knex = require('knex')(knexConfig[process.env.HAL_ENV]);
var bookshelf = require('bookshelf')(knex);

console.log('Top of bookshelf.js');
console.log('  env: ' + process.env.HAL_ENV);

/*
 * For the unittest environment we perform a schema migration + loading
 * of the seed data. Each unit test can create additional data if it
 * wishes. However, the seed data should not be molested with too much
 * as most unit tests will rely on it.
 */
if (process.env.HAL_ENV === 'unittest') {

    console.log('Bootstrapping database...');

    global.unittestDataSeeded = false;
    knex.migrate.latest()
        .then(function() {
            knex.seed.run().then(function() {
                global.unittestDataSeeded = true;
            });
            //global.unittestDataSeeded = true;
        }, function(err) {
            console.log(err);
        });
}

module.exports = bookshelf;
