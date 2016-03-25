'use strict';

let service = require('../../lib/services/schedule-service.js');

let assert = require('assert');
let path = require('path');
let util = require('util');

describe(path.basename(__filename), function() {

    describe('Retrieval', function() {

        it('should find with ID', (done) => {
            let id = 'd2749084-8016-4ed9-b7b2-5bff8c93d3f2';
            service.find(id, (err, light) => {
                if (err) return done(err);

                try {
                    assert(light, util.format('Expected to find light with ID %s', id));
                    assert.equal(light.id, id);
                    done();
                } catch(err) {
                    done(err);
                }
            });
        });

        it('should get all enabled schedules', (done) => {
            service.get(1, (err, schedules) => {
                if (err) return done(err);

                try {
                    assert(schedules, 'Expected to find some enabled lights');
                    assert.equal(schedules.length, 2);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });

        it('should get all disabled schedules', (done) => {
            service.get(0, (err, schedules) => {
                if (err) return done(err);

                try {
                    assert(schedules, 'Expected to find some disabled lights');
                    assert.equal(schedules.length, 1);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });
});
