'use strict';

// -----------------------------------------------------------------------------
// Full in-your-face messages
// -----------------------------------------------------------------------------

function confirmDeletion(title, text, next) {

    swal({
        title: title || "Are you sure?",
        text: text,
        type: "warning",
        showCancelButton: true,
        showLoaderOnConfirm: true,
        confirmButtonColor: "#D9534F",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false,
        html: true
    }, function() {
        next();
    });

}

function clearDeleteConfirmation() {
    sweetAlert.close();
}

function showErrorMessage(title, text) {
    if (Array.isArray(text)) {
        showErrorMessageList(title, null, text);
    } else {
        swal({
            'title': title || 'Oops!',
            'text': text,
            'html': true,
            'type': 'error'
        });
    }
}

function showErrorMessageList(title, intro, messages) {

    var theText = '';

    if (intro) {
        theText += '<div style="text-align: left">' + intro + '</div>';
        theText += '<p/>';
    }

    theText += '<div style="text-align: left; margin-top: 10px;"><ul>';

    if (messages && messages.length > 0) {
        messages.forEach(function(item) {
            theText += '<li>' + item + '</li>';
        });
    }

    theText += '</ul></div>';

    swal({
        'title': title || 'Oops!',
        'text': theText,
        'html': true,
        type: 'error'
    });

}

function showInfoMessage(title, text) {
    swal(title || 'Info', text, 'info');
}

function showSuccessMessage(title, text) {
    swal(title || 'Success', text, 'success');
}

function showShortTimedSuccessMessage(title, text) {
    swal({
        title: title || 'Success',
        text: text,
        timer: 1000,
        type: 'success',
        showConfirmButton: false
    });
}

// TODO: Change function name to showApiError
function showPromiseError(title, response, defaultMessage) {
    var realTitle = (title ? title : (response.status === 401 ? 'Unauthorised' : null));

    if (response && response.data && response.data.message) {
        showErrorMessage(realTitle, response.data.message);
    } else {
        showErrorMessage(realTitle, defaultMessage);
    }

}


// -----------------------------------------------------------------------------
// Brief messages
// -----------------------------------------------------------------------------

function showBriefErrorMessage(title, text) {
    showBriefMessage(title || 'Error', text, 'error');
}

function showBriefInfoMessage(title, text) {
    showBriefMessage(title || 'Info', text, 'info');
}

function showBriefSuccessMessage(title, text) {
    showBriefMessage(title || 'Success', text, 'success');
}

function showBriefWarningMessage(title, text) {
    showBriefMessage(title || 'Warning', text, 'warning');
}

function showBriefMessage(title, text, type) {
    new PNotify({
        title: title || 'Info',
        text: text,
        type: type
    });
}
