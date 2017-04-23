define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootbox',
    'TopicManager',
    'serviceManager',
    'toastr',
], function($, _, Backbone, GlobalSettings, bootbox, topicManager, serviceManager, toastr) {
    var applicationServices = function(toastr) {
        this.getTopic = function(topicName, messageType) {
            var topic = App.runningTopics[topicName];
            if (!topic) {
                topic = App.TopicManager.setupTopic(topicName, messageType);
                App.runningTopics[topicName] = topic;
            }
            return topic;
        };

        this.loadRunningScenario = function() {
            // toastr.error("ddd");
            applicationServices = this;
            var service = new ROSLIB.Service({
                ros: ros,
                name: '/euclid/get_scenarios',
                serviceType: 'configuration_node/GetScenarios'
            });
            service.callService('', function(result) {
                $.each(result.scenarios, function(key, scenario) {
                    if (scenario.isRunning == true) {
                        App.runningScenario = scenario;
                        App.Views.scenariosView.updateScenarioStatus(scenario, 'loading');
                        applicationServices.getRunningNodesStatus();
                        return false;
                    }
                });
            })
        };

        this.getRunningNodesStatus = function() {
            var topicName = '/euclid/scenario_status';
            var messageType = 'configuration_node/NodesStatus';
            var topic = this.getTopic(topicName, messageType);
            topic.subscribe(function(message) {
                if (!App.runningScenario) {
                    return;
                }
                App.Views.scenariosView.handleScenarioStatusResponse(message);
                var foundFailure = false;
                var runningScenarioName = App.runningScenario.name;
                $.each(message.packages, function(idx, package) {
                    var isInArray = $.inArray(package.packageName, App.runningScenario.nodes)
                    if (isInArray > -1) {
                        $.each(package.nodes, function(index, node) {
                            if (!node.isRunning) {
                                foundFailure = true;
                                return false;
                            }
                        });
                    };
                });
                if (foundFailure) {
                    App.Views.scenariosView.updateScenarioStatus(App.runningScenario, 'failure');
                } else {
                    App.Views.scenariosView.updateScenarioStatus(App.runningScenario, 'success');
                }
            });

        };

        this.removeRunningScenario = function() {
            delete App.runningScenario;
            App.Views.scenariosView.updateScenarioStatus('', 'off');
        };

        this.toastMessage = function(type, title, text) {
            toastr[type](text, title);
        }
    };

    App.applicationServices = new applicationServices(toastr);
});