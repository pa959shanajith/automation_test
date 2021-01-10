import React,{Fragment} from 'react';
import {ScrollBar} from '../../global';


const QTest =(props)=>{
    return(
    <Fragment>
        <div className="page-taskName" >
            <span className="taskname">
                qTest Integration
            </span>
        </div>
        <div className="sepr_Div">
            <button disabled={props.disableSave} onClick={()=>props.callSaveButton()} className="saveQcbtn" style={{marginLeft:"470px"}}>Save</button> 
            <button onClick={()=>props.callViewMappedFiles()} className="viewMapbtn">View Mapped Files</button> 
            <button onClick={()=>props.callExit()} className="saveQcbtn">Exit</button>
        </div><br/>
        <div className="qcActionBtn">
        <label>qTest Tests</label>
        <label id="scenarioLabel">Avo Assure Scenarios</label>
        </div>
        <div className="leftQcStructure">
            <div className="qcDomProContainer">
                <select value={props.projectDropdn1} ref={props.selProjectRef} onChange={(e)=>props.callProjectDetails_ICE(e)} className="qcSelectDomain" style={{marginRight : "5px"}}>
                    <option value="Select Project"selected disabled >Select Project</option>

                    {   props.domainDetails ? 
                        props.domainDetails.map((e,i)=>(
                            <option id={e.id} value={e.name}>{e.name}</option>
                        )) : null
                    }
                </select>
                <select value={props.releaseDropdn} className="qcSelectProject" onChange={(e)=>props.callFolderDetails_ICE(e)}>
                    <option value="Select Release" selected disabled >Select Release</option>
                    {props.projectDetails ? 
                        props.projectDetails.qc_projects.map((e,i)=>(
                            <option value={e}>{e}</option>))
                            : null
                    }
                </select>

            </div>
            
            <div className="qcTreeContainer">
            <ScrollBar>
                    { props.folderDetails ? 
                        <Fragment>    
                            <ul className="rootUl">
                                <li>
                                    <img style={{height:"16px"}} src="static/imgs/ic-qcCollapse.png"/>
                                    <label>Root</label>
                                </li>
                                <ul>
                                {props.folderDetails.map((e,i)=>(
                                    <li >
                                        <img  className="blueminusImage" id={i} onClick={()=>props.callCycleExpand({i})} style={{height:"16px" , cursor: "pointer"}} src={e.cycleOpen? "static/imgs/ic-qcCollapse.png" : "static/imgs/ic-qcExpand.png"}/>
                                        <label>{e.cycle}</label>
                                        {
                                            e.cycleOpen ?
                                            <Fragment> 
                                            <li  style={{paddingLeft:"40px"}}>
                                                <img  onClick={()=>props.callTestSuiteExpand({i})} style={{height:"16px",cursor: "pointer"}} src={e.TestsuiteOpen?"static/imgs/ic-taskType-blue-minus.png" :"static/imgs/ic-taskType-blue-plus.png"}/>
                                                {e.testsuites.map((e,i)=>(
                                                    <label>{e.name}</label>
                                                
                                                ))
                                                }
                                            {
                                                e.TestsuiteOpen ?
                                                <li id="testSuitediv">
                                                {e.testsuites.map((e,i)=>(
                                                    e.testruns.map((e,i)=>(
                                                        <Fragment>
                                                        <div style={{cursor: "pointer"}} onClick={(event)=>props.callTestSuiteSelection(event,e.id ,e.name)} id={e.id} className={props.selectedTestSuiteID == e.id? "slectedTestDiv": null} >
                                                            <label>{e.name}</label>
                                                            { props.selectedTestSuiteID == e.id ? <>
                                                            {props.syncSuccess ?<img onClick={()=>props.callUnSync()} style={{cursor: "pointer",paddingRight:"10px"}} src="static/imgs/ic-qcUndoSyncronise.png"/>:null}
                                                            {!props.syncSuccess ?<img onClick={()=>props.callSyncronise()} style={{cursor: "pointer",paddingRight:"10px"}} src="static/imgs/ic-qcSyncronise.png"/>:null}
                                                            </>
                                                            : null}
                                                        </div>
                                                        </Fragment>
                                                    ))
                                                
                                                ))}
                                                </li> 
                                                    : null

                                            }
                                            </li> </Fragment>: null
                                        }
                                    </li>
                                ))}                                  
                            </ul>
                            </ul>
                            
                        </Fragment>
                            : null}
                  </ScrollBar>  
            </div>
            
        </div> 
        <div className="rightQcStructure">
            <div className="qcProContainer">
                <select value={props.projectDropdn2} onChange={(e)=>props.callScenarios(e)} className="qtestAvoAssureSelectProject">
                    <option value="Select Project"selected disabled >Select Project</option>
                {
                    props.projectDetails ? 
                    props.projectDetails.avoassure_projects.map((e,i)=>(
                        <option id={i} value={e.project_name} >{e.project_name}</option>))
                        : null 
                }
                </select>
                {props.scenarioArr ?
                <>
                    {props.SearchIconClicked ?
                        <input onChange={(e)=>props.onSearch(e)} type="text" placeholder="Scenario Name"/> : null}
                    <span className="searchScenarioAvoAssure" style={{display:"inline" , float:"right"}}> 
                        <img onClick={()=>{props.setSearchIconClicked(!props.SearchIconClicked);props.setFilteredName(null)}} style={{cursor: "pointer" , display:"inline",float:"right"}} src="static/imgs/ic-searchIcon-black.png"></img>
                    </span>
                </> : null    
                }
            </div>
            
            <div  className="qcAvoAssureTreeContainer">
            <ScrollBar>
                {
                    props.scenarioArr ? 
                    props.projectDetails.avoassure_projects.map((e,i)=>(
                        (i == props.scenario_ID)? 
                        (e.scenario_details)? 
                        e.scenario_details.map((e,i)=>(
                            
                            <div style={{cursor: "pointer"}}>
                                <li 
                                    className={props.selectedScenario_ID == e._id ? "slectedTestDiv" : null} 
                                    onClick={()=>{props.setSelectedScenario_ID(e._id);props.setSelectedScenarioName(e.name)}}
                                >
                                { props.filteredNames? props.filteredNames.map((element)=>(element == e.name ?element  : null)):  e.name}
                                </li>
                            </div>
                        )):null : null
                        ))
                        : null 
                }
            </ScrollBar>
            </div>
            
        </div>
    </Fragment>)
}
export default QTest;        