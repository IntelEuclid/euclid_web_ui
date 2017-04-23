define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'TopicManager',
], function($, _, Backbone, GlobalSettings, topicManager) {

    var notificationView = Backbone.View.extend({
        el: null,
        stack: [],
        isLoading: false,
        currentTask: null,
        events: {

        },
        initialize: function() {
            console.log("Notification bar view loaded");

            this.registerEventListeners();
            setInterval(function() {
                if (App.connectionTimer++ >= 30) {
                    $("#connection-lost-div").show();
                }
            }, 1000);
        },
        _guidGenerator: function() {
            var S4 = function() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        },
        registerEventListeners: function() {
            var hardwareTopicName = '/hardware_status';
            var hardwareTopicType = 'system_monitor/HardwareStatus';

            var aggregator = this.eventAggregator;
            hardwareTopic = App.runningTopics[hardwareTopicName];
            if (!hardwareTopic) {
                hardwareTopic = App.TopicManager.setupTopic(hardwareTopicName, hardwareTopicType);
                App.runningTopics[hardwareTopicName] = hardwareTopic;
            }
            hardwareTopic.subscribe(function(message) {
                aggregator.trigger("battary:changed", message.battery, message.batteryStatus);
                aggregator.trigger("connection:confirmed")
            });

            aggregator.on("battary:changed", this.battaryChanged, this);
            aggregator.on("connection:confirmed", this.refreshConnectionTimer, this);
            aggregator.on("loading:on", this.startLoading, this);
            aggregator.on("loading:off", this.stopLoading, this);
        },
        startLoading: function(obj) {
            if (this.isLoading) {
                this.stack.push(obj);
                return;
            }

            $('.btn').attr('disabled', 'disabled');
            this.currentTask = obj;
            this.isLoading = true;
            $("#loader").show();
            $(".loader-text").text(obj.msg);
            $(".loader-desc").text(obj.desc);
        },
        checkPendingTasks: function() {
            if (this.stack.length === 0) {
                $('.btn').removeAttr('disabled');
                return;
            }
            var obj = this.stack.shift();

            this.startLoading(obj);
        },
        stopLoading: function(obj) {
            var self = this;
            if (self.currentTask != null && obj.key == self.currentTask.key) {
                self.currentTask = null;
                self.isLoading = false;
                $("#loader").hide();
                $("#loader.loader-text").text("Loading...");
                self.checkPendingTasks();
            } else {
                $.each(self.stack, function(i, s) {
                    if (s.key == obj.key) {
                        self.stack.splice(i, 1);
                        return;
                    }
                });
            }
        },
        battaryChanged: function(value, status) {
            // App.connectionTimer = 0;
            console.log(status, value);
            $("#battaryIndicator").removeClass("progress-bar-success");
            $("#battaryIndicator").removeClass("progress-bar-warning");
            $("#battaryIndicator").removeClass("progress-bar-danger");

            if (value < 20) {
                $("#battaryIndicator").addClass("progress-bar-danger");
            } else if (value < 50) {
                $("#battaryIndicator").addClass("progress-bar-warning");
            } else {
                $("#battaryIndicator").addClass("progress-bar-success");
            }

            $("#battaryIndicator").css("width", value + "%");
            $(".remainingBattery").text(value + "%");
            if (status.toLowerCase().trim() === "charging") {
                $(".progress-label .fa-bolt").removeClass("hidden");
            } else {
                $(".progress-label .fa-bolt").addClass("hidden");
            }
        },

        refreshConnectionTimer: function() {
            App.connectionTimer = 0;
        },


        render: function() {
            return this;
        }
    });
    $("#loader").hide()
    return new notificationView();
});