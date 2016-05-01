'use strict';

let service = require('../../lib/services/light-service.js');

var assert = require('assert');
var path = require('path');
var util = require('util');

describe(path.basename(__filename), function() {

    describe('Retrieval test', function() {

        it('should find with ID', (done) => {
            service.find('c35adb27-ed0e-4189-b1f4-47de24363fdf', (err, light) => {
                if (err) return done(err);

                try {
                    assert(light);
                    assert.equal(light.id, 'c35adb27-ed0e-4189-b1f4-47de24363fdf');
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

        it('should get all disabled lights', (done) => {
            service.get(0, (err, lights) => {
                if (err) return done(err);

                try {
                    assert(lights, 'Expected to find some disabled lights');
                    assert.equal(lights.length, 1);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });

    });
});
