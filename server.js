var http = require('http');
var cronJob = require('cron').CronJob;
var moment = require('moment');
var express = require('express');
var jsonfile = require('jsonfile');

var config = require('./config/' + (process.env.NODE_ENV || 'dev') + '.json');
var lights = require('./config/lights.json');
var scenes = require('./config/scenes.json');

var zwaveHostname = config.zwaveHostname;
var zwavePort = config.zwavePort;
var expressPort = config.expressPort;

var ON_VALUE = '255';
var OFF_VALUE = '0';


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
    var model = { "light": lights };
    response.send(model);
    response.end();
});

app.get('/scenes', function(request, response) {
    var model = { "scene": scenes };
    response.send(model);
    response.end();
});

app.get('/schedules', function(request, response) {
    jsonfile.readFile('./config/schedules.json', function(error, schedules) {
        response.send({ "schedule": schedules });
        response.end();
    });
});

app.put('/schedules/:id', function(request, response) {

    jsonfile.readFile('./config/schedules.json', function(error, schedules) {
        response.end();

        var updated = false;

        schedules.forEach(function(item) {
            if (item.id == request.param('id')) {
                item.cron = request.body.schedule.cron;
                item.description = request.body.schedule.description;
                item.sceneId = request.body.schedule.sceneId;

                updated = true;
            }
        });

        if (updated) {
            jsonfile.writeFile('./config/schedules.json', schedules, function(error) {
                log('Schedules saved');
            });
        }
    });


    response.end();
})

app.post('/status', function(request, response) {


    // TODO: This code is a duplicate of that in getLightState. Use that function here.
    getLight(request.body.id, function(light) {

        var options = {
            hostname: zwaveHostname,
            port: zwavePort,
            path: '/ZWaveAPI/Run/devices[' + light.device + '].instances[' + light.instance + '].commandClasses[0x25].data.level.value',
            method: 'POST'
        };

        var zwaveRequest = http.request(options, function(zwaveResponse) {
            zwaveResponse.setEncoding('utf8');
            zwaveResponse.on('data', function(chunk) {
                response.send(chunk);
                response.end();
            });
        });

        zwaveRequest.on('error', function(e) {
            console.log('Problem with request: ' + e.message);
        });

        zwaveRequest.end();
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

app.get('/sysInfos/:id', function(request, response) {

    var os = require('os');
    var uptime = os.uptime();

    var info = { 'sysInfo': {
        'id': request.params.id,
        'hostName': os.hostname(),
        'osType': os.type(),
        'release': os.release(),
        'cpu': os.cpus()[0].model,
        'upTime': (uptime < 3600 ? (uptime / 60) + ' minutes' : (uptime / 60 / 60) + ' hours'),
        'totMem': (os.totalmem() / 1024 / 1024) + ' MB',
        'freeMem': (os.freemem() / 1024 / 1024) + ' MB'
        }
    };

    response.send(info);
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
                getLightState(light.device, light.instance, function(currentState) {
                    var newState = (currentState == ON_VALUE ? OFF_VALUE : ON_VALUE);
                    setLight(light, newState);
                });
            }
        });
    });
}

function getLightState(light, callback) {

    var options = {
        hostname: zwaveHostname,
        port: zwavePort,
        path: '/ZWaveAPI/Run/devices[' + light.device + '].instances[' + light.instance + '].commandClasses[0x25].data.level.value',
        method: 'POST'
    };

    var request = http.request(options, function(response) {

        response.setEncoding('utf8');

        response.on('data', function(currentState) {
            callback(currentState);
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
        hostname: zwaveHostname,
        port: zwavePort,
        path: '/ZWaveAPI/Run/devices[' + light.device + '].instances[' + light.instance + '].commandClasses[0x25].Set(' + state + ')',
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

        var cronJob = require('cron').CronJob;

        log('');
        log('Schedules:');

        schedules.forEach(function(item) {

            log('  cron: ' + item.cron + ', sceneId: ' + item.sceneId);

            new cronJob(item.cron, function() {
                log('CRON: Triggering scene ' + item.sceneId + ' - ' + item.name);
                triggerScene(item.sceneId);
            }, null, true, null);
        });

        log('');
    } else {
        log('No schedules found');
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
