/**
 * Angular Routes
 */
mySPA.config(function($routeProvider, $locationProvider,$provide) {
	$routeProvider
			.when('/',
			{
				templateUrl: 'partials/login.html',
				controller: 'loginController'
			})
			.when('/header',
			{
				templateUrl: 'partials/header.html'
			})
			.when('/chatbot', {
				templateUrl: 'partials/chatbot.html'
			})
			.when('/footer',
			{
				templateUrl: 'partials/footer.html',
				controller:	'footerController'
			})
			.when('/admin',
			{
				templateUrl: 'partials/adminMain.html',
				controller: 'adminController'
			})
			.when('/plugin',
			{
				templateUrl: 'partials/plugin.html',
				controller: 'pluginController'
			})
			.when('/design',
			{
				templateUrl: 'partials/design.html',
				controller: 'designController'
			})
			.when('/designTestCase',
			{
				templateUrl: 'partials/designTestCase.html',
				controller: 'designController'
			})
			.when('/execute',
			{
				templateUrl: 'partials/execution.html',
				controller: 'executionController'
			})
			.when('/scheduling',
			{
				templateUrl: 'partials/scheduling.html',
				controller: 'scheduleController'
			})
			.when('/p_Reports',
			{
			 	templateUrl: 'partials/Reports.html',
			 	controller: 'reportsController'
			})
			.when('/p_Utility',
			{
			 	templateUrl: 'partials/utility.html',
			 	controller: 'utilityController'
			})
			.when('/Reports',
			{
			 	controller: 'reportsController'
			})
			.when('/specificreports',{
				controller:	'reportsController'
			})
			.when('/home',
			{
			 	templateUrl: 'partials/home_mindmap.html',
			 	controller: 'mindmapController'
			})
			.when('/p_Webocular',{
				templateUrl: 'partials/webocular.html',
				controller: 'webocularController'
			})
			.when('/p_ALM',
			{
			 	templateUrl: 'partials/qualityCenter.html',
			 	controller: 'qcController'
			})
			.when('/neuronGraphs',
			{
			 	templateUrl: 'partials/neuronGraphs2D.html',
			 	controller: 'neuronGraphs2DController'
			})
			.when('/p_Dashboard',
			{
			 	templateUrl: 'partials/dashboard.html',
			 	controller: 'dashboardController'
			})
			.when('/:login',
			{
				templateUrl: 'partials/login.html',
				controller: 'loginController'
			})
			.otherwise({redirectTo: '/'});

		//$locationProvider.html5Mode(true);      //to remove angular hash(#) in the url
		$locationProvider.html5Mode({
			enabled: true,	requireBase: false
		});
	}).run(function($rootScope, $location, headerServices){
		$rootScope.redirectPage = function(){
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