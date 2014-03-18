var http = require('http');
var zwaveHostname = '192.168.10.221';
var zwavePort = 8083;

var express = require('express');
var app = express();

var ON_VALUE = '255';
var OFF_VALUE = '0';

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

app.get('/hello', function(req, res) {
    res.send('Hello World!');
});

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
        console.log('Problem with request: ' + e.message);
    });

    zwaveRequest.end();

});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});


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
        console.log('Problem with request: ' + e.message);
    });

    request.end();

}
