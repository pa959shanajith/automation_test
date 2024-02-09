import React, { useState, useEffect, useRef,useMemo} from "react";
import { TabMenu } from "primereact/tabmenu";
import { v4 as uuid } from "uuid";
import { Panel } from "primereact/panel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { RadioButton } from "primereact/radiobutton";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import { ConfirmPopup } from "primereact/confirmpopup";
import { useDispatch, useSelector } from "react-redux";
import "../styles/ConfigurePage.scss";
import AvoModal from "../../../globalComponents/AvoModal";
import ConfigureSetup from "./ConfigureSetup";
import {FooterTwo as Footer} from '../../global';
import ExecutionProfileStatistics from "./ExecutionProfileStatistics";
// import {readTestSuite_ICE} from '../api'
import { Dropdown } from 'primereact/dropdown'; 
// import {saveSauceLabData} from '../api';
import ScreenOverlay from '../../global/components/ScreenOverlay';
import { BrowserstackLogin,BrowserstackExecute } from "./Browserstack"; 
import { readTestSuite_ICE, saveBrowserstackData, getDetails_SAUCELABS, saveSauceLabData } from "../api";
import { checkRole, roleIdentifiers } from "../../design/components/UtilFunctions";
import { InputText } from 'primereact/inputtext';

import {SauceLabLogin,SauceLabsExecute} from './sauceLabs';
import {
  fetchConfigureList,
  getPools,
  getICE_list,
  getProjectList,
  ExecuteTestSuite_ICE,
  readTestSuite_ICEuser,
  execAutomation,
  deleteConfigureKey,
  sendMailOnExecutionStart,
} from "../api";
import {
  getAvoAgentAndAvoGrid,
  getModules,
  getProjects,
  getScheduledDetails_ICE,
  storeConfigureKey,
  testSuitesScheduler_ICE,
  testSuitesSchedulerRecurring_ICE,
  updateTestSuite,
  setScheduleStatus,
  clearErrorMSg

} from "../configureSetupSlice";
import { getPoolsexe } from "../configurePageSlice";
import { getICE } from "../configurePageSlice";
import DropDownList from "../../global/components/DropDownList";
import { ResetSession, setMsg, Messages as MSG, VARIANT } from "../../global";
import { browsers, selections } from "../../utility/mockData";
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";
import ScheduleScreen from "./ScheduleScreen";
import AvoInput from "../../../globalComponents/AvoInput";
import ExecutionPage from "./ExecutionPage";
import ExecutionCard from "./ExecutionCard";
import { Tooltip } from 'primereact/tooltip';
import { loadUserInfoActions } from '../../landing/LandingSlice';
import { getNotificationChannels } from '../../admin/api'
import { useNavigate } from 'react-router-dom';
import { Paginator } from "primereact/paginator";
import useDebounce from "../../../customHooks/useDebounce";
export var navigate



const ConfigurePage = ({ setShowConfirmPop, cardData }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  // const proj = useSelector((state)=>state.design.selectedProj)
  const [visible_setup, setVisible_setup] = useState(false);
  const [visible_schedule, setVisible_schedule] = useState(false);
  const [visible_CICD, setVisible_CICD] = useState(false);
  const [visible_execute, setVisible_execute] = useState(false);
  const [showIcePopup, setShowIcePopup] = useState(true);
  const toast = useRef(null);
  const url = window.location.href.slice(0, -7) + "execAutomation";
  const [configProjectId, setConfigProjectId] = useState("");
  const [visible_saucelab, setVisible_saucelab] = useState(false);
  const [saucelabsExecutionEnv, setSaucelabExecutionEnv] = useState(null);
  const [browserstackExecutionEnv, setBrowserstackExecutionEnv] = useState(null)
  const [selectedProject, setSelectedProject] = useState("");
  const [firstPage, setFirstPage] = useState(1);
  const [rowsPage, setRowsPage] = useState(10);
  const [configList, setConfigList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [modules, setModules] = useState("normalExecution");
  const [changeLable, setChangeLable] = useState(false);
  const [dotNotExe, setDotNotExe] = useState({});
  const buttonEl = useRef(null);
  const [dataExecution, setDataExecution] = useState({});
  const [readTestSuite, setReadTestSuite] = useState({});
  const [checkDisable, setCheckDisable] = useState(false);
  const [allocateICE, setAllocateICE] = useState(false);
  const [eachData, setEachData] = useState([]);
  const [currentTask, setCurrentTask] = useState({});
  const [moduleInfo, setModuleInfo] = useState([]);
  const [execAction, setExecAction] = useState("serial");
  const [execEnv, setExecEnv] = useState("default");
  const [accessibilityParameters, setAccessibilityParameters] = useState([]);
  const [browserTypeExe, setBrowserTypeExe] = useState([]);
  const [loader, setLoader] = useState(false);
  const [integration, setIntegration] = useState({
    alm: { url: "", username: "", password: "" },
    qtest: { url: "", username: "", password: "", qteststeps: "" },
    zephyr: { url: "", username: "", password: "" },
    azure: { url: "", username: "", password: "" },
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
  const [currentName, setCurrentName] = useState("");
  const [currentSelectedItem, setCurrentSelectedItem] = useState("");
  const [executionTypeInRequest, setExecutionTypeInRequest] = useState("asynchronous");
  const [apiKeyCopyToolTip, setApiKeyCopyToolTip] = useState(" Copy");
  const [copyToolTip, setCopyToolTip] = useState(" Copy");
  const [logoutClicked, setLogoutClicked] = useState(false);
  const [profileTxt, setProfileTxt] = useState("");
  const [searchProfile, setSearchProfile] = useState("");
  const [browserTxt, setBrowserTxt] = useState("");
  const [selectedNodeKeys, setSelectedNodeKeys] = useState({});
  const [fetechConfig, setFetechConfig] = useState([]);
  const [configPages, setConfigPages] = useState(0);
  const [configItem, setConfigItem] = useState({});
  const [selectedSchedule, setSelectedSchedule] = useState({});
  const [scheduling, setScheduling] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [recurEvery, setRecurEvery] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [selectedPattren, setSelectedPattren] = useState({});
  const [selectedDaily, setSelectedDaily] = useState(null);
  const [selectedWeek, setselectedWeek] = useState([]);
  const [selectedMonthly, setSelectedMonthly] = useState(null);
  const [dropdownWeek, setDropdownWeek] = useState(null);
  const [dropdownDay, setDropdownDay] = useState(null);
  const [project, setProject] = useState({});
  const [scheduleOption, setScheduleOption] = useState({});
  const [typeOfExecution, setTypeOfExecution] = useState("");
  const [executingOn, setExecutingOn] = useState("");
  const [sauceLab, setSauceLab] = useState(false);
  const [dropdownSelected,setDropdownSelected] = useState([]);
  const [appType, setAppType] = useState('');
  const [showSauceLabLogin,setShowSauceLabLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBrowserstackLogin,setShowBrowserstackLogin] = useState(false);
  const [displayBasic4, setDisplayBasic4] = useState(false);
  const [showBrowserstack, setShowBrowserstack] = useState(false);
  const [displayBasic6, setDisplayBasic6] = useState(false);
  const [displayBasic7, setDisplayBasic7] = useState(false);
  const [currentExecutionRequest,setCurrentExecutionRequest] = useState(null);
  const [sauceLabUser,setSauceLabUser] = useState({});
  const [displayBasic5, setDisplayBasic5] = useState(false);
  const [browserDetails,setBrowserDetails] = useState([]);
  const [mobileDetails,setMobileDetails] = useState([]);
  const [showSauceLabs, setShowSauceLabs] = useState(false);
  const [osNames, setOsNames] = useState([]);
  const [browserstackUser,setBrowserstackUser] = useState({});
  const [browserstackBrowserDetails,setBrowserstackBrowserDetails] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [mobileDetailsBrowserStack,setMobileDetailsBrowserStack] = useState([]);
  const [browserstackValues,setBrowserstackValues] = useState({});
  const [platforms, setPlatforms] = useState([]);
  const [runningStatusTimer, setRunningStatusTimer] = useState("");
  const [browserlist, setBrowserlist] = useState([
    {
        key: '3',
        text: 'Internet Explorer'
    },
    {
        key: '1',
        text: 'Google Chrome'
    },{
        key: '2',
        text: 'Firefox'
    },
    // {
    //     key: '7',
    //     text: 'Microsoft Edge'
    // },
    {
        key: "safari",
        text: "Safari",
        disabled:true,
    },
    {
        key: '8',
        text: 'Microsoft Edge'
    }
]);
  const [currentPage, setCurrentPage] = useState(1);

  let userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
  if (!userInfo) userInfo = userInfoFromRedux;
  else userInfo = userInfo;

  let projectInfo = JSON.parse(localStorage.getItem('DefaultProject'));
  const projectInfoFromRedux = useSelector((state) => state.landing.defaultSelectProject);
  if (!projectInfo) projectInfo = projectInfoFromRedux;
  else projectInfo = projectInfo;

  const [radioButton_grid, setRadioButton_grid] = useState(
    projectInfo?.appType==="Web"? "Execute with Avo Assure Client" : "Execute with Avo Assure Agent/ Grid"
  );
  const [defaultValues, setDefaultValues] = useState({});
  const [defaultValues2, setDefaultValues2] = useState({});
  const [emailNotificationReciever, setEmailNotificationReciever] = useState(null);
  const [isNotifyOnExecutionCompletion, setIsNotifyOnExecutionCompletion] = useState(false);
  const [isEmailNotificationEnabled, setIsEmailNotificationEnabled] = useState(false);
  const [displayModal, setDisplayModal] = useState(false);
  const [position, setPosition] = useState('center');
  const [checkedExecution, setCheckedExecution] = useState(false);
  const [emailNotificationEnabled, setEmailNotificationEnabled] = useState(null);
  const [emailNotificationSender, setEmailNotificationSender] = useState(null);
  const [batchInfo, setBatchInfo] = useState([]);
  const [profileName, setProfileName] = useState(null);
  const [configbtnsave,setConfigbtnsave]=useState(null);
  
  const NameOfAppType = useSelector((state) => state.landing.defaultSelectProject);
  const typesOfAppType = NameOfAppType.appType;
  const [selectedLanguage, setSelectedLanguage] = useState("curl");
  const [selectBuildType, setSelectBuildType] = useState("HTTP");
  const languages = [
    { label: "cURL", value: "curl" },
    { label: "Javascript", value: "javascript" },
    { label: "Python", value: "python" },
    { label: "PowerShell - RestMethod", value: "powershell" },
    {label: "Shell - wget", value: "shell"}
  ]
  const debouncedSearchValue = useDebounce(searchProfile, 500);

  useEffect(() => {
    setConfigProjectId(projectInfo?.projectId)
  }, [projectInfo]);

  useEffect(() => {
    setRadioButton_grid("Execute with Avo Assure Client")
    setShowSauceLabs(projectInfo?.appType === "MobileWeb" || projectInfo?.appType === "MobileApp");
    setShowBrowserstack(projectInfo?.appType === "MobileWeb" || projectInfo?.appType === "MobileApp");
    setExecutingOn("ICE");
    setShowIcePopup(true);
  }, [projectInfo?.projectId, projectInfo?.appType]);

 const displayError = (error) => {
    setLoading(false)
    toastError(error);
  };


  const toastError = (erroMessage) => {
    if (erroMessage && erroMessage.CONTENT) {
      toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(erroMessage), life: 5000 });
  }

  const toastSuccess = (successMessage) => {
    if (successMessage && successMessage.CONTENT) {
      toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'success', summary: 'Success', detail: JSON.stringify(successMessage), life: 5000 });
  }

  const onClick = (name, position) => {
    dialogFuncMap[`${name}`](true);
  
    if (position) {
        setPosition(position);
    }
  }
 
  const onHide = (name) => {
    dialogFuncMap[`${name}`](false);
  
    if (name === "displayModal") {
        setDisplayModal(false);
        setIsEmailNotificationEnabled(false);
    }
  }

  const [setupBtn, setSetupBtn] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [activeIndex1, setActiveIndex1] = useState(0);
  const timeinfo = useRef(null);
  const scheduleinfo  = useRef(null);
  const errorinfo  = useRef(null);

  const items = [{ label: "Configurations" }, { label: "Execution(s)" },{label:"Execution Profile Statistics"}];
  const handleTabChange = (e) => {
    setActiveIndex1(e.index);
  };

  const getConfigData = useSelector((store) => store.configsetup);
  localStorage.setItem("configData",JSON.stringify(getConfigData))
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
    scenarioTaskType,
    currentExecutionRequest
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
      (projectdata.project && projectid in projectdata.project)
          ? projectdata.project[projectid].domain
          : testsuiteDetails.domainName;
      suiteInfo.projectName =
      (projectdata.projectDict && projectid in projectdata.projectDict)
          ? projectdata.projectDict[projectid]
          : testsuiteDetails.projectName;
      suiteInfo.projectId = projectid;
      suiteInfo.releaseId = relid;
      suiteInfo.cycleName =
      (projectdata.cycleDict &&cycid in projectdata.cycleDict)
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
      // dispatch(loadUserInfoActions.setDefaultProject({ ...projectInfo,projectName: Projects.projectName[0], projectId: Projects.projectId[0], appType: Projects.appTypeName[0] }));
      setProject(Projects);
      for (var i = 0; Projects.projectName.length > i; i++) {
        data.push({ name: Projects.projectName[i], id: Projects.projectId[i], projectLevelRole: Projects.projectlevelrole[0][i]["assignedrole"] });
      }
      // data.push({...data, name:Projects.projectName[i], id:Projects.projectId[i]})
      //  const data =[ {
      //     key: Projects.projectId,
      //     value:Projects.projectNames
      //   }]
      // setConfigProjectId(data[0] && data[0]?.id);
      setProjectList(data);
    })();
  }, []);

 const showSuccess_CICD = (btnType) => {
    if (btnType === "Cancel") {
      setVisible_CICD(false);
      setSelectedLanguage("curl");
      setSelectBuildType("HTTP");
      setExecutionTypeInRequest("asynchronous");
    }
  };

  var myJsObj = { key: currentKey, executionType: executionTypeInRequest };
  var str = JSON.stringify(myJsObj, null, 4);

  const codeSnippets = {
    curl: `curl --location "${url}" \n
--header "Content-Type: application/json" \n
--data "{
    \"key\": \"${currentKey}\",
    \"executionType\": \"${executionTypeInRequest}\"
}"`,

    javascript: `var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "key": "${currentKey}",
    "executionType": "${executionTypeInRequest}"
});

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("${url}", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));`,

    python: `import requests
import json
import time
from requests.packages.urllib3.exceptions import InsecureRequestWarning

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

url = "${url}"

payload = json.dumps({
    "key": "${currentKey}",
    "executionType": "${executionTypeInRequest}"
})
headers = {
    'Content-Type': 'application/json'
}

try:
    response = requests.request("POST", url, headers=headers, data=payload, verify=False)
    response = response.json()
    print(f"status :            {response['status']}")
    print(f"ReportLink :        {response['reportLink']}")
    print(f"RunningStatusLink : {response['runningStatusLink']}")
    status = response["status"]

    if status == "pass":
        running_status_link = response["runningStatusLink"]
        status_response = requests.request("GET", running_status_link, headers=headers, verify=False)
        status_response = status_response.json()
        running_status = status_response["status"]
        completed = status_response["Completed"]

        while running_status == "Inprogress":
            print(f"Executing... {completed}")

            status_response = requests.request("GET", running_status_link, headers=headers, verify=False)
            status_response = status_response.json()
            running_status = status_response["status"]
            if "Completed" in status_response:
                completed = status_response["Completed"]
            else:
                completed = ""
            time.sleep(${runningStatusTimer})

        if running_status == "Completed":
            pretty_json = json.dumps(status_response, indent=4)
            print(pretty_json)
    else:
        print("Some error occurred")
except Exception as e:
    print("Some error occurred")
`,

    powershell: `# Disable SSL/TLS validation (for testing purposes only)
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
        
# Define headers and body
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "application/json")
    
$body = @"
{
    "key": "${currentKey}",
    "executionType": "${executionTypeInRequest}"
}
"@
    
try {
    $response = Invoke-RestMethod '${url}' -Method 'POST' -Headers $headers -Body $body
    $status = $response.status
    
    # Check if status is pass or fail
    if ($status -ne "fail") {
        Write-Host "Status            :" $response.status
        Write-Host "ReportLink        :" $response.reportLink
        Write-Host "RunningStatusLink :" $response.runningStatusLink
        $runningStatusLink = $response.runningStatusLink
        $statusResponse = Invoke-RestMethod -Uri $runningStatusLink -Method 'GET' -Headers $headers
        $runningStatus = $statusResponse.status
        $complete = $statusResponse.Completed
        
        while ($runningStatus -eq "Inprogress") {
            Write-Host "Executing... $complete"
    
            $statusResponse = Invoke-RestMethod -Uri $runningStatusLink -Method 'GET' -Headers $headers
            $runningStatus = $statusResponse.status
            if ($statusResponse.PSObject.Properties["Completed"]) {
                $complete = $statusResponse.Completed
            }
            else {
                $complete = ""
            }
            Start-Sleep -Seconds ${runningStatusTimer}
        }
    
        if ( $runningStatus -eq "Completed") {
            $summaryReport = $statusResponse | ConvertTo-Json -Depth 10
            Write-Host $summaryReport
        }
    } 
    else {
        Write-Host "Some error occurred"
    }
}
catch {
    Write-Host "Some error occurred"
}`,

    shell: `#!/bin/bash
# Disable SSL/TLS validation (for testing purposes only)
export CURL_CA_BUNDLE=""
export PYTHONHTTPSVERIFY=0

# Define URL, headers, and body
url="${url}"
headers="--header=Content-Type:application/json"
body='{
  "key": "${currentKey}",
  "executionType": "${executionTypeInRequest}"
}'
# Make the POST request with wget
response=$(wget --quiet --method=POST $headers --body-data="$body" -O - "$url")
  
# Check if the request was successful
status=$(echo "$response" | jq -r '.status')
  
if [ "$status" != "fail" ]; then
  runningStatusLink=$(echo "$response" | jq -r '.runningStatusLink')
  reportLink=$(echo "$response" | jq -r '.reportLink')
  echo "status            : $status"
  echo "reportLink        : $reportLink"
  echo "runningStatusLink : $runningStatusLink"

  # Check the execution status in a loop
  while true; do
    statusResponse=$(wget --quiet --method=GET $headers -O - "$runningStatusLink")
    runningStatus=$(echo "$statusResponse" | jq -r '.status')
    complete=$(echo "$statusResponse" | jq -r '.Completed')

    echo "Executing... $complete"

    if [ "$runningStatus" == "Completed" ]; then
      summaryReport=$(echo "$statusResponse" | jq -c '.')
      echo "$summaryReport"
      break
    fi
    sleep ${runningStatusTimer}
  done
else
  echo "Some error occurred"
fi`,
};

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
    if(configProjectId !== ""){
      setLoading('Fetching ICE ...')
      fetchData();
      setLoading(false);
    }
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

  const readTestSuiteFunct = async (readTestSuite, fetechConfig) => {
    setLoading("Loading in Progress. Please Wait");
    const result = await readTestSuite_ICE(readTestSuite, "execute");
    if(result.error){displayError(result.error);return;}
    else if (result) {
        var data = result;
        var keys = Object.keys(data);
        var tableData = [];
        keys.map(itm => tableData.push({...data[itm]}));

        //CR 2287 - If a scenario is opened and then navigated to it's scheduling then by default that particular scenario must be selected and rest of the scenarios from the module must be unselected.
        // if (current_task.scenarioFlag === 'True') {
        //     for (var m = 0; m < keys.length; m++) {
        //         for (var k = 0; k < tableData[m].scenarioids.length; k++) {
        //             if (tableData[m].scenarioids[k] === current_task.assignedTestScenarioIds || tableData[m].scenarioids[k] === current_task.assignedTestScenarioIds[0]) {
        //                 tableData[m].executestatus[k] = 1;
        //             } else tableData[m].executestatus[k] = 0;
        //         }
        //     }
        // }

        // Change executestatus of scenarios which should not be scheduled according to devops config
        for (var m = 0; m < keys.length; m++) {
            if(!tableData[m].executestatus.includes(0)){
                tableData[m].scenarioids.map((scenarioid, index) => {
                    tableData[m].executestatus[index] = 0;
                    if (m < fetechConfig.executionRequest.batchInfo.length) {
                        if(fetechConfig.executionRequest.selectedModuleType === 'normalExecution'){
                            for (var k in fetechConfig.executionRequest.batchInfo[m].suiteDetails) {
                                if (scenarioid === fetechConfig.executionRequest.batchInfo[m].suiteDetails[k].scenarioId) {
                                    tableData[m].executestatus[index] = 1;
                                    break;
                                }
                            }
                        } 
                        else{
                            for(var n = 0; n < fetechConfig.executionRequest.batchInfo[m].scenarionIndex.length; n++){
                                tableData[m].executestatus[fetechConfig.executionRequest.batchInfo[m].scenarionIndex[n]] = 1;
                            } 
                        }
                    }
                });
            }
        }
        setEachData(tableData);
    }
    setLoading(false);
}
  const onClick1 = (name) => {
    dialogFuncMap[`${name}`](true);
  }

  const dialogFuncMap = {
    'displayModal' : setDisplayModal,
    'displayBasic4' : setDisplayBasic4,
    'displayBasic5' : setDisplayBasic5,
    'displayBasic6' : setDisplayBasic6,
    'displayBasic7' : setDisplayBasic7,
    'showSauceLabLogin':setShowSauceLabLogin,
    'showBrowserstackLogin':setShowBrowserstackLogin 
}
  const handleOptionChange = async (selected,type,fetechConfig,index,idx) => {
    // setDropdownSelected(selected);
    setDropdownSelected(prevValues => {
        const newValues = [...prevValues];
        newValues[index] = selected;
        return newValues;
      });
    switch (selected) {
        case 'SauceLabs':
          setDisplayBasic4('displayBasic4');
          setExecutingOn("ICE")
          setConfigItem(idx);
            await triggerSauceLab(fetechConfig,type);
            // setDropdownSelected(prevValues => {
            //     const newValues = [...prevValues];
            //     newValues[index] = '';
            //     return newValues;
            //   });
            setDisplayBasic4(false);
            await handleSubmit1();
            break;
        case 'BrowserStack':
          setDisplayBasic6('displayBasic6');
          setExecutingOn("ICE")
          setConfigItem(idx);
            triggerBrowserstack(fetechConfig,type);
            setDropdownSelected(prevValues => {
                const newValues = [...prevValues];
                newValues[index] = '';
                return newValues;
              });
            break;
      case 'lambdaTest':
            // add changes for lambdaTest
            break;      
        default:
            break;
    }
   }
   const triggerSauceLab = (fetechConfig,type) => {
    if(type && type !== 'web'){
        setSauceLab(true);
    }
    onClick('displayBasic4');
    onClick('showSauceLabLogin');
    setCurrentKey(fetechConfig.configurekey);
    setCurrentExecutionRequest(fetechConfig.executionRequest);
    setAppType(fetechConfig.executionRequest.batchInfo[0].appType);
    setShowIcePopup(fetechConfig.executionRequest.batchInfo[0].appType !== "Web",fetechConfig.executionRequest.batchInfo[0].appType === "Web"?fetechConfig.executionRequest.batchInfo[0].appType === "Web":fetechConfig.executionRequest.batchInfo[0].appType !== "Web")
    setBrowserTypeExe(fetechConfig.executionRequest.batchInfo[0].appType === "Web" ? fetechConfig.executionRequest.browserType : ['1']);
    setCurrentName(fetechConfig.configurename);
    let testSuiteDetails = fetechConfig.executionRequest.batchInfo.map((element) => {
        return ({
            assignedTime: "",
            releaseid: element.releaseId,
            cycleid: element.cycleId,
            testsuiteid: element.testsuiteId,
            testsuitename: element.testsuiteName,
            projectidts: element.projectId,
            assignedTestScenarioIds: "",
            subTaskId: "",
            versionnumber: element.versionNumber,
            domainName: element.domainName,
            projectName: element.projectName,
            cycleName: element.cycleName
        });                                   
    });
    setCurrentTask({
        testSuiteDetails: testSuiteDetails
    });
    let accessibilityParametersValue = fetechConfig.executionRequest.batchInfo.map((element) => {
        return (element.suiteDetails[0].accessibilityParameters)
    });
    setAccessibilityParameters(accessibilityParametersValue);
    // readTestSuiteFunct(testSuiteDetails, fetechConfig);
    fetchData(fetechConfig.executionRequest.batchInfo[0].projectId);
    setChangeLable(true);
    setSauceLab(true);
    // setShowIcePopup(false);
   } 

   const triggerBrowserstack = (fetechConfig,type) => {
    if(type && type !== 'web'){
        setSauceLab(true);
    }
    onClick('displayBasic6');
    onClick('showBrowserstackLogin');
    setCurrentKey(fetechConfig.configurekey);
    setCurrentExecutionRequest(fetechConfig.executionRequest);
    setAppType(fetechConfig.executionRequest.batchInfo[0].appType);
    setShowIcePopup(fetechConfig.isTrial?fetechConfig.executionRequest.batchInfo[0].appType !== "Web":fetechConfig.executionRequest.batchInfo[0].appType === "Web"?fetechConfig.executionRequest.batchInfo[0].appType === "Web":fetechConfig.executionRequest.batchInfo[0].appType !== "Web")
    setBrowserTypeExe(fetechConfig.executionRequest.batchInfo[0].appType === "Web" ? fetechConfig.executionRequest.browserType : ['1']);
    setCurrentName(fetechConfig.configurename);
    let testSuiteDetails = fetechConfig.executionRequest.batchInfo.map((element) => {
        return ({
            assignedTime: "",
            releaseid: element.releaseId,
            cycleid: element.cycleId,
            testsuiteid: element.testsuiteId,
            testsuitename: element.testsuiteName,
            projectidts: element.projectId,
            assignedTestScenarioIds: "",
            subTaskId: "",
            versionnumber: element.versionNumber,
            domainName: element.domainName,
            projectName: element.projectName,
            cycleName: element.cycleName
        });                                   
    });
    setCurrentTask({
        testSuiteDetails: testSuiteDetails
    });
    let accessibilityParametersValue = fetechConfig.executionRequest.batchInfo.map((element) => {
        return (element.suiteDetails[0].accessibilityParameters)
    });
    setAccessibilityParameters(accessibilityParametersValue);
    // readTestSuiteFunct(testSuiteDetails, fetechConfig);
    fetchData(fetechConfig.executionRequest.batchInfo[0].projectId);
    setChangeLable(true);
    // setShowIcePopup(false);
   } 
   
   const onHidedia = (name) => {
    dialogFuncMap[`${name}`](false);
    
}

const handleBrowserstackSubmit = async (BrowserstackPayload) => {
  // close the existing dialog
  setDisplayBasic6(false);
  // open the new dialog
  setLoading('Fetching details...') 
  BrowserstackPayload['action'] = (showBrowserstack?"mobileWebDetails":"webDetails")
  let resultData = await saveBrowserstackData({
      BrowserstackPayload
          
  })
  if(resultData && resultData.os_names && resultData.browser){
      setLoading(false);
      setDisplayBasic7(true);

      // const arrayOS = Object.entries(resultData.os).map(([key, value], index) => {
      //     return {
      //       key: key,
      //       text: key,
      //       title: key,
      //       index: index
      //     };
      //   });
      //   setOs(arrayOS);
        setBrowserstackBrowserDetails(resultData);
  }
  else if (resultData && resultData.devices && resultData.stored_files){
    const arrayPlatforms = Object.keys(resultData.devices).map((element, index) => { 
        return {
            key: element,
            text: element,
            title: element,
            index: index
        }
    })
    setPlatforms(arrayPlatforms);
    setMobileDetailsBrowserStack(resultData);
    setLoading(false);
    setDisplayBasic7(true);
  }
else{
  setLoading(false);
  if (resultData == "unavailableLocalServer"){
      setMsg(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
  }else{
      setMsg({"CONTENT":"Error while fetching the data from Browserstack", "VARIANT": VARIANT.ERROR})
  }
}
};

const handleSubmit1 = async (SauceLabPayload) => {
  setLoading("Fetching details..");

  try {
    const data1 = await getDetails_SAUCELABS();

    if (data1.error) {
      setMsg(data1.error);
      return;
    }

    if (data1 !== "empty") {
      data1['query'] = (showSauceLabs ? 'sauceMobileWebDetails' : 'sauceWebDetails');

      let data = await saveSauceLabData({
        "SauceLabPayload": {
          ...data1,
          "query": showSauceLabs ? 'sauceMobileWebDetails' : 'sauceWebDetails'
        }
      });

      if (data && data.os_names && data.browser) {
        const arrayOS = data.os_names.map((element, index) => {
          return {
            key: element,
            text: element,
            title: element,
            index: index
          };
        });
        setOsNames(arrayOS);
        setBrowserDetails(data);
        setLoading(false);
        setDisplayBasic4('displayBasic4');
      } else if (data && data.emulator && data.real_devices && data.stored_files) {
        setMobileDetails(data);
        setDisplayBasic4(true);
        setLoading(false);
      } else {
        // Data is empty or doesn't have expected properties
        console.log(data)
        if (data === "unavailableLocalServer") {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: "ICE Engine is not available, Please run the batch file and connect to the Server.",
            life: 5000
          });
        }
        setLoading(false);
      }
    } else {
      toast.current.show({
        severity:'info',
        summary: 'Info',
        detail: "No data stored in settings",
        life: 5000
      });
      return;
    }
  } catch (error) {
    console.error("Error during handleSubmit1:", error);
    setMsg("An error occurred while fetching details");
  } finally {
    setLoading(false);
  }
};


           


 const confirm_delete = (event, item) => {
    setDeleteItem(item);
    event.preventDefault(); 
    setLogoutClicked(true);
    let text = (
      <p>
        Are you sure you want to delete <strong>{item.configurename}</strong> execution profile?
      </p>
    );
    setProfileTxt(text);
  };

  const copyConfigKey = (title) => {
    if (navigator.clipboard.writeText(title)) {
      setCopyToolTip("Copied!");
      setTimeout(() => {
        setCopyToolTip(" Copy");
      }, 1500);
    }
  };

  const deleteDevOpsConfig = () => {
    setLoading('Please Wait...');
    setTimeout(async () => {
      const deletedConfig = await deleteConfigureKey(deleteItem.configurekey);
      setLogoutClicked(false);
      if (deletedConfig.error) {
        if (deletedConfig.error.CONTENT) {
          toastError(MSG.CUSTOM(deletedConfig.error.CONTENT, VARIANT.ERROR));
        } else {
          toast.current.show({severity:'error', summary: 'Error', detail:  "Error While Deleting Execute Configuration", life: 2000});
        }
      } else {
        tableUpdate(currentPage);
        toast.current.show({severity:'success', summary: 'Success', detail:"Execution Profile deleted successfully.", life: 1000});
      }
      setLoading(false);
    }, 500);
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

  const sauceLabLogin = useMemo(() =>
  <SauceLabLogin
      setLoading={setLoading}
      displayBasic4={displayBasic4}
      onHidedia={onHidedia}
      handleSubmit1={handleSubmit1}
      setSauceLabUser={setSauceLabUser}
      onModalBtnClick={onHidedia}
  />,
  [setLoading, displayBasic4, onHidedia, handleSubmit1,setSauceLabUser]);

  const sauceLabExecute = useMemo(() => <SauceLabsExecute selectProjects={projectInfo?.appType} mobileDetails={mobileDetails} browserDetails={browserDetails}
  displayBasic4={displayBasic4} onHidedia={onHidedia} showSauceLabs={showSauceLabs} currentSelectedItem={currentSelectedItem}
  changeLable={changeLable} poolType={poolType} ExeScreen={ExeScreen} inputErrorBorder={inputErrorBorder} setInputErrorBorder={setInputErrorBorder}
      onModalBtnClick={onHidedia} handleSubmit1={handleSubmit1}
      availableICE={availableICE} smartMode={smartMode} selectedICE={selectedICE} setSelectedICE={setSelectedICE} sauceLab={sauceLab} dataExecution={dataExecution} sauceLabUser={sauceLabUser} browserlist={browserlist} CheckStatusAndExecute={CheckStatusAndExecute}  iceNameIdMap={iceNameIdMap}
/>,
  [mobileDetails, browserDetails, displayBasic5, onHidedia, showSauceLabs, changeLable, poolType, ExeScreen, inputErrorBorder, setInputErrorBorder,
    availableICE, smartMode, selectedICE, setSelectedICE, sauceLab,currentSelectedItem, dataExecution, sauceLabUser, browserlist, CheckStatusAndExecute, iceNameIdMap]);

    const browserstackLogin = useMemo(() =>
    <BrowserstackLogin
        setLoading={setLoading}
        displayBasic6={displayBasic6}
        onHidedia={onHidedia}
        setBrowserstackValues={setBrowserstackValues}
        handleBrowserstackSubmit={handleBrowserstackSubmit}
        setBrowserstackUser={setBrowserstackUser}
        onModalBtnClick={onHidedia}
        browserstackValues={browserstackValues}
    />,
    [setLoading, displayBasic6, onHidedia, handleBrowserstackSubmit,setBrowserstackUser,setBrowserstackValues,browserstackValues]);

    const browserstackExecute = useMemo(() => <BrowserstackExecute  selectProjects={projectInfo?.appType} browserstackBrowserDetails={browserstackBrowserDetails} mobileDetailsBrowserStack={mobileDetailsBrowserStack}
            displayBasic7={displayBasic7} onHidedia={onHidedia} showBrowserstack={showBrowserstack}  onModalBtnClick={onHidedia}
            changeLable={changeLable} poolType={poolType} ExeScreen={ExeScreen} inputErrorBorder={inputErrorBorder} setInputErrorBorder={setInputErrorBorder}
            availableICE={availableICE} smartMode={smartMode} selectedICE={selectedICE} setSelectedICE={setSelectedICE}  dataExecution={dataExecution} browserstackUser={browserstackUser} browserstackValues={browserstackValues} setBrowserstackValues={setBrowserstackValues}browserlist={browserlist} CheckStatusAndExecute={CheckStatusAndExecute} iceNameIdMap={iceNameIdMap}
        />,
            [browserstackBrowserDetails, displayBasic7, onHidedia, mobileDetailsBrowserStack,  showBrowserstack, changeLable, poolType, ExeScreen, inputErrorBorder, setInputErrorBorder,
            availableICE, smartMode, selectedICE, setSelectedICE,  dataExecution, browserstackUser,  browserlist,setBrowserstackValues,browserstackValues, CheckStatusAndExecute, iceNameIdMap]);



  const ExecuteTestSuite = async (executionData, btnType) => {
    if (executionData === undefined) executionData = dataExecution;
    if(executionData["executionEnv"] != 'saucelabs' && executionData["executionEnv"] != 'browserstack') {
      executionData["executionEnv"]=execEnv;
      executionData["browserType"]=browserTypeExe;
  }
    setAllocateICE(false);
    const modul_Info = parseLogicExecute(eachData, currentTask, projectInfo?.appType, moduleInfo, accessibilityParameters, "");
    if (modul_Info === false) return;
    setLoading("Sending Execution Request");
    executionData["source"] = "task";
    executionData["exectionMode"] = execAction;
    // executionData["executionEnv"] = execEnv;
    // executionData["browserType"] = browserTypeExe;
    executionData["integration"] = integration;
    executionData["configurekey"] = currentKey;
    executionData["configurename"] = currentName;
    executionData["executingOn"] = executingOn;
    executionData["executionListId"] = uuid();
    executionData["profileName"] = currentName;
    executionData["recieverEmailAddress"] = emailNotificationReciever;
    executionData["batchInfo"] =
      currentSelectedItem &&
        currentSelectedItem.executionRequest &&
        currentSelectedItem.executionRequest.batchInfo
        ? currentSelectedItem.executionRequest.batchInfo.map((el) => ({ ...el, testsuiteId: readTestSuite?.testSuiteDetails[el?.testsuiteId]?.testsuiteid }))
        : [];
    executionData["scenarioFlag"] =
      currentTask.scenarioFlag == "True" ? true : false;
    ResetSession.start();
    try {
      setLoading(false);
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
      setLoading(false);
      ResetSession.end();
      displayError(MSG.EXECUTE.ERR_EXECUTE);
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

  const handleTestSuite = async(getItem) => {
    if(getItem.executionRequest.integration){
      setIntegration(getItem.executionRequest.integration);
    }
    const readTestSuiteParams = getItem?.executionRequest?.batchInfo && getItem?.executionRequest?.batchInfo.map((el) => ({
      assignedTime: "",
      releaseid: el?.releaseId,
      cycleid: el?.cycleId,
      testsuiteid: el?.testsuiteId,
      testsuitename: el?.testsuiteName,
      projectidts: el?.projectId,
      assignedTestScenarioIds: "",
      subTaskId: "",
      versionnumber: el?.versionNumber,
      domainName: el?.domainName,
      projectName: el?.projectName,
      cycleName: el?.cycleName,
    }));
    const getReadTestSuite = await readTestSuite_ICEuser(readTestSuiteParams);
    setReadTestSuite(getReadTestSuite);
  };

  const cloudTestOptions = [
    { name: 'SauceLabs', code: 1 },
    { name: 'BrowserStack', code: 2 },
  ];
  
  const selectedCountryTemplate = (option, props) => {    
    if (option) {
        return (
            <div className="flex align-items-center">
                <img alt={option.name} src={option.name === "SauceLabs" ? "static/imgs/Saucelabs-1.png" : "   static/imgs/browserstack_icon.svg" }  style={{ width: '1rem' }} />
                <div>{option.name}</div>
            </div>
        );
    }
  
    return <span>{props.placeholder}</span>;
      };
  
      const countryOptionTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <img alt={option.name} src={option.name === "SauceLabs" ? "static/imgs/Saucelabs-1.png" :  "static/imgs/browserstack_icon.svg" }  style={{ width: '18px' }} />
                <div>{option.name}</div>
            </div>
        );
        };

  const cicdLicense = {
    value: String(userInfo?.licensedetails?.CICD) === "false",
    msg: "You do not have access for CICD."
  }

  const tableUpdate = async (getPageNo = 1, getSearch = "") => {
    const getState = [];
    setLoader(true);
    const configurationList = await fetchConfigureList({
      projectid: configProjectId,
      page: getPageNo,
      searchKey: getSearch
    });
    setLoader(false);
    setFetechConfig(configurationList?.data);
    setConfigPages(configurationList?.pagination?.totalcount);
    configurationList?.data.forEach((item, idx) => {
      getState.push({
        sno: (
          <span className="sno_header" style={{marginLeft:"2rem",width:"1%"}}>
            {idx + 1 + ((getPageNo -1) * 10)}
          </span>
        ),
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
                if ("isEmailNotificationEnabled" in item.executionRequest) {
                  setEmailNotificationEnabled(item.executionRequest.isEmailNotificationEnabled);
                  if (item.executionRequest.isEmailNotificationEnabled === true) {
                      setEmailNotificationSender(item.executionRequest.emailNotificationSender);
                      setEmailNotificationReciever(item.executionRequest.emailNotificationReciever);
                      setIsNotifyOnExecutionCompletion(item.executionRequest.isNotifyOnExecutionCompletion)
                      setBatchInfo(item.executionRequest.batchInfo);
                      setProfileName(item.executionRequest.configurename);
                  }
                }
                else {
                  setEmailNotificationEnabled(false);
                  setEmailNotificationSender(null);
                  setEmailNotificationReciever(null);
                  setIsNotifyOnExecutionCompletion(null);
                  setBatchInfo([]);
                  setProfileName(null)
                }
                setCurrentName(item.configurename);
                setCurrentSelectedItem(item);
                setBrowserTypeExe(item.executionRequest.batchInfo[0].appType === "Web" ? item.executionRequest.browserType : ['1']);
                setConfigItem(idx);
                handleTestSuite(item);
              }}
              size="small"
            >  
              Execute Now
            </Button>
            <Button
              className="schedule"
              onClick={() => {
                setSelectedSchedule(item);
                setConfigItem(idx);
                setVisible_schedule(true);
                setCurrentKey(item.configurekey);
                if ("isEmailNotificationEnabled" in item.executionRequest) {
                  setEmailNotificationEnabled(item.executionRequest.isEmailNotificationEnabled);
                  if (item.executionRequest.isEmailNotificationEnabled === true) {
                      setEmailNotificationSender(item.executionRequest.emailNotificationSender);
                      setEmailNotificationReciever(item.executionRequest.emailNotificationReciever);
                      setIsNotifyOnExecutionCompletion(item.executionRequest.isNotifyOnExecutionCompletion)
                      setBatchInfo(item.executionRequest.batchInfo);
                      setProfileName(item.executionRequest.configurename);
                  }
                }
                else {
                  setEmailNotificationEnabled(false);
                  setEmailNotificationSender(null);
                  setEmailNotificationReciever(null);
                  setIsNotifyOnExecutionCompletion(null);
                  setBatchInfo([]);
                  setProfileName(null)
                }
                setCurrentName(item.configurename);
                handleTestSuite(item);
              }}
              size="small"
            >
              Schedule
            </Button>
            <span id={cicdLicense.value || projectInfo?.appType !== "Web" ? 'CICD_Disable_tooltip' : 'CICD_tooltip'}>
            <Button
              className="CICD"
              size="small"
              onClick={() => {
                setVisible_CICD(true);
                setCurrentKey(item.configurekey);
                setConfigItem(idx);
                setRunningStatusTimer("")
              }}
                disabled={projectInfo.appType !== "Web" || cicdLicense.value}
            >  
              CI/CD
            </Button>
            </span>
            <div className="cloud-test-provider" >
              <Dropdown
                placeholder="Cloud Test" onChange={(e) => { handleOptionChange(e.target.value.name, 'web', item, idx, setConfigItem(idx)); setCurrentSelectedItem(item); handleTestSuite(item); setSaucelabExecutionEnv('saucelabs'); setBrowserstackExecutionEnv('browserstack') }} options={cloudTestOptions} optionLabel="name" itemTemplate={countryOptionTemplate} valueTemplate={selectedCountryTemplate} disabled={projectInfo.appType === "Desktop" || projectInfo.appType === "Mainframe" || projectInfo.appType === "OEBS" || projectInfo.appType === "SAP"} />
            </div> 
          
          </div>
        ),
        actions: (
          <div>
            <ConfirmPopup
              target={buttonEl.current}
              visible={visible}
              onHide={() => setVisible(false)}
            />
            <img src="static/imgs/ic-edit.png"
              style={{ height: "20px", width: "20px" }}
              className=" pencil_button p-button-edit"  onClick={() => configModal("CancelUpdate", item)}
              />
              <Tooltip target=".trash_button" position="bottom" content=" Delete the Execution Configuration."  className="small-tooltip" style={{fontFamily:"Open Sans"}}/>
               <img
              
              src="static/imgs/ic-delete-bin.png"
              style={{ height: "20px", width: "20px", marginLeft:"0.5rem"}}
              className="trash_button p-button-edit"onClick={(event) => confirm_delete(event, item)} />
              <Tooltip target=".pencil_button" position="left" content="Edit the Execution Configuration."/>
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

  useEffect(() => {
    tableUpdate(1, debouncedSearchValue);
    setFirstPage(1);
  }, [debouncedSearchValue]);

  const profieTooltip = (rowdata) => {
    return   <span
        title={rowdata.profileName}
      >
        {rowdata.profileName}
      </span>;
};
const showToast = (severity, detail) => {
  toast.current.show({
    severity: severity,
    summary: severity === 'success' ? 'Success' : 'Error',
    detail: detail,
  });
};

  const configModal = (getType, getData = null) => {
    const lsGetConfigData = JSON.parse(localStorage.getItem("configData"))
    if (getType === "CancelUpdate") {
      const getAvogrid = [
        ...lsGetConfigData?.avoAgentAndGrid?.avoagents,
        ...lsGetConfigData?.avoAgentAndGrid?.avogrids,
      ];
      getAvogrid.forEach((el, index, arr) => {
        if (Object.keys(el).includes("Hostname")) {
          getAvogrid[index] = { ...el, name: el.Hostname };
        }
      });
      setUpdateKey(getData.executionRequest.configurekey);
      setAvodropdown({
        ...avodropdown,
        avogrid: getData?.executionRequest?.avoagents[0] ? getAvogrid.filter(
          (el) => el.name === getData?.executionRequest?.avoagents[0]
        )[0] : lsGetConfigData?.avoAgentAndGrid?.avogrids.filter((item) => item?._id === getData?.executionRequest?.avogridId)[0],
        browser: (getData?.executionRequest?.browserType && Array.isArray(getData?.executionRequest?.browserType)) ? browsers.filter((el) =>
          getData?.executionRequest?.browserType.includes(el.key)
        ) : [],
         });
      setMode(
        getData?.executionRequest?.isHeadless ? selections[1] : selections[0]
      );
      setIntegration(getData?.executionRequest?.integration ? getData.executionRequest.integration : {
        alm: {url:"",username:"",password:""}, 
        qtest: {url:"",username:"",password:"",qteststeps:""}, 
        zephyr: {url:"",username:"",password:""},
        azure: { url: "", username: "", password: "" },
      });
      setConfigTxt(getData.configurename);
      setModules(getData.executionRequest.selectedModuleType);
      setTypeOfExecution(getData.executionRequest.selectedModuleType)
      setDotNotExe(getData);
      setDefaultValues({ ...defaultValues, EmailSenderAddress: getData.executionRequest.emailNotificationSender, EmailRecieverAddress: getData.executionRequest.emailNotificationReciever});
      setIsNotifyOnExecutionCompletion(getData.executionRequest.isNotifyOnExecutionCompletion);
      setIsEmailNotificationEnabled(getData.executionRequest.isEmailNotificationEnabled);
      setCheckedExecution(getData.executionRequest.execType)
    } else {
      setUpdateKey("");
      setAvodropdown({});
      setMode(selections[0]);
      setIntegration({
        alm: {url:"",username:"",password:""}, 
        qtest: {url:"",username:"",password:"",qteststeps:""}, 
        zephyr: {url:"",username:"",password:""},
        azure: { url: "", username: "", password: "" },
      });
      setConfigTxt("");
      setModules("normalExecution");
      setSelectedNodeKeys({});
      setDefaultValues({});
      setIsNotifyOnExecutionCompletion(true);
      setIsEmailNotificationEnabled(false);
    }
    setVisible_setup(true);
    setSetupBtn(getType);
  };

  const onModalBtnClick = (getBtnType) => {
    setConfigbtnsave(getBtnType)
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
      const parent = getSelected.filter((el) => !(el.includes('-')));
      const child = getSelected
        .filter((el) => el.includes('-'))
        .map((e) => ({ [e.split("-")[0]]: e.split("-")[1] }));
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

      const getProjectData = () => {
        let projectValue = [];
        if(Array.isArray(getConfigData?.projects)){
          projectValue = getConfigData?.projects.filter(
            (el) => el._id === configProjectId
          )
        };
        return projectValue;
      };
      
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
            key:item.key,
            scenarioTaskType: "disable",
            testsuiteName: item.suitename,
            testsuiteId: item.suiteid,
            batchname: "",
            versionNumber: 0,
            appType: projectInfo?.appType,
            domainName: "Banking",
            projectName: getProjectData()[0]?.name,
            projectId: configProjectId,
            releaseId: "R1",
            cycleName: getProjectData()[0]?.releases[0]?.cycles[0]?.name,
            cycleId: getProjectData()[0]?.releases[0]?.cycles[0]?._id,
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
      batchInfoData.sort((item1,item2)=>item1.key-item2.key)

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
        avogridId: avodropdown?.avogrid?.agents ? avodropdown?.avogrid?._id : "",
        avoagents: (avodropdown?.avogrid?.name && avodropdown?.avogrid?.name !="null" &&  avodropdown?.avogrid?.name !="Any Agent" && !avodropdown?.avogrid?.agents ) ? [avodropdown?.avogrid?.name] : [],
        integration,
        batchInfo: batchInfoData,
        donotexe: {
          current: getCurrent,
        },
        scenarioFlag: false,
        isExecuteNow: false,
        emailNotificationSender: "avoassure-alerts@avoautomation.com",
        emailNotificationReciever: emailNotificationReciever,
        isNotifyOnExecutionCompletion: isNotifyOnExecutionCompletion,
        isEmailNotificationEnabled: isEmailNotificationEnabled,
        execType: checkedExecution
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
              Object.values(paramPaths[el?.key] && paramPaths[el?.key].map((el) => el?.value)),
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
        dispatch(storeConfigureKey(executionData))
      );
    } else if (getBtnType === "Cancel") {
      setConfigTxt("");
      setVisible_setup(false);
      setDotNotExe({});
      setSelectedNodeKeys({});
    } else setVisible_setup(false);
  };

  useEffect(() => {
    if(getConfigData?.setupExists === "success"){
      const pagecount=Math.floor(configPages/10);
      if(configbtnsave=="Save"){
        const first = (pagecount)*10;
        onPageChange({first,rows:10,page:pagecount})
      }
      else{
      tableUpdate(currentPage);
      }
      setVisible_setup(false);
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail:setupBtn === "CancelSave" ? "Configuration created successfully." : "Configuration updated successfully.",
        life: 5000
      });
    } else if(getConfigData?.setupExists?.error?.CONTENT){
      showToast('error', getConfigData?.setupExists?.error?.CONTENT);
    };
    dispatch(clearErrorMSg());
  }, [getConfigData?.setupExists]);

  const Breadcrumbs = () => {
    function changeProject(e){
      const defaultProjectData = {
        ...projectInfo, // Parse existing data from localStorage
        projectId: e.target.value,
        projectName: projectList.find((project)=>project.id === e.target.value).name,
        appType: project?.appTypeName[project?.projectId.indexOf(e.target.value)],
        projectLevelRole: projectList.find((project)=>project.id === e.target.value)?.projectLevelRole
      };
      localStorage.setItem("DefaultProject", JSON.stringify(defaultProjectData));
      dispatch(loadUserInfoActions.setDefaultProject({ ...projectInfo, projectName: projectList.find((project) => project.id === e.target.value).name, projectId: e.target.value, appType: project?.appTypeName[project?.projectId.indexOf(e.target.value)], projectLevelRole: projectList.find((project) => project.id === e.target.value)?.projectLevelRole }));
    }
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
              placeholder="Search"
              title=" Search for project"
              className="Search_Project"
              onChange={(e) => {
                changeProject(e);
              }}
              style={{ width: "10rem", height: "25px" }}
              value={configProjectId}
            >
              {projectList
                .filter(
                  (value, index, self) =>
                    index ===
                    self.findIndex(
                      (item) => item.name === value.name
                    )
                )
                .map((project, index) => (
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
      if ((currentSelectedItem?.executionRequest?.browserType && Array.isArray(currentSelectedItem?.executionRequest?.browserType) && el.key == currentSelectedItem?.executionRequest?.browserType[0])) {
        setBrowserTxt(el.name);
      }
    });
  }, [currentSelectedItem?.executionRequest?.browserType]);

  const onExecuteBtnClick = async (btnType) => {
    if (btnType === "Execute") {
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
        const temp = await execAutomation(currentKey, "AvoAgent/AvoGrid");
        if (temp.status !== "pass") {
          if (temp.error && temp.error.CONTENT) {
            toastError(MSG.CUSTOM(temp.error.CONTENT, VARIANT.ERROR));
          } else {
            toast.current.show({
                severity: "error",
                summary: "error",
                detail:(
                      "Error While Adding Configuration to the Queue"
                      
                    ),
                life: 5000,
              });
          }
        } else {
          if (emailNotificationEnabled === true && isNotifyOnExecutionCompletion !== true) {
            // send email on click of execution
            let result = await sendMailOnExecutionStart(emailNotificationSender, emailNotificationReciever, batchInfo, profileName);

            if(result !== "pass") {
                if(result.error && result.error.CONTENT) {
                    toastError(MSG.CUSTOM(result.error.CONTENT,VARIANT.ERROR));
                } else {
                    toast.current.show({
                      severity: "error",
                      summary: "error",
                      detail:(
                            "Error While Sending an Email."
                          ),
                      life: 5000,
                    });
                }
            }
            else {
                toast.current.show({
                  severity: "success",
                  summary: "Success",
                  detail:("Execution Added to the Queue and Email sent successfully."),
                  life: 5000,
                });
            }
          }
          else {
              toast.current.show({
                severity: "success",
                summary: "Success",
                detail:("Execution Added to the Queue."),
                life: 5000,
              });
          }
        }

      }

      setVisible_execute(false);
    }
    if (btnType === 'Cancel') {
      setVisible_execute(false);
    }
  
  };

  useEffect(() => {
    if(scheduleOption?.monthday < 0 || scheduleOption?.monthday > 12){
      scheduleinfo?.current?.show({ severity: 'error', summary: 'Error', detail: 'Invalid input (should be between 1-12)' });
    }
    if(scheduleOption?.everymonth < 0 || scheduleOption?.everymonth > 12){
      scheduleinfo?.current?.show({ severity: 'error', summary: 'Error', detail: 'Invalid input (should be between 1-12)' });
    }
    if(scheduleOption?.everyday < 0 || scheduleOption?.everyday > 30){
      scheduleinfo?.current?.show({ severity: 'error', summary: 'Error', detail: 'Invalid input (should be between 1-30)' });
    }
    if(scheduleOption?.monthweek < 0 || scheduleOption?.monthweek > 30){
      scheduleinfo?.current?.show({ severity: 'error', summary: 'Error', detail: 'Invalid input (should be between 1-30)' });
    }
  }, [scheduleOption]);

  const onScheduleBtnClick = (btnType) => {
    if (btnType === "Cancel") {
      setVisible_schedule(false);
      setStartDate(null);
      setScheduling(false);
      setEndDate(null);
      setRecurEvery(null);
      setStartTime(null);
      setScheduleOption({});
      setSelectedDaily(null);
      setselectedWeek([]);
      setSelectedMonthly(null);
      setDropdownWeek(null);
      setSelectedPattren({});
      dispatch(setScheduleStatus());
    }
    if (btnType === "Schedule") {
      if((new Date(startTime) < new Date(Date.now() + (5 * 60 * 1000))) && (new Date(startDate).getTime() < new Date(startTime).getTime())) {
        timeinfo?.current?.show({ severity: 'info', summary: 'Info', detail: 'Schedule time must be 5 mins more than current time.' });
      } else {
        setScheduling(true);
      }
    }
  };

  const onScheduleBtnClickClient = (btnType) => {
    const getPattren = () => {
      let getKey = selectedPattren?.key ? selectedPattren?.key : "OT";
      let pattrenObj = {
        OT: {
          recurringValue: "One Time",
          recurringString: "One Time",
          recurringStringOnHover: "One Time",
        },
        DY: {
          recurringValue: scheduleOption?.everyday
            ? `0 0 */${scheduleOption.everyday} * *`
            : "0 0 * * 1-5",
          recurringString: "Every Day",
          recurringStringOnHover: scheduleOption?.everyday
            ? `Occurs every ${scheduleOption.everyday} days`
            : "Occurs every weekday",
        },
        WY: {
          recurringValue: `0 0 * * ${selectedWeek
            .map((el) => el.key === "ALL" ? "0,1,2,3,4,5,6" : el.key )
            .toString()}`,
          recurringString: "Every Week",
          recurringStringOnHover: `Occurs on every ${selectedWeek.map(
            (el) => el.name === "All" ? "day" : el.name
          )}`,
        },
        MY: {
          recurringValue:
            selectedMonthly?.key === "daymonth"
              ? `0 0 ${scheduleOption?.monthweek} */${scheduleOption?.monthday} *`
              : `0 0 * */${scheduleOption?.everymonth} ${dropdownDay?.key}`,
          recurringString: "Every Month",
          recurringStringOnHover:
            selectedMonthly?.key === "daymonth"
              ? `Occurs on ${scheduleOption?.monthday}th day of every ${scheduleOption?.monthweek} month`
              : `Occurs on ${dropdownWeek?.name.toLowerCase()} ${dropdownDay?.name.toLowerCase()} of every ${scheduleOption?.everymonth} month`,
        },
      };
      return pattrenObj[getKey];
    };

    if (btnType === "ScheduleIce") {
      !!Object.keys(selectedPattren).length ?
      dispatch(
        testSuitesSchedulerRecurring_ICE({
          param: "testSuitesScheduler_ICE",
          executionData: {
            source: "schedule",
            exectionMode: "serial",
            executionEnv: "default",
            browserType: selectedSchedule?.executionRequest?.browserType ? selectedSchedule?.executionRequest?.browserType : ['1'],
            integration: selectedSchedule?.executionRequest?.integration,
            batchInfo: selectedSchedule?.executionRequest?.batchInfo.map((el) => ({
              ...el,
              poolid: "",
              type: "normal",
              ...(showIcePopup && { targetUser: selectedICE, iceList: [] }),
              date: startDate ? startDate.toLocaleDateString('es-CL') : "",
              time: `${startTime.getHours()}:${startTime.getMinutes()}`,
              timestamp: startTime.setSeconds(0, 0).toString(),
              recurringValue: getPattren().recurringValue,
              recurringString: getPattren().recurringString,
              recurringStringOnHover: getPattren().recurringStringOnHover,
              endAfter: startDate ? "" : endDate?.name,
              clientTime: `${new Date().toLocaleDateString("fr-CA").replace(/-/g, "/")} ${new Date().getHours()}:${new Date().getMinutes()}`,
              clientTimeZone: "+0530",
              scheduleThrough: showIcePopup ? "client" : fetechConfig[configItem]?.executionRequest?.avoagents[0] ?? "Any Agent",
              testsuiteId: readTestSuite?.testSuiteDetails[el?.testsuiteId]?.testsuiteid
            })),
            scenarioFlag: false,
            type: "normal",
            configureKey: selectedSchedule?.configurekey,
            configureName: selectedSchedule?.configurename,
            executionListId: uuid(),
            profileName: selectedSchedule?.configurename,
            recieverEmailAddress: selectedSchedule?.executionRequest?.emailNotificationReciever ? selectedSchedule?.executionRequest?.emailNotificationReciever : null,
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
        setScheduling(false);
        setStartDate(null);
        setEndDate(null);
        setRecurEvery(null);
        setStartTime(null);
        setScheduleOption({});
        setSelectedDaily(null);
        setselectedWeek([]);
        setSelectedMonthly(null);
        setDropdownWeek(null);
        setSelectedPattren({});
      }) : dispatch(
        testSuitesScheduler_ICE({
          param: "testSuitesScheduler_ICE",
          executionData: {
            source: "schedule",
            exectionMode: "serial",
            executionEnv: "default",
            browserType: selectedSchedule?.executionRequest?.browserType ? selectedSchedule?.executionRequest?.browserType : ['1'],
            integration: selectedSchedule?.executionRequest?.integration,
            batchInfo: selectedSchedule?.executionRequest?.batchInfo.map((el) => ({
              ...el,
              poolid: "",
              type: "normal",
              ...(showIcePopup && { targetUser: selectedICE, iceList: [] }),
              date: startDate ? startDate.toLocaleDateString('es-CL') : "",
              time: `${startTime.getHours()}:${startTime.getMinutes()}`,
              timestamp: startTime.setSeconds(0, 0).toString(),
              recurringValue: getPattren().recurringValue,  
              recurringString: getPattren().recurringString,
              recurringStringOnHover: getPattren().recurringStringOnHover,
              endAfter: startDate ? "" : endDate?.name,
              clientTime: `${new Date().toLocaleDateString("fr-CA").replace(/-/g, "/")} ${new Date().getHours()}:${new Date().getMinutes()}`,
              clientTimeZone: "+0530",
              scheduleThrough: showIcePopup ? "client" : (
                fetechConfig[configItem]?.executionRequest?.avoagents[0]  
                    ? (Object.values(fetechConfig[configItem].executionRequest.avoagents)[0])
                    : getConfigData?.avoAgentAndGrid?.avogrids?.length > 0
                      ? (getConfigData?.avoAgentAndGrid?.avogrids?.filter((item) => item?._id === fetechConfig[configItem]?.executionRequest?.avogridId)[0]?.name)
                      : "Any Agent" 
                         
              ),
              // scheduleThrough: showIcePopup ? "client" : fetechConfig[configItem]?.executionRequest?.avoagents[0] ?? "Any Agent",
              testsuiteId: readTestSuite?.testSuiteDetails[el?.testsuiteId]?.testsuiteid
            })),
            scenarioFlag: false,
            type: "normal",
            configureKey: selectedSchedule?.configurekey,
            configureName: selectedSchedule?.configurename,
            executionListId: uuid(),
            profileName: selectedSchedule?.configurename,
            recieverEmailAddress: selectedSchedule?.executionRequest?.emailNotificationReciever ? selectedSchedule?.executionRequest?.emailNotificationReciever : null,
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
        setScheduling(false);
        setStartDate(null);
        setEndDate(null);
        setRecurEvery(null);
        setStartTime(null);
        setScheduleOption({});
        setSelectedDaily(null);
        setselectedWeek([]);
        setSelectedMonthly(null);
        setDropdownWeek(null);
        setSelectedPattren({});
      });
    }
    if (btnType === "Cancel") {
      setScheduling(false);
      setStartDate(null);
      setEndDate(null);
      setRecurEvery(null);
      setStartTime(null);
      setScheduleOption({});
      setSelectedDaily(null);
      setselectedWeek([]);
      setSelectedMonthly(null);
      setDropdownWeek(null);
      setSelectedPattren({});
    }
  };

  const onScheduleChange = (e) => {
    setScheduleOption({
      ...scheduleOption,
      [e.target.name]: e.target.value
    })
  };

  const onWeekChange = (e) => {
    let selectedWeeks = e?.value?.name === "All" ? [] : [...selectedWeek];

    setCheckDisable(e?.value?.name === "All");
    if (e.checked)
      selectedWeeks.push(e.value);
    else
      selectedWeeks = selectedWeeks.filter(category => category.key !== e.value.key);

    setselectedWeek(selectedWeeks);
  };

  const checkboxHeaderTemplate = () => {
    return (
      <>
        {/* <Checkbox classname=" checkbox_header" /> */}
        <span className="profile_label"> Configuration Name</span>
      </>
    );
  };
  useEffect(() => {
        (async () => {
            const arg = {"action":"provider","channel":"email","args":"smtp"};
            const data = await getNotificationChannels(arg);
            if (data) {
                setDefaultValues({ ...defaultValues, EmailSenderAddress: data?.sender?.email });
            }
            else {
                setDefaultValues({ ...defaultValues, EmailSenderAddress: 'avoassure-alerts@avoautomation.com' });
            }
        })();
    }, []);

  const handleSubmit = (defaultValues) => {
    if ( "EmailRecieverAddress" in defaultValues) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (defaultValues.EmailRecieverAddress) {   
            let allRecieverEmailAddress = defaultValues.EmailRecieverAddress.split(",");
            const isAllValidEmail = allRecieverEmailAddress.every((recieverEmailAddress) => {
                return emailRegex.test(recieverEmailAddress) === true
            })
            if (isAllValidEmail) {
              setEmailNotificationReciever(defaultValues.EmailRecieverAddress, defaultValues.EmailSenderAddress, isNotifyOnExecutionCompletion);
              setDisplayModal(false);
            }
            
            else {
                toastError(MSG.GLOBAL.ERR_RECIEVER_EMAIL);
            }
        }
        else {
            toastError(MSG.GLOBAL.ERR_SENDER_EMAIL);
        }
    }
    else {
        toastError(MSG.GLOBAL.ERR_EMAILS_EMPTY);
    }   
  }

  const onPageChange = (e) => {
      setFirstPage(e.first);
      setRowsPage(e.rows);
      setCurrentPage(e.page+1);
      tableUpdate(e.page + 1, debouncedSearchValue);
  };
 
  const renderTable = () => {
    if (!!configList.length) {
      return (
        <>
         <Tooltip target=".execute_now " position="bottom" content="  Execute Configuration using Avo Assure Agent/Grid/Client."/>
         <Tooltip target=".schedule " position="bottom" content="  Schedule your execution on a date and time you wish. You can set recurrence pattern as well."/>
         <Tooltip target="#CICD_tooltip " position="bottom" content=" Get a URL and payload which can be integrated with tools like jenkins for CI/CD execution."/>
         <Tooltip target=" .cloud-test-provider " position="bottom" content="Cloud platform execution"/>
         <Tooltip target="#CICD_Disable_tooltip" position="bottom" content={cicdLicense.msg}/> 
         {loading ? <ScreenOverlay content={loading} /> : null}
          <DataTable
            showGridlines
            resizableColumns
            className="  datatable_list  "
            value={configList}
            loading={loader}
            virtualScrollerOptions={{ itemSize: 20 }}
            // globalFilter={searchProfile}
            style={{
              width: "100%",
              height: "calc(100vh - 250px)",
              marginRight: "-2rem",
            }}
          >
            <Column
              field="sno"
              className="sno_label"
              // style={{ width: "1rem" ,height:"2.5rem",fontFamily:"Open Sans"}}
              header={<span className="SNo-header">S.No.</span>}
            />
            <Column
              style={{
                fontWeight: "normal",
                fontFamily: "open Sans",
                marginLeft: "11rem",
                width: "50%",
                height:"2.5rem"
              }}
              field="profileName"
              header={checkboxHeaderTemplate}
              body={profieTooltip}
    />
            <Column
              style={{
                fontWeight: "bold",
                fontFamily: "open Sans",
                marginRight: "23rem",
                width: "40%",
                height:"2.5rem"
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
                height:"2.5rem"
              }}
              field="actions"
              header={<span className="actions-header">Actions</span>}
            />
          </DataTable>
          <Paginator first={firstPage} rows={rowsPage} totalRecords={configPages} rowsPerPageOptions={[10, 20, 30]} onPageChange={onPageChange} />
          <AvoModal
          visible={visible_saucelab}
          onhide={visible_saucelab}
          content={
          <>
          <div className="SauceLab" >
          <Dropdown
          filter
          />
          </div>
          <Dropdown
          filter
          />
          <Dropdown
          filter
          />
          <Button
              className="execute_now"
            
              size="small"
              
            >
                  
              Execute Now
            </Button>

          
          </>
          }
          >

          </AvoModal>
          <AvoModal
            visible={visible_execute}
            setVisible={setVisible_execute}
            onhide={visible_execute}
            onModalBtnClick={onExecuteBtnClick}
            // onHide={() => setVisible_execute(false)}
            content={
              <>
                {<ExecutionCard cardData={fetechConfig[configItem]} configData={getConfigData} />}
                <div className="radio_grid">
                <div className="radioButtonContainer">
                  <RadioButton
                  disabled={projectInfo?.appType !== "Web"}
                  checked={ radioButton_grid === "Execute with Avo Assure Agent/ Grid"}
                    value="Execute with Avo Assure Agent/ Grid"
                    onChange={(e) => {
                      setShowIcePopup(false);
                      setRadioButton_grid(e.target.value);
                      setExecutingOn("Agent");
                    }}
                    
                  />
                  <label className="executeRadio_label_grid ">
                    Execute with Avo Assure Agent/ Grid
                  </label>
                  <img className='info__btn'src="static/imgs/info.png" ></img>
<Tooltip target=".info__btn" position="bottom" content=' Avo Agent is a collection of Avo Assure Clients.The grid consists of several agents. 
Learn More '/>
</div>
                  <div className="radioButtonContainer1">
                    <RadioButton
                      value="Execute with Avo Assure Client"
                      onChange={(e) => {
                        setShowIcePopup(true);
                        setRadioButton_grid(e.target.value);
                        setExecutingOn("ICE");
                      }}
                      checked={
                        radioButton_grid === "Execute with Avo Assure Client" || projectInfo?.appType!=="Web"
                      }
                    />
                  </div>
                  <label className=" executeRadio_label_clint ">
                    Execute with Avo Assure Client
                  </label>
                  <img className='info__btn_grid'src="static/imgs/info.png" ></img>
                  <Tooltip target=".info__btn_grid" position="bottom" content="Avo Assure Client is responsible for element identification, debugging, and execution of automated scripts." style={{fontFamily:"Open Sans"}}></Tooltip> 

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
                      <div className="ice">
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
                  </div>
                )}
              </>
            }
            headerTxt={`Execute Now : ${fetechConfig[configItem]?.configurename}`}
            footerType="Execute"
            modalSytle={{ width: "50vw", background: "#FFFFFF", height: "85%" }}
            isDisabled={(radioButton_grid === "Execute with Avo Assure Client" && !selectedICE)}
          />
          <Toast ref={timeinfo} />
          <Toast ref={scheduleinfo} />
          <Toast ref={errorinfo} />
          <AvoModal
            visible={visible_schedule}
            setVisible={setVisible_schedule}
            onModalBtnClick={onScheduleBtnClick}
            content={
              <ScheduleScreen
                cardData={fetechConfig[configItem]}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                recurEvery={recurEvery}
                setRecurEvery={setRecurEvery}
                startTime={startTime}
                setStartTime={setStartTime}
                selectedPattren={selectedPattren}
                setSelectedPattren={setSelectedPattren}
                isDisabled={
                  !startDate &&
                  (!selectedPattren?.key || !endDate || !startTime)
                }
                onSchedule={onScheduleBtnClick}
                selectedDaily={selectedDaily}
                selectedWeek={selectedWeek}
                selectedMonthly={selectedMonthly}
                dropdownWeek={dropdownWeek}
                dropdownDay={dropdownDay}
                setSelectedDaily={setSelectedDaily}
                setSelectedMonthly={setSelectedMonthly}
                setDropdownWeek={setDropdownWeek}
                setDropdownDay={setDropdownDay}
                scheduleOption={scheduleOption}
                onScheduleChange={onScheduleChange}
                onWeekChange={onWeekChange}
                checkDisable={checkDisable}
              />
            }
            headerTxt={`Schedule: ${fetechConfig[configItem]?.configurename}`}
            modalSytle={{
              width: "75vw",
              height: "95vh",
              background: "#FFFFFF",
            }}
          />
          <AvoModal
            visible={scheduling}
            setVisible={setScheduling}
            onModalBtnClick={onScheduleBtnClickClient}
            content={
              <>
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
                  <label className="executeRadio_label_grid ml-2 mr-2">
                    Execute with Avo Assure Agent/ Grid
                  </label>
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
                  <label className="executeRadio_label_clint_schedule ml-2 mr-2">
                    Execute with Avo Assure Client
                  </label>
                </div>
                {showIcePopup && (
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
                )}
              </>
            }
            headerTxt="Allocate Avo Assure Client to Schedule"
            footerType="ScheduleIce"
            modalSytle={{
              width: "45vw",
              height: "55vh",
              background: "#FFFFFF",
              minWidth: "38rem",
            }}
            customClass="schedule_modal"
            isDisabled={(radioButton_grid === "Execute with Avo Assure Client" && !selectedICE)}
          />
          <AvoModal
            visible={visible_CICD}
            setVisible={setVisible_CICD}
            content={
              <>
                <ExecutionCard cardData={fetechConfig[configItem]} configData={getConfigData} />

                <div className="buildtype_container">
                  <div className="flex flex-wrap gap-3">
                    <label className="buildtype_label">Execution Trigger Type:</label>
                    <div className="flex align-items-center">
                      <RadioButton data-test="HTTPrequest" className="ss__build_type_rad" type="radio" name="HTTP" value="HTTP" onChange={(e) => setSelectBuildType(e.value)} checked={selectBuildType === "HTTP"} />
                      <label htmlFor="ingredient1" className="ml-2 ss__build_type_label">HTTP request</label>
                    </div>
                    <div className="flex align-items-center">
                      <RadioButton data-test="Code" className="ss__build_type_rad" type="radio" name="CODE" value="CODE" onChange={(e) => setSelectBuildType(e.value)} checked={selectBuildType === 'CODE'} />
                      <label htmlFor="ingredient2" className="ml-2 ss__build_type_label">Code snippet</label>
                    </div>
                  </div>
                </div>

                <div className="input_CICD ">
                 
                  { selectBuildType == "HTTP" ?
                  <div>
                    <div class="container_url">
                      <label for="inputField" class="devopsUrl_label">
                        DevOps Integration URL
                      </label>
                      <div className="url">
                        <pre className="grid_download_dialog__content cicdpre">
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
                    
                      
                          // title={copyToolTip}
                        />
                    
                        <Tooltip target=".copy_CICD" position="right" content={copyToolTip}/>
                      </div>
                    </div>
                    <div className="executiontype">
                      <div className="lable_sync">
                        <label
                          className="Async_lable"
                          id="async"
                          htmlFor="synch"
                          value="asynchronous"
                        >
                          Asynchronous
                        </label>
                        <img className='info__btn_async'src="static/imgs/info.png" ></img>
                        <Tooltip target=".info__btn_async" position="bottom" content=" Execution responses are generated simultaneously during the execution."/>
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
                          Synchronous
                        </label>
                        <img className='info_btn_sync'src="static/imgs/info.png" ></img>
                        <Tooltip target=".info_btn_sync" position="bottom" content=" Execution responses are generated after the end of execution."/>
                      </div>
                    </div>
                    <div className="container_devopsLabel" title={str}>
                      <span className="devops_label">DevOps Request Body</span>
                      <div>
                        <div className="key">
                        <pre className="grid_download_dialog__content executiontypenamepre">
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
                          // title={copyToolTip}
                        />
                        <Tooltip target=".copy_devops" position="right" content={copyToolTip}/>
                        </div>
                      </div>
                    </div>
                  </div>
                  :
                  <div className="container_codesnippetlabel">
                    <div>
                        <label className="code_label">Set The Timer:</label>
                        <InputText
                          // data-test="password"
                          value={runningStatusTimer}
                          className={'w-full md:w-10rem'}
                          style={{'margin': '0.5rem 0px 0.5rem 10.2rem', 'width': "10rem"}}
                          onChange={(event) => { setRunningStatusTimer(event.target.value) }}
                          keyfilter="int"
                          placeholder='Seconds'
                      />
                    </div>
                    <label className="code_label">Select Language:</label>
                    <Dropdown value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.value)} 
                    options={languages} optionLabel="label" optionValue="value"  className="w-full md:w-10rem" 
                    style={{'margin': '0.5rem 0px 1rem 9.1rem', 'width': "10rem"}}
                    />

                    <div>
                      <div className="key">
                      <pre className="code_snippet__content code_snippet__pre">
                        <code
                          className="code_snippet__code"
                          id="code_snippet-key"
                          title={codeSnippets[selectedLanguage]}
                        >
                          {codeSnippets[selectedLanguage]}
                        </code>
                      </pre>

                      <Button
                        icon="pi pi-copy"
                        className="copy_code__snippet"
                        onClick={() => {
                          copyConfigKey(codeSnippets[selectedLanguage]);
                        }}
                        // title={copyToolTip}
                      />
                      <Tooltip target=".copy_code__snippet" position="right" content={copyToolTip}/>
                      </div>
                    </div>
                  </div> }

                </div>
              </>
            }
            headerTxt={`CICD Execution : ${fetechConfig[configItem]?.configurename}`}
            modalSytle={{ width: "50vw", background: "#FFFFFF",height:"95%" }}
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
               className="sno_nocontent"

              >
                S.No.
              </span>
              <span
               className="profile_nocontent"

              >
                Configuration Name
              </span>
              <span
             className="execution_nocontent"
              >
                Execution Options
              </span>
              <span
               className="Action_nocontent"
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
              <span className="text1 ">No items yet.</span>
            </div>
          </div>
          <Button
            className="configure_button"
            onClick={() => configModal("CancelSave")}
            disabled={(projectInfo && projectInfo?.projectLevelRole && checkRole(roleIdentifiers.QAEngineer, projectInfo.projectLevelRole))}
          >
            configure
            <Tooltip target=".configure_button" position="bottom" content="Select test Suite, browser(s) and execution parameters. Use this configuration to create a one-click automation." />
          </Button>
        </Panel>
      );
    }
  };

  // Filter out TestSuites which has empty TestCases (Scenarios)
  const filterOutEmptyTestSuites = (data) => {
    let currentData = data;
    let configureData = data?.configureData;
    let filteredConfigureData = {};
    let configureDataKeys = Object.keys(configureData);

    if (configureDataKeys?.length) {
      Object.values(configureData)?.map((configItem, index) => {
        // check if an configItem is an array
        if (Array.isArray(configItem)) {
          // check if length of array is greater than 0
          if (configItem?.length) {
            const filterdItems = configItem?.filter(item => item?.scenarios?.length !== 0);
            filteredConfigureData[Object.keys(configureData)[index]] = filterdItems;
          }
        }
      })
    }
    return { ...currentData, configureData: filteredConfigureData }
  };
  return (
    <>
      <div>
      {sauceLabLogin}
      {sauceLabExecute}
      {browserstackExecute}
      {browserstackLogin}
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
              <div className="flex flex-row justify-content-between align-items-center">
                <AvoInput
                  icon="pi pi-search"
                  placeholder="Search"
                  inputTxt={searchProfile}
                  title="Search for an execution configuration."
                  setInputTxt={setSearchProfile}
                  inputType="searchIcon"
                />
              {(!!configList.length  && activeIndex1 === 0)?  (
                <Button className="addConfig_button" onClick={() => {configModal("CancelSave");setTypeOfExecution("");}} size="small"  disabled={(projectInfo && projectInfo?.projectLevelRole && checkRole(roleIdentifiers.QAEngineer, projectInfo.projectLevelRole))}>
               Add Configuration
               <Tooltip target=".addConfig_button" position="bottom" content="Select Test Suite, browser(s) and execution parameters. Use this configuration to create a one-click automation." />
                </Button>
              ) : null}
              </div>
          </div>
        </div>
        {activeIndex1 === 0 ? (
          <div className="ConfigurePage_container m-2" showGridlines>
            {renderTable()}{" "}
            <div><Footer/></div>
          </div>
        ) : (
          activeIndex1 === 2 ? <ExecutionProfileStatistics /> : <ExecutionPage />
        )}
        <AvoModal
          visible={visible_setup}
          setVisible={setVisible_setup}
          onModalBtnClick={onModalBtnClick}
          content={
            <ConfigureSetup
              configData={filterOutEmptyTestSuites(getConfigData)}
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
              integration={integration}
              setIntegration={setIntegration}
              setMode={setMode}
              selectedNodeKeys={selectedNodeKeys}
              setSelectedNodeKeys={setSelectedNodeKeys}
              dotNotExe={dotNotExe}
              setDotNotExe={setDotNotExe}
              defaultValues={defaultValues}
              setDefaultValues={setDefaultValues}
              isNotifyOnExecutionCompletion={isNotifyOnExecutionCompletion}
              setIsNotifyOnExecutionCompletion={setIsNotifyOnExecutionCompletion}
              handleSubmit={handleSubmit}
              isEmailNotificationEnabled={isEmailNotificationEnabled}
              setIsEmailNotificationEnabled={setIsEmailNotificationEnabled}
              displayModal={displayModal}
              onHide={onHide}
              onClick={onClick}
              typeOfExecution={typeOfExecution}
              checkedExecution={checkedExecution}
              setCheckedExecution={setCheckedExecution}
              typesOfAppType={typesOfAppType ? typesOfAppType : projectInfo?.appType }
            />
          }
          headerTxt="Execution Configuration set up"
          footerType={setupBtn}
          modalSytle={{ width: "85vw", height: "94vh", background: "#FFFFFF" }}
          isDisabled={
            !configTxt ||
            (typesOfAppType !=="Web"? null:!avodropdown?.browser?.length) ||
            !Object.keys(selectedNodeKeys)?.length ||
            (!!Object.keys(selectedNodeKeys)?.length && !Object.keys(selectedNodeKeys).some(el => el.includes('-')))
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
