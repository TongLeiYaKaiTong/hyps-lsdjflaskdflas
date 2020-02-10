function CuttingPlaneTool(target_group,cutting_tool_group){
	this.group = cutting_tool_group;
	this.plane_group;
	
	let plane_group = new THREE.Group();
	this.plane_group = plane_group;
	plane_group.name = '剖切面组';
	cutting_tool_group.add(plane_group)
	
	var box3 = new THREE.Box3().setFromObject(target_group)
	
	//获取包围盒
	var helper = new THREE.Box3Helper( box3, 0xffff00 );
	helper.name = '剖切包围盒线框';
	cutting_tool_group.add( helper );
	
	var boxg = new THREE.BoxGeometry(box3.max.x-box3.min.x,box3.max.y-box3.min.y,box3.max.z-box3.min.z);
	var box = new THREE.Mesh(boxg,new THREE.MeshBasicMaterial({color:0x00ff00,transparent:true,opacity:0.4}));
	box.name = '剖切包围盒';
	box.position.set((box3.min.x+box3.max.x)/2,(box3.min.y+box3.max.y)/2,(box3.min.z+box3.max.z)/2)
		 // debugger
	cutting_tool_group.add(box);
	
	console.log(box3,helper,box);
	
	this.only_show_plane = function(index){
		console.log('只显示面',index);
		for(let o of plane_group.children){
			o.visible = false;
		}
		plane_group.children[index].visible = true;
	}
	
	this.add_horizontal_plane = function(){
		for(let o of plane_group.children){
			o.visible = false;
		}
		
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();
		document.getElementById('container').addEventListener( 'click', click, false );
		var w = document.getElementById('container').offsetWidth;
		var h = document.getElementById('container').offsetHeight;
		function click( event ) {
			mouse.x = ( event.offsetX / w ) * 2 - 1;
			mouse.y = - ( event.offsetY / h ) * 2 + 1;
			raycaster.setFromCamera( mouse, camera );

			// calculate objects intersecting the picking ray
			var intersects = raycaster.intersectObject( box );
			if(intersects[0]){
				console.log(intersects[0].point);
				let planeG = new THREE.PlaneGeometry(box3.max.x-box3.min.x,box3.max.z-box3.min.z)
				// let plane = new THREE.Mesh(planeG,new THREE.MeshBasicMaterial({color:0x0000ff,transparent:true,opacity:0.3,side:2}))
				planeG.rotateX(0.5*Math.PI)
				planeG.applyMatrix( new THREE.Matrix4().makeTranslation(box.position.x,intersects[0].point.y,box.position.z) );
				let plane = new THREE.Mesh(planeG,new THREE.MeshBasicMaterial({color:0x0000ff,side:2}))
				// plane.position.copy(box.position);
				// plane.position.y = intersects[0].point.y;
				plane_group.add(plane);
				
				generate_target_graph(plane);
				document.getElementById('container').removeEventListener( 'click', click, false );
			}
		}
	}
	
	this.add_vertical_plane = function(){
		for(let o of plane_group.children){
			o.visible = false;
		}
		
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();
		document.getElementById('container').addEventListener( 'click', click, false );
		var w = document.getElementById('container').offsetWidth;
		var h = document.getElementById('container').offsetHeight;
		
		var draw_lineP_set = []
		function click( event ) {
			mouse.x = ( event.offsetX / w ) * 2 - 1;
			mouse.y = - ( event.offsetY / h ) * 2 + 1;
			raycaster.setFromCamera( mouse, camera );

			// calculate objects intersecting the picking ray
			console.log(box);
			var intersects = raycaster.intersectObject( box );
			if(intersects[0].point){
			
				console.log(intersects[0].point)
				
				
				draw_lineP_set.push({x:intersects[0].point.x,y:intersects[0].point.z});
				if(draw_lineP_set.length%2==0){
					//进行生成切片操作
					//1 获取水平投影点，两个点肯定在包围盒边缘上
					var result_controlP = [];
					
					let box = box3;
					console.log('包围盒参数',box.min,box.max)
					
					var line0 = {p0:{x:box.min.x,y:box.min.z },p1:{x:box.max.x,y:box.min.z }}
					var result0 = interP(line0.p0,line0.p1,draw_lineP_set[0],draw_lineP_set[1]);
					if(result0.x < box.max.x && result0.x > box.min.x )
						result_controlP.push(result0)
					
					var line1 = {p0:{x:box.max.x,y:box.min.z },p1:{x:box.max.x,y:box.max.z }} 
					var result1 = interP(line1.p0,line1.p1,draw_lineP_set[0],draw_lineP_set[1]);
					if(result1.y < box.max.z && result1.y > box.min.z )
						result_controlP.push(result1)
					
					var line2 = {p0:{x:box.max.x,y:box.max.z },p1:{x:box.min.x,y:box.max.z }} 
					var result2 = interP(line2.p0,line2.p1,draw_lineP_set[0],draw_lineP_set[1]);
					if(result2.x < box.max.x && result2.x > box.min.x )
						result_controlP.push(result2)
					
					var line3 = {p0:{x:box.min.x,y:box.max.z },p1:{x:box.min.x,y:box.min.z }} 
					var result3 = interP(line3.p0,line3.p1,draw_lineP_set[0],draw_lineP_set[1]);
					if(result3.y < box.max.z && result3.y > box.min.z )
						result_controlP.push(result3)
					
					// debugger
					console.log(result_controlP);
					result_controlP[0] = new THREE.Vector2(result_controlP[0].x,result_controlP[0].y);
					result_controlP[1] = new THREE.Vector2(result_controlP[1].x,result_controlP[1].y);
					//通过这两个点生成一个竖着的面
					var planeG = new THREE.PlaneGeometry( 1 ,1);
					console.log(planeG);
					planeG.vertices[0].set(result_controlP[0].x,box.max.y,result_controlP[0].y );
					planeG.vertices[1].set(result_controlP[1].x,box.max.y,result_controlP[1].y );
					planeG.vertices[2].set(result_controlP[0].x,box.min.y,result_controlP[0].y );
					planeG.vertices[3].set(result_controlP[1].x,box.min.y,result_controlP[1].y );
					var mesh = new THREE.Mesh(planeG,new THREE.MeshBasicMaterial({color:0x0000ff,side:2}));
					mesh.name = '切割面';
					plane_group.add(mesh)
					
					// draw_lineP_set = [];
					generate_target_graph(mesh);
					document.getElementById('container').removeEventListener( 'click', click, false );
				}
			}
		}
	}
		
		
	function generate_target_graph(plane){
		console.log('generate_target_graph');
		let mesh_set = [];
		let group = scene.getObjectByName('PDMSGroup');
		group.traverse(function(o){
			if(o.isMesh)
				mesh_set.push(o);
		})
		
		
		let face_set = [];
		var vs = plane.geometry.vertices;
		face_set.push([vs[0],vs[2],vs[1]]);
		face_set.push([vs[2],vs[3],vs[1]]);
		
		let one_plane_loopLines_set = [];
		for(let o of mesh_set){
			var starsGeometry = new THREE.Geometry();
			var l_geometry = new THREE.Geometry();
			
			let index_array = o.geometry.index.array;
			let array = o.geometry.attributes.position.array;
			for(let i = 0;i<index_array.length;i+=3 ){
				let index0 = 3*index_array[i];
				let index1 = 3*index_array[i+1];
				let index2 = 3*index_array[i+2];
				
				var v0 = new THREE.Vector3(array[index0],array[index0+1],array[index0+2]).applyMatrix4(o.matrixWorld)
				var v1 = new THREE.Vector3(array[index1],array[index1+1],array[index1+2]).applyMatrix4(o.matrixWorld)
				var v2 = new THREE.Vector3(array[index2],array[index2+1],array[index2+2]).applyMatrix4(o.matrixWorld)
				
				//三角形的三个边都要做变成射线射线检测
				var interP0 = check_line(v0,v1);
				var interP1 = check_line(v1,v2);
				var interP2 = check_line(v2,v0);
				
				let check_set = [];
				if(interP0)
					check_set.push(interP0)
				if(interP1)
					check_set.push(interP1)
				if(interP2)
					check_set.push(interP2)
				
				//三角形的三个边如果有两个边有交点，则连接这两个边
				if(check_set.length>=2)
					 l_geometry.vertices.push(check_set[0],check_set[1])
				 
				function check_line(a,b){
					let length = a.distanceTo(b);
					let ray_start = a.clone();
					let ray_dir = b.clone().sub(a).normalize();
					var ray = new THREE.Ray(ray_start,ray_dir)
					
					for(var f of face_set){//一个检测面有两个三角片
						var result_v = new THREE.Vector3();
						result_v = ray.intersectTriangle(...f, false,result_v)
						
						
						if(result_v&&result_v.distanceTo(a)<=length){
							//result_v去找之前的点看看有没有重复的
							
							// let have_repeat = false;
							// for(var v of starsGeometry.vertices){
								// if(result_v.distanceTo(v)<0.0001){
									// console.log('有重复',v.repeat_time);
									// have_repeat = true
									// if(v.repeat_time)
										// v.repeat_time++
									// else
										// v.repeat_time =1;
									
									// break;
								// }
							// }
							
							//可视化这产生交点的边，(边是模型上的，不是在检测面上)
							// if(!have_repeat){
								//模型中的一条边作为射线与检测面的交点
								starsGeometry.vertices.push( result_v );
							// }result_v
							
							return result_v;
								// l_geometry.vertices.push(a,b)
						}
					}
				}

			}

			console.log('starsGeometry',starsGeometry);
			var starsMaterial = new THREE.PointsMaterial( { color: 0x880000,depthTest:false,size:0.05} );

			var starField = new THREE.Points( starsGeometry, starsMaterial );

			cutting_tool_group.add( starField );
			
			var material = new THREE.LineBasicMaterial({
				color: o.material.color,
				depthTest:false
			});
			var line = new THREE.LineSegments( l_geometry, material );
			line.renderOrder = 1000;
			cutting_tool_group.add( line );
			one_plane_loopLines_set.push(line)
		}
		
		//从line中，可以获取目标图形
		get_faultGraph_from_intersect_line_loops(one_plane_loopLines_set,plane);
	}

	//从交点连接line中，可以获取目标图形
	function get_faultGraph_from_intersect_line_loops(line_set,plane){
		// console.log(line.geometry.vertices)
		console.warn('plane',plane)
		let box3 = new THREE.Box3();
		box3.setFromObject(plane);
		
		// var plane_bottom_length
		// if(box3.max.y-box.min.y<0.001){//水平面
			// plane_bottom_length = box3.max.x - box3.min.x;
		// }else{
			// plane_bottom_length = new THREE.Vector2(box3.min.x,box3.min.z).distanceTo(new THREE.Vector2(box3.max.x,box3.max.z));
		// }
		
		//为这个面穿件一个canvas纹理
		var canvas = document.createElement("canvas");
		plane.canvas = canvas;
		canvas.style.position = 'absolute';
		canvas.style.top = '0px';
		canvas.style.left = '0px';
		var ctx = canvas.getContext('2d');
		
		var detaX = box3.max.x-box3.min.x;
		var detaY = box3.max.y-box3.min.y;
		var detaZ = box3.max.z-box3.min.z;
		
		let bottomL = Math.sqrt( detaX*detaX + detaZ*detaZ )
		if(detaY<0.001)//水平面
			bottomL = detaX
		
		
		// canvas.height = 8192;
		canvas.height = 4096;
		
		if(detaY<0.001)//水平面
			canvas.width = canvas.height * detaX/detaZ ;
		else
			canvas.width = canvas.height * bottomL/detaY ;
			
		ctx.fillStyle ="#000";
		ctx.fillRect(0,0,canvas.width,canvas.height)
			
		for(let line of line_set){
			//clone一遍segement数组
			var vertices = [];
			for(let v of line.geometry.vertices){
				vertices.push(v.clone());
			}
			
			//拆成多个连通分量
			var sorted_vertices = [ [vertices[0]] ];
			//从第一个点开始
			var current_p = vertices[0];
			while(vertices.length>0){
				let can_find_in_left = false;
				for(let i=0;i<vertices.length;i++){
					if(vertices[i].distanceTo(current_p)<0.001){//就是这个点
						can_find_in_left = true;
						if(i%2==0){
							current_p = vertices[i+1];
							vertices.splice(i,2);
						}else{
							current_p = vertices[i-1];
							vertices.splice(i-1,2);
						}
						
						var last_array = sorted_vertices[sorted_vertices.length-1]
						last_array.push(current_p)
						break
					}
					
				}
				
				//没找到点，但是剩下的还有点，说明在另外的连通分量里
				if(!can_find_in_left){
					current_p = vertices[0];
					sorted_vertices.push([]);
				}
			}
			
			// console.log('sorted_vertices',sorted_vertices)
			// line.material.color.convertLinearToGamma()
			line.material.color.multiplyScalar(2)
			if(line.material.color.r==line.material.color.g&&line.material.color.g==line.material.color.b)
				line.material.color.setRGB(1,1,1);
			
			//获取canvas坐标，在此循环内绘制
			// ctx.strokeStyle = '#'+line.material.color.getHexString();
			ctx.strokeStyle = '#ffffff';
			console.log('变换颜色',ctx.strokeStyle)
			// debugger
			for(let one_loop of sorted_vertices){
				ctx.beginPath();
				for(let v of one_loop){
					if(!v)
						continue
					if(one_loop.indexOf(v)==0){
						
						if(detaY<0.001)//水平面
							ctx.moveTo(  (v.x-box3.min.x) / detaX*canvas.width, (box3.max.z - v.z) / detaZ*canvas.height );
						else
							ctx.moveTo(  (v.x-box3.min.x) / detaX*canvas.width, (box3.max.y - v.y) / detaY*canvas.height );
					
					}else{
						if(detaY<0.001)//水平面
							ctx.lineTo(  (v.x-box3.min.x) / detaX*canvas.width, (box3.max.z - v.z) / detaZ*canvas.height );
						else
							ctx.lineTo(  (v.x-box3.min.x) / detaX*canvas.width, (box3.max.y - v.y) / detaY*canvas.height );
				
					}
				}
				ctx.closePath();
				ctx.stroke();
			}
		}
		// alert('剖面图生成完毕，请右键保存后查看');
	}


	//点击不同的剖面，展示不同的图纸
	this.show_clip_result = function(index){
		
		let canvas = plane_group.children[index].canvas;
		$('#section_result').empty();
		$('#section_result')[0].appendChild(canvas)
		
	}
	
	
	//之前与直线相交求交点
	function interP(a, b, c, d) {
		let denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);

		if ((denominator * 1).toFixed(5) == 0) {
			if ((a.x == c.x && a.y == c.y) || (a.x == d.x && a.y == d.y)) return a;
			if ((b.x == c.x && b.y == c.y) || (b.x == d.x && b.y == d.y)) return b;
			//重合或平行
			return false;
		}

		let x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
			+ (b.y - a.y) * (d.x - c.x) * a.x
			- (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
		let y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
			+ (b.x - a.x) * (d.y - c.y) * a.y
			- (d.x - c.x) * (b.y - a.y) * c.y) / denominator;

		return { x: x, y: y };
	}
}