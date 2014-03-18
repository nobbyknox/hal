//var zwaveRoot = "http://nobbyk2.mooo.com:8091/";
//var zwaveRoot = "http://192.168.10.221:8083/";
//var halRoot = "http://192.168.10.105:3000/";
var halRoot = "http://localhost:3000/";

var lights = [];
lights[0] = new Light("Front Flood Light", 2, 0);
lights[1] = new Light("Side Passage", 3, 0);
lights[2] = new Light("Art Room", 4, 0);
lights[3] = new Light("Front Lounge", 5, 1);

var sceneLeonieHome = new Scene(0, "Leonie Home", [lights[0], lights[1], lights[2]]);
var sceneNobbyHome = new Scene(1, "Nobby Home", [lights[0], lights[3]]);
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
        $("#light-" + theLight.deviceNum).on("click", function(event) {
            event.preventDefault();
            toggleLight(theLight.deviceNum, theLight.instNum);
        });
    });


    $("#about").on("click", function(event) {
        event.preventDefault();
        $("#aboutBox").modal("show");
    });

    $("#sysInfo").on("click", function(event) {
        event.preventDefault();

        var posting = $.post(zwaveRoot + "cgi-bin/sysinfo.rb", {});

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

//    window.setInterval(function() {
//         updateStatus();
//    }, 20000);

}

function buildLightList() {

    var lightListElement = $('#light-list');
    var lightListHtml = lightListElement.html();

    // Append the lights to the "lightlist" container
    lights.forEach(function(theLight) {

        lightListHtml +=
            '<div class="row-fluid">' +
                '<a id="light-' + theLight.deviceNum + '" class="btn btn-large btn-primary btn-block light-button" href="#">' +
                '<img id="lamp-status-' + theLight.deviceNum + '" src="assets/images/lamp_off.png" style="vertical-align: middle" /> ' + theLight.name +
                '</a>' +
                '</div>' +
                '<br/>';
    });

    lightListElement.html(lightListHtml);

}

function toggleLight(deviceNum, instNum) {

    var lePost = $.ajax({
        url: halRoot + 'toggle',
        type: 'POST',
        data: JSON.stringify({"deviceNum": deviceNum, "instNum": instNum}),
        contentType: 'application/json'
    });

    lePost.done(function(data) {
        changeLampImage(deviceNum, data);
    });

    lePost.fail(function(data) {
        console.log('Failure - ' + data.responseText + data.response);
    });

}

function updateStatus() {

    humane.log("Updating...");

    lights.forEach(function(theLight) {

        var lePost = $.ajax({
            url: halRoot + 'status',
            type: 'POST',
            data: JSON.stringify({"deviceNum": theLight.deviceNum, "instNum": theLight.instNum}),
            contentType: 'application/json'
        });

        lePost.done(function(data) {
            changeLampImage(theLight.deviceNum, data);
        });

        lePost.fail(function(data) {
           console.log('Failure - ' + data.responseText + data.response);
        });

    });
}


function changeLampImage(deviceNum, status) {
    if (status === '0') {
        $("#lamp-status-" + deviceNum).attr("src", "assets/images/lamp_off.png");
    } else {
        $("#lamp-status-" + deviceNum).attr("src", "assets/images/lamp_on.png");
    }
}
