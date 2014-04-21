var halRoot = "/";
var ON_VALUE = '255';
var OFF_VALUE = '0';


function changeLampImage(lightId, status) {
    if (status === '0') {
        $("#lamp-status-" + lightId).attr("src", "assets/images/lamp_off.png");
    } else {
        $("#lamp-status-" + lightId).attr("src", "assets/images/lamp_on.png");
    }
}

function getLightStatus(id, callback) {

    var lePost = $.ajax({
        url: halRoot + 'status',
        type: 'POST',
        data: JSON.stringify({ "id": id }),
        contentType: 'application/json'
    });

    lePost.done(function(status) {
        callback(status);
    });

}

function manageLightStatusUpdate(lights) {

    lights.forEach(function(light) {
        getLightStatus(light.id, function(status) {
            changeLampImage(light.id, status);
        });
    });
}

function toggleLight(lightId) {

    var lePost = $.ajax({
        url: halRoot + 'toggle',
        type: 'POST',
        data: JSON.stringify({ "id": lightId }),
        contentType: 'application/json'
    });

    lePost.done(function(data) {
        changeLampImage(lightId, data);
    });

    lePost.fail(function(data) {
        console.log('Failure - ' + data.responseText + data.response);
    });

}

function triggerScene(scene) {

    var lePost = $.ajax({
        url: halRoot + 'scene',
        type: 'POST',
        data: JSON.stringify({ "id": scene.id }),
        contentType: 'application/json'
    });

    lePost.done(function(data) {
        scene.lights.forEach(function(lightId) {
            changeLampImage(lightId, (scene.action == 'off' ? OFF_VALUE : ON_VALUE));
        });
    });

    lePost.fail(function(data) {
        console.log('Failure - ' + data.responseText + data.response);
    });

}
