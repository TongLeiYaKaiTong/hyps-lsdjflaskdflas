// var test = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
function PDMSLoader() {

    let scope = this;

    let PDMSGroup = new THREE.Group();
    PDMSGroup.name = "PDMSGroup";

    let geometries = [];

    let geoCount = 0;//几何计数

    let geoIdArray = []; //几何id数组
    let geoCountArray = [];//几何点索引数组

    let original;//原始文件
    let rvmTree; //rvm树结构数据
    let ATTData;//ATT文件数据

    let rvmAnalysis = false;
    let attAnalysis = false;

    // ==================================================新建几何函数区域==================================================

    /** 盘状几何
     * @param {*} cover 是否有遮盖
     * @param {*} radius 开口半径
     * @param {*} height 球冠高
     * @param {*} widthSegments 水平分段数 【默认32】
     * @param {*} heightSegments 垂直分段数 【默认16】
     */
    function DishGeometry(cover, radius, height, widthSegments, heightSegments) {
		
        widthSegments = widthSegments || 8;
		if(radius>500) widthSegments = 24
        heightSegments = heightSegments || 4;

        let r = Math.floor(((height * height) + (radius * radius)) / (2 * height)); //半径 

        let a = Math.abs(r - height);//半径和球冠高的差

        // let geometry = new THREE.Geometry();

        // dish 段
        // geometry.merge(new THREE.SphereGeometry(r, widthSegments, heightSegments, undefined, undefined, undefined, Math.atan(radius / a)));
        let sphere = new THREE.SphereBufferGeometry(r, widthSegments, heightSegments, undefined, undefined, 0, Math.atan(radius / a));
        // sphere.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));
        sphere.applyMatrix(new THREE.Matrix4().makeTranslation(0, -a, 0));


        // 有遮盖
        if (cover) {
            // console.log('有盖子')
            // bottom plane
            let bottomPlane = new THREE.CircleBufferGeometry(radius, widthSegments);
            bottomPlane.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

            sphere = THREE.BufferGeometryUtils.mergeBufferGeometries([sphere, bottomPlane]);
        }

        return sphere;
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

        THREE.CylinderBufferGeometry.call(this, radius_top, radius_bottom, height, 12);

        // this.type = 'SnoutGeometry';

        var vertices = this.attributes.position;
		
		radialSegments = 12;
        // 侧面顶部偏移
        for (let i = 0; i < radialSegments+1 ;i++) {
            vertices[3*i] += x_offset;
            vertices[3*i+2] += z_offset;
        }
		
		//顶面帽子偏移
        for (let i = 2*radialSegments+2; i < 4*radialSegments+-1; i++) {
            vertices[3*i] += x_offset;
            vertices[3*i+2] += z_offset;
        }
    };
    THREE.SnoutGeometry.prototype = Object.create(THREE.CylinderBufferGeometry.prototype);
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

        THREE.CylinderGeometry.call(this, radius, radius, height, 16);

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
            let A, B, C
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
        let geo = new THREE.BufferGeometry();

        let vertices_array = [];
        var index = [];

        for (let i = 0, len = arr.length; i < len; i++) {
            let geometry_num = arr[i];
            let vs_nums = []
            i++;//偏移到后方v_num

            var current_sum = 0;//到每个循环的顶点的个数
            for (j = 0; j < geometry_num; j++) { //运行geometry个数次
                vs_num = arr[i + current_sum * 6 + j];
                vs_nums.push(vs_num)
                current_sum += vs_num
            }

            num = vs_nums[0]
            // console.log('geometry_num,num,num2',geometry_num,vs_nums)
            //先算当前大面的中点坐标

            // if(true){
            //计算中心点
            if (num > 4) {
				//对前四个点坐标进行判断
				if(arr[i+1]==arr[i+7]&&arr[i+7]==arr[i+13]){
					console.log('与x轴垂直的面')
					var contour  = [];
					for(let j = i + 1; j < i + 6 * num + 1; j += 6){
						contour.push(new THREE.Vector2(arr[j+1],arr[j+2]))
					}
					var order_subGroup = THREE.ShapeUtils.triangulateShape(contour,[])
					console.log(order_subGroup)
					for(let j = 0; j < order_subGroup.length; j ++){
						for(let k=0;k<3;k++){
							vertices_array.push(arr[i+6*order_subGroup[j][k]+1]);
							vertices_array.push(arr[i+6*order_subGroup[j][k]+3]);
							vertices_array.push(-arr[i+6*order_subGroup[j][k]+2])
						}
					}
				}else if(arr[i+2]==arr[i+8]&&arr[i+8]==arr[i+14]){
					console.log('与y轴垂直的面')
					var contour  = [];
					for(let j = i + 1; j < i + 6 * num + 1; j += 6){
						contour.push(new THREE.Vector2(arr[j],arr[j+2]))
					}
					var order_subGroup = THREE.ShapeUtils.triangulateShape(contour,[])
					console.log(order_subGroup)
					for(let j = 0; j < order_subGroup.length; j ++){
						for(let k=0;k<3;k++){
							vertices_array.push(arr[i+6*order_subGroup[j][k]+1]);
							vertices_array.push(arr[i+6*order_subGroup[j][k]+3]);
							vertices_array.push(-arr[i+6*order_subGroup[j][k]+2])
						}
					}
				}else if(arr[i+3]==arr[i+9]&&arr[i+9]==arr[i+15]){
					console.log('与z轴垂直的面')
					var contour  = [];
					for(let j = i + 1; j < i + 6 * num + 1; j += 6){
						contour.push(new THREE.Vector2(arr[j],arr[j+1]))
					}
					var order_subGroup = THREE.ShapeUtils.triangulateShape(contour,[])
					console.log(order_subGroup)
					for(let j = 0; j < order_subGroup.length; j ++){
						for(let k=0;k<3;k++){
							vertices_array.push(arr[i+6*order_subGroup[j][k]+1]);
							vertices_array.push(arr[i+6*order_subGroup[j][k]+3]);
							vertices_array.push(-arr[i+6*order_subGroup[j][k]+2])
						}
					}
				}else{
					console.log('未知')//计算中心点(无法解决凹多边形)
					
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
				}
				
				
            } else if (num == 3) {
                vertices_array.push(arr[i + 1]);
                vertices_array.push(arr[i + 3]);
                vertices_array.push(-arr[i + 2]);

                vertices_array.push(arr[i + 7]);
                vertices_array.push(arr[i + 9]);
                vertices_array.push(-arr[i + 8]);

                vertices_array.push(arr[i + 13]);
                vertices_array.push(arr[i + 15]);
                vertices_array.push(-arr[i + 14]);
            } else {//四边形
                vertices_array.push(arr[i + 1]);
                vertices_array.push(arr[i + 3]);
                vertices_array.push(-arr[i + 2]);

                vertices_array.push(arr[i + 7]);
                vertices_array.push(arr[i + 9]);
                vertices_array.push(-arr[i + 8]);

                vertices_array.push(arr[i + 13]);
                vertices_array.push(arr[i + 15]);
                vertices_array.push(-arr[i + 14]);

                vertices_array.push(arr[i + 13]);
                vertices_array.push(arr[i + 15]);
                vertices_array.push(-arr[i + 14]);

                vertices_array.push(arr[i + 19]);
                vertices_array.push(arr[i + 21]);
                vertices_array.push(-arr[i + 20]);

                vertices_array.push(arr[i + 1]);
                vertices_array.push(arr[i + 3]);
                vertices_array.push(-arr[i + 2]);
            }

            var all_v_sum = 0;
            for (let o of vs_nums) {
                all_v_sum += o;
            }

            i += 6 * all_v_sum + vs_nums.length - 1;
        };

        // var normals = new Float32Array( [] );
        geo.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices_array), 3));

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

        var geometry = new THREE.BufferGeometry();
		var vertices_array = []
		
        //bottom v
        // geometry.vertices.push(new THREE.Vector3(-half_x_b, -half_h, -half_y_b));
        // geometry.vertices.push(new THREE.Vector3(half_x_b, -half_h, -half_y_b));
        // geometry.vertices.push(new THREE.Vector3(half_x_b, -half_h, half_y_b));
        // geometry.vertices.push(new THREE.Vector3(-half_x_b, -half_h, half_y_b));
		
        var v0 = [-half_x_b, -half_h, -half_y_b];
        var v1 = [half_x_b, -half_h, -half_y_b];
        var v2 = [half_x_b, -half_h, half_y_b];
        var v3 = [-half_x_b, -half_h, half_y_b];

        //top v
        // geometry.vertices.push(new THREE.Vector3(-half_x_t + x_offset, half_h, -half_y_t - y_offset));
        // geometry.vertices.push(new THREE.Vector3(half_x_t + x_offset, half_h, -half_y_t - y_offset));
        // geometry.vertices.push(new THREE.Vector3(half_x_t + x_offset, half_h, half_y_t - y_offset));
        // geometry.vertices.push(new THREE.Vector3(-half_x_t + x_offset, half_h, half_y_t - y_offset));

        var v4 = [-half_x_t + x_offset, half_h, -half_y_t - y_offset];
        var v5 = [half_x_t + x_offset, half_h, -half_y_t - y_offset];
        var v6 = [half_x_t + x_offset, half_h, half_y_t - y_offset];
        var v7 = [-half_x_t + x_offset, half_h, half_y_t - y_offset];

        //=====================================
        //bottom
        vertices_array.push(v0[0],v0[1],v0[2], v1[0], v1[1], v1[2], v3[0],v3[1],v3[2]);
        vertices_array.push(v3[0],v3[1],v3[2], v1[0], v1[1], v1[2], v2[0],v2[1],v2[2]);

        //top 
        vertices_array.push(v4[0],v4[1],v4[2], v6[0], v6[1], v6[2], v5[0],v5[1],v5[2]);
        vertices_array.push(v4[0],v4[1],v4[2], v7[0], v7[1], v7[2], v6[0],v6[1],v6[2]);


        //front
        vertices_array.push(v7[0],v7[1],v7[2], v3[0], v3[1], v3[2], v6[0],v6[1],v6[2]);
        vertices_array.push(v6[0],v6[1],v6[2], v3[0], v3[1], v3[2], v2[0],v2[1],v2[2]);

        // vertices_array.push(new THREE.Face3(7, 3, 6));
		// vertices_array.push(new THREE.Face3(6, 3, 2));

        //back
        vertices_array.push(v5[0],v5[1],v5[2], v1[0], v1[1], v1[2], v0[0],v0[1],v0[2]);
        vertices_array.push(v4[0],v4[1],v4[2], v5[0], v5[1], v5[2], v0[0],v0[1],v0[2]);

        // vertices_array.push(new THREE.Face3(5, 1, 0));
        // vertices_array.push(new THREE.Face3(4, 5, 0));

        //left
        vertices_array.push(v4[0],v4[1],v4[2], v0[0], v0[1], v0[2], v3[0],v3[1],v3[2]);
        vertices_array.push(v7[0],v7[1],v7[2], v4[0], v4[1], v4[2], v3[0],v3[1],v3[2]);

        // vertices_array.push(new THREE.Face3(4, 0, 3));
        // vertices_array.push(new THREE.Face3(7, 4, 3));

        //right
        vertices_array.push(v5[0],v5[1],v5[2], v6[0], v6[1], v6[2], v2[0],v2[1],v2[2]);
        vertices_array.push(v5[0],v5[1],v5[2], v2[0], v2[1], v2[2], v1[0],v1[1],v1[2]);

        // vertices_array.push(new THREE.Face3(5, 6, 2));
        // vertices_array.push(new THREE.Face3(5, 2, 1));

        //the face normals and vertex normals can be calculated automatically if not supplied above
        // geometry.computeFaceNormals();
		
		geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices_array), 3));

		var index = [];
        for (var i = 0; i < vertices_array.length / 3; i++) {
            index.push(i)
        }
        geometry.setIndex(index);
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
        let geometry = new THREE.RingGeometry(R_in, R_out, 8, 1, 0, -angle_r);

        geometry.rotateX(0.5 * Math.PI);
        geometry.translate(0, -height / 2, 0);

		//底面
        let geometry1 = geometry.clone();
        geometry1.applyMatrix(new THREE.Matrix4().makeScale(1, -1, 1));

        for (let i = 0; i < geometry1.faces.length; i++) {
            let f = geometry1.faces[i];
            let record_c = f.c;
            f.c = f.b;
            f.b = record_c;
        };
        geometry.merge(geometry1);

        //内圈竖面
        let geometry2 = new THREE.CylinderGeometry(R_in, R_in, height, segment, 1, true, 0.5 * Math.PI, angle_r);
        //外圈竖面
        let geometry3 = new THREE.CylinderGeometry(R_out, R_out, height, segment, 1, true, 0.5 * Math.PI, angle_r);

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
        geometry.merge(geometry4);

        var geometry5 = new THREE.PlaneGeometry(2 * sectionR, height);
        geometry5.translate(R, 0, 0);
        geometry5.rotateY(-angle_r);
        geometry.merge(geometry5);

        geometry.computeVertexNormals();
        return geometry;
    };

    // ==================================================PDMS文件解析区域================================================== 

     

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

        // ATT信息异步加载
        analysisATT(attUrl, onProgress, successCallback);

        // RVM信息异步加载
        analysisRVM(rvmUrl, onProgress, successCallback)

        // 成功之后的函数回调
        function successCallback() {
            if (rvmAnalysis && attAnalysis && onLoad) {
                onLoad({
                    original: original,
                    PDMSObject: PDMSGroup,
                    rvmTree: rvmTree, //rvm树结构数据
                    geoIdArray: geoIdArray, //几何id数组
                    geoCountArray: geoCountArray,//几何点索引数组
                    ATTData: ATTData// ATT文件数据
                    // boundingBox: [maxX / 1000, maxY / 1000, maxZ / 1000, minX / 1000, minY / 1000, minZ / 1000],
                    // center: getCenter(),
                });
            };
        };
    };



    // ===================================RVM文件解析模块===================================

    /**
     * @param {*} rvmUrl 
     * @param {*} onProgress 
     * @param {*} successCallback 
     */
    function analysisRVM(rvmUrl, onProgress, successCallback) {
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
                            text: "RVM文件数据传输",
                            progress: percentComplete
                        });
                        // console.log(Math.round(percentComplete * 100) + "%");
                    };
                }, false);
                return xhr;
            },
            success: function (data) { //成功

                // console.log('data',data);

                original = data; //原始文件

                rvmTree = formatRVMData(data); //rvm树结构数据

                forEachRVMData(data, onProgress, function () {

                        mergeBufferGeometries(successCallback);

                });

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
     * @param {*} callback 回调
     */
    function analysisATT(attUrl, onProgress, callback) {

        if (!attUrl || attUrl == "") {
            attAnalysis = true;
            return;
        }; 

        let loader = new THREE.FileLoader();
        loader.setResponseType('text');

        loader.load(attUrl, function (text) {
            // console.log(text);

            let arr = text.split("NEW");

            // 总json表
            let json = {};

            let reg1 = RegExp(/name/i),
                reg2 = RegExp(/Owner/i);

            // 遍历每个New 的对象
            for (let i = 3, len = arr.length; i < len; i++) {

                // 提取目录名
                let title = arr[i].replace(/\n/g, "↵").split("↵")[0];
                let name;
                if (title.indexOf("of")) {
                    name = title.split(" /")[0].replace(/(^\s*)|(\s*$)/g, "");//去掉首尾的空格，
                } else {
                    name = (title[0] != "/") ? title : title.substr(1);
                };


                let arr1 = arr[i].replace(/\n/g, "↵").replace(/\s*/g, "").replace(/END↵/g, "").split("↵"); //获得每个New 的对象

                // 创建当前记录数据信息json
                let json1 = {
                    children: [],
                    NAME: name,
                };

                // 遍历每个对象中的属性
                for (let j = 1, l = arr1.length - 1; j < l; j++) {

                    let arr2 = arr1[j].split(":=");//分割字符串为数组


                    // if (j == 1 && arr2[0] == "Name") json[arr2[1]] = json1;//存在Name属性的 创建到json表中
                    // if (j == 4 && arr2[0] == "Owner" && json[arr2[1]]) json[arr2[1]].children.push(json1);//存在Owner属性的 添加到json表对应父级Name的children中
                    if (j == 1 && reg1.test(arr2[0])) {
                        let nameStr = arr2[1];
                        json[nameStr] = json1;//（先）存在Name属性的 创建到json表中
                        nameStr = (nameStr[0] != "/") ? nameStr : nameStr.substr(1);
                        if (json1.NAME == "") json1.NAME = nameStr;
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

            ATTData = json[Object.keys(json)[0]];//获取总的关系

            attAnalysis = true;
            callback();

        },function(evt){
            if (evt.lengthComputable) {
                let percentComplete = evt.loaded / evt.total;
                if (onProgress) onProgress({
                    text: "ATT文件数据传输",
                    progress: percentComplete
                });
                // console.log(Math.round(percentComplete * 100) + "%");
            };
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

        let color = PDMSMaterial[element.C] || new THREE.Color('#F0F0F0');//颜色

        let lastCount = geoCount;//记录上次的计数

        for (let j = 0; j < PRIMSNum; j++) {

            setPDMSMember(element.PRIMS[j], color, element.ID);

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

        if (geo) {

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
                // console.log(geo)
                let b_geo = new THREE.BufferGeometry().fromGeometry(geo);
                // return
                geo.dispose();
                // b_geo.index.count = index.length;
                geo = b_geo;
            };

            if (!geo.index) {
                var index = [];
                for (var i = 0; i < geo.attributes.position.count; i++) {
                    index.push(i);
                };
                geo.setIndex(index);
            }
            // console.log(geo)

            if (geo.attributes.hasOwnProperty('color'))
                delete (geo.attributes.color);

            if (geo.attributes.hasOwnProperty('uv'))
                delete (geo.attributes.uv);


            // let mesh = new THREE.Mesh(geo,new THREE.MeshLambertMaterial())
            // scene.add(mesh)
            // return


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
			let countx3 = count * 3;
            let pick_colorAtt = new THREE.BufferAttribute(
                new Float32Array(countx3), 3
            );

            var col = new THREE.Color;
            col.setHex(geoCountArray.length)
            // console.log(geoCountArray.length)
            for (let i = 0; i < count; i++) {
                pick_colorAtt.setXYZ(i, col.r, col.g, col.b);
            };

            geo.addAttribute('pickingColor', pick_colorAtt);
			
			geoCount = geoCount + count;

            geometries.push(geo);
        };

    };

    function mergeBufferGeometries(callback) {
        // console.log('geometries',geometries);
		
		//拆分成几段以便于merge
		let wait_merged_array = []
		
		var segment = 10;
		var segment_L = Math.floor(geometries.length/10)
		for(let i=0;i<segment-1;i++){
			wait_merged_array.push(geometries.slice(i*segment_L,(i+1)*segment_L))
		}
		wait_merged_array[segment-1] = geometries.slice(9*segment_L)
		
		geometries = [];
		//前面的数量都相等，最后一个会多一点
		
		// console.log(wait_merged_array)
		
        // mgeo.computeFaceNormals();
        // mgeo.computeVertexNormals();
		var count = 0;
		let interval = setInterval(
			function(){
				// console.log('count',count)
				// console.log('wait_merged_array[count-1]',wait_merged_array[count-1])
				// console.log('wait_merged_array[count]',wait_merged_array[count])
				if(!wait_merged_array[count]){
					// console.log('切断interval')
                    clearInterval(interval)
                    rvmAnalysis = true;
					callback();
					return
				}
				let mgeo = THREE.BufferGeometryUtils.mergeBufferGeometries(wait_merged_array[count]);
				
				//刚merge后，就清除缓存
				for(let j=0;j<wait_merged_array[count].length;j++){
					wait_merged_array[count][j].dispose();
					wait_merged_array[count] = [];
				}
				wait_merged_array[count] = null;
				count++;
				
				 // console.log('合并后的2', mgeo2);
				// mgeo.computeFaceNormals();
				// mgeo.computeVertexNormals();
				let mlt = new THREE.MeshLambertMaterial({ vertexColors: true });
				let mesh = new THREE.Mesh(mgeo, mlt);

				PDMSGroup.add(mesh);
			},500
		)
    };

    function getGeometryByGeotype(type, arr) {
        let geo;//几何
		
		// test[type]++
        // if(type!=7)
			// return geo
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
                    // if (arr[3] == 0 && arr[4] == 0 && arr[5] == 0 && arr[6] == 0 && arr[7] == 0 && arr[8] == 0) {
                        // console.log('Cone', arr);
                        geo = new THREE.SnoutGeometry(arr[0], arr[1], arr[2], arr[3], arr[4]);
                        // geo.type = 'ConeGeometry'
                    // } else {
                        // console.log('Snout', arr);
                        // geo = new THREE.SnoutGeometry(arr[0], arr[1], arr[2], arr[3], arr[4]);
                    // }
                }

                if (geo.faces&&geo.faces.length == 0||geo.attributes&&geo.attributes.position.count == 0) return null
                break;
            case 8:  //Cylinder 
				r_segment = 8;
				if(arr[0]>500)
					r_segment = 24
                geo = new THREE.CylinderBufferGeometry(arr[0], arr[0], arr[1], r_segment);
                // geo = new THREE.CylinderGeometry(arr[0], arr[0], arr[1], 8);
                break;
            case 9:  //Sphere
                // geo = new THREE.SphereBufferGeometry(arr[0], 8, 8);
                geo = new THREE.OctahedronBufferGeometry(arr[0], 1);
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

