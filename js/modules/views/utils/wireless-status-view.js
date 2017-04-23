define(['jquery',
    'underscore',
    'backbone',
    'bootbox',
    'globalSettings',
    'modules/views/widgets/wifiWidget',

    'text!/templates/utils/wireless-status-template.html'
], function ($, _, Backbone, bootbox, GlobalSettings, WifiWidget, wirelessStatusTemplate) {
    var wirelessStatusView = Backbone.View.extend({
        template: _.template(wirelessStatusTemplate),
        wifi_listener: null,
        usb_listener: null,
        hardware_listener: null,
        el: $("#body"),
        events: {
            'click button.refreshNetworks': 'refreshNetworks',
            'click button.scan': 'scan',
            'click button.startHotspot': 'startHotspot',
            'click a.connectPassword': 'connectPassword',
            'click a.connect': 'connect'
        },
        initialize: function () {
            var self = this;
        },
        register: function () {

        },
        refreshNetworks: function () {
            var service = new ROSLIB.Service({
                ros: ros,
                name: '/euclid/network/get_saved_networks',
                serviceType: 'network_manager/CsGetSavedNetworks'
            });
            avail_networks = document.getElementById("saved_networks")

            while (avail_networks.firstChild) {
                avail_networks.removeChild(avail_networks.firstChild);
            }
            var request = new ROSLIB.ServiceRequest({


            });
            service.callService(request, function (result) {
                this.eventAggregator.trigger("loading:on", { key: 'wirelessrefreshNetworks', msg: "Refreshing networks..." });
                networks = result.networks;
                avail_networks = document.getElementById("saved_networks")

                for (var i = 0; i < networks.length; i++) {
                    var newWifiItem = document.createElement("li");
                    var linknewWifiItem = document.createElement("a");

                    var att = document.createAttribute("href"); // Create a "class" attribute
                    att.value = "#"
                    linknewWifiItem.setAttributeNode(att)

                    var classatt = document.createAttribute("class"); // Create a "class" attribute
                    classatt.value = "connect"
                    linknewWifiItem.setAttributeNode(classatt)

                    var newWifiItemValue = document.createTextNode(networks[i]);
                    linknewWifiItem.appendChild(newWifiItemValue);

                    newWifiItem.appendChild(linknewWifiItem);
                    avail_networks.appendChild(newWifiItem);
                }
                this.eventAggregator.trigger("loading:off", { key: 'wirelessrefreshNetworks' });
            }, function (fail) {
                this.eventAggregator.trigger("loading:off", { key: 'wirelessrefreshNetworks' });
            });
        },
        startHotspot: function () {
            var service = new ROSLIB.Service({
                ros: ros,
                name: '/euclid/network/start_hotspot',
                serviceType: 'network_manager/CsStartHotspot'
            });

            bootbox.confirm('Are you sure you want to start the Hotspot?', function (result) {
                if (!result) return;
                var request = new ROSLIB.ServiceRequest({});
                service.callService(request, function (result) { });
                window.location.replace("http://" + GlobalSettings.system_ip);
            });
        },
        connectPassword: function (ctx) {
            ctx.preventDefault();
            var ssid = ctx.target.innerText;
            bootbox.confirm('Are you sure you want to connect "' + ssid + '" network?', function (result) {
                if (!result) return;

                var networkPassword = prompt("Please enter '" + ssid + "' password (keep blank if none)", "");
                var service = new ROSLIB.Service({
                    ros: ros,
                    name: '/euclid/network/connect',
                    serviceType: 'network_manager/CsConnectToNetwork'
                });

                var request = new ROSLIB.ServiceRequest({
                    ssid: ssid,
                    password: networkPassword
                });
                service.callService(request, function (result) {
                    this.eventAggregator.trigger("loading:on", { key: 'wirelessrefreshNetworks', msg: "Euclid is going to connect to " + ssid, desc: 'Connect to Euclid using the new IP. Please refer to user guide for more details.' });
                });
            });
        },
        connect: function (ctx) {
            ctx.preventDefault();
            var ssid = ctx.target.innerText;
            bootbox.confirm('Are you sure you want to connect "' + ssid + '" network?', function (result) {
                if (!result) return;


                var service = new ROSLIB.Service({
                    ros: ros,
                    name: '/euclid/network/connect_to_saved_network',
                    serviceType: 'network_manager/CsConnectToSavedNetwork'
                });

                var request = new ROSLIB.ServiceRequest({
                    ssid: ssid
                });
                service.callService(request, function (result) {
                    this.eventAggregator.trigger("loading:on", { key: 'wirelessrefreshNetworks', msg: "Euclid is going to connect to the selected network.", desc: 'Connect to Euclid using the new IP. Please refer to user guide for more details.' });
                });
            });

        },
        _getList: function () {
            var service = new ROSLIB.Service({
                ros: ros,
                name: '/euclid/network/list',
                serviceType: 'network_manager/CsNetworksList'
            });
            avail_networks = document.getElementById("available_networks")

            while (avail_networks.firstChild) {
                avail_networks.removeChild(avail_networks.firstChild);
            }
            var request = new ROSLIB.ServiceRequest({


            });
            service.callService(request, function (result) {
                this.eventAggregator.trigger("loading:on", { key: 'wirelessrefreshNetworks', msg: "Refreshing networks..." });
                networks = result.networks;
                var lastUpdate = result.lastUpdateTime;
                avail_networks = document.getElementById("available_networks")

                var updateItem = document.createTextNode("Last Update: " + lastUpdate + "");

                avail_networks.parentNode.appendChild(updateItem);
                for (var i = 0; i < networks.length; i++) {
                    var newWifiItem = document.createElement("li");
                    var linknewWifiItem = document.createElement("a");

                    var att = document.createAttribute("href"); // Create a "class" attribute
                    att.value = "#"
                    linknewWifiItem.setAttributeNode(att)

                    var classatt = document.createAttribute("class"); // Create a "class" attribute
                    classatt.value = "connectPassword"
                    linknewWifiItem.setAttributeNode(classatt)

                    var newWifiItemValue = document.createTextNode(networks[i]);
                    linknewWifiItem.appendChild(newWifiItemValue);

                    newWifiItem.appendChild(linknewWifiItem);
                    avail_networks.appendChild(newWifiItem);
                }


                this.eventAggregator.trigger("loading:off", { key: 'wirelessrefreshNetworks' });
            }, function (fail) {
                this.eventAggregator.trigger("loading:off", { key: 'wirelessrefreshNetworks' });
            });
        },
        scan: function () {
            var self = this;
            bootbox.confirm('WiFi Scan will disconnect the device, this action might taken upto 60 seconds, do you wish to continue??', function (result) {
                if (!result) return;

                self.eventAggregator.trigger("loading:on", { key: 'wirelessrefreshNetworks', msg: "Scanning networks...", desc: "The application will disconnect, reconnect after 60 seconds" });

                var request = new ROSLIB.ServiceRequest({

                });
                var service = new ROSLIB.Service({
                    ros: ros,
                    name: '/euclid/network/scan',
                    serviceType: 'network_manager/CsScanNetworks'
                });

                service.callService(request, function (result) {
                    
                 });
            });

        },
        render: function () {
            this.$el.empty();
            this.unbind();
            this.$el.html(this.template());
            this.wifiWidget = new WifiWidget();
            this.refreshNetworks();
            this._getList();
            return this;
        }
    });

    App.Views.wirelessStatusView = new wirelessStatusView();
});
