import React, { useState, Fragment, useRef, useEffect } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import {getModules, populateScenarios,getProjectList,saveE2EDataPopup}  from '../api'
import {ModalContainer,Messages as MSG, setMsg} from '../../global';
import {ScreenOverlay} from '../../global';
import * as d3 from 'd3';
import '../styles/ModuleListDrop.scss'
import "../styles/ModuleListSidePanel.scss";
import ImportMindmap from'../components/ImportMindmap.js';
import { isEnELoad, savedList , initEnEProj, selectedModule,selectedModulelist, moduleList} from '../designSlice';
import { Tree } from 'primereact/tree';
import { Checkbox } from "primereact/checkbox";
import "../styles/ModuleListSidePanel.scss";
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';
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
import { setShouldSaveResult } from 'agenda/dist/job/set-shouldsaveresult';
// import { Icon } from 'primereact/icon';


const ModuleListDrop = (props) =>{
    const dispatch = useDispatch()
    const moduleList = useSelector(state=>state.design.moduleList)
    const proj = useSelector(state=>state.design.selectedProj)
    const initProj = useSelector(state=>state.design.selectedProj)
    const moduleSelect = useSelector(state=>state.design.selectedModule)
    const moduleSelectlist = useSelector(state=>state.design.selectedModulelist)
    const initEnEProjt = useSelector(state=>state.design.initEnEProj)
    const [moddrop,setModdrop]=useState(true)
    const [warning,setWarning]=useState(false)
    const [loading,setLoading] = useState(false)
    const isAssign = props.isAssign
    const [options,setOptions] = useState(undefined)
    const [modlist,setModList] = useState(moduleList)
    const SearchInp = useRef();
    const [searchInpText,setSearchInpText] = useState('');
    const [searchInpTextEnE,setSearchInpTextEnE] = useState('');
    const SearchInpEnE = useRef();
    const SearchMdInp = useRef()
    const [modE2Elist, setModE2EList] = useState(moduleList)
    const [searchForNormal, setSearchForNormal] = useState(false)
    const [importPop,setImportPop] = useState(false)
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


    ////  /////ModuleListSidePanel'S dependencies
    const [showInput, setShowInput] = useState(false);
    const [moduleLists, setModuleLists] = useState(null);
    const [ moduleListsForScenario,  setModuleListsForScenario] = useState(null);
    const [showInputE2E, setShowInputE2E] = useState(false);
    const [projectList, setProjectList] = useState([]);
    const [projectId, setprojectId] = useState("");
    const [showE2EPopup, setShowE2EPopup] = useState(false);
    const [configTxt, setConfigTxt] = useState("");
    const [isCreateE2E, setIsCreateE2E] = useState(initEnEProjt && initEnEProjt.isE2ECreate?true:false)
    const [E2EName,setE2EName] = useState('')
    const [editE2ERightBoxData,setEditE2ERightBoxData] = useState([])
    const [cardPosition, setCardPosition] = useState({ left: 0, right: 0, top: 0 ,bottom:0});
  const [showTooltip, setShowTooltip] = useState(false);

    const imageRefadd = useRef(null);

    const handleTooltipToggle = () => {
      const rect = imageRefadd.current.getBoundingClientRect();
      setCardPosition({ right: rect.right, left: rect.left, top: rect.top ,bottom:rect.bottom});
      setShowTooltip(true);
    };
  
    const handleMouseLeave1 = () => {
      setShowTooltip(false);
    };
   
    useEffect(()=> {
        if(!searchForNormal && !isCreateE2E ) {
            if(moduleList.length > 0) {
                const showDefaultModuleIndex = moduleList.findIndex((module) => module.type==='basic');
                selectModule(moduleList[showDefaultModuleIndex]._id, moduleList[showDefaultModuleIndex].name, moduleList[showDefaultModuleIndex].type, false,true); 
        }}
        else{dispatch(savedList(true))}
        setWarning(false); 
        
     }, [moduleList, initProj, searchForNormal, isCreateE2E, dispatch])
     useEffect(()=> {
        return () => {
            dispatch(isEnELoad(false));
            // dispatch({type:actionTypes.INIT_ENEPROJECT,payload:undefined});
        }
     },[]);

     useEffect(()=>{
        (async()=>{
          var data=[]
          const Projects = await getProjectList()
          for(var i = 0; Projects.projectName.length>i; i++){
              data.push({name:Projects.projectName[i], id:Projects.projectId[i]})
            }
            // data.push({...data, name:Projects.projectName[i], id:Projects.projectId[i]})
        //  const data =[ {
        //     key: Projects.projectId,
        //     value:Projects.projectNames
        //   }]
          setProjectList(data)
        })()
      },[projectId])

    //  useEffect (()=>{
    //     {dispatch({type:actionTypes.SAVED_LIST,payload:true});}
    //  },[isCreateE2E])

    //  useEffect(()=>{
    //      setSearchForNormal(false);
    //      if(!isE2EOpen){
    //     // setIsCreateE2E(false);
    //     }
        
    //  },[initProj])
    //  useEffect(() => {
    //     setIsCreateE2E(initEnEProj && initEnEProj.isE2ECreate?true:false);
        
    //   },[initEnEProj]);

    //  useEffect(()=>{
    //     // if(moduleSelect.type === 'endtoend') {
            
    //     // }
    //     searchModule("");
    //     searchModule_E2E("");
    //     setSearchInpTextEnE("");
    //     setSearchInpText("");
    //     setWarning(false);
    //     setScenarioList([]);
    //  }, [proj])
    
     useEffect(()=>{
        var filter = [...initScList].filter((e)=>e.name.toUpperCase().indexOf(filterSc.toUpperCase())!==-1)
        setScenarioList(filter)
    },[filterSc,setScenarioList,initScList])
    // about select all check box
    useEffect(()=>{
        if(moduleSelectlist.length===moduleList.filter(module=> module.type==='basic').length && moduleSelectlist.length>0  ){
          setAllModSelected(true);
        }
        else{
          setAllModSelected(false);
        }
      },[moduleSelectlist, moduleList])
    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }
    const collapsed =()=> setCollapse(!collapse)
    const collapsedForModules =()=> setCollapseForModules (!collapseForModules )
    const collapsedForModuleWholeCont =()=> (setCollapseWhole(!collapseWhole))
    const CreateNew = () =>{
        setIsE2EOpen(false);
        setCollapse(false);
        dispatch(selectedModule({createnew:true}))
        dispatch(initEnEProj({proj, isE2ECreate: false}));
        dispatch(isEnELoad(false));
        setFirstRender(false);
    }
    const clickCreateNew = () =>{
        dispatch(selectedModule({createnew:true}))
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
        dispatch(selectedModule({}))
        dispatch(isEnELoad(false));
        setWarning(false)
        setBlockui({show:true,content:"Loading Module ..."}) 
        // if(moduleSelect._id === modID){
           
        // }
        dispatch(selectedModule({}))
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
        dispatch(selectedModule(res))
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

        }else{
            setWarning({modID, type});
        }
        setFirstRender(false);

        return; 
    }    
    const loadModuleE2E = async(modID) =>{
        setWarning(false)
        setIsE2EOpen(true)
        setCollapse(true)
        setBlockui({show:true,content:"Loading Module ..."})   
        // if(moduleSelect._id === modID){
            
            
        // }
        dispatch(selectedModule({}))
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
        dispatch(selectedModule(res))
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

            let selectedModList = [];
            if(moduleSelectlist.length>0){
                selectedModList=moduleSelectlist;              
            }
            if(selectedModList.indexOf(modID)===-1){
                selectedModList.push(modID);
            }else{
                selectedModList = selectedModList.filter(item => item !== modID)
            }              
            dispatch(selectedModulelist([...selectedModList]))         
            return;
        }
    }
      const handleEditE2E=()=>{
           setE2EName(moduleSelect.name)
           const editE2EData  = moduleSelect.children.map((item)=>{
            return{
                sceName:item.name,
                scenarioId: item._id,
                modNme:'',
                projectname:''
              }

           })
           setEditE2ERightBoxData(editE2EData);

      }
    // ///////////// _____ E2E popUp_____ ///////////////////////////////////////////////////////////////////////////////////////////////////////

    const LongContentDemo = (props) => {
        const [newProjectList, setNewProjectList] = useState([]);
        const[overlayforModSce,setOverlayforModSce]=useState(false)
        // const [storedSelectedProj, setStoredSelectedProj] = useState('');
        const [selectedKeys, setSelectedKeys] = useState([]);
        const [transferBut, setTransferBut] = useState( E2EName? editE2ERightBoxData : [] );
        const [inputE2EData, setInputE2EData] = useState('');
        const [newModSceList, setNewModSceList] = useState([]);
        const [selectedProject, setSelectedProject] = useState(null);
        const [projOfSce, setProjOfSce] = useState("");
        const [searchScenarioLeftBox, setSearchScenarioLeftBox] = useState('')
        const[filterModSceList,setFilterModSceList] =useState([])
        // const forCatchingCheckBoxSelDemo = useMemo(()=> CheckboxSelectionDemo())
        useEffect(() => {
          (async () => {
            let projectCollection = [];
            for (let proj of projectList) {
              const modData = await getModules({
                tab: 'endToend',
                projectid: proj.id,
                version: 0,
                cycId: null,
                modName: '',
                moduleid: null
              });
              let moduleCollection = [];
              for (let mod of modData) {
                if (mod.type === 'basic') {
                  let scenarioCollection = [];
                  const scenData = await populateScenarios(mod._id);
                  for (let scenarioData of scenData) {
                    scenarioCollection.push({
                      id: scenarioData._id,
                      name: scenarioData.name
                    });
                  }
                  moduleCollection.push({
                    id: mod._id,
                    name: mod.name,
                    scenarioList: scenarioCollection
                  });
                }
              }
              projectCollection.push({
                id: proj.id,
                name: proj.name,
                moduleList: moduleCollection
              });
            }
            setNewProjectList(projectCollection);
            setSelectedProject(proj)
          })();
        }, []);
        useEffect(() => {
          (async() => {
            setOverlayforModSce(true)
            const moduleList = await getModules({
              tab: 'endToend',
              projectid: selectedProject,
              version: 0,
              cycId: null,
              modName: '',
              moduleid: null
            });
            const projectNameforScenario = projectList.find(item => item.id === selectedProject)

            let moduleCollections = [];
            for (let modu of moduleList) {
              if (modu.type === 'basic') {
                let scenarioCollections = [];
                const scenDatas = await populateScenarios(modu._id);
                for (let scenarioDatas of scenDatas) {
                  scenarioCollections.push({
                    id: scenarioDatas._id,
                    name: scenarioDatas.name
                  });
                }
                moduleCollections.push({
                  id: modu._id,
                  name: modu.name,
                  scenarioList: scenarioCollections,
                  projectname:projectNameforScenario.name
                });
              }
            }
            setNewModSceList(moduleCollections)
            setFilterModSceList(moduleCollections);
            if(moduleCollections.length)setOverlayforModSce(false)

            //  var filter = moduleCollections.scenarioList.find((e)=>e.name.toUpperCase().indexOf(searchScenarioLeftBox.toUpperCase())!==-1)
                // setFilterModSceList(filter)
          })();
        }, [selectedProject]);

        const deleteScenarioselected = (ScenarioSelectedIndex)=>{
          let newTrans =[...transferBut];
         let newData = newTrans.find(item=>item.sceIdx === ScenarioSelectedIndex)
          newTrans.splice(ScenarioSelectedIndex, 1);
          setTransferBut(newTrans);
         }
        
        const handleSearchScenarioLeftBox =(val)=>{
          if(val === "") {
            setFilterModSceList(newModSceList);
          } else {
            setFilterModSceList(newModSceList.scenarioList.find((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1));
          }
          setSearchScenarioLeftBox(val);  
        }
        
        const handleArrowBut =()=>{
          // let array = [...selectedKeys]
            // setTransferBut=[...transferBut,array]
            setTransferBut((oldTransferBut) => [...oldTransferBut, ...selectedKeys]);

            setSelectedKeys([]);
        }
        const pushingEnENmInArr ={
            "id": 0,
            "childIndex": 0,
            "_id": null,
            "oid": null,
            "name":inputE2EData,
            "type": "endtoend",
            "pid": null,
            "pid_c": null,
            "task": null,
            "renamed": false,
            "orig_name": null,
            "taskexists": null,
            "state": "created",
            "cidxch": null}
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
                        "_id": E2EName? moduleSelect._id : null,
                        "oid": null,
                        "name": E2EName? E2EName : inputE2EData,
                        "type": "endtoend",
                        "pid": null,
                        "pid_c": null,
                        "task": null,
                        "renamed": false,
                        "orig_name": null,
                        "taskexists": null,
                        "state": E2EName? "saved" : "created",
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
                        "id": parseInt(scenarioItem)+1,
                        "childIndex": parseInt(scenarioItem)+1,
                        "_id": transferBut[scenarioItem].scenarioId,
                        "oid": null,
                        "name": transferBut[scenarioItem].sceName,
                        "type": "scenarios",
                        "pid": 0,
                        "task": null,
                        "renamed": false,
                        "orig_name": null,
                        "taskexists": null,
                        "state": "created",
                        "cidxch": "true"
                    }
                )
            }
           

            const saveE2E_sce = await saveE2EDataPopup(HardCodedApiDataForE2E) 
            if(saveE2E_sce.error){displayError(saveE2E_sce.error);return}
          
        }

        const handleCheckboxChange = (e, modIndx, sceIdx,  modName, sceName,moduleId,scenarioId,projectname) => {
          const selectedScenario = `${modIndx}-${sceIdx}`;
          if (e.checked) {
            setSelectedKeys([...selectedKeys, {
                 modIndx, sceIdx, modName, sceName, selectedScenario,moduleId,scenarioId,projectname
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
                  <Button label="Save" disabled={(!inputE2EData.length>0) && (!transferBut.length>0) }  onClick={() => {setShowE2EPopup(false); dataOnSaveButton() }} autoFocus />
                  {/* <SaveMapButton  isEnE={true}   /> */}
              </div>
            );
            const projectItems = newProjectList.map((projectDrp, prjIdxDrp) => {
              
              return( {label: projectDrp.name,
              value: projectDrp.id}
              )
            })

            const changeProject = (e) =>{
              setSelectedProject(e.value)
              const selectedProjForSce = newProjectList.find(project=> project.id === e.value);
              setProjOfSce(selectedProjForSce.name)
             }
            
            
        return (
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
                        placeholder="Enter End to End Module Name"
                        customClass="inputRow_for_E2E_popUp"
                        inputType="lablelRowReqInfo"
                        inputTxt={E2EName? E2EName:inputE2EData} 
                        setInputTxt={setInputE2EData}
                      />
                    </div>
                  </div>
                  <div className="centralTwinBox">
                    <div className="leftBox">
                      <Card title="Select Scenarios" className="leftCard">
                     <div className="DrpoDown_search_Tree">
                          <div className='searchAndDropDown'>
                            <div className="headlineSearchInput">
                              <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText type="text"
                                  placeholder="Search Scenarios"
                                  style={{ width: '15rem', height: '2.2rem', marginRight:'0.2rem', marginBottom: '1%' }}
                                  className="inputContainer" onChange={(e)=>handleSearchScenarioLeftBox(e.target.value)}
                                />
                              </span>
                            </div>
                            <div className="card flex justify-content-center" style={{marginRight:'0.3rem'}}>
                              {/* dropDown of projects */}
                              <Dropdown
                                value={selectedProject}
                                name={projectItems}
                                onChange={(e) => changeProject(e)}
                                options={projectItems}

                                placeholder="Select a Project"
                              />
                            </div>
                            <h4>Projects:</h4>
                          </div>
                        
                         {/* <MemorizedCheckboxSelectionDemo/> */}
                        {/* <CheckboxSelectionDemo /> */}
                        <div>
                          {overlayforModSce? <h5 className='overlay4ModSce'>Loading modules and Scenarios...</h5>:
                            <Tree
                              value={
                               filterModSceList.map((module, modIndx) => ({
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
                                          onChange={(e) => handleCheckboxChange(e, modIndx, sceIdx, module.name, scenario.name, module.id, scenario.id,module.projectname)}
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

                            />}

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
                      <Card title="Selected Scenarios" className="rightCard">
                      <div className="headlineSearchInputOfRightBox">
                          {/* <div className="headlineRequiredOfRightBox">
                            <img src="static/imgs/Required.svg" className="required_icon" />
                          </div> */}
                          <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText
                              placeholder="Search Scenarios by name"
                              className="inputContainer"
                            />
                          </span>
                      </div>
                      <div className="ScenairoList">
                          {transferBut.map((ScenarioSelected, ScenarioSelectedIndex) => {
                            return (
                              <div key={ScenarioSelectedIndex} className="EachScenarioNameBox" >
                                <div className="ScenarioName" ><div className='sceNme_Icon'><img src="static/imgs/ScenarioSideIconBlue.png" alt="modules" />
                                  <h4>{ScenarioSelected.sceName}</h4><div className="modIconSce"><h5>(<img src="static/imgs/moduleIcon.png" alt="modules" /><h3>{ScenarioSelected.modName})</h3></h5></div>
                                  <div className="projIconSce"><h5>(<img src="static/imgs/projectsideIcon.png" alt="modules" /><h3>{ScenarioSelected.projectname})</h3></h5></div>
                                  </div><Button icon="pi pi-times" onClick={() => { deleteScenarioselected(ScenarioSelectedIndex); }} rounded text severity="danger" aria-label="Cancel" /></div>
                              </div>
                            )
                          })}
                      </div>
                      </Card>
                      
                    </div>
                  </div>
                </div>
              </Dialog>
            </div>
          </div>
        );
      };
      
    return(
        <Fragment>
             {loading?<ScreenOverlay content={'Loading Mindmap ...'}/>:null}
            {warning.modID?<ModalContainer
                show = {warning.modID} 
                style={{width:"30%"}}
                title='Confirmation'
                close={()=>setWarning(false)}
                footer={<Footer modID={warning.modID} loadModule={warning.type ==='endtoend' ? loadModuleE2E : loadModule} setWarning={setWarning} />}
                content={<Content/>} 
                // modalClass='warningPopUp'
            />:null}
             <>
      <div className="CollapseWholeCont">
       <div className="collapseBut" style={{height:"9%",alignItems:'end',display:"flex",float:'right',position: collapseWhole? "absolute": "", left:'16rem',zIndex:'2',}}>
             <img src="static/imgs/CollapseButForLefPanel.png" alt="collapseBut" style={{ cursor:'pointer',transform: collapseWhole ? 'rotate(0deg)' : 'rotate(180deg)'}} onClick={ ()=>{collapsedForModuleWholeCont(); }}/> 
          </div>
       <div className="Whole_container" style={{width: collapseWhole? "17rem":"0.6rem",transitionDuration: '0.7s ',display: !collapseWhole? "none":"" }}>
           {/* <div className="project_name_section">
             <h5>Home/</h5>
             <select onChange={(e)=>{setprojectId(e.target.value)}} style={{width:'10rem', height:'19px'}}>
             {projectList.map((project, index) => (
                      
                               <option value={project.id} key={index}>{project.name}</option>
                              
                    
                       ))}
                 
             </select>
           </div> */}
           
           <div className="normalModule_main_container">
               <div className="moduleLayer_plusIcon">
                     <div className="moduleLayer_icon">
                        <img src="static/imgs/moduleLayerIcon.png" alt="moduleLayerIcon" /> <h3 className="normalModHeadLine">Module Layers</h3> 
                     </div>
                     {/* <div className="SearchIconForModules">
                       <span className={`pi pi-search ${showInput? 'searchIcon_adjust' :''}` } style={{fontSize:'1.1rem',cursor:'pointer'}} onClick={clickForSearch}></span>
                       {showInput&&(
                       <div>
                           <input className="inputOfSearch" type="text"/>
                           <i className="pi pi-times"  onClick={click_X_Button}></i>
                       </div>)}
                     </div> */}
                     <i className="pi pi-file-import mindmapImport" title='Import Module' onClick={()=>setImportPop(true)}></i>
                     {importPop? <ImportMindmap setBlockui={setBlockui} displayError={displayError} setOptions={setOptions} setImportPop={setImportPop} isMultiImport={true}  importPop={importPop} />:null}
                     <Tooltip target=".custom-target-icon" content=" Create module" position="bottom" />
                     <img  className="custom-target-icon" src="static/imgs/plusNew.png" alt="NewModules"  onClick={()=>{ CreateNew()}}  /> 
                   
                  
             </div>
                <div className='' style={{display:'flex',height:'1.6rem',marginTop:'2%',marginLeft:'3%'}}>
                      <input style={{width:'1rem',marginLeft:'0.57rem',marginTop:'0.28rem'}} title='Select All Modules' name='selectall' type={"checkbox"} id="selectall" checked={allModSelected} onChange={(e) => {
                                    if (!allModSelected) {
                                        dispatch(selectedModulelist( moduleList.filter(module=> module.type==='basic').map((modd) => modd._id) ))
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
                                         <InputText placeholder="Search" ref={SearchInp} onChange={(e)=>{searchModule(e.target.value)}} title=' Search for module'/>
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
                        {moduleList.map((e,i)=>{
                                        if(e.type==="basic" && ((searchInpText !== "" && e.name.toUpperCase().indexOf(searchInpText.toUpperCase())!==-1) || searchInpText === ""))
                                        return(<>
                                                   {/* // <div key={i}>
                                                   //         <div data-test="modules" value={e._id}  className={'EachModNameBox'+((moduleSelect._id===e._id  )?" selected":"")} style={(moduleSelect._id===e._id || e._id===isModuleSelectedForE2E && isE2EOpen)?   {backgroundColor:'#EFE6FF'}:{}  }  title={e.name} type={e.type}>                                    
                                                   //             <div className='modClick' value={e._id} style={{display:'flex',flexDirection:'row'}} >
                                                   //             {<input type="checkbox" className="checkBox" style={{marginTop:'3px'}} value={e._id} onChange={(e)=>selectedCheckbox(e,"checkbox") }  />}  
                                                   //             <span  onClick={(e)=>selectModule(e.target.getAttribute("value"), e.target.getAttribute("name"), e.target.getAttribute("type"), e.target.checked)} className='EachModNameBox' value={e._id} style={{textOverflow:'ellipsis',textAlign:'left',width:'7rem'}}>{e.name}</span>
                                                   //             </div>
                                                   //         </div>
                                                   // </div> */}
                                            <div key={i} data-test="modules" value={e._id} title={e.name} type={e.type}>
                                                    <div className={'EachModNameBox'+((moduleSelect._id===e._id  )?" selected":"")} style={(moduleSelect._id===e._id || e._id===isModuleSelectedForE2E && isE2EOpen)?   {backgroundColor:'#EFE6FF'}:{}  } >
                                                      {<input type="checkbox" className="checkBox" style={{marginTop:'3px'}} value={e._id} onChange={(e)=>selectedCheckbox(e,"checkbox") } checked={moduleSelectlist.includes(e._id)} />}
                                                      <img src="static/imgs/moduleIcon.png" style={{width:'20px',height:'20px',marginLeft:'0.5rem'}} alt="modules" />
                                                      <div style={{width:'13rem',textOverflow:'ellipsis',overflow:'hidden'}}>
                                                      <h4 className="moduleName" onClick={(e)=>selectModule(e.target.getAttribute("value"), e.target.getAttribute("name"), e.target.getAttribute("type"), e.target.checked)} value={e._id} style={{textOverflow:'ellipsis',textAlign:'left',fontWeight:'300'}}>{e.name}</h4>
                                                      </div>  
                                                    </div>
                                            </div>
                                            </>
                                            ) 
                                    })}
                </div>
           </div>
           <div className="E2E_main_container">
               <div className="moduleLayer_plusIcon">
                      <div className= 'moduleLayer_icon' >  
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
                      <img   src="static/imgs/plusNew.png" onClick={()=>setShowE2EPopup(true)}  alt="PlusButtonOfE2E" /> 
                      {showE2EPopup&&<LongContentDemo setShowE2EOpen={setShowE2EPopup} module={moduleSelect}/>}
                </div>
                   {/* <div className='searchBox pxBlack'>
                                       <img style={{marginLeft:'1.3rem',width:'1rem',}} src="static/imgs/checkBoxIcon.png" alt="AddButton" />
                                           <input className='pFont' style={{width:'12rem'}} placeholder="Search Modules" ref={SearchInpEnE} onChange={(e)=>searchModule_E2E(e.target.value)}/>
                                           <img src={"static/imgs/ic-search-icon.png"} alt={'search'} />
                   </div> */}
                   <div className='searchAndCheckImg'>
                    <img style={{width:'1.05rem',height:'1.05rem'}} src="static/imgs/checkBoxIcon.png" alt="AddButton" />
                    <div className='inputSearchNorMod'>           
                               <span className="p-input-icon-left">
                                         <i className="pi pi-search" />
                                         <InputText placeholder="Search " ref={SearchInpEnE} onChange={(e)=>searchModule_E2E(e.target.value)} title=' Search for  E2E module'/>
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
                        {moduleList.map((e,i)=>{
                                            if(e.type==="endtoend" && ((searchInpTextEnE !== "" && e.name.toUpperCase().indexOf(searchInpTextEnE.toUpperCase())!==-1) || searchInpTextEnE === ""))
                                            return(<>
                                                    
                                                    <div key={i}  data-test="individualModules" name={e.name} value={e._id} type={e.type} className={'EachModNameBox'+((moduleSelect._id===e._id)?" selected":"")} 
                                                          style={moduleSelect._id===e._id?  {backgroundColor:'#EFE6FF'}:{} }   onClick={(e)=>selectModules(e)} title={e.name} >
                                                          <div style={{textOverflow:'ellipsis', width:'9rem',overflow:'hidden',textAlign:'left', height:'1.3rem', display:'flex',alignItems:"center",width:'99%'}}> 
                                                          <img  src="static/imgs/checkBoxIcon.png" alt="AddButton" /><img src="static/imgs/E2EModuleSideIcon.png" style={{marginLeft:'10px',width:'20px',height:'20px'}} alt="modules" />
                                                          <span style={{textOverflow:'ellipsis'}} className='modNmeE2E'>{e.name}</span>
                                                          <div ></div></div>
                                                          <img  src="static/imgs/edit-icon.png" onClick={()=>{setShowE2EPopup(true); handleEditE2E()}} disabled={moduleSelect._id===e._id? true : false}
                                                           style={{width:'20px',height:'20px'}} alt="AddButton" /> 
                                                    
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
const Footer = (props) => (
  <div className='toolbar__module-warning-footer'>
      <Button size="small" onClick={()=>{props.setWarning(false)}}>No</Button>
      <Button size="small" className='btn-yes' onClick={()=>props.loadModule(props.modID)}>Yes</Button>
  </div>
)





export default ModuleListDrop;