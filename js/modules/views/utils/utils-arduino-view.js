define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'serviceManager',
    'text!/templates/utils/arduino-lib-template.html'
], function($, _, Backbone, GlobalSettings, serviceManager, arduinoLibTemplate) {
    var utilsArduinoView = Backbone.View.extend({
        template: _.template(arduinoLibTemplate),
        generateLibraryService: null,
        el: $("#body"),
        events: {
            'click button.generate_new_btn': 'generateLib',
            'click a.download_lib_btn': 'downloadLib',
        },
        downloadLib: function(e) {
            $("#hidden_iframe").attr("src", "files/cs_lib.zip");
        },
        generateLib: function() {
            this.eventAggregator.trigger("loading:on", { key: 'arduinolib', msg: "Generating library..." });
            generateLibraryService.callService(function(response) {
                $("#hidden_iframe").attr("src", "files/euclid_lib.zip");
                this.eventAggregator.trigger("loading:off", { key: 'arduinolib', msg: "Generating library..." });
            });

        },
        register: function() {
            generateLibraryService = new serviceManager();
            generateLibraryService.setupService('/euclid/generate_arduino_library', 'configuration_node/GenerateArduinoLibrary');
        },

        render: function() {
            this.$el.empty();
            this.unbind();
            this.$el.html(this.template());
            this.register();
            return this;
        }
    });

    App.Views.utilsArudionView = new utilsArduinoView();
});