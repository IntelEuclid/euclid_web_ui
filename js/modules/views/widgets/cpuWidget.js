define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootbox',
    'gaugeManager',
    'text!/templates/widgets/cpuWidgetTemplate.html',
], function($, _, Backbone, GlobalSettings, bootbox, GaugeManager, cpuWidgetTemplate) {
    var CPUWidget = Backbone.View.extend({
        el: "#cpu-widget-div",
        listener: null,
        gauges: {},
        gaugeManager: null,
        template: _.template(cpuWidgetTemplate),
        close: function() {
            this.unsubscribe();
            this.remove();
        },
        setupListener: function() {
            this.listener = new ROSLIB.Topic({
                ros: ros,
                name: '/cpu_info',
                messageType: 'system_monitor/CpuStatus'
            });
        },

        subscribe: function() {
            self = this;
            if (this.listener == null) {
                this.setupListener();
                this.listener.subscribe(function(message) {
                    $("#cpumodel").html(message.cpu_model_name);

                    self.gaugeManager.updateGauge(self.gauges.tempGauge, Math.round(message.cpu_temperature).toFixed(1));
                    self.gaugeManager.updateGauge(self.gauges.memoryGauge, Math.round(message.mem_usage_percentage).toFixed(1));
                    self.gaugeManager.updateGauge(self.gauges.core0Gauge, Math.round(message.cpu_frequencies[0]).toFixed(1));
                    self.gaugeManager.updateGauge(self.gauges.core1Gauge, Math.round(message.cpu_frequencies[1]).toFixed(1));
                    self.gaugeManager.updateGauge(self.gauges.core2Gauge, Math.round(message.cpu_frequencies[2]).toFixed(1));
                    self.gaugeManager.updateGauge(self.gauges.core3Gauge, Math.round(message.cpu_frequencies[3]).toFixed(1));
                    var totalCpuUtil = message.cpu_utilizations[0] + message.cpu_utilizations[1] + message.cpu_utilizations[2] + message.cpu_utilizations[0];
                    self.gaugeManager.updateGauge(self.gauges.cpuGauge, Math.round(totalCpuUtil / 4).toFixed(1));
                });
            }
        },
        unsubscribe: function() {
            this.listener.unsubscribe();
            this.listener = null;
            this.gauges = undefined;
        },
        initializeGauges: function() {
            this.gaugeManager = new GaugeManager();
            this.gauges.tempGauge = this.gaugeManager.createGauge("temperature", "Temp °C", 0);
            this.gauges.cpuGauge = this.gaugeManager.createGauge("cpu", "CPU");
            this.gauges.memoryGauge = this.gaugeManager.createGauge("memory", "Memory");
            this.gauges.core0Gauge = this.gaugeManager.createGauge("core0", "Core 0", 440, 2480, 100, false, false);
            this.gauges.core1Gauge = this.gaugeManager.createGauge("core1", "Core 1", 440, 2480, 100, false, false);
            this.gauges.core2Gauge = this.gaugeManager.createGauge("core2", "Core 2", 440, 2480, 100, false, false);
            this.gauges.core3Gauge = this.gaugeManager.createGauge("core3", "Core 3", 440, 2480, 100, false, false);
        },

        renderGauges: function() {
            var self = this;
            $.each(this.gauges, function(key, gauge) {
                self.gaugeManager.renderGauge(gauge);
            })
        },


        initialize: function() {
            console.log("setting up CPU widget");
            this.initializeGauges();
            this.subscribe();
            this.render();
            this.renderGauges();

        },

        render: function() {
            this.$el.append(this.template());
        }

    });
    return CPUWidget;
});