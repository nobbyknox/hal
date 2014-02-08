var rootUrl = "http://nobbyk2.mooo.com:8091/";

var lights = new Array();
lights[0] = new Light("Front Flood Light", 2, 0);
lights[1] = new Light("Side Passage", 3, 0);
lights[2] = new Light("Art Room", 4, 0);
lights[3] = new Light("Front Lounge", 5, 1);

var sceneLeonieHome = new Scene(0, "Leonie Home", [lights[0], lights[1], lights[2]]);
var sceneNobbyHome = new Scene(1, "Nobby Home", [lights[0], lights[3]]);
//var sceneNobbyHome = new Scene(1, "Nobby Home", [lights[0]]);
var sceneAllOff = new Scene(2, "All Off", [lights[0], lights[1], lights[2], lights[3]]);
var sceneEmergency = new Scene(3, "Emergency", [lights[0], lights[1], lights[2], lights[3]]);

function comingSoon() {
    showMessage("Comming Soon", "This feature is not currently available, but will be soon. Watch this space. :-)");
}

function showMessage(title, body) {
    $("#mesgBoxLabel").html(title);
    $("#mesgBoxBody").html(body);
    // TODO: This is a bad way of doing it. Use an ID.
    $(".modal-header").css("color","");
    $("#mesgBox").modal("show");
}

function showError(title, body) {
    $("#mesgBoxLabel").html(title);
    $("#mesgBoxBody").html(body);
    // TODO: This is a bad way of doing it. Use an ID.
    $(".modal-header").css("color","darkred");
    $("#mesgBox").modal("show");
}


//-------------
// Light Object
//-------------
function Light(name, deviceNum, instNum) {
    this.name = name;
    this.deviceNum = deviceNum;
    this.instNum = instNum;
}


//-------------
// Scene Object
//-------------
function Scene(id, name, lights) {
    this.id = id;
    this.name = name;
    this.lights = lights;
}


//------
// Other
//------

function init() {

    buildLightList();


    // Lights
    //-------
    lights.forEach(function(theLight) {
        $("#lampOn" + theLight.deviceNum).on("click", function(event) {
            event.preventDefault();
            switchOn(theLight.deviceNum, theLight.instNum);
        });
        $("#lampOff" + theLight.deviceNum).on("click", function(event) {
            event.preventDefault();
            switchOff(theLight.deviceNum, theLight.instNum);
        });
    });


    $("#about").on("click", function(event) {
        event.preventDefault();
        $("#aboutBox").modal("show");
    });

    $("#sysInfo").on("click", function(event) {
        event.preventDefault();

        var posting = $.post(rootUrl + "cgi-bin/sysinfo.rb", {});

        posting.success(function(data) {
            var infoText =
                "<table>" +
                "<tr><td>Operating System:</td><td>" + data.os + "</td></tr>" +
                "<tr><td>Kernel Version:</td><td>" + data.kernel_version + "</td></tr>" +
                "<tr><td>Host Name:</td><td>" + data.host_name + "</td></tr>" +
                "<tr><td>Processor:</td><td>" + data.processor + "</td></tr>" +
                "<tr><td>Available Memory:</td><td>" + data.tot_mem + "</td></tr>" +
                "<tr><td>Free Memory:</td><td>" + data.free_mem + "</td></tr>" +
                "<tr><td>Up Time:</td><td>" + data.up_time + "</td></tr>" +
                "</table>";

            showMessage("System Information", infoText);
        });

        posting.fail(function(data) {
            showError("Oops", "Oops, something went wrong getting the system information. :-(");
        });
    });

    // Scenes
    //-------
    $("#leonieHomeScene").on("click", function(event) {
        event.preventDefault();

        sceneLeonieHome.lights.forEach(function(theLight) {
            switchOn(theLight.deviceNum, theLight.instNum);
        });
    });

    $("#nobbyHomeScene").on("click", function(event) {
        event.preventDefault();

        sceneNobbyHome.lights.forEach(function(theLight) {
            console.log("Turning on light " + theLight.deviceNum);
            switchOn(theLight.deviceNum, theLight.instNum);
        });
    });

    $("#allOffScene").on("click", function(event) {
        event.preventDefault();

        sceneAllOff.lights.forEach(function(theLight) {
            switchOff(theLight.deviceNum, theLight.instNum);
        });
    });

    $("#emergencyScene").on("click", function(event) {
        event.preventDefault();

        sceneEmergency.lights.forEach(function(theLight) {
            switchOn(theLight.deviceNum, theLight.instNum);
        });
    });


    updateStatus();

    window.setInterval(function() {
        updateStatus();
    }, 20000);

}

function buildLightList() {

    var lightListHtml = $("#lightlist").html();

    // Append the lights to the "lightlist" container
    lights.forEach(function(theLight) {

        lightListHtml +=
            '<div class="row-fluid">' +
                '<div class="span12" style="margin-left: 30px; min-height: 20px">' +
                    '<em>' + theLight.name + '</em>' +
                '</div>' +
            '</div>' +

            '<div class="row-fluid">' +
                '<div class="span12">' +
                    '<img id="lampStatus' + theLight.deviceNum + '" src="assets/images/lamp_off.png" style="vertical-align: middle" />' +
                    '&nbsp;' +
                    '<a id="lampOn' + theLight.deviceNum + '" class="btn btn-large btn-primary" href="#"><i class="icon-asterisk icon-white"></i> On</a>' +
                    '&nbsp;' +
                    '<a id="lampOff' + theLight.deviceNum + '" class="btn btn-large btn-primary" href="#"><i class="icon-off icon-white"></i> Off</a>' +
                '</div>' +
            '</div>' +
            '<br/>';
    });

    $("#lightlist").html(lightListHtml);

}

function switchOn(deviceNum, instNum) {
    cgiCall("on", deviceNum, instNum);
}

function switchOff(deviceNum, instNum) {
    cgiCall("off", deviceNum, instNum);
}

// New proposed name: postSwitchCommand
function cgiCall(switchCmd, deviceNum, instNum) {

    var posting = $.post(rootUrl + "cgi-bin/switch.rb", {"switchCmd": switchCmd, "deviceNum": deviceNum, "instNum": instNum});

    posting.success(function(data) {
        var cmd = this.data.split('&')[0].split('=')[1];
        var deviceNum = this.data.split('&')[1].split('=')[1];
        // var instNum = this.data.split('&')[2].split('=')[1];

        if (cmd === "on") {
            changeLampImage(deviceNum, 255);
        } else if (cmd === "off") {
            changeLampImage(deviceNum, 0);
        }
    });

    posting.fail(function(data) {
        if (data.status == "404") {
            alert("Unable to find resource 'cgi-bin/switch.rb'");
        } else {
            alert("An error occurred:\n" +
                "readyState: " + data.readyState + "\n" +
                "status: " + data.status + "\n" +
                "statusText: " + data.statusText);
        }
    });
}

function updateStatus() {

    lights.forEach(function(theLight) {

        var posting = $.post(rootUrl + "cgi-bin/switch.rb", {"switchCmd": "status", "deviceNum": theLight.deviceNum, "instNum": theLight.instNum});

        posting.success(function(data) {
            var deviceNum = this.data.split('&')[1].split('=')[1];
            changeLampImage(deviceNum, data);
        });

        posting.fail(function(data) {
            var deviceNum = this.data.split('&')[1].split('=')[1];
            console.log("Status retrieval failed for device number " + deviceNum);
        });
    });
}


function changeLampImage(deviceNum, status) {
    if (status == 0) {
        $("#lampStatus" + deviceNum).attr("src", "assets/images/lamp_off.png");
    } else {
        $("#lampStatus" + deviceNum).attr("src", "assets/images/lamp_on.png");
    }
}
