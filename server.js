var http = require('http');
var cronJob = require('cron').CronJob;
var moment = require('moment');
var express = require('express');

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

app.post('/status', function(request, response) {

    var options = {
        hostname: zwaveHostname,
        port: zwavePort,
        path: '/ZWaveAPI/Run/devices[' + request.body.deviceNum + '].instances[' + request.body.instNum + '].commandClasses[0x25].data.level.value',
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

app.post('/toggle', function(request, response) {

    // TODO: Must migrate towards light ID away from device/instance IDs

    getLightState(request.body.deviceNum, request.body.instNum, function(currentState) {
        var newState = (currentState === ON_VALUE ? OFF_VALUE : ON_VALUE);

        response.send(newState);
        response.end();

        setLight(request.body.deviceNum, request.body.instNum, newState);
    });

});

app.post('/on', function(request, response) {
    response.send(ON_VALUE);
    response.end();
    setLight(request.body.deviceNum, request.body.instNum, ON_VALUE);
});

app.post('/off', function(request, response) {
    response.send(OFF_VALUE);
    response.end();
    setLight(request.body.deviceNum, request.body.instNum, OFF_VALUE);
});

app.post('/sysinfo', function(request, response) {

    var os = require('os');
    var uptime = os.uptime();

    var info = {
        'hostname': os.hostname(),
        'ostype': os.type(),
        'release': os.release(),
        'cpu': os.cpus()[0].model,
        'uptime': (uptime < 3600 ? (uptime / 60) + ' minutes' : (uptime / 60 / 60) + ' hours'),
        'totalmem': (os.totalmem() / 1024 / 1024) + ' MB',
        'freemem': (os.freemem() / 1024 / 1024) + ' MB'
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

            if ((action === 'on') || (action === 'off')) {
                setLight(light.device, light.instance, (action === 'on' ? ON_VALUE : OFF_VALUE));
            } else if (action === 'toggle') {
                getLightState(light.device, light.instance, function(currentState) {
                    var newState = (currentState === ON_VALUE ? OFF_VALUE : ON_VALUE);
                    setLight(light.device, light.instance, newState);
                });
            }
        });
    });
}

function getLightState(device, instance, callback) {

    var options = {
        hostname: zwaveHostname,
        port: zwavePort,
        path: '/ZWaveAPI/Run/devices[' + device + '].instances[' + instance + '].commandClasses[0x25].data.level.value',
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

function setLight(device, instance, state) {

    var options = {
        hostname: zwaveHostname,
        port: zwavePort,
        path: '/ZWaveAPI/Run/devices[' + device + '].instances[' + instance + '].commandClasses[0x25].Set(' + state + ')',
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
                triggerScene(item.sceneId);
            }, null, true, null);
        });

        log('');
    } else {
        log('No schedules found');
    }

}

function triggerScene(sceneId) {
    log('Schedule triggering scene ID ' + sceneId + '...');
    getScene(sceneId, actionLights);
}

function getLight(id, callback) {
    lights.forEach(function(item) {
        if (item.id === id) {
            callback(item);
        }
    });
}

function getScene(sceneId, callback) {
    scenes.forEach(function(scene) {
        if (scene.id === sceneId) {
            callback(scene.lights, scene.action);
        }
    });
}
