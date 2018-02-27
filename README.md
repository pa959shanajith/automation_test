# Nineteen68 Version 2.0 UI

Webserver Component of Nineteen68 V2.0.

## Configuration

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Clone and Run [Cassandra](https://10.41.31.131/nineteen68v2.0/db) DB
* Clone and Run [Redis](ssh://slklocal@10.41.31.52:/home/slklocal/Nineteen68BnR/PortablePython.git
) DB
* Clone and Run [Mindmaps](https://10.41.31.131/nineteen68v2.0/Mindmap_DB) DB(Neo4j)
* Clone and Run [NDAC](https://10.41.31.131/nineteen68v2.0/ndac) API

### Setup

* Clone this repository
* Clone [UINodeModules.git](ssh://slklocal@10.41.31.52:/home/slklocal/Nineteen68BnR/UINodeModules.git) repository and place `node modules folder`, `node.exe` and `npm.cmd` files inside the source(`ui`) folder.
* Open the `config.json` file in `config` folder within `server` folder.
* Update `ldap_Ip` to ldap system ip 
* Update `ldap_port` to `389`
* Update `ldap_domain` to `psys.com`
* Fetch the `ip` of the system in which the `Mindmaps` db is setup
* Update the `host` in the following format : `<<IP of Mindmaps DB>>:7474`

                    E.g. for local setup: "127.0.0.1:7474"

* Do not modify `username` and `password` field.
* Update `screenShot_PathName`: Value should be, shared location in the server where the screenshots are stored. For local setup, provide a folder where screenshots should be saved.

					default: Shared location corresponding to windows systems
					mac: Shared location corresponding to mac systems
* Open the `.env` file present in the source folder.
* Update the value of `ENV` variable to `DEV` / `TEST` / `PROD` accrodingly.
* Update the `NDAC_IP` and `REDIS_IP` variables with the `IPs` on which NDAC/redis is running.
* Run the following command to start the server: ```npm start```
        

## Built with
* [Node JS](https://nodejs.org/) :  Web Server
* [Express JS](https://expressjs.com/) : Web framework
* [Angular JS](https://angularjs.org/) : UI component framework
* [Bootstrap](https://getbootstrap.com/) : UI design library
* **Specific Plugins**: d3.v3.min.js, dtree.m.scrapper.js, jquery.blockUI.js, jquery.jqGrid.min.js, jquery.mask.js, loading-bar.js, scroll.js

## Lincese

Copyright © 2018 SLK Software Services Pvt. Ltd. All Rights Reserved.
