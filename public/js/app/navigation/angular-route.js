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
				templateUrl:	'partials/header.html'
			})
			.when('/footer',
			{
				templateUrl:	'partials/footer.html',
				controller:		'footerController'
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
			.when('/designTestScript', 
			{
				templateUrl: 'partials/designTestScript.html',
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
			.otherwise({redirectTo: '/'});
	
	//$locationProvider.html5Mode(true);      //to remove angular hash(#) in the url
	$locationProvider.html5Mode({	
		enabled: true,	requireBase: false
	});
});