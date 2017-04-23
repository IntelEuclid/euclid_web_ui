define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'text!/templates/widgets/batteryWidgetTemplate.html'
], function($, _, Backbone, GlobalSettings, batteryWidgetTemplate) {
    var BatteryWidget = Backbone.View.extend({
        template: _.template(batteryWidgetTemplate),

        listener: null,
        el: "#batteryContainer",
        batteryView: this,
        isCharging: true,

        setupListener: function() {
            this.listener = new ROSLIB.Topic({
                ros: ros,
                name: '/hardware_status',
                messageType: 'system_monitor/HardwareStatus'
            });
        },
        subscribe: function() {
            this.listener.subscribe(function(message) {
                $("#csname").html("Euclid Name: " + message.cs_name);
                $("#batterystatus").html("Battery Status: " + message.battery + " (" + message.batteryStatus + ")");
            });

        },
        initialize: function() {
            console.log("setting up battery widget");
            this.setupListener();
            this.render();
            this.subscribe();
        },

        render: function() {
            var vars = {
                remainingBattery: 88,
                isCharging: this.isCharging
            };
            var html = this.template(vars);
            $("#batteryContainer").html(html);
        }

    });
    return BatteryWidget;
});