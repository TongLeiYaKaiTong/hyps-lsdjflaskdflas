var temp_test;
function PDMSLoader() {

    let scope = this;

    let PDMSGroup = new THREE.Group();
        PDMSGroup.name = "PDMSGroup";

    let geometries = [];

    let geoCount = 0;//几何计数

    let geoIdArray = []; //几何id数组
    let geoCountArray = [];//几何点索引数组

    let maxX, maxY, maxZ, minX, minY, minZ;

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

        widthSegments = widthSegments || 16;
        heightSegments = heightSegments || 4;

        let r = Math.floor(((height * height) + (radius * radius)) / (2 * height)); //半径 

        let a = Math.abs(r - height);//半径和球冠高的差

        let geometry = new THREE.Geometry();

        // dish 段
        // geometry.merge(new THREE.SphereGeometry(r, widthSegments, heightSegments, undefined, undefined, undefined, Math.atan(radius / a)));
        let sphere = new THREE.SphereGeometry(r, widthSegments, heightSegments, undefined, undefined, 0, Math.atan(radius / a));
        // sphere.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));
        sphere.applyMatrix(new THREE.Matrix4().makeTranslation(0, -a, 0));
        geometry.merge(sphere);

        // 有遮盖
        if (cover) {
            // bottom plane
            let bottomPlane = new THREE.CircleGeometry(radius, widthSegments);
            bottomPlane.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

            geometry.merge(bottomPlane);
        };

        return geometry;
    };

    /** Snout几何
     * @param {*} radius_bottom 顶部半径
     * @param {*} radius_top 底部半径
     * @param {*} height 高
     * @param {*} x_offset x偏移量
     * @param {*} z_offset z偏移量
     */
    THREE.SnoutGeometry = function SnoutGeometry(radius_bottom, radius_top, height, x_offset, z_offset) {
        x_offset = x_offset || 0;
        z_offset = z_offset || 0;

        THREE.CylinderGeometry.call(this, radius_top, radius_bottom, height, 32);

        this.type = 'SnoutGeometry';

        const vertices = this.vertices;
        const length = vertices.length;

        // 全部向上偏移高度
        // for (let i = 0; i < length; i++) {
        //     const vector = vertices[i];
        //     vector.y += height;
        // };

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

    /** 
     * @name SlopedCylinder几何
     * @param {*} radius 半径
     * @param {*} height 高
     * @param {*} top_x_shear 顶面长半径和 x 轴夹角
     * @param {*} top_y_shear 顶面长半径和 y 轴夹角
     * @param {*} bottom_x_shear 底面长半径和 x 轴夹角
     * @param {*} bottom_y_shear 底面长半径和 y 轴夹角
     */
    THREE.SlopedCylinderGeometry = function SlopedCylinderGeometry(radius, height, top_x_shear, top_y_shear, bottom_x_shear, bottom_y_shear) {
        top_x_shear = top_x_shear || 0;
        top_y_shear = top_y_shear || 0;
        bottom_x_shear = bottom_x_shear || 0;
        bottom_y_shear = bottom_y_shear || 0;

        THREE.CylinderGeometry.call(this, radius, radius, height, 32);

        this.type = 'SlopedCylinderGeometry';

        const vertices = this.vertices;
        const length = vertices.length;

        /**
         * @name 根据投影角度获取平面的法向量
         * @param {*} x_shear 在x轴上的投影角度
         * @param {*} y_shear 在y轴上的投影角度
         */
        function getNormalVector(x_shear, y_shear) {
            // A -- x  B -- y C -- z
            let A, B ,C
            if (x_shear == 0 && y_shear == 0) {
                A = C = 0;
                B = 1;
            } else if (x_shear == 0) {
                C = 0;
                A = Math.sin(y_shear) * Math.pow(Math.cos(y_shear), 2);
                B = -Math.cos(y_shear) * Math.pow(Math.sin(y_shear), 2);
            } else if (y_shear == 0) {
                A = 0;
                C = -Math.cos(x_shear) * Math.pow(Math.sin(x_shear), 2);
                B = -Math.sin(x_shear) * Math.pow(Math.cos(x_shear), 2);
            } else {
                // 计算实际角度
                const radian_a_true = Math.atan(Math.tan(y_shear) * Math.sqrt(1 + 1 / (Math.pow(Math.tan(x_shear), 2))));
                const radian_b_true = Math.atan(Math.tan(x_shear) * Math.sqrt(1 + 1 / (Math.pow(Math.tan(y_shear), 2))));

                // 计算轴线在底面投影的边长
                const side_a = Math.cos(radian_a_true);
                const side_b = Math.cos(radian_b_true);

                // 计算轴线在底面投影和坐标轴形成的角度
                const radian_a = Math.atan(side_b / side_a);
                // const radian_b = Math.atan(side_a / side_b);

                // 计算轴线在底边投影长度
                const side_c_pow = Math.pow(side_a, 2) + Math.pow(side_b, 2);
                const side_c = Math.sqrt(side_c_pow);

                // 计算轴线和底边的角度
                const radian_c = Math.atan(Math.sqrt(1 - side_c_pow) / side_c);

                // 计算法向量的B值
                B = -Math.pow(Math.cos(radian_c), 2) * Math.sin(radian_c);

                // 计算法向量在底边的投影长度
                const side_c_result = Math.cos(radian_c) * Math.pow(Math.sin(radian_c), 2);

                // 计算法向量的A、C值
                A = side_c_result * Math.cos(radian_a);
                C = -side_c_result * Math.sin(radian_a);
            }

            return {
                A: A,
                B: B,
                C: C
            }
        }

        /**
         * @name 根据法向量对点位进行剪切变换
         * @param {*} vertices 目标点位组
         * @param {*} center 中心点位
         * @param {*} normal 法向量
         */
        function applyShear(vertices, center, normal) {
            if (normal.B == 0) return
            // 点法式获取顶部平面方程
            // B(Y-y0) + A(X-x0) + C(z-z0) = 0
            for (let i = 0; i < vertices.length; i++) {
                const vector = vertices[i];
                vector.y = (normal.A * (center.x - vector.x) + normal.C * (center.z - vector.z)) / normal.B + center.y
            }
        }

        // 获取顶部点
        const top_vertices = vertices.slice(0, length / 2 - 1);
        const center_top = vertices[length - 2];
        top_vertices.push(center_top);

        const top_normal = getNormalVector(top_x_shear, top_y_shear);
        applyShear(top_vertices, center_top, top_normal);


        // 获取底部顶点
        const bottom_vertices = vertices.slice(length / 2 - 1, length - 2);
        const center_bottom = vertices[length - 1]
        bottom_vertices.push(center_bottom);

        const bottom_normal = getNormalVector(bottom_x_shear, bottom_y_shear);
        applyShear(bottom_vertices, center_bottom, bottom_normal);
    };
    THREE.SlopedCylinderGeometry.prototype = Object.create(THREE.CylinderGeometry.prototype);
    THREE.SlopedCylinderGeometry.prototype.constructor = THREE.SlopedCylinderGeometry;

    /** FaceGroup几何
     * @param {*} arr 定点组
     */
    function FaceGroupGeometry(arr) {
		// console.log(arr)
        let vertices_array = [];

        let geo = new THREE.BufferGeometry();
        var index = [];
        for (let i = 0, len = arr.length; i < len; i++) {
            let geometry_num = arr[i];
            let vs_nums = []
			i++;//偏移到后方v_num
			
			var current_sum =  0;//到每个循环的顶点的个数
			for(j=0;j<geometry_num;j++){ //运行geometry个数次
				vs_num = arr[i+current_sum*6+j];
				vs_nums.push(vs_num)
				current_sum+=vs_num
			}
			
			num = vs_nums[0]
			// console.log('geometry_num,num,num2',geometry_num,vs_nums)
            //先算当前大面的中点坐标
			
			// if(true){
				//计算中心点
				let x_sum = 0, y_sum = 0, z_sum = 0;
				for (let j = i + 1; j < i + 6 * num + 1; j += 6) {
					x_sum += arr[j];
					y_sum += arr[j + 2];
					z_sum += arr[j + 1];
				};
				x_sum /= num;
				y_sum /= num;
				z_sum /= num;

				// console.log('大面中点坐标',x_sum,y_sum,z_sum)
				for (let j = i + 1; j < i + 6 * (num - 1) + 1; j += 6) { //一循环一个三角片
					vertices_array.push(arr[j]);
					vertices_array.push(arr[j + 2]);
					vertices_array.push(-arr[j + 1]);

					vertices_array.push(arr[j + 6]);
					vertices_array.push(arr[j + 8]);
					vertices_array.push(-arr[j + 7]);

					//中点
					vertices_array.push(x_sum);
					vertices_array.push(y_sum);
					vertices_array.push(-z_sum);
				};
				//最后一个面
				vertices_array.push(arr[i + 6 * (num - 1) + 1]);
				vertices_array.push(arr[i + 6 * (num - 1) + 3]);
				vertices_array.push(-arr[i + 6 * (num - 1) + 2]);
				// console.log('最后三个数字是',arr[3*(num-1)+1],arr[3*(num-1)+3],arr[3*(num-1)+2])
				vertices_array.push(arr[i + 1]);
				vertices_array.push(arr[i + 3]);
				vertices_array.push(-arr[i + 2]);

				//中点
				vertices_array.push(x_sum);
				vertices_array.push(y_sum);
				vertices_array.push(-z_sum);

				// console.log('最前三个数字是',arr[i+1],arr[i+3],arr[i+2])

				//然后取刚push的几个点的中点计算一个
				// i += 6 * num; //偏移一个顶点
			// }else{  //geometry_num==2
				// for (let j = i + 1; j < i + 6 * (num - 1) + 1; j += 6) { //一循环一个三角片
					// vertices_array.push(arr[j]);
					// vertices_array.push(arr[j + 2]);
					// vertices_array.push(-arr[j + 1]);

					// vertices_array.push(arr[j + 3]);
					// vertices_array.push(arr[j + 5]);
					// vertices_array.push(-arr[j + 4]);

					// vertices_array.push(arr[j + 6 * num +1 +1]);
					// vertices_array.push(arr[j + 6 * num +1+3]);
					// vertices_array.push(-arr[j + 6 * num +1+3]);
					// console.log(arr[j+3],arr[j+5],arr[j+4])
				// };
				
				// for (let j = i + 6*num + 2; j < i + 6*(num+num2) + 3; j += 6) { //一循环一个三角片
					// vertices_array.push(arr[j]);
					// vertices_array.push(arr[j + 2]);
					// vertices_array.push(-arr[j + 1]);

					// vertices_array.push(arr[j + 3]);
					// vertices_array.push(arr[j + 5]);
					// vertices_array.push(-arr[j + 4]);

					// vertices_array.push(arr[j + 6 * num +1 +1]);
					// vertices_array.push(arr[j + 6 * num +1+3]);
					// vertices_array.push(-arr[j + 6 * num +1+3]);
					// console.log(arr[j+3],arr[j+5],arr[j+4])
				// };
				var all_v_sum = 0;
				for(let o of vs_nums){
					all_v_sum+=o;
				}
				
				i +=  6 * all_v_sum+vs_nums.length-1;
        };

        let vertices = new Float32Array(vertices_array);
        // var normals = new Float32Array( [] );
        geo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

        for (var i = 0; i < vertices_array.length / 3; i++) {
            index.push(i)
        }
        geo.setIndex(index);

        geo.computeVertexNormals();

		// console.log(geo)
		
		// debugger
        return geo;
    };

    /** 四棱台几何
     * @param {*} x_top 顶部x方向长度
     * @param {*} y_top 顶部y方向长度
     * @param {*} x_bottom 底部x方向长度
     * @param {*} y_bottom 底部y方向长度
     * @param {*} x_offset 顶面中心和底面中心x方向的偏移量
     * @param {*} y_offset 顶面中心和底面中心y方向的偏移量
     * @param {*} height 四棱台高
     */
    function PyramidGeometry(x_bottom, y_bottom, x_top, y_top, y_offset, x_offset, height) {
        // console.warn(x_top, y_top, x_bottom, y_bottom, x_offset, y_offset, height)
        let half_x_b = x_bottom / 2;
        let half_y_b = y_bottom / 2;
        let half_x_t = x_top / 2;
        let half_y_t = y_top / 2;
        let half_h = height / 2;

        var geometry = new THREE.Geometry();

        //bottom v
        geometry.vertices.push(new THREE.Vector3(-half_x_b, -half_h, -half_y_b));
        geometry.vertices.push(new THREE.Vector3(half_x_b, -half_h, -half_y_b));
        geometry.vertices.push(new THREE.Vector3(half_x_b, -half_h, half_y_b));
        geometry.vertices.push(new THREE.Vector3(-half_x_b, -half_h, half_y_b));

        //top v
        geometry.vertices.push(new THREE.Vector3(-half_x_t + x_offset, half_h, -half_y_t - y_offset));
        geometry.vertices.push(new THREE.Vector3(half_x_t + x_offset, half_h, -half_y_t - y_offset));
        geometry.vertices.push(new THREE.Vector3(half_x_t + x_offset, half_h, half_y_t - y_offset));
        geometry.vertices.push(new THREE.Vector3(-half_x_t + x_offset, half_h, half_y_t - y_offset));

        //=====================================
        //bottom
        geometry.faces.push(new THREE.Face3(0, 1, 3));
        geometry.faces.push(new THREE.Face3(3, 1, 2));

        //top
        geometry.faces.push(new THREE.Face3(4, 6, 5));
        geometry.faces.push(new THREE.Face3(4, 7, 6));

        //front
        geometry.faces.push(new THREE.Face3(7, 3, 6));
        geometry.faces.push(new THREE.Face3(6, 3, 2));

        //back
        geometry.faces.push(new THREE.Face3(5, 1, 0));
        geometry.faces.push(new THREE.Face3(4, 5, 0));

        //left
        geometry.faces.push(new THREE.Face3(4, 0, 3));
        geometry.faces.push(new THREE.Face3(7, 4, 3));

        //right
        geometry.faces.push(new THREE.Face3(5, 6, 2));
        geometry.faces.push(new THREE.Face3(5, 2, 1));

        //the face normals and vertex normals can be calculated automatically if not supplied above
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        geometry.translate(x_offset / 2, 0, y_offset / 2)
        return geometry;
    };

    /** 圆环几何 （半圆环）
     * @param {*} R_out 外圆半径
     * @param {*} R_in 内圆半径
     * @param {*} radian 弧度
     */
    function CircularTorusGeometry(R_out, R_in, radian) {
        // let R = (R_out + R_in) / 2;
        // let sectionR = (R_out - R_in) / 2;

        let geometry = new THREE.TorusBufferGeometry(R_out, R_in, 8, 6, radian);
        geometry.rotateX(-0.5 * Math.PI);

        //平移再旋转
        // let geometry1 = new THREE.CircleGeometry(R_in, 8).applyMatrix(new THREE.Matrix4().makeTranslation(R_out, 0, 0));

        // //旋转再平移
        // let geometry2 = new THREE.CircleGeometry(R_in, 8).applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));

        // // // console.log(radian * Math.PI / 180);
        // geometry.merge(geometry1, new THREE.Matrix4().makeRotationY(-radian));
        // geometry.merge(geometry2, new THREE.Matrix4().makeTranslation(R_out, 0, 0));
        return geometry;
    };

    /** 矩形环（半圆环）
     * @param {*} R_in 内圆半径
     * @param {*} R_out 外圆半径
     * @param {*} height 矩形高度
     * @param {*} angle_r 弧度 
     */
    function RectangularTorusGeometry(R_in, R_out, height, angle_r) {
        const R = (R_out + R_in) / 2;
        const sectionR = (R_out - R_in) / 2;
        const segment = parseInt(angle_r * 180 / Math.PI / 20);//除数越大性能越好
        // const angle_r = angle * Math.PI / 180;
        // angle_r * 180 / Math.PI / 20

        //顶面
        let geometry = new THREE.RingGeometry(R_in, R_out, 8, 1, 0, angle_r);

        geometry.rotateX(0.5 * Math.PI);
        geometry.translate(0, -height / 2, 0);

        let geometry1 = geometry.clone();
        geometry1.applyMatrix(new THREE.Matrix4().makeScale(1, -1, 1));

        for (let i = 0; i < geometry1.faces.length; i++) {
            let f = geometry1.faces[i];
            let record_c = f.c;
            f.c = f.b;
            f.b = record_c;
        };
        // for (let f of geometry1.faces) {
        //     let record_c = f.c;
        //     f.c = f.b;
        //     f.b = record_c;
        // };

        geometry.merge(geometry1);

        //内圈竖面
        let geometry2 = new THREE.CylinderGeometry(R_in, R_in, height, segment, 1, true, 0.5 * Math.PI, -angle_r);
        //外圈竖面
        let geometry3 = new THREE.CylinderGeometry(R_out, R_out, height, segment, 1, true, 0.5 * Math.PI, -angle_r);

        for (let i = 0; i < geometry3.faces.length; i++) {
            let f = geometry3.faces[i];
            let record_c = f.c;
            f.c = f.b;
            f.b = record_c;
        };
        // for (let f of geometry3.faces) {
        //     let record_c = f.c;
        //     f.c = f.b;
        //     f.b = record_c;
        // };
        geometry.merge(geometry2);
        geometry.merge(geometry3);

        var geometry4 = new THREE.PlaneGeometry(2 * sectionR, height);
        geometry4.translate(R, 0, 0);
        for (let i = 0; i < geometry4.faces.length; i++) {
            let f = geometry4.faces[i];
            let record_c = f.c;
            f.c = f.b;
            f.b = record_c;
        };
        // for (let f of geometry4.faces) {
        //     let record_c = f.c;
        //     f.c = f.b;
        //     f.b = record_c;
        // };
        geometry.merge(geometry4);

        var geometry5 = new THREE.PlaneGeometry(2 * sectionR, height);
        geometry5.translate(R, 0, 0);
        geometry5.rotateY(-angle_r);
        geometry.merge(geometry5);

        geometry.computeVertexNormals();
        return geometry;
    };

    // ==================================================PDMS文件解析区域================================================== 

    // ===================================RVM文件解析模块=================================== 

    /** load函数
     * @param {*} rvmUrl 
     * @param {*} attUrl 【可选】路径  example : "js/rvm_att/project.ATT" 
     */
    scope.load = function (rvmUrl, attUrl, onLoad, onProgress, onError) {
        if (!rvmUrl || rvmUrl == "") {
            onError('没有检测到rvmUrl路径');
            return;
        };

        onError = onError || function (errorInfo) { console.error(errorInfo) };

        // rvm信息异步加载
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: rvmUrl,
            xhr: function () { //进度
                let xhr = new window.XMLHttpRequest();
                xhr.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        let percentComplete = evt.loaded / evt.total;
                        if (onProgress) onProgress({
                            text: "数据传输",
                            progress: percentComplete
                        });
                        // console.log(Math.round(percentComplete * 100) + "%");
                    };
                }, false);
                return xhr;
            },
            success: function (data) { //成功

                console.log('data',data);

                forEachRVMData(data, onProgress, function () {

                    analysisATT(attUrl, onProgress, onLoad, onError);

                    // onProgress({ text: "merge" });

                    console.log("merge BufferGeometry");
                    

                    mergeBufferGeometries();

                    if (onLoad) onLoad({
                        original: data,
                        PDMSObject: PDMSGroup,
                        rvmTree: formatRVMData(data),
                        boundingBox: [maxX / 1000, maxY / 1000, maxZ / 1000, minX / 1000, minY / 1000, minZ / 1000],
                        center: getCenter(),
                        geoIdArray: geoIdArray, //几何id数组
                        geoCountArray: geoCountArray//几何点索引数组
                    });

                });


                // console.log(geoIdArray,geoCountArray);

            },
            error: function (xhr, ajaxOptions, thrownError) { //失败
                onError(xhr.responseText);
                onError(thrownError);
            },
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
            // console.log(text);

            let arr = text.split("NEW");

            // 总json表
            let json = {};

            //记录 起源数据 的Name
            let origin = arr[3].replace(/\s*/g, "").toLowerCase().split("name:=")[0];

            let reg1 = RegExp(/name/i),
                reg2 = RegExp(/Owner/i);

            // 遍历每个New 的对象
            for (let i = 3, len = arr.length; i < len; i++) {

                // 提取目录名
                let title = arr[i].replace(/\n/g, "↵").split("↵")[0];
                let name;
                if(title.indexOf("of")) {
                    name = title.split(" /")[0].replace(/(^\s*)|(\s*$)/g, "");//去掉首尾的空格，
                } else {
                    name = (title[0] != "/") ? title : title.substr(1);
                };


                let arr1 = arr[i].replace(/\n/g, "↵").replace(/\s*/g, "").replace(/END↵/g, "").split("↵"); //获得每个New 的对象

                // 创建当前记录数据信息json
                let json1 = { 
                    children: [],
                    Name:name,
                };

                // console.log(arr1[0]);
                

                // 遍历每个对象中的属性
                for (let j = 1, l = arr1.length - 1; j < l; j++) {

                    let arr2 = arr1[j].split(":=");//分割字符串为数组
                    

                    // if (j == 1 && arr2[0] == "Name") json[arr2[1]] = json1;//存在Name属性的 创建到json表中
                    // if (j == 4 && arr2[0] == "Owner" && json[arr2[1]]) json[arr2[1]].children.push(json1);//存在Owner属性的 添加到json表对应父级Name的children中
                    if (j == 1 && reg1.test(arr2[0])) {
                        let nameStr = arr2[1];
                        json[nameStr] = json1;//（先）存在Name属性的 创建到json表中
                        nameStr = (nameStr[0] != "/") ? nameStr : nameStr.substr(1);
                        if(json1.Name == "") json1.Name = nameStr;
                    };
                    // if (j == 1 && reg1.test(arr2[0])) console.log(arr2[1]);
                    
                    if (j == 4 && reg2.test(arr2[0]) && json[arr2[1]]) {
                        json[arr2[1]].children.push(json1);//存在Owner属性的 添加到json表对应父级Name的children中
                        let attr = arr2[1]; //Owner值
                        json1[arr2[0]] = (attr[0] != "/") ? attr : attr.substr(1);//这个属性
                    }; 
                    if (j != 1 && j != 4) json1[arr2[0]] = arr2[1];//这个属性

                };
            };

            let data = json[origin];//获取总的关系
            // console.log(data);
            
            // json = undefined;//清空josn数据

            // if (onSuccess) onSuccess(data);
            console.log(data);
        });
    };

    /** 格式化RVM数据
     * @param {*} data 
     */
    function formatRVMData(data) {
        data[0].children = [];
        for (let i = 1, len = data.length; i < len; i++) {
            let element = data[i];
            element.children = [];
            data[element.PID].children.push(element);
        };
        return data[0];
    };


    // 遍历RVM数据
    function forEachRVMData(data, onProgress, callback) {

        let len = data.length;//总数组数

        let addNum = Math.floor(len / 5);

        function forEachRVMData1(i1, i2) {

            for (let i = i1; i < i2; i++) {
                let element = data[i];//当前元素
                forEachRVMData2(element);
            };

            if (onProgress) onProgress({
                text: "模型加载",
                progress: i2 / len
            });

            if (i2 != len) {
                // let addNum = Math.floor(Math.random () * 1200) + 512;
                setTimeout(function () {
                    if (i2 + addNum < len) {
                        forEachRVMData1(i2, i2 + addNum);
                    } else {
                        forEachRVMData1(i2, len);
                    };
                }, 100);
            } else {
                callback();
            };

        };

        forEachRVMData1(0, addNum);

    };

    // 遍历RVM数据
    function forEachRVMData2(element) {
        // for (let i = 0, len = data.length; i < len; i++) {

        //     let element = data[i];//当前元素

        let PRIMSNum = element.PRIMS.length;//prims 数量

        // if (PRIMSNum == 0) continue;//没有几何信息的跳过
        if (PRIMSNum == 0) return;//没有几何信息的跳过

        if (element.C > 50) element.C = 0;

        let lastCount = geoCount;//记录上次的计数

        for (let j = 0; j < PRIMSNum; j++) {

            setPDMSMember(element.PRIMS[j], colorArray[element.C], element.ID);

        };

        if (geoCount - lastCount > 0) {
            geoIdArray.push(element.ID); //几何id数组
            geoCountArray.push(geoCount);//几何点索引数组
        };

        // };
    };

    // 设置PDMS的每一个部位的构建

    function setPDMSMember(PRIM, color, id) {
        let geo = getGeometryByGeotype(PRIM.TYPE, PRIM.KEYS);
        // if(PRIM.TYPE == 10) console.log(10);

        if (geo) {

            geo.computeBoundingBox();
            reviseBoundingBox(geo.boundingBox);

            // let mlt = new THREE.MeshLambertMaterial({ color: color, wireframe: false });
            // let mesh = new THREE.Mesh(geo, mlt);
            let mtx = PRIM.Direction;//12位矩阵

            let Matrix4 = new THREE.Matrix4();
            Matrix4.elements = [
                mtx[0], mtx[1], mtx[2], 0,
                mtx[3], mtx[4], mtx[5], 0,
                mtx[6], mtx[7], mtx[8], 0,
                mtx[9], mtx[11], -mtx[10], 1];// Y Z轴颠倒

            let P = new THREE.Vector3();
            let Q = new THREE.Quaternion();
            let S = new THREE.Vector3();
            let R = new THREE.Euler();
            Matrix4.decompose(P, Q, S);
            R.setFromQuaternion(Q, 'XYZ');

            var record = R.z;
            R.z = -R.y;
            R.y = record;
            R.order = 'XZY';

            var R_matrix = new THREE.Matrix4().makeRotationFromEuler(R)


            geo.applyMatrix(R_matrix);
            geo.scale(S.x, S.y, S.z);

            // console.log(P)
            geo.translate(P.x, P.y, P.z);



            if (geo.isGeometry) {
                // if (false) {
                // console.log(geo)
                let b_geo = new THREE.BufferGeometry().fromGeometry(geo);
                var index = [];
                for (var i = 0; i < 3 * geo.faces.length; i++) {
                    index.push(i);
                };
                b_geo.setIndex(index);
                // b_geo.index.count = index.length;
                geo = b_geo;
            };
            // console.log(geo)

            if (geo.attributes.hasOwnProperty('color'))
                delete (geo.attributes.color);

            if (geo.attributes.hasOwnProperty('uv'))
                delete (geo.attributes.uv);


            // let mesh = new THREE.Mesh(geo,new THREE.MeshLambertMaterial())
            // scene.add(mesh)
            // return

            geometries.push(geo);

            //=================color=========================
            let count = geo.attributes.position.count;

            let colorAtt = new THREE.BufferAttribute(
                new Float32Array(count * 3), 3
            );

            for (let i = 0; i < count; i++) {
                colorAtt.setXYZ(i, color.r, color.g, color.b);
            };

            geo.addAttribute('color', colorAtt);

            //=================pick color=========================
			// if(temp_test!=undefined&&geoCountArray.length-temp_test==0){
			// 	console.log('相同的ID')
				
			// }else{
			// 	console.log('不同的ID')
			// }
			temp_test = geoCountArray.length
			
            let pick_colorAtt = new THREE.BufferAttribute(
                new Float32Array(count * 3), 3
            );

            var col = new THREE.Color;
            col.setHex(geoCountArray.length)
            // console.log(geoCountArray.length)
            for (let i = 0; i < count; i++) {
                pick_colorAtt.setXYZ(i, col.r, col.g, col.b);
            };

            geo.addAttribute('pickingColor', pick_colorAtt);

            pickingMaterial = new THREE.ShaderMaterial({
                vertexShader: THREE.pickShader.vertexShader,
                fragmentShader: THREE.pickShader.fragmentShader
            });
            //============记录顶点索引对应的geo======================

            geoCount = geoCount + count;

        };

    };

    function mergeBufferGeometries() {
        console.log('geometries',geometries);

        let mgeo = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
        // let colorAtt = new THREE.BufferAttribute(
        //     new Float32Array(colors.length), 3
        // );
        // colorAtt.set(colors, 0);
        // mgeo.addAttribute('color', colorAtt);
        console.log('合并后的', mgeo);
        // mgeo.computeFaceNormals();
        // mgeo.computeVertexNormals();
        let mlt = new THREE.MeshLambertMaterial({ vertexColors: true });
        let mesh = new THREE.Mesh(mgeo, mlt);

        PDMSGroup.add(mesh);

    };

    // 修正场景包围盒
    function reviseBoundingBox(box3) {
        // console.log(box3.max, box3.min);

        if (!maxX || (maxX && maxX < box3.max.x)) maxX = box3.max.x;
        if (!maxY || (maxY && maxY < box3.max.y)) maxY = box3.max.y;
        if (!maxZ || (maxZ && maxZ < box3.max.z)) maxZ = box3.max.z;

        if (!minX || (minX && minX > box3.min.x)) minX = box3.min.x;
        if (!minY || (minY && minY > box3.min.y)) minY = box3.min.y;
        if (!minZ || (minZ && minZ > box3.min.z)) minZ = box3.min.z;
    };

    function getCenter() {
        //计算中心点
        return [
            (maxX + minX) / 2000,
            (maxY + minY) / 2000,
            (maxZ + minZ) / 2000
        ];

    };

    function getGeometryByGeotype(type, arr) {
		// if(type==11)
			// return
        let geo;//几何

        switch (type) {
            case 1:   //Pyramid 
                geo = PyramidGeometry(arr[0], arr[1], arr[2], arr[3], arr[5], arr[4], arr[6]);
                break;
            case 2:   //Box
                geo = new THREE.BoxBufferGeometry(arr[0], arr[2], arr[1]);
                break;
            case 3:   //RectangularTorus
                geo = RectangularTorusGeometry(arr[0], arr[1], arr[2], arr[3]);
                break;
            case 4:   //CircularTorus
                // console.log(arr);
                geo = CircularTorusGeometry(arr[0], arr[1], arr[2]);
                break;
            case 5:   //EllipticalDish Dish有遮挡
                geo = DishGeometry(true, arr[0], arr[1]);
                break;
            case 6:   //SphericalDish Dish无遮挡  
                geo = DishGeometry(false, arr[0], arr[1]);
                break;
            case 7:   //Snout        
                if (arr.length == 9 && arr[3] == 0 && arr[4] == 0 && (arr[5] != 0 || arr[6] != 0 || arr[7] != 0 || arr[8] != 0)) {
                    // console.log('SlopedCylinder', arr);
                    geo = new THREE.SlopedCylinderGeometry(arr[0], arr[2], arr[5], arr[6], arr[7], arr[8]);
                } else {
                    if (arr[3] == 0 && arr[4] == 0 && arr[5] == 0 && arr[6] == 0 && arr[7] == 0 && arr[8] == 0) {
                        // console.log('Cone', arr);
                        geo = new THREE.SnoutGeometry(arr[0], arr[1], arr[2], arr[3], arr[4]);
                        geo.type = 'ConeGeometry'
                    } else {
                        // console.log('Snout', arr);
                        geo = new THREE.SnoutGeometry(arr[0], arr[1], arr[2], arr[3], arr[4]);
                    }
                }

                if (geo.faces.length == 0) return null
                break;
            case 8:  //Cylinder 
                geo = new THREE.CylinderBufferGeometry(arr[0], arr[0], arr[1], 8);
                // geo = new THREE.CylinderGeometry(arr[0], arr[0], arr[1], 8);
                break;
            case 9:  //Sphere
                geo = new THREE.SphereBufferGeometry(arr[0], 8, 8);
                break;
            case 10:  //Line 
                break;
            case 11:  //FaceGroup
                geo = FaceGroupGeometry(arr);
                break;
        };

        return geo;
    };

    scope.DishGeometry = DishGeometry;
    scope.CircularTorusGeometry = CircularTorusGeometry;


};

