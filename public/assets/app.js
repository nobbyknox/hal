App = Ember.Application.create();

App.Router.map(function() {
    this.resource('about');
    this.resource('sys-info');
});

App.IndexRoute = Ember.Route.extend({
    model: function() {
        var lights = ['Front Flood Light', 'Side Passage', 'Art Room', 'Front Lounge'];
        var scenes = ['L Home', 'Nobby Home', 'All Off, Except Some', 'Emergency - Panic!'];
        return { "lights": lights, "scenes": scenes };

/*
        // TODO: The code below does not work. Look at this for guidance:
        // http://emberjs.com/guides/models/connecting-to-an-http-server/
        var leGet = $.ajax({
            url: halRoot + 'lights',
            type: 'GET',
            contentType: 'application/json'
        });

        leGet.done(function(data) {
            return { "lights": data, "scenes": [] };
        });
*/

    }
});
