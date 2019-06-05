window.onload = function(){
	
	//--------------------点击事件---------------
	//#文件>打开
	$("#nav>.menu-area .open").click(function(){
		$("#chooseFile").show();
		//获取服务器文件
		$.ajax({
			type:"POST",
			url:"http://www.toolkip.com/haiyouservice/seervmWebService1.asmx/allFiles",
			ansyc:true,
			data:{},
			success:function(data){
				console.log(data);
				var allFiles = eval(data);
				console.log(allFiles);
				arrayMnplton(allFiles);
				/* allFiles = null; */
			},
			error:function(e){
				console.log(e.responseText);
			}
		});
	});
	//#删除 ,#取消 
	$("#chooseFile>.title>.delete,.submissionArea>.buttonPane>#no").click(function(){
		//清空强制转换复选框
		if($("#checkboxIcon").hasClass("select")){
			$("#checkboxIcon").removeClass("select");
			$("#checkboxIcon").addClass("unselect");
		}
		//清空文件
		$("#chooseFile>.content .fileList").empty();
		//隐藏页面
		$("#chooseFile").hide();
	});
	//#取消
	/* $(".submissionArea>.buttonPane>#no").click(function(){
		$("#chooseFile").hide();
	}) */
	
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
			//解析文件路径
			var rvmPath = $("#chooseFile>.content>.rvm>.fileList>span.active").text();
			var attPath = "";
			//强制转换flag
			var transformationFlag = 0;
			
			if($("#chooseFile>.content>.att>.fileList>span").hasClass("active")){
				attPath = $("#chooseFile>.content>.att>.fileList>span.active").text();
			}
			
			//是否强制转换
			if($("#chooseFile>.submissionArea .icon").hasClass("unselect")){
				transformationFlag = 0;
			}
			else{
				transformationFlag = 1;
			}
			
			console.log(rvmPath);
			console.log(attPath);
			console.log(transformationFlag);
			
			//提交文件给后台
			$.ajax({
				type:"POST",
				url:"http://www.toolkip.com/haiyouservice/seervmWebService1.asmx/getfiles",
				ansyc:true,
				data:{
					rvm:rvmPath,
					att:attPath,
					flag:transformationFlag
				},
				success:function(data){
					console.log(data);
					/* var allFiles = eval(data);
					console.log(allFiles);
					arrayMnplton(allFiles); */
					/* allFiles = null; */
				},
				error:function(e){
					console.log(e.responseText);
				}
				
			})
			
		}
	});
	
	$("#errorYes").click(function(){
		$("#notChooseRvm").hide();
	});
	//#选择文件
	$("#chooseFile>.content>div.rvm>.fileList").on("click",">span",function(e){
		$("#chooseFile>.content>div.rvm>.fileList>span").removeClass("active");
		$(this).addClass("active");
		//console.log();
		if($("#yes").attr("disabled") == "disabled"){
			$("#yes").attr("disabled",false);
			$("#yes").css({
				"background-color":"#347cb6",
				"cursor":"pointer"
			});
			
		}
		//if($("#yes").attr("disabled") = "disabled")
	});
	$("#chooseFile>.content>div.att>.fileList").on("click",">span",function(e){
		$("#chooseFile>.content>div.att>.fileList>span").removeClass("active");
		$(this).addClass("active");
		if($("#yes").attr("disabled") == "disabled"){
			$("#yes").attr("disabled",false);
			$("#yes").css({
				"background-color":"#347cb6",
				"cursor":"pointer"
			});
		}
	});
	
	//#上传文件
	//##rvm
	$("#chooseFile>.content>.rvm .uploadFile").click(function(){
		console.log("click");
		$("#rvmInputFile").click();
	});
	//##att
	$("#chooseFile>.content>.att .uploadFile").click(function(){
		console.log("click");
		$("#attInputFile").click();
	});
}


function arrayMnplton(fileArray){
	var attFiles = [];
	var rvmFiles = [];
	for(var i=0;i<fileArray.length;i++){
		if(fileArray[i].ATT){
			attFiles.push(fileArray[i].ATT);
			
		}
		if(fileArray[i].RVM){
			rvmFiles.push(fileArray[i].RVM);
		}
	}
	nofileOrNot(0,rvmFiles);
	nofileOrNot(1,attFiles);
}

function nofileOrNot(sig,files){
	switch(sig){
		//rvm
		case 0:
			if(files.length!=0){
				$("#chooseFile>.content>.rvm>.noFile").hide();
				showFileName("rvm>.fileList",files);
			}
			else{
				$("#chooseFile>.content>.rvm>.fileList").hide();
			}
			break;
		//att
		case 1:
			if(files.length!=0){
				$("#chooseFile>.content>.att>.noFile").hide();
				showFileName("att>.fileList",files);
			}
			else{
				$("#chooseFile>.content>.rvm>.fileList").hide();
			}
			break;
			
	}
}

function showFileName(id,files){
	var parentNode = "#chooseFile>.content>.";
	/*$(parentNode+id).empty(); */
	for(var i=0;i<files.length;i++){
		var currentSpan = "<span>" + files[i] + "</span>";
		$(parentNode+id).append(currentSpan); 
	}
}



