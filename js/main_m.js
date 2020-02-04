//url
//var globalHttp = "http://192.168.0.110/seervmWebService1.asmx/";
var globalHttp = "http://121.40.174.117:6060/seervmWebService1.asmx/";

window.onload = function(){
	//--------------------点击事件---------------
	//#文件>打开
	$("#nav>.menu-area .open").click(function(){
		$("#chooseFile").show();
		//获取服务器文件
		getAllFiles();
	});
	//#删除 ,#取消 
	$("#chooseFile>.title>.delete,.submissionArea>.buttonPane>#no").click(function(){
		
		//清空强制转换复选框
		if($("#checkboxIcon").hasClass("select")){
			$("#checkboxIcon").removeClass("select");
			$("#checkboxIcon").addClass("unselect");
		}
		//清空文件
		console.log("清控我");
		$("#chooseFile>.content .fileList>span").detach();
		//确定按钮禁用
		if(!($("#yes").attr("disabled") == "disabled")){
			$("#yes").attr("disabled",true);
			$("#yes").removeAttr("style");
			$("#yes").css({
				"cursor":"not-allowed"
			});
			$("#yes").addClass("yesDisabled");
			
		}
		//隐藏页面
		$("#chooseFile").hide();
	});
	
	$("#checkboxText").click(function(){
		$("#chooseFile>.submissionArea .icon").click();
	});
	
	//#复选框
	$("#chooseFile>.submissionArea .icon").click(function(){
		if($(this).hasClass("unselect")){
			$(this).removeClass("unselect");
			$(this).addClass("select");
		}
		else if($(this).hasClass("select")){
			$(this).removeClass("select");
			$(this).addClass("unselect");
		}
		else{
			//
		}
	}); 
	
	//#提交解析
	$("#yes").click(function(){
		//未选择rvm
		if(!$("#chooseFile>.content>.rvm>.fileList>span").hasClass("active")){
			$("#notChooseRvm").css("display","flex");
		}
		else{
			// 加载页面
			const loadingBox = new LoadingBox([{text: '获取RVM/ATT路径', hasProgress : false}]);
			// 获取RVM路径
			postRVM(function(responseRVMUrl){
				//有att文件
				if($("#chooseFile>.content>.att>.fileList>span").hasClass("active")){
					// 获取ATT路径
					postATT(function(responseATTUrl){
						loadingPDMS(responseRVMUrl,responseATTUrl)
					});
				} else {
					console.log(responseRVMUrl);
					
					loadingPDMS(responseRVMUrl,"")
				};
				$("#chooseFile>.title>.delete,.submissionArea>.buttonPane>#no").click();
				loadingBox.remove();
			});
		}
	});
	
	$("#errorYes").click(function(){
		$("#notChooseRvm").hide();
	});
	//#选择文件
	$("#chooseFile>.content>div.rvm>.fileList").on("click",">span",function(e){
		$("#chooseFile>.content>div.rvm>.fileList>span").removeClass("active");
		$(this).addClass("active");
		//console.log(e);
		if($("#yes").attr("disabled") == "disabled"){
			$("#yes").attr("disabled",false);
			$("#yes").css({
				"background-color":"#347cb6",
				"cursor":"pointer"
			});
		}
		
	});
	
	$("#chooseFile>.content>div.att>.fileList").on("click",function(e){
		$("#chooseFile>.content>div.att>.fileList>span").removeClass("active");
		
		if(e.target.localName == "span"){
			
			$(e.target).addClass("active");
			
			if($("#yes").attr("disabled") == "disabled"){
				$("#yes").attr("disabled",false);
				$("#yes").css({
					"background-color":"#347cb6",
					"cursor":"pointer"
				});
			} 
		}
	});
	
	//#上传文件
	//##rvm&& att
	/* $("#chooseFile>.content>.rvm .uploadFile,#chooseFile>.content>.att .uploadFile").click(function(e){
		$("#uploadFileBg").show();
	}); */
	//上传rvm文件
	$("#chooseFile>.content>.rvm .uploadFile").click(function(e){
		console.log("点击rvm upload");
		$("#uploadFileBg").attr("clickZone","rvm");
		$("#uploadFileBg").show();
	});
	//上传att文件
	$("#chooseFile>.content>.att .uploadFile").click(function(e){
		console.log("点击att upload");
		$("#uploadFileBg").attr("clickZone","att");
		$("#uploadFileBg").show();
	});
	//点击上传文件触发
	$("#uploadFileDiv>.content>.link").click(function(){
		$("#fileUploadInput").click();
	});
	//上传文件路径显示
	$("#fileUploadInput").change(function(){
		var filename = $("#fileUploadInput").val();
		$(".filePathString").text(filename); 
	});
	//文件提交
	$("#uploadFileDiv>.footer>button").click(function(){
		var currentFileType = $("#uploadFileBg").attr("fileType");
		if($('#fileUploadInput').get(0).files[0] == null){
			alert("请选择文件");
		}
		else{
			var uploadFileName = $('#fileUploadInput').get(0).files[0].name;
			var nameArray = uploadFileName.split(".");
			//转换
			var fileTrueName = nameArray[1];
			var fileLowerCase = fileTrueName.toLowerCase();
			//允许上传的文件
			var allowUploadType = $("#uploadFileBg").attr("clickZone");
			console.log(allowUploadType);
			if(allowUploadType!=fileLowerCase){
				alert("只能上传"+allowUploadType+"类型文件");
			}
			else{
				var ufile =$('#fileUploadInput').get(0).files[0];//两者皆可
				//var uploadFiless = document.getElementById("fileUploadInput").files[0];
				var formdata = new FormData();
				formdata.append("file",ufile);
				$("#uploadFileBg").attr("clickZone","");
				$("#uploadFileBg").hide();
				$("#loadingBG").show();
				uploadFiles(formdata);
			}
		}
	});
	//关闭上传文件
	$("#uploadFileDiv .close").click(function(){
		$("#uploadFileDiv .filePathString").text("");
		$("#fileUploadInput").val("");
		$("#uploadFileBg").attr("clickZone","");
		$("#uploadFileBg").hide();
	});
}


function arrayMnplton(fileArray){
	var attFiles = [];
	var rvmFiles = [];
	if(!(fileArray.length==1&&fileArray[0]==undefined)){
		for(var i=0;i<fileArray.length;i++){
			if(fileArray[i].att){
				attFiles.push(fileArray[i].att);
			}
			if(fileArray[i].rvm){
				rvmFiles.push(fileArray[i].rvm);
			}
		}
	}
	console.log(rvmFiles);
	console.log(attFiles);
	nofileOrNot(0,rvmFiles);
	nofileOrNot(1,attFiles);
}

function nofileOrNot(sig,files){
	switch(sig){
		//rvm
		case 0:
			if(files.length!=0){
				$("#chooseFile>.content>.rvm>.noFile").hide();
				$("#chooseFile>.content>.rvm>.fileList").css("display","flex");
				showFileName("rvm>.fileList",files);
				
			}
			else{
				$("#chooseFile>.content>.rvm>.noFile").css("display","flex");
				$("#chooseFile>.content>.rvm>.fileList").empty();
				$("#chooseFile>.content>.rvm>.fileList").hide();
			}
			break;
		//att
		case 1:
			if(files.length!=0){
				$("#chooseFile>.content>.att>.noFile").hide();
				$("#chooseFile>.content>.att>.fileList").css("display","flex");
				showFileName("att>.fileList",files);
			}
			else{
				$("#chooseFile>.content>.att>.noFile").css("display","flex");
				$("#chooseFile>.content>.att>.fileList").empty();
				$("#chooseFile>.content>.att>.fileList").hide();
			}
			break;
	}
}

//在页面上显示文件名
function showFileName(id,files){
	var parentNode = "#chooseFile>.content>.";
	for(var i=0;i<files.length;i++){
		var currentSpan = "<span>" + files[i] + "</span>";
		$(parentNode+id).append(currentSpan); 
	}
}

function uploadFiles(formData){
	$.ajax({
		url:globalHttp+"SaveFile",
		type: "POST",
		cache: false,
		processData: false,
		contentType : false,
		data: formData,
		async: true,
		success: function (data) {
			console.log(data);
			$("#loadingBG").hide();
			$("#successBG").css("display","flex");
			setTimeout(function(){ 
				$("#uploadFileDiv .filePathString").text("");
				$("#fileUploadInput").val("");
				$("#successBG").hide();
			}, 3000);
			//清空所有文件
			$("#chooseFile>.content .fileList").empty();
			getAllFiles();
			
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log("error");
            // 状态码
			console.log(XMLHttpRequest.status);
			// 状态
			console.log(XMLHttpRequest.readyState);
			console.log(XMLHttpRequest);
			// 错误信息   
			console.log(textStatus);
		}
	});
}

//上传att文件
function postATT(callback){
	var attPath = $("#chooseFile>.content>.att>.fileList>span.active").text();
	var attPathRequest = "{'ATT':'"+attPath+"'}";
	console.log(attPathRequest);
	//请求att
	$.ajax({
		type:"POST",
		url:globalHttp+"getAttcontent",
		ansyc:true,
		data:{
			ATTfile:attPathRequest
		},
		success:function(data){
			console.log("att");
			console.log(eval(data));
			var responseAttURl = eval(data);
			//here ...
			console.log(responseAttURl);
			callback(responseAttURl);
			
		},
		error:function(e){
			console.log(e.responseText);
		},
	});
}

//上传rvm文件
function postRVM(callback){
	var rvmPath = $("#chooseFile>.content>.rvm>.fileList>span.active").text();
	//强制转换flag
	var transformationFlag;
	
	//是否强制转换
	if($("#chooseFile>.submissionArea .icon").hasClass("unselect")){
		transformationFlag = 0;
	}
	else{
		transformationFlag = 1;
	}
	
	var requestString = "{'RVM':'"+rvmPath+"','flag':"+transformationFlag+"}";
	console.log(requestString);
	
	//提交文件给后台
	$.ajax({
		type:"POST",
		url:globalHttp+"getRVMcontent",
		ansyc:true,
		data:{
			file:requestString
		},
		success:function(data){
			console.log("rvm");
			var responseObject = JSON.parse(data);
			//后台解析时间(单位：毫秒)
			var analysisTime = responseObject.time;
			//开始时间
			var currentDate = new Date();
			var beginTime = currentDate.getTime();
			//console.log(beginTime);
			//rvm路径
			var responseRVMUrl = responseObject.path;
			//here ...
			console.log(responseRVMUrl);
			callback(responseRVMUrl);
			
		},
		error:function(e){
			console.log(e.responseText);
		}
	});
}

//获取所有文件
function getAllFiles(){
	$.ajax({
		type:"POST",
		url:globalHttp+"allFiles",
		ansyc:true,
		data:{},
		cache:false,
		success:function(data){
			console.log("获取文件");
			//console.log(data);
			var allFiles = eval(data);
			console.log(allFiles);
			arrayMnplton(allFiles);
		},
		error:function(e){
			console.log(e.responseText);
		}
	});
}