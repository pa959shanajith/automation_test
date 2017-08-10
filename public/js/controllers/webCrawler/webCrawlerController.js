mySPA.controller('webCrawlerController', ['$scope', '$http', '$location', '$timeout', 'webCrawlerServices','cfpLoadingBar','$window', function($scope,$http,$location,$timeout,webCrawlerServices,cfpLoadingBar,$window) {

    $timeout(function () {
      // Without JQuery
      var slider = new Slider('#level-slider', {
        formatter: function(value) {
          return value;
        }
      });
    }, 10);


    var start = false;  // Flag to start the removal of dots from the dom
    var currentDot = 0;
    $scope.hideBaseContent = { message: 'false' };
    $scope.level = 4;
    $scope.arr = [];
    $scope.crawledLinks = [];
    $scope.enableGenerate = false;


    $scope.showWeboccularHome = function(){
      $("#result-canvas").hide();
      $scope.hideBaseContent = { message: 'false' };
      $scope.check = true;


    }


    $scope.executeGo = function(){
      $scope.enableGenerate = false;
      $scope.crawledLinks = [];
      var socket = io.connect('', { query: "check=true" });
      start = false;   // Flag to start the removal of dots from the dom
      currentDot = 0;
      $scope.arr = [];
      $scope.hideBaseContent = { message: 'true' };;
      for( var k = 1 ; k <  $('#progress-canvas').children().length; ){
        var child = document.getElementById('progress-canvas').children[k];
        child.parentNode.removeChild(child);
      }

      $('#progress-canvas').fadeIn();
      console.log($scope.url, $scope.level);

      var getLocation = function(href) {
          var l = document.createElement("a");
          l.href = href;
          return l.hostname;
      };
      $scope.domain = getLocation($scope.url);

      webCrawlerServices.getResults($scope.url, $scope.level);

      $scope.addDomainDot();

      setTimeout(function(){
        var w = document.getElementById('domain').offsetWidth/2;
        document.getElementById('domain').setAttribute("style", " display: block;  position:absolute; bottom: -40px; text-align:center;  left: calc(50% - "+w+"px)");
      },100)

      socket.on('newdata', function(obj){
          console.log(obj);
          var name = obj.name;
          var parent = obj.parent;
          if (!name.endsWith("/")) {
            obj.name = obj.name+ "/";
          }
          if (!parent.endsWith("/")) {
            obj.parent = obj.parent+ "/";
          }
          
          $scope.crawledLinks.push(obj);
          if (obj.type == "subdomain") {
            $scope.arr.push(obj.name);
          }
          $scope.addDot(obj);
          $scope.$apply();
      });

      socket.on('endData', function(obj){
        console.log(obj);
        $('#progress-canvas').fadeOut(800, function(){
          $scope.hideBaseContent = { message: 'false' };
          $scope.$apply();
        });

        $scope.enableGenerate = true;
        $scope.check= false;
      //  $scope.arr = obj.subdomains;
        $scope.$apply();

        socket.disconnect('', { query: "check=true" })
      });

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
    var maxDots =  dotsPosition.length-1;
    $scope.addDot = function(obj){
      console.log("in add dot", currentDot);
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
      //console.log("in create dot");
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
      //console.log(parentElem);

    	text.style.visibility = "hidden";
      //console.log(text.offsetWidth);
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

    function createLevelObject(arr){
      var modified = {

      };
      for(var i = 0 ; i<= $scope.level; i++){
        modified[i] = [];
      }
      for(var i = 0 ; i< arr.length; i++){
        modified[arr[i].level].push(arr[i]);
      }
      console.log("modified");
      return modified;
    }

    function parseRelations(obj){
      for(var i = $scope.level; i>=1; i--){
        var levelObjects = obj[i];
        for(var k = 0; k < levelObjects.length; k++){
          var thisNode = levelObjects[k];
          if (!obj[i][k].children || !obj[i][k].children.length > 0 ) {
             obj[i][k].isTerminal = true;
          }else if (obj[i][k].status != 200) {
            obj[i][k].isTerminal = true;
          }
          for(var j = 0; j <= (obj[i-1].length)-1; j++){
              if(thisNode.parent == obj[i-1][j].name){
                if (obj[i-1][j].children) {
                  obj[i-1][j].children.push(thisNode);
                }else{
                  obj[i-1][j].children =  [];
                  obj[i-1][j].children.push(thisNode);
                }


                break;

              }
          }
        }
      }
      return obj[0];
    }
    // var svgMain = d3.select("#result-canvas").append("svg").attr("id","base-svg")
    //     .attr("width", "1300px")
    //     .attr("height", "800px");

    $scope.generateGraph = function(){
      $("#result-canvas").show();
      $scope.hideBaseContent = { message: 'true' };;
      if ($scope.check) {
        return;
      }
      var baseSVG = document.getElementById("base-svg");
      if (baseSVG) {
        document.getElementById("result-canvas").removeChild(document.getElementById("base-svg"));
      }




      var svgMain = d3.select("#result-canvas").append("svg").attr("id","base-svg")
          .attr("width", "1300px")
          .attr("height", "800px");

    //  $("#result-canvas").fadeIn();

      console.log($scope.crawledLinks);
      //var LevelOrderObjects = createLevelObject($scope.crawledLinks);
      var root = parseRelations(createLevelObject($scope.crawledLinks));
      console.log(root);
      root = root[0];

      // var parentsArray = [];
      // for(var k = 0; k < $scope.crawledLinks.length; k++){
      //
      //   if(isUnique($scope.crawledLinks[k].parent)){
      //     var json= {
      //       "name": $scope.crawledLinks[k].parent,
      //       "children" : [
      //         {
      //           "name" : $scope.crawledLinks[k].name ,
      //           "children" : []
      //         }
      //       ]
      //     }
      //     parentsArray.push(json)
      //   }else{
      //     for(var i = 0 ; i<parentsArray.length; i++){
      //
      //       if(parentsArray[i].name == $scope.crawledLinks[k].parent){
      //         var json= {
      //           "name": $scope.crawledLinks[k].name,
      //           "children" :[]
      //         }
      //         parentsArray[i].children.push(json)
      //         break;
      //       }
      //     }
      //   }
      // }

      // function isUnique(name){
      //   for(var i = 0 ; i<parentsArray.length; i++){
      //     if(parentsArray[i].name == name){
      //       return false;
      //     }
      //   }
      //   return true;
      // }


      var width = window.innerWidth,
        height = window.innerHeight,
        root,
    	  nodes,
    	   links
         nodeFocus = false;

      var force = d3.layout.force()
          .linkDistance(80)
          .charge(-900)
          .size([width, height])
          .on("tick", tick);

      //d3.select("#base-svg").select("g").remove();
      var svg = d3.select("#base-svg").append("g").attr("id", "parent-g").attr("transform", "translate(-130,-30)")
        //  $("svg").css({top: "-45px", left: "-113px", position:'relative'});

      var link = svg.selectAll(".link"),
          node = svg.selectAll(".node");
      // var root = {
      //  "name": "Center",
      //  "color":1,
      //  "children": [
      //   {
      // 	"name": "First_1",
      // 	"color":2,
      // 	"collapse":1,
      // 	"size": 40,
      // 	"children": [
      // 		{"name": "First_3", "size": 10},
      // 		{"name": "First_3", "size": 10},
      // 		{"name": "First_3", "size": 10},
      // 		{"name": "First_3", "size": 10},
      // 		{"name": "First_3", "size": 10},
      // 		{"name": "First_3", "size": 10}
      //    ]
      //   },
      // 	{
      //    "name": "Second_1",
      // 	 "color":2,
      // 	 "collapse":1,
      //    "children": [
      //     {
      //      "name": "Second_2",
      // 	 "color":3,
      // 	 "collapse":1,
      //      "children": [
      //       {"name": "Second_3", "size": 10},
      //       {"name": "Second_3", "size": 10},
      // 			{"name": "Second_3", "size": 10},
      //       {"name": "Second_3", "size": 10},
      //       {"name": "Second_3", "size": 10},
      // 			{"name": "Second_3", "size": 10}
      //      ]
      //     },
      //     {
      //      "name": "Second_2",
      // 		 "color":3,
      // 		 "collapse":1,
      //      "children": [
      //       {"name": "Second_3", "size": 15}
      //      ]
      //     },
      // 		{
      //      "name": "Second_2",
      // 		 "color":3,
      //
      //
      //     },
      // 	{
      // 		"name": "Second_2",
      // 		"color":3,
      // 		"collapse":1,
      // 		"children": [
      // 			{"name": "Second_3", "size": 25},
      // 			{"name": "Second_3", "size": 25},
      // 			{"name": "Second_3", "size": 25}
      // 		]
      //     },
      // 	{
      // 		"name": "Second_2",
      // 		"color":3,
      // 		"collapse":1,
      // 		"children": [
      // 			{"name": "Second_3", "size": 30},
      // 			{"name": "Second_3", "size": 30},
      // 			{"name": "Second_3", "size": 30}
      // 		]
      //     },{
      //      "name": "Second_2",
      // 	 "color":3,
      // 	 "collapse":1,
      //      "children": [
      //       {"name": "Second_3", "size": 35},
      //       {"name": "Second_3", "size": 35}
      //      ]
      //     },{
      //      "name": "Second_2",
      // 	 "color":3,
      // 	 "collapse":1,
      //      "children": [
      //       {"name": "Second_3", "size": 40}
      //      ]
      //     }
      //    ]
      //   }
      //  ]
      // }

        start();


      function start(){
      	nodes = flatten(root),
      	links = d3.layout.tree().links(nodes);
      	for(var i=0; i<nodes.length; i++){
      		if(nodes[i].collapse){
      			// console.log(nodes[i].name);
      			toggle(nodes[i]);
      		}
      	}
      	restart();
      }

      function restart(){
      	nodes = flatten(root),
      	links = d3.layout.tree().links(nodes);
      	update();
      }

      function update() {
        // Restart the force layout.
        force
            .nodes(nodes)
            .links(links)
            .start();

        // Update links.
        link = link.data(links, function(d) { return d.target.id; });

        link.exit().remove();

        link.enter().insert("line", ".node")
            .attr("class", "link");

        // Update nodes.
        node = node.data(nodes, function(d) { return d.id; });

        node.exit().remove();

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .on("click", click)
            .on("mouseover", nodeOver)
            .on("mouseout", nodeOut)
            .call(force.drag);

        nodeEnter.append("image")
      	.attr("xlink:href", function(d) {

      		if(d.isTerminal == true){
            console.log(d.status , d.name);
            if (d.status != 200) {
              return "imgs/circle-128.png"
            }
      			return "imgs/wc-cr.png"; // terminal node
      		}else if(d.nodeOpen == false){
      			return "imgs/wc-p-cr.png"; // collapsed node
      		}else{
      			return "imgs/wc-m-cr.png";
      		}
      	})
          //attr("rx", 2)
      	//.attr("ry", 2)
        .attr("width", 25)
      	.attr("height", 25)
      	.append("svg:title")
      	 .text(function(d){return d._children ? "" : d.children ? "" : d.name;});


      	 node.select("image").attr("xlink:href", function(d) {
           if (d.status != 200) {
             return "imgs/circle-128.png"
           }
          if(d.isTerminal == true){
      			return "imgs/wc-cr.png"; // terminal node
      		}else if(d.nodeOpen == false){
      			return "imgs/wc-p-cr.png"; // collapsed node
      		}else{
      			return "imgs/wc-m-cr.png";
      		}
      	})


        nodeEnter.transition()
            .attr("width", function(d) { return d.children ? 4.5 : 3.5 ; })
      	  .attr("height", function(d) { return d.children ? 4.5 :3.5 ; });

        nodeEnter.append("text")
            .attr("dy", ".35em")
      	  .text(function(d) { return d._children ? d.name : d.children ? d.name : ""; });

      	node.select("circle")
      		.style("fill", color);
      	node.select("rect")
      		.style("fill", color);
      	//console.log(node.children);
      }

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
//        neighborArray = d3.set(neighborArray).keys();
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
            //return;
          }

          d3.selectAll(".hoverLabel").remove();
          d3.selectAll("image").style("opacity", 1).style("stroke", "black").style("stroke-width", "1px");
          d3.selectAll("line").style("opacity", .25);
  		      restart();
        }
      function tick() {
        link.attr("x1", function(d) { return d.source.x+12.5 ; })
            .attr("y1", function(d) { return d.source.y+12.5 ; })
            .attr("x2", function(d) { return d.target.x+12.5; })
            .attr("y2", function(d) { return d.target.y+12.5; });

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      }

      function color(d) {

      	if(d.isTerminal == true){
      		return "#9999ff"; // terminal node
      	}else if(d._children){
      		return "#4050ff"; // collapsed node
      	}else{
      		if(d.color==1){
      			return "rgb(64, 179, 255)"; // central node
      		}else if(d.color==2){
      			return "#0088ff"; // first tier node
      		}else{
      			return "#66aadd" // second tier node
      		}
      	}


      }

      function toggle(d) {
        if (d.children) {
      	   d.nodeOpen = false;
          d._children = d.children;
          d.children = null;
      } else {
      	d.nodeOpen = true;
          d.children = d._children;
          d._children = null;
        }
      }


      // Toggle children on click.
      function click(d){

        if (d3.event.defaultPrevented) return; // ignore drag
        toggle(d);
        restart();
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
    }
}]);
