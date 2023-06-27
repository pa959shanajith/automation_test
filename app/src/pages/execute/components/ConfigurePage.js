import React, { useState, useEffect, useRef } from "react";
import { TabMenu } from "primereact/tabmenu";
import { v4 as uuid } from "uuid";
import { Card } from "primereact/card";
import { Panel } from "primereact/panel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { RadioButton } from "primereact/radiobutton";
import { Tree } from "primereact/tree";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { useDispatch, useSelector } from "react-redux";
import "../styles/ConfigurePage.scss";
import AvoModal from "../../../globalComponents/AvoModal";
import ConfigureSetup from "./ConfigureSetup";
import {
  fetchConfigureList,
  getPools,
  getICE_list,
  getProjectList,
  ExecuteTestSuite_ICE,
  execAutomation,
  deleteConfigureKey,
} from "../api";
import {
  getAvoAgentAndAvoGrid,
  getModules,
  getProjects,
  getScheduledDetails_ICE,
  storeConfigureKey,
  testSuitesScheduler_ICE,
  updateTestSuite,
} from "../configureSetupSlice";
import { getPoolsexe } from "../configurePageSlice";
import { getICE } from "../configurePageSlice";
import DropDownList from "../../global/components/DropDownList";
import { ResetSession, setMsg, Messages as MSG, VARIANT } from "../../global";
import { browsers, selections } from "../../utility/mockData";
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";
import ScheduleScreen from "./ScheduleScreen";
import AvoInput from "../../../globalComponents/AvoInput";
import ExecutionPage from "./executionPage";

const ConfigurePage = ({ setShowConfirmPop }) => {
  const [visible, setVisible] = useState(false);
  const [visible_schedule, setVisible_schedule] = useState(false);
  const [visible_CICD, setVisible_CICD] = useState(false);
  const [visible_execute, setVisible_execute] = useState(false);
  const [showIcePopup, setShowIcePopup] = useState(false);
  const [selectedNodeKey, setSelectedNodeKey] = useState(null);
  const [counter, setCounter] = useState(0);
  const toast = useRef(null);
  const url = window.location.href.slice(0, -7) + "execAutomation";
  const [configProjectId, setConfigProjectId] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [configList, setConfigList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [modules, setModules] = useState("normalExecution");
  const [dotNotExe, setDotNotExe] = useState({});
  const buttonEl = useRef(null);
  const [dataExecution, setDataExecution] = useState({});
  const [allocateICE, setAllocateICE] = useState(false);
  const [eachData, setEachData] = useState([]);
  const [currentTask, setCurrentTask] = useState({});
  const [appType, setAppType] = useState("");
  const [moduleInfo, setModuleInfo] = useState([]);
  const [execAction, setExecAction] = useState("serial");
  const [execEnv, setExecEnv] = useState("default");
  const [accessibilityParameters, setAccessibilityParameters] = useState([]);
  const [browserTypeExe, setBrowserTypeExe] = useState([]);
  const [integration, setIntegration] = useState({
    alm: { url: "", username: "", password: "" },
    qtest: { url: "", username: "", password: "", qteststeps: "" },
    zephyr: { url: "", username: "", password: "" },
  });
  const [proceedExecution, setProceedExecution] = useState(false);
  const [smartMode, setSmartMode] = useState("normal");
  const [selectedICE, setSelectedICE] = useState("");
  const [deleteItem, setDeleteItem] = useState(null);
  const [poolList, setPoolList] = useState({});
  const [chooseICEPoolOptions, setChooseICEPoolOptions] = useState([]);
  const [iceStatus, setIceStatus] = useState([]);
  const [poolType, setPoolType] = useState("unallocated");
  const [ExeScreen, setExeScreen] = useState(true);
  const [inputErrorBorder, setInputErrorBorder] = useState(false);
  const [iceNameIdMap, setIceNameIdMap] = useState({});
  const [availableICE, setAvailableICE] = useState([]);
  const [xpanded, setXpanded] = useState([]);
  const [dataparam, setDataparam] = useState({});
  const [condition, setCondition] = useState({});
  const [accessibility, setAccessibility] = useState({});
  const [configTxt, setConfigTxt] = useState("");
  const [avodropdown, setAvodropdown] = useState();
  const [mode, setMode] = useState(selections[0]);
  const [updateKey, setUpdateKey] = useState("");
  const [currentKey, setCurrentKey] = useState("");
  const [currentSelectedItem, setCurrentSelectedItem] = useState("");
  const [executionTypeInRequest, setExecutionTypeInRequest] =
    useState("asynchronous");
  const [apiKeyCopyToolTip, setApiKeyCopyToolTip] = useState("Click To Copy");
  const [copyToolTip, setCopyToolTip] = useState("Click To Copy");
  const [logoutClicked, setLogoutClicked] = useState(false);
  const [profileTxt, setProfileTxt] = useState("");
  const [searchProfile, setSearchProfile] = useState("");
  const [browserTxt, setBrowserTxt] = useState("");
  const [selectedNodeKeys, setSelectedNodeKeys] = useState({});
  const [fetechConfig, setFetechConfig] = useState([]);
  const [configItem, setConfigItem] = useState({});
  const [selectedSchedule, setSelectedSchedule] = useState({});
  const [scheduling, setScheduling] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [radioButton_grid, setRadioButton_grid] = useState(
    "Execute with Avo Assure Agent/ Grid"
  );

  const displayError = (error) => {
    // setLoading(false)
    setMsg(error);
  };

  const dialogFuncMap = {
    visible_execute: setVisible_execute,
  };

  const [setupBtn, setSetupBtn] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const [activeIndex1, setActiveIndex1] = useState(0);

  const items = [{ label: "Configurations" }, { label: "Execution(s)" }];
  const handleTabChange = (e) => {
    console.log(e);
    setActiveIndex1(e.index);
  };

  const getConfigData = useSelector((store) => store.configsetup);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getAvoAgentAndAvoGrid());
  }, []);

  useEffect(() => {
    if (!!getConfigData?.projects.length && configProjectId) {
      const params = getConfigData?.projects.filter(
        (el) => el._id === configProjectId
      );
      dispatch(getModules(params));
    }
  }, [getConfigData?.projects, configProjectId]);

  const parseLogicExecute = (
    eachData,
    current_task,
    appType,
    projectdata,
    moduleInfo,
    accessibilityParameters,
    scenarioTaskType
  ) => {
    for (var i = 0; i < eachData.length; i++) {
      var testsuiteDetails = current_task.testSuiteDetails[i];
      var suiteInfo = {};
      var selectedRowData = [];
      var relid = testsuiteDetails.releaseid;
      var cycid = testsuiteDetails.cycleid;
      var projectid = testsuiteDetails.projectidts;

      for (var j = 0; j < eachData[i].executestatus.length; j++) {
        if (eachData[i].executestatus[j] === 1) {
          selectedRowData.push({
            condition: eachData[i].condition[j],
            dataparam: [eachData[i].dataparam[j].trim()],
            scenarioName: eachData[i].scenarionames[j],
            scenarioId: eachData[i].scenarioids[j],
            scenariodescription: undefined,
            accessibilityParameters: accessibilityParameters,
          });
        }
      }
      suiteInfo.scenarioTaskType = scenarioTaskType;
      suiteInfo.testsuiteName = eachData[i].testsuitename;
      suiteInfo.testsuiteId = eachData[i].testsuiteid;
      suiteInfo.batchname = eachData[i].batchname;
      suiteInfo.versionNumber = testsuiteDetails.versionnumber;
      suiteInfo.appType = appType;
      suiteInfo.domainName =
        projectid in projectdata.project
          ? projectdata.project[projectid].domain
          : testsuiteDetails.domainName;
      suiteInfo.projectName =
        projectid in projectdata.projectDict
          ? projectdata.projectDict[projectid]
          : testsuiteDetails.projectName;
      suiteInfo.projectId = projectid;
      suiteInfo.releaseId = relid;
      suiteInfo.cycleName =
        cycid in projectdata.cycleDict
          ? projectdata.cycleDict[cycid]
          : testsuiteDetails.cycleName;
      suiteInfo.cycleId = cycid;
      suiteInfo.suiteDetails = selectedRowData;
      if (selectedRowData.length !== 0) moduleInfo.push(suiteInfo);
    }
    return moduleInfo;
  };

  useEffect(() => {
    (async () => {
      var data = [];
      const Projects = await getProjectList();
      for (var i = 0; Projects.projectName.length > i; i++) {
        data.push({ name: Projects.projectName[i], id: Projects.projectId[i] });
      }
      // data.push({...data, name:Projects.projectName[i], id:Projects.projectId[i]})
      //  const data =[ {
      //     key: Projects.projectId,
      //     value:Projects.projectNames
      //   }]
      setConfigProjectId(data[0] && data[0]?.id);
      setProjectList(data);
    })();
  }, []);
  


  const showSuccess_CICD = (btnType) => {
    if (btnType === "Cancel") {
      setVisible_CICD(false);
    }
  };

  var myJsObj = { key: currentKey, executionType: executionTypeInRequest };
  var str = JSON.stringify(myJsObj, null, 4);

  const fetchData = async () => {
    setSmartMode("normal");
    setSelectedICE("");
    // var projId = current_task.testSuiteDetails ? current_task.testSuiteDetails[0].projectidts : currentTask.testSuiteDetails[0].projectidts;
    var projId = configProjectId;
    var dataforApi = { poolid: "", projectids: [projId] };
    // setLoading('Fetching ICE ...')
    const data = await getPools(dataforApi);
    if (data.error) {
      displayError(data.error);
      return;
    }
    setPoolList(data);
    var arr = Object.entries(data);
    arr.sort((a, b) => a[1].poolname.localeCompare(b[1].poolname));
    setChooseICEPoolOptions(arr);
    const data1 = await getICE_list({ projectid: projId });
    if (data1.error) {
      displayError(data1.error);
      return;
    }
    setIceStatus(data1);
    populateICElist(arr, true, data1);
    // setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [configProjectId]);

  const populateICElist = (arr, unallocated, iceStatusdata) => {
    var ice = [];
    var iceStatusValue = {};
    if (iceStatusdata !== undefined) iceStatusValue = iceStatusdata.ice_ids;
    else if (iceStatusdata === undefined) iceStatusValue = iceStatus.ice_ids;
    const statusUpdate = (ice) => {
      var color = "#fdc010";
      var status = "Offline";
      if (ice.connected) {
        color = "#95c353";
        status = "Online";
      }
      if (ice.mode) {
        color = "red";
        status = "DND mode";
      }
      return { color, status };
    };
    if (unallocated) {
      setPoolType("unallocated");
      if (arr === undefined) iceStatusdata = iceStatus;
      arr = Object.entries(iceStatusdata.unallocatedICE);
      arr.forEach((e) => {
        var res = statusUpdate(e[1]);
        e[1].color = res.color;
        e[1].statusCode = res.status;
        ice.push(e[1]);
      });
    } else {
      setPoolType("allocated");
      var iceNameIdMapData = { ...iceNameIdMap };
      arr.forEach((e) => {
        if (e[1].ice_list) {
          Object.entries(e[1].ice_list).forEach((k) => {
            if (k[0] in iceStatusValue) {
              var res = statusUpdate(iceStatusValue[k[0]]);
              iceNameIdMapData[k[1].icename] = {};
              iceNameIdMapData[k[1].icename].id = k[0];
              iceNameIdMapData[k[1].icename].status =
                iceStatusValue[k[0]].status;
              k[1].color = res.color;
              k[1].statusCode = res.status;
              ice.push(k[1]);
            }
          });
        }
      });
      setIceNameIdMap(iceNameIdMapData);
    }
    ice.sort((a, b) => a.icename.localeCompare(b.icename));
    setAvailableICE(ice);
  };



  const confirm_delete = (event, item) => {
    setDeleteItem(item);
    event.preventDefault(); // Prevent the default behavior of the button click
    setLogoutClicked(true);
    let text = `Are you sure you want to delete' ${item.configurename}' Execution Profile?`;
    setProfileTxt(text);
  };

  const copyConfigKey = (title) => {
    if (navigator.clipboard.writeText(title)) {
      setCopyToolTip("Copied!");
      setTimeout(() => {
        setCopyToolTip("Click to Copy");
      }, 1500);
    }
  };

  const deleteDevOpsConfig = () => {
    // setLoading('Please Wait...');
    setTimeout(async () => {
      const deletedConfig = await deleteConfigureKey(deleteItem.configurekey);
      if (deletedConfig.error) {
        if (deletedConfig.error.CONTENT) {
          setMsg(MSG.CUSTOM(deletedConfig.error.CONTENT, VARIANT.ERROR));
        } else {
          setMsg(
            MSG.CUSTOM(
              "Error While Deleting Execute Configuration",
              VARIANT.ERROR
            )
          );
        }
      } else {
        const configurationList = await fetchConfigureList({
          projectid: selectedProject,
        });
        if (configurationList.error) {
          if (configurationList.error.CONTENT) {
            setMsg(MSG.CUSTOM(configurationList.error.CONTENT, VARIANT.ERROR));
          } else {
            setMsg(
              MSG.CUSTOM(
                "Error While Fetching Execute Configuration List",
                VARIANT.ERROR
              )
            );
          }
        } else {
          const integrationData = configurationList.map((item, idx) => {
            setIntegration(item.executionRequest.integration);
          });
          setConfigList(configurationList);
        }
        setMsg(
          MSG.CUSTOM("Execution Profile deleted successfully.", VARIANT.SUCCESS)
        );
      }
      // setLoading(false);
    }, 500);
    setShowConfirmPop(false);
  };

  const CheckStatusAndExecute = (executionData, iceNameIdMap) => {
    if (Array.isArray(executionData.targetUser)) {
      for (let icename in executionData.targetUser) {
        let ice_id = iceNameIdMap[executionData.targetUser[icename]];
        if (ice_id && ice_id.status) {
          setDataExecution(executionData);
          setAllocateICE(false);
          setProceedExecution(true);
        }
      }
    } else {
      let ice_id = iceNameIdMap[executionData.targetUser];
      if (ice_id && ice_id.status) {
        setDataExecution(executionData);
        setAllocateICE(false);
        setProceedExecution(true);
      }
    }
    ExecuteTestSuite(executionData);
  };

  const ExecuteTestSuite = async (executionData,btnType) => {
    if (executionData === undefined) executionData = dataExecution;
    setAllocateICE(false);
    const modul_Info = parseLogicExecute(
      eachData,
      currentTask,
      appType,
      moduleInfo,
      accessibilityParameters,
      ""
    );
    if (modul_Info === false) return;
    // setLoading("Sending Execution Request");
    executionData["source"] = "task";
    executionData["exectionMode"] = execAction;
    executionData["executionEnv"] = execEnv;
    executionData["browserType"] = ["1"];
    executionData["integration"] = integration;
    executionData["batchInfo"] =
      currentSelectedItem &&
      currentSelectedItem.executionRequest &&
      currentSelectedItem.executionRequest.batchInfo
        ? currentSelectedItem.executionRequest.batchInfo
        : [];
    executionData["scenarioFlag"] =
      currentTask.scenarioFlag == "True" ? true : false;
    ResetSession.start();
    try {
      // setLoading(false);
      const data = await ExecuteTestSuite_ICE(executionData);
      if (data.errorapi) {
        displayError(data.errorapi);
        return;
      }
      if (data === "begin") {
        return false;
      }
      ResetSession.end();
      if (data.status) {
        if (data.status === "fail") {
          // setMsg(MSG.CUSTOM(data["error"], data.variant));
          if (data.variant === "success") {
            toast.current.show({
              severity: 'success',
              summary: 'Success',
              detail: data.error,
              life: 5000
            });
          } else {
            toast.current.show({
              severity: 'error',
              summary: 'Error',
              detail: data.error,
              life: 5000
            });
          }
        } else {
          // setMsg(MSG.CUSTOM(data["message"], data.variant));
          if (data.variant === "success") {
            toast.current.show({
              severity: 'success',
              summary: 'Success',
              detail: data.message,
              life: 5000
            });
          } else {
            toast.current.show({
              severity: 'error',
              summary: 'Error',
              detail: data.message,
              life: 5000
            });
          }
        }
       
      }
      
      setBrowserTypeExe([]);
      setModuleInfo([]);
      setExecAction("serial");
      setExecEnv("default");
    } catch (error) {
      // setLoading(false);
      ResetSession.end();
      // displayError(MSG.EXECUTE.ERR_EXECUTE);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: (MSG.EXECUTE.ERR_EXECUTE),
        life: 5000
      });
      setBrowserTypeExe([]);
      setModuleInfo([]);
      setExecAction("serial");
      setExecEnv("default");
    }
  };

  const tableUpdate = async () => {
    const getState = [];
    const configurationList = await fetchConfigureList({
      projectid: configProjectId,
    });
    setFetechConfig(configurationList);
    configurationList.forEach((item, idx) => {
      getState.push({
        sno: idx + 1,
        profileName: item.configurename,
        executionOptions: (
          <div className="Buttons_config_button">
            <Button
              className="execute_now"
              onClick={() => {
                dispatch(getPoolsexe());
                dispatch(getICE());
                setVisible_execute(true);
                setCurrentKey(item.configurekey);
                setCurrentSelectedItem(item);
              }}
              size="small"
            >
              {" "}
              Execute Now
            </Button>
            <Button
              className="schedule"
              onClick={() => {
                setSelectedSchedule(item);
                setConfigItem(idx);
                setVisible_schedule(true);
              }}
              size="small"
            >
              {" "}
              Schedule
            </Button>

            <Button
              className="CICD"
              size="small"
              onClick={() => {
                setVisible_CICD(true);
                setCurrentKey(item.configurekey);
              }}
            >
              CI/CD
            </Button>
          </div>
        ),
        actions: (
          <div>
            <ConfirmPopup
              target={buttonEl.current}
              visible={visible}
              onHide={() => setVisible(false)}
            />
            <Button
              icon="pi pi-pencil"
              className=" pencil_button p-button-edit"
              onClick={() => configModal("CancelUpdate", item)}
            ></Button>
            <Button
              icon="pi pi-trash"
              className="p-button-edit"
              onClick={(event) => confirm_delete(event, item)}
            ></Button>
          </div>
        ),
      });
    });
    setConfigList(getState);
  };

  useEffect(() => {
    if (configProjectId) {
      tableUpdate();
    }
  }, [configProjectId]);

  const configModal = (getType, getData = null) => {
    if (getType === "CancelUpdate") {
      const getAvogrid = [
        ...getConfigData?.avoAgentAndGrid?.avoagents,
        ...getConfigData?.avoAgentAndGrid?.avogrids,
      ];
      getAvogrid.forEach((el, index, arr) => {
        if (Object.keys(el).includes("Hostname")) {
          getAvogrid[index] = { ...el, name: el.Hostname };
        }
      });
      setUpdateKey(getData.executionRequest.configurekey);
      setAvodropdown({
        ...avodropdown,
        avogrid: getAvogrid.filter(
          (el) => el.name === getData.executionRequest.avoagents[0]
        )[0],
        browser: browsers.filter((el) =>
          getData.executionRequest.browserType.includes(el.key)
        ),
      });
      setMode(
        getData?.executionRequest?.isHeadless ? selections[1] : selections[0]
      );
      setConfigTxt(getData.configurename);
      setModules(getData.executionRequest.selectedModuleType);
      setDotNotExe(getData);
    } else {
      setUpdateKey("");
      setAvodropdown({});
      setMode(selections[0]);
      setConfigTxt("");
      setModules("normalExecution");
      setSelectedNodeKeys({});
    }
    setVisible(true);
    setSetupBtn(getType);
  };

  const onModalBtnClick = (getBtnType) => {
    if (getBtnType === "Save" || getBtnType === "Update") {
      const paramPaths = Object.values(dataparam).reduce((ac, cv) => {
        ac[cv.key] = ac[cv.key] || [];
        ac[cv.key].push(cv);
        return ac;
      }, {});
      const checkcondition = Object.values(condition).reduce((ac, cv) => {
        ac[cv.key] = ac[cv.key] || [];
        ac[cv.key].push(cv);
        return ac;
      }, {});
      const accessibilityParams = Object.values(accessibility).reduce(
        (ac, cv) => {
          ac[cv.key] = ac[cv.key] || [];
          ac[cv.key].push(cv);
          return ac;
        },
        {}
      );
      const getSelected = Object.keys(selectedNodeKeys);
      const parent = getSelected.filter((el) => el.length === 1);
      const child = getSelected
        .filter((el) => el.length > 1)
        .map((e) => ({ [e.charAt(0)]: e.charAt(2) }));
      const selectedKeys = {};
      const selectedArr = parent.map((element) =>
        child
          .map((el) => (el[element] ? el[element] : false))
          .filter((i) => i !== false)
      );
      // parent.map((item, index) => ({ [item]: selectedArr[index] }))
      parent.forEach((item, index) => {
        selectedKeys[item] = selectedArr[index];
      });
      let getCurrent = {};
      xpanded?.forEach((val) => {
        if (Object.keys(selectedNodeKeys).includes(val.key)) {
          let numberArray = [];
          selectedKeys[Number(val.key)]?.forEach((ele) =>
            numberArray.push(+ele)
          );
          getCurrent[val.suiteid] = numberArray;
        }
      });
      let batchInfoData = [];
      xpanded?.forEach((item) => {
        if (Object.keys(selectedNodeKeys).includes(item.key)) {
          batchInfoData.push({
            scenarioTaskType: "disable",
            testsuiteName: item.suitename,
            testsuiteId: item.suiteid,
            batchname: "",
            versionNumber: 0,
            appType: "Web",
            domainName: "Banking",
            projectName: getConfigData?.projects[0]?.name,
            projectId: configProjectId,
            releaseId: getConfigData?.projects[0]?.releases[0]?.name,
            cycleName: getConfigData?.projects[0]?.releases[0]?.cycles[0]?.name,
            cycleId: getConfigData?.projects[0]?.releases[0]?.cycles[0]?._id,
            scenarionIndex: [1],
            suiteDetails: [
              {
                condition: 0,
                dataparam: [""],
                scenarioName: "Scenario_check",
                scenarioId: "646efee42d7bb349c1ab2f19",
                accessibilityParameters: [],
              },
            ],
          });
        }
      });

      let executionData = {
        type: "",
        poolid: "",
        targetUser: "",
        source: "task",
        exectionMode: "serial",
        executionEnv: "default",
        browserType: avodropdown?.browser?.map((el) => el.key),
        configurename: configTxt,
        executiontype: "asynchronous",
        selectedModuleType: modules,
        configurekey: getBtnType === "Update" ? updateKey : uuid(),
        isHeadless: mode === "Headless",
        avogridId: "",
        avoagents: [avodropdown?.avogrid?.name],
        integration: {
          alm: { url: "", username: "", password: "" },
          qtest: { url: "", username: "", password: "", qteststeps: "" },
          zephyr: { url: "", username: "", password: "" },
        },
        batchInfo: batchInfoData,
        donotexe: {
          current: getCurrent,
        },
        scenarioFlag: false,
        isExecuteNow: false,
      };

      const dataObj = {
        param: "updateTestSuite_ICE",
        batchDetails: xpanded
          ?.filter((e) => e.testsuiteid !== 0)
          .map((el) => ({
            testsuiteid: el?.testsuiteid ? el?.testsuiteid : "",
            testsuitename: el?.suitename,
            testscenarioids: el?.suitescenarios,
            getparampaths:
              !!Object.values(paramPaths).length &&
              Object.values(paramPaths[el?.key].map((el) => el?.value)),
            conditioncheck:
              !!Object.values(checkcondition).length &&
              Object.values(
                checkcondition[el?.key].map((el) =>
                  el?.value?.code === "T" ? "1" : 0
                )
              ),
            accessibilityParameters:
              !!Object.values(accessibilityParams).length &&
              Object.values(
                accessibilityParams[el?.key].map((el) => el?.value)
              ),
          })),
      };
      dispatch(updateTestSuite(dataObj)).then(() =>
        dispatch(storeConfigureKey(executionData)).then(() => {
          tableUpdate();
        })
      );
      setVisible(false);
    } else if (getBtnType === "Cancel") {
      setConfigTxt("");
      setVisible(false);
      setDotNotExe({});
      setSelectedNodeKeys({});
    } else setVisible(false);
  };

  const onNodeSelect = (e) => {
    if (e && e.node && e.node.key) {
      setSelectedNodeKey(e.node.key);
    }
  };

  const Breadcrumbs = () => {
    return (
      <nav>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            marginLeft: "1rem",
            paddingTop: "0.5rem",
          }}
        >
          <li>
            <label>
              <b>Project: </b>
            </label>
            <select
              onChange={(e) => {
                setConfigProjectId(e.target.value);
              }}
              style={{ width: "10rem", height: "19px" }}
              value={configProjectId}
            >
              {projectList.map((project, index) => (
                <option value={project.id} key={index}>
                  {project.name}
                </option>
              ))}
            </select>
          </li>
        </ul>
      </nav>
    );
  };

  useEffect(() => {
    browsers.forEach((el) => {
      if (el.key == currentSelectedItem?.executionRequest?.browserType[0]) {
        setBrowserTxt(el.name);
      }
    });
  }, [currentSelectedItem?.executionRequest?.browserType[0]]);

  const onExecuteBtnClick = async (btnType) => {
    if(btnType==="Execute"){
    if (showIcePopup) {
      dataExecution.type =
        ExeScreen === true ? (smartMode === "normal" ? "" : smartMode) : "";
      dataExecution.poolid = "";

      if ((ExeScreen === true ? smartMode : "") !== "normal")
        dataExecution.targetUser = Object.keys(selectedICE).filter(
          (icename) => selectedICE[icename]
        );
      else dataExecution.targetUser = selectedICE;

      CheckStatusAndExecute(dataExecution, iceNameIdMap);
    } else {
      const temp = await execAutomation(currentKey);
      if (temp.status !== "pass") {
        if (temp.error && temp.error.CONTENT) {
          setMsg(MSG.CUSTOM(temp.error.CONTENT, VARIANT.ERROR));
        } else {
          setMsg(
            MSG.CUSTOM(
              "Error While Adding Configuration to the Queue",
              VARIANT.ERROR
            )
          );
        }
      } else {
        setMsg(MSG.CUSTOM("Execution Added to the Queue.", VARIANT.SUCCESS));
      }
      if(btnType ===  "Execute"){
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Execution has started",
            life: 5000,
          });
          
          }
      // onHide(name);
    }
  }
    if(btnType === 'Cancel'){
      setVisible_execute(false);
    }
    // if(btnType ===  "Execute"){
    //   toast.current.show({
    //     severity: "success",
    //     summary: "Success",
    //     detail: "Execution has started",
    //     life: 5000,
    //   });
      
    //   }
    
  };

  const onScheduleBtnClick = (btnType) => {
    if (btnType === "Cancel") {
      setVisible_schedule(false);
      setScheduling(false);
    }
    if (btnType === "Schedule") {
      dispatch(
        testSuitesScheduler_ICE({
          param: "testSuitesScheduler_ICE",
          executionData: {
            source: "schedule",
            exectionMode: "serial",
            executionEnv: "default",
            browserType: selectedSchedule?.executionRequest?.browserType,
            integration: selectedSchedule?.executionRequest?.integration,
            batchInfo: selectedSchedule?.executionRequest?.batchInfo.map((el) => ({ ...el, 
              poolid: "",
              type: "normal",
              targetUser: "automationice",
              iceList: [],
              date: startDate,
              time: startDate.getTime(),
              timestamp: startDate.getTime(),
              recurringValue: "One Time",
              recurringString: "One Time",
              recurringStringOnHover: "One Time",
              endAfter: "",
              clientTime: "",
              clientTimeZone: ""
            })),
            scenarioFlag: false,
            type: "normal",
            configureKey: selectedSchedule?.configurekey,
            configureName: selectedSchedule?.configurename,
          },
        })
      ).then(() => {
        dispatch(
          getScheduledDetails_ICE({
            param: "getScheduledDetails_ICE",
            configKey: fetechConfig[configItem]?.configurekey,
            configName: fetechConfig[configItem]?.configurename,
          })
        );
      });
    }
  };

  // const onScheduleBtnClickClient = () => {
  //   console.log(selectedSchedule);
  //   dispatch(
  //     testSuitesScheduler_ICE({
  //       param: "testSuitesScheduler_ICE",
  //       executionData: {
  //         source: "schedule",
  //         exectionMode: "serial",
  //         executionEnv: "default",
  //         browserType: selectedSchedule?.executionRequest?.browserType,
  //         integration: selectedSchedule?.executionRequest?.integration,
  //         batchInfo: selectedSchedule?.executionRequest?.batchInfo,
  //         scenarioFlag: false,
  //         type: "normal",
  //         configureKey: selectedSchedule?.configurekey,
  //         configureName: selectedSchedule?.configurename,
  //       },
  //     })
  //   );
  // };

  const checkboxHeaderTemplate = () => {
    return (
      <>
        {/* <Checkbox classname=" checkbox_header" /> */}
        <span className="profile_label"> Configuration Profile Name</span>
      </>
    );
  };
 
   const renderExecutionCard = () => {
    return (
      <Card className="execute_card p-card p-card-body">
        <div className="grid executedropdown">
          <div className="col-6">
            <div className="text_card">Avo Agent:</div>
            <div className="text_value">
              <div className="agent_name">
                {currentSelectedItem &&
                currentSelectedItem.executionRequest &&
                currentSelectedItem.executionRequest.avoagents.length > 0
                  ? currentSelectedItem.executionRequest.avoagents[0]
                  : "Any Agent"}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="text_card1">
              <div className="execute_text">Execution Mode:</div>
            </div>
            <div className="text_value1">
              <div className="execute_name">
                {currentSelectedItem &&
                currentSelectedItem.executionRequest &&
                currentSelectedItem.executionRequest.integration.isHeadless ===
                  true
                  ? "Non-Headless"
                  : "Headless"}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="text_card3">
              <div className="browser_text">Selected Browsers:</div>
            </div>
            <div className="text_value3">
              <div className="browser_name">{browserTxt}</div>
            </div>
          </div>
          <div className="col-6">
            <div className="text_card4">
              <div className="integration_text">Integration Type:</div>
            </div>
            <div className="text_value4">
              <div className="integration_name">ALM</div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderTable = () => {
    if (!!configList.length) {
      return (
        <>
          <DataTable
            showGridlines
            resizableColumns
            className="  datatable_list  "
            value={configList}
            globalFilter={searchProfile}
            style={{
              width: "100%",
              height: "calc(100vh - 250px)",
              marginRight: "-2rem",
            }}
          >
            <Column
              field="sno"
              style={{ width: "5%" }}
              header={<span className="SNo-header">S No</span>}
            />
            <Column
              style={{
                fontWeight: "normal",
                fontFamily: "open Sans",
                marginLeft: "11rem",
              }}
              field="profileName"
              header={checkboxHeaderTemplate}
            />
            <Column
              style={{
                fontWeight: "bold",
                fontFamily: "open Sans",
                marginRight: "23rem",
                width: "40%",
              }}
              field="executionOptions"
              header={
                <span className="executionOption-header">
                  Execution Options
                </span>
              }
            />
            <Column
              style={{
                fontWeight: "bold",
                fontFamily: "open Sans",
                marginleft: "7rem",
                textAlign: "left",
                width: "5%",
              }}
              field="actions"
              header={<span className="actions-header">Actions</span>}
            />
          </DataTable>
          <AvoModal
            visible={visible_execute}
            setVisible={setVisible_execute}
            onhide={visible_execute}
            onModalBtnClick={onExecuteBtnClick}
            content={
              <>
                {renderExecutionCard()}
                <div className="radioButtonContainer">
                  <RadioButton
                    value="Execute with Avo Assure Agent/ Grid"
                    onChange={(e) => {
                      setShowIcePopup(false);
                      setRadioButton_grid(e.target.value);
                    }}
                    checked={
                      radioButton_grid === "Execute with Avo Assure Agent/ Grid"
                    }
                  />
                  <label className="executeRadio_label_grid ml-2">
                    Execute with Avo Assure Agent/ Grid
                  </label>
                  <div className="radioButtonContainer1">
                    <RadioButton
                      value="Execute with Avo Assure Client"
                      onChange={(e) => {
                        setShowIcePopup(true);
                        setRadioButton_grid(e.target.value);
                      }}
                      checked={
                        radioButton_grid === "Execute with Avo Assure Client"
                      }
                    />
                  </div>
                  <label className=" executeRadio_label_clint ml-2">
                    Execute with Avo Assure Client
                  </label>
                </div>
                {showIcePopup && (
                  <div>
                    <div className="legends-container">
                      <div className="legend">
                        <span id="status" className="status-available"></span>
                        <span className="legend-text">Available</span>
                      </div>
                      <div className="legend">
                        <span id="status" className="status-unavailable"></span>
                        <span className="legend-text2">Unavailable</span>
                      </div>
                      <div className="legend">
                        <span id="status" className="status-dnd"></span>
                        <span className="legend-text1">Do Not Disturb</span>
                      </div>
                    </div>
                    <div>
                      <span
                        className="execute_dropdown .p-dropdown-label "
                        title="Token Name"
                      >
                        Execute on
                      </span>
                      <div className="search_icelist ">
                        <DropDownList
                          poolType={poolType}
                          ExeScreen={ExeScreen}
                          inputErrorBorder={inputErrorBorder}
                          setInputErrorBorder={setInputErrorBorder}
                          placeholder={"Search"}
                          data={availableICE}
                          smartMode={ExeScreen === true ? smartMode : ""}
                          selectedICE={selectedICE}
                          setSelectedICE={setSelectedICE}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            }
            headerTxt="Execute: Regression"
            footerType="Execute"
            modalSytle={{ width: "50vw", background: "#FFFFFF" }}
          />
          <AvoModal
            visible={visible_schedule}
            setVisible={setVisible_schedule}
            onModalBtnClick={onScheduleBtnClick}
            content={<ScheduleScreen cardData={fetechConfig[configItem]} startDate={startDate} setStartDate={setStartDate} />}
            headerTxt={`Schedule: ${fetechConfig[configItem]?.configurename}`}
            footerType="Schedule"
            modalSytle={{
              width: "55vw",
              height: "95vh",
              background: "#FFFFFF",
            }}
            isDisabled={!startDate}
          />
          {/* <AvoModal
            visible={scheduling}
            setVisible={setScheduling}
            onModalBtnClick={onScheduleBtnClickClient}
            content={
              <>
                <div className="ice_label">Allocate Avo Assure Client</div>
                <div className="ice_container">
                  <div className="ice_status">
                    <span className="available"></span>
                    <span>Available</span>
                    <span className="unavailable"></span>
                    <span>Unavailable</span>
                    <span className="dnd"></span>
                    <span>Do Not Disturb</span>
                  </div>
                  <DropDownList
                    poolType={poolType}
                    ExeScreen={ExeScreen}
                    inputErrorBorder={inputErrorBorder}
                    setInputErrorBorder={setInputErrorBorder}
                    placeholder={"Search"}
                    data={availableICE}
                    smartMode={ExeScreen === true ? smartMode : ""}
                    selectedICE={selectedICE}
                    setSelectedICE={setSelectedICE}
                  />
                </div>
              </>
            }
            headerTxt="Allocate Avo Assure Client to Schedule"
            footerType="ScheduleIce"
            modalSytle={{
              width: "55vw",
              height: "45vh",
              background: "#FFFFFF",
              minWidth: "38rem",
            }}
            customClass="schedule_modal"
          /> */}
          <AvoModal
            visible={visible_CICD}
            setVisible={setVisible_CICD}
            content={
              <>
                {renderExecutionCard()}

                <div className="input_CICD ">
                  <div class="container_url">
                    <label for="inputField" class="devopsUrl_label">
                      Devops Integration URL
                    </label>
                    <pre className="grid_download_dialog__content__code cicdpre">
                      <code id="api-url" title={url}>
                        {url}
                      </code>
                    </pre>

                    <Button
                      icon="pi pi-copy"
                      className="copy_CICD"
                      onClick={() => {
                        copyConfigKey(url);
                      }}
                      title={copyToolTip}
                    />
                  </div>
                  <div className="executiontype">
                    <div className="lable_sync">
                      <label
                        className="Async_lable"
                        id="async"
                        htmlFor="synch"
                        value="asynchronous"
                      >
                        Asynchronous{" "}
                      </label>
                      <InputSwitch
                        className="inputSwitch_CICD"
                        label=""
                        inlineLabel={true}
                        onChange={() =>
                          executionTypeInRequest == "asynchronous"
                            ? setExecutionTypeInRequest("synchronous")
                            : setExecutionTypeInRequest("asynchronous")
                        }
                        checked={executionTypeInRequest === "synchronous"}
                      />
                      <label
                        className="sync_label"
                        id="sync"
                        htmlFor="synch"
                        value="synchronous"
                      >
                        Synchronous{" "}
                      </label>
                    </div>
                  </div>
                  <div className="container_devopsLabel" title={str}>
                    <span className="devops_label">DevOps Request Body : </span>
                    <div>

                      <pre className="grid_download_dialog__content__code executiontypenamepre">
                        <code
                          className="executiontypecode"
                          id="devops-key"
                          title={str}
                        >
                          {str}
                       
                        </code>
                      </pre>

                      <Button
                        icon="pi pi-copy"
                        className="copy_devops"
                        onClick={() => {
                          copyConfigKey(str);
                        }}
                        title={copyToolTip}
                      />
                    </div>
                  </div>
                </div>
              </>
            }
            headerTxt={`CICD: demo123`}
            modalSytle={{ width: "50vw", background: "#FFFFFF" }}
            onModalBtnClick={showSuccess_CICD}
          />
        </>
      );
    } else {
      return (
        <Panel
          className="config_header config_content"
          header={
            <div>
              <span
                style={{
                  marginRight: "13rem",
                  fontWeight: "bold",
                  fontFamily: "open Sans",
                }}
              
              >
                S.No.
              </span>
              <span
                style={{
                  marginRight: "13rem",
                  fontWeight: "bold",
                  fontFamily: "open Sans",
                }}
                
              >
                Configuration Profile Name
              </span>
              <span
                style={{
                  marginRight: "18rem",
                  fontWeight: "bold",
                  fontFamily: "open Sans",
                  
                }}
              >
                Execution Options
              </span>
              <span
                style={{
                  marginRight: "1rem",
                  fontWeight: "bold",
                  fontFamily: "open Sans",
                }}
              >
                Actions
              </span>
            </div>
          }
        >
          <div className="no_card_content1">
            <div className="image-container1">
              <img
                className="img1"
                alt="Card"
                src="static/imgs/execution_report.png"
              />
              <span className="text1 ">No Configuration's yet</span>
            </div>
          </div>
          <Button
            className="configure_button"
            onClick={() => configModal("CancelSave")}
          >
            {" "}
            configure{" "}
          </Button>
        </Panel>
      );
    }
  };
  return (
    <>
      <div>
        <Breadcrumbs />
        <div className="grid" style={{ borderBottom: 'solid #dee2e6' }}>
          <div className="col-12 lg:col-8 xl:col-8 md:col-6 sm:col-12" style={{ marginBottom: '-0.6rem' }}>
            <TabMenu
              model={items}
              className="tabs tab-menu"
              activeIndex={activeIndex1}
              onTabChange={(e) => handleTabChange(e)}
            />
          </div>
          <div className="col-12 lg:col-4 xl:col-4 md:col-6 sm:col-12">
            {!!configList.length ? (
              <div className="flex flex-row justify-content-between align-items-center">
                <AvoInput
                  icon="pi pi-search"
                  placeholder="Search"
                  inputTxt={searchProfile}
                  setInputTxt={setSearchProfile}
                  inputType="searchIcon"
                />
                <Button className="addConfig_button" onClick={() => configModal("CancelSave")} size="small">
                  Add Configuration
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        {activeIndex1 !== 1 ? (
          <div className="ConfigurePage_container m-2" showGridlines>
            {renderTable()}{" "}
          </div>
        ) : (
          <ExecutionPage />
        )}
        <AvoModal
          visible={visible}
          setVisible={setVisible}
          onModalBtnClick={onModalBtnClick}
          content={
            <ConfigureSetup
              configData={getConfigData}
              xpanded={xpanded}
              setXpanded={setXpanded}
              tabIndex={tabIndex}
              setTabIndex={setTabIndex}
              dataparam={dataparam}
              setDataparam={setDataparam}
              condition={condition}
              setCondition={setCondition}
              accessibility={accessibility}
              setAccessibility={setAccessibility}
              modules={modules}
              setModules={setModules}
              configTxt={configTxt}
              setConfigTxt={setConfigTxt}
              avodropdown={avodropdown}
              setAvodropdown={setAvodropdown}
              mode={mode}
              setMode={setMode}
              selectedNodeKeys={selectedNodeKeys}
              setSelectedNodeKeys={setSelectedNodeKeys}
              dotNotExe={dotNotExe}
              setDotNotExe={setDotNotExe}
            />
          }
          headerTxt="Execution Configuration set up"
          footerType={setupBtn}
          modalSytle={{ width: "85vw", height: "94vh", background: "#FFFFFF" }}
          isDisabled={
            !configTxt ||
            !avodropdown?.browser?.length ||
            !Object.keys(selectedNodeKeys)?.length
          }
        />
      </div>
      <Toast ref={toast} position="bottom-center" />
      <AvoConfirmDialog
        className="Logout_modal"
        visible={logoutClicked}
        onHide={setLogoutClicked}
        showHeader={false}
        message={profileTxt}
        icon="pi pi-exclamation-triangle"
        accept={deleteDevOpsConfig}
      />
    </>
  );
};

export default ConfigurePage;
