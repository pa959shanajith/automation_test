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
                <select data-test="intg_qTest_project_dropdwn" value={props.projectDropdn1} ref={props.selProjectRef} onChange={(event)=>props.callProjectDetails_ICE(event)} style={{marginRight : "5px"}}>
                    <option value="Select Project"selected disabled >Select Project</option>
                    { props.domainDetails.length &&
                        props.domainDetails.map((e,i)=>(
                            <option id={e.name} key={i} value={e.id}>{e.name}</option>
                        ))}
                </select>
            }
            selectTestRelease = {
                <select data-test="intg_qTest_release_drpdwn"value={props.releaseDropdn} onChange={(e)=>props.callFolderDetails_ICE(e)}>
                    <option value="Select Release" selected disabled >Select Release</option>
                    { props.projectDetails &&
                        props.projectDetails.qc_projects.map((e,i)=>(
                            <option id={e.id} key={i} value={e.name}>{e.name}</option>
                        ))}
                </select>
            }
            selectScenarioProject = {
                <select data-test="intg_qTest_Project_scenarios_drpdwn" value={props.projectDropdn2} onChange={(e)=>props.callScenarios(e)} >
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
                        <img alt="searchIcon"
                            onClick={()=>{props.setSearchIconClicked(!props.SearchIconClicked);props.setFilteredName(null)}} 
                            style={{cursor: "pointer" , display:"inline",float:"right"}} 
                            src="static/imgs/ic-searchIcon-black.png"
                        />
                    </span>
                </> : null }
            testList = { props.folderDetails ? 
                <>    
                <div data-test="intg_qTest_test_list"className="test__rootDiv">
                    <div className="test_tree_branches">
                    <img alt="rotIcon" 
                        className="test_tree_toggle" 
                        src="static/imgs/ic-qcCollapse.png"
                    />
                    <label>Root</label>
                    </div>
                <div className="int__folderNode">
                    {props.folderDetails.map((e,i)=>(
                        <Fragment key={i}>
                        <div className="test_tree_branches" style={{paddingLeft: 17}}>
                            <img alt="expand-collapse" 
                                className="test_tree_toggle" id={i} onClick={()=>props.callCycleExpand({i})} 
                                style={{height:"16px" , cursor: "pointer"}} 
                                src={e.cycleOpen? "static/imgs/ic-qcCollapse.png" : "static/imgs/ic-qcExpand.png"}
                            />
                            <label>{e.cycle}</label>
                        </div>
                        <div className="int__folderNode">
                            { e.cycleOpen ?
                                <Fragment> 
                                <div>
                                    {e.testsuites &&
                                        e.testsuites.map((testSuite,index)=>(
                                        <Fragment key={index}>
                                        <div className="test_tree_branches" style={{paddingLeft: 17}}>
                                            <img alt="blueMinus-Plus" 
                                            className="test_tree_toggle" onClick={()=>props.callTestSuiteExpand(testSuite.id)} 
                                            style={{height:"16px",cursor: "pointer"}} 
                                            src={testSuite.TestsuiteOpen?"static/imgs/ic-taskType-blue-minus.png" :"static/imgs/ic-taskType-blue-plus.png"}
                                            />
                                            <label>{testSuite.name}</label>
                                        </div>
                                        <div className="int__folderNode">
                                            {
                                            testSuite.TestsuiteOpen ?
                                            <div>
                                            {
                                                testSuite.testruns.map((e,i)=>(
                                                    <Fragment key={i}>
                                                    <div 
                                                        className={"test_tree_leaves "+(props.selectedTestSuiteID === e.id? "slectedTestDiv": "")} 
                                                        style={{cursor: "pointer"}} 
                                                        onClick={(event)=>props.callTestSuiteSelection(event,e.id ,e.name)} id={e.id} 
                                                    >
                                                        <label>{e.name}</label>
                                                        { props.selectedTestSuiteID === e.id ? <>
                                                        {props.syncSuccess ?
                                                            <img alt="unsynIcon"
                                                                onClick={()=>props.callUnSync()} 
                                                                style={{cursor: "pointer",paddingRight:"10px"}} 
                                                                src="static/imgs/ic-qcUndoSyncronise.png"
                                                            />:null}
                                                        {!props.syncSuccess ?
                                                            <img alt="syncIcon"
                                                                onClick={()=>props.callSyncronise()} 
                                                                style={{cursor: "pointer",paddingRight:"10px"}} 
                                                                src="static/imgs/ic-qcSyncronise.png"
                                                            />:null}
                                                        </>
                                                        : null}
                                                    </div>
                                                    </Fragment>
                                                ))}
                                            </div> 
                                                : null

                                        }
                                        </div>
                                        </Fragment>
                                    ))
                                    }
                                </div> 
                                </Fragment>: null
                            }
                        </div>
                        </Fragment>
                    ))}                                  
                </div>
                </div>
                </>
                    : null}
            scenarioList = {
                props.scenarioArr ? 
                (props.filteredNames ? props.filteredNames : props.projectDetails.avoassure_projects[parseInt(props.scenario_ID)].scenario_details)
                    .map((e,i)=>(
                                <div 
                                    key={i}
                                    className={"scenario__listItem " +(props.selectedScenario_ID == e._id ? "slectedTestDiv" : "")} 
                                    onClick={()=>{props.setSelectedScenario_ID(e._id)}}
                                    style={{cursor: "pointer"}}
                                >
                                { e.name }
                                </div>
                        ))
                    : null 
            }
        />
    );
}
export default QTestContent;        