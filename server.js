//load environment variables
var env = require('node-env-file');
if (!process.env.ENV)
    env(__dirname + '/.env');

// Module Dependencies
var cluster = require('cluster');
var fs = require('fs');
var util = require('util');
var expressWinston = require('express-winston');
var winston = require('winston');
var epurl = "http://"+process.env.NDAC_IP+":"+process.env.NDAC_PORT+"/";
var logger = require('./logger');
if (cluster.isMaster) {
	cluster.fork();
    cluster.on('disconnect', function(worker) {
        logger.error('Node server has encountered some problems, Disconnecting!');
    });
    cluster.on('exit', function(worker) {
		if (worker.exitedAfterDisconnect != true) {
			logger.error('Worker %d is killed!', worker.id);
			cluster.fork();
		}
    });

} else {
try {
    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');
    var sessions = require('express-session');
    var cookieParser = require('cookie-parser');
    var helmet = require('helmet');
    var async = require('async');
    var lusca = require('lusca');
    var redis = require("redis");
    var redisStore = require('connect-redis')(sessions);
    var redisConfig = {"host": process.env.REDIS_IP, "port": parseInt(process.env.REDIS_PORT),"password" : process.env.REDIS_AUTH};
	var redisSessionClient = redis.createClient(redisConfig);
	redisSessionClient.on("error", function (err) {
        logger.error("Please run the Redis DB");
		cluster.worker.disconnect().kill();
	});

    //HTTPS Configuration
	var certPath = "server/https/";
	if (process.env.LB_ENABLED == "True") {
		certPath += "domain_certs/";
	}
    var privateKey = fs.readFileSync(certPath+'server.key', 'utf-8');
    var certificate = fs.readFileSync(certPath+'server.crt', 'utf-8');
    var credentials = {
        key: privateKey,
        cert: certificate,
        ciphers: [
            "ECDHE-RSA-AES256-SHA384",
            "DHE-RSA-AES256-SHA384",
            "ECDHE-RSA-AES256-SHA256",
            "DHE-RSA-AES256-SHA256",
            "ECDHE-RSA-AES128-SHA256",
            "DHE-RSA-AES128-SHA256",
            "HIGH",
            "!aNULL",
            "!eNULL",
            "!EXPORT",
            "!DES",
            "!RC4",
            "!MD5",
            "!PSK",
            "!SRP",
            "!CAMELLIA"
        ].join(':'),
        honorCipherOrder: true
    };
    var httpsServer = require('https').createServer(credentials, app);
    module.exports.httpsServer = httpsServer;
    var io = require('./server/lib/socket');

    app.use(bodyParser.json({
        limit: '50mb'
    }));

    app.use(bodyParser.urlencoded({
        limit: '50mb',
        extended: true
    }));
    if(process.env.EXPRESSLOGS == 'ON')
    app.use(expressWinston.logger({
        winstonInstance: logger,
        requestWhitelist: ['url'],
        colorize: true
    }));
    else logger.info("Express logs are disabled");

    app.use(cookieParser());
    app.use(sessions({
        secret: '$^%EDE%^tfd65e7ufyCYDR^%IU',
        store: new redisStore({ host: process.env.REDIS_IP, port: process.env.REDIS_PORT, client: redisSessionClient}),
        path: '/',
        httpOnly: true,
        secure: true,
        rolling: true,
        resave: true,
        saveUninitialized: false,  //Should always be false for cookie to clear
        cookie: {
            maxAge: (30 * 60 * 1000)
        }
    }));

    app.use(helmet());
    var opts = {
        csrf: {
            angular: true
        }
    }; // options for lusca
    app.use(lusca.p3p('ABCDEF'));
    app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
    var ninetyDaysInSeconds = 7776000
    app.use(helmet.hpkp({
        maxAge: ninetyDaysInSeconds,
        sha256s: ['AbCdEf123=', 'ZyXwVu456=']
    }))

    app.use(helmet.noCache());

    //Role Based User Access to services
    app.post('*', function (req, res, next) {
        var roleId = req.session.defaultRoleId;
        if (req.session.defaultRoleId != undefined) {
            var updateinp = { roleid: req.session.defaultRoleId, servicename: req.url.replace("/", "") }
            var args = { data: updateinp, headers: { "Content-Type": "application/json" } }
            apiclient.post(epurl + "utility/userAccess_Nineteen68", args,
                function (result, response) {
                    if (response.statusCode != 200 || result.rows == "fail") {
                        logger.error("Error occured in userAccess_Nineteen68");
                        res.send("Invalid Session");
                    } else {
                        if(req.url == '/home' && req.session.defaultRole == 'Test Engineer')
                        {
                            result.rows = "True"
                        }
                        if (result.rows == "True") {
                            // logger.info("User " + req.session.username + " authenticated");
                            logger.rewriters.push(function (level, msg, meta) {
                                if (req.session != undefined) {
                                    meta.username = req.session.username;
                                    meta.userid = req.session.userid;
                                    meta.userip = req.headers['client-ip'] != undefined ?  req.headers['client-ip']: req.ip;
                                    return meta;
                                }
                                else {
                                    meta.username = null;
                                    meta.userid = null;
                                    return meta;
                                }
                            });
                            return next();
                        } else {

                            req.session.destroy();
                            res.status(401).redirect('/');
                        }
                    }
                });
        }
        else {
            return next();
        }
    });
    //CORS
    app.all('*', function (req, res, next) {
        var origin = req.get('host');
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        next();
    });
    //Content Security Policy Enabled for Images and Fonts.
    app.use(helmet.contentSecurityPolicy({
        directives: {
            imgSrc: ["'self'", 'data:'],
            //   fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }));

    //serve all asset files from necessary directories
    app.use('/partials',express.static(__dirname + "/public/partials"));
    app.use("/js", express.static(__dirname + "/public/js"));
    app.use("/imgs", express.static(__dirname + "/public/imgs"));
    app.use("/images_mindmap", express.static(__dirname + "/public/images_mindmap"));
    app.use("/css", express.static(__dirname + "/public/css"));
    app.use("/fonts", express.static(__dirname + "/public/fonts"));

    // app.get("/", function(req, res) {
    //     // console.log("/--------",req);
    //     res.clearCookie('connect.sid');
    //     res.sendFile("index.html", {
    //         root: __dirname + "/public/"
    //     });
    // });

    app.get('/',  function (req,  res)  {
        res.clearCookie('connect.sid');
        req.session.destroy();
        logger.rewriters.push(function (level, msg, meta) {
            meta.username = null;
            meta.userid = null;
            meta.userip = req.headers['client-ip'] != undefined ?  req.headers['client-ip']: req.ip;
            return meta;
        });
        res.sendFile("index.html", {root: __dirname + "/public/"});
    });

    app.get('/login', function(req, res) {
        res.clearCookie('connect.sid');
        req.session.destroy();
        res.sendFile("index.html", {root: __dirname + "/public/"});
    });

    app.get('/admin',  function (req,  res)  {
        if (!req.session.defaultRole || req.session.defaultRole != 'Admin') {
            req.session.destroy();  res.status(401).send('<br><br>Your session has been expired.Please <a href="/">Login</a> Again');
        } else {
            if  (req.cookies['connect.sid']  &&  req.cookies['connect.sid']  !=  undefined)  {  res.sendFile("index.html",  {  root:  __dirname  +  "/public/"  }); }  else  { req.session.destroy();  res.status(401).send('<br><br>Your session has been expired.Please <a href="/">Login</a>Again'); }
        }
    });

    //Only Test Engineer and Test Lead have access
    app.get(/^\/(design|designTestCase|execute|scheduling)$/, function (req, res) {
        //Denied roles
        roles = ["Admin", "Business Analyst", "Tech Lead", "Test Manager"];
        sessionCheck(req, res, roles);
    });

    //Test Engineer,Test Lead and Test Manager can access
    app.get(/^\/(specificreports|home|p_Utility|p_Reports|plugin)$/, function (req, res) {
        //Denied roles
        roles = ["Admin", "Business Analyst", "Tech Lead"];
        sessionCheck(req, res, roles);
    });

    //Test Lead and Test Manager can access Weboccular Plugin
    app.get(/^\/(p_Weboccular|neuronGraphs2D|p_ALM|p_Dashboard)$/, function (req, res) {
        //Denied roles
        roles = ["Admin", "Business Analyst", "Tech Lead", "Test Engineer"];
        sessionCheck(req, res, roles);
    });

    function sessionCheck(req, res, roles) {
        logger.info("Inside sessioncheck for URL : %s", req.url);
        // logger.info("User " + req.session.username + " authenticated");
        // if(req.session.username != undefined && req.session.userid != undefined)
        // {
        //         logger.rewriters.push(function(level, msg, meta) {
        // 		meta.username =  req.session.username;
        // 		meta.userid =  req.session.userid;
        // 		return meta;
        // 		});
        // }
        logger.rewriters.push(function (level, msg, meta) {
            if (req.session != undefined && req.session.userid != undefined) {
                meta.username = req.session.username;
                meta.userid = req.session.userid;
                meta.userip = req.headers['client-ip'] != undefined ?  req.headers['client-ip']: req.ip;
                return meta;
            }
            else {
                meta.username = null;
                meta.userid = null;
                return meta;
            }
        });

        if (req.session.switchedRole != true) {
            if (!req.session.defaultRole || roles.indexOf(req.session.defaultRole) >= 0) {
                req.session.destroy();  res.status(401).send('<br><br>Your session has been expired.Please <a href="/">Login</a> Again');
            } else {
                if (req.cookies['connect.sid'] && req.cookies['connect.sid'] != undefined) {

                    res.sendFile("index.html", { root: __dirname + "/public/" });
                } else {
                    req.session.destroy();
                    res.status(401).send('<br><br>Your session has been expired. Please <a href="/">Login</a> Again');
                }
            }
        }
        else {
            if (req.cookies['connect.sid'] && req.cookies['connect.sid'] != undefined) {

                res.sendFile("index.html", { root: __dirname + "/public/" });
            } else {
                req.session.destroy();
                res.status(401).send('<br><br>Your session has been expired. Please <a href="/">Login</a> Again');
            }
        }

    }
    app.get('/favicon.ico', function (req, res) {
        if (req.cookies['connect.sid'] && req.cookies['connect.sid'] != undefined) { res.sendFile("index.html", { root: __dirname + "/public/" }); } else { req.session.destroy(); res.status(401).send('<br><br>Your session has been expired. Please <a href="/">Login</a> Again'); }
    });

    app.get('/css/fonts/Lato/Lato-Regular.ttf', function (req, res) {
        if (req.cookies['connect.sid'] && req.cookies['connect.sid'] != undefined) { res.sendFile("index.html", { root: __dirname + "/public/" }); } else { req.session.destroy(); res.status(401).send('<br><br>Your session has been expired. Please <a href="/">Login</a> Again'); }
    });

    app.post('/designTestCase', function (req, res) {
        // console.log("*--------",req);
        res.sendFile("index.html", {
            root: __dirname + "/public/"
        });
    });

    // express-winston errorLogger makes sense AFTER the router.
    // app.use(expressWinston.errorLogger({
    //   transports: [
    //     new winston.transports.Console({
    //       json: true,
    //       colorize: true
    //     })
    //   ]
    // }));
    //  // Optionally you can include your custom error handler after the logging.
    // app.use(express.errorLogger({
    //   dumpExceptions: true,
    //   showStack: true
    // }));

    var Client = require("node-rest-client").Client;
    var apiclient = new Client();

    //Route Directories
    //var neo4jAPI = require('./server/controllers/neo4jAPI');
    var mindmap = require('./server/controllers/mindmap');
    var login = require('./server/controllers/login');
    var admin = require('./server/controllers/admin');
    var design = require('./server/controllers/design');
    var suite = require('./server/controllers/suite');
    var report = require('./server/controllers/report');
    var plugin = require('./server/controllers/plugin');
    var utility = require('./server/controllers/utility');
    var qc = require('./server/controllers/qualityCenter');
    var webCrawler = require('./server/controllers/webCrawler');
    var chatbot = require('./server/controllers/chatbot');
    var neuronGraphs2D = require('./server/controllers/neuronGraphs2D');
    var dashboard = require('./server/controllers/dashboard');
    var taskbuilder = require('./server/controllers/taskJson');

    // Mindmap Routes
    try {
        var version = require('./server/controllers/project_versioning');
        app.post('/version', version.versioning);
    } catch (Ex) {
        logger.warn('Versioning route path not found');
    }

    app.post('/home', mindmap.mindmapService);
    //Neo4j API Routes
    //app.post('/neo4jAPI', neo4jAPI.executeQueriesOverRestAPI);
    //Login Routes
    app.post('/authenticateUser_Nineteen68', login.authenticateUser_Nineteen68);
    app.post('/authenticateUser_Nineteen68_CI', login.authenticateUser_Nineteen68_CI);
    app.post('/loadUserInfo_Nineteen68', login.loadUserInfo_Nineteen68);
    app.post('/getRoleNameByRoleId_Nineteen68', login.getRoleNameByRoleId_Nineteen68);
    app.post('/logoutUser_Nineteen68', login.logoutUser_Nineteen68);
    app.post('/logoutUser_Nineteen68_CI', login.logoutUser_Nineteen68_CI);
    //Admin Routes
    app.post('/getUserRoles_Nineteen68', admin.getUserRoles_Nineteen68);
    app.post('/createUser_Nineteen68', admin.createUser_Nineteen68);
    app.post('/updateUser_nineteen68', admin.updateUser_nineteen68);
    app.post('/getAllUsers_Nineteen68', admin.getAllUsers_Nineteen68);
    app.post('/getEditUsersInfo_Nineteen68', admin.getEditUsersInfo_Nineteen68);
    app.post('/getDomains_ICE', admin.getDomains_ICE);
    app.post('/createProject_ICE', admin.createProject_ICE);
    app.post('/updateProject_ICE', admin.updateProject_ICE);
    app.post('/getNames_ICE', admin.getNames_ICE);
    app.post('/getDetails_ICE', admin.getDetails_ICE);
    app.post('/assignProjects_ICE', admin.assignProjects_ICE);
    app.post('/getAssignedProjects_ICE', admin.getAssignedProjects_ICE);
    app.post('/getAvailablePlugins', admin.getAvailablePlugins);
    //Design Screen Routes
    app.post('/initScraping_ICE', design.initScraping_ICE);
    app.post('/highlightScrapElement_ICE', design.highlightScrapElement_ICE);
    app.post('/getScrapeDataScreenLevel_ICE', design.getScrapeDataScreenLevel_ICE);
    app.post('/updateScreen_ICE', design.updateScreen_ICE);
    //Design TestCase Routes
    app.post('/readTestCase_ICE', design.readTestCase_ICE);
    app.post('/updateTestCase_ICE', design.updateTestCase_ICE);
    app.post('/debugTestCase_ICE', design.debugTestCase_ICE);
    app.post('/getKeywordDetails_ICE', design.getKeywordDetails_ICE);
    app.post('/getTestcasesByScenarioId_ICE', design.getTestcasesByScenarioId_ICE);
    app.post('/generateCItoken', admin.generateCItoken);
    //Execute Screen Routes
    app.post('/readTestSuite_ICE', suite.readTestSuite_ICE);
    app.post('/updateTestSuite_ICE', suite.updateTestSuite_ICE);
    //app.post('/updateTestScenario_ICE', suite.updateTestScenario_ICE);
    app.post('/ExecuteTestSuite_ICE', suite.ExecuteTestSuite_ICE);
    app.post('/getTestcaseDetailsForScenario_ICE', suite.getTestcaseDetailsForScenario_ICE);
    app.post('/ExecuteTestSuite_ICE_CI', suite.ExecuteTestSuite_ICE_CI);
    //app.post('/readTestScenarios_ICE', suite.readTestScenarios_ICE);

    //SVN execution routes
    app.post('/ExecuteTestSuite_ICE_SVN',suite.ExecuteTestSuite_ICE_SVN);
    // app.post('/getListofScheduledSocketMap',suite.getListofScheduledSocketMap);

    //Scheduling Screen Routes
    app.post('/testSuitesScheduler_ICE', suite.testSuitesScheduler_ICE);
    app.post('/getScheduledDetails_ICE', suite.getScheduledDetails_ICE);
    app.post('/cancelScheduledJob_ICE', suite.cancelScheduledJob_ICE);
    //Report Screen Routes
    app.post('/getAllSuites_ICE', report.getAllSuites_ICE);
    app.post('/getSuiteDetailsInExecution_ICE', report.getSuiteDetailsInExecution_ICE);
    app.post('/reportStatusScenarios_ICE', report.reportStatusScenarios_ICE);
    app.post('/renderReport_ICE', report.renderReport_ICE);
    app.post('/getMainReport_ICE', report.getMainReport_ICE);
    app.post('/getReport_Nineteen68', report.getReport_Nineteen68);
    app.post('/exportToJson_ICE', report.exportToJson_ICE);
    app.post('/openScreenShot', report.openScreenShot);
    app.post('/connectJira_ICE', report.connectJira_ICE);
    //Plugin Routes
    app.post('/getProjectIDs_Nineteen68', plugin.getProjectIDs_Nineteen68);
    app.post('/getTaskJson_mindmaps', taskbuilder.getTaskJson_mindmaps);
    app.post('/updateTaskstatus_mindmaps', taskbuilder.updateTaskstatus_mindmaps);
    //Utility plugins
    app.post('/Encrypt_ICE', utility.Encrypt_ICE);
    // Wecoccular Plugin
    app.post('/crawResults', webCrawler.getCrawlResults);
    //Chatbot Routes
    app.post('/getTopMatches_ProfJ', chatbot.getTopMatches_ProfJ);
    app.post('/updateFrequency_ProfJ', chatbot.updateFrequency_ProfJ);
    //NeuronGraphs Plugin Routes
    app.post('/getGraph_nGraphs2D', neuronGraphs2D.getGraphData);
    app.post('/getPackData_nGraphs2D', neuronGraphs2D.getPackData);
    app.post('/getReportData_nGraphs2D', neuronGraphs2D.getReportData);
    //QC Plugin
    app.post('/loginQCServer_ICE', qc.loginQCServer_ICE);
    app.post('/qcProjectDetails_ICE', qc.qcProjectDetails_ICE);
    app.post('/qcFolderDetails_ICE', qc.qcFolderDetails_ICE);
    app.post('/saveQcDetails_ICE', qc.saveQcDetails_ICE);
    app.post('/viewQcMappedList_ICE', qc.viewQcMappedList_ICE);
    // Dashboard Routes
    app.post('/loadDashboard', dashboard.loadDashboard);
    app.post('/loadDashboardData', dashboard.loadDashboardData);
    app.post('/loadDashboard_2', dashboard.loadDashboard_2);
    //app.post('/manualTestcaseDetails_ICE', qc.manualTestcaseDetails_ICE);

    //-------------SERVER START------------//
    var hostFamilyType = '0.0.0.0';
    var portNumber = 8443;
    httpsServer.listen(portNumber, hostFamilyType); //Https Server
    try {
        var apireq = apiclient.post(epurl+"server", function (data, response) {
            try {
                if (response.statusCode != 200) {
                    httpsServer.close();
                    logger.error("Please run the Service API and Restart the Server");
                } else {
                    suite.reScheduleTestsuite();
                    logger.info("Nineteen68 Server Ready...");
                }
            } catch (exception) {
                httpsServer.close();
                logger.error("Please run the Service API and Restart the Server");
            }
        });
        apireq.on('error', function (err) {
            httpsServer.close();
            logger.error("Please run the Service API and Restart the Server");
        });
    } catch (exception) {
        httpsServer.close();
        logger.error("Please run the Service API");
    }

    // Start JS REPORT Server
    var reportingApp = express();
    app.use('/reportServer', reportingApp);
    var jsreport = require('jsreport')({
        express: { app :reportingApp, server: httpsServer },
        appPath: "/reportServer"
    });

    jsreport.init(function () {
        // running
    }).catch(function (e) {
        // error during startup
        console.error(e.stack)
        process.exit(1)
    });

    //To prevent can't send header response
    app.use(function (req, res, next) {
        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    });

    module.exports = app;
} catch (e) {
    logger.error(e);
    setTimeout(function () {
        cluster.worker.kill();
    }, 200)
}
}