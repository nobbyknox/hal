'use strict';

let service = require('../../lib/services/light-service.js');

var assert = require('assert');
var path = require('path');
var util = require('util');

describe(path.basename(__filename), function() {

    describe('Retrieval test', function() {

        it('should find with ID', (done) => {
            service.find('bd59cf73-8fbe-4505-a8d0-42018cab3820', (err, light) => {
                if (err) return done(err);

                try {
                    assert(light);
                    assert.equal(light.id, 'bd59cf73-8fbe-4505-a8d0-42018cab3820');
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });

        it('should get all enabled lights', (done) => {
            service.get(1, (err, lights) => {
                if (err) return done(err);

                try {
                    assert(lights, 'Should have found some lights');
                    assert.equal(lights.length, 4, util.format('Expected to get 4 lights, but got %d instead.', lights.length));
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });

        // TODO: The get function will change. This test will then be
        // updated accordingly.
        // it('should get all disabled lights', (done) => {
        //     service.get(0, (err, lights) => {
        //         assert(!err);
        //         assert(lights);
        //         done();
        //     });
        // });
    });
});
