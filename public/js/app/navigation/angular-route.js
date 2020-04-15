/**
 * Angular Routes
 */
mySPA.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('base', {
            url: '/',
            templateUrl: 'partials/base.html',
            controller: 'baseController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/directives/headerDirective.js',				
						'js/controllers/login/baseController.js',
						'js/controllers/login/loginService.js'
                    ]);
                }]
            }
		})
        .state('login', {
            url: '/login',
            templateUrl: 'partials/login.html',
            controller: 'loginController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/directives/headerDirective.js',	
						'js/controllers/login/loginController.js',
						'js/controllers/login/loginService.js',
						'js/controllers/admin/adminService.js'
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
						'js/directives/headerDirective.js',	
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
            templateUrl: 'partials/mindmap.html',
            controller: 'mindmapController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'css/bootstrap/bootstrap-datepicker.min.css',
						'js/directives/headerDirective.js',	
						'js/factories/socketFactory.js',
						'js/plugins/bootstrap/bootstrap-datepicker.min.js',	
						//'js/plugins/jquery-ui.min.js',
						'js/plugins/jquery.line.js',
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
		.state('apg', {
            url: '/p_APG',
            templateUrl: 'partials/flowGraph.html',
            controller: 'flowGraphController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/directives/headerDirective.js',	
						'js/factories/socketFactory.js',
						'js/plugins/apg/class-diagram.js',
						'js/plugins/apg/multiline-text.js',
						'js/plugins/apg/dagre-d3.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',												
						'js/controllers/header/headerController.js',
						'js/controllers/flowGraph/flowGraphController.js',
						'js/controllers/flowGraph/flowGraphService.js'
                    ]);
                }]
            }
		})
		.state('admin', {
            url: '/admin',
            templateUrl: 'partials/admin.html',
            controller: 'adminController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'css/bootstrap/bootstrap-datepicker.min.css',
						'css/bootstrap/bootstrap-timepicker.min.css',
						'js/plugins/bootstrap/bootstrap-datepicker.min.js',
						'js/plugins/bootstrap/bootstrap-timepicker.min.js',
						'js/directives/headerDirective.js',	
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
						'js/directives/headerDirective.js',	
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
						'js/directives/headerDirective.js',	
						'js/factories/socketFactory.js',
						'js/plugins/jquery.jqGrid.min.js',
						'js/i18n/grid.locale-en.js',
						'js/plugins/jquery-ui.min.js',
						'js/plugins/dtree.m.scrapper.js',
						'js/plugins/jquery.tablednd.js',
						'js/plugins/handlebar.js',
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
						'js/directives/headerDirective.js',	
						'js/plugins/handlebar.js',
						'js/factories/socketFactory.js',
						'js/controllers/chatbot/chatbotController.js',
						'js/controllers/chatbot/chatbotService.js',
						'js/controllers/login/loginService.js',
						'js/controllers/header/headerController.js',
						'js/controllers/mindmap/mindmapService.js',
						'js/controllers/execution/executionController.js',
						'js/controllers/execution/executionService.js',
						'js/controllers/design/designService.js'
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
						'js/directives/headerDirective.js',	
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
		.state('alm', {
            url: '/p_ALM',
            templateUrl: 'partials/qualityCenter.html',
            controller: 'qcController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
						'js/directives/headerDirective.js',	
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
						'js/directives/headerDirective.js',	
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
						'js/controllers/respHeader/respHeaderController.js',
						'js/controllers/respHeader/respHeaderServices.js',
						//'js/controllers/header/headerController.js',
						'js/controllers/mindmap/mindmapService.js',
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
						'js/directives/headerDirective.js',	
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
						'js/directives/headerDirective.js',	
						'js/plugins/d3.v3.min.js',
						//'js/plugins/three.min.js',
						'js/plugins/Tween.js',
						'js/plugins/trackballcontrols.min.js',
						//'js/plugins/libs_ng/OrbitControls.js',
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
		});
}])
.run(function($rootScope, $location, headerServices){
	$rootScope.redirectPage = function(){
		unblockUI();
		$(".btn-accept").click();
		$(".modal-backdrop.fade.in").remove();
		window.localStorage.clear();
		headerServices.logoutUser_Nineteen68()
		.then(function(data){
			$location.path('/');
		}, function(error) {
			console.error("Failed to logout user\nCause:", error);
		});
	};
	$rootScope.resetSession = {
		poll: function pollingCall() {
			headerServices.keepSessionAlive_Nineteen68()
			.then(function(data){
				console.debug("User Session Extended");
			}, function(error) {
				console.error("Failed to extend User Session.\nCause:", error);
			});
		},
		start: function startInterval() {
			this.poll();
			this.eventid = setInterval(function(pollCall){ pollCall(); }, 1200000, this.poll);
		},
		end: function endInterval() {
			clearInterval(this.eventid);
			this.poll();
		}
	};
});