var services = {
    getParam: {
        ros: ros,
        name: '/euclid/get_params',
        serviceType: 'configuration_node/GetParams'
    },
    setParam: {
        ros: ros,
        name: '/euclid/set_param',
        serviceType: 'configuration_node/SetParam'
    }

}