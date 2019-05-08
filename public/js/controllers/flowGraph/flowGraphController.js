mySPA.controller('flowGraphController', ['$scope','$rootScope', '$http', '$location', '$timeout', 'flowGraphServices','cfpLoadingBar','$window', 'socket', function($scope,$rootScope,$http,$location,$timeout,flowGraphServices,cfpLoadingBar,$window,socket) {
	 $timeout(function() {
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
		cfpLoadingBar.complete();
	  }, 500);
	  
	 loadUserTasks(); 
	
	 $scope.enableGenerate = false;
	 $scope.ComplexityScreenView = false;
	 $scope.wmcList=[];
	 var version, path = null;
	 $scope.ClassDiagramView = false;
	 
	 if(window.localStorage['navigateScreen'] != "p_APG"){
		window.location.href = "/";
	 }
	 localStorage.setItem("navigateEnable", true);
	 
	 $scope.expandSidebars = function(){
		$("#middle-content-section").css({
			left: '173px',
			width: 'calc(100% - 270px)'
		});
		$("#page-taskName span").css({
			left: '0px'
		});	
		
		$("#ct-lSide").animate({left: '0px'}, 300, function(){
			$("#ct-expand-left-apg").addClass('ct-rev');
		});
		$("#ct-rSide").animate({right: '0px'}, 300, function(){
			$("#ct-expand-right-apg").addClass('ct-rev');
		}); 
	 }
	 $scope.collapseSidebars = function(){
		$("#ct-lSide").animate({left: '-160px'}, 300, function(){
			$("#ct-expand-left-apg").removeClass('ct-rev');
		});
		$("#ct-rSide").animate({right: '-85px'}, 300, function(){
			$("#ct-expand-right-apg").removeClass('ct-rev');
		});
		$("#middle-content-section").animate({
			left: '0px',
			width: '100%'
		});
	}
	 
	$scope.showFlowGraphHome = function($event){

		//Transaction Activity for ShowFlowGraphHome Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['ShowFlowGraphHome']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);

		$scope.enableDataflow = false;
		$(".projectInfoWrap").empty();
		if (!$scope.enableGenerate)
			return;
		if($("#complexity-canvas").is(':visible')){
			$scope.enableToggleSidebars = true;
			$('#complexity-canvas').hide();
			//$scope.enableFilter = true;
			$("#apg-cd-canvas").show();
			$scope.collapseSidebars();
			$scope.ClassDiagramView = true;
		}else if($("#apg-cd-canvas").is(':visible')){
			//$scope.enableFilter = false;
			$scope.enableToggleSidebars = false;
			$("#apg-cd-canvas").hide();
			var myNode = document.getElementById("apg-cd-canvas");
			$scope.expandSidebars();

			while (myNode.firstChild) {
				myNode.removeChild(myNode.firstChild);
			}
			$('#middle-content-section').removeAttr('class');
			document.getElementById('path').value = '';
			$scope.obj = {};
			$scope.hideBaseContent = { message: 'false' };
			$scope.ClassDiagramView = false;
			$('#generateBtn').prop('disabled', true);
		}else if($("#apg-dfd-canvas").is(':visible')){
			$scope.enableToggleSidebars = true;
			//$scope.enableFilter = true;
			$("#apg-dfd-canvas").hide();
			$("#apg-cd-canvas").show();
			$scope.collapseSidebars();
			$('#page-taskName span').animate({
				left : '0px'
			});
			$scope.ClassDiagramView = true;
		}
		$scope.ComplexityScreenView = false;
}
	$scope.toggleLeftSidebar = function(){
		if($("#ct-expand-left-apg").hasClass('ct-rev')){
			$("#ct-lSide").animate({left: '-160px'}, 300, function(){
				$("#ct-expand-left-apg").removeClass('ct-rev');
			});
			$("#page-taskName span").animate({
				left: '0px'
			});
		}else{	
			$("#ct-lSide").animate({left: '0px'}, 300, function(){
				$("#ct-expand-left-apg").addClass('ct-rev');
			});
			$("#page-taskName span").animate({
				left: '173px'
			});		
		}
	}
	$scope.toggleRightSidebar = function(){
		if(!$("#ct-expand-right-apg").hasClass('ct-rev')){
			$("#ct-rSide").animate({right: '0px'}, 300, function(){
				$("#ct-expand-right-apg").addClass('ct-rev');
			});
		}else{
			$("#ct-rSide").animate({right: '-85px'}, 300, function(){
				$("#ct-expand-right-apg").removeClass('ct-rev');
			});
		}
	}
	  socket.on('ICEnotAvailable', function () {
		var slider = document.getElementById("slider-container");
		slider.remove();
		$('#progress-canvas').fadeOut(800, function(){
			$scope.hideBaseContent = { message: 'false' };
			$scope.$apply();
		});
		document.getElementById('path').value = '';
		openDialog("APG", $rootScope.unavailableLocalServer_msg);
	});
	  
	$scope.disableButton = function($event){
		if($event.originalEvent.srcElement.alt == 'Data-flow'){
			if(!$scope.enableDataflow ){
				$event.preventDefault();
				$event.stopPropagation();
				//$(".popupWrap").animate({ opacity: 0, right: "70px" }, 100).css({'z-index':'0','pointer-events':'none'})
				//$(".thumb-ic").removeClass("thumb-ic-highlight");
				/*if($("#data-flow-window").is(':visible')){\
					S("#data-flow-window").hide();
				}*/
			}
		}
		/*else if($event.originalEvent.srcElement.alt == 'Filter Objects'){
			if(!$scope.enableFilter){
				$event.preventDefault();
				$event.stopPropagation();
			}
		}*/
	}
	  
	$scope.executeGenerate = function($event){
		
		//Transaction Activity for Generate Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['Generate']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		localStorage.setItem("navigateEnable", false);
		$('#tasks_div').addClass('disableActions');
		$scope.obj = {};
		$scope.enableGenerate = false;
		currentDot = 0;
		classes = [];
		for( var k = 1 ; k <  $('#progress-canvas').children().length; ){
			var child = document.getElementById('progress-canvas').children[k];
			child.parentNode.removeChild(child);
		}
		$scope.hideBaseContent = { message: 'true' };
		// Display the progress canvas after clearing all dots.
		$('#progress-canvas').fadeIn();
		
		// socket connection ....
		var userName=JSON.parse(window.localStorage['_UI']).username;
		var param={check:true,username:userName};
		var socketUI = io('', { forceNew: true, reconnect: true, query: param});
		
		version = document.getElementById("version").value;
		path = document.getElementById("path").value;
		$rootScope.resetSession.start();
		flowGraphServices.getResults(version,path).then(function(data) {
			$rootScope.resetSession.end();
			if (data == "unavailableLocalServer") {
				$scope.hideBaseContent = { message: 'false' };
				$('#progress-canvas').hide();
				document.getElementById('path').value = '';
				$('#generateBtn').prop('disabled', true);
				openDialog("APG", $rootScope.unavailableLocalServer_msg);
				return false;
			} else if(data == "Invalid Session"){
				document.getElementById('path').value = '';
				return $rootScope.redirectPage();
			}
		}, function(err){
			$rootScope.resetSession.end();
			openDialog("APG", "Failed to generate graph.");
			console.log("Error :", err);
		});
		
		socketUI.on('newdata', function(obj){
			$scope.addClass(obj);
			$scope.$apply();
			classes.push(obj);
		});

		socketUI.on('endData', function(obj) {
			localStorage.setItem("navigateEnable", true);
			$('#tasks_div').removeClass('disableActions');
			if(obj.result == "success"){
				$('#progress-canvas').fadeOut(800, function(){
					$scope.hideBaseContent = { message: 'true' };
					$scope.$apply();
				});
				$scope.collapseSidebars();
				$scope.generateClassDiagram(obj);
				$scope.enableGenerate = true;
				$scope.ClassDiagramView = true;
				//$scope.createAPGProject(obj);
			} else if(obj.result == "fail" || obj.result == "invalidPath") {
				$scope.hideBaseContent = { message: 'false' };
				$('#progress-canvas').hide();
				document.getElementById('path').value = '';
				$('#generateBtn').prop('disabled', true);
				if (obj.result == "invalidPath")  openDialog("APG", "The given path does not exists.");
				else  openDialog("APG", "Failed to generate graph.");
			}
			socketUI.disconnect('', { query: "check=true" });
		});

		var canv =   d3.select("#progress-canvas").append('svg').attr('id','legend-box');
		var u = canv.append('g').attr("transform", "translate(10,10)");	
		var legends=[{text:'Public'},{text:'Private'},{text:'Protected'},{text:'Default'},{text:'Abstract'}];
		legends.forEach(function(e,i) {
			t=u.append('g');
			if(e.text == "Public"){
				var offset = i*90+10;
				t.append("rect")
				.style('fill', '#18b6df')
				.attr('x',offset)
				.attr('y', -6)
				.attr('width', '15px')
				.attr('height', '15px')
				.attr('rx',3)
				.attr('ry', 3)
				t.append('text')
				 .attr('x',offset+3)
				 .attr('y',4.5)
				 .attr('fill','#ffffff')
				 .text('+')
				t.append('text')
				.attr('class','classLabel')
				.attr('x',offset+25)
				.attr('y',3)
				.text(e.text);
			}else if(e.text == "Private"){
				var offset = i*90+50;
				t.append("rect")
				.style('fill', '#18b6df')
				.attr('x',offset)
				.attr('y', -6)
				.attr('width', '15px')
				.attr('height', '15px')
				.attr('rx',3)
				.attr('ry', 3)
				t.append('text')
				 .attr('x',offset+4)
				 .attr('y',5)
				 .attr('fill','#ffffff')
				 .text('-')
				t.append('text')
				.attr('class','classLabel')
				.attr('x',offset+25)
				.attr('y',3)
				.text(e.text);
			}else if(e.text == "Protected"){
				var offset = i*90+90;
				t.append("rect")
				.style('fill', '#18b6df')
				.attr('x',offset)
				.attr('y', -6)
				.attr('width', '15px')
				.attr('height', '15px')
				.attr('rx',3)
				.attr('ry', 3)
				t.append('text')
				 .attr('x',offset+3)
				 .attr('y',4.5)
				 .attr('fill','#ffffff')
				 .text('#')
				t.append('text')
				.attr('class','classLabel')
				.attr('x',offset+25)
				.attr('y',3)
				.text(e.text);
			}else if(e.text == "Default"){
				var offset = i*90+130;
				t.append("rect")
				.style('fill', '#18b6df')
				.attr('x',offset)
				.attr('y', -6)
				.attr('width', '15px')
				.attr('height', '15px')
				.attr('rx',3)
				.attr('ry', 3)
				t.append('text')
				 .attr('x',offset+3)
				 .attr('y',4.5)
				 .attr('fill','#ffffff')
				 .text('~')
				t.append('text')
				.attr('class','classLabel')
				.attr('x',offset+25)
				.attr('y',3)
				.text(e.text);
			}else if(e.text == "Abstract"){
				var offset = i*90+170;
				t.append("rect")
				.style('fill', '#18b6df')
				.style('stroke', '#591e1ea8')
				.style('stroke-width',2)
				.attr('x',offset)
				.attr('y', -6)
				.attr('width', '15px')
				.attr('height', '15px')
				.attr('rx',3)
				.attr('ry', 3)
				t.append('text')
				 .attr('x',offset+4)
				 .attr('y',8.5)
				 .attr('fill','#ffffff')
				 .text('*')
				t.append('text')
				.attr('class','classLabel')
				.attr('x',offset+25)
				.attr('y',3)
				.text(e.text);
			}
		});
		if (($('#middle-content-section').width() - 700) > 0)  var x = ($('#middle-content-section').width() - 700)/2;
		else  var x = 10;
		$('#legend-box').css({
			left: x
		});
	}
	
	var dotsPosition = [
    {x : "25%", y : "25%"},
    {x : "35%", y : "75%"},
    {x : "75%", y : "35%"},
    {x : "50%", y : "20%"},
    {x : "45%", y : "40%"},
    {x : "60%", y : "65%"},
    {x : "15%", y : "20%"},
    {x : "22%", y : "50%"},
    {x : "40%", y : "65%"},
    {x : "85%", y : "25%"},
    {x : "90%", y : "75%"},
    {x : "70%", y : "45%"},
    {x : "60%", y : "30%"},
    {x : "40%", y : "80%"},
    {x : "35%", y : "25%"},
    {x : "38%", y : "40%"},
    {x : "20%", y : "85%"},
    {x : "30%", y : "55%"},
    {x : "60%", y : "78%"},
    {x : "50%", y : "50%"},
    {x : "8%", y : "8%"},
    {x : "58%", y : "46%"},
    {x : "76%", y : "64%"},
    {x : "68%", y : "20%"},
    {x : "84%", y : "49%"},
    {x : "9%", y : "70%"},
    {x : "86%", y : "89%"},
    {x : "39%", y : "12%"},
    {x : "67%", y : "69%"},
    {x : "27%", y : "44%"},
    {x : "74%", y : "12%"},
    {x : "24%", y : "70%"},
    {x : "18%", y : "50%"},
    {x : "11%", y : "39%"},
    {x : "47%", y : "64%"},
    {x : "73%", y : "81%"},
    {x : "16%", y : "66%"},
    {x : "42%", y : "27%"},
    {x : "82%", y : "77%"},
    {x : "22%", y : "6%"}
  ]
	
	$scope.addClass = function(obj){
		if(currentDot >= 40){
		  currentDot = 0;
		}
		var categoriesDict = {"public" : "+", "private" : "-", "default" : "~", "protected" : "#"};
		var x = dotsPosition[currentDot].x;
		var y = dotsPosition[currentDot].y;
		currentDot++;
		var parentElem = document.createElement("div");
		var elem = document.createElement("div");

		//could be public, private, protected or default
		var accessModifier = obj.accessModifier;	
		var borderType = obj.abstract ? "abstract" : "normal";
		//var accessModifier = "protected";
		//var borderType = "normal";
		elem.setAttribute("class", "apgSquare_" + borderType);

		parentElem.setAttribute("style", "left:"+x+"; top:"+y+"; position:absolute;");
		elem.textContent = categoriesDict[accessModifier];

		var text = document.createElement("table");
		var trow = document.createElement("tr");
		var td = document.createElement('td');
		td.appendChild(document.createTextNode(obj.name));
		trow.appendChild(td);
		text.appendChild(trow);

		trow = document.createElement("tr");
		td = document.createElement('td');
		td.appendChild(document.createTextNode(obj.classVariables.length));
		trow.appendChild(td);
		text.appendChild(trow);

		trow = document.createElement("tr");
		td = document.createElement('td');
		td.appendChild(document.createTextNode(Object.keys(obj.classMethods).length));
		trow.appendChild(td);
		text.appendChild(trow);

		text.setAttribute("class", "apg_square_hover");
		parentElem.appendChild(elem);
		parentElem.appendChild(text);
		document.getElementById("progress-canvas").appendChild(parentElem);
		text.style.visibility = "hidden";
		text.style.left = "-"+(text.offsetWidth/2)+"px";
		text.style.position="absolute";
		text.setAttribute('border',"1px");
		elem.addEventListener("mouseover", onDotMouseOver, false);
		elem.addEventListener("mouseout", onDotMouseOut, false);
		function onDotMouseOver(e){
		  e.target.nextSibling.style.visibility = "";
		}

		function onDotMouseOut(e){
		  e.target.nextSibling.style.visibility = "hidden";
		}
	}

	$scope.prepareJSON = function(obj) {
		links = obj.links;
		obj = classes;
		var class_map = {};
		var size = -1;
		var graph_json = {
			"nodes": [],
			"links": []
		};
		for (var i = 0; i < obj.length; i++) {
			size++;
			class_map[obj[i].name] = size;
		}
		for (var i = 0; i < obj.length; i++) {
			var classname = obj[i].name;
			if(obj[i].abstract == true){
				classname = "<<Abstract>>\n" + obj[i].name;
			}
			else if (obj[i].interface == true){
				classname = "<<Interface>>\n" + obj[i].name;
			}
			graph_json["nodes"].push({
				"classname": classname,
				"methods": obj[i].classMethods,
				"attributes": obj[i].classVariables,
				"id": i,
				"complexity":obj[i].complexity
			});
		}
		
		if(links.length != 0){
			for (var i=0; i < links.length; i++){
				if(class_map[links[i].source] != undefined && class_map[links[i].target] != undefined){
					var link = {
						"source": class_map[links[i].source],
						"target": class_map[links[i].target],
						"type": "association"
					};
					graph_json["links"].push(link);
				}
			}
		}
		
		for (var i=0; i<obj.length; i++){

			if (obj[i].extends != null) {
				if (class_map.hasOwnProperty(obj[i].extends)) {
					var link = {
						"source": class_map[obj[i].name],
						"target": class_map[obj[i].extends],
						"type": "extends"
					};
					graph_json["links"].push(link);
				} else {
					graph_json["nodes"].push({
						"classname": obj[i].extends,
						"methods": [],
						"attributes": [],
						"id": size + 1,
						"complexity":"undefined"
					});
					class_map[obj[i].extends] = size + 1;
					var link = {
						"source": class_map[obj[i].name],
						"target": size + 1,
						"type": "extends"
					};
					graph_json["links"].push(link);
					size++;
				}
			}
			if (obj[i].implements != null) {
				if ((obj[i].implements).indexOf(",") != -1) {
					implement_list = (obj[i].implements).split(",");
					for (var j = 0; j < implement_list.length; j++) {
						if (class_map.hasOwnProperty(implement_list[j])) {
							var link = {
								"source": class_map[obj[i].name],
								"target": class_map[implement_list[j]],
								"type": "implements"
							};
							graph_json["links"].push(link);
						} else {
							graph_json["nodes"].push({
								"classname": implement_list[j],
								"methods": [],
								"attributes": [],
								"id": size + 1,
								"complexity":"undefined"
							});
							class_map[implement_list[j]] = size + 1;
							var link = {
								"source": class_map[obj[i].name],
								"target": size + 1,
								"type": "implements"
							};
							graph_json["links"].push(link);
							size++;
						}
					}
				} else {
					if (class_map.hasOwnProperty(obj[i].implements)) {
						var link = {
							"source": class_map[obj[i].name],
							"target": class_map[obj[i].implements],
							"type": "implements"
						};
						graph_json["links"].push(link);
					} else {
						graph_json["nodes"].push({
							"classname": obj[i].implements,
							"methods": [],
							"attributes": [],
							"id": size + 1,
							"complexity":"undefined"
						});
						class_map[obj[i].implements] = size + 1;
						var link = {
							"source": class_map[obj[i].name],
							"target": size + 1,
							"type": "implements"
						};
						graph_json["links"].push(link);
						size++;
					}
				}
			}
		}
		return graph_json;
	}
	
	$scope.generateClassDiagram = function(obj){
		//$scope.enableFilter = true;
		$scope.enableToggleSidebars = true;
		$(".projectInfoWrap").empty();
		$scope.$apply();
		$("#apg-cd-canvas").show();
		let width = $("#main-content-section").width();
		let height = $("#main-content-section").height();
		let center = [width / 2, height / 2];

		var svg = d3.select('#apg-cd-canvas').append('svg')
				.attr("width", width)
				.attr("height", height);

		var inner = svg.append('g');
		var zoom = d3.behavior.zoom()
				.translate([0, 0])
				.scale(1)
				.size([900, 800])
				.scaleExtent([0.2, 8])
				.on('zoom', zoomed);

		svg.call(zoom) 
			.call(zoom.event);
			
		function zoomed() {
			inner.attr('transform', 'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')');
		}

		var nodeDrag = d3.behavior.drag()
						.on("dragstart", dragstart)
						.on("drag", dragmove);

		var edgeDrag = d3.behavior.drag()
			.on("dragstart", dragstart)
			.on('drag', function (d) {
			translateEdge(g.edge(d.v, d.w), d3.event.dx, d3.event.dy);
			$('#' + g.edge(d.v, d.w).customId).attr('d', calcPoints(d));
		});
		
		// Create a new directed graph
		var g = new dagreD3.graphlib.Graph().setGraph({});
		
		var preparedJSON = $scope.prepareJSON(obj);	
		var nodes = preparedJSON.nodes;
		var links = preparedJSON.links;
		$scope.obj = obj;
		nodes.forEach(function(node){
			g.setNode(node.id, {
				label : node.classname,
				attributes : node.attributes,
				method: node.methods	
			});
		});

		
		// Set up the edges
		links.forEach(function(link){
			if(link.type == 'extends')
				g.setEdge(link.source, link.target, { arrowhead: "hollowPoints" });
			else if(link.type == 'implements')
				g.setEdge(link.source, link.target, {arrowhead: "hollowPoints",style: "stroke-dasharray: 5, 5;"});
			else
				g.setEdge(link.source, link.target, {arrowhead: "simpleArrow" });
		});
		
		//makes the lines smooth
		g.edges().forEach(function (e) {
			var edge = g.edge(e.v, e.w);
			edge.lineInterpolate = 'basis';
		});

		function dragstart(d) {
			d3.event.sourceEvent.stopPropagation();
		}

		
		function dragmove(d) {
			var node = d3.select(this),
				selectedNode = g.node(d);
			var prevX = selectedNode.x,
				prevY = selectedNode.y;

			selectedNode.x += d3.event.dx;
			selectedNode.y += d3.event.dy;
			node.attr('transform', 'translate(' + selectedNode.x + ',' + selectedNode.y + ')');

			var dx = selectedNode.x - prevX,
				dy = selectedNode.y - prevY;

			g.edges().forEach(function (e) {
				if (e.v == d || e.w == d) {
					edge = g.edge(e.v, e.w);
					translateEdge(g.edge(e.v, e.w), dx, dy);
					$('#' + edge.customId).attr('d', calcPoints(e));
					label = $('#label_' + edge.customId);
					var xforms = label.attr('transform');
					if (xforms != "") {
						var parts  = /translate\(\s*([^\s,)]+)[ ,]?([^\s,)]+)?/.exec(xforms);
						var X = parseInt(parts[1])+dx, Y = parseInt(parts[2])+dy;
						if (isNaN(Y)) {
							Y = dy;
						}
						label.attr('transform','translate('+X+','+Y+')');
					}            
				}
			})
		}

		function translateEdge(e, dx, dy) {
			e.points.forEach(function (p) {
				p.x = p.x + dx;
				p.y = p.y + dy;
			});
		}
		
		function calcPoints(e) {
			var edge = g.edge(e.v, e.w),
				tail = g.node(e.v),
				head = g.node(e.w);
			var points = edge.points.slice(1, edge.points.length - 1);
			var afterslice = edge.points.slice(1, edge.points.length - 1)
			points.unshift(intersectRect(tail, points[0]));
			points.push(intersectRect(head, points[points.length - 1]));
			return d3.svg.line()
				.x(function (d) {
				return d.x;
			})
				.y(function (d) {
				return d.y;
			})
				.interpolate("basis")
			(points);
		}

		function intersectRect(node, point) {
			var x = node.x;
			var y = node.y;
			var dx = point.x - x;
			var dy = point.y - y;
			var w = $("#" + node.customId).attr('width') / 2;
			var h = $("#" + node.customId).attr('height') / 2;
			var sx = 0,
				sy = 0;
			if (Math.abs(dy) * w > Math.abs(dx) * h) {
				// Intersection is top or bottom of rect.
				if (dy < 0) {
					h = -h;
				}
				sx = dy === 0 ? 0 : h * dx / dy;
				sy = h;
			} else {
				// Intersection is left or right of rect.
				if (dx < 0) {
					w = -w;
				}
				sx = w;
				sy = dx === 0 ? 0 : w * dy / dx;
			}
			return {
				x: x + sx,
				y: y + sy
			};
		}

		var render = new dagreD3.render('class');
		
		render.arrows().hollowPoints = function normal(parent, id, edge, type) {
			var marker = parent.append("marker")
			.attr("id", id)
			.attr("viewBox", "0 0 10 10")
			.attr("refX", 9)
			.attr("refY", 5)
			.attr("markerUnits", "strokeWidth")
			.attr("markerWidth", 8)
			.attr("markerHeight", 6)
			.attr("orient", "auto");

			var path = marker.append("path")
			.attr("d", "M 0 0 L 10 5 L 0 10 z")
			.style("stroke-width", 1)
			.style("stroke-dasharray", "1,0")
			.style("fill", "#fff")
			.style("stroke", "#333");
			dagreD3.util.applyStyle(path, edge[type + "Style"]);
		};
		
		render.arrows().simpleArrow = function normal(parent, id, edge, type) {
			var marker = parent.append("marker")
			.attr("id", id)
			.attr("viewBox", "0 0 10 10")
			.attr("refX", 10)
			.attr("refY", 5)
			.attr("markerUnits", "strokeWidth")
			.attr("markerWidth", 10)
			.attr("markerHeight", 10)
			.attr("orient", "auto");

			var path = marker.append("path")
			.attr("d", "M10 5 0 10 0 8.7 6.8 5.5 0 5.5 0 4.5 6.8 4.5 0 1.3 0 0Z")
			.style("stroke-width", 1)
			//.style("stroke-dasharray", "1,0")
			.style("fill", "black")
			.style("stroke", "none");
			dagreD3.util.applyStyle(path, edge[type + "Style"]);
		};

		// Run the renderer. This is what draws the final graph.
		render(inner, g);
		$('.methods').click(function(e){
			console.log(d3.select(e.target).datum());
		})
		// Center the graph
		var initialScale = 0.75;
		svg.selectAll("g.node rect")
			.attr("id", function (d) {
			return "node" + d;
		});

		nodeGroup = svg.selectAll("g.nodeGroup")
		nodeGroup.on("mouseover", nodeOver)
				 .on("mouseout",nodeOut)
		nodeGroup.append('image')
			.attr('href', 'imgs/apg-info.png')
			.attr('width', '20px')
			.attr('style', 'transform: translateX(-21px)')
			.attr('class', 'apg-info-icon')
			.on('click', function(d,event){
				//$scope.enableFilter = false;
				$scope.enableToggleSidebars = false;
				$(".projectInfoWrap").empty();
				$scope.$apply();
				d = classes[d];
				$scope.expandSidebars();
				$scope.ClassDiagramView = false;
				
				//Transaction Activity for viewComplexity button Action
				// var labelArr = [];
				// var infoArr = [];
				// labelArr.push(txnHistory.codesDict['ViewComplexity']);
				// txnHistory.log(event.type,labelArr,infoArr,window.location.pathname);

				if(d == undefined || d.complexity== "Undefined"){
					openDialog('APG', "Complexity can't be determined for this class.");
				}else{
					$('#apg-cd-canvas').hide();
					$('#complexity-canvas').show();
					$scope.ccname=d.name;
					$scope.cc =d.complexity.class;
					$scope.ComplexityScreenView = true;
					$scope.filePath = d.file;
					var methods_data=d.complexity.methods;
					$scope.cmethod=methods_data.length;
					$("#tblMethodLevel tbody").empty();
					var decisionPoint;
					for(var i=0;i<methods_data.length;i++){
						decisionPoint=parseInt(methods_data[i].complexity)-1;
						decisionPoint = decisionPoint <= 0 ? "0":String(decisionPoint);
						$("#tblMethodLevel tbody").append("<tr class='highlightRow' name='"+methods_data[i].methodname+'_'+methods_data[i].line_no+"'><td><div>"+methods_data[i].methodname+"</div></td><td><div class='ccvalue'>"+methods_data[i].complexity+"</div></td><td><div>"+decisionPoint+"</div></td><td><div>"+methods_data[i].complexity
						+"</div></td><td><div id='weight_"+i+"'><span id='weightage_"+i+"'></span><span id='editWeightage_"+i+"' class='glyphicon glyphicon-pencil editWeightage'></span></div></td></tr>");
					}
					$scope.$apply();
				
					$("tbody tr:visible").on('click',function(e) {
						$scope.enableDataflow = true;
						$scope.$apply();
						$("tr.hightlight_Complexity_row").removeClass("hightlight_Complexity_row");
						$(this).addClass('hightlight_Complexity_row');
						var e = $("tr.hightlight_Complexity_row")[0];
						var method_name = (e.getAttribute('name')).split('_')[0];
						if(($scope.obj.method_calls_count).hasOwnProperty(method_name)){
							$(".projectInfoWrap").empty();
							$(".projectInfoWrap").append('<p><span>Method Calls Within Class :</span><span>' + $scope.obj.method_calls_count[method_name]['within'] + '</span></p><p><span>Method Calls Outside Class :</span><span>' + $scope.obj.method_calls_count[method_name]['outside'] + '</span></p>');
						}
						else{
							$(".projectInfoWrap").empty();
							$(".projectInfoWrap").append('<p><span>Method Calls Within Class : 0</span><span></span></p><p><span>Method Calls Outside Class : 0</span><span></span></p>');
						}
						showMethodFlow($scope.obj.data_flow, method_name, d.name);
					});

					$("[id^=editWeightage_]").on('click',function(e) {
						e.preventDefault();
						var id = e.target.id.split("_")[1];
						var previousValue=$('#weightage_'+id).text();
						$('#weightage_'+id).text('');
						$("#"+e.target.id).parent().append("<input id='txtWeightage_"+id+"' type='text' maxlength=3 value="+previousValue+">");
						$(this).hide();
						$("[id^=txtWeightage_]").on('keydown',function(event) {
							// Allow: backspace, delete, tab, escape, enter and .
							if ($.inArray(event.keyCode, [46, 8, 9, 27, 110, 190]) !== -1 ||
							  // Allow: Ctrl+A,Ctrl+C,Ctrl+V, Command+A
							  ((event.keyCode == 65 || event.keyCode == 86 || event.keyCode == 67) && (event.ctrlKey === true || event.metaKey === true)) ||
							  // Allow: home, end, left, right, down, up
							  (event.keyCode >= 35 && event.keyCode <= 40)) {
							  return;
							}
							// Ensure that it is a number and stop the keypress
							if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
							  event.preventDefault();
							}
							if(event.keyCode == "13")
							{
								var id = event.target.id.split("_")[1];
								var updatedCValue = $(this).val();
								$(this).remove();
								$('#weightage_'+id).text(updatedCValue);
								$("#editWeightage_"+id).show();
							}
						});
					});
				}
			}).append('title').text('Complexity');
		
		$scope.wmcCalculate =function(e){

			//Transaction Activity for WMCCalculate Action
			// var labelArr = [];
			// var infoArr = [];
			// labelArr.push(txnHistory.codesDict['WMCCalculate']);
			// txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
			var listWeight=$("[id^=weightage_]");
			var ccData = $(".ccvalue");
			var weightedSum = 0;
			var sum = 0;
			for(var i=0;i<listWeight.length;i++){
				sum = sum + parseInt(listWeight[i].innerText);
			}
			if(sum == 100){
				for(var i=0;i<listWeight.length;i++){
					$scope.wmcList[i] = parseInt(listWeight[i].innerText);
					weightedSum+=(parseInt(ccData[i].innerText)*($scope.wmcList[i]*0.01));
				}
				$scope.wmcc = Math.ceil(weightedSum);
				$scope.apply();
			} else{
				$("[id^=weightage_]").text('');
				openDialog('APG', "Please check the weightages given.");
			}
		}	

		nodeGroup.append('image')
			.attr('href', 'imgs/apg-check-icon.png')
			.attr('width', '20px')
			.attr('style', 'transform: translateX(-41px)')
			.attr('class', 'apg-info-icon')
			.on('click', $scope.generateDataFlowDiagram).append('title').text('Data-flow');
			
		svg.selectAll("g.edgePath path")
			.attr("id", function (e) {
			return e.v + "-" + e.w;
		});
		svg.selectAll("g.edgeLabel g")
			.attr("id", function (e) {
			return 'label_'+e.v + "-" + e.w;
		});

		g.nodes().forEach(function (v) {
			var node = g.node(v);
			node.customId = "node" + v;
		})
		g.edges().forEach(function (e) {
			var edge = g.edge(e.v, e.w);
			edge.customId = e.v + "-" + e.w
		});
		
		zoom.translate([(svg.attr('width') - g.graph().width * initialScale) / 2, 10]).scale(1).event(svg);
		if(nodes.length > 0){
			var coord= $('.nodes').children()[0].getAttribute("transform").split("(")[1].split(")")[0].split(",");
			zoom.translate([ Number(-coord[0]+width/2),  Number(-coord[1]+height/2)]).scale(1).event(svg);
		}
		
		nodeDrag.call(svg.selectAll("g.node"));
		edgeDrag.call(svg.selectAll("g.edgePath"));
		function nodeOver(d){
			this.lastChild.classList.add("apg-active");
			this.lastChild.previousSibling.classList.add("apg-active");
		}
		function nodeOut(d){
			$(".apg-info-icon").removeClass("apg-active");
		}

	}

	function openDialog(title, body) {
		$("#globalModal").find('.modal-title').text(title);
		$("#globalModal").find('.modal-body p').text(body).css('color', 'black');
		$("#globalModal").modal("show");
		setTimeout(function() {
			$("#globalModal").find('.btn-default').focus();
		}, 300);
	}

	

	$scope.generateDataFlowDiagram = function(i,$event){

		$scope.enableDataflow = false;
		$scope.ClassDiagramView = false;
		//$scope.enableFilter = false;
		$scope.enableToggleSidebars = true;
		$(".projectInfoWrap").empty();
		$scope.$apply();
		$scope.collapseSidebars();
		$('#page-taskName span').animate({
			left : '0px'
		})
		$('#apg-dfd-canvas svg').remove();
		var obj = $scope.obj;
		var links = obj.links;
		var nodes = [];
		var edges = [];

		//Transaction Activity for generateDataFlowDiagram Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['GenerateDataFlowDiagram']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);

		if(classes[i] == undefined){
			openDialog('APG', "Data flow can't be generated for this class.");
		}
		else{
			var selected_class = [classes[i].name];
			for (var k=0;k<selected_class.length;k++){
				for (var j=0; j < links.length; j++){
					if(links[j].source == selected_class[k]){
						selected_class.push(links[j].target);
					}
				}
			}
			var data_flow_classes = new Set(selected_class);
			for (var k=0; k<obj.data_flow.length; k++){
				if(data_flow_classes.has((obj.data_flow[k].class).split('(')[0])){
					if(obj.data_flow[k].text == 'Start' || obj.data_flow[k].text == 'End'){
						obj.data_flow[k].shape = "ellipse";
					}
					else if (obj.data_flow[k].shape == 'Diamond' || obj.data_flow[k].shape == 'SwitchDiamond'){
						obj.data_flow[k].shape = "diamond";
					}
					else{
						obj.data_flow[k].shape = "rect";
					}
					nodes.push(obj.data_flow[k]);
				}
			}
			var width = $("#main-content-section").width();
			var height = $("#main-content-section").height();
			$("#apg-cd-canvas").hide();
			$("#apg-dfd-canvas").show();
			
			var svg = d3.select('#apg-dfd-canvas').append('svg')
						.attr("width", width)
						.attr("height", height);
			inner = svg.append('g').attr("id", "data-flow-g");	
			var zoom = d3.behavior.zoom()
				  .translate([0, 0])
				  .scale(1)
				  .size([900, 800])
				  .scaleExtent([0.2, 8])
				  .on('zoom', zoomed);
			svg.call(zoom) 
			  .call(zoom.event);
			function zoomed() {
			  inner.attr('transform', 'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')');
			}
			var nodeDrag = d3.behavior.drag()
							.on("dragstart", dragstart)
							.on("drag", dragmove);

			var edgeDrag = d3.behavior.drag()
				.on("dragstart", dragstart)
				.on('drag', function (d) {
				translateEdge(g.edge(d.v, d.w), d3.event.dx, d3.event.dy);
				$('#' + g.edge(d.v, d.w).customId).attr('d', calcPoints(d));
			});
			var g = new dagreD3.graphlib.Graph().setGraph({});
			
			nodes.forEach(function (node) {
				g.setNode(node.id, {
					label: node.text,
					shape: node.shape
			  });
			});
			for (var i=0; i<nodes.length; i++){
				if(nodes[i].child != null){
					for (var j=0; j<nodes[i].child.length; j++){
						for (var k=0; k<obj.data_flow.length; k++){
							if(obj.data_flow[k].id == nodes[i].child[j] && data_flow_classes.has((obj.data_flow[k].class).split('(')[0])){
								if(nodes[i].shape == 'diamond' && nodes[i].child.length == 2){
									if(nodes[i].child.indexOf(nodes[i].child[j]) == 0)
										g.setEdge(nodes[i].id, nodes[i].child[j], {label: "True"});
									else
										g.setEdge(nodes[i].id, nodes[i].child[j], {label: "False"});
									break;
								}
								else{
									g.setEdge(nodes[i].id, nodes[i].child[j], {});
									break;
								}
							}
						}
					}
				}
			}
			g.nodes().forEach(function (v) {
				var node = g.node(v);
				node.rx = node.ry = 5;
			});
			g.edges().forEach(function (e) {
				var edge = g.edge(e.v, e.w);
				edge.lineInterpolate = 'basis';
			});

			function dragstart(d) {
				d3.event.sourceEvent.stopPropagation();
			}

			
			function dragmove(d) {
				var node = d3.select(this),
					selectedNode = g.node(d);
				var prevX = selectedNode.x,
					prevY = selectedNode.y;

				selectedNode.x += d3.event.dx;
				selectedNode.y += d3.event.dy;
				node.attr('transform', 'translate(' + selectedNode.x + ',' + selectedNode.y + ')');

				var dx = selectedNode.x - prevX,
					dy = selectedNode.y - prevY;

				g.edges().forEach(function (e) {
					if (e.v == d || e.w == d) {
						edge = g.edge(e.v, e.w);
						translateEdge(g.edge(e.v, e.w), dx, dy);
						$('#' + edge.customId).attr('d', calcPoints(e));
						label = $('#label_' + edge.customId);
						var xforms = label.attr('transform');
						if (xforms != "") {
							var parts  = /translate\(\s*([^\s,)]+)[ ,]?([^\s,)]+)?/.exec(xforms);
							var X = parseInt(parts[1])+dx, Y = parseInt(parts[2])+dy;
							if (isNaN(Y)) {
								Y = dy;
							}
							label.attr('transform','translate('+X+','+Y+')');
						}            
					}
				})
			}

			function translateEdge(e, dx, dy) {
				e.points.forEach(function (p) {
					p.x = p.x + dx;
					p.y = p.y + dy;
				});
			}
			function calcPoints(e) {
				var edge = g.edge(e.v, e.w),
					tail = g.node(e.v),
					head = g.node(e.w);
				var points = edge.points.slice(1, edge.points.length - 1);
				var afterslice = edge.points.slice(1, edge.points.length - 1)
				points.unshift(intersectRect(tail, points[0]));
				points.push(intersectRect(head, points[points.length - 1]));
				return d3.svg.line()
					.x(function (d) {
					return d.x;
				})
					.y(function (d) {
					return d.y;
				})
					.interpolate("basis")
				(points);
			}
			
			function intersectRect(node, point) {
				var x = node.x;
				var y = node.y;
				var dx = point.x - x;
				var dy = point.y - y;
				var w, h;
				if(node.shape == "ellipse"){
					var rx = $("#" + node.customId).attr('rx');
					var ry = $("#" + node.customId).attr('ry');
					  var cx = node.x;
					  var cy = node.y;

					  var px = cx - point.x;
					  var py = cy - point.y;

					  var det = Math.sqrt(rx * rx * py * py + ry * ry * px * px);

					  var dx = Math.abs(rx * ry * px / det);
					  if (point.x < cx) {
						dx = -dx;
					  }
					  var dy = Math.abs(rx * ry * py / det);
					  if (point.y < cy) {
						dy = -dy;
					  }

					  return {x: cx + dx, y: cy + dy};
				}
				else if(node.shape == "diamond"){
					  var x1 = node.x;
					  var y1 = node.y;
			
					  var intersections = [];
						var coords = $("#" + node.customId).attr('points').split(" ");
					w = Math.abs(coords[1].split(",")[0] - coords[3].split(",")[0])/2;
					h = Math.abs(coords[0].split(",")[1] - coords[2].split(",")[1])/2;
						polyPoints = [
							{ x:  0, y: -h  },
							{ x: -w, y:  0 },
							{ x:  0, y:  h },
							{ x:  w, y:  0 }
						  ]
						  
						  
					  var minX = Number.POSITIVE_INFINITY,
						  minY = Number.POSITIVE_INFINITY;
					  polyPoints.forEach(function(entry) {
						minX = Math.min(minX, entry.x);
						minY = Math.min(minY, entry.y);
					  });
		
					  
					  var left = x1 - w  - minX;
					  var top =  y1 - h  - minY;

					  for (var i = 0; i < polyPoints.length; i++) {
						var p1 = polyPoints[i];
						var p2 = polyPoints[i < polyPoints.length - 1 ? i + 1 : 0];
						var intersect = intersectLine(node, point,
						  {x: left + p1.x, y: top + p1.y}, {x: left + p2.x, y: top + p2.y});
						if (intersect) {
						  intersections.push(intersect);
						}
					  }
					  function intersectLine(p1, p2, q1, q2) {

						  var a1, a2, b1, b2, c1, c2;
						  var r1, r2 , r3, r4;
						  var denom, offset, num;
						  var x, y;

						  // Compute a1, b1, c1, where line joining points 1 and 2 is F(x,y) = a1 x +
						  // b1 y + c1 = 0.
						  a1 = p2.y - p1.y;
						  b1 = p1.x - p2.x;
						  c1 = (p2.x * p1.y) - (p1.x * p2.y);

						  // Compute r3 and r4.
						  r3 = ((a1 * q1.x) + (b1 * q1.y) + c1);
						  r4 = ((a1 * q2.x) + (b1 * q2.y) + c1);

						  // Check signs of r3 and r4. If both point 3 and point 4 lie on
						  // same side of line 1, the line segments do not intersect.
						  if ((r3 !== 0) && (r4 !== 0) && sameSign(r3, r4)) {
							return /*DONT_INTERSECT*/;
						  }

						  // Compute a2, b2, c2 where line joining points 3 and 4 is G(x,y) = a2 x + b2 y + c2 = 0
						  a2 = q2.y - q1.y;
						  b2 = q1.x - q2.x;
						  c2 = (q2.x * q1.y) - (q1.x * q2.y);

						  // Compute r1 and r2
						  r1 = (a2 * p1.x) + (b2 * p1.y) + c2;
						  r2 = (a2 * p2.x) + (b2 * p2.y) + c2;

						  // Check signs of r1 and r2. If both point 1 and point 2 lie
						  // on same side of second line segment, the line segments do
						  // not intersect.
						  if ((r1 !== 0) && (r2 !== 0) && (sameSign(r1, r2))) {
							return /*DONT_INTERSECT*/;
						  }

						  // Line segments intersect: compute intersection point.
						  denom = (a1 * b2) - (a2 * b1);
						  if (denom === 0) {
							return /*COLLINEAR*/;
						  }

						  offset = Math.abs(denom / 2);

						  // The denom/2 is to get rounding instead of truncating. It
						  // is added or subtracted to the numerator, depending upon the
						  // sign of the numerator.
						  num = (b1 * c2) - (b2 * c1);
						  x = (num < 0) ? ((num - offset) / denom) : ((num + offset) / denom);

						  num = (a2 * c1) - (a1 * c2);
						  y = (num < 0) ? ((num - offset) / denom) : ((num + offset) / denom);

						  return { x: x, y: y };
						}

						function sameSign(r1, r2) {
						  return r1 * r2 > 0;
						}

					  if (!intersections.length) {
						console.log("NO INTERSECTION FOUND, RETURN NODE CENTER", node);
						return node;
					  }

					  if (intersections.length > 1) {
						// More intersections, find the one nearest to edge end point
						intersections.sort(function(p, q) {
						  var pdx = p.x - point.x,
							  pdy = p.y - point.y,
							  distp = Math.sqrt(pdx * pdx + pdy * pdy),

							  qdx = q.x - point.x,
							  qdy = q.y - point.y,
							  distq = Math.sqrt(qdx * qdx + qdy * qdy);

						  return (distp < distq) ? -1 : (distp === distq ? 0 : 1);
						});
					  }
					  return intersections[0];
				}
				else{
					w = $("#" + node.customId).attr('width') / 2;
					h = $("#" + node.customId).attr('height') / 2;
				}
				
				var sx = 0,
					sy = 0;
				if (Math.abs(dy) * w > Math.abs(dx) * h) {
					// Intersection is top or bottom of rect.
					if (dy < 0) {
						h = -h;
					}
					sx = dy === 0 ? 0 : h * dx / dy;
					sy = h;
				} else {
					// Intersection is left or right of rect.
					if (dx < 0) {
						w = -w;
					}
					sx = w;
					sy = dx === 0 ? 0 : w * dy / dx;
				}
				return {
					x: parseFloat(x) + parseFloat(sx),
					y: parseFloat(y) + parseFloat(sy)
				};
			}

			var render = new dagreD3.render();
			render(inner, g);
			svg.selectAll("g.node rect")
				.attr("id", function (d) {
				return "node" + d;
			});
			svg.selectAll("g.node ellipse")
				.attr("id", function (d) {
				return "node" + d;
			});
			svg.selectAll("g.node polygon")
				.attr("id", function (d) {
				return "node" + d;
			});
			svg.selectAll("g.edgePath path")
				.attr("id", function (e) {
				return e.v + "-" + e.w;
			});
			svg.selectAll("g.edgeLabel g")
				.attr("id", function (e) {
				return 'label_'+e.v + "-" + e.w;
			});

			g.nodes().forEach(function (v) {
				var node = g.node(v);
				node.customId = "node" + v;
			})
			g.edges().forEach(function (e) {
				var edge = g.edge(e.v, e.w);
				edge.customId = e.v + "-" + e.w
			});
			var coord= $('#data-flow-g .nodes').children()[0].getAttribute("transform").split("(")[1].split(")")[0].split(",");
			zoom.translate([ Number(-coord[0]+width/2),  Number(-coord[1]+height/2)]).scale(1).event(svg);
			
			nodeDrag.call(svg.selectAll("g.node"));
			edgeDrag.call(svg.selectAll("g.edgePath"));
		}
	}

	$scope.openFileInEditor = function(e,editorName){
		//logic to open file in the editor

		//Transaction Activity for openFileInEditor Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['OpenFileInEditor']);
		// txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
		var e = $("tr.hightlight_Complexity_row")[0];
		if(e != undefined){
			var lineNumber = (e.getAttribute('name')).split('_');
			lineNumber = lineNumber[lineNumber.length - 1];
			$rootScope.resetSession.start();
			flowGraphServices.APG_OpenFileInEditor(editorName,$scope.filePath,lineNumber) .then(function(data) {
				$rootScope.resetSession.end();
				if (data == "unavailableLocalServer") {
					$scope.hideBaseContent = { message: 'false' };
					$('#progress-canvas').hide();
					document.getElementById('path').value = '';
					openDialog("APG", $rootScope.unavailableLocalServer_msg);
					return false;
				}else if(data == "Invalid Session"){
					document.getElementById('path').value = '';
					return $rootScope.redirectPage();
				}
				else if(data.status == "fail"){
					openDialog("Open File", data.message);
					return false;
				}
			}, function(err){
				$rootScope.resetSession.end();
				openDialog("Open File", "Operation Fail.");
				console.log("Error :", err);
			});
		}
		else {
			openDialog("Open File", "Please select one of the methods.");
			return false;
		}
	}

	 $scope.fullScreen = function() {
		// remove highlight from fullscreen icon
		$timeout(function(){$('#fullscr img').removeClass('thumb-ic-highlight')},500);
		// for two canvas - pass the id of the canvas to be full-screened    
		var elemId = $("#apg-cd-canvas").is(':visible') ? "#apg-cd-canvas" : "#apg-dfd-canvas";
        var elt = document.querySelector(elemId);
		$(elemId).css({
			width : '100%',
			height: '100%'
		});
		setTimeout(function(){
			$(elemId+" svg").attr({
				height : $(elemId).innerHeight()
			});
		},200);
		
        if ((window.fullScreen) || (window.innerWidth == screen.width && (screen.height - window.innerHeight) <= 1)) {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            $timeout(function() {
                $('.thumb-ic-highlight').removeClass('thumb-ic-highlight');
            }, 100);
        } else {
            if (elt.requestFullscreen) {
                elt.requestFullscreen();
            } else if (elt.msRequestFullscreen) {
                elt.msRequestFullscreen();
            } else if (elt.mozRequestFullScreen) {
                elt.mozRequestFullScreen();
            } else if (elt.webkitRequestFullscreen) {
                elt.webkitRequestFullscreen();
            } else {
                console.log("Fullscreen not available");
            }
        }
    }

	$scope.createAPGProject = function(obj){
		var data = {};
		var preparedJSON = $scope.prepareJSON(obj);
		data.nodes = JSON.stringify(preparedJSON.nodes);
		data.edges = JSON.stringify(preparedJSON.links);
		data.dataflow = JSON.stringify(obj.data_flow);
		data.starttime = obj.starttime;
		data.endtime =  obj.endtime;
		data.projectname = "sampleAPGProject1";

		flowGraphServices.APG_createAPGProject(data).then(function(data) {
			if (data == "unavailableLocalServer") {
				$scope.hideBaseContent = { message: 'false' };
				$('#progress-canvas').hide();
				document.getElementById('path').value = '';
				openDialog("APG", $rootScope.unavailableLocalServer_msg);
				return false;
			}else if(data == "Invalid Session"){
				document.getElementById('path').value = '';
				return $rootScope.redirectPage();
			}
		}, function(err){
			console.log("Error :", err);
		});
	}
	
	$(document).on("click", ".filterObjects", function() {
        cfpLoadingBar.start();
        blockUI('Filtering in progress. Please wait...');
        $(".checkStylebox").prop("checked", false);
        $("html").css({
            'cursor': 'wait'
        });
        $timeout(function() {
			filter();	
			unblockUI();
        }, 500);
    });
	
	function filter() {
        
        $("html").css({
            'cursor': 'auto'
        });
        cfpLoadingBar.complete();
    }
	
	function showMethodFlow(data_flow, method_name, class_name) {
		$('#method-flow svg').remove();
		let width =700;
		let height = 650 ;
		var flag = false;
        var svg = d3.select('#method-flow').append('svg')
				.attr("width", width)
				.attr("height", height);
		var inner = svg.append('g').attr("id", "data-flow-method");	

		var zoom = d3.behavior.zoom()
				.translate([0, 0])
				.scale(1)
				.size([900, 800])
				.scaleExtent([0.2, 8])
				.on('zoom', zoomed);

		svg.call(zoom) 
			.call(zoom.event);
			
		function zoomed() {
			inner.attr('transform', 'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')');
		}
		var g = new dagreD3.graphlib.Graph().setGraph({});
		var method_nodes = [];
		var node_ids = new Set([]);
		var index = 0;
		for (var i=0; i<data_flow.length; i++){
			if(data_flow[i].method == method_name && data_flow[i].class.split('(')[0] == class_name && (data_flow[i].text).startsWith('Method Name:')){
				index = i;
				break;
			}
		}
		for (var i=index; i<data_flow.length; i++){
			if(data_flow[i].method == method_name && data_flow[i].class.split('(')[0] == class_name){
				if(data_flow[i].text == 'Start' || data_flow[i].text == 'End'){
					data_flow[i].shape = "ellipse";
				}
				else if (data_flow[i].shape == 'Diamond' || data_flow[i].shape == 'SwitchDiamond'){
					data_flow[i].shape = "diamond";
				}
				else{
					data_flow[i].shape = "rect";
				}
				if(data_flow[i].hasOwnProperty('within') || data_flow[i].hasOwnProperty('outside')){
					g.setNode(data_flow[i].id, {
						label: data_flow[i].text,
						shape: data_flow[i].shape,
						style: "fill: #afa"
					});
					flag = true;
				}
				else{
					g.setNode(data_flow[i].id, {
						label: data_flow[i].text,
						shape: data_flow[i].shape
					});
				}
				method_nodes.push(data_flow[i]);
				node_ids.add(data_flow[i].id);
			}
		}
		for (var j=0; j<method_nodes.length; j++){
			if(method_nodes[j].child != null){
				for (var k=0; k<method_nodes[j].child.length; k++){
					if(node_ids.has(method_nodes[j].child[k])){
						if(method_nodes[j].shape == 'diamond' && method_nodes[j].child.length == 2){
							if(method_nodes[j].child.indexOf(method_nodes[j].child[k]) == 0)
								g.setEdge(method_nodes[j].id, method_nodes[j].child[k], {style: "stroke: #fff; fill: none; stroke-width: 1", arrowheadStyle:"fill: #fff", label: "True", labelStyle: "font-family: 'LatoWeb'; stroke: #fff; stroke-width: 0.1"});
							else
								g.setEdge(method_nodes[j].id, method_nodes[j].child[k], {style: "stroke: #fff; fill: none; stroke-width: 1", arrowheadStyle:"fill: #fff", label: "False", labelStyle: "font-family: 'LatoWeb'; stroke: #fff; stroke-width: 0.1"});
						}
						else{
							g.setEdge(method_nodes[j].id, method_nodes[j].child[k], {style: "stroke: #fff; fill: none; stroke-width: 1", arrowheadStyle:"fill: #fff"});
						}
					}
				}
			}
		}
		g.nodes().forEach(function (v) {
			var node = g.node(v);
			node.rx = node.ry = 5;
		});
		g.edges().forEach(function (e) {
			var edge = g.edge(e.v, e.w);
			edge.lineInterpolate = 'basis';
		});
		
		var render = new dagreD3.render();
		render(inner, g);
		var coord= $('#data-flow-method .nodes').children()[0].getAttribute("transform").split("(")[1].split(")")[0].split(",");
		zoom.translate([ Number(-coord[0]+width/2 ),  Number(-coord[1]+height/2)]).scale(1).event(svg);
		
		if (flag){
			var canv = d3.select("#method-flow").append('svg').attr('id','legend-box-data-flow');
			var u = canv.append('g').attr("transform", "translate(10,10)");	
			t=u.append('g');
			var offset = 10;
			t.append("rect")
			.style('fill', '#afa')
			.attr('x',offset)
			.attr('y', -6)
			.attr('width', '15px')
			.attr('height', '15px')
			.attr('rx',3)
			.attr('ry', 3)
			t.append('text')
			.attr('x',offset+25)
			.attr('y',3)
			.text("Outside Method call")
			.attr('style','stroke:#fff; stroke-width:0.5');
		}
    }
	
	$scope.runDeadcodeIdentifier = function(e){
		$timeout(function(){$('.browserIcon img').removeClass('thumb-ic-highlight')},500);
		$scope.collapseSidebars();
		$("#page-taskName span").animate({
			left: '0px'
		});
		blockUI('Deadcode identification in progress..');
		
		flowGraphServices.APG_runDeadcodeIdentifier(version,path).then(function(data) {
			unblockUI();
			if (data == "unavailableLocalServer") {
				$scope.hideBaseContent = { message: 'false' };
				$('#progress-canvas').hide();
				document.getElementById('path').value = '';
				openDialog("APG", $rootScope.unavailableLocalServer_msg);
				return false;
			}else if(data == "Invalid Session"){
				document.getElementById('path').value = '';
				return $rootScope.redirectPage();
			}
			else if(data == false){
				openDialog("Deadcode Identifier", 'Report generation failed');
				return false;
			}
			else if(data == true){
				openDialog("Deadcode Identifier", 'Report generated successfully.');
				return true;
			}
		}, function(err){
			console.log("Error :", err);
		});
	}
	
}]);