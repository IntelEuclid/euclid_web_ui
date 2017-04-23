define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootstrapSlider',
    'bootbox',
    'text!/templates/config/config-camera-template.html'
], function ($, _, Backbone, GlobalSettings, bootstrapSlider, bootbox, configCameraTemplate) {
    var configCameraView = Backbone.View.extend({
        template: _.template(configCameraTemplate),
        ros_node_name: "RealsenseNodelet",
        id_prefix: "realsense_camera__RealsenseNodelet__",
        paramsClient: null,
        setParams: null,
        request: null,
        el: $("#body"),
        events: {
            'click button.reset': 'reset',
            'click button.save': 'save',
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
            this.eventAggregator.trigger("loading:on", { key: 'cameraViewSave', msg: "Saving configurations..." });
            var self = this;
            var sliders = $("input.slider");
            $.each(sliders, function (i, s) {
                var key = $(s).data("key");
                var element = $('*[data-key="' + key + '"]');
                var value = element.slider('getValue');

                console.log(value + " - " + key);
                self.setRosParam(key, value);
            });
            bootbox.alert("Configuration Saved!");
            self.eventAggregator.trigger("loading:off", { key: 'cameraViewSave' });
        },
        loadRosParams: function () {
            var self = this;
            this.eventAggregator.trigger("loading:on", { key: 'cameraViewLoad', msg: "Loading ROS Params..." });
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
                this.eventAggregator.trigger("loading:off", { key: 'cameraViewLoad', msg: "Loading ROS Params..." });
            }, function (err) {
                this.eventAggregator.trigger("loading:off", { key: 'cameraViewLoad', msg: "Loading ROS Params..." });
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
                var key = $(self).data("key");
                var ele = key + "_text";
                var val = $(self).val();
                console.log(val + " - " + key + " - " + ele);
                $('*[data-key="' + ele + '"]').val(val);
                self.setRosParam(key, val);
            });

            $("input.slide-input").change(function (a) {
                var key = $(self).data("key");
                var ele = key.replace("_text", "");
                var val = $(self).val();
                console.log(val + " - " + key + " - " + ele);
                $('*[data-key="' + ele + '"]').slider('setValue', parseInt(val));
                //
            });

            this.loadRosParams();
            return this;
        },
    });

    return new configCameraView();
});
