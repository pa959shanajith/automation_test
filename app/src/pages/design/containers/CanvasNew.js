import React, { useRef, useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import SearchBox from '../components/SearchBox'
import NavButton from '../components/NavButton'
import Legends from '../components/Legends'
import ControlBox from '../components/ControlBox'
import InputBox from '../components/InputBox' 
import MultiNodeBox from '../components/MultiNodeBox'
import RectangleBox from '../components/RectangleBox'
import SaveMapButton from '../components/SaveMapButton'
import ExportMapButton from '../components/ExportMapButton';
import CaptureModal from '../containers/CaptureScreen';
import DesignModal from '../containers/DesignTestStep';
import {Messages as MSG, ModalContainer, setMsg,ResetSession} from '../../global'
import * as scrapeApi from "../api";
import { v4 as uuid } from 'uuid';
import * as DesignApi from "../api";
import { RedirectPage} from '../../global';
import ScreenOverlayImpact from '../../global/components/ScreenOverlayImpact';
import { useDispatch, useSelector} from 'react-redux';
import {generateTree,toggleNode,moveNodeBegin,moveNodeEnd,createNode,deleteNode,createNewMap} from './MindmapUtils'
import {generateTreeOfView} from './MindmapUtilsForOthersView'
import { ImpactAnalysisScreenLevel ,CompareObj, CompareData,SetOldModuleForReset,setElementRepoModuleID,SetTagTestCases, dontShowFirstModule,selectedModuleReducer} from '../designSlice';
import{ objValue} from '../designSlice';
import '../styles/MindmapCanvas.scss';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from 'primereact/dropdown';
import { highlightScrapElement_ICE,saveTag,getModules } from '../../design/api'
import MapElement from '../components/MapElement';
import { ContextMenu } from 'primereact/contextmenu'
import { AnalyzeScenario, deletedNodes } from '../designSlice';
import { showGenuis } from '../../global/globalSlice';
import { deleteScenario } from '../api';
import { TabView, TabPanel } from 'primereact/tabview';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Tooltip } from 'primereact/tooltip';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import '../styles/ActionPanelObjects.scss'
import { transformDataFromTreetoJourney,createNodeForJourneyView, deleteNodeForJourneyView,moveNodeEndForJourney,moveNodeBeginForJourney, pasteNodeData } from './MindmapUtilsForOthersView';
import DesignTestStepsGroups from './DesignTestStepsGroups';
import { checkRole, roleIdentifiers } from "../../design/components/UtilFunctions";
import { Card } from '@mui/material';
import { AutoComplete } from 'primereact/autocomplete';
import NavigatetoCaptureDesign from './NavigatetoCaptureDesign';

/*Component Canvas
  use: return mindmap on a canvas
*/
var zoom //global var to store zoom
const types = {
    'modules': 112,
    'scenarios': 237,
    'screens': 362,
    'testcases': 487
};
const typesForJourney = {
    'modules': 112,
    'scenarios': 237,
    'teststepsgroups': 487,
  }
var count;
var temp = {
    s: [],
    hidden:[],
    deleted:[],
    t: ""
};
var nodeMoving = false;
export var readCtScale

const CanvasNew = (props) => {
    const dispatch = useDispatch()
    const history = useNavigate();
    const toast = useRef();
    const copyNodes = useSelector(state=>state.design.copyNodes)
    const selectBox = useSelector(state=>state.design.selectBoxState)
    const deletedNoded = useSelector(state=>state.design.deletedNodes)
    const screenData = useSelector(state=>state.design.screenData)
    const objVal=useSelector(state=>state.design.objValue)
    const typeOfView = useSelector(state=>state.design.typeOfViewMap)
    const [sections,setSection] =  useState({});
    const [fetchingDetails,setFetchingDetails] = useState(null); // this can be used for fetching testcase/screen/scenario/module details
    const [fetchingDetailsImpact,setFetchingDetailsImpact]=useState(null)
    const [ctrlBox,setCtrlBox] = useState(false);
    const [taskname, setTaskName] = useState("") 
    const [fetchingDetailsId,setFetchingDetailsId] = useState(null)
    const [inpBox,setInpBox] = useState(false);
    const [multipleNode,setMultipleNode] = useState(false)
    const [ctScale,setCtScale] = useState({})
    const [links,setLinks] = useState({})
    const [nodes,setNodes] = useState({})
    const [dNodes,setdNodes] = useState([])
    const [overlay, setOverlay] = useState(null);
    const [dLinks,setdLinks] = useState([])
    const [delReuseNodes,setDelReuseNodes] = useState([])
    const [createnew,setCreateNew] = useState(false)
    const [reuseDelConfirm,setReuseDelConfirm] = useState(false)
    const [selectedDelNode,setSelectedDelNode] = useState()
    const [DelConfirm,setDelConfirm] = useState(false)
    const [reuseDelContent,setReuseDelContent] = useState()
    const [endToEndDelConfirm,setEndToEndDelConfirm] = useState(false)
    const [verticalLayout,setVerticalLayout] = useState(typeOfView === "mindMapView"?true:false);
    const proj = useSelector(state=>state.design.selectedProj)
    const projectList = useSelector(state=>state.design.projectList)
    const setBlockui=props.setBlockui
    const setDelSnrWarnPop = props.setDelSnrWarnPop
    const displayError = props.displayError
    const CanvasRef = useRef();
    const menuRef_module= useRef(null);
    const menuRef_scenario =useRef(null);
    const menuRef_screen = useRef(null);
    const menuRef_Teststep = useRef(null);
    const menuRef_Teststepgroup=useRef(null);
    readCtScale = () => ctScale
    const [box, setBox] = useState(null);
    const [visibleScenario, setVisibleScenario] = useState(false);
    const[visibleScenarioAnalyze,setVisibleScenarioAnalyze]=useState(false)
    const impactAnalysisScreenLevel = useSelector(state => state.design.impactAnalysisScreenLevel);
    const [visibleScreen, setVisibleScreen] = useState(false);
    const [visibleTestStep, setVisibleTestStep] = useState(false);
    const [addScenario , setAddScenario] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [inputValScreen , setinputValScreen]= useState("");
    const [showInput, setShowInput] = useState(true);
    const [addScreen , setAddScreen] = useState([]);
    const[ showInputScreen , setShowInputScreen]= useState(true);
    const [addTestStep , setAddTestStep] = useState([]);
    const [inputValTestStep , setinputValTestStep]= useState("");
    const[ showInputTestStep , setShowInputTestStep]= useState(true);
    const [selectedRowsScenario, setSelectedRowsScenario] = useState([]);
    const [selectedRowsScreen, setSelectedRowsScreen] = useState([]);
    const [selectedRowsTeststep, setSelectedRowsTeststep] = useState([]);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [editingRows, setEditingRows] = useState({});
    const [editValue, setEditValue] = useState("");
    const [editingRowsScreens, setEditingRowsScreens] = useState({});
    const [editingRowsTestCases, setEditingRowsTestCases] = useState({});
    const [visibleCaptureElement, setVisibleCaptureElement] = useState(false);
    const [visibleDesignStep, setVisibleDesignStep] = useState(false);
    const [visibleDesignStepGroups,setVisibleDesignStepGroups] = useState(false);
    const [selectedSpan, setSelectedSpan] = useState(null);
    const[browserName,setBrowserName]=useState(null)
    const analyzeScenario = useSelector(state=>state.design.analyzeScenario);
    const [checked, setChecked] = useState([]);
    let [scenraioLevelImpactedData,setScenarionLevelImpactedData]=useState(null)
    const[checkedChanged,setCheckedChanged]=useState([])
    const[checkedNewlyElements,setCheckedNewlyElements]=useState([])
    const[checkedNotFound,setCheckedNotFound]=useState([])
    const[deletedElements,setDeletedElements]=useState({visible:false,tab:null})
    const[addedElements,setAddedElements]=useState({visible:false,tab:null})
    const[selectedAction,setSelectedAction]=useState(null)
    const[activeIndex,setActiveIndex]=useState(0)
    const[impactAnalysisDone,setImpactAnalysisDone]=useState({addedElement:false,addedTestStep:false})
    const[testcaseDetailsAfterImpact,setTestCaseDetailsAfterImpact]=useState({})
    const[marqueItem,setMarqueItem]=useState({})
    const[hightlightcustname,setHighlightedCustname]=useState("")
    const [activeEye, setActiveEye] = useState(false);
    const[copyNodeData,setCopyNodeData]=useState([])
    const[orderList,setOrderList]=useState(null)
    const[fetchingDetailsScreen,setFetchingDetailsScreen]=useState(null)
    const[fetchingDetailsForGroup, setFetchingDetailsForGroup] = useState(null);
    const[testSuiteInUse,setTestSuiteInUse]=useState(false);
    const[inputValValid, setInputValValid] = useState(false);
    const NameOfAppType = useSelector((state) => state.landing.defaultSelectProject);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    let Proj = reduxDefaultselectedProject;
    const typesOfAppType = props.appType;
    const appType = typesOfAppType
    const [toastData, setToastData] = useState(false);
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if(!userInfo) userInfo = userInfoFromRedux; 
    else userInfo = userInfo ;
    const[visibleTag,setVisibleTag]=useState(false);
    const [newTag, setNewTag] = useState('');
    const [tags, setTags] = useState({});
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const [visibleCaptureAndDesign,setVisibleCaptureAndDesign] = useState(false);
    const [captureClick, setCaptureClick] = useState(false);
    const [designClick, setDesignClick] = useState(false);
    const [enteredTags, setEnteredTags] = useState([]);
    const [tagAdded, setTagAdded] = useState(false);
    const [saveDisabled, setSaveDisabled] = useState(true);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const currentModId=useSelector(state=>state.design.currentModuleId)

  let projectInfo = JSON.parse(localStorage.getItem('DefaultProject'));
  const projectInfoFromRedux = useSelector((state) => state.landing.defaultSelectProject);
  if (!projectInfo) projectInfo = projectInfoFromRedux;
    
  useEffect(()=>{
    let browserName = (function (agent) {        

      switch (true) {

      case agent.indexOf("edge") > -1: return {name:"chromium",val:8};
      case agent.indexOf("edg/") > -1: return {name:"chromium",val:8};
      case agent.indexOf("chrome") > -1 && !!window.chrome: return {name:"chrome",val:1};
      case agent.indexOf("firefox") > -1: return {name:"mozilla",val:2};
      default: return "other";
   }

    })(window.navigator.userAgent.toLowerCase());

    setBrowserName(browserName.name)
    setSelectedSpan(browserName.val)
  },[])
   useEffect(()=>{
    if(props.module.currentlyInUse!=="" && props.module.currentlyInUse!==undefined && props.module.currentlyInUse!==userInfo.username){
      setTestSuiteInUse(true)
    }
    else{
      setTestSuiteInUse(false)
    }
  })

    useEffect(()=>{
      if(deletedNoded && deletedNoded.length>0){
          var scenarioIds=[]
          var screenIds=[]
          var testcaseIds=[]
          for(let i = 0 ;i<deletedNoded.length; i++){
              if(deletedNoded[i].length>1){
                  if(deletedNoded[i][1]==="scenarios"){
                      scenarioIds.push(deletedNoded[i][0]);                    
                  }
                  if(deletedNoded[i][1]==="screens"){
                      screenIds.push(deletedNoded[i][0]);                    
                  }
                  if(deletedNoded[i][1]==="testcases"){
                      testcaseIds.push(deletedNoded[i][0]);                    
                  }
                  if(deletedNoded[i][1]==="teststepsgroups"){  
                    testcaseIds.push(deletedNoded[i][0]);                    
                }
              }
              
          } 
          (async()=>{
              setBlockui({show:true,content:'Loading ...'})
              var res = await deleteScenario({scenarioIds:scenarioIds,screenIds:screenIds,testcaseIds:testcaseIds})
              if(res.error){displayError(res.error);return;}                
              setDelSnrWarnPop(false)                
              dispatch(deletedNodes([]))
              setBlockui({show:false})
              toast.current.show({severity:"success", summary:"Success", detail:MSG.MINDMAP.SUCC_DELETE_NODE.CONTENT, life:2000})
              setCreateNew('autosave')                             
          })()

      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[deletedNoded]
  )
    useEffect(() => {
        var tree;
        var journey;
       
        if(typeOfView === "mindMapView" ){
          count = {
            'modules': 0,
            'scenarios': 0,
            'screens': 0,
            'testcases': 0
          }
        }else{
          count = {
            'modules': 0,
            'scenarios': 0,
            'teststepsgroups':0
        }
        }
        if (props.module.createnew && verticalLayout===props.verticalLayout) {
            if(props.module.importData){
                var typeo;
                var typen;
                var activeNode=0;
                //setBlockui({show:true,content:'Creating Nodes...'})
                props.module.importData.data.forEach((e,i)=>{
                    if (i === 0) {
                        tree = createNewMap(props.verticalLayout,undefined,e.name,types)
                        tree.links = {}
                        tree.dLinks = []
                        count['modules'] = 1
                        typeo = 1;
                    }else {
                        typen = e.type;
                        if (typen > typeo) {
                            activeNode = tree.dNodes.length - 1;
                        } else if (typen < typeo) {
                            var lvl = typeo - typen;
                            if (lvl === 1) {
                                activeNode = tree.dNodes[tree.dNodes.length - 1].parent.parent.id;
                            }
                            if (lvl === 2) {
                                activeNode = tree.dNodes[tree.dNodes.length - 1].parent.parent.parent.id;
                            }
                        }
                        var res = createNode(activeNode,{...tree.nodes},{...tree.links},[...tree.dNodes],[...tree.dLinks],{...tree.sections},{...count},e.name,verticalLayout)
                        if(res !== undefined){
                          tree.links = res.linkDisplay
                          tree.dLinks = res.dLinks
                          tree.nodes = res.nodeDisplay
                          tree.dNodes = res.dNodes
                          count= {...count,...res.count}
                          typeo = typen;
                        }else{
                          toast.current.show({severity:'error', summary:"Error", detail:"Try to import multi test suite structure", life:5000})
                        }
                       
                    }
                })
                if(props.module.importData.createdby==='pd'|| props.module.importData.createdby==='sel')setCreateNew('save')
            }else{
                //create new mindmap
                tree = createNewMap(props.verticalLayout,undefined,undefined,typeOfView === "mindMapView"?types:typesForJourney)
                tree.links = {}
                tree.dLinks = []
                if(zoom){
                    if(!props.gen){
                        const zoom = d3.zoom();
                        const svg = d3.select(`.mp__canvas_svg`);
                        
                        zoom.scaleTo(svg, 1);
                        zoom.translateTo(svg, 0, 0);
                        svg.node().dispatchEvent(new Event("zoom"));   
                    }
                    else{
                        const zoom = d3.zoom();
                        const svg = d3.select(`.mp__canvas_svg_genius`);
                        
                        zoom.scaleTo(svg, 1);
                        zoom.translateTo(svg, 0, 0);
                        svg.node().dispatchEvent(new Event("zoom"));
                    }
                    zoom.on("zoom",null)
                }
                count['modules'] = 1
                setCreateNew(0)
            }
        } else {
            // To load an existing module. Tree has to be loaded. Possible places, module box / switch layout.
            tree = props.module
            if(verticalLayout !== props.verticalLayout && dNodes.length > 0){
                tree = dNodes[0]
            }
            //load mindmap from data
            if(typeOfView === 'mindMapView'){
              tree = generateTree(tree,types,{...count},props.verticalLayout,screenData,props.gen)
              count= {...count,...tree.count}
            }else{
              let number = tree.children.length === 1 && tree.children[0].children.length <= 3?1:tree.children.length> 1 && tree.children.length <= 3 && tree.children[0].children.length<=6?2:3
              journey = transformDataFromTreetoJourney(tree)
              tree = generateTreeOfView(journey,typesForJourney,{...count},props.verticalLayout,screenData,number)
              count= {...count,...tree.count}
            }
           
        }
        // eslint-disable-next-line no-lone-blocks
        {!props.gen?d3.select('.ct-container').attr("transform", "translate(" + tree.translate[0]+','+tree.translate[1] + ")scale(" + 1 + ")"):d3.select('.ct-container-genius').attr("transform", "translate(" + 50+','+tree.translate[1] + ")scale(" + 1 + ")")}
        // d3.select('.ct-container').attr("transform", "translate(" + tree.translate[0]+','+tree.translate[1] + ")scale(" + 1 + ")")
        zoom = bindZoomListner(setCtScale,tree.translate,ctScale,props.gen)
        setLinks(tree.links)
        setdLinks(tree.dLinks)
        setNodes(tree.nodes)
        setdNodes(tree.dNodes)
        setCtScale({x:tree.translate[0],y:tree.translate[1],k:1})
        setSection(tree.sections)
        setVerticalLayout(props.verticalLayout);
        setBlockui({show:false})
        dispatch(SetOldModuleForReset(tree.dNodes[0]._id))
        localStorage.setItem('OldModuleForReset',tree.dNodes[0]._id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.module,props.reload,props.verticalLayout,analyzeScenario,typeOfView,]);
    useEffect(()=>{
        if(createnew === 'save'){
            setCreateNew(false)
        }
        else if(createnew === 'autosave'){
            setCreateNew(false)
        }
        else if(createnew !== false){
            var p = d3.select('#node_' + createnew);
            setCreateNew(false)
            if(p['_groups'][0][0] === null){p = d3.select('#node_' + (createnew - 1))}
            setInpBox(p)
        }
       // eslint-disable-next-line react-hooks/exhaustive-deps
    },[createnew])
    const handleSpanClick = (index) => {
      if (selectedSpan === index) {
        setSelectedSpan(null);
      } else {
        setSelectedSpan(index);
        switch (index) {
          case 1:
            setBrowserName("chrome")
            break;
          case 2:
            setBrowserName("mozilla")
            break;            
          case 8:
            setBrowserName("chromium")
            break;
          default:
            setBrowserName("chrome")
            break;
        }
      }
    };

    const agsLicense = {
      value: userInfo?.licensedetails.AGS === false,
      msg: "You do not have access for Avo Genius"
    }
    const showToast = (severity, summary) => {
      toast.current.show({ severity, summary, life: 3000 });
    };
    useEffect(() => {
      setTagAdded(false);
    }, [visibleTag]);
    
    useEffect(() => {
      const shouldDisableSave = inputValue.trim() !== '' || (!tagAdded && tags[fetchingDetails?._id]?.length === 0) ||!tagAdded;
      setSaveDisabled(shouldDisableSave);
    }, [inputValue, tagAdded, tags, fetchingDetails]);
    
    
      const handleSaveTags = async () => {
        setLoading(true);
        // dispatch(SetTagTestCases(true))
        const filteredTags = tags[fetchingDetails._id].filter(tag => tag !== null && tag !== undefined);
        const data = {
            testscenarioId: fetchingDetails["_id"],
            tag: filteredTags,
        };
        const response = await saveTag(data);
        setLoading(false);
          setNewTag(''); 
          // setTags(tagdata);
          if(response==="pass"){
            setTags(tags)
            toast.current.show({severity:'success', summary: 'Success', detail:"Tag(s) saved.", life: 1000});
          }else{
            setTags('')
            toast.current.show({severity:'error', summary: 'error', detail:"Failed to save tag(s). Please try again.", life: 1000});
          }
          const req = {
            tab: "createTab",
            projectid: proj,
            version: 0,
            cycId: null,
            modName: "",
            moduleid: currentModId
          }
      
          var res = await getModules(req)
          if (res.error) { displayError(res.error); return }
          dispatch(selectedModuleReducer(res))
          setBlockui({ show: false })
          setUnsavedChanges(false); 
          setVisibleTag(false); 
          setTagAdded(false);
          setInputValue('');
          dispatch(dontShowFirstModule(true))
          dispatch(SetTagTestCases(false))
      };
      const handleDialogHide = () => {
        if (unsavedChanges) {
          toast.current.show({severity:'error', summary: 'error', detail:"Please save your changes before closing the dialog.", life: 1000});
        } else {
          setVisibleTag(false);
          setInputValue('');
          setTagAdded(false); 
        }
      };

    const menuItemsModule = [
        { label: `Add ${appType !== "Webservice" ?'Testcase': 'API'}`,icon:<img src="static/imgs/add-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/> , command:()=>{clickAddNode(box.split("node_")[1]);d3.select('#'+box).classed('node-highlight',false)}},
        { label: `Add Multiple ${appType !== "Webservice" ?'Testcases': 'APIs'}`,icon:<img src="static/imgs/addmultiple-icon.png" alt='addmultiple icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>,command: () =>{setAddScenario([{ id: 1, value: inputValue, isEditing: false }]);setShowInput(true);setVisibleScenario(true);d3.select('#'+box).classed('node-highlight',false)}},
        {separator: true},
        { label: 'Rename',icon:<img src="static/imgs/edit-icon.png" alt="rename" style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>,command: ()=>{var p = d3.select('#'+box);setCreateNew(false);setInpBox(p);d3.select('#'+box).classed('node-highlight',false)}},
        // { label: 'Delete',icon:<img src="static/imgs/delete-icon.png" alt="delete" style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />,command:()=>{clickDeleteNode(box);d3.select('#'+box).classed('node-highlight',false)} }

    ];
    const menuItemsScenario = typeOfView !== "mindMapView"?[
        { label: 'Add Test Steps Groups',icon:<img src="static/imgs/add-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command:()=>{clickAddNode(box.split("node_")[1]);d3.select('#'+box).classed('node-highlight',false)}},
        { label: 'Paste Test Steps Groups',icon:<img src="static/imgs/ic-jq-pastesteps.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />, disabled:copyNodeData.length>0?false:true,command: () =>{var p = d3.select('#'+box);handlePasteNodeData(d3.select('#'+box))}},
        {separator: true},
        { label: 'Avo Genius (Smart Recorder)' ,icon:<img src="static/imgs/genius-icon.png" alt="genius" style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, disabled:true,command:()=>{confirm1()},title:(agsLicense.msg)},
        { label: 'Debug',icon:<img src="static/imgs/Execute-icon.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />, disabled:true},
        { label: 'Impact Analysis', icon: <img src="static/imgs/brain.png" alt="execute" style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} />, disabled: ((appType !== "Web") || ((projectInfo && projectInfo?.projectLevelRole && checkRole(roleIdentifiers.QAEngineer, projectInfo.projectLevelRole)))) ?true:false, command:()=>{setVisibleScenarioAnalyze(true);d3.select('#'+box).classed('node-highlight',false)}},
        {label:'Tag a testcase',icon:<img src="static/imgs/tag.svg" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command: () =>{d3.select('#'+box).classed('node-highlight',false);handleTags()}},
        {separator: true},
        { label: 'Rename',icon:<img src="static/imgs/edit-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command: ()=>{var p = d3.select('#'+box);setCreateNew(false);setInpBox(p);d3.select('#'+box).classed('node-highlight',false)} },
        { label: 'Delete',icon:<img src="static/imgs/delete-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} /> ,command:()=>{clickDeleteNode(box);d3.select('#'+box).classed('node-highlight',false)} },
        
    ]:[
      { label: `Add ${appType !== "Webservice" ?'Screen': 'Request'}`,icon:<img src="static/imgs/add-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command:()=>{clickAddNode(box.split("node_")[1]);d3.select('#'+box).classed('node-highlight',false)}},
      { label: `Add Multiple ${appType !== "Webservice" ?'Screens': 'Requests'}`,icon:<img src="static/imgs/addmultiple-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>,command: () =>{setAddScreen([]);setVisibleScreen(true);d3.select('#'+box).classed('node-highlight',false)}},
      {separator: true},
      { label: 'Avo Genius (Smart Recorder)' ,icon:<img src="static/imgs/genius-icon.png" alt="genius" style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, disabled:(appType !== "Web" || agsLicense.value || typeOfView !== "mindMapView"),command:()=>{confirm1()},title:(agsLicense.msg)},
      { label: 'Debug',icon:<img src="static/imgs/Execute-icon.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />, disabled:true},
      { label: 'Impact Analysis ',icon:<img src="static/imgs/brain.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, disabled:appType !== "Web"?true:false, command:()=>{setVisibleScenarioAnalyze(true);d3.select('#'+box).classed('node-highlight',false)}},
      {label:'Tag a testcase',icon:<img src="static/imgs/tag.svg" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, disabled:appType === "Webservice"?true:false, command: () =>{d3.select('#'+box).classed('node-highlight',false);handleTags()}},
      {separator: true},
      { label: 'Rename',icon:<img src="static/imgs/edit-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command: ()=>{var p = d3.select('#'+box);setCreateNew(false);setInpBox(p);d3.select('#'+box).classed('node-highlight',false)} },
      { label: 'Delete',icon:<img src="static/imgs/delete-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} /> ,command:()=>{clickDeleteNode(box);d3.select('#'+box).classed('node-highlight',false)} },
    ];
    const menuItemsScreen = !testSuiteInUse?[
        { label: 'Add Test Steps',icon:<img src="static/imgs/add-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />, command:()=>{clickAddNode(box.split("node_")[1]);d3.select('#'+box).classed('node-highlight',false) }},
        { label: 'Add Multiple Test Steps',icon:<img src="static/imgs/addmultiple-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />,command: () =>{setAddTestStep([]);setVisibleTestStep(true);d3.select('#'+box).classed('node-highlight',false)}},
        {separator: true},
        { label: 'Element Repository',icon:<img src="static/imgs/capture-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, disabled: appType !=="Mainframe"?false:true, command: ()=>handleCapture() },
        { label: 'Debug',icon:<img src="static/imgs/Execute-icon.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }} /> , disabled:true},
        {separator: true},
        { label: 'Rename',icon:<img src="static/imgs/edit-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command: ()=>{var p = d3.select('#'+box);setCreateNew(false);setInpBox(p);d3.select('#'+box).classed('node-highlight',false)} },
        { label: 'Delete',icon:<img src="static/imgs/delete-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />,command: ()=>{clickDeleteNode(box);d3.select('#'+box).classed('node-highlight',false)}  },
      ]:[
        { label: 'Element Repository',icon:<img src="static/imgs/capture-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command: ()=>handleCapture() },
  
      ];
    const menuItemTestStepGroups = !testSuiteInUse? [
        { label: 'Add Test Steps Groups',icon:<img src="static/imgs/add-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />, command:()=>{clickAddNode(box.split("node_")[1]);d3.select('#'+box).classed('node-highlight',false) }},
        { label: 'Copy/Cut Test Steps Groups',icon:<img src="static/imgs/ic-jq-copysteps.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />,command: () =>{handleCopyNodeData()}},
        { label: 'Paste Test Steps Groups',icon:<img src="static/imgs/ic-jq-pastesteps.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />, disabled:copyNodeData.length>0?false:true,command: () =>{var p = d3.select('#'+box);handlePasteNodeData(d3.select('#'+box))}},
        {separator: true},
        { label: 'Design Steps Groups',icon:<img src="static/imgs/design-icon.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />, command: ()=>handleTestStepsGroups() },
        {separator: true},
        { label: 'Debug',icon:<img src="static/imgs/Execute-icon.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }} /> , disabled:true},
        {separator: true},
        { label: 'Rename',icon:<img src="static/imgs/edit-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command: ()=>{var p = d3.select('#'+box);setCreateNew(false);setInpBox(p);d3.select('#'+box).classed('node-highlight',false)} },
        { label: 'Delete',icon:<img src="static/imgs/delete-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />,command: ()=>{clickDeleteNode(box);d3.select('#'+box).classed('node-highlight',false)}  },
      ]:[
        { label: 'Design Steps Groups',icon:<img src="static/imgs/design-icon.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />, command: ()=>handleTestStepsGroups() },
      ]

      const menuItemsTestSteps = !testSuiteInUse?[
        { label: 'Design Test Steps',icon:<img src="static/imgs/design-icon.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />, command: ()=>handleTestSteps() },
        {separator: true},
        { label: 'Rename',icon:<img src="static/imgs/edit-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} /> ,command: ()=>{var p = d3.select('#'+box);setCreateNew(false);setInpBox(p);d3.select('#'+box).classed('node-highlight',false)}},
        { label: 'Delete',icon:<img src="static/imgs/delete-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command: ()=>{clickDeleteNode(box);d3.select('#'+box).classed('node-highlight',false)} }

      ]:[
          { label: 'Design Test Steps',icon:<img src="static/imgs/design-icon.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />, command: ()=>handleTestSteps() },
    
        ]
    const nodeClick=(e)=>{
      d3.select('#'+box).classed('node-highlight',false)
    }
    const handlePasteNodeData = (e) =>{
      var res = pasteNodeData(e,{...nodes},{...links},[...dNodes],[...dLinks],{...sections},{...count},copyNodeData,false)
      // setCreateNew(res.dNodes.length-1)
      setNodes(res.nodeDisplay)
      setLinks(res.linkDisplay)
      setdLinks(res.dLinks)
      setdNodes(res.dNodes)
      count= {...count,...res.count}
      setCopyNodeData([])
    }
    const handleCopyNodeData = () =>{
      if (toastData !== true){
        setCopyNodeData([fetchingDetailsForGroup]);
        d3.select('#'+box).classed('node-highlight',false)
      }else{
        toast.current.show({severity:'error', summary:'Error', detail:"Save Mindmap before proceeding", life:2000})
      }
    }
    const handleCapture = () =>{
      if (toastData !== true){
        setVisibleCaptureAndDesign(true);
        setCaptureClick(true);
        d3.select('#'+box).classed('node-highlight',false)
      }else{
        toast.current.show({severity:'error', summary:'Error', detail:"Save Mindmap before proceeding", life:2000})
      }
    }
    const handleTestStepsGroups = () =>{
      if (toastData !== true){
        setVisibleDesignStepGroups(true);
        d3.select('#'+box).classed('node-highlight',false)
      }else{
        toast.current.show({severity:'error', summary:'Error', detail:"Save Mindmap before proceeding", life:2000})
      }
    }
    const handleTestSteps = () => {
      if (toastData !== true){
        setVisibleCaptureAndDesign(true);
        setDesignClick(true);
        d3.select('#'+box).classed('node-highlight',false)
      }else{
        toast.current.show({severity:'error', summary:'Error', detail:"Save Mindmap before proceeding", life:2000})
      }
    }

    const handleInputTagChange = (e) => {
      setInputValue(e.target.value);
      setSuggestions(alltag.filter(tag => tag.toLowerCase().includes(e.target.value.toLowerCase())));
      setShowSuggestions(true);
      setUnsavedChanges(true);
    };
    const handleSuggestionSelect = (e) => {
      setInputValue(e.value);
      setShowSuggestions(false);
      setTagAdded(true);
    };
  
 
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
      setTagAdded(true);
    }
  };
  const handleAddTag = () => {
    if (inputValue.trim() !== '') {
      const updatedTags = [...tags[fetchingDetails._id], inputValue];
     
      if (tags[fetchingDetails._id].includes(inputValue)) {
        showToast('error', 'Tag already exists');
      } else {
        setEnteredTags([...enteredTags, inputValue]);
        setTags({ ...tags, [fetchingDetails._id]: updatedTags });
        for (let i = 0; i < dNodes[0].children.length; i++) {
          if (dNodes[0].children[i]._id === fetchingDetails._id) {
            const data = { ...dNodes[0].children[i], tag: updatedTags };
            dNodes[0].children[i] = data; 
          }
        }
        setInputValue('');
        setTagAdded(true);
      }
    }
  };
 
  const handleRemoveTag = (indexToRemove) => {
    const updatedTags = tags[fetchingDetails._id].filter((_, index) => index !== indexToRemove);
  setTags({ ...tags, [fetchingDetails._id]: updatedTags });
  setTagAdded(true);
  setUnsavedChanges(true);
    for (let i = 0; i < dNodes[0].children.length; i++) {
          if (dNodes[0].children[i]._id === fetchingDetails._id) {
            const data = { ...dNodes[0].children[i], tag: updatedTags };
            dNodes[0].children[i] = data; 
          }
        }
        toast.current.show({severity:'success', summary: 'Success', detail:"tag removed.", life: 1000});
  };  

  const renderTags = () => {
    return (
      <div >
        {tags[fetchingDetails._id].map((tag, index) => (
          <div key={index} className="chiptag">
            {tag}
            <button
             className="closebutton"
              onClick={() => handleRemoveTag(index)}
            >
              &#10006;
            </button>
          </div>
        ))}
      </div>
    );
  };
 
  useEffect(() => {
    if (fetchingDetails && fetchingDetails.parent && fetchingDetails.parent.children) {
      const tagData = {};
      fetchingDetails.parent.children.forEach((testCase) => {
        tagData[testCase._id] = testCase.tag || [];
      });
      setTags(tagData);
    }
  }, [fetchingDetails]);
  

  const alltag=fetchingDetails && fetchingDetails?.parent?.tag?.map(taglist=>{
    return taglist
  })
  
    const handleTags = () => {
      
      if (toastData !== true) {
        setVisibleTag(true);
        dispatch(SetTagTestCases(true))
        d3.select('#' + box).classed('node-highlight', false);
      } else {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Save Mindmap before proceeding', life: 2000 });
      }
    };

    const createMultipleNode = (e,mnode)=>{
        setMultipleNode(false)
        if (mnode.length === 0){
            displayError(MSG.MINDMAP.ERR_NO_NODES_CREATE.CONTENT);
            return;
        }
        setBlockui({show:true,content:'Creating Nodes...'})
        var cnodes = {...nodes}
        var clinks = {...links}
        var cdNodes = [...dNodes]
        var cdLinks = [...dLinks]
        var csections = {...sections}
        mnode.forEach((name)=>{
            var res = createNode(e,cnodes,clinks,cdNodes,cdLinks,csections,{...count},name.value,verticalLayout)
            cnodes = res.nodeDisplay
            clinks = res.linkDisplay
            cdNodes = res.dNodes
            cdLinks = res.dLinks
            count= {...count,...res.count}
        })
        setNodes(cnodes)
        setLinks(clinks)
        setdLinks(cdLinks)
        setdNodes(cdNodes)
        setBlockui({show:false})
        props.toast.current.show({ severity: 'success', summary: 'Success', detail: MSG.MINDMAP.SUCC_NODE_CREATE.CONTENT, life: 3000 });
    }
    const clickAddNode=(e)=>{
        if(typeOfView === 'mindMapView'){
          var res = createNode(e,{...nodes},{...links},[...dNodes],[...dLinks],{...sections},{...count},undefined,verticalLayout)
          setCreateNew(res.dNodes.length-1)
          setNodes(res.nodeDisplay)
          setLinks(res.linkDisplay)
          setdLinks(res.dLinks)
          setdNodes(res.dNodes)
          count= {...count,...res.count}
        }else{
          var resJourneyView = createNodeForJourneyView(e,{...nodes},{...links},[...dNodes],[...dLinks],{...sections},{...count},undefined,verticalLayout)
          setCreateNew(resJourneyView.dNodes.length-1)
          setNodes(resJourneyView.nodeDisplay)
          setLinks(resJourneyView.linkDisplay)
          setdLinks(resJourneyView.dLinks)
          setdNodes(resJourneyView.dNodes)
          count= {...count,...resJourneyView.count}
        }
        // setCreateNew('autosave')
    }

    const checkTestStepGroup = (teststep, dNode, sids, types, ids) => {
      let check = [];
  
      const checkRecursively = (children) => {
          children.forEach((child) => {
              if (child['reuse']) {
                  check.push(child['reuse']);
              } else if (child.children && child.children.length > 0) {
                  checkRecursively(child.children);
              }
          });
      };
  
      checkRecursively(teststep);
  
      if (check.includes(true)) {
          reusedNode(dNode, sids, types);
          setReuseDelContent("Selected Test Scenario has reused Screens and Test cases. By deleting this will impact other Test Scenarios.\n \n Are you sure you want to Delete permanently?");
          setSelectedDelNode(ids);
          setReuseDelConfirm(true);
      } else {
          setSelectedDelNode(ids);
          setDelConfirm(true);
      }
  };
    const clickDeleteNode=(id)=>{
      var sid = parseFloat(id.split('node_')[1]);
      var type =[...dNodes][sid]['type'];
      if(type==='teststepsgroups'){
        var reu=[...dNodes][sid]['reuse']
        if(reu === false){
          reu=[...dNodes][sid]['parent']['reuse'];
        }
      }else{
        reu=[...dNodes][sid]['reuse'];
      }
      
      if (type=='scenarios'){
          if (reu){
              if([...dNodes][sid]['children']){
                  for ( let i=0; i< [...dNodes][sid]['children'].length;i++) {
                      if ([...dNodes][sid]['children'][i]["reuse"]){
                          reusedNode(dNodes,sid,type);
                          setReuseDelContent(<div>Selected Test Scenario has <b>re used Screens and Test cases</b> and is used in <b>End To End flow</b>, By deleting this will impact other Test Scenarios.<br/><br/> Are you sure you want to Delete permenantly?" </div>)
                          setSelectedDelNode(id);
                          setReuseDelConfirm(true);
                          return;
                      }
                      else {
                          continue;
                      }
              }}
              setReuseDelContent("Selected Test Scenario is used in End To End flow.\n \n Are you sure you want to delete it permenantly?")
              setSelectedDelNode(id);
              setEndToEndDelConfirm(true)
              return;
          }
          else if([...dNodes][sid]['children']){
            if([...dNodes][sid]['children'].length>0 && [...dNodes][sid]['children'][0].type !== 'teststepsgroups'){
              for ( let i=0; i< [...dNodes][sid]['children'].length;i++) {
                if ([...dNodes][sid]['children'][i]["reuse"]){
                    reusedNode(dNodes,sid,type);
                    setReuseDelContent("Selected Test Scenario has re used Screens and Test cases. By deleting this will impact other Test Scenarios.\n \n Are you sure you want to Delete permenantly?" )
                    setSelectedDelNode(id);
                    setReuseDelConfirm(true);
                    return;
                }
                else {
                    continue;
                }
              }
            }else if([...dNodes][sid]['children'].length>0){
              checkTestStepGroup([...dNodes][sid]['children'], dNodes, sid, type, id)
              return;
            }else{
              setSelectedDelNode(id);
              setDelConfirm(true);
              return;
            }
          } 
          setSelectedDelNode(id);
          setDelConfirm(true);
          return;
      }        
      else if (type=='screens'){
              if (reu){
                  reusedNode(dNodes,sid,type);
                  setReuseDelContent("Selected Screen is re used. By deleting this will impact other Testcase.\n \n Are you sure you want to Delete permenantly?");
                  setSelectedDelNode(id);
                  setReuseDelConfirm(true);
                  return;
              }
              else{
                  setSelectedDelNode(id);
                  setDelConfirm(true);
                  return;
              }

          
      }
      else if (type=='testcases'){
          if (reu){
              reusedNode(dNodes,sid,type);
              setSelectedDelNode(id);
              setReuseDelContent("Selected Test case is re used. By deleting this will impact other Test Scenarios.\n \n Are you sure you want to Delete permenantly?");
              setReuseDelConfirm(true);
              return;
          }
          else{
              setSelectedDelNode(id);
              setDelConfirm(true);
              return;
          }
      }
      else if (type==='teststepsgroups'){
        if (reu){
            reusedNode(dNodes,sid,type);
            setSelectedDelNode(id);
            setReuseDelContent("Selected Test steps groups is re used. By deleting this will impact other Test Scenarios.\n \n Are you sure you want to Delete permenantly?");
            setReuseDelConfirm(true);
            return;
        }
        else{
            setSelectedDelNode(id);
            setDelConfirm(true);
            return;
        }
    }
      // setReuseList(reusedNames)
      processDeleteNode(id)        
  }
  const reusedNode = (nodes,sid,type) => {
      let reusedNodes = [];
      let reusedScreens = [];
      const selectedNodeChildIds=[];
      const selectedNodeId = nodes[sid]['_id'];
      if(nodes[sid]['children']){
          for ( let i=0; i< nodes[sid]['children'].length;i++) {
              let selectedNodeChildId= nodes[sid]['children'][i]['_id'];
              selectedNodeChildIds.push(nodes[sid]['children'][i]['_id'])
      }}
      nodes.forEach((node) =>{
          if(node['type']=='scenarios' && type=='scenarios'){ 
              if(node['_id'] == selectedNodeId){
                  reusedNodes.push(node.id);
                  
              }else{
                  if(node?.children && node?.children.length>0){
                      for(let i = 0 ;i<node?.children?.length; i++){
                          let tempId=node?.children[i]['_id']
                          if(selectedNodeChildIds.includes(tempId)){
                              reusedNodes.push(node?.children[i].id); }}}
              }                                            
          }
          if(node['type']=='screens' && type=='screens'){
              if(node['_id'] == selectedNodeId){
                  reusedNodes.push(node.id);
              }else{
                  if(node?.children && node?.children.length>0){
                      for(let i = 0 ;i<node?.children?.length; i++){
                          if(node?.children[i]['_id'] == selectedNodeId){
                              reusedNodes.push(node?.children[i].id);
                          }
                      }
                  }
                  
              }
          }
          if(node['type']=='testcases'  && type=='testcases'){
              if(node['_id'] == selectedNodeId){
                  reusedNodes.push(node.id);
              }
          }
          if(node['type']==='teststepsgroups'  && type==='teststepsgroups'){
            if(node['_id'] === selectedNodeId){
              reusedNodes.push(node.id);
            }
        }
          
      });
      let nodesReused=[]
      reusedNodes.sort()
      reusedNodes.reverse()
      for(let i = 0 ;i<reusedNodes.length; i++){
          nodesReused.push('node_'+reusedNodes[i])
      }
      setDelReuseNodes(nodesReused);
  }
  const reusedDelConfirm = () => {
      //processDeleteNode();
      for(let i = 0 ;i<delReuseNodes.length; i++){
          processDeleteNode(delReuseNodes[i]);
      }
  }
  const deleteNodeHere=()=>{
      clickDeleteNodeHere(selectedDelNode)
  }
  const clickDeleteNodeHere=(id)=>{
    var res
    if(typeOfView === 'mindMapView'){
      res = deleteNode(id,[...dNodes],[...dLinks],{...links},{...nodes})
      if(res){
          // dispatch({type:actionTypes.UPDATE_DELETENODES,payload:[...deletedNodes,...res.deletedNodes]})
          setReuseDelConfirm(false)
          setNodes(res.nodeDisplay)
          setLinks(res.linkDisplay)
          setdLinks(res.dLinks)
          setdNodes(res.dNodes)
      }
    }else{
      res = deleteNodeForJourneyView(id,[...dNodes],[...dLinks],{...links},{...nodes})
      if(res){
          // dispatch({type:actionTypes.UPDATE_DELETENODES,payload:[...deletedNodes,...res.deletedNodes]})
          setReuseDelConfirm(false)
          setNodes(res.nodeDisplay)
          setLinks(res.linkDisplay)
          setdLinks(res.dLinks)
          setdNodes(res.dNodes)
          toast.current.show({severity:"success", summary:"Success", detail:MSG.MINDMAP.SUCC_DELETE_NODE.CONTENT, life:2000})
          setCreateNew('autosave') 
      }
    }
  }
  const processDeleteNode = (sel_node) => { 
    var res
    if(typeOfView === 'mindMapView'){       
      res = deleteNode(sel_node?sel_node:selectedDelNode,[...dNodes],[...dLinks],{...links},{...nodes})
      if(res){
          // dispatch({type:actionTypes.UPDATE_DELETENODES,payload:[...deletedNodes,...res.deletedNodes]})
          dispatch(deletedNodes([...deletedNoded,...res.deletedNodes]))
          setNodes(res.nodeDisplay)
          setLinks(res.linkDisplay)
          setdLinks(res.dLinks)
          setdNodes(res.dNodes)
      }
      setReuseDelConfirm(false);
      setDelConfirm(false);
      setEndToEndDelConfirm(false);
    }else{
      res = deleteNodeForJourneyView(sel_node?sel_node:selectedDelNode,[...dNodes],[...dLinks],{...links},{...nodes})
      if(res){
          // dispatch({type:actionTypes.UPDATE_DELETENODES,payload:[...deletedNodes,...res.deletedNodes]})
          dispatch(deletedNodes([...deletedNoded,...res.deletedNodes]))
          setNodes(res.nodeDisplay)
          setLinks(res.linkDisplay)
          setdLinks(res.dLinks)
          setdNodes(res.dNodes)
          toast.current.show({severity:"success", summary:"Success", detail:MSG.MINDMAP.SUCC_DELETE_NODE.CONTENT, life:2000})
          setCreateNew('autosave')
      }
      setReuseDelConfirm(false);
      setDelConfirm(false);
      setEndToEndDelConfirm(false);
    }
  }
    const clickCollpase=(e)=>{
        var id = e.target.parentElement.id;
        var res = toggleNode(id,{...nodes},{...links},[...dNodes],[...dLinks])
        setNodes(res.nodeDisplay)
        setLinks(res.linkDisplay)
        setdLinks(res.dLinks)
        setdNodes(res.dNodes)
    }
   
    const moveNode=(e,type)=>{
        var res;
        var id = e.target.parentElement.id.split('node_')[1];
        if(type==='KeyUp'){
            if(typeOfView === 'mindMapView'){res = moveNodeEnd(id,[...dNodes],[...dLinks],{...links},{...temp},verticalLayout)
            setLinks(res.linkDisplay)
            nodeMoving = false
            temp = {
                s: [],
                hidden:[],
                deleted:[],
                t: ""
            };}else{
              res = moveNodeEndForJourney(id,[...dNodes],[...dLinks],{...links},{...temp},verticalLayout)
            setLinks(res.linkDisplay)
            nodeMoving = false
            temp = {
                s: [],
                hidden:[],
                deleted:[],
                t: ""
            }
            }
        }
        else{
            nodeMoving = true
            if(typeOfView === 'mindMapView'){res = moveNodeBegin(id,{...links},[...dLinks],{...temp},{...ctScale},verticalLayout,'createnew')
            setLinks(res.linkDisplay)
            temp={...temp,...res.temp}}
            else{
              res = moveNodeBeginForJourney(id,{...links},[...dLinks],{...temp},{...ctScale},verticalLayout,'createnew')
            setLinks(res.linkDisplay)
            temp={...temp,...res.temp}
            }
        }
    }
    const DelReuseMsgContainer = ({message}) => (
        <p style={{color:'red'}}>
            {message}
        </p>
    )
     // Function for impact analysis 
     const clickAnalyzeScenario = (browserName)=>{
      
    let browserNameForDebug=selectedSpan.toString()
      // setShowAppPop(false);
    let err=""
    setOverlay("Impact Analysis is in progress... ")
    
      ResetSession.start();
    
      scrapeApi.getScrapeDataScenarioLevel_ICE(typesOfAppType, fetchingDetails["_id"])

    
          .then(async dataObjects=>{
    
              var scenarioAnalysisData = [],scenarioComparisionData=[]
    
              for (let i=0;i<dataObjects.length;i++){
                if(err){
                  break
                }
    
                  var screenAnalysisData = {}
    
                  let data = {}, dataObject = dataObjects[i];
    
                  data.dataObject = dataObject;
    
                  data.action = 'compare';
    
                  data.scenarioLevel = true;
    
                  data.appType = typesOfAppType;
    
                  data.browserType = browserName;
    
                  screenAnalysisData['screenName'] = dataObject['name']
    
                  screenAnalysisData['screenId'] = dataObject['screen_id']
    
                  screenAnalysisData['scrapedURL'] = dataObject['scrapedurl']
    
                  screenAnalysisData['orderlist'] = dataObject['orderlist']
    
                  screenAnalysisData['currentScrapedObjects'] = dataObject['view']
    
    
    
                  await scrapeApi.initScraping_ICE(data)
    
                  .then(data=>{
                    
                      // if(d==="unavailableLocalServer")
                      // {
                      //   err="NoIce"
                      //   setOverlay("")
                      //   toastErrorMsg(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.CONTENT)
                      //   return 
                      // }
                      if (data === "Invalid Session") return RedirectPage(history);
            else if (data === "Response Body exceeds max. Limit.")
              err = 'Scraped data exceeds max. Limit.' ;
            else if (data === 'scheduleModeOn' || data === "unavailableLocalServer") {
             
              err =
    
                  data === 'scheduleModeOn' ?
                    MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT :
                    MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.CONTENT
    
              
            } else if (data === "fail")
              err = MSG.SCRAPE.ERR_SCRAPE;
            else if (data === "Terminate") {
              setOverlay("");
              err = MSG.SCRAPE.ERR_SCRAPE_TERMINATE;
            }
            else if (data === "wrongWindowName")
              err = MSG.SCRAPE.ERR_WINDOW_NOT_FOUND;
            else if (data === "ExecutionOnlyAllowed")
              err = MSG.GENERIC.WARN_EXECUTION_ONLY;
    
            if (err) {
              setOverlay("")
              toastErrorMsg(err)
              return false;
            }
                      else{
                       
    
                        screenAnalysisData['view'] = data['view']
                       let screenHealth=''
                           
                            var screenComparisonKeys = {}
    
                            screenComparisonKeys['screenId'] = screenAnalysisData['screenId']
    
                            screenComparisonKeys['unchanged'] =  data['view'][1]['notchangedobject'].length
    
                            screenComparisonKeys['changed'] =  data['view'][0]['changedobject'].length
    
                            screenComparisonKeys['notfound'] =  data['view'][2]['notfoundobject'].length
    
                            screenComparisonKeys['statusCode'] = screenComparisonKeys['notfound']==0 && screenComparisonKeys['changed']==0 ? "SI" : screenComparisonKeys['notfound']==0 ? "WI" : "DI"
                            if(screenComparisonKeys['statusCode']=="SI"){
                              screenHealth='Screen is in good shape.'
                            }
                            else{
                              screenHealth='Screen needs action.'
                            }
                            scenarioComparisionData.push(screenComparisonKeys)
                            setMarqueItem({...screenComparisonKeys,newlyfound:data['view'][3]['newElements'].new_obj_in_screen.length,screenHealth:screenHealth,screenName:screenAnalysisData['screenName']})           
                            setOverlay(`Comparison of ${i+1}/${dataObjects.length} screen(s) in progress..`)
                           
                            let compareObj = generateCompareObject(screenAnalysisData, screenAnalysisData.currentScrapedObjects.filter(object => object.xpath.substring(0, 4)==="iris"));
                            screenAnalysisData.view=compareObj
                            scenarioAnalysisData.push(screenAnalysisData);
                      }
                    
    
                  })
                
    
    
                  .catch(error => {
    
                      setOverlay("");
    
                      ResetSession.end();
    
                      // setMsg(MSG.SCRAPE.ERR_SCRAPE);
                      toastErrorMsg(MSG.SCRAPE.ERR_SCRAPE)
    
                      console.error("Fail to Load initScraping_ICE. Cause:", error);
    
                  });
    
    
    
    
                  await DesignApi.debugTestCase_ICE([`${browserNameForDebug}`], [dataObject.testcaseid], userInfo, typesOfAppType)
    
      
    
                    .then(d => {

                      if (d === "Invalid Session") return RedirectPage(history);

                      if (d === "fail")

                          err=(MSG.DESIGN.ERR_DEBUG);

                      else if (d === "Terminate") {

                          setOverlay("");

                          err=(MSG.DESIGN.WARN_DEBUG_TERMINATE);

                      }

                  })
    
                  
    
                  .catch(error => {
    
                      setOverlay("");
    
                      ResetSession.end();
    
                      toastErrorMsg(MSG.SCRAPE.ERR_SCRAPE)
    
    
                      console.error("Fail to Load debugTestCase_ICE. Cause:", error);
    
                  });
                 
    
              }
              
    
              console.log(scenarioAnalysisData);
    
              
    
              // setMsg(MSG.DESIGN.SUCC_SCENARIO_COMPARASION);
              if(!err)
              {
                setScenarionLevelImpactedData(scenarioAnalysisData)
                await scrapeApi.updateScenarioComparisionStatus(typesOfAppType, fetchingDetails["_id"], scenarioComparisionData);
    
              setTimeout(() => {
                setOverlay("");
    
              ResetSession.end();
                dispatch(AnalyzeScenario(true))
              }, 4000);
            }
              // toast.current.show({ severity: 'success', summary: 'Success', detail: 'Impact analysis successfully completed.', life: 10000 });
          })
    
    
    }
    function getCompareScrapeItem(scrapeObject) {
      return {
          ObjId: scrapeObject._id,
          val: uuid(),
          tag: scrapeObject.tag,
          title: scrapeObject.custname.replace(/[<>]/g, '').trim(),
          custname: scrapeObject.custname,
          top: scrapeObject.top,
          left: scrapeObject.left,
          height: scrapeObject.height,
          width: scrapeObject.width,
          xpath: scrapeObject.xpath,
          url: scrapeObject.url,
          checked: false
      }
    }
    function generateCompareObject(data, irisObjects){
      let compareObj = [{},{},{},{}];
      if (data.view[0].changedobject.length > 0) {
          let localList = [];
          for (let i = 0; i < data.view[0].changedobject.length; i++) {
              let scrapeItem = getCompareScrapeItem(data.view[0].changedobject[i]);
              localList.push(scrapeItem);
          }
          compareObj[0]={changedobject:localList}
      }
      else{
        compareObj[0]={changedobject:[]}
      }
      if (data.view[1].notchangedobject.length > 0) {
          let localList = [];
          for (let i = 0; i < data.view[1].notchangedobject.length; i++) {
              let scrapeItem = getCompareScrapeItem(data.view[1].notchangedobject[i])
              localList.push(scrapeItem);
          }   
          compareObj[1]={notchangedobject:localList}
      }
      else{
        compareObj[1].notchangedobject=[]
      }
      if (data.view[2].notfoundobject.length > 0 || irisObjects.length > 0) {
          let localList = [];
          if (data.view[2].notfoundobject.length > 0) {
              for (let i = 0; i < data.view[2].notfoundobject.length; i++) {
                  let scrapeItem = getCompareScrapeItem(data.view[2].notfoundobject[i])
                  localList.push(scrapeItem);
              }
          }
          compareObj[2].notfoundobject = [...localList, ...irisObjects];
      }
      else{
        compareObj[2].notfoundobject=[]
      }
      if (data.view[3].newElements.new_obj_in_screen.length > 0 || irisObjects.length > 0) {
        let [scrapeItemList, newOrderList]=generateScrapeItemList(0,data.view[3].newElements.new_obj_in_screen,"new")
        compareObj[3]={newElements:{new_obj_in_screen:scrapeItemList,new_obj_for_not_found:data.view[3].newElements.new_obj_for_not_found}};
    }
    else{
      compareObj[3]={newElements:{new_obj_in_screen:[],new_obj_for_not_found:data.view[3].newElements.new_obj_for_not_found}}
    }
      return compareObj;
    } 
    
    function generateScrapeItemList(lastIdx, viewString, type = "old") {
      let localScrapeList = [];
      let orderList = viewString.orderlist || [];
      let orderDict = {};
      let resetOrder = false;
      for (let i = 0; i < viewString.length; i++) {
    
        let scrapeObject = viewString[i];
        let newTag = scrapeObject.tag;
    
        if (scrapeObject.cord) {
          scrapeObject.hiddentag = "No";
          newTag = `iris;${(scrapeObject.objectType || "").toLowerCase()}`;
          scrapeObject.url = "";
          // if (scrapeObject.xpath.split(';').length<2)
          scrapeObject.xpath = `iris;${scrapeObject.custname};${scrapeObject.left};${scrapeObject.top};${(scrapeObject.width + scrapeObject.left)};${(scrapeObject.height + scrapeObject.top)};${(scrapeObject.objectType || "").toLowerCase()};${(scrapeObject.objectStatus || "0")};${scrapeObject.tag}`;
        }
    
        let newUUID = uuid();
        let scrapeItem = {
          objId: scrapeObject._id,
          objIdx: lastIdx,
          val: newUUID,
          tag: newTag,
          hide: false,
          title: scrapeObject.custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim(),
          custname: scrapeObject.custname,
          hiddentag: scrapeObject.hiddentag,
          checked: false,
          url: scrapeObject.url,
          xpath: scrapeObject.xpath,
          top: scrapeObject.top,
          left: scrapeObject.left,
          height: scrapeObject.height,
          width: scrapeObject.width,
          identifier: scrapeObject.identifier
        }
        if (scrapeObject.fullSS != undefined && !scrapeObject.fullSS && scrapeObject.viewTop != undefined) {
          scrapeItem['viewTop'] = scrapeObject.viewTop;
        }
    
    
        if (type === "new") scrapeItem.tempOrderId = newUUID;
        if (scrapeObject.hasOwnProperty('editable') || scrapeObject.cord) {
          scrapeItem.editable = true;
        } else {
          let isCustom = scrapeObject.xpath === "";
          scrapeItem.isCustom = isCustom;
        };
    
        if (scrapeItem.objId) {
          orderDict[scrapeItem.objId] = scrapeItem;
        }
        else orderDict[scrapeItem.tempOrderId] = scrapeItem;
    
        if (!orderList.includes(scrapeItem.objId)) resetOrder = true;
    
        lastIdx++;
      }
    
      if (orderList && orderList.length && !resetOrder)
        orderList.forEach(orderId => orderDict[orderId] ? localScrapeList.push(orderDict[orderId]) : console.error("InConsistent OrderList Found!"))
      else {
        localScrapeList = Object.values(orderDict);
        orderList = Object.keys(orderDict);
      }
    let abc=localScrapeList
      return [localScrapeList, orderList];
    }
   

    // const clickUnassign = (res) =>{
    //     setNodes(res.nodeDisplay)
    //     dispatch({type:actionTypes.UPDATE_UNASSIGNTASK,payload:res.unassignTask})
    //     setTaskBox(false)
    // }

    // const clickAddTask = (res) =>{
    //     setNodes(res.nodeDisplay)
    //     setdNodes(res.dNodes)
    //     setTaskBox(false)
    // }

  const confirm1 = () => {
    confirmDialog({
        message: "Recording this scenarios with Avo Genius will override the current scenario. Do you wish to proceed?",
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept,
        reject,
        acceptClassName:"p-button-rounded",
        rejectClassName:"p-button-rounded"
    });
  };

  const accept = () => {
    if (toastData !== true){
      dispatch(showGenuis({
        showGenuisWindow:true,
        geniusWindowProps:{
          selectedProject:{key: proj,text: projectList[proj]["name"]},        
          selectedModule:{key:fetchingDetails["parent"]["_id"],text:fetchingDetails["parent"]["name"]},
          selectedScenario:{key:fetchingDetails["_id"],text:fetchingDetails["name"]},
          geniusFromMindmap:true
        }
      })) 
    }else{
      toast.current.show({severity:'error', summary:'Error', detail:"Save Mindmap before proceeding", life:2000})
    }
  }

  const reject = () => {}
  const handleContext=(e,type,value)=>{
    if(props.module.currentlyInUse!=="" && props.module.currentlyInUse!==undefined && props.module.currentlyInUse!==userInfo.username){
      if(type==="modules"){
        toastWarnMsg(`This test suite is in read only mode and currently in use by ${props.module.currentlyInUse}`)
        return
      }
      if(type==="scenarios"){
        toastWarnMsg(`This test suite is in read only mode and currently in use by ${props.module.currentlyInUse}`)
        return
      }
    }
    if (value === "created"){
      setToastData(true);
    }else{
      setToastData(false)
    } 
    setBox(e.target.parentElement.id)
    if(type === "teststepsgroups"){
      setFetchingDetailsForGroup(dNodes[e.target.parentElement.id.split("_")[1]])
      dispatch(setElementRepoModuleID({id:dNodes[0]._id, key:"repo"}))
    }else{
      setFetchingDetails(dNodes[e.target.parentElement.id.split("_")[1]])
      dispatch(setElementRepoModuleID({id:dNodes[0]._id, key:"repo"}))
    }
    const element = d3.select('#'+e.target.parentElement.id)
    if(type==="modules"){ menuRef_module.current.show(e);element.classed('node-highlight',!0)}
    else if(type==="scenarios"){menuRef_scenario.current.show(e);element.classed('node-highlight',!0)}
    else if(type==="screens"){menuRef_screen.current.show(e);element.classed('node-highlight',!0)}
    else if(type==="teststepsgroups"){menuRef_Teststepgroup.current.show(e);element.classed('node-highlight',!0)}
    else{menuRef_Teststep.current.show(e);element.classed('node-highlight',!0)}
    
  }
      const addRowScenario = () => {
        const newRow = { id: addScenario.length + 1, value: inputValue, isEditing: false };
        setAddScenario((prevData) => [...prevData, newRow]);
        setInputValue("");
        setShowInput(true);
      };

        const addRowScreen = () => {
          const newRowScreen = { id: addScreen.length + 1, value : inputValScreen , isEditing:false};
          setAddScreen((prevData) => [...prevData, newRowScreen]);
          setinputValScreen("");
          setShowInputScreen(true);
        };
  
        
        const addRowTestStep = () => {
          const newRowTestStep = { id: addTestStep.length + 1, value : inputValTestStep, isEditing:false};
          setAddTestStep([...addTestStep, newRowTestStep]);
          setinputValTestStep("");
          setShowInputTestStep(true);
        };

  const updateRow = (rowData, updatedValue) => {
    const updatedData = addScenario.map((row) => (row.id === rowData.id ? { ...row, value: updatedValue, isHovered: false } : row)).filter((row) => row.value !== "");
    setAddScenario(updatedData);
  };
  const updateRowScreen = (rowDataScreen, updatedValueScreen) => {
    const updatedDataScreen = addScreen.map((row) => (row.id === rowDataScreen.id ? { ...row, value: updatedValueScreen, isHovered: false } : row)).filter((row) => row.value !== "");
    setAddScreen(updatedDataScreen);
  };
    
          
  const updateRowTestStep = (rowDataTestStep, updatedValueTestStep) => {
    const updatedDataTestStep = addTestStep.map((row) => (row.id === rowDataTestStep.id ? { ...row, value: updatedValueTestStep, isHovered: false } : row)).filter((row) => row.value !== "");
    setAddTestStep(updatedDataTestStep);
  };
    
    
          const handleEdit = (rowData) => {
            setAddScenario((prevData) => {
              const updatedData = prevData.map((row) => {
                if (row.id === rowData.id) {
                  return { ...row, isEditing: true };
                }
                return row;
              });
              return updatedData;
            });
          };
          const handleEditScreens = (rowDataScreen) => {
            setAddScreen((prevData) => {
              const updatedData = prevData.map((row) => {
                if (row.id === rowDataScreen.id) {
                  return { ...row, isEditing: true };
                }
                return row;
              });
              return updatedData;
            });
          };
    
          const handleEditTestCases = (rowDataTestStep) => {
            setAddTestStep((prevData) => {
              const updatedDataTestStep = prevData.map((row) => {
                if (row.id === rowDataTestStep.id) {
                  return { ...row, isEditing: true };
                }
                return row;
              });
              return updatedDataTestStep;
            });
          };
          
    
          const handleRowInputChange = (rowId, value) => {
            setAddScenario((prevData) =>
              prevData.map((row) => {
                if (row.id === rowId) {
                  return { ...row, value };
                }
                return row;
              })
            );
          };
    
          const handleRowInputChangeScreens = (rowId, value) => {
            setAddScreen((prevData) =>
              prevData.map((row) => {
                if (row.id === rowId) {
                  return { ...row, value };
                }
                return row;
              })
            );
          };
    
          const handleRowInputChangeTestCases = (rowId, value) => {
            setAddTestStep((prevData) =>
              prevData.map((row) => {
                if (row.id === rowId) {
                  return { ...row, value };
                }
                return row;
              })
            );
          };
  // To handle Multiple Test Cases
  const handleSave = (rowData) => {
    setAddScenario((prevData) =>
      rowData?.value == "" ?
        prevData.filter(row => row.id !== rowData.id).map((row, index) => ({
          ...row,
          id: index + 1,
        })) :
        prevData.map((row) => {
          if (row.id === rowData.id) {
            return { ...row, value: rowData.value, isEditing: false };
          }
          return row;
        })
    );
    (rowData?.value !== "") ?? setEditingRows((prevState) => ({
      ...prevState,
      [rowData.id]: false,
    }));
    // setShowInput(false); // Hide the input box after saving
  };
  // To handle Multiple Test Screens
  const handleSaveScreens = (rowDataScreen) => {
    setAddScreen((prevData) =>
      rowDataScreen.value == "" ?
        prevData.filter(row => row.id !== rowDataScreen.id).map((row, index) => ({
          ...row,
          id: index + 1,
        })) :
        prevData.map((row) => {
          if (row.id === rowDataScreen.id) {
            return { ...row, value: rowDataScreen.value, isEditing: false };
          }
          return row;
        })
    );
    (rowDataScreen?.value !== "") ?? setEditingRowsScreens((prevState) => ({
      ...prevState,
      [rowDataScreen.id]: false,
    }));
  };
  // To handle Multiple Test Steps
  const handleSaveTestCases = (rowDataTestStep) => {
    setAddTestStep((prevData) =>
      rowDataTestStep.value == "" ?
        prevData.filter(row => row.id !== rowDataTestStep.id).map((row, index) => ({
          ...row,
          id: index + 1,
        })) :
        prevData.map((row) => {
          if (row.id === rowDataTestStep.id) {
            return { ...row, value: rowDataTestStep.value, isEditing: false };
          }
          return row;
        })
    );

    (rowDataTestStep.value !== "") ?? setEditingRowsTestCases((prevState) => ({
      ...prevState,
      [rowDataTestStep.id]: false,
    }));
  };
          
    
  const headerCheckboxClicked = (event) => {
    if (event.checked) {
      setSelectedRowsScenario(addScenario.map(row => row.id));
    } else {
      setSelectedRowsScenario([]);
    }
  };

  const headerCheckboxClickedScreen = (event) => {
    if (event.checked) {
      setSelectedRowsScreen(addScreen.map(row => row.id));
    } else {
      setSelectedRowsScreen([]);
    }
  };

  const rowCheckboxClickedScreen = (event, rowDataScreen) => {
    if (event.checked) {
      setSelectedRowsScreen([...selectedRowsScreen, rowDataScreen.id]);
    } else {
      setSelectedRowsScreen(selectedRowsScreen.filter(id => id !== rowDataScreen.id));
    }
  };

  const headerCheckboxClickedTestStep = (event) => {
    if (event.checked) {
      setSelectedRowsTeststep(addTestStep.map(row => row.id));
    } else {
      setSelectedRowsTeststep([]);
    }
  };

  const rowCheckboxClickedTestStep = (event, rowDataTestStep) => {
    if (event.checked) {
      setSelectedRowsTeststep([...selectedRowsTeststep, rowDataTestStep.id]);
    } else {
      setSelectedRowsTeststep(selectedRowsTeststep.filter(id => id !== rowDataTestStep.id));
    }
  };

  const rowCheckboxClicked = (event, rowData) => {
    if (event.checked) {
      setSelectedRowsScenario([...selectedRowsScenario, rowData.id]);
    } else {
      setSelectedRowsScenario(selectedRowsScenario.filter(id => id !== rowData.id));
    }
  };

  const handleRowHover = (event, rowData) => {
    setHoveredRow(rowData.id);
  };
  
  const handleRowHoverExit = () => {
    setHoveredRow(null);
  };

  const handleDelete = (rowData) => {
    setAddScenario((prevData) => {
      const updatedData = prevData.filter((row) => row.id !== rowData.id);
      const updatedDataWithIndex = updatedData.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      return updatedDataWithIndex;
    });
  };
  const handleDeleteScreen = (rowDataScreen) => {
    setAddScreen((prevData) => {
      const updatedDataScreen = prevData.filter((row) => row.id !== rowDataScreen.id);
      const updatedDataWithIndexScreen = updatedDataScreen.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      return updatedDataWithIndexScreen;
    });
  };
  const handleDeleteTestStep = (rowDataTestStep) => {
    setAddTestStep((prevData) => {
      const updatedDataTestStep = prevData.filter((row) => row.id !== rowDataTestStep.id);
      const updatedDataWithIndexTestStep = updatedDataTestStep.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      return updatedDataWithIndexTestStep;
    });
  };

  


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const specialCharRegex = /[!@#$%^&*()+{}|\[\]:;"'<>,.?/\\]/;

    switch (name) {
      case 'inputValScreen':
        if (!specialCharRegex.test(value)) {
          setinputValScreen(value);
          setInputValValid(true);
          // Additional logic for valid inputValScreen
        } else {
          setInputValValid(false);
          // Handle invalid inputValScreen
        }
        break;
      case 'inputValTestStep':
        if (!specialCharRegex.test(value)) {
          setinputValTestStep(value);
          setInputValValid(true);
        } else {
          setInputValValid(false);
        }
        break;
        case 'inputValue':
        if (!specialCharRegex.test(value)) {
          setInputValue(value);
          setInputValValid(true);
        } else {
          setInputValValid(false);
        }
        break;
      default:
        break;
    }
  };

  const columns = [
    // {
    //   field: "checkbox",
    //   header: <Checkbox className='scenario-check' onChange={headerCheckboxClicked} checked={selectedRowsScenario.length === addScenario.length && addScenario.length !== 0} />,
    //   body: (rowData) => <Checkbox className='rowdata_check' onChange={(event) => rowCheckboxClicked(event, rowData)} checked={selectedRowsScenario.includes(rowData.id)} />,
    //   headerStyle: { width: '50px' },
    //   bodyStyle: { width: '50px' },
    // },
    {
      field: "addScenario",
      header: `Add ${appType !== "Webservice" ?'Testcase': 'API'}`,
      headerClassName: 'scenario-header',
      body: (rowData) => {
        if (showInput && rowData.id === addScenario.length) {
          return (
            <InputText name="inputValue" className='scenario_inp' placeholder={`${appType !== "Webservice" ?'Testcase': 'API'} Name`} value={inputValue} onChange={handleInputChange}
            onBlur={() => {
              updateRow(rowData, inputValue);
              setShowInput(false);
              setInputValue("sample Testcase");
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                updateRow(rowData, inputValue);
                setShowInput(false);
                setInputValue("sample Testcase");
              }
            }}
            />
          );
        } 
        else if (rowData.isEditing !== false) {
            return (
             <InputText
             className='scenario_inp'
                value={rowData.value}
                onChange={(e) => handleRowInputChange(rowData.id, e.target.value)}
                onBlur={() => handleSave(rowData)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                    handleSave(rowData);
                  }
                }}
              />
            );
          } 
       
        else {
          return(
            <div className='row_data'
            onClick={() => handleEdit(rowData)}
            onMouseEnter={(event) => handleRowHover(event,rowData)}
            onMouseLeave={() => handleRowHoverExit()}
          >
           <div className='row_data_align'> {rowData.value}</div>
            {hoveredRow === rowData.id && (
              <div className='icons_class'>
                <i className="pi pi-pencil" onClick={()=>handleEdit(rowData)} style={{position:'relative', left:'10rem', bottom:'1rem',cursor:'pointer'}} />
                <i className="pi pi-trash"  onClick={() => handleDelete(rowData)} style={{position:'relative', left:'11rem',bottom:'1rem',cursor:'pointer' }}/>
              </div>
            )}
          </div>

        )
          }
        }
      
    },
  ];
   
  const columnsScreen = [
    // {
    //   field: "checkbox",
    //   header: <Checkbox className='scenario-check' onChange={headerCheckboxClickedScreen} checked={selectedRowsScreen.length === addScreen.length && addScreen.length !== 0} />,
    //   body: (rowDataScreen) => <Checkbox onChange={(event) => rowCheckboxClickedScreen(event, rowDataScreen)} checked={selectedRowsScreen.includes(rowDataScreen.id)} />,
    //   style: { width: '50px' },
     
    // },
    {
      field: "addScreen",
      header: `Add Multiple ${appType !== "Webservice" ? 'Screens' : 'Requests'}`,
      headerClassName: 'scenario-header',
      body: (rowDataScreen) => {
        if (showInputScreen && rowDataScreen.id === addScreen.length) {
          return (
            // <InputText className='scenario_inp' placeholder='Add Screen Name' value={inputValScreen} onChange={(e) => setinputValScreen(e.target.value)} onBlur={() => updateRowScreen(rowDataScreen, inputValScreen)} />
            <InputText name="inputValScreen" className='scenario_inp' placeholder={`Add ${appType !== "Webservice" ?'Screen' : 'Request'} Name`} value={inputValScreen} onChange={handleInputChange}
            onBlur={() => {
              updateRowScreen(rowDataScreen, inputValScreen);
              setShowInputScreen(false);
              setinputValScreen("sample Screen ");
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                updateRowScreen(rowDataScreen, inputValScreen);
                setShowInputScreen(false);
                setinputValScreen("sample Screen ");
              }
            }}
            />
          );
        } 
        else if (rowDataScreen.isEditing !== false) {
          return (
           <InputText
           className='scenario_inp'
              value={rowDataScreen.value}
              onChange={(e) => handleRowInputChangeScreens(rowDataScreen.id, e.target.value)}
              onBlur={() => handleSaveScreens(rowDataScreen)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                  handleSaveScreens(rowDataScreen);
                }
              }}
            />
          );
        } 
        else {
          return(
            <div className='row_data'
            onClick={()=>handleEditScreens(rowDataScreen)}
            onMouseEnter={(event) => handleRowHover(event,rowDataScreen)}
            onMouseLeave={() => handleRowHoverExit()}
            
          >
           <div className='row_data_align'> {rowDataScreen.value}</div>
            {hoveredRow === rowDataScreen.id && (
              <div className='icons_class'>
                <i className="pi pi-pencil" onClick={()=>handleEditScreens(rowDataScreen)} style={{position:'relative', left:'10rem', bottom:'1rem',cursor:'pointer',cursor:'pointer',cursor:'pointer'}} />
                <i className="pi pi-trash"  onClick={() => handleDeleteScreen(rowDataScreen)} style={{position:'relative', left:'11rem',bottom:'1rem',cursor:'pointer',cursor:'pointer',cursor:'pointer' }}/>
              </div>
            )}
          </div>
    
        )
          }
      },
    },
  ];

  const columnsTestStep = [
    // {
    //   field: "checkbox",
    //   header: <Checkbox className='scenario-check' onChange={headerCheckboxClickedTestStep} checked={selectedRowsTeststep.length === addTestStep.length && addTestStep.length !== 0} />,
    //   body: (rowDataTestStep) => <Checkbox onChange={(event) => rowCheckboxClickedTestStep(event, rowDataTestStep)} checked={selectedRowsTeststep.includes(rowDataTestStep.id)} />,
      
    // },
    {
      field: "addTestStep",
      header: "Add Test Step",
      headerClassName: 'scenario-header',
      body: (rowDataTestStep) => {
        if (showInputTestStep && rowDataTestStep.id === addTestStep.length) {
          return (
            // <InputText className='scenario_inp' placeholder='Add Test Step Name' value={inputValTestStep} onChange={(e) => setinputValTestStep(e.target.value)} onBlur={() => updateRowTestStep(rowDataTestStep, inputValTestStep)} />
    <InputText name="inputValTestStep" className='scenario_inp' placeholder='Add Test step Name' value={inputValTestStep} onChange={handleInputChange}
    onBlur={() => {
      updateRowTestStep(rowDataTestStep, inputValTestStep);
      setShowInputTestStep(false);
      setinputValTestStep("sample teststeps");
    }}
    onKeyUpCapture={(e) => {
      if (e.key === 'Enter') {
        updateRowTestStep(rowDataTestStep, inputValTestStep);
        setShowInputTestStep(false);
        setinputValTestStep("sample teststeps");
      }
    }}
    />
    );
     } 
     else if (rowDataTestStep.isEditing !== false) {
      return (
       <InputText
       className='scenario_inp'
          value={rowDataTestStep.value}
          onChange={(e) => handleRowInputChangeTestCases(rowDataTestStep.id, e.target.value)}
          onBlur={() => handleSaveTestCases(rowDataTestStep)}
          onKeyUpCapture={(e) => {
            if (e.key === "Enter") {
              e.target.blur();
              handleSaveTestCases(rowDataTestStep);
            }
          }}
        />
      );
    } 
    else {
      return(
        <div className='row_data'
        onClick={() => handleEditTestCases(rowDataTestStep)}
        onMouseEnter={(event) => handleRowHover(event,rowDataTestStep)}
        onMouseLeave={() => handleRowHoverExit()}
      >
       <div className='row_data_align'> {rowDataTestStep.value}</div>
        {hoveredRow === rowDataTestStep.id && (
          <div className='icons_class'>
            <i className="pi pi-pencil" onClick={()=>handleEditTestCases(rowDataTestStep)} style={{position:'relative', left:'10rem', bottom:'1rem',cursor:'pointer'}} />
            <i className="pi pi-trash"  onClick={() => handleDeleteTestStep(rowDataTestStep)} style={{position:'relative', left:'11rem',bottom:'1rem' ,cursor:'pointer'}}/>
          </div>
        )}
      </div>

    )
      }
      },
    },
  ];
  
  const footerContentScenario = (
    <div>
        <Button label={`Add ${appType !== "Webservice" ?'Testcase' : 'API'}`}  onClick={()=>{setVisibleScenario(false);createMultipleNode(box.split("node_")[1],addScenario);setInputValue("");setAddScenario([{ id: 1, value: inputValue, isEditing: false }]);}} className="add_scenario_btn"  disabled={ (inputValue ) ?  false: true} /> 
    </div> 
);

const footerContentScreen =(
    <div>
              <Button label={`Add ${appType !== "Webservice" ?'Screens' : 'Request'}`}  onClick={() => {setVisibleScreen(false);createMultipleNode(box.split("node_")[1],addScreen);setinputValScreen("");setAddScreen([{ id: 1, value: inputValScreen, isEditing: false }]);}} className="add_scenario_btn"  disabled={ (inputValScreen ) ?  false: true} /> 
          </div>
    )
    const footerContentTeststep =(
      <div>
                <Button label="Add Test Step"  onClick={() => {setVisibleTestStep(false);createMultipleNode(box.split("node_")[1],addTestStep);setinputValTestStep("");setAddTestStep([{ id: 1, value: inputValTestStep, isEditing: false }]);}} className="add_scenario_btn"disabled={ (inputValTestStep ) ?  false: true}  /> 
            </div>
      )
       // functions for impact analysis 
  const footerCompare = (
    <div className='footer_compare'>
      <button className='clear__btn__cmp'onClick={()=>{setVisibleScenarioAnalyze(false)}}>Clear</button>
      <button className='save__btn__cmp' onClick={()=>{clickAnalyzeScenario(browserName);setVisibleScenarioAnalyze(false)}}>Start</button>
    </div>
  )
  // functions for tag a testcase 
  const footerContentTag=(
    <div>
            <Button label="Save"  className="savetag" onClick={handleSaveTags}  disabled={saveDisabled}
 /> 
        </div>
  ) 
  const updateObjects = (tab) => {
    let scenarioImpact=[...scenraioLevelImpactedData]
    let scenarioComparisionData=[]
    if(!checkedChanged.length){
      toastErrorMsg('Please select element(s) to update properties.')
      return
    }
    let viewString=[...tab.currentScrapedObjects]
    let updatedObjects = [];
    let updatedIds=[]
    // let updatedCompareData = {...compareData};
   
    checkedChanged.map((checkedelem,index)=>{
 
  let id=viewString.find(element=>element.custname===checkedelem.element.custname)
  // viewString[updatedCompareData.changedobjectskeys[index]]._id

  updatedObjects.push({...tab.view[0].changedobject[index],_id:id._id});
})


let arg = {
        'modifiedObj': updatedObjects,
        'screenId': tab.screenId,
        'userId': userInfo.user_id,
      'roleId': userInfo.role,
        'param': 'saveScrapeData',
        'orderList': tab.orderlist
    };
    
scrapeApi.updateScreen_ICE(arg)
    .then(data => {
        if (data.toLowerCase() === "invalid session") return RedirectPage(history);
        if (data.toLowerCase() === 'success') {
          toast.current.show({ severity: 'success', summary: 'Success', detail: `${tab.screenName} elements updated successfully` , life: 10000 });

          let screenToBeUpdated=scenraioLevelImpactedData.find(screen=>screen.screenName===tab.screenName)
          let index=scenraioLevelImpactedData.findIndex(screen=>screen.screenName===tab.screenName)
          let remainingChanged=screenToBeUpdated.view[0].changedobject.filter(function(objFromA) {
            return !checkedChanged.find(function(objFromB) {
              return objFromA.custname === objFromB.element.custname
            })
          })
          
          let view=[...screenToBeUpdated.view]
          view[0].changedobject=remainingChanged
          screenToBeUpdated.view=view
          scenarioImpact.splice(index, 1, screenToBeUpdated)
          setScenarionLevelImpactedData(scenarioImpact)
          setCheckedChanged([])
          var screenComparisonKeys = {}

                   screenComparisonKeys['screenId'] = tab.screenId


                    screenComparisonKeys['unchanged'] =  screenToBeUpdated.view[1].notchangedobject.length

                    screenComparisonKeys['changed']=remainingChanged.length

                    screenComparisonKeys['notfound'] =  screenToBeUpdated.view[2].notfoundobject.length

                    screenComparisonKeys['statusCode'] = (screenComparisonKeys['notfound']==0 && screenComparisonKeys['changed']==0) ? "SI" : screenComparisonKeys['notfound']==0 ? "WI" : "DI"

// setScenarionLevelImpactedData(screenToBeUpdated)'
scenarioComparisionData.push(screenComparisonKeys)

scrapeApi.updateScenarioComparisionStatus(typesOfAppType, fetchingDetails["_id"], scenarioComparisionData);
        } else {
          toastErrorMsg('Error while updating elements.');

            // dispatch(CompareFlag(false))
        }
    })
    .catch(error => console.error(error) );
}
const replaceHandler=(tab)=>{         
  setOrderList(tab.orderlist);
  let fetchingdetailsscreen={...fetchingDetails.children.filter(screen=>screen.name===tab.screenName && tab.screenName)[0]}
  setFetchingDetailsScreen(fetchingdetailsscreen)
  dispatch(CompareData({view:[{notFoundObj:tab.view[2].notfoundobject},{changedObj:tab.view[0].changedobject},{notChangedObj:tab.view[1].notchangedobject},{fullScrapeData:tab.view[3].newElements.new_obj_for_not_found}]}));
  dispatch(CompareObj({notFoundObj:tab.view[2].notfoundobject,changedObj:tab.view[0].changedobject,notChangedObj:tab.view[1].notchangedobject,fullScrapeData:tab.view[3].newElements.new_obj_for_not_found}));
  dispatch(ImpactAnalysisScreenLevel(true));
}



const accordinHedaerChangedElem =(tab)=>{
return(
  <div style={{marginLeft:'0.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}} className='accordion-header__changedObj' >
     <Checkbox onChange={(e)=>{oncheckAllChanged(e,tab)}}
            checked={(checkedChanged.length>0 && tab.view[0].changedobject.length)?(checkedChanged.every(
              (item) => item.checked ===true
            ) && checkedChanged.length===tab.view[0].changedobject.length):false}
             /> 
     <span className='header-name__changedObj' style={{marginLeft:'0.5rem'}}>
      <span>Changed Elements</span>
      <span>{`(${tab.view[0].changedobject.length})`}</span>
      <span><img src="static/imgs/warning_icon.svg" className='accordion_icons'></img></span>
</span>

     <div style={{display:'flex'}}>
     <Tooltip target={`.update-btn`}  content={'Update Properties'} position="bottom"/>
     <Button onClick={()=>updateObjects(tab)} label="Update" className="update-btn" size="small" style={{borderRadius:'3px',fontSize:'13px',width:'5rem'}} />
  </div>
  </div>
);
};
const accordinHedaernotFoundElem=(tab)=>{
return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginLeft:'0.5rem'}}>
       <Checkbox onChange={()=>{}}
            checked={(checked.length>0 && tab.view[2].notfoundobject)?(checked.every(
              (item) => item.checked ===true
            ) && checked.length===tab.view[2].notfoundobject.length):false}
             /> 
  
  <span className='header-name__changedObj' style={{marginLeft:'0.5rem'}}>
    <span>Not found/deleted elements  </span>
    <span>{`(${tab.view[2].notfoundobject.length})`}</span>
  <span><img src="static/imgs/danger.svg" className='accordion_icons'></img></span>

  {/* <span>Count:<Badge value={tab.view[2].notfoundobject.length} severity="danger"></Badge></span> */}
</span>
  <div style={{display:'flex'}}>
  <Tooltip target={`.replace-btn`}  content={'Replace Element'} position="bottom"/>
  <Button onClick={()=>{replaceHandler(tab)}} label="Replace" className="update-btn" size="small" style={{borderRadius:'3px',fontSize:'13px',width:'5rem'}} />
  <button className=" pi pi-trash button-delete" style={{background:'transparent',fontSize:'22px',marginLeft:'0.5rem'}} disabled={!checkedNotFound.length} onClick={()=>{setDeletedElements({visible:true,tab:tab})}} />
  </div>

</div>
)
}
const opendesignstep=(scr)=>{

let fetchingd={...fetchingDetails.children.filter(screen=>screen.name===scr && scr)[0].children[0]}
let fetchngdnew=fetchingd.parent.parent=fetchingDetails
setFetchingDetailsImpact(fetchingd)
setVisibleDesignStep(true)

}
useEffect(()=>{
  if (objVal.custname === hightlightcustname) setActiveEye(true);
  else if (activeEye) setActiveEye(false);
}, [objVal])
const onHighlight=(ScrapedObject)=>{
  if(!ScrapedObject.xpath.startsWith('iris')){
    setHighlightedCustname(ScrapedObject.custname)
    let objVal = { ...ScrapedObject };
    dispatch(objValue(objVal));

    
    highlightScrapElement_ICE(ScrapedObject.xpath,ScrapedObject.url,typesOfAppType,ScrapedObject.top,ScrapedObject.left,ScrapedObject.width,ScrapedObject.height,true)
      .then(data => {
        if (data === "Invalid Session") return RedirectPage(history);
        if (data === "fail") console.log('err')
      })
      .catch(error => console.error("Error while highlighting. ERROR::::", error));
  }
}
const newlyFound=(tab)=>{
return (
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginLeft:'0.5rem'}}>
    <Checkbox onChange={()=>{}}
            checked={(checked.length>0 && tab.view[3].newElements)?(checked.every(
              (item) => item.checked ===true
            ) && checked.length===tab.view[3].newElements.new_obj_in_screen.length):false}
             /> 
  <span className='header-name__changedObj' style={{marginLeft:'0.5rem'}}>
    <span>Newly Found Elements</span>
    <span>{`(${tab.view[3].newElements.new_obj_in_screen.length})`}</span>
    <span><img src="static/imgs/brain.png" className='accordion_icons'></img></span>
    </span>
  
  <div>
    <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
    <Dropdown style={{border:'1px solid #605BFF'}}disabled={!checkedNewlyElements.length} value={selectedAction} onChange={(e) => {setSelectedAction(e.value);setAddedElements({visible:true,tab:tab,selectedAction:e.value})}} options={[{name:'Add Element',value:'addelem'},{name:'Add to Test Step',value:'addteststep'}]} optionLabel="name" 
       placeholder="Choose Action" className="w-full md:w-9.5rem" />
      {/* {(selectedAction && checkedNewlyElements.length>0)?<Button onClick={()=>setAddedElements({visible:true,tab:tab})} label="Save" className="update-btn" size="small" style={{borderRadius:'3px',fontSize:'13px',width:'5rem'}} />:null} */}
        
       
      </div>
  </div>

  </div>
  
)
}
const notfoundelement=(tab)=>{
return (
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginLeft:'0.5rem'}}>
    
  <span className='header-name__changedObj' style={{marginLeft:'0.5rem'}}>
    <span>Unchanged elements</span>
    <span>{`(${tab.view[1].notchangedobject.length})`}</span>
  <span><img src="static/imgs/success.png" className='accordion_icons'></img></span>
  {/* <span>Count:<Badge value={tab.view[1].notchangedobject.length} severity="danger"></Badge></span> */}
  </span>
  </div>
   

  
  
)
}

const onCheckChanged = (e,tab) => {
let checked=[]
if(checkedChanged.length){
  checkedChanged.filter(element=>element.screenName!==tab.screenName)
  if(checkedChanged.filter(element=>element.screenName!==tab.screenName).length){
   checked=[]
  }
  else{
    checked=checkedChanged
  }
}
let _selectedCheckbox = [...checked];


if (e.checked)_selectedCheckbox.push({element:e.value,checked:true,screenName:tab.screenName});
else
_selectedCheckbox = _selectedCheckbox.filter(
    (element) => element.element.custname !== e.value.custname
  );

setCheckedChanged(_selectedCheckbox);
};
const onCheckNotFound=(e,tab)=>{
let checked=[]
if(checkedNotFound.length){
  checkedNotFound.filter(element=>element.screenName!==tab.screenName)
  if(checkedNotFound.filter(element=>element.screenName!==tab.screenName).length){
   checked=[]
  }
  else{
    checked=checkedNotFound
  }
}
let _selectedCheckbox = [...checked];


if (e.checked)_selectedCheckbox.push({element:e.value,checked:true,screenName:tab.screenName});
else
_selectedCheckbox = _selectedCheckbox.filter(
    (element) => element.element.custname !== e.value.custname
  );

setCheckedNotFound(_selectedCheckbox);
};
const onCheckNewlyFound=(e,tab)=>{
let checked=[]
if(checkedNewlyElements.length){
  checkedNewlyElements.filter(element=>element.screenName!==tab.screenName)
  if(checkedNewlyElements.filter(element=>element.screenName!==tab.screenName).length){
   checked=[]
  }
  else{
    checked=checkedNewlyElements
  }
}
let _selectedCheckbox = [...checked];


if (e.checked)_selectedCheckbox.push({element:e.value,checked:true,screenName:tab.screenName});
else
_selectedCheckbox = _selectedCheckbox.filter(
    (element) => element.element.custname !== e.value.custname
  );

setCheckedNewlyElements(_selectedCheckbox);
};
const ondeleteNotFound=(tab)=>{
let scenarioImpact=[...scenraioLevelImpactedData]

let scenarioComparisionData=[]
let deletedArr=[]
let newOrderList=[]
for (let index=0;index<checkedNotFound.length;index++){
deletedArr.push(checkedNotFound[index].element.ObjId)
}
tab.currentScrapedObjects.filter(item => {
if (deletedArr.includes(item._id)) {
return false
}
else {
newOrderList.push(item.objId)
}
})

let screenToBeUpdated=scenraioLevelImpactedData.find(screen=>screen.screenName===tab.screenName)
let index=scenraioLevelImpactedData.findIndex(screen=>screen.screenName===tab.screenName)
let deletedNotFound=screenToBeUpdated.view[2].notfoundobject.filter(function(objFromA) {
return !checkedNotFound.find(function(objFromB) {
return objFromA.custname === objFromB.element.custname

})
})

let view=[...screenToBeUpdated.view]
view[2].notfoundobject=deletedNotFound
screenToBeUpdated.view=view
scenarioImpact.splice(index, 1, screenToBeUpdated)
setScenarionLevelImpactedData(scenarioImpact)
setCheckedNotFound([])

var screenComparisonKeys = {}

                   screenComparisonKeys['screenId'] = tab.screenId


                    screenComparisonKeys['unchanged'] =  screenToBeUpdated.view[1].notchangedobject.length

                    screenComparisonKeys['changed']=screenToBeUpdated.view[0].changedobject.length

                    screenComparisonKeys['notfound'] =  deletedNotFound.length

                    screenComparisonKeys['statusCode'] = screenComparisonKeys['notfound']==0 && screenComparisonKeys['changed']==0 ? "SI" : screenComparisonKeys['notfound']==0 ? "WI" : "DI"

// setScenarionLevelImpactedData(screenToBeUpdated)'
scenarioComparisionData.push(screenComparisonKeys)

scrapeApi.updateScenarioComparisionStatus(typesOfAppType, fetchingDetails["_id"], scenarioComparisionData);


let arg = {
'deletedObj': deletedArr,
'modifiedObj': [],
'addedObj': {view: [] },
'screenId': tab.screenId,
'userId': userInfo.user_id,
'roleId': userInfo.role,
'param': 'saveScrapeData',
'orderList': newOrderList
}
scrapeApi.updateScreen_ICE(arg)
    .then(data => {
        if (data.toLowerCase() === "invalid session") return RedirectPage(history);
        if (data.toLowerCase() === 'success') {
          toast.current.show({ severity: 'success', summary: 'Success', detail: `${tab.screenName} elements deleted successfully` , life: 10000 });
          setImpactAnalysisDone({addedElement:true,addedTestStep:false})
          opendesignstep(tab.screenName)
            // dispatch(CompareFlag(false))
            // dispatch(CompareElementSuccessful(true))
        } else {
          toastErrorMsg('Error while deleting  elements.');

            // dispatch(CompareFlag(false))
        }
    })
    .catch(error => console.error(error) );
}
const oncheckAllChanged=(e,tab)=>{
  let checked=[]
  if (e.checked){
    tab.view[0].changedobject.map(element=>checked.push({element:element,checked:true,screenName:tab.screenName}))
    setCheckedChanged(checked)

  }
  else{
    setCheckedChanged([])
  }

}
const headerScreen=(tab)=>{
return (
  <>
  <Tooltip target={`.screen_${tab.screenName}`}  content={tab.screenName} position="bottom"/>
  <div className={`screen_${tab.screenName}`}  style={{textOverflow:'ellipsis',width:'8rem',whiteSpace:'nowrap',overflow:'hidden'}}>{tab.screenName}</div>
  </>
)
}
const toastError = (erroMessage) => {
  if (erroMessage.CONTENT) {
    toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
  }
  else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
}
const toastErrorMsg=(errorMessage)=>{
  toast.current.show({ severity: 'error', summary: 'Error', detail: errorMessage, life: 5000 });
}
const toastWarnMsg=(errorMessage)=>{
  toast.current.show({ severity: 'warn', summary: 'Warning', detail: errorMessage, life: 5000 });
}

const toastSuccess = (successMessage) => {
  if (successMessage.CONTENT) {
    toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
  }
  else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
}


const savesScrapedElemenets = (tab) => {

let scrapeItemsL = [...checkedNewlyElements.map(object=>object.element)];
let scenarioImpact=[...scenraioLevelImpactedData]

// let added = Object.keys(newScrapedCapturedData).length ? { ...newScrapedCapturedData } : { ...mainScrapedData };
let views = [];
let orderList = [];
let modifiedObjects = []
for (let scrapeItem of scrapeItemsL) {
  if (!Array.isArray(scrapeItem)) {
    if (!scrapeItem.objId) {
      if (scrapeItem.isCustom) views.push({ custname: scrapeItem.custname, xpath: scrapeItem.xpath, tag: scrapeItem.tag, tempOrderId: scrapeItem.tempOrderId });
      else views.push({ ...scrapeItem, custname: scrapeItem.custname, tempOrderId: scrapeItem.tempOrderId,xpath:scrapeItem.xpath});
      orderList.push(scrapeItem.tempOrderId);
    }
    else orderList.push(scrapeItem.objId);
  }
}
let params = {
  'deletedObj': [],
  'modifiedObj': modifiedObjects,
  'addedObj': { scrapedURL:tab.scrapedURL,view: views },
  'screenId': tab.screenId,
  'userId': userInfo.user_id,
  'roleId': userInfo.role,
  'param': 'saveScrapeData',
  'orderList': orderList
}

scrapeApi.updateScreen_ICE(params)
.then(data => {
  if (data.toLowerCase() === "invalid session") return RedirectPage(history);
  if (data.toLowerCase() === 'success') {
    // toast.current.show({ severity: 'success', summary: 'Success', detail: ` Elements added to ${tab.screenName} successfully ` , life: 10000 });
    let screenToBeUpdated=scenraioLevelImpactedData.find(screen=>screen.screenName===tab.screenName)
          let index=scenraioLevelImpactedData.findIndex(screen=>screen.screenName===tab.screenName)
          let remainingNewlyFound=screenToBeUpdated.view[3].newElements.new_obj_in_screen.filter(function(objFromA) {
            return !checkedNewlyElements.find(function(objFromB) {
              return objFromA.custname === objFromB.element.custname
            })
          })
          
          let view=[...screenToBeUpdated.view]
          view[3].newElements={new_obj_in_screen:remainingNewlyFound,new_obj_for_not_found:view[3].newElements.new_obj_for_not_found}
          screenToBeUpdated.view=view
          scenarioImpact.splice(index, 1, screenToBeUpdated)
          setScenarionLevelImpactedData(scenarioImpact)
          
          
          if(addedElements.selectedAction!=="addelem"){
            let newlyAddedTestCase=[]
            let  testCaseDetails
            let lastTestStep=fetchingDetails.children.filter(screen=>screen.name===tab.screenName)[0].children
            
            
            let startStep=lastTestStep[lastTestStep.length-1].stepsLen+1
            for(let i=0;i<checkedNewlyElements.length;i++){
              newlyAddedTestCase.push({
                "stepNo": startStep,
                "objectName": ' ',
                "custname":checkedNewlyElements[i].element.custname ,
                "keywordVal": 'click',
                "inputVal": [""],
                "outputVal": '',
                "remarks": "",
                "url": ' ',
                "appType": "Web",
                "addDetails": "",
                "cord": '',
                "addTestCaseDetails": "",
                "addTestCaseDetailsInfo": ""
            })
            startStep++
            }
            DesignApi.readTestCase_ICE(userInfo, lastTestStep[lastTestStep.length-1]._id, lastTestStep[lastTestStep.length-1].name, 0,tab.screenName)
            .then(response => {
                    if (response === "Invalid Session") return RedirectPage(history);
                    let data=response.testcase
                    testCaseDetails={
                      testCaseName:lastTestStep[lastTestStep.length-1].name,
                      testCaseiD:lastTestStep[lastTestStep.length-1]._id,
                      testCases:[...data,...newlyAddedTestCase],
                      custNames:checkedNewlyElements.map(element=>element.element.custname.trim())
                      
    
                    }
                   
                    if(testCaseDetails?.testCases?.length){
    
                    
           
            DesignApi.updateTestCase_ICE(lastTestStep[lastTestStep.length-1]._id, lastTestStep[lastTestStep.length-1].name, testCaseDetails.testCases, userInfo, 0 /**versionnumber*/, false, [])
            .then(data => {
              if(data=="success"){
                setTestCaseDetailsAfterImpact(testCaseDetails)
                setImpactAnalysisDone({addedElement:false,addedTestStep:true})
                opendesignstep(tab.screenName)
                
                setSelectedAction(null)
                

              }
            
            
      // dispatch(CompareFlag(false))
      // dispatch(CompareElementSuccessful(true))
  })
  .catch(error=> console.log(error))

}
})
}}})
   

      // dispatch(CompareFlag(false))
      setCheckedNewlyElements([])
}
const Addelementfooter=()=>{
return (
    <div>
      {selectedAction==="addelem"?
      <div>Are you sure you want to <span style={{fontWeight:'700',color:'red'}}>add element</span></div>: 
      <div>Are you sure you want to <span style={{fontWeight:'700',color:'red'}}>add element to test step?</span></div>
}
    </div>)

} 
const elementTypeProp =(elementProperty) =>{
  switch(elementProperty) {
    case "abbr" || "acronym" || "aside" || "body" || "data" || "dd" || "dfn" || "div" || "embed" || "figure" || "footer" || "frame" || "head" ||
          "iframe" || "kbd" || "main" || "meta" || "noscript" || "object" || "output" || "param" || "progress" || "rt" || "samp" || "section" || "span"
          || "style" || "td" || "template" :
       return "Content";

    case "a" || "link":
       return "Link";

    case "address" || "article" || "b" || "bdi" || "bdo" || "big" || "blockquote" || "caption" || "center" || "cite" || "code" || "del" || "details" 
         || "dt" || "em" || "figcaption" ||  "h1" || "h2" || "h3" || "h4" || "h5" || "h6" || "header" || "i" || "ins" || "label" || "legend" || "mark" 
         || "noframes" || "p" || "pre" || "q" || "rp" || "ruby" || "s" || "small" || "strike" || "strong" || "sub" || "summary" || "sup" || "th" || "time"
         || "title" || "tt" || "u":
      return "Text";

    case "button" :
      return "Button";
      
    case "img" || "map" || "picture" || "svg" :
      return "Image";

    case "col" || "colgroup" || "nav" :
      return "Navigation Menus";

    case "datalist" || "select" :
      return "Dropdown";

    case "dir" || "dl" || "li" || "ol" || "optgroup" || "option" || "ul" :
      return "List";

    case "form" || "fieldset" :
      return "Forms";
      
    case "input" || "textarea" :
      return "Textbox/Textarea";
      
    case "table" || "tbody" || "tfoot" || "thead" || "tr":
      return "Table";

    default:
      return "Element";
   }
}

    return (
        <Fragment>
                    {overlay && <ScreenOverlayImpact content={overlay} marqueItems={marqueItem} />}

<Toast ref={toast} position="bottom-center" baseZIndex={1200}></Toast>

 <Dialog draggable={false} className='create__object__modal' header={`Impact Analysis -${fetchingDetails && fetchingDetails["name"]}`} style={{ height: "45rem", width: "50vw" }} visible={analyzeScenario} onHide={() => {dispatch(AnalyzeScenario(false));setScenarionLevelImpactedData(null);setCheckedChanged([]);setCheckedNotFound([]);setCheckedNewlyElements([]);setFetchingDetailsImpact(false)}}   >
<div className="card">
<>
{/* <button className="pi pi-angle-right button-delete" onClick={()=>{activeIndex>(scenraioLevelImpactedData.length-1)?setActiveIndex(0):setActiveIndex(activeIndex+1)}} style={{background:'transparent',position:'absolute',right:'1rem',top:'4.5rem',zIndex:'1111',border:'none',fontSize:'22px',color:'#605BFF'}}></button> */}
  <TabView scrollable={scenraioLevelImpactedData && scenraioLevelImpactedData.length>6}
  activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
      {scenraioLevelImpactedData && scenraioLevelImpactedData.map((tab) => {
          return (
              <TabPanel key={tab.screenName} header={headerScreen(tab)} >
              <Accordion multiple activeIndex={[0]}>
{scenraioLevelImpactedData && tab?.view[0].changedobject.length && <AccordionTab  contentClassName='' className="accordin__elem accordion__newlyadded" header={accordinHedaerChangedElem(tab)}>
<div className='accordion_changedObj'>
{scenraioLevelImpactedData && tab?.view && tab.view[0].changedobject.map((element, index) => (

<div className="changed__elem" key={index} style={{display:'flex',gap:'0.5rem',marginLeft:'1.3rem'}}>
<Checkbox  inputId={element.custname}
value={element}
onChange={(e)=>onCheckChanged(e,tab)}
checked={checkedChanged.some(
  (item) => item.element.custname === element.custname
)}
 /> 
<p>{element.custname}</p>
</div>))}
</div>


</AccordionTab>
}


{scenraioLevelImpactedData && tab?.view && tab?.view[2].notfoundobject.length &&<AccordionTab  contentClassName='' className="accordin__elem accordion__notfound" header={accordinHedaernotFoundElem(tab)} >
<div className='accordion_notfoundObj'>
{scenraioLevelImpactedData && tab?.view && tab.view[2].notfoundobject.map((element, index) => (

<div className="changed__elem" key={index} style={{display:'flex',gap:'0.5rem',marginLeft:'1.3rem'}}> 
<Checkbox  inputId={element.custname}
value={element}
onChange={(e)=>{onCheckNotFound(e,tab)}}
checked={checkedNotFound.some(
  (item) => item.element.custname === element.custname
)}
 /> 
<p>{element.custname}</p>
</div>

))}
</div>
</AccordionTab>
}



{scenraioLevelImpactedData && tab?.view && tab?.view[3].newElements.new_obj_in_screen.length &&<AccordionTab contentClassName='' className="accordin__elem accordion__newlyadded"  header={newlyFound(tab)}>
<div className='accordion_unchangedObj'>
{scenraioLevelImpactedData && tab?.view && tab?.view[3].newElements.new_obj_in_screen.map((element, index) => (

<div className="changed__elem" style={{display:'flex',gap:'0.5rem',marginLeft:'1.3rem',alignItems:'center'}} key={index} >
<Checkbox  inputId={element.custname}
value={element}
onChange={(e)=>{onCheckNewlyFound(e,tab)}}
checked={checkedNewlyElements.some(
  (item) => item.element.custname === element.custname
)}
 /> 
<p>{element.custname}</p>
<img data-test="eyeIcon" className="ss_eye_icon" 
                                                          onClick={()=>onHighlight(element)} 
                                                          src={(activeEye && element.custname===objVal.custname) ? 
                                                            "static/imgs/eye_icon_blue.svg" : 
                                                            "static/imgs/eye_icon_black.svg"} 
                                                            style={{height:'2rem'}}
                                                          alt="eyeIcon"
                                                    
                                                    />
                                                          
</div>

))}
</div>
</AccordionTab>

}
{scenraioLevelImpactedData && tab?.view && tab?.view[1].notchangedobject.length &&<AccordionTab contentClassName='' className="accordin__elem accordion__newlyadded"  header={notfoundelement(tab)}>
<div className='accordion_unchangedObj'>
{scenraioLevelImpactedData && tab?.view && tab.view[1].notchangedobject.map((element, index) => (

<div className="changed__elem" style={{display:'flex',gap:'0.5rem',marginLeft:'1.3rem'}} key={index} >
<p>{element.custname}</p>
</div>

))}
</div>
</AccordionTab>

}

</Accordion>
              </TabPanel>
          );
      })}
  </TabView>
  
  </>

</div>
</Dialog>
{/* <CompareScenario /> */}
{/* <Dialog header="Header" visible={true} style={{ width: '50vw' }} onHide={() => {}}>
<p className="m-0">
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
</Dialog> */}
{impactAnalysisScreenLevel && <MapElement
        isOpen={"mapObject"}
        onClose={()=>{}}
        setShow={()=>{}}
        toastSuccess={toastSuccess}
        toastError={toastError}
        orderList={orderList}
        fetchingDetails={fetchingDetailsScreen}
        elementTypeProp={elementTypeProp}
        isReplaceImpact={true}
        scenraioLevelImpactedData={scenraioLevelImpactedData}
        setScenarionLevelImpactedData={setScenarionLevelImpactedData}
        scenarioId={fetchingDetails['_id']}
      ></MapElement>
      }
{visibleCaptureElement && <CaptureModal visibleCaptureElement={visibleCaptureElement} setVisibleCaptureElement={setVisibleCaptureElement} fetchingDetails={fetchingDetailsForGroup?fetchingDetailsForGroup['parent']:fetchingDetails} testSuiteInUse={testSuiteInUse}/>}
{visibleDesignStep && <DesignModal   fetchingDetails={fetchingDetailsImpact?fetchingDetailsImpact:fetchingDetailsForGroup?fetchingDetailsForGroup:fetchingDetails} appType={typesOfAppType} visibleDesignStep={visibleDesignStep} setVisibleDesignStep={setVisibleDesignStep} impactAnalysisDone={impactAnalysisDone} testcaseDetailsAfterImpact={testcaseDetailsAfterImpact} setImpactAnalysisDone={setImpactAnalysisDone} testSuiteInUse={testSuiteInUse}/>}
            <ContextMenu model={menuItemsModule} ref={menuRef_module}/>

             <Dialog  className='Scenario_dialog' visible={visibleScenario} header={`Add Multiple ${appType !== "Webservice" ?'Testcase': 'APIs'}`} style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleScenario(false)}  footer={footerContentScenario}>
        {/* <Toolbar  className="toolbar_scenario" start={startContent}  /> */}
       
        <div style={{ height: '100%', overflow: 'auto' }}>
            <DataTable value={addScenario} tableStyle={{ minWidth: '20rem' }} headerCheckboxSelection={true} scrollable scrollHeight="calc(100% - 38px)" > 
              {columns.map((col)=>(
              <Column field={col.field} header={col.header} body={col.body} headerClassName={col.headerClassName} 
              headerStyle={col.field==='checkbox'?{ justifyContent: "center", width: '10%', minWidth: '4rem', flexGrow: '0.2' }:null} 
              bodyStyle={ col.field==='checkbox'?{textAlign: 'left', flexGrow: '0.2', minWidth: '4rem' }:null}
              style={col.field==='checkbox'?{ minWidth: '3rem' }:null}></Column>
              ))}   
          
            </DataTable>
            <button className='add_row_btn'  disabled={addScenario.length > 0 && inputValue===""} style={(addScenario.length > 0 && inputValue==="") ? {opacity: '0.5', cursor: 'no-drop'} : {opacity: '1', cursor: 'pointer'}} onClick={() =>addRowScenario()} >+ Add Row </button> 
            </div>
            </Dialog>

            <Dialog  className='Scenario_dialog' header={`Add Multiple ${appType !== "Webservice" ? 'Screens' : 'Requests'}`} visible={visibleScreen} style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleScreen(false)}  footer={footerContentScreen}>
            {/* <Toolbar  className="toolbar_scenario" start={startContent}  /> */}
            <div style={{ height: '100%', overflow: 'auto' }}>
            <DataTable value={addScreen}  tableStyle={{ minWidth: '20rem' }}  headerCheckboxSelection={true} scrollable scrollHeight="calc(100% - 38px)" >
              {columnsScreen.map((col)=>(
              <Column field={col.field} header={col.header} body={col.body} headerClassName={col.headerClassName}  
              headerStyle={col.field==='checkbox'?{ justifyContent: "center", width: '10%', minWidth: '4rem', flexGrow: '0.2' }:null} 
              bodyStyle={ col.field==='checkbox'?{textAlign: 'left', flexGrow: '0.2', minWidth: '4rem' }:null}
              style={col.field==='checkbox'?{ minWidth: '3rem' }:null}></Column>
              ))}    
            </DataTable>
            <button className='add_row_btn' disabled={addScreen.length > 0 && inputValScreen===""} style={(addScreen.length > 0 && inputValScreen==="") ? {opacity: '0.5', cursor: 'no-drop'} : {opacity: '1', cursor: 'pointer'}} onClick={() =>addRowScreen()} >+ Add Row </button> 
            </div>
            </Dialog>

            
            <Dialog  className='Scenario_dialog' header="Add Multiple Test Steps" visible={visibleTestStep} style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleTestStep(false)}  footer={footerContentTeststep}>
            <div style={{ height: '100%', overflow: 'auto' }}>
            <DataTable value={addTestStep} tableStyle={{ minWidth: '20rem' }} headerCheckboxSelection={true} scrollable scrollHeight="calc(100% - 38px)">
              {columnsTestStep.map((col)=>(
              <Column field={col.field} header={col.header} body={col.body} headerClassName={col.headerClassName} 
              headerStyle={col.field==='checkbox'?{ justifyContent: "center", width: '10%', minWidth: '4rem', flexGrow: '0.2' }:null} 
              bodyStyle={ col.field==='checkbox'?{textAlign: 'left', flexGrow: '0.2', minWidth: '4rem' }:null}
              style={col.field==='checkbox'?{ minWidth: '3rem' }:null}></Column>
              ))}  
            </DataTable>
            <button className='add_row_btn'  disabled={addTestStep.length > 0 && inputValTestStep===""} style={(addTestStep.length > 0 && inputValTestStep==="") ? {opacity: '0.5', cursor: 'no-drop'} : {opacity: '1', cursor: 'pointer'}} onClick={() =>addRowTestStep()} >+ Add Row </button> 
            </div>
            </Dialog>
            <Dialog
        className='compare__object__modal_canvas'
        header={` Analyze Scenario -${fetchingDetails && fetchingDetails["name"]}` }      
        style={{ height: "21.06rem", width: "24.06rem" }}
        visible={visibleScenarioAnalyze}
        onHide={()=>setVisibleScenarioAnalyze(false)} footer={footerCompare}>
        <div className='compare__object'>
          <span className='compare__btn'>
            <p className='compare__text'>List Of Browsers</p>
          </span>
          <span className='browser__col'>
            <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/chrome.png' />Google Chrome {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(2)} className={selectedSpan === 2 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png' />Mozilla Firefox {selectedSpan === 2 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(8)} className={selectedSpan === 8 ? 'browser__col__selected' : 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png' />Microsoft Edge {selectedSpan === 8  && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
          </span>
        </div>
      </Dialog>
        <div className='tagtestcase'>
          <Dialog
            className='Tag_dialog'
            header="Tag a Test Case"
            visible={visibleTag}
            style={{ width: '35vw', maxHeight: '20vw', overflow: "auto", contentStyle: { background: 'blue' } ,backgroundColor:"blue"}}
            footer={footerContentTag}
            onHide={handleDialogHide}
          >
            {/* <DialogHeader className="tag-header">Tag a Testcase</DialogHeader> */}
            <div className='Tag_dialog'>
              <div style={{ maxHeight: '10%', overflow: 'auto' }}>
                <div className='tag-input'>
                  <div className="card flex justify-content-center">
                    <div className="flex flex-column gap-2">
                      <div className='tagname'>Tags</div>
                      <div>
                        <AutoComplete
                        key={visibleTag ? 'visible' : 'hidden'}
                          id="username"
                          className='inputtag'
                          value={inputValue}
                          suggestions={suggestions}
                          completeMethod={(e) => setSuggestions(alltag.filter(tag => tag.toLowerCase().includes(e.query.toLowerCase())))}
                          onChange={(e) => handleInputTagChange(e)}
                          onSelect={(e) => handleSuggestionSelect(e)}
                          onFocus={() => setShowSuggestions(true)}
                          placeholder="Enter a tag name"
                          onKeyDown={handleKeyDown}

                        >
                          {/* <img src="static/imgs/tag.svg" alt="Tag Icon" className="tagplace" /> */}
                        </AutoComplete>
                      </div>
                    </div>
                    <img src="static/imgs/Add_icon.svg" onClick={handleAddTag} className='plus'></img>
                    <Tooltip target=".plus" position="right" content="Add tag(s)."></Tooltip>
                  </div>
                </div>
                <Card className='tagcards'>
                  <div className="p-mt-2 cardstag">
                    {fetchingDetails && fetchingDetails._id && tags[fetchingDetails._id]?.length > 0 ? (
                      renderTags()
                    ) : (
                      <div>
                        <img src="static/imgs/tagimg.png" className='cardimg'></img>
                        <p className='tagtitle'>No tags available.</p>
                      </div>
                    )
                    }
                  </div>

                </Card>
                {fetchingDetails && fetchingDetails._id && tags[fetchingDetails._id]?.length === 0 && (
                  <p className='taginstruction'>Provide a tag name and press enter to add tag(s).</p>
                )}
              </div>
            </div>
          </Dialog>
        </div>
             <ConfirmDialog />
             <ConfirmDialog visible={deletedElements.visible} className='newlyelement__footer' onHide={() => setDeletedElements({visible:false,tab:null})} message="Are you sure you want to delete selected element(s)?" 
             header="Delete Element Confirmation"acceptClassName= 'p-button-danger'
             icon="pi pi-info-circle" accept={()=>ondeleteNotFound(deletedElements.tab)} reject={() => setDeletedElements({visible:false,tab:null})} />
             <ConfirmDialog visible={addedElements.visible} onHide={() => setAddedElements({visible:false,tab:null})} message={Addelementfooter}
             header={selectedAction==="addelem"?"Add Element Confirmation":"Add to Test Step"} acceptClassName= 'update-btn-popup'
             icon="pi pi-info-circle" accept={()=>savesScrapedElemenets(addedElements.tab)} reject={() => setDeletedElements({visible:false,tab:null})} />
            {/* {(ctrlBox !== false)?<ControlBox  nid={ctrlBox} taskname ={taskname} setMultipleNode={setMultipleNode}  setCtrlBox={setCtrlBox} setInpBox={setInpBox} Avodialog={confirm1} ctScale={ctScale} clickAddNode={clickAddNode} clickDeleteNode={clickDeleteNode} CanvasRef={CanvasRef}/>:null} */}
            {/* {(ctrlBox !== false)?<ControlBox setShowDesignTestSetup={props.setShowDesignTestSetup} ShowDesignTestSetup={props.ShowDesignTestSetup} setTaskBox={setTaskBox} nid={ctrlBox} taskname ={taskname} setMultipleNode={setMultipleNode} clickAddNode={clickAddNode} clickDeleteNode={clickDeleteNode} setCtrlBox={setCtrlBox} setInpBox={setInpBox} ctScale={ctScale}/>:null} */}
            {(inpBox !== false)?<InputBox setCtScale={setCtScale} zoom={zoom} node={inpBox} dNodes={[...dNodes]} setInpBox={setInpBox} setCtrlBox={setCtrlBox} ctScale={ctScale} />:null}
            {(multipleNode !== false)?<MultiNodeBox count={count} node={multipleNode} setMultipleNode={setMultipleNode} createMultipleNode={createMultipleNode}/>:null}
            {visibleDesignStepGroups && <DesignTestStepsGroups visibleDesignStepGroups={visibleDesignStepGroups} fetchingDetailsForGroup={fetchingDetailsImpact?fetchingDetailsImpact:fetchingDetailsForGroup} setVisibleDesignStepGroups={setVisibleDesignStepGroups} visibleCaptureElement={visibleCaptureElement} setVisibleCaptureElement={setVisibleCaptureElement} testSuiteInUse={testSuiteInUse} appType={typesOfAppType}  visibleDesignStep={visibleDesignStep} setVisibleDesignStep={setVisibleDesignStep} impactAnalysisDone={impactAnalysisDone} testcaseDetailsAfterImpact={testcaseDetailsAfterImpact} setImpactAnalysisDone={setImpactAnalysisDone} setFetchingDetailsForGroup={setFetchingDetailsForGroup} />}
            {visibleCaptureAndDesign && <NavigatetoCaptureDesign visibleCaptureAndDesign={visibleCaptureAndDesign} fetchingDetails={fetchingDetailsImpact?fetchingDetailsImpact:fetchingDetails} setVisibleCaptureAndDesign={setVisibleCaptureAndDesign} visibleCaptureElement={visibleCaptureElement} setVisibleCaptureElement={setVisibleCaptureElement} testSuiteInUse={testSuiteInUse} appType={typesOfAppType}  visibleDesignStep={visibleDesignStep} setVisibleDesignStep={setVisibleDesignStep} impactAnalysisDone={impactAnalysisDone} testcaseDetailsAfterImpact={testcaseDetailsAfterImpact} setImpactAnalysisDone={setImpactAnalysisDone} designClick={designClick} setDesignClick={setDesignClick} dNodes={dNodes} setFetchingDetails={setFetchingDetails}/>}
            <ContextMenu className='menu_items' model={menuItemsModule} ref={menuRef_module}/>
            <ContextMenu model={menuItemsScenario} ref={menuRef_scenario} />
            <ContextMenu model={menuItemsScreen} ref={menuRef_screen} />
            <ContextMenu model={menuItemsTestSteps} ref={menuRef_Teststep}/>
            <ContextMenu model={menuItemTestStepGroups} ref={menuRef_Teststepgroup}/>
            {props.GeniusDialog?null:<NavButton setCtScale={setCtScale} ctScale={ctScale} zoom={zoom}/>}
            {/* <Legends/> */}
            {props.GeniusDialog?<Legends />:null}
            {testSuiteInUse? 
            <div className='readonly__container'>
              <Tooltip target={`.infoinuse`}  content={`${props.module.currentlyInUse}`} position="bottom"/>
              <Tooltip target={`.viewonly`}  content={`View the files,but make no changes.`} position="bottom"/>
              <div className='viewonly__container'>
                <span style={{letterSpacing:'1px',fontSize:'1.3rem'}} className='readonlytext'>Read only view</span>
                <img src={"static/imgs/view_only_access_icon.svg"} style={{height:'29px'}} className='viewonly'></img>
              </div>
              <div className='avatar__container'>
                <span style={{fontSize:'23px'}} className='inuseby'>In use by:</span>
                <span style={{display:'flex',width:'34px',height:'34px',borderRadius:'9px',background:'#DEE2E6',alignItems:'center',justifyContent:'center' ,fontSize:'21px'}} className='infoinuse'>{props.module.currentlyInUse && props.module.currentlyInUse[0]}</span>
              </div>
            </div>:null}
            {props.GeniusDialog?null:<SearchBox  setCtScale={setCtScale} zoom={zoom}/>}
          {((props.GeniusDialog|| testSuiteInUse) ) ? null :<SaveMapButton createnew={createnew} verticalLayout={verticalLayout} dNodes={[...dNodes]} setBlockui={setBlockui} setDelSnrWarnPop ={setDelSnrWarnPop} toast={props.toast}/>}
            {(props.GeniusDialog|| testSuiteInUse) ? null: <ExportMapButton setBlockui={setBlockui} displayError={displayError}/>}
            {props.gen?<svg id="mp__canvas_svg_genius" className='mp__canvas_svg_genius' ref={CanvasRef}>
                <g className='ct-container-genius'>
                {Object.entries(links).map((link)=>{
                return(<path id={link[0]} key={link[0]+'_link'} className={"ct-link"+(link[1].hidden?" no-disp":"")} style={{stroke:'black',fill: 'none',opacity: 1}} d={link[1].d}></path>)
                })}
                {Object.entries(nodes).map((node)=>
                    <g id={'node_'+node[0]} key={node[0]} className={"ct-node"+(node[1].hidden?" no-disp":"")} data-nodetype={node[1].type} transform={node[1].transform} >
                       <image  onClick={(e)=>nodeClick(e)} style={{height:'45px',width:'45px',opacity:(node[1].state==="created")?0.5:1}} className="ct-nodeIcon" xlinkHref={node[1].img_src}></image>
                       <text className="ct-nodeLabel" textAnchor="middle" x="20" title={node[1].title} y="50">{node[1].name}</text>
                        <title val={node[0]} className="ct-node-title">{node[1].title}</title>
                        {(node[1].type!=='testcases')?
                        <circle onClick={(e)=>clickCollpase(e)} className={"ct-"+node[1].type+" ct-cRight"+(!dNodes[node[0]]._children?" ct-nodeBubble":"")} cx={verticalLayout ? 20 : 44} cy={verticalLayout ? 55 : 20} r="4"></circle>
                        :null}
                        {(node[1].type!=='modules')?
                        <circle 
                        onMouseUp={(e)=>moveNode(e,'KeyUp')}
                        onMouseDown={(e)=>moveNode(e,'KeyDown')}
                        cx={verticalLayout ? 20 : -3} cy={verticalLayout ? -4 : 20}
                        className={"ct-"+node[1].type+" ct-nodeBubble"} r="4"></circle>
                        :null}
                    </g>)}
                </g>
            </svg>:
            <svg id="mp__canvas_svg" className='mp__canvas_svg' ref={CanvasRef}>
              {typeOfView !== 'mindMapView' && <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="12" markerHeight="12" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z"></path>
                </marker>
              </defs>}
            <g className='ct-container'>
            {Object.entries(links).map((link)=>{
            return(<path id={link[0]} key={link[0]+'_link'} className={"ct-link"+(link[1].hidden?" no-disp":"")} style={{stroke:'black',fill: 'none',opacity: 1}} markerEnd={link[0].startsWith('link-0-')?"":'url(#arrow)'} d={link[1].d}></path>)
            })}
            {Object.entries(nodes).map((node)=>
                <g id={'node_'+node[0]} key={node[0]} className={"ct-node"+(node[1].hidden?" no-disp":"")} data-nodetype={node[1].type} transform={node[1].transform}>
                   <image onClick={(e)=>nodeClick(e)} onMouseDownCapture={(e)=>{handleContext(e,node[1].type,node[1].state)}} style={{height:'45px',width:'45px',opacity:(node[1].state==="created")?0.5:1}} className="ct-nodeIcon" xlinkHref={node[1].img_src}></image>
                    <text className="ct-nodeLabel" textAnchor="middle" x="20" y="50" title={node[1].title}>{node[1].name}</text>
                    {(node[1].type==="screens" && (node[1].statusCode!==undefined)) ? (
                <g transform={node[1].transformImpact} className='node_'>
                  <image style={node[1].statusCode==="SI"?{height:'40px',width:'40px',opacity:1,transform:'scale(2.5,2.5)'}:{height:'40px',width:'40px',opacity:1}}  xlinkHref={node[1].statusCode==="SI"?"static/imgs/success.gif":"static/imgs/danger_tri.gif"} className="ct-nodeIcon" ></image>
                  <title>{node[1].titleImpact}</title>         

                </g>
                ):null}
                    <title val={node[0]} className="ct-node-title">{node[1].title}</title>         
                    {(node[1].type!=='testcases')?
                    <circle onClick={(e)=>clickCollpase(e)} className={"ct-"+node[1].type+" ct-cRight"+(!dNodes[node[0]]?._children?" ct-nodeBubble":"")} cx={verticalLayout ? 20 : 44} cy={verticalLayout ? 55 : 20} r="4"></circle>
                    :null}
                    {(node[1].type!=='modules')?
                    <circle 
                    onMouseDownCapture={(e)=>typeOfView !== 'mindMapView'?"":moveNode(e,'KeyDown')}
                    onClick={(e)=>typeOfView !== 'mindMapView'?"":moveNode(e,'KeyUp')}
                    cx={verticalLayout ? 20 : -3} cy={verticalLayout ? -4 : 20}
                    className={"ct-"+node[1].type+" ct-nodeBubble"} r="4"></circle>
                    :null}
                </g>)}
            </g>
        </svg>}
            {reuseDelConfirm?<Dialog visible={reuseDelConfirm} header='Confirmation' onHide={()=>setReuseDelConfirm(false)} footer={<>
                        <Button onClick={()=>{reusedDelConfirm()}}label='Delete everywhere'/>
                        <Button onClick={()=>{deleteNodeHere()}} label='Delete current'/>
                        <Button onClick={()=>setReuseDelConfirm(false)} label='Cancel'/>        
                    </>}>
                    <DelReuseMsgContainer message={reuseDelContent}/>
            </Dialog>
            // <ModalContainer 
            //     title='Confirmation'
            //     content= {<DelReuseMsgContainer message={reuseDelContent}/>}
            //     close={()=>setReuseDelConfirm(false)}
            //     footer={
            //         <>
            //             <button onClick={()=>{reusedDelConfirm()}}>Delete everywhere</button>
            //             <button onClick={()=>{deleteNodeHere()}}>Delete current</button>
            //             <button onClick={()=>setReuseDelConfirm(false)}>Cancel</button>        
            //         </>}
            //     modalClass='modal-md'
            // />
            :null}
            {DelConfirm?<Dialog visible={DelConfirm} className='modal-sm' header="Confirmation" onHide={()=>setDelConfirm(false)} footer={<>
                       <Button onClick={()=>{processDeleteNode()}} label='Yes'/>
                        <Button onClick={()=>setDelConfirm(false)} label='No'/>        
                   </>}>
                    <p>Are you sure, you want to Delete it Permanently?</p>
              </Dialog>
            //   <ModalContainer 
            //     title='Confirmation'
            //     content={"Are you sure, you want to Delete it Permanently?"}         
            //     close={()=>setDelConfirm(false)}
            //     footer={
            //         <>
            //             <button onClick={()=>{processDeleteNode()}}>Yes</button>
            //             <button onClick={()=>setDelConfirm(false)}>No</button>        
            //         </>}
            //     modalClass='modal-sm'
            // />
            :null}
            {endToEndDelConfirm?<ModalContainer 
                title='Confirmation'
                content={<DelReuseMsgContainer message={reuseDelContent}/>}                         
                close={()=>setEndToEndDelConfirm(false)}
                footer={
                    <>
                        <button onClick={()=>{processDeleteNode()}}>Yes</button>
                        <button onClick={()=>setEndToEndDelConfirm(false)}>No</button>        
                    </>}
                modalClass='modal-sm'
            />:null}
        </Fragment>
    );
}
const pasteNode = (activeNode,copyNodes,cnodes,clinks,cdNodes,cdLinks,csections,count,verticalLayout) => {
    var dNodes_c = copyNodes.nodes
    var dLinks_c = copyNodes.links
    var nodetype =  d3.select('#'+activeNode).attr('data-nodetype');
    if (d3.select('#'+activeNode).attr('data-nodetype') === nodetype) {
        if (nodetype === 'scenarios') {
            activeNode = activeNode.split("node_")[1]
            //paste to scenarios
            dNodes_c.forEach((e) =>{
                if (e.type === 'screens') {
                    var res = createNode(activeNode,cnodes,clinks,cdNodes,cdLinks,csections,count,e.name,verticalLayout)
                    if(res){                    cnodes = res.nodeDisplay
                        clinks = res.linkDisplay
                        cdNodes = res.dNodes
                        cdLinks = res.dLinks
                        count= {...count,...res.count}
                    }
                    var LinkactiveNode = cdNodes.length-1
                    dLinks_c.forEach((f)=>{
                        if (f.source.id === e.id) {
                            var res = createNode(LinkactiveNode,cnodes,clinks,cdNodes,cdLinks,csections,count,f.target.name,verticalLayout)
                            if(res){
                                cnodes = res.nodeDisplay
                                clinks = res.linkDisplay
                                cdNodes = res.dNodes
                                cdLinks = res.dLinks
                                count= {...count,...res.count}
                            }
                        }
                    })
                }
            });
        }else if(nodetype === 'modules'){
            var activenode_scr;
            //paste to module
            //call $scope.createNode for each node
            dNodes_c.forEach((e)=> {
                if (e.type === 'scenarios') {
                    activeNode = 0;
                    var res = createNode(activeNode,cnodes,clinks,cdNodes,cdLinks,csections,count,e.name,verticalLayout)
                    cnodes = res.nodeDisplay
                    clinks = res.linkDisplay
                    cdNodes = res.dNodes
                    cdLinks = res.dLinks
                    count= {...count,...res.count}
                    activeNode = cdNodes.length-1;
                    activenode_scr = activeNode;
                    dLinks_c.forEach((f) =>{
                        if (f.source.id === e.id && f.target.type === 'screens') {
                            activeNode = activenode_scr;
                            var res = createNode(activeNode,cnodes,clinks,cdNodes,cdLinks,csections,count,f.target.name,verticalLayout)
                            cnodes = res.nodeDisplay
                            clinks = res.linkDisplay
                            cdNodes = res.dNodes
                            cdLinks = res.dLinks
                            count= {...count,...res.count}
                            activeNode = cdNodes.length-1;
                            dLinks_c.forEach(function(g, k) {
                                if (g.source.id === f.target.id && g.source.type === 'screens') {
                                    var res = createNode(activeNode,cnodes,clinks,cdNodes,cdLinks,csections,count,g.target.name,verticalLayout)
                                    cnodes = res.nodeDisplay
                                    clinks = res.linkDisplay
                                    cdNodes = res.dNodes
                                    cdLinks = res.dLinks
                                    count= {...count,...res.count}
                                }
                            });
                        }
                    })
                }

            });
        }
    }
    else if (d3.select('.node-selected').attr('data-nodetype') === 'scenarios') {
        setMsg(MSG.MINDMAP.WARN_SELECT_SCENARIO_PASTE.CONTENT)
        return false
    } else if(d3.select('.node-selected').attr('data-nodetype') === 'modules') {
        setMsg(MSG.MINDMAP.WARN_SELECT_MODULE_PASTE.CONTENT)
        return false
    }
    return {cnodes,clinks,cdNodes,cdLinks,csections,count};
}

// const bindZoomListner = (setCtScale,translate,ctScale,geniusMindmap) => {
    
//     //need global move
//     const g = d3.select(`.ct-container`);
//     const svg = d3.select(`.mp__canvas_svg`)
//     const zoom  = d3.zoom()
//         .scaleExtent([0.1, 3])
//         .on('zoom', (event) => {
//             g.attr('transform', event.transform);
//         })
//     svg.call(zoom)
//     return zoom
// }
const bindZoomListner = (setCtScale,translate,ctScale,geniusMindmap) => {
    
    //need global move
    const svg = geniusMindmap?d3.select(`.mp__canvas_svg_genius`):d3.select(`.mp__canvas_svg`)
    const g = geniusMindmap?d3.select(`.ct-container-genius`):d3.select(`.ct-container`);
    const zoom  = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
            if(!nodeMoving) {
                g.attr('transform', "translate(" + event.transform.x +','+event.transform.y + ")scale(" +event.transform.k + ")");
                var cScale = event.transform;
                setCtScale({x:cScale.x,y:cScale.y,k:cScale.k})
            } else {
                const x = g.attr("transform").split(/[()]/)[1].split(',')[0];
                const y = g.attr("transform").split(/[()]/)[1].split(',')[1];
                const scale = g.attr("transform").split(/[()]/)[3];
                // const pos = g.attr("transform");
                d3.zoomIdentity.scale(scale).translate([x,y]);
            }
        })
    if(translate) {svg.call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]));}

    // zoom.scaleTo(svg,1).translateTo(svg,translate[0],translate[1])
    svg.call(zoom)
    return zoom
}

export default CanvasNew;