var http = require('http');
var config = require('./config/' + (process.env.NODE_ENV || 'dev') + '.json');
var cronJob = require('cron').CronJob;
var moment = require('moment');

var zwaveHostname = '192.168.10.221';
var zwavePort = 8083;

var express = require('express');
var app = express();

var EXPRESS_PORT = 3000;
var ON_VALUE = '255';
var OFF_VALUE = '0';


// ---------------------
// Express configuration
// ---------------------

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

    var options = {
        hostname: zwaveHostname,
        port: zwavePort,
        path: '/ZWaveAPI/Run/devices[' + request.body.deviceNum + '].instances[' + request.body.instNum + '].commandClasses[0x25].data.level.value',
        method: 'POST'
    };

    var zwaveRequest = http.request(options, function(zwaveResponse) {
        zwaveResponse.setEncoding('utf8');
        zwaveResponse.on('data', function(chunk) {

            var newState = (chunk === ON_VALUE ? OFF_VALUE : ON_VALUE);

            response.send(newState);
            response.end();

            setLight(request.body.deviceNum, request.body.instNum, newState);

        });
    });

    zwaveRequest.on('error', function(e) {
        log('ERROR: Problem with request: ' + e.message);
    });

    zwaveRequest.end();

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

var server = app.listen(EXPRESS_PORT, function() {

    log('Listening on port ' + server.address().port);
    log(server.address());

    startScheduler();

});


// --------
// The rest
// --------

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

        log('Scheduler starting...');

        var cronJob = require('cron').CronJob;

        log('Schedules:');

        schedules.forEach(function(item) {
            log('  cron: ' + item.cron + ', scene: ' + item.scene);

            new cronJob(item.cron, function() {
                log('CRON: Triggering scene ' + item.scene);
//                testScene();
            }, null, true, null);
        });
    } else {
        log('No schedules found');
    }

}

function testScene() {

    var options = {
        hostname: 'localhost',
        port: EXPRESS_PORT,
        path: '/toggle',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + new Buffer('test' + ':' + 'test').toString('base64')
        }
    };

    var newRequest = http.request(options, function(newResponse) {
        newResponse.setEncoding('utf8');
        newResponse.on('data', function(chunk) {

            log('Server said: ' + chunk);

        });
    });

    newRequest.on('error', function(e) {
        log('ERROR: Problem with request: ' + e.message);
    });

    newRequest.write(JSON.stringify({"deviceNum": 5, "instNum": 1}));
    newRequest.end();

}
