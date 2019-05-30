let container;//html容器

let camera, scene, renderer;//three 三组件

let controls;//控制器

let primitives;//几何集合

let material = new THREE.MeshPhongMaterial({ color: 0xff00ff });//统一材质

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
    light.position.set(1, 1, 1);
    scene.add(light);

    scene.add(new THREE.AmbientLight(0x404040));

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
    addSphericaldish();

    window.addEventListener('resize', onWindowResize, false);

};

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

};

// box 立方体
const addBox = (cfg) => {
    let geometry = new THREE.BoxGeometry(10, 10, 10);
    let cube = new THREE.Mesh(geometry, material);
    primitives.add(cube);
};

// cylinder 圆柱体
const addCylinder = (cfg) => {
    let geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
    let cylinder = new THREE.Mesh(geometry, material);
    primitives.add(cylinder);
};

// elliptical-dish 椭圆形盘
const addEllipticaldish = (cfg) => {
    let geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
    let cylinder = new THREE.Mesh(geometry, material);
    primitives.add(cylinder);
};

// spherical-dish 球形盘

const addSphericaldish = () => {
    // primitives.add(new THREE.Mesh(SphericaldishGeometry(76, 38), material));

    // primitives.add(new THREE.Mesh(SphericaldishGeometry(76, 30), material));
    let geo = new THREE.IcosahedronGeometry(38, 2);
    geo.computeVertexNormals();
    primitives.add(new THREE.Mesh(geo, material));
};

/**
 * @param {*} diameter 开口直径
 * @param {*} height 球冠高
 * @param {*} widthSegments 水平分段数 【默认32】
 * @param {*} heightSegments 垂直分段数 【默认16】
 */
const SphericaldishGeometry = (diameter, height, widthSegments = 32, heightSegments = 4) => {


    let r = diameter / 2; //开口半径

    let radius = Math.floor(((height * height) + (r * r)) / (2 * height)); //半径 

    let a = radius - height;

    let geometry = new THREE.Geometry();

    // dish 段
    geometry.merge(new THREE.SphereGeometry(radius, widthSegments, heightSegments, undefined, undefined, undefined, Math.atan(r / a)));

    // bottom plane
    let bottomPlane = new THREE.CircleGeometry(r, widthSegments);
    bottomPlane.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    bottomPlane.applyMatrix(new THREE.Matrix4().makeTranslation(0, a, 0));
    // geometry.merge(bottomPlane);

    return geometry;
};

init();
animate();