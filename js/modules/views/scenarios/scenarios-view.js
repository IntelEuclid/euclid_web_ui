define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootbox',
    'TopicManager',
    'applicationServices',
    'serviceManager',
    'toastr',
    'modules/views/scenarios/new-scenario-view',
    'modules/views/scenarios/scenario-template-view',
    'text!/templates/scenarios/scenarios-status-template.html',
], function($, _, Backbone, GlobalSettings, bootbox, topicManager, applicationServices, serviceManager, toastr, newScenarioView, ScenarioTemplateView, scenariosViewTemplate) {

    var scenarioList = {};

    var scenariosView = Backbone.View.extend({
        el: "#body",
        template: _.template(scenariosViewTemplate),
        events: {
            'click button.btn_setActiveScenario': 'setActiveScenario',
            'click button.btn_deactiveScenario': 'deactiveScenario',
            'click button.btn_removeScenarios': 'removeScenarios',
            'click button.btn_saveConfiguration': 'saveConfiguration',
            'click #new-scenario-btn': 'setupNewScenarioForm',
        },
        initialize: function() {
            var self = this;
            console.log("loading scenarioView");
        },


        handleScenarioStatusResponse: function(message) {
            if (!App.runningScenario) {
                return false;
            }
            var foundFailure = false;
            $.each(message.packages, function(idx, package) {
                var isInArray = $.inArray(package.packageName, App.runningScenario.nodes)
                if (isInArray > -1) {
                    runningScenarioName = App.runningScenario.name;
                    $.each(package.nodes, function(index, node) {
                        var trimmedPackageName = package.packageName.replace(/\s+/g, '');
                        var liToHighlight = $("#" + runningScenarioName + "-" + trimmedPackageName + "-li");
                        liToHighlight.removeClass("scenario-node-li-not-running");
                        if (!node.isRunning) {
                            packageIsOk = false;
                            foundFailure = true;
                            liToHighlight.removeClass("scenario-node-li-running");
                            liToHighlight.addClass("scenario-node-li-not-running");
                            return false;
                        } else {
                            liToHighlight.removeClass("scenario-node-li-not-running");
                            liToHighlight.addClass("scenario-node-li-running");
                        }
                    });
                };
            });
            var runningScenarioPanel = $("#" + App.runningScenario.name + "_panel");
            runningScenarioPanel.removeClass('panel-warning');
            if (foundFailure) {
                runningScenarioPanel.removeClass('panel-success');
                runningScenarioPanel.addClass('panel-danger');
            } else {
                runningScenarioPanel.addClass('panel-success');
                runningScenarioPanel.removeClass('panel-danger');
            }
        },

        deactiveScenario: function(ctx) {
            var btn = $(ctx.currentTarget);
            var activeScenario = btn.data("key");
            console.log("deactivating active scenario");
            bootbox.confirm('Are you sure you want to remove the scenario from startup?', function(result) {
                if (!result) return;
                var deactiveScenarioService = new serviceManager();
                deactiveScenarioService.setupService('/euclid/set_default_scenario', 'configuration_node/RunScenario');
                deactiveScenarioService.callService();
            });
        },

        setupNewScenarioForm: function(evt) {
            App.Views.newScenarioView = new newScenarioView();
            App.Views.newScenarioView.createNewScenario();
        },

        removeScenarios: function(ctx) {
            console.log("remove scenario");
            var btn = $(ctx.currentTarget);
            var activeScenario = String(btn.data("key"));
            console.log(activeScenario);
            var scenariosToBeRemoved = [];
            scenariosToBeRemoved.push(activeScenario);
            bootbox.confirm('Are you sure you want to remove ' + activeScenario + ' - this can\'t be undone?', function(result) {
                console.log(result);
                if (!result) return;
                var removeScenarioService = new serviceManager();
                removeScenarioService.setupService('/euclid/remove_scenarios', 'configuration_node/RemoveScenarios');
                removeScenarioService.setupRequest({ scenarioName: scenariosToBeRemoved });
                removeScenarioService.callService();
            });
        },

        //Status can be either 'loading, success, failure, off'
        updateScenarioStatus: function(scenario, status) {
            $("#running-scenario-label").removeClass('label-success');
            $("#running-scenario-label").removeClass('label-warning');
            $("#running-scenario-label").removeClass('label-danger');
            switch (status) {
                case 'loading':
                    $("#running-scenario-label-text").html("Loading scenario " + scenario.name);
                    $("#running-scenario-label").addClass('label-warning');
                    break;
                case 'success':
                    $("#running-scenario-label-text").html("Currently running: " + scenario.name);
                    $("#running-scenario-label").addClass('label-success');
                    break;
                case 'failure':
                    $("#running-scenario-label-text").html("Currently running: " + scenario.name);
                    $("#running-scenario-label").addClass('label-danger');
                    break;
                case 'off':
                    $("#running-scenario-label-text").empty();
            }

        },

        buildScenarios: function(callbackfunction) {
            this.eventAggregator.trigger("loading:on", { key: 'status-view', msg: "loading Scenarios..." });
            self = this;
            var buildScenariosService = new serviceManager();
            buildScenariosService.setupService('/euclid/get_scenarios', 'configuration_node/GetScenarios');

            buildScenariosService.callService(function(result) {
                $('#current_scenarios').empty();
                var scenarioPanels = [];
                scenarioList = {}
                $.each(result.scenarios, function(key, scenario) {
                    scenario.name = String(scenario.name);
                    scenarioList[scenario.name] = scenario;

                    var img = "img/default.png";
                    if (scenario.isRunning == true) {
                        App.applicationServices.loadRunningScenario();
                    }
                    var scenarioName = scenario.name.toLowerCase();
                    if (scenarioName.includes("follower")) {
                        img = "img/follow.png";
                    } else if (scenarioName.includes("rtab")) {
                        img = "img/scanning.png";
                    } else if (scenarioName.includes("collusion")) {
                        img = "img/obstacle-avoidance.png";
                    } else if (scenarioName.includes("camera")) {
                        img = "img/commensense.png";
                    }
                    var nodesList = [];
                    $.each(scenario.nodes, function(idx, node) {
                        nodesList.push(node);
                    });
                    var scenarioView = new ScenarioTemplateView();
                    scenarioView.render({
                        active: scenario.isActive,
                        isRunning: scenario.isRunning,
                        scenarioStyle: scenario.isRunning ? 'panel-warning' : 'panel-default',
                        id: key,
                        name: scenario.name,
                        img: img,
                        nodes: nodesList
                    });
                    scenarioPanels.push(scenarioView);
                });
            this.eventAggregator.trigger("loading:off", { key: 'status-view' });

                var i = 0;
                var row = undefined;
                for (i = 0; i < scenarioPanels.length; i++) {
                    if (i % 6 == 0) {
                        row = document.createElement("div");
                        $(row).addClass("row");
                        $('#current_scenarios').append(row);
                    }
                    $(row).append(scenarioPanels[i].el);
                }
                $('[data-toggle="tooltip"]').tooltip();
            });
        },
        render: function() {
            this.unbind();
            this.$el.empty();
            this.$el.html(this.template());
            this.buildScenarios();
            return this;
        }

    });
    App.Views.scenariosView = new scenariosView();
});