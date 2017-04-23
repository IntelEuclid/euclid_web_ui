define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootstrapToggle',
    'configView',
    'text!/templates/monitor/monitor-item-template.html',
], function ($, _, Backbone, GlobalSettings, bootstrapToggle, configView, monitorListItemTemplate) {

    var monitorListItemView = Backbone.View.extend({
        tagName: "li",
        template: _.template(monitorListItemTemplate),
        events: {
            'click': 'monitorSelected',
            'click .btn': 'clickedOnButton'
        },
        clickedOnToggle: false,

        initialize: function (elementId) {
        },

        render: function (item) {
            var data = { item: item };
            this.el.innerHTML = this.template(data);
            return this;
        },

        monitorSelected: function (evt) {
            console.log("clicked on div");
            var divId = (evt.currentTarget.id);
            var monitorId = divId.split("-")[0];

            var currentState = $("." + monitorId + "-check").prop("checked");
            setTimeout(function () {
                $("." + monitorId + "-check").prop("checked", !currentState).change();
            }, 500);

            App.Views.monitorView.toggleMonitorItem(evt);
        },

        clickedOnButton: function (evt) {
            this.clickedOnToggle = true;
            console.log("clicked on button");
        }
    });
    return monitorListItemView;
});
