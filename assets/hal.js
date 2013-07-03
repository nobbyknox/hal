var rootUrl = "http://nobbyk2.mooo.com:8091/";

var lights = new Array();
lights[0] = new Light("Front Flood Light", 0);
//lights[1] = new Light("Main Garage", 1);
//lights[2] = new Light("Hallway", 2);
//lights[3] = new Light("Side Passage", 3);

var sceneLeonieHome = new Scene(0, "Leonie Home", [lights[0]]);
//var sceneNobbyHome = new Scene(1, "Nobby Home", [lights[1]]);
var sceneAllOff = new Scene(2, "All Off", [lights[0]]);
var sceneEmergency = new Scene(2, "Emergency", [lights[0]]);

function comingSoon() {
    showMessage("Comming Soon", "This feature is not currently available, but will be soon. Watch this space. :-)");
}

function showMessage(title, body) {
    $("#mesgBoxLabel").html(title);
    $("#mesgBoxBody").html(body);
    $(".modal-header").css("color","");
    $("#mesgBox").modal("show");
}

function showError(title, body) {
    $("#mesgBoxLabel").html(title);
    $("#mesgBoxBody").html(body);
    $(".modal-header").css("color","darkred");
    $("#mesgBox").modal("show");
}


//-------------
// Light Object
//-------------
function Light(name, instNum) {
    this.name = name;
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
        $("#lampOn" + theLight.instNum).on("click", function(event) {
            event.preventDefault();
            switchOn(theLight.instNum);
        });
        $("#lampOff" + theLight.instNum).on("click", function(event) {
            event.preventDefault();
            switchOff(theLight.instNum);
        });
    });


    // Scenes
    //-------
    $("#leonieHomeScene").on("click", function(event) {
        event.preventDefault();

        sceneLeonieHome.lights.forEach(function(theLight) {
            switchOn(theLight.instNum);
        });
    });

/*
    $("#nobbyHomeScene").on("click", function(event) {
        event.preventDefault();

        sceneNobbyHome.lights.forEach(function(theLight) {
            switchOn(theLight.instNum);
        });
    });
*/

    $("#about").on("click", function(event) {
        event.preventDefault();
        showMessage("About HAL", "TODO: Write me");
    });

    $("#sysInfo").on("click", function(event) {
        event.preventDefault();

        var infoText =
            "<table>" +
            "<tr><td>Available memory:</td>" + "<td>?</td></tr>" +
            "<tr><td>Free memory:</td>" + "<td>?</td></tr>" +
            "<tr><td>System boot:</td>" + "<td>?</td></tr>" +
            "</table>";

        showMessage("System Information", infoText);
    });

    $("#allOffScene").on("click", function(event) {
        event.preventDefault();

        sceneAllOff.lights.forEach(function(theLight) {
            switchOff(theLight.instNum);
        });
    });

    $("#emergencyScene").on("click", function(event) {
        event.preventDefault();

        sceneEmergency.lights.forEach(function(theLight) {
            switchOn(theLight.instNum);
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
                    '<img id="lampStatus' + theLight.instNum + '" src="assets/images/lamp_off.png" style="vertical-align: middle" />' +
                    '&nbsp;' +
                    '<a id="lampOn' + theLight.instNum + '" class="btn btn-large btn-primary" href="#"><i class="icon-asterisk icon-white"></i> On</a>' +
                    '&nbsp;' +
                    '<a id="lampOff' + theLight.instNum + '" class="btn btn-large btn-primary" href="#"><i class="icon-off icon-white"></i> Off</a>' +
                '</div>' +
            '</div>' +
            '<br/>';
    });

    $("#lightlist").html(lightListHtml);

}

function switchOn(instNum) {
    cgiCall("on", instNum);
}

function switchOff(instNum) {
    cgiCall("off", instNum);
}

// New proposed name: postSwitchCommand
function cgiCall(switchCmd, instNum) {

    var posting = $.post(rootUrl + "cgi-bin/switch.rb", {switchCmd: switchCmd, instNum: instNum});

    posting.success(function(data) {
        var cmd = this.data.split('&')[0].split('=')[1];
        var instNum = this.data.split('&')[1].split('=')[1];

        if (cmd === "on") {
            changeLampImage(instNum, 255);
        } else if (cmd === "off") {
            changeLampImage(instNum, 0);
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
        var posting = $.post(rootUrl + "cgi-bin/switch.rb", {switchCmd: "status", instNum: theLight.instNum});
        posting.success(function(data) {
            var instNum = this.data.split('&')[1].split('=')[1];
            changeLampImage(instNum, data);
        });

        posting.fail(function(data) {
            var instNum = this.data.split('&')[1].split('=')[1];
            console.log("Status retrieval failed for instance number " + instNum);
        });
    });
}


function changeLampImage(instNum, status) {
    if (status == 0) {
        $("#lampStatus" + instNum).attr("src", "assets/images/lamp_off.png");
    } else {
        $("#lampStatus" + instNum).attr("src", "assets/images/lamp_on.png");
    }
}
