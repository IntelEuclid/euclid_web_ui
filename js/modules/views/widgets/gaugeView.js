define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootbox',
    'gaugeManager'
], function($, _, Backbone, GlobalSettings, bootbox, GaugeManager) {
    var gauges = {};
    var GaugeView = Backbone.View.extend({
        wifi_listener: null,
        usb_listener: null,
        hardware_listener: null,
        cpu_listener: null,
        el: $("#body"),
        events: {},

        setup_listener: function() {

        },

        start_listener: function() {

        },

        shutDown_listener: function() {

        },

        updateGauge: function() {

        },

        initialize: function(elementName) {
            var self = this;
        },

        render: function() {

        }
    });

    return new GaugeView();
});