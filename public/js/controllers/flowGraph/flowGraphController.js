mySPA.controller('flowGraphController', ['$scope', '$http', '$location', '$timeout', 'flowGraphServices','cfpLoadingBar','$window', function($scope,$http,$location,$timeout,flowGraphServices,cfpLoadingBar,$window) {

	$scope.executeGenerate = function(){
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
				openDialog("Flowgraph Generator", "ICE Engine is not available. Please run the batch file and connect to the Server.");
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
				//$scope.createGraph(obj);
				var slider = document.getElementById("slider-container");
				slider.remove();
				/*document.getElementById('path').value = '';
				openDialog("Flowgraph Generator", "Flowgraph generated succesfully.");*/
			}else if(obj.result == "fail"){
				$('#progress-canvas').fadeOut(800, function(){
					$scope.hideBaseContent = { message: 'false' };
					$scope.$apply();
				});
				document.getElementById('path').value = '';
				openDialog("Flowgraph Generator", "Failed to generate flowgraph.");
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
		/*var x = dotsPosition[currentDot].x;
		var y = dotsPosition[currentDot].y;
		currentDot++;
		var parentElem = document.createElement("div");
		parentElem.setAttribute("style", "left:"+x+"; top:"+y+"; position:absolute;");
		var icon = document.createElement("span");
		icon.setAttribute("id","toggle_"+currentDot);
		icon.setAttribute("class", "toggle-box");
		var t = document.createTextNode(obj.name);
		icon.appendChild(t);
		parentElem.appendChild(icon);
		document.getElementById("progress-canvas").appendChild(parentElem);
		icon.addEventListener("mouseover", onDotMouseOver, false);
		icon.addEventListener("mouseout", onDotMouseOut, false);
		function onDotMouseOver(e){
		  e.target.nextSibling.style.visibility = "";
		}

		function onDotMouseOut(e){
		  e.target.nextSibling.style.visibility = "hidden";
		}*/
		var x = dotsPosition[currentDot].x;
		var y = dotsPosition[currentDot].y;
		currentDot++;
		var parentElem = document.createElement("div");
		var elem = document.createElement("div");
		elem.setAttribute("class", "class_square");

		parentElem.setAttribute("style", "left:"+x+"; top:"+y+"; position:absolute;");
		var text = document.createElement("p");
		text.setAttribute("class", "className");
		var t = document.createTextNode(obj.name);
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
	}

	function openDialog(title, body) {
		$("#globalModal").find('.modal-title').text(title);
		$("#globalModal").find('.modal-body p').text(body).css('color', 'black');
		$("#globalModal").modal("show");
		setTimeout(function() {
			$("#globalModal").find('.btn-default').focus();
		}, 300);
	}
	
}]);
