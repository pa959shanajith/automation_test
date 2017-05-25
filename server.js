//Module Dependencies
var cluster = require('cluster');
if (cluster.isMaster) {
    //    cluster.fork();
    cluster.fork();
    cluster.on('disconnect', function(worker) {
        console.log('disconnect!');
        // cluster.fork();
    });
    cluster.on('exit', function(worker) {

        // Replace the dead worker,
        // we're not sentimental
        console.log('Let\'s not have Sentiments... Worker %d is killed.', worker.id);
        cluster.fork();
    });
} else {
    var express = require('express');
    var app = express();
    //var io = require('socket.io')(server);
    var bodyParser = require('body-parser');
    var morgan = require('morgan');
    var sessions = require('express-session')
    var cookieParser = require('cookie-parser');
    // var errorhandler = require('errorhandler');
    var cmd = require('node-cmd');
    var helmet = require('helmet');
    var fs = require('fs');
    //HTTPS Configuration
    var privateKey = fs.readFileSync('server/https/server.key', 'utf-8');
    var certificate = fs.readFileSync('server/https/server.crt', 'utf-8');
    var credentials = {
        key: privateKey,
        cert: certificate
    };
    var httpsServer = require('https').createServer(credentials, app);
    var io = require('socket.io')(httpsServer);
    module.exports = app;
    module.exports.allSocketsMap = {}
    app.use(bodyParser.json({
        limit: '5mb'
    }));
    app.use(bodyParser.urlencoded({
        limit: '5mb',
        extended: true
    }));
    app.use(morgan('combined'))
    app.use(cookieParser());
    app.use(sessions({
        secret: '$^%EDE%^tfd65e7ufyCYDR^%IU',
        path: '/',
        httpOnly: true,
        secure: false,
        rolling: true,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: (30 * 60 * 1000)
        }
    }));
    app.use(helmet());
    //write stream for logs
    //var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
    //setup the logger
    //app.use(morgan('combined', {stream: accessLogStream}))
    //serve all asset files from necessary directories
    app.use("/js", express.static(__dirname + "/public/js"));
    app.use("/imgs", express.static(__dirname + "/public/imgs"));
    app.use("/images_mindmap", express.static(__dirname + "/public/images_mindmap"));
    app.use("/css", express.static(__dirname + "/public/css"));
    app.use("/fonts", express.static(__dirname + "/public/fonts"));
    app.get("/", function(req, res) {
        // console.log("/--------",req);
        res.sendFile("index.html", {
            root: __dirname + "/public/"
        });
    });
    app.get('/partials/:name', function(req, res) {
        // console.log("/partials-----",req);
        res.sendFile(__dirname + "/public/partials/" + req.params.name); //To render partials
    });
    app.get('*', function(req, res) {
        if (req.cookies['connect.sid'] && req.cookies['connect.sid'] != undefined) {
            res.sendFile("index.html", {
                root: __dirname + "/public/"
            });
        } else {
            req.session.destroy(); //Clear Session
            res.status(200).send('<br><br>Your session has been expired. Please <a href="/">Login</a> Again');
        }
    });
    app.post('/designTestCase', function(req, res) {
        // console.log("*--------",req);
        res.sendFile("index.html", {
            root: __dirname + "/public/"
        });
    });
    // Mindmap Routes
    var api = require('./routes_mindmap/api.js');
    var home = require('./routes_mindmap/home.js');
    var index = require('./routes_mindmap/index.js');
    var templates = require('./routes_mindmap/tmTemplates.js');
    app.use('/home', home);
    app.use('/templates', templates);
    app.get('/import', api.importToNeo);
    app.get('/logout', api.logout);
    app.post('/casQuerya', api.casScriptA);
    app.post('/neoQuerya', api.neoScriptA);
    cmd.get('node index.js',
    		function(data, err, stderr){
    			if (!err) {
    			console.log('the node-cmd:',data)
    			} else {
    			//console.log('error', err)
				console.log('********************************* Port for jsreport is in use... *********************************');
    			}
    		}
    );
    //Route Directories
    var login = require('./server/controllers/login');
    var admin = require('./server/controllers/admin');
    var design = require('./server/controllers/design');
    var suite = require('./server/controllers/suite');
    var report = require('./server/controllers/report');
    var header = require('./server/controllers/header');
    var plugin = require('./server/controllers/plugin');
    //Login Routes
    app.post('/authenticateUser_Nineteen68', login.authenticateUser_Nineteen68);
    app.post('/loadUserInfo_Nineteen68', login.loadUserInfo_Nineteen68);
    app.post('/getRoleNameByRoleId_Nineteen68', login.getRoleNameByRoleId_Nineteen68);
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
    app.post('/updateTestScenario_ICE', suite.updateTestScenario_ICE);
    app.post('/ExecuteTestSuite_ICE', suite.ExecuteTestSuite_ICE);
    app.post('/getTestcaseDetailsForScenario_ICE', suite.getTestcaseDetailsForScenario_ICE);
    //app.post('/readTestScenarios_ICE', suite.readTestScenarios_ICE);
    //Report Screen Routes
    app.post('/getAllSuites_ICE', report.getAllSuites_ICE);
    app.post('/getSuiteDetailsInExecution_ICE', report.getSuiteDetailsInExecution_ICE);
    app.post('/reportStatusScenarios_ICE', report.reportStatusScenarios_ICE);
    app.post('/renderReport_ICE', report.renderReport_ICE);
    app.post('/getMainReport_ICE', report.getMainReport_ICE);
    app.post('/getReport_Nineteen68', report.getReport_Nineteen68);
    app.post('/exportToJson_ICE', report.exportToJson_ICE);
    //Generic Routes
    app.post('/getProjectDetails_ICE', header.getProjectDetails_ICE);
    app.post('/getReleaseNameByReleaseId_ICE', header.getReleaseNameByReleaseId_ICE);
    app.post('/getCycleNameByCycleId_ICE', header.getCycleNameByCycleId_ICE);
    //Logout Routes
    app.post('/logoutUser_Nineteen68', header.logoutUser_Nineteen68);
    //Plugin Routes
    app.post('/getProjectIDs_Nineteen68', plugin.getProjectIDs_Nineteen68);
    app.post('/getTaskJson_Nineteen68', plugin.getTaskJson_Nineteen68);

    //-------------SERVER START------------//
    //server.listen(3000);      //Http Server
    var hostFamilyType = '0.0.0.0';
	var portNumber=8443;
    httpsServer.listen(portNumber, hostFamilyType); //Https Server
	console.log("Nineteen68 Server Ready...")
    // httpsServer.listen(8443); //Https Server

    //To prevent can't send header response 
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

	//SOCKET CONNECTION USING SOCKET.IO
    var allClients = [];

    var allSockets = [];
    var socketMap = {};
    io.on('connection', function(socket) {
        // console.log("-------------------------------------------------------------------------------------------------------");
        var address = socket.request.connection.remoteAddress || socket.request.headers['x-forwarded-for'];
        // console.log("IPTYPE:::::", socket.request.connection.address().family);
        // console.log("socket.handshake.address:::::", socket.handshake.address);
        if (!(address in socketMap)) {
            socketMap[address] = socket;
        }
        socket.send('connected');
        module.exports.allSocketsMap = socketMap;
        httpsServer.setTimeout();

        socket.on('message', function(data) {
            //console.log("SER", data);
        });
        var socketFlag = false;
        if (allSockets.length > 0) {
            for (var socketIndexes = 0; socketIndexes < allSockets.length; socketIndexes++) {
                if (allSockets[socketIndexes].handshake.address.indexOf(socket.handshake.address) != -1) {
                    socketFlag = true;
                }
            }
        } else {
            allSockets.push(socket);
            allClients.push(socket.conn.id);
            socketFlag = true;
        }
        if (socketFlag == false) {
            allSockets.push(socket);
            allClients.push(socket.conn.id)
        }
        module.exports.abc = allSockets;
        socket.on('disconnect', function() {
            var i = allSockets.indexOf(socket);
            if (i > -1) {
                console.log('Socket Connection got disconnected for :', allSockets[i].handshake.address);
                delete socketMap[allSockets[i].handshake.address];
                allClients.splice(i, 1);
                allSockets.splice(i, 1);
                console.log("socketMap:", socketMap);
                module.exports.allSocketsMap = socketMap;
                //		console.log("------------------------SOCKET DISCONNECTED----------------------------------------");
                console.log("NO. OF CLIENTS CONNECTED:", allSockets.length);
            }
        });
        //	Socket Connection Failed
        socket.on('connect_failed', function() {
            console.log("Sorry, there seems to be an issue with the connection!");
        });
        console.log("NO. OF CLIENTS CONNECTED:", allSockets.length);
        // console.log("module.exports.allSocketsMap:", module.exports.allSocketsMap);
        // console.log("allSockets:::",socketMap)
    });
    //SOCKET CONNECTION USING SOCKET.IO

    // console.log("module.exports.allSocketsMap=-------------------------\n", module.exports.allSocketsMap);
}