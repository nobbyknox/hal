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

halApp.controller('ControlCenterController', function($scope, $http, $timeout, $interval) {

    $timeout(function() {
        console.log('Initial status update');
    }, 1500);

    var updateTimer = $interval(function() {
        console.log('Intermittent status update');
    }, 20000); // check status every 20 seconds

    $scope.$on('$destroy', function() {
        console.log('In destroy event of $scope');
        $interval.cancel(updateTimer);
    });


    $http.get('/lights').success(function(data) {
        $scope.lights = data;
    });

    $http.get('/scenes').success(function(data) {
        $scope.scenes = data;
    });

    $scope.toggleLight = function(id) {
        toggleLight(id);
    }

    $scope.triggerScene = function(id) {
        triggerScene(id);
    }

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
