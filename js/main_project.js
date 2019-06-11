// ============================ dom事件绑定 ============================
// 下拉菜单鼠标移入触发
$(".menu-box").mouseover(function () {
	$(this).addClass('open');
	$(this).find('>.dropdown-btn').attr('aria-expanded', true);
});
// 下拉菜单鼠标移出触发
$(".menu-box").mouseleave(function () {
	$(this).removeClass('open');
	$(this).find('>.dropdown-btn').attr('aria-expanded', false);
});

// 相关文件按钮
$('#nav>.menu-area>.btn.dossier').click(function () {
	$('#mask').show();
	$('.mask-box.dossier-box').show();
})
// 运维记录按钮
$('#nav>.menu-area>.btn.operate').click(function () {
	$('#mask').show();
	$('.mask-box.operate-box').show();
})
// 帮助按钮
$('#nav>.menu-area>.btn.help').click(function () {
	$('#mask').show();
	$('.mask-box.help-box').show();
})

// 弹窗关闭按钮绑定
$('.mask-box>.top>.close, .mask-box>.top>.back').on('click', function () {
	$('#mask').hide();
	$(this).parents('.mask-box').hide();
})
// 弹窗关闭按钮绑定
$('.mask-img>.top>.close, .mask-img>.top>.back').on('click', function () {
	$(this).parents('.mask-img').hide();
})
// 右边信息面板关闭按钮绑定
$('#right-info-panel>.close-btn').on('click', function () {
	$(this).parents('#right-info-panel').hide();
});

// 视角切换菜单事件绑定
$('#nav>.menu-area>.view-box>.dropdown-menu>li>a').click(function () {
	const $this = $(this);
	const $view = $this.parents('.dropdown-menu').siblings('.dropdown-btn');

	const this_key = $this.attr('data-key');
	const view_key = $view.attr('data-key');

	const this_text = $this.text();
	const view_text = $view.text();

	// 交换文本与data-key属性
	$this.text(view_text).attr('data-key', view_key);
	$view.text(this_text).attr('data-key', this_key);

	console.log(this_key)
	if (this_key == 'first') {
		camera.recordP = camera.position.clone()
		camera.recordT = controls.target.clone()
		controls.reset()
		if (controls.target.y == 0) {
			controls.target.copy(controls.object.position)
			controls.target.z--;
			controls.update()
		}
		document.addEventListener('keydown', onKeyDown22, false);
		document.addEventListener('keyup', onKeyUp22, false);


	} else {
		controls.saveState()
		camera.position.copy(camera.recordP)
		controls.target.copy(camera.recordT)
		controls.update()

		document.removeEventListener('keydown', onKeyDown22, false);
		document.removeEventListener('keyup', onKeyUp22, false);

	}
})

// 第一人称和第三人称视角切换
$("#controller-tool-bar > .view-switch-btn > .view-btn").on('click', function () {
	$("#controller-tool-bar > .view-switch-btn > .view-btn").removeClass('on');
	$(this).addClass('on');

	if ($(this).attr('data-key') == "first") {//第一人称
	} else {//第三人称
	};

});


// 下载gltf格式模型
function downloadGLTF(model, fileName) {
	const exporter = new THREE.GLTFExporter();

	const loadingBox = new LoadingBox('导出', { hasProgress: false });

	exporter.parse(
		model,
		function (result) {
			if (result instanceof ArrayBuffer) {
				downloadArrayBuffer(result, fileName + '.glb')
			} else {
				const text = JSON.stringify(result);
				downloadString(text, fileName + '.gltf')
			}

			loadingBox.remove();
		},
		{ binary: true }
	)
}

// 下载obj格式模型
function downloadOBJ(model, fileName) {
	const exporter = new THREE.OBJExporter();

	const result = exporter.parse(model);
	const text = JSON.stringify(result);

	downloadString(text, fileName + '.obj');
}

// 下载collada模型
function exportCollada(model, fileName) {
	const exporter = new THREE.ColladaExporter();

	const result = exporter.parse(model);
	downloadString(result.data, fileName + '.dae');
	result.textures.forEach(
		function (tex) {
			downloadArrayBuffer(tex.data, "".concat(tex.name, ".").concat(tex.ext));
		}
	);
}

// 以text形式下载
function downloadString(text, filename) {
	downloadModel(new Blob([text], { type: 'text/plain' }), filename);
}

// 以buffer形式下载
function downloadArrayBuffer(buffer, filename) {
	downloadModel(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}

// 下载模型
function downloadModel(blob, filename) {
	const link = document.createElement('a');
	link.style.display = 'none';
	document.body.appendChild(link);

	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();
}

/**
 * @name loading界面对象
 * @param {string} text 初始化文本
 */
function LoadingBox(text, config) {
	// 界面外框
	const element = document.createElement('div');
	$('body').append(element);
	$(element).css({
		'width': '100%',
		'height': '100%',
		'position': 'fixed',
		'top': 0,
		'left': 0,
		'display': 'flex',
		'flex-direction': 'column',
		'justify-content': 'center',
		'align-items': 'center',
		'background-color': 'rgba(0, 0, 0, 0.6)',
	});

	// 图片
	const img = document.createElement('img');
	$(element).append(img);
	$(img).attr('src', "./img/loading.gif").css({
		width: '8%',
	});

	// 文字
	const text_dom = document.createElement('p');
	$(element).append(text_dom);
	$(text_dom).text(text ? '正在' + text + '...' : '正在加载...').css({
		'font-size': '20px',
		'font-weight': 'bold',
		'margin-top': '20px',
	})

	// 进度条外框
	const progress = document.createElement('div');

	if (config && config.hasProgress == false) {
		this.hasProgress = false;
	} else {
		this.hasProgress = true;
	}

	if (this.hasProgress) {
		$(element).append(progress);
		$(progress).addClass('progress').css({
			'margin-top': '20px',
			'width': '50%',
			'display': 'flex',
		})

		// 进度条进度区
		for (let i = 0; i < 100; i++) {
			const span = document.createElement('span');
			$(progress).append(span);
			$(span).css('width', '100%');
		}
	}

	// 更新显示文本
	this.updateText = function (text) {
		$(text_dom).text(text);
	}

	// 更新进度条
	this.updateRange = function (range) {
		if (range % 0.05 == 0) {
			console.log(range * 100);
		}
		range = Math.round(range * 100);
		this.updateText('已' + text + range + '%');
		if (this.hasProgress) $(progress).find('>span:nth-child(-n+' + range + ')').css('background-color', '#337ab7');
	}

	// 移除进度界面
	this.remove = function () {
		$(element).remove();
	}
};

function loadingPDMS(rvmUrl,attUrl) {
	let loadingBox = new LoadingBox('加载');
	new PDMSLoader().load(
		"./js/rvm_att/sbytcout.js",
		"./js/rvm_att/sbytc.ATT",
		// "./js/rvm_att/项目120190611060651out.js",
		// "http://192.168.0.110/files/RVM/sbytc20190611070114out.js",
		// "http://192.168.0.110/files/ATT/sbytc20190611070126.ATT",
		// rvmUrl,
		// attUrl,
		function (data) {
			console.log(data);
			// if (data.dataType == "group") scene.add(data.data);
			// if (data.PDMSObject) scene.add(data.PDMSObject);
			if (data.rvmTree) {
				const list = [];
				rvmOriginal = data.original;
				fill_tree_list(list, data.rvmTree);
				mulushu(list);
			}
			if (data.PDMSObject) {
				scene.add(data.PDMSObject);

				$('#nav>.menu-area>.file-box>ul>.export>ul>li>a').click(function () {

					let target = data.PDMSObject;
					let fileName = data.PDMSObject.name == '' ? 'PDMS导出文件' : data.PDMSObject.name;

					if (selected_mesh) {
						target = selected_mesh;

						let with_name_parent = selected_mesh;
						while (with_name_parent.name == '') {
							with_name_parent = with_name_parent.parent;
						}

						fileName = with_name_parent.name;
					}

					downloadGLTF(target, fileName);
				});
			};
			loadingBox.remove();
		},
		function (complete) {
			loadingBox.updateRange(complete);
		}
	);
};


var model;//模型本身

//鼠标事件变量
let mousedown = false;
let mousemove = false;
let selected_mesh;

var last_emissive_array = [];
var getData = location.search;
var projectname = new Object();
if (getData.indexOf("?") != -1) {
	projectname = getData.substring(getData.indexOf("=") + 1, getData.length);
}
// console.log(projectname);
var list = [];

// window.onload = function (event) {
// 	console.log(123);



// 	// showarea.style.display = "block";
// 	// var lastDate = new Date();//获取系统当前时间
// 	// console.log("页面加载完成：" +  lastDate.toLocaleString());
// }

$(function () {

	init(name, list);
	$('#loading').hide();
})

// var back = document.getElementById("back");
// back.onclick = function() {
// 	window.location.href= "index.html";
// }

let rvmOriginal;

let water;
let seaActioin = false;
let renderer;
let camera;
let out_camera;
let out_controls;
let view_controller; //视角球控制
let view_controller_renderer; //视角球控制
var pixelBuffer = new Uint8Array( 4 );
let pickingRenderTarget
let geoIdArray
let geoCountArray
function init(name, list) {
	console.log('进入threejs场景init')
	var container = document.getElementById("container");

	const width = $('#container').width();
	const height = $('#container').height();

	camera = new THREE.PerspectiveCamera(45, width / height, 1, 200000000);
	// camera.position.set(100, 200, 300);
	camera.position.set(0, 0, 100);
	out_camera = camera

	controls = new THREE.OrbitControls(camera, container, update_view_controller);
	controls.target.set(0, 0, 0);
	controls.update();
	out_controls = controls

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xf0f0f0);
	//scene.fog = new THREE.Fog(0xa0a0a0, 200, 2000);

	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);
	renderer.shadowMap.enabled = true;
	container.appendChild(renderer.domElement);
	renderer.domElement.addEventListener('mousedown', mousedown, false);
	renderer.domElement.addEventListener('mousemove', mousemove, false);
	renderer.domElement.addEventListener('mouseup', mouseup, false);

	var A_light = new THREE.AmbientLight(0x404040, 2); // soft white light
	scene.add(A_light);
	// light = new THREE.PointLight( 0xffffff, 1, 230000 );
	// camera.add(light)
	// scene.add(camera)

	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 200, 100);
	light.castShadow = true;
	light.shadow.camera.top = 180;
	light.shadow.camera.bottom = -100;
	light.shadow.camera.left = -120;
	light.shadow.camera.right = 120;
	scene.add(light);
	
	pickingRenderTarget = new THREE.WebGLRenderTarget(
		window.innerWidth, window.innerHeight
	);
	pickingRenderTarget.texture.generateMipmaps = false;
	pickingRenderTarget.texture.minFilter = THREE.NearestFilter;
			
	// Water
	var waterGeometry = new THREE.CircleBufferGeometry(100000, 16);

	water = new THREE.Water(
		waterGeometry,
		{
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load('./img/waternormals.jpg', function (texture) {

				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

			}),
			alpha: 0.9,
			size: 0.1,
			sunDirection: light.position.clone().normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 3.7,
			fog: scene.fog !== undefined
		}
	);

	water.rotation.x = - Math.PI / 2;
	water.visible = false;
	scene.add(water);

	// Skybox
	var sky = new THREE.Sky();

	var uniforms = sky.material.uniforms;

	uniforms['turbidity'].value = 10;
	uniforms['rayleigh'].value = 2;
	uniforms['luminance'].value = 1;
	uniforms['mieCoefficient'].value = 0.005;
	uniforms['mieDirectionalG'].value = 0.8;

	var parameters = {
		distance: 400,
		inclination: 0.44,
		azimuth: 0.205
	};

	var cubeCamera = new THREE.CubeCamera(0.1, 1, 512);
	cubeCamera.renderTarget.texture.generateMipmaps = true;
	cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;


	function updateSun() {

		var theta = Math.PI * (parameters.inclination - 0.5);
		var phi = 2 * Math.PI * (parameters.azimuth - 0.5);

		light.position.x = parameters.distance * Math.cos(phi);
		light.position.y = parameters.distance * Math.sin(phi) * Math.sin(theta);
		light.position.z = parameters.distance * Math.sin(phi) * Math.cos(theta);

		sky.material.uniforms['sunPosition'].value = light.position.copy(light.position);
		water.material.uniforms['sunDirection'].value.copy(light.position).normalize();

		cubeCamera.update(renderer, sky);

	}

	updateSun();

	// 海水开关按钮
	$('#controller-tool-bar>.water>.icon').click(function () {
		$(this).parent().toggleClass('on');

		if ($(this).parent().hasClass('on')) {
			scene.background = cubeCamera.renderTarget;
			seaActioin = water.visible = true;
		} else {
			scene.background = new THREE.Color(0xf0f0f0);
			seaActioin = water.visible = false;
		}
	})

	// ground
	// var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({
	// 	color: 0x999999,
	// 	depthWrite: false
	// }));
	// mesh.rotation.x = -Math.PI / 2;
	// mesh.receiveShadow = true;
	// scene.add(mesh);

	// var grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
	// grid.material.opacity = 0.2;
	// grid.material.transparent = true;
	// scene.add(grid);

	loadingPDMS();

	onWindowResize()
	window.addEventListener('resize', onWindowResize, false);

	animate2();
	var data;

	function onWindowResize() {
		const width = $('#container').width();
		const height = $('#container').height();
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
		pickingRenderTarget.setSize( width, height );
	}
	function mousedown() {
		mousedown = true;
	}
	function mousemove() {
		if (mousedown)
			mousemove = true;
	}
	function mouseup(e) {
		console.log('mouseup')
		mousedown = false
		if (mousemove) {
			mousemove = false;
		} else {//是一次纯点击事件，触发clik
			console.log('是一次纯点击事件，触发clik')
			// let raycaster = new THREE.Raycaster(); //射线
			let mouse = new THREE.Vector2(); //鼠标位置
			mouse.x = e.offsetX;
			mouse.y = e.offsetY;

			//左侧目录树关联的变回去
			for (let i = 0; i < last_emissive_array.length; i++) {
				last_emissive_array[i].material.emissive.r = 0;
			}


			
			let record = scene.children[scene.children.length-1].children[0].material;
			scene.children[scene.children.length-1].children[0].material = pickingMaterial
			
			renderer.setRenderTarget(pickingRenderTarget);
			renderer.render( scene.children[scene.children.length-1].children[0], camera);
			renderer.setRenderTarget();
			scene.children[scene.children.length-1].children[0].material = record;
			
			console.log(pickingRenderTarget)
			renderer.readRenderTargetPixels(
				pickingRenderTarget,
				mouse.x,
				pickingRenderTarget.height - mouse.y,
				1,
				1,
				pixelBuffer
			);
			console.log(mouse)
			console.log(pixelBuffer)
			var index =
				( pixelBuffer[ 0 ] << 16 ) |
				( pixelBuffer[ 1 ] << 8 ) |
				( pixelBuffer[ 2 ] );
				
			console.log('你点击的构件index是',index)
			
			
			let array = scene.children[3].children[0].geometry.attributes.color.array
			let lastcolor_info = scene.children[3].children[0].geometry.lastcolor_info
			//还原上次原色
			console.log('lastcolor_info',scene.children[3].children[0].geometry)
			console.log('lastcolor_info',lastcolor_info)
			if(lastcolor_info){
				for(let i=3*lastcolor_info.start;i<3*lastcolor_info.end+1;i+=3){
					array[i] = lastcolor_info.r;
					array[i+1] = lastcolor_info.g;
					array[i+2] = lastcolor_info.b;
				}
			}
			
			if(index>15000000){
				console.log('什么都没选到')
				// scene.children[3].children[0].geometry
				return
			}
				
			console.log('geoIdArray',geoIdArray[index])
			console.log('geoCountArray',geoCountArray[index])
			
			let start 
			if(index == 0)
				start = 0;
			else 
				start = geoCountArray[index-1]+1
			
			let end = geoCountArray[index]
			
			console.warn('start,end',start,end)
			
			
			//记录这次颜色
			let r = array[3*start];
			let g = array[3*start+1];
			let b = array[3*start+2];
			
			lastcolor_info = {start:start,end:end,r:r,g:g,b:b}
			scene.children[3].children[0].geometry.lastcolor_info = lastcolor_info
			
			//这次的变红
			for(let i=3*start;i<3*end+1;i+=3){
				array[i] = 1;
				array[i+1] = 0;
				array[i+2] = 0;
			}
			
			//needupdate
			scene.children[3].children[0].geometry.attributes.color.needsUpdate = true;
			return
			
			if (selected_mesh)
				selected_mesh.material.emissive.r = 0;
			let intersect = raycaster.intersectObject(model, true);
			if (intersect[0]) {
				console.log(intersect[0].object);
				$('#inquery_texture').show();
				selected_mesh = intersect[0].object;
				console.log(selected_mesh)
				selected_mesh.material.emissiveIntensity = 1
				selected_mesh.material.emissive.r = 1;

				$('.mask-box.info-box').show();

				let with_name_parent = selected_mesh;
				while (with_name_parent.name == "") {
					console.log('循环一次')
					with_name_parent = with_name_parent.parent;
				}

				let result_name = with_name_parent.name;
				console.log(result_name)
				$('.mask-box.info-box>.content>.line-name>.value').text(result_name);


			} else {

				$('#inquery_texture').hide();
				$('.mask-box.info-box').hide();
			}
		}
	}
	var animate1 = animate2;

	// buildmodel(list);

	$('#loading').hide();
}
function animate2() {
	requestAnimationFrame(animate2);

	if (seaActioin) {
		water.material.uniforms['time'].value += 5.0 / 60.0;
	}

	if (renderer) {
		renderer.render(scene, camera);
		viewMovement();
	}
}

/**
 * @name 获取目录树列表信息
 * @param {array} list 待填充的数组
 * @param {*} data 待解析数据
 */
function fill_tree_list(list, data) {
	const new_data = {
		id: data.ID,
		pId: data.PID,
		name: data.NAME
	}
	if (data.children && data.children.length > 0) {
		new_data.isParent = true;
		const length = data.children.length
		for (let i = 0; i < length; i++) {
			const item = data.children[i];
			fill_tree_list(list, item);
		}
	} else {
		new_data.isParent = false;
	}

	list.push(new_data);
};

/** 获取所有关联的id数组
 * @param {*} obj 选取对象
 * @returns [] array; 数组
 */
function getAllRelationIds(obj) {
	let array = [];
	function recursion(n) {
		// 存在构建则添加该构建ID到数组中
		if (n.PRIMS.length > 0) {
			array.push(n.ID);
		};
		let child = n.children,
			len = child.length;
		if (len > 0) {
			for (let i = 0; i < len; i++) {
				recursion(child[i])
			};
		};
	};
	recursion(obj);
	return array;
};

//提取信息生成目录树
function mulushu(list) {
	var setting = {
		data: {
			simpleData: {
				enable: true,
				idKey: "id",
				pIdKey: "pId",
				rootPId: null
			}
		},
		callback: {
			onClick: nodeClick,
			onExpand: function (event, treeId, treeNode) {
				//console.log(treeNode);
				addSubNode(treeNode);
			}
		}
	};

	var list2 = [];
	var len = list.length;
	for (var i = 0; i < len; i++) {
		if (list[i].pId == 0)
			list2.push(list[i]);
	}

	//console.log(list2);
	var zNodes = list2;

	var zTree = $.fn.zTree.init($("#treebg"), setting, zNodes);

	// setTimeout(function () {
	var treeObj = $.fn.zTree.getZTreeObj("treebg");
	var nodes = treeObj.getNodes();
	for (var i = 0; i < nodes.length; i++) { //设置节点展开
		treeObj.expandNode(nodes[i], true, false, true);
	}
	// addSubNode(nodes[0]);
	console.log('自动展开')
	// }, 3000)
	function nodeClick(event, treeId, treeNode, clickFlag) {
		console.log(treeNode);
		console.log(rvmOriginal[treeNode.id]);
		setInfoPanel(rvmOriginal[treeNode.id]);
		console.log(getAllRelationIds(rvmOriginal[treeNode.id]));
		

		// for (let i = 0; i < last_emissive_array.length; i++) {
		// 	last_emissive_array[i].material.emissive.r = 0;
		// }
		// lightallchildren(model.getObjectByName(treeNode.name));
		// if (selected_mesh) selected_mesh.material.emissive.r = 0;
	}

	function addSubNode(treeNode) {
		if (!treeNode.isParent) return;
		var s = treeNode.children;
		if (s != undefined)
			return;
		var data0 = [];
		for (var i = 0; i < list.length; i++) {
			if (list[i].pId == treeNode.id) {
				data0.push(list[i]);
			}
		}
		zTree.addNodes(treeNode, data0);
	}

	function lightallchildren(obj) {
		// console.log(obj);
		if (obj.material) {
			obj.material.emissive.r = 1;
			obj.material.emissiveIntensity = 1
			last_emissive_array.push(obj)
		} else {
			if (obj.type == 'Group') {
				for (let i = 0; i < obj.length; i++) {
					lightallchildren(obj[i]);
				}
			}
		}
	}
}

//载入模型
function buildmodel(list) {
	console.log('进入模型加载')
	var loader = new THREE.FBXLoader();
	var group = new THREE.Group();
	group.name = name;
	// $('#loading').css("z-index",100);
	// $('#inquery_texture').hide();
	// 导出事件绑定
	$('#nav>.menu-area>.file-box>ul>.export>ul>li>a').click(function () {
		const this_key = $(this).attr('data-key');

		let target = group;
		let fileName = projectname;

		if (selected_mesh) {
			target = selected_mesh;

			let with_name_parent = selected_mesh;
			while (with_name_parent.name == '') {
				with_name_parent = with_name_parent.parent;
			}

			fileName = with_name_parent.name;
		}

		if (this_key == 'obj') {
			downloadOBJ(target, fileName);
		} else if (this_key == 'gltf') {
			downloadGLTF(target, fileName);
		} else if (this_key == 'collada') {
			exportCollada(target, fileName)
		}
	})

	let solving = false; // 正在解析

	loader.load('./model/' + projectname + '.toolkippdms', function (object) {
		console.warn('模型加载成功')
		create_view_controller()
		update_view_controller()
		model = object;
		group.add(object)
		//找到模型中心点，重新适配模型位置、相机位置、相机目标和control目标
		var max = { x: -Infinity, y: -Infinity, z: -Infinity }
		var min = { x: Infinity, y: Infinity, z: Infinity }

		group.traverse(function (o) {
			if (o.geometry) {
				if (!o.geometry.boundingBox) {
					o.geometry.computeBoundingBox();
				}
				let bbox = o.geometry.boundingBox

				if (bbox.min.x < min.x) min.x = bbox.min.x
				if (bbox.min.y < min.y) min.y = bbox.min.y
				if (bbox.min.z < min.z) min.z = bbox.min.z
				if (bbox.max.x > max.x) max.x = bbox.max.x
				if (bbox.max.y > max.y) max.y = bbox.max.y
				if (bbox.max.z > max.z) max.z = bbox.max.z
			}
		})
		console.log(min.x, min.y, min.z, max.x, max.y, max.z);
		// var axesHelper = new THREE.AxesHelper( 50 );
		// scene.add( axesHelper );	

		let k_scale = 500 / (max.y - min.y);
		k_scale /= 1000;
		if (projectname == 'project3') {
			k_scale *= 1000;
			group.rotation.x = -Math.PI / 2
			model.position.set(-100, -120, 0)
		}
		console.warn('缩放指数', k_scale)
		group.scale.set(k_scale, k_scale, k_scale)

		var xmid = (max.x + min.x) / 2;
		var zmid = (max.x + min.y) / 2;
		group.position.set(- xmid, -min.y, - zmid);

		var C_pos = new THREE.Vector3(1000, 1000, 1000);
		//console.log(newtarget);
		//console.log(newcpos);
		camera.position.set(C_pos.x, C_pos.y, C_pos.z);
		// console.warn('模型和相机分别移动到',group.position,camera.position)
		camera.lookAt(0, 0, 0);
		// controls.target.set(newtarget.x, newtarget.y, newtarget.z);
		// controls.update();

		merge_obj_children(group)
		function merge_obj_children(obj) {    //merge外部导入模型的同材质到一个数组
			console.log('进入合并函数')

			let delete_array = []
			obj.traverse(function (o) {
				// console.log(o)
				if (o.type == "Group" && o.children.length == 0 || ['Mesh', 'Line'].indexOf(o.type) > -1 && (!o.geometry.attributes.position || o.geometry.attributes.position.count == 0)) {

					// console.log('添加到待删除数组',o)
					delete_array.push(o)
				}
			})
			for (let i = 0; i < delete_array.length; i++) {
				// console.log('移除空的group',o)
				const o = delete_array[i];
				o.parent.remove(o)
			}

			let parent_array = [];
			obj.traverse(function (o) {
				// console.log(o)
				if (o.type == "Group" && o.children.length > 1 && is_no_children_group(o) && is_children_same_kind(o)) {//符合要求,merge其中的children mesh
					// console.warn('找到一个符合要求的group,加入到待merge数组里');
					parent_array.push(o)
				}
			})
			// console.log('parent_array',parent_array)
			for (let i = 0; i < parent_array.length; i++) {
				const o = parent_array[i];
				// console.log('运行函数',o)
				let geometry_array = [];
				for (let i = 0; i < o.children.length; i++) {
					const o1 = o.children[i];
					if (o1.geometry) geometry_array.push(o1.geometry);
				}

				// console.log(geometry_array)
				//开始进行合并
				// console.warn('合并成功了一次0')
				let merged_geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometry_array);
				// console.warn('合并成功了一次1',o)
				let merged_mesh = new THREE.Mesh(merged_geometry, o.children[0].material)
				// console.warn('合并成功了一次2')
				o.children = []
				o.add(merged_mesh)
				// console.warn('合并成功了一次')
			}

			//是否是空的group
			function is_no_children_group(o) {
				for (let i = 0; i < o.children.length; i++) {
					const c = o.children[i];
					if (c.type == 'Group') {
						return false
					}
				}
				return true;
			}

			//children是不是一个种类
			function is_children_same_kind(group) {
				let kind = group.children[0].type;
				for (let i = 0; i < group.children.length; i++) {
					const o = group.children[i];
					if (o.type != kind)
						return false
				}
				return true
			}


			console.warn('merge成功')
			// return group;
		}
		console.warn('开始目录树载入')
		var json_array = []
		read_ztree(group.children[0], json_array, 0);
		console.log('目录树', json_array)
		mulushu(json_array);
		$('#loading').hide();
	}, function (xhr) {
		const rate = xhr.loaded / xhr.total;
		if (rate > 0.9) {
			if (!solving) { // 若未进入处理状态
				$('#loading>.text').text('解析中...');
				$('#loading>img').attr('src', './img/solving.gif')
				$('#loading>.progress.load').hide();

				solving = true; // 进入处理状态
			}
		} else {
			const range = "".concat(parseInt(rate * 100), "%");
			$('#loading>.progress.load>.progress-bar').css('width', range).text(range);
		}

		// $('#loadingText').text(parseInt(  * 100 )+'%')
		// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		// if(xhr.loaded / xhr.total * 100>90){
		// 	$('#loadingText').text('下载成功，正在解析')
		// }

	})

	group.position.set(0, 0, 0);
	scene.add(group);
}
function read_ztree(object, array, pid) {
	// console.log(object)
	let new_o = { pId: pid, name: object.name };
	if (pid != 0) {
		new_o.id = pid.toString() + (object.parent.children.indexOf(object) + 1).toString()
		new_o.id = parseInt(new_o.id)
	} else {
		new_o.id = 1;
		new_o.name == 'root_name'
	}
	array.push(new_o)
	if (object.children.length > 0) {
		new_o.isParent = true;
		for (let i = 0; i < object.children.length; i++) {
			const o = object.children[i];
			read_ztree(o, array, new_o.id)
		}
	} else {
		new_o.isParent = false
		return;
	}
}
function getData(name) {
	list = [];
	var startDate = new Date();//获取系统当前时间
	console.log("开始取数据的时间：" + startDate.toLocaleString());
	$.ajax({
		type: 'post',
		async: false,
		dataType: 'json',
		url: 'selectxml.action',
		data: { projectname: name },
		success: function (data) {
			data0 = eval(data);
			var endDate = new Date();//获取系统当前时间
			console.log("获取到数据的时间：" + endDate.toLocaleString());

			for (var i = 0; i < data0.length; i++) {
				var obj = {};
				obj.id = parseInt(data0[i].id);
				obj.pId = parseInt(data0[i].pid);
				obj.type = data0[i].type;
				obj.name = data0[i].name;
				if (data0[i].model != "null") {
					obj.model = JSON.parse(data0[i].model);
				} else {
					obj.model = "null";
				}
				if (data0[i].isparent == "true") {
					obj.isParent = true;
				} else {
					obj.isParent = false;
				}
				list.push(obj);
			}
		}
	});
}

$('#inquery_texture img').click(function () {
	console.log($(this)[0].src)
	var texture = new THREE.TextureLoader().load($(this)[0].src, function (map) {

		let g = selected_mesh.geometry;
		let bbox_center = g.bbox_center;
		if (!g.faceVertexUvs)
			g = new THREE.Geometry().fromBufferGeometry(selected_mesh.geometry)

		console.log(g)

		if (!g.boundingBox)
			g.computeBoundingBox();

		var box = g.boundingBox;
		var detaX = box.max.x - box.min.x;
		var detaY = box.max.y - box.min.y;
		var detaZ = box.max.z - box.min.z;
		let shortest;
		if (detaZ < detaX && detaZ < detaY)
			shortest = 'z'
		if (detaY < detaX && detaY < detaZ)
			shortest = 'y'
		if (detaX < detaZ && detaX < detaY)
			shortest = 'x'

		var faceLength = g.faces.length; //面数
		var v = g.vertices; //顶点数组
		//核心部分，修正uv坐标
		g.faceVertexUvs = [[]]
		for (var i = 0; i <= faceLength - 1; i++) { //遍历每个面
			for (var z = 0; z < 3; z++) { //三角形
				var a = "";
				if (z == 0) a = "a";
				if (z == 1) a = "b";
				if (z == 2) a = "c";

				g.faceVertexUvs[0].push([{ x: null, y: null }, { x: null, y: null }, { x: null, y: null }])
				switch (shortest) {
					case 'x':
						g.faceVertexUvs[0][i][z].x = (v[g.faces[i][a]].y - box.min.y) / (detaY);
						g.faceVertexUvs[0][i][z].y = 1 - ((v[g.faces[i][a]].z - box.min.z) / (detaZ));
						break;
					case 'y':
						g.faceVertexUvs[0][i][z].x = (v[g.faces[i][a]].x - box.min.x) / (detaX);
						g.faceVertexUvs[0][i][z].y = 1 - ((v[g.faces[i][a]].z - box.min.z) / (detaZ));
						break;
					default:
						console.log()
						g.faceVertexUvs[0][i][z].x = (v[g.faces[i][a]].x - box.min.x) / (detaX);
						g.faceVertexUvs[0][i][z].y = 1 - ((v[g.faces[i][a]].y - box.min.y) / (detaY));

				}
			}
		}
		g.uvsNeedUpdate = true;
		g.bbox_center = bbox_center;
		selected_mesh.geometry = g;
		selected_mesh.geometry.needsUpdate = true;
		console.log(map)
		selected_mesh.material.color = new THREE.Color(0xffffff)
		selected_mesh.material.map = map;
		selected_mesh.material.needsUpdate = true;

	})
});

// 初始化文件树数据 （函数自动执行）
; (function showDossierTree() {

	$(".mask-box.dossier-box > .content.ztree").css("padding", "30px 50px");

	// 配置
	let setting = {
		data: {
			simpleData: {
				enable: true,
				idKey: "id",
				pIdKey: "pId",
				rootPId: 0
			}
		},
		callback: {
			onClick: function (event, treeId, treeNode, clickFlag) {
				if (treeNode.pId == 0) return;
				showMaskImg(treeNode.name, treeNode.pId);
			},
		}
	};

	// 节点数据
	let treeNodes = [
		{ "id": 1, "pId": 0, "name": "系统图" },
		{ "id": 2, "pId": 0, "name": "平面图" },
		{ "id": 3, "pId": 0, "name": "文档" },

		{ "id": 11, "pId": 1, "name": "系统图1.dwg" },
		{ "id": 12, "pId": 1, "name": "系统图2.dwg" },
		{ "id": 13, "pId": 1, "name": "系统图3.dwg" },

		{ "id": 21, "pId": 2, "name": "平面图1.dwg" },
		{ "id": 22, "pId": 2, "name": "平面图2.dwg" },
		{ "id": 23, "pId": 2, "name": "平面图3.dwg" },

		{ "id": 31, "pId": 3, "name": "文档1.pdf" },
		{ "id": 32, "pId": 3, "name": "文档2.pdf" },
		{ "id": 33, "pId": 3, "name": "文档3.pdf" }
	];

	//初始化zTree 数据
	$.fn.zTree.init($(".mask-box.dossier-box > .content.ztree"), setting, treeNodes);

}());

function showMaskImg(title, type) {
	$(".mask-img>.top>.title").html(title.substring(0, title.length - 4));
	$(".mask-img>.img").attr("class", "img");
	$(".mask-img>.img").addClass("img-type".concat(type));
	$(".mask-img").show();

};

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

function onKeyDown22(event) {

	switch (event.keyCode) {

		case 38: // up
		case 87: // w
			moveForward = true;
			break;

		case 37: // left
		case 65: // a
			moveLeft = true; break;

		case 40: // down
		case 83: // s
			moveBackward = true;
			break;

		case 39: // right
		case 68: // d
			moveRight = true;
			break;

		case 82: // r
			moveUp = true;
			break;

		case 70: // f
			moveDown = true;
			break;

		// case 32: // space
		//     if (canJump === true) velocity.y += 350;
		//     canJump = false;
		//     break;

	}

};
function onKeyUp22(event) {

	switch (event.keyCode) {

		case 38: // up
		case 87: // w
			moveForward = false;
			break;

		case 37: // left
		case 65: // a
			moveLeft = false;
			break;

		case 40: // down
		case 83: // s
			moveBackward = false;
			break;

		case 39: // right
		case 68: // d
			moveRight = false;
			break;

		case 82: // r
			moveUp = false;
			break;

		case 70: // f
			moveDown = false;
			break;

	}

};

var viewMovement = function () {
	// console.log('读取一次移动信息')

	let cameraP = camera.position;
	let targetP = controls.target;
	let camera_N = new THREE.Vector2(targetP.x - cameraP.x, targetP.z - cameraP.z);
	camera_N.normalize();
	let camera_right_N = camera_N.clone().rotateAround(new THREE.Vector2(0, 0), Math.PI * 0.5);


	let up = Number(moveForward) - Number(moveBackward);
	let right = Number(moveLeft) - Number(moveRight);

	let last_delta = new THREE.Vector2().subVectors(camera_N.multiplyScalar(up), camera_right_N.multiplyScalar(right));

	last_delta = new THREE.Vector3(last_delta.x, moveUp - moveDown, last_delta.y);

	camera.position.addScaledVector(last_delta, 4);
	controls.target.addScaledVector(last_delta, 4);

};
//建立视角球
function create_view_controller() {
	var camera, scene, renderer, light;
	var raycaster, mouse, controls;
	var box;
	const distance = 100; //相机距离远点距离
	var is_have_move = false;
	var domElement = document.createElement("canvas");
	domElement.width = 120
	domElement.height = 120
	document.body.appendChild(domElement)
	domElement.style.position = 'fixed';
	domElement.style.top = '106px';
	domElement.style.right = '14px';
	domElement.style.right = '14px';
	domElement.style.zIndex = 500;

	init();

	function init() {
		console.log('开始创建视角球')
		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(60, 1, 1, 2000);
		camera.position.set(0, 100, 0);


		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();

		renderer = new THREE.WebGLRenderer({ canvas: domElement, antialias: true, alpha: true });
		renderer.setSize(120, 120);
		view_controller_renderer = renderer;
		view_controller_renderer.out_render = function () { renderer.render(scene, camera); }

		var geometry = new THREE.BoxGeometry(50, 50, 50)
		var loader = new THREE.TextureLoader();
		loader.setPath('./img/view_controller/')
		var texture_arr = [];
		var pic_src_arr = ['btn_right_normal.png', 'btn_left_normal.png', 'btn_up_normal.png', 'btn_behind_normal.png', 'btn_front_normal.png']
		var pic_press_src_arr = ['btn_right_press.png', 'btn_left_press.png', 'btn_up_press.png', 'btn_behind_press.png', 'btn_front_press.png']

		var counter = 0;
		for (var i = 0; i < 5; i++) {
			texture_arr.push(loader.load(pic_src_arr[i],
				function () {
					counter++;
					if (counter == 5) {
						renderer.render(scene, camera);
					}
				}))
		}
		const color = 0xeeeeee
		var material = [
			new THREE.MeshBasicMaterial({ map: texture_arr[0], color: color }),
			new THREE.MeshBasicMaterial({ map: texture_arr[1], color: color }),
			new THREE.MeshBasicMaterial({ map: texture_arr[2], color: color }),
			new THREE.MeshBasicMaterial({ color: color }),
			new THREE.MeshBasicMaterial({ map: texture_arr[4], color: color }),
			new THREE.MeshBasicMaterial({ map: texture_arr[3], color: color })
		]

		var mesh = new THREE.Mesh(geometry, material);
		box = mesh
		// console.log(mesh)
		scene.add(mesh);

		var helper = generate_edgeHelper(geometry);
		helper.position.copy(mesh.position)
		mesh.add(helper);

		function generate_edgeHelper(geo) {
			var edges = new THREE.EdgesGeometry(geo);
			var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000 }))

			return line;
		}


		controls = new THREE.OrbitControls(camera, domElement, rotate_callBack);
		view_controller = controls;
		controls.maxPolarAngle = Math.PI * 0.5;
		controls.enablePan = false
		controls.minDistance = distance;
		controls.maxDistance = distance;

		domElement.addEventListener('mousedown', mousedown, false);
	}

	//视角球
	function rotate_callBack() {
		console.log('视角球旋转')

		view_controller.object.lookAt(0, 0, 0)
		renderer.render(scene, view_controller.object);
		let outTarget = out_controls.target;
		let Distance = out_camera.position.distanceTo(outTarget)
		out_camera.position.set(outTarget.x + Distance * (view_controller.object.position.x / distance), outTarget.y + Distance * (camera.position.y / distance), outTarget.z + Distance * (camera.position.z / distance))
		out_camera.lookAt(outTarget)
	}

	function mousedown() {
		is_have_move = false;
		domElement.addEventListener('mousemove', mousemove, false);
		domElement.addEventListener('mouseup', mouseup, false);
	}

	function mousemove(event) {
		is_have_move = true
	}

	function mouseup(event) {
		if (!is_have_move) {
			// console.log(event)
			// console.log(event.offsetX 
			mouse.x = (event.offsetX / domElement.clientWidth) * 2 - 1;
			mouse.y = -(event.offsetY / domElement.clientHeight) * 2 + 1;
			raycaster.setFromCamera(mouse, view_controller.object);

			var intersect = raycaster.intersectObject(box);
			console.log(11)
			if (intersect[0]) {
				console.log(22)
				// var materialIndex = intersect[0].face.materialIndex;
				// var position_record = view_controller.object.position.clone();
				// var sphere = new THREE.Spherical().setFromVector3(view_controller.object.position)
				// var delta;
				// console.log(sphere)
				// switch (materialIndex) {
				// case 0: //右边 Math.PI/2  MAth.PI/2
				// console.log('右')
				// if (sphere.theta > Math.PI / 2 || sphere.theta < -Math.PI / 2) {
				// delta = -0.02
				// } else {
				// delta = 0.02
				// }
				// var target = new THREE.Vector3(view_controller.maxDistance, 0, 0)
				// var distance_last;
				// var out = setInterval(function () {
				// sphere.theta += delta;
				// console.log('循环中')
				// view_controller.object.position.copy(new THREE.Vector3().setFromSpherical(sphere))

				// rotate_callBack()
				// console.log(camera.position,camera.position.distanceTo(target))
				// new_distance = view_controller.object.position.distanceTo(target)
				// if (new_distance > distance_last) {
				// console.log('循环终止')
				// view_controller.object.position.copy(target)
				// clearInterval(out)
				// } else {
				// distance_last = new_distance;
				// }
				// }, 16)
				// break
				// case 1: //左  -Math.PI/2  MAth.PI/2
				// console.log('左')
				// if (sphere.theta > Math.PI / 2 || sphere.theta < -Math.PI / 2) {
				// delta = 0.02
				// } else {
				// delta = -0.02
				// }
				// var target = new THREE.Vector3(-controls.maxDistance, 0, 0)
				// var distance_last;
				// var out = setInterval(function () {
				// sphere.theta += delta;
				// console.log('循环中')
				// view_controller.object.position.copy(new THREE.Vector3().setFromSpherical(sphere))

				// rotate_callBack()
				// console.log(camera.position,camera.position.distanceTo(target))
				// new_distance = view_controller.object.position.distanceTo(target)
				// if (new_distance > distance_last) {
				// console.log('循环终止')
				// view_controller.object.position.copy(target)
				// clearInterval(out)
				// } else {
				// distance_last = new_distance;
				// }
				// }, 16)
				// break
				// case 2: //上  Math.PI/2 
				// console.log('上')
				// delta = 0.02
				// var target = new THREE.Vector3(0, view_controller.maxDistance, 0).add(new THREE.Vector3(camera.position.x, 0, camera.position.z).normalize())
				// var distance_last = view_controller.object.position.distanceTo(target);
				// var out = setInterval(function () {
				// sphere.phi -= delta;
				// console.log('循环中')
				// view_controller.object.position.copy(new THREE.Vector3().setFromSpherical(sphere))

				// console.log(camera.position,camera.position.distanceTo(target))
				// new_distance = view_controller.object.position.distanceTo(target)
				// if (new_distance > distance_last) {
				// console.log('循环终止')
				// view_controller.object.position.copy(target)
				// console.log(view_controller.object.position)
				// clearInterval(out)
				// } else {
				// distance_last = new_distance;
				// }
				// rotate_callBack()
				// }, 16)
				// break
				// case 3:
				// break
				// case 4: //前	Math.PI/2  0
				// if (sphere.theta > 0) {
				// delta = -0.02
				// } else {
				// delta = 0.02
				// }
				// var target = new THREE.Vector3(0, 0, controls.maxDistance).add(new THREE.Vector3(camera.position.x, 0, camera.position.z).normalize())
				// var distance_last;
				// var out = setInterval(function () {
				// sphere.theta += delta;
				// console.log('循环中')
				// view_controller.object.position.copy(new THREE.Vector3().setFromSpherical(sphere))

				// rotate_callBack()
				// console.log(camera.position,camera.position.distanceTo(target))
				// new_distance = view_controller.object.position.distanceTo(target)
				// if (new_distance > distance_last) {
				// console.log('循环终止')
				// view_controller.object.position.copy(target)
				// clearInterval(out)
				// } else {
				// distance_last = new_distance;
				// }
				// }, 16)
				// break
				// case 5: //后	Math.PI/2  Math.PI
				// console.log('后')
				// if (sphere.theta > 0) {
				// delta = 0.02
				// } else {
				// delta = -0.02
				// }
				// var target = new THREE.Vector3(0, 0, -view_controller.maxDistance)
				// var distance_last;
				// var out = setInterval(function () {
				// sphere.theta += delta;
				// console.log('循环中')
				// view_controller.object.position.copy(new THREE.Vector3().setFromSpherical(sphere))

				// rotate_callBack()
				// console.log(camera.position,camera.position.distanceTo(target))
				// new_distance = view_controller.object.position.distanceTo(target)
				// if (new_distance > distance_last) {
				// console.log('循环终止')
				// view_controller.object.position.copy(target)
				// clearInterval(out)
				// } else {
				// distance_last = new_distance;
				// }
				// }, 16)
				// break
				// }
			}
			domElement.removeEventListener('mousemove', mousemove, false);
			domElement.removeEventListener('mouseup', mouseup, false);
		}
	}
}

function update_view_controller() { //更新右上角视角球
	// console.log('更新右上角视角球')
	const distance = view_controller.minDistance;
	let outTarget = controls.target;
	let Distance = camera.position.distanceTo(outTarget)
	view_controller.object.position.set(distance * ((camera.position.x - outTarget.x) / Distance), distance * ((camera.position.y - outTarget.y) / Distance), distance * ((camera.position.z - outTarget.z) / Distance))
	view_controller.object.lookAt(0, 0, 0)

	view_controller_renderer.out_render()
}

$('.seleced-record-button').click(function () {
	$('.select-record').show()
});
$('.recover-color-button').click(function () {
	selected_mesh.material.map = null;
});

let time = 1
let times = 0
function expl(group, scale) {
	group.traverse(function (o) {
		if (o.geometry)
			o.position.copy(o.geometry.bbox_center.multiplyScalar(scale))
	})
};
$('.explode').click(function () {
	if ($('.explode').text() == '还原') {
		time = 1
		times = 0
		explode_recover()
		$('.explode').text('分解')
		return
	}

	scene.children[3].traverse(function (o) {
		if (o.geometry) {
			if (!o.geometry.boundingBox)
				o.geometry.computeBoundingBox()


			let center = new THREE.Vector3()
			o.geometry.boundingBox.getCenter(center)
			o.geometry.bbox_center = center;
		}
	})


	expl(scene.children[3], 1.25)
	$('.explode').text('还原')

})

function explode_recover() {
	expl(scene.children[3], 0)

}



function setInfoPanel(json) {

	let array = Object.keys(json);
	let len = array.length;

	let str = "";
	for (let i = 0; i < len; i++) {
		let e = array[i];
		let newElement = (e[0] != ":") ? e : e.substr(1);//删除数据键值上第一位是冒号的符号
		str += "<li><div>" + newElement + "</div>";
		str += "<span>" + json[e] + "</span></li>";
	};

	$("#right-info-panel > .info-panel").html(str);
	$("#right-info-panel").show();

};

