define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootstrapSlider',
    'bootbox',
    'text!/templates/config/config-depth-walker-template.html'

], function ($, _, Backbone, GlobalSettings, bootbox, configDepthWalkerTemplate) {
    var configDepthWalkerView = Backbone.View.extend({
        template: _.template(configDepthWalkerTemplate),
        ros_node_name: "/realsense_depth_walker",
        id_prefix: "realsense_depth_walker__realsense_depth_walker__",
        paramsClient: null,
        setParams: null,
        request: null,
        el: $("#body"),
        events: {
            'click button.walker_reset': 'reset',
            'click button.walker_save': 'save',
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
                    element.slider('setValue', parseInt(val));
                    $('*[data-key="' + key + '_text"]').val(val);
                });
            });
        },
        save: function () {
            this.eventAggregator.trigger("loading:on", { key: 'walkerViewSave', msg: "Saving configurations..." });
            var self = this;
            var sliders = $("input.slider");
            $.each(sliders, function (i, s) {
                var key = $(s).data("key");
                var element = $('*[data-key="' + key + '"]');
                var value = element.data('val');

                console.log(value + " - " + key);
                self.setRosParam(key, value);
            });
            bootbox.confirm("Configuration Updated!");
            self.eventAggregator.trigger("loading:off", { key: 'walkerViewSave' });
        },
        loadRosParams: function () {
            var self = this;
            this.eventAggregator.trigger("loading:on", { key: 'walkerViewLoad', msg: "Loading ROS Params..." });
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
                this.eventAggregator.trigger("loading:off", { key: 'walkerViewLoad', msg: "Loading ROS Params..." });
            }, function (err) {
                this.eventAggregator.trigger("loading:off", { key: 'walkerViewLoad', msg: "Loading ROS Params..." });
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

            var self = this;
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

    return new configDepthWalkerView();
});
