var halRoot = "http://localhost:3000/";

var ON_VALUE = '255';
var OFF_VALUE = '0';

var lights = [];
var scenes = [];


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

    // http://ruben.verborgh.org/blog/2012/12/31/asynchronous-error-handling-in-javascript/
    // http://know.cujojs.com/tutorials/async/mastering-async-error-handling-with-promises

    buildLightList(function(lightList) {
        if (lightList) {
            lights = lightList;

            buildSceneList(function(sceneList) {
                if (sceneList) {
                    scenes = sceneList;
                }
                updateStatus();
            });
        }
    });



    $("#about").on("click", function(event) {
        event.preventDefault();
        $("#aboutBox").modal("show");
    });

    $("#sys-info").on("click", function(event) {
        event.preventDefault();
        showSysInfo();
    });


    window.setInterval(function() {
         updateStatus();
    }, 20000);

}

function buildLightList(callback) {

    var leGet = $.ajax({
        url: halRoot + 'lights',
        type: 'GET',
        contentType: 'application/json'
    });

    leGet.done(function(data) {

        var lightListElement = $('#light-list');
        var lightListHtml = lightListElement.html();

        // Append the lights to the "light-list" container
        data.forEach(function(theLight) {

            lightListHtml +=
                '<div class="row-fluid">' +
                    '<a id="light-' + theLight.id + '" class="btn btn-large btn-primary btn-block light-button" href="#">' +
                    '<img id="lamp-status-' + theLight.id + '" src="assets/images/lamp_off.png" style="vertical-align: middle" /> ' + theLight.name +
                    '</a>' +
                '</div>' +
                '<br/>';
        });

        lightListElement.html(lightListHtml);

        data.forEach(function(theLight) {
            $('#light-' + theLight.id).on('click', function(event) {
                event.preventDefault();
                toggleLight(theLight.id);
            });
        });

        if (callback && (callback instanceof Function)) {
            callback(data);
        }

    });

}

function buildSceneList(callback) {

    var leGet = $.ajax({
        url: halRoot + 'scenes',
        type: 'GET',
        contentType: 'application/json'
    });

    leGet.done(function(data) {

        var sceneListElement = $('#scene-list');
        var sceneListHtml = sceneListElement.html();

        // Append the scenes to the "scene-list" container
        data.forEach(function(theScene) {

            if (theScene.showOnUI) {
                sceneListHtml +=
                    '<div class="row-fluid">' +
                        '<a id="scene-' + theScene.id + '" class="btn btn-large ' + theScene.buttonClass + ' btn-block scene-button" href="#"><span class="' + theScene.glyphiconClass + '"></span> ' + theScene.name + '</a>' +
                    '</div>' +
                    '<br/>';
            }
        });

        sceneListElement.html(sceneListHtml);

        data.forEach(function(theScene) {
            if (theScene.showOnUI) {
                $('#scene-' + theScene.id).on('click', function(event) {
                    event.preventDefault();
                    triggerScene(theScene.id);
                });
            }
        });

        if (callback && (callback instanceof Function)) {
            callback(data);
        }

    });
}

function toggleLight(lightId) {

    var lePost = $.ajax({
        url: halRoot + 'toggle',
        type: 'POST',
        data: JSON.stringify({"id": lightId}),
        contentType: 'application/json'
    });

    lePost.done(function(data) {
        changeLampImage(lightId, data);
    });

    lePost.fail(function(data) {
        console.log('Failure - ' + data.responseText + data.response);
    });

}

function triggerScene(sceneId) {

    var lePost = $.ajax({
        url: halRoot + 'scene',
        type: 'POST',
        data: JSON.stringify({"id": sceneId}),
        contentType: 'application/json'
    });

    lePost.done(function(data) {

        scenes.forEach(function(sceneItem) {
            if (sceneItem.id === sceneId) {
                sceneItem.lights.forEach(function(lightItem) {
                    changeLampImage(lightItem, (sceneItem.action === 'off' ? OFF_VALUE : ON_VALUE));
                })
            }
        });

    });

    lePost.fail(function(data) {
        console.log('Failure - ' + data.responseText + data.response);
    });

}

// TODO: Function is not obsolete
function switchOn(deviceNum, instNum) {

    var lePost = $.ajax({
        url: halRoot + 'on',
        type: 'POST',
        data: JSON.stringify({"deviceNum": deviceNum, "instNum": instNum}),
        contentType: 'application/json'
    });

    lePost.done(function(data) {
        changeLampImage(deviceNum, ON_VALUE);
    });

    lePost.fail(function(data) {
        console.log('Failure - ' + data.responseText + data.response);
    });

}

// TODO: Function is not obsolete
function switchOff(deviceNum, instNum) {

    var lePost = $.ajax({
        url: halRoot + 'off',
        type: 'POST',
        data: JSON.stringify({"deviceNum": deviceNum, "instNum": instNum}),
        contentType: 'application/json'
    });

    lePost.done(function(data) {
        changeLampImage(deviceNum, OFF_VALUE);
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
            data: JSON.stringify({"id": theLight.id}),
            contentType: 'application/json'
        });

        lePost.done(function(data) {
            changeLampImage(theLight.id, data);
        });

        lePost.fail(function(data) {
           console.log('Failure - ' + data.responseText + data.response);
        });

    });
}


function changeLampImage(lightId, status) {
    if (status === '0') {
        $("#lamp-status-" + lightId).attr("src", "assets/images/lamp_off.png");
    } else {
        $("#lamp-status-" + lightId).attr("src", "assets/images/lamp_on.png");
    }
}

function showSysInfo() {
    var lePost = $.ajax({
        url: halRoot + 'sysinfo',
        type: 'POST',
        contentType: 'application/json'
    });

    lePost.done(function(data) {

        $('#hostname').val(data.hostname);
        $('#ostype').val(data.ostype);
        $('#release').val(data.release);
        $('#cpu').val(data.cpu);
        $('#uptime').val(data.uptime);
        $('#totalmem').val(data.totalmem);
        $('#freemem').val(data.freemem);

        $("#sys-info-box").modal("show");
    });

    lePost.fail(function(data) {
        console.log('Failure - ' + data.responseText + data.response);
    });

}