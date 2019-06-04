var camera, scene, renderer,light;
var lastTime = 0;
var moveQ = new THREE.Quaternion( 0.5, 0.5, 0.5, 0.0 ).normalize();
var tmpQ = new THREE.Quaternion();
var currentQ = new THREE.Quaternion();

init();
animate();

function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container ); 
	stats = new Stats();
	container.appendChild( stats.dom );
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 20000 );
	camera.position.set(0,0,200);

	// var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	// scene.add( light );
	var directionalLight = new THREE.DirectionalLight( 0xeeeeee, 1 );
	directionalLight.position.set(1,1,1)
	scene.add( directionalLight );
	
	light = new THREE.PointLight( 0xeeeeee, 1, 200 );
	camera.add(light)
	scene.add(camera)
	
	// var geometry = PyramidGeometry(70,20,30,70,80,20,30);
	var geometry = CircularTorusGeometry(30,70,230);
	// var geometry = RectangularTorus(30,20,60,160);
	geometry = new THREE.BufferGeometry().fromGeometry(geometry);
	
	console.log(geometry)
	
	
	var material = new THREE.RawShaderMaterial( {
		uniforms: {
			// map: { value: new THREE.TextureLoader().load( 'textures/crate.gif' ) }
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	} );
	
	var instance_geometry = new THREE.InstancedBufferGeometry();
	instance_geometry.index = geometry.index;
	instance_geometry.attributes.position = geometry.attributes.position;
	instance_geometry.attributes.uv = geometry.attributes.uv;
	instance_geometry.attributes.normal = geometry.attributes.normal;
	 
	var offsets = [];
	var orientations = [];
	var vector = new THREE.Vector4();
	var x, y, z, w;
	
	const times =90000
	for(let i=0;i<10000;i++){
		// var material = new THREE.MeshPhongMaterial({flatShading:false,wireframe:false})
		// var mesh = new THREE.Mesh( geometry, material );
		// scene.add( mesh );
		
		// mesh.position.set(100*(i/100),0,100*(i%100))
		// var helper = new THREE.VertexNormalsHelper( mesh, 3, 0x00ff00, 1 );
		// scene.add( helper );]
		
		x = -5000+100*(i/100)
		z = -5000+100*(i%100)
		vector.set( x, 0, z, 0 ).normalize();
		// vector.multiplyScalar( 5 ); // move out at least 5 units from center in current direction
		offsets.push( x + vector.x, 0, z + vector.z );

		x = Math.random() * 2 - 1;
		y = Math.random() * 2 - 1;
		z = Math.random() * 2 - 1;
		w = Math.random() * 2 - 1;
		vector.set( x, y, z, w ).normalize();
		orientations.push( vector.x, vector.y, vector.z, vector.w );
	}
	offsetAttribute = new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 );
	orientationAttribute = new THREE.InstancedBufferAttribute( new Float32Array( orientations ), 4 ).setDynamic( true );
	instance_geometry.addAttribute( 'offset', offsetAttribute );
	instance_geometry.addAttribute( 'orientation', orientationAttribute );
	
	mesh = new THREE.Mesh( instance_geometry, material );
	scene.add( mesh );

	
	var axesHelper = new THREE.AxesHelper( 50 );
	scene.add( axesHelper );
//----------------------------以下禁止改动----------------------------------------------------------------				
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	container.appendChild( renderer.domElement );

	controls = new THREE.OrbitControls( camera,renderer.domElement );
	controls.update();

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	
}

function animate() {
	requestAnimationFrame( animate );
	
			var time = performance.now();
			mesh.rotation.y = time * 0.000005;
			var delta = ( time - lastTime ) / 5000;
			tmpQ.set( moveQ.x * delta, moveQ.y * delta, moveQ.z * delta, 1 ).normalize();
			for ( var i = 0, il = orientationAttribute.count; i < il; i ++ ) {
				currentQ.fromArray( orientationAttribute.array, ( i * 4 ) );
				currentQ.multiply( tmpQ );
				orientationAttribute.setXYZW( i, currentQ.x, currentQ.y, currentQ.z, currentQ.w );
			}
			orientationAttribute.needsUpdate = true;
			lastTime = time;
			renderer.render( scene, camera );
			
	stats.update();
}
