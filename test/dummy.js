'use strict';

//var enviroConfig = require('enviro-config');
//var options = {'environment': process.env.JUPITER_ENV, 'path': __dirname + '/../../config'};
//enviroConfig.initialize(options);

var dataStore = require('../lib/dao/data-store.js');
var models = require('../lib/dao/models.js');

var assert = require('assert');
var path = require('path');

//var service = require('../../lib/services/pbx-model-service.js');

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
            setTimeout(function() {
                dataStore.get(models.UserModel, {}, {}, function(err, users) {
                    done();
                });
            }, 2000);
        });

        //it('should get on ID', function(done) {
        //    service.findPbxModel(1, function(err, object) {
        //        assert(!err);
        //        assert(object);
        //        assert(object.id === 1);
        //        assert(object.manufacturer === 'Siemens');
        //        done();
        //    });
        //});
        //
        //it('should get on manufacturer', function(done) {
        //    service.getPbxModels({'manufacturer': 'Panasonic'}, function(err, models) {
        //        assert(!err);
        //        assert(models);
        //        assert(models.length === 1);
        //        assert(models[0].manufacturer === 'Panasonic');
        //        done();
        //    });
        //});
    });

    //describe('PBX model creation', function() {
    //
    //    it('should create new PBX model', function(done) {
    //
    //        var payload = {
    //            "dateRemoved": null,
    //            "manufacturer": "ABC123",
    //            "model": "Model 1",
    //            "version": 1
    //        };
    //
    //        service.createPbxModel(payload, function(err, id) {
    //            assert(!err);
    //            assert(id);
    //            assert(id > 0);
    //            done();
    //        });
    //    });
    //
    //    it('should abort creation on unspecified manufacturer', function(done) {
    //
    //        var payload = {
    //            "dateRemoved": null,
    //            "manufacturer": "",
    //            "model": "Model 1",
    //            "version": 1
    //        };
    //
    //        service.createPbxModel(payload, function(err, id) {
    //            assert(err);
    //            done();
    //        });
    //    });
    //
    //    it('should abort creation on unspecified model', function(done) {
    //
    //        var payload = {
    //            "dateRemoved": null,
    //            "manufacturer": "XYZ",
    //            "model": "  ",
    //            "version": 1
    //        };
    //
    //        service.createPbxModel(payload, function(err, id) {
    //            assert(err);
    //            done();
    //        });
    //    });
    //
    //    it('should abort creation on duplicate model', function(done) {
    //
    //        var payload = {
    //            "dateRemoved": null,
    //            "manufacturer": "Siemens",
    //            "model": "U1000",
    //            "version": 1
    //        };
    //
    //        service.createPbxModel(payload, function(err, id) {
    //            assert(err);
    //            done();
    //        });
    //    });
    //
    //});

    //describe('PBX model update', function() {
    //
    //    it('should update PBX model', function(done) {
    //
    //        service.getPbxModels({'manufacturer': 'ABC123'}, function(err, models) {
    //
    //            var changedModel = models[0];
    //            changedModel.model = 'ABC123DEF456';
    //
    //            service.updatePbxModel(changedModel, function(err, data) {
    //                service.getPbxModels({'manufacturer': 'ABC123'}, function(err, verifyModels) {
    //                    assert(!err);
    //                    assert(verifyModels);
    //                    assert(verifyModels.length > 0);
    //                    assert.equal(verifyModels[0].model, 'ABC123DEF456');
    //                    done();
    //                });
    //            });
    //        });
    //    });
    //
    //    it('should abort update on unspecified manufacturer', function(done) {
    //
    //        var payload = {
    //            "id": 3,
    //            "dateRemoved": null,
    //            "manufacturer": "  ",
    //            "model": "Model 2",
    //            "version": 2
    //        };
    //
    //        service.updatePbxModel(payload, function(err, id) {
    //            assert(err);
    //            done();
    //        });
    //    });
    //
    //    it('should abort update on unspecified model', function(done) {
    //
    //        var payload = {
    //            "id": 3,
    //            "dateRemoved": null,
    //            "manufacturer": "XYZ",
    //            "model": "",
    //            "version": 2
    //        };
    //
    //        service.updatePbxModel(payload, function(err, id) {
    //            assert(err);
    //            done();
    //        });
    //    });
    //});

    //describe('PBX model deletion', function() {
    //    it('should mark PBX model as deleted', function(done) {
    //        service.getPbxModels({'manufacturer': 'ABC123'}, function(err, models) {
    //
    //            assert(!err);
    //
    //            service.deletePbxModel(models[0].id, function(err, data) {
    //                assert(!err);
    //
    //                service.getPbxModels({'manufacturer': 'ABC123'}, function(err, verifyModels) {
    //                    assert(!err);
    //                    assert(verifyModels);
    //                    assert(verifyModels.length > 0);
    //                    assert(verifyModels[0].dateRemoved);
    //                    done();
    //                });
    //            });
    //        });
    //    });
    //
    //    it('should abort on deletion failure', function(done) {
    //        service.deletePbxModel(1, function(err) {
    //            assert(err);
    //            done();
    //        });
    //    });
    //});

});
