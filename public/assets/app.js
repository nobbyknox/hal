var LIGHT_STATUS_UPDATE_INTERVAL = 20000;
var INITIAL_LIGHT_STATUS_UPDATE_TIMEOUT = 1500;

App = Ember.Application.create();

App.Router.map(function() {
    this.resource('schedules');
    this.resource('schedule', { path: '/schedules/:schedule_id' }, function() {
        this.route('create');
    });
    this.resource('sysInfo');
    this.resource('about');
    this.resource('garageCam');
});


App.LightStatusPoller = Ember.Object.extend({
    start: function() {
        this.timer = setInterval(this.onPoll.bind(this), LIGHT_STATUS_UPDATE_INTERVAL);
    },
    stop: function() {
        clearInterval(this.timer);
    }
});


// ------
// Models
// ------

App.Light = DS.Model.extend({
    name: DS.attr('string'),
    device: DS.attr('string'),
    instance: DS.attr('string'),
    status: DS.attr('string', {defaultValue: 'off'}),
    statusImagePath: function() {
        return 'assets/images/lamp_' + (this.get('status') != undefined ? this.get('status') : 'off') + '.png';
    }.property('status')
});

App.Scene = DS.Model.extend({
    name: DS.attr('string'),
    showOnUI: DS.attr('boolean'),
    buttonClass: DS.attr('string'),
    glyphiconClass: DS.attr('string'),
    description: DS.attr('string'),
    lights: DS.hasMany('light', {async:false}),
    action: DS.attr('string')
});

App.Schedule = DS.Model.extend({
    cron: DS.attr('string'),
    sceneId: DS.attr('string'),
    description: DS.attr('string')
});

App.SysInfo = DS.Model.extend({
    hostName: DS.attr('string'),
    osType: DS.attr('string'),
    release: DS.attr('string'),
    cpu: DS.attr('string'),
    upTime: DS.attr('string'),
    totMem: DS.attr('string'),
    freeMem: DS.attr('string')
});


// ------
// Routes
// ------

App.IndexRoute = Ember.Route.extend({
    model: function() {
        var multiModel = Ember.Object.create({
            lights: this.store.find('light'),
            scenes: this.store.find('scene')
        });
        return multiModel;
    },
    setupController: function(controller, model) {

        controller.set('model', model);

        // NOTE: This is not the best way to do it, but it will have to do for the time being. At least it works.
        setTimeout(function() {
            humane.log("Updating...");
            updateLightStatus(controller, model);
        }, INITIAL_LIGHT_STATUS_UPDATE_TIMEOUT);

        if (Ember.isNone(this.get('lightStatusPoller'))) {
            this.set('lightStatusPoller', App.LightStatusPoller.create({
                onPoll: function() {
                    humane.log("Updating...");
                    updateLightStatus(controller, model);
                }
            }));
        }
        this.get('lightStatusPoller').start();

    },
    deactivate: function() {
        this.get('lightStatusPoller').stop();
    }

});

App.SchedulesRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('schedule');
    }
});

App.ScheduleRoute = Ember.Route.extend({
    model: function(params) {
        if (params.schedule_id > 0) {
            return this.store.find('schedule', params.schedule_id);
        } else {
            return new Ember.Object();
        }
    }
});

App.SysInfoRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('sysInfo', 1);
    }
});

App.GarageCamRoute = Ember.Route.extend({
    model: function() {
        return { "url": "" }
    }
});


// -----------
// Controllers
// -----------

App.IndexController = Ember.ObjectController.extend({
    actions: {
        toggle: function(light) {
            toggleLight(light.get('id'));

            if (light.get('status') == 'on') {
                light.set('status', 'off');
            } else {
                light.set('status', 'on');
            }
        },
        triggerScene: function(scene) {
            triggerScene(scene.get('id'));

            scene.get('lights').forEach(function(light) {
                light.set('status', scene.get('action'));
            });
        }
    }
});

App.SchedulesController = Ember.ObjectController.extend({
    actions: {
        showDetail: function(schedule) {
            this.transitionToRoute('schedule', schedule.get('id'));
        }
    }
});

App.ScheduleController = Ember.ObjectController.extend({
    actions: {
        submitForm: function(id) {

            if (id > 0) {
                this.get('model').save();
            } else {

                var lastId = 0;
                var theStore = this.store;
                var theModel = this.get('model');

                this.store.find('schedule').then(function(objs) {

                    objs.forEach(function(item) {
                        if (item && item.get('id') > lastId) {
                            lastId = item.get('id');
                        }
                    });

                    lastId++;

                    var sch = theStore.createRecord('schedule', {
                        id: lastId,
                        cron: theModel.get('cron'),
                        sceneId: theModel.get('sceneId'),
                        description: theModel.get('description')
                    });

                    sch.save();
                });

            }

            this.transitionToRoute('schedules');
        }
    }
});


// -----
// Other
// -----

function updateLightStatus(controller, model) {

    model.lights.forEach(function(item) {

        var lePost = $.ajax({
            url: '/status',
            type: 'POST',
            data: JSON.stringify({"id": item.get('id')}),
            contentType: 'application/json'
        });

        lePost.done(function(data) {
            controller.get('store').find('light', item.get('id')).then(function(light) {
                light.set('status', (data == '0' ? 'off' : 'on'));
            });
        });
    });
}