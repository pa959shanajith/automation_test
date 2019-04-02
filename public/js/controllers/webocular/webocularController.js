mySPA.controller('webocularController', ['$scope', '$http', '$rootScope', '$location', '$timeout', 'webocularServices','cfpLoadingBar','$window', 'socket', function($scope,$http, $rootScope, $location,$timeout,webocularServices,cfpLoadingBar,$window,socket) {
	$timeout(function() {
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
		cfpLoadingBar.complete()
		$("#utilityEncrytpion").trigger("click");
	}, 500)
	$timeout(function () {
	// Without JQuery
		var slider = new Slider('#level-slider', {
			formatter: function(value) {
				return value;
			}
		});
	}, 10);
	if(window.localStorage['navigateScreen'] != "p_Webocular"){
		window.location.href = "/";
	}
	localStorage.setItem("navigateEnable", true);
	//Task Listing
	loadUserTasks()
	window.onbeforeunload = function() {
		return "Data will be lost if you leave the page, are you sure?";
	};
	function openDialog(title, body){
		$("#WebocularGlobalModal").find('.modal-title').text(title);
		$("#WebocularGlobalModal").find('.modal-body p').text(body).css('color','black');
		$("#WebocularGlobalModal").modal("show");
		setTimeout(function(){
			$("#WebocularGlobalModal").find('.btn-accept').focus();
		}, 300);
	}

	socket.on('ICEnotAvailable', function () {
		unblockUI();
		openDialog("Webocular Screen", "ICE Engine is not available. Please run the batch file and connect to the Server.");
	});

	var start = false;  // Flag to start the removal of dots from the dom
	var currentDot = 0; // used to store the count of dots displayed in progess canvas
	$scope.hideBaseContent = { message: 'false' };
	$scope.level = 4;
	$scope.arr = [];
	$scope.crawledLinks = [];
	$scope.enableGenerate = false;
	$scope.selectedAgent = "chrome";
	$scope.url = "http://";
	$scope.showWebocularHome = function(){
		if (!$scope.enableGenerate)
		return;
		var myNode = document.getElementById("report-canvas");
		while (myNode.firstChild) {
				myNode.removeChild(myNode.firstChild);
		}
		$('#middle-content-section').removeAttr('class');

		$("#result-canvas").hide();
		$scope.showInfo = false;
		$scope.hideBaseContent = { message: 'false' };
		if(!$scope.reportGenerated){
			$scope.check = true;
		}
	}

	$scope.executeGo = function($event){
		localStorage.setItem("navigateEnable", false);
		$scope.enableGenerate = false;
		$scope.crawledLinks = [];
		$scope.arr = [];

		start = false; // Flag to start the removal of dots from the dom
		currentDot = 0;

		// remove all dots from previous run which are present already on canvas
		for( var k = 1 ; k <	$('#progress-canvas').children().length; ){
			var child = document.getElementById('progress-canvas').children[k];
			child.parentNode.removeChild(child);
		}

		$scope.hideBaseContent = { message: 'true' };
		// Display the progress canvas after clearing all dots.
		$('#progress-canvas').fadeIn();

		var getDomain = function(href) {
			var l = document.createElement("a");
			l.href = href;
			return l.hostname;
		};

		$scope.domain = getDomain($scope.url);

		$scope.addDomainDot();

		setTimeout(function(){
			if (document.getElementById('domain')) {
				var w = document.getElementById('domain').offsetWidth/2;
				document.getElementById('domain').setAttribute("style", " display: block;	position:absolute; bottom: -40px; text-align:center;	left: calc(50% - "+w+"px)");			
			}
		},100);

		// socket connection ....
		var userName=JSON.parse(window.localStorage['_UI']).username;
		var param={check:true,username:userName};
		var socket = io('', { forceNew: true, reconnect: true, query: param});

		// fired when the connection acknowledgment is received from the server
		socket.on('connectionAck', function(value){
			if (window.sessionStorage.activeCrawlRequest) return;
			window.sessionStorage.activeCrawlRequest = true;
			webocularServices.getResults($scope.url, $scope.level, $scope.selectedAgent).then(function(data){
				socket.disconnect('', { query: "check=true" });
				console.log("Data from service", data);
				if (data == "unavailableLocalServer") {
					$scope.hideBaseContent = { message: 'false' };
					// Display the progress canvas after clearing all dots.
					$('#progress-canvas').hide();
					openDialog("Webocular Screen", "ICE Engine is not available. Please run the batch file and connect to the Server.");
				} else if(data == "Invalid Session") {
					$rootScope.redirectPage();
				} else if( data == "localServerInterrupted") {
					$scope.hideBaseContent = { message: 'false' };
					// Display the progress canvas after clearing all dots.
					$('#progress-canvas').hide();
					openDialog("Webocular Screen", "ICE Engine is not available. Please run the batch file and connect to the Server.");
				} else if(data == "scheduleModeOn") {
					$scope.hideBaseContent = { message: 'false' };
					$('#progress-canvas').hide();
					openDialog("Webocular Screen", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
				} else delete window.sessionStorage.activeCrawlRequest;
			}, function(err){
				$scope.hideBaseContent = { message: 'false' };
				// Display the progress canvas after clearing all dots.
				$('#progress-canvas').hide();
				openDialog("Webocular Screen", "Error while crawling.");
				console.log("Error :", err);
				socket.disconnect('', { query: "check=true" })
			});
		});

		// fired when the socket attempts to reconnect
		socket.on('reconnecting', function(attemptNumber){
			console.log(attemptNumber);
		});

		// fired on socket connection timeout
		socket.on('connect_timeout', function(timeout) {
			console.log("timeout" , timeout);
		});

		// fired on socket error
		socket.on('error', function(error) {
			console.log("error", error);
		});

		socket.on('newdata', function(obj){
			var name = obj.name;
			var parent = obj.parent;

			$scope.crawledLinks.push(obj);
			if (obj.type == "subdomain") {
				$scope.arr.push(obj.name);
			}
			$scope.addDot(obj);
			$scope.$apply();
		});

		socket.on('endData', function(obj){
			var reverseLinks = obj.sdata.links;
			$scope.crawledLinks = $scope.crawledLinks.concat(reverseLinks);
			$scope.otherLinks = obj.notParsedURLs;
			$('#progress-canvas').fadeOut(800, function(){
				$scope.hideBaseContent = { message: 'false' };
				$scope.$apply();
			});
			localStorage.setItem("navigateEnable", true);
			$scope.enableGenerate = true;
			$scope.check= false;
			$scope.$apply();
		});
		//Transaction Activity for WebocularGoClick
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['WebocularGoClick']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path); 
	}

	$scope.addDomainDot = function(){
		var parentElem = document.createElement("div");
		var elem = document.createElement("div");
		elem.setAttribute("class", "square");
		parentElem.setAttribute("id", "domain");

		var text = document.createElement("p");
		var t = document.createTextNode($scope.domain);
		text.appendChild(t);
		text.setAttribute("class", "dotText")
		parentElem.appendChild(elem);
		parentElem.appendChild(text);
		document.getElementById("progress-canvas").appendChild(parentElem);;
		var w = document.getElementById('domain').offsetWidth;
		parentElem.setAttribute("style", "visibility: hidden; position:absolute; text-align:center; top:80%; bottom: -20px");
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

	var removeIndex = 2; // 0 and 1 index is for slider and domain dot. We don't have to remove that
	var maxDots =	dotsPosition.length-1;
	$scope.addDot = function(obj){
		if(currentDot >= 40){
			currentDot = 0;
			start = true;
		}

		if (start) {
			$scope.removeDot();
		}

		var x = dotsPosition[currentDot].x;
		var y = dotsPosition[currentDot].y;
		currentDot++;
		$scope.createDot(x, y, obj);
	}

	$scope.removeDot = function(){
		var child = document.getElementById("progress-canvas").children[removeIndex];
		var parent = child.parentNode;
		parent.removeChild(child);
	}

	$scope.createDot = function (x, y, obj){
		var parentElem = document.createElement("div");
		var elem = document.createElement("div");
		var size= Math.floor((Math.random() * 3) + 1);

		if (obj.type == "subdomain") {
			elem.setAttribute("class", "sqdot sqSize"+size);
		}else {
			elem.setAttribute("class", "dot dotSize"+size);
		}

		parentElem.setAttribute("style", "left:"+x+"; top:"+y+"; position:absolute;");
		var text = document.createElement("p");
		text.setAttribute("class", "dotText")
		var t = document.createTextNode(obj.name);
		if (obj.status != '200') {
			elem.style.background = "red";
		}
		text.appendChild(t);
		parentElem.appendChild(elem);
		parentElem.appendChild(text);
		document.getElementById("progress-canvas").appendChild(parentElem);

		text.style.visibility = "hidden";
		text.style.left = "-"+(text.offsetWidth/2)+"px";
		text.style.position="absolute";
		elem.addEventListener("mouseover", onDotMouseOver, false);
		elem.addEventListener("mouseout", onDotMouseOut, false);
		function onDotMouseOver(e){
			e.target.nextSibling.style.visibility = "";
		}

		function onDotMouseOut(e){
			e.target.nextSibling.style.visibility = "hidden";
		}
		return elem;
	}
	/*
	* Create an object which will contains all the elements level-wise(level = key of the object)
	*/
	function createLevelObject(arr){
		var modified = {};
		var arrLength = arr.length;
		for(var i = 0 ; i< arrLength; i++){
			/*
			* If the arr contains redirected link then add it to the modified array with the same level
			* on which it was redirected.
			*/
			if(arr[i].redirected && (arr[i].redirected != "no"	&& arr[i].name != arr[i].redirected)){
				var json = {
					"type" : arr[i].type== "subdomain" ? "redirectedSubdomain" : "redirected",
					"name" : arr[i].redirected,
					"parent" : arr[i].name,
					"level" : arr[i].level,
					"status" : arr[i].status
				}

				if (!modified[arr[i].level]) {
					modified[arr[i].level] = []
				}
				modified[arr[i].level].push(json)
			}

			if (!modified[arr[i].level]) {
				modified[arr[i].level] = []
			}
			modified[arr[i].level].push(arr[i]);
		}
		return modified;
	}

	function parseRelations(obj){
		for(var i = $scope.level; i>=0; i--){
			var levelObjects;
			if (obj[i]) {
				levelObjects = obj[i];
			}else{
				levelObjects = [];
			}

			for(var k = 0; k < levelObjects.length; k++){
				if (i>=1) {
					obj[i][k].collapse = 1
				}

				var thisNode = levelObjects[k];
				if(obj[i][k].type == "redirected" || obj[i][k].type == "redirectedSubdomain" ){
					for(var j = 0; j <= (obj[i].length)-1; j++){
						if (thisNode.parent == obj[i][j].name) {
							if (obj[i][j].children) {
								obj[i][j].children.push(thisNode);
							}else{
								obj[i][j].children =	[];
								obj[i][j].children.push(thisNode);
							}
							if(thisNode.status != 200){
								obj[i][j].containsDeadLink = true;
							}else if(thisNode.containsDeadLink){
								obj[i][j].containsDeadLink = true;
							}
							break;
						}
					}
					continue;
				}
				if (!obj[i][k].children || !obj[i][k].children.length > 0 ) {
					obj[i][k].isTerminal = true;
				}else if (obj[i][k].status != 200) {
					obj[i][k].isTerminal = true;
				}else if(obj[i][k].type == "duplicate"){
					obj[i][k].isTerminal = true;
				}

				if (i == 0) {
					break;
				}
				for(var j = 0; j <= (obj[i-1].length)-1; j++){
					if(thisNode.parent == obj[i-1][j].name){
						if (obj[i-1][j].children) {
							obj[i-1][j].children.push(thisNode);
						}else{
							obj[i-1][j].children =	[];
							obj[i-1][j].children.push(thisNode);
						}
						if(thisNode.status != 200){
							obj[i-1][j].containsDeadLink = true;
						}else if(thisNode.containsDeadLink){
							obj[i-1][j].containsDeadLink = true;
						}
						break;
					}
				}
			}
		}
		return obj[0];
	}
	var deadLinks = [];
	function addParents(arr, parent){
		var arrLength = arr.length;
		for (var i = 0; i < arrLength; i++) {
			arr[i].parentsAll = [];
			arr[i].parentsAll.push(arr[i].parent);
			arr[i].parentsAll = arr[i].parentsAll.concat(parent);
			if (arr[i].children && arr[i].children.length > 0) {
				addParents(arr[i].children, arr[i].parentsAll);
			}
		}
		return arr;
	}

	var positionNode = {"x":0 , "y":0};
	$scope.generateGraph = function($event){
		$("#result-canvas").show();
		$scope.showInfo = true;
		$scope.hideBaseContent = { message: 'true' };;
		if ($scope.check) {
			return;
		}
	
		blockUI("Graph is being generated, Please Wait...");
		$scope.reportGenerated = false;
		var baseSVG = document.getElementById("base-svg");
		if (baseSVG) {
			document.getElementById("result-canvas").removeChild(document.getElementById("base-svg"));
		}

		var fill = d3.scale.category20();
		var trans1 = [ positionNode.x, positionNode.y ] , scale1= 1;
		var trans = [positionNode.x,positionNode.y];
		var scale =1;
		var rescale = function()	{
			zoomReset = false;
			trans=d3.event.translate;
			scale=d3.event.scale;
			svg.attr("transform",
			"translate(" + trans + ")"
			+ " scale(" + scale + ")");
		}

		var zoom = d3.behavior.zoom().scale(scale1).translate(trans1).scaleExtent([0.2, 7.5]).on("zoom", rescale);
		var zoomReset = false;
		var svgMain = d3.select("#result-canvas").append("svg").attr("id","base-svg")
		.attr("width", "100%")
		.attr("height", "100%")
		.attr("pointer-events", "all").call(zoom).on("dblclick.zoom", null);

		console.log("Number of Crawled Links ", $scope.crawledLinks.length)

		var root = parseRelations(createLevelObject($scope.crawledLinks));
		console.log(root);

		var init = []
		root = addParents(root, init);
		for (var i = 0; i < root.length; i++) {
			if(root[i].type != "redirected"){
				root = root[i];
				break;
			}
		}
		$scope.clickedNode = {
			name : root.name, 
			parent : root.parent,
			level : 0,
			status : root.status
		}

		var width = window.innerWidth,
		height = window.innerHeight,
		nodes,
		links
		nodeFocus = false;
		var count11= 0;
		var activeD = [];
		var force = d3.layout.force()
		.linkDistance(function(d){	return 180})
		.linkStrength(function(d){ if(d.reverse)return 0;	return 2; })
		.charge(-1200)
		.friction(0.9)
		.size([width, height])
		.on("tick", tick);

		var svg = d3.select("#base-svg").append("g").attr("id", "parent-g").attr("transform", "translate(-130,-30)")

		var canvSize=getElementDimm(d3.select("#base-svg"));
		var x = canvSize[1] - 40 ;
		var u =	 d3.select("#base-svg").append('g').attr('transform','translate(10, '+x+')');
		var legends=[
			{color:'#18b6df',text:'Page', type: 'circle'},
			{color:'red',text:'Error Page', type: 'circle'},
			{color:'none',text:'Redirected Page', type: 'circle', stroke: '#18b6df', strokeWidth : 3},
			{color:'#18b6df',text:'Subdomain', type: 'rect'},
			{color:'red',text:'Error Subdomain', type: 'rect'},
			{color:'#efa022',text:'Reverse Link', type: 'line'},
		];

		legends.forEach(function(e,i) {
			t=u.append('g');
			if(e.type == "circle"){
				var offset = i*90+10;
				t.append(e.type)
				.style('fill', e.color)
				.style('stroke', e.stroke ? e.stroke : 0)
				.style('stroke-width', e.strokeWidth ? e.strokeWidth : 0)
				.attr('cx', offset)
				.attr('cy',0)
				.attr('r',6)
				t.append('text')
				.attr('class','ct-nodeLabel')
				.attr('x', offset + 15)
				.attr('y',3)
				.text(e.text);
			}else if(e.type == "line"){
				var offset = i*90+110;
				t.append(e.type)
				.style('stroke', 'red')
				.style('stroke-width', '2')
				.attr('stroke-dasharray', '3,3')
				.attr('x1',offset)
				.attr('y1', '0')
				.attr('x2', offset+20)
				.attr('y2', '0');
				t.append('text')
				.attr('class','ct-nodeLabel')
				.attr('x', offset + 25)
				.attr('y',3)
				.text(e.text);
			}else{
				var offset = e.text == "Subdomain" ? i*90+50 : i*90+60;
				t.append(e.type)
				.style('fill', e.color)
				.attr('x',offset)
				.attr('y', -6)
				.attr('width', '12px')
				.attr('height', '12px')
				.attr('rx',3)
				.attr('ry', 3)
				t.append('text')
				.attr('class','ct-nodeLabel')
				.attr('x',offset+25)
				.attr('y',3)
				.text(e.text);
			}
		});

		var link = svg.selectAll(".link"),
		node = svg.selectAll(".node");

		setTimeout(restart, 50);

		function startAgain(){
			nodes = flatten(root),
			links = d3.layout.tree().links(nodes);
			var numberOfNodes = nodes.length;
			for(var i=0; i< numberOfNodes; i++){
				if(nodes[i].collapse){
					toggle(nodes[i], false);
				}
			}
			setTimeout(restart, 50);
		}

		function addJson(source, target, reverse) {
			var json = {};
			json["source"] = source;
			json["target"] = target;
			json["reverse"] = reverse;
			return json;
		}

		function restart(){
			nodes = flatten(root),
			links = d3.layout.tree().links(nodes);

			for(i = 0; i < links.length-1; i ++ ){
				d = links[i];
				var isFound = true;
				if(d.target.type == "duplicate"|| d.target.type == "reverse"){
					var j = 0
					for(j = 0; j< links.length; j++){
						if(links[j].source.name == d.target.name){
							isFound =false;
							d.target.status = links[j].source.status;
							if(d.target.parentsAll.indexOf(d.target.name) >= 0){
								d.target.type = "reverse";
								json = addJson( d.source, links[j].source, "reverse_T");
								links.splice(i--, 1);
								links.push(json)
								break;
							}else{
								json = addJson(d.source, links[j].source, "duplicate");
								links.splice(i--, 1);
								links.push(json)
								break;
							}
						}else if(links[j].target.name == d.target.name && (links[j].target.type == "page" || links[j].target.type == "subdomain") && (links[j].target.isTerminal || links[j].target.nodeOpen == false)){
							isFound =false;
							json = addJson(d.source, links[j].target, "duplicate")
							links.splice(i--, 1);
							links.push(json);
							break;
						}
					}
					if (isFound) {
						d.target.type = "page"
					}
				}
			}
			setTimeout(update,50);
		}

		function addStylesToNode(d) {
			// for root node
			if(d.parent == "None/")
				return "imgs/wc-p-sq.png"
			if(d.redirected != undefined && d.redirected != "no")
				return "imgs/circle-outline-256.png"
			if (d.status!=200) {
				if(d.type == "subdomain" || d.type == "redirectedSubdomain"){
					return "imgs/wc-red-sq.png"
				}else if(d.type == "reverse"){
					return "imgs/ic-cycle.png"
				}
				return "imgs/circle-128.png"
			}

			if(d.isTerminal == true){
				if (d.status != 200) {
					if(d.type == "subdomain" || d.type == "redirectedSubdomain"){
						return "imgs/wc-red-sq.png"
					}else if(d.type == "reverse"){
						return "imgs/ic-cycle.png"
					}
					return "imgs/circle-128.png"
				}else{
					if(d.type == "subdomain" || d.type == "redirectedSubdomain"){
						return "imgs/wc-sq.png"
					}
					return "imgs/wc-cr.png"; // terminal node
				}
			}else if(d.nodeOpen == false){
				if(d.containsDeadLink)
					return "imgs/wc-p-ContainsDeadlink.png";
				return "imgs/wc-p-cr.png"; // collapsed node
			}else if (!d.children && !d._children) {
				if( d.type == "redirectedSubdomain"){
					return "imgs/wc-sq.png"
				}
				return "imgs/wc-cr.png"
			}else{
				if(d.containsDeadLink)
					return "imgs/wc-m-ContainsDeadlink.png";
				return "imgs/wc-m-cr.png";
			}
		}

		function update() {
			// Restart the force layout.
			force
			.nodes(nodes)
			.links(links)
			.start();

			// Update links.
			var count = 0;
			link = link.data(links, function(d) { count++;	return count; });

			link.exit().remove();

			link.enter().insert("line", ".node")
			.attr("class", function(d){	return "link "+ d.reverse})
			//.attr("class", "link");

			// Update nodes.
			node = node.data(nodes, function(d) { return d.id; });

			node.exit().remove();

			var nodeEnter = node.enter().append("g")
			.attr("class", function(d){
				if(d.type == "duplicate" || d.type == "reverse")
				return	"node hidden";
				return	"node";
			})
			.on("click", click)
			.on("mouseover", nodeOver)
			.on("mouseout", nodeOut)
			.call(force.drag);

			nodeEnter.append("image")
			.attr("width", 25)
			.attr("height", 25)
			.append("svg:title")
			.text(function(d){return	d.name;});

			node.select("image")
			.attr("xlink:href", addStylesToNode)

		if(count11 == 0){
				count11++;
				setTimeout(startAgain, 50);
			}else{
				// Given a timeout of 2 seconds to prevent the blinking effect of screen.
				setTimeout(function(){
					unblockUI();
				},2000);
			}
		
		}
		document.getElementById("result-canvas").addEventListener("dblclick", function(){
			zoomReset = true;
			svgMain.call(d3.behavior.zoom().scale(1).translate([positionNode.x,positionNode.y]).scaleExtent([0.5, 7.5]).on("zoom", rescale)).on("dblclick.zoom", null);
			svg.attr("transform",
			"translate(" + [positionNode.x,positionNode.y] + ")"
			+ " scale(" + 1 + ")");
		});

		function highlightNeighbors(d,i) {
			var nodeNeighbors = findNeighbors(d,i);
			d3.selectAll("g.node").each(function(p) {
				var isNeighbor = nodeNeighbors.nodes.indexOf(p);
				d3.select(this).select("image")
				.style("opacity", isNeighbor > -1 ? 1 : .25)
				.style("stroke-width", isNeighbor > -1 ? 3 : 1)
				.style("stroke", isNeighbor > -1 ? "blue" : "white")
			})

			d3.selectAll("line.link")
			.style("stroke-width", function (d) {return nodeNeighbors.links.indexOf(d) > -1 ? 2 : 1})
			.style("opacity", function (d) {return nodeNeighbors.links.indexOf(d) > -1 ? 1 : .25})
		}

		function findNeighbors(d,i) {
			neighborArray = [d];
			var linkArray = [];
			var linksArray = d3.selectAll("line.link").filter(function(p) {return p.source == d || p.target == d}).each(function(p) {
				neighborArray.indexOf(p.source) == -1 ? neighborArray.push(p.source) : null;
				neighborArray.indexOf(p.target) == -1 ? neighborArray.push(p.target) : null;
				linkArray.push(p);
			})
			return {nodes: neighborArray, links: linkArray};
		}

		function nodeOver(d,i,e) {
			var el = this;
			if (!d3.event.fromElement) {
				el = e;
			}
			if (nodeFocus) {
				return;
			}

			if (!zoomReset) {
				trans1[0] = trans[0];
				trans1[1] = trans[1];
				scale1 = scale;
			}else{
				trans1 = [positionNode.x,positionNode.y];
				scale1 = 1;
			}

			svgMain.call(d3.behavior.zoom().scaleExtent([0.5, 7.5]).on("zoom", function(){
				//	scale=d3.event.scale;
			}));
			//Only do the element stuff if this came from mouseover
			el.parentNode.appendChild(el);
			d3.select(el).append("text").attr("class", "hoverLabel").attr("stroke", "white").attr("stroke-width", "5px")
			.style("opacity", .9)
			.style("pointer-events", "none")
			.text(d.label);

			d3.select(el).append("text").attr("class", "hoverLabel")
			.style("pointer-events", "none")
			.text(d.label);
			highlightNeighbors(d,i);
		}

		function nodeOut() {
			if (nodeFocus) {
				return;
			}

			svgMain.call(d3.behavior.zoom().scale(scale1).translate(trans1).scaleExtent([0.5, 7.5]).on("zoom", rescale)).on("dblclick.zoom", null);
			d3.selectAll(".hoverLabel").remove();
			d3.selectAll("image").style("opacity", 1).style("stroke", "black").style("stroke-width", "1.5px");
			d3.selectAll("line").style("opacity", 1);
			//restart();
		}
	
		function getElementDimm(s) {
			return [parseFloat(s.style("width")), parseFloat(s.style("height"))];
	};

		function tick() {
			link.transition().ease('linear').duration(150)
			.attr("x1", function(d) { return d.source.x+12.5 ; })
			.attr("y1", function(d) { return d.source.y+12.5 ; })
			.attr("x2", function(d) { return d.target.x+12.5; })
			.attr("y2", function(d) { return d.target.y+12.5; });

			node.transition().ease('linear').duration(150)
			.attr("transform", function(d) {
				if(d.parent == "None"){
					var canvSize=getElementDimm(d3.select("#base-svg"));
					var x = canvSize[1] - 40 ;
					positionNode.x =	(-d.x + canvSize[0]/2) ;
					positionNode.y =	(-d.y + canvSize[1]/2) ;
				}
				return "translate(" + d.x + "," + d.y + ")";
			});
		}

		function toggle(d, check) {
			if (d.children) {
				d.nodeOpen = false;
				d._children = d.children;
				d.children = null;
			} else {
				d.nodeOpen = true;
				d.children = d._children;
				d._children = null;
				if (check) {
					activeD.push(d);
				}
			}
		}

		// Toggle children on click.
		function click(d){
			$scope.clickedNode = {
				name :	d.name,
				parent : d.parent,
				level : d.level,
				status : d.status
			}
	
			$scope.$apply();
			// if (d3.event.defaultPrevented) return; // ignore drag
			if (activeD.length > 0 && d.name != activeD[activeD.length-1].name ) {
				var i = activeD.length-1;
				while(i>=0){
					if (d.parentsAll.indexOf(activeD[i].name) < 0 && d.name != activeD[i].name) {
						activeD[i].nodeOpen = false;
						activeD[i]._children = activeD[i].children;
						activeD[i].children = null;
						activeD.pop();
					}else if(d.name == activeD[i].name){
						activeD.pop();
						break;
					}else{
						break;
					}
					i = activeD.length-1;
				}
			}else if( activeD.length > 0 && d.name == activeD[activeD.length-1].name ){
				activeD.pop();
			}
			toggle(d, true);
			restart();
			//update();
		}

		// Returns a list of all nodes under the root.
		function flatten(root) {
			var nodes = [], i = 0;

			function recurse(node) {
				if (node.children) node.size = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
				if (!node.id) node.id = ++i;
				nodes.push(node);
				return node.size;
			}

			root.size = recurse(root);
			return nodes;
		}
		//Transaction Activity for generateGraph
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['generateGraphClick']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path); 
	}

	/* function to show a table report*/
	$scope.showReport = function($event){
		$scope.hideBaseContent = { message: 'true' };;
		var myNode = document.getElementById("report-canvas");
		while (myNode.firstChild) {
				myNode.removeChild(myNode.firstChild);
		}
		//if report alreardy exists
		//if($scope.reportGenerated)
		$("#result-canvas").hide();
		$("#report-canvas").show();
		$scope.reportGenerated = true;
		
		$('#middle-content-section').attr('class',"webCrawler-report");
		var body = document.getElementById('report-canvas');
		var reportDiv = document.createElement('div');
		//reportDiv.setAttribute('class', 'scrollbar-inner');

		var tbl = document.createElement('table');
		tbl.setAttribute('width','100%');
		tbl.setAttribute('height','100%');
		tbl.setAttribute('class', 'webCrawler-report-table');
		// $('.scrollbar-inner').scrollbar();
		var tbdy = document.createElement('tbody');

		var headrow = document.createElement('tr');
		var headData = {0: 'S.No.', 1 : 'Level', 2 : 'URL', 3: 'Parent URL', 4 : 'Redirected', 5:	'Status', 6 : 'Title'};
		for (var i=0; i<7; i++){
			 var th = document.createElement('th');
			 th.appendChild(document.createTextNode(headData[i]));
			 headrow.appendChild(th)
		}
		
		headrow.childNodes[0].setAttribute('style','width : 55px');
		headrow.childNodes[1].setAttribute('style','width : 55px');
		headrow.childNodes[5].setAttribute('style','width : 65px');
		tbdy.appendChild(headrow);
		jsonStruct = {0 : 'level', 1 : 'name' , 2 : 'parent' , 3 : 'redirected' , 4 : 'status' , 5	:'title'};
		for(i=0; i<$scope.crawledLinks.length; i++){
				var newRow = document.createElement('tr');
				if($scope.crawledLinks[i]['type'] == "duplicate")
					continue;
				//create SNo text node
				var sNo = document.createElement('td');
				sNo.setAttribute('style', 'width: 55px');
				sNo.appendChild(document.createTextNode(i+1));
				newRow.appendChild(sNo);

				//7 is the number of attributes from Level to title
				for(j=0 ; j<6; j++){
					var data = document.createElement('td');
					text = $scope.crawledLinks[i][jsonStruct[j]]
					
					if(text == undefined)
						text = "-";
					data.appendChild(document.createTextNode(text));
					newRow.appendChild(data);
				}
				tbdy.appendChild(newRow);
				
		}
		tbl.appendChild(tbdy);
		reportDiv.appendChild(tbl);
		body.appendChild(reportDiv);
		//Transaction Activity for showReportClick
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['showReportClick']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path); 
	}
}]);
