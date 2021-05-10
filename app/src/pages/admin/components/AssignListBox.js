import React ,  { Fragment} from 'react';

import '../styles/ReleaseCycle.scss';

/*Component AssignListBox
  use: renders Assign List Bottom Box
  todo: 
*/
    
const AssignListBox = (props) => {
    
    return (
        <div className="col-xs-9 form-group" style={{width: "100%"}}>
            <div className="project-left2">
                {/* <!--Left Select Box--> */}
                <div className="wrap left-select scrollbar-inner">
                    {/* <!--Labels--> */}
                    <label className="labelStyle1">All Projects</label>
                    {((selectedProject ==="" && selectedUserName!=="") || showload)?
                    <img className="load" style={{position: "relative", left: "10px", bottom: "4px"}} src={"static/imgs/loader.gif"} alt="Loading..."/>
                    :null}
                    {/* <!--Labels--> */}
                    <div className="seprator" style={{marginBottom:"0px"}}>
                        <select multiple id="allProjectAP" className="ng-pristine ng-untouched ng-valid">
                            {assignProj.allProjectAP.map((prj) => ( 
                                <option  value={JSON.stringify(prj)} >{prj.projectname} </option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* <!--Left Select Box--> */}

                {/* <!--Center Input--> */}
                <div className="wrap wrap-editpro center-button">
                    <button id="rightall" type="button" onClick={()=>{moveItemsRightall('#allProjectAP', '#assignedProjectAP')}} title="Move all to right"> &gt;&gt; </button>
                    <button type="button" id="rightgo"  onClick={()=>{moveItemsRightgo('#allProjectAP', '#assignedProjectAP')}} title="Move to right"> &gt; </button>
                    <button type="button" id="leftgo" onClick={()=>{moveItemsLeftgo('#assignedProjectAP','#allProjectAP')}} title="Move to left"> &lt; </button>
                    <button id="leftall" type="button" onClick={()=>{moveItemsLeftall('#assignedProjectAP','#allProjectAP')}} title="Move all to left"> &lt;&lt; </button>
                </div>
                {/* <!--Center Input--> */}

                {/* <!--Right Select Box--> */}
                <div className="wrap right-select">
                    {/* <!--Labels--> */}
                    <label className="labelStyle1">Assigned Projects</label>
                    {((selectedProject ==="" && selectedUserName!=="") || showload)?
                    <img className="load" style={{position: "relative", left: "10px", bottom: "4px"}} src={"static/imgs/loader.gif"} alt="Loading..."/>
                    :null}
                    {/* <!--Labels--> */}

                    <div className="seprator" style={{marginBottom:"0px"}}>
                        <select multiple id="assignedProjectAP"  size="" className="ng-pristine ng-untouched ng-valid">
                            {assignProj.assignedProjectAP.map((prj) => ( 
                                <option  value={JSON.stringify(prj)}  >{prj.projectname} </option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* <!--Right Select Box--> */}
            </div>
        </div>
    )
}  


export default AssignListBox;