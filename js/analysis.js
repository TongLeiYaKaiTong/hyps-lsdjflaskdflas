
/** 几何添加测试
 * @param {*} geo 任意几何体
 */
function testAddGeo(geo) {
    let mlt = new THREE.MeshLambertMaterial({ color: 0x0f0f0 });
    let mesh = new THREE.Mesh(geo, mlt);
    primitives.add(mesh);
    console.log(primitives);
};


/** 盘状几何
 * @param {*} cover 是否有遮盖
 * @param {*} radius 开口半径
 * @param {*} height 球冠高
 * @param {*} widthSegments 水平分段数 【默认32】
 * @param {*} heightSegments 垂直分段数 【默认16】
 */
function DishGeometry(cover, radius, height, widthSegments, heightSegments) {

    widthSegments = widthSegments || 32;
    heightSegments = heightSegments || 4;

    let r = Math.floor(((height * height) + (radius * radius)) / (2 * height)); //半径 

    let a = Math.abs(r - height);//半径和球冠高的差

    let geometry = new THREE.Geometry();

    // dish 段
    // geometry.merge(new THREE.SphereGeometry(r, widthSegments, heightSegments, undefined, undefined, undefined, Math.atan(radius / a)));
    let sphere = new THREE.SphereGeometry(r, widthSegments, heightSegments, undefined, undefined, 0, Math.atan(radius / a));
    sphere.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI));
    sphere.applyMatrix(new THREE.Matrix4().makeTranslation(0, a, 0));
    geometry.merge(sphere);

    // 有遮盖
    if (cover) {
        // bottom plane
        let bottomPlane = new THREE.CircleGeometry(radius, widthSegments);
        bottomPlane.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        geometry.merge(bottomPlane);
    };

    return geometry;
};

/**
 * snot
 */
// THREE.SnoutGeometry = class SnoutGeometry extends THREE.CylinderGeometry {
//     constructor(radius_bottom, radius_top, height, x_offset = 0, z_offset = 0) {
//         super(radius_top, radius_bottom, height, 32);

//         this.type = 'SnoutGeometry';

//         const vertices = this.vertices;
//         const length = vertices.length;

//         // 全部向上偏移高度
//         for (let i = 0; i < length; i++) {
//             const vector = vertices[i];
//             vector.y += height;
//         };

//         // 获取顶部点
//         const top_vertices = vertices.slice(0, length / 2 - 1);
//         top_vertices.push(vertices[length - 2]);

//         // 顶部圆环顶点偏移
//         for (const vector of top_vertices) {
//             vector.x += x_offset;
//             vector.z += z_offset;
//         };
//     };
// };

/** ATT文件解析数据函数
 * @param {*} url 路径 【example : "js/rvm_att/project.ATT"】
 */

function ATTLoader(url) {

    let loader = new THREE.FileLoader();
    loader.setResponseType('text');

    loader.load(url, function (text) {
        let arr = text.split("NEW");

        // 总json表
        let json = {};

        //记录 起源数据 的Name
        let origin = arr[3].replace(/\s*/g, "").split("Name:=")[0];

        // 遍历每个New 的对象
        for (let i = 3, len = arr.length; i < len; i++) {

            let arr1 = arr[i].replace(/\n/g, "↵").replace(/\s*/g, "").replace(/END↵/g, "").split("↵"); //获得每个New 的对象

            // 创建当前记录数据信息json
            let json1 = {
                children: []
            };

            // 遍历每个对象中的属性
            for (let j = 1, l = arr1.length - 1; j < l; j++) {

                let arr2 = arr1[j].split(":=");//分割字符串为数组
                if (j == 1 && arr2[0] == "Name") json[arr2[1]] = json1;//存在Name属性的 创建到json表中
                if (j == 4 && arr2[0] == "Owner" && json[arr2[1]]) json[arr2[1]].children.push(json1);//存在Owner属性的 添加到json表对应父级Name的children中
                json1[arr2[0]] = arr2[1];//这个属性

            };
        };

        let data = json[origin];//获取总的关系
        json = undefined;//清空josn数据

        console.log(data);
    });

};

// 颜色数组表
const colorArray = [
    new THREE.Color('#F0F0F0'),
    new THREE.Color('#BEBEBE'),
    new THREE.Color('#FF0000'),
    new THREE.Color('#FFA500'),
    new THREE.Color('#FFFF00'),
    new THREE.Color('#00FF00'),
    new THREE.Color('#00FFFF'),
    new THREE.Color('#0000FF'),
    new THREE.Color('#EE82EE'),
    new THREE.Color('#A52A2A'),
    new THREE.Color('#FFFFFF'),
    new THREE.Color('#FFC0CB'),
    new THREE.Color('#7C509D'),
    new THREE.Color('#40E0D0'),
    new THREE.Color('#002E5A'),
    new THREE.Color('#000000'),
    new THREE.Color('#FF00FF'),
    new THREE.Color('#F5F5F5'),
    new THREE.Color('#FFFFF0'),
    new THREE.Color('#D3D3D3'),
    new THREE.Color('#A9A9A9'),
    new THREE.Color('#2F4F4F'),
    new THREE.Color('#AA0114'),
    new THREE.Color('#FF7F50'),
    new THREE.Color('#FF6347'),
    new THREE.Color('#DDA0DD'),
    new THREE.Color('#FF1493'),
    new THREE.Color('#FA8072'),
    new THREE.Color('#ec8a2a'),
    new THREE.Color('#FF4500'),
    new THREE.Color('#B03060'),
    new THREE.Color('#FFD700'),
    new THREE.Color('#FFFFE0'),
    new THREE.Color('#FAFAD2'),
    new THREE.Color('#9ACD32'),
    new THREE.Color('#00FF7F'),
    new THREE.Color('#228B22'),
    new THREE.Color('#006400'),
    new THREE.Color('#7FFFD4'),
    new THREE.Color('#4169E1'),
    new THREE.Color('#000080'),
    new THREE.Color('#B0E0E6'),
    new THREE.Color('#191970'),
    new THREE.Color('#4682B4'),
    new THREE.Color('#F5F5DC'),
    new THREE.Color('#F5DEB3'),
    new THREE.Color('#D2B48C'),
    new THREE.Color('#F4A460'),
    new THREE.Color('#F0E68C'),
    new THREE.Color('#D2691E'),
    new THREE.Color('#23210A'),
];


function addGeometries() {
    console.log(primitives);
    // console.log(rvmTree);
    // console.log(rvmGeometrys);
    let rvmData;
    console.log(rvmData);
    $.getJSON("./js/rvm_att/rvmData.js", function(res) {
        console.log('res', res);
        rvmData = res;

        for (let len = rvmData.length, i = 0; i < len; i++) {

            const element = rvmData[i];//当前元素
            // console.log(element);
    
            const PRIMSNum = element.PRIMS.length;//prims 数量
    
            // if (element.ID == 3) {
            //     let pos = element.POS;
            //     camera.position.set(pos[0] * 0.01, pos[2] * 0.01, pos[1] * 0.01);
            //     controls.update();
            // };
    
            if (PRIMSNum == 0) continue;//没有几何信息的跳过
    
            for (let j = 0; j < PRIMSNum; j++) {
                let PRIM = element.PRIMS[j];//几何信息
                let geo = getGeometryByGeotype(PRIM.TYPE, PRIM.KEYS);
                if (geo) {
                    // console.log(element);
                    // console.log(PRIM);
                    // console.log(element.C);
                    if (element.C > 50) element.C = 0;
                    let mlt = new THREE.MeshLambertMaterial({ color: colorArray[element.C] });
                    let mesh = new THREE.Mesh(geo, mlt);
                    let mtx = PRIM.Direction;//12位矩阵
    
                    let Matrix4 = new THREE.Matrix4();
                    Matrix4.elements = [
                        mtx[0], mtx[1], mtx[2], 0,
                        mtx[3], mtx[4], mtx[5], 0,
                        mtx[6], mtx[7], mtx[8], 0,
                        mtx[9], mtx[11], mtx[10], 1];
    
                    // if (element.ID == 7) {
                    //     Matrix4.elements = [
                    //         mtx[0], mtx[1], mtx[2], 0,
                    //         mtx[3], mtx[4], mtx[5], 0,
                    //         mtx[6], mtx[7], mtx[8], 0,
                    //         mtx[10], mtx[9], mtx[11], 1];
                    // };
                    mesh.applyMatrix(Matrix4);
                    primitives.add(mesh);
    
                };
            };
    
        };
    });




};

function getGeometryByGeotype(type, arr) {

    let geo;//几何

    // if (type != 7) return geo;

    switch (type) {
        case 1:   //PYRAMID 
            break;
        case 2:   //Box
            geo = new THREE.BoxGeometry(arr[0], arr[2], arr[1]);
            break;
        case 3:   //RectangularTorus
            break;
        case 4:   //CTORUS
            break;
        case 5:   //EllipticalDish Dish有遮挡
            geo = DishGeometry(true, arr[0], arr[1], 8);
            break;
        case 6:   //SphericalDish Dish无遮挡  
            geo = DishGeometry(false, arr[0], arr[1], 8);
            break;
        case 7:   //Snout
            // geo = new THREE.SnoutGeometry(arr[0], arr[1], arr[2], arr[3], arr[4]);
            break;
        case 8:  //CYLINDER 
            geo = new THREE.CylinderBufferGeometry(arr[0], arr[0], arr[1], 8);
            break;
        case 9:  //Sphere
            geo = new THREE.SphereGeometry(arr[0], 8, 8);
            break;
        case 10:  //Line 
            break;
        case 11:  //FaceGroup   
            break;
    };

    // if (!geo) console.error("不存在几何类型");

    return geo;
};

//=============================测试场景==========================================

let container;//html容器

let scene, renderer, camera;//three 三组件

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
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    // light
    let light1 = new THREE.DirectionalLight(0xffffff, 0.5);
    light1.position.set(1, 1, 1);
    let light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-1, 1, 1);
    scene.add(light1, light2);
    scene.add(new THREE.AmbientLight(0x404040));
    // camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000000);
    camera.position.set(0, 50, 80);
    // controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // Object3D
    primitives = new THREE.Object3D();
    scene.add(primitives);
    animate();
    // 添加几何体
    addGeometries();
    // testAddGeo(DishGeometry(false,180, 100));
    window.addEventListener('resize', onWindowResize, false);
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

init();
// animate();
