mySPA.controller('mindmapController', ['$scope', '$rootScope', '$http', '$location', '$timeout', 'chatbotService', 'mindmapServices', 'cfpLoadingBar', '$window', 'socket', function($scope, $rootScope, $http, $location, $timeout, chatbotService, mindmapServices, cfpLoadingBar, $window, socket) {

    //------------------Global Variables---------------------------//
    //Createmap//
    var activeNode, childNode, uNix, uLix, node, link, dNodes, dLinks, dNodes_c, dLinks_c, allMMaps, temp, rootIndex, faRef, nCount, scrList, tcList, mapSaved, zoom, cSpan, cScale, taskAssign, releaseResult, selectedProject;
    //unassignTask is an array to store whose task to be deleted
    var deletednode = [],
        unassignTask = [],
        deletednode_info = [];
    var versioning_enabled = 0;
    // node_names_tc keep track of testcase names to decide reusability of testcases
    var node_names_tc = [];
    var sections = {
        'modules': 112,
        'scenarios': 237,
        'screens': 363,
        'testcases': 488
    }; // from now mindmap levels will be divided into sections
    var saveFlag = false;
    //for handling the case when creatednode goes beyond screensize
    var CreateEditFlag = false;
    var isIE = /*@cc_on!@*/ false || !!document.documentMode;
    var IncompleteFlowFlag = false;
	var taskidArr = [], assignedObj = {};
    //Createmap//

    //Workflow//
    var uNix_W, uLix_W, dNodes_W, dLinks_W, allMMaps_W, temp_W, zoom_W, cSpan_W, cScale_W;
    var cur_module, allMaps_info, activeNode_W, childNode_W;
    //unassignTask is an array to store whose task to be deleted
    var deletednode_W = [];
    //node_names_tc keep track of testcase names to decide reusability of testcases
    var saveFlag_W = false;
    var collapseEteflag = true;
    //Workflow//
    //-------------------End of Global Variables-----------------------//

    var faRef = {
            "plus": "fa-plus",
            "plus1": "fa-hand-peace-o",
            "edit": "fa-pencil-square-o",
            "delete": "fa-trash-o"
        };

    //------------------Createmap.js---------------------//

    function loadMindmapData(param) {
        //param 0: normal , 1: normal with versioning, 2: end to end
        blockUI("Loading...");
        mindmapServices.populateProjects().then(function(res) {
                if (res == "Invalid Session") {
                    $rootScope.redirectPage();
                }
                if (res.projectId.length > 0) {
                    $(".project-list").empty();
                    for (i = 0; i < (res.projectId.length && res.projectName.length); i++) {
                        $('.project-list').append("<option app-type='" + res.appType[i] + "' data-id='" + res.projectName[i] + "' value='" + res.projectId[i] + "'>" + res.projectName[i] + "</option>");
                    }
                    if (!selectedProject)
                        selectedProject = res.projectId[0];

                    $(".project-list").val(selectedProject);
                    selectedProject = undefined;

                    if (param == 1) {
                        versioning_enabled = 1;
                        mindmapServices.getVersions($(".project-list").val()).then(
                            function(res){
                                addVersioning(res);
                            },function(err){
                                 console.log(err);
                                openDialogMindmap('Error', 'Error loading Versions')
                            })
                       
                    } else if(param == 0) {
                        loadMindmapData1(param);
                    }
                    else if(param == 2){
                        $('#eteSearchModules').val('');
                        if ($("img.iconSpaceArrow").hasClass("iconSpaceArrowTop")) {
                            $("img.iconSpaceArrow").removeClass("iconSpaceArrowTop");
                        }
                        loadMindmapData1_W();                        
                    }

                    $(".project-list").change(function() {
                        if(param == 2 ){
                            selectedProject = $("#selectProjectEtem").val();
                            //alert($(".project-list").val());
                            $('#eteSearchModules').val('');
                            if ($("img.iconSpaceArrow").hasClass("iconSpaceArrowTop")) {
                                $("img.iconSpaceArrow").removeClass("iconSpaceArrowTop");
                            }
                            loadMindmapData1_W();
                            return;
                        }
                        //Mindmap clear search box on selecting different project
                        dNodes_c = [] //Copied data should be cleared
                        dLinks_c = [] // on change of projet list
                        $('.fa.fa-pencil-square-o.fa-lg.plus-icon').removeClass('active-map');
                        $('#rect-copy').remove();
                        $('.fa.fa-clipboard.fa-lg.plus-icon').removeClass('active-map');
                        $('#searchModule-create').val('');
                        $('#searchModule-assign').val('');
                        selectedProject = $(".project-list").val();
                        if ($("img.iconSpaceArrow").hasClass("iconSpaceArrowTop")) {
                            $("img.iconSpaceArrow").removeClass("iconSpaceArrowTop");
                        }
                        if (param == 1) {
                            mindmapServices.getVersions($(".project-list").val()).then(
                            function(res){
                                addVersioning(res);
                            },function(err){
                                 console.log(err);
                                openDialogMindmap('Error', 'Error loading Versions')
                            })
                           
                        } else {
                            loadMindmapData1(param);
                        }
                    });
                    //Calling the function to restrict the user to give default node names
                    $("#ct-canvas").click(callme);
                    unblockUI();
                }
            }, function(error) {
                console.log("Error:", error);
                unblockUI();
            })
    }

    function loadMindmapData1(param) {
        blockUI("Loading...");
        var selectedTab = window.localStorage['tabMindMap'];
        uNix = 0;
        uLix = 0;
        dNodes = [];
        dLinks = [];
        nCount = [0, 0, 0, 0];
        scrList = [];
        tcList = [];
        cSpan = [0, 0];
        cScale = 1;
        mapSaved = !1;
        //Adding task to scenario
        taskAssign = {
            "modules_endtoend": {
                "task": ["Execute", "Execute Batch"],
                "attributes": ["bn", "at", "rw", "sd", "ed", "re", "cy", "re_estimation"]
            },
            "modules": {
                "task": ["Execute", "Execute Batch"],
                "attributes": ["bn", "at", "rw", "sd", "ed", "re", "cy", "re_estimation"]
            },
            "scenarios": {
                "task": ["Execute Scenario"],
                "attributes": ["at", "rw", "sd", "ed", "re_estimation"]
            },
            "screens": {
                "task": ["Scrape", "Append", "Compare", "Add", "Map"],
                "attributes": ["at", "rw", "sd", "ed", "re_estimation"]
            },
            "testcases": {
                "task": ["Update", "Design"],
                "attributes": ["at", "rw", "sd", "ed", "re_estimation"]
            }
        };
        zoom = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoomed);
        $('#ctExpandCreate').click(function(e) {
            toggleExpand(e, 'module');
        });

        $("#ctExpandAssign").click(function(e) {
            toggleExpand(e, 'Assign');
        });

        d3.select('#ct-main').on('contextmenu', function(e) {
            d3.event.preventDefault();
        });

        var svgTileG = d3.select('.ct-tile').append('svg').attr('class', 'ct-svgTile').attr('height', '150px').attr('width', '150px').append('g');
        var svgTileLen = $(".ct-svgTile").length;
        if (svgTileLen == 0) {
            $('#ct-mapSvg, #ct-canvas').empty();
            $('#ct-canvas').append(`<div id="minimap"></div>
                                <div class="ct-tileBox">
                                    <div class="ct-tile" title="Create Mindmap">
                                        <svg class="ct-svgTile" height="150px" width="150px">
                                            <g>
                                                <circle cx="75" cy="75" r="30"></circle>
                                                <path d="M75,55L75,95"></path>
                                                <path d="M55,75L95,75"></path>
                                            </g>
                                        </svg>
                                    </div>
                                <span class="ct-text">Create Mindmap</span>
                                </div>`);
            $(".ct-tile").click(function() {
                createNewMap();
            });
        }
        d3.select('#ct-assignBox').classed('no-disp', !0);
        var version_num = '';

        if (param == 1) {
            version_num = $('.version-list').val();
        }
        mindmapServices.getModules(versioning_enabled,window.localStorage['tabMindMap'], $(".project-list").val(),  parseFloat(version_num))
            .then(function(res) {
                var nodeBox = d3.select('.ct-nodeBox');
                $(nodeBox[0]).empty();
                //allMMaps = JSON.parse(result);
                allMMaps = res;
                allMMaps.forEach(function(e, i) {
                    //var t=e.name.replace(/_/g,' ');
                    var t = $.trim(e.name);
                    var img_src = 'images_mindmap/node-modules-no.png';
                    if (e.type == 'modules_endtoend') img_src = 'images_mindmap/MM5.png';
                    var node = nodeBox.append('div').attr('class', 'ct-node fl-left').attr('data-mapid', i).attr('title', t).on('click', loadMap);
                    node.append('img').attr('class', 'ct-nodeIcon').attr('src', img_src).attr('alt', 'Module').attr('aria-hidden', true);
                    node.append('span').attr('class', 'ct-nodeLabel').html(t);
                });
                if (selectedTab == 'tabCreate')
                    populateDynamicInputList();
                setModuleBoxHeight();
                unblockUI();

            }, function(error) {
                console.log("Error:::::::::::::", error);
                unblockUI();
            })
    }
    window.onresize = function() {
        var w = window.innerWidth - 28,
            h = window.innerHeight - 123;
        var mapSvg = d3.select('#ct-mapSvg').style('width', w + 'px').style('height', h + 'px');
    };

    function initiate() {
        var t, u;
        var selectedTab = window.localStorage['tabMindMap'];
        d3.select('.ct-tileBox').remove();
        if (d3.select('#ct-mindMap')[0][0] != null) return;
        if (selectedTab == "tabAssign") var canvas = d3.select('#ct-canvasforAssign');
        else var canvas = d3.select('#ct-canvas');
        u = canvas.append('div').attr('id', 'ct-inpBox').classed('no-disp', !0);
        u.append('input').attr('id', 'ct-inpPredict').attr('class', 'ct-inp');
        u.append('input').attr('id', 'ct-inpAct').attr('maxlength', '40').attr('class', 'ct-inp').on('change', inpChange).on('keyup', inpKeyUp);
        u.append('ul').attr('id', 'ct-inpSugg').classed('no-disp', !0);
        u = canvas.append('div').attr('id', 'ct-ctrlBox').classed('no-disp', !0);
        u.append('p').attr('class', 'ct-ctrl fa ' + faRef.plus).on('click', createNode).append('span').attr('class', 'ct-tooltiptext').html('');
        u.append('p').attr('class', 'ct-ctrl fa ' + faRef.plus1).on('click', createMultipleNode).append('span').attr('class', 'ct-tooltiptext').html('');
        u.append('p').attr('class', 'ct-ctrl fa ' + faRef.edit).on('click', editNode).append('span').attr('class', 'ct-tooltiptext').html('');
        u.append('p').attr('class', 'ct-ctrl fa ' + faRef.delete).on('click', deleteNode).append('span').attr('class', 'ct-tooltiptext').html('');
        u = canvas.append('div').attr('id', 'ct-assignBox').classed('no-disp', !0);
        u.append('div').attr('id', 'ct-assignTable');
        u.append('div').attr('class', 'ct-assignDetailsBox').append('textarea').attr('id', 'ct-assignDetails').attr('placeholder', 'Enter Details');
        u.append('div').attr('id', 'ct-assignButton').append('a').html('OK').on('click', addTask);
        u.append('div').attr('id', 'ct-unassignButton').append('a').html('Unassign').on('click', removeTask);
        // var mapSvgDiv = canvas.append('div').attr("class","ct-mapSvgContainer");
        // var mapSvg=mapSvgDiv.append('svg').attr('id','ct-mapSvg').call(zoom).on('click.hideElements',clickHideElements);
        var mapSvg = canvas.append('svg').attr('id', 'ct-mapSvg').call(zoom).on('click.hideElements', clickHideElements);
        var dataAdder = [{
            c: '#5c5ce5',
            t: 'Modules'
        }, {
            c: '#4299e2',
            t: 'Scenarios'
        }, {
            c: '#19baae',
            t: 'Screens'
        }, {
            c: '#efa022',
            t: 'Test Cases'
        }];
        u = canvas.append('svg').attr('id', 'ct-legendBox').append('g').attr('transform', 'translate(10,10)');
        dataAdder.forEach(function(e, i) {
            t = u.append('g');
            t.append('circle').attr('class', 'ct-' + (e.t.toLowerCase().replace(/ /g, ''))).attr('cx', i * 90).attr('cy', 0).attr('r', 10);
            t.append('text').attr('class', 'ct-nodeLabel').attr('x', i * 90 + 15).attr('y', 3).text(e.t);
        });
        u = canvas.append('svg').attr('id', 'ct-actionBox').append('g');
        t = u.append('g').attr('id', 'ct-saveAction').attr('class', 'ct-actionButton').on('click', actionEvent);
        t.append('rect').attr('x', 0).attr('y', 0).attr('rx', 12).attr('ry', 12);
        t.append('text').attr('x', 23).attr('y', 18).text('Save');
        if (selectedTab == "tabCreate") {
            t = u.append('g').attr('id', 'ct-createAction').attr('class', 'ct-actionButton disableButton').on('click', actionEvent);
            t.append('rect').attr('x', 100).attr('y', 0).attr('rx', 12).attr('ry', 12);
            t.append('text').attr('x', 114).attr('y', 18).text('Create');
        }
    };

    function zoomed() {
        cSpan = d3.event.translate;
        cScale = d3.event.scale;
        //Logic to change the layout
        d3.select("#ct-mindMap").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    };

    function getElementDimm(s) {
        return [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    };

    function createNewMap(e) {
        initiate();
        clearSvg();
        var s = getElementDimm(d3.select("#ct-mapSvg"));

        //X and y changed to implement layout change
        // switch-layout feature
        node = {
            id: uNix,
            childIndex: 0,
            name: 'Module_0',
            type: 'modules',
            y: s[1] * 0.4,
            x: s[0] * 0.1 * 0.9,
            children: [],
            parent: null
        };

        if ($('#switch-layout').hasClass('vertical-layout')) {
            node.y = s[0] * 0.1 * (0.9);
            node.x = s[1] * 0.4;
        };

        dNodes.push(node);
        nCount[0]++;
        uNix++;
        //To fix issue 710-Create a module and see that module name does not display in edit mode
        v = addNode(dNodes[uNix - 1], !1, null);
        childNode = v;
        editNode(e);
    };

    function loadMap(e) {
        if (!d3.select('#ct-mindMap')[0][0] || confirm('Unsaved work will be lost if you continue.\nContinue?')) {
            $('.fa.fa-pencil-square-o.fa-lg.plus-icon.active-map').trigger('click') //Remove copy rectangle
            $('.fa.fa-clipboard.fa-lg.plus-icon.active-map').trigger('click') //Disable paste
            saveFlag = false;
            //$('#ct-createAction').addClass('disableButton');
            SaveCreateED('#ct-createAction',1,0);
            $("div.nodeBoxSelected").removeClass("nodeBoxSelected");
            $(this).addClass("nodeBoxSelected");
            d3.select('#ct-inpBox').classed('no-disp', true);
            initiate();
            clearSvg();
            var reqMap = d3.select(this).attr('data-mapid');
            treeBuilder(allMMaps[reqMap]);
            IncompleteFlowFlag = false;
            var errTemp = false;
            if (dNodes[0].type != 'modules_endtoend')
                errTemp = treeIterator(undefined, dNodes[0], false);
            if (errTemp) {
                IncompleteFlowFlag = true;
            }
        }
    };

    // to load the map again after switching the layout
    function loadMap2() {
        var selectedTab = window.localStorage['tabMindMap'];
        if (selectedTab == 'mindmapEndtoEndModules') {
            var tbd = dNodes_W[0];
            initiate_W();
            clearSvg_W();
            treeBuilder_W(tbd);
        } else {
            var tbd = dNodes[0];
            initiate();
            clearSvg();
            treeBuilder(tbd);
        }
    };

    function genPathData(s, t) {
        return ('M' + s[0] + ',' + s[1] + 'C' + (s[0] + t[0]) / 2 + ',' + s[1] + ' ' + (s[0] + t[0]) / 2 + ',' + t[1] + ' ' + t[0] + ',' + t[1]);
    };

    var node_names_tc = [];

    function addNode(n, m, pi) {
        var selectedTab = window.localStorage['tabMindMap'];
        if (n.type == 'testcases') {
            node_names_tc.push(n.name);
        }

        var v = d3.select('#ct-mindMap').append('g').attr('id', 'ct-node-' + n.id).attr('class', 'ct-node').attr('data-nodetype', n.type).attr('transform', "translate(" + (n.x).toString() + "," + (n.y).toString() + ")");
        // To fix rendering issue in FF issue #415

        var img_src = 'images_mindmap/node-' + n.type + '.png';
        if(n.reuse && (n.type == 'testcases' || n.type=='screens')) img_src = 'images_mindmap/'+n.type+'-reuse.png';
        if (n.type == 'modules_endtoend') img_src = 'images_mindmap/MM5.png';
        if ($("#ct-canvas").attr('class') == 'tabCreate ng-scope') {
            var v_c = v.append('image').attr('height', '40px').attr('width', '40px').attr('class', 'ct-nodeIcon').attr('xlink:href', img_src);
            $(v_c.node()).on('click', nodeCtrlClick);
        } else {
            v.append('image').attr('height', '40px').attr('width', '40px').attr('class', 'ct-nodeIcon').attr('xlink:href', img_src).on('click', nodeClick);
        }

        n.display_name = n.name;
        var ch = 15;
        //Issue 697
        if (n.type == 'testcases') ch = 9;
        if ((n.name.length > 15 && n.type != 'modules' && n.type != 'modules_endtoend') || (n.name.length > 9 && n.type == 'testcases')) {

            n.display_name = n.display_name.slice(0, ch) + '...';
        }
        v.append('text').attr('class', 'ct-nodeLabel').text(n.display_name).attr('text-anchor', 'middle').attr('x', 20).attr('title', n.name).attr('y', 50);
        v.append('title').text(n.name);

        if (m && pi) {
            var p = d3.select('#ct-node-' + pi.id);
            //modified params for layout change
            // switch-layout feature
            if ($('#switch-layout').hasClass('vertical-layout')) {
                if (!p.select('circle.ct-cRight')[0][0]) {
                    p.append('circle').attr('class', 'ct-' + pi.type + ' ct-cRight ct-nodeBubble').attr('cx', 20).attr('cy', 55).attr('r', 4).on('click', toggleNode);
                }
                v.append('circle').attr('class', 'ct-' + n.type + ' ct-cLeft ct-nodeBubble').attr('cx', 20).attr('cy', -3).attr('r', 4); //.on('mousedown',moveNodeBegin).on('mouseup',moveNodeEnd);
                if (selectedTab == 'tabAssign')
                    v.append('circle').attr('class', 'ct-' + n.type + ' ct-cLeft ct-nodeBubble').attr('cx', -3).attr('cy', 20).attr('r', 4);
                else
                    v.append('circle').attr('class', 'ct-' + n.type + ' ct-cLeft ct-nodeBubble').attr('cx', -3).attr('cy', 20).attr('r', 4).on('mousedown', moveNodeBegin).on('mouseup', moveNodeEnd);
            } else {
                if (!p.select('circle.ct-cRight')[0][0]) {
                    p.append('circle').attr('class', 'ct-' + pi.type + ' ct-cRight ct-nodeBubble').attr('cx', 43).attr('cy', 20).attr('r', 4).on('click', toggleNode);
                }
                if (selectedTab == 'tabAssign')
                    v.append('circle').attr('class', 'ct-' + n.type + ' ct-cLeft ct-nodeBubble').attr('cx', -3).attr('cy', 20).attr('r', 4);
                else
                    v.append('circle').attr('class', 'ct-' + n.type + ' ct-cLeft ct-nodeBubble').attr('cx', -3).attr('cy', 20).attr('r', 4).on('mousedown', moveNodeBegin).on('mouseup', moveNodeEnd);
            }
        }
        return v;
    };

    function addLink(r, p, c) {
        //Modified parameters for layout change

        // switch-layout feature
        if ($('#switch-layout').hasClass('vertical-layout')) {
            var s = [p.x + 20, p.y + 55];
            var t = [c.x + 20, c.y - 3];
        } else {
            var s = [p.x + 43, p.y + 20];
            var t = [c.x - 3, c.y + 20];
        }
        var d = genPathData(s, t);
        var l = d3.select('#ct-mindMap').insert('path', 'g').attr('id', 'ct-link-' + r).attr('class', 'ct-link').attr('d', d);
    };
    //To Unassign the task of a particular node
    function removeTask(e) {
        if ($("#ct-unassignButton a").attr('class') == 'disableButton') return;
        var p = d3.select(activeNode);
        p.select('.ct-nodeTask').classed('no-disp', !0);
        var pi = parseInt(p.attr('id').split('-')[2]);
        var nType = p.attr('data-nodetype');
        if (dNodes[pi].oid != undefined && dNodes[pi].task != null) {
            unassignTask.push(dNodes[pi].oid)
        }
        d3.select('#ct-assignBox').classed('no-disp', !0);
    }

    function addTask(e) {
        $("ct-assignTask,#ct-assignedTo,#ct-assignRevw,#ct-assignRel,#ct-assignCyc").removeClass("selectErrorBorder");
        $("#startDate,#endDate").removeClass("inputErrorBorder"); 
        if ($("#ct-assignTask option:selected").val() == "Execute Batch" && $("#ct-executeBatch").val() == "") {
            $("#ct-executeBatch").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#ct-assignedTo option:selected").val() == "select user") {
            $("#ct-assignedTo").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#ct-assignRevw option:selected").val() == "select reviewer") {
            $("#ct-assignRevw").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#startDate").val() == "") {
            $("#startDate").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#endDate").val() == "") {
            $("#endDate").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#ct-assignRel option:selected").val() == "select release") {
            $("#ct-assignRel").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#ct-assignCyc option:selected").val() == "select cycle") {
            $("#ct-assignCyc").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#ct-assignDetails").val().trim() == "") {
            $("#ct-assignDetails").css('border', '').addClass("inputErrorBorderFull");
            return false;
        }
        
        var ed = $("#endDate").val().split('/');
        var sd = $("#startDate").val().split('/');
        start_date = new Date(sd[2] + '-' + sd[1] + '-' + sd[0]);
        end_date = new Date(ed[2] + '-' + ed[1] + '-' + ed[0]);
        var apptype=$('.project-list option:selected').attr('app-type');

        if (end_date < start_date) {
            $("#endDate").css('border', '').addClass("inputErrorBorderFull");
            return false;
        }
        d3.select('#ct-assignBox').classed('no-disp', !0);
        var a, b, p = d3.select(activeNode);
        var pi = parseInt(p.attr('id').split('-')[2]);
        var nType = p.attr('data-nodetype');
        tvn = 0;
        if ($('.version-list') !== undefined)
            tvn = $('.version-list').val();

        var estimationCount = 0;
        if (dNodes[pi].task != undefined || dNodes[pi].task != null) {
            if (dNodes[pi].task.endDate != "" || dNodes[pi].task.endDate != undefined || dNodes[pi].task.endDate != " ") {
                var nodeDateSplit = dNodes[pi].task.endDate.split("/");
                var modDateSplit = $('#endDate').val().split("/");
                if (new Date(nodeDateSplit[2], (nodeDateSplit[1] - 1), nodeDateSplit[0]) != new Date(modDateSplit[2], (modDateSplit[1] - 1), modDateSplit[0])) {
                    estimationCount = parseInt(dNodes[pi].task.re_estimation) + 1;
                }
            }
        }
        var tObj = {
            tvn: tvn,
            t: $('#ct-assignTask').val(),
            bn: $('#ct-executeBatch').val(),
            at: $('#ct-assignedTo').val(),
            rw: /*(d3.select('#ct-assignRevw')[0][0])?*/ $('#ct-assignRevw').val() /*:null*/ ,
            sd: $('#startDate').val(),
            ed: $('#endDate').val(),
            re_estimation: estimationCount,
            re: (d3.select('#ct-assignRel')[0][0]) ? $('#ct-assignRel').val() : null,
            cy: (d3.select('#ct-assignCyc')[0][0]) ? $('#ct-assignCyc').val() : null,
            det: d3.select('#ct-assignDetails').property('value'),
            app: $('option:selected', '.project-list').attr('app-type')
        };
        //console.log(tObj);
        if (dNodes[pi].task) {
            tObj.id = dNodes[pi].task.id;
            tObj.oid = dNodes[pi].task.oid;
            tObj.parent = dNodes[pi].task.parent;
        } else {
            tObj.id = null;
            tObj.oid = null;
            tObj.parent = null;
        }
        var taskflag = false;
        var errorRelCyc = false;
        var dateFlag = true;
        var reviewerFlag = true;
        if ($('#startDate').val() == null || $('#endDate').val() == null || $('#startDate').val() == '' || $('#endDate').val() == '') {
            dateFlag = false;
        }
        if (tObj.rw == 'select reviewer' || tObj.at == 'select user') {
            reviewerFlag = false;
        }
        if (dateFlag && reviewerFlag) {
            Object.keys(tObj).forEach(function(k) {
                if (tObj[k] === undefined) tObj[k] = null;
            });
            //if(p.select('.ct-nodeTask')[0][0]==null) p.append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
            if (nType == "modules" || nType == "modules_endtoend") {
                if (tObj.cy != 'select cycle' && tObj.re != 'select release') {
                    if (dNodes[pi].id_c != "null") {
                        dNodes[pi].task = {
                            taskvn: tObj.tvn,
                            id: tObj.id,
                            oid: tObj.oid,
                            batchName: tObj.bn,
                            task: tObj.t,
                            assignedTo: tObj.at,
                            reviewer: tObj.rw,
                            startDate: tObj.sd,
                            endDate: tObj.ed,
                            re_estimation: tObj.re_estimation,
                            release: tObj.re,
                            cycle: tObj.cy,
                            details: tObj.det,
                            parent: (tObj.parent != null) ? tObj.parent : [dNodes[pi].id_c]
                        };
                    }
                    //Logic to add tasks for the scenario
                    if (dNodes[pi].children) dNodes[pi].children.forEach(function(tSc) {
                        if (tSc.task === undefined || tSc.task == null) {
                            if (dNodes[pi].id_c != 'null' && tSc.id_c != 'null') {
                                taskflag = true;
                                //Issue- 711 Assign directly to the module and see that scenario gets assign but on click of "Save" scenario gets unassign.
                                tSc.task = {
                                    taskvn: tObj.tvn,
                                    id: null,
                                    oid: null,
                                    task: "Execute Scenario",
                                    assignedTo: tObj.at,
                                    reviewer: tObj.rw,
                                    startDate: tObj.sd,
                                    endDate: tObj.ed,
                                    re_estimation: tObj.re_estimation,
                                    release: tObj.re,
                                    cycle: tObj.cy,
                                    details: tObj.det,
                                    parent: (tObj.parent != null) ? tObj.parent : [dNodes[pi].id_c, tSc.id_c]
                                };
                                d3.select('#ct-node-' + tSc.id).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'images_mindmap/node-task-assigned.png').attr('x', 29).attr('y', -10);
                            }

                        } else {
                            //If any of the cassandra id in parent list of the task is null then update it
                            if (tSc.task.parent.indexOf(null) == -1 && tSc.task.parent != [dNodes[pi].id_c, tSc.id_c]) {
                                tSc.task['updatedParent'] = [dNodes[pi].id_c, tSc.id_c];
                            }

                        }
                        if (tSc.children != undefined) {
                            tSc.children.forEach(function(scr) {
                                if (scr.task === undefined || scr.task == null) {
                                    if (dNodes[pi].id_c != 'null' && tSc.id_c != 'null' && scr.id_c != 'null') {
                                        taskflag = true;
                                        if(apptype!="258afbfd-088c-445f-b270-5014e61ba4e2"){
                                            scr.task = {
                                                taskvn: tObj.tvn,
                                                id: null,
                                                oid: null,
                                                task: "Scrape",
                                                assignedTo: tObj.at,
                                                reviewer: tObj.rw,
                                                startDate: tObj.sd,
                                                endDate: tObj.ed,
                                                re_estimation: tObj.re_estimation,
                                                details: tObj.det,
                                                parent: [dNodes[pi].id_c, tSc.id_c, scr.id_c]
                                            };

                                            d3.select('#ct-node-' + scr.id).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'images_mindmap/node-task-assigned.png').attr('x', 29).attr('y', -10);
                                        }
                                    }

                                } else {
                                    if (scr.task.parent.indexOf(null) == -1 && scr.task.parent != [dNodes[pi].id_c, tSc.id_c, scr.id_c]) {
                                        scr.task['updatedParent'] = [dNodes[pi].id_c, tSc.id_c, scr.id_c];
                                    }

                                }

                                scr.children.forEach(function(tCa) {
                                    if (tCa.task === undefined || tCa.task == null) {
                                        if (dNodes[pi].id_c != 'null' && tSc.id_c != 'null' && scr.id_c != 'null' && tCa.id_c != 'null') {
                                            taskflag = true;
                                            tCa.task = {
                                                taskvn: tObj.tvn,
                                                id: null,
                                                oid: null,
                                                task: "Design",
                                                assignedTo: tObj.at,
                                                reviewer: tObj.rw,
                                                startDate: tObj.sd,
                                                endDate: tObj.ed,
                                                re_estimation: tObj.re_estimation,
                                                details: tObj.det,
                                                parent: [dNodes[pi].id_c, tSc.id_c, scr.id_c, tCa.id_c]
                                            };
                                            d3.select('#ct-node-' + tCa.id).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'images_mindmap/node-task-assigned.png').attr('x', 29).attr('y', -10);
                                        }
                                    } else {
                                        if (tCa.task.parent != [dNodes[pi].id_c, tSc.id_c, scr.id_c, tCa.id_c]) {
                                            tCa.task['updatedParent'] = [dNodes[pi].id_c, tSc.id_c, scr.id_c, tCa.id_c];
                                        }
                                        taskflag = true;
                                    }
                                });
                            });
                            //Removed a condition to fix assign issue in end to end flow
                        }

                    });
                } else {
                    taskflag = '';
                    errorRelCyc = true;
                }
            }
            //Logic to add tasks for the scenario
            else if (nType == "scenarios") {
                var modid = dNodes[pi].parent.id_c,
                    tscid = dNodes[pi].id_c;

                if (dNodes[pi].parent.task != null) {
                    var parentTask = dNodes[pi].parent.task;


                    if (tscid != 'null') {
                        dNodes[pi].task = {
                            taskvn: tObj.tvn,
                            id: tObj.id,
                            oid: tObj.oid,
                            task: tObj.t,
                            assignedTo: tObj.at,
                            reviewer: tObj.rw,
                            startDate: tObj.sd,
                            endDate: tObj.ed,
                            re_estimation: tObj.re_estimation,
                            release: parentTask.release,
                            cycle: parentTask.cycle,
                            details: tObj.det,
                            parent: (tObj.parent != null) ? tObj.parent : [modid, dNodes[pi].id_c]
                        };

                        if (dNodes[pi].parent.type == 'modules_endtoend') taskflag = true;
                    }


                    if (dNodes[pi].children) dNodes[pi].children.forEach(function(scr) {
                        //tSc.children.forEach(function(scr){
                        if (scr.task === undefined || scr.task == null) {
                            if (modid != 'null' && tscid != 'null' && scr.id_c != 'null') {
                                taskflag = true;
                                if(apptype!="258afbfd-088c-445f-b270-5014e61ba4e2"){
                                    scr.task = {
                                        taskvn: tObj.tvn,
                                        id: null,
                                        oid: null,
                                        task: "Scrape",
                                        assignedTo: tObj.at,
                                        reviewer: tObj.rw,
                                        startDate: tObj.sd,
                                        endDate: tObj.ed,
                                        re_estimation: tObj.re_estimation,
                                        details: tObj.det,
                                        parent: [modid, tscid, scr.id_c]
                                    };
                                    d3.select('#ct-node-' + scr.id).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'images_mindmap/node-task-assigned.png').attr('x', 29).attr('y', -10);
                                }
                            }

                        } else {
                            if (scr.task.parent != [modid, tscid, scr.id_c]) {
                                scr.task['updatedParent'] = [modid, tscid, scr.id_c];
                            }

                        }

                        scr.children.forEach(function(tCa) {
                            if (tCa.task === undefined || tCa.task == null) {
                                if (modid != 'null' && tscid != 'null' && scr.id_c != 'null' && tCa.id_c != 'null') {
                                    taskflag = true;
                                    tCa.task = {
                                        taskvn: tObj.tvn,
                                        id: null,
                                        oid: null,
                                        task: "Design",
                                        assignedTo: tObj.at,
                                        reviewer: tObj.rw,
                                        startDate: tObj.sd,
                                        endDate: tObj.ed,
                                        re_estimation: tObj.re_estimation,
                                        details: tObj.det,
                                        parent: [modid, tscid, scr.id_c, tCa.id_c]
                                    };
                                    d3.select('#ct-node-' + tCa.id).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'images_mindmap/node-task-assigned.png').attr('x', 29).attr('y', -10);
                                }
                            } else {
                                if (tCa.task.parent != [modid, tscid, scr.id_c, tCa.id_c]) {
                                    tCa.task['updatedParent'] = [modid, tscid, scr.id_c, tCa.id_c];
                                }
                                taskflag = true;
                            }
                        });
                        //});
                    });
                } else {
                    openDialogMindmap("Error", 'Assign task to the module')
                    return;
                }
            } else if (nType == "screens") {
                var modid = dNodes[pi].parent.parent.id_c,
                    tscid = dNodes[pi].parent.id_c,
                    scrid = dNodes[pi].id_c;
                if (dNodes[pi].id_c != 'null') {
                    dNodes[pi].task = {
                        taskvn: tObj.tvn,
                        id: tObj.id,
                        oid: tObj.oid,
                        task: tObj.t,
                        assignedTo: tObj.at,
                        reviewer: tObj.rw,
                        startDate: tObj.sd,
                        endDate: tObj.ed,
                        re_estimation: tObj.re_estimation,
                        details: tObj.det,
                        parent: (tObj.parent != null) ? tObj.parent : [modid, tscid, scrid]
                    };
                }

                if (tObj.parent != [modid, tscid, scrid]) {
                    dNodes[pi].task['updatedParent'] = [modid, tscid, scrid];
                }
                if (dNodes[pi].children) dNodes[pi].children.forEach(function(tCa) {
                    var cTask = (tObj.t == "Scrape" || tObj.t == "Append" || tObj.t == "Compare") ? "Design" : "Debug";
                    var tcid = tCa.id_c;
                    if (tCa.task === undefined || tCa.task == null) {
                        if (modid != 'null' && tscid != 'null' && scrid != 'null' && tcid != 'null') {
                            taskflag = true;
                            tCa.task = {
                                taskvn: tObj.tvn,
                                id: null,
                                oid: null,
                                task: cTask,
                                assignedTo: tObj.at,
                                reviewer: tObj.rw,
                                startDate: tObj.sd,
                                endDate: tObj.ed,
                                re_estimation: tObj.re_estimation,
                                details: tObj.det,
                                parent: [modid, tscid, scrid, tcid]
                            };
                            d3.select('#ct-node-' + tCa.id).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'images_mindmap/node-task-assigned.png').attr('x', 29).attr('y', -10);
                        }
                    } else {
                        if (tCa.task.parent != [modid, tscid, scrid, tcid]) {
                            tCa.task['updatedParent'] = [modid, tscid, scrid, tcid];
                        }
                        taskflag = true;
                    }
                });
            } else if (nType == "testcases") {
                var modid = dNodes[pi].parent.parent.parent.id_c,
                    tscid = dNodes[pi].parent.parent.id_c,
                    scrid = dNodes[pi].parent.id_c;
                var tcid = dNodes[pi].id_c;
                if (modid != 'null' && tscid != 'null' && scrid != 'null' && tcid != 'null') {
                    taskflag = true;
                    dNodes[pi].task = {
                        taskvn: tObj.tvn,
                        id: tObj.id,
                        oid: tObj.oid,
                        task: tObj.t,
                        assignedTo: tObj.at,
                        reviewer: tObj.rw,
                        startDate: tObj.sd,
                        endDate: tObj.ed,
                        re_estimation: tObj.re_estimation,
                        details: tObj.det,
                        parent: (tObj.parent != null) ? tObj.parent : [modid, tscid, scrid, tcid]
                    };
                    if (tObj.parent != [modid, tscid, scrid, tcid]) {
                        dNodes[pi].task['updatedParent'] = [modid, tscid, scrid, tcid];
                    }
                }
            }
        }
        if (!(dateFlag || reviewerFlag)) {
            openDialogMindmap("Date Error", "Please select User/Reviewer and Date ")
        } else if (dateFlag == false) {
            openDialogMindmap("Date Error", "Please select Date")
        } else if (reviewerFlag == false) {
            openDialogMindmap("Task Assignment Error", "Please select Reviewer/Assigned User")
        } else if (taskflag) {
            if (p.select('.ct-nodeTask')[0][0] == null) p.append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'images_mindmap/node-task-assigned.png').attr('x', 29).attr('y', -10);
        } else if (taskflag == false) {
            openDialogMindmap("Task Assignment Error", "Please create the structure before assigning task")
        }
        if (errorRelCyc) {
            openDialogMindmap("Task Assignment Error", "Please select Release/Cycle")
        }
		for (var i = 0; i < taskidArr.length; i++) {
			if (taskidArr[i].id == dNodes[pi].task.id) {
				if (dNodes[pi].task.task == "Execute" || dNodes[pi].task.task == "Execute Batch") {
					assignedObj[dNodes[pi].task.task] = $("#ct-assignedTo option:selected").text();
				} else if (dNodes[pi].task.task == "Execute Scenario") {
					assignedObj[dNodes[pi].task.task] = $("#ct-assignedTo option:selected").text();
				} else if (dNodes[pi].task.task == "Scrape" || dNodes[pi].task.task == "Append" || dNodes[pi].task.task == "Compare" || dNodes[pi].task.task == "Add" || dNodes[pi].task.task == "Map") {
					assignedObj[dNodes[pi].task.task] = $("#ct-assignedTo option:selected").text();
				} else if (dNodes[pi].task.task == "Design" || dNodes[pi].task.task == "Update") {
					assignedObj[dNodes[pi].task.task] = $("#ct-assignedTo option:selected").text();
				}
			}
		}
    };

    function nodeClick(e) {
        if (IncompleteFlowFlag) {
            openDialogMindmap('Error', 'Incomplete Flow!');
            return;
        }
        
        e = e || window.event;
        if (e) {
            e.cancelbubble = !0;
            if (e.stopPropagation) e.stopPropagation();
        }
        if (isIE) activeNode = this.parentNode;
        else activeNode = this.parentElement;
        var u, v, w, f, c = d3.select('#ct-assignBox');
        var p = d3.select(activeNode);
        var pi = parseInt(p.attr('id').split('-')[2]);
        var t = p.attr('data-nodetype');
        var flag = true;
        var apptype=$('.project-list option:selected').attr('app-type')
        if (t == 'scenarios' && dNodes[pi].parent.type == 'modules_endtoend') {
            flag = false;
        }else if(t == 'screens' && apptype=="258afbfd-088c-445f-b270-5014e61ba4e2"){
            openDialogMindmap('Error', 'Task disabled for Mainframe screen');
            return;
        }
        if (flag) {
            if (t != 'testcases' && (dNodes[pi]._children != null)) {
                //380-Mindmap-Unable to create node when parent node is collapsed .- Error msg changed to Expand the node
                openDialogMindmap('Error', 'Expand the node');
                return;
            } else if (t != 'testcases' && (dNodes[pi].children == null)) {
                openDialogMindmap('Error', 'Incomplete Flow');
                return;
            }
        }


        //if(t=='scenarios') return;
        var nt = (dNodes[pi].task !== undefined || dNodes[pi].task != null) ? dNodes[pi].task : !1;
        var tObj = {
            t: (nt) ? nt.task : '',
            bn: (nt) ? nt.batchName : '',
            at: (nt) ? nt.assignedTo : '',
            rw: (nt && nt.reviewer != null) ? nt.reviewer : '',
            sd: (nt) ? nt.startDate : '',
            ed: (nt) ? nt.endDate : '',
            re: (nt && nt.release != null) ? nt.release : '',
            cy: (nt && nt.cycle != null) ? nt.cycle : '',
            det: (nt) ? nt.details : ''
        };
        c.classed('no-disp', !1);
        //d3.select('#ct-assignDetails').property('value', tObj.det);
        d3.select('#ct-assignTable').select('ul').remove();
        u = d3.select('#ct-assignTable').append('ul');
        v = u.append('li');
        v.append('span').attr('class', 'ct-assignItem fl-left').html('Task');
        var d = v.append('select').attr('id', 'ct-assignTask');
        taskAssign[t].task.forEach(function(tsk, i) {
            $('#ct-assignTask').append("<option data-id='" + tsk + "' value='" + tsk + "'>" + tsk + "</option>");
        });
        if (tObj.t == null || tObj.t == "") {
            tObj.t = taskAssign[t].task[0];
        }
      
        $("#ct-assignTask option[value='" + tObj.t + "']").attr('selected', 'selected');

        if(tObj.det===null || tObj.det.trim() == ""){
            tObj.det=tObj.t+" "+dNodes[pi].type+" "+dNodes[pi].name
        }
        d3.select('#ct-assignDetails').property('value', tObj.det);

        $("#ct-assignTask").change(function() {
            if ($("#ct-assignTask").val() == 'Execute Batch') {
                $('#ct-executeBatch').removeAttr("disabled");
            } else {
                $('#ct-executeBatch').attr('disabled', 'true');
                $('#ct-executeBatch').val('');
            }
        })


        var default_releaseid = '';
        taskAssign[t].attributes.forEach(function(tk) {
            v = tk != 're_estimation' ? u.append('li') : v;
            //v=u.append('li');
            if (tk == "bn") {
                v.append('span').attr('class', 'ct-assignItem fl-left').html('Batch Name');

                var d = v.append('input').attr('type', 'text').attr('id', 'ct-executeBatch');
                $('#ct-executeBatch').attr('value', tObj.bn);
                if (tObj.t != 'Execute Batch') {
                    $('#ct-executeBatch').attr('disabled', 'true')
                }
            }
            if (tk == 'at') {
                var result1 = {};
                v.append('span').attr('class', 'ct-assignItem fl-left').html('Assigned to');
                var d = v.append('select').attr('id', 'ct-assignedTo'); //.attr('class','assignedTo')

                $('#ct-assignedTo').append("<option value='select user' >Select User</option>");
                //PAssing selected projectid to the service
                mindmapServices.populateUsers($(".project-list").val())
                    .then(function(res) {
                        for (i = 0; i < res.userRoles.length && res.r_ids.length; i++) {
                            $('#ct-assignedTo').append("<option data-id='" + res.userRoles[i] + "' value='" + res.r_ids[i] + "'>" + res.userRoles[i] + "</option>");
                        }
                        $("#ct-assignedTo option[value='" + tObj.at + "']").attr('selected', 'selected');
                    }, function(error) {
                        console.log("Error:::::::::::::", error);
                        unblockUI();
                    })

            } else if (tk == 'rw') {
                var result1 = {};
                v.append('span').attr('class', 'ct-assignItem fl-left').html('Reviewer');
                var d = v.append('select').attr('id', 'ct-assignRevw'); //.attr('class','reviwedBy');
                $('#ct-assignRevw').append("<option value='select reviewer' select=selected>" + "Select Reviewer" + "</option>");
                mindmapServices.populateUsers($(".project-list").val())
                    .then(function(res) {
                        for (i = 0; i < res.userRoles.length && res.r_ids.length; i++) {
                            $('#ct-assignRevw').append("<option data-id='" + res.userRoles[i] + "' value='" + res.r_ids[i] + "'>" + res.userRoles[i] + "</option>");
                        }
                        $("#ct-assignRevw option[value='" + tObj.rw + "']").attr('selected', 'selected');

                    }, function(error) {
                        console.log("Error:::::::::::::", error);
                        unblockUI();
                    })   

            } else if (tk == 'sd') {
                v.append('span').attr('class', 'ct-assignItem fl-left').html('Start Date');
                w = v.append('div').attr('class', 'ct-assignItem btn-group dropdown fl-right-assign dateBoxSd');
                // w.append('input').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignStart').html(tObj.sd);
                // w.append('button').attr('class','ct-asValBoxIcon ct-asItemCal btn dropdown-toggle').attr('data-toggle','dropdown').append('img').attr('src','images_mindmap/ic-datepicker.png').attr('alt','calIcon');
                w.append('input').attr('class', 'datepicker').attr('id', 'startDate');
                //$("img[src='images_mindmap/ic-datepicker.png']:not(.dateIcon)").remove();
                $(".dateBoxSd").append("<img id='dateIconStartDate' class='dateIcon' src='images_mindmap/ic-datepicker.png' />").attr('alt', 'calIcon');
                $('#startDate').datepicker({
                    format: "dd/mm/yyyy",
                    todayHighlight: true,
                    autoclose: true,
                    startDate: new Date()
                });
                $('#startDate').blur(function() {
                    $('#startDate').val($(this).val());
                });
                $('#dateIconStartDate').click(function() {
                    $("#startDate").datepicker("show");
                });
                f = w.append('ul').attr('class', 'ct-asValCalBox dropdown-menu'); //.on('click',$('.ct-asValBoxIcon.ct-asItemCal.btn.dropdown-toggle').datepicker());
                if (tObj.sd != '') {
                    $("#startDate").attr('disabled', 'disabled');
                }
                $("#startDate").val(tObj.sd);

            } else if (tk == 'ed') {
                v.append('span').attr('class', 'ct-assignItem fl-left').html('End Date');
                $(".fl-right-assign").append("<img src='images_mindmap/ic-datepicker.png' />").attr('alt', 'calIcon');
                w = v.append('div').attr('class', 'ct-assignItem btn-group dropdown fl-right-assign dateBoxEd');
                w.append('input').attr('class', 'datepicker').attr('id', 'endDate');
                $(".dateBoxEd").append("<img id='dateIconEndDate' class='dateIcon' src='images_mindmap/ic-datepicker.png' />").attr('alt', 'calIcon');
                $('#endDate').datepicker({
                    format: "dd/mm/yyyy",
                    todayHighlight: true,
                    autoclose: true,
                    startDate: new Date()
                });
                $('#dateIconEndDate').click(function() {
                    $("#endDate").datepicker("show");
                });
                f = w.append('ul').attr('class', 'ct-asValCalBox dropdown-menu'); //.on('click',$('.ct-asValBoxIcon.ct-asItemCal.btn.dropdown-toggle').datepicker());
                $("#endDate").val(tObj.ed);
            } else if (tk == 're') {
                var result1 = {};
                v.append('span').attr('class', 'ct-assignItem fl-left').html('Release');
                var d = v.append('select').attr('id', 'ct-assignRel');
                //'d4965851-a7f1-4499-87a3-ce53e8bf8e66'
                $('#ct-assignRel').append("<option value='select release' select=selected>" + "Select release" + "</option>");
                mindmapServices.populateReleases($(".project-list").val()).then(function(result) {
                    releaseResult = result;
                    default_releaseid = '';
                    for (i = 0; i < result.r_ids.length && result.rel.length; i++) {
                        $('#ct-assignRel').append("<option data-id='" + result.rel[i] + "' value='" + result.r_ids[i] + "'>" + result.rel[i] + "</option>");
                    }
                    $('#ct-assignRel').change(function() {
                        default_releaseid = $('#ct-assignRel').val();
                        loadCycles();
                    });
                    //var selectedRel=result1.r_ids[0];
                    var selectedRel = 'select release';
                    if (tObj.re != "") {
                        selectedRel = tObj.re;
                        //672 Mindmap - Cycle selected under execution task is getting reset to default value after save
                        default_releaseid = tObj.re;
                    }
                    $("#ct-assignRel option[value='" + selectedRel + "']").attr('selected', 'selected');
                    var result2 = {};
                    v.append('span').attr('class', 'ct-assignItem fl-left').html('Cycle');
                    var d = v.append('select').attr('id', 'ct-assignCyc');
                    $('#ct-assignCyc').append("<option value='select cycle' select=selected>" + "Select cycle" + "</option>");
                    mindmapServices.populateCycles(default_releaseid).then(function(result_cycles) {
                        var result2 = result_cycles;
                        for (i = 0; i < result2.c_ids.length && result2.cyc.length; i++) {
                            $('#ct-assignCyc').append("<option data-id='" + result2.cyc[i] + "' value='" + result2.c_ids[i] + "'>" + result2.cyc[i] + "</option>");
                        }
                        //var selectedCyc=result2.c_ids[0];
                        var selectedCyc = 'select cycle';
                        if (tObj.cy != "") {
                            selectedCyc = tObj.cy;
                        }
                        $("#ct-assignCyc option[value='" + selectedCyc + "']").attr('selected', 'selected');
                    }, function(error) {
                        console.log("Error in populating Cycles");
                    })
                    //display assign box after populating data
                }, function(error) {
                    console.log("Error in populating Releases");
                })



            }

        });
        //var cSize=getElementDimm(c);
        // Removed assgin box overflow (Himanshu)
        var cSize = [268, 386];
        if (t == 'modules' || t == 'modules_endtoend') cSize = [268, 452];
        //var cSize1=[270,386];
        var canvSize = getElementDimm(d3.select("#ct-mapSvg"));
        var split_char = ',';
        if (isIE) split_char = ' ';
        //Set position of assign box
        var l = p.attr('transform').slice(10, -1).split(split_char);
        l = [(parseFloat(l[0]) + 50) * cScale + cSpan[0], (parseFloat(l[1]) - 20) * cScale + cSpan[1]];
        if (canvSize[0] - l[0] < cSize[0]) l[0] = l[0] - cSize[0] - 60 * cScale;
        if (canvSize[1] - l[1] < cSize[1]) l[1] = canvSize[1] - cSize[1] - 10 * cScale;
        c.style('top', l[1] + 'px').style('left', l[0] + 'px');

        if (canvSize[1] - 25 < cSize[1]) {
            c.style('height', canvSize[1] - 25 + 'px').style('top', '0px').style('overflow', 'scroll');
        } else {
            c.style('height', 'auto');
        }
        if (l[1] < 0)
            l[1] = 0;
        else if (l[1] > canvSize[1] - cSize[1])
            l[1] = (canvSize[1] - cSize[1]) - 150;

        //condition to disable unassign task button
        setTimeout(function() {
            $('#ct-unassignButton a').addClass("disableButton");
            if (dNodes[pi].task != null && dNodes[pi].task != undefined && dNodes[pi].task.oid != null) {
                $('#ct-unassignButton a').removeClass("disableButton");
            }
        }, 30);
		var nodeClik = {};
		nodeClik.id = dNodes[pi].task.id;
		taskidArr.push(nodeClik);
    };

    function loadCycles() {
        $('#ct-assignCyc').empty();
        $('#ct-assignCyc').append("<option value='select cycle' select=selected>" + "Select cycle" + "</option>");
        //'46974ffa-d02a-49d8-978d-7da3b2304255'
        mindmapServices.populateCycles($("#ct-assignRel").val()).then(function(result_cycles) {
            var result2 = result_cycles;
            for (i = 0; i < result2.c_ids.length && result2.cyc.length; i++) {
                $('#ct-assignCyc').append("<option data-id='" + result2.cyc[i] + "' value='" + result2.c_ids[i] + "'>" + result2.cyc[i] + "</option>");
            }
            $("#ct-assignCyc option[value='" + result2.cyc[0] + "']").attr('selected', 'selected');
        }, function(error) {
            console.log("Error in populating Cycles");
            //callback(null, err);
        })

    }

    function nodeCtrlClick(e) {
        d3.select('#ct-inpBox').classed('no-disp', !0);
        e = e || window.event;
        if (e) {
            e.cancelbubble = !0;
            if (e.stopPropagation) e.stopPropagation();
        }
        if (isIE) activeNode = this.parentNode;
        else activeNode = this.parentElement;
        //In case of paste
        var activeNode_temp;
        if ($('#pasteImg1').hasClass('active-map')) {
            activeNode_temp = activeNode;
            if (d3.select(activeNode).attr('data-nodetype') == $($('.node-selected')[0]).attr('data-nodetype')) {
                if ($($('.node-selected')[0]).attr('data-nodetype') == 'scenarios') {
                    //paste to scenarios
                    //call createnode for each node
                    dNodes_c.forEach(function(e, i) {
                        activeNode = activeNode_temp;
                        if (e.type == 'screens') {
                            createNode({
                                name: e.name
                            });
                            activeNode = childNode[0][0];
                            dLinks_c.forEach(function(f, j) {
                                if (f.source.id == e.id) {
                                    createNode({
                                        name: f.target.name
                                    });
                                }
                            })
                        }

                    });
                } else if ($($('.node-selected')[0]).attr('data-nodetype') == 'modules') {
                    var activenode_scr;
                    //paste to module
                    //call createnode for each node
                    dNodes_c.forEach(function(e, i) {
                        if (e.type == 'scenarios') {
                            activeNode = '#ct-node-0';
                            createNode({
                                name: e.name
                            });
                            activeNode = childNode[0][0];
                            activenode_scr = activeNode;
                            dLinks_c.forEach(function(f, j) {
                                if (f.source.id == e.id && f.target.type == 'screens') {
                                    activeNode = activenode_scr;
                                    createNode({
                                        name: f.target.name
                                    });
                                    activeNode = childNode[0][0];
                                    dLinks_c.forEach(function(g, k) {
                                        if (g.source.id == f.target.id && g.source.type == 'screens') {
                                            createNode({
                                                name: g.target.name
                                            });
                                        }
                                    });
                                }
                            })
                        }

                    });
                }
                openDialogMindmap('Success', 'Pasted successfully');
            } else {
                openDialogMindmap('Error', 'Please select a Scenario to paste to..');
            }
            return;
        }


        var p = d3.select(activeNode);
        var t = p.attr('data-nodetype');
        var split_char = ',';
        if (isIE) split_char = ' ';
        var l = p.attr('transform').slice(10, -1).split(split_char);
        l = [(parseFloat(l[0]) + 40) * cScale + cSpan[0], (parseFloat(l[1]) + 40) * cScale + cSpan[1]];
        var c = d3.select('#ct-ctrlBox').style('top', l[1] + 'px').style('left', l[0] + 'px').classed('no-disp', !1);
        c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
        c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
        if (t == 'modules') {
            c.select('p.' + faRef.plus + ' .ct-tooltiptext').html('Create Scenarios');
            c.select('p.' + faRef.plus1 + ' .ct-tooltiptext').html('Create Multiple Scenarios');
            c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Module');
            //513-'Mindmap: When we delete an existing Module and create another module in the same work space  then a new Module instance is being appended .
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !0);
            //c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Module');
        } else if (t == 'scenarios') {
            c.select('p.' + faRef.plus + ' .ct-tooltiptext').html('Create Screens');
            c.select('p.' + faRef.plus1 + ' .ct-tooltiptext').html('Create Multiple Screens');
            c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Scenario');
            c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Scenario');
        } else if (t == 'screens') {
            c.select('p.' + faRef.plus + ' .ct-tooltiptext').html('Create Testcases');
            c.select('p.' + faRef.plus1 + ' .ct-tooltiptext').html('Create Multiple Testcases');
            c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Screen');
            c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Screen');
        } else if (t == 'testcases') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !0);
            c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Testcase');
            c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Testcase');
        }
    };

    function getNewPosition(node, pi, arr_co) {
        // Switch_layout functionality
        // **NOTE**
        //dNodes[pi].children are arranged in increasing
        // order of x/y disance depending on layout
        var layout_vertical = $('#switch-layout').hasClass('vertical-layout');
        if (dNodes[pi].children.length > 0) { // new node has siblings
            index = dNodes[pi].children.length - 1;
            if (layout_vertical)
                new_one = {
                    x: parseInt(dNodes[pi].children[index].x) + 80,
                    y: sections[node.type]
                }; // Go beside last sibling node
            else
                new_one = {
                    x: sections[node.type],
                    y: parseInt(dNodes[pi].children[index].y + 80)
                };
            node = getNonOverlappingPosition(node, arr_co, new_one);

        } else { //first kid of any node

            if (dNodes[pi].parent != null) { //if kid of scenario/testcase/screen
                arr = dNodes[pi].parent.children;
                index = dNodes[pi].parent.children.length - 1; //number of parents siblings - 1
                //new_one={x:parseInt(arr[index].x),y:parseInt(arr[index].y)+125};

                if (layout_vertical) {
                    new_one = {
                        x: parseInt(dNodes[pi].x),
                        y: parseInt(sections[node.type])
                    }; // go directly below parent
                } else {
                    new_one = {
                        x: parseInt(sections[node.type]),
                        y: parseInt(dNodes[pi].y)
                    }; // go directly below parent
                }
                node = getNonOverlappingPosition(node, arr_co, new_one);

            } else { //Module's kid
                //layout_change
                if (layout_vertical) {
                    node.x = parseInt(dNodes[pi].x);
                    node.y = parseInt(sections[node.type]);
                } else {
                    node.y = parseInt(dNodes[pi].y);
                    node.x = parseInt(sections[node.type]);
                }
            }

        }
        return node;
    }

    function getNonOverlappingPosition(node, arr_co, new_one) {
        var layout_vertical = $('#switch-layout').hasClass('vertical-layout');
        var dist = 0;
        dist = closestCord(arr_co, new_one);
        while (dist < 60) {
            if (layout_vertical) {
                new_one.x = new_one.x + 80;
            } else {
                new_one.y = new_one.y + 80;
            }
            dist = closestCord(arr_co, new_one);
        }
        node.x = new_one.x;
        node.y = new_one.y;
        return node;
    }

    function closestCord(arr_co, new_one) {
        var dmin = 1000;
        for (var i = 0; i < arr_co.length; i++) {
            var a = new_one.x - arr_co[i].x;
            var b = new_one.y - arr_co[i].y;
            var c = Math.sqrt(a * a + b * b);
            if (c < dmin)
                dmin = c;
        }
        return dmin;
    }

    function createNode(e) {

        //If module is in edit mode, then return do not add any node
        if (d3.select('#ct-inpBox').attr('class') == "") return;
        d3.select('#ct-inpBox').classed('no-disp', !0);
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        var p = d3.select(activeNode);
        var pt = p.attr('data-nodetype');
        if (pt == 'testcases') return;
        var pi = p.attr('id').split('-')[2];
        SaveCreateED('#ct-createAction',1,0);
        if (dNodes[pi]._children == null) {
            if (dNodes[pi].children == undefined) dNodes[pi]['children'] = [];
            var nNext = {
                'modules': ['Scenario', 1],
                'scenarios': ['Screen', 2],
                'screens': ['Testcase', 3]
            };
            var mapSvg = d3.select('#ct-mapSvg');
            var w = parseFloat(mapSvg.style('width'));
            var h = parseFloat(mapSvg.style('height'));
            //name:nNext[pt][0]+'_'+nCount[nNext[pt][1]]
            var arr_co = [];
            dNodes.forEach(function(d, i) {
                var objj = {
                    x: parseInt(d.x),
                    y: parseInt(d.y)
                };
                arr_co.push(objj);

            });
            // switch-layout feature
            if (e) {
                var tempName = e.name;
            } else {
                var tempName = nNext[pt][0] + '_' + nCount[nNext[pt][1]];
            }
            if ($('#switch-layout').hasClass('vertical-layout')) {
                node = {
                    id: uNix,
                    childIndex: '',
                    path: '',
                    name: tempName,
                    type: (nNext[pt][0]).toLowerCase() + 's',
                    y: h * (0.15 * (1.34 + nNext[pt][1]) + Math.random() * 0.1),
                    x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
                    children: [],
                    parent: dNodes[pi]
                };
            } else {
                node = {
                    id: uNix,
                    childIndex: '',
                    path: '',
                    name: tempName,
                    type: (nNext[pt][0]).toLowerCase() + 's',
                    y: h * (0.15 * (1.34 + nNext[pt][1]) + Math.random() * 0.1),
                    x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
                    children: [],
                    parent: dNodes[pi]
                };
            }

            node = getNewPosition(node, pi, arr_co); //pi: active node ID
            var curNode = node;
            dNodes.push(node);
            nCount[nNext[pt][1]]++;
            dNodes[pi].children.push(dNodes[uNix]);
            dNodes[uNix].childIndex = dNodes[pi].children.length;

            var currentNode = addNode(dNodes[uNix], !0, dNodes[pi]);
            if (currentNode != null) {
                childNode = currentNode;

                link = {
                    id: uLix,
                    source: dNodes[pi],
                    target: dNodes[uNix]
                };
                dLinks.push(link);
                addLink(uLix, dNodes[pi], dNodes[uNix]);
                uNix++;
                uLix++;

                //By default when a node is created it's name should be in ediatable mode
                CreateEditFlag = true;
                if (e);
                else
                    editNode(e, currentNode);
            }

        } else {
            openDialogMindmap('Error', 'Expand the node');
        }

    };

    //------Create Multiple Child Node-------//
    function createMultipleNode(){
        $("#addObjContainer").empty();
        $scope.errorMessage = "";
        $("#dialog-addObject").modal("show");
        //Add two nodes 
        $scope.addMoreNode();
        $scope.addMoreNode();
        $timeout(function(){$('.modal-backdrop.in').remove();},1000);

    }

    $scope.addMoreNode = function() {
        if($('.row.row-modal.addObj-row').length<10){
            var idxAddNode = 1+$('.row.row-modal.addObj-row').length;
            $("#addObjContainer").append(`<div class="row row-modal addObj-row">
                                                <form class="form-horizontal" role="form">
                                                        <div class="col-sm-2 addNode-label"><label>`+idxAddNode+`</label></div>
                                                        <div class="col-sm-6">
                                                        <input type="text" class="form-control form-control-custom" placeholder="Enter node name" maxlength="40">
                                                        </div>
                                                        <div class="col-sm-2 deleteAddObjRow"><img src="imgs/ic-delete.png" /></div>
                                                </form>
                                            </div>`);                                                                            
        }
        else{
            openDialogMindmap('Error','At a time only 10 nodes can be added');
        }
    };

    $scope.clearNodes = function() {
        $("input").val('');
        $("select").prop('selectedIndex', 0);
        $(".addObj-row").find("input").removeClass('inputErrorBorder')
        $(".addObj-row").find("select").removeClass('selectErrorBorder')
        $scope.errorMessage = "";
    }


    $(document).on("click", ".deleteAddObjRow", function() {
        $(this).parent().parent().remove();
        var tmpidx = 1;
        $('.addNode-label').each(function(){
            $(this).text(tmpidx);
            tmpidx=tmpidx+1;
        });
    });

    $scope.createNodes = function(){
        var nodeNames = [];
        $('.errBorder').removeClass('errBorder');
        $('input.form-control-custom').each(function() {
            nodeNames.push( $.trim($(this).val()));
            if(!validNodeDetails($.trim($(this).val()))){
                $(this).addClass('errBorder');
            }
        });
        if($('.errBorder').length==0){
            console.log("NodeNames:",nodeNames);
            nodeNames.forEach(function(node,i){
                createNode({name:node});
            });
            $("#dialog-addObject").modal("hide");
        }
    }

    //------End of Create Multiple Child Node-------//

    function editNode(e, node) {

        $('#ct-inpAct').removeClass('errorClass');
        d3.select('#ct-inpAct').classed('no-disp', !1);
        e = e || window.event;
        if (e) {
            e.cancelbubble = !0;
            if (e.stopPropagation) e.stopPropagation();
        }
        //logic to create the node in editable mode
        if (node == 0) {
            childNode = null;
            var p = d3.select(activeNode);
        } else var p = childNode;
        var pi = p.attr('id').split('-')[2];
        var t = p.attr('data-nodetype');
        var split_char = ',';
        if (isIE) split_char = ' ';
        var l = p.attr('transform').slice(10, -1).split(split_char);
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        if (p.select('.ct-nodeTask')[0][0] != null) {
            var msg = 'Unassign the task to rename';
            if (t == 'screens') {
                msg = 'Unassign the task to rename. And unassign the corresponding testcases tasks';
            }
            openDialogMindmap('Rename Error', msg);
            return;
        }

        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        var name = '';
        //By default when a node is created it's name should be in ediatable mode

        name = dNodes[pi].name;
        //name=p.text();
        l = [(parseFloat(l[0]) - 20) * cScale + cSpan[0], (parseFloat(l[1]) + 42) * cScale + cSpan[1]];
        // If editing right after the node is added and node goes beyond the screen size

        cSize = getElementDimm(d3.select("#ct-mapSvg"));
        if (CreateEditFlag == true && l[1] > cSize[1]) {
            CreateEditFlag = false;
            cSpanX = cSpan[0];
            cSpanY = cSpan[1];
            var temp = l[1];
            while (temp > cSize[1]) {
                temp = temp / 2;
                cSpanY = cSpanY - temp;
            }


            d3.select('#ct-mindMap').attr('transform', "translate(" + cSpanX + "," + cSpanY + ")scale(" + cScale + ")");
            //cSpan[0]=cSpan[0]-l[0]/2 //after edit mindmap doesn't move to orignal position
            l = p.attr('transform').slice(10, -1).split(split_char);
            l = [(parseFloat(l[0]) - 20) * cScale + cSpanX, (parseFloat(l[1]) + 42) * cScale + cSpanY];
        }

        // If created node is beyond screen size on horizontal side
        if (CreateEditFlag == true && l[0] > cSize[0]) {
            CreateEditFlag = false;
            cSpanX = cSpan[0];
            cSpanY = cSpan[1];
            var temp = l[0];
            while (temp > cSize[0]) {
                temp = temp / 2;
                cSpanX = cSpanX - temp;
            }
        }


        d3.select('#ct-inpBox').style('top', l[1] + 'px').style('left', l[0] + 'px').classed('no-disp', !1);
        d3.select('#ct-inpPredict').property('value', '');
        d3.select('#ct-inpAct').attr('data-nodeid', null).property('value', name).node().focus();
        d3.select('#ct-inpSugg').classed('no-disp', !0);
    };

    function deleteNode(e) {
        //If module is in edit mode, then return do not add any node
        if (d3.select('#ct-inpBox').attr('class') == "") return;
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        var s = d3.select(activeNode);
        //513-'Mindmap: When we delete an existing Module and create another module in the same work space  then a new Module instance is being appended .
        var t = s.attr('data-nodetype');
        if (t == 'modules') return;
        var sid = s.attr('id').split('-')[2];
        var p = dNodes[sid].parent;
        recurseDelChild(dNodes[sid]);
        for (j = dLinks.length - 1; j >= 0; j--) {
            if (dLinks[j].target.id == sid) {
                d3.select('#ct-link-' + dLinks[j].id).remove();
                dLinks[j].deleted = !0;
                break;
            }
        }
        p.children.some(function(d, i) {
            if (d.id == sid) {
                //var nodeDel=dNodes.pop(sid);
                p.children.splice(i, 1);
                return !0;
            }
            return !1;
        });
        if (p.children.length == 0) d3.select('#ct-node-' + p.id).select('.ct-cRight').remove();
    };

    function recurseDelChild(d) {
        if (d.children) d.children.forEach(function(e) {
            recurseDelChild(e);
        });
        d.parent = null;
        d.children = null;
        d.task = null;
        d3.select('#ct-node-' + d.id).remove();
        deletednode_info.push(d);
        if (d.oid != undefined) {
            deletednode.push(d.oid)
        }
        for (j = dLinks.length - 1; j >= 0; j--) {
            if (dLinks[j].source.id == d.id) {
                d3.select('#ct-link-' + dLinks[j].id).remove();
                dLinks[j].deleted = !0;
            }
        }
    };

    function moveNode(e) {
        e = e || window.event;
        //#886 Unable to rearrange nodes in e2e
        d3.select('.ct-movable').attr('transform', "translate(" + parseFloat((e.pageX - $('#ct-mapSvg').offset().left - cSpan[0]) / cScale + 2) + "," + parseFloat((e.pageY - $('#ct-mapSvg').offset().top - cSpan[1]) / cScale - 20) + ")");
    };

    function moveNodeBegin(e) {
        e = e || window.event;
        e.cancelbubble = !0;
        //Issue #763 is fixed,Mindmap - If node is moved in edit mode ,then Textbox is not been moved with the Node.
        d3.select('#ct-inpAct').classed('no-disp', !0);
        if (e.stopPropagation) e.stopPropagation();
        //To check whether browser Is IE or not issue #415
        var isIE = /*@cc_on!@*/ false || !!document.documentMode;
        var p = d3.select(this.parentElement);
        if (isIE) {
            var p = d3.select(this.parentNode);
        }
        var pi = p.attr('id').split('-')[2];
        temp = {
            s: [],
            t: ""
        };
        dLinks.forEach(function(d, i) {
            if (d.source.id == pi) {
                temp.s.push(d.id);
                d3.select('#ct-link-' + d.id).remove();
            } else if (d.target.id == pi) {
                temp.t = d.id;
                d3.select('#ct-link-' + d.id).remove();
            }
        });
        p.classed('ct-movable', !0);
        d3.select('#ct-mapSvg').on('mousemove.nodemove', moveNode);
    };

    function moveNodeEnd(e) {
        d3.select('#ct-mapSvg').on('mousemove.nodemove', null);
        var isIE = /*@cc_on!@*/ false || !!document.documentMode;
        var p = d3.select(this.parentElement);
        var split_char = ',';
        if (isIE) {
            var p = d3.select(this.parentNode);
            split_char = ' ';
        }

        var pi = p.attr('id').split('-')[2];
        var l = p.attr('transform').slice(10, -1).split(split_char);
        dNodes[pi].x = parseFloat(l[0]);
        dNodes[pi].y = parseFloat(l[1]);
        addLink(temp.t, dLinks[temp.t].source, dLinks[temp.t].target);
        var v = (dNodes[pi].children) ? !1 : !0;

        //Issue fixed #374: 'Mindmap - Blank nodes are retained if we delete the connected nodes'
        temp.s.forEach(function(d) {
            if (deletednode_info.indexOf(dLinks[d].target) == -1) {
                addLink(d, dLinks[d].source, dLinks[d].target);
                d3.select('#ct-link-' + d).classed('no-disp', v);
            }

        });
        p.classed('ct-movable', !1);
    };

    function toggleNode(e) {
        var isIE = /*@cc_on!@*/ false || !!document.documentMode;
        var p = d3.select(this.parentElement);
        if (isIE) {
            var p = d3.select(this.parentNode);
        }
        var pi = p.attr('id').split('-')[2];
        if (dNodes[pi].children) {
            p.select('.ct-cRight').classed('ct-nodeBubble', !1);
            dNodes[pi]._children = dNodes[pi].children;
            dNodes[pi].children = null;
            recurseTogChild(dNodes[pi], !0);
        } else if (dNodes[pi]._children) {
            p.select('.ct-cRight').classed('ct-nodeBubble', !0);
            dNodes[pi].children = dNodes[pi]._children;
            dNodes[pi]._children = null;
            recurseTogChild(dNodes[pi], !1);
        }
    };

    function recurseTogChild(d, v) {
        if (d.children) d.children.forEach(function(e) {
            recurseTogChild(e, v);
            d3.select('#ct-node-' + e.id).classed('no-disp', v);
            for (j = dLinks.length - 1; j >= 0; j--) {
                if (dLinks[j].source.id == d.id) {
                    d3.select('#ct-link-' + dLinks[j].id).classed('no-disp', v);
                }
            }
        });
        else if (d._children) d._children.forEach(function(e) {
            recurseTogChild(e, !0);
            d3.select('#ct-node-' + e.id).classed('no-disp', !0);
            for (j = dLinks.length - 1; j >= 0; j--) {
                if (dLinks[j].source.id == d.id) {
                    d3.select('#ct-link-' + dLinks[j].id).classed('no-disp', !0);
                }
            }
        });
    };

    function validNodeDetails(value, p) {
        var nName, flag = !0;
        nName = value;
        var regex = /^[a-zA-Z0-9_]*$/;;
        if (nName.length == 0 || nName.length > 40 || nName.indexOf('_') < 0 || !(regex.test(nName))) {
            $('#ct-inpAct').addClass('errorClass');
            flag = !1;
        }
        return flag;
    };


    function inpChange(e) {
        console.log('inpchange executed')
        var inp = d3.select('#ct-inpAct');
        var val = inp.property('value');
        if (val == 'Screen_0' || val == 'Scenario_0' || val == 'Testcase_0') {
            $('#ct-inpAct').addClass('errorClass');
            return;
        }
        if (!validNodeDetails(val, this)) return;
        //if(!validNodeDetails(this)) return;
        if (childNode != null) {
            var p = childNode;
        } else {
            var p = d3.select(activeNode);
        }
        var pi = p.attr('id').split('-')[2];
        var pt = p.select('.ct-nodeLabel');
        var t = p.attr('data-nodetype');
        if (!d3.select('#ct-inpSugg').classed('no-disp') && temp && temp.length > 0) return;
        if (dNodes[pi].id_n) {
            dNodes[pi].original_name = pt.attr('title');
            dNodes[pi].rnm = !0;
        }
        if (t == 'screens' && scrList[inp.attr('data-nodeid')] !== undefined) {
            //The below line leads to duplicate id_n of nodes when the node name is selected from suggestions list (only via mouse click)
            //dNodes[pi].id_n=scrList[inp.attr('data-nodeid')].id_n;
            dNodes[pi].name = scrList[inp.attr('data-nodeid')].name;
        } else if (t == 'testcases' && tcList[inp.attr('data-nodeid')] !== undefined) {
            //The below line leads to duplicate id_n of nodes when the node name is selected from suggestions list (only via mouse click)
            //dNodes[pi].id_n=tcList[inp.attr('data-nodeid')].id_n;
            dNodes[pi].name = tcList[inp.attr('data-nodeid')].name;
        } else {
            dNodes[pi].name = val;
        }
        d3.select('#ct-inpBox').classed('no-disp', !0);
        var tmp = dNodes[pi].name;
        if (tmp.length > 15) var tmp = tmp.slice(0, 15) + "...";
        pt.text(tmp);
        zoom.event(d3.select('#ct-mapSvg'));
    };

    function inpKeyUp(e) {
        e = e || window.event;
        temp = [];
        var t, list;
        //To fix issue with suggestions
        if (childNode != null) {
            var p = childNode;
        } else {
            var p = d3.select(activeNode);
        }
        //var p=d3.select(activeNode);
        var val = d3.select(this).property('value');
        var iul = d3.select('#ct-inpSugg');
        if (e.keyCode == 13) {
            inpChange();
            return;
        }
        if (val.indexOf('_') == -1) {
            iul.classed('no-disp', !0);
            var isIE = /*@cc_on!@*/ false || !!document.documentMode;
            if (isIE) {
                d3.select(this.parentNode).select('#ct-inpPredict').property('value', '');
            } else d3.select(this.parentElement).select('#ct-inpPredict').property('value', '');

            return;
        }
        t = p.attr('data-nodetype');
        //if(t == 'scenarios') list = scenarioList;
        if (t == 'screens') list = scrList;
        else if (t == 'testcases') list = tcList;
        else return;
        iul.selectAll('li').remove();
        list.forEach(function(d, i) {
            var s = d.name.toLowerCase();
            if (s.lastIndexOf(val.toLowerCase(), 0) === 0) {
                temp.push(i);
                if (d.name.length > 23) s = d.name.slice(0, 23) + "...";
                else s = d.name;
                iul.append('li').attr('class', 'divider');
                iul.append('li').append('a').attr('data-nodeid', i).attr('data-nodename', d.name).html(s).on('click', function() {
                    var k = d3.select(this);
                    d3.select('#ct-inpSugg').classed('no-disp', !0);
                    d3.select('#ct-inpPredict').property('value', '');
                    d3.select('#ct-inpAct').attr('data-nodeid', k.attr('data-nodeid')).property('value', k.attr('data-nodename')).node().focus();
                });
            }
        });
        if (temp.length > 0 && val != list[temp[0]].name) {
            if (e.keyCode == 39) {
                iul.classed('no-disp', !0);
                d3.select('#ct-inpPredict').property('value', '');
                d3.select(this).attr('data-nodeid', temp[0]).property('value', list[temp[0]].name);
            } else {
                iul.select('li.divider').remove();
                iul.classed('no-disp', !1);
                d3.select(this).attr('data-nodeid', null);
                if (isIE) d3.select(this.parentNode).select('#ct-inpPredict').property('value', list[temp[0]].name);
                else d3.select(this.parentElement).select('#ct-inpPredict').property('value', list[temp[0]].name);
            }
        } else {
            iul.classed('no-disp', !0);
            d3.select(this).attr('data-nodeid', null);
            if (isIE) d3.select(this.parentNode).select('#ct-inpPredict').property('value', '');
            else d3.select(this.parentElement).select('#ct-inpPredict').property('value', '');
        }
    };

    function treeIterator(c, d, e) {
        if (c != undefined) {
            c.push({
                id: d.id,
                childIndex: d.childIndex,
                id_c: (d.id_c) ? d.id_c : null,
                id_n: (d.id_n) ? d.id_n : null,
                oid: (d.oid) ? d.oid : null,
                name: d.name,
                type: d.type,
                pid: (d.parent) ? d.parent.id : null,
                pid_c: (d.parent) ? d.parent.id_c : null,
                task: (d.task) ? d.task : null,
                renamed: (d.rnm) ? d.rnm : !1,
                orig_name: (d.original_name) ? d.original_name : null
            });
        }
        if (d.children && d.children.length > 0) d.children.forEach(function(t) {
            e = treeIterator(c, t, e);
        });
        else if (d._children && d._children.length > 0) d._children.forEach(function(t) {
            e = treeIterator(c, t, e);
        });
        else if (d.type != 'testcases') return !0;
        return e;
    };

   

    function actionEvent(e) {
        if($(this).hasClass('disableButton') || $(this).hasClass('no-access')) return;
        var selectedTab = window.localStorage['tabMindMap'];
        var s = d3.select(this);
        var cur_module = null;
        var error = !1,
            mapData = [],
            flag = 0,
            alertMsg;
        var temp_data = [];
        dNodes.forEach(function(e, i) {
            if (i == 0) return;
            temp_data[i] = {
                idx: i,
                x: e.x,
                y: e.y,
                type: e.type
            };
        });

        var layout_vertical = $('#switch-layout').hasClass('vertical-layout');
        if (layout_vertical) {

            temp_data.sort(function(a, b) {
                return a.x - b.x;
            });
        } else {

            temp_data.sort(function(a, b) {
                return a.y - b.y;
            });
        }


        var counter = {
            'scenarios': 1,
            'screens': 1,
            'testcases': 1
        };
        temp_data.forEach(function(e, i) {
            dNodes[e.idx].childIndex = counter[e.type];
            counter[e.type] = counter[e.type] + 1;
        })
        error = treeIterator(mapData, dNodes[0], error);
        if (dNodes[0].type == 'modules_endtoend') {
            cur_module = 'end_to_end';
            error = false;
        }

        if (s.attr('id') == 'ct-saveAction') {
            blockUI('Saving Flow! Please wait...');
            flag = 10;
            d3.select('#ct-inpBox').classed('no-disp', !0);
            saveFlag = true;
            //$('#ct-createAction').removeClass('disableButton');
            SaveCreateED('#ct-createAction',0,0);

        } else if (s.attr('id') == 'ct-createAction') {
            if (error) {
                openDialogMindmap("Error", "Mindmap flow must be complete! Modules -> Scenarios -> Screens -> Testcases")
                //$('#Mindmap_error').modal('show');
                return;
            }
            flag = 20;
            blockUI('Creating Structure! Please wait...');
            d3.select('#ct-inpBox').classed('no-disp', !0);

        }
        if (flag == 0) return;
        if (s.classed('no-access')) return;
        //s.classed('no-access', !0);
        var userInfo = JSON.parse(window.localStorage['_UI']);
        var username = userInfo.username;
        var assignedTo = assignedObj;

        if ($('.project-list').val() == null) {
            openDialogMindmap('Error', 'No projects is assigned to User');
            return !1;
        }
        var from_v = to_v = 0;
        if ($('.version-list').length != 0)
            from_v = to_v = $('.version-list').val();

        mindmapServices.saveData(versioning_enabled,assignedTo, flag, window.localStorage['_SR'], from_v, to_v, cur_module, mapData, deletednode, unassignTask,
            $('.project-list').val(), $('#ct-assignRel').val(), $('#ct-assignCyc').val()).then(function(result) {
            unblockUI();
            if (flag == 10) {
                var res = result;
                mapSaved = !0;
                var mid, sts = allMMaps.some(function(m, i) {
                    if (m.id_n == res.id_n) {
                        mid = i;
                        allMMaps[i] = res;
                        return !0;
                    }
                    return !1;
                });
                if (!sts) {
                    mid = allMMaps.length;
                    allMMaps.push(res);
                    var node = d3.select('.ct-nodeBox').append('div').attr('class', 'ct-node fl-left').attr('data-mapid', mid).attr('title', res.name).on('click', loadMap);
                    node.append('img').attr('class', 'ct-nodeIcon').attr('src', 'images_mindmap/node-modules-no.png').attr('alt', 'Module').attr('aria-hidden', true);
                    node.append('span').attr('class', 'ct-nodeLabel').html(res.name.replace(/_/g, ' '));
                }
                setModuleBoxHeight();
                if (selectedTab == 'tabCreate') populateDynamicInputList();

                clearSvg();
                treeBuilder(allMMaps[mid]);
                unassignTask = [];

                if (selectedTab == 'tabAssign') {
                    openDialogMindmap("Success", "Tasks saved successfully");
                } else {
                    openDialogMindmap("Success", "Data saved successfully");
                    SaveCreateED('#ct-saveAction',0,0);
                }
                var vn = '';
                if ($('.version-list').length != 0)
                    from_v = to_v = $('.version-list').val()
                mindmapServices.getModules(versioning_enabled,window.localStorage['tabMindMap'], $(".project-list").val(), parseFloat(from_v)).then(function(result) {
                    var nodeBox = d3.select('.ct-nodeBox');
                    $(nodeBox[0]).empty();
                    allMMaps = result;
                    allMMaps.forEach(function(e, i) {
                        //var t=e.name.replace(/_/g,' ');
                        var img_src = 'images_mindmap/node-modules-no.png';
                        if (e.type == 'modules_endtoend') img_src = 'images_mindmap/MM5.png';
                        var t = $.trim(e.name);
                        var node = nodeBox.append('div').attr('class', 'ct-node fl-left').attr('data-mapid', i).attr('title', t).on('click', loadMap);
                        node.append('img').attr('class', 'ct-nodeIcon').attr('src', img_src).attr('alt', 'Module').attr('aria-hidden', true);
                        node.append('span').attr('class', 'ct-nodeLabel').html(t);
                    });
                    if (selectedTab == 'tabCreate')
                        populateDynamicInputList();
                    setModuleBoxHeight();
                }, function(error) {
                    console.log(error);
                })

            }
            if (flag == 20) {
                if (!saveFlag) return;
                var res = result[0];
                //res = res[0];
                var mid, resMap = Object.keys(res);
                allMMaps.some(function(m, i) {
                    if (m.id_n == resMap[0]) {
                        mid = i;
                        return !0;
                    }
                    //return !1;
                });
                //263-'Mindmap- Module: Currently allowing to create 2 modules with same name- Error msg is given on click of Create button
                if (allMMaps[mid] != undefined) {
                    allMMaps[mid].id_c = res[resMap[0]];
                    allMMaps[mid].children.forEach(function(tsc) {
                        tsc.id_c = res[tsc.id_n];
                        tsc.children.forEach(function(scr) {
                            scr.id_c = res[scr.id_n];
                            scr.children.forEach(function(tc) {
                                if (res[tc.id_n] != 'null') {
                                    tc.id_c = res[tc.id_n];
                                }
                            });
                        });
                    });
                    //To update cassandra_ids (id_c) of nodes in dNodes variable
                    dNodes.forEach(function(d) {
                        if (d.type == 'modules') d.id_c = res[resMap[0]];
                        else d.id_c = res[d.id_n];

                    });

                    openDialogMindmap("Success", "Structure created successfully");
                    saveFlag = false;
                    //$('#ct-createAction').addClass('disableButton');
                    SaveCreateED('#ct-createAction',1,0);
                } else {
                    saveFlag = false;
                    openDialogMindmap("Success", "Failed to create structure");
                }


                //$('#Mindmap_create').modal('show');
            }
        }, function(error) {
            unblockUI();
            console.log(error);
            //$('#ct-createAction').addClass('disableButton')
            SaveCreateED('#ct-createAction',1,0);
            if (error=='DuplicateModules') {
                openDialogMindmap('Save error', 'Module names cannot be duplicate');
            } else {
                openDialogMindmap('Save error', 'Failed to save data');
            }
        })

    };

    function toggleExpand(e, tab) {
        var s = d3.select($(e.target).parent());
        var p = d3.select($(e.target).parent().parent());
        $(e.target).parent().toggleClass('ct-rev');
        $(e.target).parent().parent().toggleClass('ct-open');
        $(e.target).toggleClass("iconSpaceArrowTop");
        e.stopImmediatePropagation();
        if ($("#ct-" + tab + "Box").hasClass("ct-open") == true) {
            $("#ct-canvas").css("top", "5px");
            // if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == true)
            // 	{
            // 	$("#ct-AssignBox").css({"position":"relative","top":"25px"});
            // 	}
            $(".ct-nodeBox .ct-node").css("width", "139px");
            $(".ct-nodeBox").css({
                "overflow": "auto",
                "width": "99%"
            })
            $(".iconSpaceArrow").attr("src", "imgs/ic-collapseup.png");
        } else {
            $(".iconSpaceArrow").attr("src", "imgs/ic-collapse.png");
            $("#ct-" + tab + "Box").css({
                "position": "",
                "top": ""
            });
            $("#ct-canvas").css("top", "");
            $(".ct-nodeBox .ct-node").css("width", "");
            $(".ct-nodeBox").css({
                "overflow": "",
                "width": ""
            })
        }
    };

    function clickHideElements(e) {
        d3.select('#ct-inpBox').classed('no-disp', !0);
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        d3.select('#ct-assignBox').classed('no-disp', !0);
    };

    function setModuleBoxHeight() {
        var lm = d3.select('.ct-moduleBoxOptional').classed('ct-open', !0);
        if($scope.tab == 'tabCreate')
            var lm=d3.select('#ct-moduleBox').classed('ct-open',!0);
        var h1 = lm.style('height');
        lm.classed('ct-open', !1);
        if (h1 == lm.style('height')) lm.select('.ct-expand').classed('no-disp', !0);
        else lm.select('.ct-expand').classed('no-disp', !1);
    };

    function populateDynamicInputList() {
        scrList = [];
        tcList = [];
        scenarioList = [];
        var scrDict = {},
            tcDict = {},
            scenarioDict = {};
        allMMaps.forEach(function(m) {
            if (m.children != undefined) {
                m.children.forEach(function(ts) {
                    // if(scenarioDict[ts.id_n]===undefined){
                    // 		scenarioList.push({id:ts.id,name:ts.name,id_n:ts.id_n,id_c:ts.id_c});
                    // 		scenarioDict[ts.id_n]=!0;
                    // }
                    if (ts.children != undefined) {
                        ts.children.forEach(function(s) {
                            if (scrDict[s.name] === undefined) {
                                scrList.push({
                                    id: s.id,
                                    name: s.name,
                                    id_n: s.id_n,
                                    id_c: s.id_c
                                });
                                scrDict[s.name] = !0;
                            }
                            if (s.children != undefined) {
                                s.children.forEach(function(tc) {
                                    if (tcDict[tc.name] === undefined) {
                                        tcList.push({
                                            id: tc.id,
                                            name: tc.name,
                                            id_n: tc.id_n,
                                            id_c: tc.id_c
                                        });
                                        tcDict[tc.name] = !0;
                                    }
                                });
                            }

                        });
                    }

                });
            }

        });
    };

    function clearSvg() {
        d3.select('#ct-mindMap').remove();
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        d3.select('#ct-assignBox').classed('no-disp', !0);
        d3.select('#ct-mapSvg').append('g').attr('id', 'ct-mindMap');
        uNix = 0;
        uLix = 0;
        dNodes = [];
        dLinks = [];
        nCount = [0, 0, 0, 0];
        cSpan = [0, 0];
        cScale = 1;
        mapSaved = !1;
        zoom.scale(cScale).translate(cSpan);
        zoom.event(d3.select('#ct-mapSvg'));
    };

    //FUnction is tagged to every click on 'cnavas' element to validate the names of nodes when created
    function callme() {
        if ($('.ct-tileBox').length > 0) return;
        if (childNode != null && (childNode.text() == 'Module_0' || childNode.text() == 'Screen_0' || childNode.text() == 'Scenario_0' || childNode.text() == 'Testcase_0')) {
            d3.select('#ct-inpBox').classed('no-disp', !1);
        }
        if (!$('#ct-inpBox').hasClass('no-disp')) {
            inpChange();
        }
    }

    function treeBuilder(tree) {
        node_names_tc = [];
        var pidx = 0,
            levelCount = [1],
            cSize = getElementDimm(d3.select("#ct-mapSvg"));
        var typeNum = {
            'modules': 0,
            'modules_endtoend': 0,
            'scenarios': 1,
            'screens': 2,
            'testcases': 3
        };

        function childCounter(l, s) {
            if (levelCount.length <= l) levelCount.push(0);
            if (s.children) {
                levelCount[l] += s.children.length;
                s.children.forEach(function(d) {
                    childCounter(l + 1, d);
                });
            }
        };
        childCounter(1, tree);
        var newHeight = d3.max(levelCount) * 90;
        var d3Tree = d3.layout.tree().size([newHeight * 1.5, cSize[0]]);
        // if(tree.oid===undefined) d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
        // else d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
        if (tree.childIndex === undefined) d3Tree.sort(function(a, b) {
            return a.childIndex - b.childIndex;
        });
        else d3Tree.sort(function(a, b) {
            return a.childIndex - b.childIndex;
        });
        dNodes = d3Tree.nodes(tree);
        //dLinks=d3Tree.links(dNodes);

        /* 
         *  Logic for adding reuse property 
         */
        function parseDataReuse() {
            var dataReuse = {
                'screen': [],
                'testcase': [],
                'projectid': ''
            };
            dNodes.forEach(function(e, i) {
                if ((e.type in ['modules', 'scenarios'])) return;
                dNodes[i].reuse = false;
                dNodes.forEach(function(f, j) {
                    if ((e.type == 'screens' && e.type == f.type && e.name == f.name && i != j) || (e.type == 'testcases' && e.type == f.type && e.name == f.name && e.parent.name == f.parent.name && i != j)) {
                        dNodes[i].reuse = true;
                        // console.log(e.type,' ',e.name,' reused')
                    }
                })

                if ((e.reuse == true)) return;
                if (e.type == 'testcases') {
                    dataReuse['testcase'].push({
                        'testcasename': e.name,
                        'screenname': e.parent.name,
                        'idx': i
                    });
                } else if (e.type == 'screens' && e.type == 'screens') {
                    dataReuse['screen'].push({
                        'screenname': e.name,
                        'idx': i
                    });
                }

            })
            dataReuse['projectid'] = $(".project-list").val();
            if(versioningEnabled){
                // Add version number
                dataReuse['versionNumber'] = $('.version-list').val();
            }
            return dataReuse;
        }
        var reusedata = parseDataReuse();

        // Now call the service and assign reuse property to all other nodes
        var userInfo = JSON.parse(window.localStorage['_UI']);
        var user_id = userInfo.user_id;

        mindmapServices.checkReuse(reusedata).then(function(result) {
            result['screen'].forEach(function(e, i) {
                dNodes[e.idx].reuse = e.reuse;
            })
            result['testcase'].forEach(function(e, i) {
                dNodes[e.idx].reuse = e.reuse;
            })
            dNodes.forEach(function(d) {
                // switch-layout feature
                if ($('#switch-layout').hasClass('vertical-layout')) {
                    d.y = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
                    sections[d.type] = d.y;
                } else {
                    d.y = d.x;
                    //Logic to change the layout and to reduce the length of the links
                    d.x = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
                    sections[d.type] = d.x;
                }
                if (d.oid === undefined) d.oid = d.id;
                d.id = uNix++;
                addNode(d, !0, d.parent);
                if (d.task != null) d3.select('#ct-node-' + d.id).append('image').attr('class', 'ct-nodeTask').attr('width', '21px').attr('height', '21px').attr('xlink:href', 'images_mindmap/node-task-assigned.png').attr('x', 29).attr('y', -10);
            });
            dLinks = d3Tree.links(dNodes);
            dLinks.forEach(function(d) {
                d.id = uLix++;
                addLink(d.id, d.source, d.target);
            });
            // switch-layout feature
            if ($('#switch-layout').hasClass('vertical-layout'))
                zoom.translate([(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y]);
            else
                zoom.translate([(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]);
            //zoom.translate([(cSize[0]/2),(cSize[1]/2)]);
            zoom.event(d3.select('#ct-mapSvg'));
        }, function(error) {
            console.log("Error: checkReuse service")
        })
    };

    //Dialog used through out mindmap
    function openDialogMindmap(title, body) {
        if (window.location.pathname == '/mindmap' || window.location.pathname == '/version') {
            $("#mindmapGlobalDialog").find('.modal-title').text(title);
            $("#mindmapGlobalDialog").find('.modal-body p').text(body).css('color', 'black');
            $("#mindmapGlobalDialog").modal("show");
            setTimeout(function() {
                $("#mindmapGlobalDialog").find('.btn-default').focus();
            }, 300);
        } else if (window.location.pathname == '/designTestCase' || window.location.pathname == '/design' || window.location.pathname == '/execute') {
            $("#globalTaskSubmit").find('.modal-title').text(title);
            $("#globalTaskSubmit").find('.modal-body p').text(body);
            $("#globalTaskSubmit").modal("show");
        }

    }

    /* function to set a Browser cookie */
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    /* function to get a Browser cookie */
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

   

    /*
    function : exportData()
    Purpose : Exporting data in json file
    param :
    */

    function exportData(versioning_status) {
        var data_not_exported = [];
        var vs_n = 0;
        var version_num = "0.0";
        if ($('.version-list').val() != undefined) {
            version_num = $('.version-list').val();
        }
        if (versioning_status) {
            vs_n = 1;
        }
        data = {
            "moduleInfo": []
        };
        execution_data = {
            "execution_data": [{
                "browserType": ["1"],
                "moduleInfo": [{
                    "appType":"",
                    "projectId": "",
                    "cycleId": "",
                    "moduleId": "",
                    "moduleName": "",
                    "releaseId": "",
                    "versionNumber": "",
                    "suiteDetails": [{
                        "scenarios_id": "",
                        "scenarios_name": ""
                    }]
                }],
                "userInfo": {
                    "token_id": "",
                    "username": "",
                    "ice_username": ""
                }
            }]
        };
        blockUI('Loading UI');
        var userInfo = JSON.parse(window.localStorage['_UI']);
        var user_id = userInfo.user_id;
        mindmapServices.getModules(versioning_enabled,window.localStorage['tabMindMap'], $(".project-list").val(),parseFloat(version_num)).then(
            function(result){
                result_details = result;
                flag = 0;
                for (var i = 0; i < result_details.length; i++) {
                    var module_info = {
                        "appType": "",
                        "projectId": $(".project-list").val(),
                        "cycleId": "",
                        "moduleId": "",
                        "moduleName": "",
                        "releaseId": "",
                        "versionNumber": "",
                        "suiteDetails": []
                    };
                    if (result_details[i].id_c != 'null' && result_details[i].id_c != '') {
                        module_info.moduleId = result_details[i].id_c;
                        module_info.moduleName = result_details[i].name;
                        flag = 1;
                        for (var j = 0; j < result_details[i].children.length; j++) {
                            var s_data = {
                                'scenarios_id': '',
                                'scenarios_name': ''
                            };
                            if (result_details[i].children[j].id_c != 'null' && result_details[i].children[j].id_c != '') {
                                s_data.scenarios_id = result_details[i].children[j].id_c;
                                s_data.scenarios_name = result_details[i].children[j].name;
                                module_info.suiteDetails.push(s_data);
                            } else {
                                console.log('Not exported_S : ', result_details[i].children[j].id_n);
                            }
                        }
                        data.moduleInfo.push(module_info);
                    } else {
                        data_not_exported.push(result_details[i].id_n);
                        console.log('Not exported : ', result_details[i].name);
                    }
                }
                if (flag) {
                    mindmapServices.getProjectTypeMM_Nineteen68($(".project-list").val()).then(
                        function(project_type){
                             parsed_project_data = project_type;
                             mindmapServices.getCRId($(".project-list").val()).then(
                                 function(rel_cycle_data){
                                       ci_parsed_details =rel_cycle_data;
                                    for (var i = 0; i < data.moduleInfo.length; i++) {
                                        data.moduleInfo[i].cycleId = ci_parsed_details.row.cycleid;
                                        data.moduleInfo[i].releaseId = ci_parsed_details.row.releaseid;
                                        if (vs_n) {
                                            data.moduleInfo[i].versionNumber = version_num;
                                        } else {
                                            data.moduleInfo[i].versionNumber = "0.0";
                                        }
                                        data.moduleInfo[i].appType = parsed_project_data.project_typename;
                                    }
                                    var responseData = JSON.stringify(data);
                                    jsonDownload('moduleinfo.json', responseData);
                                    var response_execution_data = JSON.stringify(execution_data);
                                    jsonDownload('execution_data.json', response_execution_data);
                                    unblockUI();
                                    if (data_not_exported.length != 0)
                                        openDialogMindmap('Mindmap', "Data Exported Successfully. Note:Only Created Modules are exported.");
                                    else
                                        openDialogMindmap('Mindmap', "Data Exported Successfully.");
                                 },function(err){
                                    console.log('Error in exporting');
                                    unblockUI();
                                    openDialogMindmap('Error', "Error in export");
                                 }
                             )
                        },function(err){
                            console.log(err);
                            unblockUI();
                        }
                    )
                   
                } else {
                    unblockUI();
                    openDialogMindmap('Mindmap', "Module is not created in ICE");
                }
            },function(err){
                console.log(err);
                unblockUI();
            }
        );
    }


     function addExport(versioning_status) {
        $('.selectProject').append($('<i>').attr({
            class: 'glyphicon glyphicon-export export-icon',
            title: "Export Version"
        }).click(function(e){ exportData(versioning_status); }));
    }

    /*
    function : jsonDownload()
    Purpose : download json file
    */

    function jsonDownload(filename, responseData) {
        var blob = new Blob([responseData], {
                type: 'text/json'
            }),
            e = document.createEvent('MouseEvents'),
            a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initMouseEvent('click', true, true, window,
            0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }

    function draww() {
        var mmap = dNodes[0];
        clearSvg();
        treeBuilder(mmap);
        //Disable every other action	
        $('#ct-canvas').append("<div id='rect-copy'><div>").on('resize', resize1).on('drag', resize1);
        $("#rect-copy").resizable();
        $("#rect-copy").draggable();
    }

    function resize1() {
        dNodes_c = [];
        dLinks_c = [];
        $('.ct-node').removeClass('node-selected node-error');
        $('.ct-link').removeClass('link-selected');
        // console.log('Resize');
        var xvp = d3.select("#ct-mindMap").attr("transform").split(/[()]/)[1].split(',')[0];
        var yvp = d3.select("#ct-mindMap").attr("transform").split(/[()]/)[1].split(',')[1];
        var scale = (d3.select("#ct-mindMap").attr("transform").split(/[()]/)[3]);

        dNodes.forEach(function(e, i) {
            var lt = [parseFloat(xvp) + parseFloat(e.x) * parseFloat(scale), parseFloat(yvp) + parseFloat(e.y) * parseFloat(scale)];
            // console.log('l,t :',lt);
            if (e.type != 'modules') {
                if (lt[0] > $('#rect-copy').position().left && lt[0] < ($('#rect-copy').position().left + $('#rect-copy').width()) && lt[1] > $('#rect-copy').position().top && lt[1] < ($('#rect-copy').position().top + $('#rect-copy').height())) {
                    $('#ct-node-' + i).addClass('node-selected');
                    if (e.type == 'testcases' && (dNodes_c.indexOf(dNodes[e.parent.id]) == -1)) {
                        $('#ct-node-' + e.parent.id).addClass('node-selected');
                        dNodes_c.push(dNodes[e.parent.id]);
                    }
                    dNodes_c.push(e);
                }
            }
        });
        dLinks.forEach(function(e, i) {
            if ($('#ct-node-' + e.source.id).hasClass('node-selected') && $('#ct-node-' + e.target.id).hasClass('node-selected')) {
                $('#ct-link-' + e.id).addClass('link-selected');
                dLinks_c.push(e);
            }
        })
    };

    function copyMap() {
        var dangling_screen_check_flag = false,
            dangling_screen, dangling_screen_flag = false,
            ds_list = [];
        //validate
        //if topmost is scenario and screen without parent -> fail
        dNodes_c.forEach(function(e, i) {
            if (e.type == 'scenarios')
                dangling_screen_check_flag = true; // then check for dangling screen
        })
        if (dangling_screen_check_flag) {
            dNodes_c.forEach(function(e, i) {
                if (e.type == 'screens') {
                    dangling_screen = true;
                    dLinks_c.forEach(function(f, i) {
                        if (e.id == f.target.id)
                            dangling_screen = false;
                    })
                }
                if (dangling_screen) {

                    dangling_screen_flag = true;
                    ds_list.push(e);
                }
            })
        }

        if (dangling_screen_flag) {
            openDialogMindmap('Error', 'dangling screen!!! validation failed!');
            ds_list.forEach(function(e, i) {
                $('#ct-node-' + e.id).addClass('node-error');
            });
        } else {
            openDialogMindmap('Success', 'Data Copied successfully');
            $('.ct-node').removeClass('node-selected');
            $('.ct-link').removeClass('link-selected');
            $('#rect-copy').remove();
            $('#copyImg1').removeClass('active-map');
        }

    }

    //------------------------------------------------Workflow.js----------------------------------------

    var isIE = /*@cc_on!@*/ false || !!document.documentMode;

    function loadMindmapData1_W() {
        blockUI("Loading...");
        $('#eteScenarioContainer').empty();
        d3.select('.addScenarios-ete').classed('disableButton', !0);
        //$('#ct-saveAction_W').removeClass('no-access');
        SaveCreateED('#ct-saveAction_W',0,0);
        //uNix=0;uLix=0;dNodes=[];dLinks=[];nCount=[0,0,0,0];scrList=[];tcList=[];cSpan_W=[0,0];cScale_W=1;mapSaved=!1;
        taskAssign = {
            "modules_endtoend": {
                "task": ["Execute"],
                "attributes": ["at", "rw", "sd", "ed", "re", "cy"]
            },
            "scenarios": {
                "task": ["Execute Scenario"],
                "attributes": ["at", "rw", "sd", "ed"]
            },
            "screens": {
                "task": ["Scrape", "Append", "Compare", "Add", "Map"],
                "attributes": ["at", "rw", "sd", "ed"]
            },
            "testcases": {
                "task": ["Update", "Design"],
                "attributes": ["at", "rw", "sd", "ed"]
            }
        };
        zoom_W = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoomed);
        $("#ctExpandCreate").click(function(e) {
            if ($(".ct-node:visible").length > 6) {
                toggleExpand(e, 'module');
            }
        });
        $("#ctExpandAssign").click(function(e) {
            if ($(".ct-node:visible").length > 6) {
                toggleExpand(e, 'Assign');
            }
        });
        d3.select('#ct-main').on('contextmenu', function(e) {
            d3.event.preventDefault();
        });
        var svgTileG = d3.select('.ct-tile_W').append('svg').attr('class', 'ct-svgTile').attr('height', '150px').attr('width', '150px').append('g');
        var svgTileLen = $(".ct-svgTile").length;

        d3.select('#ct-assignBox').classed('no-disp', !0);
        mindmapServices.getModules(versioning_enabled,'endToend', $("#selectProjectEtem").val()).then(function(result) {
            var nodeBox = d3.select('#etemModuleContainer');
            $(nodeBox[0]).empty();
            allMMaps_W = allMaps_info = result;

            allMMaps_W.forEach(function(e, i) {
                //var t=e.name.replace(/_/g,' ');
                var src_image = 'imgs/ic-reportbox.png'
                var class_name = 'eteMbox';
                var onclick_func = displayScenarios;
                if (e.type == 'modules_endtoend') {
                    class_name = 'eteMboxETE';
                    onclick_func = loadScenarios;
                    src_image = 'images_mindmap/endToEnd.png';
                }
                var t = $.trim(e.name);
                var node = nodeBox.append('span').attr('class', 'moduleContainer').attr('data-mapid', i).attr('title', t).on('click', onclick_func);
                node.append('img').attr('class', 'ct-nodeIcon ' + class_name).attr('src', src_image).attr('alt', 'Module').attr('aria-hidden', true);
                node.append('span').attr('class', 'ct-nodeLabel modulename').html(t);
            });

            initScroller();
            setModuleBoxHeight_W();
            unblockUI();
        }, function(error) {
            console.log(error);
            unblockUI();
        })

    }

    function initiate_W() {
        var t, u;
        var selectedTab = window.localStorage['tabMindMap'];
        d3.select('.ct-tileBox').remove();
        if (d3.select('#ct-mindMap')[0][0] != null) return;
        if (selectedTab == "tabAssign") var canvas = d3.select('#ct-canvasforAssign');
        else var canvas = d3.select('#ct-canvas');
        u = canvas.append('div').attr('id', 'ct-inpBox').classed('no-disp', !0);
        u.append('input').attr('id', 'ct-inpPredict').attr('class', 'ct-inp');
        u.append('input').attr('id', 'ct-inpAct').attr('maxlength', '40').attr('class', 'ct-inp').on('change', inpChange_W).on('keyup', inpKeyUp_W);
        u.append('ul').attr('id', 'ct-inpSugg').classed('no-disp', !0);
        u = canvas.append('div').attr('id', 'ct-ctrlBox').classed('no-disp', !0);
        u.append('p').attr('class', 'ct-ctrl fa ' + faRef.plus).on('click', '').append('span').attr('class', 'ct-tooltiptext').html('');
        u.append('p').attr('class', 'ct-ctrl fa ' + faRef.edit).on('click', editNode_W).append('span').attr('class', 'ct-tooltiptext').html('');
        u.append('p').attr('class', 'ct-ctrl fa ' + faRef.delete).on('click', deleteNode_W).append('span').attr('class', 'ct-tooltiptext').html('');

        var mapSvg = canvas.append('svg').attr('id', 'ct-mapSvg').call(zoom_W).on('click.hideElements', clickHideElements);
        var dataAdder = [{
            c: '#5c5ce5',
            t: 'Modules'
        }, {
            c: '#4299e2',
            t: 'Scenarios'
        }, {
            c: '#19baae',
            t: 'Screens'
        }, {
            c: '#efa022',
            t: 'Test Cases'
        }];
        u = canvas.append('svg').attr('id', 'ct-legendBox').append('g').attr('transform', 'translate(10,10)');
        dataAdder.forEach(function(e, i) {
            t = u.append('g');
            t.append('circle').attr('class', 'ct-' + (e.t.toLowerCase().replace(/ /g, ''))).attr('cx', i * 90).attr('cy', 0).attr('r', 10);
            t.append('text').attr('class', 'ct-nodeLabel').attr('x', i * 90 + 15).attr('y', 3).text(e.t);
        });
        u = canvas.append('svg').attr('id', 'ct-actionBox_W').append('g');
        t = u.append('g').attr('id', 'ct-saveAction_W').attr('class', 'ct-actionButton_W').on('click', actionEvent_W);
        // 886: Unable to rearrange nodes in e2e
        t.append('rect').attr('x', 0).attr('y', 0).attr('rx', 12).attr('ry', 12);
        t.append('text').attr('x', 23).attr('y', 18).text('Save');
        if (selectedTab == "tabCreate" || 'mindmapEndtoEndModules') {
            t = u.append('g').attr('id', 'ct-createAction_W').attr('class', 'ct-actionButton_W disableButton').on('click', actionEvent_W);
            t.append('rect').attr('x', 100).attr('y', 0).attr('rx', 12).attr('ry', 12);
            t.append('text').attr('x', 114).attr('y', 18).text('Create');

        }


    };

    function getElementDimm(s) {
        return [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    };

    function createNewMap_W(e) {
        initiate_W();
        clearSvg_W();
        var s = getElementDimm(d3.select("#ct-mapSvg"));
        //X and y changed to implement layout change
        // switch-layout feature
        if ($('#switch-layout').hasClass('vertical-layout')) {
            node = {
                projectID: $('#selectProjectEtem').val(),
                id: uNix_W,
                childIndex: 0,
                name: 'Module_0',
                type: 'modules_endtoend',
                y: s[0] * 0.2,
                x: s[1] * 0.4,
                children: [],
                parent: null
            };
        } else {
            node = {
                projectID: $('#selectProjectEtem').val(),
                id: uNix_W,
                childIndex: 0,
                name: 'Module_0',
                type: 'modules_endtoend',
                y: s[1] * 0.4,
                x: s[0] * 0.2,
                children: [],
                parent: null
            };
        }

        dNodes_W.push(node);
        nCount[0]++;
        uNix_W++;
        //To fix issue 710-Create a module and see that module name does not display in edit mode
        v = addNode_W(dNodes_W[uNix_W - 1], !1, null);
        childNode_W = v;
        editNode_W(e);
    };

    function loadScenarios(e) {
        if (!d3.select('#ct-mindMap')[0][0] || confirm('Unsaved work will be lost if you continue.\nContinue?')) {
            d3.select('.addScenarios-ete').classed('disableButton', !0);
            saveFlag_W = false;
            //$('#ct-createAction_W').addClass('disableButton');
            SaveCreateED('#ct-createAction_W',1,0);
            $("span.nodeBoxSelected").removeClass("nodeBoxSelected");
            $(this).addClass("nodeBoxSelected");
            cur_module = $(this);
            initiate_W();
            d3.select('#ct-inpBox').classed('no-disp', !0);
            clearSvg_W();
            var reqMap = d3.select(this).attr('data-mapid');
            treeBuilder_W(allMaps_info[reqMap]);
        }
    };

    function displayScenarios(e) {
        if($('#ct-mindMap').length==0){ // if no map is loaded 
            openDialogMindmap('Error','First, Please select an end to end module or create a new one!');
            return;
        }
        if ($($(this).children()[0]).hasClass('eteMbox')) {
            var som = 'Module Name: ' + $(this)[0].title;
            if (som.length > 31)
                $('.endtoend-modules-right-upper label').text(som.substring(0, 30) + '...');
            else
                $('.endtoend-modules-right-upper label').text(som);
            $('.endtoend-modules-right-upper label').attr('title', som.substring(13))
        } else {
            $('.endtoend-modules-right-upper label').attr('title', '')
            $('.endtoend-modules-right-upper label').text('Scenarios');
        }

        // #894: Add button disabled by default
        $('.addScenarios-ete').addClass('disableButton');
        //#821 UI issues in e2e
        $('#eteSearchScenarios').val("");

        var container = $("#eteScenarioContainer");

        var id = d3.select(this).attr('data-mapid');
        var moduleid = allMaps_info[id].id_n;
        if (allMaps_info[id].type == "modules_endtoend") {
            return;
        }
        mindmapServices.populateScenarios(moduleid).then(function(result) {
            container.empty();
            result.forEach(function(row) {
                container.append("<span class='eteScenrios' data-scenarioId='" + row.testScenarioID_c + "' title='" + row.testScenarioName + "'>" + row.testScenarioName + "</span>")
            });
            // #817 To select multiple scenarios in e2e (Himanshu)
            $('.eteScenrios').click(function() {
                $(this).toggleClass('selectScenariobg');
                var classflag = false;
                d3.select('.addScenarios-ete').classed('disableButton', !0);
                $.each($('.eteScenrios'), function() {
                    if ($(this).hasClass('selectScenariobg')) {
                        classflag = true;
                        d3.select('.addScenarios-ete').classed('disableButton', !1);
                    }
                })
            })                    
        }, function(error) {
            console.log(error);
        })

    }

    function addNode_W(n, m, pi) {

        if (n.type == 'testcases') {
            node_names_tc.push(n.name);
        }

        var v = d3.select('#ct-mindMap').append('g').attr('id', 'ct-node-' + n.id).attr('class', 'ct-node').attr('data-nodetype', n.type).attr('transform', "translate(" + (n.x).toString() + "," + (n.y).toString() + ")");

        n.display_name = n.name;
        var img_src = 'images_mindmap/node-scenarios.png';
        if (n.type == 'modules_endtoend') img_src = 'images_mindmap/MM5.png';
        v.append('image').attr('height', '40px').attr('width', '40px').attr('class', 'ct-nodeIcon').attr('xlink:href', img_src).on('click', nodeCtrlClick_W);
        var ch = 15;
        if (n.name.length > 15 && n.type != 'modules_endtoend') {
            if (n.type == 'testcases') ch = 9;
            n.display_name = n.display_name.slice(0, ch) + '...';
        }
        v.append('text').attr('class', 'ct-nodeLabel').text(n.display_name).attr('text-anchor', 'middle').attr('x', 20).attr('title', n.name).attr('y', 50);
        v.append('title').text(n.name);
        //Condition to add the properties of reuse to the node (Currently only for testcases)
        if (node_names_tc.length > 0 && node_names_tc.indexOf(n.name) > -1) {
            if (node_names_tc.indexOf(n.name) == node_names_tc.lastIndexOf(n.name)) {
                n.reuse = 'reuse';
            } else {
                n.reuse = 'parent';
            }


        }
        if (m && pi) {
            var p = d3.select('#ct-node-' + pi.id);
            // switch-layout feature
            if ($('#switch-layout').hasClass('vertical-layout')) {
                if (!p.select('circle.ct-cRight')[0][0]) p.append('circle').attr('class', 'ct-' + pi.type + ' ct-cRight ct-nodeBubble').attr('cx', 20).attr('cy', 55).attr('r', 4).on('click', toggleNode_W);
                v.append('circle').attr('class', 'ct-' + n.type + ' ct-cLeft ct-nodeBubble').attr('cx', 20).attr('cy', -3).attr('r', 4); //.on('mousedown',moveNodeBegin).on('mouseup',moveNodeEnd);
                v.append('circle').attr('class', 'ct-' + n.type + ' ct-cLeft ct-nodeBubble').attr('cx', -3).attr('cy', 20).attr('r', 4).on('mousedown', moveNodeBegin_W).on('mouseup', moveNodeEnd_W);
            } else {
                if (!p.select('circle.ct-cRight')[0][0]) p.append('circle').attr('class', 'ct-' + pi.type + ' ct-cRight ct-nodeBubble').attr('cx', 43).attr('cy', 20).attr('r', 4).on('click', toggleNode_W);
                //Logic to change the layout
                //v.append('circle').attr('class','ct-'+n.type+' ct-cLeft ct-nodeBubble').attr('cx',20).attr('cy',-3).attr('r',4);//.on('mousedown',moveNodeBegin).on('mouseup',moveNodeEnd);
                v.append('circle').attr('class', 'ct-' + n.type + ' ct-cLeft ct-nodeBubble').attr('cx', -3).attr('cy', 20).attr('r', 4).on('mousedown', moveNodeBegin_W).on('mouseup', moveNodeEnd_W);
            }
        }
        return v;
    };

    //To Unassign the task of a particular node



    function createScenario_Node(text, scenario_prjId) {
        if (text == '') return;
        //If module is in edit mode, then return do not add any node
        if (d3.select('#ct-inpBox').attr('class') == "") return;
        d3.select('#ct-inpBox').classed('no-disp', !0);
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        var pi = 0;
        if (dNodes_W[pi]._children == null) {
            if (dNodes_W[pi].children == undefined) dNodes_W[pi]['children'] = [];
            //var nNext={'modules_endtoend':['Scenario',1],'scenarios':['Screen',2],'screens':['Testcase',3]};
            var mapSvg = d3.select('#ct-mapSvg');
            var w = parseFloat(mapSvg.style('width'));
            var h = parseFloat(mapSvg.style('height'));
            //name:nNext[pt][0]+'_'+nCount[nNext[pt][1]]

            node = {
                projectID: scenario_prjId,
                id: uNix_W,
                childIndex: '',
                path: '',
                name: text,
                type: 'scenarios',
                y: h * (0.15 * (1.34 + 1) + Math.random() * 0.1),
                x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
                children: [],
                parent: dNodes_W[pi]
            };
            //TO fix issue with random positions of newly created nodes
            if (dNodes_W[pi].children.length > 0) {
                arr = dNodes_W[pi].children;
                index = dNodes_W[pi].children.length - 1;
                // switch-layout feature
                if ($('#switch-layout').hasClass('vertical-layout')) {
                    node.x = arr[index].x + 80;
                    node.y = arr[index].y;
                } else {
                    node.y = arr[index].y + 80;
                    node.x = arr[index].x;
                }


            } else {
                //Modified parameters to change the layout
                // switch-layout feature
                if ($('#switch-layout').hasClass('vertical-layout')) {
                    node.x = dNodes_W[pi].x;
                    node.y = dNodes_W[pi].y + 125;
                } else {
                    node.y = dNodes_W[pi].y;
                    node.x = dNodes_W[pi].x + 125;
                }
            }

            dNodes_W.push(node);
            dNodes_W[pi].children.push(dNodes_W[uNix_W]);
            dNodes_W[uNix_W].childIndex = dNodes_W[pi].children.length
            var currentNode = addNode_W(dNodes_W[uNix_W], !0, dNodes_W[pi]);
            if (currentNode != null) {
                childNode_W = currentNode;
                //console.log(currentNode);
                link = {
                    id: uLix_W,
                    source: dNodes_W[pi],
                    target: dNodes_W[uNix_W]
                };
                dLinks_W.push(link);
                addLink(uLix_W, dNodes_W[pi], dNodes_W[uNix_W]);
                uNix_W++;
                uLix_W++;

            }

        } else {
            openDialogMindmap('Error', 'Expand the node');
        }

    };

    function nodeCtrlClick_W(e) {
        e = e || window.event;
        e.cancelbubble = !0;
        if (e.stopPropagation) e.stopPropagation();
        if (isIE) activeNode_W = this.parentNode;
        else activeNode_W = this.parentElement;
        var p = d3.select(activeNode_W);
        var t = p.attr('data-nodetype');
        var split_char = ',';
        if (isIE) split_char = ' ';        
        var l = p.attr('transform').slice(10, -1).split(split_char);
        l = [(parseFloat(l[0]) + 40) * cScale + cSpan[0], (parseFloat(l[1]) + 40) * cScale + cSpan[1]];
        var c = d3.select('#ct-ctrlBox').style('top', l[1] + 'px').style('left', l[0] + 'px').classed('no-disp', !1);
        c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
        c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !1);
        c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
        if (t == 'modules_endtoend') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !0);
            c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Module');
            //513-'Mindmap: When we delete an existing Module and create another module in the same work space  then a new Module instance is being appended .
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !0);
            //c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Module');
        } else if (t == 'scenarios') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !0);
            c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !0);
            c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Scenario');
        }

    };

    function editNode_W(e, node) {

        $('#ct-inpAct').removeClass('errorClass');
        e = e || window.event;
        e.cancelbubble = !0;
        if (e.stopPropagation) e.stopPropagation();
        //logic to create the node in editable mode
        if (node == 0) {
            childNode_W = null;
            var p = d3.select(activeNode_W);
        } else var p = childNode_W;
        var pi = p.attr('id').split('-')[2];
        var t = p.attr('data-nodetype');
        if (t == 'scenarios') return;
        var split_char = ',';
        if (isIE) split_char = ' ';
        var l = p.attr('transform').slice(10, -1).split(split_char);
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        if (p.select('.ct-nodeTask')[0][0] != null) {
            var msg = 'Unassign the task to rename';
            if (t == 'screens') {
                msg = 'Unassign the task to rename. And unassign the corresponding testcases tasks';
            }
            openDialogMindmap('Rename Error', msg);
            return;
        }

        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        var name = '';
        //By default when a node is created it's name should be in ediatable mode

        name = dNodes_W[pi].name;
        //name=p.text();
        l = [(parseFloat(l[0]) - 20) * cScale + cSpan[0], (parseFloat(l[1]) + 42) * cScale + cSpan[1]];
        d3.select('#ct-inpBox').style('top', l[1] + 'px').style('left', l[0] + 'px').classed('no-disp', !1);
        d3.select('#ct-inpPredict').property('value', '');
        d3.select('#ct-inpAct').attr('data-nodeid', null).property('value', name).node().focus();
        d3.select('#ct-inpSugg').classed('no-disp', !0);
    };

    function deleteNode_W(e) {
        //If module is in edit mode, then return do not add any node
        if (d3.select('#ct-inpBox').attr('class') == "") return;
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        var s = d3.select(activeNode_W);
        //513-'Mindmap: When we delete an existing Module and create another module in the same work space  then a new Module instance is being appended .
        var t = s.attr('data-nodetype');
        if (t == 'modules_endtoend') return;
        var sid = s.attr('id').split('-')[2];
        var p = dNodes_W[sid].parent;
        recurseDelChild(dNodes_W[sid]);
        for (j = dLinks_W.length - 1; j >= 0; j--) {
            if (dLinks_W[j].target.id == sid) {
                d3.select('#ct-link-' + dLinks_W[j].id).remove();
                dLinks_W[j].deleted = !0;
                break;
            }
        }
        p.children.some(function(d, i) {
            if (d.id == sid) {
                //var nodeDel=dNodes_W.pop(sid);
                p.children.splice(i, 1);
                return !0;
            }
            return !1;
        });
        if (p.children.length == 0) d3.select('#ct-node-' + p.id).select('.ct-cRight').remove();
    };

    function moveNode_W(e) {
        e = e || window.event;
        //#886 Unable to rearrange nodes in e2e
        d3.select('.ct-movable').attr('transform', "translate(" + parseFloat((e.pageX - $('#ct-mapSvg').offset().left - cSpan[0]) / cScale + 2) + "," + parseFloat((e.pageY - $('#ct-mapSvg').offset().top - cSpan[1]) / cScale - 20) + ")");
    };

    function moveNodeBegin_W(e) {
        e = e || window.event;
        e.cancelbubble = !0;
        if (e.stopPropagation) e.stopPropagation();
        //To check whether browser Is IE or not issue #415
        var isIE = /*@cc_on!@*/ false || !!document.documentMode;
        var p = d3.select(this.parentElement);
        if (isIE) {
            var p = d3.select(this.parentNode);
        }
        var pi = p.attr('id').split('-')[2];
        temp_W = {
            s: [],
            t: ""
        };
        dLinks_W.forEach(function(d, i) {
            if (d.source.id == pi) {
                temp_W.s.push(d.id);
                d3.select('#ct-link-' + d.id).remove();
            } else if (d.target.id == pi) {
                temp_W.t = d.id;
                d3.select('#ct-link-' + d.id).remove();
            }
        });
        p.classed('ct-movable', !0);
        d3.select('#ct-mapSvg').on('mousemove.nodemove', moveNode_W);
    };

    function moveNodeEnd_W(e) {
        d3.select('#ct-mapSvg').on('mousemove.nodemove', null);
        var isIE = /*@cc_on!@*/ false || !!document.documentMode;
        var p = d3.select(this.parentElement);
        var split_char = ',';
        if (isIE) {
            var p = d3.select(this.parentNode);
            split_char = ' ';
        }

        var pi = p.attr('id').split('-')[2];
        var l = p.attr('transform').slice(10, -1).split(split_char);
        //Logic to implement rearranging of nodes
        var curNode = dNodes_W[pi];

        dNodes_W[pi].x = parseFloat(l[0]);
        dNodes_W[pi].y = parseFloat(l[1]);
        addLink(temp_W.t, dLinks_W[temp_W.t].source, dLinks_W[temp_W.t].target);
        var v = (dNodes_W[pi].children) ? !1 : !0;
        temp_W.s.forEach(function(d) {
            addLink(d, dLinks_W[d].source, dLinks_W[d].target);
            d3.select('#ct-link-' + d).classed('no-disp', v);
        });
        p.classed('ct-movable', !1);
    };

    function toggleNode_W(e) {
        var isIE = /*@cc_on!@*/ false || !!document.documentMode;
        var p = d3.select(this.parentElement);
        if (isIE) {
            var p = d3.select(this.parentNode);
        }
        var pi = p.attr('id').split('-')[2];
        if (dNodes_W[pi].children) {
            p.select('.ct-cRight').classed('ct-nodeBubble', !1);
            dNodes_W[pi]._children = dNodes_W[pi].children;
            dNodes_W[pi].children = null;
            recurseTogChild_W(dNodes_W[pi], !0);
        } else if (dNodes_W[pi]._children) {
            p.select('.ct-cRight').classed('ct-nodeBubble', !0);
            dNodes_W[pi].children = dNodes_W[pi]._children;
            dNodes_W[pi]._children = null;
            recurseTogChild_W(dNodes_W[pi], !1);
        }
    };

    function recurseTogChild_W(d, v) {
        if (d.children) d.children.forEach(function(e) {
            recurseTogChild_W(e, v);
            d3.select('#ct-node-' + e.id).classed('no-disp', v);
            for (j = dLinks_W.length - 1; j >= 0; j--) {
                if (dLinks_W[j].source.id == d.id) {
                    d3.select('#ct-link-' + dLinks_W[j].id).classed('no-disp', v);
                }
            }
        });
        else if (d._children) d._children.forEach(function(e) {
            recurseTogChild_W(e, !0);
            d3.select('#ct-node-' + e.id).classed('no-disp', !0);
            for (j = dLinks_W.length - 1; j >= 0; j--) {
                if (dLinks_W[j].source.id == d.id) {
                    d3.select('#ct-link-' + dLinks_W[j].id).classed('no-disp', !0);
                }
            }
        });
    };

    function inpChange_W(e) {
        var inp = d3.select('#ct-inpAct');
        var val = inp.property('value');
        if (val == 'Screen_0' || val == 'Scenario_0' || val == 'Testcase_0') {
            $('#ct-inpAct').addClass('errorClass');
            return;
        }
        if (!validNodeDetails(val, this)) return;
        //if(!validNodeDetails(this)) return;
        if (childNode_W != null) {
            var p = childNode_W;
        } else {
            var p = d3.select(activeNode_W);
        }
        var pi = p.attr('id').split('-')[2];
        var pt = p.select('.ct-nodeLabel');
        var t = p.attr('data-nodetype');
        if (!d3.select('#ct-inpSugg').classed('no-disp') && temp_W && temp_W.length > 0) return;
        if (dNodes_W[pi].id_n) {
            dNodes_W[pi].original_name = p.text();
            dNodes_W[pi].rnm = !0;
        }
        //To fix issue 378: In Mindmap, in End to end flow screen , for scenarios, tootlip is not present.
        dNodes_W[pi].name = val;
        pt.text(dNodes_W[pi].name);
        d3.select('#ct-inpBox').classed('no-disp', !0);


    };
    var inpKeyUp_W = function(e) {
        e = e || window.event;
        temp_W = [];
        var t, list;
        //To fix issue with suggestions
        if (childNode_W != null) {
            var p = childNode_W;
        } else {
            var p = d3.select(activeNode_W);
        }
        //var p=d3.select(activeNode_W);
        var val = d3.select(this).property('value');
        var iul = d3.select('#ct-inpSugg');
        if (e.keyCode == 13) {
            inpChange_W();
            return;
        }
        if (val.indexOf('_') == -1) {
            iul.classed('no-disp', !0);
            var isIE = /*@cc_on!@*/ false || !!document.documentMode;
            if (isIE) {
                d3.select(this.parentNode).select('#ct-inpPredict').property('value', '');
            } else d3.select(this.parentElement).select('#ct-inpPredict').property('value', '');

            return;
        }
        t = p.attr('data-nodetype');
        //if(t == 'scenarios') list = scenarioList;
        if (t == 'screens') list = scrList;
        else if (t == 'testcases') list = tcList;
        else return;
        iul.selectAll('li').remove();
        list.forEach(function(d, i) {
            var s = d.name.toLowerCase();
            if (s.lastIndexOf(val.toLowerCase(), 0) === 0) {
                temp_W.push(i);
                if (d.name.length > 23) s = d.name.slice(0, 23) + "...";
                else s = d.name;
                iul.append('li').attr('class', 'divider');
                iul.append('li').append('a').attr('data-nodeid', i).attr('data-nodename', d.name).html(s).on('click', function() {
                    var k = d3.select(this);
                    d3.select('#ct-inpSugg').classed('no-disp', !0);
                    d3.select('#ct-inpPredict').property('value', '');
                    d3.select('#ct-inpAct').attr('data-nodeid', k.attr('data-nodeid')).property('value', k.attr('data-nodename')).node().focus();
                });
            }
        });
        if (temp_W.length > 0 && val != list[temp_W[0]].name) {
            if (e.keyCode == 39) {
                iul.classed('no-disp', !0);
                d3.select('#ct-inpPredict').property('value', '');
                d3.select(this).attr('data-nodeid', temp_W[0]).property('value', list[temp_W[0]].name);
            } else {
                iul.select('li.divider').remove();
                iul.classed('no-disp', !1);
                d3.select(this).attr('data-nodeid', null);
                if (isIE) d3.select(this.parentNode).select('#ct-inpPredict').property('value', list[temp_W[0]].name);
                else d3.select(this.parentElement).select('#ct-inpPredict').property('value', list[temp_W[0]].name);
            }
        } else {
            iul.classed('no-disp', !0);
            d3.select(this).attr('data-nodeid', null);
            if (isIE) d3.select(this.parentNode).select('#ct-inpPredict').property('value', '');
            else d3.select(this.parentElement).select('#ct-inpPredict').property('value', '');
        }
    };

    function treeIterator_W(c, d, e) {
        c.push({
            projectID: d.projectID,
            id: d.id,
            childIndex: d.childIndex,
            id_c: (d.id_c) ? d.id_c : null,
            id_n: (d.id_n) ? d.id_n : null,
            oid: (d.oid) ? d.oid : null,
            name: d.name,
            type: d.type,
            pid: (d.parent) ? d.parent.id : null,
            pid_c: (d.parent) ? d.parent.id_c : null,
            task: (d.task) ? d.task : null,
            renamed: (d.rnm) ? d.rnm : !1,
            orig_name: (d.original_name) ? d.original_name : null
        });
        if (d.children && d.children.length > 0) d.children.forEach(function(t) {
            e = treeIterator_W(c, t, e);
        });
        else if (d._children && d._children.length > 0) d._children.forEach(function(t) {
            e = treeIterator(c, t, e);
        });
        //else if(d.type!='testcases') return !0;
        return e;
    };

    function actionEvent_W(e) {
        if($(this).hasClass('disableButton') || $(this).hasClass('no-access')) return;
        var s = d3.select(this);
        var error = !1,
            mapData = [],
            flag = 0,
            alertMsg;
        var temp_data = [];
        dNodes_W.forEach(function(e, i) {
            if (i == 0) return;
            temp_data[i] = {
                idx: i,
                x: e.x,
                y: e.y,
                type: e.type
            };
        });

        var layout_vertical = $('#switch-layout').hasClass('vertical-layout');
        if (layout_vertical) {

            temp_data.sort(function(a, b) {
                return a.x - b.x;
            });
        } else {

            temp_data.sort(function(a, b) {
                return a.y - b.y;
            });
        }


        var counter = {
            'scenarios': 1
        };
        temp_data.forEach(function(e, i) {
            dNodes_W[e.idx].childIndex = counter[e.type];
            counter[e.type] = counter[e.type] + 1;
        })
        error = treeIterator_W(mapData, dNodes_W[0], error);

        if (s.attr('id') == 'ct-saveAction_W') {
            blockUI('Saving flow! Please wait...');
            flag = 10;
            d3.select('#ct-inpBox').classed('no-disp', !0);


        } else if (s.attr('id') == 'ct-createAction_W') {
            flag = 20;
            if (error) {
                openDialogMindmap("Error", "Mindmap flow must be complete! End to End Module -> Scenarios");
                //$('#Mindmap_error').modal('show');
                return;
            }
            blockUI('Creating structure! Please wait...');
            d3.select('#ct-inpBox').classed('no-disp', !0);

        }
        if (flag == 0) return;
        if (s.classed('no-access')) return;
        //s.classed('no-access', !0);
        var userInfo = JSON.parse(window.localStorage['_UI']);
        var username = userInfo.username;
        if ($('#selectProjectEtem').val() == null) {
            unblockUI();
            openDialogMindmap('Error', 'No projects is assigned to User');
            return !1;
        }
        var cur_project = $('#selectProjectEtem').val();
        var selectedProject = '';

        mapData.forEach(function(d) {
            if (d.type == 'modules_endtoend') {
                selectedProject = d.projectID;
                return;
            }
        });

        if (selectedProject != cur_project) {
            unblockUI();
            openDialogMindmap('Error', "Module belongs to project: '" + $("#selectProjectEtem option[value='" + selectedProject + "']").text() + "' Please go back to the same project and Save");
            return;
        }
        if (mapData.length <= 1 && flag == 20) {
            unblockUI();
            openDialogMindmap('Error', 'Incomplete flow! Moudles->Scenarios flow should be present');
            s.classed('no-access', !1);
            return;
        }
        var from_v = to_v = '';
        

        mindmapServices.saveEndtoEndData(username, flag, window.localStorage['_SR'], from_v, to_v, 'endToend', mapData, deletednode_W, unassignTask, selectedProject, $('#ct-assignRel').val(), $('#ct-assignCyc').val()).then(function(result) {
            unblockUI();
            var res = result;
            if (flag == 10) {

                mapSaved = !0;
                var mid, sts = allMaps_info.some(function(m, i) {
                    if (m.id_n == res.id_n) {
                        mid = i;
                        allMaps_info[i] = res;
                        return !0;
                    }
                    return !1;
                });
                if (!sts) {
                    mid = allMaps_info.length;
                    allMaps_info.push(res);
                    var node = d3.select('#etemModuleContainer').append('span').attr('class', 'moduleContainer').attr('data-mapid', mid).attr('title', res.name).on('click', loadScenarios);
                    node.append('img').attr('class', 'ct-nodeIcon eteMbox').attr('src', 'imgs/ic-reportbox.png').attr('alt', 'Module').attr('aria-hidden', true);
                    node.append('span').attr('class', 'ct-nodeLabel modulename').html(res.name.replace(/_/g, ' '));
                }
                setModuleBoxHeight_W();
                clearSvg_W();
                treeBuilder_W(allMaps_info[mid]);
                unassignTask = [];
                //var selectedTab = window.localStorage['tabMindMap']
                unblockUI();
                openDialogMindmap("Success", "Data saved successfully");
                // fix for 1046:  "Create" does not work when we add scenarios from different projects
                saveFlag_W = true;
                //$('#ct-createAction_W').removeClass('disableButton').removeClass('no-access');
                SaveCreateED('#ct-createAction_W',0,0);
                //alert(window.localStorage['tabMindMap']);
                mindmapServices.getModules(versioning_enabled,'endToend', $("#selectProjectEtem").val(),'')
                    .then(function(result) {
                        var nodeBox = d3.select('#etemModuleContainer');
                        $(nodeBox[0]).empty();
                        allMMaps_W = allMaps_info = result;
                        //<span class='moduleContainer' data-moduleId=''><img alt='Module icon' class='eteMbox' src='imgs/ic-reportbox.png' title=''><br/><span class='modulename' title=''>Module"+(i+1)+"</span></span>
                        allMMaps_W.forEach(function(e, i) {
                            //var t=e.name.replace(/_/g,' ');
                            var src_image = 'imgs/ic-reportbox.png'
                            var class_name = 'eteMbox';
                            var onclick_func = displayScenarios;
                            if (e.type == 'modules_endtoend') {
                                class_name = 'eteMboxETE';
                                onclick_func = loadScenarios;
                                src_image = 'images_mindmap/endToEnd.png';
                            }
                            var t = $.trim(e.name);
                            var node = nodeBox.append('span').attr('class', 'moduleContainer').attr('data-mapid', i).attr('title', t).on('click', onclick_func);
                            node.append('img').attr('class', 'ct-nodeIcon ' + class_name).attr('src', src_image).attr('alt', 'Module').attr('aria-hidden', true);
                            node.append('span').attr('class', 'ct-nodeLabel modulename').html(t);
                        });
                        initScroller();
                        setModuleBoxHeight_W();
                    }, function(error) {
                        console.log(error);
                    })
            }
            if (flag == 20) {
                if (!saveFlag_W) return;
                var res = result[0];
                var mid, resMap = Object.keys(res);
                allMMaps_W.some(function(m, i) {
                    if (m.id_n == resMap[0]) {
                        mid = i;
                        return !0;
                    }
                    return !1;
                });
                //263-'Mindmap- Module: Currently allowing to create 2 modules with same name- Error msg is given on click of Create button
                console.log(allMMaps_W);
                console.log(mid);
                if (allMMaps_W[mid] != undefined) {
                    allMMaps_W[mid].id_c = res[resMap[0]];
                    allMMaps_W[mid].children.forEach(function(tsc) {
                        tsc.id_c = res[tsc.id_n];
                        //Himanshu please check the cause for scenario children is undefined here
                        tsc.children.forEach(function(scr) {
                            scr.id_c = res[scr.id_n];
                            scr.children.forEach(function(tc) {
                                if (res[tc.id_n] != 'null') {
                                    tc.id_c = res[tc.id_n];
                                }
                            });
                        });
                    });
                    //To update cassandra_ids (id_c) of nodes in dNodes_W variable
                    dNodes_W.forEach(function(d) {
                        if (d.type == 'modules') d.id_c = res[resMap[0]];
                        else d.id_c = res[d.id_n];

                    });
                    openDialogMindmap("Success", "Structure created successfully");
                    saveFlag_W = false;
                    //$('#ct-createAction_W').addClass('disableButton');
                    SaveCreateED('#ct-createAction_W',1,0);
                } else {
                    saveFlag_W = false;
                    openDialogMindmap("Success", "Failed to create structure");
                }
                //$('#Mindmap_create').modal('show');
            }
        }, function(error) {
            unblockUI();
            if (error == 'DuplicateModules') {
                openDialogMindmap('Save error', 'Module names cannot be duplicate');
            } else {
                openDialogMindmap('Save error', 'Failed to save data');
            }
        })

    };

    $scope.addScenariosete = function(e) {
        SaveCreateED('#ct-createAction_W',1,0);
        //// #817 To select multiple scenarios in e2e (Himanshu)
        $('.selectScenariobg').each(function(i, obj) {
            var text = $(obj).text();
            if ($(obj).attr('data-scenarioId') != 'null') {
                createScenario_Node(text, $('#selectProjectEtem').val());
            } else {
                openDialogMindmap('Error', 'Scenario is not created');
            }
        });
    };

    $scope.createNewMap_W = function(e) {
        createNewMap_W();
    };


    function setModuleBoxHeight_W() {
        //var lm=d3.select('#ct-moduleBox').classed('ct-open',!0);
        var lm = d3.select('#etemModuleContainer').classed('ct-open', !0);
        var h1 = lm.style('height');
        lm.classed('ct-open', !1);
        if (h1 == lm.style('height')) lm.select('.ct-expand').classed('no-disp', !0);
        else lm.select('.ct-expand').classed('no-disp', !1);
    };

    function clearSvg_W() {
        d3.select('#ct-mindMap').remove();
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        d3.select('#ct-assignBox').classed('no-disp', !0);
        d3.select('#ct-mapSvg').append('g').attr('id', 'ct-mindMap');
        uNix_W = 0;
        uLix_W = 0;
        dNodes_W = [];
        dLinks_W = [];
        nCount = [0, 0, 0, 0];
        cSpan_W = [0, 0];
        cScale_W = 1;
        mapSaved = !1;
        zoom_W.scale(cScale_W).translate(cSpan_W);
        zoom_W.event(d3.select('#ct-mapSvg'));
    };

    //FUnction is tagged to every click on 'cnavas' element to validate the names of nodes when created
    function callme() {
        if (childNode_W != null && (childNode_W.text() == 'Module_0' || childNode_W.text() == 'Screen_0' || childNode_W.text() == 'Scenario_0' || childNode_W.text() == 'Testcase_0')) {
            d3.select('#ct-inpBox').classed('no-disp', !1);
        }

    }

    function treeBuilder_W(tree) {
        node_names_tc = [];
        var pidx = 0,
            levelCount = [1],
            cSize = getElementDimm(d3.select("#ct-mapSvg"));
        var typeNum = {
            'modules_endtoend': 0,
            'scenarios': 1,
            'screens': 2,
            'testcases': 3
        };
        var childCounter = function(l, s) {
            if (levelCount.length <= l) levelCount.push(0);
            if (s.children) {
                levelCount[l] += s.children.length;
                s.children.forEach(function(d) {
                    childCounter(l + 1, d);
                });
            }
        };
        childCounter(1, tree);
        var newHeight = d3.max(levelCount) * 90;
        var d3Tree = d3.layout.tree().size([newHeight, cSize[0]]);
        // if(tree.oid===undefined) d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
        // else d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
        if (tree.childIndex === undefined) d3Tree.sort(function(a, b) {
            return a.childIndex - b.childIndex;
        });
        else d3Tree.sort(function(a, b) {
            return a.childIndex - b.childIndex;
        });
        dNodes_W = d3Tree.nodes(tree);
        //dLinks_W=d3Tree.links(dNodes_W);
        dNodes_W.forEach(function(d) {

            // switch-layout feature
            if ($('#switch-layout').hasClass('vertical-layout')) {
                d.y = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
            } else {
                d.y = d.x;
                //Logic to change the layout and to reduce the length of the links
                d.x = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
            }
            if (d.oid === undefined) d.oid = d.id;
            d.id = uNix_W++;
            addNode_W(d, !0, d.parent);
            if (d.task != null) d3.select('#ct-node-' + d.id).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'images_mindmap/node-task-assigned.png').attr('x', 29).attr('y', -10);
        });
        dLinks_W = d3Tree.links(dNodes_W);
        dLinks_W.forEach(function(d) {
            d.id = uLix_W++;
            addLink(d.id, d.source, d.target);
        });
        //zoom.translate([0,(cSize[1]/2)-dNodes_W[0].y]);
        // switch-layout feature
        if ($('#switch-layout').hasClass('vertical-layout')) {
            zoom_W.translate([(cSize[0] / 2) - dNodes_W[0].x, (cSize[1] / 5) - dNodes_W[0].y]);
        } else {
            zoom_W.translate([(cSize[0] / 3) - dNodes_W[0].x, (cSize[1] / 2) - dNodes_W[0].y]);
        }
        zoom_W.event(d3.select('#ct-mapSvg'));
    };
    //-------------------End of workflow.js---------------------------//
    //-------------------Start of Versioning.js-----------------------//
    /*
function replicationHandler()
Purpose : displaying pop up for replication of project
*/

function replicationHandler() {
  console.log('Inside..')
  var userInfo = JSON.parse(window.localStorage['_UI']);
  var user_id = userInfo.user_id;
  blockUI('Loading....')
  mindmapServices.populateProjects().then(function(result) {
      var project_type=$('.project-list').find(':selected').attr('app-type')
      mindmapServices.getProjectsNeo().then(function(res){
          var parse_data = res;
          var flag=0;
          $('.versioningOption').remove()
          var parsed_project_id = [];
          for (var i = 0; i < parse_data[0].data.length; i++) {
            parsed_project_id.push(parse_data[0].data[i].row[0])
          }

          var new_projectsList = {
            projectId: [],
            projectName: [],
            appType: []
	        };
          for(var i=0;i<result['projectName'].length;i++)
          {
            if(project_type==result['appType'][i]){
              new_projectsList.projectId.push(result['projectId'][i]);
              new_projectsList.projectName.push(result['projectName'][i]);
              new_projectsList.appType.push(result['appType'][i]);
            }

          }
          if(parsed_project_id.indexOf($('.project-list').val())!=-1){
              for (var i = 0; i < new_projectsList['projectName'].length; i++) {
                if (parsed_project_id.indexOf(new_projectsList['projectId'][i]) != -1) {
                  console.log('Available in Neo4j')
                } else {
                  flag=1;
                  $('#destProjects').append($('<option>').attr({ value: new_projectsList['projectId'][i], class: 'versioningOption' }).text(new_projectsList['projectName'][i]));
                }
              }
              $('#ProjectReplicationPopUp').modal("show");
               $('#replicateVersionButton').removeClass('disableButton').removeAttr('disabled','disabled');
              if(!flag)
                $('#replicateVersionButton').addClass('disableButton').attr('disabled','disabled');
          }
          else{
            openDialogMindmap('Mindmap', "Empty Projects cannot be replicated.")
          }
          unblockUI();

      },function(err){
          console.log('Error in fetching projects list'); 
          unblockUI();
      })
  },function(err){
        console.log('Error in fetching projects list'); 
        unblockUI();
  })


}

/*
  function replicationController()
  Purpose : Invoking replication project
*/

$scope.replicationController=function replicationController() {

  replicate_project($('.version-list').val(), '0.0', $('#destProjects').val())
}

/*
function replicate_project()
Purpose:Invoking the node service for replication of project
*/

function replicate_project(from_v, to_v, pid) {
  var userInfo = JSON.parse(window.localStorage['_UI']);
  var user_id = userInfo.user_id;
  console.log("inside replicate project");
  blockUI('Loading....')
    mindmapServices.createVersion('project_replicate',window.localStorage['_SR'], $(".project-list").val(),pid, from_v,  to_v,10 ).then(
      function(res){
        $('.version-list').val(to_v);
       unblockUI();
       openDialogMindmap('Mindmap', "Project Replicated Successfully.")
      },function(err){
          console.log(err); 
          unblockUI(); 
          openDialogMindmap('Mindmap', "Project Replication Failed.")
      }
  )


}


/*
function : loadMindmapData()
Purpose : loading mindmap data for default version.
*/

function loadMindmapData_V() {
  loadMindmapData(1);
}

/*
function : addVersioning(vn)
Purpose : Adding versioning UI in the mindmap UI.
params : versions : list of all versions of the selected project
*/

function addVersioning(versions) {
//   versions = JSON.parse(versions);
  console.log("versioning enabled");
  $('.replicate').remove()
  $('.selectVersion').remove();
  $('.ct-project-tab').append($('<span>').attr({
    class: 'selectVersion'
  }).append($('<label>').attr({
    class: 'selectVersionLabel'
  }).text('Version: ')
    ).append($('<select>').attr({
      class: 'version-list'
    })).append($('<i>').attr({
      class: 'fa fa-plus-circle fa-lg plus-icon',
      title: "Create New Version",
      //onclick: "versionInputDialogShow(event)"
    })).append($('<i>').attr({
      class: 'fa fa-window-restore fa-lg plus-icon',
      title: "Replicate project",
      //onclick: 'replicationHandler()'
    })
    ).append($('<i>').attr({
      class: 'glyphicon glyphicon-export plus-icon',
      title: "Export Version",
      //onclick: 'exportData(1)'
    })));
  for (i = 0; i < versions.length; i++) {
    $('.version-list').append($('<option>').attr({
      value: versions[i]
    }).text(versions[i]))
  }

  $('.version-list').change(function(){
      loadModules();
  });
   $('.fa.fa-plus-circle.fa-lg.plus-icon').click(function(e){
      versionInputDialogShow(e);
  });

   $('.fa.fa-window-restore.fa-lg.plus-icon').click(function(){
       
      replicationHandler();
  });

   $('.glyphicon.glyphicon-export.plus-icon').click(function(){
      exportData(versioning_enabled);
  });

  //setCookie('mm_pvid', $('.version-list').children()[0].value, 15);
  $('.version-list').val($('.version-list').children()[0].value);

  // if (getCookie('mm_pvid') != '') {
  //   $('.version-list').val(getCookie('mm_pvid'));
  // }
  loadMindmapData1(1);
  //loadModules(versions)
  $('.version-list').attr({title:$('.version-list').val()});
  $('.selectProject').addClass('selectProjectPosition')
  if (window.localStorage['tabMindMap'] == "tabAssign") {
    $('.plus-icon').remove();
    $('.selectVersion').css('margin-left', '2%');
  }
}

/*
function : loadModules()
Purpose : Loads modules for the active project Version.
params : None
*/

function loadModules() {
  var active_version = $('.version-list').val();
  $('.version-list').attr({title:active_version});
  blockUI('Loading...');
  var svgTileG = d3.select('.ct-tile').append('svg').attr('class', 'ct-svgTile').attr('height', '150px').attr('width', '150px').append('g');
  var svgTileLen = $(".ct-svgTile").length;
  if (svgTileLen == 0) {
    $('#ct-mapSvg, #ct-canvas').empty();
    $('#ct-canvas').append('<div class="ct-tileBox"><div class="ct-tile" title="Create Mindmap"><svg class="ct-svgTile" height="150px" width="150px"><g><circle cx="75" cy="75" r="30"></circle><path d="M75,55L75,95"></path><path d="M55,75L95,75"></path></g></svg></div><span class="ct-text">Create Mindmap</span></div>');

  }
  mindmapServices.getModules(versioning_enabled,window.localStorage['tabMindMap'],$(".project-list").val(),parseFloat(active_version)).then(
      function(res){
            var nodeBox = d3.select('.ct-nodeBox');
            $(nodeBox[0]).empty();
            allMMaps = res;
            allMMaps.forEach(function (e, i) {
                var t = $.trim(e.name);
                var img_src = 'images_mindmap/node-modules-no.png';
                if (e.type == 'modules_endtoend') img_src = 'images_mindmap/MM5.png';
                var node = nodeBox.append('div').attr('class', 'ct-node fl-left').attr('data-mapid', i).attr('title', t).on('click', loadMap);
                node.append('img').attr('class', 'ct-nodeIcon').attr('src', img_src).attr('alt', 'Module').attr('aria-hidden', true);
                node.append('span').attr('class', 'ct-nodeLabel').html(t);
            });
            populateDynamicInputList();
            setModuleBoxHeight();
            unblockUI();
      },function(err){
           console.log(err);
            unblockUI();
      }
  )


}


/*
function : createNewTab(from_v,to_v)
Purpose : Creates a New project version in the Neo4j db and creates a new tab for that.
params : from_v : from the version (Source version), to_v : Version number provided by the user.
*/
function createNewTab(from_v, to_v) {

  var userInfo = JSON.parse(window.localStorage['_UI']);
  var user_id = userInfo.user_id;
  if ($('.ct-nodeBox')[0].children !== undefined && $('.ct-nodeBox')[0].children.length == 0) {
    openDialogMindmap('Error', "Cannot Create Empty Version");
    return;
  }
  blockUI('Loading...');
  mindmapServices.createVersion('',window.localStorage['_SR'],  $(".project-list").val(),'', from_v, to_v, 10 ).then(
      function(res){
        $('.version-list').val(to_v);
       unblockUI();
       loadModules();
        openDialogMindmap('Mindmap', "New Version Created Successfully.");
      },function(err){
          console.log(err); 
          unblockUI(); 
          openDialogMindmap('Mindmap', "New Version Creation Failed.")
      }

  )

}

/*

  function : versionInputDialogClose()
  Purpose : Closes the dialog box for version Number input.

*/

function versionInputDialogClose() {

  $('#versionNumInputPopUp').modal('toggle');
}

/*

  function : clearInputData()
  Purpose : Clears the data in  dialog box for version Number input.

*/

function clearInputData() {
  $('#versionNumberInput').val('');
}

/*

  function : versionInputDialogShow(e)
  Purpose : Shows the dialog to add version number.
  param: e : event to get the source version number tab
*/
function versionInputDialogShow() {
  var from_v = $('.version-list').val();
  console.log(from_v)
  $('#createNewVersionButton').click(function(e){
      createNewVersion(from_v)
  })
  mindmapServices.getVersions($(".project-list").val()).then(
    function(res){
      maxVersionNumber=res[res.length-1];
	  $('#versionNumInputPopUp').modal("show");
        $('#versionNumberInput').val((parseFloat(maxVersionNumber) + 0.1).toFixed(1));
    },function(err){
        console.log(err);
        openDialogMindmap('Error','Error in creating versions')
    })



}

/*
function : createNewVersion(from_v)
Purpose : This function calls isValidVersionToCreate to verify the version number
provided by the user in the dialog box and calls createNewTab to create new version in the database
param : from_v : source version
*/

function createNewVersion(from_v) {
  console.log(from_v);
  inputVersion = parseFloat($('#versionNumberInput').val());
  mindmapServices.getVersions($(".project-list").val()).then(
    function(result){
        maxVersionNumber=result[result.length-1];
        if(inputVersion>parseFloat(maxVersionNumber)){
            createNewTab(from_v, inputVersion);
        }else{
            if (result.includes(inputVersion.toString()))
                openDialogMindmap('Error', "Version Number already exists");

            else {
                openDialogMindmap('Error', "Invalid Version Number");
            }
        }
    },function(err){
        console.log(err);
        openDialogMindmap('Error','Error in creating versions')
    })
  
}

/*
function : validateFloatKeyPress(el, evt)
Purpose : This function restricts user to add only float number and to keep float as one decimal point.
param : el, evt
*/

function validateFloatKeyPress(el, evt) {
  var charCode = (evt.which) ? evt.which : event.keyCode;
  var number = el.value.split('.');
  if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  //just one dot
  if (number.length > 1 && charCode == 46) {
    return false;
  }
  //get the carat position
  var caratPos = getSelectionStart(el);
  var dotPos = el.value.indexOf(".");
  if (caratPos > dotPos && dotPos > -1 && (number[1].length > 0)) {
    return false;
  }
  return true;
}

/*
function : getSelectionStart(o)
Purpose : Helper function for validateFloatKeyPress
param : o
*/
function getSelectionStart(o) {
  if (o.createTextRange) {
    var r = document.selection.createRange().duplicate()
    r.moveEnd('character', o.value.length)
    if (r.text == '') return o.value.length
    return o.value.lastIndexOf(r.text)
  } else return o.selectionStart
}
    //--------------------End of Versioning.js---------------------//
    //--------------------Controller logic-------------------------//
    $("body").css("background", "#eee");
    $("head").append('<link id="mindmapCSS1" rel="stylesheet" type="text/css" href="css/css_mindmap/style.css" /><link id="mindmapCSS2" rel="stylesheet" type="text/css" href="fonts/font-awesome_mindmap/css/font-awesome.min.css" />')
    if (window.localStorage['navigateScreen'] != "mindmap") {
        $rootScope.redirectPage();
    }
    var versioningEnabled = false;
    $timeout(function() {
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
        document.getElementById("currentYear").innerHTML = new Date().getFullYear()
        adjustMidPanel();
    }, 500)
    var blockMsg = 'Please Wait...';
    blockUI(blockMsg);
    loadUserTasks();
    unblockUI();
    /*creating version in ui*/
    socket.on('versionUpdate', function(to_v) {
        $('.version-list').append($('<option>').attr({
            value: to_v
        }).text(to_v))
    });

    /*Sidebar-toggle*/
    $scope.tab = "tabRequirement";
    $(".lsSlide,.rsSlide").show();
    $('#ct-main').addClass('leftBarOpen rightBarOpen');
    $('.selectProject').show();
    // $("#ct-moduleBox").hide();
    //$("#ct-moduleBox,.ct-tilebox").hide();
    $("#ct-expand-left").click(function(e) {
        console.log('leftbar click')
        if ($("#ct-expand-left").hasClass("ct-rev")) $(".lsSlide").animate({
            width: 0
        }, 200, function() {
            $(".lsSlide").hide();
        })
        else
            $(".lsSlide").show().animate({
                width: 166
            }, 200);
        $("#ct-expand-left").toggleClass("ct-rev");
        $("#ct-main").toggleClass("leftBarOpen");
        adjustMidPanel();
    });

    $("#ct-expand-right").click(function(e) {
        console.log('rightbar click')
        if ($("#ct-expand-right").hasClass("ct-rev")) $(".rsSlide").animate({
            width: 0
        }, 200, function() {
            $(".rsSlide").hide();
        })
        else $(".rsSlide").show().animate({
            width: 90
        }, 200);
        $("#ct-expand-right").toggleClass("ct-rev");
        $("#ct-main").toggleClass("rightBarOpen");
        adjustMidPanel();
    });

    function adjustMidPanel() {
        if ($('.leftBarOpen.rightBarOpen').length > 0) {
            $(".ct-tileBox").css({
                'left': '50%'
            })
            //endtoend
            $(".endtoend-modulesContainer").prop("style", "width:calc(100% - 256px) !important; left:166px !important;");
            $(".searchModuleimg").prop("style", "right:86px !important;");
            $(".endtoend-modules-right-upper img").prop("style", "left:180px !important;");
            $(".eteLabel").prop("style", "left:366px !important; width:140px !important; bottom:23px !important;");
        } else if ($('.leftBarOpen').length > 0) {
            // $("#ct-moduleBox,.tabAssign").css({'left':'147px !important','width':'100%'})
            $(".ct-tileBox").css({
                'left': '52% !important'
            });
            //endtoend
            $(".endtoend-modulesContainer").prop("style", "width:calc(100% - 172px) !important; left:166px !important;");
            $(".searchModuleimg").prop("style", "right:91px !important;");
            $(".endtoend-modules-right-upper img").prop("style", "left:195px !important;");
            $(".eteLabel").prop("style", "left:392px !important; width:140px !important; bottom:23px !important;");
        } else if ($('.rightBarOpen').length > 0) {
            //endtoend
            $(".endtoend-modulesContainer").prop("style", "width:calc(100% - 96px) !important;");
            $(".searchModuleimg").prop("style", "right:95px !important;");
            $(".endtoend-modules-right-upper img").prop("style", "left:210px !important;");
            $(".eteLabel").prop("style", "left:420px !important; width:140px !important; bottom:18px !important;");
        } else {
            //endtoend
            $(".endtoend-modulesContainer").prop("style", "width:calc(100% - 10px) !important;");
            $(".searchModuleimg").prop("style", "right:100px !important;");
            $(".endtoend-modules-right-upper img").prop("style", "left:222px !important;");
            $(".eteLabel").prop("style", "left:0 !important; width:140px !important; bottom:18px !important;");

        }
    }

    // Changes made for End to end module implementation
    $scope.createMapsCall = function(e) {
        mindmapServices.getProjectsNeo().then(function(res){
            versioningEnabled = true;
            load_tab();

        },function(err){
            load_tab();

        })

        function collapseSidebars() {
            if ($('#left-nav-section').is(':visible'))
                $("#ct-expand-left").trigger("click");
            if ($('#right-dependencies-section').is(':visible'))
                $("#ct-expand-right").trigger("click");
        }

        function load_tab() {
            function selectOpt(tab) {
                $("img.selectedIcon").removeClass("selectedIcon");
                $('#' + tab).addClass('selectedIcon');
            }
            if ($scope.tab == 'tabRequirement') {
                $('.selectProject').hide();
                selectOpt('reqImg');
            } else if ($scope.tab == 'mindmapCreateOption') {
                $('.selectProject').hide();
                selectOpt('createImg');
            } else if ($scope.tab == 'mindmapEndtoEndModules') {
                // if(!versioningEnabled){
                $("#ct-main").hide();
                selectOpt('createImg');
                collapseSidebars();
                //loadMindmapData_W();
                loadMindmapData(2);

            } else {
                if ($scope.tab == 'tabCreate') {
                    $('.selectProject').show();
                    selectOpt('createImg');
                    if (!versioningEnabled)
                        $('.selectProject').addClass('selectProjectPosition');
                    $("#ct-main").show();
                    if (!versioningEnabled) {
                        addExport(versioningEnabled);
                    }
                } else if ($scope.tab == 'tabAssign') {
                    $('.selectProject').show();
                    selectOpt('assignImg');
                    if (!versioningEnabled)
                        $('.selectProject').addClass('selectProjectPosition');
                    $("#ct-main").show();
                }

                collapseSidebars();
                //if versioning.js file is present then call addVersioning function else call loadMindmapData()
                if (versioningEnabled) {
                    loadMindmapData_V();
                } else {
                    loadMindmapData(0);
                }

                $timeout(function() {
                    $('#ct-moduleBox').prop("style", "width:100% ; left:0px ;");
                }, 10);
                $timeout(function() {
                    $('#ct-AssignBox').prop("style", "width:100% ; left:0px ;");
                }, 10);
            }
            window.localStorage['tabMindMap'] = $scope.tab;
        }
    }

    $scope.createMap = function(option) {
        $scope.tab = option;
    }

    
    $scope.collapseETE = function() {
        if (collapseEteflag) {
            if (screen.height < 1024) {
                $(".endtoend-modulesContainer").prop("style", "height: 48% !important;");
                //$("#ct-canvas").prop("style","height: 250px !important");
                $("#ct-legendBox").prop("style", "top: calc(100% - 24px) !important; left: 8px !important;");
                $("#ct-actionBox_W").prop("style", "top: calc(100% - 34px) !important; left: (100% - 285px) !important;");
            } else {
                $(".endtoend-modulesContainer").css("height", "calc(100% - 430px)");
                //$("#ct-canvas").prop("style","height: 410px !important")
            }
            $(this).attr("src", "imgs/ic-collapseup.png");
            collapseEteflag = false;
        } else {
            if (screen.height < 1024) {
                $(".endtoend-modulesContainer").prop("style", "height: 28% !important;");
                //$("#ct-canvas").prop("style","height: 352px !important")
            } else {
                $(".endtoend-modulesContainer").css("height", "calc(100% - 643px)");
                //$("#ct-canvas").prop("style","height: 660px !important")
            }
            $(this).attr("src", "imgs/ic-collapse.png");
            collapseEteflag = true;
        }
    }

    //Search Modules
    $('#eteSearchModules').keyup(function() {
        filter(this, 'etemModuleContainer');
    });

    //Search Scenarios
    $('#eteSearchScenarios').keyup(function() {
        filter(this, 'eteScenarioContainer');
    });

    function filter(element, id) {
        var value = $(element).val();
        var container;
        container = $("#" + id + " span.eteScenrios");
        $(container).each(function() {
            if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
                id == "etemModuleContainer" ? $(this).parent().show() : $(this).show()
            } else {
                id == "etemModuleContainer" ? $(this).parent().hide() : $(this).hide()
            }
        });
    }

    // Search for modules in create tab (Himanshu)
    $scope.searchModule = function(tab) {
        input = document.getElementById(tab);
        filter_elem = input.value.toUpperCase();
        if(tab == 'eteSearchModules')
            elems = $('.moduleContainer');
        else if(tab == 'eteSearchScenarios')
            elems = $('.eteScenrios');
        else if( tab == 'searchModule-create')
            elems = $('#ct-moduleBox .ct-node');
        else if(tab == 'searchModule-assign')
            elems = $('.ct-nodeBox .ct-node');
            
            
        for (i = 0; i < elems.length; i++) {
            if (elems[i].textContent.toUpperCase().indexOf(filter_elem) > -1) {
                elems[i].style.display = "";
            } else {
                elems[i].style.display = "none";
            }
        }
    };


    function initScroller() {
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
    }
    // Changes made for End to end module implementation
    //To toggle the view when user clicks on switch layout (Himanshu)
    $scope.toggleview = function() {
        var selectedTab = window.localStorage['tabMindMap'];
        if (selectedTab == 'mindmapEndtoEndModules')
            var temp = dNodes_W.length;
        else
            var temp = dNodes.length;

        if (temp == 0) {
            openDialogMindmap('Error', "Please select a module first");
        } else if ((selectedTab == 'mindmapEndtoEndModules' || selectedTab == 'tabCreate') && !$('#ct-inpBox').hasClass('no-disp')) {
            openDialogMindmap('Error', "Please complete editing first");
            d3.select('#ct-inpAct').node().focus();
        } else if (selectedTab == 'tabAssign' && !$('#ct-assignBox').hasClass('no-disp')) {
            openDialogMindmap('Error', 'Please complete assign step first');
        } else {
            $('#switch-layout').toggleClass('vertical-layout');
            loadMap2();
        }
    };

    $scope.createNewMap = function() {
        if ($('.ct-svgTile').length != 0 ||($('.ct-svgTile').length == 0 && confirm('Unsaved work will be lost if you continue.\nContinue?'))) {
            $('.nodeBoxSelected').removeClass('nodeBoxSelected');
            createNewMap();
        }
    }

    $scope.fullScreen = function() {
        var elt = document.getElementById('viewArea');
        console.log("Requesting fullscreen for", elt);
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
                console.error("Fullscreen not available");
            }
        }
    }

    $scope.copyMindMap = function() {
        if (dNodes_c.length == 0) {
            openDialogMindmap('Warning', 'Nothing is copied');
            return;
        }
        copyMap();
    }
    $scope.startCopy = function() {
        // $('#copyImg1').toggleClass('copyEnable');
        if($('#pasteImg1.active-map').length>0) $scope.pasteMap(); //Disable paste
        if ($('#rect-copy').length == 0) {
            $('#copyImg1').addClass('active-map');
            draww();
        } else {
            $('#rect-copy').remove();
            $('#copyImg1').removeClass('active-map');
            $('.node-selected').removeClass('node-selected');
            $('.link-selected').removeClass('link-selected');
        }
    }
    $scope.pasteMap = function() {
        console.error('bwahahaha');
        if ($('.fa.fa-pencil-square-o.fa-lg.plus-icon').hasClass('active-map')) {
            openDialogMindmap('Error', 'Please complete copy step first');
            return;
        }
        if (dNodes_c.length == 0) {
            openDialogMindmap('Error', 'Nothing to paste');
            return;
        }
        $('#pasteImg1').toggleClass('active-map');
        var mod = false;
        //select a node to paste all red just available green module/scenario
        dNodes_c.forEach(function(e, i) {
            if (e.type == 'scenarios')
                mod = true; // then check for dangling screen
        })
        if (mod) {
            //add to module
            $('[data-nodetype=modules]').addClass('node-selected');
        } else {
            //highlight scenarios
            $('[data-nodetype=scenarios]').addClass('node-selected');
        }
        if (!$('#pasteImg1').hasClass('active-map')) {
            dNodes_c = [];
            dLinks_c = [];
            $('.node-selected').removeClass('node-selected');
        }
    }
    //--------------------Controller logic Ends-------------------------//

    function SaveCreateED(element,disable,noAccess){
        d3.select(element).classed('no-access',noAccess);
        d3.select(element).classed('disableButton',disable);
    }
}]);
