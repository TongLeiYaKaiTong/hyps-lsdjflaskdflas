window.onload = function(){
	$("#yes").click(function(){
		$("#notChooseRvm").css("display","flex");
		//console.log("点击我了");
	});
	$("#errorYes").click(function(){
		$("#notChooseRvm").hide();
	})
}
