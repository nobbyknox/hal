'use strict';

// HAL's stuff
let constants = require('./constants.js');
let helper = require('./helper.js');
let config = helper.getConfig();
let dataStore = require('./dao/data-store.js');
let models = require('./dao/models.js');
let authService = require('./services/authentication-service.js');
let lightService = require('./services/light-service.js');
let scheduleService = require('./services/schedule-service.js');

// 3rd Party stuff
let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let moment = require('moment');
let log = require('bunyan').createLogger(config.loggerOptions);
let request = require('request');

// Node stuff
let util = require('util');


app.use(express.static('./web'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


// -----------------------------------------------------------------------------
// Middleware functions
// -----------------------------------------------------------------------------

let endpointLogger = function(req, res, next) {
    log.debug('%s %s', req.method, req.url);

    if (req.method === 'POST' || req.method === 'PUT') {
        log.debug('%j', req.body);
    }

    next();
};

let tokenPolice = function(req, res, next) {

    let safePaths = [
        '/authenticate',
        '/favicon.ico',
        '/validatetoken'
    ];

    if ((safePaths.indexOf(req.url) > -1) || (req.url.substring(0, 6) === '/assets')) {
        next();
    } else {

        if (!req.query.token) {
            log.warn('Token not specified');
            res.status(constants.HTTP_UNAUTHORIZED).end('Token not specified');
        } else {
            authService.getUserIdFromToken(req.query.token, function(err, userId) {
                if (err) {
                    log.warn('Invalid token %s', req.query.token);
                    res.status(constants.HTTP_UNAUTHORIZED).end('Invalid token');
                } else {
                    req.query.__userId = userId;
                    next();
                }
            });
        }
    }
};

app.use(endpointLogger);
app.use(tokenPolice);


// -----------------------------------------------------------------------------
// Authentication API
// -----------------------------------------------------------------------------

app.post('/authenticate', function(req, res) {

    if (!req.body) {
        res.status(constants.HTTP_UNAUTHORIZED).send(new Error('No credentials supplied'));
    } else {
        authService.authenticateUser(req.body.username, req.body.password, function(err, authResp) {
            if (err) {
                log.error(err);
                res.status(constants.HTTP_UNAUTHORIZED).send(err);
            } else {
                log.trace('Authentication response: %j', authResp);
                res.status(constants.HTTP_OKAY).send(JSON.stringify(authResp));
            }
        });
    }
});

app.post('/validatetoken', function(req, res) {

    if (!req.body || !req.body.token) {
        res.status(constants.HTTP_UNAUTHORIZED).send(new Error('No token specified to validate'));
    } else {

        authService.validateToken(req.body.token, function(err) {
            if (err) {
                log.error(err);
                res.status(constants.HTTP_UNAUTHORIZED).send(err);
            } else {
                log.trace('Token %s is valid', req.body.token);
                res.status(constants.HTTP_OKAY).send('');
            }
        });
    }

});


// -----------------------------------------------------------------------------
// Configuration API
// -----------------------------------------------------------------------------

app.get('/configGarageCamURL', function(request, response) {
    response.send(config.garageCamURL);
    response.end();
});


// -----------------------------------------------------------------------------
// Light API
// -----------------------------------------------------------------------------

app.get('/lights', function(req, res) {
    lightService.get(req.query.enabled, (err, lights) => {
        if (err) {
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(lights));
        }
    });
});

app.post('/status', function(request, response) {

    getLight(request.body.id, function(light) {

        log.debug('getLight returned %j', light);

        getLightState(light, function(currentState) {
            response.send(currentState);
            response.end();
        });
    });

});

// -----------------------------------------------------------------------------
// Scene API
// -----------------------------------------------------------------------------

app.get('/scenes', function(req, res) {

    let where = {};

    if (req.query.enabled) {
        where.enabled = req.query.enabled;
    }

    dataStore.get(models.SceneModel, where, {}, function(err, lights) {
        if (err) {
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(lights));
        }
    });
});


// -----------------------------------------------------------------------------
// Schedule API
// -----------------------------------------------------------------------------

app.get('/schedules', function(request, response) {
    scheduleService.get(1, (err, schedules) => {
        if (err) {
            response.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            response.status(constants.HTTP_OKAY).send(JSON.stringify(schedules));
        }
    });
});

// -----------------------------------------------------------------------------
// The Rest of the APIs
// -----------------------------------------------------------------------------

app.get('/sysInfo', function(request, response) {

    var os = require('os');

    var info = {
        'hostName': os.hostname(),
        'osType': os.type(),
        'release': os.release(),
        'cpu': os.cpus()[0].model,
        'upTime': moment().subtract('seconds', os.uptime()).fromNow(),
        'totMem': (os.totalmem() / 1024 / 1024) + ' MB',
        'freeMem': (os.freemem() / 1024 / 1024) + ' MB'
    };

    response.send(info);
    response.end();
});

// -----------------------------------------------------------------------------
// The last bit
// -----------------------------------------------------------------------------

app.listen(config.port, config.host, function() {
    log.info(util.format('HAL server running on port %d and is bound to %s', config.port, config.host));

    log.info('');
    log.info('    __  __ ___     __');
    log.info('   / / / //   |   / /');
    log.info('  / /_/ // /\| |  / /');
    log.info(' / __  // ___ | / /___');
    log.info('/_/ /_//_/  |_|/_____/');
    log.info('');
    log.info('     Version 2.0');
    log.info('');
});


//var http = require('http');
//var cron = require('cron');
//var moment = require('moment');
//var express = require('express');
//var jsonfile = require('jsonfile');
//
//var config = require('./config/' + (process.env.NODE_ENV || 'dev') + '.json');
//var lights = require('./config/lights.json');
//var scenes = require('./config/scenes.json');
//
//var expressPort = config.expressPort;
//
//var runningCronJobs = [];
//
//var ON_VALUE = 'on';
//var OFF_VALUE = 'off';


// ---------------------
// Express configuration
// ---------------------

//var app = express();
//
//app.use(express.static(__dirname + '/web'));
//app.use(express.bodyParser());
//
//app.use(express.basicAuth(function(user, pass, callback) {
//
//    var validUser = false;
//
//    config.users.forEach(function(dbUser) {
//       if ((dbUser.username === user) && (dbUser.password === pass)) {
//           validUser = true;
//       }
//    });
//
//    callback(null, validUser);
//
//}));


// --------------
// Route Handlers
// --------------

//app.get('/lights', function(request, response) {
//    var model = lights;
//    response.send(model);
//    response.end();
//});

//app.get('/scenes', function(request, response) {
//    var model = scenes;
//    response.send(model);
//    response.end();
//});

//app.get('/schedule/:id', function(request, response) {
//
//    jsonfile.readFile('./config/schedules.json', function(error, schedules) {
//
//        var foundSchedule = false;
//
//        schedules.forEach(function(sch) {
//            if (sch.id == request.param('id')) {
//                foundSchedule = true;
//                response.send(sch);
//                response.end();
//            }
//        });
//
//        if (!foundSchedule) {
//            response.end();
//        }
//    });
//
//});

//app.post('/schedule', function(request, response) {
//
//    var sch = request.body;
//    var lastId = 0;
//
//    jsonfile.readFile('./config/schedules.json', function(error, schedules) {
//
//        schedules.forEach(function(item) {
//            if (item.id > lastId) {
//                lastId = item.id;
//            }
//        });
//
//        lastId++;
//
//        sch.id = lastId;
//        schedules.push(sch);
//
//        jsonfile.writeFile('./config/schedules.json', schedules, function(error) {
//            log('Schedules saved');
//        });
//    });
//
//    response.end();
//
//});

//app.put('/schedule/:id', function(request, response) {
//
//    var sch = request.body;
//
//    jsonfile.readFile('./config/schedules.json', function(error, schedules) {
//
//        var updated = false;
//
//        schedules.forEach(function(item) {
//            if (item.id == request.param('id')) {
//                item.cron = sch.cron;
//                item.description = sch.description;
//                item.sceneId = sch.sceneId;
//
//                updated = true;
//            }
//        });
//
//        if (updated) {
//            jsonfile.writeFile('./config/schedules.json', schedules, function(error) {
//                log('Schedule updated');
//            });
//
//            for (var i = 0; i < runningCronJobs.length; i++) {
//                if (runningCronJobs[i].id == request.param('id')) {
//                    log("Schedule " + runningCronJobs[i].id + " now restarting");
//                    runningCronJobs[i].job.stop();
//                    runningCronJobs.splice(i, 1);
//                }
//            }
//
//            var job = new cron.CronJob(sch.cron, function() {
//                log('Schedule ID ' + request.param('id') + ': Triggering scene ' + sch.sceneId + ' - ' + sch.description);
//                triggerScene(sch.sceneId);
//            }, null, true, null);
//
//            runningCronJobs.push({ id: request.param('id'), job: job });
//
//        }
//    });
//
//    response.end();
//
//});


//app.post('/toggle', function(request, response) {
//
//    getLight(request.body.id, function(light) {
//        getLightState(light, function(currentState) {
//
//            var newState = (currentState === ON_VALUE ? OFF_VALUE : ON_VALUE);
//
//            response.send(newState);
//            response.end();
//
//            setLight(light, newState);
//        });
//    });
//
//});

//app.post('/scene', function(request, response) {
//    triggerScene(request.body.id);
//    response.send('ok');
//    response.end();
//});


// -------------------
// Routes just for fun
// -------------------

//app.get('/about/author', function(request, response) {  // And why not? ;-)
//    response.send('Nobby Knox');
//    response.end();
//});


// ----------
// Main Block
// ----------

//var server = app.listen(expressPort, function() {
//
//    log('Listening on port ' + server.address().port);
//
//    log('');
//    log('Lights:');
//    lights.forEach(function(light) {
//        log('  id: ' + light.id + ', name: ' + light.name + ', device:instance: ' + light.device + ':' + light.instance);
//    });
//
//    log('');
//    log('Scenes:');
//    scenes.forEach(function(scene) {
//        log('  id: ' + scene.id + ', name: ' + scene.name + ', lights: ' + scene.lights);
//    });
//
//    startScheduler();
//
//});


// -------------
// The Functions
// -------------

//function actionLights(lightIds, action) {
//
//    lightIds.forEach(function(item) {
//        getLight(item, function(light) {
//
//            if ((action == 'on') || (action == 'off')) {
//                setLight(light, (action == 'on' ? ON_VALUE : OFF_VALUE));
//            } else if (action == 'toggle') {
//                getLightState(light, function(currentState) {
//                    var newState = (currentState == ON_VALUE || currentState === 'true' ? OFF_VALUE : ON_VALUE);
//                    setLight(light, newState);
//                });
//            }
//        });
//    });
//}

function getLightState(light, callback) {

    log.debug('Requesting status of light ID %d', light.id);

    request.get(util.format('http://%s:%d/ZWaveAPI/Run/devices[%d].instances[%d].commandClasses[0x25].data.level.value', light.controllerHost, light.controllerPort, light.device, light.instance), function(err, res, body) {

        if (res.statusCode === 200 && body.length > 0) {
            var simpleState = '';

            if (body === '255' || body === 'true') {
                simpleState = 'on';
            } else {
                simpleState = 'off';
            }

            callback(simpleState);
        } else {
            next();
        }
    });

}

//function log(mesg) {
//    console.log(moment().format('YYYY-MM-DD hh:mm:ss.SSS') + ': ' + mesg);
//}

//function setLight(light, state) {
//
//    var options = {
//        hostname: light.controllerHost,
//        port: light.controllerPort,
//        path: '/ZWaveAPI/Run/devices[' + light.device + '].instances[' + light.instance + '].commandClasses[0x25].Set(' + (state === ON_VALUE ? 255 : 0) + ')',
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/json'
//        }
//    };
//
//    var request = http.request(options);
//
//    request.on('error', function(e) {
//        log('ERROR: Problem with request: ' + e.message);
//    });
//
//    request.end();
//
//}

//function startScheduler() {
//
//    var schedules = require('./config/schedules.json');
//
//    if (schedules && (schedules.length > 0)) {
//
//        log('');
//        log('Schedules:');
//
//        schedules.forEach(function(item) {
//
//            log('  schedule ID: ' + item.id + ', cron: ' + item.cron + ', sceneId: ' + item.sceneId);
//
//            var job = new cron.CronJob(item.cron, function() {
//                log('Schedule ID ' + item.id + ': Triggering scene ' + item.sceneId + ' - ' + item.description);
//                triggerScene(item.sceneId);
//            }, null, true, null);
//
//            runningCronJobs.push({ id: item.id, job: job });
//
//        });
//
//        log('');
//    } else {
//        log('');
//        log('No schedules found');
//        log('');
//    }
//
//}

//function triggerScene(sceneId) {
//    getScene(sceneId, function(scene) {
//        actionLights(scene.lights, scene.action);
//    });
//}

function getLight(id, callback) {
    lightService.find(id, (err, light) => {
        callback(light);
    });
}

//function getScene(sceneId, callback) {
//    scenes.forEach(function(scene) {
//        if (scene.id == sceneId) {
//            callback(scene);
//        }
//    });
//}
