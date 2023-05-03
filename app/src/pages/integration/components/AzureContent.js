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
import { SET_DISABLEAPPEND } from '../../scrape/state/action.js';
import { NormalDropDown } from '@avo/designcomponents';
import async from 'async';


const AzureContent = props => {
    const dispatch = useDispatch();
    const history = useHistory();
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const mappedPair = useSelector(state=>state.integration.mappedPair);
    const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);
    const selectedZTCDetails = useSelector(state=>state.integration.selectedZTCDetails);
    const selectedTC = useSelector(state=>state.integration.selectedTestCase);
    const [releaseId, setReleaseId] = useState('');
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
    const [release, setRelease] = useState(false);
    const [selectedRel, setSelectedRel] = useState("Select Release");
    const [testCaseData, setTestCaseData] = useState([]);
    const [selected,setSelected]=useState(false);
    const [selectedId, setSelectedId] = useState('');
    const [selectedSummary, setSelectedSummary] = useState('');
    const [proj, setProj] = useState('');
    const [projCode, setProjCode] = useState('');
    const [projName, setProjName] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [projectDropdn3 , setProjectDropdn3]= useState("Select Project1");
    const [selectedProject,setSelectedProject] = useState({});
    const [userStories,setUserStories] = useState([]);
    const [testSuites,setTestSuites] = useState([]);
    const [workItemsTitle,setWorkItemsTitle] = useState([{id:1,name:'Story'},{id:2,name:'TestPlans'}]);
    const [isShowTestplan,setIsShowTestplan] = useState(false);
    const [selectedTestplan,setSelectedTestplan] = useState('');
    const [testPlansDropdown ,setTestPlansDropdown] = useState([]);
    const azureLogin = useSelector(state=>state.integration.projectLogin);
    const azureapiKeys = useSelector(state=>state.integration.azureApikeys);

    // const[summary1,setSummary1]=useState('');
    console.log(releaseId)
 

    // const callProjectDetails_ICE=async(e)=>{
    //     dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
    //     const projectId = e.target.value;
    //     const releaseData = await api.getDetails_Jira(projectId, user_id,e.target.value);
    //     if (releaseData.error)
    //         setMsg(releaseData.error);
    //     else if (releaseData === "unavailableLocalServer")
    //         setMsg(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
    //     else if (releaseData === "scheduleModeOn")
    //         setMsg(MSG.INTEGRATION.WARN_UNCHECK_SCHEDULE);
    //     else if (releaseData === "Invalid Session"){
    //         dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    //         return RedirectPage(history);
    //     }
    //     else if (releaseData === "invalidcredentials")
    //         setMsg(MSG.INTEGRATION.ERR_INVALID_CRED);
    //     else if (releaseData) {
    //         setProjectDetails({});
    //         setReleaseArr(releaseData);
    //         setProjectDropdn1(projectId);
    //         setSelectedRel("Select Release");
    //         clearSelections();
    //     }
    //     dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    // }

    const onProjectSelect = async(event) => {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const releaseId = event.target.value;
        const projectScenario =await api.getAvoDetails(user_id);
        if (projectScenario.error)
            setMsg(projectScenario.error);
        else if (projectScenario === "unavailableLocalServer")
            setMsg(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
        else if (projectScenario === "scheduleModeOn")
            setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
        else if (projectScenario === "Invalid Session"){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            return RedirectPage(history);
        }
        else if (projectScenario) {
            setProjectDetails(projectScenario.project_dets);
            setAvoProjects(projectScenario.avoassure_projects);  
            setSelectedRel(releaseId);  
            clearSelections();
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }

    const getWorkItems = async (e) => {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        console.log(e,' its e');
        let apiObj = Object.assign({"action": azureapiKeys.stories},azureLogin,selectedProject);
        const workItemsDetails = await api.connectAzure_ICE(apiObj);
        setUserStories(workItemsDetails.userStories);
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
        const response = await api.saveAzureDetails_ICE(mappedPair);
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
    // const callExit=()=>{
    //     setScreenExit(true);
    //     setScenarioArr(null);
    //     setProjectDropdn1("Select Project");
    //     setScenario_ID("Select Project");
    //     setProjectDropdn2("Select Project");
    //     dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null });
    // }
    
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

    const selectScenarioMultiple = (e,id) => {
        let newScenarioIds = [...selectedScIds];
        if(!e.ctrlKey) {
			newScenarioIds = [id];
		} else if (e.ctrlKey) { 
            const index = newScenarioIds.indexOf(id);
            if (index !== -1) {
                newScenarioIds.splice(index, 1);
            }
            // else newScenarioIds.push(id);
        }
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: newScenarioIds});	
    }

    const handleClick=(value, summary)=>{
        let newSelectedTCDetails = { ...selectedZTCDetails };
        console.log(summary,' ', typeof(summary) ,' its summary');
        let newSelectedTC = [value,summary];
       setSelectedId(value)
       setSelected(value)
       setSelectedSummary(summary)
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
                                scenarioId: selectedScIds,
                                projectId: selectedProject.projectdetails.id, 
                                projectName: selectedProject.projectdetails.name,        
                                // testId: selectedId,
                                // testCode: selected,
                                userStoryId:selectedTC[0] || '', 
                                itemType:releaseId === 'Story' ? 'UserStory' : 'TestSuite' ,
                                userStorySummary:selectedTC[1] || ''
                               

                            }
                        ];
                        if(releaseId && releaseId === 'TestPlans'){
                            mappedPair[0].TestSuiteId = mappedPair[0].userStoryId;
                            mappedPair[0].testSuiteSummary = mappedPair[0].userStorySummary;
                            delete mappedPair[0].userStoryId;
                            delete mappedPair[0].userStorySummary;
                        }
                        dispatch({type: actionTypes.MAPPED_PAIR, payload: mappedPair});
                        console.log(mappedPair);
                        dispatch({type: actionTypes.SYNCED_TC, payload: selected});
            }
        setDisabled(false);
    }

   

    const handleUnSync = () => {
        dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
        dispatch({type: actionTypes.SYNCED_TC, payload: []});
        dispatch({type: actionTypes.SEL_TC, payload: []});
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
        clearSelections();
        setDisabled(true)
        setSelected(false)
    }
    const onSelect = async(event) => {
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
    
    // const [firstOption, setFirstOption] = useState('');
  const [secondOption, setSecondOption] = useState('');
  const [secondDropdownEnabled, setSecondDropdownEnabled] = useState(false);

  const handleFirstOptionChange = (event) => {
    if(event.target.value){
        const selectedOption = event.target.options[event.target.selectedIndex];
        setProjectDropdn1(event.target.value);
        setSelectedProject({projectdetails:{id:event.target.value,name:selectedOption.title}});
        setSecondDropdownEnabled(true);
    }
   return;
  };
  const handleSecondOptionChange = async (event) => {
    setSecondOption(event.target.value);
    setTestSuites([]);
      if (event.target.value === 'TestPlans') {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});  
          setUserStories([]);
          let apiObj = Object.assign({"action": azureapiKeys.testplans},azureLogin,selectedProject);
          const getTestplans = await api.connectAzure_ICE(apiObj);
          if(getTestplans && getTestplans.testplans && getTestplans.testplans.length){
            setTestPlansDropdown(getTestplans.testplans);
          }
          setIsShowTestplan(true);
          dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
      }
      else if (event.target.value === 'Story') {
          setTestPlansDropdown([]);
          setSelectedTestplan('');
          setIsShowTestplan(false);
          getWorkItems(event.target.value);
      }
  };

  const handleTestSuite = async (event) => {
        if(event.target.value){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
            setTestSuites([]);
            let apiObj = Object.assign({"action": azureapiKeys.testsuites},azureLogin,{"testplandetails":{"id":parseInt(event.target.value) || ''}},selectedProject);
            const getTestSuites = await api.connectAzure_ICE(apiObj);
            if(getTestSuites && getTestSuites.testsuites && getTestSuites.testsuites.length){
                setTestSuites(getTestSuites.testsuites);
            }
            
            console.log(getTestSuites,' its getTestplans');
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        }
  }

    return(
         !screenexit?
        <Fragment>
            <MappingPage 
                pageTitle="Azure Integration"
                onSave={()=>callSaveButton()}
                // onViewMap={()=>props.callViewMappedFiles()}
                // onUpdateMap={()=>props.callUpdateMappedFiles()}
                // onExit={()=>callExit()}
                testCaseData={testCaseData}
                leftBoxTitle="Azure tests"
                rightBoxTitle="Avo Assure Scenarios"
                selectTestDomain={
                    <select data-test="intg_Zephyr_project_drpdwn"value={projectDropdn1} onChange={(e)=>{setRelease(true) ;onProjectSelect(e);handleFirstOptionChange(e);}} className="qcSelectDomain" style={{marginRight : "5px"}} >
                        <option value="Select Project" disabled >Select Project</option>
                        { props &&  props.domainDetails ? 
                            
                            props.domainDetails.projects.map(e => (<option  key={e.id} value={e.id} title={e.name}>{e.name} </option>)) : null
                            
                        }
                       
                    </select>
                    
                     }


                     selectWorkitem={
                        <>
                        <select data-test="intg_Zephyr_project_drpdwn"value={releaseId} onChange={(e)=>{setReleaseId(e.target.value);handleSecondOptionChange(e);}} className="qcSelectDomain" style={{marginRight : "5px"}} disabled={!secondDropdownEnabled}>
                            <option value="Select WorkItems"  >Select WorkItems</option>
                            {
                                // props.domainDetails.issue_types
                                workItemsTitle.map(e => (<option key={e.id} value={e.name} title={e.name} onChange={(e)=> {setReleaseId(e.target.value); }} >{e.name}  </option>))
                                
                            }
                           
                        </select>

                            {
                                isShowTestplan ?
                                <select data-test="intg_Zephyr_project_drpdwn" value={selectedTestplan} className="qcSelectDomain" onChange={(e) => { handleTestSuite(e); setSelectedTestplan(e.target.value) }} style={{ marginRight: "5px" }}>
                                    <option value="Select TestPlans" >Select TestPlans</option>
                                   { testPlansDropdown ? 
                                    testPlansDropdown.map((e,i) => (
                                        <option id={i} value={e.id} key={e.id}>{e.name}</option>))
                                    : null   
                                }
                                </select>
                                :
                                null
                            }
                            </>
                         }
                       
                         
                    
            
                selectScenarioProject={
                    <select data-test="intg_zephyr_scenario_dwpdwn" value={projectDropdn2} onChange={(e)=>callScenarios(e)} className="qtestAvoAssureSelectProject">
                        <option value="Select Project"  >Select Project</option>
                        {
                            avoProjects? 
                            avoProjects.map((e,i)=>(
                                <option id={i} value={i} key={i+'_proj'} title={e.project_name}>{e.project_name}</option>))
                                : null 
                        }
                    </select>
                    
                }

                testList={
                    <div data-test="intg_zephyr_scenario_dwpdwn" value={projectDropdn1} onChange={(e)=>{handleSecondOptionChange(e)}} className="qtestAvoAssureSelectProject">
                    {
                        userStories && userStories.length ?
                        userStories.map((e,i)=>(
                            <div className={"test_tree_leaves"+ ( selected===e.id ? " test__selectedTC" : "")}>
                            <label className="test__leaf" title={e.id} onClick={()=>handleClick(e.id,e.fields['System.Title'])}>
                                <span className="leafId">{e.id}</span>    
                                <span className="test__tcName">{e.fields['System.Title']} </span>
                            </label>
                            {selected===e.id 
                                    && <><div className="test__syncBtns"> 
                                    { selected && <img className="test__syncBtn" alt="" title="Synchronize" onClick={handleSync} src={disabled?"static/imgs/ic-qcSyncronise.png":null} />}
                                    <img className="test__syncBtn" alt="s-ic" title="Undo" onClick={handleUnSync} src="static/imgs/ic-qcUndoSyncronise.png" />
                                    </div></> 
                            }
                        </div>
                            ))
                            : 
                            testSuites.map((e,i)=>(
                                <div className={"test_tree_leaves"+ ( selected===e.id ? " test__selectedTC" : "")}>
                                <label className="test__leaf" title={e.id} onClick={()=>handleClick(e.id,e.name)}>
                                    <span className="leafId">{e.id}</span>    
                                    <span className="test__tcName">{e.name} </span>
                                </label>
                                {selected===e.id 
                                        && <><div className="test__syncBtns"> 
                                        { selected && <img className="test__syncBtn" alt="" title="Synchronize" onClick={handleSync} src={disabled?"static/imgs/ic-qcSyncronise.png":null} />}
                                        <img className="test__syncBtn" alt="s-ic" title="Undo" onClick={handleUnSync} src="static/imgs/ic-qcUndoSyncronise.png" />
                                        </div></> 
                                }
                            </div>
                                ))   
                            
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
                            >
                                {e.name}
                            </div>))
                }
               
            />
            
            
    </Fragment>
    :null)
}

    
export default AzureContent;