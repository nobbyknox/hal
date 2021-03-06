'use strict';

var halApp = angular.module('halApp', ['ngRoute', 'ngCookies']);

halApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/',              { templateUrl: 'partials/control-center.html', controller: 'ControlCenterController' });
    $routeProvider.when('/login',         { templateUrl: 'partials/login-required.html', controller: 'LoginController' });
    $routeProvider.when('/about',         { templateUrl: 'partials/about.html', controller: 'AboutController' });
    $routeProvider.when('/invalidRoute',  { templateUrl: 'partials/invalid-route.html' });
    $routeProvider.when('/lights',        { templateUrl: 'partials/lights.html', controller: 'LightsController' });
    $routeProvider.when('/lights/:id',    { templateUrl: 'partials/light.html', controller: 'LightController' });
    $routeProvider.when('/scenes',        { templateUrl: 'partials/scenes.html', controller: 'ScenesController' });
    $routeProvider.when('/scenes/:id',    { templateUrl: 'partials/scene.html', controller: 'SceneController' });
    $routeProvider.when('/scenelight/:id', { templateUrl: 'partials/scene-light.html', controller: 'SceneLightController' });
    $routeProvider.when('/schedules',     { templateUrl: 'partials/schedules.html', controller: 'SchedulesController' });
    $routeProvider.when('/schedules/:id', { templateUrl: 'partials/schedule.html', controller: 'ScheduleController' });
    $routeProvider.when('/sysInfo',       { templateUrl: 'partials/sys-info.html', controller: 'SysInfoController' });
    $routeProvider.when('/garageCam',     { templateUrl: 'partials/garage-cam.html', controller: 'GarageCamController' });
    $routeProvider.otherwise({ redirectTo: '/invalidRoute' });
}]);

halApp.config(['$httpProvider', function($http) {
    $http.interceptors.push(function($q, $cookies, $rootScope) {
        return {
            request: function(config) {
                if ($rootScope.sessionUser && $rootScope.sessionUser.token) {
                    config.headers.token = $rootScope.sessionUser.token;
                }

                return config;
            },

            response: function(config) {
                return config;
            }
        };
    });
}]);

halApp.run(function($rootScope, $http, $location, $window, $cookies) {

    $rootScope.sessionUser = $cookies.getObject('halLogin');

    if ($rootScope.sessionUser) {
        $http.post('/validatetoken', { token: $rootScope.sessionUser.token })
            .then(function() {
                console.log('Welcome back, %s', $rootScope.sessionUser.screenName);
            }, function(response) {

                console.log(JSON.stringify(response));
                $rootScope.sessionUser = null;
                $cookies.remove('halLogin');
                $location.path('/login');
            });

    } else {
        $location.path('/login');
    }

    $rootScope.$on('$locationChangeStart', function(event, next, current) {
        $rootScope.previousPage = current;

        if (!$rootScope.sessionUser) {
            $location.path('/login');
        }
    });

    console.log('HAL version ' + HAL_VERSION + ' ready');
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

halApp.controller('ControlCenterController', function($rootScope, $scope, $http, $timeout, $interval) {

    $rootScope.selectedMenu = 'control-center';
    $rootScope.selectedSubMenu = '';

    // Check status 2 seconds after controller has been loaded
    $timeout(function() {
        manageLightStatusUpdate($rootScope.sessionUser.token, function(err, stats) {
        });
    }, 1000);

    // Check status every 10 seconds
    var updateTimer = $interval(function() {
        manageLightStatusUpdate($rootScope.sessionUser.token, function(err, stats) {
            if (err) {
                showErrorMessage(null, err.message);
            } else {
                if ($scope.lights && stats && stats.length > 0) {

                    stats.forEach(function(stat) {
                        $scope.lights.forEach(function(light) {
                            if (light.id === stat.id && light.onTimer !== stat.onTimer) {
                                light.onTimer = stat.onTimer;
                            }
                        });
                    });

                }
            }
        });
    }, 10000);

    $scope.$on('$destroy', function() {
        console.log('Cancelling timer');
        $interval.cancel(updateTimer);
    });

    $http.get('/lights?enabled=1')
        .then(function(response) {
            $scope.lights = response.data;

            // TODO: We should be getting the "onTimer" value from the server. This is a temporary work-around.
            $scope.lights.forEach(function(light) {
                light.onTimer = false;
            });
        }, function(response) {

            showApiError(null, response, 'Unable to retrieve lights');
        });

    $http.get('/scenes?enabled=1')
        .then(function(response) {
            $scope.scenes = response.data;
        }, function(response) {

            showApiError(null, response, 'Unable to retrieve scenes');
        });

    $scope.toggleLight = function(theLight) {
        toggleLight(theLight.id, $rootScope.sessionUser.token);
    };

    $scope.triggerScene = function(theScene) {
        triggerScene(theScene.id, $rootScope.sessionUser.token, function(err) {
            if (!err) {
                manageLightStatusUpdate($scope.lights, $rootScope.sessionUser.token);
            }
        });
    };

    $scope.menuLight = null;
    $scope.menuScene = null;

    $scope.lightMenu = function(theLight) {
        $scope.menuLight = theLight;
        $('#light-menu .title').html(theLight.name);
        $('#light-menu').show('fast');
    };

    $scope.sceneMenu = function(theScene) {
        $scope.menuScene = theScene;
        $('#scene-menu .title').html(theScene.name);
        $('#scene-menu').show('fast');
    };

    $scope.onFor = function(minutes) {
        console.log('Turning on ' + $scope.menuLight.name + ' light for ' + minutes + ' minute' + (minutes === 1 ? '' : 's'));
        $('#light-menu').hide('slow');
        scheduleLight($scope.menuLight, minutes * 60);
    };

    $scope.triggerIn = function(minutes) {
        console.log('Triggering scene ' + $scope.menuScene.name + ' in ' + minutes + ' minute' + (minutes === 1 ? '' : 's'));
        alert('Top of triggerIn');
        $('#scene-menu').hide('slow');
        scheduleScene($scope.menuScene, minutes * 60);
    };

    function scheduleLight(light, delay) {
        $http({
            method: 'POST',
            url: '/lighttimer',
            data: JSON.stringify({ lightId: light.id, action: 'on', delay: delay })
        }).then(function() {
            changeLampImage(light.id, 'on');
            light.onTimer = true;
            showBriefSuccessMessage('Timer Started', 'A timer of <b>' + (delay / 60) + '</b> minutes started for light <b>' + light.name + '</b>');
        }, function(response) {

            showApiError(null, response, 'Unable to set timer on light "' + light.name + '"');
        });
    }

    function scheduleScene(scene, delay) {
        $http({
            method: 'POST',
            url: '/scenetimer',
            data: JSON.stringify({ sceneId: scene.id, delay: delay })
        }).then(function() {
            // changeLampImage(light.id, 'on');
            scene.onTimer = true;
            showBriefSuccessMessage('Timer Started', 'A timer of <b>' + (delay / 60) + '</b> minutes started for scene <b>' + scene.name + '</b>');
        }, function(response) {

            showApiError(null, response, 'Unable to set timer on scene "' + scene.name + '"');
        });
    }


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
        }, function(response) {

            showApiError(null, response, 'Unable to retrieve lights');
        });

    $scope.showDetail = function(id) {
        $location.path('/lights/' + id);
    };
});

halApp.controller('LightController', function($rootScope, $scope, $http, $location, $routeParams) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'lights';

    $('#light-name').focus();

    $scope.light = {
        enabled: 1
    };

    $http.get('/lights/' + $routeParams.id)
        .then(function(response) {
            $scope.light = response.data;
        }, function(response) {

            showApiError(null, response, 'Unable to retrieve lights');
        });

    $scope.validateDevice = function() {
        var deviceErrors = [];

        if (isUndefinedOrEmpty($scope.light.device)) {
            deviceErrors.push('Please enter the device number');
        } else {
            if (!isNumeric($scope.light.device)) {
                deviceErrors.push('Device must be a number');
            }
        }

        return deviceErrors;
    };

    $scope.isInvalidDevice = function() {
        return $scope.validateDevice().length > 0;
    };

    $scope.validateInstance = function() {
        var instErrors = [];

        if (isUndefinedOrEmpty($scope.light.instance)) {
            instErrors.push('Please enter the instance number');
        } else {
            if (!isNumeric($scope.light.instance)) {
                instErrors.push('Instance must be a number');
            }
        }

        return instErrors;
    };

    $scope.isInvalidInstance = function() {
        return $scope.validateInstance().length > 0;
    };

    $scope.submitForm = function() {

        var errors = $scope.validateDevice()
            .concat($scope.validateInstance());

        if (errors.length > 0) {
            showErrorMessageList(null, null, errors);
            return;
        }

        if (!isUndefinedOrEmpty($scope.light.id)) {
            $http({
                method: 'PUT',
                url: '/lights',
                data: JSON.stringify($scope.light)
            }).then(function() {
                showBriefSuccessMessage(null, 'Light <b>' + $scope.light.name + '</b> updated successfully');
                $location.path('/lights');
            }, function(response) {

                showApiError(null, response, 'Unable to update the light');
            });
        } else {
            $http({
                method: 'POST',
                url: '/lights',
                data: JSON.stringify($scope.light)
            }).then(function() {
                showBriefSuccessMessage(null, 'Light <b>' + $scope.light.name + '</b> created successfully');
                $location.path('/lights');
            }, function(response) {

                showApiError(null, response, 'Unable to create the light');
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
        }, function(response) {

            showApiError(null, response, 'Unable to retrieve scenes');
        });

    $scope.showDetail = function(id) {
        $location.path('/scenes/' + id);
    };
});

halApp.controller('SceneController', function($rootScope, $scope, $http, $location, $routeParams) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'scenes';

    $('#scene-name').focus();

    // Default values for new scenes
    $scope.scene = {
        visible: 1,
        enabled: 1,
        action: 'on'
    };

    $scope.sceneLights = [];

    if ($routeParams.id && $routeParams.id !== 'new') {
        $http.get('/scenes/' + $routeParams.id)
            .then(function(response) {
                $scope.scene = response.data;
                return $http.get('/scenelights?sceneId=' + $routeParams.id);
            })
            .then(function(response) {
                $scope.sceneLights = response.data;
            })
            .catch(function(response) {
                showApiError(null, response, 'Unable to retrieve scene details');
            });
    }

    $scope.showDetail = function(sceneLightId) {
        $location.path('/scenelight/' + sceneLightId).search('sceneId', $scope.scene.id);
    };

    $scope.addLight = function() {
        $location.path('/scenelight/new').search('sceneId', $scope.scene.id);
    };

    $scope.delete = function() {
        confirmDeletion(null, 'Are you sure that you want to delete the scene <br/><b>' + $scope.scene.name + '</b>?', function() {
            $http({
                method: 'DELETE',
                url: '/scenes/' + $scope.scene.id
            }).then(function() {
                clearDeleteConfirmation();
                showBriefSuccessMessage(null, 'Scene <b>' + $scope.scene.name + '</b> deleted');
                $location.path('/scenes');
            }, function(response) {

                showApiError(null, response, 'Unable to delete scene <b>' + $scope.scene.name + '</b>');
            });
        });
    };

    $scope.submitForm = function() {
        if (!isUndefinedOrEmpty($scope.scene.id)) {
            $http({
                method: 'PUT',
                url: '/scenes',
                data: JSON.stringify($scope.scene)
            }).then(function() {
                showBriefSuccessMessage(null, 'Scene <b>' + $scope.scene.name + '</b> updated successfully');
                $location.path('/scenes');
            }, function(response) {

                showApiError(null, response, 'Unable to update the scene');
            });
        } else {
            $http({
                method: 'POST',
                url: '/scenes',
                data: JSON.stringify($scope.scene)
            }).then(function() {
                showBriefSuccessMessage(null, 'Scene <b>' + $scope.scene.name + '</b> created successfully');
                $location.path('/scenes');
            }, function(response) {

                showApiError(null, response, 'Unable to create the scene');
            });
        }
    };
});

halApp.controller('SceneLightController', function($rootScope, $scope, $http, $location, $routeParams) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'scenes';

    $scope.sceneId = $routeParams.sceneId;

    $scope.sceneLight = {
        enabledInScene: 1
    };

    $scope.selectedLightId = '';
    $scope.lights = [];

    $http.get('/lights?enabled=1')
        .then(function(response) {
            $scope.lights = response.data;

            if ($routeParams.id && $routeParams.id !== 'new') {
                $http.get('scenelights/' + $routeParams.id)
                    .then(function(response) {
                        $scope.sceneLight = response.data;
                        $scope.selectedLightId = $scope.sceneLight.id;
                    });
            }
        })
        .catch(function(response) {
            showApiError(null, response, 'Unable to retrieve light details');
        });

    $scope.delete = function() {
        confirmDeletion(null, 'Are you sure that you want to remove the light from the scene?', function() {
            $http({
                method: 'DELETE',
                url: '/scenelights/' + $scope.sceneLight.scenesLightsId
            }).then(function() {
                clearDeleteConfirmation();
                showBriefSuccessMessage(null, 'Light removed from scene');
                $location.path('/scenes/' + $scope.sceneId);
            }, function(response) {

                showApiError(null, response, 'Unable to remove the light from the scene');
            });
        });
    };

    $scope.submitForm = function() {
        var payload = {
            id: ($routeParams.id && $routeParams.id !== 'new' ? $routeParams.id : null),
            sceneId: $scope.sceneId,
            lightId: $scope.selectedLightId,
            enabled: $scope.sceneLight.enabledInScene
        };

        if (!isUndefinedOrEmpty($scope.sceneLight.id)) {
            $http({
                method: 'PUT',
                url: '/scenelights',
                data: JSON.stringify(payload)
            }).then(function() {
                showBriefSuccessMessage(null, 'Scene light updated successfully');
                $location.path('/scenes/' + $scope.sceneId);
            }, function(response) {

                showApiError(null, response, 'Unable to update this scene light');
            });
        } else {
            $http({
                method: 'POST',
                url: '/scenelights',
                data: JSON.stringify(payload)
            }).then(function() {
                showBriefSuccessMessage(null, 'Scene light created successfully');
                $location.path('/scenes/' + $scope.sceneId);
            }, function(response) {

                showApiError(null, response, 'Unable to create this scene light');
            });
        }
    };
});

// -----------------------------------------------------------------------------
// Schedules
// -----------------------------------------------------------------------------

halApp.controller('SchedulesController', function($rootScope, $scope, $http, $location) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'schedules';

    $http.get('/schedules?token=' + $rootScope.sessionUser.token)
        .then(function(response) {
            $scope.schedules = response.data;
        }, function(response) {

            showApiError(null, response, 'Unable to retrieve lights');
        });

    $scope.showDetail = function(id) {
        $location.path('/schedules/' + id);
    };
});

halApp.controller('ScheduleController', function($rootScope, $scope, $http, $location, $routeParams) {

    $rootScope.selectedMenu = 'admin';
    $rootScope.selectedSubMenu = 'schedules';

    $('#cron').focus();

    // Default values for new schedules
    $scope.schedule = {
        enabled: 1
    };

    $scope.selectedSceneId = '';
    $scope.scenes = [];

    $http.get('/scenes')
        .then(function(response) {
            $scope.scenes = response.data;

            if ($routeParams.id) {
                if ($routeParams.id === 'new') {
                    if (response.data.length > 0) {
                        $scope.selectedSceneId = response.data[0].id;
                    }
                } else {
                    $http.get('/schedules/' + $routeParams.id)
                        .then(function(response) {
                            $scope.schedule = response.data;

                            if ($scope.scenes.length > 0) {
                                $scope.scenes.forEach(function(item) {
                                    if (item.id === $scope.schedule.sceneId) {
                                        $scope.selectedSceneId = item.id;
                                    }
                                });
                            }
                        }, function(response) {

                            showApiError(null, response, 'Unable to retrieve schedules');
                        });
                }
            }
        }, function(response) {

            showApiError(null, response, 'Unable to retrieve scenes');
        });

    $scope.submitForm = function() {

        $scope.schedule.sceneId = $scope.selectedSceneId;

        if (!isUndefinedOrEmpty($scope.schedule.id)) {
            $http({
                method: 'PUT',
                url: '/schedules',
                data: $scope.schedule
            }).success(function() {
                showBriefSuccessMessage(null, 'Schedule updated successfully');
                $location.path('/schedules');
            }, function(response) {

                showApiError(null, response, 'Unable to update this schedule');
            });
        } else {
            $http({
                method: 'POST',
                url: '/schedules',
                data: $scope.schedule
            }).success(function() {
                showBriefSuccessMessage(null, 'Schedule created successfully');
                $location.path('/schedules');
            }, function(response) {

                showApiError(null, response, 'Unable to create this schedule');
            });
        }
    };
});

// TODO: Remove
halApp.controller('SysInfoController', function($rootScope, $scope, $http) {
    $http.get('/sysInfo?token=' + $rootScope.sessionUser.token)
        .success(function(data) {
            $scope.sysInfo = data;
        });
});

// TODO: Remove
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
        template: HAL_VERSION
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
                $($element).bootstrapToggle('enable');
                $element.trigger('change');
                $($element).bootstrapToggle(state ? 'enable' : 'disable');
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

                $($element).bootstrapToggle(!newVal ? 'enable' : 'disable');
            });

            // Initialise BootstrapToggle
            // See http://www.bootstraptoggle.com/#api for more details
            $element.bootstrapToggle({
                on: $attr.on || 'On',
                off: $attr.off || 'Off',
                size: $attr.size || 'small'
            });
        }
    };
});
