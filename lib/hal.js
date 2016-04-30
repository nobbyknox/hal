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
let utilities = require('./utilities.js');

// 3rd Party stuff
let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let moment = require('moment');
let log = require('bunyan').createLogger(config.loggerOptions);
let request = require('request');
var cron = require('cron');

// Node stuff
let util = require('util');

// Variables
let runningCronJobs = [];
let ON_VALUE = 'on';
let OFF_VALUE = 'off';
var razberryQueryPathTemplate = '/ZWaveAPI/Run/devices[%d].instances[%d].commandClasses[0x25].data.level.value';
var razberrySetPathTemplate = '/ZWaveAPI/Run/devices[%d].instances[%d].commandClasses[0x25].Set(%d)';

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
            res.status(constants.HTTP_STATUS.UNAUTHORIZED).end('Token not specified');
        } else {
            // TODO: We don't need the username. This should simply validate the token.
            authService.getUserIdFromToken(req.headers.token, function(err, userId) {
                if (err) {
                    log.warn('Invalid token %s', req.headers.token);
                    res.status(constants.HTTP_STATUS.UNAUTHORIZED).end('Invalid token');
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
        res.status(constants.HTTP_STATUS.UNAUTHORIZED).send(new Error('No credentials supplied'));
    } else {
        authService.authenticateUser(req.body.username, req.body.password, function(err, authResp) {
            if (err) {
                log.error(err);
                res.status(constants.HTTP_STATUS.UNAUTHORIZED).send(err);
            } else {
                log.trace('Authentication response: %j', authResp);
                res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(authResp));
            }
        });
    }
});

app.post('/validatetoken', function(req, res) {

    if (!req.body || !req.body.token) {
        res.status(constants.HTTP_STATUS.UNAUTHORIZED).send(new Error('No token specified to validate'));
    } else {

        authService.validateToken(req.body.token, function(err) {
            if (err) {
                log.error(err);
                res.status(constants.HTTP_STATUS.UNAUTHORIZED).send(err);
            } else {
                log.trace('Token %s is valid', req.body.token);
                res.status(constants.HTTP_STATUS.OKAY).send('');
            }
        });
    }

});


// -----------------------------------------------------------------------------
// Light API
// -----------------------------------------------------------------------------

app.get('/lights', function(req, res) {

    if (req.query.hasOwnProperty('enabled')) {
        lightService.get(req.query.enabled, (err, lights) => {
            if (err) {
                res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
            } else {
                res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(lights));
            }
        });
    //} else if (req.query.hasOwnProperty('notInScene')) {
    //    lightService.getLightsNotInScene(req.query.notInScene, (err, lights) => {
    //        if (err) {
    //            res.status(constants.HTTP_INVALID_ENTITY).send(err);
    //        } else {
    //            res.status(constants.HTTP_OKAY).send(JSON.stringify(lights));
    //        }
    //    });
    } else {
        lightService.get(null, (err, lights) => {
            if (err) {
                res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
            } else {
                res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(lights));
            }
        });
    }

});

app.get('/lights/:id', function(req, res) {
    lightService.find(req.params.id, (err, light) => {
        if (err) {
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(light));
        }
    });
});

app.post('/lights', function(req, res) {
    lightService.create(req.body, (err, light) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(light));
        }
    });
});

app.put('/lights', function(req, res) {
    lightService.update(req.body, (err, light) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(light));
        }
    });
});

app.post('/status', function(req, res) {
    lightService.find(req.body.id, (err, light) => {
        getLightState(light, function(err, currentState) {
            if (err) {
                log.error(err);
                res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
            } else {
                res.status(constants.HTTP_STATUS.OKAY).send(currentState);
            }
        });
    });
});

app.post('/toggle', function(req, res) {
    lightService.find(req.body.id, (err, light) => {
        if (err) {
            log.error(err);
        } else {
            getLightState(light, function(err, currentState) {
				if (err) {
					log.error(err);
					res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
				} else {
                    var newState = (currentState === ON_VALUE ? OFF_VALUE : ON_VALUE);
					res.status(constants.HTTP_STATUS.OKAY).send(newState);
                    setLight(light, newState);
				}
            });
        }
    });
});

app.post('/scene', function(req, res) {
    log.debug('triggering scene %j', req.body);
    triggerScene(req.body.id);
    res.status(constants.HTTP_STATUS.OKAY).send('');
});

// -----------------------------------------------------------------------------
// Scene API
// -----------------------------------------------------------------------------

app.get('/scenes', function(req, res) {
    sceneService.get((err, scenes) => {
        if (err) {
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(scenes));
        }
    });
});

app.get('/scenes/:id', (req, res) => {
    sceneService.find(req.params.id, (err, scene) => {
        if (err) {
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(scene));
        }
    });
});

app.post('/scenes', function(req, res) {
    dataStore.create(models.SceneModel, req.body, (err, newScene) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(newScene));
        }
    });
});

app.put('/scenes', function(req, res) {
    dataStore.update(models.SceneModel, { 'id': req.body.id }, {}, req.body, (err, updatedScene) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(updatedScene));
        }
    });
});

app.delete('/scenes/:id', function(req, res) {
    sceneService.deleteScene(req.params.id, (err) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(utilities.convertErrorToResponse(err));
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send('');
        }
    });
});


// -----------------------------------------------------------------------------
// Scene light API
// -----------------------------------------------------------------------------

app.get('/scenelights', function(req, res) {
    sceneService.getSceneLights(req.query.sceneId, (err, sceneLights) => {
        if (err) {
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            log.debug('sceneLights: %j', sceneLights);
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(sceneLights));
        }
    });
});

app.get('/scenelights/:id', function(req, res) {
    sceneService.findSceneLight(req.params.id, (err, sceneLight) => {
        if (err) {
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            log.debug('sceneLight: %j', sceneLight);
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(sceneLight));
        }
    });
});

app.post('/scenelights', function(req, res) {
    sceneService.saveSceneLight(req.body, (err, newObj) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(utilities.convertErrorToResponse(err));
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(newObj));
        }
    });
});

app.put('/scenelights', function(req, res) {
    sceneService.updateSceneLight(req.body, (err, updatedObj) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(utilities.convertErrorToResponse(err));
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(updatedObj));
        }
    });
});

app.delete('/scenelights/:id', function(req, res) {
    sceneService.deleteSceneLight(req.params.id, (err) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(utilities.convertErrorToResponse(err));
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send('');
        }
    });
});


// -----------------------------------------------------------------------------
// Schedule API
// -----------------------------------------------------------------------------

app.get('/schedules', function(req, res) {
    scheduleService.get(null, (err, schedules) => {
        if (err) {
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(schedules));
        }
    });
});

app.get('/schedules/:id', (req, res) => {
    scheduleService.find(req.params.id, (err, schedules) => {
        if (err) {
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(schedules));
        }
    });
});

app.post('/schedules', function(req, res) {
    scheduleService.create(req.body, (err, schedule) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(schedule));
        }
    });
});

app.put('/schedules', function(req, res) {
    scheduleService.update(req.body, (err, schedule) => {
        if (err) {
            log.error(err);
            res.status(constants.HTTP_STATUS.BAD_REQUEST).send(err);
        } else {
            res.status(constants.HTTP_STATUS.OKAY).send(JSON.stringify(schedule));
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

app.get('/about/author', function(request, response) {  // And why not? ;-)
    response.send('Nobby Knox');
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
log.info('     Version ' + constants.HAL_VERSION);
log.info('');

app.listen(config.port, config.host, function() {
    log.info(util.format('HAL server running on port %d and is bound to %s', config.port, config.host));
    startScheduler();
});


// -----------------------------------------------------------------------------
// The Functions
// -----------------------------------------------------------------------------

function getLightState(light, next) {

    let url = util.format('http://%s:%s' + razberryQueryPathTemplate, light.controllerHost, light.controllerPort, light.device, light.instance);

    log.debug('Razberry query: %s', url);

    var options = {
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic YWRtaW46bms4MzU5MA=='
        }
    };

    request(options, function(err, res, body) {
        if (err) {
            next(err);
            return;
        }

        if (!res || !res.statusCode || !body) {
            next(new Error('No response received'));
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

            next(null, simpleState);
        } else {
            next(new Error('Error ' + response.statusCode));
        }
    });
}

function setLight(light, state) {

    let url = util.format('http://%s:%s' + razberrySetPathTemplate, light.controllerHost,
                          light.controllerPort, light.device, light.instance,
                          (state === ON_VALUE ? 255 : 0));

    log.debug('Razberry command: %s', url);

    var options = {
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic YWRtaW46bms4MzU5MA=='
        }
    };

    request(options);

    log.info('Requested that light "%s" be turned %s', light.name, state);
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
            log.info('Running scene %s with action "%s"', scene.name, scene.action);

            sceneService.getLightsOfScene(sceneId, (err, lights) => {
                if (err) {
                    log.error(err);
                } else {
                    lights.forEach(item => {
                        if (item.enabledInScene) {
                            setLight(item, scene.action);
                        } else {
                            log.debug('Light %s in scene %s is disabled and will not be triggered', item.name, scene.name);
                        }
                    });
                }
            });
        }
    });
}
