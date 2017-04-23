define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'TopicManager',
    'text!/templates/nodes/nodes-status-template.html',
    'text!/templates/nodes/single-node-status-template.html'
], function ($, _, Backbone, GlobalSettings, topicManager, nodesStatusTemplate, singleNodeTemplate) {

    var singleNodeStatusView = Backbone.View.extend({
        template: _.template(singleNodeTemplate),
        initialize: function () { },
        render: function (nodeParams) {
            this.el = this.template(nodeParams);
            return this;
        }
    });
    var nodesStatusView = Backbone.View.extend({
        el: $("#body"),
        template: _.template(nodesStatusTemplate),
        initialize: function () {

        },
        subscribeToTopic: function (topicName, topicType, targetElementId) {
            var topic = App.runningTopics[topicName];
            if (!topic) {
                topic = App.TopicManager.setupTopic(topicName, topicType);
                App.runningTopics[topicName] = topic;
            }
            topic.subscribe(function (message) {
                var nodesContainer = $(targetElementId);
                nodesContainer.empty();
                packages = message.packages;
                $.each(packages, function (idx, package) {
                    var singleView = new singleNodeStatusView();
                    var statusViewParameters = { packageName: package.packageName, nodes: package.nodes };
                    singleView.render(statusViewParameters);
                    nodesContainer.append(singleView.el);
                });
            });
        },

        register: function () {
            var self = this;
            var systemTopicName = '/nodes_status';
            var systemTopicType = 'configuration_node/NodesStatus';
            this.subscribeToTopic(systemTopicName, systemTopicType, "#system-nodes-list");
            var scenarioTopicName = '/euclid/scenario_status';
            var scenarioTopicType = 'configuration_node/NodesStatus';
            this.subscribeToTopic(scenarioTopicName, scenarioTopicType, "#scenario-nodes-list");
        },

        render: function () {
            this.$el.empty();
            this.unbind();
            this.$el.html(this.template());
            this.register();
            return this;
        }
    });
    return new nodesStatusView();
});
