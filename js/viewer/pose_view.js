const ViewStatus = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2
};

let viewModel = {
    S: ViewStatus,
    status: ViewStatus.DISCONNECTED,
    fisheyeEnabled: false,
    pose: { x: 0, y: 0, z: 0 },
    tracking: -1,
    wsurl: ''
};

const TrackingStatus = [
    { code: 0, text: "fail" },
    { code: 1, text: "low" },
    { code: 2, text: "medium" },
    { code: 3, text: "high" },
    { code: 4, text: "reset" }
];

/* This Code will be later used to show occupancy map
	// 64 x 64 tiles >> 1 tile == 128 x 128 pixels >> 1 pixel == 0.05m x 0.05m (see slam->get)
	// == 409.6 x 409.6 meters
	const omap = new OccupancyMap(128, 128, 128);
	const orender = new OccupancyMapRenderer(omap, mapview.scene, 100);
*/

var ServiceManager = function(serviceName, serviceType) {
    this.service = '';
    this.serviceName = '';
    this.serviceType = '';
    this.serviceRequest = '';

    this.setupService = function(name, type) {
        this.serviceName = name;
        this.serviceType = type;
        this.service = new ROSLIB.Service({
            ros: ros,
            name: this.serviceName,
            serviceType: this.serviceType
        });
    };

    this.setupRequest = function(serviceJSON) {
        this.serviceRequest = new ROSLIB.ServiceRequest(serviceJSON);
    };

    this.callService = function(callback) {
        var running = false;
        if (!running) {
            running = true;
            serviceName = this.serviceName;
            this.service.callService(this.serviceRequest, function(response) {
                console.log(response);
                if (response.hasOwnProperty('res')) {
                    if (response.res == true) {
                        toastr.success(serviceName, "Operation successful");
                    } else {
                        toastr.error(serviceName, "Operation failure");
                    }
                }
                if (callback) {
                    callback(response);
                } else {
                    location.reload();
                }
            })
        }
    };

    if (serviceName && serviceType &&
        serviceName != '' && serviceType != '') {
        this.setupService(serviceName, serviceType);
    }
};


function resetAll() {
    poselist = [];
    drawPoses(poselist);
    console.log("reset");
    var reserService = new ServiceManager();
    reserService.setupService('/realsense/slam/reset', 'std_msgs/Empty');
    reserService.setupRequest({});
    reserService.callService(function(response) {});
};

let poselist = [];
var scale = 1
var listLimit = 9000
var limitThresh = listLimit / 10

ros.on('connection', function() {
    console.log("connected");
});

var listener = new ROSLIB.Topic({
    ros: ros,
    name: '/realsense/odom',
    messageType: 'nav_msgs/Odometry'
});
document.getElementById("sixdof_viewer_pose").innerHTML = "0, 0, 0"

function round2d(num) {
    return Math.round(num * 100) / 100;
}

listener.subscribe(function(message) {
    var pose = {
        pose: createPoseMatrix(message)
    }

    poselist.push(pose);
    //Limit the number of points to 10,000. when overflow keep latest 10,000
    document.getElementById("sixdof_viewer_pose").innerHTML = round2d(message.pose.pose.position.x) + ", " +
        round2d(message.pose.pose.position.y) + ", " + round2d(message.pose.pose.position.z)
    if (poselist.length > (listLimit + limitThresh)) {
        poselist = poselist.splice(poselist.length - listLimit);
        console.log("spliced");
    }
    drawPoses(poselist);
});

function createPoseMatrix(message) {
    //Convert nav_msgs/Odometry [Position,Orientation] into a 3x4 Translation/Rotation Matrix.

    var tx = -message.pose.pose.position.y * scale
    var ty = -message.pose.pose.position.z * scale
    var tz = message.pose.pose.position.x * scale

    var qx = -message.pose.pose.orientation.y
    var qy = -message.pose.pose.orientation.z
    var qz = message.pose.pose.orientation.x
    var qw = message.pose.pose.orientation.w

    //Convert orientation quaternion to rotation matrix
    var mat = [1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qz * qw), 2 * (qx * qz + qy * qw), tx,
        2 * (qx * qy + qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qz * qy - qx * qw), ty,
        2 * (qx * qz - qy * qw), 2 * (qy * qz + qx * qw), 1 - 2 * (qx * qx + qy * qy), tz
    ]

    return mat
}
