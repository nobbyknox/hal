'use strict';

var halApp = angular.module('halApp', ['ngRoute']);

halApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/',              { templateUrl: 'partials/control-center.html', controller: 'ControlCenterController' });
    $routeProvider.when('/about',         { templateUrl: 'partials/about.html' });
    $routeProvider.when('/invalidRoute',  { templateUrl: 'partials/invalid-route.html' });
    $routeProvider.when('/schedules',     { templateUrl: 'partials/schedules.html', controller: 'SchedulesController' });
    $routeProvider.when('/schedules/new', { templateUrl: 'partials/schedule.html', controller: 'SchedulesNewController' });
    $routeProvider.when('/schedule/:id',  { templateUrl: 'partials/schedule.html', controller: 'ScheduleController' });
    $routeProvider.when('/sysInfo',       { templateUrl: 'partials/sys-info.html', controller: 'SysInfoController' });
    $routeProvider.when('/garageCam',     { templateUrl: 'partials/garage-cam.html', controller: 'GarageCamController' });
    $routeProvider.otherwise({ redirectTo: '/invalidRoute' });
}]);

halApp.controller('ControlCenterController', function($scope, $http, $timeout, $interval) {

    // Check status 1.5 seconds after controller has been loaded
    $timeout(function() {
        humane.log("Updating...");
        manageLightStatusUpdate($scope.lights);
    }, 1000);

    // Check status every 20 seconds
    var updateTimer = $interval(function() {
        humane.log("Updating...");
        manageLightStatusUpdate($scope.lights);
    }, 20000);

    $scope.$on('$destroy', function() {
        $interval.cancel(updateTimer);
    });


    $http.get('/lights').success(function(data) {
        $scope.lights = data;
    });

    $http.get('/scenes').success(function(data) {
        $scope.scenes = data;
    });

    $scope.toggleLight = function(theLight) {
        toggleLight(theLight.id);
    }

    $scope.triggerScene = function(theScene) {
        triggerScene(theScene);
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

halApp.controller('SchedulesNewController', function($scope, $http, $location) {

    $scope.schedule = {};

    $scope.submitForm = function() {
        $http({
            method: 'POST',
            url: '/schedule/',
            data: JSON.stringify({ id: 0, cron: $scope.schedule.cron, sceneId: $scope.schedule.sceneId, description: $scope.schedule.description })
        }).success(function() {
            $location.path('/schedules');
        });
    }
});

halApp.controller('ScheduleController', function($scope, $http, $location, $routeParams) {

    $http.get('/schedule/' + $routeParams.id).success(function(data) {
        $scope.schedule = data;
    });

    $scope.submitForm = function() {
        $http({
            method: 'PUT',
            url: '/schedule/' + $scope.schedule.id,
            data: JSON.stringify({ id: $scope.schedule.id, cron: $scope.schedule.cron, sceneId: $scope.schedule.sceneId, description: $scope.schedule.description })
        }).success(function() {
            $location.path('/schedules');
        });
    }
});

halApp.controller('SysInfoController', function($scope, $http) {
    $http.get('/sysInfo').success(function(data) {
        $scope.sysInfo = data;
    });
});

halApp.controller('GarageCamController', function($scope, $http) {
    $http.get('/configGarageCamURL').success(function(data) {
        $scope.camURL = data;
    });
});


// ----------
// Directives
// ----------

halApp.directive('appVersion', function() {
    return {
        template: '2014.04.28'
    };
});
