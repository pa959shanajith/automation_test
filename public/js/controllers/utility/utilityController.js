mySPA.controller('utilityController', ['$scope','$rootScope',  '$http', '$location', '$timeout', 'utilityService', 'cfpLoadingBar', '$window', function($scope, $rootScope, $http, $location, $timeout, utilityService, cfpLoadingBar, $window) {
    $("body").css("background", "#eee");
    $timeout(function() {
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
        document.getElementById("currentYear").innerHTML = new Date().getFullYear()
        cfpLoadingBar.complete()
        $("#utilityEncrytpion").trigger("click");
    }, 500)
    //$scope.getScreenView = "utility-Encrytpion";
    $("#utilityEncrytpion img").addClass("select-utility");
    loadUserTasks()

    if (window.localStorage['navigateScreen'] != "p_Utility") {
        $rootScope.redirectPage();
    }
    cfpLoadingBar.start()

    $scope.encrypt_optimize = function(tabValue) {
        $scope.getScreenView = tabValue;
        if (tabValue == "utility-Encrytpion") {
            $(".selectAutility img").removeClass("select-utility");
            $("#utilityEncrytpion img").addClass("select-utility");
        } else if (tabValue == "utility-Optimization") {
            $(".selectAutility img").removeClass("select-utility");
            $("#utilityOptimization img").addClass("select-utility");
        }

        //		Prevents special characters and alphabets for level and factor fields
        $(document).on("keydown", ".validationPairwise", function(e) {
            if (e.shiftKey && e.keyCode == 190 || (e.shiftKey && (e.keyCode > 46 && e.keyCode < 58)) || e.keyCode == 17 || e.keyCode == 190 || e.keyCode == 219 || e.keyCode == 221 || e.keyCode == 186 || e.keyCode == 189 || e.keyCode == 220 || e.keyCode == 188 || e.keyCode == 191 || e.keyCode == 187 || e.keyCode == 110 || e.keyCode == 107 || e.keyCode == 111 || e.keyCode == 106 || e.keyCode == 109 || (e.keyCode >= 65 && e.keyCode <= 90)) {
                return false;
            } else {
                return true;
            }
        });

        // Pairwise Popup
        $scope.pairwiseGenerate = function() {
            var pairwiseTableTR = $("#factorsTbl tbody tr");
            var obj = [];
            $.each(pairwiseTableTR, function() {
                var pairwiseTableTd = $(this).children("td");
                var getTDvalues;
                $.each(pairwiseTableTd, function(index) {
                    if (!$(this).children("input").val()) {
                        openDialog("Pairwise", "Table values cannot be empty");
                        return false;
                    } else {
                        if (index == 0) {
                            getTDvalues = $(this).children("input").val();
                        } else getTDvalues = getTDvalues + ";" + $(this).children("input").val();
                    }
                })
                obj.push(getTDvalues);
            })
            utilityService.Pairwise(obj)
                .then(function(data) {
                        if (data != '' || data != []) {
                            var pairwisedHeader = $("#dialog-addObject #modal-body-pairwise thead tr");
                            var pairwisedTbody = $("#dialog-addObject #modal-body-pairwise tbody");
                            for (i = 0; i < data.length; i++) {
                                pairwisedHeader.append("<td>SL No.</td>");
                                for (j = 0; j < data[i].Factor.length; j++) {
                                    pairwisedHeader.append("<td>" + data[i].Factor[j] + "</td>");
                                }
                                break;
                            }
                            for (i = 0; i < data.length; i++) {
                                var pairedTR = pairwisedTbody.append("<tr><td>" + (i + 1) + "</td></tr>");
                                for (j = 0; j < data[i].Levels.length; j++) {
                                    pairedTR.append("<td>" + data[i].Factor[j] + "</td>");
                                }
                            }
                            $("#dialog-addObject").modal("show");
                        } else console.log("Something went wrong")
                    },
                    function(error) {
                        console.log("Something went wrong");
                    });
        };
        //$(TableData).appendTo("#modal-body-pairwise tbody");		
    }

    //Reset Encrypt
    $scope.resetEncrypt = function() {
        $('#encryptData').val('');
        $('#encryptedData').val('');
    };

    //Export Pairwise

    $scope.ExportPairwise = function() {
        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
            base64 = function(s) {
                return window.btoa(unescape(encodeURIComponent(s)))
            },
            format = function(s, c) {
                return s.replace(/{(\w+)}/g, function(m, p) {
                    return c[p];
                })
            }
        return function(table, name) {
            if (!table.nodeType) table = document.getElementById(table)
            var ctx = {
                worksheet: name || 'Worksheet',
                table: table.innerHTML
            }
            window.location.href = uri + base64(format(template, ctx))
        }

        var obj = window.localStorage['pairWiseExceldata'];
        var filename = "pairWiseData.csv";
        var a = JSON.parse(obj);
        var responseData = JSON.stringify(a.pairWise);
        responseData = ConvertToCSV(responseData);
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
                    type: "text/csv;charset=utf-8"
                }), filename);
            }
        } else {
            var blob = new Blob([responseData], {
                    type: 'text/csv'
                }),
                e = document.createEvent('MouseEvents'),
                a = document.createElement('a');
            a.download = filename;
            if (objbrowserName == "Microsoft Internet Explorer" || objbrowserName == "Netscape") {
                window.navigator.msSaveOrOpenBlob(new Blob([responseData], {
                    type: "text/csv;charset=utf-8"
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
        showDialogMesgsBtn("Import Of csv file", "Pairwise testcases imported successfully", "btnPairwiseImport");
        $.unblockUI();
        window.localStorage['pairWiseExceldata'] = '';
    };


    // Creating levels and factors in pairwise
    $scope.CreateFactors = function() {
        var rows, cols;
        rows = parseInt($('#level-row').val());
        cols = parseInt($('#factor-col').val()) + 1;
        var headersWidth = (972 / cols);
        if (rows && cols) {
            $('#factorsTbl thead tr').empty();
            for (i = 0; i < cols; i++) {
                i == 0 ? $('#factorsTbl thead tr').append("<th class='pairwiseHeader'>Factors</th>") : $('#factorsTbl thead tr').append("<th class='pairwiseHeader'>Level " + (i) + "</th>")
            }
            $('#factorsTbl tbody').empty();
            for (j = 0; j < rows; j++) {
                $('#factorsTbl tbody').append("<tr class='pairwiseTable_" + j + "'></tr>");
                for (k = 0; k < cols; k++) {
                    k == 0 ? $('#factorsTbl tbody tr.pairwiseTable_' + j).append("<td class='pairwiseTable'><input class='pairwiseInput' type='text' /></td>") : $('#factorsTbl tbody tr.pairwiseTable_' + j).append("<td class='pairwiseTable'><input class='pairwiseInput' type='text' /></td>")
                }
            }
            $(".pairwiseHeader").css("width", headersWidth + "px");
            $(".pairwiseTable").css("width", (parseInt(headersWidth) - 17) + "px");
            $(".pairwiseInput").css("width", (parseInt(headersWidth) - 34) + "px");
        }
        /*if(rows && cols){
        	$('#factorsTblHeader').empty();
        	var getWidth = document.getElementById('factorsTblHeader').offsetWidth;
        	for(i=0; i<cols; i++){
        		i == 0? $('#factorsTblHeader').append("<span class='pairwiseHeader'>Factors</span>") : $('#factorsTblHeader').append("<span class='pairwiseHeader'>Level "+(i+1)+"</span>")
        	}
        	$(".pairwiseHeader").css("width",(getWidth/cols)+"px");
        	$('#pairwiseFactorsTblbody').empty();
        	for(j=0; j<rows; j++){
        		$('#pairwiseFactorsTblbody').append("<div class='pairwiseTableRow pairwiseTableTR_"+(j+1)+"'></div>");
        		for(k=0; k<cols; k++){
        			$("#pairwiseFactorsTblbody div.pairwiseTableTR_"+(j+1)).append("<span class='pairwiseTableTD'><input class='pairwiseTableInput' type='text' /></span>");
        		}
        		$(".pairwiseTableTD").css("width",(getWidth/cols)+"px");
        		$(".pairwiseTableInput").css("width",(getWidth/cols)+"px");
        	}
        }*/
        $('.scrollbar-inner').scrollbar();
    }

    //button hide and show
    $(document).on('change', "#utilityMethods", function() {
        $('#encryptData').val('');
        $('#encryptedData').val('');
        if ($("#utilityMethods option:selected").val() == "AES") {
            $("#encrypt_btn").text('Encrypt', 'value').attr('title', 'Encrypt');
            $("#encryption_btns").show();
        } else if ($("#utilityMethods option:selected").val() == "MD5") {
            $("#encrypt_btn").text('Generate', 'value').attr('title', 'Generate');
            $("#encryption_btns").show();
        } else if ($("#utilityMethods option:selected").val() == "Base64") {
            $("#encrypt_btn").text('Encode', 'value').attr('title', 'Encode');
            $("#encryption_btns").show();
        } else {
            $("#encryption_btns").hide();
        }
    })

    //Encryption
    $scope.EncryptData = function() {
        //$("#encryptData").removeClass("inputErrorBorderFull");
        //$("#utilityMethods").removeClass("selectErrorBorder");
        if ($("#utilityMethods option:selected").val() == "Select Method") {
            $("#utilityMethods").css('border', '').addClass("selectErrorBorder");
            return false;
        } else if ($("#encryptData").val() == "") {
            $("#encryptData").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else {
            var methodSelected = $("#utilityMethods option:selected").val();
            var encryptionVal = $("#encryptData").val();

            utilityService.Encrypt(methodSelected, encryptionVal)
                .then(function(data) {
                    if (data == "Invalid Session") {
                        $rootScope.redirectPage();
                    } else if (data != "fail") {
                        $("#encryptedData").val(data);
                    } else {
                        console.log(data);
                    }
                }, function(error) {
                    console.log("Error")
                })
        }
    };

    function openDialog(title, body) {
        $("#globalModal").find('.modal-title').text(title);
        $("#globalModal").find('.modal-body p').text(body).css('color', 'black');
        $("#globalModal").modal("show");
        setTimeout(function() {
            $("#globalModal").find('.btn-default').focus();
        }, 300);
    }
}]);