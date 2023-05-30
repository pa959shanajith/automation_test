import "../styles/ModuleListSidePanel.scss";
import 'primeicons/primeicons.css';
import { getModules,getProjectList } from "../api";
import  React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from "primereact/checkbox";
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { Avatar } from 'primereact/avatar';

// this component shows side panel of module containers in design screen

const ModuleListSidePanel =()=>{
      const [showInput, setShowInput] = useState(false);
      const [moduleList, setModuleList] = useState(null);
      const [showInputE2E, setShowInputE2E] = useState(false);
      const [projectList, setProjectList] = useState([]);
      const [projectId, setprojectId] = useState("");
      const [showE2EPopup, setShowE2EPopup] = useState(false);
      // the below API call is hard coded and I should take required actions on it in future 
      useEffect(()=>{
        (async()=>{
           const modules = await getModules(
            {
              "tab": "endToend",
              "projectid": projectId,
              "version": 0,
              "cycId": null,
              "modName": "",
              "moduleid": null
            }
           )
          setModuleList(modules)
        })()
      }, [projectId])

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
            <Button label="No" icon="pi pi-times" onClick={() => setShowE2EPopup(false)} className="p-button-text" />
            <Button label="Yes" icon="pi pi-check" onClick={() => setShowE2EPopup(false)} autoFocus />
        </div>
    );

      return (
        <div className="card flex justify-content-center">
            {/* <Dialog header="Header" visible={showE2EPopup} style={{ width: '50vw' }} onHide={() => setShowE2EPopup(false)} footer={footerContent}>
            </Dialog> */}

             <Dialog className='Project-Dialog' header="Create End to End Flow" visible={showE2EPopup} style={{ width: "74.875rem" }} onHide={() => setShowE2EPopup(false)} footer={footerContent}>  
        <Card className='project-name-1'>
        <div className='pro-name1'>
        < h5 className='proj__name'>Name</h5>
            <InputText className="proj-input md:w-30rem text-400"  placeholder="Enter End to End module Name" />
            <div className='dropdown-1'>
                {/* <h5 className='application__name'>Application Type</h5> */}
            {/* <Dropdown  value={selectedApp} onChange={(e) => setSelectedApp(e.value)} options={apps} optionLabel="name" 
                placeholder="Select a appType" itemTemplate={optionTemplate} className="w-full md:w-26rem app-dropdown vertical-align-middle text-400 " /> */}
                </div>
        </div>
        
        </Card>
        <Card className='card11' style={{height:'17rem'}}>
            <div className="card-input1">
            <h5 className='select-users'>Select Scenarios</h5>
            <div className='selectallbtn'>
        <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText placeholder="Search Scenarios by name" className='usersearch md:w-24rem ' />    
</span>
</div>
</div>

<div className='user-select-checkbox '>
{/* <div className='check1'>
<Checkbox   ></Checkbox>
<h5 className='label1'> Select All</h5>
</div> */}
{/* <div className='dropdown_role'>
    <h5>Project level role(optional)</h5>
</div> */}
<div className="check2">

                    
<div  className="users-list">
                            <Checkbox  className=" checkbox1" name="item" />
                            <h5 className="label-2 ml-2 mr-2 mt-2 mb-2">
                              
                              <span className='user-avatar'> <Avatar className='user-av' shape="circle" style={{ backgroundColor: '#9c27b0', color: '#ffffff',width:'27px', height:'26px' }} ></Avatar></span>
            
                              <span className='user-name'></span>
                                <span className='user-role'></span>
                               
                                <span className='tooltip'></span>
                    
                                </h5>

                                {/* <MultiSelect    optionLabel="name"  display="chip" 
                                placeholder="Select a Role"  className="role-dropdown" /> */}
                            
              
                        </div>
                       
                       
                    
                     </div>
                     </div>
                

        </Card>

        <Button  className="gtbtn" label='>'>  </Button>
        <Button className="ltbtn" label='<' >   </Button>


        <Card className='card22' style={{height:'17rem'}}>
            <div className='card-input2'>
            <h5 className='selected-users'>Selected Scenarios</h5>
            <div className='selectallbtn'>
        <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText placeholder="Search Scenarios by name"  className='selecteduser md:w-24rem'    />
</span>
</div>

</div>
{/* <div className='checkbox-2'>
<Checkbox  ></Checkbox>
<h5 className='label1'> Select All</h5>
</div> */}
  
{/* <div className='check-bx3'>
    <ul>  

    <>
         <Checkbox  className="assigned-checkbox">{} </Checkbox>
         <h5  className="label-3 ml-2 mr-2 mt-2 ">
         <span className='asgnd-avatar'> <Avatar className='asgnd-av' shape="circle" style={{ backgroundColor: '#9c27b0', color: '#ffffff', width:'27px', height:'26px' }} ></Avatar></span>
                               <span className='asgnd-name'> </span>
                               <span className='asgnd-role'></span>
                               
                                </h5>
                                </>
       
        
        </ul>
     
    </div> */}


 </Card> 
</Dialog>
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
                      <img  className={ showInputE2E? "PlusButE2E":" "} src="static/imgs/plusNew.png"  onClick={()=>setShowE2EPopup(true)} alt="modules" /> 
                      {showE2EPopup&&<LongContentDemo/>}
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