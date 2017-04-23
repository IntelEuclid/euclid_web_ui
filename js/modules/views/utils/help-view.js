define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'text!/templates/utils/help-template.html',

], function($, _, Backbone, GlobalSettings, helpTemplate) {

    var HelpView = Backbone.View.extend({
        template: _.template(helpTemplate),
        el: $("#body"),
        events: {},
        initialize: function() {},
        render: function(template) {
            this.$el.empty();
            this.$el.html(this.template());
            return this;
        }
    });
    App.Views.helpView = new HelpView();
});