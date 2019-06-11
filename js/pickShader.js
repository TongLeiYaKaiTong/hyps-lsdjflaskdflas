THREE.pickShader = {
	uniforms: {},
	vertexShader: [
		'precision highp float;',
		'//uniform mat4 modelViewMatrix;',
		'//uniform mat4 projectionMatrix;',
		'//attribute vec3 position;',
		'attribute vec3 pickingColor;',
		'varying vec3 vColor;',
		
		
		"void main() {",
			'vColor = pickingColor;',
			'vec3 positionEye = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;',
			"gl_Position = projectionMatrix * vec4( positionEye, 1.0 );",
		"}"

	].join( "\n" ),

	fragmentShader: [
		'varying vec3 vColor;',

		"void main() {",
			"gl_FragColor = vec4( vColor, 1.0 );",
		"}"

	].join( "\n" )

};