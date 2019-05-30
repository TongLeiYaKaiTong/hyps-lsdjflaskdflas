let container;//html容器

let camera, scene, renderer;//three 三组件

let controls;//控制器

let primitives;//几何集合

let material = new THREE.MeshLambertMaterial({ color: 0xff00ff });//统一材质

function render() {

    renderer.render(scene, camera);

};

function animate() {

    requestAnimationFrame(animate);

    render();
};

function init() {

    container = document.getElementById('container');

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // light
    let light = new THREE.DirectionalLight(0xffffff);
    light.position.set(-1, 1, 1);
    scene.add(light);

    // camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.set(0, 50, 500);

    // controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Object3D
    primitives = new THREE.Object3D();
    scene.add(primitives);

    // 添加几何体
    // addBox();
    // addCylinder();
    addEllipticaldish();

    window.addEventListener('resize', onWindowResize, false);

};

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

};

// box 立方体
const addBox = (cfg) => {
    let geometry = new THREE.BoxGeometry( 10, 10, 10 );
    let cube = new THREE.Mesh( geometry, material );
    primitives.add( cube );
};

// cylinder 圆柱体
const addCylinder = (cfg) => {
    let geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );
    let cylinder = new THREE.Mesh( geometry, material );
    primitives.add( cylinder );
};

// elliptical-dish 椭圆形盘
const addEllipticaldish = (cfg) => {
    let geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );
    let cylinder = new THREE.Mesh( geometry, material );
    primitives.add( cylinder );
};

// spherical-dish 球形盘
const addSphericaldish = (cfg) => {
    let geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );
    let cylinder = new THREE.Mesh( geometry, material );
    primitives.add( cylinder );
};

init();
animate();