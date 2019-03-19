var oTable;
mySPA.controller('reportsController', ['$scope', '$rootScope', '$http', '$location', '$timeout', '$window', 'reportService', 'mindmapServices', 'cfpLoadingBar', '$sce', function($scope, $rootScope, $http, $location, $timeout, $window, reportService, mindmapServices, cfpLoadingBar, $sce) {
    $("head").append('<link rel="stylesheet" href="css/css_reports/bootstrap/bootstrap.min.css"> <link rel="stylesheet" type="text/css" href="css/css_reports/datatables/dataTables.css"><link rel="stylesheet" type="text/css" href="css/css_reports/header.css"><link rel="stylesheet" type="text/css" href="css/css_reports/footer.css"><link rel="stylesheet" type="text/css" href="css/css_reports/leftSideBar.css"><link rel="stylesheet" type="text/css" href="css/css_reports/rightSideBar.css"><link rel="stylesheet" type="text/css" href="css/css_reports/reports.css"><script src="js/plugins/reports/bootstrap/popper.js"></script><script src="js/plugins/reports/bootstrap/bootstrap.min.js"></script><script src="js/plugins/reports/datatables/datatables.min.js"></script>');
    var getUserInfo = JSON.parse(window.localStorage['_UI']);
    var userID = getUserInfo.user_id;
    var openArrow = 0;
    var openWindow = 0;
    var executionId, testsuiteId;
    var robj, redirected = false;
    var pauseloadinginterval = false;
    var clearIntervalList = [];
    $scope.reportIdx = ''; // for execution count click
    $("#reportDataTableDiv").hide();
    $('.reports-search').attr('disabled', 'disabled');

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

    $('#expAssign').on('click', function(e) {
        $(".moduleBox").slideToggle('slow');
    });
    detailsTableHtml = $("#detailsTable").html();
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
        $("#reportsTable tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $(document).on('click', '.ct-nodeIcon', function(e) {
        blockUI('Loading reports...');
        $('img.highlight-module').removeClass('highlight-module');
        $('span.highlight-moduleName').removeClass('highlight-moduleName');
        $(this).addClass('highlight-module').next('span').addClass('highlight-moduleName');
        var reportInfo = $rootScope.reportData.testsuites;
        var moduleName = $('#' + e.target.id).parent().children('span.ct-nodeLabel').text();
        $('#reportsTable tbody').empty();
        angular.forEach(reportInfo, function(value, index) {
            if ($.trim(e.target.id) == $.trim(value.testsuiteid)) {
                angular.forEach(value.scenarios, function(val, key) {
                    var scenarioId = val.scenarioid;
                    var reportsInputData = {};
                    reportsInputData.scenarioid = scenarioId;
                    reportsInputData.cycleid = $('.cycle-list option:selected').val();
                    reportsInputData.type = "latestreport";
                    reportService.getReportsData_ICE(reportsInputData).then(function(result_res_scenarioData, response_scenarioData) {
                        $rootScope.scenarioInfo = result_res_scenarioData;
                        var scenarioInfo = $rootScope.scenarioInfo;
                        $('#reportsTable tbody').append('<tr class="reportsTbl" data-executionid=' + scenarioInfo.executionid + ' id=' + value.testsuiteid + '><td class="center scenarioExecutionTime"><span id=' + val.scenarioid + ' class="glyphicon glyphicon-menu-right"></span></td><td class="scenarioName">' + val.scenarioname + '</td><td>' + scenarioInfo.executedtime + '</td><td class="status">' + scenarioInfo.status + '</td><td><img alt="Pdf Icon" class="getSpecificReportBrowser openreportstatus reportFormat" data-getrep="wkhtmltopdf" data-reportid=' + scenarioInfo.reportid + ' data-reportidx="" style="cursor: pointer; width: 21px;height: 22px;" src="imgs/ic-pdf.png" title="PDF Report"><img alt="-" class="getSpecificReportBrowser openreportstatus reportFormat" data-getrep="html" data-reportid=' + scenarioInfo.reportid + ' data-reportidx="" style="cursor: pointer; width: 21px;height: 22px;" src="imgs/ic-web.png" title="Browser Report"><img alt="Export JSON" class="exportToJSON openreportstatus reportFormat" data-getrep="json" data-reportid=' + scenarioInfo.reportid + ' data-reportidx="" style="cursor: pointer; width: 21px;height: 22px;" src="imgs/ic-export-to-json.png" title="Export to Json"></td></tr>');
                        $("tr.reportsTbl:even").addClass('even');
                        $("tr.reportsTbl:odd").addClass('odd');
                        setStatusColor();
                    });
                });
            }
        });



        setTimeout(function() {
        //Initialse DataTables, with no sorting on the 'details' column
        var oTable = $('#reportsTable').dataTable({
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
            "columns": [{
                    "width": "5%",
                    "targets": 0
                },
                {
                    "width": "15%",
                    "targets": 1
                },
                {
                    "width": "25%",
                    "targets": 2
                },
                {
                    "width": "20%",
                    "targets": 3
                },
                {
                    "width": "18%",
                    "targets": 4
                },
            ],
            "fnInitComplete": function(oSettings, json) {
                    unblockUI();
                    
              }
        });
              unblockUI();
            $("input[type=search]").attr('placeholder', 'Search Scenario').addClass('scenarioSearch');
        }, 1000);
        redirected = false;
        $('#accordion').show();
        $('.panel-body').append(oTable);
        $('#reportsTable').show();

        $('#moduleNameHeader').html('<span id="moduleTxt" title=' + moduleName + '>' + moduleName + '</span>');
        //unblockUI();
        $(document).on('click', '.reportsTbl', function(e) {
            $(this).addClass('tblRowHighlight').siblings('tr').removeClass('tblRowHighlight');
        });

        //Nested Table click
        $(document).on('click', '.scenarioExecutionTime', function(e) {
            $(this).parent('tr.reportsTbl').trigger('click');
            if ($(this).children('span').hasClass('glyphicon-menu-right') == true) {
                $(this).children('span').removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
            } else {
                $(this).children('span').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
                $(this).children('span').parents('tr').siblings('tr.details').remove();
                e.stopImmediatePropagation();
                return;
            }

            var nTr = $(this).parent('tr');
            var scenarioId = $(this).children('span').attr('id');
            var reportsInputData = {};
            reportsInputData.scenarioid = scenarioId;
            reportsInputData.cycleid = $('.cycle-list option:selected').val();
            reportsInputData.type = "scenarioreports";
            reportService.getReportsData_ICE(reportsInputData).then(function(data) {
                $scope.result_res_scenarioData = data.rows;
                $scope.result_res_scenarioData = $scope.result_res_scenarioData.sort(function(a, b) {
                    return new Date(b.executedtime) - new Date(a.executedtime);
                });
                var executionData = $scope.result_res_scenarioData;
               if(executionData.length == 0)
               {
                $("<tr class='details'><td class='noExecutions' colspan=5>No Executions Found</td></tr>").insertAfter(nTr);                
               }
               else{
                    for (var k = 0; k < executionData.length; k++) {
                        $("<tr class='details'><td></td><td></td><td>" + executionData[k].executedtime + "</td><td class='status'>" + executionData[k].status + "</td><td><img alt='Pdf Icon' class='getSpecificReportBrowser openreportstatus reportFormat' data-getrep='wkhtmltopdf' data-reportid=" + executionData[k].reportid + " data-reportidx='' style='cursor: pointer; width: 21px;height: 22px;' src='imgs/ic-pdf.png' title='PDF Report'><img alt='-' class='getSpecificReportBrowser openreportstatus reportFormat' data-getrep='html' data-reportid=" + executionData[k].reportid + " data-reportidx='' style='cursor: pointer; width: 21px;height: 22px;' src='imgs/ic-web.png' title='Browser Report'><img alt='Export JSON' class='exportToJSON openreportstatus reportFormat' data-getrep='json' data-reportid=" + executionData[k].reportid + " data-reportidx='' style='cursor: pointer; width: 21px;height: 22px;' src='imgs/ic-export-to-json.png' title='Export to Json'></td></tr>").insertAfter(nTr);
                    }
               }
              
                setStatusColor();
            });
            e.stopImmediatePropagation();
        });
        //Table Row Highlight
        $(document).on('click', '.detailsTbl', function(e) {
            $(this).addClass('tblRowHighlight').siblings('tr').removeClass('tblRowHighlight');
        });
    });

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
    //collapsible Module accordion Header Click
    $('.moduleHeader').on('click', function() {
        $('.panel-body,.datatable').toggle();
        if ($('.panel-body').is(':visible') == true) {
            $('span.collapseDown').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
        } else {
            $('span.collapseDown').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
        }
    });

    cfpLoadingBar.start()
    $timeout(function() {
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
        /*document.getElementById("currentYear").innerHTML = new Date().getFullYear()*/
        angular.element(document.getElementById("reportSection")).scope().getReports_ICE();
        $('#ct-expand-left,#ct-expand-right').trigger('click');
        $('#ct-expand-left,#ct-expand-right').css('pointerEvents', 'none');
    }, 100)
    if (window.localStorage['navigateScreen'] != "p_Reports") {
        $rootScope.redirectPage();
    }


    if (window.localStorage['redirectedReportObj'] && window.localStorage['redirectedReportObj'] != '') {

        var parts = document.referrer.split('://')[1].split('/');
        var protocol = document.referrer.split('://')[0];
        var host = parts[0];
        var pathName = parts.slice(1).join('/');

        if ($.trim(pathName) == "execute") {
            blockUI("loading report ...");
            redirected = true;
            robj = JSON.parse(window.localStorage['redirectedReportObj']);
        } else {
            redirected = false;
        }
    }
    $scope.getReports_ICE = function() {
        $("#middle-content-section").css('visibility', 'visible');
        getProjectsAndSuites(userID, "projects");
    }

    //Project Filter Change
    $scope.selProjectsFilter = function() {
        var projectId = $('.project-list option:selected').val();
        blockUI("Loading releases.. please wait..");
        mindmapServices.populateReleases(projectId).then(function(result) {
            unblockUI();
            if (result == "Invalid Session") {
                $rootScope.redirectPage();
            }
            $('.release-list').empty();
            $('.release-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
            $('.cycle-list').empty();
            $('.cycle-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
            for (i = 0; i < result.r_ids.length && result.rel.length; i++) {
                $('.release-list').append("<option data-id='" + result.rel[i] + "' value='" + result.r_ids[i] + "'>" + result.rel[i] + "</option>");
            }
            if (redirected) {
                $timeout(function() {
                    $('#selectReleases').val(robj.testSuiteDetails[0].releaseid);
                    $('#selectReleases').trigger('change');
                }, 500);
            }
        });

        //Release Filter Change
        $scope.selReleasesFilter = function() {
            var releaseId = $('.release-list option:selected').val();
            blockUI("Loading cycles.. please wait..");
            mindmapServices.populateCycles(releaseId).then(function(result_cycles) {
                unblockUI();
                if (result_cycles == "Invalid Session") {
                    $rootScope.redirectPage();
                }
                $('.cycle-list').empty();
                $('.cycle-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
                for (i = 0; i < result_cycles.c_ids.length && result_cycles.cyc.length; i++) {
                    $('.cycle-list').append("<option data-id='" + result_cycles.cyc[i] + "' value='" + result_cycles.c_ids[i] + "'>" + result_cycles.cyc[i] + "</option>");
                }
                if (redirected) {
                    $timeout(function() {
                        $('#selectCycles').val(robj.testSuiteDetails[0].cycleid);
                        unblockUI();
                        $('#selectCycles').trigger('change');
                    }, 500);
                }
            });
        };
        //Cycle Filter Change
        $scope.selCyclesFilter = function() {
            var cycleId = $('.cycle-list option:selected').val();
            var reportsInputData = {};
            reportsInputData.projectId = $.trim($('.project-list option:selected').val());
            reportsInputData.releaseId = $.trim($('.release-list option:selected').val());
            reportsInputData.cycleId = $.trim(cycleId);
            reportsInputData.type = 'allreports';
            var counter = 0;
            blockUI("Loading modules.. please wait..");
            $("#accordion").hide();
            $('#nodeBox').empty();
            reportService.getReportsData_ICE(reportsInputData).then(function(result_res_reportData, response_reportData) {
                unblockUI();
                if (Object.keys(result_res_reportData.testsuites).length == 0) {
                    //No Modules Found
                    $("#noModulesModal").modal('show');
                    $('#searchModule').attr('disabled', 'disabled');
                } else {
                    $('#searchModule').removeAttr('disabled', 'disabled');
                    if ($('.moduleBox').is(':visible') == true) {

                    } else {
                        $('#expAssign').trigger('click');
                    }
                    $rootScope.reportData = result_res_reportData;
                    angular.forEach(result_res_reportData.testsuites, function(value, index) {
                        $('#nodeBox').append('<div class="nodeDiv"><div class="ct-node fl-left ng-scope" data-moduleid=' + value.testsuiteid + '  title=' + value.testsuitename + ' style="width: 139px;"><img class="ct-nodeIcon" id=' + value.testsuiteid + ' src="imgs/node-modules.png" alt="Module Name" aria-hidden="true"><span class="ct-nodeLabel ng-binding" style="width: 115px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;padding-left: 30px;">' + value.testsuitename + '</span></div>')
                        $('.reports-search').removeAttr('disabled', 'disabled');
                    });

                }
                if (redirected) {
                    $timeout(function() {
                        $("div.ct-node").each(function() {
                            if ($.trim($(this).text()) == $.trim(robj.testSuiteDetails[0].testsuitename)) {
                                $(this).children('img').trigger('click');
                            }
                        })
                    }, 700);
                }
            });
        };
    };
    //getAllSuites_ICE function call
    function getProjectsAndSuites(ID, type) {
        reportService.getAllSuites_ICE(ID, type)
            .then(function(data) {
                if (data == "Invalid Session") {
                    $rootScope.redirectPage();
                }
                if (type == "projects") {
                    if (data != "fail" && data.projectids.length != 0) {
                        $(".project-list").empty();
                        $(".project-list").append("<option selected disabled>Select Project</option>");
                        for (i = 0; i < data.projectids.length; i++) {
                            $(".project-list").append("<option value='" + data.projectids[i] + "'>" + data.projectnames[i] + "</option>");
                        }
                        var proId;
                        $('.release-list').empty()
                        $('.release-list').append("<option data-id='Select' value='Select' selected>Select</option>");
                        $('.cycle-list').empty();
                        $('.cycle-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
                        proId = data.projectids[0];
                        getProjectsAndSuites(proId, "reports");
                        if (redirected) {
                            $timeout(function() {
                                unblockUI();
                                $('#selectProjects').val(robj.testSuiteDetails[0].projectidts);
                                $('#selectProjects').trigger('change');
                            }, 500);

                        }
                    } else console.log("Unable to load test suites.");
                } else if (type == "reports") {
                    $('.scrollbar-inner').scrollbar();
                    $('.scrollbar-macosx').scrollbar();
                    var container = $('.staticTestsuiteContainer');
                    $('.suiteContainer').remove();
                    if (Object.prototype.toString.call(data) === '[object Object]') {
                        if (data.suiteids.length > 0) {
                            for (i = 0; i < data.suiteids.length; i++) {
                                if (container.find('.suiteContainer').length >= 6) {
                                    $('.dynamicTestsuiteContainer').append("<span class='suiteContainer' data-suiteId='" + data.suiteids[i] + "'><img alt='Test suite icon' class='reportbox' src='imgs/ic-reportbox.png' title='" + data.suitenames[i] + "'><br/><span class='repsuitename' title='" + data.suitenames[i] + "'>" + data.suitenames[i] + "</span></span>");
                                } else {
                                    container.append("<span class='suiteContainer' data-suiteId='" + data.suiteids[i] + "'><img alt='Test suite icon' class='reportbox' src='imgs/ic-reportbox.png' title='" + data.suitenames[i] + "'><br/><span class='repsuitename' title='" + data.suitenames[i] + "'>" + data.suitenames[i] + "</span></span>");
                                }
                            }
                        }
                    }
                    $('.searchScrapEle').css('display', 'none');
                    if ($('.dynamicTestsuiteContainer').find('.suiteContainer').length <= 0) {
                        $('.suitedropdownicon, .dynamicTestsuiteContainer').hide();
                    } else $('.suitedropdownicon').show();
                    $('[data-toggle="tooltip"]').tooltip();
                    cfpLoadingBar.complete();
                }
            }, function(error) {
                console.log("Error-------" + error);
                return "fail";
            })
    }

    var showSearchBox = true;
    /************ SEARCH *****************/
    $(document).off('click.filterSuites', '.searchScrapEle');
    $(document).on({
        'click.filterSuites': searchScrapeElement
    }, '.searchScrapEle')

    function searchScrapeElement(e) {
        if (showSearchBox) {
            $(".searchScrapInput").show();
            $(".searchScrapEle").addClass('positionInputSerachBox');
            showSearchBox = false;
            $(".searchScrapInput").focus();
        } else {
            $(".searchScrapEle").removeClass('positionInputSerachBox');
            $(".searchScrapInput").hide();
            showSearchBox = true;
        }
    }
    $(document).on('keyup', '#searchModule', function(e) {
        input = document.getElementById("searchModule");
        filter = input.value.toUpperCase();
        elems = $('.dynamicTestsuiteContainer .suiteContainer');
        for (i = 0; i < elems.length; i++) {
            if (elems[i].textContent.toUpperCase().indexOf(filter) > -1) {
                elems[i].style.display = "";
            } else {
                elems[i].style.display = "none";
            }
        }
        e.stopImmediatePropagation();
    });

    //Service call to get start and end details of suites
    /************ SUITE CLICK *****************/
    $(document).off('click.suiteContainerClick', '.suiteContainer');
    $(document).on({
        'click.suiteContainerClick': suiteContainerClick
    }, '.suiteContainer')

    function suiteContainerClick(e) {
        $('.formatpdfbrwsrexport').remove();
        $(this).find('.reportbox').parent().addClass('reportboxselected');
        if ($(this).parent().hasClass('staticTestsuiteContainer')) {
            $(this).siblings().find('.reportbox').parent().removeClass('reportboxselected');
            $('.dynamicTestsuiteContainer').find('.reportbox').parent().removeClass('reportboxselected');
        } else if ($(this).parent().hasClass('dynamicTestsuiteContainer')) {
            $(this).siblings().find('.reportbox').parent().removeClass('reportboxselected');
            $('.staticTestsuiteContainer').find('.reportbox').parent().removeClass('reportboxselected');
        }
        testsuiteId = $(this).attr('data-suiteId');
        $('#scenarioReportsTable').find('tbody').empty();
        reportService.getSuiteDetailsInExecution_ICE(testsuiteId)
            .then(function(data) {
                    if (data == "Invalid Session") {
                        $rootScope.redirectPage();
                    }
                    if (data != "fail") {
                        var tableContainer = $('#testSuitesTimeTable');
                        if (Object.prototype.toString.call(data) === '[object Array]') {
                            if (data.length > 0) {
                                tableContainer.find('tbody').empty();
                                var startDat, startTym, endDat, endTym, sD, sT, eD, eT;
                                for (i = 0; i < data.length; i++) {
                                    startDat = (data[i].start_time.split(' ')[0]).split("-")
                                    startTym = (data[i].start_time.split(' ')[1]).split(":")
                                    endDat = (data[i].end_time.split(' ')[0]).split("-")
                                    endTym = (data[i].end_time.split(' ')[1]).split(":")
                                    sD = ("0" + startDat[0]).slice(-2) + "-" + ("0" + startDat[1]).slice(-2) + "-" + startDat[2];
                                    sT = ("0" + startTym[0]).slice(-2) + ":" + ("0" + startTym[1]).slice(-2);
                                    eD = ("0" + endDat[0]).slice(-2) + "-" + ("0" + endDat[1]).slice(-2) + "-" + endDat[2];
                                    eT = ("0" + endTym[0]).slice(-2) + ":" + ("0" + endTym[1]).slice(-2);
                                    tableContainer.find('tbody').append("<tr class='scenariostatusreport' data-executionid='" + data[i].execution_id + "'><td>" + (i + 1) + "</td><td>" + sD + "</td><td>" + sT + "</td><td>" + eD + "</td><td>" + eT + "</td></tr>");
                                }
                                if (data.length > 2) {
                                    $("#dateDESC").show();
                                } else $("#dateDESC, #dateASC").hide();
                                var dateArray = $('tbody.scrollbar-inner-scenariostatus').children('.scenariostatusreport');
                                dateASC(dateArray);
                                $("tbody.scrollbar-inner-scenariostatus").empty();
                                for (i = 0; i < dateArray.length; i++) {
                                    dateArray[i].firstChild.innerText = i + 1;
                                    $("tbody.scrollbar-inner-scenariostatus").append(dateArray[i]);
                                }
                            } else {
                                tableContainer.find('tbody').empty();
                                $("#dateDESC").hide();
                                $("#dateASC").hide();
                            }
                        }
                        $('.progress-bar-success, .progress-bar-danger, .progress-bar-warning, .progress-bar-norun').css('width', '0%');
                        $('.passPercent, .failPercent, .terminatePercent, .incompletePercent').text('');
                    } else console.log("Unable to load Test suite details in execution.")
                },
                function(error) {
                    console.log("Error-------" + error);
                })
        if ($('.dynamicTestsuiteContainer').is(':Visible')) {
            $('.iconSpace-reports').trigger('click');
        }
        //Transaction Activity for SuiteNodeClick
        // var labelArr = [];
        // var infoArr = [];
        // labelArr.push(txnHistory.codesDict['SuiteNodeClick']);
        // txnHistory.log(e.type,labelArr,infoArr,window.location.pathname); 
        e.stopImmediatePropagation();
    }

    //Date sorting
    $(document).on('click', '#dateDESC', function(e) {
        $(this).hide();
        var dateArray;
        if ($(this).parents('table').attr("id") == "testSuitesTimeTable") {
            $('#dateASC').show();
            dateArray = $('tbody.scrollbar-inner-scenariostatus').children('.scenariostatusreport');
            dateDESC(dateArray);
            $("tbody.scrollbar-inner-scenariostatus").empty();
            for (i = 0; i < dateArray.length; i++) {
                dateArray[i].firstChild.innerText = i + 1;
                $("tbody.scrollbar-inner-scenariostatus").append(dateArray[i]);
            }
        } else if ($(this).parents('table').attr("id") == "scenarioReportsTable") {
            $("#scenarioReportsTable #dateASC").show();
            dateArray = $('tbody.scrollbar-inner-scenarioreports').children('tr');
            dateDESC(dateArray);
            $("tbody.scrollbar-inner-scenarioreports").empty();
            for (i = 0; i < dateArray.length; i++) {
                $("tbody.scrollbar-inner-scenarioreports").append(dateArray[i]);
            }
        }
        e.stopImmediatePropagation();
    });
    $(document).on('click', '#dateASC', function(e) {
        $(this).hide();
        if ($(this).parents('table').attr("id") == "testSuitesTimeTable") {
            $('#dateDESC').show();
            var dateArray = $('tbody.scrollbar-inner-scenariostatus').children('.scenariostatusreport');
            dateASC(dateArray);
            $("tbody.scrollbar-inner-scenariostatus").empty();
            for (i = 0; i < dateArray.length; i++) {
                dateArray[i].firstChild.innerText = i + 1;
                $("tbody.scrollbar-inner-scenariostatus").append(dateArray[i]);
            }
        } else if ($(this).parents('table').attr("id") == "scenarioReportsTable") {
            $("#scenarioReportsTable #dateDESC").show();
            var dateArray = $('tbody.scrollbar-inner-scenarioreports').children('tr');
            dateASC(dateArray);
            $("tbody.scrollbar-inner-scenarioreports").empty();
            for (i = 0; i < dateArray.length; i++) {
                $("tbody.scrollbar-inner-scenarioreports").append(dateArray[i]);
            }
        }
        e.stopImmediatePropagation();
    });

    function dateDESC(dateArray) {
        dateArray.sort(function(a, b) {
            var dateA, timeA, dateB, timeB;
            if (a.children.item(1).children.length == 0) {
                dateA = a.children.item(1).innerText;
                timeA = a.children.item(2).innerText;
                dateB = b.children.item(1).innerText;
                timeB = b.children.item(2).innerText;
            } else {
                dateA = a.children.item(1).children.item(0).innerText.split(" ")[0];
                timeA = a.children.item(1).children.item(0).innerText.split(" ")[1];
                dateB = b.children.item(1).children.item(0).innerText.split(" ")[0];
                timeB = b.children.item(1).children.item(0).innerText.split(" ")[1];
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

    function dateASC(dateArray) {
        dateArray.sort(function(a, b) {
            var aA, timeA, bB, timeB;
            if (a.children.item(1).children.length == 0) {
                aA = a.children.item(1).innerText;
                timeA = a.children.item(2).innerText;
                bB = b.children.item(1).innerText;
                timeB = b.children.item(2).innerText;
            } else {
                aA = a.children.item(1).children.item(0).innerText.split(" ")[0];
                timeA = a.children.item(1).children.item(0).innerText.split(" ")[1];
                bB = b.children.item(1).children.item(0).innerText.split(" ")[0];
                timeB = b.children.item(1).children.item(0).innerText.split(" ")[1];
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

    /********** SELECT REPORT FORMAT CLICK ****************/
    $(document).off('click.reportFormat', '.selectFormat');
    $(document).on({
        'click.reportFormat': selectReportFormatClick
    }, '.selectFormat');

    function selectReportFormatClick(e) {
        $('.formatpdfbrwsrexport').remove();
        var repID = $(this).parent().attr("data-reportid");
        $(this).parent().append("<span class='formatpdfbrwsrexport'><img alt='Pdf Icon' class='getSpecificReportBrowser openreportstatus' data-getrep='wkhtmltopdf' data-reportid='" + repID + "' style='cursor: pointer; margin-right: 10px;' src='imgs/ic-pdf.png' title='PDF Report'><img alt='-' class='getSpecificReportBrowser openreportstatus' data-getrep='html' data-reportid='" + repID + "' style='cursor: pointer; margin-right: 10px; width: 23px;' src='imgs/ic-web.png' title='Browser Report'><img alt='Export JSON' class='exportToJSON' data-reportid='" + repID + "' style='cursor: pointer;' src='imgs/ic-export-to-json.png' title='Export to Json'></span>")
        $('.formatpdfbrwsrexport').focus();
        //Transaction Activity for selectReportFormatClick
        // var labelArr = [];
        // var infoArr = [];
        // labelArr.push(txnHistory.codesDict['selectReportFormatClick']);
        // txnHistory.log(e.type,labelArr,infoArr,window.location.pathname); 
    }


    $('span.formatpdfbrwsrexport').focusout(function() {
        $('.formatpdfbrwsrexport').remove();
    })

    function onIconSpaceClick(e) {
        e.preventDefault()
        $elem = $(this);
        if (openArrow == 0) {
            //getting the next element
            $content = $elem.parent().parent().next();
            //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
            if ($(".scroll-content").parent(".upper-collapsible-section").find(".suitedropdownicon").length > 0) {
                $(".scroll-content").parent(".upper-collapsible-section").find(".suitedropdownicon").remove();
            }
            $(".scroll-content").parent(".upper-collapsible-section").append($elem.parent());
            $(".suitedropdownicon").children(".iconSpace-reports").attr("src", "imgs/ic-collapseup.png")
            $content.slideDown(200, function() {
                //execute this after slideToggle is done
                //change text of header based on visibility of content div
                $('.scrollbar-inner').scrollbar();
                $('.scrollbar-macosx').scrollbar();
            });
            $('.searchScrapEle').css('display', '');
            openArrow = 1;
            e.stopImmediatePropagation();
        } else {
            $content = $elem.parent().parent();
            $content.slideUp(200, function() {
                //execute this after slideToggle is done
                //change text of header based on visibility of content div
                if ($(".scroll-content").parent(".upper-collapsible-section").find(".suitedropdownicon").length > 0) {
                    $(".scroll-content").parent(".upper-collapsible-section").find(".suitedropdownicon").remove();
                }
                $(".upper-section-testsuites").append($elem.parent());
                $(".suitedropdownicon").children(".iconSpace-reports").attr("src", "imgs/ic-collapse.png")
            });

            $('.searchScrapEle').css('display', 'none');
            $(".searchScrapInput").hide();
            showSearchBox = true;
            openArrow = 0;
            e.stopImmediatePropagation();
        }
        e.stopImmediatePropagation();
    }

    $(document).off('click.as', '.iconSpace-reports');
    $(document).on({
        'click.as': onIconSpaceClick
    }, '.iconSpace-reports');

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

    //$(document).on('click', '.openreportstatus', function(e){
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
                "overAllStatus": "",
                "EllapsedTime": "",
                "date": "",
                "time": "",
                "pass": "",
                "fail": "",
                "terminate": "",
                "reportId": "",
                "executionId": ""
            }],
            rows: []
        };
        reportService.getReport_Nineteen68(reportID, testsuiteId, testsuitename)
            .then(function(data) {
                    console.log("data", data);
                    if (data == "Invalid Session") {
                        $rootScope.redirectPage();
                    }
                    var remarksLength = [];
                    var commentsLength = [];
                    if (data != "fail") {
                        blockUI("Generating Report..please wait..");
                        if (data.length > 0) {
                            finalReports.overallstatus[0].domainName = data[0].domainname
                            finalReports.overallstatus[0].projectName = data[0].projectname
                            finalReports.overallstatus[0].releaseName = data[0].releasename
                            finalReports.overallstatus[0].cycleName = data[0].cyclename
                            finalReports.overallstatus[0].scenarioName = data[0].testscenarioname
                            finalReports.overallstatus[0].reportId = reportID;
                            finalReports.overallstatus[0].executionId = executionId;

                            var obj2 = JSON.parse(data[1].reportdata);
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
                                finalReports.overallstatus[0].overAllStatus = obj2.overallstatus[j].overallstatus;
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
                                if (finalReports.rows[k].hasOwnProperty("status") && finalReports.rows[k].status != "") {
                                    total++;
                                }
                                if (finalReports.rows[k].status == "Pass") {
                                    pass++;
                                } else if (finalReports.rows[k].status == "Fail") {
                                    fail++;
                                } else if (finalReports.rows[k].hasOwnProperty("Step") && finalReports.rows[k].Step == "Terminated") {
                                    terminated = total;
                                    pass = 0;
                                    fail = 0;
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
                            finalReports.overallstatus[0].pass = (parseFloat((pass / total) * 100).toFixed(2)) > 0 ? parseFloat((pass / total) * 100).toFixed(2) : parseInt(0);
                            finalReports.overallstatus[0].fail = (parseFloat((fail / total) * 100).toFixed(2)) > 0 ? parseFloat((fail / total) * 100).toFixed(2) : parseInt(0);
                            finalReports.overallstatus[0].terminate = (parseFloat((terminated / total) * 100).toFixed(2)) > 0 ? parseFloat((terminated / total) * 100).toFixed(2) : parseInt(0);
                            finalReports.remarksLength = remarksLength;
                            finalReports.commentsLength = commentsLength;

                        }
                        if (reportType == "html") {
                            //Service call to get Html reports
                            //blockUI("Generating Report..please wait..");
                            reportService.renderReport_ICE(finalReports, reportType).then(
                                function(data1) {
                                    unblockUI();
                                    if (data1 == "Invalid Session") $rootScope.redirectPage();
                                    else if (data1 == "fail") console.log("Failed to render reports.");
                                    else {
                                        openWindow = 0;
                                        if (openWindow == 0) {
                                            var myWindow;
                                            myWindow = window.open();
                                            myWindow.document.write(data1);
                                            setTimeout(function() {
                                                //myWindow.stop();
                                            }, 5000);
                                        }
                                        openWindow++;
                                        e.stopImmediatePropagation();
                                    }
                                },
                                function(error) {
                                    unblockUI();
                                    console.log("Error-------" + error);
                                });

                            //Transaction Activity for HTMLReportClick
                            // var labelArr = [];
                            // var infoArr = [];
                            // labelArr.push(txnHistory.codesDict['HTMLReportClick']);
                            // txnHistory.log(e.type,labelArr,infoArr,window.location.pathname); 
                        } else if (reportType == 'json') {
                            //blockUI("Generating Report..please wait..");
                            exportJSONReport(finalReports);
                        } else {
                            //Service call to get screenshots for Pdf reports
                            reportService.getScreenshotDataURL_ICE(scrShot.paths).then(
                                function(dataURIs) {
                                    if (dataURIs == "fail" || dataURIs == "unavailableLocalServer") scrShot.paths.forEach(function(d, i) {
                                        finalReports.rows[scrShot.idx[i]].screenshot_dataURI = dataURIs;
                                    });
                                    else dataURIs.forEach(function(d, i) {
                                        finalReports.rows[scrShot.idx[i]].screenshot_dataURI = d;
                                    });
                                    //Service call to get Pdf reports
                                    //blockUI("Generating report..please wait..");
                                    var isIE = /*@cc_on!@*/ false || !!document.documentMode;
                                    reportService.renderReport_ICE(finalReports, reportType).then(
                                        function(data1) {
                                            unblockUI();
                                            if (data1 == "Invalid Session") $rootScope.redirectPage();
                                            else if (data1 == "fail") console.log("Failed to render reports.");
                                            else {
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
                                            console.log("Error-------" + error);
                                        });
                                },
                                function(error) {
                                    unblockUI();
                                    console.log("Error-------" + error);
                                });
                        }
                        $('.formatpdfbrwsrexport').remove();
                    } else console.log("Failed to get reports details");
                },
                function(error) {
                    console.log("Error-------" + error);
                });
    }
    //});


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
                /*if(counter == 0)
                {
                	a.dispatchEvent(e);
                }
                counter++;*/
                a.dispatchEvent(e);
            }
        }
        unblockUI();
    };
}]);