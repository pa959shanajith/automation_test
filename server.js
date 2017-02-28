var express = require('express');
var app = express();
var server = require('http').createServer(app); 
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var morgan = require('morgan');


module.exports = app;
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(morgan('combined'))

//write stream for logs
//var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})

//setup the logger
//app.use(morgan('combined', {stream: accessLogStream}))

//serve all asset files from necessary directories
app.use("/js", express.static(__dirname + "/public/js"));
app.use("/imgs", express.static(__dirname + "/public/imgs"));
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/fonts", express.static(__dirname + "/public/fonts"));



app.get("/", function(req, res) {
	// console.log("/--------",req);
	res.sendFile("index.html", { root: __dirname + "/public/" });
});
app.get('/partials/:name', function(req, res){
	// console.log("/partials-----",req);
	res.sendFile(__dirname + "/public/partials/"+ req.params.name); //To render partials
});
app.get('*', function(req, res){
	// console.log("*--------",req);
	res.sendFile("index.html", { root: __dirname + "/public/" });
});
app.post('/designTestCase', function(req, res){
	// console.log("*--------",req);
	res.sendFile("index.html", { root: __dirname + "/public/" });
});

//Route Directories
var login = require('./server/controllers/login');
var admin = require('./server/controllers/admin');
var design = require('./server/controllers/design');
var suite = require('./server/controllers/suite');
var report = require('./server/controllers/report');
var header = require('./server/controllers/header');


//Login Routes
app.post('/authenticateUser_Nineteen68', login.authenticateUser_Nineteen68);
app.post('/loadUserInfo_Nineteen68', login.loadUserInfo_Nineteen68);
app.post('/getRoleNameByRoleId_Nineteen68', login.getRoleNameByRoleId_Nineteen68);
//Admin Routes
app.post('/getUserRoles_Nineteen68', admin.getUserRoles_Nineteen68);
app.post('/createUser_Nineteen68', admin.createUser_Nineteen68);
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
//Execute Screen Routes
app.post('/readTestSuite_ICE', suite.readTestSuite_ICE);
app.post('/updateTestSuite_ICE', suite.updateTestSuite_ICE);
app.post('/updateTestScenario_ICE', suite.updateTestScenario_ICE);
app.post('/ExecuteTestSuite_ICE', suite.ExecuteTestSuite_ICE);
//app.post('/readTestScenarios_ICE', suite.readTestScenarios_ICE);
//Report Screen Routes
app.post('/getAllSuites_ICE', report.getAllSuites_ICE);
app.post('/getSuiteDetailsInExecution_ICE', report.getSuiteDetailsInExecution_ICE);
app.post('/reportStatusScenarios_ICE', report.reportStatusScenarios_ICE);

//Generic Routes
app.post('/getProjectDetails_ICE', header.getProjectDetails_ICE);






//-------------SERVER START------------//
server.listen(3000);  

//SOCKET CONNECTION USING SOCKET.IO
var allClients = [];
var allSockets = [];
var socketMap = {};

io.on('connection', function (socket) {
//	console.log("Inside connection method");
	var address = socket.request.connection.remoteAddress;
//	console.log(address);
	socketMap[address] = socket;
//	console.log("socketMap", socketMap);
	socket.send('connected' );
	module.exports.allSocketsMap = socketMap;
	server.setTimeout();
	console.log("NO OF CLIENTS CONNECTED:", io.engine.clientsCount);
	socket.on('message', function(data){
		//console.log("SER", data);
	});

	allSockets.push(socket);


	allClients.push(socket.conn.id)
	module.exports.abc = allSockets;

	socket.on('disconnect', function() {     
		var i = allSockets.indexOf(socket);
		console.log('Socket Connection got disconnected!');
		allSockets.splice(i, 1);
//		console.log("------------------------SOCKET DISCONNECTED----------------------------------------");
		console.log("SOCKET LENGTH", allSockets.length);
	});

//	Socket Connection Failed
	socket.on('connect_failed', function() {
		console.log("Sorry, there seems to be an issue with the connection!");
	});

});
//SOCKET CONNECTION USING SOCKET.IO