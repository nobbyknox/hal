var halRoot = "/";
var ON_VALUE = '255';
var OFF_VALUE = '0';


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

function triggerScene(sceneId) {

    var lePost = $.ajax({
        url: halRoot + 'scene',
        type: 'POST',
        data: JSON.stringify({ "id": sceneId }),
        contentType: 'application/json'
    });

    lePost.done(function(data) {

/*
        scenes.forEach(function(sceneItem) {
            if (sceneItem.id === sceneId) {
                sceneItem.lights.forEach(function(lightItem) {
                    changeLampImage(lightItem, (sceneItem.action === 'off' ? OFF_VALUE : ON_VALUE));
                })
            }
        });
*/

    });

    lePost.fail(function(data) {
        console.log('Failure - ' + data.responseText + data.response);
    });

}

function changeLampImage(lightId, status) {
    if (status === '0') {
        $("#lamp-status-" + lightId).attr("src", "assets/images/lamp_off.png");
    } else {
        $("#lamp-status-" + lightId).attr("src", "assets/images/lamp_on.png");
    }
}
