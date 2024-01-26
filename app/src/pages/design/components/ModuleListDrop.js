import React, { useState, Fragment, useRef, useEffect } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import {getModules,getScreens, populateScenarios,getProjectList,saveE2EDataPopup,getProjectsMMTS,updateE2E}  from '../api'
import {ModalContainer,Messages as MSG, setMsg} from '../../global';
import {ScreenOverlay} from '../../global';
import * as d3 from 'd3';
import '../styles/ModuleListDrop.scss'
import ImportMindmap from'../components/ImportMindmap.js';
import WSImportMindmap from'../components/WSImportMindmap.js';
import { isEnELoad, savedList,initEnEProj,selectedModulelist,saveMindMap,moduleList,dontShowFirstModule, selectedModuleReducer,SetCurrentModuleId} from '../designSlice';
import { Tree } from 'primereact/tree';
import { Checkbox } from "primereact/checkbox";
import "../styles/ModuleListSidePanel.scss";
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';
import * as scrapeApi from "../api";
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { Avatar } from 'primereact/avatar';
import AvoInput from "../../../globalComponents/AvoInput";
import SaveMapButton from "./SaveMapButton";
import { Tooltip } from 'primereact/tooltip';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { checkRole, roleIdentifiers } from "../components/UtilFunctions";
import Toolbarmenu from './ToolbarMenu.js';


const ModuleListDrop = (props) =>{
    const dispatch = useDispatch()
    const toast = useRef()
    const [isEdit, setIsEdit] = useState(false);
    const [E2EName,setE2EName] = useState('')
    const moduleLists = useSelector(state=>state.design.moduleList)
    const proj = useSelector(state=>state.design.selectedProj)
    const initProj = useSelector(state=>state.design.selectedProj)
    const moduleSelect = useSelector(state=>state.design.selectedModule)
    const dontShowFirstModules = useSelector(state=>state.design.dontShowFirstModule)
    const moduleSelectlist = useSelector(state=>state.design.selectedModulelist)
    const initEnEProjt = useSelector(state=>state.design.initEnEProj)
    const oldModuleForReset = useSelector(state=>state.design.oldModuleForReset)
    const currentId = useSelector(state=>state.design.currentid)
    const typeOfView = useSelector(state=>state.design.TypeOfViewMap)
    const [moddrop,setModdrop]=useState(true)
    const [warning,setWarning]=useState(false)
    const [loading,setLoading] = useState(false)
    const isAssign = props.isAssign
    const [options,setOptions] = useState(undefined)
    const [modlist,setModList] = useState(moduleLists)
    const SearchInp = useRef();
    const [searchInpText,setSearchInpText] = useState('');
    const [searchInpTextEnE,setSearchInpTextEnE] = useState('');
    const SearchInpEnE = useRef();
    const SearchMdInp = useRef()
    const [modE2Elist, setModE2EList] = useState(moduleLists)
    const [searchForNormal, setSearchForNormal] = useState(false)
    const [importPop,setImportPop] = useState(false)
    const [WSimportPop,setWSImportPop] = useState(false)
    const [blockui,setBlockui] = useState({show:false})
    const [scenarioList,setScenarioList] = useState([])
    const [initScList,setInitScList] = useState([]) 
    const [selectedSc,setSelctedSc] = useState([])
    const [isE2EOpen, setIsE2EOpen] = useState(false);
    const [collapse, setCollapse] = useState(false);
    const [collapseForModules, setCollapseForModules] = useState(true);
    const SearchScInp = useRef()
    const [filterSc,setFilterSc] = useState('');
    const userRole = useSelector(state=>state.login.SR);
    const [firstRender, setFirstRender] = useState(true);
    const [showNote, setShowNote] = useState(false);
    const [allModSelected, setAllModSelected] = useState(false);
    const isEnELoaded = useSelector(state=>state.design.isEnELoad);
    const [collapseWhole, setCollapseWhole] = useState(true);
    const [initialText, setInitialText] = useState(E2EName? false : true);
    const prjList = useSelector(state=>state.design.projectList)

    ////  /////ModuleListSidePanel'S dependencies
    const [showInput, setShowInput] = useState(false);
    // const [moduleLists, setModuleLists] = useState(null);
    const [ moduleListsForScenario,  setModuleListsForScenario] = useState(null);
    const [projectList, setProjectList] = useState([]);
    const [projectId, setprojectId] = useState("");
    const [showE2EPopup, setShowE2EPopup] = useState(false);
    const [configTxt, setConfigTxt] = useState("");
    const [isCreateE2E, setIsCreateE2E] = useState(initEnEProjt && initEnEProjt.isE2ECreate?true:false)
    const [editE2ERightBoxData,setEditE2ERightBoxData] = useState([])
    const [cardPosition, setCardPosition] = useState({ left: 0, right: 0, top: 0 ,bottom:0});
  const [showTooltip, setShowTooltip] = useState(false);
  const [scenarioDataOnRightBox,setScenarioDataOnRightBox]= useState([])
  const [filterSceForRightBox,setFilterSceForRightBox]= useState([])
  const [valueSearchLeftBox, setValueSearchLeftBox] = useState('');


  // const [newProjectList, setNewProjectList] = useState([]);
        const[overlayforModSce,setOverlayforModSce]=useState(false)
        const[overlayforNoModSce,setOverlayforNoModSce]=useState(true)
        // const [storedSelectedProj, setStoredSelectedProj] = useState('');
        const [selectedKeys, setSelectedKeys] = useState([]);
        const [transferBut, setTransferBut] = useState( [] );
        const [inputE2EData, setInputE2EData] = useState('');
        const [SplCharCheck, setSplCharCheck] = useState(false);
        const [ newModSceList, setNewModSceList] = useState([]);
        const [modSceTree, setModSceTree] = useState([]);
        const [selectedProject, setSelectedProject] = useState(proj);
        const [preventDefaultModule, setPreventDefaultModule] = useState(false);
        const [projOfSce, setProjOfSce] = useState({
          id: "",
          name: ""
        });
        const [showDataOnSearchEmpty, setShowDataOnSearchEmpty] = useState(false)
        const [filterModSceList,setFilterModSceList] =useState([])
        // const forCatchingCheckBoxSelDemo = useMemo(()=> CheckboxSelectionDemo())

    const imageRefadd = useRef(null);

  let userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
  if(!userInfo) userInfo = userInfoFromRedux;
  else userInfo = userInfo ;

    let projectInfo = JSON.parse(localStorage.getItem('DefaultProject'));
    const projectInfoFromRedux = useSelector((state) => state.landing.defaultSelectProject)
    if(!projectInfo) projectInfo = projectInfoFromRedux;

    const handleTooltipToggle = () => {
      const rect = imageRefadd.current.getBoundingClientRect();
      setCardPosition({ right: rect.right, left: rect.left, top: rect.top ,bottom:rect.bottom});
      setShowTooltip(true);
    };
  
    const handleMouseLeave1 = () => {
      setShowTooltip(false);
    };
   
    useEffect(()=> {
        if(!preventDefaultModule && !dontShowFirstModules ) {
            if(moduleLists.length > 0 && moduleLists.find((module) => module.type==='basic')) {
                const showDefaultModuleIndex = moduleLists.findIndex((module) => module.type==='basic');
                selectModule(moduleLists[showDefaultModuleIndex]._id, moduleLists[showDefaultModuleIndex].name, moduleLists[showDefaultModuleIndex].type, false,true); 
        }}
        else{dispatch(savedList(true))}
        setWarning(false); 
        if(dontShowFirstModules === true && currentId !== ""){loadModule(currentId)}else{dispatch(savedList(true))}
     // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [moduleLists, initProj])
     useEffect(()=> {
        return () => {
          handleReaOnlyTestSuite({oldModuleForReset:localStorage.getItem('OldModuleForReset'),modID:localStorage.getItem('CurrentModuleForReset'),userInfo,appType:props.appType,module:props.module,proj:proj})
            dispatch(isEnELoad(false));
            dispatch(selectedModuleReducer({}))
            // this comment is removed when auto save of mod will effect default mod
            dispatch(dontShowFirstModule(false))
        }
     // eslint-disable-next-line react-hooks/exhaustive-deps
     },[]);

     useEffect(()=>{
        const arrayOfData =Object.entries(prjList)
        const data = arrayOfData.map((e,i)=>{
        return {
               name: e[1]?.name,
               id:e[1]?.id,
            }})
        setProjectList(data);
      },[showE2EPopup])

     useEffect (()=>{
      dispatch(savedList(true))
     // eslint-disable-next-line react-hooks/exhaustive-deps
     },[isCreateE2E])

     useEffect(()=>{
         setPreventDefaultModule(false);
         if(!isE2EOpen){
        // setIsCreateE2E(false);
        }
        
     // eslint-disable-next-line react-hooks/exhaustive-deps
     },[initProj])
     useEffect(() => {
        setIsCreateE2E(initEnEProj && initEnEProj.isE2ECreate?true:false);
        
      // eslint-disable-next-line react-hooks/exhaustive-deps
      },[initEnEProj]);

     useEffect(()=>{
        if(moduleSelect.type === 'endtoend') {
            
        }
        searchModule("");
        searchModule_E2E("");
        setSearchInpTextEnE("");
        setSearchInpText("");
        setWarning(false);
        setScenarioList([]);
     // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [proj])
    
     useEffect(()=>{
        var filter = [...initScList].filter((e)=>e.name.toUpperCase().indexOf(filterSc.toUpperCase())!==-1)
        setScenarioList(filter)
    },[filterSc,setScenarioList,initScList])
    // about select all check box
    useEffect(()=>{
        if(moduleSelectlist.length===moduleLists.filter(module=> module.type==='basic').length && moduleSelectlist.length>0  ){
          setAllModSelected(true);
        }
        else{
          setAllModSelected(false);
        }
      },[moduleSelectlist, moduleLists])

      // useEffect(() => {
      //   (async () => {

      //     let projectCollection = [];
      //     for (let proj of projectList) {
      //       const modData = await getModules({
      //         tab: 'endToend',
      //         projectid: proj.id,
      //         version: 0,
      //         cycId: null,
      //         modName: '',
      //         moduleid: null
      //       });
      //       let moduleCollection = [];
      //       for (let mod of modData) {
      //         if (mod.type === 'basic') {
      //           let scenarioCollection = [];
      //           const scenData = await populateScenarios(mod._id);
      //           for (let scenarioData of scenData) {
      //             scenarioCollection.push({
      //               id: scenarioData._id,
      //               name: scenarioData.name
      //             });
      //           }
      //           moduleCollection.push({
      //             id: mod._id,
      //             name: mod.name,
      //             scenarioList: scenarioCollection
      //           });
      //         }
      //       }
      //       projectCollection.push({
      //         id: proj.id,
      //         name: proj.name,
      //         moduleLists: moduleCollection
      //       });
      //     }
      //     setNewProjectList(projectCollection);
      //     setSelectedProject(proj)
      //   })();
      // }, [showE2EPopup]);
      // data for module and scerrios in Tree structure for E2E popUp
      useEffect(()=> {
        (async() => {
          // setSelectedProject(proj)
        setOverlayforModSce(true)
        const moduleScenarioData = await getProjectsMMTS(selectedProject? selectedProject:proj)
        setModSceTree(moduleScenarioData)
        if(newModSceList.length)setOverlayforModSce(false)
        if(moduleScenarioData.length){setOverlayforNoModSce(false)}
        
        // const handleEditE2EModPrjName = await updateE2E({"scenarioID": ,
        // "projectID": req.body.projectID})
        const projectNameforScenario = projectList.find(item => item.id === selectedProject)
        setProjOfSce(projectNameforScenario)
        // moduleScenarioData[0].mindmapList.map(sceLst => ({
        //   ...sceLst,
        //   projectname: projectNameforScenario.name
        // }));        
        setNewModSceList(moduleScenarioData)
        setFilterModSceList(moduleScenarioData)
        // if(showDataOnSearchEmpty){setFilterModSceList(moduleScenarioData)}
      })();
        

      },[showE2EPopup,selectedProject])
  
      // useEffect(() => {
      //   (async() => {
      //     setOverlayforModSce(true)
      //     const moduleLists = await getModules({
      //       tab: 'endToend',
      //       projectid: selectedProject,
      //       version: 0,
      //       cycId: null,
      //       modName: '',
      //       moduleid: null
      //     });
      //     const projectNameforScenario = projectList.find(item => item.id === selectedProject)

      //     let moduleCollections = [];
      //     for (let modu of moduleLists) {
      //       if (modu.type === 'basic') {
      //         let scenarioCollections = [];
      //         const scenDatas = await populateScenarios(modu._id);
      //         for (let scenarioDatas of scenDatas) {
      //           scenarioCollections.push({
      //             id: scenarioDatas._id,
      //             name: scenarioDatas.name
      //           });
      //         }
      //         moduleCollections.push({
      //           id: modu._id,
      //           name: modu.name,
      //           scenarioList: scenarioCollections,
      //           projectname:projectNameforScenario.name
      //         });
      //       }
      //     }
      //     setNewModSceList(moduleCollections)
      //     setFilterModSceList(moduleCollections);
      //     console.log("moduleCollections",moduleCollections)
      //     console.log(" moduleList",moduleLists)
      //     if(moduleCollections.length)setOverlayforModSce(false)
      //     // console.log("selectedProject",selectedProject)


      //     const moduleScenarioData = await getProjectsMMTS(proj)
      //     console.log("moduleScenarioData", moduleScenarioData)
      //     //  var filter = moduleCollections.scenarioList.find((e)=>e.name.toUpperCase().indexOf(searchScenarioLeftBox.toUpperCase())!==-1)
      //         // setFilterModSceList(filter)
      //   })();
      // }, [selectedProject,showE2EPopup]);
    const displayError = (error) =>{
        setLoading(false)
        toast.current.show({severity:'error', summary:'Error', detail:error, life:2000});
    }
    const collapsed =()=> setCollapse(!collapse)
    const collapsedForModules =()=> setCollapseForModules (!collapseForModules )
    const collapsedForModuleWholeCont =()=> (setCollapseWhole(!collapseWhole))
    const CreateNew = () =>{
        setIsE2EOpen(false);
        setCollapse(false);
        dispatch(selectedModuleReducer({createnew:true,currentlyInUse:""}))
        dispatch(initEnEProj({proj, isE2ECreate: false}));
        dispatch(isEnELoad(false));
        setFirstRender(false);
    }
    const clickCreateNew = () =>{
      dispatch(selectedModuleReducer({createnew:true}))
      dispatch(initEnEProj({proj, isE2ECreate: false}));
        dispatch(isEnELoad(false));
        setFirstRender(false);
    }
    const searchModule = (val) =>{
        if(SearchInp && SearchInp.current) {
            if (val === "") setSearchForNormal(false)
            else setSearchForNormal(true);
            SearchInp.current.value = val;
            setSearchInpText(val);
        }
        
    }
    const searchScenario = (val) =>{
        setFilterSc(val)
    }
     const loadModule = async(modID) =>{
      dispatch(selectedModuleReducer({}))
      dispatch(isEnELoad(false));
        setWarning(false)
        setBlockui({show:true,content:"Loading Module ..."}) 
        // if(moduleSelect._id === modID){
           
        // }
        // dispatch(selectedModule({}))
        var req={
            tab:"createTab",
            projectid:proj,
            version:0,
            cycId: null,
            modName:"",
            moduleid:modID
        }
        
        var res = await getModules(req)
        if(res.error){displayError(res.error);return}
        dispatch(selectedModuleReducer(res))
        setBlockui({show:false})
    }
    const [isModuleSelectedForE2E, setIsModuleSelectedForE2E] = useState('');

    // normal module selection
            const selectModule = async (id,name,type,checked, firstRender) => {
                var modID = id
                var type = name
                var name = type
                // below code about scenarios fetching
        SearchScInp.current.value = ""
                // setSelctedSc([])
                //     if (isE2EOpen){
                //         setBlockui({content:'loading scenarios',show:true})
                //         //loading screen
                //         var res = await populateScenarios(modID)
                //         if(res.error){displayError(res.error);return}
                //         // props.setModName(name)
                //         setIsModuleSelectedForE2E(id);
                //         setScenarioList(res)
                //         setInitScList(res)
                //         setBlockui({show:false})
                //         setShowNote(true)
                //         return;}
                        if(Object.keys(moduleSelect).length===0 || firstRender){
                            loadModule(modID)
                            return;
                        }else{
                            setWarning(modID)
                            dispatch(SetCurrentModuleId(modID))
                            localStorage.setItem('CurrentModuleForReset',modID)
                        }
        d3.selectAll('.ct-node').classed('node-selected',false)
        //     return;
        // }
        d3.select('#pasteImg').classed('active-map',false)
        d3.select('#copyImg').classed('active-map',false)
        d3.selectAll('.ct-node').classed('node-selected',false)
        if(Object.keys(moduleSelect).length===0){
            loadModule(modID)
    
        }else{
            setWarning({modID, type: name})
            dispatch(SetCurrentModuleId(modID))
            localStorage.setItem('CurrentModuleForReset',modID)
            
        }
        return;
    }
    
    //E2E properties
    const selectModules= async(e) => {
        dispatch(isEnELoad(true));
        var modID = e.currentTarget.getAttribute("value")
        var type = e.currentTarget.getAttribute("type")
        var name = e.currentTarget.getAttribute("name")
        if(Object.keys(moduleSelect).length===0 || firstRender){
            loadModuleE2E(modID)

        }
        if(type==="endtoend"){
          loadModuleE2E(modID)
        }
        // else{
        //     setWarning({modID, type});
        // }
        setFirstRender(false);

        return; 
    }    
    const loadModuleE2E = async(modID) =>{
        // setWarning(false)
        setIsE2EOpen(true)
        setCollapse(true)
        setBlockui({show:true,content:"Loading Module ..."})   
        // if(moduleSelect._id === modID){
            
            
        // }
        dispatch(selectedModuleReducer({}))
        var req={
            tab:"endToend",
            projectid:proj,
            version:0,
            cycId: null,
            modName:"",
            moduleid:modID
        }
        var res = await getModules(req)
        if(res.error){displayError(res.error);return}
        dispatch(selectedModuleReducer(res))
        setBlockui({show:false})
    }
    const addScenario = (e) => {	
        var sceId = e.currentTarget.getAttribute("value")	
        var sceName = e.currentTarget.getAttribute("title")	
        var scArr = {...selectedSc}	
        if(scArr[sceId]){	
            delete scArr[sceId] 
        }else{	
            scArr[sceId] = sceName	
        }       
        setSelctedSc(scArr)	
    }	
    const clickAdd = () =>{	
        if(Object.keys(selectedSc).length<1)return;	
        // dispatch({type:actionTypes.UPDATE_SCENARIOLIST,payload:selectedSc})	
    }
    // E2E search button
    const searchModule_E2E = (val) =>{
        // var initmodule = modE2Elist
        // if(!initmodule){
        //     initmodule = moduleList
        //     setModE2EList(moduleList)
        // }
        if(SearchInpEnE && SearchInpEnE.current) {
            SearchInpEnE.current.value = val;
            setSearchInpTextEnE(val);
        }
        // var filter = moduleList.filter((e)=>(e.type==='endtoend'&&(e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)||e.type==='basic'))
        // dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter && filter.length ? filter : moduleList})
    }
    const setOptions1 = (data) =>{
        setOptions(data)
      }
    const createType = {
        'importmodules':React.memo(() => (<CreateNew importRedirect={true}/>))
    }
    const selectedCheckbox=(e,arg="checkbox")=>{
        let modID = e.target.getAttribute("value")
        if(arg==='checkbox'){
          let newSelectedModList = [...moduleSelectlist]; // Create a new array
          const modIndex = newSelectedModList.indexOf(modID);
          if (modIndex === -1) {
            newSelectedModList.push(modID);
          } else {
            newSelectedModList.splice(modIndex, 1);
          }
          dispatch(selectedModulelist(newSelectedModList));       
            return;
        }
    }
      const handleEditE2E=async()=>{
        setInitialText(false)
        
        if(moduleSelect.type=== "endtoend"){
           setE2EName(moduleSelect.name);
           setIsEdit(true);
          }
           const editE2EData  = moduleSelect.children.map((item)=>{
            return{
                scenarioID: item._id,
                scenarioName:item.name
                // projectID:item.projectID
              }
           })
           const editDataE2E = await updateE2E(editE2EData.map((scenario) => scenario.scenarioID));
          //  for (let i = 0; i < editE2EData.length; i++) {
          //   const { scenarioID, scenarioName } = editE2EData[i];
          //   const data = await updateE2E([editE2EData[i].scenarioID]);
          //   const updatedData = Object.assign({}, data, { scenarioID, scenarioName });
          //   editDataE2E.push(updatedData);
          // }
           const e2eData = editDataE2E.map((item, idx)=>{
            return{ sceName:editE2EData[idx].scenarioName,
              scenarioId: item.scenarioID,
              modName:item.module_name,
              projName:item.proj_name
            }
           })
           setScenarioDataOnRightBox(e2eData)
           setFilterSceForRightBox(e2eData)
           setTransferBut(e2eData);

      }
    // ///////////// _____ E2E popUp_____ ///////////////////////////////////////////////////////////////////////////////////////////////////////

    
        
       

        const deleteScenarioselected = (ScenarioSelectedIndex)=>{
          let newTrans =[...transferBut];
         let newData = newTrans.find(item=>item.sceIdx === ScenarioSelectedIndex)
          newTrans.splice(ScenarioSelectedIndex, 1);
          setScenarioDataOnRightBox(newTrans)
          setFilterSceForRightBox(newTrans)
          setTransferBut(newTrans);
          if(newTrans.length==0){setInitialText(true)}
          
         }
        
        const handleSearchScenarioLeftBox =(val)=>{
          if(val === "") {
            // setShowDataOnSearchEmpty(true)
            setFilterModSceList(newModSceList);
          } else {
            // let listOFModule = [...newModSceList[0].mindmapList];
            let listOFModule = JSON.parse(JSON.stringify(newModSceList[0].mindmapList));
            let filtereddata=listOFModule.map((module) => ({
                ...module,
                scenarioList: module.scenarioList.filter((scenarioObj) => scenarioObj.name.toUpperCase().includes(val.toUpperCase()) )
              }))
              .filter((module) => module.scenarioList.length > 0);
            setFilterModSceList([{mindmapList: filtereddata}]);
          }
          // setSearchScenarioLeftBox(val);  
        }
        
        
        const handleArrowBut =()=>{
          // let array = [...selectedKeys]
            // setTransferBut=[...transferBut,array]
            setInitialText(false)
            setTransferBut((oldTransferBut) => [...oldTransferBut, ...selectedKeys]);
             setFilterSceForRightBox((oldTransferBut) => [...oldTransferBut, ...selectedKeys])
            setSelectedKeys([]);
            setScenarioDataOnRightBox((oldTransferBut) => [...oldTransferBut, ...selectedKeys])
        }
        const handleSearchScenarioRightBox = (val) => {
          if (val === "") {
            setFilterSceForRightBox(scenarioDataOnRightBox);
          } else {
            const filteredData = scenarioDataOnRightBox.filter(
              (e) => e.sceName.toUpperCase().indexOf(val.toUpperCase()) !== -1
            );
            setFilterSceForRightBox(filteredData);
          }
        };

        // const pushingEnENmInArr ={
        //     "id": 0,
        //     "childIndex": 0,
        //     "_id": null,
        //     "oid": null,
        //     "name":inputE2EData,
        //     "type": "endtoend",
        //     "pid": null,
        //     "pid_c": null,
        //     "task": null,
        //     "renamed": false,
        //     "orig_name": null,
        //     "taskexists": null,
        //     "state": "created",
        //     "cidxch": null}
        // transferBut[0]= pushingEnENmInArr
      
        
    //      HardCodedApiDataForE2E.map[0].name =inputE2EData
    //      HardCodedApiDataForE2E.map[1] =transferBut
         
        const dataOnSaveButton =async()=>{
            let HardCodedApiDataForE2E = {
                "action": "/saveEndtoEndData",
                "write": 10,
                "deletednode": [],
                "map": [
                    {
                        "id": 0,
                        "childIndex": 0,
                        "_id": isEdit? moduleSelect._id : null,
                        "oid": null,
                        "name": isEdit? E2EName : inputE2EData,
                        "type": "endtoend",
                        "pid": null,
                        "pid_c": null,
                        "task": null,
                        "renamed": false,
                        "orig_name": null,
                        "taskexists": null,
                        "state": isEdit? "saved" : "created",
                        "cidxch": null
                    }
                ],
                "unassignTask": [],
                "prjId": proj,
                "createdthrough": "Web",
                "relId": null,
                
            };
            for(let scenarioItem in transferBut) {
              HardCodedApiDataForE2E.map.push(
                {
                  "id": parseInt(scenarioItem) + 1,
                  "childIndex": parseInt(scenarioItem) + 1,
                  "_id": transferBut[scenarioItem].scenarioId,
                  "oid": null,
                  "name": transferBut[scenarioItem].sceName,
                  "type": "scenarios",
                  "pid": 0,
                  "task": null,
                  "renamed": false,
                  "orig_name": null,
                  "taskexists":null,
                  "state": "created",
                  "cidxch": "true",
                  "projectID":transferBut[scenarioItem].projId
                }

              )
            }
           
 
            const saveE2E_sce = await saveE2EDataPopup(HardCodedApiDataForE2E) 
            if(saveE2E_sce.error){displayError(saveE2E_sce.error);return}
          var moduleselected = await getModules({ modName: null, "cycId": null, "tab": "endtoend", "projectid": proj, "moduleid": saveE2E_sce })

          if (moduleselected.error) { displayError(moduleselected.error); return }
          var screendata = await getScreens(proj)

          if (screendata.error) { displayError(screendata.error); return }
          var req = {
            tab: "endToend" && "createTab",
            projectid: proj,
            version: 0,
            cycId: null,
            modName: "",
            moduleid: null
          }
          var moduledata = await getModules(req);
          if (moduledata.error) { displayError(moduledata.error); return }
          dispatch(isEnELoad(true))
          dispatch(dontShowFirstModule(true))
          dispatch(saveMindMap({screendata,moduledata,moduleselected}))
          
          dispatch(moduleList(moduledata));
          dispatch(selectedModuleReducer(moduleselected))

//           // Assuming you have access to the 'dispatch' function
//           dispatch(dontShowFirstModule(true))
// // Create a function to dispatch 'moduleList'
// const dispatchModuleList = (moduledata) => {
//   return new Promise((resolve, reject) => {
//     dispatch(moduleList(moduledata));
//     resolve();
//   });
// };

// // Create another function to dispatch 'selectedModule'
// const dispatchSelectedModule = (moduleselected) => {
//   return new Promise((resolve, reject) => {
//     dispatch(selectedModule(moduleselected));
//     resolve();
//   });
// };

// // Create a function to dispatch 'saveMindMap'
// const dispatchSaveMindMap = (screendata, moduledata, moduleselected) => {
//   return new Promise((resolve, reject) => {
//     dispatch(saveMindMap({ screendata, moduledata, moduleselected }));
//     resolve();
//   });
// };

// // Create an async function to execute all three dispatches in sequence
// const executeDispatches = async (screendata, moduledata, moduleselected) => {
//   try {
//     await dispatchSaveMindMap(screendata, moduledata, moduleselected);
//     await dispatchModuleList(moduledata);
//     await dispatchSelectedModule(moduleselected);
//   } catch (error) {
//     console.error('Error occurred during dispatch:', error);
//   }
// };
setPreventDefaultModule(true);

// Call the async function to execute all three dispatches
// executeDispatches(screendata, moduledata, moduleselected);

 
           setE2EName('')
           setTransferBut([])
           setFilterSceForRightBox([])
           setScenarioDataOnRightBox([])
           setInputE2EData('')
             // console.log("moduleselected",moduleselected)

        }

        const handleCheckboxChange = (e, modIndx, sceIdx,  modName, sceName,moduleId,scenarioId,projOfSce) => {
          const selectedScenario = `${modIndx}-${sceIdx}`;
          if (e.checked) {
            setSelectedKeys([...selectedKeys, {
              modIndx, sceIdx, modName, sceName, selectedScenario,moduleId,scenarioId,projId: projOfSce.id, projName: projOfSce.name
            }]);
            // setStoredSelectedKeys([...selectedKeys, {
            //   projIdx, moduleIdx, scenarioIdx, projName, modName, sceName, selectedScenario
            // }]);
          } else {
            setSelectedKeys(selectedKeys.filter((key) => key.selectedScenario !== selectedScenario));
            // setStoredSelectedKeys(selectedKeys.filter((key) => key.selectedScenario !== selectedScenario));
          }
        };
    
        const handleTransferScenarios = () => {
          // Logic to transfer selected scenarios to the right box
          // You can access the selected scenarios using `selectedKeys` state
          const selectedScenarios = selectedKeys.map((key) => ({
            projIdx: parseInt(key.split('-')[0]),
            moduleIdx: parseInt(key.split('-')[1]),
            scenarioIdx: parseInt(key.split('-')[2])
          }));
    
          // TODO: Perform the necessary actions with the selected scenarios
    
          setSelectedKeys([]); // Clear the selected scenarios after transferring
        };
       
            const footerContent = (
              <div>
                  <Button label="Cancel"  onClick={() => setShowE2EPopup(false)} className="p-button-text" />
                  <Button label="Save" disabled={(isEdit? !E2EName.length>0 : !inputE2EData.length > 0) || !transferBut.length > 0}  onClick={() => {setShowE2EPopup(false); dataOnSaveButton() }} autoFocus />
                  {/* <SaveMapButton  isEnE={true}   /> */}
              </div>
            );
            const projectItems = projectList.map((projectDrp, prjIdxDrp) => {
              
              return( {label: projectDrp.name,
              value: projectDrp.id}
              )
            })

            const changeProject = (e) =>{
              setSelectedProject(e.value)
              const selectedProjForSce = projectList.find(project=> project.id === e.value);
              setProjOfSce(selectedProjForSce)
             }
            const handleSplCharE2EName =(event)=>{
              const value = event
              // inputE2EData(value);
              if (value !== undefined && /[!@#$%^&*()+{}\[\]:;<>,.?~\\/\-\s]/.test(value)){
                setSplCharCheck(true)
              } else {
                setSplCharCheck(false)
                if(E2EName||isEdit){
                  setE2EName(value)}
                  else
                  {setInputE2EData(value)}
                
              }


            }
            
       const bodyScenarionTemp = (e, idx) =>{
        return(
          <div className="EachScenarioNameBox" >
            <div className="ScenarioName" ><div className='sceNme_Icon'><img src="static/imgs/ScenarioSideIconBlue.png" alt="modules" />
              <h4>{e.sceName}</h4><div className="modIconSce"><h5>(<img src="static/imgs/moduleIcon.png" alt="modules" /><h3>{e.modName})</h3></h5></div>
                <div className="projIconSce"><h5>(<img src="static/imgs/projectsideIcon.png" alt="modules" /><h3>{e.projName})</h3></h5></div>
                </div><Button icon="pi pi-times" onClick={() => { deleteScenarioselected(idx.rowIndex); }} rounded text severity="danger" aria-label="Cancel" /></div>
          </div>
        )
       }
      const handleReaOnlyTestSuite=async (props)=>{
       const data = getModules({tab:"createTab", version:0, cycId:null, projectid:props.proj})
       
       let resetInUse=false
        
      var reqForOldModule={
        tab:"createTab",
        projectid:props.proj,
        version:0,
        cycId: null,
        modName:"",
        moduleid:props.oldModuleForReset
      }
      
      
      var moduledataold=await getModules(reqForOldModule)
      if(moduledataold.error){props.displayError(moduledataold.error);return}
        
  
      if(moduledataold.currentlyInUse===props.userInfo?.username ){
      
          // only reset no assignment 
          resetInUse=true
          
          await scrapeApi.updateTestSuiteInUseBy(props.appType,"123",props.oldModuleForReset,props.userInfo?.username,false,resetInUse)
          if(data.length>0)loadModule(props.modID)
        }
        else{
          if(data.length>0)loadModule(props.modID)
        }
      localStorage.removeItem('OldModuleForReset')
      
      }

    return(
        <Fragment>
          {showE2EPopup &&
          <div className="E2E_container">
            <div className="card flex justify-content-center">
              <Dialog
                className="Project-Dialog"
                header= {E2EName? "Edit End to End Flow" : "Create End to End Flow"} 
                visible={showE2EPopup}
                style={{ width: '74.875rem', height: '100%', backgroundColor: '#f2f2ff' }}
                onHide={() => setShowE2EPopup(false)}
                footer={footerContent}
              >
                <div className="mainCentralContainer">
                  <div className="nameTopSection">
                    <div class="col-12 lg:col-12 xl:col-5 md:col-12 sm:col-12 flex flex-column">
                      <AvoInput
                        htmlFor="username"
                        labelTxt="Name"
                        required={true}
                        placeholder= {isEdit? E2EName:"Enter End to End Flow Name"}   
                        customClass="inputRow_for_E2E_popUp"
                        inputType="lablelRowReqInfo"
                        inputTxt={isEdit? E2EName:inputE2EData} 
                        setInputTxt={isEdit? (setE2EName && handleSplCharE2EName):(setInputE2EData && handleSplCharE2EName) }
                        charCheck={SplCharCheck}
                      />
                    </div>
                  </div>
                  <div className="centralTwinBox">
                    <div className="leftBox">
                      <Card title="Select Testcases" className="leftCard">
                     <div className="DrpoDown_search_Tree">
                          <div className='searchAndDropDown'>
                            <div className="headlineSearchInput">
                              <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText type="text"
                                  placeholder="Search Testcases"
                                  value={valueSearchLeftBox}
                                  style={{ width: '15rem', height: '2.2rem', marginRight:'0.2rem', marginBottom: '1%' }}
                                  className="inputContainer" onChange={(e)=>{setValueSearchLeftBox(e.target.value);handleSearchScenarioLeftBox(e.target.value)}}
                                />
                              </span>
                            </div>
                            <div className="card flex justify-content-center" style={{marginRight:'0.3rem'}}>
                              {/* dropDown of projects */}
                              <Dropdown
                                value={selectedProject}
                                name={projectItems}
                                onChange={(e) => {
                                  changeProject(e);
                                  setValueSearchLeftBox("")
                                }}
                                
                                options={projectItems}

                                placeholder="Select a Project"
                              />
                            </div>
                            <h4>Projects:</h4>
                          </div>
                        
                         {/* <MemorizedCheckboxSelectionDemo/> */}
                        {/* <CheckboxSelectionDemo /> */}
                        <div>
                          {/* {overlayforNoModSce?<h5 className='overlay4ModSceNoMod'>There are no Test Suites and Testcases in this project ...</h5>:  */}
                          <>
                          {overlayforModSce? <h5 className='overlay4ModSce'>Loading Test Suite and Testcases...</h5>:
                            <Tree
                              value={
                                filterModSceList[0] === "" ?[{
                                  key:0,
                                  label: (<div className='labelOfArrayText'> No Test Suites and Testcases in this project ... </div>),
                                  children:(<></>)
                                }]:
                                filterModSceList[0].mindmapList.map((module, modIndx) => ({
                                  key: modIndx,
                                  label: (
                                    <div className="labelOfArray">
                                      <img src="static/imgs/moduleIcon.png" alt="modules" />
                                      <div className='labelOfArrayText'>{module.name}</div>
                                    </div>
                                  ),
                                  children: module.scenarioList.map((scenario, sceIdx) => ({
                                    key: sceIdx,
                                    label: (
                                      <label style={{ alignItem: 'center', justifyContent: 'center'}}>
                                        <Checkbox
                                          onChange={(e) => handleCheckboxChange(e, modIndx, sceIdx, module.name, scenario.name, module._id, scenario._id,projOfSce)}
                                          checked={selectedKeys.map((keysCombo) => keysCombo.selectedScenario).includes(`${modIndx}-${sceIdx}`)}
                                        />
                                        <>
                                        </>
                                        <img style={{ width: '18px', height: '16px' }} src="static/imgs/ScenarioSideIconBlue.png" alt="modules" />
                                        {scenario.name}
                                      </label>
                                    )

                                  })

                                  )
                                  
                                }))}
                            // selectionMode="multiple"

                            />}</>
                          
                          {/* <button onClick={handleTransferScenarios}>Transfer Scenarios</button> */}
                        </div>
                      </div>
                      </Card>
                    </div>
                    <div className="centerButtons">
                      <div className="centerButtonsIndiVisual">
                        <Button disabled={!selectedKeys.length>0} label=">" onClick={handleArrowBut} outlined />
                        {/* <Button label="<" outlined /> */}
                      </div>
                    </div>
                    <div className="rightBox">
                      <Card title="Selected Testcases" className="rightCard">
                        {!initialText?
                          <>
                          <div className="headlineSearchInputOfRightBox">
                            {/* <div className="headlineRequiredOfRightBox">
                          <img src="static/imgs/Required.svg" className="required_icon" />
                            </div> */}
                            <span className="p-input-icon-left">
                              <i className="pi pi-search" />
                              <InputText
                                placeholder="Search Testcases by name"
                                className="inputContainer"
                                onChange={(e)=>handleSearchScenarioRightBox(e.target.value)}
                              />
                            </span>
                          </div>
                          <div className="ScenairoList">
                            <DataTable className='selectedScenarioList' value={filterSceForRightBox?filterSceForRightBox:[]} reorderableColumns reorderableRows onRowReorder={(e) => {setFilterSceForRightBox(e.value);setTransferBut(e.value)}}>
                              <Column className ="rowOrders" rowReorder headerStyle={{display:'none'}}/>
                              <Column className='rowOfScenarios' field="scenarioId" headerStyle={{display:'none'}} body={bodyScenarionTemp}/>
                            </DataTable>
                          </div>
                          </>
                            :
                         <div className="initialText">
                           <div className="initial1StText">
                             <h3 className="textClass"> No Testcases Yet</h3>
                           </div>
                           <div className="initial2NdText">
                             <h3 className="textClass">Select Project</h3>  <img src="static/imgs/rightArrow.png" className="ArrowImg" alt="moduleLayerIcon" />
                             <h3 className="textClass">Select Test Suite</h3>  <img src="static/imgs/rightArrow.png" className="ArrowImg" alt="moduleLayerIcon" />
                             <h3 >Select Testcases</h3>
                            </div>
                          </div> 
                          }
                      </Card>
                      
                    </div>
                  </div>
                </div>
              </Dialog>
            </div>
          </div>}
          <Toast  ref={toast} position="bottom-center" baseZIndex={1000}/>
             {loading?<ScreenOverlay content={'Loading Mindmap ...'}/>:null}
             {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
            {warning.modID?<ModalContainer
                show = {warning.modID} 
                style={{width:"30%"}}
                title='Confirmation'
                close={()=>setWarning(false)}
                footer={<Footer modID={warning.modID} loadModule={warning.type ==='endtoend' ? loadModuleE2E : loadModule} setWarning={setWarning} userInfo={userInfo} appType={props.appType} oldModuleForReset={oldModuleForReset} module={props.module} proj={proj} displayError={displayError}/>}
                content={<Content/>} 
                // modalClass='warningPopUp'
            />:null}
             <>
      <div className="CollapseWholeCont">
       <div className="collapseBut" style={{height:"9%",alignItems:'end',display:"flex",float:'right',position: collapseWhole? "absolute": "", left:'17rem',zIndex:'1',}}>
             <img src="static/imgs/CollapseButForLefPanel.png" alt="collapseBut" style={{ cursor:'pointer',transform: collapseWhole ? 'rotate(0deg)' : 'rotate(180deg)'}} onClick={ ()=>{collapsedForModuleWholeCont(); }}/> 
          </div>
            <div className="Whole_container" style={{ width: collapseWhole ? "17rem" : "0.9rem", transitionDuration: '0.7s ', overflow: !collapseWhole ? "hidden" : "",backgroundColor: !collapseWhole? "#c1c1ef" : ""  }}>
            <Toolbarmenu setBlockui={setBlockui} displayError={displayError}/>
              
              <div className="normalModule_main_container"  style={{  display: !collapseWhole ? "none" : "", overflow: !collapseWhole ? "hidden" : "" }}>
                <div className="moduleLayer_plusIcon">
                  <div className="moduleLayer_icon">
                    <img src="static/imgs/moduleLayerIcon.png" alt="moduleLayerIcon" /> <h3 className="normalModHeadLine">Test Suites</h3>
                  </div>
                  {/* <div className="SearchIconForModules">
                       <span className={`pi pi-search ${showInput? 'searchIcon_adjust' :''}` } style={{fontSize:'1.1rem',cursor:'pointer'}} onClick={clickForSearch}></span>
                       {showInput&&(
                       <div>
                           <input className="inputOfSearch" type="text"/>
                           <i className="pi pi-times"  onClick={click_X_Button}></i>
                       </div>)}
                     </div> */}
                  {/* If projectLevelRole or userInfoRole is Equal to Quality Engineer then hide the import, create Test suite buttons*/}
                  {
                    (projectInfo && projectInfo?.projectLevelRole && checkRole(roleIdentifiers.QAEngineer, projectInfo.projectLevelRole)) ? (
                      null
                    ) : <>
                      {/* <img className="pi pi-file-import mindmapImport" src="static/imgs/import_new_18x18_icon.svg" alt='' onClick={()=>setImportPop(true)}></img> */}
                      {(props.appType === "Webservice") ? <><img className="custom-target-iconws" src="static/imgs/plusNew.png" alt="NewModules" onClick={() => setWSImportPop(true)} />
                        <Tooltip target=".custom-target-iconws" content=" import definition" position="bottom" />
                        {WSimportPop ? <WSImportMindmap setBlockui={setBlockui} displayError={displayError} setOptions={setOptions} setImportPop={setWSImportPop} isMultiImport={true} importPop={WSimportPop} /> : null}</>
                        : null}
                      <img className="importimg pi pi-file-import mindmapImport" src="static/imgs/import_new_18x18_icon.svg" alt='' onClick={() => setImportPop(true)}></img>
                      <Tooltip target=".mindmapImport" position="left" content="  Click here to import a Test Suite." />
                      {importPop ? <ImportMindmap setBlockui={setBlockui} displayError={displayError} setOptions={setOptions} setImportPop={setImportPop} isMultiImport={true} importPop={importPop} toast={toast} /> : null}
                      <Tooltip target=".custom-target-icon" content=" Create Test Suite" position="bottom" />
                      <img className={`testsuiteimg testsuiteimg__${(props.appType === "Webservice") ? "forWS" : "forNonWS"} custom-target-icon`} src="static/imgs/plusNew.png" alt="NewModules" onClick={() => { CreateNew() }} />
                    </>
                  }
                   
                  
             </div>
                <div className='' style={{display:'flex',height:'1.6rem',marginTop:'2%',marginLeft:'3%'}}>
                      <input style={{width:'1rem',marginLeft:'0.57rem',marginTop:'0.28rem'}} title='Select All Modules' name='selectall' type={"checkbox"} id="selectall" checked={allModSelected} onChange={(e) => {
                                    if (!allModSelected) {
                                        dispatch(selectedModulelist( moduleLists.filter(module=> module.type==='basic').map((modd) => modd._id) ))
                                    } else {
                                        dispatch(selectedModulelist([]) )
                                    }
                                    setAllModSelected(!allModSelected)}} >
                       </input>
                       {/* <input className='pFont' style={{width:'12rem'}}placeholder="Search Modules" ref={SearchInp} onChange={(e)=>{searchModule(e.target.value)}}/>
                                        <img  style={{height:'17px',width:'17px',marginTop:'3px'}} src={"static/imgs/ic-search-icon.png"} alt={'search'}/> */}
                  <div className='inputSearchNorMod'>
                    <span className="p-input-icon-left">
                      <i className="pi pi-search" />
                      <InputText placeholder="Search" ref={SearchInp} onChange={(e) => { searchModule(e.target.value) }} title=' Search for Test Suite' />
                    </span>
                  </div>

                </div>
                <div className="NorModuleList">
                  {/* {moduleLists && moduleLists.map((module, idx)=>{
                              return(
                              <>
                                <div className="EachModNameBox" title={module.name}>
                                   <div key={module.id} className="moduleName"  onClick={(e)=>selectModule(e.target.getAttribute("value"), e.target.getAttribute("name"), e.target.getAttribute("type"), e.target.checked)}><img src="static/imgs/moduleIcon.png" alt="modules" /><h4>{module.name}</h4></div>
                                   
                                </div>
                              </>
                              )
                        })} */}
                  {moduleLists.map((e, i) => {
                    if (e.type === "basic" && ((searchInpText !== "" && e.name.toUpperCase().indexOf(searchInpText.toUpperCase()) !== -1) || searchInpText === ""))
                      return (<>
                        {/* // <div key={i}>
                                                   //         <div data-test="modules" value={e._id}  className={'EachModNameBox'+((moduleSelect._id===e._id  )?" selected":"")} style={(moduleSelect._id===e._id || e._id===isModuleSelectedForE2E && isE2EOpen)?   {backgroundColor:'#EFE6FF'}:{}  }  title={e.name} type={e.type}>                                    
                                                   //             <div className='modClick' value={e._id} style={{display:'flex',flexDirection:'row'}} >
                                                   //             {<input type="checkbox" className="checkBox" style={{marginTop:'3px'}} value={e._id} onChange={(e)=>selectedCheckbox(e,"checkbox") }  />}  
                                                   //             <span  onClick={(e)=>selectModule(e.target.getAttribute("value"), e.target.getAttribute("name"), e.target.getAttribute("type"), e.target.checked)} className='EachModNameBox' value={e._id} style={{textOverflow:'ellipsis',textAlign:'left',width:'7rem'}}>{e.name}</span>
                                                   //             </div>
                                                   //         </div>
                                                   // </div> */}
                        <div key={i} data-test="modules" value={e._id} title={e.name} type={e.type}>
                          <div className={'EachModNameBox' + ((moduleSelect._id === e._id) ? " selected" : "")} style={(moduleSelect._id === e._id || e._id === isModuleSelectedForE2E && isE2EOpen) ? { backgroundColor: '#EFE6FF' } : {}} >
                            {<input type="checkbox" className="checkBox" style={{ marginTop: '3px' }} value={e._id} onChange={(e) => selectedCheckbox(e, "checkbox")} checked={moduleSelectlist.includes(e._id)} />}
                            <img src="static/imgs/moduleIcon.png" style={{ width: '20px', height: '20px', marginLeft: '0.5rem' }} alt="modules" />
                            <div style={{ width: '13rem', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              <h4 className="moduleName" onClick={(e) => selectModule(e.target.getAttribute("value"), e.target.getAttribute("name"), e.target.getAttribute("type"), e.target.checked)} value={e._id} style={{ textOverflow: 'ellipsis', textAlign: 'left', fontWeight: '300' }}>{e.name}</h4>
                            </div>
                          </div>
                        </div>
                      </>
                      )
                  })}
                </div>
              </div>
              <div className="E2E_main_container" style={{  display: !collapseWhole ? "none" : "", overflow: !collapseWhole ? "hidden" : "" }}>
                <div className="moduleLayer_plusIcon">
                  <div className='moduleLayer_icon' >
                    <img src="static/imgs/E2ESideIcon.png" alt="modules" /> <h3 className="E2EHeadLine">End To End Flow</h3>
                  </div>
                  {/* <div className="SearchIconForModulesE2E">
                       <span className={`pi pi-search ${showInputE2E? 'searchIcon_adjust' :''}` } style={{fontSize:'1.1rem',cursor:'pointer'}} onClick={clickForSearchE2E}></span>
                         {showInputE2E&&(
                        <div>
                            <input className="inputOfSearch" type="text"/>
                            <i className="pi pi-times"  onClick={click_X_ButtonE2E}></i>
                        </div>)}
                     </div > */}
                  {
                    (projectInfo && projectInfo?.projectLevelRole && checkRole(roleIdentifiers.QAEngineer, projectInfo.projectLevelRole)) ? null :
                      <>
                        <img src="static/imgs/plusNew.png" onClick={() => { setE2EName('');  setIsEdit(false);setFilterSceForRightBox([]); setScenarioDataOnRightBox([]); setTransferBut([]); setShowE2EPopup(true); setInitialText(true); setPreventDefaultModule(true) }} alt="PlusButtonOfE2E" className='E2E' />
                        <Tooltip target=".E2E" content=" Create End To End Flow" position="bottom" />
                      </>
                  }
                  {/* {showE2EPopup && <LongContentDemo setShowE2EOpen={setShowE2EPopup}  module={moduleSelect} />} */}
                </div>
                {/* <div className='searchBox pxBlack'>
                                       <img style={{marginLeft:'1.3rem',width:'1rem',}} src="static/imgs/checkBoxIcon.png" alt="AddButton" />
                                           <input className='pFont' style={{width:'12rem'}} placeholder="Search Modules" ref={SearchInpEnE} onChange={(e)=>searchModule_E2E(e.target.value)}/>
                                           <img src={"static/imgs/ic-search-icon.png"} alt={'search'} />
                   </div> */}
                <div className='searchAndCheckImg'>
                  <img style={{ width: '1.05rem', height: '1.05rem' }} src="static/imgs/checkBoxIcon.png" alt="AddButton" />
                  <div className='inputSearchNorMod'>
                    <span className="p-input-icon-left">
                      <i className="pi pi-search" />
                      <InputText placeholder="Search " ref={SearchInpEnE} onChange={(e) => searchModule_E2E(e.target.value)} title=' Search for  E2E Flow' />
                    </span>
                  </div>
                </div>
                <div className="NorModuleListE2E">
                  {/* {moduleList && moduleList.map((module)=>{
                              return(
                              <>
                                <div className="EachModNameBox">
                                   <div key={module.id} className="moduleName" ><img src="static/imgs/E2EModuleSideIcon.png" alt="modules" /><h4 title={module.name}>{module.name}</h4></div>
                                   
                                </div>
                              </>
                              )
                        })} */}
                  {moduleLists.map((e, i) => {
                    if (e.type === "endtoend" && ((searchInpTextEnE !== "" && e.name.toUpperCase().indexOf(searchInpTextEnE.toUpperCase()) !== -1) || searchInpTextEnE === ""))
                      return (<>

                        <div key={i} data-test="individualModules" name={e.name} value={e._id} type={e.type} className={'EachModNameBox' + ((moduleSelect._id === e._id) ? " selected" : "")}
                          style={moduleSelect._id === e._id ? { backgroundColor: '#EFE6FF' } : {}} onClick={(e) => selectModules(e)} title={e.name} >
                          <div style={{ textOverflow: 'ellipsis', width: '9rem', overflow: 'hidden', textAlign: 'left', height: '1.3rem', display: 'flex', alignItems: "center", width: '99%' }}>
                            <img src="static/imgs/checkBoxIcon.png" alt="AddButton" /><img src="static/imgs/E2EModuleSideIcon.png" style={{ marginLeft: '10px', width: '20px', height: '20px' }} alt="modules" />
                            <span style={{ textOverflow: 'ellipsis' }} className='modNmeE2E'>{e.name}</span>
                            <img src="static/imgs/edit-icon.png" className='E2Eedit' onClick={() => { setWarning(true); setShowE2EPopup(true); handleEditE2E();  }}
                              disabled={(moduleSelect._id === e._id) && moduleSelect.type !== "endtoend"}
                              style={{ width: '20px', height: '20px',display:moduleSelect._id !== e._id?  "none" : ''   }} alt="AddButton" />
                               <Tooltip target=".E2Eedit" content=" Edit End To End Flow" position="bottom" />
                            <div></div></div>


                        </div>

                      </>
                      )
                  })}
                </div>
              </div>
            </div>
    </div>
    <div className='scenarioListBox' style={{width:collapse? "10rem":"0.5rem", overflowX:'hidden',height:'57.7%',display: 'none'}}>
                    <div style={{display:"flex", flexDirection:"column", width:"100%",overflowX:'hidden'}}>
                        <div style={{display:'flex',justifyContent:'space-between'}}>
                            <img style={{width:'1.7rem',height:'1.7rem',marginTop:'5px',  display:!isE2EOpen || !collapse? 'none':'',}}  src='static/imgs/node-scenarios.png' alt='/node-scenarios'/>
                    <div style={{paddingTop:'0.47rem',marginLeft: "4px",}}><h5 style={{fontSize:'17px',opacity:!isE2EOpen || !collapse? '0':''}}><b>Scenarios</b></h5></div>
                    <div style={{marginRight:'-0.4rem',marginTop:'0rem',cursor:'pointer'}} onClick={()=> {setIsE2EOpen(false);collapsed();  
                    }}><img src="static/imgs/X_button.png" alt="cross button" /></div></div>
                     <span style={{display:'flex', flexDirection:'row-reverse',  marginTop:'2px',marginRight:!isE2EOpen || !collapse? '15rem':''}}>
                        <input  style={{width:'137px',height: '23px', borderRadius:'6px',fontSize:'15px',marginRight:'0.65rem',}} placeholder="Search Scenario" ref={SearchScInp} onChange={(e)=>searchScenario(e.target.value)}></input>
                        <img style={{width: '12px', height: '17px', marginRight:"-8.2rem", marginTop:'2px',zIndex:'1'}} src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                    </span>
                        <div className='scenarioList' style={{opacity:!isE2EOpen || !collapse? '0':''}}>
                            <div style={{display: !showNote? '':'none', textAlign:'center', marginTop:'3rem', marginRight:!isE2EOpen || !collapse? '15rem':'', overflowX:'hidden',opacity:''}}><h7 >Please select a module to display <br></br> it's scenarios</h7></div> 
                        <div style={{display:  (showNote && scenarioList.length==0 )? '':'none', textAlign:'center', marginTop:'3rem',  overflowX:'hidden',opacity:''}}><h7 >There are no Scenarios in this Module </h7></div> 
                              
                                {scenarioList.map((e, i) => {

                                    
                                    return (
                                        <div key={i} className='scenarios ' style={{marginRight:!isE2EOpen || !collapse? '15rem':''}}>

                                            <div  key={i + 'scenario'} onClick={(e) => addScenario(e)} className={'dropdown_scenarios'} title={e.name} value={e._id} >
                                                <div style={{display:'flex',marginTop:'3px',textOverflow:"ellipsis"}}><input type="checkbox"  value={e._id} onChange={(e)=>{} } checked={selectedSc[e._id]}  />
                                                <span style={{textOverflow:"ellipsis", height:'1rem'}}>
                                                {e.name}</span></div></div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className='AddBut'>
                                <Button onClick={clickAdd} style={{  marginLeft:'.7rem',marginTop:'0.4rem',textAlign:'center',width:'66px',height:'31px', alignContent:'center',cursor:'pointer',alignItems:'center'}} disabled={ Object.keys(selectedSc).length<1? true : false} label="ADD"  />
                            </div>
                            </div>
                    <div className='collapseButtonDiv' style={{marginLeft: collapsed? "-4rem":''}} ><img className='collapseButton' style={{ cursor: !isE2EOpen ? 'no-drop' : 'pointer', transform: isE2EOpen && collapse ? 'rotate(180deg)' : 'rotate(0deg)',height:'30px',width:'8px', position:'relative'
                        }} onClick={isE2EOpen ? collapsed : null} src='static/imgs/collapseButton.png' alt='collapseButton'/> </div>
                 
                </div>
        </>
            
            
                <div data-test="dropDown" onClick={()=>{
                    // dispatch({type:actionTypes.SELECT_MODULELIST,payload:[]})
                    }}>
                
            </div>
        </Fragment>
    );
}

//content for moduleclick warning popup
const Content = () => (
    <p>Unsaved work will be lost if you continue. Do you want to continue?</p>
)

//footer for moduleclick warning popup
// const Footer = (props) => (
//   <div className='warningPopup'>
//     <div className='toolbar__module-warning-footer'>
//         <div className='btn-warning'>
//           {/* <button className='btn-yes' onClick={()=>props.loadModule(props.modID)}>Yes</button> */}
//           <Button className='btn-yes' onClick={()=>props.loadModule(props.modID)} label="Yes" />
//           {/* <button onClick={()=>{props.setWarning(false)}}>No</button> */}
//           <Button onClick={()=>{props.setWarning(false)}} label="No" />
//         </div>
//     </div>
//   </div>
const handleReaOnlyTestSuite=async (props)=>{
  let resetInUse=false
  let assignToUser=false
  var reqForCurrentModule={
    tab:"createTab",
    projectid:props.proj,
    version:0,
    cycId: null,
    modName:"",
    moduleid:props.modID
}
var reqForOldModule={
  tab:"createTab",
  projectid:props.proj,
  version:0,
  cycId: null,
  modName:"",
  moduleid:props.oldModuleForReset
}

var moduledata = await getModules(reqForCurrentModule)
var moduledataold=await getModules(reqForOldModule)
if(moduledata.error){props.displayError(moduledata.error);return}
  
  if(!moduledata.currentlyInUse.length>0)
  // if testuite isnt assigned to any user
  {
    // check for older testsuite assignment to get reset 
    //here we will check whether the older module was assigned to current logged in user or not 
    
   (moduledataold.currentlyInUse!==props.userInfo?.username) ? resetInUse=false: resetInUse=true

        // call the api to assign current testsuite and reset older one(based on above condition) 
   await scrapeApi.updateTestSuiteInUseBy(props.appType,props.modID,props.oldModuleForReset,props.userInfo?.username,true,resetInUse)
   props.loadModule(props.modID)
  }
   else if(moduledataold.currentlyInUse===props.userInfo?.username ){

    // only reset no assignment 
    resetInUse=true
    
    await scrapeApi.updateTestSuiteInUseBy(props.appType,props.modID,props.oldModuleForReset,props.userInfo?.username,false,resetInUse)
    props.loadModule(props.modID)
  }
  else{
    props.loadModule(props.modID)
  }

}
const Footer = (props) => (
  <div className='toolbar__module-warning-footer'>
      <Button size="small" onClick={()=>{props.setWarning(false)}}>No</Button>
      <Button size="small" className='btn-yes' onClick={()=>handleReaOnlyTestSuite(props)}>Yes</Button>
  </div>
)





export default ModuleListDrop;