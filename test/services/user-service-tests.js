'use strict';

let service = require('../../lib/services/user-service.js');
let dataStore = require('../../lib/dao/data-store.js');
let models = require('../../lib/dao/models.js');

let helper = require('../../lib/helper.js');
let config = helper.getConfig();
let log = require('bunyan').createLogger(config.loggerOptions);

var assert = require('assert');
var path = require('path');

describe(path.basename(__filename), function() {

    describe('Retrieval', function() {

        it('should get all users', (done) => {
            service.getAll((err, users) => {
                if (err) return done(err);

                try {
                    assert(users, 'Expected to get some users');
                    assert(users.length > 0);
                    done();
                } catch(err) {
                    done(err);
                }
            });
        });

        it('should get on email address', (done) => {
            service.get('test1@host.com', (err, user) => {
                if (err) return done(err);

                try {
                    assert(user, 'Expected to find user with email address test1@host.com');
                    done();
                } catch(err) {
                    done(err);
                }
            });
        });
    });

});
