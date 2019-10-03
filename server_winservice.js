// Import the node-windows module
var nodewin = require('node-windows')
var Service = nodewin.Service;
var SERVER = '';

nodewin.isAdminUser(function(isAdmin){
	if(isAdmin){
		// Create a new service object
		if(process.argv.length == 4 && process.argv[3] == 'FILESERVER'){
			 SERVER = 'FileServer'
			var svc = new Service({
		  name:'nineteen68FileServer',
		  description: 'Nineteen68 Fileserver Windows Service',
		  script: '.\\server\\controllers\\fileserver.js',
		  nodeOptions: [
			'--max_old_space_size=4096',
			'--optimize_for_size'
		  ]
		});
		}
		else{
			 SERVER = 'WebServer'
			var svc = new Service({
		  name:'nineteen68WebServer',
		  description: 'Nineteen68 Webserver Windows Service',
		  script: '.\\server.js',
		  nodeOptions: [
			'--max_old_space_size=4096',
			'--optimize_for_size'
		  ]
		});
		}
		// Listen for the "install" event, which indicates the
		// process is available as a service.
		svc.on('install',function(){
				console.log("Nineteen68 "+SERVER+" service installed.");
		});

		// Listen for the "alreadyinstalled" event, which indicates the
		// process is already available as a service.
		svc.on('alreadyinstalled',function(){
			console.log("Nineteen68 "+SERVER+" service is already installed.");
		});

		// Listen for the "uninstall" event so we know when it's done.
		svc.on('uninstall',function(){
		  console.log("Nineteen68 "+SERVER+" service uninstallation complete.");
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
					console.log("Starting Nineteen68 "+SERVER+" service...");
					svc.start();
					break;
				case 'stop':
					console.log("Stopping Nineteen68 "+SERVER+" service...");
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
		console.log("Running Nineteen68 "+SERVER+" as windows service needs admin rights, kindly run this using admin rights")
	}
	
});