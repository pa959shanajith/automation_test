// Import the node-windows module
var nodewin = require('node-windows')
var Service = nodewin.Service;
var SERVER = 'WebServer';
var svcName = 'AvoAssureWebServer';
var svcScript = '.\\server.js';

nodewin.isAdminUser(function(isAdmin){
	if(isAdmin){
		// Create a new service object
		if(process.argv.length == 4 && process.argv[3] == 'FILESERVER'){
			SERVER = 'FileServer';
			svcName = 'AvoAssureFileServer';
			svcScript = '.\\server\\controllers\\fileserver.js';
		}
		var svc = new Service({
			name: svcName,
			description: 'Avo Assure '+SERVER+' Windows Service',
			script: svcScript,
			nodeOptions: [
				'--max_old_space_size=4096',
				'--optimize_for_size'
			]
		});
		// Listen for the "install" event, which indicates the
		// process is available as a service.
		svc.on('install',function(){
			console.log("Avo Assure "+SERVER+" service installed.");
		});

		// Listen for the "alreadyinstalled" event, which indicates the
		// process is already available as a service.
		svc.on('alreadyinstalled',function(){
			console.log("Avo Assure "+SERVER+" service is already installed.");
		});

		// Listen for the "uninstall" event so we know when it's done.
		svc.on('uninstall',function(){
			console.log("Avo Assure "+SERVER+" service uninstallation complete.");
		});

		// arg could be 'install', 'uninstall', 'start', 'stop', by default 'install' will be considered
		// perform operations based upon command line arguments

		arg = process.argv[2];
		if(arg){
			switch (arg){
				case 'install':
					svc.install();
					break;
				case 'uninstall':
					svc.uninstall();
					break;
				case 'start':
					console.log("Starting Avo Assure "+SERVER+" service...");
					svc.start();
					break;
				case 'stop':
					console.log("Stopping Avo Assure "+SERVER+" service...");
					svc.stop();
					break;
				default:
					console.log('Invalid command, allowed options are: install, uninstall, start, stop');	
					break;
			}
		}
		else{
			//no argument passed, considering install by default 
			svc.install();
		}
	}else{
		console.log("Running Avo Assure "+SERVER+" as windows service needs admin rights, kindly run this using admin rights")
	}
	
});