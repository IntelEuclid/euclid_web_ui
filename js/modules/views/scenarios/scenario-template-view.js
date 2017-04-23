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
    'text!/templates/scenarios/scenario-template.html',
], function ($, _, Backbone, GlobalSettings, bootbox, topicManager, applicationServices, serviceManager, toastr, newScenarioView, scenarioTemplate) {

    var ScenarioTemplateView = Backbone.View.extend({
        template: _.template(scenarioTemplate),
        initialize: function () { },
        events: {
            'click #btn_runScenario': 'runScenario',
            'click #btn_stopScenario': 'stopScenario',
            'click #btn_setActiveScenario': 'setScenarioDefault',
            'click #btn_deactiveScenario': 'removeFromDefault',
            'click #btn_removeScenarios': 'removeScenarios',
            'click #btn_editScenario': 'editScenario',
        },
        render: function (vals) {
            this.$el.html(this.template(vals));
            return this;
        },

        runScenario: function (ctx) {
            var btn = $(ctx.currentTarget);
            var selectedScenario = btn.data("key");
            var selectedScenarioPanel = $("#" + selectedScenario + "_panel");
            bootbox.confirm('Are you sure you want to run selected scenario (this will stop currently running scenarios)?', function (result) {
                if (!result) return;
                selectedScenarioPanel.addClass("panel-warning");
                var runScenarioService = new serviceManager();
                runScenarioService.setupService('/euclid/run_scenario', 'configuration_node/RunScenario');
                runScenarioService.setupRequest({ scenarioName: selectedScenario });
                runScenarioService.callService(function (response) {
                    console.log(response);
                    var messageType = messageContent = "";
                    if (response.res == false) {
                        return false;
                    }
                    if (App.runningScenario) {
                        var runningScenarioPanel = $("#" + App.runningScenario.name + "_panel");
                        App.applicationServices.removeRunningScenario();
                        runningScenarioPanel.find("#btn_stopScenario").hide();
                        runningScenarioPanel.find("#btn_runScenario").show();
                        runningScenarioPanel.find(".in").removeClass("in");
                        runningScenarioPanel.find(".scenario-node-li-running").removeClass("scenario-node-li-running");
                        runningScenarioPanel.find(".scenario-node-li-not-running").removeClass("scenario-node-li-not-running");
                        runningScenarioPanel.removeClass("panel-warning");
                        runningScenarioPanel.removeClass("panel-danger");
                        runningScenarioPanel.removeClass("panel-success");
                    }
                    App.applicationServices.loadRunningScenario();
                    selectedScenarioPanel.find("#btn_stopScenario").show();
                    selectedScenarioPanel.find("#btn_runScenario").hide();
                });
            });
        },

        stopScenario: function (ctx) {
            bootbox.confirm('Are you sure you want to stop currently running scenario?', function (result) {
                if (!result) return;
                var btn = $(ctx.currentTarget);
                var activeScenario = btn.data("key");
                var stopScenarioService = new serviceManager();
                stopScenarioService.setupService('/euclid/stop_running_scenario', 'configuration_node/StopRunningScenario');

                stopScenarioService.callService(function (result) {
                    var messageType = result.res == true ? "success" : "error";
                    var messageContent = result.res == true ? "Stopped successfully" : "Failed to stop";
                    toastr[messageType](messageContent, "Run scenario");
                    $("#scenarioNotSavedIcon").hide();
                    var runningScenarioPanel = $("#" + activeScenario + "_panel");
                    if (runningScenarioPanel.length > 0) {
                        runningScenarioPanel.removeClass("panel-warning");
                        runningScenarioPanel.removeClass("panel-danger");
                        runningScenarioPanel.removeClass("panel-success");
                        runningScenarioPanel.addClass("panel-default")
                        runningScenarioPanel.find("#btn_stopScenario").hide();
                        runningScenarioPanel.find("#btn_runScenario").show();
                        runningScenarioPanel.find(".scenario-node-li-running").removeClass("scenario-node-li-running")
                        runningScenarioPanel.find(".scenario-node-li-not-running").removeClass("scenario-node-li-not-running")
                    }
                    App.applicationServices.removeRunningScenario();
                });
            });
        },

        setScenarioDefault: function (ctx) {
            ctx.preventDefault();
            var btn = $(ctx.currentTarget);
            var activeScenario = String(btn.data("key"));
            var activeScenarioService = new serviceManager();
            activeScenarioService.setupService('/euclid/set_default_scenario', 'configuration_node/SetDefaultScenario');
            activeScenarioService.setupRequest({ scenarioName: activeScenario });
            activeScenarioService.callService(function (response) {
                if (response.res == false) {
                    return false;
                }
                var starButtons = $(".defaultStarOn");
                $.each(starButtons, function (index, button) {
                    if ($(button).is(":visible")) {
                        $(button).parent().find("#btn_setActiveScenario").show();
                        $(button).hide();
                    }
                })
                btn.hide();
                btn.parent().find("#btn_deactiveScenario").show();
            });
        },

        removeFromDefault: function (ctx) {
            var btn = $(ctx.currentTarget);
            var activeScenario = btn.data("key");
            console.log("deactivating active scenario");
            bootbox.confirm('Are you sure you want to remove the scenario from startup?', function (result) {
                if (!result) return;
                var deactiveScenarioService = new serviceManager();
                deactiveScenarioService.setupService('/euclid/set_default_scenario', 'configuration_node/RunScenario');
                deactiveScenarioService.callService(function (response) {
                    if (response.res == false) {
                        return false;
                    }
                    btn.hide();
                    btn.parent().find("#btn_setActiveScenario").show();
                });
            });
        },

        removeScenarios: function (ctx) {
            ctx.preventDefault();
            var btn = $(ctx.currentTarget);
            var activeScenario = String(btn.data("key"));
            var scenariosToBeRemoved = [];
            scenariosToBeRemoved.push(activeScenario);
            bootbox.confirm('Are you sure you want to remove ' + activeScenario + ' - this can\'t be undone?', function (result) {
                if (!result) return;
                var removeScenarioService = new serviceManager();
                removeScenarioService.setupService('/euclid/remove_scenarios', 'configuration_node/RemoveScenarios');
                removeScenarioService.setupRequest({ scenarioName: scenariosToBeRemoved });
                removeScenarioService.callService(function (response) {
                    if (response.res == false) {
                        return false;
                    }
                    App.applicationServices.removeRunningScenario();
                    App.Views.scenariosView.buildScenarios();
                });
            });
        },

        editScenario: function (ctx) {
            var btn = $(ctx.currentTarget);
            var scenarioName = (btn.data("key"));
            var runningScenarioPanel = $("#" + scenarioName + "_panel");
            console.log(App.runningScenario, scenarioName)
            if (App.runningScenario != undefined && App.runningScenario.name == scenarioName) {
                bootbox.confirm('To edit the scenario it must be stopped, Are you sure you want to stop currently running scenario?', function (result) {
                    if (!result) return;
                    var btn = $(ctx.currentTarget);
                    var stopScenarioService = new serviceManager();
                    stopScenarioService.setupService('/euclid/stop_running_scenario', 'configuration_node/StopRunningScenario');

                    stopScenarioService.callService(function (result) {
                        var messageType = result.res == true ? "success" : "error";
                        var messageContent = result.res == true ? "Stopped successfully" : "Failed to stop";
                        toastr[messageType](messageContent, "Run scenario");
                        $("#scenarioNotSavedIcon").hide();
                        var runningScenarioPanel = $("#" + scenarioName + "_panel");
                        if (runningScenarioPanel.length > 0) {
                            runningScenarioPanel.removeClass("panel-warning");
                            runningScenarioPanel.removeClass("panel-danger");
                            runningScenarioPanel.removeClass("panel-success");
                            runningScenarioPanel.addClass("panel-default")
                            runningScenarioPanel.find("#btn_stopScenario").hide();
                            runningScenarioPanel.find("#btn_runScenario").show();
                            runningScenarioPanel.find(".scenario-node-li-running").removeClass("scenario-node-li-running")
                            runningScenarioPanel.find(".scenario-node-li-not-running").removeClass("scenario-node-li-not-running")
                        }
                        App.applicationServices.removeRunningScenario();

                        App.Views.newScenarioView = new newScenarioView();
                        App.Views.newScenarioView.editScenario(scenarioName);
                    });
                });
            } else {
                App.Views.newScenarioView = new newScenarioView();
                App.Views.newScenarioView.editScenario(scenarioName);
            }

        },

    });
    return ScenarioTemplateView
});