App = Ember.Application.create();

App.Router.map(function() {
    this.resource('about');
    this.resource('sysInfo');
    this.resource('garageCam');
});


App.LightStatusPoller = Ember.Object.extend({
    start: function() {
        this.timer = setInterval(this.onPoll.bind(this), 20000);
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
            updateLightStatus(controller, model);
        }, 1500);

        if (Ember.isNone(this.get('lightStatusPoller'))) {
            this.set('lightStatusPoller', App.LightStatusPoller.create({
                onPoll: function() {
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


// -----
// Other
// -----

function updateLightStatus(controller, model) {
//    controller.get('store').find('light', 4).then(function(light) {
//        light.set('status', 'on');
//    });

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
