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
var epurl = "http://" + (process.env.DAS_IP || "127.0.0.1") + ":" + (process.env.DAS_PORT || "1990") + "/";
process.env.DAS_URL = epurl;
process.env.nulluser = "5fc137cc72142998e29b5e63";
process.env.nullpool = "5fc13ea772142998e29b5e64";
var logger = require('./logger');
var nginxEnabled = process.env.NGINX_ON.toLowerCase().trim() == "true";

if (cluster.isMaster) {
	cluster.fork();
	cluster.on('disconnect', function(worker) {
		logger.error('Avo Assure server has encountered some problems, Disconnecting!');
	});
	cluster.on('exit', function(worker) {
		if (worker.exitedAfterDisconnect !== true) {
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
			"password": process.env.CACHEDB_AUTH
		};
		var redisSessionClient = redis.createClient(redisConfig);
		redisSessionClient.on("error", function(err) {
			logger.error("Please run the Cache DB");
			//cluster.worker.disconnect().kill();
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
			// secureOptions: consts.SSL_OP_NO_SSLv2 | consts.SSL_OP_NO_SSLv3 | consts.SSL_OP_NO_TLSv1 | consts.SSL_OP_NO_TLSv1_1,
			secureOptions: consts.SSL_OP_NO_SSLv2 | consts.SSL_OP_NO_SSLv3,
			secureProtocol: 'SSLv23_method',
			ciphers: ["ECDHE-RSA-AES256-SHA384", "DHE-RSA-AES256-SHA384", "ECDHE-RSA-AES256-SHA256", "DHE-RSA-AES256-SHA256", "ECDHE-RSA-AES128-SHA256", "DHE-RSA-AES128-SHA256", "HIGH", "!aNULL", "!eNULL", "!EXPORT", "!DES", "!RC4", "!MD5", "!PSK", "!SRP", "!CAMELLIA"].join(':'),
			honorCipherOrder: true
		};
		var httpsServer = require('https').createServer(credentials, app);
		var serverPort = process.env.SERVER_PORT || 8443;
		module.exports = app;
		module.exports.rsStore = rsStore;
		module.exports.httpsServer = httpsServer;
		var io = require('./server/lib/socket');

		//Caching static files for thirtyDays 
		var thirtyDays = 2592000; // in milliseconds
		app.use(express.static(__dirname + "/public/", {
			maxage: thirtyDays
		}));

		//serve all asset files from necessary directories
		app.use('/partials', express.static(__dirname + "/public/partials"));
		app.use("/js", express.static(__dirname + "/public/js"));
		app.use("/imgs", express.static(__dirname + "/public/imgs"));
		app.use("/css", express.static(__dirname + "/public/css"));
		app.use("/fonts", express.static(__dirname + "/public/fonts"));
		app.use("/neuronGraphs", express.static(__dirname + "/public/neurongraphs"));

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
				maxAge: parseInt(process.env.SESSION_AGE)
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

		// For Selecting Authentication Strategy and adding required routes
		const utils = require("./server/lib/utils");
		const authlib = require("./server/lib/auth");
		const authconf = authlib();
		const auth = authconf.auth;
		app.use(authconf.router);
		var queue = require("./server/lib/executionQueue")
		queue.Execution_Queue.queue_init()
		const notf = require("./server/notifications");
		notf.initalize();

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
			//CORS
			app.all('*', function(req, res, next) {
				res.setHeader('Access-Control-Allow-Origin', req.hostname);
				res.header('Access-Control-Allow-Headers', 'X-Requested-With');
				next();
			});
			// app.use(helmet.noCache());
		}

		app.post('/restartService', function(req, res) {
			logger.info("Inside UI Service: restartService");
			var childProcess = require("child_process");
			var serverList = ["License Server", "DAS Server", "Web Server"];
			var svcNA = "service does not exist";
			var svcRun = "RUNNING";
			var svcRunPending = "START_PENDING";
			var svcStop = "STOPPED";
			var svcStopPending = "STOP_PENDING";
			var svc = req.body.id;
			var batFile = require.resolve("./assets/svc.bat");
			var execCmd = batFile + " ";
			try {
				if (svc == "query") {
					var svcStatus = [];
					childProcess.exec(execCmd + "0 QUERY", function(error, stdout, stderr) {
						if (stdout && stdout.indexOf(svcNA) == -1) svcStatus.push(true);
						else svcStatus.push(false);
						childProcess.exec(execCmd + "1 QUERY", function(error, stdout, stderr) {
							if (stdout && stdout.indexOf(svcNA) == -1) svcStatus.push(true);
							else svcStatus.push(false);
							childProcess.exec(execCmd + "2 QUERY", function(error, stdout, stderr) {
								if (stdout && stdout.indexOf(svcNA) == -1) svcStatus.push(true);
								else svcStatus.push(false);
								return res.send(svcStatus);
							});
						});
					});
				} else {
					execCmd = execCmd + svc.toString() + " ";
					childProcess.exec(execCmd + "QUERY", function(error, stdout, stderr) {
						if (stdout) {
							if (stdout.indexOf(svcNA) > 0) {
								logger.error("Error occured in restartService:", serverList[svc], "Service is not installed");
								return res.send("na");
							} else {
								if (stdout.indexOf(svcRun) > 0 || stdout.indexOf(svcRunPending) > 0) execCmd += "RESTART";
								else execCmd += "START";
								logger.error(serverList[svc], "Service restarted successfully");
								res.send("success");
								childProcess.exec("START " + execCmd, function(error, stdout, stderr) {
									return;
								});
								return true;
							}
						} else {
							logger.error("Error occured in restartService: Fail to restart", serverList[svc], "Service");
							return res.status(500).send("fail");
						}
					});
				}
			} catch (exception) {
				logger.error(exception.message);
				return res.status(500).send("fail");
			}
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
		app.get(/^\/(design|designTestCase|execute|scheduling)$/, function(req, res) {
			var roles = ["Test Lead", "Test Engineer"]; //Allowed roles
			sessionCheck(req, res, roles);
		});

		//Test Engineer,Test Lead and Test Manager can access
		app.get(/^\/(specificreports|mindmap|p_Utility|p_Reports|plugin)$/, function(req, res) {
			var roles = ["Test Manager", "Test Lead", "Test Engineer"]; //Allowed roles
			sessionCheck(req, res, roles);
		});

		//Test Lead and Test Manager can access
		app.get(/^\/(p_Webocular|neuronGraphs\/|p_ALM|p_APG|p_Integration|p_qTest|p_Zephyr)$/, function(req, res) {
			var roles = ["Test Manager", "Test Lead"]; //Allowed roles
			sessionCheck(req, res, roles);
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
				return res.redirect("/error?e=" + ((sessChk) ? "400" : "401"));
			}
		}

		//Role Based User Access to services
		
		// app.post('*', function(req, res, next) {
		// 	var roleId = (req.session) ? req.session.activeRoleId : undefined;
		// 	var updateinp = {
		// 		roleid: roleId || "ignore",
		// 		servicename: req.url.replace("/", "")
		// 	};
		// 	var args = {
		// 		data: updateinp,
		// 		headers: {
		// 			"Content-Type": "application/json"
		// 		}
		// 	};
		// 	var apireq = apiclient.post(epurl + "utility/userAccess", args, function(result, response) {
		// 		if (roleId) {
		// 			if (response.statusCode != 200 || result.rows == "fail") {
		// 				logger.error("Error occured in userAccess");
		// 				res.send("Invalid Session");
		// 			} else if (result.rows == "off") {
		// 				res.status(500).send("fail");
		// 				httpsServer.close();
		// 				logger.error("License Expired!!");
		// 				logger.error("Please run the Service API and Restart the Server");
		// 			} else {
		// 				if (result.rows == "True") {
		// 					logger.rewriters[0] = function(level, msg, meta) {
		// 						if (req.session && req.session.uniqueId) {
		// 							meta.username = req.session.username;
		// 							meta.userid = req.session.userid;
		// 							meta.userip = req.headers['client-ip'] != undefined ? req.headers['client-ip'] : req.ip;
		// 							return meta;
		// 						} else {
		// 							meta.username = null;
		// 							meta.userid = null;
		// 							return meta;
		// 						}
		// 					};
		// 					return next();
		// 				} else {
		// 					req.clearSession();
		// 					return res.send("Invalid Session");
		// 				}
		// 			}
		// 		} else {
		// 			return next();
		// 		}
		// 	});
		// 	apireq.on('error', function(err) {
		// 		res.status(500).send("fail");
		// 		httpsServer.close();
		// 		logger.error("Please run the Service API and Restart the Server");
		// 	});
		// });

		app.post('/designTestCase', function(req, res) {
			return res.sendFile("index.html", { root: __dirname + "/public/" });
		});

		app.get('/AvoAssure_ICE.zip', async (req, res) => {
			const iceFile = "AvoAssure_ICE.zip";
			const iceFilePath = path.resolve(process.env.HOST_PATH);
			if (req.query.file == "getICE") {
				return res.sendFile(iceFile, { root: iceFilePath })
			} else {
				let status = "na";
				try {
					await fs.promises.access(iceFilePath + path.sep + iceFile);
					status = "available";
				} catch (error) {}
				return res.send(status);
			}
		});

		//Route Directories
		var mindmap = require('./server/controllers/mindmap');
		var login = require('./server/controllers/login');
		var admin = require('./server/controllers/admin');
		var design = require('./server/controllers/design');
		var designscreen = require('./server/controllers/designscreen');
		var suite = require('./server/controllers/suite');
		var report = require('./server/controllers/report');
		var plugin = require('./server/controllers/plugin');
		var utility = require('./server/controllers/utility');
		var qc = require('./server/controllers/qualityCenter');
		var qtest = require('./server/controllers/qtest');
		var zephyr = require('./server/controllers/zephyr');
		var webocular = require('./server/controllers/webocular');
		var chatbot = require('./server/controllers/chatbot');
		var neuronGraphs2D = require('./server/controllers/neuronGraphs2D');
		var taskbuilder = require('./server/controllers/taskJson');
		var flowGraph = require('./server/controllers/flowGraph');

		//-------------Route Mapping-------------//
		// Mindmap Routes
		try {
			throw "Disable Versioning";
			var version = require('./server/controllers/project_versioning');
			app.post('/getVersions', version.getVersions);
			app.post('/getModulesVersioning', version.getModulesVersioning);
			app.post('/saveDataVersioning', version.saveDataVersioning);
			app.post('/createVersion', version.createVersion);
			app.post('/getProjectsNeo', version.getProjectsNeo);
		} catch (Ex) {
			process.env.projectVersioning = "disabled";
			logger.warn('Versioning is disabled');
			app.post('/getProjectsNeo', function(req, res) {
				res.send("false");
			});
		}

		app.post('/populateProjects', mindmap.populateProjects);
		app.post('/populateUsers', mindmap.populateUsers);
		app.post('/getProjectTypeMM', mindmap.getProjectTypeMM);
		app.post('/populateScenarios', mindmap.populateScenarios);
		app.post('/getModules', auth.protect, mindmap.getModules);
		app.post('/reviewTask', mindmap.reviewTask);
		app.post('/saveData', mindmap.saveData);
		app.post('/saveEndtoEndData', mindmap.saveEndtoEndData);
		app.post('/excelToMindmap', mindmap.excelToMindmap);
		app.post('/getScreens', mindmap.getScreens);
		app.post('/exportToExcel', mindmap.exportToExcel);
		app.post('/exportMindmap', mindmap.exportMindmap);
		app.post('/importMindmap', mindmap.importMindmap);
		app.post('/pdProcess', auth.protect, mindmap.pdProcess);	// process discovery service
		//Login Routes
		app.post('/checkUser', authlib.checkUser);
		app.post('/validateUserState', authlib.validateUserState);
		app.post('/loadUserInfo', auth.protect, login.loadUserInfo);
		app.post('/getRoleNameByRoleId', auth.protect, login.getRoleNameByRoleId);
		app.post('/logoutUser', login.logoutUser);
		app.post('/resetPassword', auth.protect, login.resetPassword);
		app.post('/storeUserDetails', auth.protect, login.storeUserDetails);
		//Admin Routes
		app.post('/getUserRoles', admin.getUserRoles);
		app.post('/getDomains_ICE', admin.getDomains_ICE);
		app.post('/createProject_ICE', admin.createProject_ICE);
		app.post('/updateProject_ICE', admin.updateProject_ICE);
		app.post('/getNames_ICE', admin.getNames_ICE);
		app.post('/getDetails_ICE', admin.getDetails_ICE);
		app.post('/assignProjects_ICE', admin.assignProjects_ICE);
		app.post('/getAssignedProjects_ICE', admin.getAssignedProjects_ICE);
		app.post('/getAvailablePlugins', auth.protect, admin.getAvailablePlugins);
		app.post('/manageSessionData', auth.protect, admin.manageSessionData);
		app.post('/manageUserDetails', auth.protect, admin.manageUserDetails);
		app.post('/getUserDetails', auth.protect, admin.getUserDetails);
		app.post('/testLDAPConnection', auth.protect, admin.testLDAPConnection);
		app.post('/getLDAPConfig', auth.protect, admin.getLDAPConfig);
		app.post('/manageLDAPConfig', auth.protect, admin.manageLDAPConfig);
		app.post('/getSAMLConfig', auth.protect, admin.getSAMLConfig);
		app.post('/manageSAMLConfig', auth.protect, admin.manageSAMLConfig);
		app.post('/getOIDCConfig', auth.protect, admin.getOIDCConfig);
		app.post('/manageOIDCConfig', auth.protect, admin.manageOIDCConfig);
		app.post('/getCIUsersDetails', admin.getCIUsersDetails);
		app.post('/manageCIUsers', admin.manageCIUsers);
		app.post('/getPreferences', auth.protect, admin.getPreferences);
		app.post('/provisionIce', auth.protect, admin.provisionICE);
		app.post('/fetchICE', auth.protect, admin.fetchICE);
		app.post('/getAvailable_ICE', auth.protect, admin.getAvailable_ICE);
		app.post('/getICEinPools', auth.protect, admin.getICEinPools);
		app.post('/deleteICE_pools', auth.protect, admin.deletePools);
		app.post('/getPools', auth.protect, admin.getPools);
		app.post('/updatePool', auth.protect, admin.updatePool);
		app.post('/createPool_ICE', auth.protect, admin.createPool_ICE);
		app.post('/clearQueue', auth.protect, admin.clearQueue);
		app.post('/exportProject', auth.protect, admin.exportProject);
		app.post('/testNotificationChannels', auth.protect, admin.testNotificationChannels);
		app.post('/manageNotificationChannels', auth.protect, admin.manageNotificationChannels);
		app.post('/getNotificationChannels', auth.protect, admin.getNotificationChannels);

		//Design Screen Routes
		app.post('/initScraping_ICE', designscreen.initScraping_ICE);
		app.post('/highlightScrapElement_ICE', designscreen.highlightScrapElement_ICE);
		app.post('/getScrapeDataScreenLevel_ICE', designscreen.getScrapeDataScreenLevel_ICE);
		app.post('/updateScreen_ICE', designscreen.updateScreen_ICE);
		app.post('/updateIrisDataset', designscreen.updateIrisDataset);
		app.post('/userObjectElement_ICE', designscreen.userObjectElement_ICE);
		//Design TestCase Routes
		app.post('/readTestCase_ICE', design.readTestCase_ICE);
		app.post('/updateTestCase_ICE', design.updateTestCase_ICE);
		app.post('/debugTestCase_ICE', design.debugTestCase_ICE);
		app.post('/getKeywordDetails_ICE', design.getKeywordDetails_ICE);
		app.post('/getTestcasesByScenarioId_ICE', design.getTestcasesByScenarioId_ICE);
		//Execute Screen Routes
		app.post('/readTestSuite_ICE', auth.protect, suite.readTestSuite_ICE);
		app.post('/updateTestSuite_ICE', auth.protect, suite.updateTestSuite_ICE);
		app.post('/getTestcaseDetailsForScenario_ICE', auth.protect, suite.getTestcaseDetailsForScenario_ICE);
		app.post('/ExecuteTestSuite_ICE', auth.protect, suite.ExecuteTestSuite_ICE);
		app.post('/ExecuteTestSuite_ICE_SVN', suite.ExecuteTestSuite_ICE_API);
		app.post('/getICE_list', auth.protect, suite.getICE_list);
		//Scheduling Screen Routes
		app.post('/testSuitesScheduler_ICE', auth.protect, suite.testSuitesScheduler_ICE);
		app.post('/getScheduledDetails_ICE', auth.protect, suite.getScheduledDetails_ICE);
		app.post('/cancelScheduledJob_ICE', auth.protect, suite.cancelScheduledJob_ICE);
		//Report Screen Routes
		app.post('/getAllSuites_ICE', report.getAllSuites_ICE);
		app.post('/getSuiteDetailsInExecution_ICE', report.getSuiteDetailsInExecution_ICE);
		app.post('/reportStatusScenarios_ICE', report.reportStatusScenarios_ICE);
		app.post('/renderReport_ICE', auth.protect, report.renderReport_ICE);
		app.post('/getReport', auth.protect, report.getReport);
		app.post('/openScreenShot', auth.protect, report.openScreenShot);
		app.post('/connectJira_ICE', report.connectJira_ICE);
		app.post('/downloadVideo', auth.protect, report.downloadVideo);
		app.post('/getReportsData_ICE', auth.protect, report.getReportsData_ICE);
		app.post('/getReport_API', report.getReport_API);
		app.use('/viewReport', report.viewReport);
		//Plugin Routes
		app.post('/getProjectIDs', plugin.getProjectIDs);
		app.post('/getTaskJson_mindmaps', taskbuilder.getTaskJson_mindmaps);
		app.post('/updateTaskstatus_mindmaps', taskbuilder.updateTaskstatus_mindmaps);
		//Utility plugins
		app.post('/Encrypt_ICE', utility.Encrypt_ICE);
		// Wecoccular Plugin
		app.post('/crawlResults', auth.protect, webocular.getCrawlResults);
		app.post('/saveResults', auth.protect, webocular.saveResults);
		app.post('/getWebocularModule_ICE', auth.protect, webocular.getWebocularModule_ICE);
		app.post('/getWebocularData_ICE', auth.protect, webocular.getWebocularData_ICE);


		//Chatbot Routes
		app.post('/getTopMatches_ProfJ', chatbot.getTopMatches_ProfJ);
		app.post('/updateFrequency_ProfJ', chatbot.updateFrequency_ProfJ);
		//NeuronGraphs Plugin Routes
		app.post('/getGraph_nGraphs2D', neuronGraphs2D.getGraphData);
		app.post('/getReport_NG', neuronGraphs2D.getReportNG);
		app.post('/getReportExecutionStatus_NG', neuronGraphs2D.getReportExecutionStatusNG);
		//QC Plugin
		app.post('/loginQCServer_ICE', qc.loginQCServer_ICE);
		app.post('/qcProjectDetails_ICE', qc.qcProjectDetails_ICE);
		app.post('/qcFolderDetails_ICE', qc.qcFolderDetails_ICE);
		app.post('/saveQcDetails_ICE', qc.saveQcDetails_ICE);
		app.post('/saveUnsyncDetails', auth.protect, qc.saveUnsyncDetails);
		app.post('/viewQcMappedList_ICE', qc.viewQcMappedList_ICE);
		//qTest Plugin
		app.post('/loginToQTest_ICE', qtest.loginToQTest_ICE);
		app.post('/qtestProjectDetails_ICE', qtest.qtestProjectDetails_ICE);
		app.post('/qtestFolderDetails_ICE', qtest.qtestFolderDetails_ICE);
		app.post('/saveQtestDetails_ICE', qtest.saveQtestDetails_ICE);
		app.post('/viewQtestMappedList_ICE', qtest.viewQtestMappedList_ICE);	
		//Zephyr Plugin
		app.post('/loginToZephyr_ICE', zephyr.loginToZephyr_ICE);
		app.post('/zephyrProjectDetails_ICE', zephyr.zephyrProjectDetails_ICE);
		app.post('/saveZephyrDetails_ICE', zephyr.saveZephyrDetails_ICE);
		app.post('/viewZephyrMappedList_ICE', zephyr.viewZephyrMappedList_ICE);	
		//app.post('/manualTestcaseDetails_ICE', qc.manualTestcaseDetails_ICE);
		// Automated Path Generator Routes
		app.post('/flowGraphResults', flowGraph.flowGraphResults);
		app.post('/APG_OpenFileInEditor', flowGraph.APG_OpenFileInEditor);
		app.post('/APG_createAPGProject', flowGraph.APG_createAPGProject);
		app.post('/APG_runDeadcodeIdentifier', flowGraph.APG_runDeadcodeIdentifier);
		// ICE Provisioning
		app.post('/ICE_provisioning_register', io.registerICE);
		app.post('/getUserICE', auth.protect, io.getUserICE)
		app.post('/setDefaultUserICE', auth.protect, io.setDefaultUserICE)
		//-------------Route Mapping-------------//

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
					if (response.statusCode != 200) {
						httpsServer.close();
						logger.error("Please run the Service API and Restart the Server");
					} else {
						suite.reScheduleTestsuite();
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