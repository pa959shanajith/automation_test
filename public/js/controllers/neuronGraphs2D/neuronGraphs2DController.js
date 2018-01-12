mySPA.controller('neuronGraphs2DController', ['$scope', '$http', '$location', '$timeout', 'neuronGraphs2DService', 'ExecutionService', 'reportService', 'cfpLoadingBar', '$window', function($scope, $http, $location, $timeout, neuronGraphs2DService, ExecutionService, reportService, cfpLoadingBar, $window) {
    $("head").append('<link id="nGraphsCSS" rel="stylesheet" type="text/css" href="css/nGraphs.css" />')
    if (window.localStorage['navigateScreen'] != "neuronGraphs") window.location.href = "/";

    // colors for 3D
    var nodeColor = {
        "Domain": "#355264",
        "Project": "#A24178",
        "Release": "#CD7D40",
        "Cycle": "#A9B800",
        "TestSuite": "#FF9899",
        "TestScenario": "#E3CC4C",
        "TestCase": "#7BD2C9",
        "Screen": "#BDBEC0"
    };
    var legendKids = {
        "Domain": "#355264",
        "Project": "#A24178",
        "Release": "#CD7D40",
        "Cycle": "#A9B800",
        "Test Suite": "#FF9899",
        "Test Scenario": "#E3CC4C",
        "Test Case": "#7BD2C9",
        "Screen": "#BDBEC0"
    };
    //var nodeColor1={"Domain":"#AEC7E8","Project":"#FF7F0E","Release":"#1F77B4","Cycle":"#FFBB78","TestSuite":"#2CA02C","TestScenario":"#98DF8A","TestCase":"#D62728","Screen":"#FF9896"};
    // colors for 2D
    // var legendKids1 = {
    //     "Domain": "#1F77B4",
    //     "Project": "#AEC7E8",
    //     "Release": "#FF7F0E",
    //     "Cycle": "#FFBB78",
    //     "Test Suite": "#2CA02C",
    //     "Test Scenario": "#98DF8A",
    //     "Test Case": "#D62728",
    //     "Screen": "#FF9896"
    // };
    var legendKids1 = legendKids;

    //global variables
    var nodeTypes, rootIndex, enabledFilters, visibleNodeNames;
    var globalobj = {};
    var leveldict = {
        'Domain': 0,
        'Project': 1,
        'Release': 2,
        'Cycle': 3,
        'TestSuite': 4,
        'TestScenario': 5,
        'TestCase': 6,
        'Screen': 7
    };
    var levelrad = {0: 0,1: 0,2: 0,3: 0,4: 0,5: 0,6: 0,7: 0}; //radius of each level
    var togglelinksflag = false,
        togglelinkslist = [],
        viewPageName;

    globalobj['failed_tc_list'] = [];
    var nodeClickFlag, executeFlag;
    var nodeIdDict = {};
    //var memoryarray =[],fadearray=[];
    var s4R_global;
    var PI = Math.PI,
        fCos = Math.cos,
        fAcos = Math.acos,
        fSin = Math.sin,
        fAsin = Math.asin;

    $timeout(function() {
        console.log('timeout')
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
        document.getElementById("currentYear").innerHTML = new Date().getFullYear();
    }, 500);
    $scope.level = 10;

    $scope.assignTab = function(option) {
        console.log('assign tab')
        $scope.tab = option;
        $('.selectedIcon').removeClass('selectedIcon');
        if ($scope.tab == 'viewTab') {
            activeNode = undefined;
            $('#viewImg').addClass('selectedIcon');
            //drawGraph($scope.nodes,$scope.links,3);
            //$scope.loadNGraphs();
        } else if ($scope.tab == 'actionTab') {
            if (!globalobj['lockedSuite']) {
                $scope.assignTab('viewTab');
                openDialog('Error', 'Please Lock a suite to Execute first!');
                return;
            }
			//Show children and parent
			updateGraph($scope.nodes[globalobj['lockedSuite'].idx]);

            //camera.position.set(0, 0,s4R_global*100);
            $('#actionImg').addClass('selectedIcon');
            if (viewPageName == 'fullView') {
                activeNode = undefined;
                //buildExecutionGraph(globalobj['freezeNode']);
            }
        }
    }

    /*function updateGraph
     * use: clears the graph, shows children and parent of given suite
     */
	function updateGraph(suObj){
		if(viewPageName=='2DView'){
			$('.node').css("display","none");
			$('.link').css("display","none");
			$('#'+suObj.id).css("display","block");
			$('[class*=k-'+suObj.id+']').css('display','block');	//link start from this node
			//$('[id$=-'+ch.id+']').css('display','none');		//link ends to that node	

			var recusive_down_traverse = function(nObj, lvl) {
				if (nObj.children) {
					nObj.children.forEach(function(ch, chi) {
						//console.log('oohhhhhhhhhhh:::',ch)
						// recusive_down_traverse(ch, lvl + 1);
						$('#'+ch.idx).css('display','block');
						//$('class*=k-"'+ch.id+'"').css('display','none');	//link start from this node
						$('#link-'+nObj.idx+'-'+ch.idx).css('display','block');		//link ends to that node					
						//$('td[class$=Node]').css('display','inline'); //anywhere
						recusive_down_traverse(ch, 0);
					})
				}
			}
			recusive_down_traverse(suObj, 0);	

			var recusive_up_traverse = function(nObj, lvl) {
				if (nObj.parent) {
					nObj.parent.forEach(function(ch, chi) {
						$('#'+ch.idx).css('display','block');
						//$('class*=k-"'+ch.id+'"').css('display','none');	//link start from this node
						$('#link-'+ch.idx+'-'+nObj.idx).css('display','block');		//link ends to that node	
						recusive_up_traverse(ch, 0);	
					})
				}
			}
			recusive_up_traverse(suObj, 0);			
		}
		else{
			scene.getAllObjectByProperty('name', 'link').forEach(function(f, i) {
				f.visible = false;
			});
			scene.getAllObjectByProperty('class', 'node').forEach(function(f, i) {
				f.visible = false;
			});

			scene.getObjectByProperty('idx', suObj.idx).visible = true;
			scene.getAllObjectByProperty('start', suObj.idx).forEach(function(f, i) {
				f.visible = true;
			});
			var recusive_down_traverse = function(nObj, lvl) {
				if (nObj.children) {
					nObj.children.forEach(function(ch, chi) {
						//console.log('oohhhhhhhhhhh:::',ch)
						scene.getObjectByProperty('idx', ch.idx).visible = true;
						scene.getAllObjectByProperty('start', ch.idx).forEach(function(f, i) {
							f.visible = true;
							recusive_down_traverse(ch, lvl + 1);
						});
					})
				}
			}
			recusive_down_traverse(suObj, 0);

			var recusive_up_traverse = function(nObj, lvl) {
				if (nObj.parent) {
					nObj.parent.forEach(function(ch, chi) {
						//console.log('oohhhhhhhhhhh:::',ch)
						scene.getObjectByProperty('idx', ch.idx).visible = true;
						scene.getAllObjectByProperty('end', nObj.idx).forEach(function(f, i) {
							f.visible = true;
							recusive_up_traverse(ch, lvl + 1);
						});
					})
				}
			}
			recusive_up_traverse(suObj, 0);
			
		}	
	}


    /*function fullview
     * use: show all nodes and links to user (currently redundant)
     */
    // $scope.fullview = function(){
    // 	camera.position.set(0, 0,s4R_global*100);
    // 	camera.lookAt(new THREE.Vector3(0, 0, 0));
    // 	d3.selectAll('.node-nG').classed('no-disp',false).classed('node-nG-dimmed',false);
    // 	d3.selectAll('.link-nG').classed('allow-disp',true);
    // }


    /*function loadNGraphs
     * use: call loadNgraphs to load the graph
     */
    $scope.loadNGraphs = function(e) {
        viewPageName = 'fullView';
        $('#ct-canvas2').empty();
        $('#ct-canvas2').css('display', 'none');
        $('#ct-canvas').css('display', 'block');
        console.log('loadNgraphs called from tab: ', $scope.tab)
        if ($("#ct-expand-left").hasClass('ct-rev'))
            $("#ct-expand-left").trigger("click");
        if ($("#ct-expand-right").hasClass('ct-rev'))
            $("#ct-expand-right").trigger("click");
        blockUI('Loading...');
        $scope.clearData();
        loadGraphData();
    }

    /*function getCount
     * use: add legends on screen for 2d and 3d
     */
	function getCount(){
		var nc = {
			"Domain": 1,
			"Project": 0,
			"Release": 0,
			"Cycle": 0,
			"TestSuite": 0,
			"TestScenario": 0,
			"TestCase": 0,
			"Screen": 0
		};
		$scope.nodes.forEach(function(e,i){
			switch (e.type) {
				case 'Project':
					nc['Project'] = nc['Project']+1;
					break;
				case 'Release':
					nc['Release'] = nc['Release']+1;
					break;
				case 'Cycle':
					nc['Cycle'] = nc['Cycle']+1;
					break;
				case 'TestSuite':
					nc['TestSuite'] = nc['TestSuite']+1;
					break;
				case 'TestScenario':
					nc['TestScenario'] = nc['TestScenario']+1;
					break;
				case 'TestCase':
					nc['TestCase'] = nc['TestCase']+1;
					break;
				case 'Screen':
					nc['Screen'] = nc['Screen']+1;
					break;
			}
		})
		return nc;
	}

    /*function addLegends
     * use: add legends on screen for 2d and 3d
     */
    function addLegends() {
		var resultCount = {};
		resultCount = getCount(); 
        console.log('add legends')
        var i = 0,nodecolor_t;
        var elem;
        if (viewPageName == 'fullView') {
            elem = '#ct-canvas';
            nodecolor_t = legendKids;
        } else {
            elem = '#ct-canvas2';
            nodecolor_t = legendKids1;
        }
        var u = d3.select(elem).append('svg').attr('id', 'ct-legendBox').append('g').attr('transform', 'translate(10,10)');
        for (e in nodecolor_t) {
            t = u.append('g');
            t.append('rect').attr('style', 'fill:' + nodecolor_t[e]).attr('x', i).attr('y', -10).attr('width', 20).attr('height', 20).attr("rx", 6).attr("ry", 6);
            t.append('text').attr('style', 'font-size:12px').attr('x', i + 25).attr('y', 3).text(e);
			t.append('text').attr('style', 'font-size:10px;font-weight: bold;').attr('x', i).attr('y', 18).text(' '+resultCount[e.replace(" ","")] );
			i += 5.5*e.length+ 40;
        }
    }

    /*function clearData
     * use: clear nodes and links data
     */
    $scope.clearData = function() {
        console.log('clear data')
        delete $scope.nodes;
        delete $scope.fetchedData;
        $('#ct-canvas').children().remove()
    };

    /*function clearLinks
     * use: clear links
     */
    $scope.clearLinks = function() {
		var flagT = false;
		scene.getAllObjectByProperty('name', 'link').forEach(function(f, i) {
			if(f.visible == true){
				flagT = true;
			}
		});
		if(flagT){
			scene.getAllObjectByProperty('name', 'link').forEach(function(f, i) {
				if(f.visible == true){
					togglelinkslist.push(f);
					f.visible = false;
				}
        	});
		}
		else{
			// Reverse clear link steps
			togglelinkslist.forEach(function(f, i) {
			f.visible = true;
			});
			togglelinkslist = [];
		}
    };

    /*---------------Sidebar Toggle Starts Here---------------*/
    $(".lsSlide,.rsSlide").show();
    $("#ct-expand-left").click(function(e) {
        console.log('leftbar click')
        if ($("#ct-expand-left").hasClass("ct-rev")) $(".lsSlide").hide();
        else $(".lsSlide").show();
        $("#ct-expand-left").toggleClass("ct-rev");
        $("#ct-main").toggleClass("leftBarOpen");
    });

    $("#ct-expand-right").click(function(e) {
        console.log('rightbar click')
        if ($("#ct-expand-right").hasClass("ct-rev")) $(".rsSlide").hide();
        else $(".rsSlide").show();
        $("#ct-expand-right").toggleClass("ct-rev")
        $("#ct-main").toggleClass("rightBarOpen");
    });
    /*---------------Sidebar Toggle Ends Here---------------*/


    /*---------------Filter Objects Start Here---------------*/
    $(document).on("click", ".filterObjects", function() {
        togglelinkslist = [];
        console.log('filter objects')
        enabledFilters = [];
        $('.popupContent-filter-active').each(function() {
            enabledFilters.push($(this).data('tag'));
        });
        applyFilters(1);
    });

    $("#selectAllFilters span.selectAllTxt").on("click", function() {
        applyFilters(0);
    });
    $("#selectAllFilters input.checkStyleboxFilter").on("click", function() {
        applyFilters(0);
    });

    /*function applyFilters
     * use: filters selective node elements from the screen
     */
    function applyFilters(k) {
        if (k == 0 || enabledFilters.length == 0) {
            enabledFilters = [];
			$('.node').css('display','block');
			$('.link').css('display','block');
            scene.getAllObjectByProperty('class', 'node').forEach(function(e, i) {
                e.visible = true;
            })
        } else {
			if(viewPageName == '2DView'){
				$('.node').css('display','none');
				$('.link').css('display','none');
				for (var i = 0, l = enabledFilters.length; i < l; i++) {
						$('.node-'+enabledFilters[i]).css('display','block');
				}				
			}
			else{
				scene.getAllObjectByProperty('class', 'node').forEach(function(e, i) {
					e.visible = false;
				})
				for (var i = 0, l = enabledFilters.length; i < l; i++) {
					scene.getAllObjectByProperty('label', enabledFilters[i]).forEach(function(e, i) {
						e.visible = true;
					})
				}
			}
        }
        //if(activeNode!==undefined) highlightNodes(d3.select(activeNode).datum());
    };

    /*---------------Filter Objects Ends Here---------------*/


    /*---------------Search Node Starts Here---------------*/
    //$(".slidePopup").click(function(e){
    $("#slidePopupSearchBox").click(function(e) {
        console.log('slidepopup search box')
        visibleNodeNames = [];
        //		d3.selectAll('.node-nG').each(function(d){if(!(d3.select(this).classed('no-disp'))) visibleNodeNames.push([d.idx,d.name]);});
		if(viewPageName == "2DView"){
			var visibleList = $('.node').filter(function() {return $(this).css('display') !== 'none';});
			for (var i = 0; i < visibleList.length; i++) { 
    			visibleNodeNames.push([visibleList[i].id, $scope.nodes[visibleList[i].id].name]);
			}
		}else{
			scene.getAllObjectByProperty('class', 'node').forEach(function(e) {
				if (e.visible == true) visibleNodeNames.push([e.idx, e.name]);
			});
		}

        $('#popupSearchResult').empty();
        $timeout(function() {
            $(".searchInputNodes").val('').focus();
        }, 5);
    });

    $(".searchInputNodes").on('keyup', function(e) {
        console.log('search input nodes keyup')
        e = e || window.event;
        var searchKey = $(this).val().toLowerCase();
        var searchResults = '';
        visibleNodeNames.forEach(function(o) {
            if (o[1].toLowerCase().indexOf(searchKey) > -1) searchResults += "<span class='searchNodeItem' data-lindex=" + o[0] + ">" + o[1] + "</span>";
        });
        $('#popupSearchResult').html(searchResults);
    });

    $(document).on("click", ".searchNodeItem", function(e) {
        console.log('searchnodeitem click e: ', e)

		if(viewPageName == "2DView"){
			// var xvp = d3.select("#container-2d").attr("transform").split(/[()]/)[1].split(',')[0];
			// var yvp = d3.select("#container-2d").attr("transform").split(/[()]/)[1].split(',')[1];
			// var scale = (d3.select("#container-2d").attr("transform").split(/[()]/)[3]);

			// var xvp1 = $('#'+$(e.target).attr('data-lindex')).attr('transform').split(/[()]/)[1].split(',')[0];
			// var yvp1 = $('#'+$(e.target).attr('data-lindex')).attr('transform').split(/[()]/)[1].split(',')[1];
			// if(scale)
			// 	d3.select("#container-2d").attr("transform","translate("+(xvp-xvp1+($('#rect-2d').width()*scale/2))+","+(yvp-yvp1+($('#rect-2d').height()*scale/2)) +")scale(" +scale+ ")");
			$('.activenode').removeClass('activenode');
			$('#'+$(e.target).attr('data-lindex')).addClass('activenode');
		}
		else{
			nodeClick_NG(scene.getObjectByProperty('idx', $(this).data("lindex")), false);
		}
		
    });
    /*---------------Search Node Ends Here---------------*/

    /*---------------Data Processing Logic Starts Here---------------*/
    /*function loadGraphData
     * use: calls a service to fetch data from db
     */
    function loadGraphData() {
        if (window.localStorage['_UI']) {
            var userInfo = JSON.parse(window.localStorage['_UI']);
            var userid = userInfo.user_id;
            neuronGraphs2DService.getGraphData(userid).then(function(data) {
                //console.log('DATA SIZE::: ',roughSizeOfObject(data));
                if (data.err && data.ecode == "INVALID_SESSION") window.location.href = "/";
                else if (data.err) {
                    unblockUI();
                    blockUI(data.msg);
                    // $timeout(function() {
                    //     unblockUI();
                    // }, 3000);
                    console.error(data.ecode);
                    return false;
                }
                $("#ct-canvas").show();
                $scope.fetchedData = data;
                nodeTypes = data.type;
                rootIndex = data.root;
                $scope.nodes = bindData(data.nodes, data.links);

                // That is when using 3D
                setPositionsSemi3D($scope.nodes, rootIndex);
                //unblockUI();
                $scope.links = data.links;
                // nginit($scope.nodes,data.links,$scope.level);
                // animate();
                init();
                $('#actionImg2d').removeClass('highlightOpt');
                $('#actionImg').addClass('highlightOpt');
				addLegends();
            }, function(error) {
                unblockUI();
                console.error("Error:", error)
            });
        }
    }

    /*function bindData
     * use: parses the data in desired format
     */
    function bindData(no, lo) {
        m = JSON.parse(JSON.stringify(no));
        m.forEach(function(n, i) {
            n.children = [];
            n.parent = [];
            n._children = [];
            n._parent = [];
            nodeIdDict[n.id] = i;
        });
        lo.forEach(function(l) {
            var s = nodeIdDict[l.start];
            var t = nodeIdDict[l.end];
            if (m[s].children.indexOf(m[t]) == -1)
                m[s].children.push(m[t]);
            if (m[t].parent.indexOf(m[s]) == -1)
                m[t].parent.push(m[s]);
        });
        return m;
    };

    /*---------------Data Processing Logic Ends Here---------------*/

    /*---------------Positioning Logic Starts Here---------------*/
    /*function getDimms
     * use: returns dimensions of webelement
     */
    function getDimms(t) {
        return [parseInt($(t).css('width')), parseInt($(t).css('height'))];
    };

    /*function getDimms
     * use: returns n almost equidistant 3D cords
     */
    function getN3DCoords(n, radius) {
        coordsList = [];
        dl = PI * (3 - Math.sqrt(5));
        dz = 2.0 / n;
        l = 0;
        z = 1 - dz / 2;
        for (k = 0; k < n; k++) {
            r = Math.sqrt(1 - z * z);
            c = [fCos(l) * r, fSin(l) * r, z];
            c.forEach(function(e, i) {
                c[i] = e * radius
            });
            coordsList.push(c);
            z = z - dz;
            l = l + dl;
        }
        return coordsList;
    };

    /*function setPositionsSemi3D
     * use: assigns 3d position to each node
     */
    function setPositionsSemi3D(data, iRoot) {
        var index = data.map(function(e) {
            return e.idx;
        }).indexOf(iRoot);
        var rObj, np, pCord, nr, rCord, rc_c, rtfi, rCord_2d, ncy, cyCord, cyc_c, cytfi, cyCord_2d, tmp;
        var s1R = 4,
            s2R = 10,
            s3R = 20,
            s4R = 30;
        var P_cords, R_cords, C_cords, TS_cords, TSc_cords, TC_cords, S_cords;
        var total_P = 0,
            total_R = 0,
            total_C = 0,
            total_TS = 0,
            total_TSc = 0,
            total_TC = 0,
            total_S;
        var totalcount = 0,
            idx_r = 0,
            idx_c = 0,
            idx_ts = 0,
            idx_scn = 0,
            idx_tc = 0,
            idx_scr = 0;
        rObj = data[iRoot];
        total_P = rObj.children.length;
        total_R = $scope.nodes.filter(function(obj) {
            return obj.type == "Release";
        }).length;
        total_C = $scope.nodes.filter(function(obj) {
            return obj.type == "Cycle";
        }).length;
        total_TS = $scope.nodes.filter(function(obj) {
            return obj.type == "TestSuite";
        }).length;
        total_TSc = $scope.nodes.filter(function(obj) {
            return obj.type == "TestScenario";
        }).length;
        total_TC = $scope.nodes.filter(function(obj) {
            return obj.type == "TestCase";
        }).length;
        total_S = $scope.nodes.filter(function(obj) {
            return obj.type == "Screen";
        }).length;
        s1R = 1.2 * (Math.ceil(Math.sqrt(total_P)) + 1);
        s2R = 1.2 * (s1R + Math.ceil(Math.sqrt(total_R)) + 1);
        s3R = 1.2 * (s2R + Math.ceil(Math.sqrt(total_C)) + 1);
        s4R = 3 * (s3R + Math.ceil(Math.sqrt((total_TS + total_TSc + total_TC + total_S))));
        s4R_global = s4R;
        s1R = s4R / 4;
        s2R = 2 * s4R / 4;
        s3R = 3 * s4R / 4;
        levelrad[1] = s1R;
        levelrad[2] = s2R;
        levelrad[3] = s3R;
        levelrad[4] = s4R;
        levelrad[5] = s4R;
        levelrad[6] = s4R;
        levelrad[7] = s4R;
        P_cords = getN3DCoords(total_P, s1R)
        R_cords = getN3DCoords(Math.ceil(total_R * 1.2), s2R)
        Cy_cords = getN3DCoords(Math.ceil(total_C * 1.4), s3R)
        C_cords = getN3DCoords(Math.ceil((total_TS + total_TSc + total_TC + total_S) * 1.7), s4R)
        rObj.x = 0;
        rObj.y = 0;
        rObj.z = 0;

        if (rObj.children && rObj.children.length > 0) {
            np = rObj.children.length;
            rObj.children.forEach(function(prj, prjix) {
                prj.x = P_cords[prjix][0];
                prj.y = P_cords[prjix][1];
                prj.z = P_cords[prjix][2];
                if (prj.children && prj.children.length > 0) {
                    nr = prj.children.length;
                    rCord = getNClosestCords(prj, R_cords, nr, 1)
                    idx_r = 0;
                    prj.children.forEach(function(rel, relix) {
                        if (rel.x == undefined) {
                            rel.x = rCord[idx_r][0];
                            rel.y = rCord[idx_r][1];
                            rel.z = rCord[idx_r][2];
                            idx_r = idx_r + 1;
                        }
                        if (rel.children && rel.children.length > 0) {
                            ncy = rel.children.length;
                            cyCord = getNClosestCords(rel, Cy_cords, ncy, 1);
                            cyCord.forEach(function(c) {
                                var i = indexOfItem(Cy_cords, c);
                                Cy_cords.splice(i, 1);
                            })
                            totalcount = totalcount + cyCord.length;
                            idx_c = 0;
                            rel.children.forEach(function(cyc, cycix) {
                                if (cyc.x == undefined) {
                                    cyc.x = cyCord[idx_c][0];
                                    cyc.y = cyCord[idx_c][1];
                                    cyc.z = cyCord[idx_c][2];
                                    idx_c = idx_c + 1;
                                }

                                if (cyc.children && cyc.children.length > 0) {
                                    ntsc = cyc.children.length;
                                    tscCord = getNClosestCords(cyc, C_cords, ntsc, 1);
                                    tscCord.forEach(function(c) {
                                        var i = indexOfItem(C_cords, c);
                                        C_cords.splice(i, 1);
                                    })
                                    totalcount = totalcount + tscCord.length;
                                    idx_ts = 0;
                                    cyc.children.forEach(function(tsc, tscix) {
                                        if (tsc.x == undefined) {
                                            tsc.x = tscCord[idx_ts][0];
                                            tsc.y = tscCord[idx_ts][1];
                                            tsc.z = tscCord[idx_ts][2];
                                            idx_ts = idx_ts + 1;
                                        }

                                        if (tsc.children && tsc.children.length > 0) {
                                            nscn = tsc.children.length;
                                            scnCord = getNClosestCords(tsc, C_cords, nscn, 1);
                                            scnCord.forEach(function(c) {
                                                var i = indexOfItem(C_cords, c);
                                                C_cords.splice(i, 1);
                                            })
                                            totalcount = totalcount + scnCord.length;

                                            idx_scn = 0;
                                            tsc.children.forEach(function(scn, scnix) {
                                                if (scn.x == undefined) {
                                                    scn.x = scnCord[idx_scn][0];
                                                    scn.y = scnCord[idx_scn][1];
                                                    scn.z = scnCord[idx_scn][2];
                                                    idx_scn = idx_scn + 1;
                                                }

                                                if (scn.children && scn.children.length > 0) {
                                                    ntc = scn.children.length;
                                                    tcCord = getNClosestCords(scn, C_cords, ntc, 1);
                                                    tcCord.forEach(function(c) {
                                                        var i = indexOfItem(C_cords, c);
                                                        C_cords.splice(i, 1);
                                                    })
                                                    totalcount = totalcount + tcCord.length;
                                                    idx_tc = 0;
                                                    scn.children.forEach(function(tc, tcix) {
                                                        if (tc.x == undefined) {
                                                            tc.x = tcCord[idx_tc][0];
                                                            tc.y = tcCord[idx_tc][1];
                                                            tc.z = tcCord[idx_tc][2];
                                                            idx_tc = idx_tc + 1;
                                                        }
                                                        if (tc.children && tc.children.length > 0) {
                                                            nscr = tc.children.length;
                                                            scrCord = getNClosestCords(tc, C_cords, nscr, 1);
                                                            scrCord.forEach(function(c) {
                                                                var i = indexOfItem(C_cords, c);
                                                                C_cords.splice(i, 1);
                                                            })
                                                            totalcount = totalcount + scrCord.length;
                                                            idx_scr = 0;
                                                            tc.children.forEach(function(scr, scrix) {
                                                                if (scr.x == undefined) {
                                                                    scr.x = scrCord[idx_scr][0];
                                                                    scr.y = scrCord[idx_scr][1];
                                                                    scr.z = scrCord[idx_scr][2];
                                                                    idx_scr = idx_scr + 1;
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

    /*function setPositionsSemi3D
     * use: assigns 3d position to each node
     */
    function indexOfItem(array, item) {
        for (var i = 0; i < array.length; i++) {
            // This if statement depends on the format of your array
            if (array[i][0] == item[0] && array[i][1] == item[1] && array[i][2] == item[2]) {
                return i; // Found it
            }
        }
        openDialog("Error", "You shouldn't be here!")
        return -1; // Not found
    }

    /*function getNClosestCords
     * use: returns n closest object to a particular object
     */
    function getNClosestCords(nObj, cords, n, flag) {
        nObj.children.forEach(function(child) {
            if (child.x != undefined)
                n = n - 1;
        })
        var points = [];
        for (i = 0; i < cords.length; i++) {
            var point = cords[i];
            point.len = distanceBetweenPoints([point[0], point[1], point[2]], [nObj.x, nObj.y, nObj.z]);
            points.push(point);
        }
        if (flag)
            points.sort(function(a, b) {
                return (a.len > b.len) ? 1 : ((b.len > a.len) ? -1 : 0);
            });
        else
            points.sort(function(a, b) {
                return (a.len < b.len) ? 1 : ((b.len < a.len) ? -1 : 0);
            });
        return points.slice(0, n);
    }

    /*function distanceBetweenPoints
     * use: returns euler distance between objects
     */
    function distanceBetweenPoints(point1, point2) {
        //console.log('point1:',point1)
        //console.log('point2:',point2)
        var a = point1[0] - point2[0]
        var b = point1[1] - point2[1]
        var c = point1[2] - point2[2]
        return Math.sqrt(a * a + b * b + c * c);
    }

    /*---------------Positioning Logic Ends Here---------------*/

    /*---------------UI Logic Starts Here---------------*/
    var camera, scene, renderer, controls, root, activeNode;
    var plane, orbit, selectedObject;
    var offset = new THREE.Vector3();
    var stats;
    var control;
    var tmpVec1 = new THREE.Vector3();
    var tmpVec2 = new THREE.Vector3();
    var tmpVec3 = new THREE.Vector3();
    var tmpVec4 = new THREE.Vector3();
    var nodeImgDataURL = {};
    $scope.objects = []; //Nodes
    //$scope.objects_L=[]; //links

    /*function init
     * use: initialization of scene, camera parameters,scene and rendering
     */	
    function init() {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();

        // create a camera, which defines where we're looking at.
        canvDimm = getDimms('#ct-canvas');
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
        camera.position.z = 300;
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

        plane = new THREE.Mesh(new THREE.PlaneGeometry(500, 500, 18, 18), new THREE.MeshBasicMaterial({
            color: 0x008800,
            opacity: 0.80,
            transparent: true
        }));
        plane.visible = false;
        scene.add(plane);
        // add the output of the renderer to the html element
        renderer.setSize(canvDimm[0], canvDimm[1]);
        document.getElementById('ct-canvas').appendChild(renderer.domElement);

        control = new function() {
            this.merged = false;
            //this.rotationSpeed = 0.005;
            this.numberToAdd = 2000;
            this.clear = function() {
                if (scene.getObjectByName('mesh')) {
                    scene.remove(scene.getObjectByName('mesh'));
                }
                $scope.objects.forEach(function(e) {
                    scene.remove(e);
                    $scope.objects = [];
                    control.totalCubes = 0;
                });
            };

            this.addCubes = function() {
                control.clear();

                if (control.merged) {
                    var mergedGeometry = new THREE.Geometry();
                    if (scene.getObjectByName('merged')) {
                        scene.remove(scene.getObjectByName('merged'));
                    }
                    console.log("nodes: ", $scope.nodes);
                    for (var i = 0; i < $scope.nodes.length / 10; i++) {
                        mergeCube(mergedGeometry, i);
                    }
                    for (var i = 0; i < $scope.links.length / 10; i++) {
                        drawline($scope.links[i]);
                    }
                    var mesh = new THREE.Mesh(mergedGeometry, new THREE.MeshNormalMaterial({
                        opacity: 1,
                        transparent: true,
                    }));
                    mesh.name = 'merged';
                    scene.add(mesh);
                } else {
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
            this.merge = function() {
                var geom = new THREE.Geometry();
                $scope.objects.forEach(function(e) {
                    geom.merge();
                });
            };
        };
        // call the render function
        window.addEventListener('resize', onWindowResize, false);
        control.addCubes();
        animate();
    }


	/*--------------Event listeners for nodeclick event started----------------- */ 
    document.onmousedown = function(event, e) {
        // get the mouse positions
        var mouse_x = ((event.clientX - $('canvas').offset().left) / $('canvas').width()) * 2 - 1;
        var mouse_y = -((event.clientY - $('canvas').offset().top) / $('canvas').height()) * 2 + 1; //+ (window.innerHeight-$('canvas').height())/$('canvas').height();
        console.log("offset: ", (window.innerHeight - $('canvas').height()) / $('canvas').height());
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
        var intersects = raycaster.intersectObjects(scene.children.slice(2, 2 + $scope.nodes.length));
        var listobj = [];
        if (intersects.length > 0) {
            orbit.enabled = false;

            // the first one is the object we'll be moving around
            selectedObject = intersects[0].object;
            listobj = scene.getAllObjectByProperty('label', 'TestCase');
            // and calculate the offset
            // var intersects = raycaster.intersectObject(plane);
            // offset.copy(intersects[0].point).sub(plane.position);
            nodeClick_NG(selectedObject, event.ctrlKey);
        }
    };

    document.onmouseup = function() {
		if(viewPageName == '2DView')
			return;
        selectedObject = null;
        orbit.enabled = true;
    }

    document.onmousemove = function(event) {
		if(viewPageName == '2DView')
			return;
        // make sure we don't access anything else
        event.preventDefault();

        // get the mouse positions
        var mouse_x = ((event.clientX - $('canvas').offset().left) / $('canvas').width()) * 2 - 1;
        var mouse_y = -((event.clientY - $('canvas').offset().top) / $('canvas').height()) * 2 + 1; //+ (window.innerHeight-$('canvas').height())/$('canvas').height();
        // get the 3D position and create a raycaster
        var vector = new THREE.Vector3(mouse_x, mouse_y, 0);
        vector.unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position,
            vector.sub(camera.position).normalize());
        // if we haven't selected an object, we check if we might need
        // to reposition our plane. We need to do this here, since
        // we need to have this position before the onmousedown
        // to calculate the offset.
        var intersects = raycaster.intersectObjects(scene.children.slice(2, 2 + $scope.nodes.length));

        if (intersects.length > 0) {
            $("#ct-canvas").addClass('cursor-change');
            // now reposition the plane to the selected objects position
            plane.position.copy(intersects[0].object.position);
            // and align with the camera.
            plane.lookAt(camera.position);
            console.log("intersects: ", intersects);
            $('.tooltiptext').css('top', event.clientY + 15).css('left', event.clientX + 10);
            $('.tooltiptext').css('visibility', 'visible');
            $('.tooltiptext').html(intersects[0].object.name);
            nodeHover(intersects[0].object);
        } else {
            $('.tooltiptext').css('visibility', 'hidden');
            nodeHoverOut();
            $("#ct-canvas").removeClass('cursor-change');
        }
    };
	/*--------------Event listeners for nodeclick event ended----------------- */ 

    /*function mergeCube
     * use: adds nodes to scene with merged geometry 
     */		
    function mergeCube(mergeInto, i) {
        var cubeGeometry = new THREE.SphereGeometry(1, 30, 30);
        var translation = new THREE.Matrix4().makeTranslation($scope.nodes[i].x, $scope.nodes[i].y, $scope.nodes[i].z);
        cubeGeometry.applyMatrix(translation);

        mergeInto.merge(cubeGeometry);
    }

    /*function mergeCube
     * use: adds nodes to scene 
     */		
    function addCube(i) {

        //console.log("color: ",nodeColor[$scope.nodes[i].type]);
        //        var cubeMaterial = new THREE.MeshLambertMaterial({color:nodeColor[$scope.nodes[i].type]});
        var sphereList = ['TestCase', 'Screen', 'TestSuite', 'TestScenario', 'Cycle','Release'];
        if (sphereList.indexOf($scope.nodes[i].type) != -1){
            var cubeGeometry = addGeometry(i);
            var cubeMaterial = addMaterial(i);
        }
        else{
            var cubeGeometry = new THREE.SphereGeometry(1, 35, 35);
            var cubeMaterial = new THREE.MeshLambertMaterial({
                color: nodeColor[$scope.nodes[i].type]
            });
        }
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set($scope.nodes[i].x, $scope.nodes[i].y, $scope.nodes[i].z);
        cube.name = $scope.nodes[i].name;
        cube.idx = $scope.nodes[i].idx;
        cube.label = $scope.nodes[i].type;
        cube.class = 'node';
        cube.lookAt(new THREE.Vector3(0, 0, 0));
        //addRotation(i);
        scene.add(cube);
        //$scope.objects.push(cube);
    }

    /*function addGeometry
     * use: sets geometry parameters for node to be added
     */		
    function addGeometry(i) {
        var sphereList = ['TestCase', 'Screen', 'TestSuite', 'TestScenario', 'Cycle'];
        if (sphereList.indexOf($scope.nodes[i].type) != -1)
            var cubeGeometry = new THREE.SphereGeometry(1, 15, 15);
        else
            var cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
        return cubeGeometry;
    }

    /*function addMaterial
     * use: desides the material of each object
     */		
    function addMaterial(i) {
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

        var sphereList = ['TestCase', 'Screen', 'TestSuite', 'TestScenario', 'Cycle'];
        var cubeMaterial = new THREE.MeshLambertMaterial();
        cubeMaterial.transparent = true;
        if (sphereList.indexOf($scope.nodes[i].type) != -1) {
            cubeMaterial.map = THREE.ImageUtils.loadTexture('imgs/cubemap/' + $scope.nodes[i].type + '.png')
            //cubeMaterial.map = THREE.ImageUtils.loadTexture('imgs/cubemap/earthmap1k.jpg')		
        } else {
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
                    map: map_t
                }),
                new THREE.MeshLambertMaterial({
                    map: THREE.ImageUtils.loadTexture(url[5])
                })
            ];
        }

        return cubeMaterial;
    }

    // function addRotation(i){
    // 	cube.rotation.x += 0.2;
    // }

    /*function drawline
     * use: create link between nodes
     */	
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
        st = $scope.nodes.filter(function(obj) {
            return obj.id == lObj.start;
        })
        tt = $scope.nodes.filter(function(obj) {
            return obj.id == lObj.end;
        })
        var start = new THREE.Vector3(st[0].x, st[0].y, st[0].z);
        var end = new THREE.Vector3(tt[0].x, tt[0].y, tt[0].z);
        var curveQuad = new THREE.LineCurve3(start, end);

        var tube = new THREE.TubeGeometry(curveQuad, 1, 0.15, 3, false);
        var mesh = new THREE.Mesh(tube, new THREE.MeshLambertMaterial({
            color: '#aaaaaa',
            opacity: 0.9,
            transparent: true
        }));
        mesh.name = 'link';
        mesh.start = st[0].idx;
        mesh.end = tt[0].idx;
        scene.add(mesh);
        //$scope.objects_L.push(mesh);		
    }

    /*function animate
     * use: recursive function to update frame
     */	
    function animate() {
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

    /*function render
     * use: renders the scene
     */	
    function render() {
        renderer.render(scene, camera);
    }

    // function createStats() {
    //     var stats = new Stats();
    //     stats.setMode(0);

    //     stats.domElement.style.position = 'absolute';
    //     stats.domElement.style.left = '0px';
    //     stats.domElement.style.top = '0px';

    //     return stats;
    // }


    /*function onWindowResize
     * use:	window resize event to adjust graph on window resize
     */	
    function onWindowResize() {
        if (viewPageName == 'fullView') {
            canvDimm = getDimms('#ct-canvas');
            camera.aspect = canvDimm[0] / canvDimm[1];
            camera.updateProjectionMatrix();
            renderer.setSize(canvDimm[0], canvDimm[1]);
            render();
        } else {
            canvDimm = getDimms('#ct-canvas2');
            $("#ct-canvas2 > svg").attr("width", '"' + canvDimm[0] + 'px"').attr("height", '"' + canvDimm[1] + 'px"');
        }
    }

    /*function getDestinationCord
     * use:	returns camera destination cords after nodeclick for tween  update
     */	
    function getDestinationCord(nObj) {
        var cord = {
            x: 0,
            y: 0,
            z: 0
        };
        cord.x = nObj.position.x //*(levelrad[1+leveldict[nObj.type]]-levelrad[leveldict[nObj.type]]);
        cord.y = nObj.position.y //*(levelrad[1+leveldict[nObj.type]]-levelrad[leveldict[nObj.type]]);
        cord.z = nObj.position.z //*(levelrad[1+leveldict[nObj.type]]-levelrad[leveldict[nObj.type]]);
        var rad = Math.sqrt((cord.x * cord.x) + (cord.y * cord.y) + (cord.z * cord.z));
        var tf = convertCartesianToSpherical(cord, rad);
        if (leveldict[$scope.nodes[nObj.idx].type] < 4) {
            //var xyz = getGeoCoords(rad+(levelrad[1+leveldict[$scope.nodes[nObj.idx].type]]-levelrad[leveldict[$scope.nodes[nObj.idx].type]])+20,tf)
            var xyz = getGeoCoords(levelrad[1 + leveldict[$scope.nodes[nObj.idx].type]] + 30, tf)
        } else {
            var xyz = getGeoCoords(s4R_global + 30, tf)
        }
        cord.x = xyz[0];
        cord.y = xyz[1];
        cord.z = xyz[2];
        return cord;
    };

    /*function convertCartesianToSpherical
     * use:	cartesian to spherical cordinate conversion system
     */	
    function convertCartesianToSpherical(cord, radius) {
        polar = Math.acos(cord.z / radius)
        azimuthal = Math.atan2(cord.y, cord.x)
        return [azimuthal, polar];
    }

    /*function getGeoCoords
     * use:	spherical to cartesian cordinate conversion system
     */	
    function getGeoCoords(r, tf) {
        coords3d = [r * fCos(tf[0]) * fSin(tf[1]), r * fSin(tf[0]) * fSin(tf[1]), r * fCos(tf[1])];
        return coords3d;
    };

    /*function nodeClick_NG
     * use:	nodeclick event in 3d 
     */	
    function nodeClick_NG(e, ctrlkey) {
        togglelinkslist = [];
        activeNode = e;
        drawArc(e);
        nodeClickFlag = true;
		addInfo($scope.nodes[e.idx]);
        if ($scope.nodes[e.idx].type != 'Domain') {
            var from = {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            };
            var to = getDestinationCord(e);
            var tween = new TWEEN.Tween(from)
                .to(to, 700)
                .easing(TWEEN.Easing.Circular.Out)
                .onUpdate(function() {
                    camera.position.set(this._object.x, this._object.y, this._object.z);
                    camera.lookAt(new THREE.Vector3(0, 0, 0));
                }).onComplete(function() {
                    camera.lookAt(new THREE.Vector3(0, 0, 0));
                }).start();
        }

        if (ctrlkey) return; //Control is pressed then no expand collapse
        if (visibleChildLink(e)) { //collapse all
            var recusive_traverse = function(nObj, lvl) {
                if (nObj.children) {
                    nObj.children.forEach(function(ch, chi) {
                        //console.log('oohhhhhhhhhhh:::',ch)
                        scene.getObjectByProperty('idx', ch.idx).visible = false;
                        scene.getAllObjectByProperty('end', ch.idx).forEach(function(f, i) {
                            f.visible = false;
                            recusive_traverse(ch, lvl + 1);
                        });
                    })
                }
            }
            recusive_traverse($scope.nodes[e.idx], 0);
        } else { //Expand
            scene.getAllObjectByProperty('start', e.idx).forEach(function(f, i) {
                f.visible = true;
                scene.getObjectByProperty('idx', f.end).visible = true; // Check if no other visible link with parent
            })
            scene.getAllObjectByProperty('end', e.idx).forEach(function(f, i) {
                f.visible = true;
                scene.getObjectByProperty('idx', f.start).visible = true; // Check if no other visible link with parent
            })
        }
        $('.popupContent-filter-active').addClass('popupContent-default').removeClass('popupContent-filter-active')
    }

    /*function drawArc
     * use:	draws arc around activenode 
     */	
    function drawArc(nObj) {
        var remarc = scene.getObjectByName('circle');
        scene.remove(remarc);
        var cord = nObj.position;
        // smooth my curve over this many points
		var circleRadius = 1.05;
		var circleShape = new THREE.Shape();
		circleShape.moveTo( 0, circleRadius );
		circleShape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
		circleShape.quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius );
		circleShape.quadraticCurveTo( - circleRadius, - circleRadius, - circleRadius, 0 );
		circleShape.quadraticCurveTo( - circleRadius, circleRadius, 0, circleRadius );
		var extrudeSettings = { amount: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
		var geometry = new THREE.ExtrudeGeometry( circleShape, extrudeSettings );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: '#0000ff',opacity:0.15,transparent:true } ) );
		mesh.position.set( cord.x, cord.y, cord.z);
		mesh.lookAt(new THREE.Vector3(0, 0, 0));
		mesh.scale.set( circleRadius,circleRadius, circleRadius );
		mesh.name = 'circle';
		scene.add( mesh );
        scene.add(mesh);

    }

    /*function visibleChildLink
     * use:	checks if a child link is visible 
     */	
    function visibleChildLink(nObj) {
        var flag = false;
        scene.getAllObjectByProperty('start', nObj.idx).forEach(function(f, i) {
            if (f.visible == true) flag = true;
        })
        return flag;
    }

    /*function addInfo
     * use:	adds node information in info tab 
     */	
    function addInfo(d) {
        attrArr = "<strong>Group:</strong> " + d.type;
        for (attrs in d.attributes) {
            attrArr += "<br><strong>" + attrs + ":</strong> " + d.attributes[attrs];
        }
        d3.select('#window-pi p.proj-info-wrap').html(attrArr);
    };


    /*function nodeHover
     * use:	highlight links on hover 
     */	
    function nodeHover(nObj) {
        scene.getAllObjectByProperty('start', nObj.idx).forEach(function(e) {
            e.material.color = {
                r: 0.3,
                g: 0.3,
                b: 0.3
            };
        });
        scene.getAllObjectByProperty('end', nObj.idx).forEach(function(e) {
            e.material.color = {
                r: 0.3,
                g: 0.3,
                b: 0.3
            };
        });
    }

    /*function nodeHoverOut
     * use:	highlight links on hover out of node
     */	
    function nodeHoverOut() {
        scene.getAllObjectByProperty('name', 'link').forEach(function(e) {
            e.material.color = {
                r: 0.666,
                g: 0.666,
                b: 0.666
            };
        });
    }
    /*---------------UI Logic for 3D Ends Here---------------*/

    /*function lockSuite
     * use:	locks suite for execution
     */	
    $scope.lockSuite = function(e) {
        console.log("Locksuite e: ", activeNode);
        if (activeNode != undefined && (activeNode.label == 'TestSuite' || activeNode.type == 'TestSuite')) {
            globalobj['lockedSuite'] = activeNode;
            globalobj['jsondata'] = createExecutionJson();
            executeFlag = false;
            openDialog('Success', 'Suite locked for execution');
        } else
            openDialog('Error', 'Please select a Suite');
    };

    /*function createExecutionJson
     * use:	builds JSON to send to execution service
     */	
    function createExecutionJson() {
        globalobj['jsondata'] = [];
        var jsondata11 = [{
            "suiteDetails": [],
            "testsuitename": "",
            "testsuiteid": "",
            "browserType": ["1"],
            "NG": "true",
            "appType": "web"
        }]
        if (viewPageName == 'fullView' || viewPageName =='2DView')
            var lockedSuiteObj = [$scope.nodes[globalobj['lockedSuite'].idx]];
        else
            var lockedSuiteObj = $scope.nodes.filter(function(obj) {
                return obj.id == globalobj['lockedSuite'].id;
            });
        jsondata11[0].testsuitename = lockedSuiteObj[0].name;
        jsondata11[0].testsuiteid = lockedSuiteObj[0].attributes.testSuiteid;
        globalobj['testscenario_ids'] = lockedSuiteObj[0].attributes.testScenarioids;
        var i = 0;

        for (var k = 0; k < lockedSuiteObj[0].attributes.testScenarioids.length; k++) {
            var part1 = {
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
            part1.scenarioids = lockedSuiteObj[0].attributes.testScenarioids[k];
            jsondata11[0].suiteDetails.push(part1);
        }
        globalobj['jsondata'] = jsondata11;
        return jsondata11;
    }

    /*function execute
     * use:	calls execution service for execution
     */	
    $scope.execute = function(browserNum) {
        globalobj['jsondata'][0].browserType = [String(browserNum)]
        if ($("#ct-expand-left").hasClass('ct-rev'))
            $("#ct-expand-left").trigger("click");
        if ($("#ct-expand-right").hasClass('ct-rev'))
            $("#ct-expand-right").trigger("click");
        blockUI('Executing...')
        ExecutionService.ExecuteTestSuite_ICE(globalobj['jsondata']).then(function(data) {
                executeFlag = true;
                if (data == "Invalid Session") {
                    window.location.href = "/";
                }
                if (data == "Terminate") {
                    openDialog("Terminate", "execution Terminated")
                } else if (data == "unavailableLocalServer") {
                    openDialog('Error', "Execute Test Suite, ICE Engine is not available. Please run the batch file and connect to the Server.")
                } else {
                    openDialog("Success", "execution successful")
                    globalobj['module_id'] = globalobj['jsondata'][0].testsuiteid
                    for (a in data.TCS) {
                        if (data.TCS[a] == 'Fail' || data.TCS[a] == 'fail')
                            globalobj['failed_tc_list'].push(b)
                    }
                }

                unblockUI()
                if (!$("#ct-expand-left").hasClass('ct-rev'))
                    $("#ct-expand-left").trigger("click");
                if (!$("#ct-expand-right").hasClass('ct-rev'))
                    $("#ct-expand-right").trigger("click");

            },
            function(error) {
                unblockUI()
                openDialog("Execute Failed", "Failed to execute.")
            })
    }

    /*function openDialog
     * use:	dialog for errors, messages and information
     */	
    function openDialog(title, body) {
        $("#NeuronGraphGlobalModal").find('.modal-title').text(title);
        $("#NeuronGraphGlobalModal").find('.modal-body p').text(body).css('color', 'black');
        $("#NeuronGraphGlobalModal").modal("show");
        setTimeout(function() {
            $("#NeuronGraphGlobalModal").find('.btn-accept').focus();
        }, 300);
    }

	/*--------------End of 3d logic--------------------- */

	/*--------------Start of 2d logic--------------------- */
    $scope.twoDView = function() {
		/* -----------Building the pitch---------------- */
        viewPageName = '2DView';
        $("button[title='lock Hierarchy']").addClass('no-disp');
        $("button[title='Toggle Links']").addClass('no-disp');
        $('.ct-rev').trigger('click');
        $('#ct-canvas').empty();
        $('#ct-canvas').css('display', 'none');
        $('#ct-canvas2').css('display', 'block');
        $('#actionImg2d').addClass('highlightOpt');
        $('#actionImg').removeClass('highlightOpt');
		/* -----------Building pitch ends---------------- */

        //graph ={nodes:Array_of_obj,links:Array_of_obj} 

		/* -----------variable init---------------- */
        var node_t, link_t;
		$scope.node_tl = [];
		$scope.link_tl = [];
        var rating_t = {
            'Domain': 1,
            'Project': 10,
            'Release': 50,
            'Cycle': 90,
            'TestSuite': 150,
            'TestScenario': 200,
            'TestCase': 300,
            'Screen': 500
        };
		/* -----------variable init ends---------------- */

		/* -----------Data parsing logic---------------- */
        $scope.nodes.forEach(function(e, i) {
            node_t = {
                "name": e.name,
                "rating": rating_t[e.type],
                "id": e.idx,
                "type": e.type,
                "expand": true
            };
            $scope.node_tl.push(node_t);
        });
        $scope.links.forEach(function(e, i) {
            var st, tt;
            st = $scope.nodes.filter(function(obj) {
                return obj.id == e.start;
            })
            tt = $scope.nodes.filter(function(obj) {
                return obj.id == e.end;
            })
            link_t = {
                "source": st[0].idx,
                "target": tt[0].idx,
				"start": st[0].idx,
				"end": tt[0].idx,
                "value": 3,
                "label": "link"
            }
            $scope.link_tl.push(link_t);
        });
		$scope.node_tl = bindData($scope.node_tl,$scope.link_tl);
		// var tmp = flatten($scope.node_tl);
		// $scope.node_tl = tmp[0];

		//Each node extracted above has a children attribute.
		//from them, we can use a tree() layout function in order
		//to build a links selection.
		$scope.link_tl = d3.layout.tree().links($scope.node_tl);

		/* -----------Data parsing logic ends---------------- */

		/* -----------setting 2d graph properties and evets---------------- */
        var graph = {
            "nodes": $scope.node_tl,
            "links": $scope.link_tl
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

        var force = d3.layout.force()
            .charge(-2500)
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
            .attr("id", "svg-2d")
            .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
            .call(zoom);

        var rect = svg.append("rect")
			.attr("id","rect-2d")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all");

        var container = svg.append("g").attr("id","container-2d");
		/* -----------setting 2d graph properties completed---------------- */

        force.nodes(graph.nodes).links(graph.links).start();

		/* ------------------Adding objects to document------------------------- */
        var link = container.append("g")
            .attr("class", "links")
            .selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) {
                //console.log('LLL: ',d);
                return 1 + Math.sqrt(d.value);
            })
            .attr("id", function(d) {
                return 'link-' + d.source.id + '-' + d.target.id;
            });

        var node = container.append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("id", function(d) {
                return d.id;
            })
            .attr("class", function(d) {
                return "node " + "node-" + d.type;
            })
            .attr("cx", function(d) {
                return d.x;
            })
            .attr("cy", function(d) {
                return d.y;
            })
            .call(drag);

        // node.append("circle")
        //     .attr("r", function(d) {
        //         //return 12;
        //         return d.weight + 12;
        //     })
        //     .style("fill", function(d) {
        //         return color(1 / d.rating);
        //     }).append("svg:title")
        //     .text(function(d) {
        //         return d.type + ' : ' + d.name;
        //     });
        node.append("svg:image")
        .attr("xlink:href",  function(d) {console.log("Helloo",d); return "imgs/ngr-node_"+d.type+".svg";}) //d.img : url of image
        .attr("x", function(d) { return -25;})
        .attr("y", function(d) { return -25;})
        .attr("height", function(d){if(d.type=='Domain') return 80; else return 50;})
        .attr("width", function(d){if(d.type=='Domain') return 80; else return 50;})
        .append("svg:title")
        .text(function(d) {
            return d.type + ' : ' + d.name;
        });
		/* ------------------Adding objects to document completed------------------------- */

		/* ------------------Event listeners for 2d graph------------------------- */		
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
                .attr("r", d.weight + 20);
        }).on("mouseout", function(d) {
            node.classed("node-active", false);
            link.classed("link-active", false);

            d3.select(this).select("circle").transition()
                .duration(300)
                .attr("r", d.weight + 12);
        }).on("click", function(d) {
			addInfo($scope.nodes[d.id]);
			if (d3.event.defaultPrevented) return; // ignore drag
            console.log("d: ", d);
            activeNode = $scope.nodes[d.id];
			activeNode.id = activeNode.idx;
            d3.select('.activenode').classed('activenode', false);
            $('#'+activeNode.id).addClass('activenode');
			if(event.ctrlKey){		//Show parents on ctrl+click
				$scope.nodes[d.id].parent.forEach(function(ch, chi) {
					$('#'+ch.id).css('display','block');
					//$('class*=k-"'+ch.id+'"').css('display','none');	//link start from this node
					$('#link-'+ch.idx+'-'+d.id).css('display','block');		//link ends to that node					
					//$('td[class$=Node]').css('display','inline'); //anywhere
				})				
			}
			else if($('[id*=k-'+d.id+'-]').filter(function() {return $(this).css('display') !== 'none';}).length==0){
				expandNode(d);
			}
			else{
				collapseNode(d);
			}
			function expandNode(d){

				var recusive_down_traverse = function(nObj, lvl) {
					if (nObj.children) {
						nObj.children.forEach(function(ch, chi) {
							//console.log('oohhhhhhhhhhh:::',ch)
							// recusive_down_traverse(ch, lvl + 1);
							$('#'+ch.id).css('display','block');
							//$('class*=k-"'+ch.id+'"').css('display','none');	//link start from this node
							$('#link-'+nObj.id+'-'+ch.id).css('display','block');		//link ends to that node					
							//$('td[class$=Node]').css('display','inline'); //anywhere
						})
					}
				}
				recusive_down_traverse(d, 0);				
			}
			function collapseNode(d){
				var recusive_down_traverse = function(nObj, lvl) {
					if (nObj.children) {
						nObj.children.forEach(function(ch, chi) {
							//console.log('oohhhhhhhhhhh:::',ch)
							recusive_down_traverse(ch, lvl + 1);
							$('#'+ch.id).css('display','none');
							//$('class*=k-"'+ch.id+'"').css('display','none');	//link start from this node
							$('[id$=-'+ch.id+']').css('display','none');		//link ends to that node					
							//$('td[class$=Node]').css('display','inline'); //anywhere
						})
					}
				}
				recusive_down_traverse(d, 0);
			}
        });

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
        addLegends();
    }
	/* ------------------Event listeners for 2d graph ended------------------------- */		
	/*--------------End of 2d logic--------------------- */
	/*----End of code----*/
}]);