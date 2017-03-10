var mouseIcon,uniqueNIndex,uniqueLIndex,dNodes=[],dLinks=[],nodesDict={},linksDict={},node,link,activeNodeID,temp,rootIndex;
var faRef={'add':'fa-plus','edit':'fa-pencil','mouse':'fa-mouse-pointer','erase':'fa-eraser','link':'fa-link','move':'fa-arrows'};
var faRefSVG = {'Scenario':'&#xf187','Screen':'&#xf10a','Script':'&#xf1c9'};
var cursorDict={'fa-plus':'copy','fa-pencil':'text','fa-mouse-pointer':'default','fa-eraser':'crosshair','fa-link':'alias','fa-arrows':'move'};
window.onload=function() {
	uniqueNIndex=0;uniqueLIndex=0;
	//mouseIcon=document.getElementById('dt-c-mouse');
	d3.selectAll('.dt-c-tool-item').on('click', toolClick);
	d3.selectAll('.dt-c-legend-item').on('click', legendClick);
	d3.selectAll('.dt-c-btn-item').on('click', btnClick);
	d3.select('#dt-c-inp').on('change',nameNode);
	//d3.select('#dt-c-graphSVG').on('click', svgClick);
	d3.select('#dt-c-main').on('contextmenu',function(e){d3.event.preventDefault();});
	//d3.select('#dt-c-main').on('mousemove', handleMouseMove).on('mouseenter',toggleMouse).on('mouseleave',toggleMouse).on('contextmenu',function(e){d3.event.preventDefault();});
};
/*var handleMouseMove = function(e) {
	e=e||window.event;
	mouseIcon.style.left=e.pageX-40+"px";
	mouseIcon.style.top=e.pageY-120+"px";
};
var toggleMouse = function(e){mouseIcon.style.display=mouseIcon.style.display!='block'?'block':'';};*/
var toolClick = function() {
	var src = d3.select(this);
	var srcClass=src.attr('class').split(' ');
	if(src.classed('dt-c-tool-active')) return;
	d3.selectAll('.dt-c-tool-active').classed('dt-c-tool-active',!1);
	src.classed('dt-c-tool-active',!0);
	//d3.select(mouseIcon).attr('class',srcClass[1]+' '+srcClass[2]);
	d3.select('#dt-c-inp-box').style('display',null);
	var cType=cursorDict[src.attr('class').split(' ')[2]];
	if(src.classed(faRef.mouse)){
		d3.select('#dt-c-status-box').html('');
		d3.select('#dt-c-graphSVG').style('cursor',null);
		d3.selectAll('.dt-c-node').style('cursor',null);
		d3.selectAll('.dt-c-link').style('cursor',null);
		d3.selectAll('.dt-c-legend-item').classed('dt-c-legend-en',!1);
	}
	else if(src.classed(faRef.add)){
		d3.select('#dt-c-graphSVG').style('cursor',cType);
		d3.select('#dt-c-status-box').html("<strong>Add Node:</strong> Click on Node-Type to add node. Then in input box enter desired name and press 'Enter'.");
		d3.selectAll('.dt-c-node').style('cursor',null);
		d3.selectAll('.dt-c-link').style('cursor',null);
		d3.selectAll('.dt-c-legend-item').classed('dt-c-legend-en',!0);
		d3.select('#dt-c-inp').attr('task','add');
	}
	else if(src.classed(faRef.link)){
		d3.select('#dt-c-status-box').html("<strong>Link Nodes:</strong> First click on 'source' (from) node then click on 'destination' (to) node. Reversing order may lead to error.");
		d3.select('#dt-c-graphSVG').style('cursor',null);
		d3.selectAll('.dt-c-node').style('cursor',cType);
		d3.selectAll('.dt-c-link').style('cursor',null);
		d3.selectAll('.dt-c-legend-item').classed('dt-c-legend-en',!1);
	}
	else if(src.classed(faRef.move)){
		d3.select('#dt-c-status-box').html("<strong>Move Node:</strong> Click, hold and then drag a node to move.");
		d3.select('#dt-c-graphSVG').style('cursor',null);
		d3.selectAll('.dt-c-node').style('cursor',cType);
		d3.selectAll('.dt-c-link').style('cursor',null);
		d3.selectAll('.dt-c-legend-item').classed('dt-c-legend-en',!1);
	}
	else if(src.classed(faRef.edit)){
		d3.select('#dt-c-status-box').html("<strong>Edit Node:</strong> Click on target node. Then in popup box enter new name for node. (Note - Type can't be changed, to do so create new node)");
		d3.select('#dt-c-graphSVG').style('cursor',null);
		d3.selectAll('.dt-c-node').style('cursor',cType);
		d3.selectAll('.dt-c-link').style('cursor',null);
		d3.selectAll('.dt-c-legend-item').classed('dt-c-legend-en',!1);
		d3.select('#dt-c-inp').attr('task','edit');
	}
	else if(src.classed(faRef.erase)){
		d3.select('#dt-c-status-box').html("<strong>Delete Object:</strong> Click on Node/Link to delete. (Note - Deleting a node will also remove any links associated with it)");
		d3.select('#dt-c-graphSVG').style('cursor',null);
		d3.selectAll('.dt-c-node').style('cursor',cType);
		d3.selectAll('.dt-c-link').style('cursor',cType);
		d3.selectAll('.dt-c-legend-item').classed('dt-c-legend-en',!1);
	}
};
var legendClick = function() {
	var src=d3.select(this);
	if(!src.classed('dt-c-legend-en')) return;
	if(src.classed('dt-c-legend-active')) {
		src.classed('dt-c-legend-active',!1);
		d3.select('#dt-c-inp-box').style('display',null);
		node=null;
	}
	else {
		d3.select('.dt-c-legend-active').classed('dt-c-legend-active',!1);
		src.classed('dt-c-legend-active',!0);
		d3.select('#dt-c-inp-box').style('display','block');
		d3.select('#dt-c-inp').node().focus();
		node={id:uniqueNIndex,name:null,type:src.html(),x:null,y:null};
	}
};
var btnClick = function() {
	var src=d3.select(this);
	var btnID=src.attr('id');
	var dtSVG=d3.select('#dt-c-graphSVG');
	if(btnID=='dt-c-err') {
		src.classed('animated',!1);
		if(src.classed('err-active')){
			src.classed('err-active',!1);
			d3.select('#dt-c-error-box').style('display',null);
		}
		else{
			d3.select('.err-active').classed('err-active',!1);
			src.classed('err-active',!0);
			d3.select('#dt-c-error-box').style('display','block');
			d3.select('#dt-c-warning-box').style('display',null);
		}
	}
	if(btnID=='dt-c-warn') {
		src.classed('animated',!1);
		if(src.classed('err-active')){
			src.classed('err-active',!1);
			d3.select('#dt-c-warning-box').style('display',null);
		}
		else{
			d3.select('.err-active').classed('err-active',!1);
			src.classed('err-active',!0);
			d3.select('#dt-c-warning-box').style('display','block');
			d3.select('#dt-c-error-box').style('display',null);
		}
	}
	else if(btnID=='dt-c-clr') {
		if(!confirm('Are you sure you want to clear editor?\nUnsaved data will be lost!')) return;
		clearSVG(dtSVG);
	}
	else if(btnID=='dt-c-create') {
		if(!confirm('Proceed to create mindmap?\nCancel to go back to editor.')) return;
		d3.select('#dt-c-err').style('display',null);
		d3.select('#dt-c-warn').style('display',null);
		parseSVG(function(err,data){
			var errData="",warnData="";
			if(err&&err.eLog) {
				alert('Please rectify all errors before submitting!\nRed/Yellow Nodes/Links are erroneous.');
				err.eLog.forEach(function(e,i){errData+="<li>"+e.msg+"</li>";});
				d3.select('#dt-c-error-box').html("<ul>"+errData+"</ul>");
				d3.select('#dt-c-err').style('display','inline-block');
				if(err.wLog) {
					err.wLog.forEach(function(e,i){warnData+="<li>"+e.msg+"</li>";});
					d3.select('#dt-c-warning-box').html("<ul>"+warnData+"</ul>");
					d3.select('#dt-c-warn').style('display','inline-block');
				}
			}
			else {
				if(err&&err.wLog) {
					if(!confirm('Warnings found!\nAre you sure you want to continue?')) {
						err.wLog.forEach(function(e,i){warnData+="<li>"+e.msg+"</li>";});
						d3.select('#dt-c-warning-box').html("<ul>"+warnData+"</ul>");
						d3.select('#dt-c-warn').style('display','inline-block');
						return;
					}
				}
				var qList=[];
				var typeDict={'Scenario':1,'Screen':2,'Script':3};
				qList.push({id:data[rootIndex].mmid,name:data[rootIndex].name,pid:null,type:typeDict[data[rootIndex].type]});
				if(data[rootIndex].children) {
					data[rootIndex].children.forEach(function(e,i) {
					qList.push({id:e.mmid,name:e.name,pid:e.parent[0].mmid,type:typeDict[e.type]});
						if(e.children) {
							e.children.forEach(function(z,x) {
								qList.push({id:z.mmid,name:z.name,pid:z.parent[0].mmid,type:typeDict[z.type]});
							});
						}
					});
				}
				/*data.forEach(function(e,i) {
					if(e.parent==null&&typeDict[e.type]!=1){
						qList.push({id:e.mmid,name:e.name,pid:null,type:typeDict[e.type]});
						if(e.children) {
							e.children.forEach(function(z,x) {
								qList.push({id:z.mmid,name:z.name,pid:z.parent[0].mmid,type:typeDict[z.type]});
							});
						}
					}
				});*/
				qList.sort(function(a,b){return a.type==b.type?a.id-b.id:a.type-b.type;});
				var spinner=d3.select('#dt-c-main').append('div').attr('class','loader-overlay').attr('style','-webkit-border-radius:15px;-moz-border-radius:15px;border-radius:15px').append('div').attr('style','position:relative;top:50%;margin-top:-100px;width:100%;height:200px');
				spinner.append('i').attr('class','fa fa-save faa-flash animated').attr('style','font-size:90px');
				spinner.append('i').attr('class','fa fa-exclamation faa-ring animated').attr('style','font-size:90px;display:none');
				spinner.append('i').attr('class','fa fa-thumbs-up faa-bounce animated').attr('style','font-size:90px;display:none');
				spinner.append('p').attr('class','loading-dots').attr('style','font-size:17px;').html('Mindmap is being written to DB .');
				sendData({data:qList},function(err,result) {
					spinner.select('i.faa-flash.animated').style('display','none');
					if(err) {
						console.log(result);
						spinner.select('i.faa-ring.animated').style('display',null);
						spinner.select('p.loading-dots').classed('loading-dots',!1).html('FATAL error! Please try after some time.<br>(Refer console for error log)');
						setTimeout(function(){d3.select('.loader-overlay').remove();},5000);
					}
					else{
						spinner.select('i.faa-bounce.animated').style('display',null);
						spinner.select('p.loading-dots').classed('loading-dots',!1).html('Success!!');
						setTimeout(function(){d3.select('.loader-overlay').remove();clearSVG(dtSVG);},4000);
					}
				});
			}
		});
	}
};
var parseSVG = function(callback){
	//var d=new Date();
	//var tStamp=parseInt(d.toLocaleDateString().split('/').join('')+d.toLocaleTimeString().split(':').join(''));
	rootIndex=-1;
	var nData = dNodes.slice(0);
	var tStamp=Date.now();
	var errNode=[],errLog=[],warnNode=[],warnLog=[],nScenario=[];
	var nt={'Scenario':1,'Screen':2,'Script':3}, ntr=['Scenario','Screen','Script'];
	d3.selectAll('.error-lobj').classed('error-lobj',!1);
	d3.selectAll('.error-nobj').classed('error-nobj',!1);

	if(dNodes.length===0){
		errLog.push({id:null,obj:null,msg:"Editor is empty. No nodes/links found."});
		callback({eLog:errLog,wLog:null},nData);
		return;
	}
	//Node Check and Attributes assigning Starts Here
	nData.forEach(function(e,i){
		e.mmid='new-'+tStamp+'-'+e.id;
		e.parent=[];
		e.children=[];
		if(nt[e.type]==1)nScenario.push(e.id);
		nodesDict[e.id]=i;
	});
	if(nScenario.length==1) d3.selectAll('.node-scenario').style('fill',null).style('stroke',null).style('stroke-width',null);
	else {
		errLog.push({id:null,obj:"n",msg:"One and Only 'one' Scenario must be present in a mindmap."});
		d3.selectAll('.node-scenario').style('fill','#f00').style('stroke','#ffd700').style('stroke-width','0.7px');
	}
	//Node Check and Attributes assigning Ends Here
	dLinks.forEach(function(e,i){
		linksDict[e.id]=i;
		var srcx=nodesDict[e.source];
		var tgtx=nodesDict[e.target];
		var src=dNodes[srcx];
		var tgt=dNodes[tgtx];
		var srct=nt[src.type];
		var tgtt=nt[tgt.type];
		//Connection Error Check Starts Here
		if(srct>=tgtt){
			d3.select('#dt-c-l-'+e.id).classed('error-lobj',!0);
			errLog.push({id:e.id,obj:"l",msg:"LinkID:"+e.id+", '"+src.type+"' --> '"+tgt.type+"' cannot be linked as flow is invalid."});
		}
		else if(tgtt-srct==2){
			d3.select('#dt-c-l-'+e.id).classed('error-lobj',!0);
			errLog.push({id:e.id,obj:"l",msg:"LinkID:"+e.id+", '"+src.type+"' and '"+tgt.type+"' cannot be linked directly."});
		}
		//Connection Error Check Ends Here
		//Bind Nodes Starts Here
		if (nData[srcx].children.indexOf(nData[tgtx]) == -1) nData[srcx].children.push(nData[tgtx]);
		if (nData[tgtx].parent.indexOf(nData[srcx]) == -1) nData[tgtx].parent.push(nData[srcx]);
		//Bind Nodes Ends Here
	});

	//Data Validity Starts Here
	nData.forEach(function(e,i){
		if(e.parent.length===0){
			e.parent=null;
			if(e.children.length===0){
				e.children=null;
				errNode.push(e.id);
				errLog.push({id:e.id,obj:"n",msg:"NodeID:"+e.id+", Node has no connections."});
				//warnNode.push(e.id);
				//warnLog.push({id:e.id,obj:"n",msg:"NodeID:"+e.id+", Node has no connections."});
			}
			else{
				if(nt[e.type]!=1){
					errNode.push(e.id);
					errLog.push({id:e.id,obj:"n",msg:"NodeID:"+e.id+", '"+e.type+"' cannot be rootnode/start of mindmap."});
				}
				else rootIndex=i;
			}
		}
		else if(e.parent.length===1){
			if(e.children.length===0){
				e.children=null;
				if(nt[e.type]!=3){
					warnNode.push(e.id);
					warnLog.push({id:e.id,obj:"n",msg:"NodeID:"+e.id+", '"+e.type+"' has no '"+ntr[nt[e.type]]+"'."});
				}
			}
			else{
				if(nt[e.type]==1){
					errNode.push(e.id);
					errLog.push({id:e.id,obj:"n",msg:"NodeID:"+e.id+", '"+e.type+"' should be rootnode/start of mindmap."});
				}
			}
		}
		else if(nt[e.type]!=1){
			errNode.push(e.id);
			errLog.push({id:e.id,obj:"n",msg:"NodeID:"+e.id+", '"+e.type+"' cannot have more than one source(parent), i.e. many-to-one is not allowed."});
		}
	});
	errNode.forEach(function(e,i){d3.select('#dt-c-n-'+e).classed('error-nobj',!0);});
	warnNode.forEach(function(e,i){d3.select('#dt-c-n-'+e).classed('warn-nobj',!0);});
	//Data Validity Ends Here
	if(errLog.length===0 && warnLog.length===0) callback(null,nData);
	else if(errLog.length===0 && warnLog.length!==0) callback({eLog:null,wLog:warnLog},nData);
	else if(errLog.length!==0 && warnLog.length===0) callback({eLog:errLog,wLog:null},nData);
	else callback({eLog:errLog,wLog:warnLog},nData);
};
var clearSVG = function(d){
	d.select('g').remove();
	d.append('g').attr('id','dt-c-graphG');
	d3.select('.dt-c-tool-active').classed('dt-c-tool-active',!1);
	d3.select('a.dt-c-tool-item.'+faRef.mouse).classed('dt-c-tool-active',!0);
	dNodes=[];dLinks=[];uniqueNIndex=0;uniqueLIndex=0;
};
var sendData = function (data,callback){
	var xhttp;
	try{xhttp=new XMLHttpRequest();}catch(e){try{xhttp=new ActiveXObject("Msxml2.XMLHTTP");}catch(e){try{xhttp=new ActiveXObject("Microsoft.XMLHTTP");}catch(e){alert("Your Browser is outdated!\nPlease Update!");return false;}}}
	xhttp.onreadystatechange = function(){4==this.readyState&&(200==this.status?callback(!1,this.responseText):(400==this.status||401==this.status||402==this.status||403==this.status||404==this.status)&&callback(!0,this.responseText));};
	xhttp.open("POST",window.location.pathname,!0);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(data));
};
var validNodeDetails = function(){
	var nName,flag=!0;
	nName=d3.select('#dt-c-inp').property('value');
	if(!(/^[a-zA-Z0-9_]+$/.test(nName))){
		flag=!1;
		d3.select('#dt-c-inp-box a.dt-c-nerror').style('visibility','visible');
		d3.select('#dt-c-inp').classed('dt-c-inperror',!0);
	}
	else{
		d3.select('#dt-c-inp-box a.dt-c-nerror').style('visibility','hidden');
		d3.select('#dt-c-inp').classed('dt-c-inperror',!1);
	}
	return flag?{name:nName}:null;
};
var nameNode = function(){
	var src=d3.select(this);
	var nodeObj = validNodeDetails();
	if(nodeObj===null) return;
	var task=src.attr('task');
	var nodeIndex;
	if(task=='add'){
		if(!node) return;
		node.name=nodeObj.name;
		var svgObj=d3.select('#dt-c-graphSVG');
		node.x=parseInt(svgObj.style('width'))/2;
		node.y=parseInt(svgObj.style('height'))/2;
		dNodes.push(node);
		if(node.master!==undefined){
			autoAddLink(node.master,uniqueNIndex);
			delete node.master;
		}
		else if(dNodes.length>1){
			if(node.type=='Screen'){
				nodeIndex=-1;
				dNodes.some(function(e,i) {if(e.type=='Scenario'){nodeIndex=i;return !0;}return !1;});
				if(nodeIndex!==-1) autoAddLink(nodeIndex,uniqueNIndex);
			}
			if(node.type=='Scenario'){
				nodeIndex=-1;
				dNodes.some(function(e,i) {if(e.type=='Scenario'){nodeIndex=i;return !0;}return !1;});
				if(nodeIndex==uniqueNIndex) {
					var scrID=[];
					dNodes.forEach(function(e,i) {if(e.type=='Screen'){scrID.push(i);}});
					scrID.forEach(function(e,i){autoAddLink(uniqueNIndex,e);});
				}
			}
		}
		node=null;
		uniqueNIndex++;
		addNode();
	}
	else if(task=='edit'){
		dNodes.some(function(e,i) {if(e.id==activeNodeID){nodeIndex=i;return !0;}return !1;});
		if(nodeIndex===undefined){deleteNode();return;}
		dNodes[nodeIndex].name=nodeObj.name;
		d3.select('#dt-c-n-'+activeNodeID).select('.dt-c-svg-text').html('&nbsp;'+nodeObj.name+'&nbsp;');
	}
	d3.select('#dt-c-inp-box').style('display',null);
	d3.select('.dt-c-legend-active').classed('dt-c-legend-active',!1);
	src.property('value','');
};
var addNode = function(){
	var rNode=dNodes[dNodes.length-1];
	var disNode=d3.select('#dt-c-graphG').append('g').attr('id','dt-c-n-'+rNode.id).attr('class','dt-c-node node-'+rNode.type.toLowerCase()).attr('transform', "translate("+rNode.x+","+rNode.y+")").attr('title',rNode.name).on('click',nodeClick).on('dblclick',nodeDblClick).on('mousedown',nodeClickBegin).on('mouseup',nodeClickEnd);
	disNode.append('text').attr('class','dt-c-svg-icon').attr('text-anchor','Scenario'==rNode.type?'start':'end').attr('aria-hidden','true').html(faRefSVG[rNode.type]);
	disNode.append('text').attr('class','dt-c-svg-text').attr('text-anchor','Scenario'==rNode.type?'end':'start').html('&nbsp;'+rNode.name+'&nbsp;');
};
var autoAddNode = function(d){
	var nType=dNodes[d].type;
	var desType=dNodes[d].type;
	if(nType=='Script') return;
	else if(nType=='Screen') desType='Script';
	else if(nType=='Scenario') desType='Screen';
	d3.select('#dt-c-inp-box').style('display','block');
	d3.select('#dt-c-inp').node().focus();
	node={id:uniqueNIndex,name:null,type:desType,x:null,y:null,master:d};
};
var editNode = function(d){
	d3.select('#dt-c-inp-box').style('display','block');
	d3.select('#dt-c-inp').property('value',d.name).node().focus();
};
var deleteNode = function(k,d){
	d3.select('#dt-c-n-'+k).remove();
	dNodes.splice(d,1);
	reCalibLinks(k,d);
};
var moveNode = function(e){
	e=e||window.event;
	d3.select('.movable').attr('transform', "translate("+parseInt(e.pageX-40)+","+parseInt(e.pageY-170)+")");
};
var genPathData = function(pSrc,pDst){return ('M'+pSrc[0]+','+pSrc[1]+'C'+(pSrc[0]+pDst[0])/2+','+pSrc[1]+' '+(pSrc[0]+pDst[0])/2+','+pDst[1]+' '+pDst[0]+','+pDst[1]);};
var addLink = function(srcLink,nix){
	if(!link) link={id:uniqueLIndex,source:srcLink.attr('id').split('-')[3],target:dNodes[nix].id,name:null};
	d3.select('#dt-c-l-'+uniqueLIndex).attr('d',genPathData(temp,[dNodes[nix].x,dNodes[nix].y]));
	link.target=dNodes[nix].id;
	dLinks.push(link);
	link=null;
	uniqueLIndex++;
	srcLink.classed('dt-c-linking',!1);
};
var autoAddLink = function(srcidx,tgt){
	var mNode=dNodes[srcidx];
	temp=[mNode.x,mNode.y];
	link={id:uniqueLIndex,source:mNode.id,target:-1,name:null};
	d3.select('#dt-c-graphG').insert('path','g').attr('id','dt-c-l-'+uniqueLIndex).attr('class','dt-c-link').on('click',linkClick);
	addLink(d3.select('#dt-c-n-'+mNode.id),tgt);
};
var deleteLink = function(k,d){
	d3.select('#dt-c-l-'+k).remove();
	dLinks.splice(d,1);
};
var linkNode = function(e){
	e=e||window.event;
	d3.select('#dt-c-l-'+uniqueLIndex).attr('d',genPathData(temp,[e.pageX-40,e.pageY-170]));
};
var reCalibLinks = function(d,x){
	for(var i=0;i<dLinks.length;i++){
		var s,nix,sLink,e=dLinks[i];
		if(e.source==d){
			sLink=d3.select('#dt-c-l-'+e.id);
			s=e.target;
			dNodes.some(function(j,k){if(j.id==s){nix=k;return !0;}return !1;});
			if(nix===undefined||dNodes[x]===undefined||(dNodes[x]&&dNodes[x].id!=d)) {deleteLink(e.id,i);i--;}
			else sLink.attr('d',genPathData([dNodes[x].x,dNodes[x].y],[dNodes[nix].x,dNodes[nix].y]));
		}
		else if(e.target==d){
			sLink=d3.select('#dt-c-l-'+e.id);
			s=e.source;
			dNodes.some(function(j,k){if(j.id==s){nix=k;return !0;}return !1;});
			if(nix===undefined||dNodes[x]===undefined||(dNodes[x]&&dNodes[x].id!=d)) {deleteLink(e.id,i);i--;}
			else sLink.attr('d',genPathData([dNodes[nix].x,dNodes[nix].y],[dNodes[x].x,dNodes[x].y]));
		}
	}
};
var linkClick = function(e){
	e=e||window.event;
	e.cancelBubble=true;
	if(e.stopPropagation)e.stopPropagation();
	var l=d3.select(this);
	var lix,lid=parseInt(l.attr('id').split('-')[3]);
	dLinks.some(function(e,i){if(e.id==lid){lix=i;return !0;}return !1;});
	if(lix===undefined){l.remove();return;}
	var actvTool=d3.select('.dt-c-tool-active');
	if(actvTool.classed(faRef.mouse)) d3.select('#dt-c-status-box').html("<strong><em>&lt;Link&gt;</em></strong>&nbsp;&nbsp;<strong>id:</strong>&nbsp;"+lid+"&nbsp;&nbsp;<strong>source:</strong>&nbsp;"+dLinks[lix].source+"&nbsp;&nbsp;<strong>destination:</strong>&nbsp;"+dLinks[lix].target);
	//if(actvTool.classed(faRef.edit)) editLink(dLinks[lix]);
	if(actvTool.classed(faRef.erase)) deleteLink(lid,lix);
};
var nodeClick = function(e){
	e=e||window.event;
	e.cancelBubble=true;
	if(e.stopPropagation)e.stopPropagation();
	var ng=d3.select(this);
	var nix,nid=parseInt(ng.attr('id').split('-')[3]);
	dNodes.some(function(e,i){if(e.id==nid){nix=i;return !0;}return !1;});
	if(nix===undefined){ng.remove();return;}
	activeNodeID=nid;
	var actvTool=d3.select('.dt-c-tool-active');
	if(actvTool.classed(faRef.mouse)) d3.select('#dt-c-status-box').html("<strong><em>&lt;Node&gt;</em></strong>&nbsp;&nbsp;<strong>id:</strong>&nbsp;"+nid+"&nbsp;&nbsp;<strong>type:</strong>&nbsp;"+dNodes[nix].type+"&nbsp;&nbsp;<strong>name:</strong>&nbsp;"+dNodes[nix].name);
	if(actvTool.classed(faRef.link)) {
		var srcLink=d3.select('.dt-c-linking');
		if(srcLink[0][0]){
			d3.select('#dt-c-graphSVG').on('mousemove.nodelink',null);
			if(ng.attr('id')==srcLink.attr('id')) {
				srcLink.classed('dt-c-linking',!1);
				d3.select('#dt-c-l-'+uniqueLIndex).remove();
				return;
			}
			addLink(srcLink,nix);
		}
		else{
			ng.classed('dt-c-linking',!0);
			link={id:uniqueLIndex,source:nid,target:-1,name:null};
			temp=[dNodes[nix].x,dNodes[nix].y];
			d3.select('#dt-c-graphG').insert('path','g').attr('id','dt-c-l-'+uniqueLIndex).attr('class','dt-c-link').on('click',linkClick);
			d3.select('#dt-c-graphSVG').on('mousemove.nodelink',linkNode);
		}
	}
	if(actvTool.classed(faRef.edit)) editNode(dNodes[nix]);
	if(actvTool.classed(faRef.erase)) deleteNode(nid,nix);
};
var nodeDblClick = function(e){
	e=e||window.event;
	e.cancelBubble=true;
	if(e.stopPropagation)e.stopPropagation();
	var ng=d3.select(this);
	var nix,nid=parseInt(ng.attr('id').split('-')[3]);
	dNodes.some(function(e,i){if(e.id==nid){nix=i;return !0;}return !1;});
	if(nix===undefined){ng.remove();return;}
	activeNodeID=nid;
	var actvTool=d3.select('.dt-c-tool-active');
	if(actvTool.classed(faRef.add)) autoAddNode(nix);
};
var nodeClickBegin = function(e){
	var ng=d3.select(this);
	var actvTool=d3.select('.dt-c-tool-active');
	if(actvTool.classed(faRef.move)) {ng.classed('movable',!0);d3.select('#dt-c-graphSVG').on('mousemove.nodemove',moveNode);}
};
var nodeClickEnd = function(e){
	var ng=d3.select(this);
	var nix,nid=parseInt(ng.attr('id').split('-')[3]);
	dNodes.some(function(e,i) {if(e.id==nid){nix=i;return !0;}return !1;});
	if(nix===undefined){ng.remove();return;}
	var actvTool=d3.select('.dt-c-tool-active');
	if(actvTool.classed(faRef.move)) {
		d3.select('#dt-c-graphSVG').on('mousemove.nodemove',null);
		ng.classed('movable',!1);
		var newCoords=ng.attr('transform');
		newCoords=newCoords.slice(10,newCoords.length-1).split(',');
		dNodes[nix].x=parseInt(newCoords[0]);
		dNodes[nix].y=parseInt(newCoords[1]);
		reCalibLinks(nid,nix);
	}
};
/*var svgClick = function(e){
	e=e||window.event;
	e.cancelBubble=true;
	if(e.stopPropagation)e.stopPropagation();
	var actvTool=d3.select('.dt-c-tool-active');
	if(actvTool.classed(faRef.mouse))d3.select('#dt-c-status-box').html("");
	if(!actvTool.classed(faRef.add))return;
	d3.select('#dt-c-graphSVG').on('mousemove.nodemove',null);
	d3.select('#dt-c-inp-box').style('display','block');
};*/
