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

        it('should get all enabled lights', (done) => {
            service.get(1, (err, lights) => {
                assert(!err);
                assert(lights);
                done();
            });
        });

        it('should get all disabled lights', (done) => {
            service.get(0, (err, lights) => {
                assert(!err);
                assert(lights);
                done();
            });
        });
    });
});
