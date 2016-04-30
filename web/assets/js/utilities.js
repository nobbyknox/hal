'use strict';

function isUndefinedOrEmpty(testValue) {
    if (testValue === undefined || testValue === null) {
        return true;
    } else {
        if (typeof testValue === 'string') {
            return testValue === undefined || testValue === null || testValue.replace(/^\s+|\s+$/gm,'').length === 0;
        } else {
            // We only cater for strings and return false for everything else.
            return false;
        }
    }
}

function isNumeric(testValue) {
    return !isNaN(parseFloat(testValue)) && isFinite(testValue);
}
