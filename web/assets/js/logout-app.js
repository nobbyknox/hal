'use strict';

var logoutApp = angular.module('logoutApp', [ 'ngCookies' ]);

logoutApp.run(function($cookies) {
    $cookies.remove('halLogin');
});
