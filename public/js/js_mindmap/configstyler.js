var cfgData,actDB;
window.onload=function() {
	cfgData=JSON.parse(d3.select('#cfg-data-carrier').html());
	d3.select('#cfg-data-carrier').remove();
	d3.selectAll('.cfg-db-switch').on('click', switchDB);
	d3.selectAll('.cfg-editico').on('click', editIco);
	d3.selectAll('.cfg-saveico').on('click', saveIco);
	d3.selectAll('.cfg-closeico').on('click', closeIco);
	swapData(d3.select('.cfg-active-db'));
};
var navigateto = function(d) {0==d?window.location="/home":1==d&&(window.location="/logout");};
var switchDB = function() {
	var src = d3.select(this);
	if(!src.classed('cfg-active-db')){
		d3.selectAll('.cfg-active-db').classed('cfg-active-db',false);
		src.classed('cfg-active-db',true);
		swapData(src);
	}
};
var swapData = function(s){
	actDB=s.html().toLowerCase();
	d3.select('input.cfg-type1').property('value',cfgData[actDB].a.host);
	d3.select('input.cfg-type2').property('value',cfgData[actDB].a.port);
	if(actDB=='cassandra'){
		d3.select('span.cfg-type3').html('Keyspace');
		d3.select('input.cfg-type3').property('value',cfgData[actDB].a.keyspace);
	}
	else if(actDB=='neo4j'){
		d3.select('span.cfg-type3').html('|User|:|Password|');
		d3.select('input.cfg-type3').property('value',cfgData[actDB].a.auth);
	}
};
var dataValidator = function(e,l,s){
	if(e==1) return (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(s))? 'Done':'Please Enter a valid IP address';
	else if(e==2) return (/^(102[4-9]|10[3-9]\d|1[1-9]\d{2}|[2-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/.test(s))?'Done':'Enter valid port number between 1025 & 65536';
	else if(e==3) return l!=2?'Done':((/\|.*\|:\|.*\|/.test(s))?'Done':'Enter username and password in \'|text1|:|text2|\' format');
};
var updCfgData = function(l){
	var e=l.charAt(8);
	var newVal=d3.select('input.'+l).property('value');
	d3.select('input.cfg-type2').property('value',cfgData[actDB].a.port);
	if(e==1) cfgData[actDB].a.host=newVal;
	else if(e==2) cfgData[actDB].a.port=newVal;
	else if(e==3) actDB=='cassandra'?(cfgData[actDB].a.keyspace=newVal):actDB=='neo4j'&&(cfgData[actDB].a.auth=newVal);
};
var editIco = function() {
	var srcClass,
		src = d3.select(this);
	if(src.classed('cfg-controlitem')) {
		srcClass=src.classed("cfg-type1")?"cfg-type1":src.classed("cfg-type2")?"cfg-type2":src.classed("cfg-type3")&&("cfg-type3");
		src.style('display','none');
		d3.select('input.'+srcClass).attr('disabled',null);
		d3.select('.cfg-saveico.'+srcClass).style('display',null);
		d3.select('.cfg-closeico.'+srcClass).style('visibility','visible');
	}
};
var saveIco = function() {
	var srcClass,
		src = d3.select(this),
		actDBn=actDB=='cassandra'?1:actDB=='neo4j'&&2;
	srcClass=src.classed("cfg-type1")?"cfg-type1":src.classed("cfg-type2")?"cfg-type2":src.classed("cfg-type3")&&("cfg-type3");
	var newVal=d3.select('input.'+srcClass).property('value');
	var msg=dataValidator(srcClass.charAt(8),actDBn,newVal);
	if(msg!='Done') alert(msg);
	else{
		src.style('display','none');
		d3.select('input.'+srcClass).attr('disabled','disabled');
		d3.select('.cfg-closeico.'+srcClass).style('visibility','hidden');
		var modSpinner = d3.select('.cfg-editico.'+srcClass);
		modSpinner.style('display',null).classed('cfg-controlitem',false);
		modSpinner.select('i').classed('fa-pencil-square-o',false).classed('fa-spinner fa-spin fa-fw',true);
		modSpinner.select('span').html('');
		dataUpdater({db:actDBn,inst:'a',key:srcClass,value:newVal},srcClass);
	}
};
var closeIco = function() {
	var srcClass,
		src = d3.select(this);
	srcClass=src.classed("cfg-type1")?"cfg-type1":src.classed("cfg-type2")?"cfg-type2":src.classed("cfg-type3")&&("cfg-type3");
	src.style('visibility','hidden');
	d3.select('input.'+srcClass).attr('disabled','disabled');
	d3.select('.cfg-saveico.'+srcClass).style('display','none');
	d3.select('.cfg-editico.'+srcClass).style('display',null);
};
var dataUpdater = function (data,srcClass){
	var xhttp;
	try{xhttp=new XMLHttpRequest();}catch(e){try{xhttp=new ActiveXObject("Msxml2.XMLHTTP");}catch(e){try{xhttp=new ActiveXObject("Microsoft.XMLHTTP");}catch(e){alert("Your Browser is outdated!\nPlease Update!");return false;}}}
	xhttp.onreadystatechange = function(){
		if (this.readyState == 4){
			var modSpinner = d3.select('.cfg-editico.'+srcClass);
			if(this.status == 200){
				console.log(this.responseText);
				modSpinner.select('i').classed('fa-spinner fa-spin fa-fw',false).classed('fa-check',true);
				modSpinner.classed('cfg-controlitem',true);
				modSpinner.select('span').html('Done');
				updCfgData(srcClass);
				setTimeout(function() {
					modSpinner.select('i').classed('fa-check',false).classed('fa-pencil-square-o',true);
					modSpinner.select('span').html('Edit');
				}, 1500);
			}
			else if((this.status == 400)||(this.status == 401)||(this.status == 402)||(this.status == 403)||(this.status == 404)){
				alert('Request Failed!\nTry again after some time.');
				modSpinner.select('i').classed('fa-spinner fa-spin fa-fw',false).classed('fa-exclamation-triangle',true);
				modSpinner.classed('cfg-controlitem',true);
				modSpinner.select('span').html('Failed');
				setTimeout(function() {
					var e=srcClass.charAt(8);
					d3.select('input.'+srcClass).property('value',1==e?cfgData[actDB].a.host:2==e?cfgData[actDB].a.port:3==e&&("cassandra"==actDB?cfgData[actDB].a.keyspace:"neo4j"==actDB&&cfgData[actDB].a.auth));
					d3.select('input.cfg-type2').property('value',cfgData[actDB].a.port);
					modSpinner.select('i').classed('fa-exclamation-triangle',false).classed('fa-pencil-square-o',true);
					modSpinner.select('span').html('Edit');
				}, 2000);
			}
		}
	};
	xhttp.open("POST",window.location.pathname,!0);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(data));
};
