var create_ice = require('../controllers/create_ice');
var logger = require('../../logger');
var utils = require('../lib/utils');

//getProjectIds
exports.getProjectIDs = async (req, res) => {
  const fnName = "getModules";
  logger.info("Inside UI service: " + fnName);
  try {
    var obj = req.body;
    obj.userid = req.session.userid;
    obj.userrole = req.session.defaultRole;
    const data = await create_ice.getProjectIDs(obj)  
    res.send(data)
  } catch (exception) {
    logger.error("Error occurred in mindmap/" + fnName + ":", exception);
    return res.status(500).send("fail");
  }
};

exports.updateAccessibilitySelection = async function (req, res) {
  logger.info("Inside UI service: updateAccessibiltySelection");
  var status = "fail";
  try {
    var result = await utils.fetchData(req.body, "/plugins/updateAccessibilitySelection");
    if (result != 'fail') status = "success";
    return res.send(status);
  } catch (e) {
    logger.error("Error occurred in updateAccessibilitySelection: %s", e);
    return res.send("fail");
  }
}
exports.userCreateProject_ICE = async (req, res) =>{
    const fnName = "userCreateProject_ICE";
    logger.info("Inside UI service: userCreateProject_ICE ");

    var status = "fail";
    const regEx= /[;~*+=?^%<>()|\\|\/]/;
    const createProjectObj=req.body;
		if (regEx.test(createProjectObj.projectName)) {
			logger.error("Error occurred in admin/"+fnName+": Special characters found in project name");
			return res.send("invalid_name_spl");
		}
		for(let rel of createProjectObj.releases) {
			if (regEx.test(rel.name)) {
				logger.error("Error occurred in admin/"+fnName+": Special characters found in release name");
				return res.send("invalid_name_spl");
			} else {
				for (let cyc of rel.cycles) {
					if(regEx.test(cyc.name)) {
						logger.error("Error occurred in admin/"+fnName+": Special characters found in cycle name");
						return res.send("invalid_name_spl");
					}
				}
			}
		}
    const userid = req.session.userid;
		const roleId = req.session.activeRoleId;
    createProjectObj.assignedUsers[userid] = true;
		const inputs = {
			name: createProjectObj.projectName,
			domain: createProjectObj.domain,
			type: createProjectObj.type,
			releases: createProjectObj.releases,
      assignedUsers:createProjectObj.assignedUsers,
			createdby: userid,
			createdbyrole: roleId,
			modifiedby: userid,
			modifiedbyrole: roleId
		};

    try {
      const valiproject = await utils.fetchData(inputs, "/hooks/validateProject");
		  if(valiproject.status === 'pass'){
        var result = await utils.fetchData(inputs,"/plugins/userCreateProject_ICE",fnName);
        if (result == "fail") {
          return res.send("fail");
        } else {
          return res.send(result)
        }
      }else {
        return res.send(valiproject);
      }
       

    } catch(exception) {

        logger.error("Error occurred in creating project :", exception);

        return res.send("fail");

    }
};

exports.validateProject = async (req, res) =>{
  const fnName = "validateProject";
  logger.info("Inside UI service: validateProject ");

  var status = "fail";
  const createProjectObj=req.body;
  const inputs = {
    query : "validateproject"
  }
   try {
    const validateproject = await utils.fetchData(inputs, "/hooks/validateProject");
    if(validateproject.status === 'pass'){
        return res.send(validateproject)
    }
    else{
      return res.send(validateproject)
    }
  } catch(exception) {
      logger.error("Error occurred in validating project :", exception);
      return res.send(validateproject);
  }
};

exports.userUpdateProject_ICE = async (req, res) =>{
    const fnName = "userUpdateProject_ICE"
    logger.info("Inside UI service: updateProject_ICE ");
    const createProjectObj=req.body;
    var status = "fail";
    const userid = req.session.userid;
    const roleId = req.session.activeRoleId;
    const inputs = {
        project_id: createProjectObj.project_id,
        domain: createProjectObj.domain,
        type: createProjectObj.appType,
        releases: createProjectObj.releases,
        assignedUsers:createProjectObj.assignedUsers,
        createdby: userid,
        createdbyrole: roleId,
        modifiedby: userid,
        modifiedbyrole: roleId
    };

    try {

        var result = await utils.fetchData(inputs,"/plugins/userUpdateProject_ICE", fnName);

        if(result != 'fail') status = "success";

        return res.send(status);

       

    } catch(exception) {

        logger.error("Error occurred in updating project :", exception);

        return res.send("fail");

    }

};

 

exports.getUsers_ICE = async (req, res) =>{
    const fnName = "getUsers_ICE"
    logger.info("Inside UI service: getUsers_ICE ");

    var status = "fail";

    try {

        var result = await utils.fetchData({"project_id":req.body.project_id},"/plugins/getUsers_ICE",fnName);

        if(result != 'fail') status = "success";

        return res.send(result);

    } catch(exception) {

        logger.error("Error occurred in getting users list:", exception);

        return res.send("fail");

    }

}

// Creating Scenario using AVO Genius Data 
exports.getGeniusData = async (req, res) => {
  const fnName = "getGeniusData";
  logger.info("Inside UI service: " + fnName);
  try {
    let screenNames=[]
    const body = req.body;
    const content = body.data.data;
    const reusedScreens= body.scrnreused
    for(let screen of content.screens){
        screenNames.push(screen.name)
    }
    const existing_data = body.snr_data;
    const completeScenraioDetials=body.completeScenraioDetials
    const currentScn=completeScenraioDetials.filter(scenario=>scenario.name===content.scenario.text)
    const migrationData = body.migrationData;
    const scenarios = content.scenario;

    // For Avo Genius Normal way
    if (!(migrationData.isMigrated)) {
      const inputs = {
        "data": {
          "projectid": content.project.key,
          "appType": content.appType,
          "testsuiteDetails": [
            {
              "testsuiteId": content.module.key,
              "testsuiteName": content.module.text,
              "task": null,
              "testscenarioDetails": [
                ...existing_data,
                {
                  "testscenarioid": content.scenario.key,
                  "testscenarioName": content.scenario.text,
                  "tasks": null,
                  "screenDetails": (currentScn[0].children.length===0 || reusedScreens.length!==0 )?content.screens.map((screen, idx) => {
                    return {
                      "screenid": null,
                      "screenName": screen.name,
                      "task": null,
                      "testcaseDetails": [
                        {
                          "screenid": null,
                          "testcaseid": null,
                          "testcaseName": "TC_" + screen.name,
                          "task": null,
                          "state": "created",
                          "childIndex": 1
                        }
                      ],
                      "state": "created",
                      "childIndex": idx + 1
                    }
                  }):
                  currentScn[0].children.map((screen, idx) => {
                    return {
                      "screenid": screen._id,
                      "screenName": screenNames[idx],
                      "task": null,
                      "testcaseDetails": [
                        {
                          "screenid": screen._id,
                          "testcaseid": screen.children[0]._id,
                          "testcaseName": "TC_" + screenNames[idx],
                          "task": null,
                          "state": "created",
                          "childIndex": 1
                        }
                      ],
                      "state": screenNames[idx]!==screen.name?"saved":"created",
                      "childIndex": screen.childIndex
                    }
                  }),
                  "state": "created",
                  "childIndex": 1
                }
              ],
              "state": "saved"
            }
          ],
          "versionnumber": 0,
          "newversionnumber": 0,
          "userid": req.session.userid,
          "userroleid": req.session.activeRoleId,
          "createdthrough": "Web",
          "deletednodes": []
        },
        "dataobjects": content.screens.map((screen, idx) => {
          return {
            "deletedObj": [],
            "modifiedObj": [],
            "projectid": content.project.key,
            "addedObj": {
              "scrapetype": "fs",
              "scrapedin": "",
              "view": (currentScn[0].children.length===0 || reusedScreens.length!==0)?screen["data_objects"]:[],
              "mirror": screen["screenshot"],
              "scrapedurl": screen["scrapedurl"],
              "action": "scrape"
            },
            "screenname": screen["name"],
            "userId": req.session.userid,
            "roleId": req.session.activeRoleId,
            "param": "saveScrapeData",
            "orderList": screen["data_objects"].map((d_obj) => {
              if (d_obj["custname"]) { return d_obj.tempOrderId }
            })
          }
        }),
        "testcasesteps": content.screens.map((screen, idx) => {
          return {
            "query": "updatetestcasedata",
            "modifiedby": req.session.userid,
            "projectid": content.project.key,
            "modifiedbyrole": req.session.activeRoleId,
            "testcasesteps": screen["testcases"],
            "versionnumber": 0,
            "screenname": screen["name"],
            "testcasename": "TC_" + screen["name"],
            "import_status": false,
            "copiedTestCases": [],
            "datatables": []
          }
        }),
        "migration": false
      }
      await utils.fetchData(inputs, "/create_ice/saveGeniusMindmap", fnName);
      await utils.fetchData(inputs, "/design/updateScreen_Genius", fnName);
      await utils.fetchData(inputs, "/design/updateTestCase_Genius", fnName);
    }
    // For Non Avo To Avo Migration
    else if (migrationData.isMigrated) {
      scenarios.map(async (scenario, index) => {
        const inputs = {
          "data": {
            "projectid": content.project.key,
            "appType": content.appType,
            "testsuiteDetails": [
              {
                "testsuiteId": content.module.key,
                "testsuiteName": content.module.text,
                "task": null,
                "testscenarioDetails": [
                  ...existing_data,
                  {
                    "testscenarioid": migrationData.scenariosCreated[index].key,
                    "testscenarioName": migrationData.scenariosCreated[index].text,
                    "tasks": null,
                    // (currentScn[0].children.length === 0 || reusedScreens.length !== 0)
                    "screenDetails": scenario.map((screen, idx) => {
                      return {
                        "screenid": null,
                        "screenName": screen.name,
                        "task": null,
                        "testcaseDetails": [
                          {
                            "screenid": null,
                            "testcaseid": null,
                            "testcaseName": "TC_" + screen.name,
                            "task": null,
                            "state": "created",
                            "childIndex": 1
                          }
                        ],
                        "state": "created",
                        "childIndex": idx + 1
                      }
                    }),
                    // :
                    // currentScn[0].children.map((screen, idx) => {
                    //   return {
                    //     "screenid": screen._id,
                    //     "screenName": screenNames[idx],
                    //     "task": null,
                    //     "testcaseDetails": [
                    //       {
                    //         "screenid": screen._id,
                    //         "testcaseid": screen.children[0]._id,
                    //         "testcaseName": "TC_" + screenNames[idx],
                    //         "task": null,
                    //         "state": "created",
                    //         "childIndex": 1
                    //       }
                    //     ],
                    //     "state": screenNames[idx] !== screen.name ? "saved" : "created",
                    //     "childIndex": screen.childIndex
                    //   }
                    // }),
                    "state": "created",
                    "childIndex": 1
                  }
                ],
                "state": "saved"
              }
            ],
            "versionnumber": 0,
            "newversionnumber": 0,
            "userid": req.session.userid,
            "userroleid": req.session.activeRoleId,
            "createdthrough": "Web",
            "deletednodes": []
          },
          "dataobjects": scenario.map((screen, idx) => {
            return {
              "deletedObj": [],
              "modifiedObj": [],
              "projectid": content.project.key,
              "addedObj": {
                "scrapetype": "fs",
                "scrapedin": "",
                // (currentScn[0].children.length===0 || reusedScreens.length!==0)?screen["data_objects"]:[],
                "view": screen.data_objects.length ? screen.data_objects : [],
                "mirror": screen["screenshot"],
                "scrapedurl": screen["scrapedurl"],
                "action": "scrape"
              },
              "screenname": screen["name"],
              "userId": req.session.userid,
              "roleId": req.session.activeRoleId,
              "param": "saveScrapeData",
              "orderList": screen["data_objects"].map((d_obj) => {
                if (d_obj["custname"]) { return d_obj.tempOrderId }
              })
            }
          }),
          "testcasesteps": scenario.map((screen, idx) => {
            return {
              "query": "updatetestcasedata",
              "modifiedby": req.session.userid,
              "projectid": content.project.key,
              "modifiedbyrole": req.session.activeRoleId,
              "testcasesteps": screen["testcases"],
              "versionnumber": 0,
              "screenname": screen["name"],
              "testcasename": "TC_" + screen["name"],
              "import_status": false,
              "copiedTestCases": [],
              "datatables": []
            }
          }),
          "migration": true
        };
        await utils.fetchData(inputs, "/create_ice/saveGeniusMindmap", fnName);
        await utils.fetchData(inputs, "/design/updateScreen_Genius", fnName);
        await utils.fetchData(inputs, "/design/updateTestCase_Genius", fnName);
      });
    };


    //third step - from dataobjects save in screens 
    res.send({ "status": "success" })
  } catch (exception) {
    logger.error("Error occurred in mindmap/" + fnName + ":", exception);
    return res.status(500).send("fail");
  }
};

// Creating Scenario using AVO Genius Data 
exports.getGeniusDataSAP = async (req, res) => {
  const fnName = "getGeniusData";
  logger.info("Inside UI service: " + fnName);
  try {
    let screenNames=[]
    const body = req.body;
    const content = body.data.data;
    const reusedScreens= body.scrnreused
    for(let screen of content.screens){
        screenNames.push(screen.name)
    }
    const existing_data = body.snr_data;
    const completeScenraioDetials=body.completeScenraioDetials
    const currentScn=completeScenraioDetials.filter(scenario=>scenario.name===content.scenario.text)

    const inputs = {
      "data": {
        "projectid": content.project.key,
        "appType": content.appType,
        "testsuiteDetails": [
          {
            "testsuiteId": content.module.key,
            "testsuiteName": content.module.text,
            "task": null,
            "testscenarioDetails": [
              ...existing_data,
              {
                "testscenarioid": content.scenario.key,
                "testscenarioName": content.scenario.text,
                "tasks": null,
                "screenDetails": content.screens.map((screen, idx) => {
                  return {
                    "screenid": null,
                    "screenName": screen.name,
                    "task": null,
                    "testcaseDetails": [
                      {
                        "screenid": null,
                        "testcaseid": null,
                        "testcaseName": "TC_" + screen.name,
                        "task": null,
                        "state": "created",
                        "childIndex": 1
                      }
                    ],
                    "state": "created",
                    "childIndex": idx + 1
                  }
                }),
                "state": "created",
                "childIndex": 1
              }
            ],
            "state": "saved"
          }
        ],
        "versionnumber": 0,
        "newversionnumber": 0,
        "userid": req.session.userid,
        "userroleid": req.session.activeRoleId,
        "createdthrough": "Web",
        "deletednodes": []
      },
      "dataobjects": content.screens.map((screen, idx) => {
        return {
          "deletedObj": [],
          "modifiedObj": [],
          "projectid": content.project.key,
          "addedObj": {
            "scrapetype": "fs",
            "scrapedin": "",
            "view": screen["data_objects"],
            "mirror": screen["screenshot"],
            "scrapedurl": screen["scrapedurl"],
            "action": "scrape"
          },
          "screenname": screen["name"],
          "userId": req.session.userid,
          "roleId": req.session.activeRoleId,
          "param": "saveScrapeData",
          "orderList": screen["data_objects"].map((d_obj) => {
            if (d_obj["custname"]) { return d_obj.tempOrderId }
          })
        }
      }),
      "testcasesteps": content.screens.map((screen, idx) => {
        return {
          "query": "updatetestcasedata",
          "modifiedby": req.session.userid,
          "projectid": content.project.key,
          "modifiedbyrole": req.session.activeRoleId,
          "testcasesteps": screen["testcases"],
          "versionnumber": 0,
          "screenname": screen["name"],
          "testcasename": "TC_" + screen["name"],
          "import_status": false,
          "copiedTestCases": [],
          "datatables": []
        }
      })
    }

    const result1 = await utils.fetchData(inputs, "/create_ice/saveGeniusMindmap", fnName);

    const result2 = await utils.fetchData(inputs, "/design/updateScreen_Genius", fnName);

    const result3 = await utils.fetchData(inputs, "/design/updateTestCase_Genius", fnName);


    //third step - from dataobjects save in screens 
    res.send({ "status": "success" })
  } catch (exception) {
    logger.error("Error occurred in mindmap/" + fnName + ":", exception);
    return res.status(500).send("fail");
  }
};