'use strict';

var halApp = angular.module('halApp', ['ngRoute']);

halApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/',             { templateUrl: 'partials/control-center.html', controller: 'ControlCenterController' });
    $routeProvider.when('/about',        { templateUrl: 'partials/about.html' });
    $routeProvider.when('/invalidRoute', { templateUrl: 'partials/invalid-route.html' });
    $routeProvider.when('/schedules',    { templateUrl: 'partials/schedules.html', controller: 'SchedulesController' });
    $routeProvider.when('/schedule/:id', { templateUrl: 'partials/schedule.html', controller: 'ScheduleController' });
    $routeProvider.when('/sysInfo',      { templateUrl: 'partials/sys-info.html', controller: 'SysInfoController' });
    $routeProvider.otherwise({ redirectTo: '/invalidRoute' });
}]);

halApp.controller('ControlCenterController', function($scope) {
    $scope.lights = [ { id: 1, name: 'Light 1' }, { id: 2, name: 'Light 2' } ];
    $scope.scenes = [ { id: 1, name: 'Scene 1' }, { id: 2, name: 'Scene 2' } ];
});

halApp.controller('SchedulesController', function($scope, $http, $location) {
    $http.get('/schedules').success(function(data) {
        $scope.schedules = data;
    });

    $scope.showDetail = function(id) {
        $location.path('/schedule/' + id);
    }
});

halApp.controller('ScheduleController', function($scope, $http, $routeParams) {
    $http.get('/schedule/' + $routeParams.id).success(function(data) {
        $scope.schedule = data;
    });
});

halApp.controller('SysInfoController', function($scope, $http) {
    $http.get('/sysInfo').success(function(data) {
        $scope.sysInfo = data;
    });
});
