define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootstrapSlider',
    'bootbox',
    'text!/templates/config/config-motors-gain-template.html'

], function ($, _, Backbone, GlobalSettings, bootbox, configMotorsGainTemplate) {
    var configMotorsGainView = Backbone.View.extend({
        template: _.template(configMotorsGainTemplate),
        ros_node_name: "CsArduinoMotorConfiguration",
        id_prefix: "CsArduinoMotorConfiguration__CsArduinoMotorConfiguration__",
        paramsClient: null,
        setParams: null,
        request: null,
        el: $("#body"),
        events: {
            'click button.gain_reset': 'reset',
            'click button.gain_save': 'save',
        },
        reset: function () {
            bootbox.confirm("Are you sure?", function (result) {
                if (!result) return;
                var sliders = $("input.slider");
                $.each(sliders, function (i, s) {
                    var key = $(s).data("key");
                    var element = $('*[data-key="' + key + '"]');
                    var val = s.attributes["data-slider-value"].value;
                    console.log(val + " - " + key);
                    element.slider('setValue', parseFloat(val));
                    $('*[data-key="' + key + '_text"]').val(val);
                });
            });
        },
        save: function () {
            this.eventAggregator.trigger("loading:on", { key: 'motorsGainViewSave', msg: "Saving configurations..." });
            var self = this;
            var sliders = $("input.slider");
            $.each(sliders, function (i, s) {
                var key = $(s).data("key");
                var element = $('*[data-key="' + key + '"]');
                var value = parseFloat(element.data('value'));

                console.log(value + " - " + key);
                self.setRosParam(key, value);
            });
            self.eventAggregator.trigger("loading:off", { key: 'motorsGainViewSave' });
        },
        loadRosParams: function () {
            var self = this;
            this.eventAggregator.trigger("loading:on", { key: 'motorsGainViewLoad', msg: "Loading ROS Params..." });
            paramsClient.callService(request, function (result) {
                var resParams = result.params
                for (var i = 0; i < resParams.length; i++) {
                    console.log("Param name: " + resParams[i].name);
                    console.log('Search id: ' + "" + self.id_prefix + resParams[i].name);

                    var value = resParams[i].val;
                    var paramName = resParams[i].name;
                    var sliderElement = $('*[data-key="' + resParams[i].name + '"]');
                    var sliderInput = $('*[data-key="' + resParams[i].name + '_text"]');
                    sliderElement.slider('setValue', parseInt(value));
                    sliderInput.val(value);
                }
                this.eventAggregator.trigger("loading:off", { key: 'motorsGainViewLoad', msg: "Loading ROS Params..." });
            }, function (err) {
                this.eventAggregator.trigger("loading:off", { key: 'motorsGainViewLoad', msg: "Loading ROS Params..." });
                console.log("ERROR - loadRosParams - " + f);
            });

        },
        setRosParam: function (paramName, paramValue) {
            if (paramValue) {
                var request = new ROSLIB.ServiceRequest({
                    nodeName: this.ros_node_name,
                    param: paramName,
                    value: paramValue.toString()
                });
                setParams.callService(request, function (response) {
                    var resParams = response.res
                }, function (f) {
                    console.log("ERROR - setRosParam - " + f);
                });
            }
        },
        initialize: function () {
            var self = this;
        },
        register: function () {
            paramsClient = new ROSLIB.Service({
                ros: ros,
                name: '/euclid/get_params',
                serviceType: 'configuration_node/GetParams'
            });
            setParams = new ROSLIB.Service({
                ros: ros,
                name: '/euclid/set_param',
                serviceType: 'configuration_node/SetParam'
            });
            request = new ROSLIB.ServiceRequest({
                nodeName: this.ros_node_name
            });
        },
        render: function () {

            this.$el.empty();
            this.unbind();
            this.$el.html(this.template());
            this.register();

            $("input.slider").slider();
            $("input.slider").change(function (a) {
                var key = $(this).data("key");
                var ele = key + "_text";
                var val = $(this).val();
                console.log(val + " - " + key + " - " + ele);
                $('*[data-key="' + ele + '"]').val(val);
                self.setRosParam(key, val);
            });

            $("input.slide-input").change(function (a) {
                var key = $(this).data("key");
                var ele = key.replace("_text", "");
                var val = $(this).val();
                console.log(val + " - " + key + " - " + ele);
                $('*[data-key="' + ele + '"]').slider('setValue', parseInt(val));
                //
            });

            this.loadRosParams();
            return this;
        }
    });

    return new configMotorsGainView();
});
