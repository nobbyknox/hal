// -----------------------------------------------------------------------------
// Full in-your-face messages
// -----------------------------------------------------------------------------

function confirmDeletion(title, text, next) {
    'use strict';

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
    'use strict';

    sweetAlert.close();
}

function showErrorMessage(title, text) {
    'use strict';

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
    'use strict';

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
    'use strict';

    swal(title || 'Info', text, 'info');
}

function showSuccessMessage(title, text) {
    'use strict';

    swal(title || 'Success', text, 'success');
}

function showShortTimedSuccessMessage(title, text) {
    'use strict';

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
    'use strict';

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
    'use strict';
    showBriefMessage(title || 'Error', text, 'error');
}

function showBriefInfoMessage(title, text) {
    'use strict';
    showBriefMessage(title || 'Info', text, 'info');
}

function showBriefSuccessMessage(title, text) {
    'use strict';
    showBriefMessage(title || 'Success', text, 'success');
}

function showBriefWarningMessage(title, text) {
    'use strict';
    showBriefMessage(title || 'Warning', text, 'warning');
}

function showBriefMessage(title, text, type) {
    'use strict';

    new PNotify({
        title: title || 'Info',
        text: text,
        type: type
    });
}
