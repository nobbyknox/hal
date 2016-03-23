'use strict';

module.exports = {

    unittest: {
        client: 'sqlite3',
        connection: {
            //filename: './db/test.sqlite3'
            filename: ':memory:'
        },
        pool: {
            afterCreate: function(conn, done) {
                conn.run('PRAGMA synchronous=OFF;' +
                    'PRAGMA journal_mode=MEMORY;' +
                    'PRAGMA locking_mode=EXCLUSIVE;' +
                    'BEGIN EXCLUSIVE; COMMIT;',
                    done);
            }
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
