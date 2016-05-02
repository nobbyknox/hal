'use strict';

const HAL_VERSION = '3.2';

const HTTP_STATUS = {
    OKAY: 200,
    REDIRECT: 302,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    ACCESS_DENIED: 403,
    SERVER_ERROR: 500
};

module.exports = {
    HAL_VERSION,
    HTTP_STATUS
};
