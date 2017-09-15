mySPA.controller('neuronGraphs2DController', ['$scope', '$http', '$location', '$timeout', 'neuronGraphs2DService','cfpLoadingBar','$window', function($scope,$http,$location,$timeout,neuronGraphs2DService,cfpLoadingBar,$window) {
    $("head").append('<link id="nGraphsCSS" rel="stylesheet" type="text/css" href="css/nGraphs.css" />')
	if(window.localStorage['navigateScreen'] != "neuronGraphs2D") window.location.href = "/";
	var nodeColor={"Domain":"#111111","Project":"#744730","Release":"#ffa448","Cycle":"#28d05a","TestSuite":"#be0e16","TestScenario":"#a448a4","TestCase":"#005580","Screen":"#3d3d29"};
	var nodeTypes,rootIndex,mapN2DCoords,enabledFilters,visibleNodeNames;
	var nodeIdDict={};
	var PI=Math.PI, fCos=Math.cos, fAcos=Math.acos, fSin=Math.sin, fAsin=Math.asin;

	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear();
	}, 500);

	//Select Browser Function
	/*$(document).on("click", ".selectBrowser", function(){
		//$(".selectBrowser").find("img").removeClass("sb");
		$(this).find("img").toggleClass("sb")
	});*/

	$scope.assignTab = function(option){
		$scope.tab = option;
		$('.selectedIcon').removeClass('selectedIcon');
		if($scope.tab=='viewTab') $('#viewImg').addClass('selectedIcon');
		else if($scope.tab=='actionTab') $('#actionImg').addClass('selectedIcon');
	}

	$scope.loadNGraphs = function(e){
		if($("#ct-expand-left").hasClass('ct-rev'))
			$("#ct-expand-left").trigger("click");
		if($("#ct-expand-right").hasClass('ct-rev'))
			$("#ct-expand-right").trigger("click");

		clearData();
		blockUI('Please wait while graphs are being fetched...');
		addLegends();
		loadGraphData();
	}

	var addLegends = function(){
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

	var clearData = function(){
		delete $scope.nodes;
		delete $scope.fetchedData;
		delete $scope.objects;
		$scope.objects=[];
	};

	/*---------------Sidebar Toggle Starts Here---------------*/
	$(".lsSlide,.rsSlide").show();
	$("#ct-expand-left").click(function(e){
		if($("#ct-expand-left").hasClass("ct-rev")) $(".lsSlide").hide();
		else $(".lsSlide").show();
		$("#ct-expand-left").toggleClass("ct-rev");
		$("#ct-main").toggleClass("leftBarOpen");
	});

	$("#ct-expand-right").click(function(e){
		if($("#ct-expand-right").hasClass("ct-rev")) $(".rsSlide").hide();
		else $(".rsSlide").show();
		$("#ct-expand-right").toggleClass("ct-rev")
		$("#ct-main").toggleClass("rightBarOpen");
	});
	/*---------------Sidebar Toggle Ends Here---------------*/

	/*---------------Filter Objects Start Here---------------*/
	$(document).on("click", ".filterObjects", function(){
		enabledFilters=[];
		$('.popupContent-filter-active').each(function(){
			enabledFilters.push($(this).data('tag'));
		});
		applyFilters(1);
	});

	$("#selectAllFilters span.selectAllTxt").on("click", function(){applyFilters(0);});
	$("#selectAllFilters input.checkStyleboxFilter").on("click", function(){applyFilters(0);});

	var applyFilters = function(k){
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
		visibleNodeNames=[];
		d3.selectAll('.node-nG').each(function(d){if(!(d3.select(this).classed('no-disp'))) visibleNodeNames.push([d.idx,d.name]);});
		$('#popupSearchResult').empty();
		$timeout(function(){$(".searchInputNodes").val('').focus();},5);
	});

	$(".searchInputNodes").on('keyup',function(e){
		e=e||window.event;
		var searchKey=$(this).val().toLowerCase();
		var searchResults='';
		visibleNodeNames.forEach(function(o){if(o[1].toLowerCase().indexOf(searchKey)>-1) searchResults+="<span class='searchNodeItem' data-lindex="+o[0]+">"+o[1]+"</span>";});
		$('#popupSearchResult').html(searchResults);
	});

	$(document).on("click", ".searchNodeItem", function(e){
		$("#node-"+$scope.nodes[$(this).data("lindex")].id).trigger("click");
	});
	/*---------------Search Node Ends Here---------------*/

	/*---------------Data Processing Logic Starts Here---------------*/

	var loadGraphData = function(){
		if(window.localStorage['_UI']){
			var userInfo =  JSON.parse(window.localStorage['_UI']);
			var userid = userInfo.user_id;
			neuronGraphs2DService.getGraphData(userid).then(function(data){
				if(data.err){
					unblockUI();
					blockUI(data.msg);
					$timeout(function(){unblockUI();},3000);
					console.error(data.ecode);
					return false;
				}
				$("#ct-canvas").show();
				$scope.fetchedData=data;
				nodeTypes=data.type;
				rootIndex=data.root;
				mapN2DCoords=data.coords2D;
				$scope.nodes=bindData(data.nodes,data.links);
				setPositionsSemi3D($scope.nodes,rootIndex);
				unblockUI();
				//console.log($scope.nodes);
				nginit($scope.nodes,data.links);animate();
			},function(error){
				unblockUI();
				console.error("Error:::::::::::::", error)
			});
		}
	}

	var bindData = function(no,lo){
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

	var getThetaFi = function(c,r){
		var theta;
		var fi=fAcos(c[2]/r);
		var cost=c[0]/(r*fSin(fi));
		var sint=c[1]/(r*fSin(fi));
		if(cost<0) theta=PI-fAsin(sint);
		else theta=fAsin(sint)+PI*2;
		if(theta>=2*PI)theta-=2*PI;
		return [theta,fi];
	};

	var getGeoCoords = function(r,tf){
		coords3d=[r*fCos(tf[0])*fSin(tf[1]),r*fSin(tf[0])*fSin(tf[1]),r*fCos(tf[1])];
		return coords3d;
	};

	var map2dTo3D = function(thetafi,coords2d,r){
		var theta,fi,coords3d=[];
		coords2d.forEach(function(e){
			theta=thetafi[0]+e[0]/r;
			fi=thetafi[1]+e[1]/r;
			coords3d.push([r*fCos(theta)*fSin(fi),r*fSin(theta)*fSin(fi),r*fCos(fi)]);
		});
		return coords3d;
	};

	var setPositionsSemi3D = function(data,iRoot){
		var rObj,np,pCord,nr,rCord,rc_c,rtfi,rCord_2d,ncy,cyCord,cyc_c,cytfi,cyCord_2d,tmp;
		var s1R=5,s2R=30,s3R=150,s2cR,s3cR;
		rObj=data[iRoot];
		rObj.x=0;rObj.y=0;rObj.z=0;
		if(rObj.children){
			np=rObj.children.length;
			pCord=getN3DCoords(np,s1R);
			rObj.children.forEach(function(prj,prjix){
				prj.x=pCord[prjix][0];
				prj.y=pCord[prjix][1];
				prj.z=pCord[prjix][2];
				rtfi=getThetaFi(pCord[prjix],s1R);
				rc_c=[s2R*prj.x/s1R,s2R*prj.y/s1R,s2R*prj.z/s1R];
				if(prj.children){
					nr=prj.children.length;
					s2cR=Math.floor(Math.sqrt(4*s2R*s2R/np)/1);
					rCord_2d=getN2DCoords(nr,s2cR);
					rCord=map2dTo3D(rtfi,rCord_2d[0],s2R);
					prj.children.forEach(function(rel,relix){
						rel.x=rCord[relix][0];
						rel.y=rCord[relix][1];
						rel.z=rCord[relix][2];
						cytfi=getThetaFi(rCord[relix],s2R);
						cyc_c=[s3R*rel.x/s2R,s3R*rel.y/s2R,s3R*rel.z/s2R];
						tmp=s3R/s2R;
						if(rel.children){
							ncy=rel.children.length;
							s3cR=rCord_2d[2]*tmp;
							cyCord_2d=getN2DCoords(ncy,s3cR);
							cyCord=map2dTo3D(cytfi,cyCord_2d[0],s3R);
							rel.children.forEach(function(cyc,cycix){
								cyc.x=cyCord[cycix][0];
								cyc.y=cyCord[cycix][1];
								cyc.z=cyCord[cycix][2];
								setPositionsSemi2D(data[cyc.idx],cytfi,cyCord_2d,s3R);
							});
						}
					});
				}
			});
		}
	};

	var getRand2DCoords = function(r,s){
		var coordsList=[];
		var t=Math.random()*2*PI;
		var l=(Math.random()+s)*r/3;
		coordsList=[l*fCos(t),l*fSin(t)];
		return [coordsList];
	};

	var setPositionsSemi2D = function(cyc,cytfi,cyCord_2d,s3R){
		var setRecPos2D = function(nObj,lvl){
			var tcoord;
			if(nObj.children){
				nObj.children.forEach(function(ch,chi){
					tcoord=map2dTo3D(cytfi,getRand2DCoords(cyCord_2d[2],lvl),s3R)[0];
					ch.x=tcoord[0];
					ch.y=tcoord[1];
					ch.z=tcoord[2];
					setRecPos2D(ch,lvl+1)
				});
			}
		};
		setRecPos2D(cyc,0);
	};
	/*---------------Positioning Logic Ends Here---------------*/

	/*---------------UI Logic Starts Here---------------*/
	var camera,scene,renderer,controls,root,activeNode;
	var tmpVec1=new THREE.Vector3();
	var tmpVec2=new THREE.Vector3();
	var tmpVec3=new THREE.Vector3();
	var tmpVec4=new THREE.Vector3();
	var nodeImgDataURL={};
	var baseSprite=document.createElement('img');

	var nginit = function(n,l){
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
		baseSprite.onload=function(){drawGraph(n,l);};
		baseSprite.src='imgs/ngr-node.png';
		window.addEventListener('resize',onWindowResize,false);
	};

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

	var drawGraph = function(nodes,links){
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
			//if(e.type=='Project'||e.type=='Domain'||e.type=='Release'||e.type=='Cycle'){
			coords3D.x=e.x;
			coords3D.y=e.y;
			coords3D.z=e.z;
			nImg=document.createElement('img');
			d3.select(nImg).datum(e).attr('id','node-'+e.id).attr('class','node-nG node-'+e.type).on('click',nodeClick);
			nImg.src=nodeImgDataURL[e.type];
			o=new THREE.CSS3DSprite(nImg);
			o.position.copy(coords3D);
			o.position.multiplyScalar(50);
			o.matrixAutoUpdate = false;
			o.updateMatrix();
			root.add(o);
			$scope.objects.push(o);
			//}
		});
		var start=new THREE.Vector3();
		var end=new THREE.Vector3();
		var lo,lLen,rads,oM,joint,axis,st,en;
		links.forEach(function(e,i){
			st=nodeIdDict[e.start];
			en=nodeIdDict[e.end];
			start.x=nodes[st].x;
			start.y=nodes[st].y;
			start.z=nodes[st].z;
			end.x=nodes[en].x;
			end.y=nodes[en].y;
			end.z=nodes[en].z;
			start.multiplyScalar(50);
			end.multiplyScalar(50);
			tmpVec1.subVectors(end,start);
			lLen=tmpVec1.length()-50;
			lo=document.createElement('div');
			d3.select(lo).datum(e).attr('id','link-1-'+i).attr('class','link-nG').style('height',lLen+'px');
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
			d3.select(lo).datum(e).attr('id','link-2-'+i).attr('class','link-nG').style('height',lLen+'px');
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
		var disp=d3.select(el).style('display');
		if (disp.toLowerCase()=='none') return false;
		else return true;
	};

	var nodeClick = function(e){
		if (activeNode==this) clearHighlightNodes();
		else{
			activeNode=this;
			var d=d3.select(this).datum();
			highlightNodes(d);
			addInfo(d);
		}
	};

	var addInfo = function(d){
		attrArr="<strong>Group:</strong> "+d.type;
		for (attrs in d.attributes){ attrArr+= "<br><strong>"+attrs+":</strong> "+d.attributes[attrs]; }
		d3.select('#window-pi p.proj-info-wrap').html(attrArr);
	};

	var highlightNodes = function(d){
		if(!isDisplayed("#node-"+d.id)){
			clearHighlightNodes();
			return;
		}
		var neighborArray = [d.id];
		d3.selectAll(".link-nG").each(function(p) {
			//if(nodeIdDict[p.start]==d.idx || nodeIdDict[p.end]==d.idx){
			if((nodeIdDict[p.start]==d.idx && isDisplayed("#node-"+p.end)) || (nodeIdDict[p.end]==d.idx && isDisplayed("#node-"+p.start))){
				if (neighborArray.indexOf(p.start) == -1) neighborArray.push(p.start);
				if (neighborArray.indexOf(p.end) == -1) neighborArray.push(p.end);
				d3.select(this).classed('allow-disp',true);
			}
			else d3.select(this).classed('allow-disp',false);
		});
		d3.selectAll(".node-nG").each(function(p) {
			if (neighborArray.indexOf(p.id) > -1) d3.select(this).classed('node-nG-dimmed',false);
			else d3.select(this).classed('node-nG-dimmed',true);
		});
	};

	var clearHighlightNodes = function(){
		activeNode=undefined;
		$('.link-nG.allow-disp').removeClass('allow-disp');
		$('.node-nG.node-nG-dimmed').removeClass('node-nG-dimmed');
		$('#window-pi p.proj-info-wrap').empty();
	};

	/*---------------UI Logic Ends Here---------------*/
}]);