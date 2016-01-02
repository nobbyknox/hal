'use strict';

let service = require('../../lib/services/light-service.js');

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

        it('should find with ID', (done) => {
            service.find(1, (err, light) => {
                assert(!err);
                assert(light);
                assert(light.id === 1);
                done();
            });
        });

        it('should get all enabled schedules', (done) => {
            service.get(1, (err, schedules) => {
                assert(!err);
                assert(schedules);
                done();
            });
        });

        it('should get all disabled schedules', (done) => {
            service.get(0, (err, schedules) => {
                assert(!err);
                assert(schedules);
                done();
            });
        });
    });
});
