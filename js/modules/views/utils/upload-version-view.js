define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'applicationServices',
    'serviceManager',
    'text!/templates/utils/upload-update-template.html',
], function($, _, Backbone, GlobalSettings, applicationServices, serviceManager, uploadTemplate) {

    var UpdloadVersionView = Backbone.View.extend({
        el: "#body",
        template: _.template(uploadTemplate),
        events: {
            "click #updateSystem": "updateSystem",
            "change :file": "validateFile"
        },

        render: function() {
            this.$el.html(this.template());
            $('#uploadUpdateForm').ajaxForm(function(res) {
                $("#uploadUpdateForm")[0].reset();
                console.log(res);
                App.applicationServices.toastMessage("success", "Upload System File", "File uploaded successfuly");
                $("#uploadResponse").show();

            });
            return this
        },

        validateFile: function(evt) {
            console.log($(evt.currentTarget).val());
            if ($(evt.currentTarget).val().endsWith("update.tar.gz")) {
                $("#upload_btn").show();
            } else {
                $("#upload_btn").hide();
                App.applicationServices.toastMessage("error", "file upload", "file must be 'update.tar.gz'");
            }
        },

        updateSystem: function() {
            var service = new serviceManager('/euclid/update_version', '');
            service.setupService('/euclid/update_version', '');
            service.callService(function(response) {
                console.log(response);
            })
        }
    });
    App.Views.uploadVersionView = new UpdloadVersionView();
});