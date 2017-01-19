/**
* Dependencies.
*/
var Hapi = require('hapi'),
    https = require('https'),
    hoek = require('hoek'),
    path = require('path'),
    vision = require('vision'),
    inert = require('inert'),
    fs = require('fs');

//Init Server
var server = new Hapi.Server();

//Server Connection
server.connection({
    host: 'localhost',
    address: '10.41.31.29',
    port: '443',
    tls: {
        key: fs.readFileSync('./server/https/privatekey.pem'),  
        cert: fs.readFileSync('./server/https/certificate.pem'),
        requestCert: false,   // Set to true if require client certificate authentication.
        ca: [] // Only necessary only if client is using the self-signed certificate.
    },
    labels: ['development', 'production'],
    routes: {
        security: true // turns on HSTS and other security headers
    }
}
);

//Logs 
const options = {
    ops: {
        interval: 1000
    },
    reporters: {
        myConsoleReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*' }]
        }, {
            module: 'good-console'
        }, 'stdout'],
        myFileReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ ops: '*' }]
        }, {
            module: 'good-squeeze',
            name: 'SafeJson'
        }, {
            module: 'good-file',
            args: ['./test/fixtures/nineteen68_log']
        }],
        myHTTPReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ error: '*' }]
        }, {
            module: 'good-http',
            args: ['http://prod.logs:3000', {
                wreck: {
                    headers: { 'x-api-key': 12345 }
                }
            }]
        }]
    }
}

//Add Plugins
var plugins = [
    {
        register: require('vision')   
    },
    {
        register: require('inert')    
    }
];


//Register Plugins
server.register(plugins, (err) => {
    hoek.assert(!err, err);
    server.views({
        engines: {
            html: require('swig')
        },
    });

//Route Directory
var base = require('./server/controllers/base');
var assets = require('./server/controllers/assets');
var login = require('./server/controllers/login');
var admin = require('./server/controllers/admin');

//Hapi Routes
server.route([
    { method: 'GET', path: '/imgs/{path*}', config: assets.imgs },                 
    { method: 'GET', path: '/css/{path*}', config: assets.css },                   
    { method: 'GET', path: '/js/{path*}', config: assets.js },                      
    { method: 'GET', path: '/fonts/{path*}', config: assets.fonts },               
    { method: 'GET', path: '/partials/{path*}', config: assets.partials },         
    { method: '*',   path: '/{path*}', handler: function (request, reply) { reply.view('./server/views/index', '') } },    
    { method: 'POST', path: '/authenticateUser_Nineteen68', config: login.authenticateUser_Nineteen68 }, 
    { method: 'POST', path: '/getUserRoles_Nineteen68', config: admin.getUserRoles_Nineteen68 }, 
    { method: 'POST', path: '/createUser_Nineteen68', config: admin.createUser_Nineteen68 }, 
    { method: 'POST', path: '/loadUserInfo_Nineteen68', config: login.loadUserInfo_Nineteen68 },  
    { method: 'POST', path: '/getRoleNameByRoleId_Nineteen68', config: login.getRoleNameByRoleId_Nineteen68 },  
    { method: '*', path: '/logoutUser', handler: function (request, reply) { reply.view('./server/views/index', '') } }
  ]);

});


// Start Server
server.register({
    register: require('good'),
    options,
}, (err) => {
    if (err) {
        return console.error(err);
    }
    server.start(() => {
        console.info(`Server started at ${ server.info.uri }`);
    });
 
});
