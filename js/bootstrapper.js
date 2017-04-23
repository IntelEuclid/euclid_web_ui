//Bootstrapper for the application, loads events and creates the event aggregator.
require.config({
    paths: {
        jquery: './lib/jquery/jquery-2.2.4.min',
        bootstrap: './lib/bootstrap/bootstrap.min',
        underscore: './lib/underscore/underscore.min',
        backbone: './lib/backbone.js/backbone.min',
        bootbox: './lib/jquery/bootbox.min',
        bootstrapToggle: './lib/bootstrap/bootstrap-toggle.min',
        bootstrapSlider: './lib/bootstrap/bootstrap-slider.min',
        toastr: './lib/toastr/toastr',
        views: './modules/views',
        templates: './templates',
        text: './lib/require.js/text',
        models: './modules/models',
        router: './modules/routers/router',
        globalSettings: './modules/components/global-settings',
        settings: './modules/components/settings',
        collections: './modules/collections',
        localStorage: './lib/backbone.js/localstorage',
        applicationServices: './modules/components/applicationServices',

        gaugeManager: './modules/components/gaugeManager',
        serviceManager: './modules/components/serviceManager',
        TopicManager: './modules/components/topicManager',
        configView: './modules/views/config/config-view',
        newNodeView: './modules/views/nodes/new-node-view',
    },
    shim: {
        bootstrap: {
            deps: ['jquery']
        },
        bootstrapToggle: {
            deps: ['bootstrap'],
            exports: 'bootstrapToggle'
        },
        bootstrapSlider: {
            deps: ['bootstrap'],
            exports: 'bootstrapSlider'
        },
        toastr: {
            deps: ['jquery']
        }
    },
    waitSeconds: 0
});

require(['jquery', 'underscore', 'backbone', 'bootstrap', 'globalSettings', 'toastr'],
    function($, _, Backbone, bootstrap, GlobalSettings, Router, bootbox, gogo) {

        if (!GlobalSettings.debug) {
            console.log = function() {};
        }
        GlobalSettings.debug = true;

        window.App = {
            Models: {},
            Collections: {},
            Views: {},
            runningTopics: {},
            isMobile: /Mobi/i.test(navigator.userAgent),
            connectionTimer: 0,
        };

        var eventAggregator = _.clone(Backbone.Events);
        Backbone.Router.prototype.eventAggregator = eventAggregator;
        Backbone.View.prototype.eventAggregator = eventAggregator;
        Backbone.Collection.prototype.eventAggregator = eventAggregator;
        Backbone.Model.prototype.eventAggregator = eventAggregator;
        window.eventAggregator = eventAggregator;


        Number.prototype.formatNumber = function() {
            var parts = this.toFixed(0).toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        };

        require(['router'],
            function(Router, App) {
                new Router();
                Backbone.history.start();
                var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

                var newDate = new Date();
                newDate.setDate(newDate.getDate());

                setInterval(function() {
                    $('#Date').html(dayNames[newDate.getDay()] + " " + newDate.getDate() + ' ' + monthNames[newDate.getMonth()] + ' ' + newDate.getFullYear());
                }, 1000);

                setInterval(function() {
                    var seconds = new Date().getSeconds();
                    $("#sec").html((seconds < 10 ? "0" : "") + seconds);
                }, 1000);

                setInterval(function() {
                    var minutes = new Date().getMinutes();
                    $("#min").html((minutes < 10 ? "0" : "") + minutes);
                }, 1000);

                setInterval(function() {
                    var hours = new Date().getHours();
                    $("#hours").html((hours < 10 ? "0" : "") + hours);
                }, 1000);
            });
    });