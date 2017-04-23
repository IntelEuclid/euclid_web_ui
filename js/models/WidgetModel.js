define(['jquery',
	'underscore',
	'backbone',
	'globalSettings',
], function ($, _, Backbone, GlobalSettings) {
	var Widget = Backbone.Model.extend({
		defaults: {
			type: "Gauge",
			defaultValues: {},
			path: "",
		},


		promptColor: function () {
			var cssColor = prompt("Please enter a CSS color:");
			this.set({ color: cssColor });
		}
	});
	return new Widget();
});