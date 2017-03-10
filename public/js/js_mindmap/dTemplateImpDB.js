window.onload = function() {
	d3.selectAll('#dt-idb-add').on('click', addList);
	d3.selectAll('#dt-idb-rem').on('click', remList);
	d3.selectAll('#dt-idb-imp').on('click', impList);
	d3.select('#dt-idb-main').on('contextmenu',function(e){d3.event.preventDefault();});
	sendData({task:"getList"},function(err,result) {
		if(err) console.log(result);
		else populateList(JSON.parse(result));
	});
};
var populateList = function(d){
	var fList = d3.select('#dt-idb-from');
	d.forEach(function(e,i){
		fList.append('option').attr('value',e.id).html(e.name);
	});
};
var addList = function(e){
	var src=document.getElementById('dt-idb-from');
	var tgt=document.getElementById('dt-idb-to');
	var srcSelOpt=src.selectedOptions;
	var i=srcSelOpt.length;
	while(i--) tgt.appendChild(srcSelOpt[i]);
};
var remList = function(e){
	var src=document.getElementById('dt-idb-to');
	var tgt=document.getElementById('dt-idb-from');
	var srcSelOpt=src.selectedOptions;
	var i=srcSelOpt.length;
	while(i--) tgt.appendChild(srcSelOpt[i]);
};
var impList = function(e){
	var src=document.getElementById('dt-idb-to');
	var srcOpt=src.options;
	var qList=[];
	var i=srcOpt.length;
	while(i--) {
		qList.push(srcOpt[i].value);
		src.removeChild(srcOpt[i]);
	}
	var spinner=d3.select('#dt-idb-main').append('div').attr('class','loader-overlay').attr('style','-webkit-border-radius:15px;-moz-border-radius:15px;border-radius:15px').append('div').attr('style','position:relative;top:50%;margin-top:-100px;width:100%;height:200px');
	spinner.append('i').attr('class','fa fa-save faa-flash animated').attr('style','font-size:90px');
	spinner.append('i').attr('class','fa fa-exclamation faa-ring animated').attr('style','font-size:90px;display:none');
	spinner.append('i').attr('class','fa fa-thumbs-up faa-bounce animated').attr('style','font-size:90px;display:none');
	spinner.append('p').attr('class','loading-dots').attr('style','font-size:17px;').html('Mindmaps are being integrated into DB .');
	sendData({task:"setList",data:qList},function(err,result) {
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
var sendData = function(data,callback){
	var xhttp;
	try{xhttp=new XMLHttpRequest();}catch(e){try{xhttp=new ActiveXObject("Msxml2.XMLHTTP");}catch(e){try{xhttp=new ActiveXObject("Microsoft.XMLHTTP");}catch(e){alert("Your Browser is outdated!\nPlease Update!");return false;}}}
	xhttp.onreadystatechange = function(){4==this.readyState&&(200==this.status?callback(!1,this.responseText):(400==this.status||401==this.status||402==this.status||403==this.status||404==this.status)&&callback(!0,this.responseText));};
	xhttp.open("POST",window.location.pathname,!0);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(data));
};
