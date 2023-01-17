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
import CycleNode from './JiraTree.js';
import { SET_DISABLEAPPEND } from '../../scrape/state/action.js';


const JiraContent = props => {
    const dispatch = useDispatch();
    const history = useHistory();
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const mappedPair = useSelector(state=>state.integration.mappedPair);
    const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);
    const selectedZTCDetails = useSelector(state=>state.integration.selectedZTCDetails);
    const selectedTC = useSelector(state=>state.integration.selectedTestCase);
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
    const [selected,setSelected]=useState(false);
    const [selectedId, setSelectedId] = useState('');
    const [proj, setProj] = useState('');
    const [projCode, setProjCode] = useState('');
    const [projName, setProjName] = useState('');
    const [disabled, setDisabled] = useState(true);
    
 
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
        const response = await api.saveJiraDetails_ICE(mappedPair);
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
        setDisabled(true)
        setSelected(false)
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
        let popupMsg = false;
            if(selectedScIds.length===0){
                popupMsg = MSG.INTEGRATION.WARN_SELECT_SCENARIO;
            }
            else if(selectedId===''){
                popupMsg = MSG.INTEGRATION.WARN_SELECT_TESTCASE;
            }
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
            let projectID = ''
            for(let projectDetails of props.domainDetails.projects) {
                if( e.target.value == projectDetails.code) {
                    projectName = projectDetails.name;
                    projectID = projectDetails.id;
                    setProj(projectID)
                    setProjCode(e.target.value)
                    setProjName(projectName)
                    break;
                };
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

        }
    }
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
    // const TestCaseNode = props => {

    //     const dispatch = useDispatch();
    //     const selectedZTCDetails = useSelector(state=>state.integration.selectedZTCDetails);
    //     const selectedTC = useSelector(state=>state.integration.selectedTestCase);
    //     const syncedTestCases = useSelector(state=>state.integration.syncedTestCases);
    //     const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);
    
    //     let uniqueTCpath = `|${props.phaseId}\\${props.testCase.id}\\${props.testCase.name}\\${props.testCase.parentId}|`;
    
    //     const handleClick = (value) => {
    //         // let newSelectedTCDetails = { ...selectedZTCDetails };
    //         let newSelectedTC = [value.e.code];

    //         let setSelected = {value};
    
    //         if (!value.ctrlKey) {
    //             // setSelected.selectedTCPhaseId = [props.phaseId];
    //             setSelected.selectedTcId = [String(props.testCaseData.id)];
    //             setSelected.selectedTCNames = [props.testCaseData.name];
    //             // setSelected.selectedTCReqDetails = [props.testCase.reqdetails];
    //             // setSelected.selectedTreeId = [String(props.testCase.cyclePhaseId)];
    //             // setSelected.selectedParentID = [props.testCase.parentId];
    //             // setSelected.selectedProjectID = [parseInt(props.projectId)];
    //             // setSelected.selectedReleaseID = [parseInt(props.releaseId)];
    //             newSelectedTC = [uniqueTCpath];
    //         } else if (value.ctrlKey) { 
    //             const index = newSelectedTC.indexOf(uniqueTCpath);
    //             if (index !== -1) {
    //                 // newSelectedTCDetails.selectedTCPhaseId.splice(index, 1);
    //                 setSelected.selectedTcId.splice(index, 1);
    //                 setSelected.selectedTCNames.splice(index, 1);
    //                 // newSelectedTCDetails.selectedTCReqDetails.splice(index, 1);
    //                 // newSelectedTCDetails.selectedTreeId.splice(index, 1);
    //                 // newSelectedTCDetails.selectedParentID.splice(index, 1);
    //                 // newSelectedTCDetails.selectedProjectID.splice(index, 1);
    //                 // newSelectedTCDetails.selectedReleaseID.splice(index, 1);
    //                 newSelectedTC.splice(index, 1);
    //             } else {
    //                 // newSelectedTCDetails.selectedTCPhaseId.push(props.phaseId);
    //                 setSelected.selectedTcId.push(String(props.testCaseData.id));
    //                 setSelected.selectedTCNames.push(props.testCaseData.name);
    //                 // newSelectedTCDetails.selectedTCReqDetails.push(props.testCase.reqdetails);
    //                 // newSelectedTCDetails.selectedTreeId.push(String(props.testCase.cyclePhaseId));
    //                 // newSelectedTCDetails.selectedParentID.push(props.testCase.parentId);
    //                 // newSelectedTCDetails.selectedProjectID.push(parseInt(props.projectId));
    //                 // newSelectedTCDetails.selectedReleaseID.push(parseInt(props.releaseId));
    //                 newSelectedTC.push(uniqueTCpath)
    //             } 
    //         }
    //         dispatch({type: actionTypes.SEL_TC_DETAILS, payload: setSelected});
    //         dispatch({type: actionTypes.SYNCED_TC, payload: []});
    //         dispatch({type: actionTypes.SEL_TC, payload: newSelectedTC});
    //     }
    
    //     const handleSync = () => {
    //         let popupMsg = false;
    //         if(selectedScIds.length===0){
    //             popupMsg = MSG.INTEGRATION.WARN_SELECT_SCENARIO;
    //         }
    //         else if(selectedZTCDetails.selectedTcId.length===0){
    //             popupMsg = MSG.INTEGRATION.WARN_SELECT_TESTCASE;
    //         }
    //         else if(selectedZTCDetails.selectedTcId.length>1 && selectedScIds.length>1) {
    //             popupMsg = MSG.INTEGRATION.WARN_MULTI_TC_SCENARIO;
    //         }
    
    //         if (popupMsg) setMsg(popupMsg);
    //         else{
    //             const mappedPair=[
    //                 {
    //                     projectid: selectedZTCDetails.selectedProjectID,			
    //                     releaseid: selectedZTCDetails.selectedReleaseID,
    //                     treeid: selectedZTCDetails.selectedTreeId,
    //                     parentid: selectedZTCDetails.selectedParentID,
    //                     testid: selectedZTCDetails.selectedTcId,
    //                     testname: selectedZTCDetails.selectedTCNames,
    //                     reqdetails: selectedZTCDetails.selectedTCReqDetails, 
    //                     scenarioId: selectedScIds
    //                 }
    //             ]
    //             dispatch({type: actionTypes.MAPPED_PAIR, payload: mappedPair});
    //             dispatch({type: actionTypes.SYNCED_TC, payload: selectedZTCDetails.selectedTCNames});
    //         }
    //     }
    
    //     const handleUnSync = () => {
    //         dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
    //         dispatch({type: actionTypes.SYNCED_TC, payload: []});
    //         dispatch({type: actionTypes.SEL_TC, payload: []});
    //         dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
    //     }
    

    const handleClick=(value, id)=>{
        let newSelectedTCDetails = { ...selectedZTCDetails };
        let newSelectedTC = [...value];
       setSelected(value)
       setSelectedId(id)
       setDisabled(true)
       dispatch({type: actionTypes.SEL_TC_DETAILS, payload: newSelectedTCDetails});
        dispatch({type: actionTypes.SYNCED_TC, payload: []});
        dispatch({type: actionTypes.SEL_TC, payload: newSelectedTC});
    }
    const handleSync = () => {
       let popupMsg = false;
            if(selectedScIds.length===0){
                popupMsg = MSG.INTEGRATION.WARN_SELECT_SCENARIO;
            }
            else if(selectedId===''){
                popupMsg = MSG.INTEGRATION.WARN_SELECT_TESTCASE;
            }
            else if(selectedId===selectedId && selectedScIds.length>1) {
                popupMsg = MSG.INTEGRATION.WARN_MULTI_TC_SCENARIO;
            }
    
            if (popupMsg) setMsg(popupMsg);
            else{
                    const mappedPair=[
                            {
                                projectId: proj, 
                                projectCode: projCode,
                                projectName: projName,        
                                testId: selectedId,
                                testCode: selected, 
                                scenarioId: selectedScIds
                            }
                        ];
                        console.log("vallue,,,,,,,,",mappedPair)
                        dispatch({type: actionTypes.MAPPED_PAIR, payload: mappedPair});
                        dispatch({type: actionTypes.SYNCED_TC, payload: selected});
            }
        setDisabled(false);
    }

    // const handleSync = () => {
    //     let popupMsg = false;
    //     if(selectedScIds.length===0){
    //         popupMsg = MSG.INTEGRATION.WARN_SELECT_SCENARIO;
    //     }
    //     else if(testCaseData.length===0){
    //         popupMsg = MSG.INTEGRATION.WARN_SELECT_TESTCASE;
    //     }
    //     else if(testCaseData.length>1 && selectedScIds.length>1) {
	// 		popupMsg = MSG.INTEGRATION.WARN_MULTI_TC_SCENARIO;
    //     }

    //     if (popupMsg) setMsg(popupMsg);
    //     else{
    //         const mappedPair=[
    //             {
    //                 projectid:testCaseData.code,			
    //                 // releaseid: selectedZTCDetails.selectedReleaseID,
    //                 // treeid: selectedZTCDetails.selectedTreeId,
    //                 // parentid: selectedZTCDetails.selectedParentID,
    //                 testid: testCaseData.code,
    //                 testname: testCaseData.code,
    //                 // reqdetails: selectedZTCDetails.selectedTCReqDetails, 
    //                 scenarioId: selectedScIds
    //             }
    //         ]
    //         dispatch({type: actionTypes.MAPPED_PAIR, payload: mappedPair});
    //         dispatch({type: actionTypes.SYNCED_TC, payload: testCaseData.code});
    //     }
    // }

    const handleUnSync = () => {
        dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
        dispatch({type: actionTypes.SYNCED_TC, payload: []});
        dispatch({type: actionTypes.SEL_TC, payload: []});
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
        clearSelections();
        setDisabled(true)
        setSelected(false)
    }

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
                            // <option id={e.code} value={e.code} key={e.code}>{e.code}</option>
                            
                            //  <div 
                            //     key={e.code}
                            //     className={"scenario__listItem" + (selectedScIds.indexOf(e._id)!==-1 ? " scenario__selectedTC" : "")}
                            //     title={e.name}
                            //     // onClick={(event)=>{alert(e.code);}}
                            //     onClick={()=>{}}
                            // ><div><img className="test__syncBtn" alt="s-ic" title="Synchronize"  src="static/imgs/ic-qcSyncronise.png" />
                            // <img className="test__syncBtn" alt="s-ic" title="Undo" src="static/imgs/ic-qcUndoSyncronise.png" /></div>
                            //     {e.code}
                            // </div>
                            <div className={"test_tree_leaves"+ ( selected===e.code ? " test__selectedTC" : "")}>
                            <label className="test__leaf" title={e.code} onClick={()=>handleClick(e.code, e.id)}>
                                <span className="leafId">{e.code}</span>    
                                <span className="test__tcName">{e.code}</span>
                            </label>
                            {selected===e.code 
                                    && <><div className="test__syncBtns"> 
                                    { selected && <img className="test__syncBtn" alt="" title="Synchronize" onClick={handleSync} src={disabled?"static/imgs/ic-qcSyncronise.png":null} />}
                                    <img className="test__syncBtn" alt="s-ic" title="Undo" onClick={handleUnSync} src="static/imgs/ic-qcUndoSyncronise.png" />
                                    </div></> 
                            }
                        </div>
                            ))
                            : null
                            
                        // onClick={(e.code)}
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