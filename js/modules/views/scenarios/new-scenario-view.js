define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'TopicManager',
    'applicationServices',
    'serviceManager',
    'toastr',
    'text!/templates/scenarios/new-scenario-form-template.html'
], function($, _, Backbone, GlobalSettings, topicManager, applicationServices, serviceManager, toastr, newScenarioForm) {

    var newScenarioView = Backbone.View.extend({
        el: "#ScenarioModelBody",
        template: _.template(newScenarioForm),
        events: {
            'keyup #scenario_name': 'validateScenario',
            'click #btn_createNew': 'saveScenario',
            'click #btn_scenario_add_node': 'addNode',
            'click .btn.btn-remove-node': 'removeNode',
            'click #btn_new_scenario_close': 'close',
            'change #scenario_param_checkbox': 'toggleParam'
        },
        nodes: {},
        scenarioName: '',
        scenarioNodes: {},

        initialize: function() {},
        parseNodeParameters: parseNodeParameters,
        loadNodes: loadNodes,
        editScenario: editScenario,
        createNewScenario: createNewScenario,
        validateScenario: validateScenario,
        saveScenario: saveScenario,
        addNode: addNode,
        removeNode: removeNode,
        getNodesParameters: getNodesParameters,
        toggleParam: toggleParam,
        close: function() {
            this.undelegateEvents();
            $("#createScenarioModal").modal('hide');
        },
        render: function() {

            var templateValues = {
                allNodes: this.nodes,
                scenarioNodes: this.scenarioNodes,
                scenarioName: this.scenarioName,
                isEdit: this.isEdit,
            };
            this.$el.html(this.template(templateValues));

            $("#createScenarioModal").modal('show');
        }

    });

    function addNode(evt) {
        evt.preventDefault();
        var selectedNodeName = $("#select_new_node").find(":selected").text().trim();

        console.log(selectedNodeName);
        if (selectedNodeName == undefined || selectedNodeName == "") {
            toastr.error("Please select a valid Node");
            return;
        }
        var node = this.nodes[selectedNodeName];
        this.scenarioNodes[selectedNodeName] = { name: node.name, param: node.param };
        this.render();
        this.validateScenario();
    }

    function removeNode(evt) {
        evt.preventDefault();
        var nodeName = $(evt.target).attr('name').trim();
        delete this.scenarioNodes[nodeName]
        this.render();
        this.validateScenario();
    }

    function toggleParam(evt) {
        var checkBoxEl = $(evt.target);
        var nodeName = $(checkBoxEl.parent()).attr("node").trim();
        var paramName = $(checkBoxEl.parent()).attr("name").trim();
        var isOverride = checkBoxEl.is(":checked");
        this.scenarioNodes[nodeName].param[paramName].override = isOverride;
        var valueEl = $("#scenario_param_value", checkBoxEl.parent());
        if (isOverride) {
            valueEl.attr('disabled', false);
        } else {
            valueEl.attr('disabled', true);
        }
    }

    function getNodesParameters() {
        var nodesParams = [];
        $(".node_params_list").each(function(idx, paramList) {
            var nodeName = $(paramList).attr('name').trim();
            var paramString = "";
            var nodeParams = [];
            var params = $("li", paramList);
            params.each(function(idx, param) {
                var paramName = $(param).attr('name').trim();
                var override = $("#scenario_param_checkbox", param).is(":checked");
                var paramValue = $("#scenario_param_value", param).val();
                if (override) {
                    paramString += paramName + ":=" + paramValue + " ";
                    nodeParams.push({ name: paramName, value: paramValue });
                }
            });
            nodesParams.push({ node: nodeName, param: paramString.trim() });
        });
        return nodesParams;
    }

    function saveScenario() {

        var requestParams = {
            scenarioName: this.scenarioName,
            nodes: Object.keys(this.scenarioNodes),
            launchparams: this.getNodesParameters()
        }

        var saveScenarioService = new serviceManager();
        var serviceName = '/euclid/create_scenario';

        if (this.isEdit) {
            serviceName = 'euclid/edit_scenario';
            requestParams.scenarioName = $("input[name='oldName']").val();
            requestParams.newScenarioName = this.scenarioName;
        }
        console.log(requestParams)
        var self = this;
        saveScenarioService.setupService(serviceName, 'configuration_node/CreateScenario');
        saveScenarioService.setupRequest(requestParams);
        saveScenarioService.callService(function(res) {
            if (res.res == false) {
                return false;
            }
            self.close();
            App.Views.scenariosView.updateScenarioStatus(this.scenarioName, 'off');
            App.Views.scenariosView.buildScenarios();
        });
    }

    function validateScenario() {
        var currentValue = String($("#scenario_name").val());
        this.scenarioName = currentValue;
        var allowedRegex = /^[\w-]+$/;
        var isValid = allowedRegex.test(currentValue);
        if (!isValid) {
            $("#scenario_name").parent().addClass('has-error');
            $("#scenario_name_msg").html("Name must be an alpha-numeric string");
        } else {
            $("#scenario_name").parent().removeClass('has-error');
            $("#scenario_name_msg").empty();
        }

        $('#btn_createNew').prop('disabled', !isValid);
    }

    function createNewScenario() {
        $('#btn_createNew').prop('disabled', true);
        var self = this;
        this.isEdit = false;
        this.loadNodes().done(function() {
            self.scenarioName = "";
            self.scenarioNodes = {};
            self.render();
        });
    }

    function editScenario(scenarioName) {
        var self = this;
        this.isEdit = true;
        $('#btn_createNew').prop('disabled', true);
        this.loadNodes().done(function() {
            var loadScenariosService = new serviceManager();
            loadScenariosService.setupService('/euclid/get_scenarios', this.serviceType);
            loadScenariosService.callService(function(result) {
                $.each(result.scenarios, function(key, scenario) {
                    if (scenario.name == scenarioName) {
                        self.scenario = scenario
                        self.scenarioName = scenarioName;
                        self.scenarioNodes = {};
                        $.each(scenario.nodes, function(idx, node) {
                            var params = $.extend({}, self.nodes[node].param);
                            self.scenarioNodes[node] = { name: node, param: params };
                        });
                        $.each(scenario.launchparams, function(idx, nodeParam) {
                            $.each(self.parseNodeParameters(nodeParam.param), function(idx, param) {
                                self.scenarioNodes[nodeParam.node].param[param.name].value = param.value;
                                self.scenarioNodes[nodeParam.node].param[param.name].override = true;
                            });
                            console.log(self.scenarioNodes);
                        });
                    }
                });
                self.render();
                $('#btn_createNew').prop('disabled', false);
            });
        });
    }

    function loadNodes() {
        var self = this;
        var d = $.Deferred();
        var getNodesDetails = new serviceManager();
        getNodesDetails.setupService('/euclid/get_nodes_details', 'configuration_node/GetNodesDetails');
        getNodesDetails.callService(function(nodesDetails) {
            self.nodes = {};
            $.each(nodesDetails.nodes, function(idx, detail) {
                self.nodes[detail.nodeName] = { name: detail.nodeName, param: self.parseNodeParameters(detail.launchParams) }
            });
            console.log(self.nodes);
            d.resolve();
        });
        return d.promise();
    }

    function parseNodeParameters(param) {
        if (param != "") {
            var params_dict = {}
            var params = param.split(' ');
            if (params.length > 0) {
                params.forEach(function(param) {
                    var pstr = param.split(':=')
                    params_dict[pstr[0]] = { name: pstr[0], value: pstr[1], override: false };
                });
            }
            return params_dict;
        }
        return undefined;
    }

    return newScenarioView;
});