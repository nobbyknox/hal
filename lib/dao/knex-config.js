'use strict';

module.exports = {

    unittest: {
        client: 'sqlite3',
        connection: {
            filename: './db/test.sqlite3'
            // filename: ':memory:'
        },
        pool: {
            min: 0,
            max: 20,
            afterCreate: function(conn, done) {
                conn.run('PRAGMA synchronous=OFF;' +
                    'PRAGMA journal_mode=MEMORY;' +
                    'PRAGMA locking_mode=EXCLUSIVE;' +
                    'BEGIN EXCLUSIVE; COMMIT;',
                    done);
            }
        }
    },

    development: {
        client: 'sqlite3',
        connection: {
            filename: './db/development.sqlite3'
        },
        pool: {
            min: 0,
            max: 20,
        }
    },

    production: {
        client: 'sqlite3',
        connection: {
            filename: './db/production.sqlite3'
        },
        pool: {
            min: 0,
            max: 20,
        }
    }

};
