# Nineteen68 Version 2.0 UI

Webserver Component of Nineteen68 V2.0.

## Configuration

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Run `Cassandra` DB
* Run `Redis` DB
* Run `Mindmaps` DB(Neo4j)
* Run `NDAC` API

### Setup

* Clone this repository
* Get a copy of node modules, node.exe and npm.cmd files from `UINodeModules.git` repository and place it inside the source folder.
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
* **Node JS** :  Web Server
* **Express JS** : Web framework
* **Angular JS** : UI component framework
* **Bootstrap** : UI design library
* **Specific Plugins**: d3.v3.min.js, dtree.m.scrapper.js, jquery.blockUI.js, jquery.jqGrid.min.js, jquery.mask.js, loading-bar.js, scroll.js

## Lincese

Copyright © 2018 SLK Software Services Pvt. Ltd. All Rights Reserved.
