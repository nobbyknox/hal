var http = require('http');
var zwaveHostname = '192.168.10.221';
var zwavePort = 8083;

var express = require('express');
var app = express();

var ON_VALUE = 255;
var OFF_VALUE = 0;

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

app.get('/hello', function(req, res) {
    res.send('Hello World!');
});

app.post('/status', function(req, res) {

    console.log('Top of /status');
    console.log('  req.body.deviceNum: ' + req.body.deviceNum + ', req.body.instNum: ' + req.body.instNum);

    var options = {
        hostname: zwaveHostname,
        port: zwavePort,
        path: '/ZWaveAPI/Run/devices[' + req.body.deviceNum + '].instances[' + req.body.instNum + '].commandClasses[0x25].data.level.value',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var zwaveReq = http.request(options, function(zwaveRes) {
        zwaveRes.setEncoding('utf8');
        zwaveRes.on('data', function(chunk) {
            res.send(chunk);
        });
    });

    zwaveReq.on('error', function(e) {
        console.log('Problem with request: ' + e.message);
    });

    zwaveReq.end();

});

app.post('/toggle', function(req, res) {

    console.log('Top of /toggle');
    console.log('  req.body.deviceNum: ' + req.body.deviceNum + ', req.body.instNum: ' + req.body.instNum);

    var options = {
        hostname: zwaveHostname,
        port: zwavePort,
        path: '/ZWaveAPI/Run/devices[' + req.body.deviceNum + '].instances[' + req.body.instNum + '].commandClasses[0x25].data.level.value',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var zwaveReq = http.request(options, function(zwaveRes) {
        zwaveRes.setEncoding('utf8');

        zwaveRes.on('data', function(chunk) {

            console.log('current status: ' + chunk);

            if (chunk == ON_VALUE) {
                setLight(req.body.deviceNum, req.body.instNum, OFF_VALUE);
            } else {
                setLight(req.body.deviceNum, req.body.instNum, ON_VALUE);
            }
        });
    });

    zwaveReq.on('error', function(e) {
        console.log('Problem with request: ' + e.message);
    });

    zwaveReq.end();


});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

//function getStatus(device, instance) {
//
//    var options = {
//        hostname: zwaveHostname,
//        port: zwavePort,
//        path: '/ZWaveAPI/Run/devices[' + device + '].instances[' + instance + '].commandClasses[0x25].data.level.value',
//        method: 'POST'
//    };
//
//    var req = http.request(options, function(res) {
//        res.setEncoding('utf8');
//        res.on('data', function(chunk) {
//             return chunk;
//        });
//    });
//
//    req.on('error', function(e) {
//        console.log('Problem with request: ' + e.message);
//    });
//
//    req.end();
//
////    setTimeout(function() {return 'bite me';}, 1000);
//
//    return 'bite me 2';
//
//}

function setLight(device, instance, state) {

    console.log('Top of setLight');
    console.log('  state: ' + state);

    var options = {
        hostname: zwaveHostname,
        port: zwavePort,
        path: '/ZWaveAPI/Run/devices[' + device + '].instances[' + instance + '].commandClasses[0x25].Set(' + state + ')',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var req = http.request(options);

    req.on('error', function(e) {
        console.log('Problem with request: ' + e.message);
    });

    req.end();

}
