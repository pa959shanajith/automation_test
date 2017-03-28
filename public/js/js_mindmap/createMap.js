var activeNode,uNix,uLix,node,link,dNodes,dLinks,allMMaps,temp,rootIndex,faRef,nCount,scrList,tcList,mapSaved,zoom,cSpan,cScale,taskAssign,releaseResult;
var deletednode=[];
function loadMindmapData(){
	uNix=0;uLix=0;dNodes=[];dLinks=[];nCount=[0,0,0,0];scrList=[];tcList=[];cSpan=[0,0];cScale=1;mapSaved=!1;
	taskAssign={"modules":{"task":["Execute"],"attributes":["at","sd","ed","re","cy"]},"scenarios":null,"screens":{"task":["Scrape","Append","Compare","Add","Map"],"attributes":["at","rw","sd","ed"]},"testcases":{"task":["Update","Design"],"attributes":["at","rw","sd","ed"]}};
	zoom=d3.behavior.zoom().scaleExtent([0.1,3]).on("zoom", zoomed);
	faRef={"plus":"fa-plus","edit":"fa-pencil-square-o","delete":"fa-trash-o"};
	//d3.selectAll('.ct-tile').on('click',createNewMap);
		$(document).on('click',".ct-tile", function() {
			createNewMap();
			});

//	d3.selectAll('#ctExpandCreate').on('click',toggleExpand);
				 $(document).on('click',"#ctExpandCreate", function(e) {
					toggleExpand(e);
				 	});
				$(document).on('click',"#ctExpandAssign", function(e) {
					toggleExpandAssign(e);
				 	});
	d3.select('#ct-main').on('contextmenu',function(e){d3.event.preventDefault();});
	var svgTileG=d3.select('.ct-tile').append('svg').attr('class','ct-svgTile').attr('height','150px').attr('width','150px').append('g');
	var svgTileLen = $(".ct-svgTile").length;
	if(svgTileLen == 0)
	{
			//$('#ct-mapSvg').empty();
			svgTileG.append('circle').attr('cx',75).attr('cy',75).attr('r',30);
			svgTileG.append('path').attr('d','M75,55L75,95');
			svgTileG.append('path').attr('d','M55,75L95,75');
	}

	dataSender({task:'getModules'},function(err,result){
		if(err) console.log(result);
		else{
			var nodeBox=d3.select('.ct-nodeBox');
			$(nodeBox[0]).empty();
			allMMaps=JSON.parse(result);
			allMMaps.forEach(function(e,i){
				var t=e.name.replace(/_/g,' ');
				var node=nodeBox.append('div').attr('class','ct-node fl-left').attr('data-mapid',i).on('click',loadMap);
				node.append('img').attr('class','ct-nodeIcon').attr('src','images_mindmap/node-modules-no.png').attr('alt','Module').attr('aria-hidden',true);
				node.append('span').attr('class','ct-nodeLabel').html(t);
			});
			populateDynamicInputList();
			setModuleBoxHeight();
		}
	});
}
window.onresize=function() {
	var w=window.innerWidth-28,h=window.innerHeight-123;
	var mapSvg=d3.select('#ct-mapSvg').style('width',w+'px').style('height',h+'px');
};
var initiate = function(){
	var t,u;
	var selectedTab = window.localStorage['tabMindMap'];
	d3.select('.ct-tileBox').remove();
	if(d3.select('#ct-mindMap')[0][0]!=null) return;
	if(selectedTab == "tabAssign") var canvas=d3.select('#ct-canvasforAssign');
	else var canvas=d3.select('#ct-canvas');
	u=canvas.append('div').attr('id','ct-inpBox').classed('no-disp',!0);
	u.append('input').attr('id','ct-inpPredict').attr('class','ct-inp');
	u.append('input').attr('id','ct-inpAct').attr('class','ct-inp').on('change',inpChange).on('keyup',inpKeyUp);
	u.append('ul').attr('id','ct-inpSugg').classed('no-disp',!0);
	u=canvas.append('div').attr('id','ct-ctrlBox').classed('no-disp',!0);
	u.append('p').attr('class','ct-ctrl fa '+faRef.plus).on('click',createNode).append('span').attr('class','ct-tooltiptext').html('');
	u.append('p').attr('class','ct-ctrl fa '+faRef.edit).on('click',editNode).append('span').attr('class','ct-tooltiptext').html('');
	u.append('p').attr('class','ct-ctrl fa '+faRef.delete).on('click',deleteNode).append('span').attr('class','ct-tooltiptext').html('');
	u=canvas.append('div').attr('id','ct-assignBox').classed('no-disp',!0);
	u.append('div').attr('id','ct-assignTable');
	u.append('div').attr('class','ct-assignDetailsBox').append('textarea').attr('id','ct-assignDetails').attr('placeholder','Enter Details');
	u.append('div').attr('id','ct-assignButton').append('a').html('OK').on('click',addTask);
	var mapSvg=canvas.append('svg').attr('id','ct-mapSvg').call(zoom).on('click.hideElements',clickHideElements);
	var dataAdder=[{c:'#5c5ce5',t:'Modules'},{c:'#4299e2',t:'Scenarios'},{c:'#19baae',t:'Screens'},{c:'#efa022',t:'Test Cases'}];
	u=canvas.append('svg').attr('id','ct-legendBox').append('g').attr('transform','translate(10,10)');
	dataAdder.forEach(function(e,i) {
		t=u.append('g');
		t.append('circle').attr('class','ct-'+(e.t.toLowerCase().replace(/ /g,''))).attr('cx',i*90).attr('cy',0).attr('r',10);
		t.append('text').attr('class','ct-nodeLabel').attr('x',i*90+15).attr('y',3).html(e.t);
	});
	u=canvas.append('svg').attr('id','ct-actionBox').append('g');
	t=u.append('g').attr('id','ct-saveAction').attr('class','ct-actionButton').on('click',actionEvent);
	t.append('rect').attr('x',0).attr('y',0).attr('rx',12).attr('ry',12);
	t.append('text').attr('x',23).attr('y',18).html('Save');
	if(selectedTab == "tabCreate"){
		t=u.append('g').attr('id','ct-createAction').attr('class','ct-actionButton').on('click',actionEvent);
		t.append('rect').attr('x',100).attr('y',0).attr('rx',12).attr('ry',12);
		t.append('text').attr('x',114).attr('y',18).html('Create');
	}
	
	
};
var zoomed = function(){
	cSpan=d3.event.translate;
	cScale=d3.event.scale;
	d3.select("#ct-mindMap").attr("transform","translate("+d3.event.translate+")scale("+d3.event.scale +")");
};
var getElementDimm = function(s){return [parseFloat(s.style("width")),parseFloat(s.style("height"))];};
var createNewMap = function(e){ 
	initiate();
	clearSvg();
	var s=getElementDimm(d3.select("#ct-mapSvg"));
	node={id:uNix,name:'Module_0',type:'modules',x:s[0]*0.2,y:s[1]*0.4,children:[],parent:null};
	dNodes.push(node);nCount[0]++;uNix++;
	addNode(dNodes[uNix-1],!1,null);
};
var loadMap = function(e){
	initiate();
	if(!d3.select('#ct-mindMap')[0][0] || confirm('Unsaved work will be lost if you continue.\nContinue?')){
		clearSvg();
		var reqMap=d3.select(this).attr('data-mapid');
		treeBuilder(allMMaps[reqMap]);
	}
};
var genPathData = function(s,t){
	/*if(s[1]<t[1]) return ('M'+s[0]+','+s[1]+' H'+(((s[0]+t[0])/2)-10)+' Q'+((s[0]+t[0])/2)+','+s[1]+' '+((s[0]+t[0])/2)+','+(s[1]+10)+'  V'+(t[1]-10)+' Q'+((s[0]+t[0])/2)+','+t[1]+' '+(((s[0]+t[0])/2)+10)+','+t[1]+' H'+t[0]);
	else return ('M'+s[0]+','+s[1]+' H'+(((s[0]+t[0])/2)-10)+' Q'+((s[0]+t[0])/2)+','+s[1]+' '+((s[0]+t[0])/2)+','+(s[1]-10)+'  V'+(t[1]+10)+' Q'+((s[0]+t[0])/2)+','+t[1]+' '+(((s[0]+t[0])/2)+10)+','+t[1]+' H'+t[0]);*/
	return ('M'+s[0]+','+s[1]+'C'+(s[0]+t[0])/2+','+s[1]+' '+(s[0]+t[0])/2+','+t[1]+' '+t[0]+','+t[1]);
};
var addNode = function(n,m,pi){
	
	var v=d3.select('#ct-mindMap').append('g').attr('id','ct-node-'+n.id).attr('class','ct-node').attr('data-nodetype',n.type).attr('transform',"translate("+(n.x).toString()+","+(n.y).toString()+")");
	if($("#ct-canvas").attr('class')=='tabCreate ng-scope'){
		v.append('image').attr('class','ct-nodeIcon').attr('xlink:href','images_mindmap/node-'+n.type+'.png').on('click',nodeCtrlClick);
	}else{
		v.append('image').attr('class','ct-nodeIcon').attr('xlink:href','images_mindmap/node-'+n.type+'.png').on('click',nodeClick);
	}
	//v.append('path').attr('class','ct-nodeCtrl').attr('d','M37,37L29,37L37,29Z').on('click',nodeCtrlClick);
	//v.append('image').attr('class','ct-nodeIcon').attr('xlink:href','images_mindmap/node-'+n.type+'.png').on('click',nodeCtrlClick);
	
	v.append('text').attr('class','ct-nodeLabel').html(n.name).attr('text-anchor','middle').attr('x',20).attr('y',50);

	
	if(m&&pi){
		var p=d3.select('#ct-node-'+pi.id);
		if(!p.select('circle.ct-cRight')[0][0]) p.append('circle').attr('class','ct-'+pi.type+' ct-cRight ct-nodeBubble').attr('cx',43).attr('cy',20).attr('r',4).on('click',toggleNode);
		v.append('circle').attr('class','ct-'+n.type+' ct-cLeft ct-nodeBubble').attr('cx',-3).attr('cy',20).attr('r',4).on('mousedown',moveNodeBegin).on('mouseup',moveNodeEnd);
	}
};
var addLink = function(r,p,c){
	var s=[p.x+43,p.y+20];
	var t=[c.x-3,c.y+20];
	var d=genPathData(s,t);
	var l=d3.select('#ct-mindMap').insert('path','g').attr('id','ct-link-'+r).attr('class','ct-link').attr('d',d);
};


var addTask = function(e){
	d3.select('#ct-assignBox').classed('no-disp',!0);
	var a,b,p=d3.select(activeNode);
	var pi=parseInt(p.attr('id').split('-')[2]);
	var nType=p.attr('data-nodetype');
	var tObj={t:/*d3.select('#ct-assignTask').html()*/$('#ct-assignTask').val(),at:$('#ct-assignedTo').val(),rw:(d3.select('#ct-assignRevw')[0][0])?$('#ct-assignRevw').val():null,sd:$('#startDate').val(),ed:$('#endDate').val(),re:(d3.select('#ct-assignRel')[0][0])?$('#ct-assignRel').val():null,cy:(d3.select('#ct-assignCyc')[0][0])?$('#ct-assignCyc').val():null,det:d3.select('#ct-assignDetails').property('value')};
	if(dNodes[pi].task){
		tObj.id=dNodes[pi].task.id;
		tObj.oid=dNodes[pi].task.oid;
		tObj.parent=dNodes[pi].task.parent;
	}
	else {
		tObj.id=null;
		tObj.oid=null;
		tObj.parent=null;
	}
	var taskflag=false;
	Object.keys(tObj).forEach(function(k){if(tObj[k]==''||tObj[k]===undefined) tObj[k]=null;});
	//if(p.select('.ct-nodeTask')[0][0]==null) p.append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
	if(nType=="modules"){
		dNodes[pi].task={id:tObj.id,oid:tObj.oid,task:tObj.t,assignedTo:tObj.at,startDate:tObj.sd,endDate:tObj.ed,release:tObj.re,cycle:tObj.cy,details:tObj.det,parent:(tObj.parent!=null)?tObj.parent:[dNodes[pi].id_c]};
		if(dNodes[pi].children) dNodes[pi].children.forEach(function(tSc){
			tSc.children.forEach(function(scr){
				if(scr.task===undefined||scr.task==null){
					if(dNodes[pi].id_c!='null' && tSc.id_c!='null' && scr.id_c!='null'){
						taskflag=true;
						scr.task={id:null,oid:null,task:"Scrape",assignedTo:tObj.at,reviewer:null,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:[dNodes[pi].id_c,tSc.id_c,scr.id_c]};
						d3.select('#ct-node-'+scr.id).append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
					}
					
				}else{
						if (scr.task.assignedTo!=tObj.at){
							scr.task.assignedTo=tObj.at;
						}
						//taskflag=true;
				}
				scr.children.forEach(function(tCa){
					if(tCa.task===undefined||tCa.task==null){
						if(dNodes[pi].id_c!='null' && tSc.id_c!='null' && scr.id_c!='null' && tCa.id_c != 'null' ){
							taskflag=true;
							tCa.task={id:null,oid:null,task:"Design",assignedTo:tObj.at,reviewer:null,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:[dNodes[pi].id_c,tSc.id_c,scr.id_c,tCa.id_c]};
							d3.select('#ct-node-'+tCa.id).append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
						}
					}else{
						if (tCa.task.assignedTo!=tObj.at){
							tCa.task.assignedTo=tObj.at;

						}
						taskflag=true;
					}
				});
			});
		});
	}
	else if(nType=="screens"){
		var modid=dNodes[pi].parent.parent.id_c,tscid=dNodes[pi].parent.id_c,scrid=dNodes[pi].id_c;
		dNodes[pi].task={id:tObj.id,oid:tObj.oid,task:tObj.t,assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:(tObj.parent!=null)?tObj.parent:[modid,tscid,scrid]};
		if(dNodes[pi].children) dNodes[pi].children.forEach(function(tCa){
			var cTask=(tObj.t=="Scrape"||tObj.t=="Append"||tObj.t=="Compare")? "Design":"Debug";
			if(tCa.task===undefined||tCa.task==null){
				var tcid=dNodes[pi].children[0].id_c;
				if (modid !='null' && tscid !='null' && scrid!='null' && tcid!='null'){
					taskflag=true;
					tCa.task={id:null,oid:null,task:cTask,assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:[modid,tscid,scrid,tcid]};
					d3.select('#ct-node-'+tCa.id).append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
				}
			}else{
				if (tCa.task.assignedTo!=tObj.at || tCa.task.reviewer!=tObj.rw ){
					tCa.task.assignedTo=tObj.at;
					tCa.task.reviewer!=tObj.rw
				}
				taskflag=true;
			}
		});
	}
	else if(nType=="testcases"){
		var modid=dNodes[pi].parent.parent.parent.id_c,tscid=dNodes[pi].parent.parent.id_c,scrid=dNodes[pi].parent.id_c;var tcid=dNodes[pi].id_c;
		if (modid !='null' && tscid !='null' && scrid!='null' && tcid!='null'){
			taskflag=true;
			dNodes[pi].task={id:tObj.id,oid:tObj.oid,task:tObj.t,assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:(tObj.parent!=null)?tObj.parent:[modid,tscid,scrid,tcid]};
		}
		
	}
	if (taskflag){
		if(p.select('.ct-nodeTask')[0][0]==null) p.append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
	}else{
		$('#Mindmap_assign_error').modal('show');
		//alert('Error ! Please create the structure before Task Assignement');
	}
};



var nodeClick = function(e){
	e=e||window.event;
	e.cancelbubble=!0;
	if(e.stopPropagation) e.stopPropagation();
	activeNode=this.parentElement;
	var u,v,w,f,c=d3.select('#ct-assignBox');
	var p=d3.select(activeNode);
	var pi=parseInt(p.attr('id').split('-')[2]);
	var t=p.attr('data-nodetype');
	if(t=='scenarios') return;
	var nt=(dNodes[pi].task!==undefined||dNodes[pi].task!=null)?dNodes[pi].task:!1;
	var tObj={t:(nt)?nt.task:'',at:(nt)?nt.assignedTo:'',rw:(nt&&nt.reviewer!=null)?nt.reviewer:'',sd:(nt)?nt.startDate:'',ed:(nt)?nt.endDate:'',re:(nt&&nt.release!=null)?nt.release:'',cy:(nt&&nt.cycle!=null)?nt.cycle:'',det:(nt)?nt.details:''};
	d3.select('#ct-assignDetails').property('value',tObj.det);
	d3.select('#ct-assignTable').select('ul').remove();
	u=d3.select('#ct-assignTable').append('ul');
	v=u.append('li');
	v.append('span').attr('class','ct-assignItem fl-left').html('Task');
	var d = v.append('select').attr('id','ct-assignTask');
	taskAssign[t].task.forEach(function(tsk,i){
		$('#ct-assignTask').append("<option data-id='"+tsk+"' value='"+tsk+"'>"+tsk+"</option>");
	});
	if (tObj.t==null){
		tObj.t=taskAssign[t].task[0];
	}
	$("#ct-assignTask option[value='" + tObj.t + "']").attr('selected', 'selected'); 
								
						
							

	// w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right');
	// w.append('button').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignTask').html(tObj.t);
	// w.append('button').attr('class','ct-asValBoxIcon btn dropdown-toggle').attr('data-toggle','dropdown').append('span').attr('class','caret');
	// f=w.append('ul').attr('class','ct-asValOptBox dropdown-menu');
	//taskAssign[t].task.forEach(function(tsk){f.append('li').html(tsk).on('click',function(e){d3.select(this.parentElement.parentElement).select('.ct-asValBox').select('a').html(this.innerHTML);});});
	var default_releaseid='';
	taskAssign[t].attributes.forEach(function(tk){
		v=u.append('li');
		
		if(tk=='at'){
			
			var result1 = {};
			v.append('span').attr('class','ct-assignItem fl-left').html('Assigned to');
			var d = v.append('select').attr('id','ct-assignedTo');//.attr('class','assignedTo')
			
			//$('#ct-assignedTo').append("<option value='select user' >Select User</option>");
			dataSender({task:'populateUsers'},function(err,result){
				if(err){ console.log(result);callback(null,err);}
				else{
					result1=JSON.parse(result);
					//alert(assignedUser);
				
						for(i=0; i<result1.userRoles.length && result1.r_ids.length; i++){
							$('#ct-assignedTo').append("<option data-id='"+result1.userRoles[i]+"' value='"+result1.r_ids[i]+"'>"+result1.userRoles[i]+"</option>");	
						}
							$("#ct-assignedTo option[value='" + tObj.at + "']").attr('selected', 'selected'); 
					
					// result1.userRoles.forEach(function(e,i){
					// 	$('.assignedTo').append("<option value='"+e+"'>"+e+"</option>");
					// });
				}
				
			});
		
			

			// v.append('span').attr('class','ct-assignItem fl-left').html('Assigned to');
			// w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right');
			// w.append('button').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignTo').html(tObj.at);
			// w.append('button').attr('class','ct-asValBoxIcon btn dropdown-toggle').attr('data-toggle','dropdown').append('span').attr('class','caret');
			// f=w.append('ul').attr('class','ct-asValOptBox dropdown-menu');
		}
		else if(tk=='rw'){
			var result1 = {};
			v.append('span').attr('class','ct-assignItem fl-left').html('Reviewer');
			var d = v.append('select').attr('id','ct-assignRevw');//.attr('class','reviwedBy');
			$('#ct-assignRevw').append("<option value='select reviewer' select=selected>"+"Select Reviewer"+"</option>");
			dataSender({task:'populateUsers'},function(err,result){
				if(err){ console.log(result);callback(null,err);}
				else{
					result1=JSON.parse(result);
					for(i=0; i<result1.userRoles.length && result1.r_ids.length; i++){
						$('#ct-assignRevw').append("<option data-id='"+result1.userRoles[i]+"' value='"+result1.r_ids[i]+"'>"+result1.userRoles[i]+"</option>");
					}
					$("#ct-assignRevw option[value='" + tObj.rw + "']").attr('selected', 'selected'); 
					
				}
				
			});
		// 	v.append('span').attr('class','ct-assignItem fl-left').html('Reviewer');
		// 	w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right');
		// 	w.append('button').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignRevw').html(tObj.rw);
		// 	w.append('button').attr('class','ct-asValBoxIcon btn dropdown-toggle').attr('data-toggle','dropdown').append('span').attr('class','caret');
		// 	f=w.append('ul').attr('class','ct-asValOptBox dropdown-menu');
		 }
				else if(tk=='sd'){
			v.append('span').attr('class','ct-assignItem fl-left').html('Start Date');
			w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right dateBoxSd');
			// w.append('input').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignStart').html(tObj.sd);
			// w.append('button').attr('class','ct-asValBoxIcon ct-asItemCal btn dropdown-toggle').attr('data-toggle','dropdown').append('img').attr('src','images_mindmap/ic-datepicker.png').attr('alt','calIcon');
			w.append('input').attr('class', 'datepicker').attr('id','startDate');
		    //$("img[src='images_mindmap/ic-datepicker.png']:not(.dateIcon)").remove();
			$(".dateBoxSd").append("<img class='dateIcon' src='images_mindmap/ic-datepicker.png' />").attr('alt','calIcon');
			$('#startDate').datepicker({
						 format: "dd/mm/yyyy",
                         autoclose: true
					});
			f=w.append('ul').attr('class','ct-asValCalBox dropdown-menu');//.on('click',$('.ct-asValBoxIcon.ct-asItemCal.btn.dropdown-toggle').datepicker());
			$("#startDate").val(tObj.sd);
							
		}
		else if(tk=='ed'){
			v.append('span').attr('class','ct-assignItem fl-left').html('End Date');
			$(".fl-right").append("<img src='images_mindmap/ic-datepicker.png' />").attr('alt','calIcon');
			w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right dateBoxEd');
			//w.append('button').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignEnd').html(tObj.ed);
			//w.append('button').attr('class','ct-asValBoxIcon ct-asItemCal btn dropdown-toggle').attr('data-toggle','dropdown').append('img').attr('src','images_mindmap/ic-datepicker.png').attr('alt','calIcon');
			w.append('input').attr('class', 'datepicker').attr('id','endDate');
			$(".dateBoxEd").append("<img class='dateIcon' src='images_mindmap/ic-datepicker.png' />").attr('alt','calIcon');
			    $('#endDate').datepicker({
						 format: "dd/mm/yyyy",
                         autoclose: true
					});
			f=w.append('ul').attr('class','ct-asValCalBox dropdown-menu');//.on('click',$('.ct-asValBoxIcon.ct-asItemCal.btn.dropdown-toggle').datepicker());
			$("#endDate").val(tObj.ed);
		}
		else if(tk=='re'){
			var result1 = {};
			v.append('span').attr('class','ct-assignItem fl-left').html('Release');
					var d = v.append('select').attr('id','ct-assignRel');
					$('#ct-assignRel').append("<option value='select release' select=selected>"+"Select release"+"</option>");
					dataSender({task:'populateReleases',projectId:'d4965851-a7f1-4499-87a3-ce53e8bf8e66'},function(err,result){
						if(err){ releaseResult=err;console.log(result);callback(null,err);}
						
						else{
							
							result1=JSON.parse(result);
							releaseResult = result1;
							default_releaseid=result1.r_ids[0];
							console.log('In rel ',default_releaseid);
							for(i=0; i<result1.r_ids.length && result1.rel.length; i++){
								$('#ct-assignRel').append("<option data-id='"+result1.rel[i]+"' value='"+result1.r_ids[i]+"'>"+result1.rel[i]+"</option>");
							}
							$("#ct-assignRel option[value='" + tObj.re + "']").attr('selected', 'selected'); 
								var result2 = {};
							v.append('span').attr('class','ct-assignItem fl-left').html('Cycle');
							var d = v.append('select').attr('id','ct-assignCyc');
							$('#ct-assignCyc').append("<option value='select cycle' select=selected>"+"Select cycle"+"</option>");
							//'46974ffa-d02a-49d8-978d-7da3b2304255'
							dataSender({task:'populateCycles',relId:default_releaseid},function(err,result){
								console.log('In CYC ',default_releaseid);
								if(err){ 
									console.log('In CYC2222 ',default_releaseid);
									console.log(result);
									callback(null,err);
								}
								else{
									result2=JSON.parse(result);
									for(i=0; i<result2.c_ids.length && result2.cyc.length; i++){
										$('#ct-assignCyc').append("<option data-id='"+result2.cyc[i]+"' value='"+result2.c_ids[i]+"'>"+result2.cyc[i]+"</option>");
									}
									$("#ct-assignCyc option[value='" + tObj.cy + "']").attr('selected', 'selected'); 
								}
								
							});
							
						}


						
					});
					
					

		}
		else if(tk=='cy'){
			// var result2 = {};
			// v.append('span').attr('class','ct-assignItem fl-left').html('Cycle');
			// 		var d = v.append('select').attr('id','ct-assignCyc');
			// 		$('#ct-assignCyc').append("<option value='select cycle' select=selected>"+"Select cycle"+"</option>");
			// 		//'46974ffa-d02a-49d8-978d-7da3b2304255'
			// 		alert('hjiiii',releaseResult);
			// 		dataSender({task:'populateCycles',relId:default_releaseid},function(err,result){
			// 			console.log('In CYC ',default_releaseid);
			// 			if(err){ 
			// 				console.log('In CYC2222 ',default_releaseid);
			// 				console.log(result);
			// 				callback(null,err);
			// 			}
			// 			else{
			// 				result2=JSON.parse(result);
			// 				for(i=0; i<result2.c_ids.length && result2.cyc.length; i++){
			// 					$('#ct-assignCyc').append("<option data-id='"+result2.cyc[i]+"' value='"+result2.c_ids[i]+"'>"+result2.cyc[i]+"</option>");
			// 				}
			// 				$("#ct-assignCyc option[value='" + tObj.cy + "']").attr('selected', 'selected'); 
			// 			}
						
			// 		});


			
		}
	});
	//var cSize=getElementDimm(c);
	var cSize=[270,386];
	var canvSize=getElementDimm(d3.select("#ct-mapSvg"));
	var l=p.attr('transform').slice(10,-1).split(',');
	l=[(parseFloat(l[0])+50)*cScale+cSpan[0],(parseFloat(l[1])-20)*cScale+cSpan[1]];
	if(canvSize[0]-l[0]<cSize[0]) l[0]=l[0]-cSize[0]-60*cScale;
	if(canvSize[1]-l[1]<cSize[1]) l[1]=canvSize[1]-cSize[1]-10*cScale;
	c.style('top',l[1]+'px').style('left',l[0]+'px').classed('no-disp',!1);
};


var nodeClick_old = function(e){
	e=e||window.event;
	e.cancelbubble=!0;
	if(e.stopPropagation) e.stopPropagation();
	activeNode=this.parentElement;
	var u,v,w,f,c=d3.select('#ct-assignBox');
	var p=d3.select(activeNode);
	var pi=parseInt(p.attr('id').split('-')[2]);
	var t=p.attr('data-nodetype');
	if(t=='scenarios') return;
	var nt=(dNodes[pi].task!==undefined||dNodes[pi].task!=null)?dNodes[pi].task:!1;
	var tObj={t:(nt)?nt.task:'',at:(nt)?nt.assignedTo:'',rw:(nt&&nt.reviewer!=null)?nt.reviewer:'',sd:(nt)?nt.startDate:'',ed:(nt)?nt.endDate:'',re:(nt&&nt.release!=null)?nt.release:'',cy:(nt&&nt.cycle!=null)?nt.cycle:'',det:(nt)?nt.details:''};
	d3.select('#ct-assignDetails').property('value',tObj.det);
	d3.select('#ct-assignTable').select('ul').remove();
	u=d3.select('#ct-assignTable').append('ul');
	v=u.append('li');
	v.append('span').attr('class','ct-assignItem fl-left').html('Task');
	w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right');
	w.append('button').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignTask').html(tObj.t);
	w.append('button').attr('class','ct-asValBoxIcon btn dropdown-toggle').attr('data-toggle','dropdown').append('span').attr('class','caret');
	f=w.append('ul').attr('class','ct-asValOptBox dropdown-menu');
	taskAssign[t].task.forEach(function(tsk){f.append('li').html(tsk).on('click',function(e){d3.select(this.parentElement.parentElement).select('.ct-asValBox').select('a').html(this.innerHTML);});});
	taskAssign[t].attributes.forEach(function(tk){
		v=u.append('li');
		if(tk=='at'){
			v.append('span').attr('class','ct-assignItem fl-left').html('Assigned to');
			w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right');
			w.append('button').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignTo').html(tObj.at);
			w.append('button').attr('class','ct-asValBoxIcon btn dropdown-toggle').attr('data-toggle','dropdown').append('span').attr('class','caret');
			f=w.append('ul').attr('class','ct-asValOptBox dropdown-menu');
		}
		else if(tk=='rw'){
			v.append('span').attr('class','ct-assignItem fl-left').html('Reviewer');
			w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right');
			w.append('button').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignRevw').html(tObj.rw);
			w.append('button').attr('class','ct-asValBoxIcon btn dropdown-toggle').attr('data-toggle','dropdown').append('span').attr('class','caret');
			f=w.append('ul').attr('class','ct-asValOptBox dropdown-menu');
		}
		else if(tk=='sd'){
			v.append('span').attr('class','ct-assignItem fl-left').html('Start Date');
			w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right');
			w.append('button').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignStart').html(tObj.sd);
			w.append('button').attr('class','ct-asValBoxIcon ct-asItemCal btn dropdown-toggle').attr('data-toggle','dropdown').append('img').attr('src','images_mindmap/ic-datepicker.png').attr('alt','calIcon');
			f=w.append('ul').attr('class','ct-asValCalBox dropdown-menu');
		}
		else if(tk=='ed'){
			v.append('span').attr('class','ct-assignItem fl-left').html('End Date');
			w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right');
			w.append('button').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignEnd').html(tObj.ed);
			w.append('button').attr('class','ct-asValBoxIcon ct-asItemCal btn dropdown-toggle').attr('data-toggle','dropdown').append('img').attr('src','images_mindmap/ic-datepicker.png').attr('alt','calIcon');
			f=w.append('ul').attr('class','ct-asValCalBox dropdown-menu');
		}
		else if(tk=='re'){
			v.append('span').attr('class','ct-assignItem fl-left').html('Release');
			w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right');
			w.append('button').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignRel').html(tObj.re);
			w.append('button').attr('class','ct-asValBoxIcon btn dropdown-toggle').attr('data-toggle','dropdown').append('span').attr('class','caret');
			f=w.append('ul').attr('class','ct-asValOptBox dropdown-menu');
		}
		else if(tk=='cy'){
			v.append('span').attr('class','ct-assignItem fl-left').html('Cycle');
			w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right');
			w.append('button').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignCyc').html(tObj.cy);
			w.append('button').attr('class','ct-asValBoxIcon btn dropdown-toggle').attr('data-toggle','dropdown').append('span').attr('class','caret');
			f=w.append('ul').attr('class','ct-asValOptBox dropdown-menu');
		}
	});
	//var cSize=getElementDimm(c);
	var cSize=[270,386];
	var canvSize=getElementDimm(d3.select("#ct-mapSvg"));
	var l=p.attr('transform').slice(10,-1).split(',');
	l=[(parseFloat(l[0])+50)*cScale+cSpan[0],(parseFloat(l[1])-20)*cScale+cSpan[1]];
	if(canvSize[0]-l[0]<cSize[0]) l[0]=l[0]-cSize[0]-60*cScale;
	if(canvSize[1]-l[1]<cSize[1]) l[1]=canvSize[1]-cSize[1]-10*cScale;
	c.style('top',l[1]+'px').style('left',l[0]+'px').classed('no-disp',!1);
};
var nodeCtrlClick = function(e){
	e=e||window.event;
	e.cancelbubble=!0;
	if(e.stopPropagation) e.stopPropagation();
	activeNode=this.parentElement;
	var p=d3.select(activeNode);
	var t=p.attr('data-nodetype');
	var l=p.attr('transform').slice(10,-1).split(',');
	l=[(parseFloat(l[0])+40)*cScale+cSpan[0],(parseFloat(l[1])+40)*cScale+cSpan[1]];
	var c=d3.select('#ct-ctrlBox').style('top',l[1]+'px').style('left',l[0]+'px').classed('no-disp',!1);
	c.select('p.'+faRef.plus).classed('ct-ctrl-inactive',!1);
	if(t=='modules'){
		c.select('p.'+faRef.plus+' .ct-tooltiptext').html('Create Scenarios');
		c.select('p.'+faRef.edit+' .ct-tooltiptext').html('Edit Module');
		c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Module');
	}
	else if(t=='scenarios'){
		c.select('p.'+faRef.plus+' .ct-tooltiptext').html('Create Screens');
		c.select('p.'+faRef.edit+' .ct-tooltiptext').html('Edit Scenario');
		c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Scenario');
	}
	else if(t=='screens'){
		c.select('p.'+faRef.plus+' .ct-tooltiptext').html('Create Testcases');
		c.select('p.'+faRef.edit+' .ct-tooltiptext').html('Edit Screen');
		c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Screen');
	}
	else if(t=='testcases'){
		c.select('p.'+faRef.plus).classed('ct-ctrl-inactive',!0);
		c.select('p.'+faRef.edit+' .ct-tooltiptext').html('Edit Testcase');
		c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Testcase');
	}
};
var createNode = function(e){
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	var p=d3.select(activeNode);
	var pt=p.attr('data-nodetype');
	if(pt=='testcases') return;
	var pi = p.attr('id').split('-')[2];
	var nNext={'modules':['Scenario',1],'scenarios':['Screen',2],'screens':['Testcase',3]};
	var mapSvg=d3.select('#ct-mapSvg');
	var w=parseFloat(mapSvg.style('width'));
	var h=parseFloat(mapSvg.style('height'));
	node={id:uNix,name:nNext[pt][0]+'_'+nCount[nNext[pt][1]],type:(nNext[pt][0]).toLowerCase()+'s',x:w*(0.15*(1.34+nNext[pt][1])+Math.random()*0.1),y:90+70*Math.floor(Math.random()*(Math.floor((h-150)/70))),children:[],parent:dNodes[pi]};
	dNodes.push(node);nCount[nNext[pt][1]]++;
	dNodes[pi].children.push(dNodes[uNix]);
	addNode(dNodes[uNix],!0,dNodes[pi]);
	link={id:uLix,source:dNodes[pi],target:dNodes[uNix]};
	dLinks.push(link);
	addLink(uLix,dNodes[pi],dNodes[uNix]);
	uNix++;uLix++;
};
var editNode = function(e){
	$('#ct-inpAct').removeClass('errorClass');
	e=e||window.event;
	e.cancelbubble=!0;
	if(e.stopPropagation) e.stopPropagation();
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	var p=d3.select(activeNode);
	var pi = p.attr('id').split('-')[2];
	var t=p.attr('data-nodetype');
	var l=p.attr('transform').slice(10,-1).split(',');
	l=[(parseFloat(l[0])-20)*cScale+cSpan[0],(parseFloat(l[1])+42)*cScale+cSpan[1]];
	d3.select('#ct-inpBox').style('top',l[1]+'px').style('left',l[0]+'px').classed('no-disp',!1);
	d3.select('#ct-inpPredict').property('value','');
	d3.select('#ct-inpAct').attr('data-nodeid',null).property('value',p.text()).node().focus();
	d3.select('#ct-inpSugg').classed('no-disp',!0);
};
var deleteNode = function(e){
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	var s=d3.select(activeNode);
	var sid = s.attr('id').split('-')[2];
	var p=dNodes[sid].parent;
	recurseDelChild(dNodes[sid]);
	for(j=dLinks.length-1;j>=0;j--){
		if(dLinks[j].target.id==sid){
			d3.select('#ct-link-'+dLinks[j].id).remove();
			dLinks[j].deleted=!0;
			break;
		}
	}
	p.children.some(function(d,i){
		if(d.id==sid){
			p.children.splice(i,1);
			return !0;
		}
		return !1;
	});
	if(p.children.length==0) d3.select('#ct-node-'+p.id).select('.ct-cRight').remove();
};
var recurseDelChild = function(d){
	if(d.children) d.children.forEach(function(e){recurseDelChild(e);});
	d.parent=null;
	d.children=null;
	d.task=null;
	d3.select('#ct-node-'+d.id).remove();
	deletednode.push(d.oid)
	for(j=dLinks.length-1;j>=0;j--){
		if(dLinks[j].source.id==d.id){
			d3.select('#ct-link-'+dLinks[j].id).remove();
			dLinks[j].deleted=!0;
		}
	}
};
var moveNode = function(e){
	e=e||window.event;
	d3.select('.ct-movable').attr('transform', "translate("+parseFloat((e.pageX-14-cSpan[0])/cScale+2)+","+parseFloat((e.pageY-70-cSpan[1])/cScale-20)+")");
};
var moveNodeBegin = function(e){
	e=e||window.event;
	e.cancelbubble=!0;
	if(e.stopPropagation) e.stopPropagation();
	var p=d3.select(this.parentElement);
	var pi=p.attr('id').split('-')[2];
	temp={s:[],t:""};
	dLinks.forEach(function(d,i){
		if(d.source.id==pi){
			temp.s.push(d.id);
			d3.select('#ct-link-'+d.id).remove();
		}
		else if(d.target.id==pi){
			temp.t=d.id;
			d3.select('#ct-link-'+d.id).remove();
		}
	});
	p.classed('ct-movable',!0);
	d3.select('#ct-mapSvg').on('mousemove.nodemove',moveNode);
};
var moveNodeEnd = function(e){
	d3.select('#ct-mapSvg').on('mousemove.nodemove',null);
	var p=d3.select(this.parentElement);
	var pi=p.attr('id').split('-')[2];
	var l=p.attr('transform').slice(10,-1).split(',');
	dNodes[pi].x=parseFloat(l[0]);
	dNodes[pi].y=parseFloat(l[1]);
	addLink(temp.t,dLinks[temp.t].source,dLinks[temp.t].target);
	var v=(dNodes[pi].children)?!1:!0;
	temp.s.forEach(function(d){
		addLink(d,dLinks[d].source,dLinks[d].target);
		d3.select('#ct-link-'+d).classed('no-disp',v);
	});
	p.classed('ct-movable',!1);
};
var toggleNode = function(e){
	var p=d3.select(this.parentElement);
	var pi = p.attr('id').split('-')[2];
	if(dNodes[pi].children){
		p.select('.ct-cRight').classed('ct-nodeBubble',!1);
		dNodes[pi]._children=dNodes[pi].children;
		dNodes[pi].children=null;
		recurseTogChild(dNodes[pi],!0);
	}
	else if(dNodes[pi]._children){
		p.select('.ct-cRight').classed('ct-nodeBubble',!0);
		dNodes[pi].children=dNodes[pi]._children;
		dNodes[pi]._children=null;
		recurseTogChild(dNodes[pi],!1);
	}
};
var recurseTogChild = function(d,v){
	if(d.children) d.children.forEach(function(e){
		recurseTogChild(e,v);
		d3.select('#ct-node-'+e.id).classed('no-disp',v);
		for(j=dLinks.length-1;j>=0;j--){
			if(dLinks[j].source.id==d.id){
				d3.select('#ct-link-'+dLinks[j].id).classed('no-disp',v);
			}
		}
	});
	else if(d._children) d._children.forEach(function(e){
		recurseTogChild(e,!0);
		d3.select('#ct-node-'+e.id).classed('no-disp',!0);
		for(j=dLinks.length-1;j>=0;j--){
			if(dLinks[j].source.id==d.id){
				d3.select('#ct-link-'+dLinks[j].id).classed('no-disp',!0);
			}
		}
	});
};
var validNodeDetails = function(value,p){
	var nName,flag=!0;
	nName=value;
	var specials=/[*|\":<>[\]{}`\\()';@&$]/;
	if (!(nName.length>0 || (specials.test(nName))) ){
		$('#ct-inpAct').addClass('errorClass');
		flag=!1;
	}
	return flag;
};

var validNodeDetails1 = function(p){
	var nName,flag=!0;
	nName=d3.select(p).property('value');
	if(!(/^[a-zA-Z0-9_]+$/.test(nName))){
		flag=!1;
		//d3.select('#dt-c-inp-box a.dt-c-nerror').style('visibility','visible');
		d3.select(p).classed('ct-inperror',!0);
	}
	else{
		//d3.select('#dt-c-inp-box a.dt-c-nerror').style('visibility','hidden');
		d3.select(p).classed('ct-inperror',!1);
	}
	return flag;
};
var inpChange = function(e){
	var inp=d3.select('#ct-inpAct');
	var val=inp.property('value');
	if(!validNodeDetails(val,this)) return;
	//if(!validNodeDetails(this)) return;
	var p=d3.select(activeNode);
	var pi=p.attr('id').split('-')[2];
	var pt=p.select('.ct-nodeLabel');
	var t=p.attr('data-nodetype');
	if(!d3.select('#ct-inpSugg').classed('no-disp') && temp && temp.length>0) return;
	if(dNodes[pi].id_n) dNodes[pi].rnm=!0;
	if(t=='screens' && scrList[inp.attr('data-nodeid')]!==undefined){
		dNodes[pi].id_n=scrList[inp.attr('data-nodeid')].id_n;
		dNodes[pi].name=scrList[inp.attr('data-nodeid')].name;
		pt.html(dNodes[pi].name);
		d3.select('#ct-inpBox').classed('no-disp',!0);
	}
	else if(t=='testcases' && tcList[inp.attr('data-nodeid')]!==undefined){
		dNodes[pi].id_n=tcList[inp.attr('data-nodeid')].id_n;
		dNodes[pi].name=tcList[inp.attr('data-nodeid')].name;
		pt.html(dNodes[pi].name);
		d3.select('#ct-inpBox').classed('no-disp',!0);
	}
	else{
		dNodes[pi].name=val;
		pt.html(dNodes[pi].name);
		d3.select('#ct-inpBox').classed('no-disp',!0);
	}
};
var inpKeyUp = function(e){
	e=e||window.event;
	temp=[];
	var t,list;
	var p=d3.select(activeNode);
	var val=d3.select(this).property('value');
	var iul=d3.select('#ct-inpSugg');
	if(e.keyCode==13) {
		inpChange();			
		return;
	}
	if(val.indexOf('_')==-1) {
		iul.classed('no-disp',!0);
		d3.select(this.parentElement).select('#ct-inpPredict').property('value','');
		return;
	}
	t=p.attr('data-nodetype');
	if(t == 'scenarios') list = scenarioList;
	else if(t=='screens') list=scrList;
	else if(t=='testcases') list=tcList;
	else return;
	iul.selectAll('li').remove();
	list.forEach(function(d,i){
		var s=d.name.toLowerCase();
		if(s.lastIndexOf(val.toLowerCase(),0)===0){
			temp.push(i);
			if(d.name.length>23) s=d.name.slice(0,23)+"...";
			else s=d.name;
			iul.append('li').attr('class','divider');
			iul.append('li').append('a').attr('data-nodeid',i).attr('data-nodename',d.name).html(s).on('click',function(){
				var k=d3.select(this);
				d3.select('#ct-inpSugg').classed('no-disp',!0);
				d3.select('#ct-inpPredict').property('value','');
				d3.select('#ct-inpAct').attr('data-nodeid',k.attr('data-nodeid')).property('value',k.attr('data-nodename')).node().focus();
			});
		}
	});
	if(temp.length>0 && val!=list[temp[0]].name){
		if(e.keyCode==39){
			iul.classed('no-disp',!0);
			d3.select('#ct-inpPredict').property('value','');
			d3.select(this).attr('data-nodeid',temp[0]).property('value',list[temp[0]].name);
		}
		else{
			iul.select('li.divider').remove();
			iul.classed('no-disp',!1);
			d3.select(this).attr('data-nodeid',null);
			d3.select(this.parentElement).select('#ct-inpPredict').property('value',list[temp[0]].name);
		}
	}
	else{
		iul.classed('no-disp',!0);
		d3.select(this).attr('data-nodeid',null);
		d3.select(this.parentElement).select('#ct-inpPredict').property('value','');
	}
};
var treeIterator = function(c,d,e){
	c.push({id:d.id,id_c:(d.id_c)?d.id_c:null,id_n:(d.id_n)?d.id_n:null,oid:(d.oid)?d.oid:null,name:d.name,type:d.type,pid:(d.parent)?d.parent.id:null,task:(d.task)?d.task:null,renamed:(d.rnm)?d.rnm:!1});
	if(d.children&&d.children.length>0) d.children.forEach(function(t){e=treeIterator(c,t,e);});
	else if(d._children&&d._children.length>0) d._children.forEach(function(t){e=treeIterator(c,t,e);});
	else if(d.type!='testcases') return !0;
	return e;
};
var actionEvent = function(e){
	var s=d3.select(this);
	var error=!1,mapData=[],flag=0,alertMsg;
	error=treeIterator(mapData,dNodes[0],error);
	if(error){
		//alert('Mindmap flow must be complete!\nModules>Scenarios>Screens>Testcases');
		$('#Mindmap_error').modal('show');
		return;
	}
	if(s.attr('id')=='ct-saveAction'){
		flag=10;
		//alertMsg="Data written successfully!";
		$('#Mindmap_save').modal('show');
	}
	else if(s.attr('id')=='ct-createAction'){
		flag=20;
		//alertMsg="Data sent successfully!";
		$('#Mindmap_save').modal('show');
		//alert("Caution! Save data before submitting\nIgnore if already saved.");
	}
	if(flag==0) return;
	if(s.classed('no-access')) return;
	s.classed('no-access',!0);
	var userInfo =  JSON.parse(window.localStorage['_UI']);
	var username = userInfo.username;
	dataSender({task:'writeMap',data:{write:flag,map:mapData,user_name:username,abc:deletednode}},function(err,result){
		s.classed('no-access',!1);
		if(err) console.log(result);
		else{
			//alert(alertMsg);
			var res=JSON.parse(result);
			if(flag==10) mapSaved=!0;
			var mid,sts=allMMaps.some(function(m,i){
				if(m.id_n==res.id_n) {
					mid=i;
					allMMaps[i]=res;
					return !0;
				}
				return !1;
			});
			if(!sts){
				mid=allMMaps.length;
				allMMaps.push(res);
				var node=d3.select('.ct-nodeBox').append('div').attr('class','ct-node fl-left').attr('data-mapid',mid).on('click',loadMap);
				node.append('img').attr('class','ct-nodeIcon').attr('src','images_mindmap/node-modules-no.png').attr('alt','Module').attr('aria-hidden',true);
				node.append('span').attr('class','ct-nodeLabel').html(res.name.replace(/_/g,' '));
			}
			setModuleBoxHeight();
			populateDynamicInputList();
			clearSvg();
			treeBuilder(allMMaps[mid]);
		}
	});
};
var toggleExpand = function(e){
	var s=d3.select($("#"+e.target.id));
	var p=d3.select($("#"+e.target.id).parent());
	$("#"+e.target.id).toggleClass('ct-rev');
	$("#"+e.target.id).parent().toggleClass('ct-open');
	e.stopImmediatePropagation();
};
var toggleExpandAssign = function(e){
	var s=d3.select($("#"+e.target.id));
	var p=d3.select($("#"+e.target.id).parent());
	$("#"+e.target.id).toggleClass('ct-rev');
	$("#"+e.target.id).parent().toggleClass('ct-open');
	e.stopImmediatePropagation();
};
var clickHideElements = function(e){
	d3.select('#ct-inpBox').classed('no-disp',!0);
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	d3.select('#ct-assignBox').classed('no-disp',!0);
};
var setModuleBoxHeight = function(){
	//var lm=d3.select('#ct-moduleBox').classed('ct-open',!0);
	var lm=d3.select('.ct-moduleBoxOptional').classed('ct-open',!0);
	var h1=lm.style('height');
	lm.classed('ct-open',!1);
	if(h1==lm.style('height')) lm.select('.ct-expand').classed('no-disp',!0);
	else lm.select('.ct-expand').classed('no-disp',!1);
};
var populateDynamicInputList = function(){
	scrList=[];tcList=[];scenarioList=[];
	var scrDict={},tcDict={},scenarioDict={};
	allMMaps.forEach(function(m){
		m.children.forEach(function(ts){
			if(scenarioDict[ts.id_n]===undefined){
					scenarioList.push({id:ts.id,name:ts.name,id_n:ts.id_n});
					scenarioDict[ts.id_n]=!0;
			}
			ts.children.forEach(function(s){
				if(scrDict[s.id_n]===undefined){
					scrList.push({id:s.id,name:s.name,id_n:s.id_n});
					scrDict[s.id_n]=!0;
				}
				s.children.forEach(function(tc){
					if(tcDict[tc.id_n]===undefined){
						tcList.push({id:tc.id,name:tc.name,id_n:tc.id_n});
						tcDict[tc.id_n]=!0;
					}
				});
			});
		});
	});
};
var clearSvg = function(){
	d3.select('#ct-mindMap').remove();
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	d3.select('#ct-assignBox').classed('no-disp',!0);
	d3.select('#ct-mapSvg').append('g').attr('id','ct-mindMap');
	uNix=0;uLix=0;dNodes=[];dLinks=[];nCount=[0,0,0,0];cSpan=[0,0];cScale=1;mapSaved=!1;
	zoom.scale(cScale).translate(cSpan);
	zoom.event(d3.select('#ct-mapSvg'));
};
var treeBuilder = function(tree){
	var pidx=0,levelCount=[1],cSize=getElementDimm(d3.select("#ct-mapSvg"));
	var typeNum={'modules':0,'scenarios':1,'screens':2,'testcases':3};
	var childCounter = function(l,s){
		if(levelCount.length<=l) levelCount.push(0);
		if(s.children) {
			levelCount[l]+=s.children.length;
			s.children.forEach(function(d){childCounter(l+1,d);});
		}
	};
	childCounter(1,tree);
	var newHeight = d3.max(levelCount)*90;
	var d3Tree=d3.layout.tree().size([newHeight,cSize[0]]);
	if(tree.oid===undefined) d3Tree.sort(function(a,b){return a.id-b.id;});
	else d3Tree.sort(function(a,b){return a.oid-b.oid;});
	dNodes=d3Tree.nodes(tree);
	dLinks=d3Tree.links(dNodes);
	dNodes.forEach(function(d){
		d.y=d.x;
		d.x=cSize[0]*0.2*(0.9+typeNum[d.type]);
		if(d.oid===undefined)d.oid=d.id;
		d.id=uNix++;
		addNode(d,!0,d.parent);
		if(d.task!=null) d3.select('#ct-node-'+d.id).append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
	});
	dLinks.forEach(function(d){
		d.id=uLix++;
		addLink(d.id,d.source,d.target);
	});
	zoom.translate([0,(cSize[1]/2)-dNodes[0].y]);
	zoom.event(d3.select('#ct-mapSvg'));
};
var dataSender = function(data,callback){
	var xhttp;
	try{xhttp=new XMLHttpRequest();}catch(e){try{xhttp=new ActiveXObject("Msxml2.XMLHTTP");}catch(e){try{xhttp=new ActiveXObject("Microsoft.XMLHTTP");}catch(e){alert("Your Browser is outdated!\nPlease Update!");return false;}}}
	xhttp.onreadystatechange = function(){4==this.readyState&&(200==this.status?callback(!1,this.responseText):(400==this.status||401==this.status||402==this.status||403==this.status||404==this.status)&&callback(!0,this.responseText));};
	xhttp.open("POST",window.location.pathname,!0);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(data));
};
