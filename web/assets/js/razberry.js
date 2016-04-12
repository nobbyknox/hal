var halRoot = "/";
var ON_VALUE = 'on';
var OFF_VALUE = 'off';


function changeLampImage(lightId, status) {
    if (status === 'off') {
        $("#lamp-status-" + lightId).attr("src", "assets/images/lamp_off.png");
    } else {
        $("#lamp-status-" + lightId).attr("src", "assets/images/lamp_on.png");
    }
}

function getLightStatus(id, token, callback) {

    var lePost = $.ajax({
        url: halRoot + 'status?token=' + token,
        type: 'POST',
        data: JSON.stringify({ "id": id }),
        contentType: 'application/json'
    });

    lePost.done(function(status) {
        callback(status);
    });

}

function manageLightStatusUpdate(lights, token) {
    lights.forEach(function(light) {
        getLightStatus(light.id, token, function(status) {
            changeLampImage(light.id, status);
        });
    });
}

function toggleLight(lightId, token) {

    alert('Top of toggleLight');

    var lePost = $.ajax({
        url: halRoot + 'toggle',
        type: 'POST',
        data: JSON.stringify({ "id": lightId }),
        contentType: 'application/json',
        headers: {"token": token}
    });

    lePost.done(function(data) {
        changeLampImage(lightId, data);
    });

    lePost.fail(function(data) {
        console.log('Failure - ' + data.responseText + data.response);
    });

}

function triggerScene(sceneId, token, next) {

    var lePost = $.ajax({
        url: halRoot + 'scene',
        type: 'POST',
        data: JSON.stringify({ "id": sceneId }),
        contentType: 'application/json',
        headers: {"token": token}
    });

    lePost.done(function(data) {
        //scene.lights.forEach(function(lightId) {
        //    changeLampImage(lightId, (scene.action == 'off' ? OFF_VALUE : ON_VALUE));
        //});
        next();
    });

    lePost.fail(function(data) {
        console.log('Failure - ' + data.responseText + data.response);
        next(data);
    });

}
