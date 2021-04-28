import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import {ScreenOverlay, PopupMsg, ResetSession, ModalContainer , IntegrationDropDown} from '../../global' 
import {updateTestSuite_ICE, updateAccessibilitySelection, reviewTask, ExecuteTestSuite_ICE} from '../api';
import "../styles/ExecuteContent.scss";
import * as actionTypes from "../../plugin/state/action";
import ExecuteTable from '../components/ExecuteTable';
import AllocateICEPopup from '../../global/components/AllocateICEPopup'


const ExecuteContent = ({execEnv, setExecAction, taskName, status, readTestSuite, setSyncScenario, setBrowserTypeExe, current_task, syncScenario, appType, browserTypeExe, projectdata, execAction}) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const tasksJson = useSelector(state=>state.plugin.tasksJson)
    const [loading,setLoading] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""})
    const [eachData,setEachData] = useState([])
    const [eachDataFirst,setEachDataFirst] = useState([])
    const [updateAfterSave,setupdateAfterSave] = useState(false)
    const [showDeleteModal,setshowDeleteModal] = useState(false)
    const [showIntegrationModal,setShowIntegrationModal] = useState(false)
    const [modalDetails,setModalDetails] = useState({title:"",task:""})
    const [moduleInfo,setModuleInfo] = useState([])
    const [integration,setIntegration] = useState({
        alm: {url:"",username:"",password:""}, 
        qtest: {url:"",username:"",password:"",qteststeps:""}, 
        zephyr: {url:"",username:"",password:""}
    });
    const [selectAllBatch,setSelectAllBatch] = useState(0)
    const [proceedExecution, setProceedExecution] = useState(false);
    const [dataExecution, setDataExecution] = useState({});
    const [allocateICE,setAllocateICE] = useState(false)
    const [accessibilityParameters,setAccessibilityParameters] = useState(current_task.accessibilityParameters)
    const [scenarioTaskType,setScenarioTaskType] = useState(current_task.scenarioTaskType);
    var batch_name= taskName ==="Batch Execution"?": "+current_task.taskName.slice(13):""

    useEffect(()=>{
        if (Object.keys(current_task).length!==0){
            setAccessibilityParameters(current_task.accessibilityParameters);
            setScenarioTaskType(current_task.scenarioTaskType);
        }
    }, [current_task]);

    const closePopup = () => {
        setPopupState({show:false,title:"",content:""});
    }

    const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    const updateTestSuite = async () => {
        setLoading("Saving in progress. Please Wait...");
		const batchInfo = [];
        for(var i =0 ; i < eachData.length ; i++) { 
			const suiteDetails = {};
			const scenarioDescriptionText = [];
			const scenarioAccNoMap = {};
            for(var j =0 ; j < eachData[i].scenarioids.length ; j++) { 
                scenarioDescriptionText.push("");
                scenarioAccNoMap[eachData[i].scenarioids[j]]="";
            }
			suiteDetails.testsuiteid = eachData[i].testsuiteid;
			suiteDetails.testsuitename = eachData[i].testsuitename;
			suiteDetails.testscenarioids = eachData[i].scenarioids;
			suiteDetails.getparampaths = eachData[i].dataparam;
			suiteDetails.conditioncheck = eachData[i].condition;
			suiteDetails.donotexecute = eachData[i].executestatus;
			suiteDetails.scenarioAccNoMap = scenarioAccNoMap;
			suiteDetails.scenarioDescriptions = scenarioDescriptionText;
			batchInfo.push(suiteDetails);
        }
        
        if(scenarioTaskType !== "disable"){
			let input = {
				taskId : current_task.subTaskId,
				accessibilityParameters: accessibilityParameters
			}
            const status = await updateAccessibilitySelection(input);
            if(status.error){displayError(status.error);return;}
            else if(status !== "success") setPopupState({show:true,title:"Save Test Suite",content:"Failed to save selected accessibility standards."});
            else{
                var curr_task = {...current_task};
                curr_task.accessibilityParameters = accessibilityParameters;
                dispatch({type: actionTypes.SET_CT, payload: curr_task});

                let tj = {...tasksJson};
                for(var index in tj){
                    if(tj[index].uid === curr_task.uid){
                        tj[index].accessibilityParameters = curr_task.accessibilityParameters;
                        break;
                    }
                }
                dispatch({type: actionTypes.SET_TASKSJSON, payload: tj});
            }
        }      


		const data = await updateTestSuite_ICE(batchInfo);
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if (data !== "fail") {
            setPopupState({show:true,title:"Save Test Suite",content:"Test suite saved successfully."});
        }
        setupdateAfterSave(!updateAfterSave);
    }

    const closeModal = () => {
        setshowDeleteModal(false);
    }
    
    const submit_task = async () => {
        let action = "approve";
        if(modalDetails.task==='approve') action = "approve";
        else if(modalDetails.task==='submit') action = "submit";
        if(modalDetails.task==='reassign') action = "reassign";
		var taskid = current_task.subTaskId;
		var taskstatus = current_task.status;
		var version = current_task.versionnumber;
		var batchTaskIDs = current_task.batchTaskIDs;
		var projectId = current_task.projectId;
		if (action !== undefined && action === 'reassign') {
			taskstatus = action;
		}

		const result = await reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs);
        if(result.error){displayError(result.error);return;}
        if (result === 'fail') {
            setPopupState({show:true,title:"Task Submission Error",content:"Reviewer is not assigned !"});
        }else if(result ==='NotApproved'){
            setPopupState({show:true,title:"Task Submission Error",content:"All the dependent tasks (design, scrape) needs to be approved before Submission"});
        } 
        else if (taskstatus === 'reassign') {
            setPopupState({show:true,title:"Task Reassignment Success",content:"Task Reassigned successfully!"});
            window.localStorage['navigateScreen'] = "plugin";
            history.replace('/plugin');
        } else if (taskstatus === 'underReview') {
            setPopupState({show:true,title:"Task Completion Success",content:"Task Approved successfully!"});
            window.localStorage['navigateScreen'] = "plugin";
            history.replace('/plugin');
        } else {
            setPopupState({show:true,title:"Task Submission Success",content:"Task Submitted successfully!"});
            window.localStorage['navigateScreen'] = "plugin";
            history.replace('/plugin');
        }
    }
    
    const ExecuteTestSuitePopup = () => {
        const check = SelectBrowserCheck(appType,browserTypeExe,setPopupState,execAction)
        const valid = checkSelectedModules(eachData, setPopupState);
        if(check && valid) setAllocateICE(true);
    }    

    const CheckStatusAndExecute = (executionData, iceNameIdMap) => {
        if(Array.isArray(executionData.targetUser)){
			for(let icename in executionData.targetUser){
				let ice_id = iceNameIdMap[executionData.targetUser[icename]];
				if(ice_id && ice_id.status){
                    setDataExecution(executionData);
					setAllocateICE(false);
                    setProceedExecution(true);
                    return
				} 
			}
		}else{
			let ice_id = iceNameIdMap[executionData.targetUser];
			if(ice_id && ice_id.status){
                setDataExecution(executionData);
				setAllocateICE(false);
                setProceedExecution(true);
                return
			} 
		}
        ExecuteTestSuite(executionData);
    }

    const ExecuteTestSuite = async (executionData) => {
       
        if(executionData === undefined) executionData = dataExecution;
        setAllocateICE(false);
        const modul_Info = parseLogicExecute(eachData, current_task, appType, projectdata, moduleInfo, accessibilityParameters, scenarioTaskType, setPopupState);
        if(modul_Info === false) return;
        setLoading("Sending Execution Request");
        executionData["source"]="task";
        executionData["exectionMode"]=execAction;
        executionData["executionEnv"]=execEnv;
        executionData["browserType"]=browserTypeExe;
        executionData["integration"]=integration;
        executionData["batchInfo"]=modul_Info;
        ResetSession.start();
        try{
            setLoading(false);
            const data = await ExecuteTestSuite_ICE(executionData);
            if (data.errorapi){displayError(data.errorapi);return;}
            if (data === "begin"){
                return false;
            }
            ResetSession.end();
            if(data.status) {
                if(data.status === "fail") {
                    setPopupState({show:true,title:"Queue Test Suite",content:data["error"]});
                } else {
                    setPopupState({show:true,title:"Queue Test Suite",content:data["message"]});
                }
            }
            setBrowserTypeExe([]);
            setModuleInfo([]);
            setExecAction("serial");
            setupdateAfterSave(!updateAfterSave);
            setSyncScenario(false);
        }catch(error) {
            setLoading(false);
            ResetSession.end();
            setPopupState({show:true,title:"Execute Failed",content:"Failed to execute."});
            setBrowserTypeExe([]);
            setModuleInfo([]);
            setExecAction("serial");
            setupdateAfterSave(!updateAfterSave);
            setSyncScenario(false);
        }
    }

    const syncScenarioChange = (value) => {
        if (value === "1") {
            setShowIntegrationModal("ALM")
		}
		else if (value === "0") {
            setShowIntegrationModal("qTest")
		}
        else if (value === "2") {
            setShowIntegrationModal("Zephyr")
		}
    }

    const setSelectAllBatchClick = () => {
        var checkBox = document.getElementById("selectAllBatch");
        let temp = true; if(checkBox.checked!==true) temp = false;
        setSelectAllBatch(temp);
    }

    return (
        <>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}
            {allocateICE?
            <AllocateICEPopup 
                SubmitButton={CheckStatusAndExecute} 
                setAllocateICE={setAllocateICE}
                modalButton={"Execute"} 
                allocateICE={allocateICE} 
                modalTitle={"Select ICE to Execute"} 
                icePlaceholder={'Search ICE to execute'}
                exeTypeLabel={"Select Execution type"}
                exeIceLabel={"Execute on ICE"}
                ExeScreen={true}
            />:null}
            
            <div className="e__content">
                <div className="e__task_title"> <div className="e__task_name">{taskName || "Execute"}{batch_name}</div></div>
                <div id="tableActionButtons">
                    {taskName==="Batch Execution"?<div><span className='parentBatchContainer'><input id="selectAllBatch" onClick={()=>{setSelectAllBatchClick()}} title='Select Batch' type='checkbox' className='checkParentBatch' /><span className='parentObject'>Select All</span></span></div>:null}
                    <button id="excSaveBtn" onClick={()=>{updateTestSuite()}} title="Save" className={"e__taskBtn e__btn "+ ((taskName==="Batch Execution") ? "e__btnLeft" : "")}>Save</button>
                    <button disabled={true} title="Configure" className={"e__taskBtn e__btn"+ ((taskName==="Batch Execution") ? " e__btnLeft" : "")}>Configure</button>
                    <select defaultValue={""} id='syncScenario' onChange={(event)=>{syncScenarioChange(event.target.value)}} disabled={!syncScenario?true:false} className={"e__taskBtn e__btn"+ ((taskName==="Batch Execution") ? " e__btnLeft" : "")}>
                        <option value="" disabled className="e__disableOption">Select Integration</option>
                        <option value="1">ALM</option>
                        <option value="0">qTest</option>
                        <option value="2">Zephyr</option>
                    </select>
                    <button className="e__btn-md submitTaskBtn" onClick={()=>{setModalDetails({title:(status!=='underReview'?'Submit Task':'Approve Task'),task:(status!=='underReview'?"submit":"approve")});setshowDeleteModal(true)}} title="Submit Task">{status!=='underReview'?"Submit":"Approve"}</button>
                    <button className={"e__btn-md reassignTaskBtn"+ ((status==='underReview') ? "" : " e__btn_display-hide")} onClick={()=>{setModalDetails({title:'Reassign Task',task:"reassign"});setshowDeleteModal(true)}} title="Reassign Task">Reassign</button>
                    <button className="e__btn-md executeBtn" onClick={()=>{ExecuteTestSuitePopup()}} title="Execute">Execute</button>
                </div>

                <ExecuteTable setAccessibilityParameters={setAccessibilityParameters} scenarioTaskType={scenarioTaskType} accessibilityParameters={accessibilityParameters} current_task={current_task} setLoading={setLoading} setPopupState={setPopupState} selectAllBatch={selectAllBatch} filter_data={projectdata} updateAfterSave={updateAfterSave} readTestSuite={readTestSuite} eachData={eachData} setEachData={setEachData} eachDataFirst={eachDataFirst} setEachDataFirst={setEachDataFirst} />
                </div>

            {proceedExecution?
                <ModalContainer
                    title={"ICE Busy"} 
                    footer={
                        <>
                        <button onClick={()=>{ExecuteTestSuite();setProceedExecution(false);}}>Proceed</button>
                        <button onClick={()=>{setAllocateICE(true);setProceedExecution(false);}}>No</button>
                        </>
                    }
                    close={()=>{setProceedExecution(false)}} 
                    content={"Selected ICE is already executing a Test Suite. Press Proceed to queue this execution on selected ICE, press No to select any other ICE."} 
                    modalClass=" modal-sm" 
                />
            :null} 
            {showDeleteModal?<ModalContainer title={modalDetails.title} footer={submitModalButtons(setshowDeleteModal, submit_task)} close={closeModal} content={"Are you sure you want to "+ modalDetails.task+" the task ?"} modalClass=" modal-sm" />:null} 
            { showIntegrationModal ? 
                <IntegrationDropDown
                    setshowModal={setShowIntegrationModal} 
                    type={showIntegrationModal} 
                    showIntegrationModal={showIntegrationModal} 
                    appType={appType} 
                    setPopupState={setPopupState} 
                    setCredentialsExecution={setIntegration}
                    integrationCred={integration}
                    displayError={displayError}
                    browserTypeExe={browserTypeExe}
                />
            :null}   
        </>
    );
}

const checkSelectedModules = (data, setPopupState) => {
    let pass = false;
    // eslint-disable-next-line
    data.map((rowData,m)=>{
        const indeterminate = document.getElementById('parentExecute_"' + m).indeterminate;
        const checked = document.getElementById('parentExecute_"' + m).checked;
        if(indeterminate || checked){
            pass = true;
            return null
        } 
    })
    if (pass===false) setPopupState({show:true,title:"Execute Test Suite",content:"Please select atleast one scenario(s) to execute"});
    return pass
} 

const SelectBrowserCheck = (appType,browserTypeExe,setPopupState,execAction)=>{
    if ((appType === "Web") && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select a browser"});
    else if (appType === "Webservice" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select Web Services option"});
    else if (appType === "MobileApp" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select Mobile Apps option"});
    else if (appType === "Desktop" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select Desktop Apps option"});
    else if (appType === "Mainframe" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select Mainframe option"});
    else if (appType === "OEBS" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select OEBS Apps option"});
    else if (appType === "SAP" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select SAP Apps option"});
    else if (appType === "MobileWeb" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content: "Please select Mobile Web option"});
    else if (browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select " + appType + " option"});
    else if ((appType === "Web") && browserTypeExe.length === 1 && execAction === "parallel") setPopupState({show:true,title:"Execute Test Suite",content:"Please select multiple browsers"});
    else return true;
    return false;
}

const submitModalButtons = (setshowDeleteModal, submit_task) => {
    return(
        <div>
            <button onClick={()=>{setshowDeleteModal(false);submit_task()}} type="button" className="e__modal_button" >Yes</button>
            <button type="button" onClick={()=>{setshowDeleteModal(false);}} >No</button>
        </div>
    )
}

const parseLogicExecute = (eachData, current_task, appType, projectdata, moduleInfo,accessibilityParameters, scenarioTaskType, setPopupState) => {
    for(var i =0 ;i<eachData.length;i++){
        var testsuiteDetails = current_task.testSuiteDetails[i];
        var suiteInfo = {};
        var selectedRowData = [];
        var relid = testsuiteDetails.releaseid;
        var cycid = testsuiteDetails.cycleid;
        var projectid = testsuiteDetails.projectidts;
        
        for(var j =0 ; j<eachData[i].executestatus.length; j++){
            if(eachData[i].executestatus[j]===1){
                if(scenarioTaskType === "exclusive" && accessibilityParameters.length === 0){
                    setPopupState({show:true,title:"Accessibility Standards",content:"Please select one or more accessibility testing standard to proceed."});
                    return false;
                }
                selectedRowData.push({
                    condition: eachData[i].condition[j],
                    dataparam: [eachData[i].dataparam[j].trim()],
                    scenarioName: eachData[i].scenarionames[j],
                    scenarioId: eachData[i].scenarioids[j],
                    scenariodescription: undefined,
                    accessibilityParameters: accessibilityParameters
                });
            }
        }
        suiteInfo.scenarioTaskType = scenarioTaskType;
        suiteInfo.testsuiteName = eachData[i].testsuitename;
        suiteInfo.testsuiteId = eachData[i].testsuiteid;
        suiteInfo.versionNumber = testsuiteDetails.versionnumber;
        suiteInfo.appType = appType;
        suiteInfo.domainName = projectdata.project[projectid].domain;
        suiteInfo.projectName = projectdata.projectDict[projectid];
        suiteInfo.projectId = projectid;
        suiteInfo.releaseId = relid;
        suiteInfo.cycleName = projectdata.cycleDict[cycid];
        suiteInfo.cycleId = cycid;
        suiteInfo.suiteDetails = selectedRowData;
        if(selectedRowData.length !== 0) moduleInfo.push(suiteInfo);
    }
    return moduleInfo;
}

export default ExecuteContent;
