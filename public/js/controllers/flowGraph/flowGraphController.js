mySPA.controller('flowGraphController', ['$scope', '$http', '$location', '$timeout', 'flowGraphServices','cfpLoadingBar','$window', 'socket', function($scope,$http,$location,$timeout,flowGraphServices,cfpLoadingBar,$window,socket) {
	 //Task Listing
	 $timeout(function() {
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
		cfpLoadingBar.complete()
		$("#utilityEncrytpion").trigger("click");
	  }, 500);
	  
	 loadUserTasks(); 

	 $scope.enableGenerate = false;
	 $scope.showFlowGraphHome = function(){
		$('#complexity-canvas').hide();
		if (!$scope.enableGenerate)
		return;
		var myNode = document.getElementById("apg-cd-canvas");
		while (myNode.firstChild) {
			myNode.removeChild(myNode.firstChild);
		}
		$('#middle-content-section').removeAttr('class');
	
		$("#apg-cd-canvas").hide();
		document.getElementById('path').value = '';
		$scope.showInfo = false;
		$scope.hideBaseContent = { message: 'false' };		  
	  }
	  
	  socket.on('ICEnotAvailable', function () {
		var slider = document.getElementById("slider-container");
		slider.remove();
		$('#progress-canvas').fadeOut(800, function(){
			$scope.hideBaseContent = { message: 'false' };
			$scope.$apply();
		});
		document.getElementById('path').value = '';
		openDialog("APG", "ICE Engine is not available. Please run the batch file and connect to the Server.");
	});
	  
	$scope.executeGenerate = function(){
		$scope.enableGenerate = false;
		currentDot = 0;
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
		var socket = io('', { forceNew: true, reconnect: true, query: param});
		
		var version = document.getElementById("version").value;
		var path = document.getElementById("path").value;
		flowGraphServices.getResults(version,path) .then(function(data) {
			if (data == "unavailableLocalServer") {
				$scope.hideBaseContent = { message: 'false' };
				$('#progress-canvas').hide();
				document.getElementById('path').value = '';
				openDialog("APG", "ICE Engine is not available. Please run the batch file and connect to the Server.");
				return false;
			}else if(data == "Invalid Session"){
				document.getElementById('path').value = '';
				$rootScope.redirectPage();
			}
		}, function(err){
			console.log("Error :", err);
		});
		
		socket.on('newdata', function(obj){
			$scope.addClass(obj);
			$scope.$apply();
		});
		
		socket.on('endData', function(obj){
			if(obj.result == "success"){
				$('#progress-canvas').fadeOut(800, function(){
					$scope.hideBaseContent = { message: 'true' };
					$scope.$apply();
				});
				$scope.generateClassDiagram(obj);
				$scope.enableGenerate = true;
			}else if(obj.result == "fail"){
				$('#progress-canvas').fadeOut(800, function(){
					$scope.hideBaseContent = { message: 'false' };
					$scope.$apply();
				});
				document.getElementById('path').value = '';
				openDialog("APG", "Failed to generate graph.");
			}
			
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
		categoriesDict = {"public" : "+", "private" : "-", "default" : "~", "protected" : "#"};
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
		td.appendChild(document.createTextNode(Object.keys(obj.methods).length));
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
		obj = obj.classes;
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
			graph_json["nodes"].push({
				"classname": obj[i].name,
				"methods": obj[i].classMethods,
				"attributes": obj[i].classVariables,
				"id": i,
				"abstract": obj[i].abstract,
				"interface": obj[i].interface,
				"Complexity":obj[i].complexity
			});
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
							"id": size + 1
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
		
		if(links.length != 0){
			for (var i=0; i < links.length; i++){
				var link = {
					"source": class_map[links[i].source],
					"target": class_map[links[i].target],
					"type": "association"
				};
				graph_json["links"].push(link);
			}
		}
		console.log(graph_json);
		return graph_json;
	}


$scope.generateClassDiagram = function(obj){
	
	$("#apg-cd-canvas").show();
	var width = window.innerWidth,
    height = window.innerHeight;
	
var force = d3.layout.force()
    .size([width, height])
    .charge(-1120)
    .linkDistance(function(d){
		return (d.source.id*60)+60
	})
    .on("tick", tick);
var drag = force.drag()
    .on("dragstart", dragstart);
			  
var zoom = d3.behavior.zoom()
	.scaleExtent([0.5, 10])
	.on("zoom", zoomed);
var svg = d3.select('#apg-cd-canvas').append('svg')
    .attr("width", width)
    .attr("height", height)
	.call(zoom).on("dblclick.zoom", null);;;
	
var rectSVG = svg.append("rect")
	.attr("width", width)
	.attr("height", height)
	.style("fill", "none")
	.style("pointer-events", "all");	

var container = svg.append("g");
d3.classDiagram.addMarkers(container.append('defs'));
var color = d3.scale.category20();

var link = container.selectAll(".apg-cd-link"),
    node = container.selectAll(".apg-cd-node");
var graph =	$scope.prepareJSON(obj);


force
  .nodes(graph.nodes)
  .links(graph.links)
  .on("tick", tick)
  .start();
  
path = link.data(graph.links)
	.enter().insert("path","g")
	.attr("class", "apg-cd-link");

					
node = node
	.data(graph.nodes)
	.enter()
	.append("g")
	.attr("class", "apg-cd-node")
	.on("dblclick", dblclick)
	.on("mouseover", nodeOver)
	.on("mouseout",nodeOut)
	.call(drag);

node.append('rect')
	.attr({
		'width': 200,
		'fill': 'white',
		'stroke': 'cyan',
		'stroke-width': 1
	});


function zoomed() {
	container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}			
var classNameG = node.append('g')
	.attr('class', 'classname');
	
var classNameRects = classNameG.append('rect')
  .attr({
	'width': function(d) { return 130 },
	'fill': 'white',
	'stroke': 'silver',
	'stroke-width': 0.5
  });
  
  
var classNameTexts = classNameG.append('text')
  .attr('font-size', 12)
  classNameTexts.call(d3.multilineText()
	.verticalAlign('top')
	.paddingTop(4)
	.paddingBottom(4)
	.text(function(d) {
		return d.classname;
		})
  );

 adjustHeight(classNameRects[0], classNameTexts[0], 4, 4);
 var attributesG = node.append('g')
      .attr({
        'class': 'attributes',
        'transform': function(d) {
          var classNameG = d3.select(this).node().previousSibling,
              height = classNameG.getBBox().height;
          return 'translate(0,' + height + ')';
        }
      });
    var attributesRects = attributesG.append('rect')
      .attr({
        'width': function(d) { return 130 },
        'fill': 'white',
        'stroke': 'silver',
        'stroke-width': 0.5
      });
    var attributesTexts = attributesG.append('text')
      .attr('font-size', 12)
      .call(d3.multilineText()
        .text(function(d) { return d.attributes; })
        .verticalAlign('top')
        .horizontalAlign('left')
        .paddingTop(4)
        .paddingLeft(4)
      );
    adjustHeight(attributesRects[0], attributesTexts[0], 4, 4);

    var methodsG = node.append('g')
      .attr({
        'class': 'methods',
        'transform': function(d) {
          var attributesG = d3.select(this).node().previousSibling,
              classNameText = attributesG.previousSibling,
              classNameBBox = classNameText.getBBox(),
              attributesBBox = attributesG.getBBox();
          return 'translate(0,' + (classNameBBox.height + attributesBBox.height) + ')';
        }
      });
    var methodsRects = methodsG.append('rect')
      .attr({
        'width': function(d) { return 130 },
        'fill': 'white',
        'stroke': 'silver',
        'stroke-width': 0.5
      });
    var methodsTexts = methodsG.append('text')
      .attr('font-size', 12)
      .call(d3.multilineText()
        .text(function(d) { return d.methods; })
        .verticalAlign('top')
        .horizontalAlign('left')
        .paddingTop(4)
        .paddingLeft(4)
      );
    adjustHeight(methodsRects[0], methodsTexts[0], 4, 4);
	
	var image = node.append('image')
	.attr({'href': 'imgs/apg-info.png',
		'width': '20px',
		'style': 'transform: translateX(-21px)',
		'class': 'apg-info-icon',
	});

	image.on('click', function(d){
		$('#apg-cd-canvas').hide();
		$('#complexity-canvas').show();
		$scope.ccname=d.classname;
		$scope.cmethod=d.methods.length;
		$scope.cc =d.Complexity;
		$scope.$apply();
		//$scope.hmc=20;
	});
	image.append('title').text('Show Complexity');
	
	container.selectAll('text').attr('font-family', 'Noto Sans Japanese');
	
	node.forEach(function(d){

		d.forEach(function(e,i){
			var maxWidth = 0;
			for(i = 1 ;  i< e.children.length; i ++){	
				maxWidth = Math.max(e.children[i].getBBox().width, maxWidth);
			}
			
			for(i = 1 ;  i< e.children.length; i ++){	
				d3.select(e.children[i].children[0]).attr('width', maxWidth+8);
				d3.select(e.lastChild).attr('style', 'transform: translateX('+Number(maxWidth+8)+'px)')
			}
			d3.select(e.children[0]).attr('width', maxWidth+8);
			dn=d3.select(e).datum();
			dn.props=e.getBBox();
			d3.select(e).datum(dn);
		});
	});

function adjustHeight(rects, texts, paddingTop, paddingBottom) {
  var i,
	  n = rects.length,
	  rect,
	  text,
	  height;
	  
  for (i = 0; i < n; i++) {
	rect = rects[i];
	text = texts[i];
	height = text.getBBox().height + paddingTop + paddingBottom;
	d3.select(rect).attr('height', height);
  }
}
var createline = d3.svg.line()
		  .x(function(d) {return d.x;})
		  .y(function(d) {return d.y;})
		  
function tick() {
		path.attr({
          'class': 'connector',
          'stroke': 'black',
          'stroke-width': 1,
          'fill': 'none'
        }).attr("d", function(d){
			sourceX = d.source.x+(d.source.props.width/2);
			sourceY = d.source.y+ (d.source.props.height/2);
			targetCords = {
					x1 : d.target.x,
					y1 : d.target.y, 
					x2 : d.target.x+(d.target.props.width),
					y2 : d.target.y, 
					x3 : d.target.x,
					y3 : d.target.y+(d.target.props.height), 
					x4 : d.target.x+(d.target.props.width),
					y4 : d.target.y+(d.target.props.height),
					x5: d.target.x+(d.target.props.width)/2,
					y5: d.target.y,
					x6: d.target.x,
					y6: d.target.y+(d.target.props.height)/2,
					x7: d.target.x+(d.target.props.width)/2,
					y7: d.target.y+(d.target.props.height),
					x8: d.target.x+(d.target.props.width),
					y8: d.target.y+(d.target.props.height)/2,
				}
				
				miniCords = calcMinDistance(sourceX,sourceY,targetCords);
			
			function calcMinDistance(x1,y1,targetPoitns){
				var values = Object.values(targetPoitns);
				var len = values.length/2;
				var mini = 9007199254740992;
				var miniX = 0;
				var miniY = 0;

				for(i=0;i<len;i++){
					var dist = Math.sqrt(
							Math.pow((x1 - values[2*i]),2)+
							Math.pow((y1 - values[2*i + 1]),2)
						);
						
					if(dist < mini){
						miniX = values[2*i];
						miniY = values[2*i + 1];
						mini = dist;
					}
				}

				return {x : miniX, y : miniY};
			}
			return createline([
				{x:sourceX,y:sourceY},
				{x:miniCords.x  ,y: miniCords.y}
			]);
		})
		  var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on("zoom", zoomed);
         path.attr('marker-end', function(d){
			var arrowType = 'url(#' + "triangle" + ')';
			if(d.type == 'extends'){
				arrowType =  'url(#' + "triangle" + ')';
			}else if( d.type == 'implements'){
				arrowType =  'url(#' + "triangle" + ')';
				
			}else if(d.type == "association"){
				arrowType =  'url(#' + "arrowhead" + ')';
			} 
			return arrowType;
		}).attr('stroke-dasharray', function(d){
			var arrowType = 0;
			if(d.type == 'implements'){
				arrowType = 4;
			}
			return arrowType;
		});

        node
            .attr("transform", function (d) {
				
				return "translate(" + Number(d.x) + ", " + Number(d.y) + ")";
			});

}
function dblclick(d) {
  d3.select(this).classed("fixed", d.fixed = false);
}
function nodeOver(d){
	$(".apg-info-icon").removeClass("apg-active");
	this.lastChild.classList.add("apg-active");
}
function nodeOut(){
	$(".apg-info-icon").removeClass("apg-active");
}
function dragstart(d) {
d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("fixed", d.fixed = true);
}
	function openDialog(title, body) {
		$("#globalModal").find('.modal-title').text(title);
		$("#globalModal").find('.modal-body p').text(body).css('color', 'black');
		$("#globalModal").modal("show");
		setTimeout(function() {
			$("#globalModal").find('.btn-default').focus();
		}, 300);
	}
}
	
}]);



