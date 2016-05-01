'use strict';

var service = require('../../lib/services/authentication-service.js');

var assert = require('assert');
var path = require('path');

describe(path.basename(__filename), function() {

    describe('Authentication', function() {

        it('should be successful', function(done) {
            service.authenticateUser('test1@host.com', 'abc', (err, result) => {
                if (err) return done(err);

                try {
                    assert(result);
                    done();
                } catch(err) {
                    done(err);
                }
            });
        });

        it('should fail on invalid password', (done) => {
            service.authenticateUser('test1@host.com', 'xxx', (err) => {
                if (err) {
                    done();
                } else {
                    done(new Error('Expected authentication to fail on incorrect password'));
                }
            });
        });

    });

});
