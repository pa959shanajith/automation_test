import "../styles/ModuleListSidePanel.scss";
import 'primeicons/primeicons.css';
import { getModules } from "../api";
import  React, { useState, useEffect } from 'react';

const ModuleListSidePanel =()=>{
      const [showInput, setShowInput] = useState(false);
      const [moduleList, setModuleList] = useState(null);
      const [showInputE2E, setShowInputE2E] = useState(false);
      useEffect(()=>{
        (async()=>{
           const modules = await getModules(
            {
              "tab": "endToend",
              "projectid": "64354691b5a4c125655f1179",
              "version": 0,
              "cycId": null,
              "modName": "",
              "moduleid": null
            }
           )
          setModuleList(modules)
        })()
      }, [])
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
     

    return(
        <>
       <div className="Whole_container">
           <div className="project_name_section">
             <h5>Home/</h5>
             <select style={{width:'10rem', height:'19px'}}>
                 <option>
                 <h1>Avo_New_UIUX</h1>
                 </option>
             </select>
           </div>
           <div className="normalModule_main_container">
               <div className="moduleLayer_plusIcon">
                  <div className={`moduleLayer_icon ${showInput? 'moduleLayer_icon_SearchOn' 
                  : 'moduleLayer_icon_SearchOff'}` } >  
                     <img src="static/imgs/moduleIcon.png" alt="modules" /> <h3 className="normalModHeadLine">Module Layers</h3> 
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
                                <div className="EachModNameBox">
                                   <div key={module.id} className="moduleName" ><h4>{module.name}</h4></div>
                                   
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
                         <img src="static/imgs/E2EModuleSideIcon.png" alt="modules" /> <h3 className="E2EHeadLine">End To End Flow</h3> 
                      </div>
                      <div className="SearchIconForModulesE2E">
                       <span className={`pi pi-search ${showInputE2E? 'searchIcon_adjust' :''}` } style={{fontSize:'1.1rem',cursor:'pointer'}} onClick={clickForSearchE2E}></span>
                         {showInputE2E&&(
                        <div>
                            <input className="inputOfSearch" type="text"/>
                            <i className="pi pi-times"  onClick={click_X_ButtonE2E}></i>
                        </div>)}
                     </div >
                      <img  className={ showInputE2E? "PlusButE2E":" "} src="static/imgs/plusNew.png" alt="modules" /> 
                </div>
                <div className="NorModuleList">
                        {moduleList && moduleList.map((module)=>{
                              return(
                              <>
                                <div className="EachModNameBox">
                                   <div key={module.id} className="moduleName" ><h4>{module.name}</h4></div>
                                   
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