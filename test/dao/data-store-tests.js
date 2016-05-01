'use strict';

let dataStore = require('../../lib/dao/data-store.js');
let models = require('../../lib/dao/models.js');

let assert = require('assert');
let path = require('path');
let util = require('util');

describe(path.basename(__filename), function() {

    describe('Raw queries', function() {

        it('should find user on ID', function(done) {
            dataStore.raw('select email, screenName from users where id = ?', ['22fb75ff-0ae4-46d9-893c-e72ba73a1ad3'], (err, users) => {
                if (err) return done(err);

                try {
                    assert.equal(users.length, 1);
                    assert.equal(users[0].email, 'test1@host.com');
                    assert.equal(users[0].screenName, 'Unicode');
                    done();
                } catch(err) {
                    done(err);
                }
            });
        });

        it('should find users with no binding', function(done) {
            dataStore.raw('select id from users', [], (err, users) => {
                if (err) return done(err);

                try {
                    assert.equal(users.length, 2);
                    done();
                } catch(err) {
                    done(err);
                }
            });
        });

    });

});
