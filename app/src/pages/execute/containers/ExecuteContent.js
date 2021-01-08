import React, { useState} from 'react';
import {ScreenOverlay, PopupMsg, RedirectPage, ModalContainer} from '../../global' 
import {updateTestSuite_ICE, reviewTask, ExecuteTestSuite_ICE, loginQCServer_ICE, loginQTestServer_ICE} from '../api';
import { useHistory } from 'react-router-dom';
import "../styles/ExecuteContent.scss";
import ExecuteTable from '../components/ExecuteTable';
// import socketIOClient from "socket.io-client";
// const ENDPOINT = "https://"+window.location.hostname+":8443";


const ExecuteContent = ({taskName, status, setQccredentials, readTestSuite, setSyncScenario, setBrowserTypeExe, setExecutionActive, qccredentials, current_task, syncScenario, appType, browserTypeExe, projectdata, execAction}) => {

    // const socket = socketIOClient(ENDPOINT);
    const history = useHistory();
    const [loading,setLoading] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
    const [popup,setPopup] = useState({show:false})
    const [eachData,setEachData] = useState([])
    const [eachDataFirst,setEachDataFirst] = useState([])
    const [updateAfterSave,setupdateAfterSave] = useState(false)
    const [showDeleteModal,setshowDeleteModal] = useState(false)
    const [showALMModal,setshowALMModal] = useState(false)
    const [showqTestModal,setshowqTestModal] = useState(false)
    const [modalDetails,setModalDetails] = useState({title:"",task:""})
    const [moduleInfo,setModuleInfo] = useState([])
    const [qccredentialsModal,setQccredentialsModal] = useState({almURL: "", almUserName: "", almPassword: ""});
    const [qTestModal,setqTestModal] = useState({qTestURL: "", qTestUserName: "", qTestPassword: ""});
    const [qtestSteps,setqtestSteps] = useState(false)
    const [errorMsg,setErrorMsg] = useState("")
    const [almUrlErrBor,setAlmUrlErrBor] = useState(false)
    const [almUsernameErrBor,setAlmUsername] = useState(false)
    const [almPassErrBor,setAlmPassErrBor] = useState(false)
    const [selectAllBatch,setSelectAllBatch] = useState(0)
    var batch_name= taskName ==="Batch Execution"?": "+current_task.taskName.slice(13):""

    const closePopup = () => {
        setPopupState({show:false,title:"",content:""});
    }

    const displayError = (error) =>{
        setLoading(false)
        setPopup({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    const updateTestSuite = async () => {
        setLoading("Saving in progress. Please Wait...");
		const batchInfo = [];
		const suiteidsexecution = [];
		// $(".parentSuiteChk:checked").each(function (i, e) {
		// 	suiteidsexecution.push(e.getAttribute('id').split('_')[1]);
		// });
		// window.localStorage.setItem("executionidxreport", JSON.stringify({"idxlist": suiteidsexecution}));
		
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
		const data = await updateTestSuite_ICE(batchInfo);
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if (data !== "fail") {
            setPopupState({show:true,title:"Save Test Suite",content:"Test suite saved successfully."});
            //$("#saveSuitesModal").modal("show")
            //Transaction Activity for Save Test Suite Button Action
            // var labelArr = [];
            // var infoArr = [];
            // labelArr.push(txnHistory.codesDict['SaveTestSuite']);
            // txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
        }
        setupdateAfterSave(!updateAfterSave);
    }

    const closeModal = () => {
        setshowDeleteModal(false);
    }
    
    const closeALMModal = () => {
        setshowALMModal(false);
    }

    const closeqTestModal = () => {
        setshowqTestModal(false);
    }

    const saveQcCredentials = async () => {
        setAlmPassErrBor(false);setAlmUrlErrBor(false);setAlmUsername(false);
		if (!qccredentialsModal.almURL) {
            setAlmUrlErrBor(true);
            setErrorMsg("Please Enter URL.");
		} else if (!qccredentialsModal.almUserName) {
            setAlmUsername(true);
            setErrorMsg("Please Enter User Name.");
		} else if (!qccredentialsModal.almPassword) {
            setAlmPassErrBor(true);
            setErrorMsg("Please Enter Password.");
		} else if (appType != "SAP" && browserTypeExe.length === 0) {
            setshowALMModal(false);
            setPopupState({show:true,title:"Execute Test Suite",content:"Please select a browser"});
        } 
        // else if ($(".exe-ExecuteStatus input:checked").length === 0) {
        //     setshowALMModal(false);
        //     setPopupState({show:true,title:"Execute Test Suite",content:"Please select atleast one scenario(s) to execute"});
        // } 
        else {
            setErrorMsg("");
			const data = await loginQCServer_ICE(qccredentialsModal.almURL, qccredentialsModal.almUserName, qccredentialsModal.almPassword);
            if(data.error){displayError(data.error);return;}
            else if (data == "unavailableLocalServer") {
                setErrorMsg("Unavailable LocalServer");
            } else if (data == "Invalid Session") {
                setErrorMsg("Invalid Session");
            } else if (data == "invalidcredentials") {
                setErrorMsg("Invalid Credentials");
            } else if (data == "invalidurl") {
                setErrorMsg("Invalid URL");
            } else {
                setQccredentials({qcurl: qccredentialsModal.almURL, qcusername: qccredentialsModal.almUserName, qcpassword: qccredentialsModal.almPassword, qctype: ""})
                //Transaction Activity for SaveQcCredentialsExecution Button Action
                // var labelArr = [];
                // var infoArr = [];
                // labelArr.push(txnHistory.codesDict['SaveQcCredentialsExecution']);
                // txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
                setshowALMModal(false);
            }
		}
    }
    
    const submit_task = async () => {
        let action = "reassign";
        if(status!=='underReview') action = "approve";
		var taskid = current_task.subTaskId;
		var taskstatus = current_task.status;
		var version = current_task.versionnumber;
		var batchTaskIDs = current_task.batchTaskIDs;
		var projectId = current_task.projectId;
		if (action != undefined && action == 'reassign') {
			taskstatus = action;
		}
		//Transaction Activity for Task Submit/Approve/Reassign Button Action
		// var labelArr = [];
		// var infoArr = [];

		const result = await reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs);
        if(result.error){displayError(result.error);return;}
        if (result == 'fail') {
            setPopupState({show:true,title:"Task Submission Error",content:"Reviewer is not assigned !"});
        }else if(result =='NotApproved'){
            setPopupState({show:true,title:"Task Submission Error",content:"All the dependent tasks (design, scrape) needs to be approved before Submission"});
        } 
        else if (taskstatus == 'reassign') {
            setPopupState({show:true,title:"Task Reassignment Success",content:"Task Reassigned successfully!"});
            window.localStorage['navigateScreen'] = "plugin";
            history.replace('/plugin');
            //labelArr.push(txnHistory.codesDict['TaskReassign']);
        } else if (taskstatus == 'underReview') {
            setPopupState({show:true,title:"Task Completion Success",content:"Task Approved successfully!"});
            window.localStorage['navigateScreen'] = "plugin";
            history.replace('/plugin');
            //labelArr.push(txnHistory.codesDict['TaskApprove']);
        } else {
            setPopupState({show:true,title:"Task Submission Success",content:"Task Submitted successfully!"});
            window.localStorage['navigateScreen'] = "plugin";
            history.replace('/plugin');
            //labelArr.push(txnHistory.codesDict['TaskSubmit']);
        }
        //txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
    }
    
    const ExecuteTestSuite = async () => {
        const check = SelectBrowserCheck(appType,browserTypeExe,setPopupState,execAction)
        // if ($(".exe-ExecuteStatus input:checked").length === 0) openDialogExe("Execute Test Suite", "Please select atleast one scenario(s) to execute");
        if(check){
            const modul_Info = parseLogicExecute(eachData, current_task, appType, projectdata, moduleInfo);
			setLoading("Execution in progress. Please Wait...");
			var executionData = {
				source: "task",
				exectionMode: execAction,
				browserType: browserTypeExe,
				qccredentials: qccredentials,
				batchInfo: modul_Info
			};
			setExecutionActive(true);
            // $rootScope.resetSession.start();
            // ResetSession("start");
			try{
                setLoading(false);
                return //remove this after syncing with new changes
                const data = await ExecuteTestSuite_ICE(executionData);
                if (data.error){displayError(data.error);return;}
                if (data == "begin"){
                    setLoading(false); //remove this when socket connection is done.
                    return false;
                }
				setLoading(false);
				// $rootScope.resetSession.end();
				setExecutionActive(false);
				if (data == "Invalid Session") return RedirectPage(history);
                else if (data == "unavailableLocalServer")setPopupState({show:true,title:"Execute Test Suite",content:"No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server."});
                else if (data == "scheduleModeOn") setPopupState({show:true,title:"Execute Test Suite",content:"Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed."});
                else if(data == "NotApproved")setPopupState({show:true,title:"Execute Test Suite",content:"All the dependent tasks (design, scrape) needs to be approved before execution"});
                else if(data == "NoTask") setPopupState({show:true,title:"Execute Test Suite",content:"Task does not exist for child node"});
                else if(data == "Modified") setPopupState({show:true,title:"Execute Test Suite",content:"Task has been modified, Please approve the task"});
				else if (data == "unavailableLocalServer") setPopupState({show:true,title:"Execute Test Suite",content:"No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server."});
				else if (data == "Terminate") {
					// $('#executionTerminated').modal('show');
					// $('#executionTerminated').find('.btn-default').focus();
				} else if (data == "success") {
					// $('#executionCompleted').modal('show');
					// setTimeout(function () {
					// 	$("#executionCompleted").find('.btn-default').focus();
					// }, 300);
                } else setPopupState({show:true,title:"Execute Test Suite",content:"Failed to execute."});
				setBrowserTypeExe([]);
				setModuleInfo([]);
				setupdateAfterSave(!updateAfterSave);
				setSyncScenario(false);
				//Transaction Activity for ExecuteTestSuite Button Action
				// var labelArr = [];
				// var infoArr = [];
				// infoArr.push({"appType" : appType});
				// infoArr.push({"status" : data});
				// labelArr.push(txnHistory.codesDict['ExecuteTestSuite']);
				// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
			}catch(error) {
				setLoading(false);
				// $rootScope.resetSession.end();
                setPopupState({show:true,title:"Execute Failed",content:"Failed to execute."});
                setExecutionActive(false);
				setBrowserTypeExe([]);
				setModuleInfo([]);
				setupdateAfterSave(!updateAfterSave);
				setSyncScenario(false);
			}
		}
    }

    const saveQTestCredentials = async () => {
        setAlmPassErrBor(false);setAlmUrlErrBor(false);setAlmUsername(false);
		if (!qTestModal.qTestURL) {
            setAlmUrlErrBor(true);
            setErrorMsg("Please Enter URL.");
		} else if (!qTestModal.qTestUserName) {
            setAlmUsername(true);
            setErrorMsg("Please Enter User Name.");
		} else if (!qTestModal.qTestPassword) {
            setAlmPassErrBor(true);
            setErrorMsg("Please Enter Password.");
		} else if (appType != "SAP" && browserTypeExe.length === 0) {
            setshowALMModal(false);
            setPopupState({show:true,title:"Execute Test Suite",content:"Please select a browser"});
        } 
        // else if ($(".exe-ExecuteStatus input:checked").length === 0) {
        //     setshowALMModal(false);
        //     setPopupState({show:true,title:"Execute Test Suite",content:"Please select atleast one scenario(s) to execute"});
        // } 
        else {
			setErrorMsg("");
			const data = await loginQTestServer_ICE(qTestModal.qTestURL, qTestModal.qTestUserName, qTestModal.qTestPassword,"qTest");
            if(data.error){displayError(data.error);return;}
            else if (data == "unavailableLocalServer") setErrorMsg("Unavailable LocalServer");
            else if (data == "invalidcredentials") setErrorMsg("Invalid Credentials");
            else if (data == "invalidurl") setErrorMsg("Invalid URL");
            else {
                setQccredentials({qcurl: qTestModal.qTestURL, qcusername: qTestModal.qTestUserName, qcpassword: qTestModal.qTestPassword, qteststeps: qtestSteps, qctype: "qTest"})
                setshowqTestModal(false);
            }
		}
    }

    const syncScenarioChange = (value) => {
        setAlmPassErrBor(false);setAlmUrlErrBor(false);setAlmUsername(false);
        if (value == "1") {
			setQccredentialsModal({qcurl: "", qcusername: "", qcpassword: "", qctype: ""});
			setQccredentials({qcurl: "", qcusername: "", qcpassword: "", qctype: ""});
            setshowALMModal(true);
			setErrorMsg("");
		}
		else if (value == "0") {
			setqTestModal({qTestURL: "", qTestUserName: "", qTestPassword: ""});
			setshowqTestModal(true);
			setErrorMsg("");
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
            {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
            
            <div className="e__content">
                <div className="e__task_title"> <div className="e__task_name">{taskName || "Execute"}{batch_name}</div></div>
                <div id="tableActionButtons">
                    {taskName==="Batch Execution"?<div><span className='parentBatchContainer'><input id="selectAllBatch" onClick={()=>{setSelectAllBatchClick()}} title='Select Batch' type='checkbox' className='checkParentBatch' /><span className='parentObject'>Select All</span></span></div>:null}
                    <button id="excSaveBtn" onClick={()=>{updateTestSuite()}} title="Save" className={"e__taskBtn e__btn "+ ((taskName==="Batch Execution") ? "e__btnLeft" : "")}>Save</button>
                    <button disabled={true} title="Configure" className={"e__taskBtn e__btn"+ ((taskName==="Batch Execution") ? " e__btnLeft" : "")}>Configure</button>
                    <select id='syncScenario' onChange={(event)=>{syncScenarioChange(event.target.value)}} disabled={!syncScenario?true:false} className={"e__taskBtn e__btn"+ ((taskName==="Batch Execution") ? " e__btnLeft" : "")}>
                        <option value="" selected disabled>Select Integration</option>
                        <option value="1">ALM</option>
                        <option value="0">qTest</option>
                    </select>
                    <button className="e__btn-md submitTaskBtn" onClick={()=>{setModalDetails({title:(status!=='underReview'?'Submit Task':'Approve Task'),task:(status!=='underReview'?"submit":"approve")});setshowDeleteModal(true)}} title="Submit Task">{status!=='underReview'?"Submit":"Approve"}</button>
                    <button className={"e__btn-md reassignTaskBtn"+ ((status==='underReview') ? "" : " e__btn_display-hide")} onClick={()=>{setModalDetails({title:'Reassign Task',task:"reassign"});setshowDeleteModal(true)}} title="Reassign Task">Reassign</button>
                    <button className="e__btn-md executeBtn" onClick={()=>{ExecuteTestSuite()}} title="Execute">Execute</button>
                </div>

                <ExecuteTable current_task={current_task} selectAllBatch={selectAllBatch} setLoading={setLoading} setPopupState={setPopupState} selectAllBatch={selectAllBatch} filter_data={projectdata} updateAfterSave={updateAfterSave} readTestSuite={readTestSuite} eachData={eachData} setEachData={setEachData} eachDataFirst={eachDataFirst} setEachDataFirst={setEachDataFirst} />
                </div>
                        
            {showDeleteModal?<ModalContainer title={modalDetails.title} footer={submitModalButtons(setshowDeleteModal, submit_task)} close={closeModal} content={"Are you sure you want to "+ modalDetails.task+" the task ?"} modalClass=" modal-sm" />:null} 
            {showALMModal?<ModalContainer title="ALM" footer={submitQModalButtons(errorMsg, saveQcCredentials)} close={closeALMModal} content={AlmMiddleContent(qccredentialsModal, setQccredentialsModal, almUrlErrBor, almUsernameErrBor, almPassErrBor)} modalClass=" e__alm-modal"/>:null}
            {showqTestModal?<ModalContainer title="qTest" footer={submitQModalButtons(errorMsg, saveQTestCredentials)} close={closeqTestModal} content={qTestMiddleContent(qTestModal, setqTestModal, setqtestSteps, almPassErrBor, almUrlErrBor, almUsernameErrBor, qtestSteps)} modalClass=" e__alm-modal"/>:null} 
        </>
    );
}

const SelectBrowserCheck = (appType,browserTypeExe,setPopupState,execAction)=>{
    if ((appType == "Web") && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select a browser"});
    else if (appType == "Webservice" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select Web Services option"});
    else if (appType == "MobileApp" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select Mobile Apps option"});
    else if (appType == "Desktop" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select Desktop Apps option"});
    else if (appType == "Mainframe" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select Mainframe option"});
    else if (appType == "OEBS" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select OEBS Apps option"});
    else if (appType == "SAP" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select SAP Apps option"});
    else if (appType == "MobileWeb" && browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content: "Please select Mobile Web option"});
    else if (browserTypeExe.length === 0) setPopupState({show:true,title:"Execute Test Suite",content:"Please select " + appType + " option"});
    else if ((appType == "Web") && browserTypeExe.length == 1 && execAction == "parallel") setPopupState({show:true,title:"Execute Test Suite",content:"Please select multiple browsers"});
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


const AlmMiddleContent = (qccredentialsModal, setQccredentialsModal, almUrlErrBor, almUsernameErrBor, almPassErrBor) => {
    return(
        <div className="popupWrapRow">
            <div className="textFieldsContainer">
                <p><input value={qccredentialsModal.almURL} onChange={(event)=>{setQccredentialsModal({almURL: event.target.value, almUserName: qccredentialsModal.almUserName, almPassword: qccredentialsModal.almPassword})}} type="text" className={"form-control-ldap form-control-custom-ldap e__modal-alm-input "+ (almUrlErrBor ? " inputErrBor" : "")} placeholder="Enter ALM Url"  id="almURL" /></p>
                <p className="halfWrap halfWrap-margin" ><input value={qccredentialsModal.almUserName} onChange={(event)=>{setQccredentialsModal({almURL: qccredentialsModal.almURL, almUserName: event.target.value, almPassword: qccredentialsModal.almPassword})}} type="text" className={"form-control-ldap form-control-custom-ldap e__modal-alm-input"+ (almUsernameErrBor ? " inputErrBor" : "")} placeholder="Enter User Name" id="almUserName" /></p>
                <p className="halfWrap"><input value={qccredentialsModal.almPassword} onChange={(event)=>{setQccredentialsModal({almURL: qccredentialsModal.almURL, almUserName: qccredentialsModal.almUserName, almPassword: event.target.value})}} type="password" className={"form-control-ldap form-control-custom-ldap e__modal-alm-input"+ (almPassErrBor ? " inputErrBor" : "")} placeholder="Enter Password" id="almPassword" /></p>
            </div>
        </div>
    )
}

const submitQModalButtons = (errorMsg, saveCredentials) => {
    return(
        <div className="popupWrapRow">
            <div className="textFieldsContainer">
            <p align="right" className="textFieldsContainer-cust">
                <span className="error-msg-exeQc">{errorMsg}</span>
                <button type="button" className="e__btn-md " onClick={()=>{saveCredentials()}} >Save</button>
            </p>
            </div>
        </div>
    )
}

const qTestMiddleContent = (qTestModal, setqTestModal, setqtestSteps, almPassErrBor, almUrlErrBor, almUsernameErrBor, qtestSteps) => {
    return(
        <div className="popupWrapRow">
            <div className="textFieldsContainer">
                <p><input value={qTestModal.qTestURL} onChange={(event)=>{setqTestModal({qTestURL: event.target.value, qTestUserName: qTestModal.qTestUserName, qTestPassword: qTestModal.qTestPassword})}} type="text" className={"form-control-ldap form-control-custom-ldap e__modal-alm-input "+ (almUrlErrBor ? " inputErrBor" : "")} placeholder="Enter ALM Url"  id="almURL" /></p>
                <p className="halfWrap halfWrap-margin" ><input value={qTestModal.qTestUserName} onChange={(event)=>{setqTestModal({qTestURL: qTestModal.qTestURL, qTestUserName: event.target.value, qTestPassword: qTestModal.qTestPassword})}} type="text" className={"form-control-ldap form-control-custom-ldap e__modal-alm-input"+ (almUsernameErrBor ? " inputErrBor" : "")} placeholder="Enter User Name" id="almUserName" /></p>
                <p className="halfWrap"><input value={qTestModal.qTestPassword} onChange={(event)=>{setqTestModal({qTestURL: qTestModal.qTestURL, qTestUserName: qTestModal.qTestUserName, qTestPassword:  event.target.value})}} type="password" className={"form-control-ldap form-control-custom-ldap e__modal-alm-input"+ (almPassErrBor ? " inputErrBor" : "")} placeholder="Enter Password" id="almPassword" /></p>
                <p className="qtestSteps" ><input value={qtestSteps} onChange={()=>{setqtestSteps(!qtestSteps)}} type="checkbox" title="Update steps status" id="qtestSteps"/><span>  Update step status</span></p>
            </div>
        </div>
    )
}

const parseLogicExecute = (eachData, current_task, appType, projectdata, moduleInfo) => {
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
                    scenariodescription: undefined
                });
            }
        }
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
