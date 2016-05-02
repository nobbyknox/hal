var halRoot = '/';

function changeLampImage(lightId, status) {
    if (status === 'off') {
        $('#lamp-status-' + lightId).attr('src', 'assets/images/lamp_off.png');
    } else {
        $('#lamp-status-' + lightId).attr('src', 'assets/images/lamp_on.png');
    }
}

function getLightStatus(id, token, next) {

    var lePost = $.ajax({
        url: halRoot + 'status',
        type: 'POST',
        data: JSON.stringify({ id: id }),
        contentType: 'application/json',
        headers: { token: token }
    });

    lePost.done(function(status) {
        next(status);
    });

}

function manageLightStatusUpdate(token, next) {

    var lePost = $.ajax({
        url: halRoot + 'combinedstatus',
        type: 'POST',
        data: '',
        contentType: 'application/json',
        headers: { token: token }
    });

    lePost.done(function(data) {

        var stats = JSON.parse(data);
        next(null, stats);

        stats.forEach(function(stat) {
            if (stat) {
                changeLampImage(stat.id, stat.status);
            }
        });
    });

    lePost.fail(function(data) {
        // TODO: This just prints 'undefined' twice. Sort it out.
        console.log('Failure - ' + data.responseText + data.response);
    });

}

function toggleLight(lightId, token) {

    var lePost = $.ajax({
        url: halRoot + 'toggle?token=' + token,
        type: 'POST',
        data: JSON.stringify({ id: lightId }),
        contentType: 'application/json',
        headers: { token: token }
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
        data: JSON.stringify({ id: sceneId }),
        contentType: 'application/json',
        headers: { token: token }
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
