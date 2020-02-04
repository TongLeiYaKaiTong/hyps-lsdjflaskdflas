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
	
	
	this.add_horizontal_plane = function(){
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
				let plane = new THREE.Mesh(planeG,new THREE.MeshBasicMaterial({color:0x0000ff,side:2}))
				plane.rotateX(1.5708)
				plane.position.copy(box.position);
				plane.position.y = intersects[0].point.y;
				cutting_tool_group.add(plane);
				document.getElementById('container').removeEventListener( 'click', click, false );
			}
		}
	}
	
	this.add_vertical_plane = function(){
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
					cutting_tool_group.add(mesh)
					
					// draw_lineP_set = [];
					
					document.getElementById('container').removeEventListener( 'click', click, false );
				}
			}
		}
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