var rABS;
window.onload = function(){
	rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";
	var xlsFile = document.getElementById('dt-ixls-finp');
	if (xlsFile.addEventListener) xlsFile.addEventListener('change',parseFile,!1);
};
var repairData = function(data){
	var o = "", l=0, w=10240;
	for (;l<data.byteLength/w;++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w)));
	return o;
};
var parseFile = function(e){
	var fileslist = e.target.files;
	var fileObj = fileslist[0];
	if(fileObj) {var name = fileObj.name;}
	var reader = new FileReader();
	reader.onload = function(e) {
		var data = e.target.result;
		var type;
		if (rABS) type='binary';
		else{
			var rData=data;
			data=btoa(repairData(rData));
			type='base64';
		}
		var spinner=d3.select('#dt-ixls-main').append('div').attr('class','loader-overlay').attr('style','-webkit-border-radius:15px;-moz-border-radius:15px;border-radius:15px').append('div').attr('style','position:relative;top:50%;margin-top:-100px;width:100%;height:200px');
		spinner.append('i').attr('class','fa fa-save faa-flash animated').attr('style','font-size:90px');
		spinner.append('i').attr('class','fa fa-exclamation faa-ring animated').attr('style','font-size:90px;display:none');
		spinner.append('i').attr('class','fa fa-thumbs-up faa-bounce animated').attr('style','font-size:90px;display:none');
		spinner.append('p').attr('class','loading-dots').attr('style','font-size:17px;').html('Mindmaps are being integrated into DB .');
		sendData({'data':data,'type':type},function(err,res){
			spinner.select('i.faa-flash.animated').style('display','none');
			if(err){
				console.log(result);
				spinner.select('i.faa-ring.animated').style('display',null);
				spinner.select('p.loading-dots').classed('loading-dots',!1).html('FATAL error! Please try after some time.<br>(Refer console for error log)');
				setTimeout(function(){d3.select('.loader-overlay').remove();},5000);
			}
			else{
				spinner.select('i.faa-bounce.animated').style('display',null);
				spinner.select('p.loading-dots').classed('loading-dots',!1).html('Success!!');
				setTimeout(function(){d3.select('.loader-overlay').remove();},4000);
			}
		});
	};
	if (rABS) reader.readAsBinaryString(fileObj);
	else reader.readAsArrayBuffer(fileObj);
};
var sendData = function (data,callback){var xhttp;
	try{xhttp=new XMLHttpRequest();}catch(e){try{xhttp=new ActiveXObject("Msxml2.XMLHTTP");}catch(e){try{xhttp=new ActiveXObject("Microsoft.XMLHTTP");}catch(e){alert("Your Browser is outdated!\nPlease Update!");return false;}}}
	xhttp.onreadystatechange = function(){4==this.readyState&&(200==this.status?callback(!1,this.responseText):(400==this.status||401==this.status||402==this.status||403==this.status||404==this.status)&&callback(!0,this.responseText));};
	xhttp.open("POST",window.location.pathname,!0);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(data));
};
