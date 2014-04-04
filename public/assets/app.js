App = Ember.Application.create();

App.Router.map(function() {
    this.resource('about');
    this.resource('sysInfo');
});


// ------
// Models
// ------

App.Light = DS.Model.extend({
    name: DS.attr('string'),
    device: DS.attr('string'),
    instance: DS.attr('string')
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
    }
});

App.SysInfoRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('sysInfo', 1);
    }
});
