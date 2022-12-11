import React, { useEffect, useState, useRef } from 'react';
import { NormalDropDown, TextField, Card, SearchBox } from '@avo/designcomponents';
import { Icon } from "@fluentui/react/lib/Icon";
import { Header, FooterOne, RedirectPage } from '../../global';
import "../styles/Genius.scss";
import { getProjectList, getModules, saveMindmap } from '../../mindmap/api';
import { ScreenOverlay, setMsg, ResetSession, Messages as MSG } from '../../global';
import { Dialog } from 'primereact/dialog';
import { parseProjList } from '../../mindmap/containers/MindmapUtils';
import { useHistory } from 'react-router-dom';
import * as DesignApi from "../../design/api";
import * as PluginApi from "../../plugin/api";
import * as mindmapActionTypes from "../../mindmap/state/action";
import GeniusMindmap from "../../mindmap/containers/GeniusMindmap";
import { useSelector, useDispatch } from 'react-redux';

let port = null;
var editorExtensionId = "mnigbjhmoafjckljdgkocmghllegjefk";

const Genius = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [allProjects, setAllProjects] = useState({})
  const [projModules, setProjModules] = useState([])
  const [modScenarios, setModScenarios] = useState([])
  const [appType, setAppType] = useState(null);
  const [appTypeDialog, setAppTypeDialog] = useState(null)
  const [navURL, setNavURL] = useState("")
  const [selectedBrowser, setSelectedBrowser] = useState("chrome");
  const [blockui, setBlockui] = useState({ show: false })
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState(false);
  const [displayCreateProject, setDisplayCreateProject] = useState(false);
  const [displayCreateModule, setDisplayCreateModule] = useState(false);
  const [displayCreateScenario, setDisplayCreateScenario] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [scenarioName, setScenarioName] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [assignedUsers, setAssignedUsers] = useState({});
  const [userDetailList, setUserDetailList] = useState([]);
  const [plugins_list, setplugins_list] = useState([]);
  const moduleSelect = useSelector(state => state.mindmap.selectedModule);
  const userInfo = useSelector(state => state.login.userinfo);
  const savedRef = useRef(false);
  const finalDataRef = useRef([])
  const dispatch = useDispatch();
  const history = useHistory();

  const displayError = (error) => {
    console.log(error)
    setBlockui({ show: false })
    setLoading(false)
    setMsg(typeof error === "object" ? error : MSG.CUSTOM(error, "error"))
  }

  const backgroundListener = async (data) => {
    debugger;
    if (data === "getMindmap") {
      loadModule(selectedModule.key, selectedProject.key);
    }
    else if (data === "disconnect") {
      setLoading(false);
    }
    else if (data.action && data.action === "startDebugging") {
      if (savedRef.current) {
        finalDataRef.current = data;
        const firstStep = {
          "stepNo": 1,
          "custname": "@Browser",
          "keywordVal": "openBrowser",
          "objectName": "",
          "inputVal": [
            ""
          ],
          "outputVal": "",
          "appType": "Web",
          "remarks": "",
          "addDetails": "",
          "cord": "",
          "url": ""
        };
        try {

          let index = 2;
          const res = await DesignApi.debugTestCase_ICE(["1"], [firstStep, ...finalDataRef.current.data.screens.reduce((acc, curr) => {
            let dataObjectsArr = curr.data_objects;
            let dataObjectsObj = {}
            dataObjectsArr.forEach((d_obj) => {
              if (d_obj.tempOrderId)
                dataObjectsObj[d_obj.tempOrderId] = d_obj
            })
            let testcasesArr = curr.testcases.map((tc, idx) => {
              tc["stepNo"] = index++;
              tc['objectName'] = ""; tc['url'] = ""; tc['addTestCaseDetailsInfo'] = ""; tc['addTestCaseDetails'] = '';
              if ('addDetails' in tc) {
                tc['addTestCaseDetailsInfo'] = tc['addDetails']
                delete tc['addDetails']
              }
              if (tc['custname'] === "@Custom") {
                tc['objectName'] = "@Custom";
                return tc;
              }
              if ('custname' in tc && "tempOrderId" in tc) {
                if (tc["tempOrderId"] in dataObjectsObj) {
                  tc['objectName'] = dataObjectsObj[tc["tempOrderId"]]["tag"] === "browser_navigate" ? "" : dataObjectsObj[tc["tempOrderId"]]['xpath']
                  tc['url'] = 'url' in dataObjectsObj[tc["tempOrderId"]] ? dataObjectsObj[tc["tempOrderId"]]['url'] ? dataObjectsObj[tc["tempOrderId"]]['url'] : "" : "";
                  tc['cord'] = 'cord' in dataObjectsObj[tc["tempOrderId"]] ? dataObjectsObj[tc["tempOrderId"]]['cord'] ? dataObjectsObj[tc["tempOrderId"]]['cord'] : "" : ""
                }
              }
              return tc;
            })

            return acc.concat(...testcasesArr)
          }, [])], userInfo, appType && appType.key ? appType.text : "", true)
        } catch (err) {
          console.log(err)
        }
      }
    }
    else if (typeof data === "object") {
      try {
        const scenarioData = getExcludedMindmapInternals(modScenarios, selectedScenario.key);
        const res = await PluginApi.getGeniusData(data, scenarioData);
        savedRef.current = true;
        // finalDataRef.current = data;
        if (port) port.postMessage({
          "saved": true
        });
      }
      catch (err) {
        console.log(err)
      }
    }
    else if (data === "pleaseBeConnected") {
      console.log("got the message for being connected")
    }
    else {
      console.log(data);
    }
  };

  const templateForMindmapSaving = (scenario) => {
    return {
      "testscenarioid": scenario._id,
      "testscenarioName": scenario.name,
      "tasks": null,
      "screenDetails": scenario.children.map((screen, idx) => {
        return {
          "screenid": screen._id,
          "screenName": screen.name,
          "task": null,
          "testcaseDetails": screen.children.map((testcase, idx) => {
            return {
              "screenid": screen._id,
              "testcaseid": testcase._id,
              "testcaseName": testcase.name,
              "task": null,
              "state": "saved",
              "childIndex": testcase.childIndex
            }
          }),
          "state": "saved",
          "childIndex": screen.childIndex
        }
      }),
      "state": "saved",
      "childIndex": scenario.childIndex
    }
  }
  const getExcludedMindmapInternals = (scenarios, excluded_scenario) => {
    let tempArr = [];
    // let scenarioPID = indexCounter;
    // let screenPID = indexCounter;
    scenarios.forEach((scenario, idx) => {
      if (scenario._id === excluded_scenario) { return };
      tempArr.push(templateForMindmapSaving(scenario));
    });
    return tempArr;
  }

  const loadModule = async (modID, projectId) => {
    dispatch({ type: mindmapActionTypes.SELECT_MODULE, payload: {} })
    var req = {
      tab: "tabCreate",
      projectid: projectId,
      version: 0,
      cycId: null,
      // modName:"",
      moduleid: [modID]
    }
    var res = await getModules(req)
    if (res.error) { displayError(res.error); return }
    dispatch({ type: mindmapActionTypes.SELECT_MODULE, payload: res });
  }

  const hideMindmap = () => {
    dispatch({ type: mindmapActionTypes.SELECT_MODULE, payload: {} })
  }

  const reconnectEx = () => {
    // port.onMessage.removeListener(backgroundListener); 
    port = undefined; connect()
  }
  useEffect(() => {
    if (port) {
      port.onMessage.removeListener(backgroundListener);
      port.onDisconnect.removeListener(reconnectEx)
      port.onMessage.addListener(backgroundListener);
      port.onDisconnect.addListener(reconnectEx)
    }
    return () => {
      if (port) {
        port.onMessage.removeListener(backgroundListener);
        port.onDisconnect.removeListener(reconnectEx)
      }
    }
  }, [selectedProject, selectedModule, selectedScenario, allProjects, projModules, modScenarios, appType && appType.key ? appType.text : "", navURL, selectedBrowser, blockui, loading, flag, moduleSelect, userInfo])

  useEffect(() => {
    (async () => {
      if (selectedProject && selectedProject.key) {
        setSelectedModule(null);
        setSelectedScenario(null);
        setAppType(null);
        var modulesdata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": null });
        if (modulesdata === "Invalid Session") return RedirectPage(history);
        if (modulesdata.error) { displayError(modulesdata.error); return; }
        setProjModules(modulesdata);
      }
    })()
  }, [selectedProject])

  useEffect(() => {
    (async () => {
      if (selectedModule && selectedModule.key) {
        setSelectedScenario(null);
        var moduledata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": [selectedModule.key], cycId: null })
        if (moduledata === "Invalid Session") return RedirectPage(history);
        if (moduledata.error) { displayError(moduledata.error); return; }
        setModScenarios(moduledata.children);
      }
    })()
  }, [selectedModule])

  useEffect(() => {
    console.log(window.chrome);
    // The ID of the extension we want to talk to.
    // Make a simple request:
    // setTimeout(() => {
    //   window.chrome.runtime.sendMessage(editorExtensionId, { siteURL: window.location.origin },
    //     function (response) {
    //       if (!response.success)
    //         console.log(response);
    //       else {
    //         console.log("succcess")
    //       }
    //     });
    // }, 2000);
    dispatch({ type: mindmapActionTypes.SELECT_MODULE, payload: {} })
    connect();
    (async () => {
      setBlockui({ show: true, content: 'Loading...' })
      let res = await getProjectList();
      if (res === "Invalid Session") return RedirectPage(history);
      if (res.error) { displayError(res.error); return; }
      var data = parseProjList(res)
      setAllProjects(data)
      res = await PluginApi.getUserDetails("user");
      if (res === "Invalid Session") return RedirectPage(history);
      if (res.error) {
        setMsg(MSG.CUSTOM("Error while fetching the user Details"));
      } else {
        let users = res.filter((user_arr) => !["5db0022cf87fdec084ae49a9", "5f0ee20fba8ae8b8a603b5b6"].includes(user_arr[2]))
        setUserDetailList(users);
      }
      res = await PluginApi.getAvailablePlugins();
      if (res === "Invalid Session") return RedirectPage(history);
      if (res.error) {
        setMsg(MSG.CUSTOM("Error while fetching the app Details"));
        return;
      } else {
        let txt = [];
        for (let x in res) {
          if (res[x] === true) {
            txt.push({
              key: x,
              text: x.charAt(0).toUpperCase() + x.slice(1),
              title: x.charAt(0).toUpperCase() + x.slice(1),
              disabled: false
            })
          }
          else {
            txt.push({
              key: x,
              text: x.charAt(0).toUpperCase() + x.slice(1),
              title: 'License Not Supported',
              disabled: true
            })
          }
        }
        setplugins_list(txt);
      }
    })()

    return () => {
      dispatch({ type: mindmapActionTypes.SELECT_MODULE, payload: {} })
    }
  }, [])

  const sendMessageToPort = (msg) => {
    if (port) port.postMessage(msg);
  }

  function connect() {
    if (window.chrome.runtime) {
      if (!port) {
        try {
          // setLoading("Genius Started...");
          port = window.chrome.runtime.connect(editorExtensionId, { "name": "avoassure" });
          port.onDisconnect.addListener(reconnectEx);
          port.onMessage.addListener(backgroundListener);
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          port.onMessage.removeListener(backgroundListener);
          port.onDisconnect.removeListener(reconnectEx);
          port = undefined;
          // setLoading("Genius Started...");
          port = window.chrome.runtime.connect(editorExtensionId, { "name": "avoassure" });
          port.onDisconnect.addListener(reconnectEx);
          port.onMessage.addListener(backgroundListener);
        } catch (err) {
          console.log(err);
        }
      }
    }
    else {
      setLoading(false);
      console.log("Extension not present");
    }
  }
  const createPort = (keywordData, idx = 0) => {
    if (window.chrome.runtime) {
      if (port) {
        try {
          // port = window.chrome.runtime.connect(editorExtensionId, { "name": "avoassue" });
          ResetSession.start();
          setLoading("Genius Started...");
          sendMessageToPort({
            "open": true,
            "project": selectedProject,
            "module": selectedModule,
            "scenario": selectedScenario,
            "navurl": (navURL.startsWith("http") || navURL.startsWith("https")) ? navURL : "https://" + navURL,
            "browser": selectedBrowser,
            "siteURL": window.location.origin,
            "keywordData": keywordData,
            "appType": appType ? appType.text : ""
          });
          // port.onDisconnect.addListener(() => {
          //   port = undefined;
          //   ResetSession.end();
          //   setLoading(false);
          // })
          // port.onMessage.addListener(backgroundListener);
        }
        catch (err) {
          // ResetSession.end();
          // if (idx < 3)
          //   createPort(keywordData, idx++);
          // else {
          //   port = undefined;
          //   setLoading(false);
          // }
          // console.log(err);
        }
      } else {
        // sendMessageToPort({
        //   "open": true,
        //   "project": selectedProject,
        //   "module": selectedModule,
        //   "scenario": selectedScenario,
        //   "navurl": navURL,
        //   "browser": selectedBrowser,
        //   "siteURL": window.location.origin,
        //   "keywordData": keywordData,
        //   "appType": appType
        // });
      }

    }
    else {
      setLoading(false);
      console.log("Extension not present");
    }
  }

  const handleProjectCreate = async () => {
    try {
      if (!(appTypeDialog && appTypeDialog.key && projectName)) {
        setMsg(MSG.CUSTOM("Please fill the mandatory fields", "error"));
        return;
      }
      const config = {
        "projectName": projectName,
        domain: "banking",
        appType: appTypeDialog ? appTypeDialog.text : undefined,
        releases: [{ "name": "R1", "cycles": [{ "name": "C1" }] }],
        assignedUsers
      }
      let proceed = false
      if (Object.keys(allProjects).length > 0) {
        for (let i of Object.values(allProjects)) {
          if (projectName.trim() === i.name) {
            displayError(MSG.ADMIN.WARN_PROJECT_EXIST);
            return;
          } else proceed = true;
        }
      }
      const res = await PluginApi.userCreateProject_ICE(config)
      if (res === "Invalid Session") return RedirectPage(history);
      if (res.error) { displayError(res.error); return; }
      if (res === "invalid_name_spl") {
        setMsg(MSG.CUSTOM("Project contains special characters", "error"));
        return;
      }
      setMsg(MSG.CUSTOM("Project Created Successfully", "success"));
      try {
        let response = await getProjectList();
        if (response === "Invalid Session") return RedirectPage(history);
        if (response.error) { displayError(response.error); return; }
        var data = parseProjList(response)
        setAllProjects(data);
        setDisplayCreateProject(false);
      } catch (err) {
        console.log(err)
      }
    }
    catch (err) {
      setMsg(MSG.CUSTOM("Failed to create Project", "error"));
      console.log(err);
    }
  }


  const handleModuleCreate = async (e) => {
    if (!(moduleName)) {
      setMsg(MSG.CUSTOM("Please fill the mandatory fields", "error"));
      return;
    }
    const regEx = /[~*+=?^%<>()|\\|\/]/;
    if (!(selectedProject && selectedProject.key)) {
      setMsg(MSG.CUSTOM("Please select a project", "error"))
      return;
    }
    else if (regEx.test(moduleName)) {
      setMsg(MSG.CUSTOM("Module name cannot contain special characters", "error"))
      return;
    }
    else if (projModules.filter((mod) => mod.name === moduleName).length > 0) {
      setMsg(MSG.CUSTOM("Module already exists", "error"));
      return;
    }
    const module_data = {
      "action": "/saveData",
      "write": 10,
      "map": [
        {
          "id": 0,
          "childIndex": 0,
          "_id": null,
          "oid": null,
          "name": moduleName,
          "type": "modules",
          "pid": null,
          "pid_c": null,
          "task": null,
          "renamed": false,
          "orig_name": null,
          "taskexists": null,
          "state": "created",
          "cidxch": null
        }
      ],
      "deletednode": [],
      "unassignTask": [],
      "prjId": selectedProject ? selectedProject.key : null,
      "createdthrough": "Web",
      "relId": null
    }
    try {
      const response = await saveMindmap(module_data);
      if (response === "Invalid Session") return RedirectPage(history);
      if (response.error) { displayError(response.error); return }
      setMsg(MSG.CUSTOM("Module Created Successfully", "success"));
      let modulesdata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": null });
      if (modulesdata === "Invalid Session") return RedirectPage(history);
      if (modulesdata.error) { displayError(modulesdata.error); return; }
      setProjModules(modulesdata);
      setDisplayCreateModule(false);
    } catch (err) {
      console.log(err);
    }
  }

  const validateNames = (value, type) => {
    if (value.length === 0) return (
      <>
        <Icon iconName="warning" styles={{ root: { display: "flex", height: 12, marginRight: 5 } }} />
        <div>Please enter {type} name</div>
      </>
    )
  };

  const templateObjectFunc = (prj_id, id, childIndex, _id, name, type, pid) => {
    return {
      "projectID": prj_id,
      "id": id,
      "childIndex": childIndex,
      "_id": _id,
      "oid": null,
      "name": name,
      "type": type,
      "pid": pid,
      "task": null,
      "renamed": false,
      "orig_name": null,
      "taskexists": null,
      "state": "saved",
      "cidxch": null
    }
  };

  const handleScenarioCreate = async () => {
    if (!(scenarioName)) {
      setMsg(MSG.CUSTOM("Please fill the mandatory fields", "error"));
      return;
    }
    const regEx = /[~*+=?^%<>()|\\|\/]/;
    if (!(selectedModule && selectedModule.key)) {
      setMsg(MSG.CUSTOM("Please select a module", "error"))
      return;
    }
    else if (regEx.test(scenarioName)) {
      setMsg(MSG.CUSTOM("Scenario name cannot contain special characters", "error"))
      return;
    }
    else if (modScenarios.filter((scenario) => scenario.name === scenarioName).length > 0) {
      setMsg(MSG.CUSTOM("Scenario already exists", "error"));
      return;
    }

    let indexCounter = 1;

    const getMindmapInternals = () => {
      let tempArr = [];
      let scenarioPID = indexCounter;
      let screenPID = indexCounter;
      modScenarios.forEach((scenario, idx) => {
        scenarioPID = indexCounter;
        tempArr.push(templateObjectFunc(scenario.projectID, indexCounter++, scenario.childIndex, scenario._id, scenario.name, "scenarios", 0));
        if (scenario.children && scenario.children.length > 0) {
          scenario.children.forEach((screen, idx_scr) => {
            screenPID = indexCounter;
            tempArr.push(templateObjectFunc(screen.projectID, indexCounter++, screen.childIndex, screen._id, screen.name, "screens", scenarioPID))
            if (screen.children && screen.children.length > 0) {
              screen.children.forEach((tc, idx_tc) => {
                tempArr.push(templateObjectFunc(tc.projectID, indexCounter++, tc.childIndex, tc._id, tc.name, "testcases", screenPID))
              })
            }
          })
        }
      });

      return tempArr;
    }

    const scenario_data = {
      "write": 10,
      "map": [
        {
          "projectID": selectedProject ? selectedProject.key : null,
          "id": 0,
          "childIndex": 0,
          "_id": selectedModule ? selectedModule.key : null,
          "oid": null,
          "name": selectedModule ? selectedModule.text : null,
          "type": "modules",
          "pid": null,
          "pid_c": null,
          "task": null,
          "renamed": false,
          "orig_name": null,
          "taskexists": null,
          "state": "saved",
          "cidxch": null
        },
        ...getMindmapInternals(),
        {
          "id": indexCounter,
          "childIndex": modScenarios.length + 1,
          "_id": null,
          "oid": null,
          "name": scenarioName,
          "type": "scenarios",
          "pid": 0,
          "task": null,
          "renamed": false,
          "orig_name": null,
          "taskexists": null,
          "state": "created",
          "cidxch": "true",
          "projectID": selectedProject ? selectedProject.key : null,
        }
      ],
      "deletednode": [],
      "unassignTask": [],
      "prjId": selectedProject ? selectedProject.key : null,
      "createdthrough": "Web"
    }
    try {
      const response = await saveMindmap(scenario_data);
      if (response === "Invalid Session") return RedirectPage(history);
      if (response.error) { displayError(response.error); return }
      setMsg(MSG.CUSTOM("Scenario Created Successfully", "success"));
      var moduledata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": [selectedModule.key], cycId: null })
      if (moduledata === "Invalid Session") return RedirectPage(history);
      if (moduledata.error) { displayError(moduledata.error); return; }
      setModScenarios(moduledata.children);
      setDisplayCreateScenario(false);
    } catch (err) {
      console.log(err);
    }
  }

  const resetGeniusFields = () => {
    setSelectedProject(null);
    setSelectedModule(null);
    setSelectedScenario(null);
    setAppType(null);
    setNavURL("");
    setSelectedBrowser("chrome");
  }

  return (
    <div className="plugin-bg-container">
      <Header />
      {loading ? <ScreenOverlay content={loading} /> : null}
      {moduleSelect !== undefined && Object.keys(moduleSelect).length !== 0 ? <GeniusMindmap displayError={displayError} setBlockui={setBlockui} moduleSelect={moduleSelect} verticalLayout={true} setDelSnrWarnPop={() => { }} hideMindmap={hideMindmap} /> : null}
      <Dialog header={'Create Project'} visible={displayCreateProject} style={{ fontFamily: 'LatoWeb', fontSize: '16px' }} onHide={() => { setSearchUsers(""); setProjectName(""); setAppTypeDialog(null); setAssignedUsers({}); setDisplayCreateProject(false) }}>
        <div>
          <div className='dialog__child'>
            <TextField required label='Enter Project Name' onGetErrorMessage={(value) => { return validateNames(value, "project") }} validateOnFocusOut={true} validateOnLoad={false} width='300px' placeholder='Enter Project Name' value={projectName} standard={true} onChange={(e) => { setProjectName(e.target.value.trim()) }} />
          </div>
          <div className='dialog__child'>
            <NormalDropDown
              label="Select Application Type"
              options={plugins_list}
              placeholder="Select Application Type"
              width="300px"
              required
              selectedKey={appTypeDialog ? appTypeDialog.key : null}
              onChange={(e, item) => {
                setAppTypeDialog(item)
              }}
            />
          </div>
          <div className='dialog__child' style={{ padding: "5px 0px", fontSize: "18px", fontFamily: "Mulish", fontWeight: 600, marginBottom: 0 }}> Users </div>
          <div className="dialog__child" id="projectCreateBox" style={{ height: '12rem', overflowY: "auto" }}>
            <div style={{ display: 'flex', width: "100%", marginTop: "10px" }}>
              <SearchBox
                placeholder="Enter Username"
                width="20rem"
                value={searchUsers}
                onClear={() => { setSearchUsers("") }}
                onChange={(e) => {
                  setSearchUsers(e.target.value.trim())
                }}
              />
            </div>
            <div>
              {userDetailList.map((user, index) => {
                return user[0].includes(searchUsers) ? <div key={index} className='display_project_box_list' style={{}} >
                  <input type='checkbox' disabled={userInfo.user_id === user[1]} defaultChecked={userInfo.user_id === user[1]} value={user[0]} onChange={(e) => {
                    if (e.target.checked) { setAssignedUsers({ ...assignedUsers, [user[1]]: true }) }
                    else {
                      setAssignedUsers((prevState) => {
                        delete prevState[user[1]]
                        return prevState;
                      })
                    }
                  }} />
                  <span >{user[0]} </span>
                </div> : null
              })}
            </div>
          </div>
          <div className='dialog__child' style={{ justifyContent: "flex-end", marginBottom: 0 }}>
            <button className="dialog__footer__action" onClick={handleProjectCreate}>{'Create'}</button>
          </div>
        </div>
      </Dialog>
      <Dialog header={'Create Module'} visible={displayCreateModule} style={{ fontFamily: 'LatoWeb', fontSize: '16px' }} onHide={() => { setModuleName(""); setDisplayCreateModule(false); }}>
        <div>
          <div className='dialog__child'>
            <TextField required label='Enter Module Name' onGetErrorMessage={(value) => { return validateNames(value, "module") }} validateOnFocusOut={true} validateOnLoad={false} width='300px' standard={true} placeholder='Enter Module Name' value={moduleName} onChange={(e) => { setModuleName(e.target.value.trim()) }} />
          </div>
          <div className='dialog__child' style={{ justifyContent: "flex-end", marginBottom: 0 }}>
            <button className="dialog__footer__action" onClick={handleModuleCreate}>{'Create'}</button>
          </div>
        </div>
      </Dialog>
      <Dialog header={'Create Scenario'} visible={displayCreateScenario} style={{ fontFamily: 'LatoWeb', fontSize: '16px' }} onHide={() => { setScenarioName(""); setDisplayCreateScenario(false); }}>
        <div>
          <div className='dialog__child'>
            <TextField required label='Enter Scenario Name' onGetErrorMessage={(value) => { return validateNames(value, "scenario") }} validateOnFocusOut={true} validateOnLoad={false} width='300px' standard={true} placeholder='Enter Scenario Name' value={scenarioName} onChange={(e) => { setScenarioName(e.target.value.trim()) }} />
          </div>
          <div className='dialog__child' style={{ justifyContent: "flex-end", marginBottom: 0 }}>
            <button className="dialog__footer__action" onClick={handleScenarioCreate}>{'Create'}</button>
          </div>
        </div>
      </Dialog>
      <div className='plugin-elements'>
        <h3 style={{ margin: "1rem 0 1rem 1rem" }}>Welcome To Avo Genius</h3>
        <div className="breadcrumbs__container">
          <ol className="breadcrumbs__elements" style={{ listStyle: "none", display: "flex", gap: "2rem", flex: 1 }}>
            <li className="breadcrumbs__element__inner" data-value="">
              <span className="containerSpan"><span className="styledSpan">Select Project Details</span></span>
            </li>
            <li className="breadcrumbs__element__inner" data-value="disabled">
              <span className="containerSpan"><span className="styledSpan">Record Test Cases</span></span>
            </li>
            <li className="breadcrumbs__element__inner" data-value="disabled">
              <span className="containerSpan"><span className="styledSpan">Execute with Avo Assure</span></span>
            </li>
          </ol>
        </div>
        <h4 style={{ margin: "1rem 0 1rem 1rem" }}>
          {/* <IconButton icon="chevron-up" onClick={() => { }} variant="borderless" /> */}
          <span style={{ marginLeft: "0.5rem" }}>Select/Create Project Details</span>
        </h4>
        <div style={{
          display: "flex",
          flexDirection: 'row',
          margin: 10,
          marginLeft: "1.5rem",
          gap: 50
        }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 7, right: 0, color: "#5F338F", cursor: "pointer" }} onClick={async () => {
              setDisplayCreateProject(true)
            }}>+ New Project</div>
            <NormalDropDown
              label="Select Project"
              options={
                Object.values(allProjects).map((proj) => {
                  return {
                    key: proj.id,
                    text: proj.name
                  }
                })
              }
              onChange={(e, item) => {
                setSelectedProject(item)
              }}
              placeholder="Select a project"
              width="300px"
              required
              selectedKey={selectedProject ? selectedProject.key : null}
            />
          </div>

          <div style={{ position: "relative" }}>
            <div className="create__button" style={{ position: "absolute", top: 7, right: 0, color: "#5F338F", cursor: "pointer" }} data-attribute={!(selectedProject && selectedProject.key) ? "disabled" : ""} onClick={() => { setDisplayCreateModule(true); }}>+ New Module</div>
            <NormalDropDown
              label="Select Module"
              options={projModules.map((mod) => {
                return {
                  key: mod._id,
                  text: mod.name
                }
              })}
              onChange={(e, item) => {
                setSelectedModule(item)
              }}
              selectedKey={selectedModule ? selectedModule.key : null}
              placeholder="Select a module"
              width="300px"
              disabled={!(selectedProject && selectedProject.key)}
              required
            />
          </div>

          <div style={{ position: "relative" }}>
            <div className="create__button" data-attribute={!(selectedModule && selectedModule.key) ? "disabled" : ""} style={{ position: "absolute", top: 7, right: 0, color: "#5F338F", cursor: "pointer" }} onClick={() => { setDisplayCreateScenario(true) }}>+ New Scenario</div>
            <NormalDropDown
              label="Select Scenario"
              options={modScenarios.map((scenario) => {
                return {
                  key: scenario._id,
                  text: scenario.name
                }
              })}
              onChange={(e, item) => {
                setSelectedScenario(item)
              }}
              selectedKey={selectedScenario ? selectedScenario.key : null}
              placeholder="Select a scenario"
              width="300px"
              disabled={!(selectedModule && selectedModule.key)}
              required
            />
          </div>

        </div>

        <div style={{
          display: "flex",
          flexDirection: 'row',
          margin: "0 10px 1rem 10px",
          marginLeft: "1.5rem",
          gap: 50
        }}>
          <div>
            <NormalDropDown
              label="Application Type"
              options={[
                selectedProject && allProjects[selectedProject.key] ?
                  {
                    key: allProjects[selectedProject.key].apptype,
                    text: allProjects[selectedProject.key].apptypeName
                  }
                  : {}
              ]}
              placeholder="Select Application Type"
              width="300px"
              disabled={!(selectedProject && selectedProject.key)}
              required
              selectedKey={appType ? appType.key : null}
              onChange={(e, item) => {
                setAppType(item)
              }}
            />
            {/* <button style={{ background: "transparent", color: "#5F338F", border: "none" }} onClick={() => { }}><span style={{ fontSize: "1.2rem" }}>+</span> Create New Project Details</button> */}

          </div>
          <div>
            <TextField
              label="Enter Navigation URL"
              onChange={(e) => { setNavURL(e.target.value) }}
              placeholder="https://www.google.com"
              standard
              value={navURL}
              width="300px"
              required
              type="url"
              disabled={(appType && appType.key ? !appType.text.toLowerCase().includes("web") : true)}
            />
          </div>
          {/* <div id="icon-dropdown-container">
            <NormalDropDown
              label="Select Browser"
              id="icon-normal-dropdown"
              options={
                [{
                  data: {
                    icon: "chrome-icon"
                  },
                  key: 'chrome',
                  text: 'Google Chrome'
                }]}
              onChange={(e, item) => {
                setSelectedBrowser(item)
              }}
              placeholder="Select a browser"
              selectedKey={selectedBrowser}
              width="300px"
              required
              disabled={(appType && appType.key ? !appType.text.toLowerCase().includes("web") : true)}
            />
          </div> */}
        </div>

        <h4 style={{ margin: "1rem 0 1rem 1rem" }}>
          {/* <IconButton icon="chevron-up" onClick={() => { }} variant="borderless" /> */}
          <span style={{ marginLeft: "0.5rem" }}>Recent Scenarios</span></h4>
        <div id="recentScenario__cards__container" style={{ display: "flex", flexDirection: 'row', margin: "0 10px", marginLeft: "1.5rem" }}>
          <Card
            style={{
              width: "100%",
              height: 170,
              maxWidth: "25%",
              backgroundColor: "white",
              padding: 10,
            }}
          >
            <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>Test_Scenario_1</div>
            <div style={{ fontSize: "0.8rem" }}>{`Project_1 >> Module_1 >> Scenario_1`}</div>
            <div style={{ fontSize: "0.7rem", color: "#777" }}>{`Last modified on 21st Jan 2021 by s.kaman`}</div>
            <div style={{ fontSize: "0.7rem", color: "#777" }}>{`Last executed on 21st Jan 2021 by s.kaman`}</div>
            <div style={{ display: "flex", flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Icon styles={{ root: { display: "flex" } }} iconName='web-icon'></Icon>
              <div style={{ display: "flex", gap: "10px" }}>
                <Icon styles={{ root: { display: "flex", cursor: "pointer" } }} iconName='pin-icon'></Icon>
                <Icon styles={{ root: { display: "flex", cursor: "pointer" } }} iconName='delete-icon'></Icon>
              </div>
            </div>
          </Card>
        </div>
        <div>
          <div className="genius__actionButtons" style={{ display: "flex", justifyContent: "space-between", margin: "2rem 1rem 1rem 1rem", alignItems: "center" }}>
            <div onClick={() => { window.localStorage['navigateScreen'] = "plugin"; history.replace('/plugin'); }} className="exit-action" style={{ color: "#5F338F", textDecoration: "none", fontSize: "1.2rem", cursor: "pointer" }}>EXIT</div>
            <div className="actionButton__inner" style={{ display: "flex", gap: 10 }}>
              <button className="reset-action__exit" style={{ border: "2px solid #5F338F", color: "#5F338F", borderRadius: "10px", padding: "8px 25px", background: "white" }} onClick={resetGeniusFields}>Reset</button>
              <button className="reset-action__next"
                disabled={!(selectedProject && selectedModule && selectedScenario && navURL && (appType ? appType.text : ""))}
                style={{ border: "2px solid #5F338F", color: "white", borderRadius: "10px", padding: "8px 25px", background: "#5F338F" }} onClick={(e) => {
                  // let eURL = `electron-fiddle://project=${JSON.stringify(selectedProject)}&module=${JSON.stringify(selectedModule)}&scenario=${JSON.stringify(selectedScenario)}&navurl=${navURL}&browser=${selectedBrowser}`
                  // window.location.href = eURL;
                  DesignApi.getKeywordDetails_ICE(appType.text)
                    .then(keywordData => {
                      if (keywordData === "Invalid Session") return RedirectPage(history);
                      createPort(keywordData);
                      // port.postMessage({ joke: "Knock knock" });
                    })
                    //   window.chrome.runtime.sendMessage(editorExtensionId, {
                    //     "open": true,
                    //     "project": selectedProject,
                    //     "module": selectedModule,
                    //     "scenario": selectedScenario,
                    //     "navurl": navURL,
                    //     "browser": selectedBrowser,
                    //     "siteURL": window.location.origin,
                    //     "keywordData": keywordData
                    //   },
                    //     function (response) {
                    //       if (!response.success)
                    //         console.log(response);
                    //       else {
                    //         console.log("success")
                    //       }
                    //     });
                    // })
                    .catch((err) => { console.log("error"); setLoading(false); })
                }
                }>
                Next
              </button>
            </div>
          </div>

          <div className="reminder__container" style={{ display: "flex", margin: "0px 1rem" }}><span className='asterisk' style={{ color: "red" }}>*</span>&nbsp;Mandatory Fields</div>
        </div>
      </div>
      <FooterOne />
    </div>
  );
};

export default Genius;