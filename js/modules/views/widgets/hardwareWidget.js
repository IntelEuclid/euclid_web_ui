define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootbox',
    'gaugeManager',
    'text!/templates/widgets/hardwareWidgetTemplate.html'
], function($, _, Backbone, GlobalSettings, bootbox, GaugeManager, hardwareWidgetTemplate) {
    var gauges = {};
    var HardwareWidget = Backbone.View.extend({

        el: "#widget-div",
        listener: null,
        template: _.template(hardwareWidgetTemplate),

        initializeGauges: function() {
            gaugeManager = new GaugeManager();
            gauges.core0Gauge = gaugeManager.createGauge("core0", "Core 0", 440, 2480, 100, false, false);
            gauges.core1Gauge = gaugeManager.createGauge("core1", "Core 1", 440, 2480, 100, false, false);
            gauges.core2Gauge = gaugeManager.createGauge("core2", "Core 2", 440, 2480, 100, false, false);
            gauges.core3Gauge = gaugeManager.createGauge("core3", "Core 3", 440, 2480, 100, false, false);
        },

        renderGauges: function() {
            $.each(gauges, function(key, gauge) {
                gaugeManager.renderGauge(gauge);
            });
        },


        initialize: function() {
            console.log("setting up hardware widget");
            this.initializeGauges();
            this.renderGauges();
            this.render();
            this.subscribe();
        },

        render: function() {
            this.$el.append(this.template());
            return this;
        }

    });
    return HardwareWidget;
});