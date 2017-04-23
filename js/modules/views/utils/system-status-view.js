define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootbox',
    'gaugeManager',
    'modules/views/widgets/wifiWidget',
    'modules/views/widgets/usbWidget',
    'modules/views/widgets/cpuWidget',
    'text!/templates/utils/system-status-template.html'
], function($, _, Backbone, GlobalSettings, bootbox, GaugeManager, WifiWidget, USBWidget, CPUWidget, systemStatusTemplate) {

    var gauges = {};
    var systemStatusView = Backbone.View.extend({
        template: _.template(systemStatusTemplate),
        wifi_widget: null,
        usb_widget: null,
        hardware_widget: null,
        cpu_widget: null,
        el: $("#body"),
        events: {
            'click button.ros_master_uri_btn': 'setMasterURI',
        },
        initialize: function() {
            var self = this;
        },
        close: function() {
            this.cpu_widget.close();
        },
        setMasterURI: function() {
            var setMasterURIService = new ROSLIB.Service({
                ros: ros,
                name: '/euclid/network/set_ros_master_uri',
                serviceType: 'network_manager/CsSetROSMasterURI'
            });

            var request = new ROSLIB.ServiceRequest({
                ros_master_uri: $("#ros_master_uri").val()
            });
            setMasterURIService.callService(request, function(result) {
                bootbox.alert("Done - effects will be changed after reboot!");
            });
        },
        register: function() {},

        initializeGauges: function() {
            this.cpu_widget = new CPUWidget();
            this.wifi_widget = new WifiWidget();
            this.usb_widget = new USBWidget();
        },

        render: function() {
            this.$el.empty();
            this.unbind();
            this.$el.html(this.template());
            this.initializeGauges();
            this.register();
            return this;
        }
    });
    return new systemStatusView();
});