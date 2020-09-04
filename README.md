# Avo Assure Version 2.0 UI

Webserver Component of Avo Assure V2.0.

## Configuration

These instructions will help setting up the project and running on a local machine for development and testing purposes.

### Prerequisites

* Clone and Run [AvoAssureDB](https://10.41.31.131/nineteen68v2.0/db) DB
* Clone and Run [CacheDB](ssh://slklocal@10.41.31.52:/home/slklocal/Nineteen68BnR/redis.git) DB
* Clone and Run [Mindmaps](https://10.41.31.131/nineteen68v2.0/Mindmap_DB) DB(Neo4j)
* Clone and Run [LicenseServer](https://10.41.31.131/nineteen68v2.0/licenseserver) API
* Clone and Run [DAS](https://10.41.31.131/nineteen68v2.0/ndac) API


### Setup

* Clone this repository
* Clone [UINodeModules.git](ssh://slklocal@10.41.31.52:/home/slklocal/Nineteen68BnR/UINodeModules.git) repository and place `node modules folder`, `node.exe` and `npm.cmd` files inside the source(`ui`) folder.
* Open the `config.json` file in `config` folder within `server` folder.
* Update `screenShot_PathName`: Value should be, shared location in the server where the screenshots are stored. For local setup, provide a folder where screenshots should be saved.
    * ```default```: Shared location corresponding to windows systems
    * ```mac```: Shared location corresponding to mac systems
* Open the `.env` file present in the source folder.
* Update the value of `ENV` variable to `DEV` / `TEST` / `PROD` accrodingly.
* Update the `DAS_IP` and `CACHEDB_IP` variables with the `IPs` on which DAS and CacheDB are running.
* To start the server:
    * **In Normal Mode:** ```npm start```
    * **In Windows Service Mode:** ***(name of the service: avoassure_web_server)***
        * to install service and start: ```npm run service```
        * to start (for an already installed service): ```npm run service start```
        * to stop: ```npm run service stop```
        * to uninstall: ```npm run service uninstall```
        

## Built with
* [Node JS](https://nodejs.org/) :  Web Server
* [Express JS](https://expressjs.com/) : Web framework
* [Angular JS](https://angularjs.org/) : UI component framework
* [Bootstrap](https://getbootstrap.com/) : UI design library
* **Specific Plugins**: d3.v3.min.js, dtree.m.scrapper.js, jquery.blockUI.js, jquery.jqGrid.min.js, jquery.mask.js, loading-bar.js, scroll.js

## License

Copyright © 2020 Avo Automation. All Rights Reserved.
