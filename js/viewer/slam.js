/// <reference path="../../typings/index.d.ts" />

const DEG2RAD = THREE.Math.DEG2RAD;

class MapViewer {

    init(canvas) {
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(30, canvas.width / canvas.height, 0.1, 1000);
        camera.position.z = 1;
        camera.position.y = 4;
        camera.position.x = 0;


        var controls = new THREE.TrackballControls(camera, canvas);
        controls.rotateSpeed = 1;
        controls.zoomSpeed = 1;
        controls.panSpeed = 0.5;

        //controls.noZoom = true;
        controls.noPan = false;

        controls.staticMoving = true;
        //controls.dynamicDampingFactor = 0.9;
        //controls.keys = [65, 83, 68];

        const GRID_SIZE = 30; // in meters
        var grid2 = new THREE.GridHelper(GRID_SIZE, GRID_SIZE * 20, 0xaa44aa, 0xB8ABA3);
        grid2.material.transparent = true;
        grid2.material.opacity = 0.1;
        //grid2.rotateX(DEG2RAD * 90);
        //grid2.translateZ(-0.97);
        scene.add(grid2);

        var grid = new THREE.GridHelper(GRID_SIZE, GRID_SIZE * 2, 0x000835, 0x006081);
        grid.material.transparent = true;
        grid.material.opacity = 0.6;
        //grid.rotateX(DEG2RAD * 90);
        //grid.translateZ(-0.96);
        scene.add(grid);

        let axis = new THREE.AxisHelper(5);
        axis.translateY(0);
        axis.geometry.scale(1, -1, -1);
        scene.add(axis);
        // var boxg = new THREE.BoxGeometry(1,1,1);
        // var box = new THREE.Mesh(boxg, new THREE.MeshNormalMaterial());
        // box.translateX(0.5);
        // box.translateZ(0.5);

        // // box.position.x = 1;
        // // box.position.z = 1;
        // scene.add(box);

        var renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        renderer.setSize(canvas.width, canvas.height);
        renderer.setPixelRatio(window.devicePixelRatio);

        this.scene = scene;
        this.camera = camera;
        this._renderer = renderer;
        this.controls = controls;

        this.render();
    }


    render() {
        this.controls.update();
        requestAnimationFrame(() => this.render());
        this._renderer.render(this.scene, this.camera);
    }
}

function getTranslation(pose) {
    return [pose[3], pose[7], pose[11]];
}


class PoseTrajectory {

}


var mapview = new MapViewer();
mapview.init(document.querySelector('canvas'));

var trajectory;
var line_verts;

function make_line() {
    var g = new THREE.BufferGeometry();
    line_verts = new Float32Array(9000 * 3);
    var pos = new THREE.BufferAttribute(line_verts, 3);
    pos.dynamic = true;
    g.addAttribute('position', pos);
    var material = new THREE.LineBasicMaterial({ linewidth: 2, color: 0xff3388 });
    var line = new THREE.Line(g, material);
    //line.scale.set(100,100,100);
    mapview.scene.add(line);
    line.visible = false;
    trajectory = line;
}

var virtualCam;

function make_head() {
    const cam = new THREE.PerspectiveCamera(55, 4.0 / 3.0, 0.1, 0.3);

    const camHelper = new THREE.CameraHelper(cam);
    camHelper.geometry.scale(1, -1, -1);
    // camHelper.geometry.rotateY(180 * DEG2RAD);
    // var geometry = new THREE.CylinderGeometry( 0.0, 1.0, 1, 4, 1 , true, 45 * DEG2RAD);
    // var material = new THREE.MeshBasicMaterial( { color: 0xff00ff, wireframe: true } );
    // cube = new THREE.Mesh( geometry, material );
    // cube.visible = false;

    mapview.scene.add(camHelper);
    virtualCam = cam;
}
make_head();
make_line();



function drawPoses(poses) {
    var g = trajectory.geometry;

    var i = 0;

    poses.forEach(p => {
        var t = getTranslation(p.pose);
        line_verts[i++] = t[0];
        line_verts[i++] = -t[1];
        line_verts[i++] = -t[2];
    });
    // make pose matrix square
    var p = [];
    if (poses.length > 0) {
        p = p.concat(poses[poses.length - 1].pose);
        p = p.concat(0, 0, 0, 1);
    }
    var worldMat = new THREE.Matrix4();

    let fixHandMat = new THREE.Matrix4();
    fixHandMat.makeScale(1, -1, -1);
    worldMat.set.apply(worldMat, p);
    worldMat.premultiply(fixHandMat);

    // worldMat.scale(new THREE.Vector3(1,-1,-1));

    virtualCam.matrixWorld.copy(worldMat);
    virtualCam.matrixWorld.needsUpdate = true;

    // g.verticesNeedUpdate = true;
    g.attributes.position.needsUpdate = true;
    g.setDrawRange(0, poses.length - 1);

    trajectory.visible = true;

    // var bounding = g.computeBoundingBox();
    // mapview.render();
}