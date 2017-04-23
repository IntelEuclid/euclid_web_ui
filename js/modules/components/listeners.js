var listeners = {
    wifi: {
        ros: ros,
        name: '/wifi_status',
        messageType: 'system_monitor/WifiStatus'
    },
    usb: {
        ros: ros,
        name: '/usb_status',
        messageType: 'system_monitor/USBStatus'
    },
    hardware: {
        ros: ros,
        name: '/hardware_status',
        messageType: 'system_monitor/HardwareStatus'
    },
    cpu: {
        ros: ros,
        name: '/cpu_info',
        messageType: 'system_monitor/CpuStatus'
    }

}