'use strict';

var service = require('../../lib/services/authentication-service.js');

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

    describe('Authentication', function() {

        it('should be successful', function(done) {
            service.authenticateUser('user1@host.com', 'abc123', (err, result) => {
                assert(!err);
                assert(result);
                done();
            });
        });

        it('should fail on invalid password', (done) => {
            service.authenticateUser('user1@host.com', 'xxx', (err) => {
                assert(err);
                done();
            });
        });

    });

});
