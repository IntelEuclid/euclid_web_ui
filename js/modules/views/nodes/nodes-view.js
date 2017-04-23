define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootbox',
    'TopicManager',
    'applicationServices',
    'serviceManager',
    'modules/views/nodes/new-node-view',
    'text!/templates/nodes/nodes-form-template.html'
], function($, _, Backbone, GlobalSettings, bootbox, topicManager, applicationServices, serviceManager, newNodeView, nodesForm) {

    var nodesView = Backbone.View.extend({
        el: "#body",
        template: _.template(nodesForm),
        nodes: {},

        initialize: function() {},
        events: {
            'click #btn_delete_node': 'deleteNode',
            'click #btn_edit_node': 'editNode',
            'click #btn_add_node': 'addNode'
        },

        addNode: function() {
            var view = new newNodeView();
            view.createNode();
        },

        editNode: function(ctx) {
            ctx.preventDefault();
            var btn = $(ctx.currentTarget);
            var selectedNode = String(btn.data("key"));
            var view = new newNodeView();
            view.editNode(this.nodes[selectedNode]);
        },

        deleteNode: function(ctx) {
            var nodesView = this;
            ctx.preventDefault();
            var btn = $(ctx.currentTarget);
            var selectedNode = String(btn.data("key"));
            bootbox.confirm('Are you sure you want to remove ' + selectedNode + ' - this can\'t be undone?', function(result) {
                if (!result) return;

                var deleteNodeService = new serviceManager();
                deleteNodeService.setupService('/euclid/delete_node', 'configuration_node/DeleteNode');

                deleteNodeService.setupRequest({ nodeName: selectedNode });

                deleteNodeService.callService(function(response) {
                    if (response.ret < 0) {
                        if (response.ret == -2) {
                            bootbox.alert('Node is used in Scenario, please delete the scenario first', function(result) {});
                            console.log("Node is used in Scenario, please delete the scenario first");
                        } else {
                            bootbox.alert('That is strange.. Node not found. Try to restart the OOBE from the top navigation bar', function(result) {});
                            console.log("Node not found");
                        }
                        return false;
                    }
                    App.Views.nodesView.loadNodes();
                    return true;
                });
            });

        },

        loadNodes: function() {
            var nodesView = this;
            nodesView.nodes = {};
            var getNodesDetails = new serviceManager();
            getNodesDetails.setupService('/euclid/get_nodes_details', 'configuration_node/GetNodesDetails');

            getNodesDetails.callService(function(nodesDetails) {
                $.each(nodesDetails.nodes, function(idx, detail) {
                    nodesView.nodes[detail.nodeName] = { name: detail.nodeName, value: 'false', param: undefined, launchFileName: detail.launchFileName, packageName: detail.packageName, runningNodeList: detail.runningNodeList, paramsText: detail.launchParams };
                    nodesView.nodes[detail.nodeName].param = nodesView.parseNodeParameters(detail.launchParams);
                });
                nodesView.render(nodesView.nodes);
                console.log(nodesView.nodes);
            });
            nodesView.render(nodesView.nodes);

        },
        parseNodeParameters: function(param) {
            if (param != "") {
                var params_lst = []
                var params = param.split(' ');
                if (params.length > 0) {
                    params.forEach(function(param) {
                        var pstr = param.split(':=')
                        params_lst.push({ name: pstr[0], value: pstr[1] });
                    });
                }
                return params_lst;
            }
            return undefined;
        },


        render: function() {
            this.$el.html(this.template({ nodes: this.nodes }));
            console.log("closing modal");
            $("#edit_node_modal").modal('hide');
        }
    });

    App.Views.nodesView = new nodesView();
});