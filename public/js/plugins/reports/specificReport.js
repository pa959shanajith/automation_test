var url, userName, pwd;

function blockUI(content) {
    $("body").append("<div id='overlayContainer'><div class='contentOverlay'>" + content + "</div></div>");
    $("#overlayContainer").fadeIn(300);
}

function unblockUI() {
    $("#overlayContainer").fadeOut(300).remove()
}

//Anonymous function(for IE)
setTimeout((function() {
    return function() {
        blockUI('Loading Reports.. Please Wait..');
        loadReports();
        try {
            window.stop();
        } catch (exception) {
            document.execCommand('Stop');
        }
        //window.stop();
    };
})(), 400);

function loadReports() {
    setTimeout(function() {
        var headerHeight =  $('.hearderCon').height();
        var collapsibleHeight =  $('.collapsible').height();
        var resultSummaryHeight = $('.resultSummary').height();
        var resultSummaryBoxHeight = $('.resultSummaryBox').height();
        var remainingHeight = headerHeight + collapsibleHeight  + resultSummaryHeight + resultSummaryBoxHeight;
        var windowHeight = $( window ).height();
        var  scrollBodyHeight = windowHeight - remainingHeight;
            var calcDataTableHeight = function() {
                    return scrollBodyHeight - 100;
              };  
        
        var overallStatus = $('.overallStatusVal').text();
        if(overallStatus.indexOf('Incomplete') != '-1')
        {
            $('.toggleIncompleteStatus').hide();
        }
        else
        {
            $('.toggleIncompleteStatus').show();
        }
    
        //Datatable
         var oTable =  $('#specificReportDataTable').DataTable({
                "bDestroy": true,
                "responsive": true,
                "bRetrieve": true,
                "bPaginate": false,
                "bSort": false,
                "bFilter": false,
                "bLengthChange": false,
                "bInfo": false,
                "scrollY": calcDataTableHeight,
                "scrollCollapse": true,
                "scrollX": true,
                "paging": false,
                "oLanguage": {
                    "sSearch": ""
                },
                "aoColumns": [
                    { "sWidth": "5%" }, // 1st column width 
                    { "sWidth": "10%" }, // 2nd column width 
                    { "sWidth": "15%" }, // 3rd column width
                    { "sWidth": "15%" }, // 4th column width 
                    { "sWidth": "10%" }, // 5th column width 
                    { "sWidth": "10%" }, // 6th column width
                    { "sWidth": "10%" }, // 7th column width 
                    { "sWidth": "10%" }, // 8th column width
                    { "sWidth": "10%" }, // 9th column width 
                    ],
                "deferRender": true,
                "fnInitComplete": function(oSettings, json) {
                    getRows = $('.reportdetailsrow');
                    for (let i = 0; i < getRows.length; i++) {
                        var name = getRows[i].children[2].innerHTML;
                        var rowCount = 0;
                        var getParentId;
                        if($(getRows[i]).children('td.rDstatus.tabCont.openscreenshot').attr('data-screenshot') == '')
                        {
                            $(getRows[i]).children('td.rDstatus.tabCont.openscreenshot').css('text-decoration','none').addClass('noScreenshot');
                        }
                        if($(getRows[i]).children().children().hasClass('openscreenshot') == true)
                        {
                            var screenshot =  $(getRows[i]).children().find('.openscreenshot').attr('data-screenshot');
                        }
                        if(screenshot && screenshot.length <= 0 && screenshot.toLowerCase().indexOf(".png") == -1) 
                        {
                            $(getRows[i]).children().children().removeClass('openscreenshot');
                        }
                        if (getRows[i].children[1].innerHTML.indexOf('Start iteration') >= 0) {
                            getRows[i].children[1].innerHTML += '<i class="fa fa-caret-down unexpand" aria-hidden="true" style="position: relative; left: -110px;"></i>';
                        }
                    }
                    unblockUI();
                }
            });    
        var remarksLength = parseInt($('.remarksLength').text());
        var commentsLength = parseInt($('.commentsLength').text());
        $('.toggleRemarks, .rDremarks').hide();
        if(commentsLength == 0)
        {
            $('.toggleCommentsCol,.rDcomments').hide();
        }
        else{
            $('.toggleCommentsCol,.rDcomments').show();
        }
        //Open Screenshot for specific reports
        $(document).on('click', '.openscreenshot', function() {
            var path = $(this).attr("data-screenshot");
            var hostName = window.location.host;
            if ($.trim(path) != "") {
                $.ajax({
                    type: 'POST',
                    url: 'https://' + hostName + '/openScreenShot',
                    responseType: 'arraybuffer',
                    data: {
                        "absPath": [path]
                    },
                    success: function(data) {
                        if (data == "unavailableLocalServer") {
                            alert("ICE Engine is not available. Please run the batch file and connect to the Server.");
                        } else if (data == 'scheduleModeOn') {
                            alert("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
                        } else if (data == "fail") {
                            alert("Failed to open image");
                        } else {
                            data = data[0]
                            var b64Response = window.btoa(unescape(encodeURIComponent(data)));
                            var imageUrl = 'data:image/PNG;base64,' + data;
                            var WindowObject = window.open();
                            var strHtml = "<html>\n<head>\n</head>\n<body style='margin: 2px' >\n<img style='border: 1px solid #ccc' src='" + imageUrl + "'/>\n</body>\n</html>";
                            WindowObject.document.writeln(strHtml);
                        }
                    },
                    error: function(jqXHR, exception) {
                        console.log("Error in opening screenshot:" + jqXHR);
                    }
                });
            }
        })
        function calcTableHeight(flag)
        {
            var windowHeight = $( window ).height();
            var headerHeight =  $('.hearderCon').height();
            var collapsibleHeight =  $('.collapsible').height();
            var resultSummaryHeight = $('.resultSummary').height();
            var resultSummaryBoxHeight = $('.resultSummaryBox').height();
            if(flag == 'active')
            {
                var remainingHeight = headerHeight + collapsibleHeight  + resultSummaryHeight;
            }
            else{
                var remainingHeight = headerHeight + collapsibleHeight  + resultSummaryHeight  + resultSummaryBoxHeight;
            }

            var  scrollBodyHeight = windowHeight - remainingHeight - 100;
            $('.dataTables_scrollBody').css('max-height', scrollBodyHeight);
        }
        $(document).on('click', '.collapsible', function() {
            if ($(this).hasClass('active') == true) {
                $(this).children('span').children('span.arrow-down').removeClass('arrow-down').addClass('arrow-up');
                $(".resultSummaryBox").addClass('hide');
                var flag = 'active'
                calcTableHeight(flag);
               
            } else {
                $(this).children('span').children('span.arrow-up').removeClass('arrow-up').addClass('arrow-down');
                $(".resultSummaryBox").removeClass('hide');
                var flag = 'inactive'
                calcTableHeight(flag);
            }   
            $('.maintabCont_collapse').css('display','block');
        });

        $('.collapsible-tc').prepend('<span class="arrow-down-sm collapsible-testcase"></span>');

        $(".collapsible-tc:visible").each(function() {
            $(this).parent("tr").addClass('parentTestcase');
        });

        $(document).on('click', '.collapsible-tc', function() {
            var abc = this.parentElement.getAttribute("data-id");
            var len = $('.reportdetailsrow').length;
            if ($(this).hasClass('collapse-active') == false) {
                $(this).addClass('collapse-active');
                $(this).children('span.arrow-down-sm').removeClass('arrow-down-sm').addClass('arrow-up-sm');
            } else {
                $(this).removeClass('collapse-active');
                $(this).children('span.arrow-up-sm').removeClass('arrow-up-sm').addClass('arrow-down-sm');
            }
            var testcasesLen = $('.collapsible-tc:visible').length;
            var clickedTestcaseRow = $(this).parent('tr');
            var getAllSelectedTestcaseRows = $(this).parent().nextUntil('.parentTestcase');
            if (getAllSelectedTestcaseRows.length != 0) {
                $(this).parent().nextUntil('.parentTestcase').toggleClass('no-disp');
            }
        });

        $(document).on('click', '.collapsible-testcase', function() {
            var abc = $(this).parents('tr.reportdetailsrow').attr("data-id");
            var len = $('.reportdetailsrow').length;
            if ($(this).hasClass('collapse-active') == false) {
                $(this).addClass('collapse-active');
                $(this).removeClass('arrow-down-sm').addClass('arrow-up-sm');
            } else {
                $(this).removeClass('collapse-active');
                $(this).removeClass('arrow-up-sm').addClass('arrow-down-sm');
            }
            var testcasesLen = $('.collapsible-testcase:visible').length;
            var clickedTestcaseRow = $(this).parents('tr');
            var getAllSelectedTestcaseRows = $(this).parents('tr').nextUntil('.parentTestcase');
            if (getAllSelectedTestcaseRows.length != 0) {
                $(this).parents('tr').nextUntil('tr.parentTestcase').toggleClass('no-disp');
            }
        });


        $(document).on('click', '.logintojira', function() {
            $(".jiraWindow").show();
            clearData();
            $('#overlay').css('display', 'block');
        });

        //Login to Jira
        $(document).on('click', '.resetJiraCredentials', function() {
            $("#jiraURL, #jiraUserName, #jiraPassword").css('border-color', '#bbb');
            $("#jiraURL").val('');
            $("#jiraUserName").val('');
            $("#jiraPassword").val('');
        });
        $(document).on('click', '.loginJiraCredentials', function(e) {
            $("#jiraURL, #jiraUserName, #jiraPassword").css('border-color', '#bbb');
            url = $("#jiraURL").val().trim();
            userName = $("#jiraUserName").val();
            pwd = $("#jiraPassword").val();
            var urlPattern = new RegExp("(http|ftp|https)://[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?")
            if (!url && urlPattern.test(url)) $("#jiraURL").css('border-color', 'red');
            else if (!userName) $("#jiraUserName").css('border-color', 'red');
            else if (!pwd) $("#jiraPassword").css('border-color', 'red');
            else {
                var hostName = window.location.host;
                var posturl = 'https://' + hostName + '/connectJira_ICE';
                blockUI('Loading....');
                $.ajax({
                    type: 'POST',
                    url: posturl,
                    responseType: 'arraybuffer',
                    data: {
                        "url": url,
                        "username": userName,
                        "password": pwd,
                        "action": "loginToJira"
                    },
                    success: function(data) {
                        if (data == "Fail") {
                            $(".error-msg").text("Failed to login");
                        } else if (data == 'Invalid Url') {
                            $(".error-msg").text("Invalid Url");
                        } else if (data == "Invalid Credentials") {
                            $(".error-msg").text("Invalid Credentials");
                        } else if (data == "unavailableLocalServer") {
                            $(".error-msg").text("ICE Engine is not available. Please run the batch file and connect to the Server.");
                        } else if (data == "Invalid Session") {
                            $(".error-msg").text("Invalid Session. Login again");
                        } else if (data == 'scheduleModeOn') {
                            $(".error-msg").text("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
                        } else {
                            localStorage.setItem("jiraLoginDetails", JSON.stringify(data));
                            clearData();
                            $(".error-msg").text('');
                            $(".jiraWindow, .logintojira").hide();
                            $('#overlay').css('display', 'none');
                            $(".Llogdefect, #inputSlno, .go_defectlog").show();
                            //Transaction Activity for JiraLoginConnection
                            /*var labelArr = [];
                            var infoArr = [];
                            labelArr.push(txnHistory.codesDict['JiraLoginConnection']);
                            txnHistory.log(e.type, labelArr, infoArr, window.location.pathname);*/
                        }
                        unblockUI();
                    }
                });
            }
        })
        //Login to Jira
        $("#jIssuetype").change(function() {
            var on_change_data = $('option:selected', this).text();
            if (on_change_data == 'Sub-task') {
                $('.createIssueWindow p:nth-child(11)').height(68 + "px");
                $('#parentIssue').show();
            } else {
                $('.createIssueWindow p:nth-child(11)').height(117 + "px");
                $('#parentIssue').hide();
            }
        });
        //Open create issue popup and get details of mentioned row
        $(document).on('click', '.opendescpopup', function() {
            var slno = parseInt($("#inputSlno").val())
            $('#parentIssue').hide();
            if (!slno || slno == "") $("#inputSlno").css('border-color', 'red');
            else if (slno > getRows.length) {
                $('#overlay').css('display', 'block');
                $(".statusWindow").show();
                $(".statusWindow .popupheader label").text("Invalid Input")
                $("#showStatus").text("SL No: " + slno + " does not exist.");
            } else {
                $('#overlay').css('display', 'block');
                $(".createIssueWindow").hide();
                $("#jSummary, #jDescription, #jLabel").val('');
                $("#jProjects, #jIssuetype, #jPriority").prop('selectedIndex', 0);
                $(".createIssueWindow").show();
                var jsonData = localStorage.getItem("jiraLoginDetails");
                jsonData = JSON.parse(jsonData);
                fillSelector(jsonData.projects, "jProjects");
                fillSelector(jsonData.issuetype, "jIssuetype");
                fillSelector(jsonData.priority, "jPriority");
                var desc, path, currentDataid;
                var description = "";
                for (var i = 0; i < getRows.length; i++) {
                    if (parseInt(getRows[i].children[0].textContent) == slno) {
                        desc = getRows[i].children[2].innerText;
                        path = getRows[i].children[3].dataset.screenshot;
                        currentDataid = parseInt(getRows[i].dataset.id);
                        for (var j = 0; j < currentDataid; j++) {
                            if (getRows[j].children[2].textContent.indexOf("Testscriptname") >= 0 || getRows[j].children[2].textContent.indexOf("TestCase Name") >= 0) {} else description = description + getRows[j].children[1].textContent + ": " + getRows[j].children[2].textContent.trim() + "\n\n";
                        }
                        break;
                    }
                }
                if (desc.length >= 255) $("#jSummary").val(desc.substring(0, 252) + "...");
                else $("#jSummary").val(desc);
                $("#jDescription").val(description);
                $("#scrnShotPath").val(path);
            }
        })

        function fillSelector(dataArray, selector) {
            $("#" + selector).find("option").not(":first").remove();
            for (var i = 0; i < dataArray.length; i++) {
                if (dataArray[i].name != 'Epic')
                    $("#" + selector).append("<option value=" + dataArray[i].id + ">" + dataArray[i].name + "</option>");
            }
        }
        //function to close popup window
        $(document).on('click', '.closeWindow', function() {
            $("#jiraURL, #jiraUserName, #jiraPassword").css('border-color', '#bbb');
            $(".jiraWindow, .createIssueWindow, .statusWindow").hide();
            $('#overlay').css('display', 'none');
            $(".error-msg").text('');
        })

        $(document).on('click', '.cancelIssues', function() {
            $(".createIssueWindow").hide();
            $('#overlay').css('display', 'none');
        })
        //function to close popup window

        //Create Issues in Jira
        $(document).on('click', '.createIssues', function() {
            $("#jProjects, #jIssuetype, #jSummary, #jPriority").css('border-color', '#bbb');
            var issue_dict = {};
            var projectid = $("#jProjects option:selected").val();
            var issuetype = $("#jIssuetype option:selected").text();
            var summary = $("#jSummary").val();
            var description = $("#jDescription").val();
            var priority = $("#jPriority option:selected").text();
            var label = $("#jLabel").val().split(" ");
            var attachment = $("#scrnShotPath").val();
            var pissue = $("#jpIssueid").val();
            var reportId = $('.reportId').text();
            var executionId = $('.executionId').text();
            var slno = $('#inputSlno').val();
            if (!projectid) $("#jProjects").css('border-color', 'red');
            else if (!issuetype || issuetype == "Select Issue") $("#jIssuetype").css('border-color', 'red');
            else if (issuetype == "Sub-task" && !pissue) $("#jpIssueid").css('border-color', 'red');
            else if (!summary) $("#jSummary").css('border-color', 'red');
            //else if(!description) $("#jDescription").css('border-color','red');
            //else if (!priority || priority == "Select Priority") $("#jPriority").css('border-color', 'red');
            //else if(!label) $("#jLabel").css('border-color','red');
            //else if(!attachment) $("#jAttachment").css('border-color','red');
            else {
                if (!attachment) attachment = $("#scrnShotPath").val();
                issue_dict = {
                    "issue_dict": {
                        'project': projectid,
                        'issuetype': issuetype,
                        'summary': summary,
                        'description': description,
                        'priority': priority,
                        'label': label,
                        'attachment': attachment,
                        'url': url,
                        'username': userName,
                        'password': pwd,
                        'parentissue': '',
                        'reportId': reportId,
                        'slno': slno,
                        'executionId': executionId
                    },
                    "action": "createIssueInJira"
                }
                if (issuetype == 'Sub-task') {
                    issue_dict.issue_dict.parentissue = pissue;
                }
                var hostName = window.location.host;
                var posturl = 'https://' + hostName + '/connectJira_ICE';
                blockUI('Loading....');
                $.ajax({
                    type: 'POST',
                    url: posturl,
                    responseType: 'arraybuffer',
                    data: issue_dict,
                    success: function(data) {
                        if (data == "Fail") {
                            $(".createIssueWindow").hide();
                            $(".statusWindow").show();
                            $("#showStatus").text("Failed to create issue.");
                        } else if (data == "unavailableLocalServer") {
                            $(".createIssueWindow").hide();
                            $(".statusWindow").show();
                            $("#showStatus").text("ICE Engine is not available. Please run the batch file and connect to the Server.");
                        } else if (data == 'scheduleModeOn') {
                            $(".createIssueWindow").hide();
                            $(".statusWindow").show();
                            $("#showStatus").text("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
                        } else if (data == "Invalid Session") {
                            $(".createIssueWindow").hide();
                            $(".statusWindow").show();
                            $("#showStatus").text("Invalid Session. Login again");
                        } else {
                            getRows[parseInt($("#inputSlno").val()) - 1].children[8].innerText = data;
                            $(".createIssueWindow").hide();
                            $(".statusWindow").show();
                            $("#showStatus").text("Issue bearing ID " + data + " created successfully.");
                        }
                        $('#inputSlno').val('');
                        $("#jpIssueid").val('');
                        unblockUI();
                    }
                });
            }
        })
        //Create Issues in Jira
        var coll = document.getElementsByClassName("collapsible");
        var i;

        for (i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function() {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.display != "none") {
                    content.style.display = "none";
                } else {
                    content.style.display = "block";
                }
                var content = this.nextElementSibling.nextElementSibling;
                if (content.style.display != "none") {
                    content.style.display = "none";
                } else {
                    content.style.display = "block";
                }
            });
        }

        function clearData() {
            $("#jiraURL, #jiraUserName, #jiraPassword").val("");
        }

        //Hide Testcase details if checkbox in test step details is checked to true(Expected Result & Actual Result)
        $('.hideStep').each(function() {
            var hideStepTxt = $(this).text();
            if (hideStepTxt == "true") {
                $(this).siblings('td.rDExpectedRes:visible').parent('tr').hide();
                $(this).siblings('td.rDActualRes:visible').parent('tr').hide();
            }
        });
        if ($('.rDstatus:contains("Fail")').length > 0) {
            var offset = $($('.rDstatus:contains("Fail"):visible')[0]).offset().top - $('.dataTables_scrollBody').offset().top;
            $('.dataTables_scrollBody')[0].scrollTo(0, offset);
        }
        $('.rDExpectedRes:visible:contains("TestCase Name")').each(function() {
            var StepDescription = $(this).html();
            $(this).siblings('.rDstep').html(StepDescription);
            $(this).html('');
        });
        $('.rDExpectedRes:visible:contains("Scenario cannot be executed")').html('');
       
        $(document).on('click', '.unexpand', function() {
            var getID = $(this).parents('.reportdetailsrow').attr('data-id');
            $(this).removeClass('unexpand').addClass('expand');
            $(this).removeClass('fa-caret-down').addClass('fa-caret-right');
            $.each(getRows, function() {
                if ($(this).attr('data-parentid') == getID) {
                    $(this).hide();
                }
            })
        });
        $(document).on('click', '.expand', function() {
            var getID = $(this).parents('.reportdetailsrow').attr('data-id');
            $(this).removeClass('expand').addClass('unexpand');
            $(this).removeClass('fa-caret-right').addClass('fa-caret-down');
            $.each(getRows, function() {
                if ($(this).attr('data-parentid') == getID) {
                    $(this).show();
                }
            })
        });
    }, 500);
}