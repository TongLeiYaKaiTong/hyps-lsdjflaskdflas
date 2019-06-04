function PyramidGeometry(height,x_top,y_top,x_bottom,y_bottom,x_offset,y_offset){
	let half_x_b = x_bottom/2;
	let half_y_b = y_bottom/2;
	let half_x_t = x_top/2;
	let half_y_t = y_top/2;
	
	
	var geometry = new THREE.Geometry();

	//bottom v
	geometry.vertices.push( new THREE.Vector3( -half_x_b, 0, -half_y_b ) );
	geometry.vertices.push( new THREE.Vector3(  half_x_b, 0, -half_y_b ) );
	geometry.vertices.push( new THREE.Vector3(  half_x_b, 0,  half_y_b) );
	geometry.vertices.push( new THREE.Vector3( -half_x_b, 0,  half_y_b ) );
	
	//top v
	geometry.vertices.push( new THREE.Vector3( -half_x_t+x_offset, height, -half_y_t+y_offset ) );
	geometry.vertices.push( new THREE.Vector3(  half_x_t+x_offset, height, -half_y_t+y_offset ) );
	geometry.vertices.push( new THREE.Vector3(  half_x_t+x_offset, height,  half_y_t+y_offset ) );
	geometry.vertices.push( new THREE.Vector3( -half_x_t+x_offset, height,  half_y_t+y_offset ) );
	
	//=====================================
	//bottom
	geometry.faces.push( new THREE.Face3( 0, 1, 3) );
	geometry.faces.push( new THREE.Face3( 3, 1, 2) );
	
	//top
	geometry.faces.push( new THREE.Face3( 4, 6, 5) );
	geometry.faces.push( new THREE.Face3( 4, 7, 6) );
	
	//front
	geometry.faces.push( new THREE.Face3( 7, 3, 6) );
	geometry.faces.push( new THREE.Face3( 6, 3, 2) );
	
	//back
	geometry.faces.push( new THREE.Face3( 5, 1, 0) );
	geometry.faces.push( new THREE.Face3( 4, 5, 0) );
	
	//left
	geometry.faces.push( new THREE.Face3( 4, 0, 3) );
	geometry.faces.push( new THREE.Face3( 7, 4, 3) );
	
	//right
	geometry.faces.push( new THREE.Face3( 5, 6, 2) );
	geometry.faces.push( new THREE.Face3( 5, 2, 1) );

	//the face normals and vertex normals can be calculated automatically if not supplied above
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	
	return geometry;
}

function CircularTorusGeometry(R_in,R_out,angle){
	let R = (R_out+R_in) /2
	let sectionR = (R_out-R_in) /2
	
	var geometry = new THREE.TorusGeometry( R, sectionR, 16, 16,angle*Math.PI/180 );
	geometry.rotateX(0.5*Math.PI)
	
	
	//平移再旋转
	var geometry1 = new THREE.CircleGeometry( sectionR, 8 ).applyMatrix(new THREE.Matrix4().makeTranslation(R,0,0));
	
	//旋转再平移
	var geometry2 = new THREE.CircleGeometry( sectionR, 8 ).applyMatrix(new THREE.Matrix4().makeRotationY(1*Math.PI));
	
	console.log(angle*Math.PI/180)
	geometry.merge(geometry1,new THREE.Matrix4().makeRotationY(-angle*Math.PI/180) )
	geometry.merge(geometry2,new THREE.Matrix4().makeTranslation(R,0,0))
	return geometry;
}

function RectangularTorus(height,R_in,R_out,angle){
	const R = (R_out+R_in) /2
	const sectionR = (R_out-R_in) /2
	const segment =parseInt(angle/20)//除数越大性能越好
	const angle_r = angle*Math.PI/180;
	
	//顶面
	let geometry = new THREE.RingGeometry( R_in, R_out, segment, 1,0,angle_r);
	
	geometry.rotateX(0.5*Math.PI)
	geometry.translate(0,-height/2,0)
	
	let geometry1 = geometry.clone();
	geometry1.applyMatrix(new THREE.Matrix4().makeScale(1,-1,1) )
	for(let f of geometry1.faces){
		let record_c = f.c;
		f.c = f.b;
		f.b = record_c;
	}
	
	geometry.merge(geometry1)
	
	//内圈竖面
	let geometry2 = new THREE.CylinderGeometry( R_in , R_in, height, segment ,1,true,0.5*Math.PI,-angle_r)
	//外圈竖面
	let geometry3 = new THREE.CylinderGeometry( R_out,R_out, height, segment ,1,true,0.5*Math.PI,-angle_r)
	for(let f of geometry3.faces){
		let record_c = f.c;
		f.c = f.b;
		f.b = record_c;
	}
	geometry.merge(geometry2)
	geometry.merge(geometry3)
	
	var geometry4 = new THREE.PlaneGeometry( 2*sectionR, height );
	geometry4.translate(R,0,0)
	for(let f of geometry4.faces){
		let record_c = f.c;
		f.c = f.b;
		f.b = record_c;
	}
	geometry.merge(geometry4)
	
	var geometry5 = new THREE.PlaneGeometry( 2*sectionR, height );
	geometry5.translate(R,0,0)
	geometry5.rotateY(-angle_r)
	geometry.merge(geometry5)
	
	geometry.computeVertexNormals();
	return geometry;
}

function SlopedCylinderGeometry(height,diameter,Xtop_shear,Ytop_shear,Xbot_shear,Ybot_shear){
	var geometry = new THREE.CylinderGeometry(diameter/2,diameter/2, height, 32 );
	
	return geometry
}