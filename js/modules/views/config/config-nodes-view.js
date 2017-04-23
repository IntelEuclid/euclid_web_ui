define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootstrapSlider',
    'bootbox',
    'serviceManager',
    'applicationServices',
    'text!/templates/config/config-view-template.html',
], function($, _, Backbone, GlobalSettings, bootstrapSlider, bootbox, serviceManager, applicationServices, configTemplate) {


    ConfigNodesView = Backbone.View.extend({
        template: _.template(configTemplate),
        el: "#configuration-view",
        events: {
            'change .slider-tag': 'updateInputTag',
            'change .input-tag': 'updateSliderTag'
        },

        initialize: function() {
            console.log("starting nodes view");

        },
        nodeName: '',
        nodesData: {},
        nodesListener: new ROSLIB.Topic(),

        register: function(nodeName) {
            var topicId = nodeName;
            var topicName = nodeName + '/parameter_descriptions'
            var topicMessageType = 'dynamic_reconfigure/ConfigDescription';
            this.nodesListener.unsubscribe();
            self = this;
            this.nodeName = nodeName;
            this.nodesData = {};
            var data = this.nodesData;
            this.nodesListener = new ROSLIB.Topic({
                ros: ros,
                name: topicName,
                messageType: topicMessageType
            });

            var running = false;
            var gotValues = false;
            this.nodesListener.subscribe(function(message) {
                if (running) {
                    return false;
                }
                running = true;
                $.each(message.groups, function(groupsIndex, group) {
                    $.each(group.parameters, function(paramIndex, parameter) {
                        data[parameter.name] = parameter;
                    })
                });
                messageRanges = ['min', 'max', 'dflt'];
                messageTypes = ['ints', 'bools', 'doubles', 'strs'];
                $.each(messageRanges, function(rangeKey, range) {
                    var currentNode = message[range];
                    $.each(messageTypes, function(typeKey, type) {
                        $.each(currentNode[type], function(currentTypeKey, currentType) {
                            nodeToPopulate = data[currentType.name];
                            attrToPopulate = messageRanges[rangeKey] + "Value"
                            nodeToPopulate[attrToPopulate] = currentType.value;
                            nodeToPopulate.inputType = type.substr(0, type.length - 1);
                        })
                    })
                });
                App.Views.configNodesView.getValues(nodeName);
            });
        },

        toggleSlider: function(evt) {
            evt.preventDefault();
            $.each($(".input-tag"), function(idx, tag) {
                var sliderElement = $('#param-' + tag.name + '-slider').slider();
                sliderElement.slider('setValue', parseInt(tag.value));
                sliderElement.slider('relayout');
            });
            $(".slider-label").toggle();
            $(".input-label").toggle();
            $(".slider-div").toggle();
            $(".input-div").toggle();
        },

        updateInputTag: function(evt) {
            var currentValue = evt.currentTarget.value;
            $('input[name="' + evt.currentTarget.name + '"]').val(currentValue);
        },

        updateSliderTag: function(evt) {
            var currentValue = parseInt(evt.currentTarget.value);
            $(evt.currentTarget).slider('setValue', currentValue);
        },

        saveValues: function() {
            if (this.nodeName == 'null')
                return
            self = this;
            $.each($('form input'), function(key, elem) {
                var elementType = self.nodesData[elem.name].type;
                var elementValue = elem.value;
                switch (elementType) {
                    case 'int':
                        elementValue = parseInt(elem.value);
                        break;
                    case 'double':
                        elementValue = parseFloat(elem.value);
                        break;
                    case 'str':
                        elementValue = elem.value;
                        break;
                    case 'bool':
                        elementValue = elem.checked;
                }
                self.nodesData[elem.name].value = elementValue;
            });
            var newData = {};
            newData.ints = [];
            newData.bools = [];
            newData.doubles = [];
            newData.strs = [];
            newData.groups = [];
            $.each(this.nodesData, function(idx, element) {
                var elementJsonNode = { name: element.name, value: element.value }
                var type = element.type + "s";
                newData[type].push(elementJsonNode);

            });
            console.log(newData);
            var running = false;
            if (!running) {
                running = true;
                var serviceName = self.nodeName + '/set_parameters';
                var serviceType = 'dynamic_reconfigure/Reconfigure';
                var sendParamUpdates = new serviceManager();
                sendParamUpdates.setupService(serviceName, serviceType);
                sendParamUpdates.setupRequest({ config: newData });
                sendParamUpdates.callService(function(result) {
                    if (result.config) {
                        App.applicationServices.toastMessage("success", "Update parameters", "Successfuly updated parameters");
                    } else {
                        App.applicationServices.toastMessage("error", "Update parameters", "Failed to update parameters");
                    }
                    console.log(result);
                    if (App.runningScenario) {
                        App.runningScenario.notSaved = true;
                        $("#scenarioNotSavedIcon").show();
                        $("#scenarioNotSavedIcon").tooltip();
                    }
                });
            }
        },

        resetValues: function() {
            console.log("reset");
            this.register(this.nodeName);
        },

        getValues: function(nodeName) {
            self = this;

            nodesListner = new ROSLIB.Topic({
                ros: ros,
                name: nodeName + '/parameter_updates',
                messageType: 'dynamic_reconfigure/Config'
            });
            var isRunning = false;
            nodesListner.subscribe(function(message) {
                if (isRunning) {
                    return false;
                }
                isRunning = true;
                messageTypes = ['ints', 'bools', 'doubles', 'strs'];
                $.each(messageTypes, function(idx, type) {
                    var messageTypeArray = message[type]
                    $.each(messageTypeArray, function(messageTypeIdx, messageTypeNode) {
                        self.nodesData[messageTypeNode.name].value = messageTypeNode.value;
                    });
                });
                self.render();
            });
        },

        render: function() {
            this.$el.empty();
            this.$el.append(this.template({ items: this.nodesData, nodeName: this.nodeName }));
            $("#slider-toggle").unbind();
            $("#slider-toggle").click(this.toggleSlider);
            $('.slider').slider();
        }

    });
    App.Views.configNodesView = new ConfigNodesView();
});