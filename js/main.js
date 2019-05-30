
let container;

let camera, scene, renderer, splineCamera, cameraHelper, cameraEye;

let binormal = new THREE.Vector3();
let normal = new THREE.Vector3();

let pipeSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 10, - 10), new THREE.Vector3(10, 0, - 10),
    new THREE.Vector3(20, 0, 0), new THREE.Vector3(30, 0, 10),
    new THREE.Vector3(30, 0, 20), new THREE.Vector3(20, 0, 30),
    new THREE.Vector3(10, 0, 30), new THREE.Vector3(0, 0, 30),
    new THREE.Vector3(- 10, 10, 30), new THREE.Vector3(- 10, 20, 30),
    new THREE.Vector3(0, 30, 30), new THREE.Vector3(10, 30, 30),
    new THREE.Vector3(20, 30, 15), new THREE.Vector3(10, 30, 10),
    new THREE.Vector3(0, 30, 10), new THREE.Vector3(- 10, 20, 10),
    new THREE.Vector3(- 10, 10, 10), new THREE.Vector3(0, 0, 10),
    new THREE.Vector3(10, - 10, 10), new THREE.Vector3(20, - 15, 10),
    new THREE.Vector3(30, - 15, 10), new THREE.Vector3(40, - 15, 10),
    new THREE.Vector3(50, - 15, 10), new THREE.Vector3(60, 0, 10),
    new THREE.Vector3(70, 0, 0), new THREE.Vector3(80, 0, 0),
    new THREE.Vector3(90, 0, 0), new THREE.Vector3(100, 0, 0)
]);

let sampleClosedSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, - 40, - 40),
    new THREE.Vector3(0, 40, - 40),
    new THREE.Vector3(0, 140, - 40),
    new THREE.Vector3(0, 40, 40),
    new THREE.Vector3(0, - 40, 40)
]);

sampleClosedSpline.curveType = 'catmullrom';
sampleClosedSpline.closed = true;

// Keep a dictionary of Curve instances
let splines = {
    GrannyKnot: new THREE.Curves.GrannyKnot(),
    HeartCurve: new THREE.Curves.HeartCurve(3.5),
    VivianiCurve: new THREE.Curves.VivianiCurve(70),
    KnotCurve: new THREE.Curves.KnotCurve(),
    HelixCurve: new THREE.Curves.HelixCurve(),
    TrefoilKnot: new THREE.Curves.TrefoilKnot(),
    TorusKnot: new THREE.Curves.TorusKnot(20),
    CinquefoilKnot: new THREE.Curves.CinquefoilKnot(20),
    TrefoilPolynomialKnot: new THREE.Curves.TrefoilPolynomialKnot(14),
    FigureEightPolynomialKnot: new THREE.Curves.FigureEightPolynomialKnot(),
    DecoratedTorusKnot4a: new THREE.Curves.DecoratedTorusKnot4a(),
    DecoratedTorusKnot4b: new THREE.Curves.DecoratedTorusKnot4b(),
    DecoratedTorusKnot5a: new THREE.Curves.DecoratedTorusKnot5a(),
    DecoratedTorusKnot5c: new THREE.Curves.DecoratedTorusKnot5c(),
    PipeSpline: pipeSpline,
    SampleClosedSpline: sampleClosedSpline
};

let parent, tubeGeometry, mesh;

let params = {
    spline: 'GrannyKnot',
    scale: 4,
    extrusionSegments: 100,
    radiusSegments: 3,
    closed: true,
    animationView: false,
    lookAhead: false,
    cameraHelper: false,
};

let material = new THREE.MeshLambertMaterial({ color: 0xff00ff });

let wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.3, wireframe: true, transparent: true });

function addTube() {

    if (mesh !== undefined) {

        parent.remove(mesh);
        mesh.geometry.dispose();

    }

    let extrudePath = splines[params.spline];

    tubeGeometry = new THREE.TubeBufferGeometry(extrudePath, params.extrusionSegments, 2, params.radiusSegments, params.closed);

    addGeometry(tubeGeometry);

    setScale();

}

function setScale() {

    mesh.scale.set(params.scale, params.scale, params.scale);

}


function addGeometry(geometry) {

    // 3D shape

    mesh = new THREE.Mesh(geometry, material);
    let wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    mesh.add(wireframe);

    parent.add(mesh);

}

function animateCamera() {

    cameraHelper.visible = params.cameraHelper;
    cameraEye.visible = params.cameraHelper;

}

init();
animate();

function init() {

    container = document.getElementById('container');

    // camera

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.set(0, 50, 500);

    // scene

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // light

    let light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1);
    scene.add(light);

    // tube

    parent = new THREE.Object3D();
    scene.add(parent);

    splineCamera = new THREE.PerspectiveCamera(84, window.innerWidth / window.innerHeight, 0.01, 1000);
    parent.add(splineCamera);

    cameraHelper = new THREE.CameraHelper(splineCamera);
    scene.add(cameraHelper);

    addTube();

    // debug camera

    cameraEye = new THREE.Mesh(new THREE.SphereBufferGeometry(5), new THREE.MeshBasicMaterial({ color: 0xdddddd }));
    parent.add(cameraEye);

    cameraHelper.visible = params.cameraHelper;
    cameraEye.visible = params.cameraHelper;

    // renderer

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // dat.GUI

    let gui = new dat.GUI({ width: 300 });

    let folderGeometry = gui.addFolder('Geometry');
    folderGeometry.add(params, 'spline', Object.keys(splines)).onChange(function () {

        addTube();

    });
    folderGeometry.add(params, 'scale', 2, 10).step(2).onChange(function () {

        setScale();

    });
    folderGeometry.open();

    let folderCamera = gui.addFolder('Parameter');
    folderCamera.add(params, 'extrusionSegments', 50, 500).step(50).onChange(function () {

        addTube();

    });
    folderCamera.add(params, 'animationView').onChange(function () {

        animateCamera();

    });
    folderCamera.add(params, 'lookAhead').onChange(function () {

        animateCamera();

    });
    folderCamera.add(params, 'cameraHelper').onChange(function () {

        animateCamera();

    });
    folderCamera.open();

    let controls = new THREE.OrbitControls(camera, renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

};

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

};

function animate() {

    requestAnimationFrame(animate);

    render();
};

function render() {

    // animate camera along spline

    let time = Date.now();
    let looptime = 20 * 1000;
    let t = (time % looptime) / looptime;

    let pos = tubeGeometry.parameters.path.getPointAt(t);
    pos.multiplyScalar(params.scale);

    // interpolation

    let segments = tubeGeometry.tangents.length;
    let pickt = t * segments;
    let pick = Math.floor(pickt);
    let pickNext = (pick + 1) % segments;

    binormal.subVectors(tubeGeometry.binormals[pickNext], tubeGeometry.binormals[pick]);
    binormal.multiplyScalar(pickt - pick).add(tubeGeometry.binormals[pick]);

    let dir = tubeGeometry.parameters.path.getTangentAt(t);
    let offset = 15;

    normal.copy(binormal).cross(dir);

    // we move on a offset on its binormal

    pos.add(normal.clone().multiplyScalar(offset));

    splineCamera.position.copy(pos);
    cameraEye.position.copy(pos);

    // using arclength for stablization in look ahead

    let lookAt = tubeGeometry.parameters.path.getPointAt((t + 30 / tubeGeometry.parameters.path.getLength()) % 1).multiplyScalar(params.scale);

    // camera orientation 2 - up orientation via normal

    if (!params.lookAhead) lookAt.copy(pos).add(dir);
    splineCamera.matrix.lookAt(splineCamera.position, lookAt, normal);
    splineCamera.rotation.setFromRotationMatrix(splineCamera.matrix, splineCamera.rotation.order);

    cameraHelper.update();

    renderer.render(scene, params.animationView === true ? splineCamera : camera);

};
