import React, { useEffect, useState } from 'react';
import { NormalDropDown, TextField, Card, IconButton } from '@avo/designcomponents';
import { Icon } from "@fluentui/react/lib/Icon";
import { Header, FooterOne, RedirectPage } from '../../global';
import "../styles/Genius.scss";
import { getProjectList, getModules, getScreens } from '../../mindmap/api';
import { ScreenOverlay, setMsg, ReferenceBar, ResetSession } from '../../global';
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
  const [appType, setAppType] = useState(null)
  const [navURL, setNavURL] = useState("")
  const [selectedBrowser, setSelectedBrowser] = useState(null);
  const [blockui, setBlockui] = useState({ show: false })
  const [loading, setLoading] = useState(true)
  const [flag, setFlag] = useState(false);
  const moduleSelect = useSelector(state => state.mindmap.selectedModule);
  const dispatch = useDispatch();
  const history = useHistory();

  const displayError = (error) => {
    setBlockui({ show: false })
    setLoading(false)
    setMsg(error)
  }

  const backgroundListener = async (data) => {
    debugger;
    if (data === "getMindmap") {
      loadModule(selectedModule.key, selectedProject.key);
      return
    }
    try {
      const res = await PluginApi.getGeniusData(data);
      if (port) port.postMessage({
        "saved": true
      });
    }
    catch (err) {
      console.log(err)
    }
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
        var moduledata = await getModules({
          "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": [selectedModule.key], cycId: null
        })
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

    (async () => {
      setBlockui({ show: true, content: 'Loading...' })
      var res = await getProjectList();
      if (res === "Invalid Session") return RedirectPage(history);
      if (res.error) { displayError(res.error); return; }
      var data = parseProjList(res)
      setAllProjects(data)
    })()

    return () => {
      dispatch({ type: mindmapActionTypes.SELECT_MODULE, payload: {} })
    }
  }, [])

  const sendMessageToPort = (msg) => {
    if (port) port.postMessage(msg);
  }
  const createPort = (keywordData, idx = 0) => {
    if (window.chrome.runtime) {
      if (!port) {
        try {
          port = window.chrome.runtime.connect(editorExtensionId, { "name": "avoassue" });
          ResetSession.start();
          sendMessageToPort({
            "open": true,
            "project": selectedProject,
            "module": selectedModule,
            "scenario": selectedScenario,
            "navurl": navURL,
            "browser": selectedBrowser,
            "siteURL": window.location.origin,
            "keywordData": keywordData,
            "appType": appType
          });
          port.onDisconnect.addListener(() => {
            port = undefined;
            ResetSession.end();
          })
          port.onMessage.addListener(backgroundListener);
        }
        catch (err) {
          ResetSession.end();
          if (idx < 3)
            createPort(keywordData, idx++);
          else
            port = undefined;
          console.log(err);
        }
      } else {
        sendMessageToPort({
          "open": true,
          "project": selectedProject,
          "module": selectedModule,
          "scenario": selectedScenario,
          "navurl": navURL,
          "browser": selectedBrowser,
          "siteURL": window.location.origin,
          "keywordData": keywordData,
          "appType": appType
        });
      }

    }
    else {
      console.log("Extension not present");
    }
  }

  return (
    <div className="plugin-bg-container">
      <Header />
      {moduleSelect !== undefined && Object.keys(moduleSelect).length !== 0 ? <GeniusMindmap displayError={displayError} setBlockui={setBlockui} moduleSelect={moduleSelect} verticalLayout={true} setDelSnrWarnPop={() => { }} hideMindmap={hideMindmap} /> : null}
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
          gap: 30
        }}>
          <div>
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
            />
          </div>

          <div>
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

          <div>
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
          gap: 30
        }}>
          <div>
            <NormalDropDown
              label="Apptype"
              options={[
                selectedProject && allProjects[selectedProject.key] ?
                  {
                    key: allProjects[selectedProject.key].apptype,
                    text: allProjects[selectedProject.key].apptypeName
                  }
                  : {}
              ]}
              placeholder="Select an apptype"
              width="300px"
              disabled={!(selectedProject && selectedProject.key)}
              required
              onChange={(e, item) => {
                setAppType(item.text)
              }}
            />
            <button style={{ background: "transparent", color: "#5F338F", border: "none" }} onClick={() => { }}><span style={{ fontSize: "1.2rem" }}>+</span> Create New Project Details</button>

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
              disabled={(appType ? !appType.toLowerCase().includes("web") : true)}
            />
          </div>
          <div id="icon-dropdown-container">
            <NormalDropDown
              label="Select Browser"
              id="icon-normal-dropdown"
              options={[
                {
                  data: {
                    icon: "chrome-icon"
                  },
                  key: 'chrome',
                  text: 'Google Chrome'
                },
                // {
                //   data: {
                //     icon: "edge-icon"
                //   },
                //   key: 'edge',
                //   text: 'Edge'
                // },
              ]}
              onChange={(e, item) => {
                setSelectedBrowser(item.key)
              }}
              placeholder="Select a browser"
              width="300px"
              required
              disabled={(appType ? !appType.toLowerCase().includes("web") : true)}
            />
          </div>
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
            <a href="/plugin" className="exit-action" style={{ color: "#5F338F", textDecoration: "none", fontSize: "1.2rem" }}>EXIT</a>
            <div className="actionButton__inner" style={{ display: "flex", gap: 10 }}>
              <button className="reset-action__exit" style={{ border: "2px solid #5F338F", color: "#5F338F", borderRadius: "10px", padding: "8px 25px", background: "white" }} onClick={(e) => { }}>Reset</button>
              <button className="reset-action__next"
                disabled={!(selectedBrowser && selectedProject && selectedModule && selectedScenario && navURL && appType)}
                style={{ border: "2px solid #5F338F", color: "white", borderRadius: "10px", padding: "8px 25px", background: "#5F338F" }} onClick={(e) => {
                  // let eURL = `electron-fiddle://project=${JSON.stringify(selectedProject)}&module=${JSON.stringify(selectedModule)}&scenario=${JSON.stringify(selectedScenario)}&navurl=${navURL}&browser=${selectedBrowser}`
                  // window.location.href = eURL;
                  DesignApi.getKeywordDetails_ICE(appType)
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
                    .catch((err) => { console.log("error") })
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