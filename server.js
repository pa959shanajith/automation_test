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
var winston = require('winston');
var epurl = "http://" + process.env.NDAC_IP + ":" + process.env.NDAC_PORT + "/";
var logger = require('./logger');
var nginxEnabled = process.env.NGINX_ON.toLowerCase().trim() == "true";

if (cluster.isMaster) {
    cluster.fork();
    cluster.on('disconnect', function(worker) {
        logger.error('Nineteen68 server has encountered some problems, Disconnecting!');
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
        var cookieParser = require('cookie-parser')
        var helmet = require('helmet');
        var lusca = require('lusca');
        var consts = require('constants');
        var redis = require("redis");
        var Client = require("node-rest-client").Client;
        var apiclient = new Client();
        var redisStore = require('connect-redis')(sessions);
        var redisConfig = {
            "host": process.env.REDIS_IP,
            "port": parseInt(process.env.REDIS_PORT),
            "password": process.env.REDIS_AUTH
        };
        var redisSessionClient = redis.createClient(redisConfig);
        redisSessionClient.on("error", function(err) {
            logger.error("Please run the Redis DB");
            //cluster.worker.disconnect().kill();
        });
        redisSessionClient.on("connect", function(err) {
            logger.debug("Redis DB connected");
        });
        var redisSessionStore = new redisStore({
            client: redisSessionClient
        });

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
        if (!process.env.serverPort) process.env.serverPort = 8443;
        module.exports = app;
        module.exports.redisSessionStore = redisSessionStore;
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
        app.use("/images_mindmap", express.static(__dirname + "/public/images_mindmap"));
        app.use("/css", express.static(__dirname + "/public/css"));
        app.use("/fonts", express.static(__dirname + "/public/fonts"));

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
        process.env.SESSION_INTERVAL = 20 * 60 * 1000;

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
            store: redisSessionStore
        }));

        app.use(function(req, res, next) {
            req.clearSession = function clearSession() {
                res.clearCookie('connect.sid');
                res.clearCookie('maintain.sid');
                req.session.destroy();
            }
            next();
        });

        // For Selecting proper authentication mechanism
        var authlib = require("./server/lib/auth");
        var auth = authlib(app, {user: "userContext", route: {login: "/login", success: "/", failure: "/error?e=403"}});
        var authStrategy = auth[0];
        var auth = auth[1];

        app.use('*', function(req, res, next) {
            if (req.session === undefined) {
                return next(new Error("redisnotavailable"));
            }
            return next();
        });

        //Based on NGINX Config Security Headers are configured
        if(!nginxEnabled){
            app.use(helmet());
            app.use(lusca.p3p('/w3c/p3p.xml", CP="IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT'));
            app.use(helmet.referrerPolicy({
                policy: 'same-origin'
            }));
            var ninetyDaysInSeconds = 7776000;
            app.use(helmet.hpkp({
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
                var origin = req.get('host');
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.header('Access-Control-Allow-Headers', 'X-Requested-With');
                next();
            });
        // app.use(helmet.noCache());
        }

        app.post('/restartService', function(req, res) {
            logger.info("Inside UI Service: restartService");
            var childProcess = require("child_process");
            var serverList = ["License Server", "NDAC Server", "Web Server"];
            var svcNA = "service does not exist";
            var svcRun = "RUNNING";
            var svcRunPending = "START_PENDING";
            var svcStop = "STOPPED";
            var svcStopPending = "STOP_PENDING";
            var svc = req.body.id;
            var batFile = require.resolve("./assets/svc.bat");
            try {
                if (svc == "query") {
                    var svcStatus = [];
                    var execCmd = batFile + " ";
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
                    var execCmd = batFile + " " + svc.toString() + " ";
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
            var emsg=req.query.e;
            if (emsg) {
                if (req.session.messages) emsg = req.session.messages[0];
                else if (emsg == "401") emsg = "invalid_session";
                else if (emsg == "403") emsg = "unauthorized";
                else if (emsg == "sessexists") {
                    emsg = "userLogged";
                    req.session.dndSess = true;
                }
                req.session.emsg = emsg;
            }
            res.redirect('/');
        });

        app.get('/', function(req, res, next) {
            if (!(req.url == '/' || req.url.startsWith("/?"))) return next();
            var userLogged = req.session.logged;
            var usrCtx = req.userContext;
            if (userLogged) req.session.emsg = req.session.emsg || "userLogged";
            else if (!req.session.emsg && req.session.username==undefined) {
                if (usrCtx) {
                    var username = (usrCtx.userinfo)? usrCtx.userinfo.nineteen68_username:usrCtx.nineteen68_username;
                    if (username == undefined) {
                        req.session.emsg = "invalid_username";
                    } else {
                        username = username.toLowerCase();
                        redisSessionStore.all(function (err, allKeys) {
                            if (err) {
                                logger.info("User Authentication failed");
                                req.session.emsg = "fail";
                            } else {
                                for (var ki = 0; ki < allKeys.length; ki++) {
                                    if (username == allKeys[ki].username) {
                                        userLogged=true;
                                        break;
                                    }
                                }
                                if (userLogged) {
                                    req.session.emsg = "userLogged";
                                } else {
                                    req.session.username = username;
                                    req.session.uniqueId = req.session.id;
                                    logger.rewriters[0]=function(level, msg, meta) {
                                        meta.username = username;
                                        meta.userid = null;
                                        meta.userip = req.headers['client-ip'] != undefined ? req.headers['client-ip'] : req.ip;
                                        return meta;
                                    };
                                }
                            }
                        });
                    }
                } else {
                    logger.rewriters[0]=function(level, msg, meta) {
                        meta.username = null;
                        meta.userid = null;
                        meta.userip = req.headers['client-ip'] != undefined ? req.headers['client-ip'] : req.ip;
                        return meta;
                    };
                    req.clearSession();
                    return res.redirect('login');
                }
            }
            req.session.logged = true;
            return res.sendFile("app.html", { root: __dirname + "/public/" });
        });

        //Only Admin have access
        app.get('/admin', function(req, res) {
            var roles = ["Admin"];   //Allowed roles
            sessionCheck(req, res, roles);
        });

        //Only Test Engineer and Test Lead have access
        app.get(/^\/(design|designTestCase|execute|scheduling)$/, function(req, res) {
            var roles = ["Test Lead", "Test Engineer"];   //Allowed roles
            sessionCheck(req, res, roles);
        });

        //Test Engineer,Test Lead and Test Manager can access
        app.get(/^\/(specificreports|mindmap|p_Utility|p_Reports|plugin)$/, function(req, res) {
            var roles = ["Test Manager", "Test Lead", "Test Engineer"];   //Allowed roles
            sessionCheck(req, res, roles);
        });

        //Test Lead and Test Manager can access
        app.get(/^\/(p_Webocular|neuronGraphs|p_ALM|p_Dashboard|p_APG)$/, function(req, res) {
            var roles = ["Test Manager", "Test Lead"];   //Allowed roles
            sessionCheck(req, res, roles);
        });

        function sessionCheck(req, res, roles) {
            logger.info("Inside sessioncheck for URL : %s", req.url);
            var sess  = req.session;
            logger.rewriters[0]=function(level, msg, meta) {
                meta.username = (sess && sess.username)? sess.username:null;
                meta.userid = (sess && sess.userid)? sess.userid:null;
                meta.userip = req.headers['client-ip'] != undefined ? req.headers['client-ip'] : req.ip;
                return meta;
            };

            var sessChk = sess.uniqueId && sess.activeRole && (roles.indexOf(sess.activeRole) != -1);
            var maintCookie = req.signedCookies["maintain.sid"];
            if (sessChk) {
                return (maintCookie)? res.sendFile("app.html", { root: __dirname + "/public/" }) : res.redirect("/error?e=sessexists");
            } else {
                req.clearSession();
                return res.redirect("/error?e=401");
            }
        }

        //Role Based User Access to services
        app.post('*', function(req, res, next) {
            var roleId = (req.session)? req.session.activeRoleId : undefined;
            var updateinp = {
                roleid: roleId || "ignore",
                servicename: req.url.replace("/", "")
            };
            var args = {
                data: updateinp,
                headers: {
                    "Content-Type": "application/json"
                }
            };
            var apireq = apiclient.post(epurl + "utility/userAccess_Nineteen68", args, function(result, response) {
                if (roleId) {
                    if (response.statusCode != 200 || result.rows == "fail") {
                        logger.error("Error occured in userAccess_Nineteen68");
                        res.send("Invalid Session");
                    } else if (result.rows == "off") {
                        res.status(500).send("fail");
                        httpsServer.close();
                        logger.error("License Expired!!");
                        logger.error("Please run the Service API and Restart the Server");
                    } else {
                        if (result.rows == "True") {
                            logger.rewriters.push[0]=function(level, msg, meta) {
                                 if (req.session && req.session.uniqueId) {
                                     meta.username = req.session.username;
                                     meta.userid = req.session.userid;
                                     meta.userip = req.headers['client-ip'] != undefined ? req.headers['client-ip'] : req.ip;
                                     return meta;
                                 } else {
                                     meta.username = null;
                                     meta.userid = null;
                                     return meta;
                                 }
                            };
                            return next();
                        } else {
                            req.clearSession();
                            return res.send("Invalid Session");
                        }
                    }
                } else {
                    return next();
                }
            });
            apireq.on('error', function(err) {
                res.status(500).send("fail");
                httpsServer.close();
                logger.error("Please run the Service API and Restart the Server");
            });
        });

        app.post('/designTestCase', function(req, res) {
            return res.sendFile("app.html", { root: __dirname + "/public/" });
        });

        //Route Directories
        var mindmap = require('./server/controllers/mindmap');
        var login = require('./server/controllers/login');
        var admin = require('./server/controllers/admin');
        var design = require('./server/controllers/design');
        var suite = require('./server/controllers/suite');
        var report = require('./server/controllers/report');
        var plugin = require('./server/controllers/plugin');
        var utility = require('./server/controllers/utility');
        var qc = require('./server/controllers/qualityCenter');
        var webocular = require('./server/controllers/webocular');
        var chatbot = require('./server/controllers/chatbot');
        var neuronGraphs2D = require('./server/controllers/neuronGraphs2D');
        var dashboard = require('./server/controllers/dashboard');
        var taskbuilder = require('./server/controllers/taskJson');
        var flowGraph = require('./server/controllers/flowGraph');

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
            app.post('/getProjectsNeo', function(req,res){
                res.send("false");
            });
        }

        // Route Mapping
        app.post('/populateProjects', mindmap.populateProjects);
        app.post('/populateUsers', mindmap.populateUsers);
        app.post('/checkReuse', mindmap.checkReuse);
        app.post('/getCRId', mindmap.getCRId);
        app.post('/getProjectTypeMM_Nineteen68', mindmap.getProjectTypeMM_Nineteen68);
        app.post('/populateScenarios', mindmap.populateScenarios);
        app.post('/populateReleases', mindmap.populateReleases);
        app.post('/populateCycles', mindmap.populateCycles);
        app.post('/getModules', mindmap.getModules);
        app.post('/reviewTask', mindmap.reviewTask);
        app.post('/saveData', mindmap.saveData);
        app.post('/saveEndtoEndData', mindmap.saveEndtoEndData);
        app.post('/excelToMindmap', mindmap.excelToMindmap);
        app.post('/getScreens',mindmap.getScreens);
        app.post('/exportToExcel',mindmap.exportToExcel);
        app.post('/getDomain',mindmap.getDomain);

        //Login Routes
        app.post('/authenticateUser_Nineteen68', login.authenticateUser_Nineteen68);
        app.post('/checkUserState_Nineteen68', login.checkUserState_Nineteen68);
        app.post('/loadUserInfo_Nineteen68', login.loadUserInfo_Nineteen68);
        app.post('/getRoleNameByRoleId_Nineteen68', login.getRoleNameByRoleId_Nineteen68);
        app.post('/logoutUser_Nineteen68', login.logoutUser_Nineteen68);
        //Admin Routes
        app.post('/getUserRoles_Nineteen68', admin.getUserRoles_Nineteen68);
        app.post('/getDomains_ICE', admin.getDomains_ICE);
        app.post('/createProject_ICE', admin.createProject_ICE);
        app.post('/updateProject_ICE', admin.updateProject_ICE);
        app.post('/getNames_ICE', admin.getNames_ICE);
        app.post('/getDetails_ICE', admin.getDetails_ICE);
        app.post('/assignProjects_ICE', admin.assignProjects_ICE);
        app.post('/getAssignedProjects_ICE', admin.getAssignedProjects_ICE);
        app.post('/getAvailablePlugins', admin.getAvailablePlugins);
        app.post('/manageSessionData', admin.manageSessionData);
        app.post('/manageUserDetails', admin.manageUserDetails);
        app.post('/getUserDetails', admin.getUserDetails);
        app.post('/testLDAPConnection', admin.testLDAPConnection);
        app.post('/getLDAPConfig', admin.getLDAPConfig);
        app.post('/manageLDAPConfig', admin.manageLDAPConfig);
        app.post('/generateCItoken', admin.generateCItoken);

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
        //Execute Screen Routes
        app.post('/readTestSuite_ICE', suite.readTestSuite_ICE);
        app.post('/updateTestSuite_ICE', suite.updateTestSuite_ICE);
        //app.post('/updateTestScenario_ICE', suite.updateTestScenario_ICE);
        app.post('/ExecuteTestSuite_ICE', suite.ExecuteTestSuite_ICE);
        app.post('/getTestcaseDetailsForScenario_ICE', suite.getTestcaseDetailsForScenario_ICE);
        app.post('/ExecuteTestSuite_ICE_CI', suite.ExecuteTestSuite_ICE_CI);
        //app.post('/readTestScenarios_ICE', suite.readTestScenarios_ICE);

        //SVN execution routes
        app.post('/ExecuteTestSuite_ICE_SVN', suite.ExecuteTestSuite_ICE_SVN);
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
        // app.post('/getMainReport_ICE', report.getMainReport_ICE);
        app.post('/getReport_Nineteen68', report.getReport_Nineteen68);
        app.post('/exportToJson_ICE', report.exportToJson_ICE);
        app.post('/openScreenShot', report.openScreenShot);
        app.post('/connectJira_ICE', report.connectJira_ICE);
        app.post('/getReportsData_ICE', report.getReportsData_ICE);
        //Plugin Routes
        app.post('/getProjectIDs_Nineteen68', plugin.getProjectIDs_Nineteen68);
        app.post('/getTaskJson_mindmaps', taskbuilder.getTaskJson_mindmaps);
        app.post('/updateTaskstatus_mindmaps', taskbuilder.updateTaskstatus_mindmaps);
        //Utility plugins
        app.post('/Encrypt_ICE', utility.Encrypt_ICE);
        // Wecoccular Plugin
        app.post('/crawResults', webocular.getCrawlResults);
        //Chatbot Routes
        app.post('/getTopMatches_ProfJ', chatbot.getTopMatches_ProfJ);
        app.post('/updateFrequency_ProfJ', chatbot.updateFrequency_ProfJ);
        //NeuronGraphs Plugin Routes
        app.post('/getGraph_nGraphs2D', neuronGraphs2D.getGraphData);
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
        // Automated Path Generator Routes
        app.post('/flowGraphResults', flowGraph.flowGraphResults);
        app.post('/APG_OpenFileInEditor', flowGraph.APG_OpenFileInEditor);
        app.post('/APG_createAPGProject', flowGraph.APG_createAPGProject);

        //-------------SERVER START------------//
        function initServer(httpsServer,suite,logger,epurl,apiclient){
            httpsServer.listen(portNumber, hostFamilyType); //Https Server
            try {
                var apireq = apiclient.post(epurl + "server", function(data, response) {
                    try {
                        if (response.statusCode != 200) {
                            httpsServer.close();
                            logger.error("Please run the Service API and Restart the Server");
                        } else {
                            suite.reScheduleTestsuite();
                            console.info("Nineteen68 Server Ready...\n");
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
        }

        var hostFamilyType = (nginxEnabled) ? '127.0.0.1' : '0.0.0.0';
        var portNumber = process.env.serverPort;
        if (authStrategy=='oidc') {
            auth.on('ready', () => {
                initServer(httpsServer,suite,logger,epurl,apiclient);
            });
        } else {
            initServer(httpsServer,suite,logger,epurl,apiclient);
        }
        //-------------SERVER END------------//

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
            if (err.message == "redisnotavailable") {
                ecode = "600";
                emsg = "Redis Database unavailable";
            }
            logger.error(err.message);
            res.status(500).send("<html><body><p>[ECODE "+ecode+"] Internal Server Error Occurred!</p></body></html>");
        });
    } catch (e) {
        logger.error(e);
        setTimeout(function() {
            cluster.worker.kill();
        }, 200);
    }
}
