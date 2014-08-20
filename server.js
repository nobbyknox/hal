var http = require('http');
var cron = require('cron');
var moment = require('moment');
var express = require('express');
var jsonfile = require('jsonfile');

var config = require('./config/' + (process.env.NODE_ENV || 'dev') + '.json');
var lights = require('./config/lights.json');
var scenes = require('./config/scenes.json');

var expressPort = config.expressPort;

var runningCronJobs = [];

var ON_VALUE = 'on';
var OFF_VALUE = 'off';


// ---------------------
// Express configuration
// ---------------------

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

app.use(express.basicAuth(function(user, pass, callback) {

    var validUser = false;

    config.users.forEach(function(dbUser) {
       if ((dbUser.username === user) && (dbUser.password === pass)) {
           validUser = true;
       }
    });

    callback(null, validUser);

}));


// --------------
// Route Handlers
// --------------

app.get('/lights', function(request, response) {
    var model = lights;
    response.send(model);
    response.end();
});

app.get('/scenes', function(request, response) {
    var model = scenes;
    response.send(model);
    response.end();
});

app.get('/schedules', function(request, response) {
    jsonfile.readFile('./config/schedules.json', function(error, schedules) {
        response.send(schedules);
        response.end();
    });
});

app.get('/schedule/:id', function(request, response) {

    jsonfile.readFile('./config/schedules.json', function(error, schedules) {

        var foundSchedule = false;

        schedules.forEach(function(sch) {
            if (sch.id == request.param('id')) {
                foundSchedule = true;
                response.send(sch);
                response.end();
            }
        });

        if (!foundSchedule) {
            response.end();
        }
    });

});

app.post('/schedule', function(request, response) {

    var sch = request.body;
    var lastId = 0;

    jsonfile.readFile('./config/schedules.json', function(error, schedules) {

        schedules.forEach(function(item) {
            if (item.id > lastId) {
                lastId = item.id;
            }
        });

        lastId++;

        sch.id = lastId;
        schedules.push(sch);

        jsonfile.writeFile('./config/schedules.json', schedules, function(error) {
            log('Schedules saved');
        });
    });

    response.end();

});

app.put('/schedule/:id', function(request, response) {

    var sch = request.body;

    jsonfile.readFile('./config/schedules.json', function(error, schedules) {

        var updated = false;

        schedules.forEach(function(item) {
            if (item.id == request.param('id')) {
                item.cron = sch.cron;
                item.description = sch.description;
                item.sceneId = sch.sceneId;

                updated = true;
            }
        });

        if (updated) {
            jsonfile.writeFile('./config/schedules.json', schedules, function(error) {
                log('Schedule updated');
            });

            for (var i = 0; i < runningCronJobs.length; i++) {
                if (runningCronJobs[i].id == request.param('id')) {
                    log("Schedule " + runningCronJobs[i].id + " now restarting");
                    runningCronJobs[i].job.stop();
                    runningCronJobs.splice(i, 1);
                }
            }

            var job = new cron.CronJob(sch.cron, function() {
                log('Schedule ID ' + request.param('id') + ': Triggering scene ' + sch.sceneId + ' - ' + sch.description);
                triggerScene(sch.sceneId);
            }, null, true, null);

            runningCronJobs.push({ id: request.param('id'), job: job });

        }
    });

    response.end();

});

app.post('/status', function(request, response) {

    getLight(request.body.id, function(light) {
        getLightState(light, function(currentState) {
            response.send(currentState);
            response.end();
        });
    });

});

app.post('/toggle', function(request, response) {

    getLight(request.body.id, function(light) {
        getLightState(light, function(currentState) {

            var newState = (currentState === ON_VALUE ? OFF_VALUE : ON_VALUE);

            response.send(newState);
            response.end();

            setLight(light, newState);
        });
    });

});

app.post('/scene', function(request, response) {
    triggerScene(request.body.id);
    response.send('ok');
    response.end();
});

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

app.get('/configGarageCamURL', function(request, response) {
    response.send(config.garageCamURL);
    response.end();
});


// -------------------
// Routes just for fun
// -------------------

app.get('/about/author', function(request, response) {  // And why not? ;-)
    response.send('Nobby Knox');
    response.end();
});


// ----------
// Main Block
// ----------

var server = app.listen(expressPort, function() {

    log('Listening on port ' + server.address().port);

    log('');
    log('Lights:');
    lights.forEach(function(light) {
        log('  id: ' + light.id + ', name: ' + light.name + ', device:instance: ' + light.device + ':' + light.instance);
    });

    log('');
    log('Scenes:');
    scenes.forEach(function(scene) {
        log('  id: ' + scene.id + ', name: ' + scene.name + ', lights: ' + scene.lights);
    });

    startScheduler();

});


// -------------
// The Functions
// -------------

function actionLights(lightIds, action) {

    lightIds.forEach(function(item) {
        getLight(item, function(light) {

            if ((action == 'on') || (action == 'off')) {
                setLight(light, (action == 'on' ? ON_VALUE : OFF_VALUE));
            } else if (action == 'toggle') {
                getLightState(light, function(currentState) {
                    var newState = (currentState == ON_VALUE || currentState === 'true' ? OFF_VALUE : ON_VALUE);
                    setLight(light, newState);
                });
            }
        });
    });
}

function getLightState(light, callback) {

    var options = {
        hostname: light.controllerHost,
        port: light.controllerPort,
        path: '/ZWaveAPI/Run/devices[' + light.device + '].instances[' + light.instance + '].commandClasses[0x25].data.level.value',
        method: 'POST'
    };

    var request = http.request(options, function(response) {

        response.setEncoding('utf8');

        response.on('data', function(currentState) {

            var simpleState = '';

            if (currentState === '255' || currentState === 'true') {
                simpleState = 'on';
            } else {
                simpleState = 'off';
            }

            callback(simpleState);
        });
    });

    request.on('error', function(e) {
        log('ERROR: Problem with request: ' + e.message);
    });

    request.end();

}

function log(mesg) {
    console.log(moment().format('YYYY-MM-DD hh:mm:ss.SSS') + ': ' + mesg);
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
        log('ERROR: Problem with request: ' + e.message);
    });

    request.end();

}

function startScheduler() {

    var schedules = require('./config/schedules.json');

    if (schedules && (schedules.length > 0)) {

        log('');
        log('Schedules:');

        schedules.forEach(function(item) {

            log('  schedule ID: ' + item.id + ', cron: ' + item.cron + ', sceneId: ' + item.sceneId);

            var job = new cron.CronJob(item.cron, function() {
                log('Schedule ID ' + item.id + ': Triggering scene ' + item.sceneId + ' - ' + item.description);
                triggerScene(item.sceneId);
            }, null, true, null);

            runningCronJobs.push({ id: item.id, job: job });

        });

        log('');
    } else {
        log('');
        log('No schedules found');
        log('');
    }

}

function triggerScene(sceneId) {
    getScene(sceneId, function(scene) {
        actionLights(scene.lights, scene.action);
    });
}

function getLight(id, callback) {
    lights.forEach(function(item) {
        if (item.id == id) {
            callback(item);
        }
    });
}

function getScene(sceneId, callback) {
    scenes.forEach(function(scene) {
        if (scene.id == sceneId) {
            callback(scene);
        }
    });
}
