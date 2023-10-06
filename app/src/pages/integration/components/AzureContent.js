import React,{Fragment, useState,useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as api from '../api.js';
import domainDetails from '../containers/Jira.js';
import MappingPage from '../containers/MappingPage';
import { Messages as MSG, setMsg, RedirectPage } from '../../global';
import CycleNode from './AzureTree';
import * as actionTypes from '../state/action';
import "../styles/TestList.scss";
import { Paginator } from 'primereact/paginator';


const AzureContent = props => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const userRole = useSelector(state=>state.login.SR);
    const mappedPair = useSelector(state=>state.integration.mappedPair);
    const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);
    const selectedZTCDetails = useSelector(state=>state.integration.selectedZTCDetails);
    const selectedTC = useSelector(state=>state.integration.selectedTestCase);
    const [releaseId, setReleaseId] = useState('Select WorkItems');
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
    const [azureapiKeys,setAzureApiKeys] = useState({'stories':'azureUserStories','testplans':'azureTestPlans','testsuites':'azureTestSuites'})
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage,setRecordsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [storiesToDisplay,setStoriesToDisplay] = useState([])
    const [testsToDisplay,setTestsToDisplay] = useState([])
    const [skipItem,setSkipItem] = useState(0)
    const [showNextButton,setShowNextButton] = useState(false)
    const [isLastPage,setIsLastPage] = useState(false);
    const [isShowPagination,setIsShowPagination] = useState(false)
    const [skipRecord,setSkipRecord] = useState(0)
    const [totalStoriesCount, setTotalStoriesCount] = useState(0)
    const [pageSize, setPageSize] = useState(100);
    const [showCustmBtn,setShowCustmBtn] = useState(true);
    const [pageLimit,setPageLimit] = useState(['1-100'])

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
    //         return RedirectPage(navigate);
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
            return RedirectPage(navigate);
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
        setShowCustmBtn(true);
        let apiObj = Object.assign({"action": azureapiKeys.stories},azureLogin,selectedProject,{'skip':e.skip || 0});
        const workItemsDetails = await api.connectAzure_ICE(apiObj);
        if(workItemsDetails && workItemsDetails.userStories){
            const newArray = userStories.concat(workItemsDetails.userStories)
            setUserStories(newArray);
            setStoriesToDisplay(workItemsDetails.userStories.slice(0,9));
            if(e && e.currPage){
                const startIndex = e.currPage * recordsPerPage;
                const endIndex = startIndex + recordsPerPage;
                setStoriesToDisplay(newArray.slice(startIndex,endIndex));
            }
            setTotalRecords(workItemsDetails.total_count)
            setIsShowPagination(true);
            setTotalStoriesCount(workItemsDetails.total_count)
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
            return RedirectPage(navigate);
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
        // setWorkItemsTitle([{id:1,name:'Story'},{id:2,name:'TestPlans'}]);
        setReleaseId('Select WorkItems')
        setUserStories([]);
        setTestSuites([]);
        setStoriesToDisplay([]);
        setTestsToDisplay([]);
        setTestPlansDropdown([]);
        setSelectedTestplan('');
        setIsShowPagination(false)
        setIsShowTestplan(false);
    }
   return;
  };
  const handleSecondOptionChange = async (event) => {
        setSecondOption(event.target.value);
        setTestSuites([]);
        setStoriesToDisplay([]);
        setTestsToDisplay([]);
        setCurrentPage(0);
        setTotalRecords(0)
      if (event.target.value === 'TestPlans') {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});  
          setUserStories([]);
          let apiObj = Object.assign({"action": azureapiKeys.testplans},azureLogin,selectedProject);
          const getTestplans = await api.connectAzure_ICE(apiObj);
          if(getTestplans && getTestplans.testplans && getTestplans.testplans.length){
            setTestPlansDropdown(getTestplans.testplans);
          }
          setIsShowTestplan(true);
          setShowCustmBtn(false);
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
            let apiObj = Object.assign({
                "action": azureapiKeys.testsuites},azureLogin,{"testplandetails":{"id":parseInt(event.target.value) || ''}},selectedProject);
            const getTestSuites = await api.connectAzure_ICE(apiObj);
            if(getTestSuites && getTestSuites.testsuites && getTestSuites.testsuites.length){
                setTestSuites(getTestSuites.testsuites);
                setTestsToDisplay(getTestSuites.testsuites);
                setTotalRecords(getTestSuites.testsuites.length);
                setIsShowPagination(true);
            }
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        }
  }
  const onPageChange = (e) =>{
    setCurrentPage(e.page);
    setSkipItem(e.first);
    if( secondOption === 'Story'){
        checkPaginator(e);
    }
    const isLastPage = e.page === Math.ceil(totalRecords / recordsPerPage) - 1;
    setIsLastPage(isLastPage);
    const startIndex = e.page * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    let keyName = secondOption === 'Story' ? setStoriesToDisplay(userStories.slice(startIndex, endIndex)) : setTestsToDisplay(testSuites.slice(startIndex, endIndex));
    
  }

  const checkPaginator = (e) => {
    const findPageLimit = pageLimit[0].split('-');
    let pageNumber = (e.page + 1) * 10;
    if( pageNumber > userStories.length && pageNumber > parseInt(findPageLimit[1])){
        let set_pagelimit = parseInt(findPageLimit[1]) + '-' + (parseInt(findPageLimit[1])+pageSize);
        setPageLimit([set_pagelimit]);
        handlePrevNext('next',e.page) 
    }
    if(pageNumber > userStories.length && pageNumber < parseInt(findPageLimit[0])){
        let set_pagelimit = (parseInt(findPageLimit[0])-pageSize) + '-' + parseInt(findPageLimit[0]) 
        setPageLimit([set_pagelimit]);
        handlePrevNext('prev',e.page)
    }
  }

  const handlePrevNext = (btnType,currPage) => {
    if(btnType === 'prev'){
        setSkipRecord(skipRecord-pageSize);
        getWorkItems({skip:skipRecord-pageSize,currPage:currPage});
    }
    if(btnType === 'next'){
        setSkipRecord(skipRecord+pageSize);
        getWorkItems({skip:skipRecord+pageSize,currPage:currPage});
    }

  }

    return(
         !screenexit?
        <Fragment>
            <MappingPage 
                pageTitle="Azure DevOps Integration"
                pageType="Azure"
                onSave={()=>callSaveButton()}
                onViewMap={()=>props.callViewMappedFiles()}
                // onUpdateMap={()=>props.callUpdateMappedFiles()}
                onExit={()=>callExit()}
                testCaseData={testCaseData}
                leftBoxTitle="Azure DevOps tests"
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
                            <option value="Select WorkItems" disabled>Select WorkItems</option>
                            {
                                // props.domainDetails.issue_types
                                workItemsTitle.map(e => (<option key={e.id} value={e.name} title={e.name} onChange={(e)=> {setReleaseId(e.target.value); }} >{e.name}  </option>))
                                
                            }
                           
                        </select>

                            {/* {
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
                            } */}
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
                        storiesToDisplay.map((e,i)=>(
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
                            // Correct code
                            // testsToDisplay.map((e,i)=>(
                            //     <div className={"test_tree_leaves"+ ( selected===e.id ? " test__selectedTC" : "")}>
                            //     <label className="test__leaf" title={e.id} onClick={()=>handleClick(e.id,e.name)}>
                            //         <span className="leafId">{e.id}</span>    
                            //         <span className="test__tcName">{e.name} </span>
                            //     </label>
                            //     {selected===e.id 
                            //             && <><div className="test__syncBtns"> 
                            //             { selected && <img className="test__syncBtn" alt="" title="Synchronize" onClick={handleSync} src={disabled?"static/imgs/ic-qcSyncronise.png":null} />}
                            //             <img className="test__syncBtn" alt="s-ic" title="Undo" onClick={handleUnSync} src="static/imgs/ic-qcUndoSyncronise.png" />
                            //             </div></> 
                            //     }
                            // </div>
                            //     ))   
                            

                            // Trying New Component
                            <>
                                {testPlansDropdown && testPlansDropdown.length ?
                                    <div data-test="intg_zephyr_test_list" className="test__rootDiv">
                                        <div className="test_tree_branches">
                                            <img alt="collapse"
                                                className="test_tree_toggle" 
                                                src="static/imgs/ic-qcCollapse.png"
                                                />
                                            <label>Test Plans</label>
                                        </div>
                                        { testPlansDropdown.map( cycleName => <CycleNode 
                                                    key={cycleName.name}
                                                    phaseList={[]} 
                                                    cycleName={cycleName.name}
                                                    projectId={projectDropdn1}
                                                    releaseId={releaseId}
                                                    testPlansDetails = {cycleName}
                                                    selectedProject = {selectedProject}
                                                    azureLogin = {azureLogin}
                                                    />) }
                                    </div>:null}
                            </>
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
                Pagination={ isShowPagination &&
                    <div className="pagination-controls-container"><div className="pagination-controls" 
                    style={{display: (secondOption === 'Story' && userStories && !userStories.length ) || (secondOption === 'TestPlans' && testSuites && !testSuites.length ) ?'none':''}}>
                            {/* <div className="cstm-prevbtn" style={{display:showCustmBtn?'':'none'}}>
                            <button style={!skipRecord ?{ pointerEvents: 'none' } : null} disabled={!skipRecord ?true:false} className="custom-button previous-btn round" onClick={(e) => handlePrevNext('prev')} >
                                <span class="p-paginator-icon pi pi-angle-double-left"></span>
                            </button>
                            </div> */}
                        {/* { currentPage < 4 && (  */}
                            <Paginator
                                className='custom-paginator'
                                first={currentPage * recordsPerPage}
                                rows={recordsPerPage}
                                totalRecords={totalRecords}
                                pageLinkSize={8}
                                rowsPerPageOptions={[10, 20, 30]}
                                onPageChange={onPageChange}
                                
                            />
                             {/* )} */}
                        {/* <div className="cstm-nxtbtn" style={{display:showCustmBtn?'':'none'}}>
                            <button style={!isLastPage || ((skipRecord+totalRecords) === totalStoriesCount) ? { pointerEvents: 'none' } : null} disabled={!isLastPage || ((skipRecord+totalRecords) === totalStoriesCount) ? true: false} className="custom-button next-btn round" onClick={(e) => handlePrevNext('next')} >
                                <span class="p-paginator-icon pi pi-angle-double-right"></span>
                            </button>
                        </div> */}
                        </div></div>
                }
               
            />
            
            
    </Fragment>
    :null)
}

    
export default AzureContent;