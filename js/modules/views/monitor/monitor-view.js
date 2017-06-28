define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootstrapToggle',
    'configView',
    'modules/views/monitor/monitor-item-view',
    'modules/views/monitor/monitor-screen-view',
    'text!/templates/monitor/monitor-template.html',
], function($, _, Backbone, GlobalSettings, bootstrapToggle, configView, monitorListItemView, monitorScreenView, monitorViewTemplate) {

    var monitorView = Backbone.View.extend({
        el: $("#body"),
        template: _.template(monitorViewTemplate),
        events: {
            'click button.snapshot_btn': 'takeSnapshot',
            'click #menu-toggle': 'toggleSideMenu',
            'click #monitor-div': 'hideSideMenu',
            'click .nodeConfigSelector': 'openConfigMenu',
            'click #close-config': 'closeConfigMenu',
            'click #btn_refresh_configuration': 'refreshConfig'
        },

        monitorList: ['color', 'depth', 'fisheye', 'person', 'imu', 'trajectory', 'teleop', 'utilization'],

        monitorPaths: {
            color: { topic: '/camera/color/image_raw', path: 'http://' + GlobalSettings.system_ip + ':8080/stream?topic=/camera/color/image_raw&quality=30' },
            depth: { topic: '/camera/depth/image_transcoded', path: 'http://' + GlobalSettings.system_ip + ':8080/stream?topic=/camera/depth/image_transcoded&quality=10' },
            fisheye: { topic: '/camera/fisheye/image_raw', path: 'http://' + GlobalSettings.system_ip + ':8080/stream?topic=/camera/fisheye/image_raw&quality=20&height=240&width=320' },
            person: { topic: '/camera/person/detection_image', path: 'http://' + GlobalSettings.system_ip + ':8080/stream?topic=/camera/person/detection_image&quality=30' },
            imu: { topic: '/imu_graph', path: 'http://' + GlobalSettings.system_ip + '/imu_graph.html' },
            trajectory: { topic: '/realsense/odom', path: 'http://' + GlobalSettings.system_ip + '/view.html' },
            teleop: { topic: '/cmd_vel_mux/input/teleop', path: 'http://' + GlobalSettings.system_ip + '/joystick.html' },
            utilization: { topic: '/cpu_utilization', path: 'http://' + GlobalSettings.system_ip + '/cpu_monitor.html' },

        },

        takeSnapshot: function() {
            var setMasterURIService = new ROSLIB.Service({
                ros: ros,
                name: '/image_record_node/start',
                serviceType: 'image_record_node/Start'
            });

            var request = new ROSLIB.ServiceRequest({

            });
            setMasterURIService.callService(request, function(result) {
                bootbox.alert("Done!");
            });
        },
        refreshConfig: function() {
            if (App.Views.configView != undefined)
                App.Views.configView.loadNodesList();
        },
        initialize: function() {
            var self = this;
        },
        register: function() {

        },

        toggleMonitorItem: function(element) {

            var divId = element.currentTarget.id;
            var monitorElement = divId.split('-')[0];
            if ($("#" + monitorElement + "-block").length > 0) {
                $("#" + monitorElement + "-block").remove();
                return;
            } else {
                var screenView = new monitorScreenView();
                var screenParams = {
                    name: monitorElement,
                    topic: this.monitorPaths[monitorElement].topic,
                    src: this.monitorPaths[monitorElement].path
                };
                $("#monitor-view").append(screenView.render(screenParams).el);
            }
        },

        openConfigMenu: function() {
            console.log("opened from different view");
            $("#monitor-view").removeClass("col-md-12").addClass('col-md-8');
            $("#configuration-div").show();
        },

        closeConfigMenu: function() {
            $("#configuration-view").empty();
            $("#configuration-div").hide();
            $("#monitor-view").removeClass('col-md-8').addClass("col-md-12");
        },
        render: function() {
            this.$el.empty();
            this.unbind();
            this.$el.html(this.template());
            $("body").addClass("body-fixed-height");
            $.each(this.monitorList, function(key, val) {
                var listItemView = new monitorListItemView({ id: val + "-div" });
                listItemView.render(val);

                var listItemMobileView = new monitorListItemView({ id: val + "-div" });
                listItemMobileView.render(val);

                $("#mobile-monitor-menu").append(listItemMobileView.el);
                $("#monitor-menu").append(listItemView.el);
            });
            App.Views.configView = new ConfigView();
            $(".view-toggle").bootstrapToggle();
            return this;
        }
    });
    App.Views.monitorView = new monitorView();
});