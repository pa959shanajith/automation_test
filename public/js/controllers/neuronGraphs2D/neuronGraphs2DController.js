mySPA.controller('neuronGraphs2DController', ['$scope', '$http', '$location', '$timeout', 'neuronGraphs2DService','ExecutionService','reportService' , 'cfpLoadingBar','$window', function($scope,$http,$location,$timeout,neuronGraphs2DService,ExecutionService,reportService,cfpLoadingBar,$window) {
    $("head").append('<link id="nGraphsCSS" rel="stylesheet" type="text/css" href="css/nGraphs.css" />')
	if(window.localStorage['navigateScreen'] != "neuronGraphs") window.location.href = "/";
	var nodeColor={"Domain":"#355264","Project":"#A24178","Release":"#CD7D40","Cycle":"#A9B800","TestSuite":"#FF9899","TestScenario":"#E3CC4C","TestCase":"#7BD2C9","Screen":"#BDBEC0"};
	var legendKids={"Domain":"#355264","Project":"#A24178","Release":"#CD7D40","Cycle":"#A9B800","Test Suite":"#FF9899","Test Scenario":"#E3CC4C","Test Case":"#7BD2C9","Screen":"#BDBEC0"};

	//var nodeColor={"Domain":"#f06292","Project":"#64b5f6","Release":"#81c784","Cycle":"#ff8a65","TestSuite":"#81c784","TestScenario":"#fdd835","TestCase":"#7986cb","Screen":"#8bc34a"};
/*
f06292
64b5f6
81c784
ff8a65
5c6bc0
ffee58
8e24aa
8bc34a
yellow: fdd835
Green: 00e496
*/
	//var nodeColor1={"Domain":"#355264","Project":"#A24178","Release":"#CD7D40","Cycle":"#A9B800","TestSuite":"#FF9899","TestScenario":"#E3CC4C","TestCase":"#7BD2C9","Screen":"#BDBEC0"};
	var nodeColor1={"Domain":"#AEC7E8","Project":"#FF7F0E","Release":"#1F77B4","Cycle":"#FFBB78","TestSuite":"#2CA02C","TestScenario":"#98DF8A","TestCase":"#D62728","Screen":"#FF9896"};
	var legendKids1={"Domain":"#AEC7E8","Project":"#FF7F0E","Release":"#1F77B4","Cycle":"#FFBB78","Test Suite":"#2CA02C","Test Scenario":"#98DF8A","Test Case":"#D62728","Screen":"#FF9896"};
	var nodeTypes,rootIndex,mapN2DCoords,enabledFilters,visibleNodeNames;
	//nodeStatusdata,moduleid,scenarioids,exec_id,failed_tc_list
	var globalobj = {};
	var leveldict={'Domain':0,'Project':1,'Release':2,'Cycle':3,'TestSuite':4,'TestScenario':5,'TestCase':6,'Screen':7}
	var levelrad={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7}
	var togglelinksflag = false, togglelinkslist = [],viewPageName;

	globalobj['failed_tc_list']=[];
	var nodeClickFlag,executeFlag;
	var nodeIdDict={};
	var memoryarray =[],fadearray=[];
	var s4R_global;
	var PI=Math.PI, fCos=Math.cos, fAcos=Math.acos, fSin=Math.sin, fAsin=Math.asin;

	$timeout(function(){
		console.log('timeout')
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear();
	}, 500);
	$scope.level=10;
	//Select Browser Function
	/*$(document).on("click", ".selectBrowser", function(){
		//$(".selectBrowser").find("img").removeClass("sb");
		$(this).find("img").toggleClass("sb")
	});*/
	// function roughSizeOfObject( object ) {

	// 	var objectList = [];
	// 	var stack = [ object ];
	// 	var bytes = 0;

	// 	while ( stack.length ) {
	// 		var value = stack.pop();

	// 		if ( typeof value === 'boolean' ) {
	// 			bytes += 4;
	// 		}
	// 		else if ( typeof value === 'string' ) {
	// 			bytes += value.length * 2;
	// 		}
	// 		else if ( typeof value === 'number' ) {
	// 			bytes += 8;
	// 		}
	// 		else if
	// 		(
	// 			typeof value === 'object'
	// 			&& objectList.indexOf( value ) === -1
	// 		)
	// 		{
	// 			objectList.push( value );

	// 			for( var i in value ) {
	// 				stack.push( value[ i ] );
	// 			}
	// 		}
	// 	}
	// 	return bytes;
	// }
	$scope.assignTab = function(option){

		// d3.selectAll('.node-nG').each(function(d){
		// 	console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
		// 	d.x=undefined;
		// 	d.y=undefined;
		// 	d.z=undefined;
		// })

		console.log('assign tab')
		$scope.tab = option;
		$('.selectedIcon').removeClass('selectedIcon');
		if($scope.tab=='viewTab'){
  		 	 activeNode = undefined;
			 $('#viewImg').addClass('selectedIcon');
			 //drawGraph($scope.nodes,$scope.links,3);
			 //$scope.loadNGraphs();
		}
		else if($scope.tab=='actionTab' ) {
			if(!globalobj['lockedSuite']){
				$scope.assignTab('viewTab');
				openDialog('Error','Please Lock a suite to Execute first!');
				return;
			}
			//camera.position.set(0, 0,s4R_global*100);
			$('#actionImg').addClass('selectedIcon');
			if(viewPageName == 'fullView'){
				activeNode = undefined;
				//buildExecutionGraph(globalobj['freezeNode']);
			}
			
		}
	}

	$scope.fullview = function(){
		camera.position.set(0, 0,s4R_global*100);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		d3.selectAll('.node-nG').classed('no-disp',false).classed('node-nG-dimmed',false);
		d3.selectAll('.link-nG').classed('allow-disp',true);
	}

	$scope.loadNGraphs = function(e){
		viewPageName = 'fullView';
		$('#ct-canvas2').empty();
		$('#ct-canvas2').css('display','none');
		$('#ct-canvas').css('display','block');
		console.log('loadNgraphs called from tab: ', $scope.tab)
		if($("#ct-expand-left").hasClass('ct-rev'))
			$("#ct-expand-left").trigger("click");
		if($("#ct-expand-right").hasClass('ct-rev'))
			$("#ct-expand-right").trigger("click");
		blockUI('Loading...');
		$scope.clearData();

// 		neuronGraphs2DService.BuildRelationships().then(function(data){
// 			if(data.err && data.ecode=="INVALID_SESSION") window.location.href = "/"; 
// 			else if(data.err){
// 				unblockUI();
// 				blockUI(data.msg);
// 				$timeout(function(){unblockUI();},3000);
// 				console.error(data.ecode);
// 				return false;
// 			}
// 			console.log("Passssss!!!")
// 		blockUI('Please wait while graphs are being fetched...');
// //		setTimeout('playNote('+currentaudio.id+', '+noteTime+')', delay);

// 		addLegends();
// 		loadGraphData();
// 		},function(error){
// 			unblockUI();
// 			console.error("Error:::::::::::::", error)
// 		});
		addLegends();
		loadGraphData();		
	}

	function addLegends(){
		console.log('add legends')
		var i=0,nodecolor_t;
		//var nodeTypeList=Object.keys(nodeColor);
		//var canvX=getDimms('#ct-canvas')[0]-50;
		//var y=Math.round(nodeTypeList.length/Math.floor(canvX/100));
		var elem;
		if(viewPageName == 'fullView'){
			elem = '#ct-canvas';
			nodecolor_t = legendKids;
		}
		else{
			elem = '#ct-canvas2';
			nodecolor_t = legendKids1;
		}
		var u=d3.select(elem).append('svg').attr('id','ct-legendBox').append('g').attr('transform','translate(10,10)');
		for(e in nodecolor_t){
			t=u.append('g');
			t.append('rect').attr('style','fill:'+nodecolor_t[e]).attr('x',i).attr('y',-10).attr('width',20).attr('height',20).attr("rx", 6).attr("ry", 6);
			t.append('text').attr('style','font-size:12px').attr('x',i+25).attr('y',3).text(e);
			i+=100;
		}
	}

	$scope.clearData = function(){
		console.log('clear data')
		delete $scope.nodes;
		delete $scope.fetchedData;
		$('#ct-canvas').children().remove()
	};

	$scope.clearLinks = function(){
		scene.getAllObjectByProperty('name','link').forEach(function(f,i){
			f.visible = false;
		});
		// d3.selectAll(".node-nG").classed('node-nG-dimmed',false);
		// if ($('.allow-disp').length==0 ){
		// 	togglelinkslist.forEach(function(e,i){d3.select(e).classed('allow-disp',true)});
		// 	togglelinkslist = [];
		// 	togglelinksflag = false;
		// }
		// else{
		// 	$scope.links.forEach(function(e){
		// 		if($('#link-1-'+e.start+'-'+e.end).hasClass('allow-disp')){
		// 			togglelinkslist.push('#link-1-'+e.start+'-'+e.end);
		// 			togglelinkslist.push('#link-2-'+e.start+'-'+e.end);
		// 		} 
		// 	})
		// 	d3.selectAll(".link-nG").classed('allow-disp',false);
		// 	togglelinksflag = true;
		// }
	};
	/*---------------Sidebar Toggle Starts Here---------------*/
	$(".lsSlide,.rsSlide").show();
	$("#ct-expand-left").click(function(e){
		console.log('leftbar click')
		if($("#ct-expand-left").hasClass("ct-rev")) $(".lsSlide").hide();
		else $(".lsSlide").show();
		$("#ct-expand-left").toggleClass("ct-rev");
		$("#ct-main").toggleClass("leftBarOpen");
	});

	$("#ct-expand-right").click(function(e){
		console.log('rightbar click')		
		if($("#ct-expand-right").hasClass("ct-rev")) $(".rsSlide").hide();
		else $(".rsSlide").show();
		$("#ct-expand-right").toggleClass("ct-rev")
		$("#ct-main").toggleClass("rightBarOpen");
	});
	/*---------------Sidebar Toggle Ends Here---------------*/

	/*---------------Filter Objects Start Here---------------*/
	$(document).on("click", ".filterObjects", function(){
		togglelinkslist = [];
		console.log('filter objects')
		enabledFilters=[];
		$('.popupContent-filter-active').each(function(){
			enabledFilters.push($(this).data('tag'));
		});
		applyFilters(1);
	});

	$("#selectAllFilters span.selectAllTxt").on("click", function(){applyFilters(0); console.log('apply filter')});
	$("#selectAllFilters input.checkStyleboxFilter").on("click", function(){applyFilters(0); console.log('apply filter')});
	
	function applyFilters(k){
		console.log('apply filter')
		if (k==0||enabledFilters.length==0){
			enabledFilters=[];
			scene.getAllObjectByProperty('class','node').forEach(function(e,i){
				e.visible = true;
			})
		}
		else{
			scene.getAllObjectByProperty('class','node').forEach(function(e,i){
				e.visible = false;
			})			
			for(var i=0,l=enabledFilters.length;i<l;i++){
				scene.getAllObjectByProperty('label',enabledFilters[i]).forEach(function(e,i){
					e.visible = true;
				})
			}
		}
		//if(activeNode!==undefined) highlightNodes(d3.select(activeNode).datum());
	};

	/*---------------Filter Objects Ends Here---------------*/

	/*---------------Search Node Starts Here---------------*/
	//$(".slidePopup").click(function(e){
	$("#slidePopupSearchBox").click(function(e){
		console.log('slidepopup search box')
		visibleNodeNames=[];
//		d3.selectAll('.node-nG').each(function(d){if(!(d3.select(this).classed('no-disp'))) visibleNodeNames.push([d.idx,d.name]);});
		scene.getAllObjectByProperty('class','node').forEach(function(e){
			if(e.visible == true) visibleNodeNames.push([e.idx,e.name]);
		});
		$('#popupSearchResult').empty();
		$timeout(function(){$(".searchInputNodes").val('').focus();},5);
	});

	$(".searchInputNodes").on('keyup',function(e){
		console.log('search input nodes keyup')
		e=e||window.event;
		var searchKey=$(this).val().toLowerCase();
		var searchResults='';
		visibleNodeNames.forEach(function(o){if(o[1].toLowerCase().indexOf(searchKey)>-1) searchResults+="<span class='searchNodeItem' data-lindex="+o[0]+">"+o[1]+"</span>";});
		$('#popupSearchResult').html(searchResults);
	});

	$(document).on("click", ".searchNodeItem", function(e){
		console.log('searchnodeitem click e: ', e)
//		$("#node-"+$scope.nodes[$(this).data("lindex")].id).trigger("click");
		nodeClick_NG(scene.getObjectByProperty('idx',$(this).data("lindex")),false);
	});
	/*---------------Search Node Ends Here---------------*/

	/*---------------Data Processing Logic Starts Here---------------*/

	function loadGraphData(){
		console.log('loadgraph data')
		if(window.localStorage['_UI']){
			var userInfo =  JSON.parse(window.localStorage['_UI']);
			var userid = userInfo.user_id;
			neuronGraphs2DService.getGraphData(userid).then(function(data){
				console.log("data: ",data);
				//console.log('DATA SIZE::: ',roughSizeOfObject(data));
				if(data.err && data.ecode=="INVALID_SESSION") window.location.href = "/"; 
				else if(data.err){
					unblockUI();
					blockUI(data.msg);
					$timeout(function(){unblockUI();},3000);
					console.error(data.ecode);
					return false;
				}
				$("#ct-canvas").show();
				//console.log('loadGraphData::::::::::::: ',data)
				$scope.fetchedData=data;
				nodeTypes=data.type;
				rootIndex=data.root;
				mapN2DCoords=data.coords2D;
				$scope.nodes=bindData(data.nodes,data.links);
				// var i_t = 0; var size_t = 0;
				// for(i_t=0;i_t<$scope.nodes.length;i_t++){
				// 	size_t = size_t+ roughSizeOfObject($scope.nodes[i_t]);
				// }
				// var i_t1 = 0; var size_t1 = 0;
				// console.log('nodes size:::: ', size_t);
				// for(i_t1=0;i_t1<data.links.length;i_t1++){
				// 	size_t1 = size_t1+ roughSizeOfObject(data.links[i_t1]);
				// }
				// console.log('links size:::: ', size_t1);				
				//blockUI(data.msg);

				// That is when using 3D
				setPositionsSemi3D($scope.nodes,rootIndex);
				//unblockUI();
				$scope.links = data.links;
				// nginit($scope.nodes,data.links,$scope.level);
				// animate();
				init();
				$('#actionImg2d').removeClass('highlightOpt');
				$('#actionImg').addClass('highlightOpt');
			},function(error){
				unblockUI();
				console.error("Error:::::::::::::", error)
			});
		}
	}

	function bindData(no,lo){
		console.log('bind data')
		m=JSON.parse(JSON.stringify(no));
		m.forEach(function(n,i){
			n.children=[];
			n.parent=[];
			n._children=[];
			n._parent=[];
			nodeIdDict[n.id]=i;
		});
		lo.forEach(function(l){
			var s=nodeIdDict[l.start];
			var t=nodeIdDict[l.end];
			if(m[s].children.indexOf(m[t])==-1)
				m[s].children.push(m[t]);
			if(m[t].parent.indexOf(m[s])==-1)
				m[t].parent.push(m[s]);
		});
		return m;
	};

	function cleanCyclicData(no){
		console.log('clean cyclic data')
		no.forEach(function(n){
			if (n.children) delete n.children;
			if (n.parent) delete n.parent;
		});
		return no;
	};
	/*---------------Data Processing Logic Ends Here---------------*/

	/*---------------Positioning Logic Starts Here---------------*/
	function getDimms(t){
		return [parseInt($(t).css('width')),parseInt($(t).css('height'))];
	};

	function getN3DCoords(n,radius){
		coordsList=[];
		dl=PI*(3-Math.sqrt(5));
		dz=2.0/n;
		l=0;
		z=1-dz/2;
		for(k=0;k<n;k++){
			r=Math.sqrt(1-z*z);
			c=[fCos(l)*r,fSin(l)*r,z];
			//c.forEach(function(e,i){c[i]=Math.round(e*radius*10000)/10000});
			c.forEach(function(e,i){c[i]=e*radius});
			coordsList.push(c);
			z=z-dz;
			l=l+dl;
		}
		return coordsList;
	};

	function getN2DCoords(n,radius){
		var i,coordsList=[];
		var d=mapN2DCoords[n];
		var r=d.r*radius;
		var l=radius-r;
		d.cl.forEach(function(e){
			coordsList.push([e[0]*radius,e[1]*radius]);
		});
		return [coordsList,l,r];
	};

	function setPositionsSemi3D(data,iRoot){
		var index = data.map(function(e) { return e.idx; }).indexOf(iRoot);
		var rObj,np,pCord,nr,rCord,rc_c,rtfi,rCord_2d,ncy,cyCord,cyc_c,cytfi,cyCord_2d,tmp;
		var s1R=4,s2R=10,s3R=20,s4R=30;
		rObj=data[iRoot];
		console.log('>>>>>>>>>>>rObj: ',rObj);
		var total_P=0,total_R=0,total_C=0,total_TS=0,total_TSc=0,total_TC=0,total_S;
		total_P=rObj.children.length;
		total_R=$scope.nodes.filter(function( obj ) {return obj.type == "Release";}).length;
		total_C=$scope.nodes.filter(function( obj ) {return obj.type == "Cycle";}).length;
		total_TS=$scope.nodes.filter(function( obj ) {return obj.type == "TestSuite";}).length;
		total_TSc=$scope.nodes.filter(function( obj ) {return obj.type == "TestScenario";}).length;
		total_TC=$scope.nodes.filter(function( obj ) {return obj.type == "TestCase";}).length;
		total_S=$scope.nodes.filter(function( obj ) {return obj.type == "Screen";}).length;
		console.log(total_P,total_R,total_C,total_TS,total_TSc,total_TC,total_S)
		
		s1R = 1.2*(Math.ceil(Math.sqrt(total_P))+1);
		s2R = 1.2*(s1R+Math.ceil(Math.sqrt(total_R))+1);
		s3R = 1.2*(s2R+Math.ceil(Math.sqrt(total_C))+1);
		s4R = 3*(s3R+Math.ceil(Math.sqrt((total_TS+total_TSc+total_TC+total_S))));
		s4R_global = s4R;
		//s4R = Math.ceil(Math.sqrt((total_TS+total_TSc+total_TC+total_S)));
		s1R = s4R/4;
		s2R = 2*s4R/4;
		s3R = 3*s4R/4;
		levelrad[1] = s1R;
		levelrad[2] = s2R;
		levelrad[3] = s3R;
		levelrad[4] = s4R;
		levelrad[5] = s4R;
		levelrad[6] = s4R;
		levelrad[7] = s4R;
		var P_cords,R_cords,C_cords,TS_cords,TSc_cords,TC_cords,S_cords;
		P_cords=getN3DCoords(total_P,s1R)
		R_cords=getN3DCoords(Math.ceil(total_R*1.2),s2R)		
		Cy_cords=getN3DCoords(Math.ceil(total_C*1.4),s3R)		
		C_cords=getN3DCoords(Math.ceil((total_TS+total_TSc+total_TC+total_S)*1.7),s4R)
		console.log("C_cords:",C_cords.length,"\t sum:",(total_TS+total_TSc+total_TC+total_S))
		rObj.x=0;rObj.y=0;rObj.z=0;

		var totalcount=0,idx_r=0,idx_c=0,idx_ts=0,idx_scn=0,idx_tc=0,idx_scr=0;

		if(rObj.children && rObj.children.length>0){
			np=rObj.children.length;
			rObj.children.forEach(function(prj,prjix){
				prj.x=P_cords[prjix][0];
				prj.y=P_cords[prjix][1];
				prj.z=P_cords[prjix][2];
				if(prj.children && prj.children.length>0){
					nr=prj.children.length;
					console.log("testcases:::",nr)
					rCord=getNClosestCords(prj,R_cords,nr,1)
					idx_r=0;
					prj.children.forEach(function(rel,relix){
						//console.log("Relx",rel.x)
						if(rel.x==undefined){
							//console.log("Relx Entered",rel.x)
							rel.x=rCord[idx_r][0];
							rel.y=rCord[idx_r][1];
							rel.z=rCord[idx_r][2];
							idx_r=idx_r+1;
						}

						// Yahan se continue karna h!!
						if(rel.children && rel.children.length>0){
							ncy=rel.children.length;
							//console.log("no. of cycles:", ncy)
							cyCord=getNClosestCords(rel,Cy_cords,ncy,1);
							//console.log("c_Cord:", C_cords)
							
							cyCord.forEach(function(c){
								var i = indexOfItem(Cy_cords,c);
								//console.log("index:",i)
								 Cy_cords.splice(i,1);
							})
							totalcount=totalcount+cyCord.length;
							//console.log("Count!!!!!",totalcount)
							

							//console.log("c_Cord after!:", C_cords)
							idx_c=0;
							rel.children.forEach(function(cyc,cycix){
								if(cyc.x==undefined){
									cyc.x=cyCord[idx_c][0];
									cyc.y=cyCord[idx_c][1];
									cyc.z=cyCord[idx_c][2];	
									idx_c=idx_c+1;
								}
								
								if(cyc.children && cyc.children.length>0){
									ntsc=cyc.children.length;
									tscCord=getNClosestCords(cyc,C_cords,ntsc,1);
									//console.log("n testscn ::",ntsc)
									//console.log("c_Cord:", C_cords)
									
									tscCord.forEach(function(c){
									var i = indexOfItem(C_cords,c);
									//console.log("index:",i)
									C_cords.splice(i,1);
									})
									totalcount=totalcount+tscCord.length;
									//console.log("Count!!!!!",totalcount)
									//console.log("c_Cord after!:", C_cords)

									idx_ts=0;
									cyc.children.forEach(function(tsc,tscix){
										//console.log("scnix:",tscix)
										if(tsc.x==undefined){
											tsc.x=tscCord[idx_ts][0];
											tsc.y=tscCord[idx_ts][1];
											tsc.z=tscCord[idx_ts][2];	
											idx_ts=idx_ts+1;
										}

										if(tsc.children && tsc.children.length>0){
											nscn=tsc.children.length;
											//console.log("no of testscn:",nscn)
											scnCord=getNClosestCords(tsc,C_cords,nscn,1);
											//onsole.log("tscCord ::",scnCord)
											//console.log("c_Cord before:", C_cords)
											
											scnCord.forEach(function(c){
											var i = indexOfItem(C_cords,c);
											//console.log("index:",i)
											C_cords.splice(i,1);
											})
											totalcount=totalcount+scnCord.length;
											//console.log("Count!!!!!",totalcount)
											//console.log("c_Cord after:", C_cords)
										
										idx_scn=0;
										tsc.children.forEach(function(scn,scnix){
											//console.log("scnix:",scnix)
											if(scn.x==undefined){
												scn.x=scnCord[idx_scn][0];
												scn.y=scnCord[idx_scn][1];
												scn.z=scnCord[idx_scn][2];
												idx_scn=idx_scn+1;	
											}

											if(scn.children && scn.children.length>0){
												ntc=scn.children.length;
												//console.log("n tc",ntc)
												//console.log("c_Cord:", C_cords)
												tcCord=getNClosestCords(scn,C_cords,ntc,1);
												//console.log("tscCord ::",tscCord)
												
												tcCord.forEach(function(c){
												var i = indexOfItem(C_cords,c);
												//console.log("index:",i)
												C_cords.splice(i,1);
												})
												//console.log("c_Cord after:", C_cords)
												totalcount=totalcount+tcCord.length;
												//console.log("Count!!!!!",totalcount)
												idx_tc=0;
													scn.children.forEach(function(tc,tcix){
														//console.log("scnix:",tcix)
														if(tc.x==undefined){
															tc.x=tcCord[idx_tc][0];
															tc.y=tcCord[idx_tc][1];
															tc.z=tcCord[idx_tc][2];	
															idx_tc=idx_tc+1;	
														}
														if(tc.children && tc.children.length>0){
															nscr=tc.children.length;
															//console.log("n scr",nscr)
															//console.log("c_Cord:", C_cords)
															scrCord=getNClosestCords(tc,C_cords,nscr,1);
															//console.log("scrCord ::",scrCord)
															
															scrCord.forEach(function(c){
															var i = indexOfItem(C_cords,c);
															//console.log("index:",i)
															C_cords.splice(i,1);
															})
															//console.log("c_Cord after:", C_cords)
															totalcount=totalcount+scrCord.length;
															//console.log("Count!!!!!",totalcount)
															idx_scr=0;
															tc.children.forEach(function(scr,scrix){
																//console.log("scnix:",scrix)
																if(scr.x==undefined){
																	scr.x=scrCord[idx_scr][0];
																	scr.y=scrCord[idx_scr][1];
																	scr.z=scrCord[idx_scr][2];	
																	idx_scr=idx_scr+1;	
																} 
															})
														}	
												})
											}
										})

										}
								
									});
								}
							});
						}
					});
				}
			})
		}
	};

function indexOfItem(array, item) {
    for (var i = 0; i < array.length; i++) {
        // This if statement depends on the format of your array
        if (array[i][0] == item[0] && array[i][1] == item[1] &&  array[i][2] == item[2] ) {
            return i;   // Found it
        }
    }
	openDialog("Error","You shouldn't be here!")
    return -1;   // Not found
}
	var getNClosestCords = function(nObj,cords,n,flag){
		nObj.children.forEach(function(child){
			if(child.x!=undefined)
				n=n-1;
		})
		//console.log("getNClosestCords!!!")
		//console.log("Nobj: ",nObj)
		//console.log("cords: ",cords)
		//console.log("n: ",n)
		var points = [];
		for (i = 0; i < cords.length; i++) {
			//console.log("cords In: ",cords)
			var point = cords[i];
			//console.log("point[0]: ",point[0]);
			point.len = distanceBetweenPoints([point[0],point[1],point[2]], [nObj.x,nObj.y,nObj.z]);
    		points.push(point);
		}
		//console.log("points before!! :",points);
		//points.sort(function(a, b) {
    	//		return a.len > b.len;
		//})
		if(flag)
			points.sort(function(a,b) {return (a.len > b.len) ? 1 : ((b.len > a.len) ? -1 : 0);} );
		else
			points.sort(function(a,b) {return (a.len < b.len) ? 1 : ((b.len < a.len) ? -1 : 0);} );

		//console.log("points!! :",points);
		//console.log("points sliced!! :",points.slice(0,n));
		return points.slice(0,n);
	}

    function distanceBetweenPoints(point1,point2){
		//console.log('point1:',point1)
		//console.log('point2:',point2)
		var a = point1[0] - point2[0]
		var b = point1[1] - point2[1]
		var c = point1[2] - point2[2]
		return Math.sqrt( a*a + b*b +c*c);
	}

	/*---------------Positioning Logic Ends Here---------------*/

	/*---------------UI Logic Starts Here---------------*/
	var camera,scene,renderer,controls,root,activeNode;
	var plane,orbit,selectedObject;
	var offset = new THREE.Vector3();
    // var renderer;
    // var scene;
    // var camera;
    var stats;
    var control;
    // var objects = [];	
	var tmpVec1=new THREE.Vector3();
	var tmpVec2=new THREE.Vector3();
	var tmpVec3=new THREE.Vector3();
	var tmpVec4=new THREE.Vector3();
	var nodeImgDataURL={};
	$scope.objects=[]; //Nodes
	//$scope.objects_L=[]; //links
	var baseSprite=document.createElement('img');

	// function nginit(n,l,level){
	// 	console.log('ng init')
	// 	canvDimm=getDimms('#ct-canvas');
	// 	    // global variables
	// 	camera=new THREE.PerspectiveCamera(70,canvDimm[0]/canvDimm[1],1,5000);
	// 	camera.position.z=1500;
	// 	scene=new THREE.Scene();
	// 	// var material = new THREE.LineBasicMaterial({ color: 0x0000ff });
	// 	// var geometry = new THREE.Geometry();
	// 	// geometry.vertices.push(new THREE.Vector3(-1000, 0, 0));
	// 	// geometry.vertices.push(new THREE.Vector3(0, 1000, 0));
	// 	// geometry.vertices.push(new THREE.Vector3(1000, 0, 0));
	// 	// var line = new THREE.Line(geometry, material);
	// 	// scene.add(line);
	// 	//renderer.render(scene, camera);
	// 	root=new THREE.Object3D();
	// 	scene.add(root);
	// 	renderer=new THREE.CSS3DRenderer();
	// 	renderer.setSize(canvDimm[0],canvDimm[1]);
	// 	document.getElementById('ct-canvas').appendChild(renderer.domElement);
	// 	controls=new THREE.TrackballControls(camera,renderer.domElement);
	// 	controls.rotateSpeed=1;
	// 	controls.addEventListener('change',render);
	// 	var imga = {};
	// 	for (i in nodeColor){
	// 		var dom = document.createElement('img');
	// 		dom.src = 'imgs/ngr-node_'+i+'.svg';
	// 		imga[i]=dom;
	// 	}		
	// 	imga['Screen'].onload=function(){drawGraph(n,l,level,imga);};
	// 	//baseSprite.src='imgs/drawsvg.svg';
	// 	baseSprite.src='imgs/ngr-node.png';
	// 	window.addEventListener('resize',onWindowResize,false);
	// 	// window.addEventListener('mousewheel',test,false)
	// };
	function test(){
		console.log("scroll event");
	}
    function init() {

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();

        // create a camera, which defines where we're looking at.
		canvDimm=getDimms('#ct-canvas');
		    // global variables
		camera=new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,1,5000);
		camera.position.z=300;
//        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        // create a render, sets the background color and the size
        renderer = new THREE.WebGLRenderer();
        // renderer.setClearColor(0x000000, 1.0);
		renderer.setClearColor(0xffffff, 1.0);
        renderer.setSize(canvDimm[0], canvDimm[1]);
		// var dirLight = new THREE.DirectionalLight();
        // dirLight.position.set(2500,0 , 0);
        // scene.add(dirLight);

        // var dirLight2 = new THREE.DirectionalLight();
        // dirLight2.position.set(-2500, 0, 0);
        // scene.add(dirLight2);

		// var dirLight5 = new THREE.DirectionalLight();
        // dirLight.position.set(10,10,10);
		// dirLight.position.set(-10,-10,-10);
        // scene.add(dirLight5);

        var ambientLight = new THREE.AmbientLight(0xffffff);
        ambientLight.name = 'ambientLight';
        scene.add(ambientLight);

		// controls=new THREE.TrackballControls(camera);
		orbit = new THREE.OrbitControls(camera);
		//controls.rotateSpeed=1;
		//controls.addEventListener('change',function(){console.log("change trackball"); render;});
        // position and point the camera to the center of the scene
        // camera.position.x = 50;
        // camera.position.y = 50;
        // camera.position.z = 50;
        // camera.lookAt(scene.position);

        plane = new THREE.Mesh(new THREE.PlaneGeometry(500, 500, 18, 18), new THREE.MeshBasicMaterial({
            color: 0x008800,
            opacity: 0.80,
            transparent: true
        }));
        plane.visible = false;
        scene.add(plane);
        // add the output of the renderer to the html element
		renderer.setSize(canvDimm[0],canvDimm[1]);
		document.getElementById('ct-canvas').appendChild(renderer.domElement);
//        document.body.appendChild(renderer.domElement);

        control = new function () {
            this.merged = false;
            //this.rotationSpeed = 0.005;
            this.numberToAdd = 2000;
            this.clear = function () {
                if (scene.getObjectByName('mesh')) {
                    scene.remove(scene.getObjectByName('mesh'));
                }
                $scope.objects.forEach(function (e) {
                            scene.remove(e);
                            $scope.objects = [];
                            control.totalCubes = 0;
                        }
                );
            };

            this.addCubes = function () {
                control.clear();

                if (control.merged) {
                    var mergedGeometry = new THREE.Geometry();
                    if (scene.getObjectByName('merged')) {
                        scene.remove(scene.getObjectByName('merged'));
                    }
					console.log("nodes: ",$scope.nodes);
                    for (var i = 0; i < $scope.nodes.length/10; i++) {
                        mergeCube(mergedGeometry,i);
                    }
                    for (var i = 0; i < $scope.links.length/10; i++) {
                        drawline($scope.links[i]);
                    }
                    var mesh = new THREE.Mesh(mergedGeometry, new THREE.MeshNormalMaterial({
                        opacity: 1,
                        transparent: true,
                    }));
                    mesh.name = 'merged';
                    scene.add(mesh);
                } 
				else {
                    for (var i = 0; i < $scope.nodes.length; i++) {
                        addCube(i);
                    }
                    for (var i = 0; i < $scope.links.length; i++) {
                        drawline($scope.links[i]);
						
                    }					
					unblockUI();	
                }


                control.totalCubes += control.numberToAdd;
            }
            this.merge = function () {
                var geom = new THREE.Geometry();
                $scope.objects.forEach(function (e) {
                    geom.merge();
                });
            };
        };
        //addControls(control);

        //stats = createStats();
       // document.body.appendChild(stats.domElement);
        ;

        // call the render function
		window.addEventListener('resize',onWindowResize,false);
		control.addCubes();
        animate();
    }

	
    document.onmousedown = function (event,e) {

        // get the mouse positions
        var mouse_x = ( (event.clientX - $('canvas').offset().left) / $('canvas').width() ) * 2 - 1;
        var mouse_y = -( (event.clientY- $('canvas').offset().top) / $('canvas').height() ) * 2 + 1; //+ (window.innerHeight-$('canvas').height())/$('canvas').height();
		console.log("offset: ",(window.innerHeight-$('canvas').height())/$('canvas').height());
        // use the projector to check for intersections. First thing to do is unproject
        // the vector.
        var vector = new THREE.Vector3(mouse_x, mouse_y, 0.5);
        // we do this by using the unproject function which converts the 2D mouse
        // position to a 3D vector.
        vector.unproject(camera);

        // now we cast a ray using this vector and see what is hit.
        var raycaster = new THREE.Raycaster(camera.position,
                vector.sub(camera.position).normalize());

        // intersects contains an array of objects that might have been hit
        var intersects = raycaster.intersectObjects(scene.children.slice(2,2+$scope.nodes.length));
		var listobj=[];
        if (intersects.length > 0) {
            orbit.enabled = false;

            // the first one is the object we'll be moving around
            selectedObject = intersects[0].object;
			console.log("selected object: ",selectedObject);
			listobj = scene.getAllObjectByProperty('label','TestCase');			
            // and calculate the offset
            // var intersects = raycaster.intersectObject(plane);
			console.log('Testcaese: ',listobj);
            // offset.copy(intersects[0].point).sub(plane.position);
			nodeClick_NG(selectedObject,event.ctrlKey);
        }
    };

	document.onmouseup = function(){
		selectedObject = null;
		orbit.enabled = true;
	}

    document.onmousemove = function (event) {
        // make sure we don't access anything else
        event.preventDefault();

        // get the mouse positions
		console.log("EVENT x,y: ",event.clientX,event.clientY);
        var mouse_x = ( (event.clientX - $('canvas').offset().left) / $('canvas').width() ) * 2 - 1;
        var mouse_y = -( (event.clientY- $('canvas').offset().top) / $('canvas').height() ) * 2 + 1; //+ (window.innerHeight-$('canvas').height())/$('canvas').height();
		console.log("offset: ",(window.innerHeight-$('canvas').height())/$('canvas').height());
		console.log("Mouse x,y: ",mouse_x,mouse_y);
        // get the 3D position and create a raycaster
        var vector = new THREE.Vector3(mouse_x, mouse_y, 0);
        vector.unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position,
                vector.sub(camera.position).normalize());

        // first check if we've already selected an object by clicking
        // if (selectedObject) {
        //     // check the position where the plane is intersected
        //     var intersects = raycaster.intersectObject(plane);
        //     // reposition the selectedobject based on the intersection with the plane
        //     selectedObject.position.copy(intersects[0].point.sub(offset));
        // } else {
            // if we haven't selected an object, we check if we might need
            // to reposition our plane. We need to do this here, since
            // we need to have this position before the onmousedown
            // to calculate the offset.
            var intersects = raycaster.intersectObjects(scene.children.slice(2,2+$scope.nodes.length));

		if (intersects.length > 0) {
			$("#ct-canvas").addClass('cursor-change');
			// now reposition the plane to the selected objects position
			plane.position.copy(intersects[0].object.position);
			// and align with the camera.
			plane.lookAt(camera.position);
			console.log("intersects: ",intersects);
			$('.tooltiptext').css('top',event.clientY+15).css('left',event.clientX+10);
			$('.tooltiptext').css('visibility','visible');
			$('.tooltiptext').html(intersects[0].object.name);
			nodeHover(intersects[0].object);
			//console.log("object: ",scene.getObjectByName(intersects[0].object.name));
			//console.log("object testcases: ",scene.getObjectByProperty('label','TestCase'));
		}
		else{
			$('.tooltiptext').css('visibility','hidden');
			nodeHoverOut();
			$("#ct-canvas").removeClass('cursor-change');
		}
			// else{
			// 	$("#ct-canvas").removeClass('cursor-change');
			// }
        // }
    };

    function mergeCube(mergeInto,i) {
        var cubeGeometry = new THREE.SphereGeometry(1,10,10);
        var translation = new THREE.Matrix4().makeTranslation($scope.nodes[i].x, $scope.nodes[i].y, $scope.nodes[i].z);
        cubeGeometry.applyMatrix(translation);

        mergeInto.merge(cubeGeometry);
    }

    function addCube(i) {
        
		//console.log("color: ",nodeColor[$scope.nodes[i].type]);
//        var cubeMaterial = new THREE.MeshLambertMaterial({color:nodeColor[$scope.nodes[i].type]});
		// var cubeGeometry = addGeometry(i);
        // var cubeMaterial = addMaterial(i);
		var cubeGeometry = new THREE.SphereGeometry(1,5,5);
		var cubeMaterial = new THREE.MeshLambertMaterial({color:nodeColor[$scope.nodes[i].type]});
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set($scope.nodes[i].x, $scope.nodes[i].y, $scope.nodes[i].z);
		cube.name = $scope.nodes[i].name;
		cube.idx = $scope.nodes[i].idx;
		cube.label = $scope.nodes[i].type;
		cube.class = 'node';
		cube.lookAt(new THREE.Vector3( 0, 0, 0 ));
		//addRotation(i);
        scene.add(cube);
        //$scope.objects.push(cube);
    }

	function addGeometry(i){
		var sphereList = ['TestCase','Screen','TestSuite','TestScenario','Cycle'];
		if(sphereList.indexOf($scope.nodes[i].type)!=-1)
			var cubeGeometry = new THREE.SphereGeometry(1,5,5);
		else
			var cubeGeometry = new THREE.BoxGeometry(2,2,2);		
		return cubeGeometry;
	}

	function addMaterial(i){
		// var urls = [
		// 	'imgs/cubemap/"'+$scope.nodes[i].type+'"right.png',
		// 	'imgs/assets/cubemap/"'+$scope.nodes[i].type+'"left.png',
		// 	'imgs/assets/cubemap/"'+$scope.nodes[i].type+'"top.png',
		// 	'imgs/assets/cubemap/"'+$scope.nodes[i].type+'"bottom.png',
		// 	'imgs/assets/cubemap/"'+$scope.nodes[i].type+'"front.png',
		// 	'imgs/assets/cubemap/"'+$scope.nodes[i].type+'"back.png'
		// ];		
		var url = [
			'imgs/cubemap/Releaseright.png',
			'imgs/cubemap/Releaseleft.png',
			'imgs/cubemap/Releasetop.png',
			'imgs/cubemap/Releasebottom.png',
			'imgs/cubemap/Releasefront.png',
			'imgs/cubemap/Releaseback.png'
		];		
				
		var sphereList = ['TestCase','Screen','TestSuite','TestScenario','Cycle'];
		var cubeMaterial = new THREE.MeshLambertMaterial();
		cubeMaterial.transparent = true;		
		if(sphereList.indexOf($scope.nodes[i].type)!=-1){
			cubeMaterial.map = THREE.ImageUtils.loadTexture('imgs/cubemap/'+$scope.nodes[i].type+'.png')
			//cubeMaterial.map = THREE.ImageUtils.loadTexture('imgs/cubemap/earthmap1k.jpg')		
		}
		else{			
			// switch ($scope.nodes[i].type) {
			// 	case 'Domain':
			// 		cubeMaterial.map = THREE.ImageUtils.loadTextureCube(urls);
			// 		break;
			// 	case 'Project':
			// 		cubeMaterial.map = THREE.ImageUtils.loadTextureCube(urls);
			// 		break;
			// 	case 'Release':
			// 		cubeMaterial.map = THREE.ImageUtils.loadTextureCube(urls);
			// 		break;
			// }
			var map_t = THREE.ImageUtils.loadTexture(url[4]);
			var cubeMaterial = [
				new THREE.MeshLambertMaterial({
					map: map_t
				}),
				new THREE.MeshLambertMaterial({
					map: map_t
				}),
				new THREE.MeshLambertMaterial({
					map: map_t
				}),
				new THREE.MeshLambertMaterial({
					map: map_t
				}),
				new THREE.MeshLambertMaterial({
					map: THREE.ImageUtils.loadTexture(url[5])
				}),
				new THREE.MeshLambertMaterial({
					map: map_t
				})
			];			
		}

		return cubeMaterial;
	}

	// function addRotation(i){
	// 	cube.rotation.x += 0.2;
	// }

    function drawline(lObj) {
		// st = $scope.nodes.filter(function( obj ) {return obj.id == lObj.start;})
		// tt = $scope.nodes.filter(function( obj ) {return obj.id == lObj.end;})
		// var material = new THREE.LineBasicMaterial({
		// 	color: 0x0000ff
		// });

		// var geometry = new THREE.Geometry();
		// geometry.vertices.push(
		// 	new THREE.Vector3( st[0].x, st[0].y, st[0].z ),
		// 	new THREE.Vector3( tt[0].x,tt[0].y, tt[0].z )
		// );

		// var line = new THREE.Line( geometry, material );
		// scene.add(line);
        //scene.add(mesh);
		////////////////////////////////
        // smooth my curve over this many points
		st = $scope.nodes.filter(function( obj ) {return obj.id == lObj.start;})
		tt = $scope.nodes.filter(function( obj ) {return obj.id == lObj.end;})		
        var start = new THREE.Vector3( st[0].x, st[0].y, st[0].z );
        var end = new THREE.Vector3( tt[0].x, tt[0].y, tt[0].z );
        var curveQuad = new THREE.LineCurve3(start, end);

        var tube = new THREE.TubeGeometry(curveQuad, 1, 0.15, 3, false);
        var mesh = new THREE.Mesh(tube, new THREE.MeshLambertMaterial({color:'#aaaaaa', opacity:0.7,transparent:true}));
        mesh.name = 'link';
		mesh.start = st[0].idx;
		mesh.end = tt[0].idx;
        scene.add(mesh);
		//$scope.objects_L.push(mesh);		
    }

    function addControls(controlObject) {

        var gui = new dat.GUI();
        gui.add(controlObject, 'merged');
        //gui.add(controlObject, 'rotationSpeed', -0.1, 0.1);
        gui.add(controlObject, 'numberToAdd');
        gui.add(controlObject, 'addCubes');
        gui.add(controlObject, 'clear');

    }

    // function render() {
    //     renderer.render(scene, camera);
    //     //var x = camera.position.x;
    //     //var z = camera.position.z;

    //    // camera.position.x = x;// * Math.cos(control.rotationSpeed) + z * Math.sin(control.rotationSpeed);
    //     //camera.position.z = z;// * Math.cos(control.rotationSpeed) - x * Math.sin(control.rotationSpeed);

    //     //camera.lookAt(scene.position);
	// 	//
    //     requestAnimationFrame(render);
	// 	controls.update();
    //     stats.update();
    // }
	function animate(){
		//TWEEN.update();
		requestAnimationFrame(animate);
		orbit.update();
		TWEEN.update();
		//controls.update();
		//stats.update();
		//var time=Date.now()*0.0004;
		//root.rotation.x = time;
		//root.rotation.y = time * 0.7;
		render();
	}
	function render(){
		renderer.render(scene,camera);
	}

    function createStats() {
        var stats = new Stats();
        stats.setMode(0);

        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        return stats;
    }

	// function animate(){
	// 	TWEEN.update();
	// 	requestAnimationFrame(animate);
	// 	controls.update();
	// 	var time=Date.now()*0.0004;
	// 	//root.rotation.x = time;
	// 	//root.rotation.y = time * 0.7;
	// 	render();
	// }
	// function render(){
	// 	renderer.render(scene,camera);
	// }

	function onWindowResize(){
		if(viewPageName == 'fullView'){
			canvDimm=getDimms('#ct-canvas');
			camera.aspect=canvDimm[0]/canvDimm[1];
			camera.updateProjectionMatrix();
			renderer.setSize(canvDimm[0],canvDimm[1]);
			render();
		}
		else{
			canvDimm=getDimms('#ct-canvas2');
			$( "#ct-canvas2 > svg" ).attr( "width", '"'+canvDimm[0]+'px"' ).attr("height",'"'+canvDimm[1]+'px"');
		}					
	}

	function showAtoms(){
		if(o instanceof THREE.CSS3DSprite){
		}
	}

	function showAtomsBonds(){
		var i,o;
		for(i=0;i<objects.length;i++){
			o=objects[i];
			o.element.style.display="";
			o.visible=true;
		}
	}

	function getNodeImgDataURL(imga){

		//console.log('img:: ',imga);
		var i,hex,r,g,b,durl,w,h,c,ctx,k,x,y,dImg,m;
		var dMap={};
		for (i in nodeColor){
			// hex=nodeColor[i];
			//r=(parseInt(hex.slice(1,3),16)/255).toString(10);
			//g=(parseInt(hex.slice(3,5),16)/255).toString(10);
			//b=(parseInt(hex.slice(5,7),16)/255).toString(10);
			img = imga[i];
			//console.log("img:  ",img);
			w=img.width;
			h=img.height;
			c=document.createElement('canvas');
			c.width=w;
			c.height=h;
			ctx=c.getContext('2d');
			ctx.drawImage(img,0,0,w,h);
			dImg=ctx.getImageData(0,0,w,h);
			m=dImg.data;
			// for(x=0,y=m.length;x<y;x+=4) {
			// 	m[x]*=r;
			// 	m[x+1]*=g;
			// 	m[x+2]*=b;
			// }
			ctx.putImageData(dImg,0,0);
			durl=c.toDataURL();
			dMap[i]=durl;

		}
		return dMap;
	};


// 	function drawGraph(nodes,links,lvl,imga){
// 		// console.log("drawGraph Executed! ")
// 		// console.log("Nodess:",nodes)
// 		// console.log("links:", links)
// 		// console.log('draw graph')
// 		var i,o
// 		// for(i=0;i<$scope.objects.length;i++){
// 		// 	o=$scope.objects[i];
// 		// 	o.parent.remove(o);
// 		// }
// 		// delete $scope.objects;
// 		// $scope.objects=[];
// 		nodeImgDataURL=getNodeImgDataURL(imga);
// 		// console.log("nodeImgDataURL:::: ",nodeImgDataURL);
// 		var coords3D=new THREE.Vector3();
// 		var nImg;
// 		nodes.forEach(function(e){
// //			if(leveldict[e.type]<=3){
// 			coords3D.x=e.x;
// 			coords3D.y=e.y;
// 			coords3D.z=e.z;
// 			nImg=document.createElement('img');
// 			d3.select(nImg).datum(e).attr('id','node-'+e.id).attr('class','node-nG node-'+e.type).classed('no-disp',function(d){return leveldict[d.type]>lvl;}).on('click',nodeClick_NG).on('mouseover',nodeHover).on('mouseout',nodeHoverOut);
// 			nImg.src=nodeImgDataURL[e.type];
// 			o=new THREE.CSS3DSprite(nImg);
// 			o.position.copy(coords3D);
// 			o.position.multiplyScalar(50);
// 			o.matrixAutoUpdate = false;
// 			o.updateMatrix();
// 			root.add(o);
// 			// $scope.objects.push(o);
// //			}
// 		});
// 		var start=new THREE.Vector3();
// 		var end=new THREE.Vector3();
// 		var lo,lLen,rads,oM,joint,axis,st,en;
// 		links.forEach(function(e,i){
// 			st=$scope.nodes[nodeIdDict[e.start]];
// 			en=$scope.nodes[nodeIdDict[e.end]];
// 			start.x=st.x;
// 			start.y=st.y;
// 			start.z=st.z;
// 			end.x=en.x;
// 			end.y=en.y;
// 			end.z=en.z;
// 			start.multiplyScalar(50);
// 			end.multiplyScalar(50);
// 			tmpVec1.subVectors(end,start);
// 			lLen=tmpVec1.length()-50;
// 			lo=document.createElement('div');
// 			d3.select(lo).datum(e).attr('id','link-1-'+e.start+"-"+e.end).attr('class','link-nG').style('height',lLen+'px');
// 			o = new THREE.CSS3DObject( lo );
// 			o.position.copy( start );
// 			o.position.lerp( end, 0.5 );
// 			axis = tmpVec2.set( 0, 1, 0 ).cross( tmpVec1 );
// 			rads = Math.acos( tmpVec3.set( 0, 1, 0 ).dot( tmpVec4.copy( tmpVec1 ).normalize() ) );
// 			oM = new THREE.Matrix4().makeRotationAxis( axis.normalize(), rads );
// 			o.matrix = oM;
// 			o.rotation.setFromRotationMatrix( o.matrix, o.rotation.order );
// 			o.matrixAutoUpdate = false;
// 			o.updateMatrix();
// 			root.add( o );
// 			// $scope.objects.push( o );
// 			lo = document.createElement( 'div' );
// 			d3.select(lo).datum(e).attr('id','link-2-'+e.start+"-"+e.end).attr('class','link-nG').style('height',lLen+'px');
// 			joint = new THREE.Object3D( lo );
// 			joint.position.copy( start );
// 			joint.position.lerp( end, 0.5 );
// 			joint.matrix.copy( oM );
// 			joint.rotation.setFromRotationMatrix( joint.matrix, joint.rotation.order );
// 			joint.matrixAutoUpdate = false;
// 			joint.updateMatrix();
// 			o = new THREE.CSS3DObject( lo );
// 			o.rotation.y = Math.PI/2;
// 			o.matrixAutoUpdate = false;
// 			o.updateMatrix();
// 			o.userData.joint = joint;
// 			joint.add( o );
// 			root.add( joint );
// 			// $scope.objects.push( o );
// 		});
// 		render();
// 		$scope.fullview();
// 		$("button[title='lock Hierarchy']").removeClass('no-disp');
// 		$("button[title='Toggle Links']").removeClass('no-disp');
// 	};

	function isDisplayed(el){
		// console.log('el======:',el);
		if(d3.select(el)[0][0]==null) return false;
		console.log('is displayed')
		var disp=d3.select(el).style('display');
		if (disp.toLowerCase()=='none') return false;
		else return true;
	};
	function makeDisplayed(el){
		// console.log('make displayed')
		var disp=d3.select(el).style('display','block');
		if (disp.toLowerCase()=='none') return false;
		else return true;
	};
	function getDestinationCord(nObj){
		var cord={x:0,y:0,z:0};
		cord.x=nObj.position.x//*(levelrad[1+leveldict[nObj.type]]-levelrad[leveldict[nObj.type]]);
		cord.y=nObj.position.y//*(levelrad[1+leveldict[nObj.type]]-levelrad[leveldict[nObj.type]]);
		cord.z=nObj.position.z//*(levelrad[1+leveldict[nObj.type]]-levelrad[leveldict[nObj.type]]);
		var rad = Math.sqrt((cord.x*cord.x)+(cord.y*cord.y)+(cord.z*cord.z));
		// console.log('rad: ',rad);
		var tf = convertCartesianToSpherical(cord,rad);
		// console.log('tf: ',tf);
		if(leveldict[$scope.nodes[nObj.idx].type]<4){
			//var xyz = getGeoCoords(rad+(levelrad[1+leveldict[$scope.nodes[nObj.idx].type]]-levelrad[leveldict[$scope.nodes[nObj.idx].type]])+20,tf)
			var xyz = getGeoCoords(levelrad[1+leveldict[$scope.nodes[nObj.idx].type]]+30,tf)
		}
		else{
			var xyz = getGeoCoords(s4R_global+30,tf)
		}
		// console.log('xyz: ',xyz);
		cord.x = xyz[0];
		cord.y = xyz[1];
		cord.z = xyz[2];
		// console.log('c1');		
		// console.log('cord:: ',cord);
		return cord;
	};
	function convertCartesianToSpherical(cord,radius)
	{
		polar = Math.acos(cord.z/radius)
		azimuthal = Math.atan2(cord.y, cord.x)
		return [azimuthal,polar];
	}
	function getGeoCoords(r,tf){
		coords3d=[r*fCos(tf[0])*fSin(tf[1]),r*fSin(tf[0])*fSin(tf[1]),r*fCos(tf[1])];
		return coords3d;
	};


	function nodeClick_NG(e,ctrlkey){
		//e: Scene Object
		console.log("nodeclick e: ",e);
		togglelinkslist = [];
		if($('#actionImg_full').hasClass('sfhen')){
			nodeClickFlag = true;
			// console.log('nodes: ',$scope.nodes);
			if($('.allow-disp').length==0)
				d3.selectAll('.node-nG').classed('node-nG-dimmed',true);
			var recusive_traverse = function(nObj,lvl){
				if(nObj.children){
					d3.select('#node-'+nObj.id).classed('no-disp',false).classed('node-nG-dimmed',false);
					nObj.children.forEach(function(ch,chi){
						//console.log('oohhhhhhhhhhh:::',ch)
						d3.select('#node-'+ch.id).classed('no-disp',false).classed('node-nG-dimmed',false);
						d3.select("#link-1-"+nObj.id+"-"+ch.id).classed('allow-disp',true); 
						d3.select("#link-2-"+nObj.id+"-"+ch.id).classed('allow-disp',true);
						recusive_traverse(ch,lvl+1)
					});
				}
			};
			recusive_traverse(e,0);

			// //Shoot node with relationships
			// $('[id*="'+e.id+'"]').removeClass('allow-disp');
			// d3.select('#node-'+e.id).classed('no-disp',true);
		}
		else{		
			// if($scope.tab=='actionTab' && !executeFlag)
			// 	return;
			//if($scope.tab=='actionTab') return;
			activeNode = e;
			drawArc(e);
			nodeClickFlag = true;
			
			// console.log('e:',e);
			//console.log(e.children)
			//to display children of selected node
			// console.log("camera position: ", camera.position)
			if($scope.nodes[e.idx].type!='Domain'){
				var from = {
					x: camera.position.x,
					y: camera.position.y,
					z: camera.position.z
				};

				// var to = {
				// 	x: e.x*120,
				// 	y: e.y*120,
				// 	z: e.z*120
				// };
				var to = getDestinationCord(e);
				console.log('From: ',from,' To: ',to);
				var tween = new TWEEN.Tween(from)
					.to(to, 700)
					.easing(TWEEN.Easing.Circular.Out)
					.onUpdate(function () {
						//console.log('this:::: ', this)
					camera.position.set(this._object.x, this._object.y, this._object.z);
					camera.lookAt(new THREE.Vector3(0, 0, 0));
				}).onComplete(function () {
					camera.lookAt(new THREE.Vector3(0, 0, 0));
				}).start();	
			}

			if(ctrlkey) return; //Control is pressed then no expand collapse
				//camera.position.z=e.z+100;
				//camera.updateProjectionMatrix();
				//d3.select(e.children[0]).each(function(ch){d3.select(ch).classed('no-disp',false)})
				
				//console.log('nodeclick executed')
			// if (activeNode==this){
			// 	$('.closePopup').trigger('click');

			// } 
			// else{
			// 	activeNode=this;

			// }
			// If (visible child links from node.. Collapse)
			// else ( expand)
			if(visibleChildLink(e)){ //collapse all
				// scene.getAllObjectByProperty('start',e.idx).forEach(function(f,i){
				// 	f.visible = false;
				// 	scene.getObjectByProperty('idx',f.end).visible = false; // Check if no other visible link with parent
				// })
				var recusive_traverse = function(nObj,lvl){
					if(nObj.children){
						nObj.children.forEach(function(ch,chi){
							//console.log('oohhhhhhhhhhh:::',ch)
							scene.getObjectByProperty('idx',ch.idx).visible = false;
							scene.getAllObjectByProperty('end',ch.idx).forEach(function(f,i){
								f.visible = false;
								recusive_traverse(ch,lvl+1);
							});
						})
					}
			}
			recusive_traverse($scope.nodes[e.idx],0);
		}
		else{	//Expand
			scene.getAllObjectByProperty('start',e.idx).forEach(function(f,i){
				f.visible = true;
				scene.getObjectByProperty('idx',f.end).visible = true; // Check if no other visible link with parent
			})				
		}
			// console.log("Links: ",scene.getAllObjectByProperty('start',e.idx));
			// scene.getAllObjectByProperty('start',e.idx).forEach(function(f,i){
			// 	f.visible = false;
			// })
			//console.log("scene: ",scene);

		}
		$('.popupContent-filter-active').addClass('popupContent-default').removeClass('popupContent-filter-active')
	}

    function drawArc(nObj) {
		var remarc = scene.getObjectByName('arc');
		scene.remove(remarc);
		console.log("nObj: ",nObj);
		var cord = nObj.position;
		var radt = Math.sqrt((cord.x*cord.x)+(cord.y*cord.y)+(cord.z*cord.z));
		var tf = convertCartesianToSpherical(cord,radt);
		var xyz1 = getGeoCoords(radt,[tf[0],tf[1]+(2*0.01745329)]);
		var xyz2 = getGeoCoords(radt,[tf[0]-(4*0.01745329),tf[1]]);
		var xyz3 = getGeoCoords(radt,[tf[0],tf[1]-(2*0.01745329)]);
        // smooth my curve over this many points
        var start = new THREE.Vector3(xyz1[0],xyz1[1],xyz1[2]);
        var middle = new THREE.Vector3(xyz2[0],xyz2[1],xyz2[2]);
        var end = new THREE.Vector3(xyz3[0],xyz3[1],xyz3[2]);

        var curveQuad = new THREE.QuadraticBezierCurve3(start, middle, end);

        var tube = new THREE.TubeGeometry(curveQuad, 50, 0.1, 20, false);
        var mesh = new THREE.Mesh(tube, new THREE.MeshNormalMaterial({opacity: 0.6, transparent: true}));
        mesh.name = 'arc';

        scene.add(mesh);

    }

	function visibleChildLink(nObj){
		var flag = false;
		scene.getAllObjectByProperty('start',nObj.idx).forEach(function(f,i){
			if(f.visible == true) flag = true;
		})		
		return flag;
	}

	function addInfo(d){
		//console.log('add info')
		attrArr="<strong>Group:</strong> "+d.type;
		for (attrs in d.attributes){ attrArr+= "<br><strong>"+attrs+":</strong> "+d.attributes[attrs]; }
		d3.select('#window-pi p.proj-info-wrap').html(attrArr);
	};

	function highlightNodes(d){
		memoryarray = [];
		fadearray = [];
		//console.log('highlight nodes')
		if(!isDisplayed("#node-"+d.id)){
			clearHighlightNodes();
			return;
		}
//		var neighborArray = [d.id];
//		console.log('node for neighbor: ',d)
		//d3.select(d.children).ea
//		console.log('neighbor array: ',neighborArray);

        //$('.link-nG.allow-disp').removeClass('allow-disp');
        if($('.allow-disp').length==0){
			$('.node-nG').addClass('node-nG-dimmed');
		}
        
		if($("#node-"+d.id).hasClass('node-nG-dimmed')){
			d3.select('#node-'+d.id).classed('node-nG-dimmed',false);
			fadearray.push("#node-"+d.id);
		}		

		
        d.parent.forEach(function(e){
			if(!isDisplayed("#node-"+e.id)){
				memoryarray.push("#node-"+e.id);
			}
			if($("#node-"+e.id).hasClass('node-nG-dimmed')){
				fadearray.push("#node-"+e.id);
			}
		d3.select('#node-'+e.id).classed('no-disp',false).classed('node-nG-dimmed',false);			
		d3.select("#link-1-"+e.id+"-"+d.id).classed('allow-disp',true); 
		d3.select("#link-2-"+e.id+"-"+d.id).classed('allow-disp',true);});

        d.children.forEach(function(e){
			if(!isDisplayed("#node-"+e.id)){ 
				memoryarray.push("#node-"+e.id);
			}
			if($("#node-"+e.id).hasClass('node-nG-dimmed')){
				fadearray.push("#node-"+e.id);
			}		
				
		d3.select('#node-'+e.id).classed('no-disp',false).classed('node-nG-dimmed',false);	
		d3.select("#link-1-"+d.id+"-"+e.id).classed('allow-disp',true); 
		d3.select("#link-2-"+d.id+"-"+e.id).classed('allow-disp',true)});
	
	};

	function highlightNodes_hover(d,flag){
        d.parent.forEach(function(e){
			if(isDisplayed("#node-"+e.id)){
				d3.select("#link-1-"+e.id+"-"+d.id).classed('allow-disp',flag); 
				d3.select("#link-2-"+e.id+"-"+d.id).classed('allow-disp',flag);}
		});

        d.children.forEach(function(e){
			if(isDisplayed("#node-"+e.id)){
				d3.select("#link-1-"+d.id+"-"+e.id).classed('allow-disp',flag); 
				d3.select("#link-2-"+d.id+"-"+e.id).classed('allow-disp',flag)}
		});
	
	};
	


	// function clearHighlightNodes(){
	// 	//console.log('clear highlight nodes')
		
	// 	memoryarray.forEach(function(element) {
	// 		// console.log("Elemmmm:",element);
	// 		$(element).addClass('no-disp');
	// 		$('[id*="'+element.split('-')[1]+'"]').removeClass('allow-disp');
	// 	});
	// 	fadearray.forEach(function(element) {
	// 		// console.log("Elemmmm:",element);
	// 		$(element).addClass('node-nG-dimmed');
	// 		$('[id*="'+element.split('-')[1]+'"]').removeClass('allow-disp');
	// 	});		
	// 	//$('[id*="'+activeNode.id.split('-')[1]+'"]').removeClass('allow-disp');
	// 	activeNode=undefined;
	// 	//$('.link-nG.allow-disp').removeClass('allow-disp');
	// 	if($('.allow-disp').length==0)
	// 		$('.node-nG.node-nG-dimmed').removeClass('node-nG-dimmed');
	// 	$('#window-pi p.proj-info-wrap').empty();
	// };

	/*---------------UI Logic Ends Here---------------*/


	$(document).on("click", "#actionImg_full", function(){
		//$(".selectBrowser").find("img").removeClass("sb");
		$(this).toggleClass('sfhen');
	});

	function nodeHover(nObj){
// 		if($('.allow-disp').length>0)
// 			$(this).attr('title',e.type+': '+e.name);
// 		else{
// 		//console.log("nodeHover executed!")
// //		activeNode=this;
// 		nodeClickFlag = false;
// 		$(this).css('height','90px');
// 		//$(this).addClass()
// 		$(this).attr('title',e.type+': '+e.name);

// 		var d=d3.select(this).datum();

// 		//highlightNodes(d);
// 		//return;
// 		//highlightNodes_hover(d,false);
// 		//addInfo(d);
// 		//$("a[title='Info']").trigger("click");		
		// link  .geometry.parameters.radius	
//		}
		console.log("Node:: ",nObj);
		//Algo
		scene.getAllObjectByProperty('start',nObj.idx).forEach(function(e){
			e.material.color = {r:1,g:0.3,b:0.3};
		});
		scene.getAllObjectByProperty('end',nObj.idx).forEach(function(e){
			e.material.color = {r:1,g:0.3,b:0.3};
		});
	}

	function nodeHoverOut(){
		console.log("nodehoverout");
//		clearHighlightNodes();
//		return;
		//console.log('flag: ',nodeClickFlag);
		// scene.getAllObjectByProperty('class','node').forEach(function(e){
		// 	e.material.opacity = 1;
		// });
		scene.getAllObjectByProperty('name','link').forEach(function(e){
			e.material.color = {r:0.666,g:0.666,b:0.666};
		});
			//highlightNodes_hover(d,false);
		// .parameter.radius
	}

	$scope.lockSuite = function(e){
		console.log("Locksuite e: ",activeNode);
		//$(".selectBrowser").find("img").removeClass("sb");
		//console.log('activeNode: ',activeNode);
		//console.log('activeNode: ',d3.select(activeNode));
//		console.log('activeNode: ',d3.select(activeNode).attr('class').indexOf('node-TestSuite')!==-1);
	if(activeNode!=undefined && activeNode.label=='TestSuite'){
			//openDialog('Suite to Execute','Suite locked for execution');
			// console.log('activeNode: ',activeNode)
			globalobj['lockedSuite'] = activeNode;
			globalobj['jsondata'] = createExecutionJson();
			executeFlag = false;
			openDialog('Success','Suite locked for execution');
		}
		else
			openDialog('Error','Please select a Suite');
	};

	$scope.lockHeirarchy = function(e){
		//$(".selectBrowser").find("img").removeClass("sb");
		//console.log('activeNode: ',activeNode);
		//console.log('activeNode: ',d3.select(activeNode));
//		console.log('activeNode: ',d3.select(activeNode).attr('class').indexOf('node-TestSuite')!==-1);
		if(activeNode!=undefined){
			openDialog('Lock Heirarchy','Locked for Execution');
			// console.log('activeNode: ',activeNode)
			globalobj['freezeNode'] = activeNode;
		}
		else
			openDialog('Error','Please select a node');
	};

	function buildExecutionGraph(nObj){
		d3.selectAll(".link-nG").classed('allow-disp',false);
		//console.log('Hi');
		d3.selectAll(".node-nG").classed('no-disp',true).classed('node-nG-dimmed',false);
		d3.select(nObj).classed('no-disp',false);
		d3.select('#actionImg_full').classed('sfhen',true);
		$(nObj).trigger('click');

	    var up_traverse = function(nObj, lvl) {
	        //console.log('Hi')
	        //console.log("^^^^parent:",nObj)
	        if (nObj.parent) {
	            nObj.parent.forEach(function(ch, chi) {
	                //console.log('oohhhhhhhhhhh:::',ch)
	                d3.select('#node-' + ch.id).classed('node-nG-dimmed', false).classed('no-disp', false);
					$('#link-1-'+nObj.parent[0].id+'-'+nObj.id).addClass('allow-disp');
					$('#link-2-'+nObj.parent[0].id+'-'+nObj.id).addClass('allow-disp');
	                up_traverse(ch, lvl + 1);
	            });
	        }
	    };
		var selected_node = $scope.nodes.filter(function( obj ) {
				return obj.id == nObj.id.split('-')[1];
				});
		up_traverse(selected_node[0],0);
		//console.log('rootIndex:', d3.select(lockedSuite).data()[0].idx);
		//console.log('rootIndex:', d3.select(lockedSuite).attr('idx'));
		d3.select('#actionImg_full').classed('sfhen',false);
		//d3.selectAll(".link-nG").classed('allow-disp',false);
		//$scope.exec_nodes = [];
		//$scope.exec_nodes=d3.selectAll('.node-nG').filter(function(){return !d3.select(this).classed('no-disp')}).data();
/*
		//add dependent nodes to scope exec
		var tc_list=d3.selectAll('.node-TestCase').filter(function(){return !d3.select(this).classed('no-disp')}).data();
		//console.log('TC LIST>>>>>>:::',tc_list)
		var add_parent_dependencies = function(nObj,lvl){
			//console.log('Hi')
			//console.log("^^^^parent:",nObj)
			if(nObj.parent){
				nObj.parent.forEach(function(ch,chi){
					//console.log('>>>>>>:::',ch)
					r=30;
					tf=[Math.random()*2*PI,Math.random()*2*PI];
					xyz=getGeoCoords(r,tf)
					ch.x=xyz[0]
					ch.y=xyz[1]
					ch.z=xyz[2]
					$scope.exec_nodes.push(ch)
					//d3.select('#node-'+ch.id).classed('no-disp',false).classed('node-nG-dimmed',false);
					add_parent_dependencies(ch,lvl+1)
				});
			}
		};
		tc_list.forEach(function(e){
			add_parent_dependencies(e,0);
		})
*/

	};

	function createExecutionJson(){
	globalobj['jsondata'] = [];
	var jsondata11 = [{
    	"suiteDetails": [],
    	"testsuitename": "",
    	"testsuiteid": "",
    	"browserType": ["1"],
		"NG":"true",
		"appType":"web"
		}]
	if(viewPageName == 'fullView')
		var lockedSuiteObj=[$scope.nodes[globalobj['lockedSuite'].idx]];
	else
		var lockedSuiteObj=$scope.nodes.filter(function( obj ) {return obj.id == globalobj['lockedSuite'].id;});
	//console.log(">>>>>>>>>>>lockedSuite:",lockedSuiteObj)
	
	//res =$.grep($scope.exec_nodes, function(e){ return e.type == "TestSuite"; });
	jsondata11[0].testsuitename = lockedSuiteObj[0].name;
	jsondata11[0].testsuiteid = lockedSuiteObj[0].attributes.testSuiteid;
	//jsondata[0].suiteDetails[0].scenarioids = [];
	globalobj['testscenario_ids']=lockedSuiteObj[0].attributes.testScenarioids;
	//console.log('lockedSuiteObj[0].attributes.testScenarioids',)
	var i = 0;

	for(var k = 0; k < lockedSuiteObj[0].attributes.testScenarioids.length; k++){
		var part1={
     		"condition": 0,
        	"dataparam": [""],
        	"executestatus": 1,
        	"scenarioids": "",
        	"qccredentials": {
            	"qcurl": "",
            	"qcusername": "",
            	"qcpassword": ""
        	}
    	}
		part1.scenarioids =  lockedSuiteObj[0].attributes.testScenarioids[k];
		jsondata11[0].suiteDetails.push(part1);
	}
	globalobj['jsondata']=jsondata11;
	//console.log('\n\n------------json data------------\n\n',JSON.stringify(globalobj['jsondata']));
	// console.log('\n\n------------json data 11------------\n\n',JSON.stringify(jsondata11));
	return jsondata11;
	}


	$scope.execute = function(browserNum){
		//$scope.lockSuite();
		//console.log('hi');
		//console.log('jsondata: ', globalobj['jsondata']);
		globalobj['jsondata'][0].browserType = [String(browserNum)]
		if($("#ct-expand-left").hasClass('ct-rev'))
			$("#ct-expand-left").trigger("click");
		if($("#ct-expand-right").hasClass('ct-rev'))
			$("#ct-expand-right").trigger("click");
		blockUI('Executing...')
		ExecutionService.ExecuteTestSuite_ICE(globalobj['jsondata']).then(function(data) {
		executeFlag = true;
		if (data == "Invalid Session") {
			window.location.href = "/";
		}
		if (data == "Terminate") {
			openDialog("Terminate","execution Terminated")
			//$('#executionTerminated').modal('show');
			//$('#executionTerminated').find('.btn-default').focus();
		} else if (data == "unavailableLocalServer") {
			openDialog('Error',"Execute Test Suite, ICE Engine is not available. Please run the batch file and connect to the Server.")
			//$('#executionserverunavailable').modal('show');
		} else {
			openDialog("Success","execution successful")
			globalobj['module_id'] = globalobj['jsondata'][0].testsuiteid
			//console.log("MID before:",globalobj['module_id'])

			// console.log('DATAAAAAAAA::: ',data)
			for (a in data.TCS){
						if(data.TCS[a]=='Fail' || data.TCS[a]=='fail')
							globalobj['failed_tc_list'].push(b)
			}
			// console.log("%%%%Failed tc list%%%\n",globalobj['failed_tc_list'])			
		}

		unblockUI()
		if(!$("#ct-expand-left").hasClass('ct-rev'))
			$("#ct-expand-left").trigger("click");
		if(!$("#ct-expand-right").hasClass('ct-rev'))
			$("#ct-expand-right").trigger("click");		
		//globalobj['jsondata'] = [];
		//console.log("MID after:",globalobj['module_id'])
	},
		function(error) {
			unblockUI()
			openDialog("Execute Failed", "Failed to execute.")
		})
	}

	// var getReportData = function(moduleid,executionid,testscenarioids){
	// 		neuronGraphs2DService.getReportData(moduleid,executionid,testscenarioids).then(function(data){
	// 		if(data.err && data.ecode=="INVALID_SESSION") window.location.href = "/"; 
	// 		else if(data.err){
	// 			unblockUI();
	// 			blockUI(data.msg);
	// 			$timeout(function(){unblockUI();},3000);
	// 			console.error(data.ecode);
	// 			return false;
	// 		}
	// 		else{
	// 			console.log('data recieved successfully! ::',data);
	// 			globalobj['nodeStatusdata']=data;
	// 			//console.log("&&&&Testscenarioids&&&&\n",testscenarioids)
	// 			//console.log("&&&&data&&&&\n",globalobj['nodeStatusdata'])
	// 			for (a in globalobj['nodeStatusdata']){
	// 				if(a!='rows' || a!='undefined'){
	// 					for(b in globalobj['nodeStatusdata'][a]){
	// 						if(globalobj['nodeStatusdata'][a][b]=='Fail')
	// 							globalobj['failed_tc_list'].push(b)
	// 					}
	// 				}

	// 			}
	// 			console.log("%%%%Failed tc list%%%\n",globalobj['failed_tc_list'])


	// 	//For each failed testcase, add a class to indicate failed!!
	// 			clearHighlightNodes();
	// 			d3.selectAll('.node-nG').classed('node-nG-dimmed',true)
	// 			globalobj['failed_tc_list'].forEach(function(tc_name){
	// 				var selected_node = $scope.nodes.filter(function( obj ) {
	// 									return obj.name == tc_name;
	// 									});
	// 				//console.log("++++++selected_node:",selected_node)
	// 				d3.select('#node-'+selected_node[0].id).classed('node-nG-dimmed',false)
	// 			})
	// 			var up_traverse = function(nObj,lvl){
		
	// 				//console.log('Hi')
	// 				//console.log("^^^^parent:",nObj)
	// 				if(nObj.parent){
	// 					nObj.parent.forEach(function(ch,chi){
	// 						//console.log('oohhhhhhhhhhh:::',ch)
	// 						d3.select('#node-'+ch.id).classed('node-nG-dimmed',false);
	// 						up_traverse(ch,lvl+1)
	// 					});
	// 				}
	// 			};
	// 			globalobj['failed_tc_list'].forEach(function(e){
	// 				var selected_node = $scope.nodes.filter(function( obj ) {
	// 						return obj.name == e;
	// 						});
	// 				up_traverse(selected_node[0],0);
	// 			})
	// 		}
	// 	},function(error){
	// 		unblockUI();
	// 		console.error("Error:::::::::::::", error)
	// 	});
	// }

	function getReportData1() {
	    //console.log("&&&&Testscenarioids&&&&\n",testscenarioids)
	    //console.log("&&&&data&&&&\n",globalobj['nodeStatusdata'])
	    //For each failed testcase, add a class to indicate failed!!
	    clearHighlightNodes();
	    d3.selectAll('.node-nG').classed('node-nG-dimmed', true)
	    globalobj['failed_tc_list'].forEach(function(tc_name) {
	        var selected_node = $scope.nodes.filter(function(obj) {
	            return obj.name == tc_name;
	        });
	        //console.log("++++++selected_node:",selected_node)
	        d3.select('#node-' + selected_node[0].id).classed('node-nG-dimmed', false)
	    })
	    var up_traverse = function(nObj, lvl) {
	        //console.log('Hi')
	        //console.log("^^^^parent:",nObj)
	        if (nObj.parent) {
	            nObj.parent.forEach(function(ch, chi) {
	                //console.log('oohhhhhhhhhhh:::',ch)
	                d3.select('#node-' + ch.id).classed('node-nG-dimmed', false);
	                up_traverse(ch, lvl + 1)
	            });
	        }
	    };
	    globalobj['failed_tc_list'].forEach(function(e) {
	        var selected_node = $scope.nodes.filter(function(obj) {
	            return obj.name == e;
	        });
	        up_traverse(selected_node[0], 0);
	    })
	}




	// $('#actionImg6').click(function(){

	// })


	// $scope.history = function(){
	// //			console.log("jsondata[0]:::::::", globalobj['jsondata'][0])
	// 			console.log("@@@@moduleId:",d3.select(globalobj['lockedSuite']).datum().attributes.testSuiteid)
	// 	reportService.getSuiteDetailsInExecution_ICE(d3.select(globalobj['lockedSuite']).datum().attributes.testSuiteid).then(function(data) {
	// 			if (data == "Invalid Session") {
	// 				window.location.href = "/";
	// 			}
	// 			if (data != "fail") {
	// 				if (Object.prototype.toString.call(data) === '[object Array]') {
	// 					if (data.length > 0) {
	// 						var tempdate = new Date('0', '0', '0', '0', '0')
	// 						//tableContainer.find('tbody').empty();
	// 						var startDat, startTym, executionid_tmp;
	// 						for (i = 0; i < data.length; i++) {
	// 							//console.log("^^^^^data: ",data[i])
	// 							executionid_tmp = data[i].execution_id;
	// 							startDat = (data[i].start_time.split(' ')[0]).split("-")
	// 							startTym = (data[i].start_time.split(' ')[1]).split(":")
	// 							var mydate = new Date(startDat[2], startDat[1] - 1, startDat[0], startTym[0], startTym[1])
	// 							if (mydate > tempdate) {
	// 								tempdate = mydate
	// 								globalobj['executionid'] = executionid_tmp;
	// 								console.log('modified!');
	// 								//testscenarioids.push(data[i].testscenarioids)
	// 							}

	// 						}
	// 						console.log('latest execution on :::', tempdate, 'execution_id:', globalobj['executionid'])
	// 						getReportData(d3.select(globalobj['lockedSuite']).datum().attributes.testSuiteid, globalobj['executionid'], globalobj['testscenario_ids']);
	// 						console.log('getReportData executed')
	// 					}
	// 				}
	// 			} else console.log("Unable to load Test suite details in execution.")
	// 		},
	// 		function(error) {
	// 			console.log("Error-------" + error);
	// 		})
	// }

	// $('#actionImg6').click(function(){

	// })


	$scope.history = function(){
		openDialog('Error','Results view is currently disabled!');
		/* History when response is changed!!
	//	console.log("jsondata[0]:::::::", globalobj['jsondata'][0])
		//console.log("@@@@moduleId:",d3.select(globalobj['lockedSuite']).datum().attributes.testSuiteid)
		reportService.getSuiteDetailsInExecution_ICE(d3.select(globalobj['lockedSuite']).datum().attributes.testSuiteid).then(function(data) {
				if (data == "Invalid Session") {
					window.location.href = "/";
				}
				if (data != "fail") {
					if (Object.prototype.toString.call(data) === '[object Array]') {
						if (data.length > 0) {
							var tempdate = new Date('0', '0', '0', '0', '0')
							//tableContainer.find('tbody').empty();
							var startDat, startTym, executionid_tmp;
							for (i = 0; i < data.length; i++) {
								//console.log("^^^^^data: ",data[i])
								executionid_tmp = data[i].execution_id;
								startDat = (data[i].start_time.split(' ')[0]).split("-")
								startTym = (data[i].start_time.split(' ')[1]).split(":")
								var mydate = new Date(startDat[2], startDat[1] - 1, startDat[0], startTym[0], startTym[1])
								if (mydate > tempdate) {
									tempdate = mydate
									globalobj['executionid'] = executionid_tmp;
									console.log('modified!');
									//testscenarioids.push(data[i].testscenarioids)
								}

							}
							console.log('latest execution on :::', tempdate, 'execution_id:', globalobj['executionid'])
							//getReportData(d3.select(globalobj['lockedSuite']).datum().attributes.testSuiteid, globalobj['executionid'], globalobj['testscenario_ids']);
							getReportData1();
							console.log('getReportData executed')
						}
					}
				} else console.log("Unable to load Test suite details in execution.")
			},
			function(error) {
				console.log("Error-------" + error);
			})  
			*/
	}

	function openDialog(title, body){
		$("#NeuronGraphGlobalModal").find('.modal-title').text(title);
		$("#NeuronGraphGlobalModal").find('.modal-body p').text(body).css('color','black');
		$("#NeuronGraphGlobalModal").modal("show");
		setTimeout(function(){
		$("#NeuronGraphGlobalModal").find('.btn-accept').focus();
		}, 300);
	}

	$scope.twoDView = function(){
		
		viewPageName = '2DView';
		$("button[title='lock Hierarchy']").addClass('no-disp');
		$("button[title='Toggle Links']").addClass('no-disp');
		$('.ct-rev').trigger('click');
		$('#ct-canvas').empty();
		$('#ct-canvas').css('display','none');
		$('#ct-canvas2').css('display','block');
		$('#actionImg2d').addClass('highlightOpt');
		$('#actionImg').removeClass('highlightOpt');
		//graph ={nodes:Array_of_obj,links:Array_of_obj} 
		var node_t,link_t,node_tl = [],link_tl=[];
		var rating_t = {'Domain':1,'Project':10,'Release':50,'Cycle':90,'TestSuite':150,'TestScenario':200,'TestCase':300,'Screen':500};
		$scope.nodes.forEach(function(e,i){
			node_t = {"name":e.name,"rating":rating_t[e.type],"id":e.id,"type":e.type,"expand":true};
			node_tl.push(node_t);
		});
		$scope.links.forEach(function(e,i) {
			//console.log(e,i);
			var st,tt;
			st = $scope.nodes.filter(function( obj ) {return obj.id == e.start;})
			tt = $scope.nodes.filter(function( obj ) {return obj.id == e.end;})
			//console.log("st: , TT:");
			link_t = {"source": st[0].idx, "target" : tt[0].idx, "value":3, "label":"manageWebsite"}
			link_tl.push(link_t);
		});
		//console.log('links: ',link_tl);
		var graph = {
			"nodes":node_tl,
			"links":link_tl
		}
		var margin = {
			top: -5,
			right: -5,
			bottom: -5,
			left: -5
		};
		var width = getDimms('#ct-canvas2')[0] - margin.left - margin.right,
			height = getDimms('#ct-canvas2')[1] - margin.top - margin.bottom;

		var color = d3.scale.category20();
function restart(){

			
		force
			.nodes(graph.nodes)
			.links(graph.links)
			.start();

}
		var force = d3.layout.force()
			.charge(-1800)
			.linkDistance(100)
			.size([width + margin.left + margin.right, height + margin.top + margin.bottom]);

		var zoom = d3.behavior.zoom()
			.scaleExtent([0, 10])
			.on("zoom", zoomed);

		var drag = d3.behavior.drag()
			.origin(function(d) {
				return d;
			})
			.on("dragstart", dragstarted)
			.on("drag", dragged)
			.on("dragend", dragended);


		var svg = d3.select("#ct-canvas2").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("id","svg-2d")
			.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
			.call(zoom);

		var rect = svg.append("rect")
			.attr("width", width)
			.attr("height", height)
			.style("fill", "none")
			.style("pointer-events", "all");

		var container = svg.append("g");

		//d3.json('http://blt909.free.fr/wd/map2.json', function(error, graph) {

		force
			.nodes(graph.nodes)
			.links(graph.links)
			.start();



		var link = container.append("g")
			.attr("class", "links")
			.selectAll(".link")
			.data(graph.links)
			.enter().append("line")
			.attr("class", "link")
			.style("stroke-width", function(d) {
				//console.log('LLL: ',d);
				return 1+Math.sqrt(d.value);
			})
			.attr("id",function(d){
				return 'link-'+d.source.id+'-'+d.target.id;
			});

		var node = container.append("g")
			.attr("class", "nodes")
			.selectAll(".node")
			.data(graph.nodes)
			.enter().append("g")
			.attr("id", function(d){
				return d.id;
			})
			.attr("class", function(d){
				return "node "+"node-"+d.type;
			})
			.attr("cx", function(d) {
				return d.x;
			})
			.attr("cy", function(d) {
				return d.y;
			})
			.call(drag);

		node.append("circle")
			.attr("r", function(d) {
				//return 12;
				return d.weight + 12;
			})
			.style("fill", function(d) {
				 return color(1/d.rating);
			}).append("svg:title")
      .text(function(d){ return  d.type+' : '+d.name;});;


		force.on("tick", function() {
			link.attr("x1", function(d) {
					return d.source.x;
				})
				.attr("y1", function(d) {
					return d.source.y;
				})
				.attr("x2", function(d) {
					return d.target.x;
				})
				.attr("y2", function(d) {
					return d.target.y;
				})

			node.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			});
		});

		var linkedByIndex = {};
		graph.links.forEach(function(d) {
			linkedByIndex[d.source.index + "," + d.target.index] = 1;
		});

		function isConnected(a, b) {
			return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index];
		}

		node.on("mouseover", function(d) {

				node.classed("node-active", function(o) {
					thisOpacity = isConnected(d, o) ? true : false;
					this.setAttribute('fill-opacity', thisOpacity);
					return thisOpacity;
				});

				link.classed("link-active", function(o) {
					return o.source === d || o.target === d ? true : false;
				});

				d3.select(this).classed("node-active", true);
				d3.select(this).select("circle").transition()
					.duration(300)
					.attr("r",d.weight +20);
			})

			.on("mouseout", function(d) {

				node.classed("node-active", false);
				link.classed("link-active", false);

				d3.select(this).select("circle").transition()
					.duration(300)
					.attr("r", d.weight+12);
			}).on("click", function(d){
				console.log("d: ",d);
				activeNode = $('#'+d.id)[0];
				d3.select('.activenode').classed('activenode',false);
				$(activeNode).addClass('activenode');
			// 	//toggle(d);
			// 	if(d.expand){
			// 		var tmp = $scope.nodes.filter(function( obj ) {return obj.id == d.id;})
			// 		//console.log(tmp);
			// 		var recusive_traverse = function(nObj,lvl){
			// 			if(nObj.children){
			// 				nObj.children.forEach(function(ch,chi){
			// 					//console.log('oohhhhhhhhhhh:::',ch)
			// 					$('#'+ch.id).addClass('no-disp');
			// 					$("#link-"+nObj.id+"-"+ch.id).addClass('no-disp'); 
			// 					recusive_traverse(ch,lvl+1)
			// 				});
			// 			}
			// 		};
			// 		recusive_traverse(tmp[0],0);	
			// 		d.expand = false;				
			// 	}
			// 	else{
			// 		var tmp = $scope.nodes.filter(function( obj ) {return obj.id == d.id;})
			// 		//console.log(tmp);
			// 		if(tmp[0].children){
			// 			tmp[0].children.forEach(function(ch,chi){
			// 				//console.log('oohhhhhhhhhhh:::',ch)
			// 				$(ch.id).removeClass('no-disp');
			// 				$("#link-"+tmp.id+"-"+ch.id).removeClass('no-disp'); 
			// 			});
			// 		}
			// 		d.expand = true;
			// 	}
			});


		function dottype(d) {
			d.x = +d.x;
			d.y = +d.y;
			return d;
		}

		function zoomed() {
			container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		}

		function dragstarted(d) {
			d3.event.sourceEvent.stopPropagation();

			d3.select(this).classed("dragging", true);
			force.start();
		}

		function dragged(d) {

			d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);

		}

		function dragended(d) {

			d3.select(this).classed("dragging", false);
		}
    // function toggle(d) {
    //   if (d.children) {
    //     d.nodeOpen = false;
    //     d._children = d.children;
    //     d.children = null;
    //   } else {
    //     d.nodeOpen = true;
    //     d.children = d._children;
    //     d._children = null;
    //   }
    // }
		addLegends();
		//d3.select("#svg-2d").attr('transform','translate('+getDimms('#ct-canvas')[0]/2+','+getDimms('#ct-canvas')[1]/2+')scale(0.08)');
	 }
}]);