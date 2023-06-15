import React, { useState, useEffect, Fragment, useRef } from "react";
import { TabMenu } from "primereact/tabmenu";
import { v4 as uuid } from "uuid";
import { Card } from "primereact/card";
import "../styles/ConfigurePage.scss";
import { Panel } from "primereact/panel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Breadcrumbs, Checkbox } from "@mui/material";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from "primereact/dropdown";
import { Tree } from "primereact/tree";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { SelectButton } from "primereact/selectbutton";
import { InputSwitch } from "primereact/inputswitch";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import {
  fetchConfigureList,
  getPools,
  getICE_list,
  getProjectList,
  ExecuteTestSuite_ICE,
  execAutomation,
  readTestSuite_ICE,
  deleteConfigureKey,
} from "../api";
// import { Messages as MSG,VARIANT} from '../../global';
import AvoModal from "../../../globalComponents/AvoModal";
import ConfigureSetup from "./ConfigureSetup";
import {
  getAvoAgentAndAvoGrid,
  getModules,
  getProjects,
  storeConfigureKey,
  updateTestSuite,
} from "../configureSetupSlice";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { useDispatch, useSelector } from "react-redux";
import { getPoolsexe } from "../configurePageSlice";
import { getICE } from "../configurePageSlice";
import DropDownList from "../../global/components/DropDownList";
import { ResetSession, setMsg, Messages as MSG, VARIANT } from "../../global";
// import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { browsers, selections } from "../../utility/mockData";
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";

const ConfigurePage = ({ setShowConfirmPop }) => {
  const [visible, setVisible] = useState(false);
  const [visible_schedule, setVisible_schedule] = useState(false);
  const [visible_CICD, setVisible_CICD] = useState(false);
  const [visible_execute, setVisible_execute] = useState(false);
  const [ingredient, setIngredient] = useState("");
  const [showLegend, setShowLegend] = useState(false);
  const [showIcePopup, setShowIcePopup] = useState(false);
  // const [selectedRadio, setSelectedRadio] = useState('');
  const [radioButton_grid, setRadioButton_grid] = useState(
    "Execute with Avo Assure Agent/ Grid"
  );
  const [radioButton_Weekly, setRadioButton_Weekly] = useState(true);
  const [selectedRadio, setSelectedRadio] = useState(
    "Execute with Avo Assure Client"
  );
  const [selectedNodeKey, setSelectedNodeKey] = useState(null);
  const [selectRecurrenceKey, setSelectRecurrenceKey] = useState(null);
  const [time, setTime] = useState(null);
  const [days, setDays] = useState(null);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [time_limit, setTime_limit] = useState(null);
  const [counter, setCounter] = useState(0);
  const [value_input, setValue_input] = useState(null);
  const [checked, setChecked] = useState(false);
  const toast = useRef(null);
  const [projectData1, setProjectData1] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const url = window.location.href.slice(0, -7) + "execAutomation";
  const [projectName, setProjectName] = useState("");
  const [projectId, setprojectId] = useState("");
  // const current_task = useSelector(state=>state.plugin.PN);
  const [cycleName, setCycleName] = useState("");
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
  const [selectedNodeKeys, setSelectedNodeKeys] = useState(null);
  const [integration, setIntegration] = useState({
    alm: { url: "", username: "", password: "" },
    qtest: { url: "", username: "", password: "", qteststeps: "" },
    zephyr: { url: "", username: "", password: "" },
  });
  const [proceedExecution, setProceedExecution] = useState(false);
  // const [visible, setVisible] = useState(false);

  // const dispatch = useDispatch();
  //
  const [smartMode, setSmartMode] = useState("normal");
  const [selectedICE, setSelectedICE] = useState("");
  const [deleteItem, setDeleteItem] = useState(null);

  // const current_task = useSelector(state=>state.plugin.CT)
  // const [loading,setLoading] = useState(false)
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
  const [avodropdown, setAvodropdown] = useState({});
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

  const displayError = (error) => {
    // setLoading(false)
    setMsg(error);
  };
  const [displayBasic2, setDisplayBasic2] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [position, setPosition] = useState("center");

  const dialogFuncMap = {
    visible_execute: setVisible_execute,
  };

  const [footerType, setFooterType] = useState("CancelNext");
  const [setupBtn, setSetupBtn] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const items = [
    { label: "Configurations" },
    { label: "Scheduled Executions" },
  ];

  const getConfigData = useSelector((store) => store.configsetup);
  const getConfigPage = useSelector((store) => store);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getAvoAgentAndAvoGrid());
  }, []);

  useEffect(() => {
    if (!!getConfigData?.projects.length)
      dispatch(getModules(getConfigData?.projects));
  }, [getConfigData?.projects]);

  const readTestSuiteFunct = async (readTestSuite, item) => {
    // setLoading("Loading in Progress. Please Wait");
    const result = await readTestSuite_ICE(readTestSuite, "execute");
    if (result.error) {
      displayError(result.error);
      return;
    } else if (result.testSuiteDetails) {
      var data = result.testSuiteDetails;
      var keys = Object.keys(data);
      var tableData = [];
      keys.map((itm) => tableData.push({ ...data[itm] }));

      for (var m = 0; m < keys.length; m++) {
        if (!tableData[m].executestatus.includes(0)) {
          tableData[m].scenarioids.map((scenarioid, index) => {
            tableData[m].executestatus[index] = 0;
            if (m < item.executionRequest.batchInfo.length) {
              if (
                item.executionRequest.selectedModuleType === "normalExecution"
              ) {
                for (var k in item.executionRequest.batchInfo[m].suiteDetails) {
                  if (
                    scenarioid ===
                    item.executionRequest.batchInfo[m].suiteDetails[k]
                      .scenarioId
                  ) {
                    tableData[m].executestatus[index] = 1;
                    break;
                  }
                }
              } else {
                for (
                  var n = 0;
                  n < item.executionRequest.batchInfo[m].scenarionIndex.length;
                  n++
                ) {
                  tableData[m].executestatus[
                    item.executionRequest.batchInfo[m].scenarionIndex[n]
                  ] = 1;
                }
              }
            }
          });
        }
      }
      setEachData(tableData);
    }
    // setLoading(false);
  };

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
      setProjectList(data);
    })();
  }, [projectId]);

  const [recurrenceType, setRecurrenceType] = useState("");
  const [monthlyRecurrenceWeekValue, setMonthlyRecurrenceWeekValue] =
    useState("");

  const weekDays = [
    { name: "Sunday" },
    { name: "Monday" },
    { name: "Tuesday" },
    { name: "Wednesday" },
    { name: "Thursday" },
    { name: "Friday" },
    { name: "Saturday" },
  ];

  const [selectedWeek, setSelectedWeek] = useState([]);

  const showSuccess_execute = () => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "Execution has started",
      life: 1000,
    });
  };
  const showSuccess_Schedule = () => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "Execution has been scheduled",
      life: 1000,
    });
  };

  var myJsObj = { key: currentKey, executionType: executionTypeInRequest };
  var str = JSON.stringify(myJsObj, null, 4);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    setSmartMode("normal");
    setSelectedICE("");
    // var projId = current_task.testSuiteDetails ? current_task.testSuiteDetails[0].projectidts : currentTask.testSuiteDetails[0].projectidts;
    var projId = "642d4a250934a8c996e598a0";
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

  const handleWeekInputChange = (event) => {
    setMonthlyRecurrenceWeekValue(event.target.value);
  };
  // const toggleDropdown = () => {
  //   setIsOpen(!isOpen);
  // };
  const getRecurrenceType = (event) => {
    setRecurrenceType(event.target.value);
  };
  useEffect(() => {
    if (recurrenceType === "Weekly") {
      setSelectedWeek([]);
    }
  }, [recurrenceType]);
  const handleCounterChange = (e) => {
    setCounter(e.target.value);
  };

  const confirm_delete = (event, item) => {
    setDeleteItem(item);
    event.preventDefault(); // Prevent the default behavior of the button click
    setLogoutClicked(true);
    let text = `Are you sure you want to delete' ${item.configurename}' Execution Profile?`;
    setProfileTxt(text);
    //   confirmPopup({
    //     target: event.currentTarget,
    //     message: (
    //      <p>
    //         Are you sure you want to delete <b>{item.configurename}</b> Execution Profile?
    //       </p>
    //     ),
    //     icon: 'pi pi-exclamation-triangle',
    //   });
    // };
    //   const onClickDeleteDevOpsConfig = (item, key) => {
    //     setShowConfirmPop({'title': 'Delete Execution Profile', 'content': <p>Are you sure, you want to delete <b>{item.configurename}</b> Execution Profile?</p>, 'onClick': ()=>{ deleteDevOpsConfig(key) }});
  };

  const copyKeyUrlFunc = (id) => {
    const data = document.getElementById(id).title;
    if (!data) {
      setApiKeyCopyToolTip("Nothing to Copy!");
      setTimeout(() => {
        setApiKeyCopyToolTip("Click to Copy");
      }, 1500);
      return;
    }
    const x = document.getElementById(id);
    x.select();
    document.execCommand("copy");
    setApiKeyCopyToolTip("Copied!");
    setTimeout(() => {
      setApiKeyCopyToolTip("Click to Copy");
    }, 1500);
  };
  const copyConfigKey = (title) => {
    if (navigator.clipboard.writeText(title)) {
      setCopyToolTip("Copied!");
      setTimeout(() => {
        setCopyToolTip("Click to Copy");
      }, 1500);
    }
  };
  const tree_CICD = [
    {
      key: "0",
      label: "Elastic Execution Grid Information",
      data: "Documents Folder",
      icon: "pi pi-fw pi-calendar",
      expanded: true,
      children: [
        {
          key: "1",

          label: (
            <div className="input_CICD ">
              <div class="container_url">
                {/* <span className="devopsUrl_label" id='api-url' value={url}>DevOps Integration API url : </span> */}

                <label for="inputField" class="devopsUrl_label">
                  Devops Integration URL
                </label>
                <input
                  type="text"
                  id="inputField"
                  class="inputtext_CICD"
                  value={url}
                />
                {/* <Tooltip title={copyToolTip}/> */}
                {/* <Tooltip id="copy" effect="solid" backgroundColor="black" title={copyToolTip} arrow={true}/> */}
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
                  <InputTextarea
                    className="inputtext_devops"
                    rows={4}
                    cols={30}
                    value={str}
                  />

                  <Button icon="pi pi-copy" className="copy_devops" />
                </div>
              </div>

              {/* <div className="lable_sync">
                <lable className="Async_lable"> Asynchronous</lable>
                <InputSwitch className="inputSwitch_CICD"
                  checked={checked}
                  onChange={(e) => setChecked(e.value)}
                />
                <label  className="sync_label" id="sync" htmlFor="synch" value="synchronous">
                  Synchronous{" "}
                </label>
              </div> */}

              {/* <div class="container_devopsLabel">
                <lable className="devops_label">Devops Request Body</lable>
              </div>
              <div>
                <div className="inputtext_devops">
                  <InputTextarea rows={4} cols={30} />
                  <Button icon="pi pi-copy" className="copy_devops" />
                </div>
              </div> */}
            </div>
          ),
        },
      ],
    },
  ];

  const treeData = [
    {
      key: "1",
      label: "Schedule Options",
      data: "Events Folder",
      icon: "pi pi-fw pi-calendar",

      children: [
        {
          key: "1-0",
          label: (
            <div className="flex-auto">
              <label
                htmlFor="calendar-timeonly"
                className="font-bold block mb-2"
              >
                Start Time
              </label>
              <Calendar
                id="calendar-timeonly"
                value={time}
                onChange={(e) => setTime(e.value)}
                timeOnly
                placeholder="Enter Start Time"
              />
            </div>
          ),
        },
      ],
    },

    {
      key: "1",
      label: " Recurrence Pattern",
      data: "Events Folder",
      icon: "pi pi-fw pi-calendar",

      children: [
        {
          key: "1-0",
          label: (
            <div className="recurrence-container">
              <div className="recurrence-list">
                <lable>
                  <RadioButton
                    value="Daily"
                    checked={recurrenceType === "Daily"}
                    onChange={getRecurrenceType}
                  />
                  <span className="Daily_lable"> Daily</span>
                </lable>

                <lable>
                  <RadioButton
                    value="Weekly"
                    checked={recurrenceType === "Weekly"}
                    onChange={getRecurrenceType}
                  />
                  <span className="Weekly_lable"> Weekly</span>
                </lable>

                <lable>
                  <RadioButton
                    type="radio"
                    value="Monthly"
                    checked={recurrenceType === "Monthly"}
                    onChange={getRecurrenceType}
                  />
                  <span className="Monthly_lable"> Monthly</span>
                </lable>
                <lable>
                  <RadioButton
                    type="radio"
                    value="Yearly"
                    checked={recurrenceType === "Yearly"}
                    onChange={getRecurrenceType}
                  />
                  <span className="yearly_lable">Yearly</span>
                </lable>
              </div>
              {/* <div className="recurrence-content"> */}
              {recurrenceType === "Weekly" && (
                <div className="weekly-recurrence-list">
                  <div className=" schedule_input_counter">
                    <label>Recur every</label>
                    <InputText
                      className="input_count"
                      type="number"
                      value={counter}
                      onChange={handleCounterChange}
                    />
                    <label>week(s) on:</label>
                  </div>
                  <div className="weeks">
                    {weekDays.map(({ name }, index) => {
                      return (
                        <div className="weeks-child">
                          <lable>
                            <input
                              type="checkbox"
                              value={name}
                              checked={selectedWeek.includes(name)}
                              onChange={handleWeekInputChange}
                            />
                            <span> {name}</span>
                          </lable>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* </div> */}
            </div>
          ),
        },
      ],
    },
    {
      key: "1",
      label: "Range of Recurrence",
      data: "Events Folder",
      icon: "pi pi-fw pi-calendar",

      children: [
        {
          key: "1-0",
          label: (
            <div className="schedule_date  ">
              <div>
                <RadioButton
                  value="End Date "
                  checked={time_limit === "End Date "}
                />
                <label className=" end_lable ml-2">End Date </label>
              </div>
              <div>
                <RadioButton
                  value="End After "
                  checked={time_limit === "End After"}
                />
                <label className=" endAfter_lable ml-2">End After </label>
              </div>
              <div>
                <RadioButton
                  value="No end date "
                  checked={time_limit === "No end date"}
                />
                <label className=" noEndDate_lable ml-2">No end date</label>
              </div>
            </div>
          ),
        },
      ],
    },
  ];
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

  const ExecuteTestSuite = async (executionData) => {
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
          setMsg(MSG.CUSTOM(data["error"], data.variant));
        } else {
          setMsg(MSG.CUSTOM(data["message"], data.variant));
        }
      }
      setBrowserTypeExe([]);
      setModuleInfo([]);
      setExecAction("serial");
      setExecEnv("default");
    } catch (error) {
      // setLoading(false);
      ResetSession.end();
      displayError(MSG.EXECUTE.ERR_EXECUTE);
      setBrowserTypeExe([]);
      setModuleInfo([]);
      setExecAction("serial");
      setExecEnv("default");
    }
  };

  const tableUpdate = () => {
    (async () => {
      const configurationList = await fetchConfigureList({
        projectid: "646b3f8495cef4ee0ababfdf",
      });
      setConfigList(
        configurationList.map((item, idx) => {
          return {
            sno: idx + 1,

            profileName: (
              <div>
                <Checkbox className="checkbox_header" />
                <span>{item.configurename}</span>
              </div>
            ),
            executionOptions: (
              <div className="Buttons_config">
                <Button
                  style={{
                    width: "8.5rem",
                    fontFamily: "Open Sans",
                    fontStyle: "normal",
                    marginLeft: "0.5rem",
                    height: "2.5rem",
                  }}
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
                <Dialog
                  className="dialog_execute "
                  header="Execute : Regression"
                  visible={visible_execute}
                  style={{ width: "50vw" }}
                  onHide={() => {
                    setVisible_execute(false);
                  }}
                  footer={renderFooter("visible_execute")}
                >
                  <Card className="execute_card p-card p-card-body ">
                    <p className="m-0 ">
                      <div>Avo Agent:SBLTQAFFF </div>
                      <div>Selected Browsers : Google Chrome</div>
                      <div>Execution Mode : Headless</div>
                    </p>
                  </Card>
                  <div className="radioButtonContainer">
                    <RadioButton
                      value="Execute with Avo Assure Agent/ Grid"
                      onChange={() => {
                        setShowIcePopup(false);
                      }}
                      checked={
                        radioButton_grid ===
                        "Execute with Avo Assure Agent/ Grid"
                      }
                    />
                    <label className="executeRadio_label_grid ml-2">
                      Execute with Avo Assure Agent/ Grid
                    </label>
                    <div className="radioButtonContainer1">
                      <RadioButton
                        value="Execute with Avo Assure Client"
                        // onChange={(e) => handleRadioButtonChange(e.value)}
                        onChange={() => {
                          setShowIcePopup(true);
                        }}
                        checked={
                          ingredient === "Execute with Avo Assure Client"
                        }
                      />
                    </div>
                    <label className=" executeRadio_label_clint ml-2">
                      Execute with Avo Assure Client
                    </label>
                  </div>
                  {/* <div className='adminControl-ice popup-content popup-content-status'> */}
                  {/* <div> */}
                  {showIcePopup && (
                    <div>
                      <div className="legends-container">
                        <span className="legend_Status" title="Token Name">
                          Status:
                        </span>
                        <div className="legend">
                          <span id="status" className="status-available"></span>
                          <span className="legend-text">Available</span>
                        </div>
                        <div className="legend">
                          <span
                            id="status"
                            className="status-unavailable"
                          ></span>
                          <span className="legend-text">Unavailable</span>
                        </div>
                        <div className="legend">
                          <span id="status" className="status-dnd"></span>
                          <span className="legend-text">Do Not Disturb</span>
                        </div>
                      </div>
                      <div>
                        <span
                          className="execute_dropdown .p-dropdown-label "
                          title="Token Name"
                        >
                          Execute on
                        </span>
                        {/* <Dropdown
                            className="dropdown_execute .p-inputtext"
                            placeholder="Search"
                          ></Dropdown> */}
                        <div className="adminControl-ice popup-content">
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
                  {/* </div> */}
                  {/* </div> */}
                </Dialog>

                <Button
                  style={{
                    width: "6rem",
                    fontFamily: "Open Sans",
                    fontStyle: "normal",
                    height: "2.5rem",
                  }}
                  onClick={() => setVisible_schedule(true)}
                  size="small"
                >
                  {" "}
                  Schedule
                </Button>
                <Dialog
                  className="dialog_Schedule"
                  header="Schedule : Regression"
                  visible={visible_schedule}
                  style={{ width: "60vw" }}
                  onHide={() => setVisible_schedule(false)}
                  footer={footerContent_Schedule}
                >
                  <Card className="Schedule_card  .p-card .p-card-content ">
                    <p className="m-0 ">
                      <div>Avo Agent:SBLTQAFFF </div>
                      <div>Selected Browsers : Google Chrome</div>
                      <div>Execution Mode : Headless</div>
                    </p>
                  </Card>

                  <Tree
                    className="schedule_tree"
                    value={treeData}
                    selectionMode="single"
                    selectionKeys={selectedNodeKey}
                    onSelectionChange={onNodeSelect}
                    // onToggle={onToggleNode}
                  />
                </Dialog>
                <Button
                  style={{
                    width: "4.5rem",
                    fontFamily: "Open Sans",
                    fontStyle: "normal",
                    height: "2.5rem",
                  }}
                  size="small"
                  onClick={() => {
                    setVisible_CICD(true);
                    setCurrentKey(item.configurekey);
                  }}
                >
                  CI/CD
                </Button>

                <Dialog
                  className="dialog_CICD"
                  header="Execute : Regression"
                  visible={visible_CICD}
                  style={{ width: "50vw" }}
                  onHide={() => setVisible_CICD(false)}
                  // footer={footerContent_CICD}
                >
                  <Card className="Schedule_card  .p-card .p-card-content ">
                    <p className="m-0 ">
                      <div>Avo Agent:SBLTQAFFF</div>
                      <div>Selected Browsers : Google Chrome</div>
                      <div>Execution Mode : Headless</div>
                    </p>
                  </Card>

                  <Tree
                    className="CICD_tree"
                    value={tree_CICD}
                    selectionMode="single"
                    selectionKeys={selectedNodeKey}
                    onSelectionChange={onNodeSelect}
                  />
                </Dialog>
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
          };
        })
      );
    })();
  };

  useEffect(() => {
    tableUpdate();
  }, [visible_execute, visible_schedule, visible_CICD, selectedICE]);

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
      setSelectedNodeKeys({
        "1": {
            "checked": true,
            "partialChecked": false
        },
        "1-0": {
            "checked": true,
            "partialChecked": false
        },
        "1-1": {
            "checked": true,
            "partialChecked": false
        },
        "1-2": {
            "checked": true,
            "partialChecked": false
        }
    });
    } else {
      setUpdateKey("");
      setAvodropdown({});
      setMode(selections[0]);
      setConfigTxt("");
      setModules("normalExecution");
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
      const selectedArr = parent.map((element) => child.map((el) => el[element] ? el[element] : false).filter((i) => i !== false))
      // parent.map((item, index) => ({ [item]: selectedArr[index] }))
      parent.forEach((item, index) => {
        selectedKeys[item] = selectedArr[index]
      })
      let getCurrent = {};
      xpanded?.forEach((val) => {
        let numberArray = [];
        selectedKeys[Number(val.key)].forEach( ele => numberArray.push(+ele));
        getCurrent[val.suiteid] =  numberArray
      });
      
      const dataObj = {
        param: "updateTestSuite_ICE",
        batchDetails: xpanded?.map((el) => ({
          testsuiteid: el?.testsuiteid,
          testsuitename: el?.suitename,
          testscenarioids: el?.suitescenarios,
          getparampaths: Object.values(
            paramPaths[el?.key].map((el) => el?.value)
          ),
          conditioncheck: Object.values(
            checkcondition[el?.key].map((el) =>
              el?.value?.code === "T" ? "1" : 0
            )
          ),
          accessibilityParameters: Object.values(
            accessibilityParams[el?.key].map((el) => el?.value)
          ),
        })),
      };
      const executionData = {
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
        batchInfo: xpanded?.map((item) => ({
          scenarioTaskType: "disable",
          testsuiteName: item.suitename,
          testsuiteId: item.suiteid,
          batchname: "",
          versionNumber: 0,
          appType: "Web",
          domainName: "Banking",
          projectName: getConfigData?.projects[0]?.name,
          projectId: getConfigData?.projects[0]?._id,
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
        })),
        donotexe: {
          current: getCurrent
        },
        scenarioFlag: false,
        isExecuteNow: false,
      };
      dispatch(updateTestSuite(dataObj)).then(() =>
        dispatch(storeConfigureKey(executionData))
      );
      // tableUpdate();
      setVisible(false);
    } else if (getBtnType === "Next") {
      setTabIndex(1);
      setFooterType(setupBtn);
    } else if (getBtnType === "Cancel") {
      setTabIndex(0);
      setFooterType("CancelNext");
      setVisible(false);
    } else setVisible(false);
  };

  const onNodeSelect = (e) => {
    if (e && e.node && e.node.key) {
      setSelectedNodeKey(e.node.key);
    }
  };
  const onNodeSelect1 = (e) => {
    if (e && e.node && e.node.key) {
      setSelectRecurrenceKey(e.node.key);
    }
  };

  const Breadcrumbs = () => {
    // const [isOpen, setIsOpen] = useState(false);
    // const toggleDropdown = () => {
    //   setIsOpen(!isOpen);
    // };
    return (
      <nav>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            marginLeft: "1rem",
          }}
        >
          <li>
            <Link to="/landing"> Home </Link>
            <span> / </span>

            <select
              onChange={(e) => {
                setprojectId(e.target.value);
              }}
              style={{ width: "10rem", height: "19px" }}
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

  const renderFooter = (name) => {
    return (
      <div>
        <Button
          label="Execute"
          title="Execute"
          className="execute_button"
          onClick={async () => {
            if (showIcePopup) {
              dataExecution.type =
                ExeScreen === true
                  ? smartMode === "normal"
                    ? ""
                    : smartMode
                  : "";
              dataExecution.poolid = "";

              if ((ExeScreen === true ? smartMode : "") !== "normal")
                dataExecution.targetUser = Object.keys(selectedICE).filter(
                  (icename) => selectedICE[icename]
                );
              else dataExecution.targetUser = selectedICE;

              CheckStatusAndExecute(dataExecution, iceNameIdMap);
              onHide(name);
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
                setMsg(
                  MSG.CUSTOM("Execution Added to the Queue.", VARIANT.SUCCESS)
                );
              }
              onHide(name);
            }
          }}
          autoFocus
        />
      </div>
    );
  };
  const onHide = (name) => {
    dialogFuncMap[`${name}`](false);
  };
  // const onClick = (name, position) => {
  //   dialogFuncMap[`${name}`](true);

  //   if (position) {
  //       setPosition(position);
  //   }
  // }

  // const footerContent_config = (
  //   <div className="btn-11">
  //     <Button label="Cancel" className="Cancle_button" />
  //     <Button className="execute_button" label="Execute" onClick={showSuccess_execute}></Button>
  //   </div>
  // );
  // const footerContent_CICD = (
  //   <div className="btn-11">
  //     <Button label="Cancel" className="Cancle_button" />
  //     <Button className="confirm_button" label="Confirm"></Button>
  //   </div>
  // );
  const footerContent_Schedule = (
    <div className="btn-11">
      <Button label="Cancel" className="Cancle_button" />
      <Button
        className="Schedule_button"
        label="Schedule"
        onClick={showSuccess_Schedule}
      ></Button>
    </div>
  );

  const handleRadioButtonChange = (value) => {
    setRadioButton_grid(value);
    setSelectedRadio(value);
  };
  const tabMenuItems =
    configList.length > 0
      ? [
          ...items,
          {
            label: (
              <Button
                onClick={() => configModal("CancelSave")}
                className="addConfi_button"
                size="small"
              >
                {" "}
                Add Configuration
              </Button>
            ),
          },
        ]
      : items;
  const checkboxHeaderTemplate = () => {
    return (
      <>
        <Checkbox classname=" checkbox_header" />
        <span className="profile_label"> Configuration Profile Name</span>
      </>
    );
  };

  const renderTable = () => {
    if (configList.length > 0) {
      return (
        <>
          <DataTable
            className="  datatable_list  "
            value={configList}
            style={{
              width: "100%",
              height: "calc(100vh - 250px)",
              marginRight: "-1rem",
            }}
          >
            <Column
              style={{ fontWeight: "normal", fontFamily: "open Sans" }}
              field="sno"
              header="S.No."
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
                fontWeight: "normal",
                fontFamily: "open Sans",
                marginRight: "23rem",
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
                fontWeight: "normal",
                fontFamily: "open Sans",
                marginleft: "7rem",
                textAlign: "left",
              }}
              field="actions"
              header={<span className="actions-header">Actions</span>}
            />
          </DataTable>
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
                  fontWeight: "normal",
                  fontFamily: "open Sans",
                }}
              >
                S.No.
              </span>
              <span
                style={{
                  marginRight: "13rem",
                  fontWeight: "normal",
                  fontFamily: "open Sans",
                }}
              >
                {" "}
                <Checkbox /> Configuration Profile Name
              </span>
              <span
                style={{
                  marginRight: "18rem",
                  fontWeight: "normal",
                  fontFamily: "open Sans",
                }}
              >
                Execution Options
              </span>
              <span
                style={{
                  marginRight: "1rem",
                  fontWeight: "normal",
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

        <div>
          {configList.length > 0 ? (
            <div>
              <TabMenu className=" tabs tab-menu" model={tabMenuItems} />
            </div>
          ) : (
            <div>
              <TabMenu className="tab-menu" model={items} />
            </div>
          )}
        </div>
        <div className="ConfigurePage_container  m-2">{renderTable()}</div>
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
          footerType={footerType}
          modalSytle={{ width: "85vw", height: "94vh", background: "#FFFFFF" }}
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
