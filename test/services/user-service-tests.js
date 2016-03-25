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

    before(function(done) {
        var timer = setInterval(function() {
            if (global.unittestDataSeeded) {
                clearInterval(timer);
                done();
            }
        }, 50);
    });

    describe('Retrieval test', function() {

        it('should get all users', (done) => {
            service.getAll((err, users) => {
                assert(!err);
                assert(users);
                assert(users.length > 0);
                done();
            });
        });

        it('should get on email address', (done) => {
            service.get('user1@host.com', (err, user) => {
                assert(!err);
                assert(user);
                done();
            });
        });
    });

    describe('Raw test', function() {

        it('should list all users with rawest of queries', function(done) {
            dataStore.raw('select email, screenName from users where id = ?', ['dbc23146-7467-4656-a843-5523dfa016cf'], (err, users) => {
                log.debug(err);
                log.debug(users);
                done();
            });
        });

    });

});
