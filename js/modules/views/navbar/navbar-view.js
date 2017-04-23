define(['jquery',
    'underscore',
    'backbone',
    'bootbox',
    'globalSettings',
    'modules/views/widgets/batteryWidget',
    'text!/templates/navbar/header-navbar.html',
], function($, _, Backbone, bootbox, GlobalSettings, BatteryWidget, headerTemplate) {

    var NavbarView = Backbone.View.extend({
        template: _.template(headerTemplate),
        el: $("#header"),
        batteryWidget: null,
        events: {
            'click #nav_bar_reboot': 'rebootSystem',
            'click #nav_bar_shutdown': 'shutdown',
            'click #nav_bar_restart_oobe': 'restartOOBE',
        },

        initialize: function() {},
        restartOOBE: function() {
            var self = this;
            bootbox.confirm('Are you sure you want to restart OOBE?', function(result) {
                if (!result)
                    return;

                self.eventAggregator.trigger("loading:on", { key: 'restartOOBE', msg: "Restarting OOBE... ", desc: "Reconnect in few minutes" });
                console.log("restartOOBE");
                var rosClient = new ROSLIB.Service({
                    ros: ros,
                    name: '/euclid/restart_oobe',
                    serviceType: 'configuration_node/RestartOOBE'
                });

                var request = new ROSLIB.ServiceRequest({});

                rosClient.callService(request, function(result) {

                    },
                    function(f) {
                        console.log("ERROR - restartOOBE - " + f);
                    });
            });

        },
        shutdown: function() {
            var self = this;
            bootbox.confirm('Are you sure you want to shutdown the system?', function(result) {
                if (!result)
                    return;

                self.eventAggregator.trigger("loading:on", { key: 'shutdown', msg: "Shuting down. You can close your browser." });
                console.log("shutdown");
                var rosClient = new ROSLIB.Service({
                    ros: ros,
                    name: '/euclid/shutdown_system',
                    serviceType: 'configuration_node/Shutdown'
                });

                var request = new ROSLIB.ServiceRequest({

                });

                rosClient.callService(request, function(result) {

                    },
                    function(f) {
                        console.log("ERROR - shutdown - " + f);
                    });
            });
        },
        rebootSystem: function() {
            var self = this;
            bootbox.confirm('Are you sure you want to restart the system?', function(result) {
                if (!result)
                    return;
                self.eventAggregator.trigger("loading:on", { key: 'reboot', msg: "Rebooting system...", desc: "Please reconnect to the application in few minutes." });
                console.log("rebootSystem");
                var rosClient = new ROSLIB.Service({
                    ros: ros,
                    name: '/euclid/restart_system',
                    serviceType: 'configuration_node/RestartSystem'
                });

                var request = new ROSLIB.ServiceRequest({

                });

                rosClient.callService(request, function(result) {

                    },
                    function(f) {
                        console.log("ERROR - rebootSystem - " + f);
                    });
            });
        },
        render: function(template) {
            headerView = this;
            headerView.$el.html(this.template());
            headerView.loadBatteryWidget();
            return headerView;
        },

        loadBatteryWidget: function() {
            batteryWidget = new BatteryWidget();
            batteryWidget.render();
        },

        closeNavBarMenu: function() {
            console.log("Close menu");
            $(".navbar-collapse").collapse('hide');
        }
    });

    App.Views.navbarView = new NavbarView();

});