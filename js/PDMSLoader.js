function PDMSLoader() {

    let scope = this;

    let PDMSGroup = new THREE.Group();

    // ==================================================颜色数组表区域==================================================
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

    // ==================================================新建几何函数区域==================================================

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
    THREE.SnoutGeometry = function SnoutGeometry(radius_bottom, radius_top, height, x_offset, z_offset) {
        x_offset = x_offset || 0;
        z_offset = z_offset || 0;

        THREE.CylinderGeometry.call(this, radius_top, radius_bottom, height, 32);

        this.type = 'SnoutGeometry';

        const vertices = this.vertices;
        const length = vertices.length;

        // 全部向上偏移高度
        for (let i = 0; i < length; i++) {
            const vector = vertices[i];
            vector.y += height;
        };

        // 获取顶部点
        const top_vertices = vertices.slice(0, length / 2 - 1);
        top_vertices.push(vertices[length - 2]);

        // 顶部圆环顶点偏移
        for (let i = 0; i < top_vertices.length; i++) {
            const vector = top_vertices[i];
            vector.x += x_offset;
            vector.z += z_offset;
        }
    };

    THREE.SnoutGeometry.prototype = Object.create(THREE.CylinderGeometry.prototype);
    THREE.SnoutGeometry.prototype.constructor = THREE.SnoutGeometry;

    // ==================================================PDMS文件解析区域================================================== 

    // ===================================MVR文件解析模块=================================== 

    /** load函数
     * @param {*} mvrUrl 
     * @param {*} attUrl 【可选】路径  example : "js/rvm_att/project.ATT" 
     */
    scope.load = function (mvrUrl, attUrl, onLoad, onProgress, onError) {
        if (!mvrUrl || mvrUrl == "") {
            onError('没有检测到mvrUrl路径');
            return;
        };

        onError = onError || function (errorInfo) { console.error(errorInfo) };

        // rvm信息异步加载
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: mvrUrl,
            xhr: function () { //进度
                let xhr = new window.XMLHttpRequest();
                xhr.addEventListener("progress", onProgress, false);
                return xhr;
            },
            success: function (data) { //成功
                forEachRVMData(data);
                analysisATT(attUrl, onProgress, onLoad, onError);
                if (onLoad) onLoad({ dataType: "group", data: PDMSGroup });
            },
            error: function (xhr, ajaxOptions, thrownError) { //失败
                onError(xhr.responseText);
                onError(thrownError);
            }
        });
    };

    // ===================================ATT文件解析模块=================================== 

    /** 解析ATT文件
     * @param {*} attUrl att文件路径
     * @param {*} onProgress 加载回调
     * @param {*} onSuccess 成功回调
     * @param {*} onError 失败回调
     */
    function analysisATT(attUrl, onProgress, onSuccess, onError) {

        if (!attUrl || attUrl == "") return;

        let loader = new THREE.FileLoader();
        loader.setResponseType('text');

        loader.load(attUrl, function (text) {
            let arr = text.split("NEW");

            // 总json表
            let json = {};

            //记录 起源数据 的Name
            let origin = arr[3].replace(/\s*/g, "").split("Name:=")[0];

            // 遍历每个New 的对象
            for (let i = 3, len = arr.length; i < len; i++) {

                let arr1 = arr[i].replace(/\n/g, "↵").replace(/\s*/g, "").replace(/END↵/g, "").split("↵"); //获得每个New 的对象

                // 创建当前记录数据信息json
                let json1 = { children: [] };

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

            if (onSuccess) onSuccess(data);
            console.log(data);
        });
    };

    // 遍历RVM数据
    function forEachRVMData(data) {
        for (let i = 0, len = data.length; i < len; i++) {

            let element = data[i];//当前元素

            let PRIMSNum = element.PRIMS.length;//prims 数量

            if (PRIMSNum == 0) continue;//没有几何信息的跳过

            if (element.C > 50) element.C = 0;

            for (let j = 0; j < PRIMSNum; j++) {

                abc(element.PRIMS[j], colorArray[element.C]);

            };

        };
    };

    function abc(PRIM, color) {
        let geo = getGeometryByGeotype(PRIM.TYPE, PRIM.KEYS);
        if (geo) {
            let mlt = new THREE.MeshLambertMaterial({ color: color, wireframe: false });
            let mesh = new THREE.Mesh(geo, mlt);
            let mtx = PRIM.Direction;//12位矩阵

            let Matrix4 = new THREE.Matrix4();
            Matrix4.elements = [
                mtx[0], mtx[1], mtx[2], 0,
                mtx[3], mtx[4], mtx[5], 0,
                mtx[6], mtx[7], mtx[8], 0,
                mtx[9], mtx[11], -mtx[10], 1]// Y Z轴颠倒
            // 0.001, 0, 0, 0,
            // 0, 0.001, 0, 0,
            // 0, 0, 0, 0.001,
            // mtx[9], mtx[11],mtx[10], 1];// Y Z轴颠倒
            // let P = new THREE.Vector3()				
            let Q = new THREE.Quaternion();
            // let S = new THREE.Vector3();				
            Matrix4.decompose(mesh.position, Q, mesh.scale)
            mesh.rotation.setFromQuaternion(Q, 'XYZ')

            let record = mesh.rotation.z
            mesh.rotation.z = mesh.rotation.y
            mesh.rotation.y = record
            // console.log(P,Q,S)

            // mesh.applyMatrix(Matrix4);
            PDMSGroup.add(mesh);

        };

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
                geo = new THREE.SnoutGeometry(arr[0], arr[1], arr[2], arr[3], arr[4]);
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


};


