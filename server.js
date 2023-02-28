//load environment variables
var env = require('node-env-file');
var fs = require('fs');
var envFilePath = __dirname + '/.env';
try {
	if (fs.existsSync(envFilePath)) {
		env(envFilePath);
	} else {
		console.error("Error occurred in loading ENVIRONMENT VARIABLES, .env file is missing! ");
	}
} catch (ex) {
	console.error("Error occurred in loading ENVIRONMENT VARIABLES");
	console.error(ex);
}


// Module Dependencies
var cluster = require('cluster');
var expressWinston = require('express-winston');
var dbAuthStore = require('./server/lib/dbAuthStore');
var epurl = "http://" + (process.env.DAS_IP || "127.0.0.1") + ":" + (process.env.DAS_PORT || "1990") + "/";
process.env.DAS_URL = epurl;
process.env.KEEP_ALIVE = 30000;  // Default TCP Keep-Alive Interval 30s
process.env.nulluser = "5fc137cc72142998e29b5e63";
process.env.nullpool = "5fc13ea772142998e29b5e64";
var logger = require('./logger');
var nginxEnabled = process.env.NGINX_ON.toLowerCase().trim() == "true";
let isTrialUser = false;
if (cluster.isMaster) {
	cluster.fork();
	cluster.on('disconnect', function(worker) {
		logger.error('Avo Assure server has encountered some problems, Disconnecting!');
	});
	cluster.on('message', function(worker, msg) {
		if (msg == "noRespawn") worker.noRespawn = true;
	});
	cluster.on('exit', function(worker) {
		if (worker.noRespawn !== true) {
			logger.error('Worker %d is killed!', worker.id);
			cluster.fork();
		}
	});
} else
{
	try {
		var express = require('express');
		var app = express();
		var bodyParser = require('body-parser');
		var sessions = require('express-session');
		var cookieParser = require('cookie-parser');
		var csrf = require('csurf')
		var helmet = require('helmet');
		var hpkp = require('hpkp');
		var lusca = require('lusca');
		var consts = require('constants');
		var redis = require("redis");
		var path = require('path');
		var Client = require("node-rest-client").Client;
		var apiclient = new Client();
		var redisStore = require('connect-redis')(sessions);
		var redisConfig = {
			"host": process.env.CACHEDB_IP,
			"port": parseInt(process.env.CACHEDB_PORT),
			"password": dbAuthStore.getCachedbAuth()
		};
		var redisSessionClient = redis.createClient(redisConfig);
		redisSessionClient.on("error", err => {
			if (err.code == "NOAUTH" || err.message == "ERR invalid password") {
				logger.error("Invalid Cache Database Credentials");
				cluster.worker.send("noRespawn");
				cluster.worker.kill();
			}
			else logger.error("Please run the Cache DB");
			// throw "Invalid Cache Database credentials";
		});
		redisSessionClient.on("connect", function(err) {
			logger.debug("Cache DB connected");
		});
		var rsStore = new redisStore({
			client: redisSessionClient
		});
		rsStore.pDestroy =  async (sid) => (new Promise((rsv, rej) => rsStore.destroy(sid, (e,d) => ((e)? rej(e):rsv(d)))));
		rsStore.pAll =  async () => (new Promise((rsv, rej) => rsStore.all((e,d) => ((e)? rej(e):rsv(d)))));

		//HTTPS Configuration
		var uiConfig = require('./server/config/options');
		var certificate = uiConfig.certificate.cert;
		var privateKey = uiConfig.certificate.key;
		var credentials = {
			key: privateKey,
			cert: certificate,
			secureOptions: consts.SSL_OP_NO_SSLv2 | consts.SSL_OP_NO_SSLv3 | consts.SSL_OP_NO_TLSv1 | consts.SSL_OP_NO_TLSv1_1,
			minVersion: "TLSv1.2",
			maxVersion: "TLSv1.2",
			ciphers: ["ECDHE-RSA-AES256-SHA384", "DHE-RSA-AES256-SHA384", "ECDHE-RSA-AES256-SHA256", "DHE-RSA-AES256-SHA256", "ECDHE-RSA-AES128-SHA256", "DHE-RSA-AES128-SHA256", "HIGH", "!aNULL", "!eNULL", "!EXPORT", "!DES", "!RC4", "!MD5", "!PSK", "!SRP", "!CAMELLIA"].join(':'),
			honorCipherOrder: true
		};
		// CORS and security headers
		app.all('*', function(req, res, next) {
			const origin =  req.headers["origin"] || req.hostname;
			res.setHeader('Access-Control-Allow-Origin', origin);
			res.setHeader('Access-Control-Allow-Credentials', true);
			res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Content-Type, Upgrade-Insecure-Requests');
			res.setHeader('X-Frame-Options', 'SAMEORIGIN');
			next();
		});
		var httpsServer = require('https').createServer(credentials, app);
		var serverPort = process.env.SERVER_PORT || 8443;
		module.exports = app;
		module.exports.rsStore = rsStore;
		module.exports.httpsServer = httpsServer;
		var io = require('./server/lib/socket');

		//Caching static files for thirtyDays 
		var thirtyDays = 2592000; // in milliseconds
		app.use(express.static(__dirname + "/public/", { maxage: thirtyDays, index: false }));

		//serve all asset files from necessary directories
		app.use("/neuronGraphs", express.static(__dirname + "/public/neurongraphs"));
		app.post('/designTestCase', (req, res) => res.sendFile("index.html", { root: __dirname + "/public/" }));

		app.use(bodyParser.json({
			limit: '50mb'
		}));

		app.use(bodyParser.urlencoded({
			limit: '50mb',
			extended: true
		}));

		if (process.env.EXPRESSLOGS.toLowerCase() != 'on') logger.info("Express logs are disabled");
		else {
			app.use(expressWinston.logger({
				winstonInstance: logger,
				requestWhitelist: ['url'],
				colorize: true
			}));
		}

		process.env.SESSION_AGE = 30 * 60 * 1000;

		app.use(cookieParser("$^%EDE%^tfd65e7ufyCYDR^%IU"));
		app.use(sessions({
			cookie: {
				path: '/',
				httpOnly: true,
				secure: true,
				maxAge: parseInt(process.env.SESSION_AGE),
				sameSite: 'lax'
			},
			resave: false,
			rolling: true,
			saveUninitialized: false, //Should always be false for cookie to clear
			secret: '$^%EDE%^tfd65e7ufyCYDR^%IU',
			store: rsStore
		}));

		app.use('*', function(req, res, next) {
			if (req.session === undefined) {
				return next(new Error("cachedbnotavailable"));
			}
			return next();
		});

		app.use(function(req, res, next) {
			req.clearSession = function clearSession() {
				res.clearCookie('connect.sid');
				res.clearCookie('maintain.sid');
				req.session.destroy();
			};
			next();
		});

		app.use((req, res, next) => {
			const utils = require('./server/lib/utils');
			const admin = require('./server/controllers/admin');
			const create_ice = require('./server/controllers/create_ice');
			const design = require('./server/controllers/design');
			const flowGraph = require('./server/controllers/flowGraph');
			const mindmap = require('./server/controllers/mindmap');
			const pdintegration = require('./server/controllers/pdintegration');
			const qtest = require('./server/controllers/qtest');
			const qualityCenter = require('./server/controllers/qualityCenter');
			const report = require('./server/controllers/report');
			const zephyr = require('./server/controllers/zephyr');
			const executionInvoker = require('./server/lib/execution/executionInvoker');
			req.session.executionInvoker = executionInvoker.setReq(req)
			req.session.zephyr = zephyr.setReq(req)
			req.session.report = report.setReq(req)
			req.session.qualityCenter = qualityCenter.setReq(req)
			req.session.qtest = qtest.setReq(req)
			req.session.pdintegration = pdintegration.setReq(req)
			req.session.mindmap = mindmap.setReq(req)
			req.session.flowGraph = flowGraph.setReq(req)
			req.session.design = design.setReq(req)
			req.session.create_ice = create_ice.setReq(req)
			req.session.utils = utils.setReq(req)
			req.session.admin = admin.setReq(req)
			next();	
		});

		// For Selecting Authentication Strategy and adding required routes
		const authlib = require("./server/lib/auth");
		const authconf = authlib();
		const auth = authconf.auth;
		app.use(authconf.router);
		var queue = require("./server/lib/execution/executionQueue")
		queue.Execution_Queue.queue_init()
		const notf = require("./server/notifications");
		notf.initalize();
		var scheduler = require('./server/lib/execution/scheduler')

		//Based on NGINX Config Security Headers are configured
		if (!nginxEnabled) {
			app.use(helmet());
			app.use(lusca.p3p('/w3c/p3p.xml", CP="IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT'));
			app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
			var ninetyDaysInSeconds = 7776000;
			app.use(hpkp({
				maxAge: ninetyDaysInSeconds,
				sha256s: ['base64+primary==', 'base64+backup==']
			}));
			app.use(helmet.contentSecurityPolicy({
				directives: {
					imgSrc: ["'self'", 'data:'],
					//   fontSrc: ["'self'"],
					objectSrc: ["'none'"],
					mediaSrc: ["'self'"],
					frameSrc: ["data:"]
				}
			}));
			// app.use(helmet.noCache());
		}

		var suite = require('./server/controllers/suite');
		var report = require('./server/controllers/report');
    var plugin = require('./server/controllers/plugin');

		// No CSRF token
		app.post('/ExecuteTestSuite_ICE_SVN', suite.ExecuteTestSuite_ICE_API);
		app.post('/getReport_API', report.getReport_API);
		app.post('/getAccessibilityReports_API', report.getAccessibilityReports_API);
		app.post('/getExecution_metrics_API', report.getExecution_metrics_API);
		app.post('/ICE_provisioning_register', io.registerICE);
		app.post('/openScreenShot_API', report.openScreenShot_API);
		app.post('/getExecScenario', suite.getExecScenario);
		app.post('/execAutomation',suite.execAutomation);
		app.post('/getAgentTask',suite.getAgentTask);
		app.post('/setExecStatus',suite.setExecStatus);
		app.post('/getGeniusData',plugin.getGeniusData);
		app.use(csrf({
			cookie: true
		}));

		app.all('*', function(req, res, next) {
			res.cookie('XSRF-TOKEN', req.csrfToken(), {httpOnly: false, sameSite:true, secure: true})
			next();
		});

		app.get('/error', function(req, res, next) {
			var emsg = req.query.e;
			var errsess = (req.session.messages) ? req.session.messages[0] : undefined;
			if (emsg) {
				if (errsess) emsg = (errsess.indexOf("access_denied") != -1) ? "unauthorized" : errsess;
				else if (emsg == "400") emsg = "badrequest";
				else if (emsg == "401") emsg = "Invalid Session";
				else if (emsg == "403") emsg = "unauthorized";
				else if (emsg == "sessexists") {
					emsg = "userLogged";
					req.session.dndSess = true;
				}
				req.session.emsg = emsg;
			}
			res.redirect('/');
		});

		app.get('/', async (req, res, next) => {
			if (!(req.url == '/' || req.url.startsWith("/?"))) return next();
			return res.sendFile("index.html", { root: __dirname + "/public/" });
		});

		// Dummy Service for keeping session alive during long-term execution, etc. #Polling
		app.post('/keepSessionAlive', function(req, res, next) { res.end(); });

		//Only Admin have access
		app.get('/admin', function(req, res) {
			var roles = ["Admin"]; //Allowed roles
			sessionCheck(req, res, roles);
		});

		//Only Test Engineer and Test Lead have access
		app.get(/^\/(scrape|design|designTestCase|execute|scheduling|settings)$/, function(req, res) {
			var roles = ["Test Lead", "Test Engineer", "Test Manager"]; //Allowed roles
			sessionCheck(req, res, roles);
		});

		//Test Engineer,Test Lead and Test Manager can access
		app.get(/^\/(mindmap|utility|plugin|seleniumtoavo|settings|genius)$/, function(req, res) {
			var roles = ["Test Manager", "Test Lead", "Test Engineer"]; //Allowed roles
			sessionCheck(req, res, roles);
		});

		//Test Lead and Test Manager can access
		app.get(/^\/(webocular|neuronGraphs\/|integration)$/, function(req, res) {
			var roles = ["Test Manager", "Test Lead"]; //Allowed roles
			sessionCheck(req, res, roles);
		});

		app.get(/^\/(verify|reset|expiry)$/, async (req, res, next) => {
			return res.sendFile("index.html", { root: __dirname + "/public/" });
		});

		function sessionCheck(req, res, roles) {
			logger.info("Inside sessioncheck for URL : %s", req.url);
			var sess = req.session;
			logger.rewriters[0] = function(level, msg, meta) {
				meta.username = (sess && sess.username) ? sess.username : null;
				meta.userid = (sess && sess.userid) ? sess.userid : null;
				meta.userip = req.headers['client-ip'] != undefined ? req.headers['client-ip'] : req.ip;
				return meta;
			};
			var public = __dirname + "/public/";
			if (req.url === "/neuronGraphs/") public += "neurongraphs/";
			var sessChk = sess.uniqueId && sess.activeRole;
			var roleChk = (roles.indexOf(sess.activeRole) != -1);
			var maintCookie = req.signedCookies["maintain.sid"];
			if (sessChk && !maintCookie) return res.redirect("/error?e=sessexists");
			if (sessChk && roleChk) return res.sendFile("index.html", { root: public });
			else {
				req.clearSession();
				return res.redirect("/error?e=" + ((sessChk) ? "403" : "401"));
			}
		}

		app.get('/downloadICE', async (req, res) => {								
			let clientVer = String(req.query.ver);
			let iceFile = uiConfig.avoClientConfig[clientVer];
			if (req.query.file == "getICE") {
				return res.download(path.resolve(iceFile),"AvoAssureClient"+(req.query.fileName?(req.query.fileName):"")+"."+iceFile.split(".").pop())
			} else {
				let status = "na";
				try {
					let stats = await fs.promises.stat(path.resolve(iceFile))
					// await fs.promises.access(path.resolve(iceFile));
					if(stats.isFile()){
						status = "available";
					}else {
						console.error("Error Occurred in fetching Avo Client")
					}
				} catch (error) {
					console.error("Catch: Error Occurred in fetching Avo Client")
				}
				return res.send({status});
			}
		});

		app.get('/downloadAgent', async (req, res) => {
			try {
				let agentFile = uiConfig.avoAgentConfig;
				return res.download(path.resolve(agentFile),"AvoAgent."+agentFile.split(".").pop())
			}
			catch (error) {
				console.error("Catch: Error Occurred in fetching Avo Agent");
			}
		});

		app.get('/getClientConfig', (req,res) => {
			return res.send({"avoClientConfig":uiConfig.avoClientConfig,"trainingLinks": uiConfig.trainingLinks,"geniusTrialUrl":uiConfig.sampleAvoGeniusUrl,"customerSupportEmail":uiConfig.customerSupportEmail,"videoTrialUrl":uiConfig.videoTrialUrl})
		});

		app.get('/External_Plugin_URL', async (req, res) => {
			const pluginName = req.query.pluginName;
			const pluginURL = uiConfig.externalPluginURL[pluginName];
			
			try{
				return res.send(pluginURL);
			}
			catch(err){
				console.error("external plugin doesn't exist");
			}
		});

    app.get('/getLicenseInfo', (req,res) => {
      return res.send({isTrialUser})
    })

	app.get('/getServiceBell', (req,res) => {
		const enableServiceBell = uiConfig.enableServiceBell;
		return res.send({enableServiceBell})
    })

	app.get('/getServiceBellSecretKey', (req,res) => {
		const SERVICEBELL_IDENTITY_SECRET_KEY = uiConfig.SERVICEBELL_IDENTITY_SECRET_KEY;
		return res.send({SERVICEBELL_IDENTITY_SECRET_KEY})
    })
		//Route Directories
		var mindmap = require('./server/controllers/mindmap');
		var pdintegration = require('./server/controllers/pdintegration');
		var login = require('./server/controllers/login');
		var admin = require('./server/controllers/admin');
		var design = require('./server/controllers/design');
		var designscreen = require('./server/controllers/designscreen');
		var utility = require('./server/controllers/utility');
		var qc = require('./server/controllers/qualityCenter');
		var qtest = require('./server/controllers/qtest');
		var zephyr = require('./server/controllers/zephyr');
		var webocular = require('./server/controllers/webocular');
		var chatbot = require('./server/controllers/chatbot');
		var neuronGraphs2D = require('./server/controllers/neuronGraphs2D');
		var taskbuilder = require('./server/controllers/taskJson');
		var flowGraph = require('./server/controllers/flowGraph');
		var devOps = require('./server/controllers/devOps');

		//-------------Route Mapping-------------//
		// Mindmap Routes
		app.post('/getProjectsNeo', (req, res) => (res.send("false")));
		app.post('/populateProjects', auth.protect, mindmap.populateProjects);
		app.post('/populateUsers', auth.protect, mindmap.populateUsers);
		app.post('/getProjectTypeMM', auth.protect, mindmap.getProjectTypeMM);
		app.post('/populateScenarios', auth.protect, mindmap.populateScenarios);
		app.post('/getModules', auth.protect, mindmap.getModules);
		app.post('/reviewTask', auth.protect, mindmap.reviewTask);
		app.post('/saveData', auth.protect, mindmap.saveData);
		app.post('/saveEndtoEndData', auth.protect, mindmap.saveEndtoEndData);
		app.post('/excelToMindmap', auth.protect, mindmap.excelToMindmap);
		app.post('/getScreens', auth.protect, mindmap.getScreens);
		app.post('/exportToExcel', auth.protect, mindmap.exportToExcel);
		app.post('/exportMindmap', auth.protect, mindmap.exportMindmap);
		app.post('/importMindmap', auth.protect, mindmap.importMindmap);
		app.post('/gitToMindmap', auth.protect, mindmap.gitToMindmap);
		app.post('/pdProcess', auth.protect, pdintegration.pdProcess);	// process discovery service
		app.post('/exportToGit', auth.protect, mindmap.exportToGit);
		app.post('/importGitMindmap', auth.protect, mindmap.importGitMindmap);
		app.post('/deleteScenario', auth.protect, mindmap.deleteScenario);
		app.post('/deleteScenarioETE', auth.protect, mindmap.deleteScenarioETE);
		app.post('/exportToProject', auth.protect, mindmap.exportToProject);
		//Login Routes
		app.post('/checkUser', authlib.checkUser);
		app.post('/validateUserState', authlib.validateUserState);
		app.post('/forgotPasswordEmail', authlib.forgotPasswordEmail);
		app.post('/unlockAccountEmail', authlib.unlockAccountEmail);
		app.post('/unlock', authlib.unlock);
		app.post('/verifyUser',authlib.verifyUser);
    app.post('/checkForgotExpiry',authlib.checkForgotExpiry);
		app.post('/loadUserInfo', auth.protect, login.loadUserInfo);
		app.post('/getRoleNameByRoleId', auth.protect, login.getRoleNameByRoleId);
		app.post('/logoutUser', login.logoutUser);
		app.post('/resetPassword', login.resetPassword);
		app.post('/updatePassword', login.updatePassword);
		app.post('/storeUserDetails', auth.protect, login.storeUserDetails);
		//Admin Routes
		app.post('/getUserRoles', auth.protect, admin.getUserRoles);
		app.post('/getDomains_ICE', auth.protect, admin.getDomains_ICE);
		app.post('/createProject_ICE', auth.protect, admin.createProject_ICE);
		app.post('/updateProject_ICE', auth.protect, admin.updateProject_ICE);
		app.post('/getNames_ICE', auth.protect, admin.getNames_ICE);
		app.post('/getDetails_ICE', auth.protect, admin.getDetails_ICE);
		app.post('/assignProjects_ICE', auth.protect, admin.assignProjects_ICE);
		app.post('/getAssignedProjects_ICE', auth.protect, admin.getAssignedProjects_ICE);
		app.post('/getAvailablePlugins', auth.protect, admin.getAvailablePlugins);
		app.post('/manageSessionData', auth.protect, admin.adminPrivilegeCheck, admin.manageSessionData);
		app.post('/unlockUser', auth.protect, admin.unlockUser);
		app.post('/manageUserDetails', auth.protect, admin.adminPrivilegeCheck, admin.manageUserDetails);
		app.post('/getUserDetails', auth.protect, admin.getUserDetails);
		app.post('/fetchLockedUsers', auth.protect, admin.fetchLockedUsers);
		app.post('/testLDAPConnection', auth.protect, admin.testLDAPConnection);
		app.post('/getLDAPConfig', auth.protect, admin.getLDAPConfig);
		app.post('/manageLDAPConfig', auth.protect, admin.manageLDAPConfig);
		app.post('/getSAMLConfig', auth.protect, admin.getSAMLConfig);
		app.post('/manageSAMLConfig', auth.protect, admin.manageSAMLConfig);
		app.post('/getOIDCConfig', auth.protect, admin.getOIDCConfig);
		app.post('/manageOIDCConfig', auth.protect, admin.manageOIDCConfig);
		app.post('/getCIUsersDetails', auth.protect, admin.getCIUsersDetails);
		app.post('/manageCIUsers', auth.protect, admin.adminPrivilegeCheck, admin.manageCIUsers);
		app.post('/getPreferences', auth.protect, admin.getPreferences);
		app.post('/provisionIce', auth.protect, admin.adminPrivilegeCheck, admin.provisionICE);
		app.post('/fetchICE', auth.protect, admin.fetchICE);
		app.post('/getAvailable_ICE', auth.protect, admin.getAvailable_ICE);
		app.post('/getICEinPools', auth.protect, admin.getICEinPools);
		app.post('/deleteICE_pools', auth.protect, admin.deletePools);
		app.post('/getPools', auth.protect, admin.getPools);
		app.post('/updatePool', auth.protect, admin.updatePool);
		app.post('/createPool_ICE', auth.protect, admin.createPool_ICE);
		app.post('/clearQueue', auth.protect, admin.clearQueue);
		app.post('/exportProject', auth.protect, admin.exportProject);
		app.post('/restartService', auth.protect, admin.restartService);
		app.post('/gitSaveConfig', auth.protect, admin.adminPrivilegeCheck, admin.gitSaveConfig);
		app.post('/gitEditConfig', auth.protect, admin.gitEditConfig);
		app.post('/getDetails_JIRA', auth.protect, admin.getDetails_JIRA);
		app.post('/manageJiraDetails', auth.protect, admin.manageJiraDetails);
		app.post('/getDetails_Zephyr', auth.protect, admin.getDetails_Zephyr);
		app.post('/manageZephyrDetails', auth.protect, admin.manageZephyrDetails);
		app.post('/avoDiscoverMap', auth.protect, admin.avoDiscoverMap);
		app.post('/avoDiscoverReset', auth.protect, admin.avoDiscoverReset);
		app.post('/fetchAvoDiscoverMap', auth.protect, admin.fetchAvoDiscoverMap);

		//Notification Routes
		app.post('/testNotificationChannels', auth.protect, admin.testNotificationChannels);
		app.post('/manageNotificationChannels', auth.protect, admin.manageNotificationChannels);
		app.post('/getNotificationChannels', auth.protect, admin.getNotificationChannels);
		app.post('/getNotificationGroups', auth.protect, admin.getNotificationGroups);
		app.post('/updateNotificationGroups', auth.protect, admin.updateNotificationGroups);
		app.post('/updateNotificationConfiguration', auth.protect, mindmap.updateNotificationConfiguration);
		app.post('/getNotificationConfiguration', auth.protect, mindmap.getNotificationConfiguration);
		app.post('/getNotificationRules', auth.protect, mindmap.getNotificationRules);

		//Design Screen Routes
		app.post('/initScraping_ICE', auth.protect, designscreen.initScraping_ICE);
		app.post('/highlightScrapElement_ICE', auth.protect, designscreen.highlightScrapElement_ICE);
		app.post('/getScrapeDataScreenLevel_ICE', auth.protect, designscreen.getScrapeDataScreenLevel_ICE);
		app.post('/updateScreen_ICE', auth.protect, designscreen.updateScreen_ICE);
		app.post('/updateIrisDataset', auth.protect, designscreen.updateIrisDataset);
		app.post('/userObjectElement_ICE', auth.protect, designscreen.userObjectElement_ICE);
		app.post('/exportScreenToExcel', auth.protect, designscreen.exportScreenToExcel);
		app.post('/importScreenfromExcel', auth.protect, designscreen.importScreenfromExcel);
		app.post('/fetchReplacedKeywords_ICE', auth.protect, designscreen.fetchReplacedKeywords_ICE);
		
		//Design TestCase Routes
		app.post('/readTestCase_ICE', auth.protect, design.readTestCase_ICE);
		app.post('/updateTestCase_ICE', auth.protect, design.updateTestCase_ICE);
		app.post('/debugTestCase_ICE', auth.protect, design.debugTestCase_ICE);
		app.post('/getKeywordDetails_ICE', auth.protect, design.getKeywordDetails_ICE);
		app.post('/getTestcasesByScenarioId_ICE', auth.protect, design.getTestcasesByScenarioId_ICE);
		//Webservices APIs
		app.post('/execRequest', auth.protect, design.executeRequest);
		app.post('/oauth2', auth.protect, design.oAuth2auth);
		app.get('/oauth2/callback', auth.protect, design.oAuth2Callback);
		//Execute Screen Routes
		app.post('/readTestSuite_ICE', auth.protect, suite.readTestSuite_ICE);
		app.post('/updateTestSuite_ICE', auth.protect, suite.updateTestSuite_ICE);
		app.post('/getTestcaseDetailsForScenario_ICE', auth.protect, suite.getTestcaseDetailsForScenario_ICE);
		app.post('/ExecuteTestSuite_ICE', auth.protect, suite.ExecuteTestSuite_ICE);
		app.post('/getICE_list', auth.protect, suite.getICE_list);
		//Scheduling Screen Routes
		app.post('/testSuitesScheduler_ICE', auth.protect, suite.testSuitesScheduler_ICE);
		app.post('/testSuitesSchedulerRecurring_ICE', auth.protect, suite.testSuitesSchedulerRecurring_ICE);
		app.post('/getScheduledDetails_ICE', auth.protect, suite.getScheduledDetails_ICE);
		app.post('/getScheduledDetailsOnDate_ICE', auth.protect, suite.getScheduledDetailsOnDate_ICE);
		app.post('/cancelScheduledJob_ICE', auth.protect, suite.cancelScheduledJob_ICE);
		//Report Screen Routes
		app.post('/connectJira_ICE', auth.protect, report.connectJira_ICE);
		app.post('/openScreenShot', auth.protect, report.openScreenShot);
		app.post('/viewJiraMappedList_ICE', auth.protect, report.viewJiraMappedList_ICE);
		app.post('/saveJiraDetails_ICE', auth.protect, report.saveJiraDetails_ICE);
		app.post('/getAvoDetails', auth.protect, report.getAvoDetails);
		//Plugin Routes
		app.post('/userCreateProject_ICE', auth.protect, plugin.userCreateProject_ICE);
        app.post('/userUpdateProject_ICE', auth.protect, plugin.userUpdateProject_ICE);
        app.post('/getUsers_ICE', auth.protect, plugin.getUsers_ICE)
		app.post('/getProjectIDs', auth.protect, plugin.getProjectIDs);
		app.post('/getTaskJson_mindmaps', auth.protect, taskbuilder.getTaskJson_mindmaps);
		app.post('/updateTaskstatus_mindmaps', auth.protect, taskbuilder.updateTaskstatus_mindmaps);
		//Discover Plugin Routes
		app.get('/getMappedDiscoverUser', auth.protect, pdintegration.getMappedDiscoverUser);
		//Utility plugins
		app.post('/Encrypt_ICE', auth.protect, utility.Encrypt_ICE);
		app.post('/getExecution_metrics', auth.protect, report.getExecution_metrics);
		app.post('/manageDataTable', auth.protect, utility.manageDataTable);
		app.post('/getDatatableDetails', auth.protect, utility.getDatatableDetails);
		app.post('/importDtFromExcel', auth.protect, utility.importDtFromExcel);
		app.post('/importDtFromCSV', auth.protect, utility.importDtFromCSV);
		app.post('/importDtFromXML', auth.protect, utility.importDtFromXML);
		app.post('/exportToDtExcel', auth.protect, utility.exportToDtExcel);
		app.post('/exportToDtCSV', auth.protect, utility.exportToDtCSV);
		app.post('/exportToDtXML', auth.protect, utility.exportToDtXML);
		// Wecoccular Plugin
		app.post('/crawlResults', auth.protect, webocular.getCrawlResults);
		app.post('/saveResults', auth.protect, webocular.saveResults);
		//Accessibility Testing routes
		app.post('/updateAccessibilitySelection', auth.protect, plugin.updateAccessibilitySelection);	
		//Chatbot Routes
		app.post('/getTopMatches_ProfJ', auth.protect, chatbot.getTopMatches_ProfJ);
		app.post('/updateFrequency_ProfJ', auth.protect, chatbot.updateFrequency_ProfJ);
		//NeuronGraphs Plugin Routes
		app.post('/getGraph_nGraphs2D', auth.protect, neuronGraphs2D.getGraphData);
		app.post('/getReport_NG', auth.protect, neuronGraphs2D.getReportNG);
		app.post('/getReportExecutionStatus_NG', auth.protect, neuronGraphs2D.getReportExecutionStatusNG);
		//QC Plugin
		app.post('/loginQCServer_ICE', auth.protect, qc.loginQCServer_ICE);
		app.post('/qcProjectDetails_ICE', auth.protect, qc.qcProjectDetails_ICE);
		app.post('/qcFolderDetails_ICE', auth.protect, qc.qcFolderDetails_ICE);
		app.post('/saveQcDetails_ICE', auth.protect, qc.saveQcDetails_ICE);
		app.post('/saveUnsyncDetails', auth.protect, qc.saveUnsyncDetails);
		app.post('/viewQcMappedList_ICE', auth.protect, qc.viewQcMappedList_ICE);
		//qTest Plugin
		app.post('/loginToQTest_ICE', auth.protect, qtest.loginToQTest_ICE);
		app.post('/qtestProjectDetails_ICE', auth.protect, qtest.qtestProjectDetails_ICE);
		app.post('/qtestFolderDetails_ICE', auth.protect, qtest.qtestFolderDetails_ICE);
		app.post('/saveQtestDetails_ICE', auth.protect, qtest.saveQtestDetails_ICE);
		app.post('/viewQtestMappedList_ICE', auth.protect, qtest.viewQtestMappedList_ICE);	
		//Zephyr Plugin
		app.post('/loginToZephyr_ICE', auth.protect, zephyr.loginToZephyr_ICE);
		app.post('/zephyrProjectDetails_ICE', auth.protect, zephyr.zephyrProjectDetails_ICE);
		app.post('/zephyrCyclePhase_ICE', auth.protect, zephyr.zephyrCyclePhase_ICE);
		app.post('/zephyrMappedCyclePhase', auth.protect, zephyr.zephyrMappedCyclePhase);
		app.post('/zephyrTestcaseDetails_ICE', auth.protect, zephyr.zephyrTestcaseDetails_ICE);
		app.post('/zephyrMappedTestcaseDetails_ICE', auth.protect, zephyr.zephyrMappedTestcaseDetails_ICE);
		app.post('/saveZephyrDetails_ICE', auth.protect, zephyr.saveZephyrDetails_ICE);
		app.post('/viewZephyrMappedList_ICE', auth.protect, zephyr.viewZephyrMappedList_ICE);	
		app.post('/zephyrUpdateMapping', auth.protect, zephyr.zephyrUpdateMapping);	
		app.post('/excelToZephyrMappings', auth.protect, zephyr.excelToZephyrMappings);
		//app.post('/manualTestcaseDetails_ICE', auth.protect, qc.manualTestcaseDetails_ICE);
		// Automated Path Generator Routes
		app.post('/flowGraphResults', auth.protect, flowGraph.flowGraphResults);
		app.post('/APG_OpenFileInEditor', auth.protect, flowGraph.APG_OpenFileInEditor);
		app.post('/APG_createAPGProject', auth.protect, flowGraph.APG_createAPGProject);
		app.post('/APG_runDeadcodeIdentifier', auth.protect, flowGraph.APG_runDeadcodeIdentifier);
		app.post('/getUserICE', auth.protect, io.getUserICE)
		app.post('/setDefaultUserICE', auth.protect, io.setDefaultUserICE);

		// Devops Routes
		// app.post('/fetchProjects', auth.protect, devOps.fetchProjects);
		app.post('/getConfigureList', auth.protect, devOps.getConfigureList);
		app.post('/getAvoAgentAndAvoGridList', auth.protect, devOps.getAvoAgentAndAvoGridList);
		app.post('/fetchModules', auth.protect, devOps.fetchModules);
		app.post('/storeConfigureKey', auth.protect, devOps.storeConfigureKey);
		app.post('/fetchProjects', auth.protect, devOps.getAllSuites_ICE);
		app.post('/deleteConfigureKey', auth.protect, devOps.deleteConfigureKey);
		app.post('/saveAvoAgent', auth.protect, devOps.saveAvoAgent);
		app.post('/saveAvoGrid', auth.protect, devOps.saveAvoGrid);
		app.post('/deleteAvoGrid', auth.protect, devOps.deleteAvoGrid);
		app.get('/getQueueState', auth.protect, suite.getQueueState);
		app.post('/deleteExecutionListId', auth.protect, suite.deleteExecutionListId);



		//-------------Route Mapping-------------//
		// app.post('/fetchModules', auth.protect, devOps.fetchModules);

		// To prevent can't send header response
		app.use(function(req, res, next) {
			var _send = res.send;
			var sent = false;
			res.send = function(data) {
				if (sent) return;
				_send.bind(res)(data);
				sent = true;
			};
			next();
		});

		// To catch unknown routes
		app.get('*', function(req, res) {
			res.status(404).send("<html><body><p>The page could not be found or you don't have permission to view it.</p></body></html>");
		});

		// To catch all errors
		app.use(function(err, req, res, next) {
			if (err.code == "EBADCSRFTOKEN") return res.status(400).send("Bad Request!");
			var ecode = "601";
			var emsg = err.message;
			if (err.message == "cachedbnotavailable") {
				ecode = "600";
				emsg = "Cache Database unavailable";
			}
			logger.error(emsg);
			res.status(500).send("<html><body><p>[ECODE " + ecode + "] Internal Server Error Occurred!</p></body></html>");
		});

		//-------------SERVER START------------//
		var hostFamilyType = (nginxEnabled) ? '127.0.0.1' : '0.0.0.0';
		httpsServer.listen(serverPort, hostFamilyType); //Https Server
		try {
			var apireq = apiclient.post(epurl + "server", function(data, response) {
				try {
					if (response.statusCode != 200 || !data || data.toString() === "fail") {
						httpsServer.close();
						logger.error("Please run the Service API and Restart the Server");
					} else {
            isTrialUser = JSON.parse(data.toString()).isTrial
						scheduler.reScheduleTestsuite();
						scheduler.reScheduleRecurringTestsuite();
						console.info("Avo Assure Server Ready...\n");
					}
				} catch (exception) {
					httpsServer.close();
					logger.error("Please run the Service API and Restart the Server");
				}
			});
			apireq.on('error', function(err) {
				httpsServer.close();
				logger.error("Please run the Service API and Restart the Server");
			});
		} catch (exception) {
			httpsServer.close();
			logger.error("Please run the Service API");
		}
		//-------------SERVER END------------//
	} catch (e) {
		logger.error(e);
		setTimeout(function() {
			cluster.worker.kill();
		}, 200);
	}
}