import React,{Fragment, useState,useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as api from '../api.js';
import domainDetails from '../containers/Jira.js';
import MappingPage from '../containers/MappingPage';
import { Messages as MSG, setMsg, RedirectPage } from '../../global';
// import CycleNode from './ZephyrTree';
import * as actionTypes from '../state/action';
import "../styles/TestList.scss"


const JiraContent = props => {
    const dispatch = useDispatch();
    const history = useHistory();
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const mappedPair = useSelector(state=>state.integration.mappedPair);
    const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);
    const [projectId, setProjectId] = useState('');
    const [projectDetails , setProjectDetails]=useState({});
    const [avoProjects , setAvoProjects]= useState(null);
    const [scenarioArr , setScenarioArr] = useState(false);
    const [scenario_ID , setScenario_ID] = useState("Select Project") ;
    const [projectDropdn1 , setProjectDropdn1]= useState("Select Project");
    const [projectDropdn2 , setProjectDropdn2]= useState("Select Project");
    const [SearchIconClicked , setSearchIconClicked] =useState(false);
    const [filteredNames , setFilteredName]= useState(null);
    const [screenexit , setScreenExit]= useState(false);
    const [releaseArr, setReleaseArr] = useState([]);
    const [selectedRel, setSelectedRel] = useState("Select Release");
    const [testCaseData, setTestCaseData] = useState([]);
    
 console.log(user_id)
//     useEffect(() =>{

//         console.log(props.domainDetails);

// },[]);

    const callProjectDetails_ICE=async(e)=>{
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const projectId = e.target.value;
        const releaseData = await api.getDetails_Jira(projectId, user_id);
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
            setProjectDetails({});
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
        const testAndScenarioData =await api.zephyrCyclePhase_ICE(projectId, user_id);
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
        const scenarioID = (e.target.childNodes[e.target.selectedIndex]).getAttribute("id");
        const project_Name= e.target.value
        setScenarioArr(true);
        setScenario_ID(scenarioID);
        setProjectDropdn2(project_Name)
        setFilteredName(null);
        setSearchIconClicked(false);
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
    }

    const callSaveButton =async()=>{ 
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Saving...'});
        const response = await api.connectJira_ICE(mappedPair);
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
        setProjectDropdn2("Select Project");
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

    
    const jiraTest = async(e) => {
        if(e.target.tilte != "Select Project"){
            let projectName = ""
            for(let projectDetails of props.domainDetails.projects) {
                if( e.target.value == projectDetails.code) {
                    projectName = projectDetails.name;
                    break;
                }
            }
            let jira_info ={
                project: projectName,
                action:'getJiraTestcases',
                issuetype: "",
                url: props.user['url'],
                username: props.user['username'],
                password: props.user['password'],
                project_data: props.domainDetails,
                key:e.target.value,
            }
            const testData = await api.getJiraTestcases_ICE(jira_info)
            setTestCaseData(testData.testcases)
            // console.log(data)
            console.log(testData.testcases)
            console.log(testCaseData.testcases)

        }
    }

    console.log(testCaseData)
    // console.log(testData.testcases)

    // const calltestcase_Jira = async()=>{
    //     dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Logging...'});
    //     const jiraurl = JiraUrlRef.current.value;
    //     const jirausername =JiraUsernameRef.current.value;
    //     const jirapwd =JiraPasswordRef.current.value;

    // const testcaseDetails = await api.getJiraTestcases_ICE(input_payload);
    // console.log(testcaseDetails);
    // }

    const selectScenarioMultiple = (e,id) => {
        let newScenarioIds = [...selectedScIds];
        if(!e.ctrlKey) {
			newScenarioIds = [id];
		} else if (e.ctrlKey) { 
            const index = newScenarioIds.indexOf(id);
            if (index !== -1) {
                newScenarioIds.splice(index, 1);
            }
            else newScenarioIds.push(id);
        }
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: newScenarioIds});	
    }
console.log(props);
    return(
         !screenexit?
        <Fragment>
            <MappingPage 
                pageTitle="Jira Integration"
                onSave={()=>callSaveButton()}
                onViewMap={()=>props.callViewMappedFiles()}
                onUpdateMap={()=>props.callUpdateMappedFiles()}
                onExit={()=>callExit()}
                testCaseData={testCaseData}
                leftBoxTitle="Jira Tests"
                rightBoxTitle="Avo Assure Scenarios"
                selectTestDomain={
                    <select data-test="intg_Zephyr_project_drpdwn"value={projectDropdn1} onChange={(e)=>{callProjectDetails_ICE(e);jiraTest(e);onReleaseSelect(e)}} className="qcSelectDomain" style={{marginRight : "5px"}}>
                        <option value="Select Project" disabled >Select Project</option>
                        {  props.domainDetails ? 
                            
                            props.domainDetails.projects.map(e => (<option key={e.id} value={e.code} title={e.name} onChange={(e)=> {setProjectId(e.target.value) }} >{e.name} </option>)) : null
                            
                        }
                        
                    </select>
                  
                
                }
                // selectTestCases={
                //     <select data-test="intg_Zephyr_project_drpdwn" onChange={(e)=>{jiraTest(e)}} className="qcSelectDomain" style={{marginRight : "5px"}}>
                //         <option value="Select Project" disabled >Select Project</option>
                //         { 
                //            testCaseData.testcases       
                //         }
                        
                //     </select>
                //     }
                    
                
                // selectTestRelease={
                //     <select data-test="intg_zephyr_release_drpdwn" value={selectedRel} onChange={onReleaseSelect} className="qcSelectDomain" style={{marginRight : "5px"}}>
                //         <option value="Select Release" disabled >Select Release</option>
                //         {   props.domainDetails ? 
                //            props.domainDetails.projects.map(e => (
                //                 <option key={e.id} value={e.code} title={e.name} onChange={(e)=> setProjectId(e.target.value)}>{e.name}</option>)):null
                        
                //         }
                //     </select>
                // }
                // selectTestRelease={
                //     <select data-test="intg_zephyr_release_drpdwn" value={selectedRel} onChange={onReleaseSelect} className="qcSelectDomain" style={{marginRight : "5px"}}>
                //         <option value="Select Release" disabled >Select Release</option>
                //         {   releaseArr.length &&
                //             releaseArr.map(e => (
                //                 <option key={e.id} value={e.id} title={e.name}>{e.name}</option>
                //             ))
                //         }
                //     </select>
                // }
                selectScenarioProject={
                    <select data-test="intg_zephyr_scenario_dwpdwn" value={projectDropdn2} onChange={(e)=>callScenarios(e)} className="qtestAvoAssureSelectProject">
                        <option value="Select Project" disabled >Select Project</option>
                        {
                            avoProjects? 
                            avoProjects.map((e,i)=>(
                                <option id={i} value={i} key={i+'_proj'} title={e.project_name}>{e.project_name}</option>))
                                : null 
                        }
                    </select>
                }
                testList={
                    <div data-test="intg_zephyr_scenario_dwpdwn" value={projectDropdn1} onChange={(e)=>jiraTest(e)} className="qtestAvoAssureSelectProject">
                    {/* <option value="Select Project" disabled ></option> */}
                    {
                        testCaseData ?
                        testCaseData.map((e,i)=>(
                            <option id={e.code} value={e.code} key={e.code}>{e.code}</option>))
                            : null 
                    }
                </div>
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

                // testList={testCaseData
                //         .map((e, i)=>(
                //             <div 
                //                 // key={i}
                //                 // className={"scenario__listItem" + (selectedScIds.indexOf(e._id)!==-1 ? " scenario__selectedTC" : "")}
                //                 title={e.code}
                //                 // onClick={(event)=>{selectScenarioMultiple(event, e._id);}}
                //             >
                //                 {/* {e.code} */}
                //             </div>))
                // }
                scenarioList={scenarioArr &&
                    (filteredNames ? filteredNames : 
                        avoProjects[parseInt(scenario_ID)].scenario_details.length ? 
                        avoProjects[parseInt(scenario_ID)].scenario_details : [])
                        .map((e, i)=>(
                            <div 
                                key={i}
                                className={"scenario__listItem" + (selectedScIds.indexOf(e._id)!==-1 ? " scenario__selectedTC" : "")}
                                title={e.name}
                                onClick={(event)=>{selectScenarioMultiple(event, e._id);}}
                                // onClick={()=>{}}
                            >
                                {e.name}
                            </div>))
                }
            />
    </Fragment>
    :null)
}
    
export default JiraContent;