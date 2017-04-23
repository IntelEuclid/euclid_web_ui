define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootbox',
    'gaugeManager',
], function($, _, Backbone, GlobalSettings, bootbox, GaugeManager) {

    var gauges = {};
    var WifiWidget = Backbone.View.extend({
        listener: null,

        setupListener: function() {
            this.listener = new ROSLIB.Topic({
                ros: ros,
                name: '/wifi_status',
                messageType: 'system_monitor/WifiStatus'
            });
        },

        subscribe: function() {
            this.listener.subscribe(function(message) {
                $("#wifinetwork").html("Wifi Network: " + message.ssid);
                $("#ipaddress").html("IP Address: " + message.ip);
                $("#macaddress").html("MAC Address: " + message.mac);
            });

        },

        initialize: function() {
            console.log("setting up wifi widget");
            this.setupListener();
            this.subscribe();
        },

        render: function() {

        }

    });
    return WifiWidget;
});