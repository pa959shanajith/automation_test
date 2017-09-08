mySPA.controller('neuronGraphs2DController', ['$scope', '$http', '$location', '$timeout', 'neuronGraphs2DService','cfpLoadingBar','$window', function($scope,$http,$location,$timeout,neuronGraphs2DService,cfpLoadingBar,$window) {
    //$("head").append('<link id="mindmapCSS1" rel="stylesheet" type="text/css" href="css/css_mindmap/style.css" /><link id="mindmapCSS2" rel="stylesheet" type="text/css" href="fonts/font-awesome_mindmap/css/font-awesome.min.css" />')
    $("head").append('<link id="nGraphsCSS" rel="stylesheet" type="text/css" href="css/nGraphs.css" />')
	if(window.localStorage['navigateScreen'] != "neuronGraphs2D") window.location.href = "/";
	var PI=Math.PI;
	var fCos=Math.cos;
	var fAcos=Math.acos;
	var fSin=Math.sin;
	var fAsin=Math.asin;
	var nodeTypes,nodeColor,rootIndex,mapN2DCoords;

	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear();
	}, 500);

	//Select Browser Function
	$(document).on("click", ".selectBrowser", function(){
		//$(".selectBrowser").find("img").removeClass("sb");
		$(this).find("img").toggleClass("sb")
	})

	$scope.assignTab = function(option){
		$scope.tab = option;
	}

	$scope.loadNGraphs = function(e){
		if($("#ct-expand-left").hasClass('ct-rev'))
			$("#ct-expand-left").trigger("click");
		if($("#ct-expand-right").hasClass('ct-rev'))
			$("#ct-expand-right").trigger("click");

		var blockMsg = 'Please Wait while graphs are being fetched...';
		blockUI(blockMsg);
		loadGraphData()
	}

	/*Sidebar-toggle*/
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
	/*Sidebar-toggle*/

	function loadGraphData(){
		if(window.localStorage['_UI']){
			var userInfo =  JSON.parse(window.localStorage['_UI']);
			var userid = userInfo.user_id;
			neuronGraphs2DService.getGraphData(userid).then(function(data){
				if (data.nodes.length==0){
					unblockUI();
					blockUI('No Graphs Found. Try Again Later!');
					$timeout(function(){unblockUI();},2000);
					return false;
				}
				nodeTypes=data.type;
				nodeColor=data.color;
				rootIndex=data.root;
				mapN2DCoords=data.coords2D;
				console.log(data.coords2D);
				$scope.nodes=$scope.bindData(data.nodes,data.links);
				$scope.setPositionsSemi3D($scope.nodes,rootIndex);
				unblockUI();
				console.log($scope.nodes);
				nginit($scope.nodes,data.links);animate();
			},function(error){
				console.log("Error:::::::::::::", error)
			});
		}
		$("#ct-canvas").show();
	}

	$scope.bindData = function(no,lo){
		m=JSON.parse(JSON.stringify(no));
		m.forEach(function(n){
			n.children=[];
			n.parent=[];
		});
		lo.forEach(function(l){
			var s=l.start;
			var t=l.end;
			if(m[s].children.indexOf(m[t])==-1)
				m[s].children.push(m[t]);
			if(m[t].parent.indexOf(m[s])==-1)
				m[t].parent.push(m[s]);
		});
		return m;
	};

	$scope.cleanCyclicData = function(no){
		no.forEach(function(n){
			if (n.children) delete n.children;
			if (n.parent) delete n.parent;
		});
		return no;
	};

	/*---------------UI Logic Starts Here---------------*/
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
		console.log(d);
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

	$scope.setPositionsSemi3D = function(data,iRoot){
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
					s2cR=Math.floor(Math.sqrt(4*s2R*s2R/np)/*HERE*/);
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
								$scope.setPositionsSemi2D(data[cyc.idx],cytfi,cyCord_2d,s3R);
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

	$scope.setPositionsSemi2D = function(cyc,cytfi,cyCord_2d,s3R){
		var setRecPos2D = function(nObj,lvl){
			var tcoord;
			if(nObj.children){
				nObj.children.forEach(function(ch,chi){
					tcoord=map2dTo3D(cytfi,getRand2DCoords(cyCord_2d[2],lvl),s3R)[0];
					//console.log(tcoord);
					ch.x=tcoord[0];
					ch.y=tcoord[1];
					ch.z=tcoord[2];
					setRecPos2D(ch,lvl+1)
				});
			}
		};
		setRecPos2D(cyc,0);
	};

	/*---------------UI Logic Ends Here---------------*/

	var camera,scene,renderer;
	var controls;
	var root;
	var objects=[];
	var tmpVec1=new THREE.Vector3();
	var tmpVec2=new THREE.Vector3();
	var tmpVec3=new THREE.Vector3();
	var tmpVec4=new THREE.Vector3();
	var visualizationType=2;
	var nodeImgDataURL={};
	var baseSprite=document.createElement('img');

	function nginit(n,l){
		//camera=new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,1,5000);
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
		baseSprite.onload=function(){
			loadGraphData_EXP(n,l);
		};
		baseSprite.src='imgs/ngr-node.png';
		window.addEventListener('resize',onWindowResize,false);
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
		requestAnimationFrame(animate);
		controls.update();
		var time=Date.now()*0.0004;
		//root.rotation.x = time;
		//root.rotation.y = time * 0.7;
		render();
	}

	function showAtoms(){
		var i,o;
		for(i=0;i<objects.length;i++){
			o=objects[i];
			if(o instanceof THREE.CSS3DSprite){
				o.element.style.display="";
				o.visible=true;
			}
			else{
				o.element.style.display="none";
				o.visible=false;
			}
		}
	}

	function showBonds(){
		var i,o;
		for(i=0;i<objects.length;i++){
			o=objects[i];
			if(o instanceof THREE.CSS3DSprite){
				o.element.style.display="none";
				o.visible=false;
			}
			else{
				o.element.style.display="";
				o.element.style.height=o.userData.bondLengthFull;
				o.visible=true;
			}
		}
	}

	function showAtomsBonds(){
		var i,o;
		for(i=0;i<objects.length;i++){
			o=objects[i];
			o.element.style.display="";
			o.visible=true;
			if(!(o instanceof THREE.CSS3DSprite)) o.element.style.height=o.userData.bondLengthShort;
		}
	}

	function getNodeImgDataURL(img){
		var i,hex,r,g,b,durl,w,h,c,ctx,k,x,y,dImg,m;
		var dMap={},a=1;
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
			for(y=0;y<h;y++){
				for(x=0;x<w;x++){
					k=(y*w+x)*4;
					m[k]*=r;
					m[k+1]*=g;
					m[k+2]*=b;
					m[k+3]*=a;
				}
			}
			ctx.putImageData(dImg,0,0);
			durl=c.toDataURL();
			dMap[i]=durl;
		}
		return dMap;
	}

	function loadGraphData_EXP(nodes,links){
		var i,o
		for(i=0;i<objects.length;i++){
			o=objects[i];
			o.parent.remove(o);
		}
		objects=[];
		nodeImgDataURL=getNodeImgDataURL(baseSprite);
		var coords3D=new THREE.Vector3();
		var i,nImg;
		nodes.forEach(function(e){
			coords3D.x=e.x;
			coords3D.y=e.y;
			coords3D.z=e.z;
			nImg=document.createElement('img');
			nImg.src=nodeImgDataURL[e.type];
			o=new THREE.CSS3DSprite(nImg);
			o.position.copy(coords3D);
			o.position.multiplyScalar(50);
			o.matrixAutoUpdate = false;
			o.updateMatrix();
			root.add(o);
			objects.push(o);
		});
		var start=new THREE.Vector3();
		var end=new THREE.Vector3();
		var lo,lLen,rads,oM,joint,axis;
		/*links.forEach(function(e){
			start.x=nodes[e.start].x;
			start.y=nodes[e.start].y;
			start.z=nodes[e.start].z;
			end.x=nodes[e.end].x;
			end.y=nodes[e.end].y;
			end.z=nodes[e.end].z;
			start.multiplyScalar(50);
			end.multiplyScalar(50);
			tmpVec1.subVectors(end,start);
			lLen=tmpVec1.length()-50;
			lo=document.createElement('div');
			lo.className = "link-nG";
			lo.style.height = lLen + "px";
			o = new THREE.CSS3DObject( lo );
			o.position.copy( start );
			o.position.lerp( end, 0.5 );
			o.userData.bondLengthShort = lLen + "px";
			o.userData.bondLengthFull = ( lLen + 55 ) + "px";
			axis = tmpVec2.set( 0, 1, 0 ).cross( tmpVec1 );
			rads = Math.acos( tmpVec3.set( 0, 1, 0 ).dot( tmpVec4.copy( tmpVec1 ).normalize() ) );
			oM = new THREE.Matrix4().makeRotationAxis( axis.normalize(), rads );
			o.matrix = oM;
			o.rotation.setFromRotationMatrix( o.matrix, o.rotation.order );
			o.matrixAutoUpdate = false;
			o.updateMatrix();
			root.add( o );
			objects.push( o );
			lo = document.createElement( 'div' );
			lo.className = "link-nG";
			lo.style.height = lLen + "px";
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
			o.userData.bondLengthShort = lLen + "px";
			o.userData.bondLengthFull = ( lLen + 55 ) + "px";
			o.userData.joint = joint;
			joint.add( o );
			root.add( joint );
			objects.push( o );
		});
		*/
		switch ( visualizationType ) {
			case 0: showAtoms(); break;
			case 1: showBonds(); break;
			case 2: showAtomsBonds(); break;
		}
		render();
	}
}]);