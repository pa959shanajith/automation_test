import React,{Fragment, useState} from 'react';
import { useHistory } from 'react-router-dom';
import { RedirectPage, Messages as MSG } from '../../global';
import { useSelector, useDispatch } from 'react-redux';
import MappingPage from '../containers/MappingPage';
import CycleNode from './QTestTree';
import { qtestProjectDetails_ICE, qtestFolderDetails_ICE, saveQtestDetails_ICE } from '../api.js';
import * as actionTypes from '../state/action.js';
import "../styles/TestList.scss"

const QTestContent = props => {

    const dispatch = useDispatch();
    const history = useHistory();
    const user_id = useSelector(state=> state.login.userinfo.user_id);
    const mappedPair = useSelector(state=>state.integration.mappedPair);
    const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);
    const [projectDetails , setProjectDetails] = useState(null);
    const [folderDetails , setFolderDetails ] = useState([]);
    const [scenarioArr , setScenarioArr] = useState(false);
    const [selectedAvoProj, setSelectedAvoProj] = useState([]);
    const [testProject, setTestProject]= useState("Select Project");
    const [avoProject, setAvoProject]= useState("Select Project");
    const [release, setRelease]=useState("Select Release");
    const [SearchIconClicked , setSearchIconClicked] =useState(false);
    const [filteredNames , setFilteredName]= useState(null);

    const onProjectChange = async(e) => {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
       
        const [projectId, projectName] = e.target.value.split('||');
    
        const projectDetails = await qtestProjectDetails_ICE(projectId, user_id);

        if (projectDetails.error)
            dispatch({type: actionTypes.SHOW_POPUP, payload: projectDetails.error});
        else if(projectDetails === "unavailableLocalServer")
            dispatch({type: actionTypes.SHOW_POPUP, payload: MSG.INTEGRATION.ERR_UNAVAILABLE_ICE});
        else if(projectDetails === "scheduleModeOn")
            dispatch({type: actionTypes.SHOW_POPUP, payload: MSG.GENERIC.WARN_UNCHECK_SCHEDULE});
        else if(projectDetails === "Invalid Session"){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            return RedirectPage(history);
        }
        else if (projectDetails){
            setProjectDetails(projectDetails)
            setFolderDetails([]);
            setRelease("Select Release")
            setTestProject(`${projectId}||${projectName}`);
            clearSelections();
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }

    const onReleaseChange = async(e) => { 
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading TestCases...'});
       
        const [releaseId, releaseName] = e.target.value.split('||');
        const projectId = testProject.split('||')[0];
        
        const folderDetails = await qtestFolderDetails_ICE(releaseId, "root", projectId, "folder");
        if (folderDetails.error){
            dispatch({type: actionTypes.SHOW_POPUP, payload: folderDetails.error});
        } else if (folderDetails) {            
            setFolderDetails(folderDetails);
            clearSelections();
            setRelease(`${releaseId}||${releaseName}`);
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }

    const onScenarioChange = e => {
        const scenarioIndex = e.target.value;
        setScenarioArr(true);
        setSelectedAvoProj(projectDetails.avoassure_projects[parseInt(scenarioIndex)].scenario_details);
        setFilteredName(null);
        setAvoProject(scenarioIndex)
        setSearchIconClicked(false);
        clearSelections();
    }

    const onSave = async() => { 
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Saving...'});
        const response = await saveQtestDetails_ICE(mappedPair);
        if (response.error)
            dispatch({type: actionTypes.SHOW_POPUP, payload: response.error});
        else if(response === "unavailableLocalServer")
            dispatch({type: actionTypes.SHOW_POPUP, payload: MSG.INTEGRATION.ERR_UNAVAILABLE_ICE});
        else if(response === "scheduleModeOn")
            dispatch({type: actionTypes.SHOW_POPUP, payload: MSG.GENERIC.WARN_UNCHECK_SCHEDULE});
        else if(response === "fail")
            dispatch({type: actionTypes.SHOW_POPUP, payload: MSG.INTEGRATION.ERR_SAVE});
        else if(response === "success"){
            dispatch({type: actionTypes.SHOW_POPUP, payload: MSG.INTEGRATION.SUCC_SAVE});
            dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
            clearSelections();
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
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
            (selectedAvoProj.length ? 
            selectedAvoProj : [])
                .forEach((e,i)=>{
                    if (e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
                        filter.push(e);
                })
            }
        setFilteredName(filter)
    }

    
    const onExit = () => {
        setFolderDetails([]);
        setScenarioArr(null);
        setRelease("Select Release");
        setTestProject("Select Project");
        setAvoProject("Select Project");
        setSelectedAvoProj([]);
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });
    }

    return (
        <MappingPage 
            pageTitle="qTest Integration"
            onSave={onSave}
            onViewMap={props.onViewMappedFiles}
            onExit={onExit}
            leftBoxTitle="qTest Tests"            
            rightBoxTitle="Avo Assure Scenarios"
            selectTestDomain = {
                <select data-test="intg_qTest_project_dropdwn" value={testProject} onChange={onProjectChange} style={{marginRight : "5px"}}>
                    <option value="Select Project" disabled >Select Project</option>
                    { props.domainDetails.length &&
                        props.domainDetails.map(e => (
                            <option key={e.id} value={`${e.id}||${e.name}`}>{e.name}</option>
                        ))}
                </select>
            }
            selectTestRelease = {
                <select data-test="intg_qTest_release_drpdwn" value={release} onChange={onReleaseChange}>
                    <option value="Select Release" disabled >Select Release</option>
                    { projectDetails &&
                        projectDetails.qc_projects.map(e => (
                            <option key={e.id} value={`${e.id}||${e.name}`}>{e.name}</option>
                        ))}
                </select>
            }
            selectScenarioProject = {
                <select data-test="intg_qTest_Project_scenarios_drpdwn" value={avoProject} onChange={onScenarioChange} >
                    <option value="Select Project" disabled >Select Project</option>
                    { projectDetails &&
                        projectDetails.avoassure_projects.map((e,i)=>(
                            <option key={i} value={i}>{e.project_name}</option>
                        ))}
                </select>
            }
            searchScenario = {
                scenarioArr ?
                <> { SearchIconClicked ?
                        <input onChange={onSearch} type="text" placeholder="Scenario Name"/> : null}
                    <span className="mapping__searchIcon" style={{display:"inline" , float:"right"}}> 
                        <img alt="searchIcon"
                            onClick={()=>{setSearchIconClicked(!SearchIconClicked);setFilteredName(null)}} 
                            style={{cursor: "pointer" , display:"inline",float:"right"}} 
                            src="static/imgs/ic-searchIcon-black.png"
                        />
                    </span>
                </> : null }
            testList = { folderDetails.length ? 
                <Fragment>    
                    <div data-test="intg_zephyr_test_list" className="test__rootDiv">
                        <div className="test_tree_branches">
                            <img alt="collapse"
                                className="test_tree_toggle" 
                                src="static/imgs/ic-qcCollapse.png"
                            />
                            <label>Root</label>
                        </div>
                        { folderDetails
                            .map( (cycleNode, idx) => <CycleNode
                                    key={`cycle-${idx}`}
                                    cycleNode={cycleNode}
                                    projectId={testProject.split('||')[0]}
                                    projectName={testProject.split('||')[1]}
                            />) }
                    </div>   
                </Fragment>
                    : <div></div>
            }
            scenarioList = {
                scenarioArr ? 
                (filteredNames ? filteredNames : 
                    selectedAvoProj.length ? 
                    selectedAvoProj : [])
                    .map((e,i)=>(
                                <div 
                                    key={i}
                                    className={"scenario__listItem " +(selectedScIds == e._id ? "scenario__selectedTC" : "")} 
                                    onClick={()=>{dispatch({type: actionTypes.SEL_SCN_IDS, payload: e._id})}}
                                    style={{cursor: "pointer"}}
                                >
                                { e.name }
                                </div>
                        ))
                    : <div></div> 
            }
        />
    );
}
export default QTestContent;        