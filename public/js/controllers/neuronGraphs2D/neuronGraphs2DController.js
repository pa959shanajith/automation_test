mySPA.controller('neuronGraphs2DController', ['$scope', '$http', '$location', '$timeout', 'neuronGraphs2DService','ExecutionService','reportService' , 'cfpLoadingBar','$window', function($scope,$http,$location,$timeout,neuronGraphs2DService,ExecutionService,reportService,cfpLoadingBar,$window) {
    $("head").append('<link id="nGraphsCSS" rel="stylesheet" type="text/css" href="css/nGraphs.css" />')
	if(window.localStorage['navigateScreen'] != "neuronGraphs2D") $rootScope.redirectPage();
	var nodeColor={"Domain":"#355264","Project":"#A24178","Release":"#CD7D40","Cycle":"#A9B800","TestSuite":"#FF9899","TestScenario":"#E3CC4C","TestCase":"#7BD2C9","Screen":"#BDBEC0"};
	var nodeTypes,rootIndex,mapN2DCoords,enabledFilters,visibleNodeNames;
//nodeStatusdata,moduleid,scenarioids,exec_id,failed_tc_list
	var globalobj = {};
	var leveldict={'Domain':0,'Project':1,'Release':2,'Cycle':3,'TestSuite':4,'TestScenario':5,'TestCase':6,'Screen':7}
	var levelrad={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7}

	globalobj['failed_tc_list']=[];
	var nodeClickFlag,executeFlag;
	var nodeIdDict={};
	var memoryarray =[],fadearray=[];

	var PI=Math.PI, fCos=Math.cos, fAcos=Math.acos, fSin=Math.sin, fAsin=Math.asin;

	$timeout(function(){
		console.log('timeout')
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear();
	}, 500);
	$scope.level=3;
	//Select Browser Function
	/*$(document).on("click", ".selectBrowser", function(){
		//$(".selectBrowser").find("img").removeClass("sb");
		$(this).find("img").toggleClass("sb")
	});*/

	$scope.assignTab = function(option){

		// d3.selectAll('.node-nG').each(function(d){
		// 	console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
		// 	d.x=undefined;
		// 	d.y=undefined;
		// 	d.z=undefined;
		// })

		activeNode = undefined;
		console.log('assign tab')
		$scope.tab = option;
		$('.selectedIcon').removeClass('selectedIcon');
		if($scope.tab=='viewTab'){
			 $('#viewImg').addClass('selectedIcon');
			 //drawGraph($scope.nodes,$scope.links,3);
			 //$scope.loadNGraphs();
		}
		else if($scope.tab=='actionTab') {
			if(!globalobj['lockedSuite']){
				$timeout(function(){$('#viewImg').trigger("click");},1000);
				openDialog('Error','Please Lock a suite to Execute first!');
				return;
			}
			$('#actionImg').addClass('selectedIcon');
			buildExecutionGraph();
			globalobj['jsondata'] = createExecutionJson();
			executeFlag = false;			
		}
	}

	$scope.fullview = function(){
		d3.selectAll('.node-nG').classed('no-disp',false).classed('node-nG-dimmed',false);
		d3.selectAll('.link-nG').classed('allow-disp',false);
	}


	$scope.loadNGraphs = function(e){
		console.log('loadNgraphs called from tab: ', $scope.tab)
		if($("#ct-expand-left").hasClass('ct-rev'))
			$("#ct-expand-left").trigger("click");
		if($("#ct-expand-right").hasClass('ct-rev'))
			$("#ct-expand-right").trigger("click");
		blockUI('Loading...');
		$scope.clearData();

// 		neuronGraphs2DService.BuildRelationships().then(function(data){
// 			if(data.err && data.ecode=="INVALID_SESSION") $rootScope.redirectPage(); 
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

	var addLegends = function(){
		console.log('add legends')
		var i=0;
		//var nodeTypeList=Object.keys(nodeColor);
		//var canvX=getDimms('#ct-canvas')[0]-50;
		//var y=Math.round(nodeTypeList.length/Math.floor(canvX/100));
		var u=d3.select('#ct-canvas').append('svg').attr('id','ct-legendBox').append('g').attr('transform','translate(10,10)');
		for(e in nodeColor){
			t=u.append('g');
			t.append('circle').attr('style','fill:'+nodeColor[e]).attr('cx',i).attr('cy',0).attr('r',10);
			t.append('text').attr('style','font-size:12px').attr('x',i+15).attr('y',3).text(e);
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
		d3.selectAll(".link-nG").classed('allow-disp',false);
		d3.selectAll(".node-nG").classed('node-nG-dimmed',false);
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
		console.log('filter objects')
		enabledFilters=[];
		$('.popupContent-filter-active').each(function(){
			enabledFilters.push($(this).data('tag'));
		});
		applyFilters(1);
	});

	$("#selectAllFilters span.selectAllTxt").on("click", function(){applyFilters(0); console.log('apply filter')});
	$("#selectAllFilters input.checkStyleboxFilter").on("click", function(){applyFilters(0); console.log('apply filter')});
	
	var applyFilters = function(k){
		console.log('apply filter')
		if (k==0||enabledFilters.length==0){
			enabledFilters=[];
			$('.node-nG.no-disp').removeClass('no-disp');
		}
		else{
			$('.node-nG').addClass('no-disp');
			for(var i=0,l=enabledFilters.length;i<l;i++){
				$('.node-nG.node-'+enabledFilters[i]).removeClass('no-disp');
			}
		}
		if(activeNode!==undefined) highlightNodes(d3.select(activeNode).datum());
	};

	/*---------------Filter Objects Ends Here---------------*/

	/*---------------Search Node Starts Here---------------*/
	//$(".slidePopup").click(function(e){
	$("#slidePopupSearchBox").click(function(e){
		console.log('slidepopup search box')
		visibleNodeNames=[];
		d3.selectAll('.node-nG').each(function(d){if(!(d3.select(this).classed('no-disp'))) visibleNodeNames.push([d.idx,d.name]);});
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
		console.log('searchnodeitem click')
		$("#node-"+$scope.nodes[$(this).data("lindex")].id).trigger("click");
	});
	/*---------------Search Node Ends Here---------------*/

	/*---------------Data Processing Logic Starts Here---------------*/

	var loadGraphData = function(){
		console.log('loadgraph data')
		if(window.localStorage['_UI']){
			var userInfo =  JSON.parse(window.localStorage['_UI']);
			var userid = userInfo.user_id;
			neuronGraphs2DService.getGraphData(userid).then(function(data){
				if(data.err && data.ecode=="INVALID_SESSION") $rootScope.redirectPage(); 
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
				console.log('nodes: ', $scope.nodes);
				//blockUI(data.msg);
				setPositionsSemi3D($scope.nodes,rootIndex);
				//unblockUI();
				nginit($scope.nodes,data.links,$scope.level);
				animate();
				unblockUI();

			},function(error){
				unblockUI();
				console.error("Error:::::::::::::", error)
			});
		}
	}

	var bindData = function(no,lo){
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

	var cleanCyclicData = function(no){
		console.log('clean cyclic data')
		no.forEach(function(n){
			if (n.children) delete n.children;
			if (n.parent) delete n.parent;
		});
		return no;
	};
	/*---------------Data Processing Logic Ends Here---------------*/

	/*---------------Positioning Logic Starts Here---------------*/
	var getDimms = function(t){
		return [parseInt($(t).css('width')),parseInt($(t).css('height'))];
	};

	var getN3DCoords = function(n,radius){
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

	var getN2DCoords = function(n,radius){
		var i,coordsList=[];
		var d=mapN2DCoords[n];
		var r=d.r*radius;
		var l=radius-r;
		d.cl.forEach(function(e){
			coordsList.push([e[0]*radius,e[1]*radius]);
		});
		return [coordsList,l,r];
	};

	var setPositionsSemi3D = function(data,iRoot){
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
		s4R = 1.2*(s3R+Math.ceil(Math.sqrt((total_TS+total_TSc+total_TC+total_S))));
		levelrad['Project'] = s1R;
		levelrad['Release'] = s2R;
		levelrad['Cycle'] = s3R;
		levelrad['TestSuite'] = s4R;
		levelrad['TestScenario'] = s4R;
		levelrad['TestCase'] = s4R;
		levelrad['Screen'] = s4R;
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

    var distanceBetweenPoints = function(point1,point2){
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
	var tmpVec1=new THREE.Vector3();
	var tmpVec2=new THREE.Vector3();
	var tmpVec3=new THREE.Vector3();
	var tmpVec4=new THREE.Vector3();
	var nodeImgDataURL={};
	$scope.objects=[];
	var baseSprite=document.createElement('img');

	var nginit = function(n,l,level){
		console.log('ng init')
		canvDimm=getDimms('#ct-canvas');
		camera=new THREE.PerspectiveCamera(70,canvDimm[0]/canvDimm[1],1,5000);
		camera.position.z=1500;
		scene=new THREE.Scene();
		root=new THREE.Object3D();
		scene.add(root);
		renderer=new THREE.CSS3DRenderer();
		renderer.setSize(canvDimm[0],canvDimm[1]);
		document.getElementById('ct-canvas').appendChild(renderer.domElement);
		controls=new THREE.TrackballControls(camera,renderer.domElement);
		controls.rotateSpeed=0.7;
		controls.addEventListener('change',render);
		baseSprite.onload=function(){drawGraph(n,l,level);};
		baseSprite.src='imgs/ngr-node.png';
		window.addEventListener('resize',onWindowResize,false);
		window.addEventListener('mousewheel',test,false)
	};
	function test(){
		console.log("scroll event");
	}

	function render(){
		renderer.render(scene,camera);
	}

	function onWindowResize(){
		canvDimm=getDimms('#ct-canvas');
		camera.aspect=canvDimm[0]/canvDimm[1];
		camera.updateProjectionMatrix();
		renderer.setSize(canvDimm[0],canvDimm[1]);
		render();
	}

	function animate(){
		TWEEN.update();
		requestAnimationFrame(animate);
		controls.update();
		var time=Date.now()*0.0004;
		//root.rotation.x = time;
		//root.rotation.y = time * 0.7;
		render();
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

	var getNodeImgDataURL = function(img){
		var i,hex,r,g,b,durl,w,h,c,ctx,k,x,y,dImg,m;
		var dMap={};
		for (i in nodeColor){
			hex=nodeColor[i];
			r=(parseInt(hex.slice(1,3),16)/255).toString(10);
			g=(parseInt(hex.slice(3,5),16)/255).toString(10);
			b=(parseInt(hex.slice(5,7),16)/255).toString(10);
			w=img.width;
			h=img.height;
			c=document.createElement('canvas');
			c.width=w;
			c.height=h;
			ctx=c.getContext('2d');
			ctx.drawImage(img,0,0,w,h);
			dImg=ctx.getImageData(0,0,w,h);
			m=dImg.data;
			for(x=0,y=m.length;x<y;x+=4) {
				m[x]*=r;
				m[x+1]*=g;
				m[x+2]*=b;
			}
			ctx.putImageData(dImg,0,0);
			durl=c.toDataURL();
			dMap[i]=durl;
		}
		return dMap;
	};

	var drawGraph = function(nodes,links,lvl){
		console.log("drawGraph Executed! ")
		console.log("Nodess:",nodes)
		console.log("links:", links)
		console.log('draw graph')
		var i,o
		for(i=0;i<$scope.objects.length;i++){
			o=$scope.objects[i];
			o.parent.remove(o);
		}
		delete $scope.objects;
		$scope.objects=[];
		nodeImgDataURL=getNodeImgDataURL(baseSprite);
		var coords3D=new THREE.Vector3();
		var nImg;
		nodes.forEach(function(e){
//			if(leveldict[e.type]<=3){
			coords3D.x=e.x;
			coords3D.y=e.y;
			coords3D.z=e.z;
			nImg=document.createElement('img');
			d3.select(nImg).datum(e).attr('id','node-'+e.id).attr('class','node-nG node-'+e.type).classed('no-disp',function(d){return leveldict[d.type]>lvl;}).on('click',nodeClick).on('mouseover',nodeHover).on('mouseout',nodeHoverOut);
			nImg.src=nodeImgDataURL[e.type];
			o=new THREE.CSS3DSprite(nImg);
			o.position.copy(coords3D);
			o.position.multiplyScalar(50);
			o.matrixAutoUpdate = false;
			o.updateMatrix();
			root.add(o);
			$scope.objects.push(o);
//			}
		});
		var start=new THREE.Vector3();
		var end=new THREE.Vector3();
		var lo,lLen,rads,oM,joint,axis,st,en;
		links.forEach(function(e,i){
			st=$scope.nodes[nodeIdDict[e.start]];
			en=$scope.nodes[nodeIdDict[e.end]];
			start.x=st.x;
			start.y=st.y;
			start.z=st.z;
			end.x=en.x;
			end.y=en.y;
			end.z=en.z;
			start.multiplyScalar(50);
			end.multiplyScalar(50);
			tmpVec1.subVectors(end,start);
			lLen=tmpVec1.length()-50;
			lo=document.createElement('div');
			d3.select(lo).datum(e).attr('id','link-1-'+e.start+"-"+e.end).attr('class','link-nG').style('height',lLen+'px');
			o = new THREE.CSS3DObject( lo );
			o.position.copy( start );
			o.position.lerp( end, 0.5 );
			axis = tmpVec2.set( 0, 1, 0 ).cross( tmpVec1 );
			rads = Math.acos( tmpVec3.set( 0, 1, 0 ).dot( tmpVec4.copy( tmpVec1 ).normalize() ) );
			oM = new THREE.Matrix4().makeRotationAxis( axis.normalize(), rads );
			o.matrix = oM;
			o.rotation.setFromRotationMatrix( o.matrix, o.rotation.order );
			o.matrixAutoUpdate = false;
			o.updateMatrix();
			root.add( o );
			$scope.objects.push( o );
			lo = document.createElement( 'div' );
			d3.select(lo).datum(e).attr('id','link-2-'+e.start+"-"+e.end).attr('class','link-nG').style('height',lLen+'px');
			joint = new THREE.Object3D( lo );
			joint.position.copy( start );
			joint.position.lerp( end, 0.5 );
			joint.matrix.copy( oM );
			joint.rotation.setFromRotationMatrix( joint.matrix, joint.rotation.order );
			joint.matrixAutoUpdate = false;
			joint.updateMatrix();
			o = new THREE.CSS3DObject( lo );
			o.rotation.y = Math.PI/2;
			o.matrixAutoUpdate = false;
			o.updateMatrix();
			o.userData.joint = joint;
			joint.add( o );
			root.add( joint );
			$scope.objects.push( o );
		});
		render();

	};

	var isDisplayed = function(el){
		console.log('el======:',el);
		if(d3.select(el)[0][0]==null) return false;
		console.log('is displayed')
		var disp=d3.select(el).style('display');
		if (disp.toLowerCase()=='none') return false;
		else return true;
	};
	var makeDisplayed = function(el){
		console.log('make displayed')
		var disp=d3.select(el).style('display','block');
		if (disp.toLowerCase()=='none') return false;
		else return true;
	};
	function getDestinationCord(nObj){
		var cord={x:0,y:0,z:0};
		cord.x=nObj.x//*(levelrad[1+leveldict[nObj.type]]-levelrad[leveldict[nObj.type]]);
		cord.y=nObj.y//*(levelrad[1+leveldict[nObj.type]]-levelrad[leveldict[nObj.type]]);
		cord.z=nObj.z//*(levelrad[1+leveldict[nObj.type]]-levelrad[leveldict[nObj.type]]);
		var rad = Math.sqrt((cord.x*cord.x)+(cord.y*cord.y)+(cord.z*cord.z));
		console.log('rad: ',rad);
		var tf = convertCartesianToSpherical(cord,rad);
		console.log('tf: ',tf);
		if(leveldict[nObj.type]<4){
			var xyz = getGeoCoords(rad+(levelrad[1+leveldict[nObj.type]]-levelrad[leveldict[nObj.type]])+20,tf)
		}
		else{
		var xyz = getGeoCoords(rad+25,tf)}
		console.log('xyz: ',xyz);
		cord.x = xyz[0]*50;
		cord.y = xyz[1]*50;
		cord.z = xyz[2]*50;
		console.log('c1');		
		console.log('cord:: ',cord);
		return cord;
	};
	function convertCartesianToSpherical(cord,radius)
	{
		polar = Math.acos(cord.z/radius)
		azimuthal = Math.atan2(cord.y, cord.x)
		return [azimuthal,polar];
	}
	var getGeoCoords = function(r,tf){
		coords3d=[r*fCos(tf[0])*fSin(tf[1]),r*fSin(tf[0])*fSin(tf[1]),r*fCos(tf[1])];
		return coords3d;
	};


	var nodeClick = function(e){
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
			if($scope.tab=='actionTab' && !executeFlag)
				return;
			//if($scope.tab=='actionTab') return;
			nodeClickFlag = true;
			console.log('e:',e);
			//console.log(e.children)
			//to display children of selected node
			console.log("camera position: ", camera.position)
			if(e.type!='Domain'){
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
				//camera.position.z=e.z+100;
				//camera.updateProjectionMatrix();
				//d3.select(e.children[0]).each(function(ch){d3.select(ch).classed('no-disp',false)})
				
				//console.log('nodeclick executed')
				if (activeNode==this){
					$('.closePopup').trigger('click');
					clearHighlightNodes();
				} 
				else{
					activeNode=this;
					var d=d3.select(this).datum();
					console.log('highlight node:',d);
					highlightNodes(d);
					addInfo(d);
					//$("a[title='Info']").trigger("click");
				}

		}
		$('.popupContent-filter-active').addClass('popupContent-default').removeClass('popupContent-filter-active')
	}


	var addInfo = function(d){
		//console.log('add info')
		attrArr="<strong>Group:</strong> "+d.type;
		for (attrs in d.attributes){ attrArr+= "<br><strong>"+attrs+":</strong> "+d.attributes[attrs]; }
		d3.select('#window-pi p.proj-info-wrap').html(attrArr);
	};

	var highlightNodes = function(d){
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

	var highlightNodes_hover = function(d,flag){
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
	


	var clearHighlightNodes = function(){
		//console.log('clear highlight nodes')
		
		memoryarray.forEach(function(element) {
			console.log("Elemmmm:",element);
			$(element).addClass('no-disp');
			$('[id*="'+element.split('-')[1]+'"]').removeClass('allow-disp');
		});
		fadearray.forEach(function(element) {
			console.log("Elemmmm:",element);
			$(element).addClass('node-nG-dimmed');
			$('[id*="'+element.split('-')[1]+'"]').removeClass('allow-disp');
		});		
		//$('[id*="'+activeNode.id.split('-')[1]+'"]').removeClass('allow-disp');
		activeNode=undefined;
		//$('.link-nG.allow-disp').removeClass('allow-disp');
		if($('.allow-disp').length==0)
			$('.node-nG.node-nG-dimmed').removeClass('node-nG-dimmed');
		$('#window-pi p.proj-info-wrap').empty();
	};

	/*---------------UI Logic Ends Here---------------*/


	$(document).on("click", "#actionImg_full", function(){
		//$(".selectBrowser").find("img").removeClass("sb");
		$(this).toggleClass('sfhen');
	});

	var nodeHover = function(e){
		if($('.allow-disp').length>0)
			$(this).attr('title',e.type+': '+e.name);
		else{
		//console.log("nodeHover executed!")
//		activeNode=this;
		nodeClickFlag = false;
		$(this).css('height','90px');
		//$(this).addClass()
		$(this).attr('title',e.type+': '+e.name);

		var d=d3.select(this).datum();

		//highlightNodes(d);
		//return;
		highlightNodes_hover(d,false);
		//addInfo(d);
		//$("a[title='Info']").trigger("click");
		}
	}

	var nodeHoverOut = function(e){
//		clearHighlightNodes();
//		return;
		//console.log('flag: ',nodeClickFlag);
		$('.closePopup').trigger('click');
		$(this).css('height','64px');
		if(!nodeClickFlag){
			$(this).attr('title','');
			var d=d3.select(this).datum();
			highlightNodes_hover(d,false);
		}
	}

	$scope.lockSuite = function(e){
		//$(".selectBrowser").find("img").removeClass("sb");
		//console.log('activeNode: ',activeNode);
		//console.log('activeNode: ',d3.select(activeNode));
//		console.log('activeNode: ',d3.select(activeNode).attr('class').indexOf('node-TestSuite')!==-1);
	if(activeNode!=undefined && d3.select(activeNode).attr('class').indexOf('node-TestSuite')!==-1){
			openDialog('Suite to Execute','Suite locked for execution');
			console.log('activeNode: ',activeNode)
			globalobj['lockedSuite'] = activeNode;
		}
		else
			openDialog('Error','Please select a Suite');
	};
	var buildExecutionGraph = function(){
		d3.selectAll(".link-nG").classed('allow-disp',false);
		//console.log('Hi');
		d3.selectAll(".node-nG").classed('no-disp',true).classed('node-nG-dimmed',false);
		d3.select(globalobj['lockedSuite']).classed('no-disp',false);
		d3.select('#actionImg_full').classed('sfhen',true);
		$(globalobj['lockedSuite']).trigger('click');
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

		var lockedSuiteObj=d3.select(globalobj['lockedSuite']).datum();
		console.log("lockedSuite:",globalobj['lockedSuite'])
		console.log("Idx:::",d3.select(globalobj['lockedSuite']).data()[0].idx)

	};

	var createExecutionJson = function(){
	globalobj['jsondata'] = [];
	var jsondata11 = [{
    	"suiteDetails": [],
    	"testsuitename": "",
    	"testsuiteid": "",
    	"browserType": ["1"],
		"NG":"true"
		}]
	var lockedSuiteObj=d3.select(globalobj['lockedSuite']).data();
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
	console.log('\n\n------------json data 11------------\n\n',JSON.stringify(jsondata11));
	return jsondata11;
	}


	$scope.execute = function(browserNum){
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
			$rootScope.redirectPage();
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

			console.log('DATAAAAAAAA::: ',data)
			for (a in data.TCS){
						if(data.TCS[a]=='Fail' || data.TCS[a]=='fail')
							globalobj['failed_tc_list'].push(b)
			}
			console.log("%%%%Failed tc list%%%\n",globalobj['failed_tc_list'])			
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
	// 		if(data.err && data.ecode=="INVALID_SESSION") $rootScope.redirectPage(); 
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

	var getReportData1 = function() {
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
	// 				$rootScope.redirectPage();
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
					$rootScope.redirectPage();
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
	
}]);