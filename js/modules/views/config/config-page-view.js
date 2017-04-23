define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootstrapToggle',
    'serviceManager',
    'configView',
    'modules/views/config/config-nodes-view',
    'text!/templates/config/config-page-template.html',
], function ($, _, Backbone, GlobalSettings, bootstrapToggle, serviceManager, configView, configNodesView, configPageTemplate) {

    var configPageView = Backbone.View.extend({
        el: $("#body"),
        template: _.template(configPageTemplate),
        events: {
            'click #save-config': 'updateConfiguraion',
            'click #reset-config': 'resetConfiguraion',
            'click #btn_save_configuration': 'saveConfiguration',
            'click #btn_refresh_configuration': 'refreshConfiguration'
        },
        register: function () { },
        showSaveResetButtons: function () {
            console.log("lading config view 2");
            console.log("save/reset button");
        },

        updateConfiguraion: function () {
            App.Views.configNodesView.saveValues();
        },
        saveConfiguration: function (evt) {
            evt.preventDefault();
            var saveConfigService = new serviceManager();
            saveConfigService.setupService('/euclid/save_configuration', 'configuration_node/SaveConfiguration');
            saveConfigService.callService(function () {
                $("#scenarioNotSavedIcon").hide();
            });
        },
        resetConfiguraion: function () {
            App.Views.configNodesView.resetValues();
        },
        refreshConfiguration: function () {
            if (App.Views.configView != undefined)
                App.Views.configView.loadNodesList();
        },
        render: function () {
            this.$el.empty();
            this.unbind();
            this.$el.html(this.template());
            $("body").addClass("body-fixed-height");
            App.Views.configView = new ConfigView();
            $(".view-toggle").bootstrapToggle();
            return this;
        }
    });
    App.Views.configPageView = new configPageView();
});