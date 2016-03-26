'use strict';

// HAL's stuff
let constants = require('./constants.js');
let helper = require('./helper.js');
let config = helper.getConfig();
let dataStore = require('./dao/data-store.js');
let models = require('./dao/models.js');
let authService = require('./services/authentication-service.js');
let lightService = require('./services/light-service.js');
let sceneService = require('./services/scene-service.js');
let scheduleService = require('./services/schedule-service.js');

// 3rd Party stuff
let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let moment = require('moment');
let log = require('bunyan').createLogger(config.loggerOptions);
let request = require('request');
var http = require('http');
var cron = require('cron');

// Node stuff
let util = require('util');

// Variables
let runningCronJobs = [];
let ON_VALUE = 'on';
let OFF_VALUE = 'off';

app.use(express.static('./web'));
app.use(express.static('./bower_components'));
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
        /^\/authenticate/,
        /^\/favicon.ico/,
        /^\/validatetoken/,
        /^\/assets/,
        /^\/jquery/,
        /^\/angular/,
        /^\/bootstrap/
    ];

    let isSafePath = false;

    for (let path of safePaths) {
        if (req.url.match(path)) {
            isSafePath = true;
            break;
        }
    };

    if (isSafePath) {
        next();
    } else {

        if (!req.headers.token) {
            log.warn('Token not specified');
            res.status(constants.HTTP_UNAUTHORIZED).end('Token not specified');
        } else {
            // TODO: We don't need the username. This should simply validate the token.
            authService.getUserIdFromToken(req.headers.token, function(err, userId) {
                if (err) {
                    log.warn('Invalid token %s', req.headers.token);
                    res.status(constants.HTTP_UNAUTHORIZED).end('Invalid token');
                } else {
                    // req.query.__userId = userId;  // TODO: Rather add to the headers
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

// TODO: This still needed?
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

app.get('/lights/:id', function(req, res) {
    lightService.find(req.params.id, (err, light) => {
        if (err) {
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(light));
        }
    });
});

app.post('/lights', function(req, res) {
    lightService.create(req.body, (err, light) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(light));
        }
    });
});

app.put('/lights', function(req, res) {
    lightService.update(req.body, (err, light) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(light));
        }
    });
});

app.post('/status', function(request, response) {
    lightService.find(request.body.id, (err, light) => {
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
    sceneService.get((err, scenes) => {
        if (err) {
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(scenes));
        }
    });
});

app.get('/scenes/:id', (req, res) => {
    sceneService.find(req.params.id, (err, scene) => {
        if (err) {
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(scene));
        }
    });
});

app.post('/scenes', function(req, res) {
    dataStore.create(models.SceneModel, req.body, (err, newScene) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(newScene));
        }
    });
});

app.put('/scenes', function(req, res) {
    dataStore.update(models.SceneModel, { 'id': req.body.id }, {}, req.body, (err, data) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(req.body));
        }
    });
});


// -----------------------------------------------------------------------------
// Schedule API
// -----------------------------------------------------------------------------

app.get('/schedules', function(request, response) {
    scheduleService.get(null, (err, schedules) => {
        if (err) {
            response.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            response.status(constants.HTTP_OKAY).send(JSON.stringify(schedules));
        }
    });
});

app.get('/schedules/:id', (req, res) => {
    scheduleService.find(req.params.id, (err, schedules) => {
        if (err) {
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(schedules));
        }
    });
});

app.post('/schedules', function(req, res) {
    scheduleService.create(req.body, (err, schedule) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(schedule));
        }
    });
});

app.put('/schedules', function(req, res) {
    scheduleService.update(req.body, (err, schedule) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_INVALID_ENTITY).send(err);
        } else {
            res.status(constants.HTTP_OKAY).send(JSON.stringify(schedule));
        }
    });
});


// -----------------------------------------------------------------------------
// The Rest of the APIs
// -----------------------------------------------------------------------------

// TODO: Need a menu item for this
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

log.info('');
log.info('    __  __ ___     __');
log.info('   / / / //   |   / /');
log.info('  / /_/ // /\| |  / /');
log.info(' / __  // ___ | / /___');
log.info('/_/ /_//_/  |_|/_____/');
log.info('');
log.info('  Version 2.0-Alpha.1');
log.info('');

app.listen(config.port, config.host, function() {
    log.info(util.format('HAL server running on port %d and is bound to %s', config.port, config.host));
    startScheduler();
});



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


app.post('/toggle', function(request, response) {

    lightService.find(request.body.id, (err, light) => {
        // log.debug(err);
        // log.debug(light);

        if (err) {
            log.error(err);
        } else {
            getLightState(light, function(currentState) {

                var newState = (currentState === ON_VALUE ? OFF_VALUE : ON_VALUE);

                response.send(newState);
                response.end();

                setLight(light, newState);
            });
        }
    });

});

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


// -------------
// The Functions
// -------------

function getLightState(light, next) {

    // log.debug('Requesting status of light ID %s', light.id);

    request.get(util.format('http://%s:%d/ZWaveAPI/Run/devices[%d].instances[%d].commandClasses[0x25].data.level.value', light.controllerHost, light.controllerPort, light.device, light.instance), function(err, res, body) {

        if (!res || !res.statusCode || !body) {
            console.log('No response received');
            next();
            return;
        }

        if (res.statusCode === 200 && body.length > 0) {
            var simpleState = '';

            if (body === '255' || body === 'true') {
                simpleState = 'on';
            } else {
                simpleState = 'off';
            }

            log.debug('Light "%s" is %s', light.name, simpleState);

            next(simpleState);
        } else {
            next();
        }
    });
}

function setLight(light, state) {

    var options = {
        hostname: light.controllerHost,
        port: light.controllerPort,
        path: '/ZWaveAPI/Run/devices[' + light.device + '].instances[' + light.instance + '].commandClasses[0x25].Set(' + (state === ON_VALUE ? 255 : 0) + ')',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var request = http.request(options);

    request.on('error', function(e) {
        log.error('Problem with request: ' + e.message);
    });

    request.end();

    log.debug('Requested that light "%s" be turned %s', light.name, state);

}

function startScheduler() {

    scheduleService.get(1, function(err, schedules) {

        if (err) {
            log.error(err);
        } else {
            if (schedules && (schedules.length > 0)) {

                log.debug('Schedules:');

                schedules.forEach(function(item) {

                    log.debug('  %s - %s', item.cron, item.description);

                    var job = new cron.CronJob(item.cron, function() {
                        log.debug('cron %s triggered', item.cron);
                        triggerScene(item.sceneId);
                    }, null, true, null);

                    runningCronJobs.push({ 'id': item.id, 'job': job });

                });

            } else {
                log.debug('No schedules found');
            }
        }
    });
}

function triggerScene(sceneId) {
    sceneService.find(sceneId, (err, scene) => {
        if (err) {
            log.error(err);
        } else {
            log.debug('Running scene %s with action "%s"', scene.name, scene.action);

            sceneService.getLightsOfScene(sceneId, (err, lights) => {
                if (err) {
                    log.error(err);
                } else {
                    lights.forEach(item => {
                        setLight(item, scene.action);
                    });
                }
            });
        }
    });
}
