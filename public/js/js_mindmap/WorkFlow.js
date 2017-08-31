var uNix_W,uLix_W,node,link,dNodes_W,dLinks_W,allMMaps_W,temp_W,faRef,mapSaved,zoom_W,cSpan_W,cScale_W,taskAssign;
var cur_module,allMaps_info,activeNode_W,childNode_W;
//unassignTask is an array to store whose task to be deleted
var deletednode_W=[],unassignTask=[];
var userInfo =  JSON.parse(window.localStorage['_UI']);
var userid = userInfo.user_id;
// node_names_tc keep track of testcase names to decide reusability of testcases
var node_names_tc=[];
var saveFlag=false;
var isIE = /*@cc_on!@*/false || !!document.documentMode;
 function initScroller(){
    	$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
    }
function loadMindmapData_W(){
	
	dataSender({task:'populateProjects',user_id:userid},function(err,result){
		if(err) console.log(result);
		else{
			 if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
                {
                   $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
                }
			result1=JSON.parse(result);
			var selectedProject=$(".selectProjectEtem").val();
			$("#selectProjectEtem").empty();
			for(i=0; i<result1.projectId.length && result1.projectName.length; i++){
				$('#selectProjectEtem').append("<option app-type='"+result1.appType[i]+"' data-id='"+result1.projectName[i]+"' value='"+result1.projectId[i]+"'>"+result1.projectName[i]+"</option>");	
			}

			if (selectedProject == null){
				selectedProject=result1.projectName[0];
			}
			$("#selectProjectEtem option[value='" + selectedProject + "']").attr('selected', 'selected');
			loadMindmapData1_W(); 
			$("#selectProjectEtem").change(function () {
            //alert($(".project-list").val());
				if($("img.iconSpaceArrow").hasClass("iconSpaceArrowTop"))
				{
					$("img.iconSpaceArrow").removeClass("iconSpaceArrowTop");
				}
				loadMindmapData1_W();
			});
			//Calling the function to restrict the user to give default node names
			$("#ct-canvas").click(callme);
		}
	});
}

function loadMindmapData1_W(){
	blockUI("Loading...");
	$('#eteScenarioContainer').empty();
	d3.select('.addScenarios-ete').classed('disableButton',!0);
	$('#ct-saveAction_W').removeClass('no-access');
	//uNix=0;uLix=0;dNodes=[];dLinks=[];nCount=[0,0,0,0];scrList=[];tcList=[];cSpan_W=[0,0];cScale_W=1;mapSaved=!1;
	taskAssign={"modules_endtoend":{"task":["Execute"],"attributes":["at","rw","sd","ed","re","cy"]},"scenarios":{"task":["Execute Scenario"],"attributes":["at","rw","sd","ed"]},"screens":{"task":["Scrape","Append","Compare","Add","Map"],"attributes":["at","rw","sd","ed"]},"testcases":{"task":["Update","Design"],"attributes":["at","rw","sd","ed"]}};
	zoom_W=d3.behavior.zoom().scaleExtent([0.1,3]).on("zoom", zoomed_W);
	faRef={"plus":"fa-plus","edit":"fa-pencil-square-o","delete":"fa-trash-o"};
	
		// $(document).on('click',".ct-tile_W", function() {
		// 	createNewMap_W();
		// 	});

				 $(document).on('click',"#ctExpandCreate", function(e) {
					if($(".ct-node:visible").length > 6)
					{
						toggleExpand(e);
					}
				 	});
				$(document).on('click',"#ctExpandAssign", function(e) {
					if($(".ct-node:visible").length > 6)
					{
						toggleExpandAssign(e);
					}
				 	});
	d3.select('#ct-main').on('contextmenu',function(e){d3.event.preventDefault();});
	var svgTileG=d3.select('.ct-tile_W').append('svg').attr('class','ct-svgTile').attr('height','150px').attr('width','150px').append('g');
	var svgTileLen = $(".ct-svgTile").length;
	if(svgTileLen == 0)
	{
		// $('#ct-mapSvg, #ct-canvas').empty();
		// $('#ct-canvas').append('<div class="ct-tileBox"><div class="ct-tile_W" title="Create Mindmap"><svg class="ct-svgTile" height="150px" width="150px"><g><circle cx="75" cy="75" r="30"></circle><path d="M75,55L75,95"></path><path d="M55,75L95,75"></path></g></svg></div><span class="ct-text">Create Mindmap</span></div>');
			
	}
	d3.select('#ct-assignBox').classed('no-disp',!0);
	dataSender({task:'getModules',tab:'endToend',prjId:$("#selectProjectEtem").val()},function(err,result){
		if(err){
			console.log(result);
			unblockUI();
		}
		else{
			var nodeBox=d3.select('#etemModuleContainer');
			$(nodeBox[0]).empty();
			allMMaps_W=allMaps_info=JSON.parse(result);
			
			allMMaps_W.forEach(function(e,i){
				//var t=e.name.replace(/_/g,' ');
				var src_image='imgs/ic-reportbox.png'
				var class_name='eteMbox';
				var onclick_func='';
				if (e.type=='modules_endtoend'){
					class_name='eteMboxETE';
					onclick_func=loadScenarios;
					src_image='images_mindmap/endToEnd.png';
				} 
				var t = $.trim(e.name);
				var node=nodeBox.append('span').attr('class','moduleContainer').attr('data-mapid',i).attr('title',t).on('click',onclick_func);
				node.append('img').attr('class','ct-nodeIcon '+class_name).attr('src',src_image).attr('alt','Module').attr('aria-hidden',true);
				node.append('span').attr('class','ct-nodeLabel modulename').html(t);
			});
			initScroller();
			setModuleBoxHeight_W();
			unblockUI();
		}
	});
}
window.onresize=function() {
	var w=window.innerWidth-28,h=window.innerHeight-123;
	var mapSvg=d3.select('#ct-mapSvg').style('width',w+'px').style('height',h+'px');
};
var initiate_W = function(){
	var t,u;
	var selectedTab = window.localStorage['tabMindMap'];
	d3.select('.ct-tileBox').remove();
	if(d3.select('#ct-mindMap')[0][0]!=null) return;
	if(selectedTab == "tabAssign") var canvas=d3.select('#ct-canvasforAssign');
	else var canvas=d3.select('#ct-canvas');
	u=canvas.append('div').attr('id','ct-inpBox').classed('no-disp',!0);
	u.append('input').attr('id','ct-inpPredict').attr('class','ct-inp');
	u.append('input').attr('id','ct-inpAct').attr('maxlength','40').attr('class','ct-inp').on('change',inpChange_W).on('keyup',inpKeyUp_W);
	u.append('ul').attr('id','ct-inpSugg').classed('no-disp',!0);
	u=canvas.append('div').attr('id','ct-ctrlBox').classed('no-disp',!0);
	u.append('p').attr('class','ct-ctrl fa '+faRef.plus).on('click','').append('span').attr('class','ct-tooltiptext').html('');
	u.append('p').attr('class','ct-ctrl fa '+faRef.edit).on('click',editNode_W).append('span').attr('class','ct-tooltiptext').html('');
	u.append('p').attr('class','ct-ctrl fa '+faRef.delete).on('click',deleteNode_W).append('span').attr('class','ct-tooltiptext').html('');
	//u=canvas.append('div').attr('id','ct-assignBox').classed('no-disp',!0);
	//u.append('div').attr('id','ct-assignTable');
	//u.append('div').attr('class','ct-assignDetailsBox').append('textarea').attr('id','ct-assignDetails').attr('placeholder','Enter Details');
	//u.append('div').attr('id','ct-assignButton').append('a').html('OK').on('click',addTask);
	//u.append('div').attr('id','ct-unassignButton').append('a').html('Unassign').on('click',removeTask);
	// var mapSvgDiv = canvas.append('div').attr("class","ct-mapSvgContainer");
	// var mapSvg=mapSvgDiv.append('svg').attr('id','ct-mapSvg').call(zoom).on('click.hideElements',clickHideElements);
	var mapSvg=canvas.append('svg').attr('id','ct-mapSvg').call(zoom_W).on('click.hideElements',clickHideElements);
	var dataAdder=[{c:'#5c5ce5',t:'Modules'},{c:'#4299e2',t:'Scenarios'},{c:'#19baae',t:'Screens'},{c:'#efa022',t:'Test Cases'}];
	u=canvas.append('svg').attr('id','ct-legendBox').append('g').attr('transform','translate(10,10)');
	dataAdder.forEach(function(e,i) {
		t=u.append('g');
		t.append('circle').attr('class','ct-'+(e.t.toLowerCase().replace(/ /g,''))).attr('cx',i*90).attr('cy',0).attr('r',10);
		t.append('text').attr('class','ct-nodeLabel').attr('x',i*90+15).attr('y',3).text(e.t);
	});
	u=canvas.append('svg').attr('id','ct-actionBox_W').append('g');
	t=u.append('g').attr('id','ct-saveAction_W').attr('class','ct-actionButton_W').on('click',actionEvent_W);
	// 886: Unable to rearrange nodes in e2e
	t.append('rect').attr('x',0).attr('y',0).attr('rx',12).attr('ry',12);
	t.append('text').attr('x',23).attr('y',18).text('Save');
	if(selectedTab == "tabCreate" || 'mindmapEndtoEndModules'){
		t=u.append('g').attr('id','ct-createAction_W').attr('class','ct-actionButton_W disableButton').on('click',actionEvent_W);
		t.append('rect').attr('x',100).attr('y',0).attr('rx',12).attr('ry',12);
		t.append('text').attr('x',114).attr('y',18).text('Create');
		// //create new button
		// t=u.append('g').attr('id','ct-createNewAction_W').attr('class','ct-actionButton_W').on('click',createNewMap_W);
		// t.append('rect').attr('x',0).attr('y',0).attr('rx',12).attr('ry',12);
		// t.append('text').attr('x',2).attr('y',18).text('CreateNew');
	}
	
	
};
var zoomed_W = function(){
	cSpan_W=d3.event.translate;
	cScale_W=d3.event.scale;
	
	//Logic to change the layout
	d3.select("#ct-mindMap").attr("transform","translate("+d3.event.translate+")scale("+d3.event.scale +")");
};
var getElementDimm = function(s){return [parseFloat(s.style("width")),parseFloat(s.style("height"))];};
var createNewMap_W = function(e){ 
	initiate_W();
	clearSvg_W();
	var s=getElementDimm(d3.select("#ct-mapSvg"));
	//X and y changed to implement layout change
	node={projectID:$('#selectProjectEtem').val(),id:uNix_W,childIndex:0,name:'Module_0',type:'modules_endtoend',y:s[1]*0.4,x:s[0]*0.2,children:[],parent:null};
	dNodes_W.push(node);nCount[0]++;uNix_W++;
	//To fix issue 710-Create a module and see that module name does not display in edit mode
	v=addNode_W(dNodes_W[uNix_W-1],!1,null);
	childNode_W=v;
	editNode_W(e);
};
var loadScenarios = function(e){
	
	if(!d3.select('#ct-mindMap')[0][0] || confirm('Unsaved work will be lost if you continue.\nContinue?')){
		d3.select('.addScenarios-ete').classed('disableButton',!0);
		saveFlag=false;
		$('#ct-createAction_W').addClass('disableButton');
		$("span.nodeBoxSelected").removeClass("nodeBoxSelected");
		$(this).addClass("nodeBoxSelected");
		cur_module=$(this);
		initiate_W();
		d3.select('#ct-inpBox').classed('no-disp',!0);
		clearSvg_W();
		var reqMap=d3.select(this).attr('data-mapid');
		treeBuilder_W(allMaps_info[reqMap]);
	}
};
var genPathData_W = function(s,t){
	/*if(s[1]<t[1]) return ('M'+s[0]+','+s[1]+' H'+(((s[0]+t[0])/2)-10)+' Q'+((s[0]+t[0])/2)+','+s[1]+' '+((s[0]+t[0])/2)+','+(s[1]+10)+'  V'+(t[1]-10)+' Q'+((s[0]+t[0])/2)+','+t[1]+' '+(((s[0]+t[0])/2)+10)+','+t[1]+' H'+t[0]);
	else return ('M'+s[0]+','+s[1]+' H'+(((s[0]+t[0])/2)-10)+' Q'+((s[0]+t[0])/2)+','+s[1]+' '+((s[0]+t[0])/2)+','+(s[1]-10)+'  V'+(t[1]+10)+' Q'+((s[0]+t[0])/2)+','+t[1]+' '+(((s[0]+t[0])/2)+10)+','+t[1]+' H'+t[0]);*/
	return ('M'+s[0]+','+s[1]+'C'+(s[0]+t[0])/2+','+s[1]+' '+(s[0]+t[0])/2+','+t[1]+' '+t[0]+','+t[1]);
};
var addNode_W = function(n,m,pi){
	
	if(n.type=='testcases'){
		node_names_tc.push(n.name);
	}
	
	var v=d3.select('#ct-mindMap').append('g').attr('id','ct-node-'+n.id).attr('class','ct-node').attr('data-nodetype',n.type).attr('transform',"translate("+(n.x).toString()+","+(n.y).toString()+")");
	// To fix rendering issue in FF issue #415
	// if($("#ct-canvas").attr('class')=='tabCreate ng-scope'){
	// 	v.append('image').attr('height','40px').attr('width','40px').attr('class','ct-nodeIcon').attr('xlink:href','images_mindmap/node-'+n.type+'.png').on('click',nodeCtrlClick);
	// }else{
	// 	v.append('image').attr('height','40px').attr('width','40px').attr('class','ct-nodeIcon').attr('xlink:href','images_mindmap/node-'+n.type+'.png').on('click',nodeClick);
	// }
	
	n.display_name=n.name;
	var img_src='images_mindmap/node-scenarios.png';
	if (n.type=='modules_endtoend') img_src='images_mindmap/MM5.png';
	v.append('image').attr('height','40px').attr('width','40px').attr('class','ct-nodeIcon').attr('xlink:href',img_src).on('click',nodeCtrlClick_W);
	var ch=15;
	if(n.name.length>15 && n.type!='modules_endtoend'){
		if(n.type=='testcases') ch=9;
		n.display_name=n.display_name.slice(0,ch)+'...';
	}
	v.append('text').attr('class','ct-nodeLabel').text(n.display_name).attr('text-anchor','middle').attr('x',20).attr('title',n.name).attr('y',50);
	v.append('title').text(n.name);
	//Condition to add the properties of reuse to the node (Currently only for testcases)
	if(node_names_tc.length>0 && node_names_tc.indexOf(n.name)>-1){
		if(node_names_tc.indexOf(n.name)==node_names_tc.lastIndexOf(n.name)){
			n.reuse='reuse';
		}else{
			n.reuse='parent';
		}
		
		//if(v.select('.ct-nodeReuse')[0][0]==null) 
		//v.append('image').attr('class','ct-nodeReuse').attr('xlink:href','images_mindmap/NEAREST.png').attr('x',10).attr('y',10);
	}
	
	
	
	if(m&&pi){
		var p=d3.select('#ct-node-'+pi.id);
		if(!p.select('circle.ct-cRight')[0][0]) p.append('circle').attr('class','ct-'+pi.type+' ct-cRight ct-nodeBubble').attr('cx',43).attr('cy',20).attr('r',4).on('click',toggleNode_W);
		//Logic to change the layout
		//v.append('circle').attr('class','ct-'+n.type+' ct-cLeft ct-nodeBubble').attr('cx',20).attr('cy',-3).attr('r',4);//.on('mousedown',moveNodeBegin).on('mouseup',moveNodeEnd);
		v.append('circle').attr('class','ct-'+n.type+' ct-cLeft ct-nodeBubble').attr('cx',-3).attr('cy',20).attr('r',4).on('mousedown',moveNodeBegin_W).on('mouseup',moveNodeEnd_W);
	}
	return v;
};
var addLink_W = function(r,p,c){
	//Modified parameters to change the layout
	var s=[p.x+43,p.y+20];
	var t=[c.x-3,c.y+20];
	var d=genPathData_W(s,t);
	var l=d3.select('#ct-mindMap').insert('path','g').attr('id','ct-link-'+r).attr('class','ct-link').attr('d',d);
};
//To Unassign the task of a particular node



var createScenario_Node = function(text,scenario_prjId){
	if(text=='') return;
	//If module is in edit mode, then return do not add any node
	if(d3.select('#ct-inpBox').attr('class')=="") return;
	d3.select('#ct-inpBox').classed('no-disp',!0);
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	var pi=0;
	if(dNodes_W[pi]._children == null){
		if(dNodes_W[pi].children == undefined) dNodes_W[pi]['children']=[];
		//var nNext={'modules_endtoend':['Scenario',1],'scenarios':['Screen',2],'screens':['Testcase',3]};
		var mapSvg=d3.select('#ct-mapSvg');
		var w=parseFloat(mapSvg.style('width'));
		var h=parseFloat(mapSvg.style('height'));
		//name:nNext[pt][0]+'_'+nCount[nNext[pt][1]]

		node={projectID:scenario_prjId,id:uNix_W,childIndex:'',path:'',name:text,type:'scenarios',y:h*(0.15*(1.34+1)+Math.random()*0.1),x:90+30*Math.floor(Math.random()*(Math.floor((w-150)/80))),children:[],parent:dNodes_W[pi]};
		//TO fix issue with random positions of newly created nodes
		if(dNodes_W[pi].children.length >0){
			arr=dNodes_W[pi].children;
			index=dNodes_W[pi].children.length-1;
//			layout_change
			node.y=arr[index].y+80;
			node.x=arr[index].x;

		}else{
			//Modified parameters to change the layout
			node.y=dNodes_W[pi].y;
			node.x=dNodes_W[pi].x+125;
		}
		
		dNodes_W.push(node);
		dNodes_W[pi].children.push(dNodes_W[uNix_W]);
		dNodes_W[uNix_W].childIndex=dNodes_W[pi].children.length
		var currentNode=addNode_W(dNodes_W[uNix_W],!0,dNodes_W[pi]);
		if(currentNode != null){
			childNode_W=currentNode;
			//console.log(currentNode);
			link={id:uLix_W,source:dNodes_W[pi],target:dNodes_W[uNix_W]};
			dLinks_W.push(link);
			addLink_W(uLix_W,dNodes_W[pi],dNodes_W[uNix_W]);
			uNix_W++;uLix_W++;
			
		}
		
	}else{
		openDialogMindmap('Error','Expand the node');
	}
	
};

var nodeCtrlClick_W = function(e){
	e=e||window.event;
	e.cancelbubble=!0;
	if(e.stopPropagation) e.stopPropagation();
	if(isIE) activeNode_W=this.parentNode;
	else activeNode_W=this.parentElement;
	var p=d3.select(activeNode_W);
	var t=p.attr('data-nodetype');
	var split_char=',';
	if(isIE) split_char=' ';
	var l=p.attr('transform').slice(10,-1).split(split_char);
	l=[(parseFloat(l[0])+40)*cScale_W+cSpan_W[0],(parseFloat(l[1])+40)*cScale_W+cSpan_W[1]];
	var c=d3.select('#ct-ctrlBox').style('top',l[1]+'px').style('left',l[0]+'px').classed('no-disp',!1);
	c.select('p.'+faRef.plus).classed('ct-ctrl-inactive',!1);
	c.select('p.'+faRef.edit).classed('ct-ctrl-inactive',!1);
	c.select('p.'+faRef.delete).classed('ct-ctrl-inactive',!1);
	if(t=='modules_endtoend'){
		c.select('p.'+faRef.plus).classed('ct-ctrl-inactive',!0);
		c.select('p.'+faRef.edit+' .ct-tooltiptext').html('Edit Module');
		//513-'Mindmap: When we delete an existing Module and create another module in the same work space  then a new Module instance is being appended .
		c.select('p.'+faRef.delete).classed('ct-ctrl-inactive',!0);
		//c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Module');
	}
	else if(t=='scenarios'){
		c.select('p.'+faRef.plus).classed('ct-ctrl-inactive',!0);
		c.select('p.'+faRef.edit).classed('ct-ctrl-inactive',!0);
		c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Scenario');
	}
	
};

var editNode_W = function(e,node){
	
	$('#ct-inpAct').removeClass('errorClass');
	e=e||window.event;
	e.cancelbubble=!0;
	if(e.stopPropagation) e.stopPropagation();
	//logic to create the node in editable mode
	if(node==0){
		childNode_W=null;
		var p=d3.select(activeNode_W);
	}else var p=childNode_W;
	var pi = p.attr('id').split('-')[2];
	var t=p.attr('data-nodetype');
	if(t=='scenarios') return;
	var split_char=',';
	if(isIE) split_char=' ';
	var l=p.attr('transform').slice(10,-1).split(split_char);
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	if(p.select('.ct-nodeTask')[0][0] != null){
		var msg='Unassign the task to rename';
		if(t=='screens'){
			msg='Unassign the task to rename. And unassign the corresponding testcases tasks';
		}
		openDialogMindmap('Rename Error',msg);
		return;
	}

	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	var name='';
	//By default when a node is created it's name should be in ediatable mode
	
	name=dNodes_W[pi].name;
	//name=p.text();
	l=[(parseFloat(l[0])-20)*cScale_W+cSpan_W[0],(parseFloat(l[1])+42)*cScale_W+cSpan_W[1]];
	d3.select('#ct-inpBox').style('top',l[1]+'px').style('left',l[0]+'px').classed('no-disp',!1);
	d3.select('#ct-inpPredict').property('value','');
	d3.select('#ct-inpAct').attr('data-nodeid',null).property('value',name).node().focus();
	d3.select('#ct-inpSugg').classed('no-disp',!0);
};

var deleteNode_W = function(e){
	//If module is in edit mode, then return do not add any node
	if(d3.select('#ct-inpBox').attr('class')=="") return;
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	var s=d3.select(activeNode_W);
	//513-'Mindmap: When we delete an existing Module and create another module in the same work space  then a new Module instance is being appended .
	var t=s.attr('data-nodetype');
	if(t=='modules_endtoend') return;
	var sid = s.attr('id').split('-')[2];
	var p=dNodes_W[sid].parent;
	recurseDelChild_W(dNodes_W[sid]);
	for(j=dLinks_W.length-1;j>=0;j--){
		if(dLinks_W[j].target.id==sid){
			d3.select('#ct-link-'+dLinks_W[j].id).remove();
			dLinks_W[j].deleted=!0;
			break;
		}
	}
	p.children.some(function(d,i){
		if(d.id==sid){
			//var nodeDel=dNodes_W.pop(sid);
			p.children.splice(i,1);
			return !0;
		}
		return !1;
	});
	if(p.children.length==0) d3.select('#ct-node-'+p.id).select('.ct-cRight').remove();
};
var recurseDelChild_W = function(d){
	if(d.children) d.children.forEach(function(e){recurseDelChild_W(e);});
	d.parent=null;
	d.children=null;
	d.task=null;
	d3.select('#ct-node-'+d.id).remove();
	if(d.oid != undefined){
		deletednode_W.push(d.oid)
	}
	for(j=dLinks_W.length-1;j>=0;j--){
		if(dLinks_W[j].source.id==d.id){
			d3.select('#ct-link-'+dLinks_W[j].id).remove();
			dLinks_W[j].deleted=!0;
		}
	}
};
var moveNode_W = function(e){
	e=e||window.event;
	//#886 Unable to rearrange nodes in e2e
	d3.select('.ct-movable').attr('transform', "translate("+parseFloat((e.pageX-14-cSpan_W[0])/cScale_W+2)+","+parseFloat((e.pageY-210-cSpan_W[1])/cScale_W-20)+")");
};
var moveNodeBegin_W = function(e){
	e=e||window.event;
	e.cancelbubble=!0;
	if(e.stopPropagation) e.stopPropagation();
	//To check whether browser Is IE or not issue #415
	var isIE = /*@cc_on!@*/false || !!document.documentMode;
	var p=d3.select(this.parentElement);
	if (isIE) { 
		var p=d3.select(this.parentNode);
	}
	var pi=p.attr('id').split('-')[2];
	temp_W={s:[],t:""};
	dLinks_W.forEach(function(d,i){
		if(d.source.id==pi){
			temp_W.s.push(d.id);
			d3.select('#ct-link-'+d.id).remove();
		}
		else if(d.target.id==pi){
			temp_W.t=d.id;
			d3.select('#ct-link-'+d.id).remove();
		}
	});
	p.classed('ct-movable',!0);
	d3.select('#ct-mapSvg').on('mousemove.nodemove',moveNode_W);
};
var moveNodeEnd_W = function(e){
	d3.select('#ct-mapSvg').on('mousemove.nodemove',null);
	var isIE = /*@cc_on!@*/false || !!document.documentMode;
	var p=d3.select(this.parentElement);
	var split_char=',';
	if (isIE) { 
		var p=d3.select(this.parentNode);
		split_char=' ';
	}
	
	var pi=p.attr('id').split('-')[2];
	var l=p.attr('transform').slice(10,-1).split(split_char);
	//Logic to implement rearranging of nodes
	var curNode=dNodes_W[pi];
	//logic change dto the change in layout
	var changeOrderRight = function(curNode,ci,p){
		var counter=-1;
		var flag=false;
		dNodes_W[pi].parent.children.forEach(function(a,i){
			if(ci<=(i+1)){
				return false;
			}
			//layout change
			if(l[1]<a.y){
				if(counter==-1) counter=(i+1);
				a.childIndex++;
				curNode.childIndex=counter;
			}
		});
	};
	var changeOrderLeft = function(curNode,ci,p){
		var counter=0;
		var flag=false;
		dNodes_W[pi].parent.children.forEach(function(a,ci){
			//layout change
			if(l[1]>a.y){
				counter=(ci+1);
				a.childIndex--;
				curNode.childIndex=counter;
			}
		});
	};
	var currentChildIndex=curNode.childIndex;
	var totalChildren=curNode.parent.children;
	if(l[1]<curNode.y){
		//alert('moved up');
		changeOrderRight(curNode,currentChildIndex,totalChildren);
	}else{
		//alert('moved down');
		changeOrderLeft(curNode,currentChildIndex,totalChildren);
	}
	dNodes_W[pi].x=parseFloat(l[0]);
	dNodes_W[pi].y=parseFloat(l[1]);
	addLink_W(temp_W.t,dLinks_W[temp_W.t].source,dLinks_W[temp_W.t].target);
	var v=(dNodes_W[pi].children)?!1:!0;
	temp_W.s.forEach(function(d){
		addLink_W(d,dLinks_W[d].source,dLinks_W[d].target);
		d3.select('#ct-link-'+d).classed('no-disp',v);
	});
	p.classed('ct-movable',!1);
};
var toggleNode_W = function(e){
	var isIE = /*@cc_on!@*/false || !!document.documentMode;
	var p=d3.select(this.parentElement);
	if (isIE) { 
		var p=d3.select(this.parentNode);
	}
	var pi = p.attr('id').split('-')[2];
	if(dNodes_W[pi].children){
		p.select('.ct-cRight').classed('ct-nodeBubble',!1);
		dNodes_W[pi]._children=dNodes_W[pi].children;
		dNodes_W[pi].children=null;
		recurseTogChild_W(dNodes_W[pi],!0);
	}
	else if(dNodes_W[pi]._children){
		p.select('.ct-cRight').classed('ct-nodeBubble',!0);
		dNodes_W[pi].children=dNodes_W[pi]._children;
		dNodes_W[pi]._children=null;
		recurseTogChild_W(dNodes_W[pi],!1);
	}
};
var recurseTogChild_W = function(d,v){
	if(d.children) d.children.forEach(function(e){
		recurseTogChild_W(e,v);
		d3.select('#ct-node-'+e.id).classed('no-disp',v);
		for(j=dLinks_W.length-1;j>=0;j--){
			if(dLinks_W[j].source.id==d.id){
				d3.select('#ct-link-'+dLinks_W[j].id).classed('no-disp',v);
			}
		}
	});
	else if(d._children) d._children.forEach(function(e){
		recurseTogChild_W(e,!0);
		d3.select('#ct-node-'+e.id).classed('no-disp',!0);
		for(j=dLinks_W.length-1;j>=0;j--){
			if(dLinks_W[j].source.id==d.id){
				d3.select('#ct-link-'+dLinks_W[j].id).classed('no-disp',!0);
			}
		}
	});
};

var inpChange_W = function(e){
	var inp=d3.select('#ct-inpAct');
	var val=inp.property('value');
	if(val=='Screen_0' || val=='Scenario_0' || val=='Testcase_0' ){
		$('#ct-inpAct').addClass('errorClass');
		return;
	} 
	if(!validNodeDetails(val,this)) return;
	//if(!validNodeDetails(this)) return;
	if(childNode_W!=null){
		var p=childNode_W;
	 }else{
		var p=d3.select(activeNode_W);
	}
	var pi=p.attr('id').split('-')[2];
		var pt=p.select('.ct-nodeLabel');
		var t=p.attr('data-nodetype');
	if(!d3.select('#ct-inpSugg').classed('no-disp') && temp_W && temp_W.length>0) return;
	if(dNodes_W[pi].id_n){
		dNodes_W[pi].original_name=p.text();
		dNodes_W[pi].rnm=!0;
	} 
	//To fix issue 378: In Mindmap, in End to end flow screen , for scenarios, tootlip is not present.
	dNodes_W[pi].name=val;
	pt.text(dNodes_W[pi].name);
	d3.select('#ct-inpBox').classed('no-disp',!0);
		
	
};
var inpKeyUp_W = function(e){
	e=e||window.event;
	temp_W=[];
	var t,list;
	//To fix issue with suggestions
	if(childNode_W!=null){
		var p=childNode_W;
	 }else{
		var p=d3.select(activeNode_W);
	}
	//var p=d3.select(activeNode_W);
	var val=d3.select(this).property('value');
	var iul=d3.select('#ct-inpSugg');
	if(e.keyCode==13) {
		inpChange_W();			
		return;
	}
	if(val.indexOf('_')==-1) {
		iul.classed('no-disp',!0);
		var isIE = /*@cc_on!@*/false || !!document.documentMode;
		if (isIE) { 
			d3.select(this.parentNode).select('#ct-inpPredict').property('value','');
		}else d3.select(this.parentElement).select('#ct-inpPredict').property('value','');
		
		return;
	}
	t=p.attr('data-nodetype');
	//if(t == 'scenarios') list = scenarioList;
	if(t=='screens') list=scrList;
	else if(t=='testcases') list=tcList;
	else return;
	iul.selectAll('li').remove();
	list.forEach(function(d,i){
		var s=d.name.toLowerCase();
		if(s.lastIndexOf(val.toLowerCase(),0)===0){
			temp_W.push(i);
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
	if(temp_W.length>0 && val!=list[temp_W[0]].name){
		if(e.keyCode==39){
			iul.classed('no-disp',!0);
			d3.select('#ct-inpPredict').property('value','');
			d3.select(this).attr('data-nodeid',temp_W[0]).property('value',list[temp_W[0]].name);
		}
		else{
			iul.select('li.divider').remove();
			iul.classed('no-disp',!1);
			d3.select(this).attr('data-nodeid',null);
			if(isIE) d3.select(this.parentNode).select('#ct-inpPredict').property('value',list[temp_W[0]].name);
			else d3.select(this.parentElement).select('#ct-inpPredict').property('value',list[temp_W[0]].name);
		}
	}
	else{
		iul.classed('no-disp',!0);
		d3.select(this).attr('data-nodeid',null);
		if(isIE) d3.select(this.parentNode).select('#ct-inpPredict').property('value','');
		else d3.select(this.parentElement).select('#ct-inpPredict').property('value','');
	}
};
var treeIterator_W = function(c,d,e){
	c.push({projectID:d.projectID,id:d.id,childIndex:d.childIndex,id_c:(d.id_c)?d.id_c:null,id_n:(d.id_n)?d.id_n:null,oid:(d.oid)?d.oid:null,name:d.name,type:d.type,pid:(d.parent)?d.parent.id:null,pid_c:(d.parent)?d.parent.id_c:null,task:(d.task)?d.task:null,renamed:(d.rnm)?d.rnm:!1,orig_name:(d.original_name)?d.original_name:null});
	if(d.children&&d.children.length>0) d.children.forEach(function(t){e=treeIterator_W(c,t,e);});
	//else if(d._children&&d._children.length>0) d._children.forEach(function(t){e=treeIterator(c,t,e);});
	//else if(d.type!='testcases') return !0;
	return e;
};



var actionEvent_W = function(e){
	var s=d3.select(this);
	var error=!1,mapData=[],flag=0,alertMsg;
	error=treeIterator_W(mapData,dNodes_W[0],error);
	
	if(s.attr('id')=='ct-saveAction_W'){
		flag=10;
		d3.select('#ct-inpBox').classed('no-disp',!0);
//		saveFlag=true;
//		$('#ct-createAction_W').removeClass('disableButton');
		
	}
	else if(s.attr('id')=='ct-createAction_W'){
		flag=20;
		if(error){
			openDialogMindmap("Error", "Mindmap flow must be complete! Modules -> Scenarios -> Screens -> Testcases")
			//$('#Mindmap_error').modal('show');
			return;
		}
		d3.select('#ct-inpBox').classed('no-disp',!0);
		
	}
	if(flag==0) return;
	if(s.classed('no-access')) return;
	s.classed('no-access',!0);
	var userInfo =  JSON.parse(window.localStorage['_UI']);
	var username = userInfo.username;
	if($('#selectProjectEtem').val()==null){
		openDialogMindmap('Error','No projects is assigned to User');
		return !1;
	}
	var cur_project=$('#selectProjectEtem').val();
	var selectedProject='';
	
	mapData.forEach(function(d){
		if(d.type=='modules_endtoend'){
			selectedProject=d.projectID;
			return;
		} 
	});

	// for(var d of mapData) {
	// 	if(d.type=='modules_endtoend'){
	// 		selectedProject=d.projectID;
	// 		break;
	// 	} 
	// }
	if(selectedProject!=cur_project){
		openDialogMindmap('Error',"Module belongs to project: '"+$("#selectProjectEtem option[value='"+selectedProject+"']").text()+"' Please go back to the same project and Save");
		return;
	}
	if(mapData.length<=1 && flag==20) {
		openDialogMindmap('Error','Incomplete flow! Moudles->Scenarios flow should be present');
		s.classed('no-access',!1);
		return;
	}
	dataSender({task:'endTOend',data:{write:flag,map:mapData,user_name:username,abc:deletednode_W,xyz:unassignTask,prjId:selectedProject,relId:$('#ct-assignRel').val(),cycId:$('#ct-assignCyc').val()}},function(err,result){
		s.classed('no-access',!1);
		if(err){
			if(result.indexOf('Schema.ConstraintValidationFailed')>-1){
				openDialogMindmap('Save error','Module names cannot be duplicate');
			}
			else{
				openDialogMindmap('Save error','Failed to save data');
			}
			
		} 
		else{
			
			var res=JSON.parse(result);
			if(flag==10){

			 mapSaved=!0;
			var mid,sts=allMaps_info.some(function(m,i){
				if(m.id_n==res.id_n) {
					mid=i;
					allMaps_info[i]=res;
					return !0;
				}
				return !1;
			});
			if(!sts){
				mid=allMaps_info.length;
				allMaps_info.push(res);
				var node=d3.select('#etemModuleContainer').append('span').attr('class','moduleContainer').attr('data-mapid',mid).attr('title',res.name).on('click',loadScenarios);
				node.append('img').attr('class','ct-nodeIcon eteMbox').attr('src','imgs/ic-reportbox.png').attr('alt','Module').attr('aria-hidden',true);
				node.append('span').attr('class','ct-nodeLabel modulename').html(res.name.replace(/_/g,' '));
			}
			setModuleBoxHeight_W();
			clearSvg_W();
			treeBuilder_W(allMaps_info[mid]);
			unassignTask=[];
			//var selectedTab = window.localStorage['tabMindMap']
			openDialogMindmap("Success", "Data saved successfully");
			// fix for 1046:  "Create" does not work when we add scenarios from different projects
			saveFlag=true;
			$('#ct-createAction_W').removeClass('disableButton');	
			
			 dataSender({task:'getModules',tab:'endToend',prjId:$("#selectProjectEtem").val()},function(err,result){
				 	if(err) console.log(result);
				 	else{
						 
						// console.log(result);
						var nodeBox=d3.select('#etemModuleContainer');
						$(nodeBox[0]).empty();
						allMMaps_W=allMaps_info=JSON.parse(result);
						//<span class='moduleContainer' data-moduleId=''><img alt='Module icon' class='eteMbox' src='imgs/ic-reportbox.png' title=''><br/><span class='modulename' title=''>Module"+(i+1)+"</span></span>
						allMMaps_W.forEach(function(e,i){
							//var t=e.name.replace(/_/g,' ');
							var src_image='imgs/ic-reportbox.png'
							var class_name='eteMbox';
							var onclick_func='';
							if (e.type=='modules_endtoend'){
								class_name='eteMboxETE';
								onclick_func=loadScenarios;
								src_image='images_mindmap/endToEnd.png';
							} 
							var t = $.trim(e.name);
							var node=nodeBox.append('span').attr('class','moduleContainer').attr('data-mapid',i).attr('title',t).on('click',onclick_func);
							node.append('img').attr('class','ct-nodeIcon '+class_name).attr('src',src_image).attr('alt','Module').attr('aria-hidden',true);
							node.append('span').attr('class','ct-nodeLabel modulename').html(t);
						});
						initScroller();
						setModuleBoxHeight_W();
				 	}
				});
			//$('#Mindmap_save').modal('show');
		}
if(flag==20){
	if(!saveFlag) return;
	var res=JSON.parse(result);
	res=res[0];
	var mid,resMap=Object.keys(res);
	allMMaps_W.some(function(m,i){
		if(m.id_n==resMap[0]) {
			mid=i;
			return !0;
		}
			return !1;
	});
	//263-'Mindmap- Module: Currently allowing to create 2 modules with same name- Error msg is given on click of Create button
	if(allMMaps_W[mid] != undefined){
		allMMaps_W[mid].id_c=res[resMap[0]];
		allMMaps_W[mid].children.forEach(function(tsc){
				tsc.id_c=res[tsc.id_n];
				tsc.children.forEach(function(scr){
					scr.id_c=res[scr.id_n];
					scr.children.forEach(function(tc){
						if (res[tc.id_n]!='null'){
							tc.id_c=res[tc.id_n];
						}
					});
			});
		});
		//To update cassandra_ids (id_c) of nodes in dNodes_W variable
		dNodes_W.forEach(function(d){
			if (d.type=='modules') d.id_c=res[resMap[0]];
			else d.id_c=res[d.id_n];

		});
		
		openDialogMindmap("Success", "Structure created successfully");
		saveFlag=false;
		$('#ct-createAction_W').addClass('disableButton');
	}else{
		saveFlag=false;
		openDialogMindmap("Success", "Failed to create structure");
	}
	
	
	//$('#Mindmap_create').modal('show');
  }

		}
	});
};




 $(document).on('click', '.addScenarios-ete', function(e){	
//// #817 To select multiple scenarios in e2e (Himanshu)
	 $('.selectScenariobg').each(function(i,obj){
		var text=$(obj).text();
		if($(obj).attr('data-scenarioId') != 'null'){
			createScenario_Node(text,$('#selectProjectEtem').val());
		}else{
			openDialogMindmap('Error','Scenario is not created');
		}
 		});
})

$(document).on('click', '.createNew-ete', function(e){
		createNewMap_W();
})

 $(document).on('click', '.moduleContainer', function(e){
 // #894: Add button disabled by default
	 	$('.addScenarios-ete').addClass('disableButton');
		//#821 UI issues in e2e
 	    $('#eteSearchScenarios').val("");

    	var container = $("#eteScenarioContainer");
		container.empty();
    	
		var id=d3.select(this).attr('data-mapid');
		var moduleid=allMaps_info[id].id_n;
		if(allMaps_info[id].type=="modules_endtoend"){
			return;
		}
		dataSender({task:'populateScenarios',moduleId:moduleid},function(err,result){
			if(err) console.log(result);
			else{
				//d3.select('.addScenarios-ete').classed('disableButton',!0);
				result=JSON.parse(result);
				if(result!=''){
					//d3.select('.addScenarios-ete').classed('disableButton',!1);
				}
				result.forEach(function(row){
					container.append("<span class='eteScenrios' data-scenarioId='"+row.testScenarioID_c+"' title='"+row.testScenarioName+"'>"+row.testScenarioName+"</span>")
					//container.append("<div class='sltEteScenario'><input type='checkbox'/><span class='eteScenrios' data-scenarioId='"+row.testScenarioID_c+"'>"+row.testScenarioName+"</span></div>")
				});				
			}
	});
})
var toggleExpand = function(e){
	var s=d3.select($(e.target).parent());
	var p=d3.select($(e.target).parent().parent());
    $(e.target).parent().toggleClass('ct-rev');
	$(e.target).parent().parent().toggleClass('ct-open');
	$(e.target).toggleClass("iconSpaceArrowTop");
	e.stopImmediatePropagation();
		if($("#ct-moduleBox").hasClass("ct-open") == true){
 	$("#ct-canvas").css("top","5px");
	// if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == true)
	// 	{
	// 	$("#ct-AssignBox").css({"position":"relative","top":"25px"});
	// 	}
		$(".ct-nodeBox .ct-node").css("width","139px");
		$(".ct-nodeBox").css({"overflow":"auto", "width":"99%"})
		$(".iconSpaceArrow").attr("src","imgs/ic-collapseup.png");
	}
	else{
		$(".iconSpaceArrow").attr("src","imgs/ic-collapse.png");
		$("#ct-moduleBox").css({"position":"","top":""});
	$("#ct-canvas").css("top","");
		$(".ct-nodeBox .ct-node").css("width","");
		$(".ct-nodeBox").css({"overflow":"", "width":""})
	}
};
var toggleExpandAssign = function(e){
	// var s=d3.select($("#"+e.target.id));
	// var p=d3.select($("#"+e.target.id).parent());
	// $("#"+e.target.id).toggleClass('ct-rev');
	// $("#"+e.target.id).parent().toggleClass('ct-open');
	var s=d3.select($(e.target).parent());
	var p=d3.select($(e.target).parent().parent());
    $(e.target).parent().toggleClass('ct-rev');
	$(e.target).parent().parent().toggleClass('ct-open');
	$(e.target).toggleClass("iconSpaceArrowTop");
	e.stopImmediatePropagation();
	if($("#ct-AssignBox").hasClass("ct-open") == true){		
		$("#ct-canvas").css("top","5px");
	// 	if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == true)
	// {
	// 		//$("#ct-AssignBox").css({"position":"relative","top":"25px"});
	// }
		$(".ct-nodeBox .ct-node").css("width","139px");
	$(".ct-nodeBox").css({"overflow":"auto", "width":"98%"})
		$(".iconSpaceArrow").attr("src","imgs/ic-collapseup.png");
	}
	else{
		$(".iconSpaceArrow").attr("src","imgs/ic-collapse.png");
		$("#ct-AssignBox").css({"position":"","top":""});
		$("#ct-canvas").css("top","");
		$(".ct-nodeBox .ct-node").css("width","");
		$(".ct-nodeBox").css({"overflow":"", "width":""})
	}
};
var clickHideElements = function(e){
	d3.select('#ct-inpBox').classed('no-disp',!0);
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	d3.select('#ct-assignBox').classed('no-disp',!0);
};
var setModuleBoxHeight_W = function(){
	//var lm=d3.select('#ct-moduleBox').classed('ct-open',!0);
	var lm=d3.select('#etemModuleContainer').classed('ct-open',!0);
	var h1=lm.style('height');
	lm.classed('ct-open',!1);
	if(h1==lm.style('height')) lm.select('.ct-expand').classed('no-disp',!0);
	else lm.select('.ct-expand').classed('no-disp',!1);
};

var clearSvg_W = function(){
	d3.select('#ct-mindMap').remove();
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	d3.select('#ct-assignBox').classed('no-disp',!0);
	d3.select('#ct-mapSvg').append('g').attr('id','ct-mindMap');
	uNix_W=0;uLix_W=0;dNodes_W=[];dLinks_W=[];nCount=[0,0,0,0];cSpan_W=[0,0];cScale_W=1;mapSaved=!1;
	zoom_W.scale(cScale_W).translate(cSpan_W);
	zoom_W.event(d3.select('#ct-mapSvg'));
};

//FUnction is tagged to every click on 'cnavas' element to validate the names of nodes when created
var callme=function(){
	if(childNode_W != null && (childNode_W.text()=='Module_0' || childNode_W.text()=='Screen_0' || childNode_W.text()=='Scenario_0' || childNode_W.text()=='Testcase_0')){
		d3.select('#ct-inpBox').classed('no-disp',!1);
	}
	
}
var treeBuilder_W = function(tree){
	node_names_tc=[];
	var pidx=0,levelCount=[1],cSize=getElementDimm(d3.select("#ct-mapSvg"));
	var typeNum={'modules_endtoend':0,'scenarios':1,'screens':2,'testcases':3};
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
	// if(tree.oid===undefined) d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
	// else d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
	if(tree.childIndex===undefined) d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
	else d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
	dNodes_W=d3Tree.nodes(tree);
	//dLinks_W=d3Tree.links(dNodes_W);
	dNodes_W.forEach(function(d){
		d.y=d.x;
		//Logic to change the layout and to reduce the length of the links
		d.x=cSize[0]*0.1*(0.9+typeNum[d.type]);



		if(d.oid===undefined)d.oid=d.id;
		d.id=uNix_W++;
		addNode_W(d,!0,d.parent);
		if(d.task!=null) d3.select('#ct-node-'+d.id).append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
	});
	dLinks_W=d3Tree.links(dNodes_W);
	dLinks_W.forEach(function(d){
		d.id=uLix_W++;
		addLink_W(d.id,d.source,d.target);
	});
	//zoom.translate([0,(cSize[1]/2)-dNodes_W[0].y]);
	zoom_W.translate([(cSize[0]/3)-dNodes_W[0].x,(cSize[1]/2)-dNodes_W[0].y]);
	zoom_W.event(d3.select('#ct-mapSvg'));
};
