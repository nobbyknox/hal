'use strict';

var loginApp = angular.module('loginApp', [
    'ngRoute',
    'ngCookies'
]);

loginApp.config(function($routeProvider) {

    // Define the routes
    $routeProvider
        .when('/', {
            controller: 'LoginController'
        })
        .otherwise({
            redirectTo: '/'
        });

});

loginApp.run(function($rootScope, $http, $cookies, $window) {

    // If the visitor is already logged in (has a cookie), take him to the main site.
    var biscuit = $cookies.getObject('halLogin');
    if (biscuit) {
        $window.location = '/';
    }

});

loginApp.controller('LoginController', function($scope, $rootScope, $http, $cookies, $window) {

    $scope.login = function() {

        $http.post('/authenticate', {'username': $scope.username, 'password': $scope.password})
            .then(function (serverResponse) {

                var cookiePayload = {
                    userId: serverResponse.data.userId,
                    username: serverResponse.data.username,
                    screenName: serverResponse.data.screenName,
                    token: serverResponse.data.token
                };

                $cookies.putObject('halLogin', cookiePayload, { 'expires': new Date(2100, 1, 1) });
                $window.location = '/';

            }, function() {
                $('#passwordAlert').show();
            });
    };
});
