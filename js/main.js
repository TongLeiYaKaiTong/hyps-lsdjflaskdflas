
//1.根据后台显示项目
var container = document.getElementById("container");
var ask = document.getElementById("ask");
var showarea = document.getElementById("showarea");
var top2 = document.getElementById("top2");
var showall = document.getElementById("showall");
var yes = document.getElementById("submit");
var projectname = "";
var project = [{
	name: "project1",
}, {
	name: "project2",
}, {
	name: "project3",
}];

var imgUrl = [];
imgUrl.push("./img/project1.png");
imgUrl.push("./img/project2.png");
imgUrl.push("./img/project3.png");

var askbg = document.getElementById("askbg");
var askdiv = document.getElementById("askdiv");
var newgroup;
var swidth = 330;
var sheight = 248;
var lwidth = 54;
var lheight = 45;

for(var i = 0; i < project.length; i++) {
	var projdiv = document.createElement("div");
	showall.appendChild(projdiv);
	projdiv.style.cssText = "position:absolute;top:" + (parseInt(i / 3) * (sheight + lheight)) + "px;left:" + (i % 3 * (swidth + lwidth)) + "px;width:330px;height:248px;border-radius:5px;cursor:pointer;";
	projdiv.nid = project[i].name;

	var titlediv = document.createElement("div");
	projdiv.appendChild(titlediv);
	titlediv.style.cssText = "position:absolute;left:0px;bottom:0px;width:100%;height:60px;background: #FFFFFF;"
	titlediv.nid = project[i].name;

	var title = document.createElement("div");
	titlediv.appendChild(title);
	title.style.cssText = "color:#484848;position:absolute;left:19px;top:50%;height:20px;margin-top: -10px;font-size: 14px;";
	title.innerHTML = project[i].name;
	title.nid = project[i].name;

	var pic = document.createElement("img");
	projdiv.appendChild(pic);
	pic.style.cssText = "position:absolute;left:0px;top:0px;width:100%;height:188px;";
	pic.src = imgUrl[i]
	pic.nid = project[i].name;

	projdiv.onclick = function(event) {
		var target = event.srcElement.nid;
		askbg.style.display = "block";
		ask.innerHTML = "是否进入" + target + "管理场景？";
		projectname = target;
	}
}
var list=[];
submit.onclick = function(event) {
	askbg.style.display = "none";
	loading.style.display = "block";
	console.log(projectname);
	window.location.href= "project.html?name=" + projectname;
}

var cancel = document.getElementById("cancel");
cancel.onclick = function() {
	askbg.style.display = "none";
}
var cancel2 = document.getElementById("cancel2");
cancel2.onclick = function() {
	askbg.style.display = "none";
}

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
			onExpand: function(event, treeId, treeNode) {
				//console.log(treeNode);
				addSubNode(treeNode);
			}
		}
	};

	var list2 = [];
	var len = list.length;
	for(var i = 0; i < len; i++) {
		if(list[i].pId == 0)
			list2.push(list[i]);
	}

	//console.log(list2);
	var zNodes = list2;

	var zTree = $.fn.zTree.init($("#treebg"), setting, zNodes);
	
	function nodeClick(event, treeId, treeNode, clickFlag) {
		//console.log(treeNode);
		lightallchildren(treeNode);
	}

	function addSubNode(treeNode) {
		if(!treeNode.isParent) return;
		var s = treeNode.children;
		if(s != undefined)
			return;
		var data0 = [];
		for(var i = 0; i < list.length; i++) {
			if(list[i].pId == treeNode.id) {
				data0.push(list[i]);
			}
		}
		zTree.addNodes(treeNode, data0);
	}

	function lightallchildren(treeNode) {
		//console.log(treeNode.children);
		var childlist = [];
		if(treeNode.allchildren == undefined) {
			findthischild(treeNode);
			treeNode.allchildren = childlist;
		}
		for(var i = 0; i < newgroup.children.length; i++) {
			var obj = newgroup.children[i];
			obj.material.emissive.r = 0;
		}
		for(var i = 0; i < treeNode.allchildren.length; i++) {
			var obj = scene.getObjectByName(childlist[i]);
			if(obj!=undefined && obj.material!=undefined){
				obj.material.emissive.r = 1;
			}
		}
		function findthischild(treeNode) {
			if(treeNode.type == "Mesh") {
				childlist.push(treeNode.name);
			}
			if(treeNode.type == "Group") {
				var count = 0;
				for(var i = 0; i < list.length; i++) {
					if(list[i].pId == treeNode.id) {
						count++;
					}
				}
				if(count > 0) {
					for(var i = 0; i < list.length; i++) {
						if(list[i].pId == treeNode.id) {
							findthischild(list[i]);
						}
					}
				}
			}
		}
	}
}


function getData(name){
	list=[];
	var startDate = new Date();//获取系统当前时间
	console.log("开始取数据的时间：" +  startDate.toLocaleString());
	$.ajax({
		type: 'post',
		async: false,
		dataType: 'json',
		url: 'selectxml.action',
		data: {projectname:name},
		success: function (data) {
			data0 = eval(data);
			var endDate = new Date();//获取系统当前时间
			console.log("获取到数据的时间：" +  endDate.toLocaleString());
			
			for(var i = 0; i < data0.length; i++) {
				var obj = {};
				obj.id = parseInt(data0[i].id);
				obj.pId = parseInt(data0[i].pid);
				obj.type = data0[i].type;
				obj.name = data0[i].name;
				if(data0[i].model != "null") {
					obj.model = JSON.parse(data0[i].model);
				} else {
					obj.model = "null";
				}
				if(data0[i].isparent == "true") {
					obj.isParent = true;
				} else {
					obj.isParent = false;
				}
				list.push(obj);
			}
		}
	});
}