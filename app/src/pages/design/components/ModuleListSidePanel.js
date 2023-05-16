import React,{ useState, useEffect } from "react"
import "../styles/ModuleListSidePanel.scss";


import { Tree } from 'primereact/tree';
import { NodeService } from './NodeService';

export  function BasicDemo() {
    const [nodes, setNodes] = useState([]);
    
    useEffect(() => {
        NodeService.getTreeNodes().then((data) => setNodes(data));
    }, []);

    return (
        <div className="card flex justify-content-center">
            <Tree value={nodes} style={{marginRight:'87rem',width:'13rem'}}/>
        </div>
    )
}
        
        


const ModuleListSidePanel =()=>{


    return(
        <>
       <div className="Whole_container">
           <div className="project_name_section">
            <select style={{width:'10rem'}}>
                <option>
                <h1>Avo_New_UIUX</h1>
                
                </option>
            </select>
           </div>
           <div className="normalModule_main_container">
               <div className="moduleLayer_plusIcon">
                  <div className="moduleLayer_icon">  
                     <img src="static/imgs/moduleLayerIcon.png" alt="modules" /> <h3>Module Layers</h3> 
                  </div>
                  <img src="static/imgs/plusNew.png" alt="modules" /> 
                </div>
                <div>
                    <BasicDemo />
                </div>
           </div>
           <div className="E2E_main_container">
               <div className="moduleLayer_plusIcon">
                      <div className="moduleLayer_icon">  
                         <img src="static/imgs/E2ESideIcon.png" alt="modules" /> <h3>End To End Flow</h3> 
                      </div>
                      <img src="static/imgs/plusNew.png" alt="modules" /> 
                    </div>
                    <div></div>
                </div>
       </div>
        
        
        
        </>


    )
}
export default ModuleListSidePanel;