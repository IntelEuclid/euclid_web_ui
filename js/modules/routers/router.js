define(['jquery',
    'underscore',
    'backbone',

    'views/navbar/notification-bar-view',
    'views/navbar/navbar-view',

    'views/nodes/nodes-status-view',
    'views/nodes/nodes-view',

    'views/scenarios/scenarios-view',

    'views/monitor/monitor-view',

    'views/config/config-page-view',

    'views/utils/system-status-view',
    'views/utils/wireless-status-view',
    'views/utils/logs-status-view',
    'views/utils/utils-arduino-view',
    'views/utils/help-view',
    'views/utils/license-view',
    'views/utils/upload-version-view',
], function($, _, Backbone, notificationBarView, navbarView, nodesStatusView, nodesView, scenariosView,
    monitorView, configPageView, systemStatusView, wirelessStatusView, logsStatusView, utilsArduinoView, helpView, licenseView, uploadVersionView) {
    var router = Backbone.Router.extend({
        routes: {
            "*actions": "loadView"
        },
        navBarView: null,
        initialize: function() {
            this.on('route:loadView', function(actions) {});
            App.currentView = undefined;
        },
        cleanUp: function(view) {
            if ($("#header-navbar").length == 0)
                App.Views.navbarView.render();
            App.Views.navbarView.closeNavBarMenu();
            if (App.currentView != undefined && App.currentView == "system/status" && view != App.currentView) {
                systemStatusView.close();
            }
        },
        loadView: function(view) {
            this.cleanUp();
            App.currentView = view;
            switch (view) {
                case "system/nodes":
                    nodesStatusView.render();
                    break;
                case "system/status":
                    systemStatusView.render();
                    break;
                case "system/wireless":
                    App.Views.wirelessStatusView.render();
                    break;
                case "system/logs":
                    logsStatusView.render();
                    break;
                case "apps":
                    App.Views.monitorView.render();
                    break;
                case "config/scenarios":
                    App.Views.scenariosView.render();
                    break;
                case "config/nodes-configuration":
                    App.Views.configPageView.render();
                    break;
                case "utils/arduino":
                    App.Views.utilsArudionView.render();
                    break;
                case "main/reboot":
                    App.Views.navbarView.rebootSystem();
                    window.history.back();
                    break;
                case "main/shutdown":
                    App.Views.navbarView.shutdown();
                    window.history.back();
                    break;
                case "main/help":
                    App.Views.helpView.render();
                    break;
                case "main/license":
                    App.Views.licenseView.render();
                    break;
                case "main/restartOOBE":
                    App.Views.navbarView.restartOOBE();
                    window.history.back();
                    break;
                case "system/new-node":
                    App.Views.newNodeView.render();
                    break;
                case "system/upload-update":
                    App.Views.uploadVersionView.render();
                    break;
                case "system/nodes-view":
                    App.Views.nodesView.loadNodes();
                    break;
                default:
                    App.Views.scenariosView.render(); //mainView.render();
            }
            App.applicationServices.loadRunningScenario();
        },

        releaseTopics: function() {
            $.each(App.runningTopics, function(idx, topic) {
                console.log(topic);
                topic.unsubscribe();
            })
        },

        startHistory: function() {
            Backbone.history.start();
        },
    });
    return router;
});