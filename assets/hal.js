var rootUrl = "http://nobbyk2.mooo.com:8091/";


function comingSoon() {
    alert("Comming soon. Watch this space");
}

function helloWorld() {
    alert("Hello World!");
}


//----------------
// Button triggers
//----------------

// Nobby home scene

// Leonie home scene

// All off

// Emergency scene

function switchOn(name) {
    cgiCall("on", name);
    changeLampImage(255);
}

function switchOff(name) {
    cgiCall("off", name);
    changeLampImage(0);
}

// New proposed name: postSwitchCommand
function cgiCall(switchCmd, name) {

    var posting = $.post(rootUrl + "cgi-bin/switch.rb", {switchCmd: switchCmd, name: name});

    // posting.success(function(data) {
    //     alert(data);
    // });

    posting.fail(function(data) {
        alert("An error occurred: " + data);
    });
}

function updateStatus() {
    var posting = $.post(rootUrl + "cgi-bin/switch.rb", {switchCmd: "status", name: "securityLight"});
    posting.success(function(data) {
        changeLampImage(data);
    });
}


function changeLampImage(status) {
    if (status == 0) {
        $("#lampStatus").attr("src", "assets/images/lamp_off.png");
    } else {
        $("#lampStatus").attr("src", "assets/images/lamp_on.png");
    }
}
