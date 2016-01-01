'use strict';

var dataStore = require('../lib/dao/data-store.js');
var models = require('../lib/dao/models.js');

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

        it('should get all users', function(done) {
            dataStore.get(models.UserModel, {}, {}, function(err, users) {
                assert(!err);
                assert(users);
                done();
            });
        });
    });
});
