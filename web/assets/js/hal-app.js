'use strict';

var halApp = angular.module('halApp', ['ngRoute', 'ngCookies']);

halApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/',              { templateUrl: 'partials/control-center.html', controller: 'ControlCenterController' });
    $routeProvider.when('/login',         { templateUrl: 'partials/login-required.html', controller: 'LoginController' });
    $routeProvider.when('/logout',        { templateUrl: 'partials/logout.html', controller: 'LogoutController' });
    $routeProvider.when('/about',         { templateUrl: 'partials/about.html', controller: 'AboutController' });
    $routeProvider.when('/invalidRoute',  { templateUrl: 'partials/invalid-route.html' });
    $routeProvider.when('/lights',        { templateUrl: 'partials/lights.html', controller: 'LightsController' });
    $routeProvider.when('/lights/:id',    { templateUrl: 'partials/light.html', controller: 'LightController' });
    $routeProvider.when('/scenes',        { templateUrl: 'partials/scenes.html', controller: 'ScenesController' });
    $routeProvider.when('/scenes/:id',    { templateUrl: 'partials/scene.html', controller: 'SceneController' });
    $routeProvider.when('/schedules',     { templateUrl: 'partials/schedules.html', controller: 'SchedulesController' });
    $routeProvider.when('/schedules/:id', { templateUrl: 'partials/schedule.html', controller: 'ScheduleController' });
    $routeProvider.when('/sysInfo',       { templateUrl: 'partials/sys-info.html', controller: 'SysInfoController' });
    $routeProvider.when('/garageCam',     { templateUrl: 'partials/garage-cam.html', controller: 'GarageCamController' });
    $routeProvider.otherwise({ redirectTo: '/invalidRoute' });
}]);

halApp.config(['$httpProvider', function($http) {
    $http.interceptors.push(function($q, $cookies, $rootScope) {
        return {
            'request': function(config) {
                if ($rootScope.sessionUser && $rootScope.sessionUser.token) {
                    config.headers['token'] = $rootScope.sessionUser.token;
                }
                return config;
            },
            'response': function(config) {
                return config;
            }
        };
    });
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

// -----------------------------------------------------------------------------
// Lights
// -----------------------------------------------------------------------------

halApp.controller('LightsController', function($rootScope, $scope, $http, $location) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'lights';

    $http.get('/lights')
        .then(function(response) {
            $scope.lights = response.data;
        });

    $scope.showDetail = function(id) {
        $location.path('/lights/' + id);
    }
});

halApp.controller('LightController', function($rootScope, $scope, $http, $location, $routeParams) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'lights';

    $scope.light = {
        'enabled': 1
    };

    $http.get('/lights/' + $routeParams.id)
        .then(function(response) {
            $scope.light = response.data;
        });

    $scope.submitForm = function() {
        if (!isUndefinedOrEmpty($scope.light.id)) {
            $http({
                method: 'PUT',
                url: '/lights',
                data: JSON.stringify($scope.light)
            }).then(function() {
                $location.path('/lights');
            }, function(response) {
                alert(JSON.stringify(response.data));
            });
        } else {
            $http({
                method: 'POST',
                url: '/lights',
                data: JSON.stringify($scope.light)
            }).then(function() {
                $location.path('/lights');
            }, function(response) {
                alert(JSON.stringify(response.data));
            });
        }
    };
});


// -----------------------------------------------------------------------------
// Scenes
// -----------------------------------------------------------------------------

halApp.controller('ScenesController', function($rootScope, $scope, $http, $location) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'scenes';

    $http.get('/scenes')
        .then(function(response) {
            $scope.scenes = response.data;
        });

    $scope.showDetail = function(id) {
        $location.path('/scenes/' + id);
    }
});

halApp.controller('SceneController', function($rootScope, $scope, $http, $location, $routeParams) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'scenes';

    $('#scene-name').focus();

    // Default values for new scenes
    $scope.scene = {
        'visible': 1,
        'enabled': 1,
        'action': 'on'
    };

    if ($routeParams.id && $routeParams.id !== 'new') {
        $http.get('/scenes/' + $routeParams.id)
            .then(function(response) {
                $scope.scene = response.data;
            });
    };

    $scope.submitForm = function() {
        if (!isUndefinedOrEmpty($scope.scene.id)) {
            $http({
                method: 'PUT',
                url: '/scenes',
                data: JSON.stringify($scope.scene)
            }).then(function() {
                $location.path('/scenes');
            });
        } else {
            $http({
                method: 'POST',
                url: '/scenes',
                data: JSON.stringify($scope.scene)
            }).then(function() {
                $location.path('/scenes');
            });
        }
    }
});

// -----------------------------------------------------------------------------
// Schedules
// -----------------------------------------------------------------------------

halApp.controller('SchedulesController', function($rootScope, $scope, $http, $location) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'schedules';

    $http.get('/schedules?token=' + $rootScope.sessionUser.token).success(function(data) {
        $scope.schedules = data;
    });

    $scope.showDetail = function(id) {
        $location.path('/schedules/' + id);
    }
});

halApp.controller('ScheduleController', function($rootScope, $scope, $http, $location, $routeParams) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'schedules';

    $('#cron').focus();

    // Default values for new schedules
    $scope.schedule = {
        'enabled': 1
    };

    if ($routeParams.id && $routeParams.id !== 'new') {
        $http.get('/schedules/' + $routeParams.id)
            .then(function(response) {
                $scope.schedule = response.data;
            });
    }

    $scope.submitForm = function() {
        if (!isUndefinedOrEmpty($scope.schedule.id)) {
            $http({
                method: 'PUT',
                url: '/schedules',
                data: $scope.schedule
            }).success(function() {
                $location.path('/schedules');
            });
        } else {
            $http({
                method: 'POST',
                url: '/schedules',
                data: $scope.schedule
            }).success(function() {
                $location.path('/schedules');
            });
        }
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

/**
 * Bootstrap-toggle Directive
 * Forked from from: https://gist.github.com/dave-newson/f6c5e9c2f3bc315e292c
 * This version supports ngDisabled directive.
 *
 * @link https://gist.github.com/jjmontesl/54457bf1342edeb218b7
 */
halApp.directive('toggleCheckbox', function() {

    return {
        restrict: 'A',
        transclude: true,
        replace: false,
        require: 'ngModel',
        link: function($scope, $element, $attr, require) {

            var ngModel = require;

            // update model from Element
            var updateModelFromElement = function() {
                // If modified
                var checked = $element.prop('checked');
                if (checked != ngModel.$viewValue) {
                    // Update ngModel
                    ngModel.$setViewValue(checked);
                    $scope.$apply();
                }
            };

            // Update input from Model
            var updateElementFromModel = function() {
                // Update button state to match model
                var state = !$($element).attr('disabled');
                $($element).bootstrapToggle("enable");
                $element.trigger('change');
                $($element).bootstrapToggle(state ? "enable" : "disable");
            };

            // Observe: Element changes affect Model
            $element.on('change', function() {
                updateModelFromElement();
            });

            // Observe: ngModel for changes
            $scope.$watch(function() {
                return ngModel.$viewValue;
            }, function() {
                updateElementFromModel();
            });

            // Observe: disabled attribute set by ngDisabled
            $scope.$watch(function() {
                return $($element).attr('disabled');
            }, function(newVal) {
                $($element).bootstrapToggle(!newVal ? "enable" : "disable");
            });

            // Initialise BootstrapToggle
            // See http://www.bootstraptoggle.com/#api for more details
            $element.bootstrapToggle({
                on: $attr.on || "On",
                off: $attr.off || "Off",
                size: $attr.size || 'small'
            });
        }
    };
});


// -----------------------------------------------------------------------------
// Private functions
// -----------------------------------------------------------------------------

// TODO: This function should either be used or removed. It can't be
// hanging around indefinitely.
function bootstrapApp($rootScope, $http) {
}
