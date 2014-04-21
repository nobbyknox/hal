'use strict';

angular.module('halApp', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/',        { templateUrl: 'partials/control-center.html', controller: 'ControlCenterController' });
        $routeProvider.when('/about',   { templateUrl: 'partials/about.html' });
        $routeProvider.when('/sysInfo', { templateUrl: 'partials/sys-info.html', controller: 'SysInfoController' });
        $routeProvider.otherwise({ redirectTo: '/' });
    }])

    .controller('ControlCenterController', function($scope) {
        $scope.lights = [ { id: 1, name: 'Light 1' }, { id: 2, name: 'Light 2' } ];
        $scope.scenes = [ { id: 1, name: 'Scene 1' }, { id: 2, name: 'Scene 2' } ];
    })

    .controller('SysInfoController', function($scope, $http) {
        $http.get('/sysInfo').success(function(data) {
            $scope.sysInfo = data;
        });
    });
