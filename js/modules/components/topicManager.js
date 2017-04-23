define(['jquery',
    'underscore',
    'backbone',
    'globalSettings',
    'bootbox',
], function($, _, Backbone, GlobalSettings, bootbox, GaugeManager) {

    var TopicManager = function() {

        console.log("topic initialized");
        this.listener = '';
        this.topicName = '';
        this.messageType = '';

        this.setupTopic = function(name, type) {
            return new ROSLIB.Topic({
                ros: ros,
                name: name,
                messageType: type
            });
        }

        this.subscribe = function(topic, callback) {
            topic.subscribe(function(message) {
                callback(message);
            });
        };

        this.unsubscribe = function(topic) {
            topic.unsubscribe();
        }

    };
    App.TopicManager = new TopicManager();
});