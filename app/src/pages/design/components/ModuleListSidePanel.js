import "../styles/ModuleListSidePanel.scss";
import 'primeicons/primeicons.css';
import { getModules,getProjectList } from "../api";
import  React, { useState, useEffect } from 'react';
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
import AvoInput from "../../../globalComponents/AvoInput";
import 'primeicons/primeicons.css';

import { selectedProj, selectedModule, isEnELoad } from '../designSlice';

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
      const dispatch = useDispatch();
      const proj = useSelector(state=>state.design.selectedProj);
      const moduleSelect = useSelector(state=>state.design.selectedModule);
      const [showInput, setShowInput] = useState(false);
      const [moduleList, setModuleList] = useState(null);
      const [showInputE2E, setShowInputE2E] = useState(false);
      const [projectList, setProjectList] = useState([]);
      const [projectId, setprojectId] = useState("");
      const [showE2EPopup, setShowE2EPopup] = useState(false);
      const [configTxt, setConfigTxt] = useState("");
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
          setModuleList(modules)
          // dispatch(selectedModule(modules))
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
      const loadModule = async(modID) =>{
        dispatch(selectedModule({}))
        dispatch(isEnELoad(false));
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
        if(res.error){console.log(res.error);return}
        dispatch(selectedModule(res))
    }

    // normal module selection
            const selectModule = async (id,name,type,checked, firstRender) => {
                var modID = id
                var type = name
                var name = type
                // below code about scenarios fetching
                if(Object.keys(moduleSelect).length===0 || firstRender){
                            loadModule(modID)
                            return;
                        }else{
                            console.log(modID)
                        }
        d3.selectAll('.ct-node').classed('node-selected',false)
        d3.select('#pasteImg').classed('active-map',false)
        d3.select('#copyImg').classed('active-map',false)
        d3.selectAll('.ct-node').classed('node-selected',false)
        if(Object.keys(moduleSelect).length===0){
            loadModule(modID)
    
        }else{
            console.log({modID, type: name})
        }
        return;
    }
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
                    'moduleLayer_icon_SearchOff'}` }  src="static/imgs/plusNew.png" alt="NewModules" /> 
                </div>
                <div className="NorModuleList">
                        {moduleList && moduleList.map((module)=>{
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