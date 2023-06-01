import "../styles/ModuleListSidePanel.scss";
import 'primeicons/primeicons.css';
import { getModules,getProjectList,populateScenarios } from "../api";
import  React, { useState, useEffect, useRef } from 'react';
import * as d3 from  'd3';
import { useSelector, useDispatch} from 'react-redux';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from "primereact/checkbox";
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { Avatar } from 'primereact/avatar';
import { selectedProj, selectedModule, isEnELoad, initEnEProj,savedList } from '../designSlice';
import AvoInput from "../../../globalComponents/AvoInput";




// this component shows side panel of module containers in design screen

import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';

export  function MultiSelectTreeView() {
    // const icons =()=>{
    //     return(
    //         // <img src={moduleIcon}/>
    //         <img src={moduleIcon} alt="Custom Icon" style={{ marginRight: 8, width: 16, height: 16 }} />
    //     )
    // }
  return (
    <TreeView
      aria-label="multi-select"
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      multiSelect
      sx={{ height: 216, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
    >
      <TreeItem nodeId="5" label="projectAvoAssure">
        <TreeItem nodeId="6" label="moduleLogIn">
            <TreeItem nodeId="8" label="AVATARLog" />
            <TreeItem nodeId="9" label="Password" />
        </TreeItem>
      </TreeItem>
    </TreeView>
  );
}

const ModuleListSidePanel =()=>{
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
    // const isAssign = props.isAssign
    const [options,setOptions] = useState(undefined)
    const [showInput, setShowInput] = useState(false);
    const [moduleLists, setModuleLists] = useState(null);
    const [showInputE2E, setShowInputE2E] = useState(false);
    const [projectList, setProjectList] = useState([]);
    const [projectId, setprojectId] = useState("");
    const [showE2EPopup, setShowE2EPopup] = useState(false);
    const [configTxt, setConfigTxt] = useState("");
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
    // useEffect(()=>{
    //     if(moduleSelectlist.length===moduleList.filter(module=> module.type=='basic').length && moduleSelectlist.length>0  ){
    //       setAllModSelected(true);
    //     }
    //     else{
    //       setAllModSelected(false);
    //     }
    //   },[moduleSelectlist, moduleList])
    const displayError = (error) =>{
        setLoading(false)
        // setMsg(error)
    }
    // const collapsed =()=> setCollapse(!collapse)
    // const collapsedForModules =()=> setCollapseForModules (!collapseForModules )
    const CreateNew = () =>{
        setIsE2EOpen(false);
        setCollapse(false);
        dispatch(selectedModule({createnew:true}))
        dispatch(initEnEProj({proj, isE2ECreate: false}));
        dispatch(isEnELoad(false));
        setFirstRender(false);
    }
    // const clickCreateNew = () =>{
    //     dispatch(selectedModule({createnew:true}))
    //     dispatch(initEnEProj({proj, isE2ECreate: false}));
    //     dispatch(isEnELoad(false));
    //     setFirstRender(false);
    // }
    // const searchModule = (val) =>{
    //     if(SearchInp && SearchInp.current) {
    //         if (val === "") setSearchForNormal(false)
    //         else setSearchForNormal(true);
    //         SearchInp.current.value = val;
    //         setSearchInpText(val);
    //     }
        
    // }
    // const searchScenario = (val) =>{
    //     setFilterSc(val)
    // }
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
        // SearchScInp.current.value = ""
                setSelctedSc([])
                    if (isE2EOpen){
                        setBlockui({content:'loading scenarios',show:true})
                        //loading screen
                        var res = await populateScenarios(modID)
                        if(res.error){displayError(res.error);return}
                        // props.setModName(name)
                        setIsModuleSelectedForE2E(id);
                        setScenarioList(res)
                        setInitScList(res)
                        setBlockui({show:false})
                        setShowNote(true)
                        return;}
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
            // if(moduleSelectlist.length>0){
            //     selectedModList=moduleSelectlist;              
            // }
            if(selectedModList.indexOf(modID)===-1){
                selectedModList.push(modID);
            }else{
                selectedModList = selectedModList.filter(item => item !== modID)
            }              
            // dispatch({type:actionTypes.SELECT_MODULELIST,payload:[...selectedModList]})         
            return;
        }
    }
      // the below API call is hard coded and I should take required actions on it in future 
      useEffect(()=>{
        (async()=>{
          dispatch(selectedProj(projectId?projectId:proj))
           const modules = await getModules(
            {
              "tab": "endToend",
              "projectid": projectId?projectId:proj,
              "version": 0,
              "cycId": null,
              "modName": "",
              "moduleid": null
            }
           )
          setModuleLists(modules)
          // dispatch(selectedModule(modules[0]))
        })()
      }, [dispatch, projectId])

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

      const clickForSearch = ()=>{
               setShowInput(true) }
      const click_X_Button = ()=>{
        setShowInput(false)}


      const clickForSearchE2E = ()=>{
               setShowInputE2E(true)
      }
      const click_X_ButtonE2E = ()=>{
        setShowInputE2E(false)
      }

    function LongContentDemo() {
    
      // const [visible, setVisible] = useState(showE2EPopup);
    const footerContent = (
        <div>
            <Button label="Cancel"  onClick={() => setShowE2EPopup(false)} className="p-button-text" />
            <Button label="Save"  onClick={() => setShowE2EPopup(false)} autoFocus />
        </div>
    );

      return (
      <div className="E2E_container">
        <div className="card flex justify-content-center">
            {/* <Dialog header="Header" visible={showE2EPopup} style={{ width: '50vw' }} onHide={() => setShowE2EPopup(false)} footer={footerContent}>
            </Dialog> */}

             
             <Dialog className='Project-Dialog' header="Create End to End Flow" visible={showE2EPopup} style={{ width: "74.875rem",height:'100%',backgroundColor:'#605BFF' }} onHide={() => setShowE2EPopup(false)} footer={footerContent}>  
                 <div className="mainCentralContainer">
                  <div className="nameTopSection">
                  <div class="col-12 lg:col-12 xl:col-5 md:col-12 sm:col-12 flex flex-column">
                    <AvoInput
                    htmlFor="username"
                    labelTxt="Name"
                    infoIcon="static/imgs/Info_icon.svg"
                    required={true}
                    placeholder="Enter End to End Module Name"
                    // inputTxt={configTxt}
                    customClass="inputRow_for_E2E_popUp"
                    // setInputTxt={setConfigTxt}
                    inputType="lablelRowReqInfo"/>
                  </div>
                  </div>
                  <div className="cenralTwinBox">
                    <div className="leftBox">
                    <Card className="leftCard"  >
                      <div className='headlineSearchInput'>
                        <div className='headlineRequired'>
                           <h5 style={{fontSize:'14px'}}>Select Scenarios</h5>
                           <img src="static/imgs/Required.svg" className="required_icon" />
                         </div>
                         <span className="p-input-icon-left">
                         <i className="pi pi-search" />
                         <InputText placeholder="Search Scenarios by name" style={{width:'32rem',height:'2.2rem'}} className='inputContainer'    />    
                        </span>
                     </div>
                     <MultiSelectTreeView/>
                         {/* <p className="m-0">
                         </p> */}

                    </Card>
                    </div>
                    <div className="centerButtons">
                      <div className="centerButtonsIndiVisual">
                        <Button   label='>'outlined />
                        <Button  label='<' outlined />
                      </div>
                    </div>
                    <div className="rightBox">
                    <Card className="rightCard" >
                         <div className="initialText">
                          <div className="initial1StText">
                              <h3 className="textClass"> No Scenarios Yet</h3>
                          </div>
                          <div className="initial2NdText">
                          <h3 className="textClass">Select Project</h3>  <img src="static/imgs/rightArrow.png" className="ArrowImg" alt="moduleLayerIcon" /> 
                          <h3 className="textClass">Select Module</h3>  <img src="static/imgs/rightArrow.png" className="ArrowImg" alt="moduleLayerIcon" /> 
                          <h3 >Select Scenarios</h3>
                          </div> 
                         </div>
                    </Card>
                    </div>
                  </div>
                 </div>
            </Dialog>
        </div>
        </div>
         )
      }
      
    return(
        <>
       <div className="Whole_container">
           <div className="project_name_section">
             <h5>Home/</h5>
             {/* <select data-test="projectSelect" value={initProj} onChange={(e)=>{selectProj(e.target.value)}}>
                {projectList.map((e,i)=><option value={e[1].id} key={i}>{e[1].name}</option>)}
            </select> */}
             <select onChange={(e)=>{setprojectId(e.target.value)}} style={{width:'10rem', height:'19px'}}>
             {projectList.map((project, index) => (
                      
                               <option value={project.id} key={index}>{project.name}</option>
                              
                    
                       ))}
                 
             </select>
           </div>
           <div className="normalModule_main_container">
               <div className="moduleLayer_plusIcon">
                  <div className={`moduleLayer_icon ${showInput? 'moduleLayer_icon_SearchOn' 
                  : 'moduleLayer_icon_SearchOff'}` } >  
                     <img src="static/imgs/moduleLayerIcon.png" alt="moduleLayerIcon" /> <h3 className="normalModHeadLine">Module Layers</h3> 
                  </div>
                  <div className="SearchIconForModules">
                    <span className={`pi pi-search ${showInput? 'searchIcon_adjust' :''}` } style={{fontSize:'1.1rem',cursor:'pointer'}} onClick={clickForSearch}></span>
                    {showInput&&(
                    <div>
                        <input className="inputOfSearch" type="text"/>
                        <i className="pi pi-times"  onClick={click_X_Button}></i>
                    </div>)}
                  </div>
                  <img className={` ${showInput? 'moduleLayer_icon_SearchOn' :
                    'moduleLayer_icon_SearchOff'}` }  src="static/imgs/plusNew.png" alt="NewModules" onClick={()=>{ CreateNew()}} /> 
                </div>
                <div className="NorModuleList">
                        {moduleLists && moduleLists.map((module, idx)=>{
                              return(
                              <>
                                <div className="EachModNameBox" title={module.name}>
                                   <div key={module.id} className="moduleName"  onClick={(e)=>selectModule(e.target.getAttribute("value"), e.target.getAttribute("name"), e.target.getAttribute("type"), e.target.checked)}><img src="static/imgs/moduleIcon.png" alt="modules" /><h4>{module.name}</h4></div>
                                   
                                </div>
                              </>
                              )
                        })}
                </div>
           </div>
           <div className="E2E_main_container">
               <div className="moduleLayer_plusIcon">
                      <div className={`moduleLayer_icon ${showInputE2E? 'moduleLayer_icon_SearchOn' 
                                : 'moduleLayer_icon_SearchOff'}` }>  
                         <img src="static/imgs/E2ESideIcon.png" alt="modules" /> <h3 className="E2EHeadLine">End To End Flow</h3> 
                      </div>
                      <div className="SearchIconForModulesE2E">
                       <span className={`pi pi-search ${showInputE2E? 'searchIcon_adjust' :''}` } style={{fontSize:'1.1rem',cursor:'pointer'}} onClick={clickForSearchE2E}></span>
                         {showInputE2E&&(
                        <div>
                            <input className="inputOfSearch" type="text"/>
                            <i className="pi pi-times"  onClick={click_X_ButtonE2E}></i>
                        </div>)}
                     </div >
                      <img  className={ showInputE2E? "PlusButE2E":" "} src="static/imgs/plusNew.png"  onClick={()=>setShowE2EPopup(true)} alt="modules" /> 
                      {showE2EPopup&&<LongContentDemo/>}
                </div>
                <div className="NorModuleList">
                        {moduleList && moduleList.map((module)=>{
                              return(
                              <>
                                <div className="EachModNameBox">
                                   <div key={module.id} className="moduleName" ><img src="static/imgs/E2EModuleSideIcon.png" alt="modules" /><h4 title={module.name}>{module.name}</h4></div>
                                   
                                </div>
                              </>
                              )
                        })}
                </div>
             </div>
       </div>
        </>

    )
}
export default ModuleListSidePanel;