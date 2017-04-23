define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootbox',
    'gaugeManager',
], function($, _, Backbone, GlobalSettings, bootbox, GaugeManager) {

    var gauges = {};
    var USBWidget = Backbone.View.extend({
        listener: null,

        setupListener: function() {
            this.listener = new ROSLIB.Topic({
                ros: ros,
                name: '/usb_status',
                messageType: 'system_monitor/USBStatus'
            });
        },

        subscribe: function() {
            this.listener.subscribe(function(message) {
                usbList = $("#usblist")
                data = message.usb_devices;
                usbList.empty();
                for (var i = 0; i < data.length; i++) {
                    usbList.append("<li>" + data[i] + "</li>");
                }
            });

        },

        initialize: function() {
            console.log("setting up usb widget");
            this.setupListener();
            this.subscribe();
        },

        render: function() {

        }

    });
    return USBWidget;
});