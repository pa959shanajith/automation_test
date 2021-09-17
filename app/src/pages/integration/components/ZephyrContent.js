import React,{Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as api from '../api.js';
import MappingPage from '../containers/MappingPage';
import { Messages as MSG, setMsg, RedirectPage } from '../../global';
import CycleNode from './ZephyrTree';
import * as actionTypes from '../state/action';
import "../styles/TestList.scss"


const ZephyrContent = props => {
    const dispatch = useDispatch();
    const history = useHistory();
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const mappedPair = useSelector(state=>state.integration.mappedPair);
    const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);

    const [projectDetails , setProjectDetails]=useState({});
    const [avoProjects , setAvoProjects]= useState(null);
    const [scenarioArr , setScenarioArr] = useState(false);
    const [scenario_ID , setScenario_ID] = useState("Select Project") ;
    const [projectDropdn1 , setProjectDropdn1]= useState("Select Project");
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
            setMsg(releaseData.error);
        else if (releaseData === "unavailableLocalServer")
            setMsg(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
        else if (releaseData === "scheduleModeOn")
            setMsg(MSG.INTEGRATION.WARN_UNCHECK_SCHEDULE);
        else if (releaseData === "Invalid Session"){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            return RedirectPage(history);
        }
        else if (releaseData === "invalidcredentials")
            setMsg(MSG.INTEGRATION.ERR_INVALID_CRED);
        else if (releaseData) {
            setReleaseArr(releaseData);
            setProjectDropdn1(projectId);
            setSelectedRel("Select Release");
            clearSelections();
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }

    const onReleaseSelect = async(event) => {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const releaseId = event.target.value;
        const testAndScenarioData = await api.zephyrCyclePhase_ICE(releaseId, user_id);
        if (testAndScenarioData.error)
            setMsg(testAndScenarioData.error);
        else if (testAndScenarioData === "unavailableLocalServer")
            setMsg(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
        else if (testAndScenarioData === "scheduleModeOn")
            setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
        else if (testAndScenarioData === "Invalid Session"){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            return RedirectPage(history);
        }
        else if (testAndScenarioData) {
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
        clearSelections();
    }

    const callSaveButton =async()=>{ 
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Saving...'});
        const response = await api.saveZephyrDetails_ICE(mappedPair);
        if (response.error){
            setMsg(response.error);
        } 
        else if(response === "unavailableLocalServer")
            setMsg(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
        else if(response === "scheduleModeOn")
            setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
        else if ( response === "success"){
            setMsg(MSG.INTEGRATION.SUCC_SAVE);
            dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
            clearSelections();
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    const callExit=()=>{
        setScreenExit(true);
        setScenarioArr(null);
        setProjectDropdn1("Select Project");
        setScenario_ID("Select Project");
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });
    }
    
    const clearSelections = () => {
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
        dispatch({type: actionTypes.SYNCED_TC, payload: []});
        dispatch({type: actionTypes.SEL_TC, payload: []});
    }
    
    const onSearch=(e)=>{
        var val = e.target.value;
        var filter = [];
        if(scenarioArr){
            (avoProjects[parseInt(scenario_ID)].scenario_details.length ? 
            avoProjects[parseInt(scenario_ID)].scenario_details : [])
                .forEach((e,i)=>{
                    if (e.name.toUpperCase().indexOf(val.toUpperCase())!==-1) 
                        filter.push(e);
                    }
                )
            }
        setFilteredName(filter)
    }

    return(
         !screenexit?
        <Fragment>
            <MappingPage 
                pageTitle="Zephyr Integration"
                onSave={()=>callSaveButton()}
                onViewMap={()=>props.callViewMappedFiles()}
                onUpdateMap={()=>props.callUpdateMappedFiles()}
                onExit={()=>callExit()}
                leftBoxTitle="Zephyr Tests"
                rightBoxTitle="Avo Assure Scenarios"
                selectTestProject={
                    <select data-test="intg_Zephyr_project_drpdwn"value={projectDropdn1} onChange={(e)=>callProjectDetails_ICE(e)} className="qcSelectDomain" style={{marginRight : "5px"}}>
                        <option value="Select Project" disabled >Select Project</option>

                        {   props.domainDetails ? 
                            props.domainDetails.map(e => (
                                <option key={e.id} value={e.id} title={e.name}>{e.name}</option>
                            )) : null
                        }
                    </select>
                }
                selectTestRelease={
                    <select data-test="intg_zephyr_release_drpdwn" value={selectedRel} onChange={onReleaseSelect} className="qcSelectDomain" style={{marginRight : "5px"}}>
                        <option value="Select Release" disabled >Select Release</option>
                        {   releaseArr.length &&
                            releaseArr.map(e => (
                                <option key={e.id} value={e.id} title={e.name}>{e.name}</option>
                            ))
                        }
                    </select>
                }
                selectScenarioProject={
                    <select data-test="intg_zephyr_scenario_dwpdwn" value={scenario_ID} onChange={(e)=>callScenarios(e)} className="qtestAvoAssureSelectProject">
                        <option value="Select Project" disabled >Select Project</option>
                        {
                            avoProjects? 
                            avoProjects.map((e,i)=>(
                                <option value={i} key={i+'_proj'} title={e.project_name}>{e.project_name}</option>))
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
                        <div data-test="intg_zephyr_test_list" className="test__rootDiv">
                            <div className="test_tree_branches">
                                <img alt="collapse"
                                    className="test_tree_toggle" 
                                    src="static/imgs/ic-qcCollapse.png"
                                />
                                <label>Root</label>
                            </div>
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
                        : <div></div>
                }
                scenarioList={
                    scenarioArr ? 
                    (filteredNames ? filteredNames : 
                        avoProjects[parseInt(scenario_ID)].scenario_details.length ? 
                        avoProjects[parseInt(scenario_ID)].scenario_details : [])
                        .map((scenario, i)=>(
                                <div 
                                    key={i}
                                    className={"scenario__listItem" + (selectedScIds == scenario._id ? " scenario__selectedTC" : "")}
                                    title={scenario.name}
                                    onClick={()=>{dispatch({type: actionTypes.SEL_SCN_IDS, payload: scenario._id})}}
                                >
                                    {scenario.name}
                                </div>
                        ))
                        : <div></div>
                }
            />
    </Fragment>
    :null)
}
    
export default ZephyrContent;