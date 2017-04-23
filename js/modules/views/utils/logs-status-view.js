define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'text!/templates/utils/logs-status-template.html',
], function($, _, Backbone, GlobalSettings, logsStatusTemplate) {
    var logsStatusView = Backbone.View.extend({
        el: $("#body"),
        template: _.template(logsStatusTemplate),
        events: {
            'click button.clearLog': 'clearLog',
        },
        initialize: function() {

        },
        register: function() {
            var self = this;
            logs_listener = new ROSLIB.Topic({
                ros: ros,
                name: '/rosout',
                messageType: 'rosgraph_msgs/Log'
            });

            logs_listener.subscribe(function(message) {
                logsContainer = $("#logslist");
                var newNodeItem = '<font color="red">[' + self.timeConverter() + ']</font> - <font color="green">' + message.name + '</font> ' + message.msg + '<br/>'
                logsContainer.append(newNodeItem);
            });

        },
        loadLogs: function() {
            var self = this;
            var defer = $.Deferred();
            $.get('/logs', function(response) {
                var logFiles = response.split(',');
                self.logFiles = [];
                var defs = [];
                $.each(logFiles, function(idx, file) {
                    var d = $.Deferred();
                    defs.push(d);
                    $.get('/logs/' + file, function(fileContent) {
                        self.logFiles.push({ name: file.replace('.log', ''), content: fileContent });
                        d.resolve();
                    });
                });

                $.when.apply($, defs).done(function() {
                    defer.resolve();
                });
            });
            return defer.promise();
        },
        clearLog: function(ctx) {
            logsContainer.empty();
        },
        timeConverter: function(UNIX_timestamp) {
            var a = new Date();
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();
            var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
            return time;
        },
        render: function() {
            this.$el.empty();
            this.unbind();
            var self = this;

            this.loadLogs().done(function() {
                console.log("this");
                self.$el.html(self.template({ logFiles: self.logFiles }));
            });
            this.register();
            return this;
        }
    });

    return new logsStatusView();
});