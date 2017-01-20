mySPA.controller('designController', ['$scope', '$http', '$location', '$timeout', 'DesignServices', function($scope,$http,$location,$timeout,DesignServices) {
	$("body").css("background","#eee");
    $timeout(function(){
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
    }, 500)

    //Initiating Scraping
    $scope.initScraping = function(browserType){
        console.log("Scrapping Started::::::")
        var viewString = {}
        viewString.view = [{
            "id": "unamebean",
            "text": "",
            "tag": "input",
            "hiddentag": "No",
            "url": "https://nucleus.slkgroup.com:4450/OA_HTML/RF.jsp?function_id=28716&resp_id=…2G2B1m5nYepZW7sgGQGFA..&params=5j0bzUgs9j2gsy7f2IhOgr-7x5nWRx63YDVSeM1o2-M",
            "custname": "username_input",
            "tempId": 0,
            "xpath": "//*[@id=\"unamebean\"];unamebean;/html/body/span/div[2]/form/span[2]/div/div/div[1]/div/div[3]/table[2]/tbody/tr[2]/td[2]/span/table/tbody/tr[5]/td[2]/table/tbody/tr[2]/td[2]/table/tbody/tr/td[3]/input;null;null;null"
        }, {
            "id": "pwdbean",
            "text": "",
            "tag": "input",
            "hiddentag": "No",
            "url": "https://nucleus.slkgroup.com:4450/OA_HTML/RF.jsp?function_id=28716&resp_id=…2G2B1m5nYepZW7sgGQGFA..&params=5j0bzUgs9j2gsy7f2IhOgr-7x5nWRx63YDVSeM1o2-M",
            "custname": "password_input",
            "tempId": 1,
            "xpath": "//*[@id=\"pwdbean\"];pwdbean;/html/body/span/div[2]/form/span[2]/div/div/div[1]/div/div[3]/table[2]/tbody/tr[2]/td[2]/span/table/tbody/tr[5]/td[2]/table/tbody/tr[4]/td[2]/table/tbody/tr/td[3]/input;null;null;null"
        }, {
            "id": "SubmitButton",
            "text": "Login",
            "tag": "button",
            "hiddentag": "No",
            "custname": "Login",
            "url": "https://nucleus.slkgroup.com:4450/OA_HTML/RF.jsp?function_id=28716&resp_id=…2G2B1m5nYepZW7sgGQGFA..&params=5j0bzUgs9j2gsy7f2IhOgr-7x5nWRx63YDVSeM1o2-M",
            "tempId": 2,
            "xpath": "//*[@id=\"SubmitButton\"];SubmitButton;/html/body/span/div[2]/form/span[2]/div/div/div[1]/div/div[3]/table[2]/tbody/tr[2]/td[2]/span/table/tbody/tr[5]/td[2]/table/tbody/tr[6]/td[2]/button[1];null;null;null"
        }, {
            "id": "Cancel",
            "text": "Cancel",
            "tag": "button",
            "hiddentag": "No",
            "url": "https://nucleus.slkgroup.com:4450/OA_HTML/RF.jsp?function_id=28716&resp_id=…2G2B1m5nYepZW7sgGQGFA..&params=5j0bzUgs9j2gsy7f2IhOgr-7x5nWRx63YDVSeM1o2-M",
            "custname": "Cancel_button2",
            "tempId": 3,
            "xpath": "//*[@id=\"Cancel\"];Cancel;/html/body/span/div[2]/form/span[2]/div/div/div[1]/div/div[3]/table[2]/tbody/tr[2]/td[2]/span/table/tbody/tr[5]/td[2]/table/tbody/tr[6]/td[2]/button[2];null;null;null"
        }]
        $("#finalScrap").empty()
        $("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><input title='Select all' type='checkbox' class='checkStylebox'><a id='aScrapper'>Screen Fields </a><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
        var custname;
		var imgTag;
		var scrapTree = $("#finalScrap").children('#scrapTree');
		var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');
        for (var i = 0; i < viewString.view.length; i++) {
			var path = viewString.view[i].xpath;
			var ob = viewString.view[i];
			ob.tempId= i; 
			custname = ob.custname;
			var tag = ob.tag;
			//Add This after Anchor Tag in next line <input type='checkbox' name='selectAllListItems' />
			var li = "<li class='item' val="+ob.tempId+"><input type='checkbox' class='checkall' name='selectAllListItems' /><a><img class='tag-icon' src='imgs/ic_"+imgTag+"_32x32.png'/>"+custname+"</a></li>";
			angular.element(innerUL).append(li)
		}
        $(document).find('#scrapTree').scrapTree({
			multipleSelection : {
				//checkbox : checked,
				classes : [ '.item' ]
			},
			editable: true,
		});
    }
}]);