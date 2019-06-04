/* 
 * 纯JS解析XML文档(兼容各个浏览器) 
 */

function parseXMLDOM(){
	var list=[];
	var _browserType = ""; 
	var _xmlFile = ""; 
	var _XmlDom = null; 
	return {
		"getBrowserType" : function(){
		return _browserType;
		},
		"setBrowserType" : function(browserType){
		_browserType = browserType;
		},
		"getXmlFile" : function(){
		return _xmlFile;
		},
		"setXmlFile" : function(xmlFile){
		_xmlFile = xmlFile;
		},
		"getXmlDom" : function(){
		return _XmlDom;
		},
		"setXmlDom" : function(XmlDom){
		_XmlDom = XmlDom;
		},
		"getBrowserType" : function(){
			var browserType = "";
			if(navigator.userAgent.indexOf("MSIE") != -1){
				browserType = "IE";
			}else if(navigator.userAgent.indexOf("Chrome") != -1){
				browserType = "Chrome";
			}else if(navigator.userAgent.indexOf("Firefox") != -1){
				browserType = "Firefox"
			}
			return browserType;
		},
		"createXmlDom" : function(xmlDom){
			if(this.getBrowserType() == "IE"){//IE浏览器 
				xmlDom = new ActiveXObject('Microsoft.XMLDOM');
				xmlDom.async = false;
				xmlDom.load(this.getXmlFile());
			}else{
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open("GET", this.getXmlFile(), false);
				xmlhttp.send(null);
				xmlDom = xmlhttp.responseXML;
			}
			return xmlDom;
		},
		"parseXMLDOMInfo" : function(){
			var xmlDom = this.getXmlDom();
			if(this.getBrowserType() == "IE"){
				var bookObj = xmlDom.selectNodes("root/pdms");
				if(typeof(bookObj) != "undifined"){
					list=[];
					for(var i = 0; i < bookObj.length; i++){
						var data = new Object();
						data.id = bookObj[i].selectSingleNode("id").text;
						data.isParent = bookObj[i].selectSingleNode("isParent").text;
						data.model = bookObj[i].selectSingleNode("model").text;
						data.name = bookObj[i].selectSingleNode("name").text;
						data.pId = bookObj[i].selectSingleNode("pId").text;
						data.type = bookObj[i].selectSingleNode("type").text;
						//console.log(data);
						list.push(data);
					}
				}
			}else{
			    var book = xmlDom.getElementsByTagName("pdms");
			    var list=[];
				for(var i = 0;i < book.length;i++){
					var data = new Object();
					data.id = book[i].getElementsByTagName("id")[0].textContent;
					data.isParent = book[i].getElementsByTagName("isParent")[0].textContent;
					data.model = book[i].getElementsByTagName("model")[0].textContent;
					data.name = book[i].getElementsByTagName("name")[0].textContent;
					data.pId = book[i].getElementsByTagName("pId")[0].textContent;
					data.type = book[i].getElementsByTagName("type")[0].textContent;
					//console.log(data);
					list.push(data);
				}
			}
			console.log(list);
		}
	}
	
	console.log(list);
}