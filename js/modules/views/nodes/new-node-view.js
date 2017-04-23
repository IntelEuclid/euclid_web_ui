define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootbox',
    'serviceManager',
    'toastr',
    'text!/templates/nodes/new-node/new-node-template.html',
    'text!/templates/nodes/new-node/step-1-template.html',
    'text!/templates/nodes/new-node/step-2-template.html',
    'text!/templates/nodes/new-node/step-3-template.html',

], function($, _, Backbone, GlobalSettings, bootbox, serviceManager, toastr, newNodeTemplate,
    step1Template, step2Template, step3Template) {

    var NewNodeView = Backbone.View.extend({
        template: _.template(newNodeTemplate),
        el: "#edit_node_modal_body",
        events: {
            'click #btn_edit_node_next': 'nextStep',
            'click #btn_edit_node_close': 'close',
            'click #btn_edit_node_select_manual_launchfile': 'toggleManualLaunchFile',
            'click #btn_edit_node_add_param': 'addParameter',
            'click .btn_remove_parameter': 'removeParameter',
            'keyup .alpha-numeric': 'validateTextChangedEvent'
        },
        data: {
            node: undefined,
            launchFiles: undefined,
            runningNodes: {},
            isManualLaunchFile: true,
        },
        step: 1,
        isEdit: false,
        valids: {},
        initialize: function() {},
        close: function() {
            $("#edit_node_modal").modal('hide');
            this.undelegateEvents();
            this.step = 1;
        },

        createNode: function() {
            this.step = 1;
            this.isEdit = false;
            this.data.node = {};
            this.render();
        },
        editNode: function(node) {
            this.step = 1;
            this.isEdit = true;
            this.data.node = node;
            this.data.runningNodes = {};
            this.render();
            this.validateTextBox($("#new_node_name"), true);
            this.validateTextBox($("#new_node_packagename"));
            $("#new_node_name").prop('disabled', 'true');
        },
        render: function() {
            this.$el.html(this.template());
            this.renderStepElement(this.step);
            $('#btn_edit_node_next').prop('disabled', false);
            if (this.isEdit) {
                $("#edit_node_modal_title").html("Edit Node");
                $("#edit_node_modal_subtitle").html(this.data.node.name + " - " + this.data.node.packageName);
            }
        },
        renderStepElement: function(step) {
            this.stepEl = $("#edit_node_step", this.$el);
            var templateHtml = undefined;
            switch (step) {
                case 1:
                    templateHtml = _.template(step1Template)(this.data);
                    break
                case 2:
                    templateHtml = _.template(step2Template)(this.data);
                    break;
                case 3:
                    templateHtml = _.template(step3Template)(this.data);
                    break;
            }
            this.stepEl.html(templateHtml);
        },

        nextStep: function(evt) {
            evt.preventDefault();
            $("#error-message-placeholder").empty();
            var status = false;
            console.log('step', this.step);
            this.eventAggregator.trigger("loading:on", { key: 'status-view', msg: "" });

            switch (this.step) {
                case 1:
                    promise = this.step1();
                    break;
                case 2:
                    promise = this.step2();
                    break;
                case 3:
                    promise = this.step3();
                    break;
            }
            var self = this;
            if (promise == false) {
                self.eventAggregator.trigger("loading:off", { key: 'status-view', msg: "" });
                return;
            }
            promise.done(function(status) {
                self.eventAggregator.trigger("loading:off", { key: 'status-view', msg: "" });
                self.step++;
                if (self.step == 4) {
                    return;
                }
                if (status == true)
                    self.renderStepElement(self.step);

            });
        },

        step1: function() {
            var self = this;
            var d = $.Deferred();

            var isValid = self.validateTextBox($("#new_node_name"), true);
            isValid = isValid & self.validateTextBox($("#new_node_packagename"));

            if (!isValid) {
                toastr.error("Package and Node name should be alpha-numeric");
                return false;
            }
            var nodeName = $("#new_node_name").val();
            var packageName = $("#new_node_packagename").val();

            var service = new serviceManager('euclid/find_launch_files', 'configuration_node/FindLaunchFiles');
            service.setupRequest({ packageName: packageName });
            service.callService(function(result) {
                if (result.launchFileList.length == 0) {
                    $("#error-message-placeholder").html("The package you specified doesn't exist or has no launch files in the launch folder. Please make sure that the launch files are in the launch folder. Press F5 to refresh and try again")
                    d.resolve(false);
                }
                self.data.node.oldName = self.data.node.name;
                self.data.node.name = nodeName;
                self.data.node.packageName = packageName;
                if (self.isEdit == false) {
                    self.data.node.launchFileName = undefined;
                }
                self.data.launchFiles = result.launchFileList;
                console.log(self.data.node.name)
                $("#edit_node_modal_subtitle").html(self.data.node.packageName + " / " + self.data.node.name);

                self.data.isManualLaunchFile = true;
                $.each(self.data.launchFiles, function(idx, launchFile) {
                    if (self.data.node.launchFileName == undefined || launchFile == self.data.node.launchFileName) {
                        self.data.isManualLaunchFile = false;
                        return;
                    }
                });

                d.resolve(true)
            });

            return d.promise();
        },

        step2: function() {
            var self = this;
            var d = $.Deferred();
            var launchFileName = undefined;

            if (this.data.isManualLaunchFile) {
                launchFileName = $("#txt_edit_node_manual_launchfile").val().trim();
                if (launchFileName == "") {
                    $("#error-message-placeholder").html("Please enter a valid launch file name");
                    return false;
                }
            } else {
                var launchFiles = $("#select_edit_node_launchfiles").find(":selected");
                if (launchFiles.length == 0) {
                    $("#error-message-placeholder").html("Please select a launch file from the list");
                    return false;
                }
                launchFileName = launchFiles.text().trim();
            }
            var pathService = new serviceManager('euclid/get_launch_file_path', 'configuration_node/GetLaunchFilePath');
            pathService.setupRequest({ packageName: self.data.node.packageName, launchFileName: launchFileName });
            pathService.callService(function(result) {
                var nodesService = new serviceManager('euclid/find_running_nodes', 'configuration_node/FindRunningNodes');
                nodesService.setupRequest({ launchFilePath: result.launchFilePath });
                nodesService.callService(function(result) {
                    $.each(result.runningNodeList, function(idx, node) {
                        self.data.runningNodes[node] = { name: node, value: false }
                    });
                    $.each(self.data.node.runningNodeList, function(idx, node) {
                        self.data.runningNodes[node].value = true;
                    });

                    self.data.node.launchFileName = launchFileName;
                    $("#btn_edit_node_next").text('Save');
                    d.resolve(true);
                });
            });
            return d.promise();
        },

        step3: function() {
            var launchParams = this.getParameters();

            var selectedNodes = this.getSelectedNodes();

            console.log('selectedNodes', selectedNodes, launchParams);
            if (selectedNodes.length == 0) {
                $("#error-message-placeholder").html("No nodes selected. Please select at least one node");
                return false;
            }

            var service = new serviceManager('euclid/register_new_node', 'configuration_node/RegisterNewNode');
            if (this.isEdit)
                service = new serviceManager('euclid/edit_node', 'configuration_node/EditNode');
            var self = this;

            var requestDict = {
                nodeName: self.data.node.name,
                packageName: self.data.node.packageName,
                runningNodeList: selectedNodes,
                launchFileName: self.data.node.launchFileName,
                launchParams: launchParams.paramsString
            };

            service.setupRequest(requestDict);
            console.log(requestDict);
            var d = $.Deferred();
            service.callService(function(result) {
                console.log(result);
                if (result.res) {
                    toastr.success("Node updated successfuly.");
                    toastr.info("Reload Nodes page to update changes")
                    self.close();
                    d.resolve(true);
                } else {
                    toastr.error("Unable to update Node");
                    d.resolve(false);
                }
            });
            return d.promise();
        },

        toggleManualLaunchFile: function() {
            this.data.isManualLaunchFile = !this.data.isManualLaunchFile;
            $("#select_edit_node_launchfiles").attr("disabled", this.data.isManualLaunchFile);
        },
        getSelectedNodes: function() {
            var nodes = [];
            var elements = $("#checkbox_edit_node:checked");
            elements.each(function(idx, el) {
                nodes.push($(el).attr('name'));
            });
            return nodes;
        },
        getParameters: function() {
            var params = { params: [], paramsString: "" };
            $(".edit_node_parameter").each(function(idx, el) {
                var paramKey = $(el).attr('name');
                var paramValue = $('input', el).val();
                params.params.push({ name: paramKey, value: paramValue });
                params.paramsString += (paramKey + ":=" + paramValue + " ");
                console.log(paramKey, paramValue);
            });
            params.paramsString = params.paramsString.trim();
            return params;
        },
        removeParameter: function(evt) {
            var paramEl = $(evt.currentTarget).parent();
            var paramName = paramEl.attr('name');
            paramEl.remove();
        },
        addParameter: function() {
            var paramsList = $("#list_edit_node_params");
            var paramKey = $("#txt_edit_node_param_key").val().trim();
            var paramValue = $("#txt_edit_node_param_value").val().trim();

            var allowedRegex = /^[\w-]+$/;

            if (paramKey == "" || paramValue == "" || allowedRegex.test(paramKey) == false) {
                toastr.error("Illegal parameter name of value");
                return;
            }

            $("#txt_edit_node_param_key").val('');
            $("#txt_edit_node_param_value").val('');
            paramsList.append('<li name="' + paramKey + '" class="list-group-item edit_node_parameter">' + paramKey +
                '<input style="position:absolute;right:100px;height:20px;" type="text" value="' + paramValue + '"/>' +
                '<button type="button" style="position:absolute;right:10px;height:18px;" class="btn btn-default btn-xs btn_remove_parameter">' +
                '<span class="glyphicon glyphicon-remove"></span>' +
                '</button></li>');
        },
        validateTextBox: function(el, allowSpaces = false) {
            var allowedRegex = /^[\w-]+$/;
            if (allowSpaces) {
                allowedRegex = /^[\w- ]+$/;
            }
            var isValid = allowedRegex.test(el.val());

            this.valids[el.attr('id')] = isValid;

            if (!isValid) {
                el.parent().addClass('has-error');
                el.next().html("Text must be in alpha-numeric format");
            } else {
                el.parent().removeClass('has-error');
                el.next().empty();
            }

            $("#btn_edit_node_next").attr('disabled', false);

            $.each(this.valids, function(idx, value) {
                if (value == false) {
                    $("#btn_edit_node_next").attr('disabled', true);
                }
            });

            return isValid;
        },

        validateTextChangedEvent: function(evt) {
            //this.validateTextBox($(evt.currentTarget));
        }

    });
    return NewNodeView;
});