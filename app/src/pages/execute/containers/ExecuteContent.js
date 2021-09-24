import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import {ScreenOverlay, ResetSession, ModalContainer , IntegrationDropDown, Messages as MSG, VARIANT, setMsg, SelectRecipients} from '../../global' 
import {updateTestSuite_ICE, updateAccessibilitySelection, reviewTask, ExecuteTestSuite_ICE} from '../api';
import {getUserDetails,getNotificationGroups} from '../../admin/api';
import "../styles/ExecuteContent.scss";
import * as actionTypes from "../../plugin/state/action";
import ExecuteTable from '../components/ExecuteTable';
import AllocateICEPopup from '../../global/components/AllocateICEPopup'
import AdvancedOptions from '../../mindmap/components/AdvancedOptions'

const ExecuteContent = ({execEnv, setExecEnv, setExecAction, taskName, status, readTestSuite, setSyncScenario, setBrowserTypeExe, current_task, syncScenario, appType, browserTypeExe, projectdata, execAction}) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const tasksJson = useSelector(state=>state.plugin.tasksJson)
    const [loading,setLoading] = useState(false)
    const [eachData,setEachData] = useState([])
    const [update,updateScreen] = useState(true)
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
    const [showAdvOption,setShowAdvOption] = useState(false)
    const [recipients,setRecipients] =useState({groupids:[],additionalrecepients:[]})
    const [allUsers,setAllUsers] = useState([])
    const [groupList,setGroupList] = useState([])
    const [checkAddUsers,setCheckAddUsers] =useState(false)
    const [accessibilityParameters,setAccessibilityParameters] = useState(current_task.accessibilityParameters)
    const [scenarioTaskType,setScenarioTaskType] = useState(current_task.scenarioTaskType);
    var batch_name= taskName ==="Batch Execution"?": "+current_task.taskName.slice(13):""

    useEffect(()=>{
        if (Object.keys(current_task).length!==0){
            setAccessibilityParameters(current_task.accessibilityParameters);
            setScenarioTaskType(current_task.scenarioTaskType);
        }
    }, [current_task]);

    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
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
            else if(status !== "success") displayError(MSG.EXECUTE.ERR_SAVE_ACCESSIBILITY);
            else{
                var curr_task = {...current_task};
                curr_task.accessibilityParameters = accessibilityParameters;
                dispatch({type: actionTypes.SET_CT, payload: curr_task});

                let tj = [...tasksJson];
                for(var task in tj){
                    if(task.uid === curr_task.uid){
                        task.accessibilityParameters = curr_task.accessibilityParameters;
                        break;
                    }
                }
                dispatch({type: actionTypes.SET_TASKSJSON, payload: tj});
            }
        }      


		const data = await updateTestSuite_ICE(batchInfo);
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if (data !== "fail") displayError(MSG.EXECUTE.SUCC_SAVE_TESTSUITE);
        setupdateAfterSave(!updateAfterSave);
    }

    const closeModal = () => {
        setshowDeleteModal(false);
        resetData();
        setCheckAddUsers(false);
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
        var taskname = current_task.taskName
        var nodeid = (current_task.scenarioId != '') ? current_task.scenarioId : ''
		if (action !== undefined && action === 'reassign') {
			taskstatus = action;
		}
		const result = await reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs, nodeid, taskname, recipients.groupids, recipients.additionalrecepients);
        if(result.error){displayError(result.error);return;}
        if (result === 'fail') {
            displayError(MSG.GENERIC.WARN_NO_REVIEWER);
        }else if(result ==='NotApproved'){
            displayError(MSG.EXECUTE.ERR_DEPENDENT_TASK);
        } 
        else if (taskstatus === 'reassign') {
            displayError(MSG.EXECUTE.SUCC_TASK_REASSIGN);
            window.localStorage['navigateScreen'] = "plugin";
            history.replace('/plugin');
        } else if (taskstatus === 'underReview') {
            displayError(MSG.EXECUTE.SUCC_TASK_APPROVED);
            window.localStorage['navigateScreen'] = "plugin";
            history.replace('/plugin');
        } else {
            displayError(MSG.EXECUTE.SUCC_TASK_SUBMIT);
            window.localStorage['navigateScreen'] = "plugin";
            history.replace('/plugin');
        }
    }
    
    const ExecuteTestSuitePopup = () => {
        const check = SelectBrowserCheck(appType,browserTypeExe,displayError,execAction)
        const valid = checkSelectedModules(eachData);
        if(scenarioTaskType === "exclusive" && accessibilityParameters.length === 0){
            displayError(MSG.EXECUTE.WARN_SELECT_ACC_STANDARD);
            return ;
        }
        else if(check && valid) setAllocateICE(true);
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
        const modul_Info = parseLogicExecute(eachData, current_task, appType, projectdata, moduleInfo, accessibilityParameters, scenarioTaskType);
        if(modul_Info === false) return;
        setLoading("Sending Execution Request");
        executionData["source"]="task";
        executionData["exectionMode"]=execAction;
        executionData["executionEnv"]=execEnv;
        executionData["browserType"]=browserTypeExe;
        executionData["integration"]=integration;
        executionData["batchInfo"]=modul_Info;
        executionData["scenarioFlag"] = (current_task.scenarioFlag == 'True') ? true : false
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
                    setMsg(MSG.CUSTOM(data["error"],data.variant));
                } else {
                    setMsg(MSG.CUSTOM(data["message"],data.variant));
                }
            }
            setBrowserTypeExe([]);
            setModuleInfo([]);
            setExecAction("serial");
            setExecEnv("default");
            setupdateAfterSave(!updateAfterSave);
            setSyncScenario(false);
        }catch(error) {
            setLoading(false);
            ResetSession.end();
            displayError(MSG.EXECUTE.ERR_EXECUTE)
            setBrowserTypeExe([]);
            setModuleInfo([]);
            setExecAction("serial");
            setExecEnv("default");
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

    const fetchSelectRecipientsData = async () => {
        setCheckAddUsers(!checkAddUsers);
        if(checkAddUsers) {
            resetData();
        } else {
            let data = await getUserDetails("user");
            if(data.error){displayError(data.error);return;}
            var userOptions = [];
            for(var i=0; i<data.length; i++){
                if(data[i][3] !== "Admin") userOptions.push({_id:data[i][1],name:data[i][0]}); 
            }
            setAllUsers(userOptions.sort()); 

            //fetch all Notification group
            data = await getNotificationGroups({'groupids':[],'groupnames':[]});
            if(data.error){
                if(data.val === 'empty'){
                    displayError(data.error);
                    data = {};
                }else{
                    displayError(data.error);
                    return true;
                }
            }
            setGroupList(data.sort())
        }
    }

    const resetData = () => {
        setAllUsers([]);
        setGroupList([]);
        setRecipients({groupids:[],additionalrecepients:[]});
    }

    return (
        <>
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
            {showAdvOption && <AdvancedOptions scenarioid={current_task.scenarioId} scenarioExec={current_task.scenarioFlag} mindmapid={current_task.testSuiteDetails?current_task.testSuiteDetails[0].testsuiteid:""} setShowAdvOption={setShowAdvOption} priority={1} setBlockui={setLoading} displayError={displayError} executionScreen={true} />}
            <div className="e__content">
                <div className="e__task_title"> <div className="e__task_name">{taskName || "Execute"}{batch_name}</div></div>
                <div id="tableActionButtons">
                    {taskName==="Batch Execution"?<div><span className='parentBatchContainer'><input id="selectAllBatch" onClick={()=>{setSelectAllBatchClick()}} title='Select Batch' type='checkbox' className='checkParentBatch' /><span className='parentObject'>Select All</span></span></div>:null}
                    <button id="excSaveBtn" onClick={()=>{updateTestSuite()}} title="Save" className={"e__taskBtn e__btn "+ ((taskName==="Batch Execution") ? "e__btnLeft" : "")}>Save</button>
                    <button onClick={()=>{setShowAdvOption(true)}} style={{display:taskName ==="Batch Execution"?"none":""}} title="Configure" className={"e__taskBtn e__btn"+ ((taskName==="Batch Execution") ? " e__btnLeft" : "")}>Configure</button>
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

                <ExecuteTable setAccessibilityParameters={setAccessibilityParameters} scenarioTaskType={scenarioTaskType} accessibilityParameters={accessibilityParameters} current_task={current_task} setLoading={setLoading} selectAllBatch={selectAllBatch} updateScreen={updateScreen} updateAfterSave={updateAfterSave} readTestSuite={readTestSuite} eachData={eachData} setEachData={setEachData} update={update} />
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
            {showDeleteModal?
                <ModalContainer 
                    title={modalDetails.title} 
                    footer={submitModalButtons(setshowDeleteModal, submit_task, resetData, setCheckAddUsers)} 
                    close={closeModal} 
                    content={
                        <div>
                            <span>Are you sure you want to {modalDetails.task} the task ?</span>
                            <p className="checkbox-addRecp" >
                                <input value={checkAddUsers}  onChange={()=>{fetchSelectRecipientsData()}} type="checkbox" title="Notify Additional Users" className="checkAddUsers"/>
                                <span >Notify Additional Users</span>
                            </p>
                            <div className='exe-select-recpients'>
                                <div>
                                    <span className="leftControl" title="Token Name">Select Recipients</span>
                                    <SelectRecipients recipients={recipients} setRecipients={setRecipients} groupList={groupList} allUsers={allUsers} />
                                </div>
                            </div>
                        </div>
                    } 
                    /
                >
            :null} 
            { showIntegrationModal ? 
                <IntegrationDropDown
                    setshowModal={setShowIntegrationModal} 
                    type={showIntegrationModal} 
                    showIntegrationModal={showIntegrationModal} 
                    appType={appType} 
                    setCredentialsExecution={setIntegration}
                    integrationCred={integration}
                    displayError={displayError}
                    browserTypeExe={browserTypeExe}
                />
            :null}   
        </>
    );
}

const checkSelectedModules = (data) => {
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
    if (pass===false) setMsg(MSG.EXECUTE.WARN_SELECT_SCENARIO);
    return pass
} 

const SelectBrowserCheck = (appType,browserTypeExe,displayError,execAction)=>{
    if ((appType === "Web") && browserTypeExe.length === 0) displayError(MSG.EXECUTE.WARN_SELECT_BROWSER);
    else if (appType === "Webservice" && browserTypeExe.length === 0) displayError(MSG.EXECUTE.WARN_SELECT_WEBSERVICE);
    else if (appType === "MobileApp" && browserTypeExe.length === 0) displayError(MSG.EXECUTE.WARN_SELECT_MOBILE_APP)
    else if (appType === "Desktop" && browserTypeExe.length === 0) displayError(MSG.EXECUTE.WARN_SELECT_DESKTOP)
    else if (appType === "Mainframe" && browserTypeExe.length === 0) displayError(MSG.EXECUTE.WARN_SELECT_MAINFRAME)
    else if (appType === "OEBS" && browserTypeExe.length === 0) displayError(MSG.EXECUTE.WARN_SELECT_OEBS)
    else if (appType === "SAP" && browserTypeExe.length === 0) displayError(MSG.EXECUTE.WARN_SELECT_SAP)
    else if (appType === "MobileWeb" && browserTypeExe.length === 0) displayError(MSG.EXECUTE.WARN_SELECT_MOBILE)
    else if (browserTypeExe.length === 0) displayError({VARIANT:VARIANT.WARNING,CONTENT:"Please select " + appType + " option"});
    else if ((appType === "Web") && browserTypeExe.length === 1 && execAction === "parallel") displayError(MSG.EXECUTE.WARN_SELECT_MULTI_BROWSER)
    else return true;
    return false;
}

const submitModalButtons = (setshowDeleteModal, submit_task, resetData, setCheckAddUsers) => {
    return(
        <div>
            <button onClick={()=>{setshowDeleteModal(false);submit_task();setCheckAddUsers(false)}} type="button" className="e__modal_button" >Yes</button>
            <button type="button" onClick={()=>{setshowDeleteModal(false);resetData()}} >No</button>
        </div>
    )
}

const parseLogicExecute = (eachData, current_task, appType, projectdata, moduleInfo,accessibilityParameters, scenarioTaskType) => {
    for(var i =0 ;i<eachData.length;i++){
        var testsuiteDetails = current_task.testSuiteDetails[i];
        var suiteInfo = {};
        var selectedRowData = [];
        var relid = testsuiteDetails.releaseid;
        var cycid = testsuiteDetails.cycleid;
        var projectid = testsuiteDetails.projectidts;
        
        for(var j =0 ; j<eachData[i].executestatus.length; j++){
            if(eachData[i].executestatus[j]===1){
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
