/**
 * Angular Routes
 */
mySPA.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/login');
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'partials/login.html',
            controller: 'loginController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/controllers/login/loginController.js',
						'js/controllers/login/loginService.js'
                    ]);
                }]
            }
		})
		.state('plugin', {
            url: '/plugin',
            templateUrl: 'partials/plugin.html',
            controller: 'pluginController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/factories/socketFactory.js',
						'js/controllers/login/loginService.js',
						'js/controllers/header/headerController.js',
						'js/controllers/plugin/pluginController.js',
						'js/controllers/plugin/pluginService.js'
                    ]);
                }]
            }
		})
		.state('mindmap', {
            url: '/mindmap',
            templateUrl: 'partials/home_mindmap.html',
            controller: 'mindmapController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'css/bootstrap/bootstrap-datepicker.min.css',
						'js/factories/socketFactory.js',
						'js/plugins/bootstrap/bootstrap-datepicker.min.js',	
						//'js/plugins/jquery-ui.min.js',
						'js/plugins/d3.v3.min.js',						
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',
						'js/controllers/header/headerController.js',
						'js/controllers/mindmap/mindmapController.js',
						'js/controllers/mindmap/mindmapService.js'
                    ]);
                }]
            }
		})
		.state('admin', {
            url: '/admin',
            templateUrl: 'partials/adminMain.html',
            controller: 'adminController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/factories/socketFactory.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',						
						'js/controllers/header/headerController.js',
						'js/controllers/admin/adminController.js',
						'js/controllers/admin/adminService.js'
                    ]);
                }]
            }
		})
		.state('design', {
            url: '/design',
            templateUrl: 'partials/design.html',
            controller: 'designController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/factories/socketFactory.js',
						'js/plugins/jquery.jqGrid.min.js',
						'js/i18n/grid.locale-en.js',
						'js/plugins/jquery-ui.min.js',
						'js/plugins/dtree.m.scrapper.js',
						'js/plugins/jquery.tablednd.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',
						'js/controllers/header/headerController.js',
						'js/controllers/mindmap/mindmapService.js',						
						'js/controllers/design/designController.js',
						'js/controllers/design/designService.js'
                    ]);
                }]
            }
		})
		.state('designTestCase', {
            url: '/designTestCase',
            templateUrl: 'partials/designTestCase.html',
            controller: 'designController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/factories/socketFactory.js',
						'js/plugins/jquery.jqGrid.min.js',
						'js/i18n/grid.locale-en.js',
						'js/plugins/jquery-ui.min.js',
						'js/plugins/dtree.m.scrapper.js',
						'js/plugins/jquery.tablednd.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',
						'js/controllers/header/headerController.js',
						'js/controllers/mindmap/mindmapService.js',
						'js/controllers/design/designController.js',
						'js/controllers/design/designService.js'
                    ]);
                }]
            }
		})
		.state('execute', {
            url: '/execute',
            templateUrl: 'partials/execution.html',
            controller: 'executionController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/factories/socketFactory.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',
						'js/controllers/header/headerController.js',
						'js/controllers/mindmap/mindmapService.js',
						'js/controllers/execution/executionController.js',
						'js/controllers/execution/executionService.js'
                    ]);
                }]
            }
		})
		.state('webocular', {
            url: '/p_Webocular',
            templateUrl: 'partials/webocular.html',
            controller: 'webocularController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'css/bootstrap/bootstrap-slider.css',
						'js/factories/socketFactory.js',
						'js/plugins/bootstrap/bootstrap-slider.js',
						'js/plugins/d3.v3.min.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',						
						'js/controllers/header/headerController.js',
						'js/controllers/webocular/webocularController.js',
						'js/controllers/webocular/webocularService.js'
                    ]);
                }]
            }
		})
		.state('dashboard', {
            url: '/p_Dashboard',
            templateUrl: 'partials/dashboard.html',
            controller: 'dashboardController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/factories/socketFactory.js',
						'js/plugins/Chart.min.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',						
						'js/controllers/header/headerController.js',
						'js/controllers/dashboard/dashboardController.js',
						'js/controllers/dashboard/dashboardService.js'
                    ]);
                }]
            }
		})
		.state('alm', {
            url: '/p_ALM',
            templateUrl: 'partials/qualityCenter.html',
            controller: 'qcController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'css/css_QC/qcStyle.css',
						'js/factories/socketFactory.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',						
						'js/controllers/header/headerController.js',
						'js/controllers/qualityCenter/qcController.js',
						'js/controllers/qualityCenter/qcService.js'
                    ]);
                }]
            }
		})
		.state('utility', {
            url: '/p_Utility',
            templateUrl: 'partials/utility.html',
            controller: 'utilityController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/factories/socketFactory.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',						
						'js/controllers/header/headerController.js',
						'js/controllers/utility/utilityController.js',
						'js/controllers/utility/utilityService.js'
                    ]);
                }]
            }
		})
		.state('reports', {
            url: '/p_Reports',
            templateUrl: 'partials/reports.html',
            controller: 'reportsController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/factories/socketFactory.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',						
						'js/controllers/header/headerController.js',
						'js/controllers/Reports/reportsController.js',
						'js/controllers/Reports/reportService.js'
                    ]);
                }]
            }
		})
		.state('scheduling', {
            url: '/scheduling',
            templateUrl: 'partials/scheduling.html',
            controller: 'scheduleController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'css/bootstrap/bootstrap-datepicker.min.css',
						'css/bootstrap/bootstrap-timepicker.min.css',
						'js/factories/socketFactory.js',
						'js/plugins/bootstrap/bootstrap-datepicker.min.js',
						'js/plugins/bootstrap/bootstrap-timepicker.min.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',						
						'js/controllers/header/headerController.js',
						'js/controllers/scheduling/scheduleController.js',
						'js/controllers/scheduling/scheduleService.js'
                    ]);
                }]
            }
		})
		.state('neuronGraph', {
            url: '/neuronGraphs',
            templateUrl: 'partials/neuronGraphs2D.html',
            controller: 'neuronGraphs2DController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						//'js/plugins/libs_ng/TrackballControls.js',
						//'js/plugins/libs_ng/three.js',
						//'js/plugins/css3drenderer.min.js',
						'js/plugins/d3.v3.min.js',
						'js/plugins/three.min.js',
						'js/plugins/Tween.js',
						'js/plugins/trackballcontrols.min.js',
						'js/plugins/libs_ng/OrbitControls.js',
						'js/factories/socketFactory.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',												
						'js/controllers/header/headerController.js',
						'js/controllers/execution/executionService.js',
						'js/controllers/Reports/reportService.js',
						'js/controllers/neuronGraphs2D/neuronGraphs2DController.js',
						'js/controllers/neuronGraphs2D/neuronGraphs2DService.js'
                    ]);
                }]
            }
		})
}])
.run(function($rootScope, $location, headerServices){
	$rootScope.redirectPage = function(){
		unblockUI();
		var UserName = JSON.parse(window.localStorage['_UI']).username;
		headerServices.logoutUser_Nineteen68(UserName)
		.then(function(data){
			if(data == "Session Expired"){
				window.localStorage.clear();
				$location.path('/login');
			}
		}, function(error) {
			console.log("Failed to Logout");
		});
	}
});