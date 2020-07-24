mySPA.controller('reportsController', ['$scope', '$rootScope', '$http', '$location', '$timeout', '$window', 'reportService', 'mindmapServices', 'cfpLoadingBar', '$sce', function($scope, $rootScope, $http, $location, $timeout, $window, reportService, mindmapServices, cfpLoadingBar, $sce) {
    $("head").append('<link rel="stylesheet" href="css/css_reports/bootstrap/bootstrap.min.css"> <link rel="stylesheet" type="text/css" href="css/css_reports/datatables/dataTables.css"><link rel="stylesheet" type="text/css" href="css/css_reports/header.css"><link rel="stylesheet" type="text/css" href="css/css_reports/footer.css"><link rel="stylesheet" type="text/css" href="css/css_reports/leftSideBar.css"><link rel="stylesheet" type="text/css" href="css/css_reports/rightSideBar.css"><link rel="stylesheet" type="text/css" href="css/css_reports/reports.css"><script src="js/plugins/reports/bootstrap/popper.js"></script><script src="js/plugins/reports/bootstrap/bootstrap.min.js"></script><script src="js/plugins/reports/datatables/datatables.min.js"></script>');
    var getUserInfo = JSON.parse(window.localStorage['_UI']);
    var userID = getUserInfo.user_id;
    var oTable;
    var openArrow = 0;
    var openWindow = 0;
    var executionId, testsuiteId;
    var robj, redirected = false;
    var pauseloadinginterval = false;
    var clearIntervalList = [];
    var slideOpen = false;
    $scope.reportIdx = ''; // for execution count click
    $scope.releases="";
    $rootScope.reportData = "";
    $("#reportDataTableDiv").hide();
    $('.reports-search').attr('disabled', 'disabled');
    $('#ctExpandAssign').css('pointer-events','none');

    cfpLoadingBar.start()

    $timeout(function() {
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
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
                if (type == "projects" ) {
                    if(data != "fail"){
                        $(".project-list").empty();
                        $(".project-list").append("<option selected disabled>Select Project</option>");
                        for (i = 0; i < data.length; i++) {
                            $(".project-list").append("<option value='" + data[i]._id + "'>" + data[i].name + "</option>");
                        }
                        $('.release-list').empty()
                        $('.release-list').append("<option data-id='Select' value='Select' selected>Select</option>");
                        $('.cycle-list').empty();
                        $('.cycle-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
                        if (redirected) {
                            $timeout(function() {
                                unblockUI();
                                $('#selectProjects').val(robj.testSuiteDetails[0].projectidts);
                                $('#selectProjects').trigger('change');
                              
                            }, 500);

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
    $('.project-list').change(function() {
        var projectId = $('.project-list option:selected').val();
        blockUI("Loading releases.. please wait..");
        $(".moduleBox,.mid-report-section,#accordion").hide();
        $("#report-header,#report-canvas").hide();
        $('#nodeBox').empty();
        $('#ctExpandAssign').css('pointer-events','none');
        $("#expAssign").attr('src', 'imgs/ic-collapse.png');
        $('#searchModule').val('');
        $('#searchModule').attr('disabled', 'disabled');
        data = JSON.parse(window.localStorage['project'])
        try{ 
            for (i=0; i< data.length; i++){
                if(projectId == data[i]._id){
                    unblockUI();           
                    $('.release-list').empty();
                    $('.release-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
                    $('.cycle-list').empty();
                    $('.cycle-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
                    for (j = 0; j < data[i].releases.length; j++) {
                        $('.release-list').append("<option data-id='" + data[i].releases[j].name + "' value='" + data[i].releases[j].name + "'>" + data[i].releases[j].name + "</option>");
                    }
                    $scope.releases =  data[i].releases
                    if (redirected) {
                        $timeout(function() {
                            $('#selectReleases').val(robj.testSuiteDetails[0].releaseid);
                            $('#selectReleases').trigger('change');
                        }, 500);
                    }
                }
        }
     } catch(exception){
            unblockUI();
            console.log("Error in service populateReleases while fetching projects -" + error);
        }
    });

         //Bind cycles on releases Filter Change
         $('.release-list').change(function() {
            var releaseName= $('.release-list option:selected').val();
            blockUI("Loading cycles.. please wait..");
            $(".moduleBox,.mid-report-section,#accordion").hide();
            $("#expAssign").attr('src', 'imgs/ic-collapse.png');
            $('#searchModule').val('');
            $('#searchModule').attr('disabled', 'disabled');
            result = $scope.releases;
            try{ 
                for (i=0;i< result.length;i++){
                    if(releaseName == result[i].name){
                        unblockUI();
                        $('.cycle-list').empty();
                        $('.cycle-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
                        for (j = 0; j < result[i].cycles.length; j++) {
                            $('.cycle-list').append("<option data-id='" +result[i].cycles[j]._id+ "' value='" + result[i].cycles[j]._id + "'>" + result[i].cycles[j].name + "</option>");
                        }
                        if (redirected) {
                            $timeout(function() {
                                $('#selectCycles').val(robj.testSuiteDetails[0].cycleid);
                                unblockUI();
                                $('#selectCycles').trigger('change');
                            }, 500);
                        }
                    }
                }
            } catch(exception){
                unblockUI();
                console.log("Error in service populateReleases while fetching projects -" + error);
            }
        });

        //Load modules on cycles filter change
        $('.cycle-list').change(function() {
            var cycleId = $('.cycle-list option:selected').val();
            var reportsInputData = {};
            reportsInputData.projectId = $.trim($('.project-list option:selected').val());
            reportsInputData.releaseName = $.trim($('.release-list option:selected').val());
            reportsInputData.cycleId = $.trim(cycleId);
            reportsInputData.type = 'allmodules';
            blockUI("Loading modules.. please wait..");
            $("#accordion").hide();
            $('#nodeBox').empty();
            $('#searchModule').val('');
            //$("#expAssign").attr('src', 'imgs/ic-collapse.png');
            //Fetching Modules under cycle
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
                        if($('.slideOpen').is(":visible") == true)
                        {
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
        });


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
                    }
                    if (data != "fail") {
                        var tableContainer = $('.mid-report-section tbody');
                        if (data.length > 0) {
                            tableContainer.empty();
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
                            var dateArray = $('.mid-report-section tbody').children('.scenariostatusreport');
                            dateASC(dateArray);
                            sortExecutions('#dateDESC',dateArray);
                        } else if (data == "Fail") {
                            unblockUI();
                            openModalPopup("Reports", "Failed to load Reports");
                        } else {
                            tableContainer.empty();
                            var executionsNameHeader = $('.highlight-module').next('span.ct-nodeLabel').text() + " - Executions";
                            $("#executionNameHeader").text(executionsNameHeader);
                            $('.modTbl,#accordionTblExecutions').show();
                            $(".mid-report-section tbody").empty();
                            $("#reportsModuleTable th").addClass('no-data');
                            $(".mid-report-section tbody").append("<tr><td class='align-center emptyRecords' colspan=3>No record(s) found</td></tr>");
                            $("#dateDESC, #dateASC").hide();
                            $("#dateDESC1, #dateASC1").hide();      
                            unblockUI();
                        }
                    }
                    redirected = false;
                    localStorage.removeItem('fromExecution');
                },
                function(error) {
                    unblockUI();
                    console.log("Error in service getSuiteDetailsInExecution_ICE" + error);
                })
    });
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
        $(".mid-report-section tbody").empty();
        if($(ele).is(":visible") == true)
        {
            var j=dateArray.length;
            for (var i =0; i < dateArray.length; i++) {
                dateArray[i].firstChild.innerHTML = "E<sub>" + parseInt(j) + "</sub>";
                $(".mid-report-section tbody").append(dateArray[i]);
                j--;
            }
        }
        else{
            for (var k =0; k < dateArray.length; k++) {
                dateArray[k].firstChild.innerHTML = "E<sub>" + parseInt(k + 1) + "</sub>";
                $(".mid-report-section tbody").append(dateArray[k]);
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
                        var scenarioDetails = $('.tblRowHighlight').children('td.executionNo').html() + "   Scenario Details";
                        $('#moduleNameHeader').html('<span id="moduleTxt" title=' + moduleName + '>' + scenarioDetails + '</span>');
                        for (i = 0; i < data.length; i++) {
                            browserIcon = "";
                            brow = "";
                            if (data[i].browser.toLowerCase() == "chrome") browserIcon = "ic-reports-chrome.png";
                            else if (data[i].browser.toLowerCase() == "firefox") browserIcon = "ic-reports-firefox.png";
                            else if (data[i].browser.toLowerCase() == "internet explorer") browserIcon = "ic-reports-ie.png";
                            else if (data[i].browser.toLowerCase() == "safari") browserIcon = "ic-reports-safari.png";
                            if (browserIcon) brow = "imgs/" + browserIcon;
                            else brow = "imgs/no_img1.png"
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
                            scenarioContainer.append("<tr class='scenarioTblReport'><td title='" + data[i].testscenarioname + "'>" + data[i].testscenarioname + "</td><td><span>" + data[i].executedtime.trim() + "</span></td></td><td class='openReports' data-reportid='" + data[i].reportid + "'><a class='openreportstatus' " + styleColor + ">" + status + "</a></td><td class='viewReports'><img alt='Pdf Icon' class='getSpecificReportBrowser openreportstatus reportFormat' data-getrep='wkhtmltopdf' data-reportid=" + data[i].reportid + " data-reportidx='' style='cursor: pointer; width: 21px;height: 22px;' src='imgs/ic-pdf.png' title='PDF Report'><img alt='-' class='getSpecificReportBrowser openreportstatus reportFormat' data-getrep='html' data-reportid=" + data[i].reportid + " data-reportidx='' style='cursor: pointer; width: 21px;height: 22px;' src='imgs/ic-web.png' title='Browser Report'><img alt='Export JSON' class='exportToJSON openreportstatus reportFormat' data-getrep='json' data-reportid=" + data[i].reportid + " data-reportidx='' style='cursor: pointer; width: 21px;height: 22px;' src='imgs/ic-export-to-json.png' title='Export to Json'></td></tr>");
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
                                            "width": "25%",
                                            "targets": 0
                                        },
                                        {
                                            "width": "25%",
                                            "targets": 1
                                        },
                                        {
                                            "width": "25%",
                                            "targets": 2
                                        },
                                        {
                                            "width": "25%",
                                            "targets": 3
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
            if (new Date(gDate + " " + timeA) < new Date(mDate + " " + timeB)) return -1;
            if (new Date(gDate + " " + timeA) > new Date(mDate + " " + timeB)) return 1;
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
            if (new Date(gDate + " " + timeA) > new Date(mDate + " " + timeB)) return -1;
            if (new Date(gDate + " " + timeA) < new Date(mDate + " " + timeB)) return 1;
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
        var executionId = '';
        var reportID = $(this).attr('data-reportid');
        var testsuiteId = $(this).parents('tr').attr('id');
        var testsuitename = $('#moduleNameHeader').children('span').text();
        var scenarioName = $(this).parent().siblings('td.scenarioName').text();


        var pass = fail = terminated = total = 0;
        var scrShot = {
            "idx": [],
            "paths": []
        };
        var finalReports = {
            overallstatus: [{
                "domainName": "",
                "projectName": "",
                "releaseName": "",
                "cycleName": "",
                "scenarioName": "",
                "browserVersion": "",
                "browserType": "",
                "StartTime": "",
                "EndTime": "",
                "overallstatus": "",
                "EllapsedTime": "",
                "date": "",
                "time": "",
                "pass": "",
                "fail": "",
                "terminate": "",
                "reportId": "",
                "executionId": "",
                "moduleName": ""
            }],
            rows: []
        };
        reportService.getReport(reportID, testsuiteId, testsuitename)
            .then(function(data) {
                    if (data == "Invalid Session") {
                        return $rootScope.redirectPage();
                    }
                    var remarksLength = [];
                    var commentsLength = [];
                    if (data != "fail") {
                        blockUI("Generating Report.. please wait..");
                        if (data.length > 0) {
                            finalReports.overallstatus[0].domainName = data[0].domainname
                            finalReports.overallstatus[0].projectName = document.getElementById('selectProjects').selectedOptions[0].text
                            finalReports.overallstatus[0].releaseName = document.getElementById('selectReleases').selectedOptions[0].text
                            finalReports.overallstatus[0].cycleName = document.getElementById('selectCycles').selectedOptions[0].text
                            finalReports.overallstatus[0].scenarioName = data[0].testscenarioname
                            finalReports.overallstatus[0].reportId = reportID;
                            finalReports.overallstatus[0].executionId = data[0].executionId;;
                            finalReports.overallstatus[0].moduleName = $(".highlight-moduleName").text();
                            
                            var obj2 = data[1].reportdata;
                            var elapTym;
                            for (j = 0; j < obj2.overallstatus.length; j++) {
                                finalReports.overallstatus[0].browserVersion = (obj2.overallstatus[j].browserVersion) == "" ? "-" : obj2.overallstatus[j].browserVersion;
                                finalReports.overallstatus[0].browserType = (obj2.overallstatus[j].browserType) == "" ? "-" : obj2.overallstatus[j].browserType;
                                finalReports.overallstatus[0].StartTime = obj2.overallstatus[j].StartTime.split(".")[0];
                                finalReports.overallstatus[0].EndTime = obj2.overallstatus[j].EndTime.split(".")[0];
                                var getTym = obj2.overallstatus[j].EndTime.split(".")[0];
                                var getDat = getTym.split(" ")[0].split("-");
                                finalReports.overallstatus[0].date = getDat[1] + "/" + getDat[2] + "/" + getDat[0];
                                finalReports.overallstatus[0].time = getTym.split(" ")[1];
                                finalReports.overallstatus[0].overallstatus = obj2.overallstatus[j].overallstatus;
                                elapTym = (obj2.overallstatus[j].EllapsedTime.split(".")[0]).split(":");
                                finalReports.overallstatus[0].EllapsedTime = "~" + ("0" + elapTym[0]).slice(-2) + ":" + ("0" + elapTym[1]).slice(-2) + ":" + ("0" + elapTym[2]).slice(-2)
                            }
                            for (k = 0; k < obj2.rows.length; k++) {

                                finalReports.rows.push(obj2.rows[k]);
                                finalReports.rows[k].slno = k + 1;
                                if (finalReports.rows[k]["Step "] != undefined) { // && finalReports.rows[k]["Step "].indexOf("Step") !== -1){
                                    finalReports.rows[k].Step = finalReports.rows[k]["Step "];
                                }
                                if (finalReports.rows[k].hasOwnProperty("EllapsedTime") && finalReports.rows[k].EllapsedTime.trim() != "") {
                                    elapTym = (finalReports.rows[k].EllapsedTime.split(".")[0]).split(":")
                                    if (finalReports.rows[k].EllapsedTime.split(".")[1] == undefined || finalReports.rows[k].EllapsedTime.split(".")[1] == "") {
                                        finalReports.rows[k].EllapsedTime = ("0" + elapTym[0]).slice(-2) + ":" + ("0" + elapTym[1]).slice(-2) + ":" + ("0" + elapTym[2]).slice(-2);
                                    } else if (finalReports.rows[k].EllapsedTime.split(".").length < 3 && finalReports.rows[k].EllapsedTime.split(".")[0].indexOf(":") === -1) {
                                        finalReports.rows[k].EllapsedTime = ("0" + 0).slice(-2) + ":" + ("0" + 0).slice(-2) + ":" + ("0" + elapTym[0]).slice(-2) + ":" + ("0" + 0).slice(-2);
                                    } else {
                                        finalReports.rows[k].EllapsedTime = ("0" + elapTym[0]).slice(-2) + ":" + ("0" + elapTym[1]).slice(-2) + ":" + ("0" + elapTym[2]).slice(-2) + ":" + finalReports.rows[k].EllapsedTime.split(".")[1].slice(0, 3);
                                    }
                                }
                                // if (finalReports.rows[k].hasOwnProperty("status") && finalReports.rows[k].status != "") {
                                //     total++;
                                // }
                                if (finalReports.rows[k].status == "Pass") {
                                    pass++;
                                } else if (finalReports.rows[k].status == "Fail") {
                                    fail++;
                                } else if (finalReports.rows[k].hasOwnProperty("Step") && finalReports.rows[k].Step == "Terminated") {
                                    terminated++
                                }
                                if (reportType != "html" && !(finalReports.rows[k].screenshot_path == undefined)) {
                                    scrShot.idx.push(k);
                                    scrShot.paths.push(finalReports.rows[k].screenshot_path);
                                }
                                if ('testcase_details' in finalReports.rows[k]) {
                                    if (typeof(finalReports.rows[k].testcase_details) == "string" && finalReports.rows[k].testcase_details != "" && finalReports.rows[k].testcase_details != "undefined") {
                                        finalReports.rows[k].testcase_details = JSON.parse(finalReports.rows[k].testcase_details);
                                    } else if (typeof(finalReports.rows[k].testcase_details) == "object") {
                                        finalReports.rows[k].testcase_details = finalReports.rows[k].testcase_details;
                                    } else {
                                        finalReports.rows[k].testcase_details = finalReports.rows[k].testcase_details;
                                    }

                                    if (finalReports.rows[k].testcase_details == "") {
                                        finalReports.rows[k].testcase_details = {
                                            "actualResult_pass": "",
                                            "actualResult_fail": "",
                                            "testcaseDetails": ""
                                        }
                                    }
                                }

                                if ('Remark' in finalReports.rows[k]) {
                                    if (finalReports.rows[k].Remark != " " && finalReports.rows[k].Remark != null && finalReports.rows[k].Remark != "") {
                                        remarksLength.push(finalReports.rows[k].Remark)
                                    }
                                }
                                if ('Comments' in finalReports.rows[k]) {
                                    if (finalReports.rows[k].Comments != " " && finalReports.rows[k].Comments != null && finalReports.rows[k].Comments != "") {
                                        commentsLength.push(finalReports.rows[k].Comments)
                                    }
                                }
                            }
                            total = pass+fail+terminated;
                            finalReports.overallstatus[0].pass = (parseFloat((pass / total) * 100).toFixed(2)) > 0 ? parseFloat((pass / total) * 100).toFixed(2) : parseInt(0);
                            finalReports.overallstatus[0].fail = (parseFloat((fail / total) * 100).toFixed(2)) > 0 ? parseFloat((fail / total) * 100).toFixed(2) : parseInt(0);
                            finalReports.overallstatus[0].terminate = (parseFloat((terminated / total) * 100).toFixed(2)) > 0 ? parseFloat((terminated / total) * 100).toFixed(2) : parseInt(0);
                            finalReports.remarksLength = remarksLength;
                            finalReports.commentsLength = commentsLength;
                        }
                        if (reportType == "html") {
                            //Service call to get Html reports
                            reportService.renderReport_ICE(finalReports, reportType).then(
                                function(data1) {
                                    unblockUI();
                                    if (data1 == "Invalid Session") {
                                        return $rootScope.redirectPage();
                                    } else if (data1 == "fail") {
                                        console.log("Failed to render reports.");
                                    } else {
                                        var myWindow;
                                        myWindow = window.open();
                                        myWindow.document.write(data1);
                                    }
                                    e.stopImmediatePropagation();
                                },
                                function(error) {
                                    unblockUI();
                                    console.log("Error in service renderReport_ICE" + error);
                                });
                            //Transaction Activity for HTMLReportClick
                            // var labelArr = [];
                            // var infoArr = [];
                            // labelArr.push(txnHistory.codesDict['HTMLReportClick']);
                            // txnHistory.log(e.type,labelArr,infoArr,window.location.pathname); 
                        } else if (reportType == 'json') {
                            exportJSONReport(finalReports);
                        } else {
                            //Service call to download pdf reports
                            $rootScope.resetSession.start();
                            var isIE = /*@cc_on!@*/ false || !!document.documentMode;
                            reportService.renderReport_ICE(finalReports, reportType, scrShot).then(
                                function(data1) {
                                    unblockUI();
                                    $rootScope.resetSession.end();
                                    var strData = String.fromCharCode.apply(null, new Uint8Array(data1.slice(0, 20)));
                                    if (strData == "Invalid Session") return $rootScope.redirectPage();
                                    else if (strData === "fail") {
                                        var msg = "Fail to load PDF Report";
                                        openModalPopup("Reports", msg);
                                        console.error(msg);
                                    } else if (strData === "limitExceeded") {
                                        var msg = "Fail to load PDF Report. Report Limit size exceeded. Generate PDF Report using Avo Assure PDF utility available in ICE.";
                                        openModalPopup("Reports", msg);
                                        console.error(msg);
                                    } else {
                                        openWindow = 0;
                                        if (openWindow == 0) {
                                            var file = new Blob([data1], {
                                                type: 'application/pdf'
                                            });
                                            if (isIE) {
                                                navigator.msSaveOrOpenBlob(file);
                                            } else {
                                                var fileURL = URL.createObjectURL(file);
                                                var a = document.createElement('a');
                                                a.href = fileURL;
                                                a.download = finalReports.overallstatus[0].scenarioName;
                                                //a.target="_new";
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                //$window.open(fileURL, '_blank');
                                                URL.revokeObjectURL(fileURL);
                                            }
                                        }
                                        openWindow++;
                                        //Transaction Activity for PDFReportClick
                                        // var labelArr = [];
                                        // var infoArr = [];
                                        // labelArr.push(txnHistory.codesDict['PDFReportClick']);
                                        // txnHistory.log(e.type,labelArr,infoArr,window.location.pathname); 
                                        e.stopImmediatePropagation();
                                    }
                                },
                                function(error) {
                                    unblockUI();
                                    $rootScope.resetSession.end();
                                    console.log("Error in service renderReport_ICE" + error);
                                });
                        }
                        $('.formatpdfbrwsrexport').remove();
                    } else console.log("Failed to get reports details");
                },
                function(error) {
                    console.log("Error in service renderReport_ICE " + error);
                });
    }
    //Export To JSON
    //Service call to get start and end details of suites
    /************ EXPORT JSON CLICK *****************/

    function exportJSONReport(response) {
        filename = response.overallstatus[0].scenarioName + ".json";
        var responseData = JSON.stringify(response, undefined, 2);
        var objAgent = $window.navigator.userAgent;
        var objbrowserName = navigator.appName;
        var objfullVersion = '' + parseFloat(navigator.appVersion);
        var objBrMajorVersion = parseInt(navigator.appVersion, 10);
        var objOffsetName, objOffsetVersion, ix;
        // In Chrome
        if ((objOffsetVersion = objAgent.indexOf("Chrome")) != -1) {
            objbrowserName = "Chrome";
            objfullVersion = objAgent.substring(objOffsetVersion + 7);
        }
        // In Microsoft internet explorer
        else if ((objOffsetVersion = objAgent.indexOf("MSIE")) != -1) {
            objbrowserName = "Microsoft Internet Explorer";
            objfullVersion = objAgent.substring(objOffsetVersion + 5);
        }
        // In Firefox
        else if ((objOffsetVersion = objAgent.indexOf("Firefox")) != -1) {
            objbrowserName = "Firefox";
        }
        // In Safari
        else if ((objOffsetVersion = objAgent.indexOf("Safari")) != -1) {
            objbrowserName = "Safari";
            objfullVersion = objAgent.substring(objOffsetVersion + 7);
            if ((objOffsetVersion = objAgent.indexOf("Version")) != -1)
                objfullVersion = objAgent.substring(objOffsetVersion + 8);
        }
        // For other browser "name/version" is at the end of userAgent
        else if ((objOffsetName = objAgent.lastIndexOf(' ') + 1) < (objOffsetVersion = objAgent.lastIndexOf('/'))) {
            objbrowserName = objAgent.substring(objOffsetName, objOffsetVersion);
            objfullVersion = objAgent.substring(objOffsetVersion + 1);
            if (objbrowserName.toLowerCase() == objbrowserName.toUpperCase()) {
                objbrowserName = navigator.appName;
            }
        }
        // trimming the fullVersion string at semicolon/space if present
        if ((ix = objfullVersion.indexOf(";")) != -1) objfullVersion = objfullVersion.substring(0, ix);
        if ((ix = objfullVersion.indexOf(" ")) != -1) objfullVersion = objfullVersion.substring(0, ix);
        objBrMajorVersion = parseInt('' + objfullVersion, 10);
        if (isNaN(objBrMajorVersion)) {
            objfullVersion = '' + parseFloat(navigator.appVersion);
            objBrMajorVersion = parseInt(navigator.appVersion, 10);
        }
        if (objBrMajorVersion == "9") {
            if (objbrowserName == "Microsoft Internet Explorer") {
                window.navigator.msSaveOrOpenBlob(new Blob([responseData], {
                    type: "text/json;charset=utf-8"
                }), filename);
            }
        } else {
            var blob = new Blob([responseData], {
                    type: 'text/json'
                }),
                e = document.createEvent('MouseEvents'),
                a = document.createElement('a');
            a.download = filename;
            if (objbrowserName == "Microsoft Internet Explorer" || objbrowserName == "Netscape") {
                window.navigator.msSaveOrOpenBlob(new Blob([responseData], {
                    type: "text/json;charset=utf-8"
                }), filename);
                //saveAs(blob, filename);
            } else {
                a.href = window.URL.createObjectURL(blob);
                a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
                e.initMouseEvent('click', true, true, window,
                    0, 0, 0, 0, 0, false, false, false, false, 0, null);
                a.dispatchEvent(e);
            }
        }
        unblockUI();
    };
}]);