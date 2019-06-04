window.onload = function(){
	
	//--------------------点击事件---------------
	//#打开
	$("#nav>.menu-area .open").click(function(){
		$("#chooseFile").show();
	});
	//#复选框
	 /* $("#chooseFile>.submissionArea .icon").click(function(){ 
		 console.log("dianji"); */
		/* $("#chooseFile>.submissionArea .icon").toggle(function(){
			console.log("单数");
			$("#chooseFile>.submissionArea .icon").css({
				"background":"url(./img/openFile/btn_checkbox_selected.png)",
				"display":"inline-block"
			});
		},function(){
			console.log("偶数");
			$("#chooseFile>.submissionArea .icon").css({
				"background":"url(./img/openFile/btn_checkbox_unselected.png)",
				"display":"inline-block"
			});
		},function(){
			console.log("单数");
			$("#chooseFile>.submissionArea .icon").css({
				"background":"url(./img/openFile/btn_checkbox_selected.png)",
				"display":"inline-block"
			});
		}); */
	/* }); */
	
	//#解析
	$("#yes").click(function(){
		$("#notChooseRvm").css("display","flex");
	});
	$("#errorYes").click(function(){
		$("#notChooseRvm").hide();
	});
	//#选择文件
	$("#chooseFile>.content>div.rvm").on("click",">span",function(e){
		$("#chooseFile>.content>div.rvm>span").removeClass("active");
		$(this).addClass("active");
	});
	$("#chooseFile>.content>div.att").on("click",">span",function(e){
		$("#chooseFile>.content>div.att>span").removeClass("active");
		$(this).addClass("active");
	});
	 $.ajax({
		type:"POST",
		url:"http://www.toolkip.com/haiyouservice/seervmWebService1.asmx/allFiles",
		ansyc:true,
		data:{},
		success:function(data){
			console.log(data);
			var sth = eval(data);
			console.log(sth);
			//arrayMnplton(eval(data));
		},
		error:function(e){
			console.log(e.responseText);
		}
		
	});
	//
	$(".submissionArea .icon").click(
		
	);
	var fileArray = [{"RVM":"files/rvm/项目1.RVM","ATT":"files/ATT/项目1.ATT"},{"RVM":"files/rvm/项目2.RVM","ATT":"files/ATT/项目2.ATT"},{"RVM":"files/rvm/项目3.RVM","ATT":"files/ATT/项目3.ATT"},{"RVM":"files/rvm/项目4.RVM","ATT":"files/ATT/项目4.ATT"},{"RVM":"files/rvm/项目5.RVM","ATT":"files/ATT/项目5.ATT"}];
	//fileArray = [];
	arrayMnplton(fileArray);
	
}


function arrayMnplton(fileArray){
	var attFiles = [];
	var rvmFiles = [];
	for(let i=0;i<fileArray.length;i++){
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
			}
			showFileName("rvm",files);
			break;
		//att
		case 1:
			if(files.length!=0){
				$("#chooseFile>.content>.att>.noFile").hide();
				showFileName("att",files);
			}
			break;
			
	}
}

function showFileName(id,files){
	for(let i=0;i<files.length;i++){
		let currentSpan = "<span>" + files[i] + "</span>";
		let parentNode = "#chooseFile>.content>.";
		$(parentNode+id).append(currentSpan); 
	}
}


