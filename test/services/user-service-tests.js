'use strict';

let service = require('../../lib/services/user-service.js');

var assert = require('assert');
var path = require('path');

describe(path.basename(__filename), function() {

    // before(function(done) {
    //     var timer = setInterval(function() {
    //         if (global.unittestDataSeeded) {
    //             clearInterval(timer);
    //             done();
    //         }
    //     }, 50);
    // });

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
});
