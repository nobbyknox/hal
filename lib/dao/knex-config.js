'use strict';

module.exports = {

    unittest: {
        client: 'sqlite3',
        connection: {
            //filename: './db/test.sqlite3'
            filename: ':memory:'
        },
        pool: {
            max: 1
        },
        migrations: {
            directory: './test/data/migrations'
        },
        seeds: {
            directory: './test/data/seeds'
        }
    },

    development: {
        client: 'sqlite3',
        connection: {
            filename: './db/development.sqlite3'
        },
        pool: {
            max: 1
        }
    },

    production: {
        client: 'sqlite3',
        connection: {
            filename: './db/production.sqlite3'
        },
        pool: {
            max: 1
        }
    }

};
