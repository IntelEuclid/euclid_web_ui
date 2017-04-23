define(['jquery',
  'underscore',
  'backbone',
  'globalSettings',
  'bootstrapSlider',
  'bootbox',
  'modules/views/config/config-nodes-view',
  'text!/templates/config/config-view-template.html',
], function ($, _, Backbone, GlobalSettings, bootstrapSlider, bootbox, configNodesView, configTemplate) {

  ConfigView = Backbone.View.extend({
    el: "#nodesList",
    configMenu: [],
    template: _.template('<li class="nodeConfigSelector" data-name="<%-node%>" id="<%-node%>-selector"><a href="#"><%-node%></a></li>'),
    menuName: '',
    configurableNodesService: '',
    nodeList: [],
    events: {
      'click .nodeConfigSelector': 'loadConfigurationView',
      'click #btn_refresh_configuration' : 'loadNodesList'
    },

    loadConfigurationView: function (ctx) {
      console.log("loading config view");
      ctx.preventDefault();
      var trg = $(ctx.currentTarget);
      var nodeName = trg.data('name');
      App.Views.configNodesView = new ConfigNodesView();
      App.Views.configNodesView.register(nodeName);
    },

    initialize: function () {
      this.register();
      this.loadNodesList();
      _.bindAll(this, "render");
    },

    register: function () {
      this.configurableNodesService = new ROSLIB.Service({
        ros: ros,
        name: '/euclid/get_configurable_nodes',
        serviceType: 'configuration_node/GetConfigurableNodes'
      });
    },

    loadNodesList: function () {
      console.log("loading");
      configView = this;
      var request = new ROSLIB.ServiceRequest({});
      this.configurableNodesService.callService(request, function (result) {
        configView.nodeList = result.nodes;
        configView.render();
      });
    },

    render: function (menu) {
      self = this;
      this.$el.empty();
      $.each(this.nodeList, function (key, node) {
        self.$el.append(self.template({ node: node }));
      });
      return this;
    }
  });
})
