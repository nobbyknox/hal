'use strict';

var halApp = angular.module('halApp', ['ngRoute', 'ngCookies']);

halApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/',              { templateUrl: 'partials/control-center.html', controller: 'ControlCenterController' });
    $routeProvider.when('/login',         { templateUrl: 'partials/login-required.html', controller: 'LoginController' });
    $routeProvider.when('/logout',        { templateUrl: 'partials/logout.html', controller: 'LogoutController' });
    // $routeProvider.when('/admin',         { templateUrl: 'partials/admin.html', controller: 'AdminController' });
    $routeProvider.when('/about',         { templateUrl: 'partials/about.html', controller: 'AboutController' });
    $routeProvider.when('/invalidRoute',  { templateUrl: 'partials/invalid-route.html' });
    $routeProvider.when('/lights',        { templateUrl: 'partials/lights.html', controller: 'LightsController' });
    $routeProvider.when('/lights/:id',    { templateUrl: 'partials/light.html', controller: 'LightController' });
    $routeProvider.when('/schedules',     { templateUrl: 'partials/schedules.html', controller: 'SchedulesController' });
    // $routeProvider.when('/schedules/new', { templateUrl: 'partials/schedule.html', controller: 'SchedulesNewController' });
    $routeProvider.when('/schedule/:id',  { templateUrl: 'partials/schedule.html', controller: 'ScheduleController' });
    $routeProvider.when('/sysInfo',       { templateUrl: 'partials/sys-info.html', controller: 'SysInfoController' });
    $routeProvider.when('/garageCam',     { templateUrl: 'partials/garage-cam.html', controller: 'GarageCamController' });
    $routeProvider.otherwise({ redirectTo: '/invalidRoute' });
}]);

halApp.run(function($rootScope, $http, $location, $window, $cookies) {

    $rootScope.sessionUser = $cookies.getObject('halLogin');

    console.log($rootScope.sessionUser);

    if ($rootScope.sessionUser) {
        $http.post('/validatetoken', {token: $rootScope.sessionUser.token})
            .then(function() {
                console.log('Welcome back, %s', $rootScope.sessionUser.screenName);
                bootstrapApp($rootScope, $http);
            }, function(response) {
                $rootScope.sessionUser = null;
                $cookies.remove('halLogin');
                console.log(JSON.stringify(response));
            });

    } else {
        $location.path('/login');
    }

    $rootScope.$on('$locationChangeStart', function(event, next, current) {

        // if (!next.includes('/bookmarks')) {
        //     $rootScope.searchQuery = '';
        // }

        $rootScope.previousPage = current;

        if (!$rootScope.sessionUser) {
            $location.path('/login');
        }
    });

    // $rootScope.search = function() {
    //     if ($rootScope.searchQuery.length >= 3) {
    //         $window.location = '#/bookmarks?query=' + $rootScope.searchQuery;
    //     }
    // };

    // $rootScope.sendFeedback = function() {
    //     console.log('Subject: ' + $rootScope.feedbackSubject);
    //     console.log('Body: ' + $rootScope.feedbackBody);
    //
    //     let feedbackModel = {
    //         username: $rootScope.sessionUser.username,
    //         screenName: $rootScope.sessionUser.screenName,
    //         location: $window.location.href,
    //         subject: $rootScope.feedbackSubject,
    //         message: $rootScope.feedbackBody
    //     };
    //
    //     $http.post('/feedback?token=' + $rootScope.sessionUser.token, feedbackModel)
    //         .success(function() {
    //             console.log('Feedback submitted successfully');
    //         })
    //         .error(function(data) {
    //             console.log('Unable to submit feedback: ' + JSON.stringify(data));
    //             alert('An error occurred during the posting of your feedback');
    //         });
    //
    //     $rootScope.feedbackSubject = $rootScope.feedbackSubjects[0];
    //     $rootScope.feedbackBody = '';
    //
    //     $('#feedbackModal').modal('hide');
    // };

    // $rootScope.showMessage = function(title, message) {
    //     $('#message-modal-label').html(title);
    //     $('#message-body').html(message);
    //     $('#message-modal').modal('show');
    // };

    // $rootScope.deleteCallback = function() {
    //     console.log('Hello (deleted) World!');
    // };

});

halApp.controller('AboutController', function($rootScope, $window) {
    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'about';
});

halApp.controller('LoginController', function($rootScope, $window) {
    setTimeout(function() {
        $window.location = '/login.html';
    }, 5000);
});

halApp.controller('LogoutController', function($rootScope, $window, $cookies) {
    $rootScope.selectedMenu = 'logout';
    $rootScope.selectedSubMenu = '';

    $cookies.remove('halLogin');
    $rootScope.sessionUser = null;

    setTimeout(function() {
        $window.location = '/';
    }, 4000);
                                
});

halApp.controller('ControlCenterController', function($rootScope, $scope, $http, $timeout, $interval) {

    $rootScope.selectedMenu = 'control-center';
    $rootScope.selectedSubMenu = '';

    // Check status 2 seconds after controller has been loaded
    // $timeout(function() {
    //     humane.log("Updating...");
    //     manageLightStatusUpdate($scope.lights, $rootScope.sessionUser.token);
    // }, 2000);

    // Check status every 20 seconds
    //var updateTimer = $interval(function() {
    //    humane.log("Updating...");
    //    manageLightStatusUpdate($scope.lights);
    //}, 20000);

    //$scope.$on('$destroy', function() {
    //    $interval.cancel(updateTimer);
    //});


    $http.get('/lights?enabled=1&token=' + $rootScope.sessionUser.token).success(function(data) {
        $scope.lights = data;
    });

    $http.get('/scenes?enabled=1&token=' + $rootScope.sessionUser.token).success(function(data) {
        $scope.scenes = data;
    });

    //$scope.toggleLight = function(theLight) {
    //    toggleLight(theLight.id);
    //};
    //
    //$scope.triggerScene = function(theScene) {
    //    triggerScene(theScene);
    //};

});

// ------
// Lights
// ------

halApp.controller('LightsController', function($rootScope, $scope, $http, $location) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'lights';

    $http.get('/lights?token=' + $rootScope.sessionUser.token)
        .then(function(response) {
            $scope.lights = response.data;
        });

    $scope.showDetail = function(id) {
        $location.path('/lights/' + id);
    }
});

halApp.controller('LightController', function($scope, $http, $location, $routeParams) {

    $http.get('/lights/' + $routeParams.id + '?token=' + $rootScope.sessionUser.token)
        .then(function(response) {
            $scope.light = response.data;
        });

    $scope.submitForm = function() {
        $http({
            method: 'PUT',
            url: '/lights',
            data: JSON.stringify($scope.light)
        }).then(function() {
            $location.path('/lights');
        });
    }
});

// ---------
// Schedules
// ---------

halApp.controller('SchedulesController', function($rootScope, $scope, $http, $location) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'schedules';

    $http.get('/schedules?token=' + $rootScope.sessionUser.token).success(function(data) {
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

    $http.get('/schedule/' + $routeParams.id + '?token=' + $rootScope.sessionUser.token).success(function(data) {
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

halApp.controller('SysInfoController', function($rootScope, $scope, $http) {
    $http.get('/sysInfo?token=' + $rootScope.sessionUser.token)
        .success(function(data) {
            $scope.sysInfo = data;
        });
});

halApp.controller('GarageCamController', function($rootScope, $scope, $http) {

    $scope.camURL = '';

    $http.get('/configGarageCamURL?token=' + $rootScope.sessionUser.token)
        .success(function(data) {
            $scope.camURL = data;
        });
});


// -----------------------------------------------------------------------------
// Directives
// -----------------------------------------------------------------------------

halApp.directive('appVersion', function() {
    return {
        template: '2016.03.16'
    };
});


// -----------------------------------------------------------------------------
// Private functions
// -----------------------------------------------------------------------------

function bootstrapApp($rootScope, $http) {

    // if ($rootScope.sessionUser) {
    //     $http.get('/groups?token=' + $rootScope.sessionUser.token)
    //         .success(function(data) {
    //             $rootScope.groups = data;
    //         });
    // }

}
