import React,{Fragment} from 'react';
import MappingPage from '../containers/MappingPage';
import "../styles/TestList.scss"

const QTestContent = props => {
    return (
        <MappingPage 
            pageTitle="qTest Integration"
            onSave={()=>props.callSaveButton()}
            onViewMap={()=>props.callViewMappedFiles()}
            onExit={()=>props.callExit()}
            leftBoxTitle="qTest Tests"            
            rightBoxTitle="Avo Assure Scenarios"
            selectTestDomain = {
                <select value={props.projectDropdn1} ref={props.selProjectRef} onChange={(e)=>props.callProjectDetails_ICE(e)} style={{marginRight : "5px"}}>
                    <option value="Select Project"selected disabled >Select Project</option>
                    { props.domainDetails.length &&
                        props.domainDetails.map((e,i)=>(
                            <option id={e.id} key={i} value={e.id}>{e.name}</option>
                        ))}
                </select>
            }
            selectTestRelease = {
                <select value={props.releaseDropdn} onChange={(e)=>props.callFolderDetails_ICE(e)}>
                    <option value="Select Release" selected disabled >Select Release</option>
                    { props.projectDetails &&
                        props.projectDetails.qc_projects.map((e,i)=>(
                            <option id={e.id} key={i} value={e.name}>{e.name}</option>
                        ))}
                </select>
            }
            selectScenarioProject = {
                <select value={props.projectDropdn2} onChange={(e)=>props.callScenarios(e)} >
                    <option value="Select Project"selected disabled >Select Project</option>
                    { props.projectDetails &&
                        props.projectDetails.avoassure_projects.map((e,i)=>(
                            <option id={i} value={e.project_name} >{e.project_name}</option>
                        ))}
                </select>
            }
            searchScenario = {
                props.scenarioArr ?
                <> { props.SearchIconClicked ?
                        <input onChange={(e)=>props.onSearch(e)} type="text" placeholder="Scenario Name"/> : null}
                    <span className="mapping__searchIcon" style={{display:"inline" , float:"right"}}> 
                        <img onClick={()=>{props.setSearchIconClicked(!props.SearchIconClicked);props.setFilteredName(null)}} style={{cursor: "pointer" , display:"inline",float:"right"}} src="static/imgs/ic-searchIcon-black.png"></img>
                    </span>
                </> : null }
            testList = { props.folderDetails ? 
                <>    
                <div className="test__rootDiv">
                    <img className="test_tree_toggle" src="static/imgs/ic-qcCollapse.png"/>
                    <label>Root</label>
                <div className="test_tree_branches">
                    {props.folderDetails.map((e,i)=>(
                        <div>
                            <img className="test_tree_toggle" id={i} onClick={()=>props.callCycleExpand({i})} style={{height:"16px" , cursor: "pointer"}} src={e.cycleOpen? "static/imgs/ic-qcCollapse.png" : "static/imgs/ic-qcExpand.png"}/>
                            <label>{e.cycle}</label>
                            { e.cycleOpen ?
                                <Fragment> 
                                <div className="test_tree_branches">
                                    <img className="test_tree_toggle" onClick={()=>props.callTestSuiteExpand({i})} style={{height:"16px",cursor: "pointer"}} src={e.TestsuiteOpen?"static/imgs/ic-taskType-blue-minus.png" :"static/imgs/ic-taskType-blue-plus.png"}/>
                                    {e.testsuites &&
                                        e.testsuites.map((e,i)=>(
                                        <label>{e.name}</label>
                                    
                                    ))
                                    }
                                {
                                    e.TestsuiteOpen ?
                                    <div className="test_tree_branches">
                                    {e.testsuites &&
                                    e.testsuites.map((e,i)=>(
                                        e.testruns.map((e,i)=>(
                                            <Fragment key={i}>
                                            <div className={"test_tree_leaves "+(props.selectedTestSuiteID == e.id? "slectedTestDiv": "")} style={{cursor: "pointer"}} onClick={(event)=>props.callTestSuiteSelection(event,e.id ,e.name)} id={e.id} >
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
                                    </div> 
                                        : null

                                }
                                </div> </Fragment>: null
                            }
                        </div>
                    ))}                                  
                </div>
                </div>
                </>
                    : null}
            scenarioList = {
                props.scenarioArr ? 
                props.projectDetails.avoassure_projects.map((e,i)=>(
                    (i == props.scenario_ID)? 
                    (e.scenario_details)? 
                    e.scenario_details.map((e,i)=>(
                            <div 
                                key={i}
                                className={"test_tree_leaves " +(props.selectedScenario_ID == e._id ? "slectedTestDiv" : "")} 
                                onClick={()=>{props.setSelectedScenario_ID(e._id);props.setSelectedScenarioName(e.name)}}
                                style={{cursor: "pointer"}}
                            >
                            { props.filteredNames? props.filteredNames.map((element)=>(element == e.name ?element  : null)):  e.name}
                            </div>
                    )):null : null ))
                    : null 
            }
        />
    );
}
export default QTestContent;        