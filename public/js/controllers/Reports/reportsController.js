mySPA.controller('reportsController', ['$scope', '$rootScope', '$http', '$location', '$timeout', '$window', 'reportService', 'mindmapServices', 'cfpLoadingBar', '$sce', function ($scope, $rootScope, $http, $location, $timeout, $window, reportService, mindmapServices, cfpLoadingBar, $sce) {
    $("head").append('<link rel="stylesheet" href="css/css_reports/bootstrap/bootstrap.min.css"> <link rel="stylesheet" type="text/css" href="css/css_reports/datatables/dataTables.css"><link rel="stylesheet" type="text/css" href="css/css_reports/header.css"><link rel="stylesheet" type="text/css" href="css/css_reports/footer.css"><link rel="stylesheet" type="text/css" href="css/css_reports/leftSideBar.css"><link rel="stylesheet" type="text/css" href="css/css_reports/rightSideBar.css"><link rel="stylesheet" type="text/css" href="css/css_reports/reports.css"><script src="js/plugins/reports/bootstrap/popper.js"></script><script src="js/plugins/reports/bootstrap/bootstrap.min.js"></script><script src="js/plugins/reports/datatables/datatables.min.js"></script>');
    var getUserInfo = JSON.parse(window.localStorage['_UI']);
    var userID = getUserInfo.user_id;
    var oTable;
    var openArrow = 0;
    var openWindow = 0;
    var executionId, testsuiteId;
    var robj, redirected = false;
    var access_only = false;
    var pauseloadinginterval = false;
    var clearIntervalList = [];
    var slideOpen = false;
    $scope.reportIdx = ''; // for execution count click
    $scope.prc = {
        projects: [],
        projectId: '',
        releases: [],
        releaseId: '',
        cycles: [],
        cycleId: ''
    };
    $rootScope.reportData = "";
    $("#reportDataTableDiv").hide();
    $('.reports-search').attr('disabled', 'disabled');
    $('#ctExpandAssign').css('pointer-events','none');

    cfpLoadingBar.start()

    $timeout(function() {
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear();
        angular.element(document.getElementById("reportSection")).scope().getReports_ICE();
        $('#ct-expand-left,#ct-expand-right').trigger('click');
        $('#ct-expand-left,#ct-expand-right').css('pointerEvents', 'none');
    }, 100)
    if (window.localStorage['navigateScreen'] != "p_Reports") {
        return $rootScope.redirectPage();
    }

    //Bind Projects in project dropdown on load
    $scope.getReports_ICE = function() {
        $("#middle-content-section").css('visibility', 'visible');
        getProjectsAndSuites(userID, "projects");
    }

    //getAllSuites_ICE function call
    function getProjectsAndSuites(ID, type) {
        reportService.getAllSuites_ICE(ID, type)
            .then(function(data) {
                if (data == "Invalid Session") {
                    return $rootScope.redirectPage();
                }
                window.localStorage['project']=JSON.stringify(data)
                if (type == "projects") {
                    if(data != "fail"){
                        unblockUI();
                        $scope.prc.projects = data;
                        $scope.prc.releases = [];
                        $scope.prc.releaseId = '';
                        $scope.prc.cycles = [];
                        $scope.prc.cycleId = '';
                        if (redirected) {
                            $timeout(function() {
                                $scope.prc.projectId = robj.testSuiteDetails[0].projectidts;
                                $scope.prc.selProjectsFilter();
                            }, 300);
                        }
                    } else console.log("Unable to load test suites.");
                    $('.searchScrapEle').css('display', 'none');
                    if ($('.dynamicTestsuiteContainer').find('.suiteContainer').length <= 0) {
                        $('.suitedropdownicon, .dynamicTestsuiteContainer').hide();
                    } else $('.suitedropdownicon').show();
                    $('[data-toggle="tooltip"]').tooltip();
                    cfpLoadingBar.complete();
                }
            }, function(error) {
                console.log("Error in service getAllSuites_ICE -" + error);
                return "fail";
            })
    }

    //Bind releases on Projects Filter Change
    $scope.prc.selProjectsFilter = function() {
        var projectId = this.projectId;
        if (projectId == null) return;
        blockUI("Loading releases.. please wait..");
        $(".moduleBox,.mid-report-section,#accordion").hide();
        $("#report-header,#report-canvas").hide();
        $('#nodeBox').empty();
        $('#ctExpandAssign').css('pointer-events','none');
        $("#expAssign").attr('src', 'imgs/ic-collapse.png');
        $('#searchModule').val('');
        $('#searchModule').attr('disabled', 'disabled');
        var data = JSON.parse(window.localStorage['project'])
        try{
            for (var i=0; i< data.length; i++){
                if(projectId == data[i]._id){
                    unblockUI();
                    $scope.prc.releaseId = '';
                    $scope.prc.cycles = [];
                    $scope.prc.cycleId = '';
                    $scope.prc.releases =  data[i].releases;
                    if (redirected) {
                        $scope.prc.releaseId = robj.testSuiteDetails[0].releaseid;
                        $scope.prc.selReleasesFilter();
                    }
                    break;
                }
            }
        } catch(exception){
            unblockUI();
            console.log("Error in service populateReleases while fetching projects -" + error);
        }
    };

    //Bind cycles on releases Filter Change
    $scope.prc.selReleasesFilter = function() {
        var releaseName=this.releaseId;
        if (releaseName == null) return;
        blockUI("Loading cycles.. please wait..");
        $(".moduleBox,.mid-report-section,#accordion").hide();
        $("#expAssign").attr('src', 'imgs/ic-collapse.png');
        $('#searchModule').val('');
        $('#searchModule').attr('disabled', 'disabled');
        var result = $scope.prc.releases;
        try{
            for (var i=0;i< result.length;i++){
                if (releaseName == result[i].name) {
                    unblockUI();
                    $scope.prc.cycles = [];
                    $scope.prc.cycleId = '';
                    $scope.prc.cycles = result[i].cycles;
                    if (redirected) {
                        $scope.prc.cycleId = robj.testSuiteDetails[0].cycleid;
                        $scope.prc.selCyclesFilter();
                    }
                    break;
                }
            }
        } catch (exception) {
            unblockUI();
            console.log("Error in service populateReleases while fetching projects -" + error);
        }
    };

    //Bind cycles on releases Filter Change
    $scope.prc.selCyclesFilter = function() {
        var cycleId = this.cycleId;
        if (cycleId == null) return;
        var reportsInputData = {};
        reportsInputData.projectId = this.projectId;
        reportsInputData.releaseName = this.releaseId;
        reportsInputData.cycleId = cycleId;
        reportsInputData.type = 'allmodules';
        blockUI("Loading modules.. please wait..");
        $("#accordion").hide();
        $('#nodeBox').empty();
        $('#searchModule').val('');
        //$("#expAssign").attr('src', 'imgs/ic-collapse.png');
        //Fetching Modules under cycle
        if (!access_only) {
            reportService.getReportsData_ICE(reportsInputData).then(function(result_res_reportData) {
                unblockUI();
                if (result_res_reportData == "Fail") {
                    openModalPopup("Reports", "Failed to load Reports");
                } else {
                    $(".mid-report-section").hide();
                    if (result_res_reportData.rows.length == 0) {
                        //No Modules Found
                        openModalPopup("Modules", "No Modules Found");
                        $(".mid-report-section").hide();
                        $('#searchModule').attr('disabled', 'disabled');
                        if($('.slideOpen').is(":visible") == true) {
                            $('div.moduleBox').removeClass('slideOpen');
                            $('#expAssign').trigger('click');
                        }
                    } else {
                        //Modules Display
                        $rootScope.reportData = result_res_reportData.rows;
                        angular.forEach(result_res_reportData.rows, function(value, index) {
                            $('#nodeBox').append('<div class="nodeDiv"><div class="ct-node fl-left ng-scope" data-moduleid=' + value._id + '  title=' + value.name + ' style="width: 139px;"><img class="ct-nodeIcon" id=' + value._id + ' src="imgs/node-modules.png" alt="Module Name" aria-hidden="true"><span class="ct-nodeLabel ng-binding" style="width: 115px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;padding-left: 30px;">' + value.name + '</span></div>')
                            $('.reports-search').removeAttr('disabled', 'disabled');
                        });
                        $('#searchModule').removeAttr('disabled', 'disabled');
                        if ($('.moduleBox').is(':visible') == true) {

                        } else {
                            $('div.moduleBox').removeClass('slideOpen');
                            $('#expAssign').trigger('click');
                        }
                    }
                    $('#ctExpandAssign').css('pointer-events','auto')
                    if (redirected) {
                        $timeout(function() {
                            $("div.ct-node").each(function() {
                                if ($.trim($(this).text()) == $.trim(robj.testSuiteDetails[0].testsuitename)) {
                                    $(this).children('img').trigger('click');
                                }
                            })
                        }, 700);
                    }
                }
            }, function(error) {
                unblockUI();
                console.log("Error in service getReportsData_ICE while fetching modules-"+error);
            });
        }else{
            reportsInputData.type = 'screendata';
            reportService.getAccessibilityData_ICE(reportsInputData).then(function (accessibility_data) {
                unblockUI()
                if (accessibility_data == "Invalid Session") {
                    $rootScope.redirectPage();
                } else if (accessibility_data == "Fail") {
                    openModalPopup("Reports", "Failed to load Accessibility Reports");
                } else {
                    $(".mid-report-section").hide();
                    if (accessibility_data.length == 0) {
                        //No Modules Found
                        openModalPopup("Modules", "No Accessibility Modules Found");
                        $(".mid-report-section").hide();
                        $('#searchModule').attr('disabled', 'disabled');
                    } else {
                        angular.forEach(accessibility_data, function (value, index) {
                            $('#nodeBox').append('<div class="nodeDiv"><div class="ct-node fl-left ng-scope"  data-screenname=' + value + '  title=' + value + ' style="width: 139px;"><img id=' + value + ' class="ct-nodeIcon1" src="imgs/node-screens.png" alt="Module Name" aria-hidden="true"><span class="ct-nodeLabel ng-binding" style="width: 115px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;padding-left: 30px;">' + value + '</span></div>')
                            $('.reports-search').removeAttr('disabled', 'disabled');
                        });
                        $('#searchModule').removeAttr('disabled', 'disabled');
                        if ($('.moduleBox').is(':visible') != true) {
                            $('div.moduleBox').removeClass('slideOpen');
                            $('#expAssign').trigger('click');
                        }
                    }
                    $('#ctExpandAssign').css('pointer-events', 'auto')
                }
            }, function (error) {
                unblockUI();
                console.log("Error in service getAccessibilityData_ICE while fetching modules-" + error);
            });
        }
    };


    //Responsive Header Menu
    $scope.responsiveMenu = function() {
        var x = document.getElementById("myTopnav");
        if ($.trim(x.className) === "topnav") {
            x.className += " responsive";
            $("#notifyBox").hide();
        } else {
            x.className = "topnav";
        }
    };

    //Toggle(Show/Hide) Module Div
    $('#expAssign').on('click', function(e) {
        if($(".ct-nodeIcon").length == 0 && $(".ct-nodeIcon1").length == 0)
        {
            if($('#expAssign').attr('src') == "imgs/ic-collapseup.png")
            {
                $(".moduleBox").slideToggle('slow', function() {
                    $('#expAssign').css('pointer-events','none');
                });
            }
        }
        else{
            $(".moduleBox").slideToggle('slow', function() {
                if($('div.moduleBox').hasClass('slideOpen') == true)
               {
                   slideOpen = true;
                   $(this).next().children().children().attr('src', 'imgs/ic-collapse.png');
               }
               else
               {
                   slideOpen = false;
                   $(this).next().children().children().attr('src', 'imgs/ic-collapseup.png');
               }  
               $(this).toggleClass('slideOpen');
               $('#expAssign').css('pointer-events','');
           });
        }
    });

    //Search Modules
    $(document).on('keyup', '.reports-search', function(e) {
        input = document.getElementById("searchModule");
        filter = input.value.toUpperCase();
        elems = $('.nodeDiv');
        for (i = 0; i < elems.length; i++) {
            if (elems[i].textContent.toUpperCase().indexOf(filter) > -1) {
                elems[i].style.display = "";
            } else {
                elems[i].style.display = "none";
            }
        }
        e.stopImmediatePropagation();
    });
    //Search Scenarios
    $(".reportSearchBox").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#reportsTable tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    //Global modal popup
    function openModalPopup(title, body) {
        var mainModal = $("#reportsModal");
        mainModal.find('.modal-title').text(title);
        mainModal.find('.modal-body p').text(body);
        mainModal.modal("show");
        setTimeout(function() {
            $("#reportsModal").find('.btn-default').focus();
        }, 300);
    }

    //Module node click to fetch module start/end date & time execution entries
    $(document).on('click', '.ct-nodeIcon', function(e) {
        blockUI('Loading.. Please wait..')
        $("#accessibilityTblExecution").hide();
        $("#report-canvas").empty();
        $("#report-canvas").hide();
        $("#report-header").empty();
        $("#report-header").hide();
        $('.mid-report-section').removeClass('hide');
        $('img.highlight-module').removeClass('highlight-module');
        $('span.highlight-moduleName').removeClass('highlight-moduleName');
        $(this).addClass('highlight-module').next('span').addClass('highlight-moduleName');
        $('#reportsModuleTable tbody').empty();
        testsuiteId = e.target.id;
        reportService.getSuiteDetailsInExecution_ICE(testsuiteId)
            .then(function(data) {
                    $(".mid-report-section").show();
                    $('#overallStatus,#accordion,.scenarioStatus').hide();
                    if (data == "Invalid Session") {
                        $rootScope.redirectPage();
                    } else if (data != "fail") {
                        var tableContainer = $('#reportsModuleTable tbody');
                        tableContainer.empty();
                        if (data.length > 0) {
                            var startDat, startTym, endDat, endTym, sD, sT, eD, eT;
                            for (i = 0; i < data.length; i++) {
                                startDat = (data[i].start_time.split(' ')[0]).split("-")
                                startTym = (data[i].start_time.split(' ')[1]).split(":")
                                sD = ("0" + startDat[0]).slice(-2) + "-" + ("0" + startDat[1]).slice(-2) + "-" + startDat[2];
                                sT = ("0" + startTym[0]).slice(-2) + ":" + ("0" + startTym[1]).slice(-2);
                                if (data[i].end_time == '-') {
                                    eD = '-';
                                    eT = '';
                                } else {
                                    endDat = (data[i].end_time.split(' ')[0]).split("-")
                                    endTym = (data[i].end_time.split(' ')[1]).split(":")
                                    eD = ("0" + endDat[0]).slice(-2) + "-" + ("0" + endDat[1]).slice(-2) + "-" + endDat[2];
                                    eT = ("0" + endTym[0]).slice(-2) + ":" + ("0" + endTym[1]).slice(-2);
                                }
                                tableContainer.append("<tr class='scenariostatusreport' data-executionid='" + data[i].execution_id + "'><td class='executionNo'>" + (i + 1) + "</td><td>" + sD + " " + sT + "</td><td>" + eD + " " + eT + "</td></tr>");
                            }
                            $('.modTbl,#accordionTblExecutions').show();
                            var executionsNameHeader = $('.highlight-module').next('span.ct-nodeLabel').text() + " - Executions";
                            $("#executionNameHeader").html(executionsNameHeader);
                            if ($('.scenariostatusreport').length > 0) {
                                $("tr.scenariostatusreport:even").removeClass('even').addClass('even');
                                $("tr.scenariostatusreport:odd").removeClass('odd').addClass('odd');
                                //Initialse Module DataTable
                                $timeout(function() {
                                    var oTable1 = $('#reportsModuleTable').DataTable({
                                        "bDestroy": true,
                                        "responsive": true,
                                        "bRetrieve": true,
                                        "bPaginate": false,
                                        "bSort": false,
                                        "bFilter": false,
                                        "bLengthChange": false,
                                        "bInfo": false,
                                        "scrollY": "200px",
                                        "scrollCollapse": true,
                                        "scrollX": true,
                                        "paging": false,
                                        "oLanguage": {
                                            "sSearch": ""
                                        },
                                        "deferRender": true,
                                        "fnInitComplete": function(oSettings, json) {
                                            $('#reportsModuleTable').show();
                                            unblockUI()
                                        }
                                    });
                                    unblockUI()
                                }, 1000);
                            }
                            if (data.length > 1) {
                                $("#dateDESC, #dateASC1").show();
                                $("#dateDESC1, #dateASC").hide();
                            } else {
                                $("#dateDESC, #dateASC, #dateDESC1, #dateASC1").hide();  
                            }
                            var dateArray = tableContainer.children('.scenariostatusreport');
                            dateASC(dateArray);
                            sortExecutions('#dateDESC',dateArray);
                        } else {
                            var executionsNameHeader = $('.highlight-module').next('span.ct-nodeLabel').text() + " - Executions";
                            $("#executionNameHeader").text(executionsNameHeader);
                            $('.modTbl,#accordionTblExecutions').show();
                            $("#reportsModuleTable th").addClass('no-data');
                            tableContainer.append("<tr><td class='align-center emptyRecords' colspan=3>No record(s) found</td></tr>");
                            $("#dateDESC, #dateASC").hide();
                            $("#dateDESC1, #dateASC1").hide();      
                            unblockUI();
                        }
                    } else if (data == "Fail") {
                        unblockUI();
                        openModalPopup("Reports", "Failed to load Reports");
                    }
                    redirected = false;
                    localStorage.removeItem('fromExecution');
                },
                function(error) {
                    unblockUI();
                    console.log("Error in service getSuiteDetailsInExecution_ICE" + error);
                })
    });

    $(document).on('click', '.ct-nodeIcon1', function (e) {
        blockUI("Loading Reports");
        $("#accordion").hide();
        $("#report-canvas").empty();
        $("#report-canvas").hide();
        $("#report-header").empty();
        $("#report-header").hide();
        $('.mid-report-section').removeClass('hide');
        $('img.highlight-module').removeClass('highlight-module');
        $('span.highlight-moduleName').removeClass('highlight-moduleName');
        $(this).addClass('highlight-module').next('span').addClass('highlight-moduleName');
        $('#reportsAccTable tbody').empty();
        $('#accordionTblExecutions').hide()
        $scope.reportGenerated = true;
        var inputdata = {};
        inputdata['type'] = "reportdata";
        inputdata['screendata'] = e.target.id;
        reportService.getAccessibilityData_ICE(inputdata)
            .then(function (accessibility_data) {
                unblockUI();
                if (accessibility_data == "Invalid Session") {
                    $rootScope.redirectPage();
                } else if (accessibility_data == "Fail") {
                    openModalPopup("Reports", "Failed to load Accessibility Reports");
                } if (accessibility_data != "fail") {
                    $(".mid-report-section").show();
                    $('#overallStatus,#accordion,.scenarioStatus').hide();
                    var tableContainer = $('#reportsAccTable tbody');
                    if (accessibility_data.length > 0) {
                        tableContainer.empty();
                        var screen_acc_reportdata = {}
                        var time = "new time"
                        for (i = 0; i < accessibility_data.length; i++) {
                            let time = accessibility_data[i]["executedtime"]
                            tableContainer.append("<tr class='screen_report'   data-executionid='" + accessibility_data[i]["_id"] + "'><td class='executionNo'>" + (i + 1) + "</td><td>" + accessibility_data[i]["title"] + "</td><td>" + time + "</td>");
                            screen_acc_reportdata[accessibility_data[i]["_id"]] = accessibility_data[i]
                        }
                        $scope['acc_report_data'] = screen_acc_reportdata;
                        $('.modTbl,#accessibilityTblExecution').show();

                    }
                }
            }, function (error) {
                unblockUI();
                console.log("Error in service getAccessibilityData_ICE while fetching modules-" + error);
            });

    });

    $(document).on('click', '.screen_report', function (e) {
        const id = $(this).attr('data-executionid');
        const report = $scope['acc_report_data'][id]
        $("#report-canvas").show();
        $("#report-header").show();
        $("#report-header").empty();
        $("#accordion").hide();
        $(".mid-report-section").hide();

        $('#middle-content-section').attr('class', "webCrawler-report");
        var proxy = "Disabled";
        $("#report-header").append('<div width="100%" height="100%" class="webCrawler-header"><label style="position: relative;bottom: 1px;">Accessibility Report</label></div><div style="display: flex;"><div style="width:50%;"><div><label class="webCrawler-report-label">Crawl Name</label><span class="webCrawler-report-span">'+ report.screenname + '</span></div><div><label class="webCrawler-report-label">' + "Agent" + '</label><span class="webCrawler-report-span" style="text-transform: capitalize;">'+ report.agent+'</span></div><div><label class="webCrawler-report-label">Level</label><span class="webCrawler-report-span">0</span></div></div><div style="width:50%;"></div></div>')
        var body = document.getElementById('report-canvas');
        var reportDiv = document.createElement('div');
        //reportDiv.setAttribute('class', 'scrollbar-inner');

        var tbl = document.createElement('table');
        tbl.setAttribute('width', '100%');
        tbl.setAttribute('height', '100%');
        tbl.setAttribute('class', 'webCrawler-report-table');
        // $('.scrollbar-inner').scrollbar();
        var tbdy = document.createElement('tbody');
        var headrow = document.createElement('tr');
        var headData = { 0: 'S.No.', 1: 'Level', 2: 'URL', 3: 'A', 4: 'AA', 5: 'Section508', 6: 'Best-Practice' };
        jsonStruct = { 0: 'level', 1: 'url'};
        for (var i = 0; i < 7; i++) {
            var th = document.createElement('th');
            th.appendChild(document.createTextNode(headData[i]));
            headrow.appendChild(th);
        }

        tbdy.appendChild(headrow);
        headrow.childNodes[0].setAttribute('style', 'width : 55px');
        headrow.childNodes[1].setAttribute('style', 'width : 55px');
        headrow.childNodes[3].setAttribute('style', 'width : 55px');
        headrow.childNodes[4].setAttribute('style', 'width : 85px');
        headrow.childNodes[5].setAttribute('style', 'width : 85px');
        headrow.childNodes[6].setAttribute('style', 'width : 85px');

        // Iterating through links for Body Element
    
        var newRow = document.createElement('tr');
        var sNo = document.createElement('td');
        sNo.setAttribute('style', 'width: 55px');
        sNo.appendChild(document.createTextNode(1));
        newRow.appendChild(sNo);
        for (j = 0; j < 2; j++) {
            var data = document.createElement('td');
            text = report[jsonStruct[j]];
            if (text == undefined)
                text = "-";
            data.appendChild(document.createTextNode(text));
            newRow.appendChild(data);
        }

        // Adding if the Accessibly test passed or failed.
        for (k = 0; k < 4; k++) {
            var node = document.createElement('td');
            if (report.data["access-rules"][k]["selected"]) {
                if (report.data["access-rules"][k]["pass"]) {
                    node.innerHTML = '<div class="foo green"></div>';
                } else {
                    node.innerHTML = '<div class="foo red"></div>';
                }
            } else {
                node.innerHTML = 'NA';
            }
            newRow.appendChild(node);
        }
        tbdy.appendChild(newRow);
            
        
        tbl.appendChild(tbdy);
        reportDiv.appendChild(tbl);
        body.appendChild(reportDiv);
        var accessDiv = document.createElement('table');
        accessDiv.setAttribute('width', '100%');
        accessDiv.setAttribute('class', 'webCrawler-report-table');

        var tr1 = document.createElement('tr');
        headers = ["SNo", "Description", "Help", "Impact"];
        datas = ["description", "help", "impact"];
        for (i = 0; i < headers.length; i++) {
            var th1 = document.createElement('th');
            th1.appendChild(document.createTextNode(headers[i]));
            tr1.appendChild(th1);
        }

        accessDiv.appendChild(tr1);

        for (i = 0; i < report.data["accessibility"]["violations"].length; i++) {
            var tr1 = document.createElement('tr');
            var td1 = document.createElement('td');
            td1.appendChild(document.createTextNode(i + 1));
            tr1.append(td1);
            for (j = 0; j < datas.length; j++) {
                var td1 = document.createElement('td');
                td1.appendChild(document.createTextNode(report.data["accessibility"]["violations"][i][datas[j]]));
                tr1.appendChild(td1);
            }
            accessDiv.appendChild(tr1);
        }
        body.appendChild(accessDiv);

    });


    $scope.toggle_accessibility = function ($event) {
        if ($('.ct-nodeIcon1').parent().is(':hidden')) { $('.ct-nodeIcon1').parent().show() }
        else { $('.ct-nodeIcon1').parent().hide() }
        if (access_only){
            access_only = false;
            $("#accessibility_toggle")[0].style.background = "blueviolet";
            $("#accessibility_toggle")[0].title = "Enable Accessibility Testing Reports";
            $("#searchModule")[0].placeholder = "Search Module";
        }else{
            access_only = true;
            $("#accessibility_toggle")[0].style.background = "purple";
            $("#accessibility_toggle")[0].title = "Disable Accessibility Testing Reports";
            $("#searchModule")[0].placeholder = "Search Screen";
        }
    }


    //Set status color for report status
    function setStatusColor() {
        $(".status").each(function() {
            if ($.trim($(this).text()) == 'Pass') {
                $(this).css('color', '#009900');
            } else if ($.trim($(this).text()) == 'Fail') {
                $(this).css('color', '#ff0000');
            } else if ($.trim($(this).text()) == 'Terminate') {
                $(this).css('color', "#ff8c00");
            } else {
                $(this).css('color', '#000');
            }
        });
    }

    //sort start date & time executions
    function sortExecutions(ele, dateArray) {
        var tblBody = $(".mid-report-section tbody").filter((i,e)=> e.children && e.children.length>0);
        tblBody.empty();
        if($(ele).is(":visible") == true) {
            var j=dateArray.length;
            for (var i =0; i < dateArray.length; i++) {
                dateArray[i].firstChild.innerHTML = "E<sub>" + parseInt(j) + "</sub>";
                tblBody.append(dateArray[i]);
                j--;
            }
        } else {
            for (var k =0; k < dateArray.length; k++) {
                dateArray[k].firstChild.innerHTML = "E<sub>" + parseInt(k + 1) + "</sub>";
                tblBody.append(dateArray[k]);
            }
        }
       
    }

    //Load scenarios table on click of Module start & end time 
    $(document).on('click', '.scenariostatusreport', function(e) {
        blockUI('Loading scenarios.. please wait..');
        executionId = $(this).attr('data-executionid');
        var testsuiteid = $(".highlight-module").attr('id');
        $(this).addClass('tblRowHighlight').siblings('tr').removeClass('tblRowHighlight');
        reportService.reportStatusScenarios_ICE(executionId, testsuiteid)
            .then(function(data) {
                    if (data == "Invalid Session") {
                        $rootScope.redirectPage();
                    }
                    if (data != "fail" && data.length > 0) {
                        var scenarioContainer = $('#reportsTable tbody');
                        var pass = fail = terminated = incomplete = skipped = P = F = T = I = 0;
                        var total = data.length;
                        scenarioContainer.empty();
                        var browserIcon, brow = "";
                        var styleColor, exeDate, exeDat, exeTime;
                        $("#accordion").show();
                        var moduleName = $('.highlight-module').next('span.ct-nodeLabel').text();
                        var scenarioDetails = $('.tblRowHighlight').children('td.executionNo').html() + "   Scenario Details";
                        $('#moduleNameHeader').html('<span id="moduleTxt" title=' + moduleName + '>' + scenarioDetails + '</span>');
                        for (i = 0; i < data.length; i++) {
                            browserIcon = "";
                            brow = "";
                            if (data[i].browser.toLowerCase() == "chrome") browserIcon = "ic-reports-chrome.png";
                            else if (data[i].browser.toLowerCase() == "firefox") browserIcon = "ic-reports-firefox.png";
                            else if (data[i].browser.toLowerCase() == "internet explorer") browserIcon = "ic-reports-ie.png";
                            else if (data[i].browser.toLowerCase() == "safari") browserIcon = "ic-reports-safari.png";
                            else if (data[i].browser.toLowerCase() == "edge legacy") browserIcon = "ic-legacy-schedule.png";
                            else if (data[i].browser.toLowerCase() == "edge chromium") browserIcon = "ic-chromium-schedule.png";
                            if (browserIcon) {
                                brow = "imgs/" + browserIcon;
                                alt = data[i].browser.toLowerCase();
                            }
                            else {
                                brow = "imgs/no_img1.png"
                                alt = "-";
                            }
                            if (data[i].status.toLowerCase() == "pass") {
                                pass++;
                                status="Pass"
                                styleColor = "style='color: #28a745 !important; text-decoration-line: none;'";
                            } else if (data[i].status.toLowerCase() == "fail") {
                                fail++;
                                status="Fail"
                                styleColor = "style='color: #dc3545 !important; text-decoration-line: none;'";
                            } else if (data[i].status.toLowerCase() == "terminate") {
                                terminated++;
                                status="Terminate"
                                styleColor = "style='color: #ffc107 !important; text-decoration-line: none;'";
                            } else if (data[i].status.toLowerCase() == "incomplete") {
                                incomplete++;
                                status="Incomplete"
                                styleColor = "style='color: #343a40 !important; text-decoration-line: none;'";
                            }
                            else if (data[i].status.toLowerCase() == "skipped") {
                                skipped++;
                                status="Skipped"
                                styleColor = "style='color: #343a40 !important; text-decoration-line: none;'";
                            }
                            scenarioContainer.append("<tr class='scenarioTblReport'><td title='" + data[i].testscenarioname + "'>" + data[i].testscenarioname + "</td><td><img  alt='"+alt+"' style='width: 21px;height: 22px;' src='"+brow+"' title='"+alt+"'></td><td><span>" + data[i].executedtime.trim() + "</span></td><td class='openReports' data-reportid='" + data[i].reportid + "'><a class='openreportstatus' " + styleColor + ">" + status + "</a></td><td class='viewReports'><img alt='Pdf Icon' class='getSpecificReportBrowser openreportstatus reportFormat' data-getrep='wkhtmltopdf' data-reportid=" + data[i].reportid + " data-reportidx='' style='cursor: pointer; width: 21px;height: 22px;' src='imgs/ic-pdf.png' title='PDF Report'><img alt='-' class='getSpecificReportBrowser openreportstatus reportFormat' data-getrep='html' data-reportid=" + data[i].reportid + " data-reportidx='' style='cursor: pointer; width: 21px;height: 22px;' src='imgs/ic-web.png' title='Browser Report'><img alt='Export JSON' class='exportToJSON openreportstatus reportFormat' data-getrep='json' data-reportid=" + data[i].reportid + " data-reportidx='' style='cursor: pointer; width: 21px;height: 22px;' src='imgs/ic-export-to-json.png' title='Export to Json'></td></tr>");
                        }
                        if ($('.scenarioTblReport').length > 0) {
                            $("tr.scenarioTblReport:even").removeClass('even').addClass('even');
                            $("tr.scenarioTblReport:odd").removeClass('odd').addClass('odd');
                          
                            $timeout(function() {
                                var oTable2 = $('#reportsTable').DataTable({
                                    "bDestroy": true,
                                    "responsive": true,
                                    "bRetrieve": true,
                                    "bPaginate": false,
                                    "bSort": false,
                                    "bFilter": false,
                                    "bLengthChange": false,
                                    "bInfo": false,
                                    "scrollY": "200px",
                                    "autoWidth": "false",
                                    "scrollCollapse": true,
                                    "scrollX": true,
                                    "paging": false,
                                    "oLanguage": {
                                        "sSearch": ""
                                    },
                                    "deferRender": true,
                                    "columns": [{
                                            "width": "20%",
                                            "targets": 0
                                        },
                                        {
                                            "width": "20%",
                                            "targets": 1
                                        },
                                        {
                                            "width": "20%",
                                            "targets": 2
                                        },
                                        {
                                            "width": "20%",
                                            "targets": 3
                                        },
                                        {
                                            "width": "20%",
                                            "targets": 4
                                        },
                                    ],
                                    "fnInitComplete": function(oSettings, json) {
                                        unblockUI();
                                    }
                                });
                              
                                unblockUI();
                            }, 1000);
                        }
                      
                        var executionDetails = $('.tblRowHighlight').children('td.executionNo').html() + " - Scenario Status";
                        $(".overallScenarioStatus").html(executionDetails);
                        //Set overall Status progress bars
                        if (data.length > 0) {
                            $('#overallStatus,.scenarioStatus').show();
                            P = parseFloat((pass / total) * 100).toFixed();
                            F = parseFloat((fail / total) * 100).toFixed();
                            T = parseFloat((terminated / total) * 100).toFixed();
                            I = parseFloat((incomplete / total) * 100).toFixed();
                            $('.bg-success').css('width', P + "%");
                            $('.passPercent').text(P + " %");
                            $('.bg-danger').css('width', F + "%");
                            $('.failPercent').text(F + " %");
                            $('.bg-warning').css('width', T + "%");
                            $('.terminatePercent').text(T + " %");
                            $('.bg-dark').css('width', I + "%");
                            $('.incompletePercent').text(I + " %");
                        } else {
                            $('#overallStatus,.scenarioStatus').show();
                            $('.progress-bar-success, .progress-bar-danger, .progress-bar-warning, .progress-bar-norun').css('width', '0%');
                            $('.passPercent, .failPercent, .terminatePercent, .incompletePercent').text('');
                        }
                        //Highlight table row on click
                        $(document).on('click', '.scenarioTblReport', function() {
                            $(this).addClass('tblRowHighlight').siblings('tr').removeClass('tblRowHighlight');
                        });
                    } else if (data == "Fail") {
                        unblockUI();
                        openModalPopup("Reports", "Failed to load Reports");
                    } else {
                        $('#reportsTable tbody').empty();
                        var moduleName = $('.highlight-module').next('span.ct-nodeLabel').text();
                        var scenarioDetails = $('.tblRowHighlight').children('td.executionNo').html() + "  Scenario Details";
                        $('#moduleNameHeader').html('<span id="moduleTxt" title=' + moduleName + '>' + moduleName + "  " + scenarioDetails + '</span>');
                        $("#accordion").show();
                        $("#reportsTable th").addClass('no-data');
                        $("#reportsTable tbody").append("<tr><td class='align-center emptyRecords' colspan=5>No record(s) found</td></tr>");
                        unblockUI();
                    }
                },
                function(error) {
                    unblockUI();
                    console.log("Error in reportStatusScenarios_ICE-" + error);
                })
    });

    //collapsible Module accordion Header Click
    $('.moduleHeader').on('click', function() {
        $('.panel-body,.datatable').toggle();
        if ($('.panel-body').is(':visible') == true) {
            $('span.collapseDown').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
        } else {
            $('span.collapseDown').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
        }
    });

    //Redirect to specific module in Reports Page after execution
    if (window.localStorage['redirectedReportObj'] && window.localStorage['redirectedReportObj'] != '') {

        var redirection = window.localStorage['fromExecution'];
        if (redirection == "true") {
            blockUI("loading reports.. please wait..");
            redirected = true;
            robj = JSON.parse(window.localStorage['redirectedReportObj']);
        } else {
            redirected = false;
        }
    }

    //Sort Date and time to ascending order on click
    $(document).on('click', '#dateDESC', function(e) {
        $(this).hide();
        var dateArray;
        $('#dateASC, #dateDESC1').show();
        $('#dateASC1').hide();
        var dateArray = $('.mid-report-section tbody').children('.scenariostatusreport');
        dateDESC(dateArray);
        sortExecutions('#dateDESC',dateArray);
        e.stopImmediatePropagation();
    });
    //Sort Date and time to descending order on click
    $(document).on('click', '#dateASC', function(e) {
        $(this).hide();
        $('#dateDESC, #dateASC1').show();
        $('#dateDESC1').hide();
        var dateArray = $('.mid-report-section tbody').children('.scenariostatusreport');
        dateASC(dateArray);
        sortExecutions('#dateDESC',dateArray);
        e.stopImmediatePropagation();
    });

    //Sort Date and time to ascending order on click
    $(document).on('click', '#dateDESC1', function(e) {
        $(this).hide();
        var dateArray;
        $('#dateASC1, #dateDESC').show();
        $('#dateASC').hide();
        var dateArray = $('.mid-report-section tbody').children('.scenariostatusreport');
        dateDESC(dateArray);
        sortExecutions('#dateDESC1',dateArray);
        e.stopImmediatePropagation();
    });
    //Sort Date and time to descending order on click
    $(document).on('click', '#dateASC1', function(e) {
        $(this).hide();
        $('#dateDESC1, #dateASC').show();
        $('#dateDESC').hide();
        var dateArray = $('.mid-report-section tbody').children('.scenariostatusreport');
        dateASC(dateArray);
        sortExecutions('#dateDESC1',dateArray);
        e.stopImmediatePropagation();
    });
    

    //Sort Date and time to descending order
    function dateDESC(dateArray) {
        dateArray.sort(function(a, b) {
            var dateA, timeA, dateB, timeB;
            if (a.children.item(1).children.length == 0) {
                var dateTimeA = a.children.item(1).innerText.split(" ");
                dateA = dateTimeA[0];
                timeA = dateTimeA[1];
                var dateTimeB = b.children.item(1).innerText.split(" ");
                dateB = dateTimeB[0];
                timeB = dateTimeB[1];
            }
            var fDate = dateA.split("-");
            var lDate = dateB.split("-");
            var gDate = fDate[2] + "-" + fDate[1] + "-" + fDate[0];
            var mDate = lDate[2] + "-" + lDate[1] + "-" + lDate[0];
            if (new Date(gDate + " " + timeA) <= new Date(mDate + " " + timeB)) return -1;
            if (new Date(gDate + " " + timeA) >= new Date(mDate + " " + timeB)) return 1;
            return dateArray;
        })
    }
    //Sort Date and time to ascending order
    function dateASC(dateArray) {
        dateArray.sort(function(a, b) {
            var aA, timeA, bB, timeB;
            if (a.children.item(1).children.length == 0) {
                var dateTimeA = a.children.item(1).innerText.split(" ");
                aA = dateTimeA[0];
                timeA = dateTimeA[1];
                var dateTimeB = b.children.item(1).innerText.split(" ");
                bB = dateTimeB[0];
                timeB = dateTimeB[1];
            }
            var fDate = aA.split("-");
            var lDate = bB.split("-");
            var gDate = fDate[2] + "-" + fDate[1] + "-" + fDate[0];
            var mDate = lDate[2] + "-" + lDate[1] + "-" + lDate[0];
            if (new Date(gDate + " " + timeA) >= new Date(mDate + " " + timeB)) return -1;
            if (new Date(gDate + " " + timeA) <= new Date(mDate + " " + timeB)) return 1;
            return dateArray;
        })
    }
    //Left Navigation Bar Expand/Collapse
    $("#ct-expand-left").click(function(e) {
        $('.leftBar').toggleClass('active');
        $("#ct-expand-left").toggleClass("ct-rev");
    });

    //Right Navigation Bar Expand/Collapse
    $(".ct-expand-right").click(function(e) {
        $('.rightBar').toggleClass('active');
        $(".ct-expand-right").toggleClass("ct-rev");
        if (!$('.rightBar').hasClass('active')) {
            $('.ct-expand-right').addClass('toggleRightBarArrow')
        } else {
            $('.ct-expand-right').removeClass('toggleRightBarArrow')
        }
    });

    function adjustMidPanel() {
        if ($('.leftBarOpen.rightBarOpen').length > 0) {
            $("#middle-content-section").removeClass('leftBar-collapsed rightBar-collapsed');
            $("#reportScenarioDataTable").removeClass('reportScenarioTableLeftExpand reportScenarioTableRightExpand');
            $("#middle-content-section").addClass('bothBar-collapsed');
            $("#reportScenarioDataTable").addClass('reportScenarioTableBothExpand');
            $('.reportBody.scroll-wrapper').addClass('reportTblWidth');
        } else if ($('.leftBarOpen').length > 0) {
            $("#middle-content-section").removeClass('rightBar-collapsed leftRightBar-collapsed bothBar-collapsed').addClass('leftBar-collapsed');
            $('#reportScenarioDataTable').removeClass('reportScenarioTableRightExpand reportScenarioTableBothExpand').addClass('reportScenarioTableLeftExpand');
            $('.reportBody.scroll-wrapper').addClass('reportTblWidth');
        } else if ($('.rightBarOpen').length > 0) {
            $("#middle-content-section").removeClass('leftBar-collapsed leftRightBar-collapsed bothBar-collapsed').addClass('rightBar-collapsed');
            $('#reportScenarioDataTable').removeClass('reportScenarioTableLeftExpand reportScenarioTableBothExpand').addClass('reportScenarioTableRightExpand');
            $('.reportBody.scroll-wrapper').addClass('reportTblWidth');
        } else {
            $("#middle-content-section").removeClass('leftBar-collapsed rightBar-collapsed bothBar-collapsed');
            $("#reportScenarioDataTable").removeClass('reportScenarioTableLeftExpand reportScenarioTableRightExpand reportScenarioTableBothExpand');
            $('.reportBody.scroll-wrapper').removeClass('reportTblWidth');
        }
    }

    /********** HTML REPORT CLICK ****************/
    $(document).off('click.htmlRepClick', '.openreportstatus');
    $(document).on({
        'click.htmlRepClick': htmlReportClick
    }, '.openreportstatus');

    function htmlReportClick(e) {
        var reportType = $(this).attr('data-getrep');
        var reportID = $(this).attr('data-reportid');
        var scenarioName = $(this).parent().parent().children()[0].textContent;

        if (reportType == "html") {
            const reportURL = window.location.origin + "/viewReport/" + reportID;
            return window.open(reportURL, '_blank');
        } else {
            if (reportType == "wkhtmltopdf") reportType = "pdf";
            reportService.viewReport(reportID, reportType).then(function(data1) {
                unblockUI();
                if (reportType == "json") data1 = JSON.stringify(data1, undefined, 2);
                var filedata = new Blob([data1], {
                    type: "application/"+reportType+";charset=utf-8"
                });
                if (window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(filedata, scenarioName);
                } else {
                    var a = document.createElement('a');
                    a.href = URL.createObjectURL(filedata);
                    a.download = scenarioName;
                    document.body.appendChild(a);
                    a.click();
                    URL.revokeObjectURL(a.href);
                    document.body.removeChild(a);
                }
                e.stopImmediatePropagation();
            },
            function(error) {
                unblockUI();
                if (reportType == 'pdf') error = {error: JSON.parse(String.fromCharCode.apply(null, new Uint8Array(error))|| '')};
                var errRes = error.error || {};
                var defErr = (reportType == "json")? "Fail to export report JSON": "Fail to save PDF Report";
                var err = errRes.emsg || defErr;
                if (errRes.ecode == "INVALID_SESSION") return $rootScope.redirectPage();
                else if (errRes.ecode == "LIMIT_EXCEEDED") openModalPopup("Fail to load PDF Report. Report Limit size exceeded. Generate PDF Report using Avo Assure PDF utility available in ICE.")
                else openModalPopup("Reports", defErr);
                console.log(defErr + ". Error: " + JSON.stringify(err));
            });
            return;
        }
    }

}]);