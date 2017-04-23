define(['jquery',
	'underscore',
	'backbone',
	'globalSettings',
	'bootstrapToggle',
	'configView',
	'text!/templates/monitor/monitor-screen-template.html',
], function ($, _, Backbone, GlobalSettings, bootstrapToggle, configView, monitorScreenTemplate) {

	var monitorScreenView = Backbone.View.extend({
		template: _.template(monitorScreenTemplate),
		initialize: function () { },
		render: function (params) {
			this.el.innerHTML = this.template(params);
			return this;
		}
	});
    return monitorScreenView;
});
