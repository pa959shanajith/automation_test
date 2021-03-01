import React, {useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, ScrollBar, IntegrationDropDown} from '../../global' 
import { useSelector } from 'react-redux';
import {getScheduledDetails_ICE, testSuitesScheduler_ICE, cancelScheduledJob_ICE} from '../api';
import "../styles/ScheduleContent.scss";
import ScheduleSuitesTopSection from '../components/ScheduleSuitesTopSection';
import AllocateICEPopup from '../../global/components/AllocateICEPopup'
import Pagination from '../components/Pagination';

const ScheduleContent = ({smartMode, execEnv, syncScenario, setBrowserTypeExe,setExecAction,appType,browserTypeExe,execAction}) => {

    const nulluser = "5fc137cc72142998e29b5e63";
    const filter_data = useSelector(state=>state.plugin.FD)
    const [loading,setLoading] = useState(false)
    const [pageOfItems,setPageOfItems] = useState([])
    const [scheduledData,setScheduledData] = useState([])
    const [scheduledDataOriginal,setScheduledDataOriginal] = useState([])
    const [allocateICE,setAllocateICE] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""})
    const current_task = useSelector(state=>state.plugin.CT)
    const [scheduleTableData,setScheduleTableData] = useState([])
    const [moduleInfo,setModuleInfo] = useState([])
    const [integration,setIntegration] = useState({alm: {url:"",username:"",password:""}, 
                                                    qtest: {url:"",username:"",password:"",qteststeps:""}, 
                                                    zephyr: {accountid:"",accesskey:"",secretkey:""}});
    const [showIntegrationModal,setShowIntegrationModal] = useState(false)
    const [moduleSceduledate,setModuleSceduledate] = useState({})
    const [sort,setSort] = useState(true)
    const [scheDetails,setScheDetails] = useState(true)

    useEffect(()=>{
        getScheduledDetails()
    }, []);

    useEffect(()=>{
        setTimeout(() => {
            getScheduledDetails();
            setScheDetails(!scheDetails)
            var schFilterData = document.getElementById("scheduledSuitesFilterData");
            if(schFilterData !== null && schFilterData!==undefined)
                schFilterData.selectedIndex = "0"; 
        }, 30000);
    }, [scheDetails]);

    const getScheduledDetails = async () => {
        try{
            setLoading("Loading...");
            const result = await getScheduledDetails_ICE();
            if (result && result.length > 0 && result != "fail") {
                for (var k = 0; k < result.length; k++) {
                    if (result[k].scenariodetails[0].scenarioids !== undefined) result[k].scenariodetails = [result[k].scenariodetails];
                    result[k].browserlist = result[k].executeon;
                    const dt = new Date(result[k].scheduledon);
                    result[k].scheduledatetime = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-"
                        + ("0" + dt.getDate()).slice(-2) + " " + ("0" + dt.getHours()).slice(-2) + ":" + ("0" + dt.getMinutes()).slice(-2);
                }
                var scheduledDataParsed = [];
                for(var i =0 ; i < result.length ; i++ ) {
                    const eachScenarioDetails = result[i].scenariodetails[0];
                    for(var j =0 ; j < eachScenarioDetails.length ; j++ ) {
                        let newScheduledScenario = {};
                        newScheduledScenario["target"] = result[i].target;
                        newScheduledScenario["cycleid"] = eachScenarioDetails[j].cycleid;
                        newScheduledScenario["scheduledby"] = result[i].scheduledby;
                        newScheduledScenario["scheduledatetime"] = result[i].scheduledatetime;
                        newScheduledScenario["testsuitenames"] = result[i].testsuitenames;
                        newScheduledScenario["browserlist"] = result[i].browserlist;
                        newScheduledScenario["_id"] = result[i]._id;
                        newScheduledScenario["status"] = result[i].status;
                        newScheduledScenario["scenarioname"] = eachScenarioDetails[j]["scenarioname"];
                        newScheduledScenario["appType"] = eachScenarioDetails[j]["appType"];
                        newScheduledScenario["poolname"] =  eachScenarioDetails[j]["poolname"];
                        scheduledDataParsed.push(newScheduledScenario);
                    }
                } 
                setScheduledData(scheduledDataParsed);
                setScheduledDataOriginal(scheduledDataParsed);
                
                // $scope.scheduledData = result;
                // $timeout(function () {
                //     sortFlag == true ? $(".scheduleDataHeader span:first-child").trigger("click") :
                //         changeBackground();
                //     $("#scheduledSuitesFilterData").prop('selectedIndex', 0);
                //     triggeredSeconds = Math.round(new Date() / 1000);
                // }, 100)
            }
            document.getElementById("scheduledSuitesFilterData").selectedIndex = "0"; 
            setLoading(false);
        }catch (error) {
            setLoading(false);
            console.log(error)
        }
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

    const closePopup = () => {
        setPopupState({show:false,title:"",content:""});
    }

    const onChangePage = (newPageOfItems) => {
        // update state with new page of itemss
        if(JSON.stringify(pageOfItems) !== JSON.stringify(newPageOfItems))
            setPageOfItems(newPageOfItems);
    }
    
    const selectStatus = (value) => {
        if( value === "Show All") {
            setScheduledData(scheduledDataOriginal);
            return
        }
        var scheduledDataParsed = [];
        for(var j =0 ; j < scheduledDataOriginal.length ; j++ ) {
            if((scheduledDataOriginal[j]["status"]).toLowerCase() === (value).toLowerCase()) {
                scheduledDataParsed.push(scheduledDataOriginal[j]);
            }
        }
        setScheduledData(scheduledDataParsed);
    }

    const ScheduleTestSuitePopup = () => {
        const check = SelectBrowserCheck(appType,browserTypeExe,setPopupState,execAction);
        const valid = checkSelectedModules(scheduleTableData, setPopupState);
        const checkDateTime = checkDateTimeValues(scheduleTableData, moduleSceduledate, setModuleSceduledate, setPopupState);
        if(check && valid && checkDateTime) setAllocateICE(true);
    } 

    const ScheduleTestSuite = async (schedulePoolDetails) => {
        setAllocateICE(false);
        const modul_Info = parseLogicExecute(schedulePoolDetails, moduleSceduledate, scheduleTableData, current_task, appType, filter_data);
        if(!modul_Info){
            return
        }
        var executionData = {}
        executionData["source"]="schedule";
        executionData["exectionMode"]=execAction;
        executionData["executionEnv"]=execEnv;
        executionData["browserType"]=browserTypeExe;
        executionData["integration"]=integration;
        executionData["batchInfo"]=modul_Info;
        
        setLoading("Scheduling...");
        const data = await testSuitesScheduler_ICE(executionData);
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if (data == "NotApproved") setPopupState({show:true,title:"Schedule Test Suite",content: "All the dependent tasks (design, scrape) needs to be approved before execution"});
        else if (data == "NoTask") setPopupState({show:true,title:"Schedule Test Suite",content: "Task does not exist for child node"});
        else if (data == "Modified") setPopupState({show:true,title:"Schedule Test Suite",content: "Task has been modified, Please approve the task"});
        else if (data.status == "booked") setPopupState({show:true,title:"Schedule Test Suite",content: "Schedule time is matching for testsuites scheduled for " + data.user});
        else if (data == "success" || data.includes("success")) {
            if (data.includes("Set"))  setPopupState({show:true,title:"Schedule Test Suite",content: data.replace('success', '')}); 
            else setPopupState({show:true,title:"Schedule Test Suite",content:"Successfully scheduled."});
            updateDateTimeValues(scheduleTableData, setModuleSceduledate);
            getScheduledDetails();
        } else if (data == "few") {
            setPopupState({show:true,title:"Schedule Test Suite",content:"Failed to schedule few testsuites"});
            updateDateTimeValues(scheduleTableData, setModuleSceduledate);
        } else if (data == "fail") {
            setPopupState({show:true,title:"Schedule Test Suite",content:"Failed to schedule few testsuites"});
        } else {
            setPopupState({show:true,title:"Schedule Test Suite",content:"Error in scheduling Testsuite. Scheduling failed"});
        }
        // $("#scheduledDataBody>.scheduleDataBodyRow .scheduleDataBodyRowChild").show();
        // $("#scheduledSuitesFilterData").prop('selectedIndex', 0);
        // $(".selectScheduleSuite, .selectToSched").prop("checked", false);
        setExecAction("serial");
        setBrowserTypeExe([]);
    }

    const syncScenarioChange = (value) => {
        setIntegration({alm: {url:"",username:"",password:""}, 
        qtest: {url:"",username:"",password:"",qteststeps:""}, 
        zephyr: {accountid:"",accesskey:"",secretkey:""}})
        if (value == "1") {
            setShowIntegrationModal("ALM")
		}
		else if (value == "0") {
            setShowIntegrationModal("qTest")
		}
        else if (value == "2") {
            setShowIntegrationModal("Zephyr")
		}
    }

    const sortDateTime = () => {
        function compareOpp( a, b ) {
            if ( a.scheduledatetime < b.scheduledatetime ){
              return -1;
            }
            if ( a.scheduledatetime > b.scheduledatetime ){
              return 1;
            }
            return 0;
        }
        function compare( a, b ) {
            if ( a.scheduledatetime > b.scheduledatetime ){
              return -1;
            }
            if ( a.scheduledatetime < b.scheduledatetime ){
              return 1;
            }
            return 0;
        }
        
        var data = [...scheduledData];
        if( sort === true) {data.sort( compare );setSort(false);}
        else {data.sort( compareOpp );setSort(true);}
        setScheduledData(data);
    }

    return (
        <>
            {loading?<ScreenOverlay content={loading}/>:null}
            {allocateICE?
                <AllocateICEPopup 
                    SubmitButton={ScheduleTestSuite} 
                    setAllocateICE={setAllocateICE} 
                    allocateICE={allocateICE} 
                    modalTitle={"Allocate ICE to Schedule"} 
                    modalButton={"Schedule"}
                    icePlaceholder={'Search ICE to allocate'}
                    exeTypeLabel={"Select Schedule type"}
                    exeIceLabel={"Allocate ICE"}
                    scheSmartMode={smartMode}
                />
            :null}
            { showIntegrationModal ? 
                <IntegrationDropDown
                    setshowModal={setShowIntegrationModal} 
                    type={showIntegrationModal} 
                    showIntegrationModal={showIntegrationModal} 
                    appType={appType} 
                    setPopupState={setPopupState} 
                    setCredentialsExecution={setIntegration}
                    displayError={displayError}
                    browserTypeExe={browserTypeExe}
                />
            :null} 
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
            
            <div className="s__task_container">
                <div className="s__task_title"> <div className="s__task_name">Schedule</div></div>
                    <select defaultValue={""} id='syncScenario-schedule' onChange={(event)=>{syncScenarioChange(event.target.value)}} disabled={!syncScenario?true:false} className="e__taskBtn e__btn">
                        <option value="" disabled>Select Integration</option>
                        <option value="1">ALM</option>
                        <option value="0">qTest</option>
                        <option value="2">Zephyr</option>
                    </select>
                </div>
                <div id="pageContent">
                    <div id="scheduleSuitesTopSection">
                        <div id="tableActionButtons">
                            <button className="s__btn-md btnAddToSchedule" onClick={()=>{ScheduleTestSuitePopup()}} title="Add">Schedule</button>
                        </div>
                        <ScheduleSuitesTopSection moduleSceduledate={moduleSceduledate} setModuleSceduledate={setModuleSceduledate} current_task={current_task} filter_data={filter_data} scheduleTableData={scheduleTableData}  setScheduleTableData={setScheduleTableData} />
                    </div>

                {/* //lower scheduled table Section */}
                <div id="scheduleSuitesBottomSection">
                    <div id="page-taskName">
						<span>Scheduled</span>
                        <select defaultValue={"Select Status"} onChange={(event)=>{selectStatus(event.target.value)}} id="scheduledSuitesFilterData" className="form-control-schedule">
                            <option disabled={true}>Select Status</option>
                            <option>Completed</option>
                            <option>In Progress</option>
                            <option>Scheduled</option>
                            <option value={"Terminate"}>Terminated</option>
                            <option>Cancelled</option>
                            <option>Missed</option>
                            <option>Failed</option>
                            <option>Skipped</option>
                            <option>Show All</option>
                        </select>
                    </div>

                    <div className="scheduleDataTable">
						<div className="scheduleDataHeader">
							<span className="s__Table_date s__table_Textoverflow s__cursor s__Table_border" onClick={()=>{sortDateTime()}} title="Click to sort" ng-click="reverse=!reverse;predicate='scheduledatetime'">Date & Time</span>
							<span className="s__Table_host s__table_Textoverflow s__Table_border" >Host</span>
							<span className="s__Table_scenario s__table_Textoverflow s__Table_border" >Scenario Name</span>
							<span className="s__Table_suite s__table_Textoverflow s__Table_border" >Test Suite</span>
							<span className="s__Table_appType s__table_Textoverflow s__Table_border" >App Type</span>
							<span className="s__Table_status s__table_Textoverflow s__Table_border" >Status</span>
						</div>
                        <div className="s__table_container" >
                            <div className="s__table_contents" >
                                <div className="s__ab">
                                    <div className="s__min">
                                        <div className="s__con">
                                            <div id="scheduledDataBody" className="scheduledDataBody">
                                                <ScrollBar scrollId="scheduledDataBody" thumbColor="#929397" trackColor="rgb(211, 211, 211)" >
                                                    <div className='scheduleDataBodyRow'>
                                                        {pageOfItems.map((data,index)=>(
                                                            <div key={index} className="scheduleDataBodyRowChild">
                                                                <div className="s__Table_date s__Table_date-time ">{data.scheduledatetime}</div>
                                                                <div className="s__Table_host" >{data.target == nulluser?'Pool: '+ (data.poolname?data.poolname:'Unallocated ICE'):data.target}</div>
                                                                <div className="s__Table_scenario" title={data.scenarioname}>{data.scenarioname}</div>
                                                                <div className="s__Table_suite" title={data.testsuitenames[0]} >{data.testsuitenames[0]}</div>
                                                                <div className="s__Table_appType">
                                                                    {data.browserlist.map((brow,index)=>(
                                                                        <img key={index} src={"static/"+browImg(brow,data.appType)} alt="apptype" className="s__Table_apptypy_img "/>
                                                                    ))}
                                                                </div>
                                                                <div className="s__Table_status"  data-scheduledatetime={data.scheduledatetime.valueOf().toString()}>
                                                                    {data.status}
                                                                    {(data.status === 'scheduled')?
                                                                        <span className="fa fa-close s__cancel" onClick={()=>{cancelThisJob(data.cycleid,data.scheduledatetime,data._id,data.target,data.scheduledby,"cancelled",getScheduledDetails,setPopupState)}} ng-click='cancelThisJob($event,"cancelled")' title='Cancel Job'/>
                                                                    :null}
                                                                </div> 
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollBar>
                                            </div>
                                        </div>
                                        <Pagination items={scheduledData} onChangePage={onChangePage} />
                                    </div>
                                </div>
                            </div>
                        </div>
					</div>
                </div>
            </div>
        </>
    );
}
const updateDateTimeValues = (scheduleTableData, setModuleSceduledate) => {
    //setting module date and time props
    let moduleSceduledateTime = {};
    scheduleTableData.map((rowData)=>{
        if(moduleSceduledateTime[rowData.testsuiteid] === undefined) {
            moduleSceduledateTime[rowData.testsuiteid] = {
                date:"",
                time:"",
                inputPropstime: {readOnly:"readonly" ,
                    disabled : true,
                    className:"fc-timePicker",
                    placeholder: "Select Time"
                },
                inputPropsdate : {
                    placeholder: "Select Date",
                    readOnly:"readonly" ,
                    className:"fc-datePicker"
                }
            };
        }
    })
    setModuleSceduledate(moduleSceduledateTime);
}

const cancelThisJob = async (cycleid,scheduledatetime,_id,target,scheduledby,status,getScheduledDetails,setPopupState) => {
    if(cycleid===undefined) cycleid=""
    const schDetails = {
        cycleid:cycleid,
        scheduledatetime:scheduledatetime,
        scheduleid:_id 
    };
    const host = target;
    const schedUserid = scheduledby;
    const data = await cancelScheduledJob_ICE(schDetails, host, JSON.stringify(schedUserid));
    if (data === "success") {
        setPopupState({show:true,title:"Scheduled Test Suite",content:"Job is " + status + "."});
        // target.innerText = status;
        getScheduledDetails();
    } else if (data == "inprogress") setPopupState({show:true,title:"Scheduled Test Suite",content:"Job is in progress.. cannot be cancelled."});
    else if (data == "not authorised") setPopupState({show:true,title:"Scheduled Test Suite",content:"You are not authorized to cancel this job."});
    else setPopupState({show:true,title:"Scheduled Test Suite",content:"Failed to cancel Job"});
}

const SelectBrowserCheck = (appType,browserTypeExe,setPopupState,execAction)=>{
    if ((appType == "Web") && browserTypeExe.length === 0) setPopupState({show:true,title:"Schedule Test Suite",content:"Please select a browser"});
    else if (appType == "Webservice" && browserTypeExe.length === 0) setPopupState({show:true,title:"Schedule Test Suite",content:"Please select Web Services option"});
    else if (appType == "MobileApp" && browserTypeExe.length === 0) setPopupState({show:true,title:"Schedule Test Suite",content:"Please select Mobile Apps option"});
    else if (appType == "Desktop" && browserTypeExe.length === 0) setPopupState({show:true,title:"Schedule Test Suite",content:"Please select Desktop Apps option"});
    else if (appType == "Mainframe" && browserTypeExe.length === 0) setPopupState({show:true,title:"Schedule Test Suite",content:"Please select Mainframe option"});
    else if (appType == "OEBS" && browserTypeExe.length === 0) setPopupState({show:true,title:"Schedule Test Suite",content:"Please select OEBS Apps option"});
    else if (appType == "SAP" && browserTypeExe.length === 0) setPopupState({show:true,title:"Schedule Test Suite",content:"Please select SAP Apps option"});
    else if (appType == "MobileWeb" && browserTypeExe.length === 0) setPopupState({show:true,title:"Schedule Test Suite",content: "Please select Mobile Web option"});
    else if (browserTypeExe.length === 0) setPopupState({show:true,title:"Schedule Test Suite",content:"Please select " + appType + " option"});
    else if ((appType == "Web") && browserTypeExe.length == 1 && execAction == "parallel") setPopupState({show:true,title:"Schedule Test Suite",content:"Please select multiple browsers"});
    else return true;
    return false;
}

const browImg = (brow, appType) => {
    if (appType == "Web") {
        if (parseInt(brow) == 1) return '/imgs/ic-ch-schedule.png';
        else if (parseInt(brow) == 2) return '/imgs/ic-ff-schedule.png';
        else if (parseInt(brow) == 3) return '/imgs/ic-ie-schedule.png';
        else if (parseInt(brow) == 7) return '/imgs/ic-legacy-schedule.png';
        else if (parseInt(brow) == 8) return '/imgs/ic-chromium-schedule.png';
    }
    else if (appType == "Webservice") return '/imgs/webservice.png';
    else if (appType == "MobileApp") return '/imgs/mobileApps.png';
    else if (appType == "System") return '/imgs/desktop.png';
    else if (appType == "Desktop") return '/imgs/desktop.png';
    else if (appType == "SAP") return '/imgs/sapApps.png';
    else if (appType == "Mainframe") return '/imgs/mainframe.png';
    else if (appType == "OEBS") return '/imgs/oracleApps.png';
    else if (appType == "MobileWeb") return '/imgs/MobileWeb.png';
}

const checkSelectedModules = (scheduleTableData, setPopupState) => {
    let pass = false;
    scheduleTableData.map((rowData,m)=>{
        const indeterminate = document.getElementById('selectScheduleSuite_' + m).indeterminate;
        const checked = document.getElementById('selectScheduleSuite_' + m).checked;
        if(indeterminate || checked){
            pass = true;
            return
        } 
    })
    if (pass===false) setPopupState({show:true,title:"Schedule Test Suite",content:"Please select atleast one scenario(s) to execute"});
    return pass
} 

const checkDateTimeValues = (eachData, moduleSceduledate, setModuleSceduledate, setPopupState) => {
    for(var i =0 ;i<eachData.length;i++){
        for(var j =0 ; j<eachData[i].executestatus.length; j++){
            if(eachData[i].executestatus[j]===1){
                let doNotSchedule = false
                let moduleSceduledatetime = {...moduleSceduledate};
                moduleSceduledatetime[eachData[i].testsuiteid]["inputPropsdate"]["className"]="fc-timePicker";
                moduleSceduledatetime[eachData[i].testsuiteid]["inputPropstime"]["className"]="fc-timePicker";

                var dateValue = moduleSceduledate[eachData[i].testsuiteid]["date"];
                var timeValue = moduleSceduledate[eachData[i].testsuiteid]["time"];
                if (dateValue === "") {  // Check if schedule date is not empty
                    moduleSceduledatetime[eachData[i].testsuiteid]["inputPropsdate"]["className"]="fc-datePicker s__err-Border";
                    doNotSchedule = true;
                }
                else if (timeValue === "") {  // Check if schedule time is not empty
                    moduleSceduledatetime[eachData[i].testsuiteid]["inputPropstime"]["className"]="fc-timePicker s__err-Border";
                    doNotSchedule = true;
                }
                setModuleSceduledate(moduleSceduledatetime);
                if(doNotSchedule) return false

                const sldate_2 = dateValue.split("-");
                const sltime_2 = timeValue.split(":");
                const timestamp = new Date(sldate_2[2], (sldate_2[1] - 1), sldate_2[0], sltime_2[0], sltime_2[1]);
                const diff = (timestamp - new Date()) / 60000;
                if (diff < 5) {  // Check if schedule time is not ahead of 5 minutes from current time
                    if (diff < 0) moduleSceduledatetime[eachData[i].testsuiteid]["inputPropsdate"]["className"]="fc-datePicker s__err-Border";
                    moduleSceduledatetime[eachData[i].testsuiteid]["inputPropstime"]["className"]="fc-timePicker s__err-Border";
                    setPopupState({show:true,title:"Schedule Test Suite",content:"Schedule time must be 5 mins more than current time."});
                    setModuleSceduledate(moduleSceduledatetime);
                    return false
                }
            } 
        }
    }  
    return true  
} 

const parseLogicExecute = (schedulePoolDetails, moduleSceduledate, eachData, current_task, appType, projectdata ) => {
    let moduleInfo = [];
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
                    scenarioname: eachData[i].scenarionames[j],
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
        suiteInfo.poolid = schedulePoolDetails.poolid;
        suiteInfo.type = schedulePoolDetails.type;

        if(schedulePoolDetails.type === "smartModule") suiteInfo.targetUser = "Module Smart Execution";
        else if(schedulePoolDetails.type === "smartScenario") suiteInfo.targetUser = "Scenario Smart Execution";
        else if(schedulePoolDetails.type === "normal") suiteInfo.targetUser = schedulePoolDetails.targetUser;
        
        var iceList = [];
        if(schedulePoolDetails.type !== "normal") iceList = schedulePoolDetails.targetUser;
        suiteInfo.iceList = iceList;
        for(var j =0 ; j<eachData[i].executestatus.length; j++){
            if(eachData[i].executestatus[j]===1){
                suiteInfo.date = moduleSceduledate[eachData[i].testsuiteid]["date"];
                suiteInfo.time = moduleSceduledate[eachData[i].testsuiteid]["time"];
                const sldate_2 = suiteInfo.date.split("-");
                const sltime_2 = suiteInfo.time.split(":");
                const timestamp = new Date(sldate_2[2], (sldate_2[1] - 1), sldate_2[0], sltime_2[0], sltime_2[1]);
                suiteInfo.timestamp = timestamp.valueOf().toString();
            } 
        }
        if(selectedRowData.length !== 0) moduleInfo.push(suiteInfo);
    }
    return moduleInfo;
}


export default ScheduleContent;