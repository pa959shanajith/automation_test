import React, { useEffect, useState, useRef, useMemo } from 'react';
// import { NormalDropDown, TextField, SearchBox, SearchDropdown } from '@avo/designcomponents';
// import { Icon } from "@fluentui/react/lib/Icon";
import { useNavigate } from 'react-router-dom';
import "../styles/Genius.scss";
import { getProjectList, getModules, saveMindmap, getScreens } from '../../design/api';
import { ScreenOverlay, VARIANT, ResetSession,RedirectPage, Messages as MSG } from '../../global';
// import {selectedModule} from '../designSlice'
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import {Dropdown} from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext';
import { parseProjList } from '../../design/containers/MindmapUtils';
// import { useHistory } from 'react-router-dom';
import * as landingApi from "../../landing/api";
import * as DesignApi from '../../design/api'
// import * as mindmapActionTypes from "../../mindmap/state/action";
// import * as actionTypesGlobal from "../../global/state/action";
import {deleteScenario} from "../../design/api"
import FileSaver from 'file-saver';
import GeniusMindmap from "../../design/containers/GeniusMindmap";
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useSelector, useDispatch } from 'react-redux';
import { selectedModuleReducer, screenData, moduleList } from '../../design/designSlice';
import { showGenuis, showSmallPopup } from '../../global/globalSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
// import { Button } from '@mui/material';
import { Button } from 'primereact/button';
import { v4 as uuid } from 'uuid';
import { Tooltip } from 'primereact/tooltip';
import '../styles/DataTableDemo.scss';
// import '../styles/ScrollPanelDemo.scss';
// import '../styles/SpeedDialDemo.scss';
// import '../styles/objectPropertyTable.scss';
import { TabMenu } from 'primereact/tabmenu';
import { Menu } from 'primereact/menu';
import { ContextMenu } from 'primereact/contextmenu';
import { getKeywordList } from '../../design/components/UtilFunctions';
import { InputNumber } from 'primereact/inputnumber';
import {getObjNameList} from '../../design/components/UtilFunctions'
import { classNames } from 'primereact/utils';
// import ReactTooltip from 'react-tooltip';




let count=0;

const GeniusSap = (props) => {
  const history = useNavigate()
  const menu = useRef(null);
  const cm = useRef(null);

  let scrnreused=[]

  let emptyProduct = {
    id: null,
    name: '',
    image: null,
    description: '',
    category: null,
    price: 0,
    quantity: 0,
    rating: 0,
    inventoryStatus: 'INSTOCK'
  };

  let startLoop = {
    "stepNo": '',
    "objectName": ' ',
    "custname": '@Generic',
    "keywordVal": 'startLoop',
    "inputVal": [""],
    "outputVal": '',
    "remarks": "",
    "url": ' ',
    "appType": "Web",
    "addDetails": "",
    "cord": ''
  }
  let endLoop = {
    "stepNo": '',
    "objectName": ' ',
    "custname": '@Generic',
    "keywordVal": 'endLoop',
    "inputVal": [""],
    "outputVal": '',
    "remarks": "",
    "url": ' ',
    "appType": "Web",
    "addDetails": "",
    "cord": ''
  }

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [allProjects, setAllProjects] = useState({})
  const [projModules, setProjModules] = useState([])
  const [modScenarios, setModScenarios] = useState([])
  const [appType, setAppType] = useState(null);
  const [appTypeDialog, setAppTypeDialog] = useState(null)
  const [applicationPath, setApplicationPath] = useState("")
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
  const[warning,setWarning]=useState(false)
  const [showFullXpath, setShowFullXpath] = useState(false) 
  const moduleSelect = useSelector(state => state.design.selectedModule);
  const [mindmapShow, setMindmapShow] = useState(false);  
  const[visibleScenario,setVisibleScenario]=useState(false)
  const[visibleReset,setVisibleReset]=useState(false)
  const[scenarioChosen,setScenarioChosen]=useState(null)
  const[BrowserName,setBrowserName]=useState(null)
  const[screenNamesList,setScreenNameList]=useState(null)
  const[errorMessage,setErrorMessage]=useState(false)
  const userInfo = useSelector((state) => state.landing.userinfo);
  const savedRef = useRef(false);
  const finalDataRef = useRef([])
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState([]);
  const [startGenius, setStartGenius] = useState("Activate Genius");
  const sapGeniusScrapeData = useSelector((state) => state.landing.sapGeniusScrapeData);
  const [counter, setCounter] = useState(3);
  const [dataObjects, setDataObjects] = useState([]);
  const [testSteps, setTestSteps] = useState([]);
  const [screenNumber, setScreenNumber] = useState(1)
  const [allScreenData, setAllScreenData] = useState({});
  const [expandedRows, setExpandedRows] = useState(null);
  const [dataLength, setDataLength] = useState(0);
  const [screenNames, setScreenNames] = useState(["SAP_Launch"]);
  const [card, setCard] = useState(false);
  const [location, setLocation] = useState({ center: '', bottom: '' })
  const [touched, setTouched] = useState(false);
  const [screenDeleteDialogue, setScreenDeleteDialogue] = useState(false);
  const [copiedData, setCopiedData] = useState(null)
  const [popup, showPopup] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [createNewIndex, setCreateNewIndex] = useState(null)
  const [screenDialog, setScreenDialog] = useState(false);
  const [step, setStep] = useState(null)
  const [dataManipulated, setDataManipulated] = useState(false)
  const [rawTable, setRawTable] = useState([])
  const [tableAfterOperation, setTableAfterOperation] = useState([])
  const [productDialog, setProductDialog] = useState(false);
  const [keywordList, setKeywordList] = useState([]);
  const [projectData, setProjectData] = useState(undefined)
  const [custval, setCustValue] = useState(null)
  const [tempData, setTempData] = useState([]);
  const [finalData, setFinalData] = useState([]);
  const screenNamesRef = useRef({})
  const navigation_flag = useRef(false);
  let configs = { "hideFieldValue": false }
  const [tableData, setTableData] = useState([]);
  const [edit, setEdit] = useState(false)
  const [insert, setInsert] = useState(false)
  const [submitted, setSubmitted] = useState(false);
  const [insertAbove, setInsertAbove] = useState(false);
  const [stepNoAbove, setStepAbove] = useState(null)
  const [stepNoBelow, setStepBelow] = useState(null)
  const [insertAtStep, setInsertAtStep] = useState(false)
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [product, setProduct] = useState(emptyProduct);
  const [dele, setDele] = useState(false)
  const [closeApp, setCloseApp] = useState(false)
  const [insertBelow, setInsertBelow] = useState(false)
  const [navURL, setNavURL] = useState("")
  const [blockedDocument, setBlockedDocument] = useState(false);
  const [overlay, setOverlay] = useState("Loading...");
  const [eraseData, seteraseData] = useState(false);
  const [expand, setExpand] = useState(false)
  const popupref = useRef(null);
  const [popupData, setPopupData] = useState([]);
  const [position, setPosition] = useState('center');
  const textRef = useRef(null)
  const [dataParamUrl, setDataParamUrl] = useState(false)
  const [displayBasic2, setDisplayBasic2] = useState(false);
  const [DataParamPath, setDataParamPath] = useState(null)
  const [showMindmap, setShowMindmap] = useState(false);
  const [dataSaved, setDataSaved] = useState(false);
  const [activeIndex, setActiveIndex] = useState(3);
  const dialogFuncMap = {
    'displayBasic2': setDisplayBasic2,
  }


  useEffect(() => {
    if (sapGeniusScrapeData && typeof sapGeniusScrapeData === "object" && Object.keys(sapGeniusScrapeData).length > 0) {
      setCounter((prevCounter) => prevCounter + 1);

      if (!sapGeniusScrapeData.custname.includes("@")) {
        let newUUID = uuid();
        let sapGeniusScrapeDataModified = {...sapGeniusScrapeData, tempOrderId: newUUID};
        dataObjects.push(sapGeniusScrapeDataModified);
        testSteps.push(sapGeniusScrapeDataModified);
        testSteps.map((element, index) => {
          return {
            ...element, stepNo: index + 1
          }
        })

        data.push({
          id: counter,
          name: sapGeniusScrapeData.window_name,
          step: `Step ${counter}`,
          elementName: sapGeniusScrapeData.custname,
          keywordVal: sapGeniusScrapeData.keywordVal,
          testData: <div style={{ width: '18rem',wordWrap:'break-word' }}>{sapGeniusScrapeData.inputVal}</div>,
          tempOrderId: newUUID,
          testcases: sapGeniusScrapeDataModified
        });
        setDataLength(data.length);

        if (!(sapGeniusScrapeData.window_name in allScreenData)) {
          setScreenNumber((prevScreenNumber) => prevScreenNumber + 1);
          allScreenData[sapGeniusScrapeData.window_name] = {
            data_objects: [sapGeniusScrapeDataModified],
            name: sapGeniusScrapeData.window_name,
            scrapedUrl: applicationPath,
            screen_number: screenNumber,
            screenshot: '',
            starting_stepNumber: 1,
            tabIndex: 0,
            testcases: [sapGeniusScrapeDataModified]
          }
        }
        else {
          allScreenData[sapGeniusScrapeData.window_name]['data_objects'].push(sapGeniusScrapeDataModified);
          allScreenData[sapGeniusScrapeData.window_name]['testcases'].push(sapGeniusScrapeDataModified);
        }
      }
      else {
        testSteps.push(sapGeniusScrapeData);
        testSteps.map((element, index) => {
          return {
            ...element, stepNo: index + 1
          }
        })

        data.push({
          id: counter,
          name: sapGeniusScrapeData.window_name,
          step: `Step ${counter}`,
          elementName: sapGeniusScrapeData.custname,
          keywordVal: sapGeniusScrapeData.keywordVal,
          testData: <div style={{ width: '18rem',wordWrap:'break-word' }}>{sapGeniusScrapeData.inputVal}</div>,
          testcases: sapGeniusScrapeData
        });
        setDataLength(data.length);

        if (!(sapGeniusScrapeData.window_name in allScreenData)) {
          setScreenNumber((prevScreenNumber) => prevScreenNumber + 1);
          allScreenData[sapGeniusScrapeData.window_name] = {
            data_objects: [],
            name: sapGeniusScrapeData.window_name,
            scrapedUrl: applicationPath,
            screen_number: screenNumber,
            screenshot: '',
            starting_stepNumber: 1,
            tabIndex: 0,
            testcases: [sapGeniusScrapeData]
          }
        }
        else {
          allScreenData[sapGeniusScrapeData.window_name]['testcases'].push(sapGeniusScrapeData);
        }
      }

      if (!(screenNames.includes(sapGeniusScrapeData.window_name))) {
        setScreenNames([...screenNames, sapGeniusScrapeData.window_name])
      }
    }
  }, [sapGeniusScrapeData])

  useEffect(() => {
    setTableAfterOperation(tableDataNew)
  }, [])

  let emptyStepData = {
    "stepNo": '',
    "objectName": ' ',
    "custname": '',
    "keywordVal": '',
    "inputVal": [""],
    "outputVal": '',
    "remarks": "",
    "url": ' ',
    "appType": "SAP",
    "addDetails": "",
    "cord": ''
  }

  

  const deleteScreen=(product)=>{
    setSingleData({ ...product })
    setScreenDeleteDialogue(true)

  }
  const [singleData, setSingleData] = useState(emptyStepData);

  const hideDialogScreen = () => {
    setSubmitted(false);
    setScreenDialog(false);
    setDataParamUrl(false)  
  }


  const exportExcel = () => {
    let arr = []
    let obj = {}
    let i = 0
    const dataparamtable = [...tableDataNew]
    let tabledata = dataparamtable.map(screenData => {
      let abc = screenData.testcases.map((testcase, idx) => {
        if (testcase.keywordVal === 'setText') {
          let variables = `${testcase.custname}`
          let originalVal = testcase.inputVal[0]
          // testcase.inputVal[0]=`|${testcase.custname}|`
          obj[variables] = originalVal
          i++
        }


      })
      return abc
    })

    arr.push(obj)
    if (i > 0) {
      import('xlsx').then(xlsx => {

        const worksheet = xlsx.utils.json_to_sheet(arr);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAsExcelFile(excelBuffer, 'Genius_SAP_dataparam');
      });
    }
    else {
      showPopup(true)
      setMessage('No fields for Data Parametrization...')
    }
  }
  const saveAsExcelFile = (buffer, fileName) => {
    try {
      let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data = new Blob([buffer], {
        type: EXCEL_TYPE
      });
  
      FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setDataParamUrl(true);
    }
  };

  const onDataParamUrl = (e, name) => {
    const val = e.target.value;
    let _tableSingleData = { ...singleData };
    _tableSingleData['custname'] = '@Generic'
    _tableSingleData['keywordVal'] = 'getParam'
    const filepath = `${val}`.replace(/(^"|"$)/g, '');
    _tableSingleData[`${name}`] = [`${filepath};data`]
    setSingleData(_tableSingleData)
    setDataParamPath(`${filepath}`)
  }

  const showDialog= () => {
    let screenViewObject = {};
    screenViewObject.appType = "SAP";
    screenViewObject.applicationPath = applicationPath;
    screenViewObject.scrapeType = "Genius";

    DesignApi.launchAndServerConnectSAPGenius_ICE(screenViewObject)
      .then(data => {
          if (data == "unavailableLocalServer") {
              props.toastError(MSG.CUSTOM("No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server.", VARIANT.ERROR));
          }
          else {
            setVisible(true);
          }
        });
  };

  const onHideSap = () => {
    setVisible(false);
    setData([]);
    setDataLength(0);
    setTestSteps([]);
    setAllScreenData({});
    setStartGenius("Activate Genius");
    setDataSaved(false);
    seteraseData(false);
  };
  
  const displayError = (error) => {
    
    setBlockui({ show: false })
    setLoading(false)
    (typeof error === "object" ? error : MSG.CUSTOM(error, "error"))
  }

  const editScreen = (product) => {
    setSingleData({ ...product });
    setScreenDialog(true);
  }

  const saveScreen = () => {
    setDataManipulated(true)
    console.log(selectedScreen)
    const screenEditTable = [...tableAfterOperation]
    let objIndex = screenEditTable.findIndex(testCase => testCase.name === selectedScreen.name)
    screenEditTable[objIndex].name = singleData.name
    setTableAfterOperation(screenEditTable)
    setScreenDialog(false);
  }

  useEffect(() => {
    (async () => {
      if (selectedProject && selectedProject.key) {
        setSelectedModule(null);
        setSelectedScenario(null);
        setAppType({
          key: allProjects[selectedProject.key].apptype,
          text: allProjects[selectedProject.key].apptypeName
        })
        var modulesdata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": null });
        if (modulesdata === "Invalid Session") return RedirectPage(history);
        if (modulesdata.error) { displayError(modulesdata.error); return; }
        setProjModules(modulesdata);
        
        setSelectedModule(props.selectedModule?props.selectedModule:null)
        const screenName=await getScreens(selectedProject.key)
        setScreenNameList(screenName)
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
        setSelectedScenario(props.selectedScenario?props.selectedScenario:null)
      }
    })()
  }, [selectedModule])

  useEffect(() => {
    (async () => {
      count=0;
      setBlockui({ show: true, content: 'Loading...' })
      let res = await getProjectList();
      if (res === "Invalid Session") return RedirectPage(history);
      if (res.error) { displayError(res.error); return; }
      var data = parseProjList(res)
      setAllProjects(data);
      let selectedProjectDetails=JSON.parse(localStorage.getItem('DefaultProject'))
      let projId={
        key:selectedProjectDetails.projectId,
        text:selectedProjectDetails.projectName
      }
      setSelectedProject(props.selectedProject?props.selectedProject:projId?projId:null)
      res = await DesignApi.getUserDetails("user");
      if (res === "Invalid Session") return RedirectPage(history);
      if (res.error) {
      (MSG.CUSTOM("Error while fetching the user Details"));
        } else {
          let users = res.filter((user_arr) => !["5db0022cf87fdec084ae49a9", "5f0ee20fba8ae8b8a603b5b6"].includes(user_arr[2]))
          setUserDetailList(users);
        }
        res = await DesignApi.getAvailablePlugins();
        if (res === "Invalid Session") return RedirectPage(history);
        if (res.error) {
          (MSG.CUSTOM("Error while fetching the app Details"));
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
    }, [])

    const deleteProduct = () => {
      setDataManipulated(true)
      let arr = [...tableDataNew]
      let objIndex = arr.findIndex(testCase => testCase.name === selectedScreen.name)
      const newArr = arr[objIndex].testcases.filter(element => element.stepNo !== step)
      arr[objIndex].testcases = newArr.map((element, idx) => {
        element.stepNo = idx + 1;
        return element
      })
      const deleteEmptyScreen = arr.filter(screen => screen.testcases.length !== 0)
      allScreenData[selectedScreen.name]["testcases"] = arr[objIndex].testcases;
      setTableAfterOperation(deleteEmptyScreen)
      setDele(true)
      setDeleteProductDialog(false);
      setProduct(emptyProduct);
      setFlag(true)
      showPopup(true)
      setMessage('Test step Deleted successfully')
    }

    const openNew = () => {
      const arr = [...tableDataNew]
      let objIndex = arr.findIndex(testCase => testCase.name === selectedScreen.name)
      const Index = arr[objIndex].testcases.length + 1;
      setCreateNewIndex(Index)
      setEdit(false)
      setSingleData(emptyStepData);
      setSubmitted(false);
      setProductDialog(true);
    }


    const hideEraseData = () => {
      seteraseData(false)
    }

    const eraseFooter = (
      <React.Fragment>
        <Button label="No" icon="pi pi-times" className="p-button-text" onClick={() => seteraseData(false)} />
        <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={() => {
          setFinalData([]); setTempData([]); seteraseData(false); setTableAfterOperation([]); setRawTable([]); showPopup(true); setMessage('Test Step Erased Successfully.');setData([]);
          setDataLength(0);
          setTestSteps([]);
          setAllScreenData({});
        }
        } />
      </React.Fragment>
    );

    const screenDialogFooter = (
      <React.Fragment>
        <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialogScreen} />
        <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveScreen} />
      </React.Fragment>
    );


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

    const expandAll = () => {
      let _expandedRows = {};
      tableDataNew.forEach(p => _expandedRows[`${p.name}`] = true);
      setExpandedRows(_expandedRows);
    }

 

    const handleModuleCreate = async (e) => {
    
      if (!(moduleName)) {
       props.toastError(MSG.CUSTOM("Please fill the mandatory fields", "error"));
        return;
      }
      const regEx = /[~*+=?^%<>()|\\|\/]/;
      if (!(selectedProject && selectedProject.key)) {
       props.toastError(MSG.CUSTOM("Please select a project", "error"))
        return;
      }
      else if (regEx.test(moduleName)) {
       props.toastError(MSG.CUSTOM("Module name cannot contain special characters", "error"))
        return;
      }
      else if (projModules.filter((mod) => mod.name === moduleName).length > 0) {
       props.toastError(MSG.CUSTOM("Module already exists", "error"));
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
        "createdthrough": "SAP",
        "relId": null
      }
      try {
        const response = await saveMindmap(module_data);
        if (response === "Invalid Session") return RedirectPage(history);
        if (response.error) { displayError(response.error); return }
        props.toastSuccess(MSG.CUSTOM("Module Created Successfully", "success"));
        let modulesdata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": null });
        if (modulesdata === "Invalid Session") return RedirectPage(history);
        if (modulesdata.error) { displayError(modulesdata.error); return; }
        
        setProjModules(modulesdata);
        
       
        const newModule={
          key:modulesdata[modulesdata.length-1]._id,
          text:modulesdata[modulesdata.length-1].name
        }
        setSelectedModule(newModule)
        setDisplayCreateModule(false);
      } catch (err) {
        console.log(err);
      }
    }


    const handleScenarioCreate = async () => {
      if (!(scenarioName)) {
        props.toastError(MSG.CUSTOM("Please enter Test case", "error"));
        return;
      }
      const regEx = /[~*+=?^%<>()|\\|\/]/;
      if (!(selectedModule && selectedModule.key)) {
        props.toastError(MSG.CUSTOM("Please select a module", "error"))
        return;
      }
      else if (regEx.test(scenarioName)) {
        props.toastError(MSG.CUSTOM("Test case name cannot contain special characters", "error"))
        return;
      }
      else if (modScenarios.filter((scenario) => scenario.name === scenarioName).length > 0) {
        props.toastError(MSG.CUSTOM("Test case already exists", "error"));
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
        "createdthrough": "SAP"
      }
      try {
        const response = await saveMindmap(scenario_data);
        if (response === "Invalid Session") return RedirectPage(history);
        if (response.error) { displayError(response.error); return }
        props.toastSuccess(MSG.CUSTOM("Scenario Created Successfully", "success"));
        var moduledata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": [selectedModule.key], cycId: null })
        if (moduledata === "Invalid Session") return RedirectPage(history);
        if (moduledata.error) { displayError(moduledata.error); return; }
        setModScenarios(moduledata.children);
       
        const newSce={
          key: moduledata.children[moduledata.children.length-1]._id,
          text: moduledata.children[moduledata.children.length-1].name
        }
        setSelectedScenario(newSce)
        setDisplayCreateScenario(false);
      } catch (err) {
        console.log(err);
      }
    }

    const resetGeniusFields = () => {
      setVisibleReset(true)
      setVisibleScenario(false)
     }

//   setTimeout(() => {
//   if (popup)
//     popupref.current.style.visibility = "hidden"
//   showPopup(false)

// }, 3000)


const onScreenNameChange = (e, name) => {
  const val = e.target.value;
  let _tableSingleData = { ...singleData };
  _tableSingleData[`${name}`] = val;
  setSingleData(_tableSingleData);
}
     
  const handleSAPActivateGenius = async (event) => {
    let screenViewObject = {};
    screenViewObject.appType = "SAP";
    screenViewObject.applicationPath = applicationPath;
    screenViewObject.scrapeType = "Genius";
    if (startGenius === "Activate Genius") {
      setStartGenius("Stop Genius");
      data.push({
        id: 1,
        name: "SAP_Launch",
        step: `Step 1`,
        elementName: "@Sap",
        keywordVal: "LaunchApplication",
        testData: <div style={{ width: '18rem',wordWrap:'break-word'}}>{applicationPath.split(';')[0] + ";" + applicationPath.split(';')[1]}</div>,
        testcases: {
          xpath: '',
          objectName:'',
          keywordVal:'',
          id: '',
          inputVal: applicationPath.split(';')[0] + ";" + applicationPath.split(';')[1],
          tag: '',
          custname: '@Sap',
          left: '',
          top: '',
          height: '',
          width: '',
          stepNo: 1,
          keywordVal: 'LaunchApplication',
          window_name: 'SAP_Launch',
          tooltip: '',
          defaulttooltip: ''
        }
      },
      {
        id: 2,
        name: "SAP_Launch",
        step: `Step 2`,
        elementName: "@Sap",
        keywordVal: "ServerConnect",
        testData: <div style={{ width: '18rem',wordWrap:'break-word'}}>{applicationPath.split(';')[2]}</div>,
        testcases: {
          xpath: '',
          objectName:'',
          keywordVal:'',
          id: '',
          inputVal: applicationPath.split(';')[2],
          tag: '',
          custname: '@Sap',
          left: '',
          top: '',
          height: '',
          width: '',
          stepNo: 2,
          keywordVal: 'ServerConnect',
          window_name: 'SAP_Launch',
          tooltip: '',
          defaulttooltip: ''
        }
      });
      setDataLength(data.length);
  
      testSteps.push({
            xpath: '',
            id: '',
            inputVal: applicationPath.split(';')[0] + ";" + applicationPath.split(';')[1],
            tag: '',
            custname: '@Sap',
            left: '',
            top: '',
            height: '',
            width: '',
            keywordVal: 'LaunchApplication',
            window_name: 'SAP_Launch',
            tooltip: '',
            defaulttooltip: ''
        },
        {
            xpath: '',
            id: '',
            inputVal: applicationPath.split(';')[2],
            tag: '',
            custname: '@Sap',
            left: '',
            top: '',
            height: '',
            width: '',
            keywordVal: 'ServerConnect',
            window_name: 'SAP_Launch',
            tooltip: '',
            defaulttooltip: ''
        });
  
      allScreenData["SAP_Launch"] = { 
            data_objects: [],
            name: "SAP_Launch",
            scrapedUrl: '',
            screen_number: 0,
            screenshot: '',
            starting_stepNumber: 1,
            tabIndex: 0,
            testcases: [{
            xpath: '',
            id: '',
            inputVal: applicationPath.split(';')[0] + ";" + applicationPath.split(';')[1],
            tag: '',
            custname: '@Sap',
            left: '',
            top: '',
            height: '',
            width: '',
            keywordVal: 'LaunchApplication',
            window_name: 'SAP_Launch',
            tooltip: '',
            defaulttooltip: ''
            },
            {
            xpath: '',
            id: '',
            inputVal: applicationPath.split(';')[2],
            tag: '',
            custname: '@Sap',
            left: '',
            top: '',
            height: '',
            width: '',
            keywordVal: 'ServerConnect',
            window_name: 'SAP_Launch',
            tooltip: '',
            defaulttooltip: ''
            }]
      }

      DesignApi.startScrapingSAPGenius_ICE(screenViewObject)
      .then(data => {
        if (data == "unavailableLocalServer") {
            props.toastError(MSG.CUSTOM("No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server.", VARIANT.ERROR));
        }
      });   
    }
    else if (startGenius === "Stop Genius") {
      setStartGenius(false);
      DesignApi.stopScrapingSAPGenius_ICE(screenViewObject)
      .then(data => {
        if (data == "unavailableLocalServer") {
            props.toastError(MSG.CUSTOM("No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server.", VARIANT.ERROR));
        }
      });
    }
  }

  const resetFields=()=>{
    setSelectedProject(null);
    setSelectedModule(null);
    setSelectedScenario(null);
    setScenarioName("");
    setAppType(null);
    setApplicationPath("");
    setScenarioChosen(null)
  }
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
    
    scenarios.forEach((scenario, idx) => {
      if (scenario._id === excluded_scenario) { return };
      tempArr.push(templateForMindmapSaving(scenario));
    });
       return tempArr;
  }

  const handleSaveMindmap = async () => {
    var moduledata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": [selectedModule.key], cycId: null })
    const completeScenraioDetials=moduledata.children
    
    try {
      const scenarioData = getExcludedMindmapInternals(modScenarios, scenarioChosen.key);
      const scrnreused = [];
      const isAlreadySaved = true;

      let screenArray = [];
      let screenData = {}

      Object.entries(allScreenData).forEach(([key, value], index) => {
        screenData = {
          data_objects: allScreenData[key]["data_objects"],
          name: key,
          scrapedUrl: applicationPath,
          screen_number: index,
          screenshot: '',
          starting_stepNumber: 1,
          tabIndex: 0,
          testcases:  allScreenData[key]["testcases"].map((testStep, idx) => {
            if (!testStep.custname.includes("@")) {
              return {
                addDetails: '',
                appType: 'SAP',
                cord: '',
                custname: testStep.custname,
                inputVal: [testStep.inputVal],
                keywordVal: testStep.keywordVal,
                objectname: testStep.xpath,
                outputVal: '',
                remarks: '',
                stepNo: idx + 1,
                url: '',
                tempOrderId: testStep.tempOrderId
              };
            }
            else {
              return {
                addDetails: '',
                appType: testStep.custname.replace(new RegExp('@', 'g'), ''),
                cord: '',
                custname: testStep.custname,
                inputVal: [testStep.inputVal],
                keywordVal: testStep.keywordVal,
                objectname: testStep.xpath,
                outputVal: '',
                remarks: '',
                stepNo: idx + 1,
                url: ''
            };
          }
          })
        };
        screenArray.push(screenData)
      });

      const data = {
        data: {
          module: {
            key: selectedModule.key,
            text: selectedModule.text
          },
          project: {
            key: selectedProject.key,
            text: selectedProject.text
          },
          scenario: {
            key: scenarioChosen.key,
            text: scenarioChosen.text
          },
          screens: screenArray
        }
      }
      const res = await landingApi.getGeniusDataSAP(data, scenarioData,isAlreadySaved,completeScenraioDetials,scrnreused);
      savedRef.current = true;
      if (res.status === "success") {
        setDataSaved(true);
        props.toastSuccess(MSG.CUSTOM("Data Saved Successfully", "success"));
      }
      else {
        props.toastSuccess(MSG.CUSTOM("Error Occurred While Saving Data", "error"));
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  const actionScreen = (rowData) => {
    return (
      <>
        <div style={{ display: "flex", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "90%", color: 'white', backgroundColor: '#5f338f', padding: '6px 15px', borderRadius: '5px', width: 'auto', paddingLeft: 36, position: "absolute", left: "0.7rem" }}>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rowData.name}</div>
          <span style={ { marginRight: '0.5rem', cursor: 'pointer' , opacity: '0.4',  }} onClick={() => {  { editScreen(selectedRow); setSelectedScreen({ name: selectedRow.name }) } }} aria-controls="popup_menu" aria-haspopup><i className='pi pi-file-edit' style={{ fontSize: '17px' }} ></i></span>
          <span style={ { marginRight: '1rem', cursor: 'pointer' , opacity: '0.4', cursor: 'not-allowed' }} onClick={() => {  { deleteScreen(selectedRow);setSelectedScreen({ name: selectedRow.name }) } }} aria-controls="popup_menu" aria-haspopup><i className='pi pi-trash' style={{ fontSize: '17px' }} ></i></span>

        </div>
      </>
    )
  }

  const onRowReorder = (e) => {
    const draggedVale = e.value;
    const _table = [...tableAfterOperation]
    const objIndex = _table.findIndex(element => element.name === selectedScreen.name)
    _table[objIndex].testcases = e.value.map((element, idx) => {
      element.stepNo = idx + 1
      return element
    })

    console.log(_table)
    setTableAfterOperation(_table)
    console.log(e.value)
  }

  const showObjectProp = (e, rowData) => {
    const clickedIcon = e.target.getBoundingClientRect()
    const center = (clickedIcon.left + clickedIcon.right) / 2
    const bottom = clickedIcon.bottom + 10
    setLocation({ center, bottom })
    onClick('displayBasic2', rowData)
  }

  const onClick = (name, popupData) => {
    console.log(popupData)
    dialogFuncMap[`${name}`](true);
    setCard(true)
    const data = []
    data.push(popupData)
    setPopupData(data)

    console.log('hl')
    if (position) {
      setPosition(position);
    }
  }

  const ActionIconTemplate = (rowData) => {
    const [showFull, setShowFull] = useState(false)
    return (
      <React.Fragment>
        <Tooltip target=".pi-info-circle" />
        <span className="removeEllipsis" style={{}} onMouseEnter={() => { if (rowData.custname.trim().length > 30) setShowFull(true) }} onMouseLeave={() => setShowFull(false)}> {rowData.custname.trim().length > 30 && !showFull ? rowData.custname.trim().substring(0, 20) + "..." : rowData.custname.trim()}</span>
        <span className="info-logo" style={{ cursor: 'pointer', marginTop: '6px', paddingLeft: '1rem', fontSize: '13px' }} onMouseEnter={(e) => { showObjectProp(e, rowData) }} onMouseLeave={() => setCard(false)}> <i className="pi pi-info-circle" style={{ 'fontSize': '1.2em' }} /></span>
      </React.Fragment>
    );
    {/* <span className="info-logo" style={{ cursor: 'pointer', marginTop: '6px', paddingLeft: '1rem', fontSize: '13px' }} onMouseEnter={(e) => { showObjectProp(e, rowData) }} onMouseLeave={() => setCard(false)}> <i className="pi pi-info-circle" style={{ 'fontSize': '1.2em' }} /></span> */ }
  }

  let tableDataNew = useMemo(() => {
    let expandable_data = [];
    let index_of_screen = 0;
    let screen_obj = {};
    let stepNumber = 1;
    let totalStepNumbers = 1;
    let tempIndex = 0
    for (let idx = 0; idx < data.length; idx++) {
      if (JSON.stringify(screen_obj) === "{}") {
        screen_obj["name"] = screenNames[index_of_screen];
        screen_obj["testcases"] = [];
        screen_obj["data_objects"] = [];
        screen_obj["screenshot"] = dataObjects[tempIndex] && dataObjects[tempIndex]["screenshot"] ? dataObjects[tempIndex]["screenshot"] : ""
        screen_obj["scrapedurl"] = dataObjects[tempIndex] && dataObjects[tempIndex]["url"] ? dataObjects[tempIndex]["url"] : ""
        screen_obj["starting_stepNumber"] = totalStepNumbers;
        stepNumber = 1;
      }
      if (data[idx]["tempOrderId"]) {
        screen_obj["data_objects"].push(dataObjects[tempIndex]);
      }

      if (data[idx]["testcases"]["keywordVal"] === "LaunchApplication") { if (idx === 0) screen_obj["testcases"].push({ ...data[idx]["testcases"], stepNo: stepNumber++ }); }
      else screen_obj["testcases"].push({ ...data[idx]["testcases"], stepNo: stepNumber++ });
      totalStepNumbers += 1;

      if (data[idx + 1] && data[idx + 1]["testcases"]["window_name"] !== data[idx]["testcases"]["window_name"] && idx > 0) {
        expandable_data.push(screen_obj);
        screen_obj = {};
        index_of_screen += 1;
      }
      
      if (data[idx]["tempOrderId"]) {
        tempIndex += 1;
      }
    }
    if (JSON.stringify(screen_obj) !== "{}") {
      expandable_data.push(screen_obj);
      setExpandedRows({ [screen_obj.name]: true })
    };
    console.log(expandable_data)
    return expandable_data;
  }, [dataLength]);

  const handleProjectDetails = (data) => {
    setProjectData(data)
  }


  const copyData = (data) => {
    console.log(data)
    setCopiedData(data)
    showPopup(true)
    setMessage('Test step copied successfully')
    // toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Test step copied successfully', life: 3000 });
  }

  const pasteData = () => {
    setDataManipulated(true)

    let savedData = [...data]
    let _table = [...tableDataNew]
    if (copiedData.stepNo) {
      let _tableSingleData = { ...copiedData }
      const objIndex = _table.findIndex(testCase => testCase.name === selectedScreen.name)

      _table[objIndex].testcases.splice(step, 0, _tableSingleData)
      _table[objIndex].testcases.map((element, idx) => {
        element.stepNo = idx + 1;
        return element
      })

      setTableAfterOperation(_table)
      allScreenData[selectedScreen.name]["testcases"] = _table[objIndex].testcases;
      showPopup(true)
      setMessage('Test step pasted successfully')
      // toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Test step pasted successfully', life: 3000 });
      setCopiedData(null)
    }
    else {
      if (!copiedData.stepNo) {
        let data = { ...copiedData }
        data.stepNo = rawTable.length + 1
        savedData.splice(data.stepNo, 0, data)
        setRawTable(savedData)
        setCopiedData(null)
      }
      else {
        savedData.splice(copiedData.stepNo - 1, 0, copiedData)
        console.log(savedData)
        setRawTable(savedData)
        setCopiedData(null)
      }
      console.log(rawTable)
    }
    setProductDialog(false);
    //     setProduct(emptyProduct);
    // }
    console.log(rawTable)

  }
  const confirmDeleteProduct = (product) => {
    setProduct(product);
    setDeleteProductDialog(true);
  }
  const hideDeleteProductDialog = () => {
    if (closeApp) {
      setCloseApp(false)
    }
    else {
      setDeleteProductDialog(false);
    }


  }
  

  const editProduct = (product) => {
    setKeywordList(getKeywordList(product.custname, projectData, "SAP", allScreenData[selectedScreen.name]["testcases"])["keywords"])
    setEdit(true)
    console.log(product)
    setSingleData({ ...product })
    setProductDialog(true);
  }

  const hideDialog = () => {
    setSubmitted(false);
    setProductDialog(false);
  }
  const saveProduct = () => {
    setSubmitted(true);
    setDataManipulated(true);
    let savedData = [...data]
    let _table = [...tableDataNew]
    if (insertAtStep) {
      let data = { ...singleData }
      const objIndex = _table.findIndex(testCase => testCase.name === selectedScreen.name)

      _table[objIndex].testcases.splice(data.stepNo - 1, 0, data)
      _table[objIndex].testcases.forEach((element, idx) => {
        element.stepNo = idx + 1;
        return element
      })

      allScreenData[selectedScreen.name]["testcases"] = _table[objIndex].testcases;
      setTableAfterOperation(_table)
      setProductDialog(false);
    }
    else {
      if (insert) {
        if (insertAbove) {
          let data = { ...singleData }
          data.stepNo = createNewIndex
          const objIndex = _table.findIndex(testCase => testCase.name === selectedScreen.name)

          _table[objIndex].testcases.splice(createNewIndex, 0, data)
          _table[objIndex].testcases.forEach((element, idx) => {
            element.stepNo = idx + 1;
            return element
          })

          allScreenData[selectedScreen.name]["testcases"] = _table[objIndex].testcases;
          setTableAfterOperation(_table)
          setProductDialog(false);
        }
        else {
          let data = { ...singleData }

          data.stepNo = createNewIndex
          const objIndex = _table.findIndex(testCase => testCase.name === selectedScreen.name)
          _table[objIndex].testcases.splice(createNewIndex - 1, 0, data)
          _table[objIndex].testcases.forEach((element, idx) => {
            element.stepNo = idx + 1;
            return element
          })
          
          allScreenData[selectedScreen.name]["testcases"] = _table[objIndex].testcases;
          setTableAfterOperation(_table)
          setProductDialog(false);
        }
      }
      else {

        if (singleData.stepNo) {
          let _tableSingleData = { ...singleData }
          if (_tableSingleData.stepNo) {
            const objIndex = _table.findIndex(testCase => testCase.name === selectedScreen.name)
            _table[objIndex].testcases.splice(singleData.stepNo - 1, 1, _tableSingleData)
            setTableAfterOperation(_table)
            allScreenData[selectedScreen.name]["testcases"] = _table[objIndex].testcases;
            showPopup(true)
            setMessage('Test step Updated successfully')
          }
          setProductDialog(false);
        }
        else {
          if (!singleData.stepNo) {
            let data = { ...singleData }
            data.stepNo = createNewIndex
            const objIndex = _table.findIndex(testCase => testCase.name === selectedScreen.name)
            _table[objIndex].testcases.splice(createNewIndex - 1, 0, data)
            allScreenData[selectedScreen.name]["testcases"] = _table[objIndex].testcases;
            setTableAfterOperation(_table)
          }
          else {
            savedData.splice(singleData.stepNo - 1, 0, singleData)
            setRawTable(savedData)
          }
        }
        setProductDialog(false);
      }
    }
  }
  const saveDataParam = () => {
    const table = tableAfterOperation
    const UiDataParam = table.map(screenData => {
      screenData.testcases.forEach((testcase, idx) => {
        if (testcase.keywordVal === 'setText') {
          let variables = `${testcase.custname}`
          let originalVal = testcase.inputVal[0]
          testcase.inputVal[0] = `|${testcase.custname}|`
  
  
  
  
        }
  
      })
      return screenData
    })
    console.log(UiDataParam)
    // setTableAfterOperation(table)
    console.log(singleData)
    const originalData = tableAfterOperation
    let objIndex = tableAfterOperation.findIndex(testCase => testCase.name === selectedScreen.name)
    const firstSteps = tableAfterOperation[0].testcases
    const lastStep = originalData[originalData.length - 1].testcases
    const newDataParamTableStart = [singleData, startLoop, ...firstSteps]
    const newDataParamTableEnd = [...lastStep, endLoop]
    originalData[0].testcases = newDataParamTableStart
    if (originalData.length === 1) {
      originalData[0].testcases = [...newDataParamTableStart, endLoop]
      originalData[0].testcases.forEach((testcase, idx) => testcase.stepNo = idx + 1)
    } else {
      originalData[originalData.length - 1].testcases = newDataParamTableEnd;
      originalData[originalData.length - 1].testcases.forEach((testcase, idx) => testcase.stepNo = idx + 1)
    }
    originalData[0].testcases.forEach((testcase, idx) => testcase.stepNo = idx + 1) 
    allScreenData[selectedScreen.name]["testcases"] = originalData[objIndex].testcases;
    setTableAfterOperation(originalData)
  
    setDataParamUrl(false)
  }
  const onInputNumberChange = (e, name) => {
    const val = e.value || 0;
    let _tableSingleData = { ...singleData };
    _tableSingleData[`${name}`] = val;

    setSingleData(_tableSingleData);
  }
  const onCustChange = (e, name) => {
    const val = e.value;
    if (editableCondition) {
      setKeywordList(getKeywordList(val, projectData, "SAP")["keywords"])
      setSingleData({ ...singleData, [name]: val, objectName: custval.objectName, url: custval.url, tempOrderId: custval.tempOrderId })
    }
  }
  const onKeywordChange = (e, name) => {
    const val = e.value || 'navigateToUrl';
    let _tableSingleData = { ...singleData };
    _tableSingleData[`${name}`] = val;
    setSingleData(_tableSingleData);
  }
  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _tableSingleData = { ...singleData };
    if (typeof _tableSingleData[`${name}`] === "object") {
      _tableSingleData[`${name}`] = [val];
    } else {
      _tableSingleData[`${name}`] = val;
    }
    setSingleData(_tableSingleData);
  }
  let editableCondition = !edit || ["@Generic", "@Browser", "@System", "@BrowserPopUp", "@Window", "@Oebs", "@Custom", "@Object", "@Email", "@Mobile", "@Action", "@Android_Custom", "@CustomiOS", "@MobileiOS", "@Sap", "@Excel", "@Word", "Mainframe List", "WebService List"].includes(singleData.custname)

  const productDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog}/>
      <Button label="Save" icon="pi pi-check" className="p-button-text"  onClick={saveProduct}/>
    </React.Fragment>
  );

  const deleteProductDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductDialog} />
      <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={closeApp ? '' : deleteProduct} />
    </React.Fragment>
  );

  const dataParamDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialogScreen} />
      <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveDataParam} />
    </React.Fragment>
  );


  let menuModel = [
    { label: 'Copy', icon: 'pi pi-fw pi-copy', command: () => copyData(selectedRow) },
    { label: 'Paste', icon: 'pi pi-fw pi-file', command: () => { setCreateNewIndex(step); pasteData() } },
    {seperator:true},
    { label: 'Edit Test Step', icon: 'pi pi-fw pi-pencil', command: () => { editProduct(selectedRow); setInsert(false); console.log(selectedRow) } },
    { label: 'Delete Test Step', icon: 'pi pi-fw pi-trash', command: () => confirmDeleteProduct(selectedRow) },
    {seperator:true},
    { label: 'Insert Test Step Above', icon: 'pi pi-fw pi-arrow-up', command: () => { setInsert(true); setInsertAbove(true); setInsertBelow(false); openNew(); setStepAbove(selectedRow.stepNo - 1); setSelectedRow(selectedRow); setCreateNewIndex(step - 1); setInsertAtStep(false) } },
    { label: 'Insert Test Step Below', icon: 'pi pi-fw pi-arrow-down', command: () => { setInsert(true); setInsertAbove(false); setInsertBelow(true); openNew(); setStepBelow(selectedRow.stepNo + 1); setCreateNewIndex(step + 1); setInsertAtStep(false) } },
    { label: 'Insert at Step No.', icon: 'pi pi-fw pi-plus-circle', command: () => { setInsert(false); openNew(); setInsertAtStep(true) } }
];

  const loadModule = async (modID, projectId) => {
    var req = {
      tab: "tabCreate",
      projectid: projectId,
      version: 0,
      cycId: null,
      moduleid: [modID]
    };
    var moduledata = await getModules(req);
    if (moduledata.error) { displayError(moduledata.error); return; }
    dispatch(selectedModuleReducer(moduledata));
    var screendata = await getScreens(projectId)
    if(screendata.error){displayError(screendata.error);return;}
    dispatch(screenData(screendata));
    dispatch(moduleList(moduledata));
    setMindmapShow(true);
  };

const showSuccess = (success) => {
    props.toastSuccess(success);
//   toast.current.show({severity:'success', summary: 'Success', detail:success, life: 2000});
}

const showInfo = (Info) => {
   props.toastInfo(Info) 
//   toast.current.show({severity:'info', summary: 'Info', detail:Info, life: 3000});
}

const showWarn = (Warn) => {
    props.toastWarn(Warn)
//   toast.current.show({severity:'warn', summary: 'Warning', detail:Warn, life: 3000});
}

const showError = (Error) => {
    props.toastError(Error)
//   toast.current.show({severity:'error', summary: 'Error', detail:Error, life: 5000});
}

const debugTestCases = selectedBrowserType => {
  // setVisibleDependentTestCaseDialog(false);
  let testcaseID = [];
  let browserType = [];
  browserType.push(selectedBrowserType);
  ResetSession.start();
  showInfo('Debug in Progress. Please Wait...')
  DesignApi.getTestcasesByScenarioId_ICE(scenarioChosen.key)
      .then(testCaseData => {
          if (testCaseData === "Invalid Session") return;
          else {
              for (let i = 0; i < testCaseData.length; i++) {
                testcaseID.push(testCaseData[i].testcaseId)
              }
              console.log(testcaseID);
              DesignApi.debugTestCase_ICE(browserType, testcaseID, userInfo, 'SAP')
                  .then(debugData => {
                      setOverlay("");
                      ResetSession.end();
                      if (debugData === "Invalid Session") return ;
                      else if (debugData === "unavailableLocalServer")  showInfo(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.CONTENT)
                      else if (debugData === "success") showSuccess(MSG.DESIGN.SUCC_DEBUG.CONTENT)
                      else if (debugData === "fail") showError(MSG.DESIGN.ERR_DEBUG.CONTENT)
                      else if (debugData === "Terminate") showWarn(MSG.DESIGN.WARN_DEBUG_TERMINATE.CONTENT) 
                      else if (debugData === "browserUnavailable") showWarn(MSG.DESIGN.WARN_UNAVAILABLE_BROWSER.CONTENT)
                      else if (debugData === "scheduleModeOn") showWarn(MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT)
                      else if (debugData === "ExecutionOnlyAllowed")  showWarn(MSG.GENERIC.WARN_EXECUTION_ONLY.CONTENT)
                      else if (debugData.status === "success"){
                        props.toastError(MSG.CUSTOM(MSG.DESIGN.SUCC_DEBUG.CONTENT, "success"));
                      } else {
                        props.toastError(MSG.CUSTOM(MSG.DESIGN.ERR_DEBUG.CONTENT, "error"));
                      }										
                  })
                  .catch(error => {
                      setOverlay("");
                      ResetSession.end();
                      props.toastError(MSG.CUSTOM(MSG.DESIGN.ERR_DEBUG.CONTENT, "error"));
                      console.log("Error while traversing while executing debugTeststeps method! \r\n " + (error.data));
                  });
          }
      })
      .catch(error => {
          setOverlay("");
          ResetSession.end();
          props.toastError(MSG.CUSTOM(MSG.DESIGN.ERR_DEBUG.CONTENT, "error"));
          console.log("Error while traversing while executing debugTeststeps method! \r\n " + (error.data));
      });
};




  const rowexpansion = (data) => {
    console.log(data);
    return (
      <div className="card p-fluid data-table" style={{ width: '100%' }}>
        {/* <ScrollPanel style={{ width: '100%', height: '60vh' }} className="custombar1"> */}
        <DataTable value={data.testcases ? data.testcases : []} scrollable scrollHeight='72vh' editMode="row" dataKey="stepNo" responsiveLayout="scroll" size='small' contextMenuSelection={selectedRow} className="data_table_sap"
        onContextMenuSelectionChange={e => {
          setSelectedRow(e.value);
          setSingleData(e.value)
          setCustValue(e.value)
          setSelectedScreen({ name: data.name, starting_stepNumber: data.starting_stepNumber })
          setStep(e.value.stepNo)
        }}
        onContextMenu={e => { {menu.current.hide(e);cm.current.show(e.originalEvent) }}}
        reorderableRows onRowReorder={onRowReorder}
        selectionMode="single"
        selection={selectedRow}
        onMouseDown={() => {
          setSelectedScreen({ name: data.name, starting_stepNumber: data.starting_stepNumber })
        }}
        onSelectionChange={e => {
          setSelectedRow(e.value);
          setSingleData(e.value);
          setCustValue(e.value)
          setSelectedScreen({ name: data.name, starting_stepNumber: data.starting_stepNumber })
          setStep(e.value.stepNo)
          
          setSelectedScreen({ name: data.name, starting_stepNumber: data.starting_stepNumber })
        }}
          footer={` Test Steps count : ${data.testcases.length > 0 ? data.testcases.length : 0}`} style={{ textAlign: 'center' }}
        >

          <Column rowReorder headerStyle={{ justifyContent: "center", backgroundColor: ' #74737f', color: '#fff', width: '10%', minWidth: '4rem', borderTopLeftRadius: '8px' }} style={{  paddingLeft: '0.8rem', paddingRight: '0.8rem' }} />
          {/* <Column headerStyle={{ backgroundColor: ' #74737f', color: '#fff', width: '10%', minWidth: '4rem',flexGrow:'0.2'}}  editor={(options) => textEditor(options)} header="Step" bodyStyle={{ textAlign: 'center' ,flexGrow:'0.2'}} field="stepNo"  style={{ width: '20%',overflowWrap: 'anywhere',paddingLeft:'0.8rem',paddingRight:'0.8rem' }} onCellEditComplete={onCellEditComplete}></Column> */}
          <Column headerStyle={{ justifyContent: "center", backgroundColor: ' #74737f', color: '#fff', width: '10%', minWidth: '4rem' }} header="Step" bodyStyle={{ textAlign: 'center' }} field="stepNo" style={{ minWidth: '4rem', width: '28%', overflowWrap: 'anywhere', paddingLeft: '0.8rem', paddingRight: '0.8rem' }} ></Column>
          {/* <Column  headerStyle={{ backgroundColor: ' #74737f', color: '#fff'}} header="Object Property" body={actionIconTemplate}  exportable={false} style={{ minWidth: '8rem' }}></Column> */}
          <Column headerStyle={{ justifyContent: "center", backgroundColor: ' #74737f', color: '#fff' }} body={ActionIconTemplate} header="Element Name" style={{ width: '13%', overflowWrap: 'anywhere', justifyContent: 'space-between' }}></Column>
          <Column headerStyle={{ justifyContent: "center", backgroundColor: ' #74737f', color: '#fff', width: '100px' }} field="keywordVal" header="Keyword" style={{ width: '30%', overflowWrap: 'anywhere', justifyContent: 'flex-start' }}></Column>
          <Column headerStyle={{ justifyContent: "center", backgroundColor: ' #74737f', color: '#fff' }} field="inputVal" header="Test Data" style={{  }} className='Testdata'></Column>
          {/* <Column headerStyle={{ backgroundColor: ' #74737f', color: '#fff' }} field="outputVal" header="Output Data" editor={(options) => textEditor(options)} style={{ width: '20%', overflowWrap: 'anywhere' }}></Column> */}
          {/* <Column rowEditor headerStyle={{ width: '10%', minWidth: '4rem', backgroundColor: ' #74737f', backgroundColor: ' #74737f',flexGrow:'0.2' }} bodyStyle={{ textAlign: 'center' ,flexGrow:'0.2'}}></Column> */}
          <Column headerStyle={{ justifyContent: "center", width: '10%', minWidth: '4rem', backgroundColor: ' #74737f', backgroundColor: ' #74737f', borderTopRightRadius: '8px' }} body={actionBodyTemplate} bodyStyle={{ textAlign: 'center', minWidth: '4rem' }} exportable={false} style={{ minWidth: '8rem' }}></Column>

        </DataTable>
        {/* </ScrollPanel> */}


        {/* POC  */}
      </div>
    )
  }
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <span style={ { fontSize: '14px', opacity: '0.4' } } onClick={(event) => {  menu.current.toggle(event) }} aria-controls="popup_menu" aria-haspopup><i className='pi pi-ellipsis-v' style={{ fontSize: '14px' }} ></i></span>
      </React.Fragment>
    );
  }
  const items = [
    {label: 'Project Details', disabled:true },
    {label: 'Record TestCases', disabled:true},
    {label: 'Preview TestCase', disabled:true }   
];
{card && <div className="" ref={popupref} style={{
  zIndex: '10', backgroundColor: '#fff', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', width: '480px', position: 'absolute', left: `2rem`, top: `${location.bottom - 10}px`, border: 'gray'

}} onMouseEnter={() => setCard(true)} onMouseLeave={() => setCard(false)}>
  <div className="row2">
    <div className="column2" style={{ backgroundColor: 'gray', height: '33px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }} >
      <h3 style={{ color: '#fff', fontSize: '20px', marginTop: '5px', fontWeight: '400', marginLeft: '-79px' }}>Attribute</h3>
      <h3 style={{ color: '#fff', fontSize: '20px', marginTop: '5px', fontWeight: '400', marginRight: '93px' }}>Value</h3>

    </div>
    <Divider style={{ margin: '0' }} />
    <div className="column2" >
      <p style={{ marginLeft: '-26px' }}>Tag</p>
      <Divider layout="vertical" style={{ position: 'inherit' }} />
      <p style={{ overflowWrap: 'anywhere', width: '42%', marginLeft: '10px' }}>{popupData[0].custname}</p>
    </div>
    <Divider style={{ margin: '0' }} />
    <div className="column2" >
      <p style={{ marginLeft: '-25px' }}>Id</p>
      <Divider layout="vertical" style={{ position: 'inherit' }} />
      <p style={{ overflowWrap: 'anywhere', width: '42%' }}>{popupData[0].keywordVal}</p>
    </div>
    <Divider style={{ margin: '0' }} />
    <div className="column2" >
      <p style={{ marginLeft: '-26px' }}>X-path</p>
      <Divider layout="vertical" style={{ position: 'inherit' }} />
      <p style={{ overflowWrap: 'anywhere', width: '42%', height: 'auto' }} ref={textRef} onMouseEnter={() => setShowFullXpath(true)} onMouseLeave={() => setShowFullXpath(false)}>{popupData[0].xpath.trim().length !== 0 ? (popupData[0].xpath.trim().length > 10 && !showFullXpath ? popupData[0].xpath.trim().substring(0, 20) + "..." : popupData[0].xpath.trim()) : 'Not Found'}</p>
    </div>
    <Divider style={{ margin: '0' }} />
  </div>
  {/* <DataTable value={popupData}   style={{margin:'2px'}}showGridlines responsiveLayout="scroll">
            <Column field="custname" header="Object Name"></Column>
            <Column field="objectName" header="Xpath" style={{overflowWrap: 'anywhere' }}></Column>
            </DataTable> */}
</div>
}

  
  return (
    <>
    <div className="plugin-bg-container">
      {!errorMessage?<>
        <ConfirmDialog 
      visible={visibleScenario ||visibleReset} 
      onHide={() =>{visibleScenario? setVisibleScenario(false):setVisibleReset(false)}} message={visibleScenario?"Recording this scenarios with Avo Genius will override the current scenario. Do you wish to proceed?":"All the entered data will be cleared."}
      header={visibleScenario?"Override Scenario":"Reset Confirmation"} 
      icon="pi pi-exclamation-triangle"  
      acceptClassName="p-button-rounded"
      rejectClassName="p-button-rounded"
      style={{maxWidth:'60vw'}}
      accept={()=>{visibleScenario?setSelectedScenario(scenarioChosen): resetFields()}} 
      reject={()=>{}} 
      />
      {moduleSelect !== undefined && Object.keys(moduleSelect).length !== 0 && showMindmap && <GeniusMindmap gen={!showMindmap} displayError={displayError} setBlockui={setBlockui} moduleSelect={moduleSelect} verticalLayout={true} setDelSnrWarnPop={() => { }} hideMindmap={() => setShowMindmap(false)}/>}
      {loading ? <ScreenOverlay content={loading} /> : null}
      <div className='create_testsuite'>
      <Dialog className='create_testsuite' header={'Create Test Suite'} visible={displayCreateModule} style={{ fontFamily: 'LatoWeb', fontSize: '16px',height: '40vh',width: '25vw'}} 
      onHide={() => { setModuleName(""); setDisplayCreateModule(false); }}
      >
        <div style={{padding:'1.5rem'}}>
          <div className='dialog__child'>
          <InputText 
            required
            id="username" 
            placeholder={`Test Suite`}
            style={{width:'100%'}}
            onChange={(e) => setModuleName(e.target.value)}
            />
          </div>
          <div className='dialog__child' style={{ justifyContent: "flex-end", marginBottom: 0 }}>
            <Button   onClick={handleModuleCreate}
            >{'Create'}</Button>
          </div>
        </div>
      </Dialog>
      </div>
      <div className='create_testcase'>
      <Dialog  className='create_testcase' header={'Create Test case'} visible={displayCreateScenario} style={{ fontFamily: 'LatoWeb', fontSize: '16px',height: '40vh',width: '25vw'}} onHide={() => { setScenarioName(""); setDisplayCreateScenario(false); }}
      >
        <div style={{padding:'1.5rem'}}>
          <div className='dialog__child'>
          <InputText 
            required
            id="username" 
            placeholder={`Test case`}
            style={{width:'100%'}}
            onChange={(e) => setScenarioName(e.target.value)}
            />
          </div>
          <div className='dialog__child' style={{ justifyContent: "flex-end", marginBottom: 0 }}>
            <Button  
            onClick={handleScenarioCreate}
            >{'Create'}</Button>
          </div>
        </div>
      </Dialog>
      </div>
      <div className='plugin-elements'>
        

      <Dialog visible={productDialog} style={{ width: '450px' }} header={edit ? "Edit Test Step" : "Add New Test Step"} modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
          <div className="field">
            <label htmlFor="stepNo">Step No.</label>
            <InputNumber  id="stepNo" disabled={insertAtStep ? false : true} value={edit ? singleData.stepNo : insert ? (insertAbove ? stepNoAbove : stepNoBelow) : insertAtStep ? '' : createNewIndex} onValueChange={(e) => onInputNumberChange(e, 'stepNo')} integeronly />
            {submitted && !singleData.custname && <small className="p-error">Object Name is required.</small>}
          </div>
          <div className="field">
            <label htmlFor="custname">Object Name</label>
            <Dropdown editable={editableCondition ? false : true} onBlurCapture={(e) => {
              if (!editableCondition) {
                setSingleData({
                  ...singleData, 'custname': (e.target.value ? (e.target.value.includes("_" + singleData.custname.split("_")[1]) ? e.target.value : e.target.value + "_" + singleData.custname.split("_")[1]) : singleData.custname)
                })
                return
              }
            }} value={singleData.custname} options={
              // statuses
              productDialog ? getObjNameList("SAP", tableDataNew ? tableDataNew.filter(obj => obj.name === selectedScreen.name)?.[0]?.["data_objects"] : tableDataNew.filter(obj => obj.name === selectedScreen.name)?.[0]?.["data_objects"]) : []
            } onChange={(e) => onCustChange(e, 'custname')} placeholder="Select an Object" />

            {/* <InputText id="custname" value={product.custname} onChange={(e) => onInputChange(e, 'custname')} required autoFocus className={classNames({ 'p-invalid': submitted && !singleData.custname })} />
                    {submitted && !singleData.custname && <small className="p-error">Object Name is required.</small>} */}
          </div>
          <div className="field">
            <label htmlFor="keywordVal">Keyword</label>
            <Dropdown value={singleData.keywordVal} options={keywordList} onChange={(e) => onKeywordChange(e, 'keywordVal')} placeholder="Select a keyword" />
            {/* <InputText id="keywordVal" value={product.keywordVal} options={returnKeyword} onChange={(e) => onInputChange(e, 'keywordVal')} required autoFocus className={classNames({ 'p-invalid': submitted && !singleData.custname })} /> */}
            {/* {submitted && !singleData.keywordVal && <small className="p-error">Keyword is required.</small>} */}
          </div>

          <div className="field">
            <label htmlFor="inputVal">Captured Data</label>
            <InputText id="inputVal" value={singleData.inputVal} onChange={(e) => { onInputChange(e, 'inputVal'); }} required autoFocus className={classNames({ 'p-invalid': submitted && !singleData.custname })} />
            {submitted && !singleData.inputVal && <small className="p-error">Keyword is required.</small>}
          </div>


        </Dialog>

        <Dialog visible={screenDialog} style={{ width: '450px' }} header={"Edit Screen"} modal className="p-fluid" footer={screenDialogFooter} onHide={hideDialogScreen}>
          <div className="field">
            <label htmlFor="Screen">Screen</label>
            <InputText value={singleData.name} onChange={(e) => onScreenNameChange(e, 'name')} />
          </div>
        </Dialog>

        <Dialog visible={dataParamUrl} style={{ width: '450px' }} header={"Update the Test Data spread sheet as per your need."} modal className="p-fluid" footer={dataParamDialogFooter} onHide={hideDialogScreen}>
         
         <div className="field">
          
           <p style={{fontSize:'13px'}}><b>Note:</b>You can find Test Data spread sheet (Genius_TestData_{"<<"}Test Scenario {">>"} .xlsx) in downloads folder. </p>
           <label htmlFor="Screen">Excel Path: </label>
           <InputText value={DataParamPath} onChange={(e) => onDataParamUrl(e, 'inputVal')} placeholder="Provide Test Data spread sheet path."/>
           {/* {submitted && !singleData.custname && <small className="p-error">Object Name is required.</small>} */}
         </div>
       </Dialog>

          <Dialog visible={deleteProductDialog || closeApp} style={{ width: '50vw' }} header="Confirm"

            modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              {product && <span>{closeApp ? 'Are you sure you want to close Genius?' : 'Are you sure you want to delete the selected step?'}</span>}
            </div>
          </Dialog>
       
     

      <div className="card">
        <TabMenu model={items}  style={{display:'flex', justifyContent:'center'}}/>
    </div>
    

       
        <div style={{
          display: "flex",
          flexDirection: 'row',
          margin: 10,
          marginLeft: "1.5rem",
          marginTop:'53px',
          gap: 50
        }}>
          <div style={{ position: "relative" ,display:'flex',flexDirection:'column'}}>
            <div style={{ display: 'flex',justifyContent: 'space-between',color: 'rgb(95, 51, 143)'}} >
            <div> <label className="label_genius"  htmlFor="project">Project</label></div>
             {/* <div style={{ display:'flex',justifyContent:'end',color: "#5F338F", cursor: "pointer" }} 
            >Create Project</div> */}
            </div>
           
            
            <Dropdown
         value={selectedProject ? selectedProject : null}
         options={
           Object.values(allProjects).filter(proj=>proj.apptypeName==="SAP").map((proj) => {
             return {
               key: proj.id,
               text: proj.name
             }
           })
         }
         onBlur={() => setTouched(true)}
         onChange={(e) => {
           setSelectedProject(e.value)
           setScenarioName('')
           setModuleName('')  
                         }} 
        optionLabel="text"
        placeholder="Select" 
        style={{width:'18.75rem',height:'3rem'}}
      />
        <div className="validation_container">
          <small className={touched && !selectedProject ? "txt_invalid" : "txt_valid"}>
            Project is required.
          </small>
          </div>
          {/* <Button  onClick={() => { setDisplayCreateModule(true); }} icon="pi pi-plus" style={{position:'fixed', left:'60rem',top:'17.5rem'}} /> */}
          {/* <Button icon="pi pi-plus"  onClick={() => { setDisplayCreateScenario(true) }} style={{position:'fixed', left:'87rem',top:'17.5rem'}} /> */}
          </div>
          

          <div style={{ display:'flex',flexDirection:'column' }}>
          {/* <div style={{ display: 'flex',justifyContent: 'space-between',color: 'rgb(95, 51, 143)'}} > */}
                <div style={{display:'flex',alignItems:'start'}}> 
                  <label className="label_genius" htmlFor="project">Test Suite</label>
                  <img src="static/imgs/Required.svg" className="required_icon" style={{paddingTop:'10px'}}/>
                </div>
            <div style={{display:'flex'}}>
              
              {/* <div style={{  display:'flex',justifyContent:'end', color: "#5F338F", cursor: "pointer" }}></div><div className="create__button" style={{  display:'flex',justifyContent:'end', color: "#5F338F", cursor: "pointer" }} data-attribute={!(selectedProject && selectedProject.key) ? "disabled" : ""} onClick={() => { setDisplayCreateModule(true); }}></div><div style={{  display:'flex',justifyContent:'end', color: "#5F338F", cursor: "pointer" }}></div> */}
              {/* <div className="create__button" style={{  display:'flex',justifyContent:'end', color: "#5F338F", cursor: "pointer" }} 
              ></div><div style={{  display:'flex',justifyContent:'end', color: "#5F338F", cursor: "pointer" }}></div>
              </div> */}
    
              <Dropdown 
              
              value={selectedModule ? selectedModule : null}
              options={projModules.map((mod) => {
                return {
                  key: mod._id,
                  text: mod.name
                }
              })}
              onBlur={() => setTouched(true)}
              onChange={(e) => {
              
                setSelectedModule(e.value)
                
              }}
              optionLabel="text"
              placeholder="Select" 
              style={{width:'18.75rem',height:'3rem',marginRight:'10px'}}
              />
              <Button  onClick={() => { setDisplayCreateModule(true); }} icon="pi pi-plus" />

            </div>
                <div className="validation_container" style={{marginLeft:'1rem'}}>
                  {touched && !selectedModule && <small className={touched && !selectedModule ? "txt_invalid" : "txt_valid"}>
                    Test Suite is required.
                  </small>}
                </div>
          </div>

          <div style={{ position: "relative" ,display:'flex',flexDirection:'column' }}>
          <div style={{ display: 'flex',justifyContent: 'space-between',color: 'rgb(95, 51, 143)'}} >
          <div style={{display:'flex',alignItems:'start'}}> 
                  <label className="label_genius" htmlFor="project">Test Case</label>
                  <img src="static/imgs/Required.svg" className="required_icon" style={{paddingTop:'10px'}}/>
          </div>
            <div style={{  display:'flex',justifyContent:'end', color: "#5F338F", cursor: "pointer" }}></div><div className="create__button" data-attribute={!(selectedModule && selectedModule.key) ? "disabled" : ""} style={{  display:'flex',justifyContent:'end', color: "#5F338F", cursor: "pointer" }}
            //  onClick={() => { setDisplayCreateScenario(true) }}
             ></div><div style={{  display:'flex',justifyContent:'end', color: "#5F338F", cursor: "pointer" }}></div>
            </div>
            <div>
              <Dropdown 
              value={scenarioChosen ? scenarioChosen : null}
              options={modScenarios.map((scenario) => {
                return {
                  key: scenario._id,
                  text: scenario.name
                }
              })}
              onChange={(e) => {
                setScenarioChosen(e.value)
                setVisibleScenario(true)
                setVisibleReset(false)
          
              
              }}
              optionLabel="text"
              placeholder="Select" 
              style={{width:'18.75rem',height:'3rem',marginRight:'10px'}} 
              //  disabled={!(selectedModule && selectedModule.key) || props.selectedModule}
              />
                <Button icon="pi pi-plus"  onClick={() => { setDisplayCreateScenario(true) }} s />
            </div>
             
             <div className="validation_container">
          {touched && !scenarioChosen &&<small className={touched && !scenarioChosen ? "txt_invalid" : "txt_valid"} style={{marginLeft:'1rem'}}>
            Test Case is required.
          </small>}
        </div>
          </div>

        </div>

        <div style={{
          display: "flex",
          flexDirection: 'row',
          margin: "42px 14px 1rem 10px",
          marginLeft: "1.5rem",
          gap: 50
        }}>
          <div>
          </div>
          <div style={{display:'flex',flexDirection:'column'}}>
          <label htmlFor="url" className='label_genius' style={{right:'2.5rem',position:'relative'}}>Application path
            <img src="static/imgs/Required.svg" className="required_icon" style={{marginBottom:'0.5rem'}}/></label>
            <InputText 
            id="username" 
            value={applicationPath} 
            onBlur={() => setTouched(true)}
            onChange={(e) => { setApplicationPath(e.target.value) }}
            placeholder="Eg:C:\Program Files (x86)\SAP\FrontEnd\SapGui\saplogon.exe;SAP Logon 760;SAP HANA"
            // disabled={userInfo.isTrial?true:false}
            // className='input_url'
            style={{width:'73rem',right:'3rem',position:'relative'}}

            />
                <div className="validation_container">
              { touched && !applicationPath &&     <small className={touched && !applicationPath ? "txt_invalid" : "txt_valid"}>
                Application Path is required.
                </small>}
        </div>
          </div>
         
        </div>


       <div>
       </div>
        <div className="genius__footer" style={{position: 'absolute',bottom: '10px',left: '-1rem'}}>
             
         <div style={{marginLeft:'1rem',fontFamily:"Mulish", fontWeight:"600" }}><span style={{ margin: "1.5rem 1rem 1rem 1rem"}}>
        
        {/* <h5 style={{color:"#343A40",fontSize:'18px'}}><b>NOTE: </b> Click <a style={{color:"#9678b8", textDecoration:"underline"}} href='https://chrome.google.com/webstore/detail/bcdklcknooclndglabfjppeeomefcjof/' target={"_blank"} referrerPolicy={"no-referrer"}>here</a> to install Avo Genius extension.</h5> */}
         <h5 style={{color:"#343A40",fontSize:'18px'}}><i></i></h5>
        
      
        </span>
          </div>
            <div className="genius__actionButtons" style={{ display: "flex", justifyContent: "space-between", margin: "2rem 1rem 1rem 1rem", alignItems: "center" }}>
            {/* <div onClick={() => { window.localStorage['navigateScreen'] = "plugin"; history.replace('/plugin'); }} className="exit-action" style={{ color: "#5F338F", textDecoration: "none", fontSize: "1.2rem", cursor: "pointer" }}>EXIT</div> */}
            <div className="reminder__container" style={{ display: "flex", margin: "0px 1rem" }}><span className='asterisk' style={{ color: "red" }}>*</span>All the fields are Mandatory.</div>
            <div className="actionButton__inner" style={{ display: "flex", gap: 10 }}>
              {props.selectedProject?null:<button className="reset-action__exit" style={{ border: "none", color: "#605BFF", borderRadius: "4px", padding: "8px 25px", background: "white" }}
               onClick={resetGeniusFields}
               >Reset</button>}
              <button className="reset-action__next" disabled={!(selectedProject && selectedProject.key) || !(selectedModule && selectedModule.key) || !(scenarioChosen && scenarioChosen.key) || !applicationPath}
                style={{ color: "white", borderRadius: "4px", width:'5rem',padding: "8px 25px", background: "#605BFF",border:'none' }} onClick={(e) => {
                  DesignApi.getKeywordDetails_ICE(appType.text)
                    .then(keywordData => {
                      if (keywordData === "Invalid Session") return RedirectPage(history);
                      setProjectData(keywordData);
                      setActiveIndex(1);
                      showDialog()
                    })
                  
                    .catch((err) => { console.log("error"); setLoading(false); })
                }
                }>
                Next
              </button>
              <Dialog visible={visible} style={{ width: '50vw', height:'50vw', right: '0',position:'fixed',  overflowY: 'hidden !important'}} className='genius_sap' onHide={onHideSap} header="AVO Genius for SAP" >
              <div className="App">
            <TabMenu model={items} activeIndex={activeIndex}style={{display:'flex', justifyContent:'center'}}></TabMenu>
            <Menu model={menuModel} popup ref={menu} id="popup_menu" onHide={() => setSelectedRow(null)}/>
            <ContextMenu model={menuModel}  ref={cm}  onHide={() => setSelectedRow(null)} />

            </div>

            <Dialog visible={eraseData} style={{ width: '50vw', zIndex: '1500' }} header="Confirm"
        modal footer={eraseFooter} onHide={hideEraseData}>
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {<span>Are you sure you want Erase complete data ?</span>}
        </div>
      </Dialog>

            <div className='data-table'>
              <div className="datatable-editing-demo">
                <div className="datatable-rowexpansion-demo">   
                <div className="card">
              <DataTable
                value={tableDataNew} 
                scrollable scrollHeight='72vh'
                responsiveLayout="scroll"
                dataKey="name" 
                id="parentTable"
                size='small'
                selectionMode="single"
                expandedRows={expandedRows}
                rowExpansionTemplate={rowexpansion}
                onRowToggle={(e) => {  setExpandedRows(e.data); }}
                onSelectionChange={e => { setSelectedRow(e.value); setSingleData(e.value); setSelectedScreen({ name: e.value.name }) }}
              >

              <Column expander headerStyle={{ justifyContent: "center", backgroundColor: ' #74737f', color: '#fff', width: '10%', minWidth: '4rem', flexGrow: '0.2', borderTopLeftRadius: '8px' }} style={{ flexGrow: '0.2', paddingLeft: '0.8rem', paddingRight: '0.8rem', justifyContent: "flex-start" }} />
              {/* <Column expander  headerStyle={{backgroundColor: '#74737f', color: '#fff'}}/> */}
              {/* <Column field="step" header="Step" headerStyle={{ justifyContent: "center", backgroundColor: '#74737f', color: '#fff', width: '13%', minWidth: '4rem', flexGrow: '0.2' }} bodyStyle={{ textAlign: 'center' }} style={{ minWidth: '4rem', width: '20%', overflowWrap: 'anywhere', paddingLeft: '0.8rem', paddingRight: '0.8rem', justifyContent: 'flex-start' }} /> */}
              {/* <Column body={actionScreen} header="Step"  headerStyle={{backgroundColor: '#74737f', color: '#fff'}}/> */}
              <Column body={actionScreen} headerStyle={{ justifyContent: "center", backgroundColor: ' #74737f', color: '#fff', width: '40%', minWidth: '4rem'}} header="Step" bodyStyle={{ textAlign: 'center' }} style={{ minWidth: '4rem', width: '20%', overflowWrap: 'anywhere', paddingLeft: '0.8rem', paddingRight: '0.8rem', justifyContent: 'flex-start' }} ></Column>
              <Column header="Element Name" headerStyle={{ justifyContent: "center", backgroundColor: '#74737f', color: '#fff' }} style={{ width: '20%', overflowWrap: 'anywhere', justifyContent: 'space-between' }} ></Column>
              {/* <Column header="Element Name" headerStyle={{backgroundColor: '#74737f', color: '#fff'}} /> */}
              <Column header="Keyword" headerStyle={{ justifyContent: "center", backgroundColor: '#74737f', color: '#fff', width: '100px' }} style={{ width: '40%', overflowWrap: 'anywhere', justifyContent: 'flex-start' }} ></Column>
              {/* <Column header="Keyword"  headerStyle={{backgroundColor: '#74737f', color: '#fff'}} /> */}
              <Column header="Test Data" headerStyle={{ justifyContent: "center", backgroundColor: '#74737f', color: '#fff' }} style={{ justifyContent: 'flex-start', width: '-40%', overflowWrap: 'anywhere' }} ></Column>
              {/* <Column header="Test Data"  headerStyle={{backgroundColor: '#74737f', color: '#fff'}} /> */}
              <Column headerStyle={{ width: '10%', minWidth: '4rem', backgroundColor: ' #74737f', backgroundColor: ' #74737f', flexGrow: '0.2', borderTopRightRadius: '8px' }} bodyStyle={{ textAlign: 'center', flexGrow: '0.2', minWidth: '4rem' }} exportable={false} style={{ minWidth: '8rem' }}></Column>
              </DataTable>
            </div>
                </div>
              </div>
            </div>
            { startGenius && <Button label={startGenius} style={{right:'0',bottom:'13px',margin:'0 2rem 2rem 0', position:'fixed' }} onClick={handleSAPActivateGenius}/> }
            <div class="icon-bar">
            {/* <ReactTooltip /> */}
          {/* <Button label="Save" icon="pi pi-times" className="p-button-text" onClick={() => {
            port.postMessage({ data: { "module": projectData.module, "project": projectData.project, "scenario": projectData.scenario, "appType": projectData.appType, "screens": tableDataNew } })
          }} /> */}

          <div disabled={tableDataNew.length <= 0} onClick={(e) => { if(tableDataNew.length <= 0) e.preventDefault() }}>
            <span  className={`${tableDataNew.length <= 0  ? "expand-all-disabled": "expand-all"}`} data-tip={"Expand All "} data-pr-position="top" onClick={expand ? () => { setExpandedRows(null); setExpand(false) } : () => { expandAll(); setExpand(true) }} style={{ marginRight: '1rem', position:'absolute', bottom:'1.1rem' }}>   <img src={`static/imgs/${tableDataNew.length <= 0 ? "expand_all_disable" : "expand_all_enable"}.svg`}></img></span>
            {/* <span className= "bottombartooltips" data-pr-tooltip="Collapse All " data-pr-position="top"onClick={() => setExpandedRows(null)}>p<i className='pi pi-chevron-circle-right' style={{ fontSize: '18px' }} ></i></span> */}
          </div> {/** undo the last step */}
          <div disabled={startGenius || dataSaved} className={`${startGenius || dataSaved ? "erase-all-disabled": "erase-all"}`} data-tip={"Erase all data "} Tooltip="eraseall" data-pr-position="top" onClick={(e) => { if(startGenius || dataSaved){ e.preventDefault()} else { seteraseData(true); }}} > {/** erase all data */}
            <span><img src={`static/imgs/${startGenius || dataSaved ? "erase_all_disable" : "erase_all_enable"}.svg`}></img></span> 
          </div>
          <div disabled={dataSaved} className={`${dataSaved  ? "debug-testcase": "debug-testcase-disabled"}`} data-tip={"Run test steps "}  data-pr-position="top" onClick={(e) => { if(!dataSaved) { e.preventDefault() } else { debugTestCases('1') } }}><img src={`static/imgs/${dataSaved ? "preview_testcase_enable" : "preview_testcase_disable"}.svg`}></img></div>  {/** execute the steps */}

            <div disabled={startGenius || dataSaved} className={`${startGenius || dataSaved ? "save-data-disabled": "save-data"}`} data-tip={"Save Data "}  data-pr-position="top" >
              <span onClick={(e) => {if(startGenius || dataSaved) {e.preventDefault()} else {handleSaveMindmap()}}}><img src={`static/imgs/${startGenius || dataSaved ? "save_disable" : "save_enable"}.svg`}></img>
            </span>

          </div>
          <div disabled={dataSaved} className={`${dataSaved ? "show-mindmap": "show-mindmap-disabled"}`} data-tip={"Show Mindmap "} data-pr-position="top" onClick={(e) => { if(!dataSaved) {e.preventDefault()} else { setShowMindmap(true); loadModule(selectedModule.key, selectedProject.key);}}} ><img src={`static/imgs/${dataSaved ? "view_mindmap_enable" : "view_mindmap_disable"}.svg`}></img></div> {/** view the mindmap */}
          <div disabled={startGenius || dataSaved} className={`${(startGenius || dataSaved) ? "data-param-disabled": "data-param"}`} data-tip={"Data Parameterization "} data-pr-position="top" onClick={(e) => {if(startGenius || dataSaved){ e.preventDefault() } else { if (!dataParamUrl) { exportExcel() }; setDataParamPath("") }}}><img src={`static/imgs/${(startGenius || dataSaved) ? "data_param_disable" : "data_param_enable"}.svg`}></img></div>
          {/* <div className="bottombartooltips" data-pr-tooltip={"Minimize"} data-pr-position="top" style={{ border: 'none' }} ></div> * maximize genius window */}
          {/* <div className="bottombartooltips" data-pr-tooltip="Close Genius App " data-pr-position="top" style={{ 'fontSize': '1.7rem', position:'absolute', bottom:'1rem', left:'30rem',cursor:'pointer' }} ><img src='static\imgs\close_icon.svg'></img></div>* close genius window */}
            </div>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
      </>:<>
      <div style={{marginTop:'auto',marginBottom:'auto'}}>
     
      
      {((BrowserName=="Edge ( chromium based)" ||BrowserName=="Chrome") ||  warning )? <h5 style={{marginLeft:'1rem',fontFamily:"Mulish", fontWeight:"600",color:"#343A40",fontSize:'18px' }} >Avo Genius extension not found. Install it from <a style={{color:"#9678b8", textDecoration:"underline"}} href='https://chrome.google.com/webstore/detail/bcdklcknooclndglabfjppeeomefcjof/' target={"_blank"} referrerPolicy={"no-referrer"}>here</a> and re-launch Avo Genius</h5>:<h5 style={{marginLeft:'1rem',fontFamily:"Mulish", fontWeight:"600",color:"#343A40",fontSize:'18px' }} >{`Avo Genius is supported only on Google Chrome and Microsoft Edge.`}</h5>}
      
          </div>
        </>}
    </div>
    </>
  );
};

export default GeniusSap;