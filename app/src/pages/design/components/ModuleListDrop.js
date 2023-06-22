import React, { useState, Fragment, useRef, useEffect } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import {getModules, populateScenarios,getProjectList,saveE2EDataPopup}  from '../api'
import {ModalContainer,Messages as MSG, setMsg} from '../../global';
import {ScreenOverlay} from '../../global';
import * as d3 from 'd3';
import '../styles/ModuleListDrop.scss'
import "../styles/ModuleListSidePanel.scss";
import ImportMindmap from'../components/ImportMindmap.js';
import { isEnELoad, savedList , initEnEProj, selectedModule,selectedModulelist} from '../designSlice';
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
    // ///////////// _____ E2E popUp_____ ///////////////////////////////////////////////////////////////////////////////////////////////////////

    const LongContentDemo = () => {
        const [newProjectList, setNewProjectList] = useState([]);
        const [storedSelectedKeys, setStoredSelectedKeys] = useState([]);
        const [selectedKeys, setSelectedKeys] = useState([]);
        const [transferBut, setTransferBut] = useState([]);
        const [inputE2EData, setInputE2EData] = useState('');
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
          })();
        }, []);
        console.log("newProjectList",newProjectList)
        const handleArrowBut =()=>{
             setTransferBut(selectedKeys)
            
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
        // console.log("inputE2EData",inputE2EData)
        console.log("transferBut[1]",transferBut)
      
        
    //      HardCodedApiDataForE2E.map[0].name =inputE2EData
    //      HardCodedApiDataForE2E.map[1] =transferBut
    //    console.log("readingdataE2E",HardCodedApiDataForE2E.map[1].name)
    //    console.log("readingdataE2EName",HardCodedApiDataForE2E)
    //    console.log("length of transferbut",transferBut.length)
      
        const dataOnSaveButton =async()=>{
            console.log("dataOnClickSaveButton",transferBut);
            let HardCodedApiDataForE2E = {
                "action": "/saveEndtoEndData",
                "write": 10,
                "deletednode": [],
                "map": [
                    {
                        "id": 0,
                        "childIndex": 0,
                        "_id": null,
                        "oid": null,
                        "name": inputE2EData,
                        "type": "endtoend",
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
            // const HardCodedApiDataForE2E = {
            //     "action": "/saveEndtoEndData",
            //     "write": 10,
            //     "map": [
            //         {
            //             "id": 0,
            //             "childIndex": 0,
            //             "_id": null,
            //             "oid": null,
            //             "name": "",
            //             "type": "endtoend",
            //             "pid": null,
            //             "pid_c": null,
            //             "task": null,
            //             "renamed": false,
            //             "orig_name": null,
            //             "taskexists": null,
            //             "state": "created",
            //             "cidxch": null
            //         },
            //         {
            //             "id": 1,
            //             "childIndex": 1,
            //             "_id": "641831913b886ffbc86bf169",
            //             "oid": null,
            //             "name": "Scenario_Endgame1",
            //             "type": "scenarios",
            //             "pid": 0,
            //             "task": null,
            //             "renamed": false,
            //             "orig_name": null,
            //             "taskexists": null,
            //             "state": "created",
            //             "cidxch": "true"
            //         },
            //         {
            //             "id": 2,
            //             "childIndex": 2,
            //             "_id": "641831913b886ffbc86bf168",
            //             "oid": null,
            //             "name": "Scenario_EndGame",
            //             "type": "scenarios",
            //             "pid": 0,
            //             "task": null,
            //             "renamed": false,
            //             "orig_name": null,
            //             "taskexists": null,
            //             "state": "created",
            //             "cidxch": "true"
            //         },
            //         {
            //             "id": 3,
            //             "childIndex": 3,
            //             "_id": "6417ff373b886ffbc86bf101",
            //             "oid": null,
            //             "name": "Scenario_IronMan",
            //             "type": "scenarios",
            //             "pid": 0,
            //             "task": null,
            //             "renamed": false,
            //             "orig_name": null,
            //             "taskexists": null,
            //             "state": "created",
            //             "cidxch": "true"
            //         }
            //     ],
            //     "deletednode": [],
            //     "unassignTask": [],
            //     "prjId": "6417fca33b886ffbc86bf0df",
            //     "createdthrough": "Web",
            //     "relId": null
            // }
            console.log("inputE2EData",inputE2EData)
            console.log("HardCodedApiDataForE2E",HardCodedApiDataForE2E);

            const saveE2E_sce = await saveE2EDataPopup(HardCodedApiDataForE2E) 
            if(saveE2E_sce.error){displayError(saveE2E_sce.error);return}
          
        }
        const CheckboxSelectionDemo = () => {
      
          const handleCheckboxChange = (e, projIdx, moduleIdx, scenarioIdx, projName, modName, sceName,projectId,moduleId,scenarioId) => {
            const selectedScenario = `${projIdx}-${moduleIdx}-${scenarioIdx}`;
            if (e.checked) {
              setSelectedKeys([...selectedKeys, {
                  projIdx, moduleIdx, scenarioIdx, projName, modName, sceName, selectedScenario,projectId,moduleId,scenarioId
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
           console.log("newProjectList",newProjectList)
          return (
            <div>
              <Tree
                value={newProjectList.map((project, projIdx) => ({
                  key: projIdx,
                  label: (
                    <div className="labelOfArray">
                      <img src="static/imgs/projectSideIcon.png" alt="modules" />
                      {project.name}
                    </div>
                  ),
                  children: project.moduleList.map((module, moduleIdx) => ({
                    key: `${projIdx}-${moduleIdx}`,
                    label: (
                      <div className="labelOfArray">
                        <img src="static/imgs/moduleIcon.png" alt="modules" />
                        {module.name}
                      </div>
                    ),
                    children: module.scenarioList.map((scenario, scenarioIdx) => ({
                      key: `${projIdx}-${moduleIdx}-${scenarioIdx}`,
                      label: (
                        <label style={{alignItem:'center',justifyContent:'center'}}>
                          <Checkbox
                            onChange={(e) => handleCheckboxChange(e, projIdx, moduleIdx, scenarioIdx, project.name, module.name, scenario.name,project.id,module.id,scenario.id)}
                            checked={selectedKeys.map((keysCombo) => keysCombo.selectedScenario).includes(`${projIdx}-${moduleIdx}-${scenarioIdx}`)}
                          />
                          <>
                          </>
                          <img style={{width:'18px',height:'16px'}} src="static/imgs/ScenarioSideIconBlue.png" alt="modules" />
                          {scenario.name}
                        </label>
                      )
                    }))
                  }))
                }))}
                selectionMode="multiple"
                // selectionKeys={selectedKeys}
                style={{ height: '22.66rem', overflowY: 'auto' }}
                // onSelectionChange={(e) => setSelectedKeys(e.value)}
              />
              {/* <button onClick={handleTransferScenarios}>Transfer Scenarios</button> */}
            </div>
          );
        };
        //  const MemorizedCheckboxSelectionDemo = React.memo(CheckboxSelectionDemo)
            const footerContent = (
              <div>
                  <Button label="Cancel"  onClick={() => setShowE2EPopup(false)} className="p-button-text" />
                  <Button label="Save"  onClick={() => {setShowE2EPopup(false); dataOnSaveButton() }} autoFocus />
                  {/* <SaveMapButton  isEnE={true}   /> */}
              </div>
            );
        return (
          <div className="E2E_container">
            <div className="card flex justify-content-center">
              <Dialog
                className="Project-Dialog"
                header="Create End to End Flow"
                visible={showE2EPopup}
                style={{ width: '74.875rem', height: '100%', backgroundColor: '#605BFF' }}
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
                        inputTxt={inputE2EData}
                        setInputTxt={setInputE2EData}
                      />
                    </div>
                  </div>
                  <div className="centralTwinBox">
                    <div className="leftBox">
                      <Card className="leftCard">
                        <div className="headlineSearchInput">
                          <div className="headlineRequired">
                            <h5 style={{ fontSize: '14px' }}>Select Scenarios</h5>
                            <img src="static/imgs/Required.svg" className="required_icon" />
                          </div>
                          <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText
                              placeholder="Search Scenarios by name"
                              style={{ width: '32rem', height: '2.2rem' }}
                              className="inputContainer"
                            />
                          </span>
                        </div>
                         {/* <MemorizedCheckboxSelectionDemo/> */}
                        <CheckboxSelectionDemo />
                      </Card>
                    </div>
                    <div className="centerButtons">
                      <div className="centerButtonsIndiVisual">
                        <Button label=">" onClick={handleArrowBut} outlined />
                        {/* <Button label="<" outlined /> */}
                      </div>
                    </div>
                    <div className="rightBox">
                      <Card className="rightCard">
                      <div className="headlineSearchInputOfRightBox">
                          <div className="headlineRequiredOfRightBox">
                            <h5 style={{ fontSize: '14px' }}>Selected Scenarios</h5>
                            <img src="static/imgs/Required.svg" className="required_icon" />
                          </div>
                          <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText
                              placeholder="Search Scenarios by name"
                              style={{ width: '31rem', height: '2.2rem' }}
                              className="inputContainer"
                            />
                          </span>
                      </div>
                      <div className="ScenairoList">
                              { transferBut.map((ScenarioSelected)=>{
                                    return(
                                    <>
                                      <div className="EachScenarioNameBox" >
                                         <div key={ScenarioSelected.scenarioIdx} className="ScenarioName" ><img src="static/imgs/ScenarioSideIconBlue.png" alt="modules" /><h4>{ScenarioSelected.sceName}</h4><i className="pi pi-times"></i></div>
                                         
                                      </div>
                                    </>
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
                title='Confirmation'
                close={()=>setWarning(false)}
                footer={<Footer modID={warning.modID} loadModule={warning.type ==='endtoend' ? loadModuleE2E : loadModule} setWarning={setWarning} />}
                content={<Content/>} 
                modalClass='modal-sm'
            />:null}
             <>
      <div className="CollapseWholeCont">
       <div className="collapseBut" style={{height:"8%",alignItems:'end',display:"flex",float:'right',position: collapseWhole? "absolute": "", left:'16rem',zIndex:'2',}}>
             <img src="static/imgs/CollapseButForLefPanel.png" alt="collapseBut" style={{ cursor:'pointer',transform: collapseWhole ? 'rotate(0deg)' : 'rotate(180deg)'}} onClick={ ()=>{collapsedForModuleWholeCont(); console.log("collapseWhole",collapseWhole)}}/> 
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
                     <i className="pi pi-file-import mindmapImport" onClick={()=>setImportPop(true)}></i>
                     {importPop? <ImportMindmap setBlockui={setBlockui} displayError={displayError} setOptions={setOptions} setImportPop={setImportPop} isMultiImport={true}  importPop={importPop} />:null}
                     <img   src="static/imgs/plusNew.png" alt="NewModules" onClick={()=>{ CreateNew()}} /> 
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
                       <input className='pFont' style={{width:'12rem'}}placeholder="Search Modules" ref={SearchInp} onChange={(e)=>{searchModule(e.target.value)}}/>
                                        <img  style={{height:'17px',width:'17px',marginTop:'3px'}} src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
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
                                                      {<input type="checkbox" className="checkBox" style={{marginTop:'3px'}} value={e._id} onChange={(e)=>selectedCheckbox(e,"checkbox") }  />}
                                                      <img src="static/imgs/moduleIcon.png" style={{width:'20px',height:'20px',marginLeft:'0.5rem'}} alt="modules" />
                                                      <div style={{width:'6rem',textOverflow:'ellipsis',overflow:'hidden'}}>
                                                      <h4 className="moduleName" onClick={(e)=>selectModule(e.target.getAttribute("value"), e.target.getAttribute("name"), e.target.getAttribute("type"), e.target.checked)} value={e._id} style={{textOverflow:'ellipsis',textAlign:'left',width:'7rem'}}>{e.name}</h4>
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
                      {showE2EPopup&&<LongContentDemo/>}
                </div>
                   <div className='searchBox pxBlack'>
                                       <img style={{marginLeft:'1.3rem',width:'1rem',}} src="static/imgs/checkBoxIcon.png" alt="AddButton" />
                                           <input className='pFont' style={{width:'12rem'}} placeholder="Search Modules" ref={SearchInpEnE} onChange={(e)=>searchModule_E2E(e.target.value)}/>
                                           <img src={"static/imgs/ic-search-icon.png"} alt={'search'} />
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
                                                          <div style={{textOverflow:'ellipsis', width:'9rem',overflow:'hidden',textAlign:'left', height:'1.3rem', display:'flex',alignItems:"center",width:'91%'}}> 
                                                          <img style={{}} src="static/imgs/checkBoxIcon.png" alt="AddButton" /><img src="static/imgs/E2EModuleSideIcon.png" style={{marginLeft:'10px',width:'20px',height:'20px'}} alt="modules" /><span style={{textOverflow:'ellipsis'}} className='modNmeE2E'>{e.name}</span> <div  ></div></div>
                                                    
                                                    </div>
                                                    </>
                                            )
                                        })}
                </div>
             </div>
       </div>
    </div>
    <div className='scenarioListBox' style={{width:collapse? "10rem":"0.5rem", overflowX:'hidden',height:'57.7%',display: !collapseForModules || !isE2EOpen? 'none': '',}}>
                    <div style={{display:"flex", flexDirection:"column", width:"100%",overflowX:'hidden'}}>
                        <div style={{display:'flex',justifyContent:'space-between'}}>
                            <img style={{width:'1.7rem',height:'1.7rem',marginTop:'5px',  display:!isE2EOpen || !collapse? 'none':'',}}  src='static/imgs/node-scenarios.png' alt='/node-scenarios'/>
                    <div style={{paddingTop:'0.47rem',marginLeft: "4px",}}><h5 style={{fontSize:'17px',opacity:!isE2EOpen || !collapse? '0':''}}><b>Scenarios</b></h5></div>
                    <div style={{marginRight:'-0.4rem',marginTop:'0rem',cursor:'pointer'}} onClick={()=> {setIsE2EOpen(false);collapsed();  
                    }}><img src="static/imgs/X_button.png" alt="cross button" /></div></div>
                    {/* scenario Search */}
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
const Footer = (props) => (
    <div className='toolbar__module-warning-footer'>
        <button className='btn-yes' onClick={()=>props.loadModule(props.modID)}>Yes</button>
        <button onClick={()=>{props.setWarning(false)}}>No</button>
    </div>
)



export default ModuleListDrop;