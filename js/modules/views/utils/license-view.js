define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'text!/templates/utils/license-template.html'
], function($, _, Backbone, GlobalSettings, licenseTemplate) {

    var LicenseView = Backbone.View.extend({
        template: _.template(licenseTemplate),
        el: $("#body"),
        events: {},
        initialize: function() {},
        render: function(template) {
            this.$el.empty();
            this.$el.html(this.template());
	$.get('licenses/Attribution.txt', function(response) {
            $("#attribution_text").html(response);
        });
        $.get('licenses/ReadMe.txt', function(response) {
            $("#readme_text").html(response);
        });
        $.get('licenses/License.txt', function(response) {
            $("#license_text").html(response);
        });
        $.get('licenses/Sdk-License.txt', function(response) {
            $("#sdk_text").html(response);
        });
        $.get('licenses/MotionHAL.txt', function(response) {
            $("#motion_text").html(response);
        });




	//$("#attribution_text").html("ddd");
	console.log("dd");
            return this;
        }
    });
    App.Views.licenseView = new LicenseView();
});


