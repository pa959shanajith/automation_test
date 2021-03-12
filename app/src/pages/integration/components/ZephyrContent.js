import React,{Fragment, useState } from 'react';
import * as api from '../api.js';
import MappingPage from '../containers/MappingPage';
import CycleNode from './ZephyrTree';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../state/action';


const ZephyrContent = props => {
    const dispatch = useDispatch();
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const mappedPair = useSelector(state=>state.integration.mappedPair);
    const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);

    const [projectDetails , setProjectDetails]=useState({});
    const [avoProjects , setAvoProjects]= useState(null);
    const [scenarioArr , setScenarioArr] = useState(false);
    const [scenario_ID , setScenario_ID] = useState(null) ;
    const [projectDropdn1 , setProjectDropdn1]= useState(null);
    const [SearchIconClicked , setSearchIconClicked] =useState(false);
    const [filteredNames , setFilteredName]= useState(null);
    const [screenexit , setScreenExit]= useState(false);
    const [releaseArr, setReleaseArr] = useState([]);
    const [selectedRel, setSelectedRel] = useState("Select Release");
    

    const callProjectDetails_ICE=async(e)=>{
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const projectId = e.target.value;
        const releaseData = await api.zephyrProjectDetails_ICE(projectId, user_id);
        if (releaseData.error)
            dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: releaseData.error}});
        else {
            setReleaseArr(releaseData);
            setProjectDropdn1(projectId);
            clearSelections();
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }

    const onReleaseSelect = async(event) => {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const releaseId = event.target.value;
        const testAndScenarioData = await api.zephyrCyclePhase_ICE(releaseId, user_id);
        if (testAndScenarioData.error)
            dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: testAndScenarioData.error}});
        else {
            setProjectDetails(testAndScenarioData.project_dets);
            setAvoProjects(testAndScenarioData.avoassure_projects);  
            setSelectedRel(releaseId);  
            clearSelections();
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }

    const callScenarios =(e)=>{
        const scenarioID = e.target.value;
        setScenarioArr(true);
        setScenario_ID(scenarioID);
        setFilteredName(null);
        setSearchIconClicked(false);
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []})
    }

    const callSaveButton =async()=>{ 
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Saving...'});
        const response = await api.saveZephyrDetails_ICE(mappedPair);
        if (response.error){
            dispatch({type: actionTypes.SHOW_POPUP , payload: {title: "Error", content: response.error}});
        } 
        else if ( response === "success"){
            dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Zephyr", content: "Saved Successfully."}});
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    const callExit=()=>{
        setScreenExit(true);
        setScenarioArr(null);
        setProjectDropdn1("Select Project");
        setScenario_ID("Select Project");
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });
        dispatch({type: actionTypes.MAPPED_PAIR, payload: []})
        clearSelections();
    }
    
    const clearSelections = () => {
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []})
        dispatch({type: actionTypes.SEL_TC, payload: []})
    }
    
    const onSearch=(e)=>{
        var val = e.target.value;
        var filter = []
        var ScenarioName=[] 
        if(scenarioArr){
            avoProjects.map((e,i)=>(
                (i == (scenario_ID)) ? 
                    e.scenario_details ? 
                    e.scenario_details.map((e,i)=>(
                        ScenarioName.push(e.name)
                    )):null : null 
            ))
            }
        filter = [...ScenarioName].filter((e)=>e.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setFilteredName(filter)
    }

    return(
         !screenexit?
        <Fragment>
            <MappingPage 
                pageTitle="Zephyr Integration"
                onSave={()=>callSaveButton()}
                onViewMap={()=>props.callViewMappedFiles()}
                onExit={()=>callExit()}
                leftBoxTitle="Zephyr Tests"
                rightBoxTitle="Avo Assure Scenarios"
                selectTestProject={
                    <select value={projectDropdn1} onChange={(e)=>callProjectDetails_ICE(e)} className="qcSelectDomain" style={{marginRight : "5px"}}>
                        <option value="Select Project" selected disabled >Select Project</option>

                        {   props.domainDetails ? 
                            props.domainDetails.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            )) : null
                        }
                    </select>
                }
                selectTestRelease={
                    <select value={selectedRel} onChange={onReleaseSelect} className="qcSelectDomain" style={{marginRight : "5px"}}>
                        <option value="Select Release" disabled >Select Release</option>
                        {   releaseArr.length &&
                            releaseArr.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))
                        }
                    </select>
                }
                selectScenarioProject={
                    <select value={scenario_ID} onChange={(e)=>callScenarios(e)} className="qtestAvoAssureSelectProject">
                        <option value="Select Project"selected disabled >Select Project</option>
                        {
                            avoProjects? 
                            avoProjects.map((e,i)=>(
                                <option value={i} >{e.project_name}</option>))
                                : null 
                        }
                    </select>
                }
                searchScenario={scenarioArr ?
                    <>
                        {SearchIconClicked ?
                            <input onChange={(e)=>onSearch(e)} type="text" placeholder="Scenario Name"/> : null}
                        <span className="mapping__searchIcon" style={{display:"inline" , float:"right"}}> 
                            <img alt="searchIcon" 
                                onClick={()=>{setSearchIconClicked(!SearchIconClicked);setFilteredName(null)}} 
                                style={{cursor: "pointer" , display:"inline",float:"right"}} 
                                src="static/imgs/ic-searchIcon-black.png"
                            />
                        </span>
                    </> : null    
                }
                testList={ Object.keys(projectDetails).length ? 
                    <Fragment>    
                        <div className="test__rootDiv">
                            <img alt="collapse"
                                className="test_tree_toggle" 
                                src="static/imgs/ic-qcCollapse.png"
                            />
                            <label>Root</label>
                            { Object.keys(projectDetails)
                                .map( cycleName => <CycleNode 
                                        key={cycleName}
                                        phaseList={projectDetails[cycleName]} 
                                        cycleName={cycleName}
                                        projectId={projectDropdn1}
                                        releaseId={selectedRel}
                                />) }
                        </div>   
                    </Fragment>
                        : null
                }
                scenarioList={
                    scenarioArr ? 
                    avoProjects.map((e,i)=>(
                        (i == scenario_ID)? 
                        (e.scenario_details)? 
                        e.scenario_details.map((scenario,i)=>(
                                <div 
                                    key={i}
                                    className={"scenario__listItem" + (selectedScIds === scenario._id ? " scenario__selectedTC" : "")} 
                                    onClick={()=>{dispatch({type: actionTypes.SEL_SCN_IDS, payload: scenario._id})}}
                                >
                                { filteredNames? filteredNames.map((element)=>(element == scenario.name ?element  : null)):  scenario.name}
                                </div>
                        )):null : null
                        ))
                        : null 
                }
            />
    </Fragment>
    :null)
}
    
export default ZephyrContent;