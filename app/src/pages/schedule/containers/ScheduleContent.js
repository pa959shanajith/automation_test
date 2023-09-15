import React, {useState, useEffect } from 'react';
import {ScreenOverlay, ScrollBar, IntegrationDropDown, Messages as MSG, VARIANT, setMsg} from '../../global' 
import { useSelector } from 'react-redux';
import {getScheduledDetails_ICE, testSuitesScheduler_ICE, cancelScheduledJob_ICE, testSuitesSchedulerRecurring_ICE, getScheduledDetailsOnDate_ICE} from '../api';
import "../styles/ScheduleContent.scss";
import ScheduleSuitesTopSection from '../components/ScheduleSuitesTopSection';
import AllocateICEPopup from '../../global/components/AllocateICEPopup'
import Pagination from '../components/Pagination';
import DevOpsList from '../../utility/components/DevOpsList';
import { CheckBox } from '@avo/designcomponents';
import ScheduleContentModuleWise from './ScheduleContentModuleWise';
import { Dialog } from 'primereact/dialog';

const ScheduleContent = ({smartMode, execEnv, setExecEnv, syncScenario, setBrowserTypeExe,setExecAction,appType,browserTypeExe,execAction,item}) => {

    const nulluser = "5fc137cc72142998e29b5e63";
    const filter_data = useSelector(state=>state.plugin.FD)
    const dateFormat = useSelector(state=>state.login.dateformat);
    const [loading,setLoading] = useState(false)
    const [pageOfItems,setPageOfItems] = useState([])
    const [scheduledData,setScheduledData] = useState([])
    const [scheduledDataOriginal,setScheduledDataOriginal] = useState([])
    const [allocateICE,setAllocateICE] = useState(false)
    const current_task = useSelector(state=>state.plugin.CT)
    const [scheduleTableData,setScheduleTableData] = useState([])
    const [closePopups, setClosePopups] = useState(false);
    const [integration,setIntegration] = useState({alm: {url:"",username:"",password:""}, 
                                                    qtest: {url:"",username:"",password:"",qteststeps:""}, 
                                                    zephyr: {url:"",username:"",password:""},
                                                    azure: {url:"",username:"",password:""}});
    const [showIntegrationModal,setShowIntegrationModal] = useState(false)
    const [moduleScheduledate,setModuleScheduledate] = useState({})
    const [sort,setSort] = useState(true)
    const [showRecurringSchedules, setshowRecurringSchedules] = useState(false);
    const [showScheduledTasks, setshowScheduledTasks] = useState(true);
    const [scheduledRecurringData, setScheduledRecurringData] = useState([]);	
    const [scheduledRecurringDataOriginal, setScheduledRecurringDataOriginal] =	useState([]);
    const [statusChange, setStatusChange] = useState("Select Status");
    const [clearScheduleData, setClearScheduleData] = useState(false);
    const [selectedItem, setSelectedItem] = useState({});
    const [currentTask, setCurrentTask] = useState({});
    const [showModuleInfo, setShowModuleInfo] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');

    useEffect(()=>{
        if (typeof current_task.testSuiteDetails === 'undefined') {
            let testSuiteDetails = item.executionRequest.batchInfo.map((element) => {
                return ({
                    assignedTime: "",
                    releaseid: element.releaseId,
                    cycleid: element.cycleId,
                    testsuiteid: element.testsuiteId,
                    testsuitename: element.testsuiteName,
                    projectidts: element.projectId,
                    assignedTestScenarioIds: "",
                    subTaskId: "",
                    versionnumber: element.versionNumber,
                    domainName: element.domainName,
                    projectName: element.projectName,
                    cycleName: element.cycleName
                });                                   
            });
            setCurrentTask({
                testSuiteDetails: testSuiteDetails
            });
        }
        getScheduledDetails(item.configurekey, item.configurename);
    }, []);

    const getScheduledDetails = async (configKey, configName) => {
        try{
            setLoading('Loading...');
            const result = await getScheduledDetails_ICE(configKey, configName);
            if (result && result.length > 0 && result !== "fail") {
                for (var k = 0; k < result.length; k++) {
                    if (result[k].scenariodetails[0].scenarioids !== undefined) result[k].scenariodetails = [result[k].scenariodetails];
                    result[k].browserlist = result[k].executeon;
                    const dt = new Date(result[k].scheduledon);
                    result[k].scheduledatetime = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-"
                        + ("0" + dt.getDate()).slice(-2) + " " + ("0" + dt.getHours()).slice(-2) + ":" + ("0" + dt.getMinutes()).slice(-2);
                    const startDT = ((result[k].recurringstringonhover === "One Time") ? (result[k].startdate ? result[k].startdate : result[k].scheduledon) : (((typeof result[k].recurringstringonhover !== "undefined" && result[k].recurringstringonhover !== "One Time" && result[k].status !== "recurring" && !result[k].recurringpattern.includes('*'))) ? (result[k].createddate ? result[k].createddate : result[k].scheduledon) : ((typeof result[k].recurringpattern !== "undefined" && result[k].recurringpattern.includes('*')) ? (result[k].createddate ? result[k].createddate : result[k].scheduledon) : result[k].scheduledon)))
                    const sdt = new Date(startDT);
                    result[k].startdatetime = sdt.getFullYear() + "-" + ("0" + (sdt.getMonth() + 1)).slice(-2) + "-"
                            + ("0" + sdt.getDate()).slice(-2) + " " + ("0" + sdt.getHours()).slice(-2) + ":" + ("0" + sdt.getMinutes()).slice(-2);
                }
                var scheduledDataParsed = [];
                var scheduledRecurringDataParsed = [];
                // var eachScenarioDetails;
                for(var i =result.length-1 ; i>=0  ; i-- ) {
                    // eachScenarioDetails = result[i].scenariodetails[0].length>1 ? result[i].scenariodetails[0] : result[i].scenariodetails;
                    // eachScenarioDetails = result[i].scenariodetails;
                    // for(var j =eachScenarioDetails.length-1 ; j>=0  ; j-- ) {
                    //     for (var k=eachScenarioDetails[j].length-1 ; k>=0 ; k-- ) {
                    //         let newScheduledScenario = {};
                    //         let columnValue = eachScenarioDetails[j][k];
                    //         newScheduledScenario["target"] = result[i].target;
                    //         newScheduledScenario["scheduletype"] = result[i].scheduletype ? result[i].scheduletype : "One Time";
                    //         newScheduledScenario["recurringpattern"] = result[i].recurringpattern ? result[i].recurringpattern : "One Time";	
                    //         newScheduledScenario["recurringstringonhover"] = result[i].recurringstringonhover ? result[i].recurringstringonhover : "One Time";
                    //         newScheduledScenario["scheduledby"] = result[i].scheduledby;
                    //         newScheduledScenario["scheduledatetime"] = result[i].scheduledatetime;
                    //         newScheduledScenario["startdatetime"] = result[i].startdatetime;
                    //         newScheduledScenario["testsuitenames"] = [result[i].testsuitenames[j]];
                    //         newScheduledScenario["browserlist"] = result[i].browserlist;
                    //         newScheduledScenario["_id"] = result[i]._id;
                    //         newScheduledScenario["status"] = result[i].status;
                    //         newScheduledScenario["scenarioname"] = columnValue["scenarioname"];
                    //         newScheduledScenario["appType"] = columnValue["appType"];
                    //         newScheduledScenario["poolname"] =  result[i].poolname ? result[i].poolname : 'Unallocated ICE';
                    //         newScheduledScenario["cycleid"] = columnValue["cycleid"];
                    //         scheduledDataParsed.push(newScheduledScenario);
                    //     }
                    // }
                    let newScheduledScenario = {};
                    newScheduledScenario["target"] = result[i].target;
                    newScheduledScenario["scheduletype"] = result[i].scheduletype ? result[i].scheduletype : "One Time";
                    newScheduledScenario["recurringpattern"] = result[i].recurringpattern ? result[i].recurringpattern : "One Time";	
                    newScheduledScenario["recurringstringonhover"] = result[i].recurringstringonhover ? result[i].recurringstringonhover : "One Time";
                    newScheduledScenario["scheduledby"] = result[i].scheduledby;
                    newScheduledScenario["scheduledatetime"] = result[i].scheduledatetime;
                    newScheduledScenario["startdatetime"] = result[i].startdatetime;
                    // newScheduledScenario["testsuitenames"] = [result[i].testsuitenames[j]];
                    newScheduledScenario["browserlist"] = result[i].browserlist;
                    newScheduledScenario["_id"] = result[i]._id;
                    newScheduledScenario["status"] = result[i].status;
                    newScheduledScenario["poolname"] =  result[i].poolname ? result[i].poolname : 'Unallocated ICE';
                    newScheduledScenario["getscheduleondate"] = result[i].scheduledon;
                    scheduledDataParsed.push(newScheduledScenario);
                } 
                setScheduledData(scheduledDataParsed);
                setScheduledDataOriginal(scheduledDataParsed);

                for (var i = 0; i < scheduledDataParsed.length; i++) {	
                    if (scheduledDataParsed[i].recurringpattern != "One Time") {	
                        scheduledRecurringDataParsed.push(	
                            scheduledDataParsed[i]	
                        );	
                    }	
                }	
                setScheduledRecurringData(scheduledRecurringDataParsed);	
                setScheduledRecurringDataOriginal(scheduledRecurringDataParsed);
            }
            setLoading(false);
            document.getElementById("scheduledSuitesFilterData").selectedIndex = "0"; 
        }catch (error) {
            displayError(MSG.SCHEDULE.ERR_FETCH_SCHEDULED);
            setLoading(false);
            console.log(error)
        }
    }

    
    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }

    const handleOnButtonClickRecurring = (event) => {
        setshowRecurringSchedules(true)
        setshowScheduledTasks(false)
        selectStatus("Show All")
        setStatusChange("Select Status")
    }
    const handleOnButtonClickScheduled = (event) => {
        setshowRecurringSchedules(false)
        setshowScheduledTasks(true)
        selectStatus("Show All")
        setStatusChange("Select Status")
    }

    const onChangePage = (newPageOfItems) => {
        // update state with new page of items
        if(JSON.stringify(pageOfItems) !== JSON.stringify(newPageOfItems))
            setPageOfItems(newPageOfItems);
    }
    
    const selectStatus = (value) => {
        if( value === "Show All") {
            setScheduledData(scheduledDataOriginal);
            setScheduledRecurringData(scheduledRecurringDataOriginal);
            return
        }
        var scheduledDataParsed = [];
        var scheduledRecurringDataParsed = [];

        if (showScheduledTasks) {
            for(var j =0 ; j < scheduledDataOriginal.length ; j++ ) {
                if (scheduledDataOriginal[j]["status"].toLowerCase() === value.toLowerCase()) {
                    scheduledDataParsed.push(scheduledDataOriginal[j]);
                }
            }
            setScheduledData(scheduledDataParsed);
        }

        if (showRecurringSchedules) {	
            for (var j = 0; j < scheduledRecurringDataOriginal.length; j++) {	
                if (scheduledRecurringDataOriginal[j]["status"].toLowerCase() === value.toLowerCase()) {	
                    scheduledRecurringDataParsed.push(scheduledRecurringDataOriginal[j]);	
                }	
            }	
            setScheduledRecurringData(scheduledRecurringDataParsed);	
        }
    }

    const ScheduleTestSuitePopup = () => {
        setClosePopups(true);
        const valid = true
        const check = SelectBrowserCheck(appType,browserTypeExe,execAction,displayError,item);
        // const valid = checkSelectedModules(scheduleTableData, displayError);
        const checkDateTime = checkDateTimeValues(scheduleTableData, moduleScheduledate, setModuleScheduledate, displayError);
        if(check && valid && checkDateTime) setAllocateICE(true);
    } 

    const ScheduleTestSuite = async (schedulePoolDetails) => {
        setAllocateICE(false);
        setClearScheduleData(false);
        const modul_Info = parseLogicExecute(schedulePoolDetails, moduleScheduledate, scheduleTableData, currentTask, item.executionRequest.batchInfo[0].appType, filter_data);
        if(!modul_Info){
            return
        }
        var executionData = {}
        executionData["source"]="schedule";
        executionData["exectionMode"]=execAction;
        executionData["executionEnv"]=execEnv;
        executionData["browserType"]=browserTypeExe || (item.executionRequest.browserType.length !== 0 ? item.executionRequest.browserType : ["1"]);
        executionData["integration"]=integration;
        executionData["batchInfo"]=modul_Info;
        executionData["scenarioFlag"] = (current_task.scenarioFlag == 'True') ? true : false
        executionData["type"] = schedulePoolDetails.type;
        executionData["configureKey"]=item.configurekey;
        executionData["configureName"]=item.configurename;
        
        setLoading("Scheduling...");
        let data = "";
        if (executionData["batchInfo"][0].recurringValue != "" && executionData["batchInfo"][0].recurringValue != "One Time") {
            data = await testSuitesSchedulerRecurring_ICE(executionData);
        } else {
            data = await testSuitesScheduler_ICE(executionData);
        }
        if(data.errorparallel){setMsg(MSG.CUSTOM(data.errorparallel, VARIANT.ERROR))}
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if (data === "NotApproved") displayError(MSG.SCHEDULE.ERR_DEPENDENT_TASK);
        else if (data === "NoTask") displayError(MSG.SCHEDULE.ERR_CHILD_NODE);
        else if (data === "Modified") displayError(MSG.SCHEDULE.ERR_TASK_MODIFIED);
        else if (data.status === "booked") setMsg(MSG.CUSTOM("Schedule time is matching for testsuites scheduled for " + data.user,VARIANT.ERROR));
        else if (data === "success" || data.includes("success")) {
            if (data.includes("Set"))  setMsg(MSG.CUSTOM(data.replace('success', ''),VARIANT.SUCCESS)); 
            else displayError(MSG.SCHEDULE.SUCC_SHEDULE)
            updateDateTimeValues(scheduleTableData, setModuleScheduledate);
            getScheduledDetails(item.configurekey, item.configurename);
            setClearScheduleData(true);
        } else if (data === "few") {
            displayError(MSG.SCHEDULE.ERR_FEW_TESTSUITE_SCHEDULE);
            updateDateTimeValues(scheduleTableData, setModuleScheduledate);
            setClearScheduleData(true);
        } else if (data === "fail") {
            displayError(MSG.SCHEDULE.ERR_FEW_TESTSUITE_SCHEDULE);
        } else {
            displayError(MSG.SCHEDULE.ERR_SCEDULE_TESTSUITE);
        }
        setExecAction("serial");
        setExecEnv("default");
        setBrowserTypeExe([]);
    }

    const syncScenarioChange = (value) => {
        setIntegration({alm: {url:"",username:"",password:""}, 
        qtest: {url:"",username:"",password:"",qteststeps:""}, 
        zephyr: {url:"",username:"",password:""},
        azure: {url:"",username:"",password:""}})
        if (value === "1") {
            setShowIntegrationModal("ALM")
		}
		else if (value === "0") {
            setShowIntegrationModal("qTest")
		}
        else if (value === "2") {
            setShowIntegrationModal("Zephyr")
		}
        else if (value === "3") {
            setShowIntegrationModal("Azure")
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
        var recurringData = [...scheduledRecurringData];

        if (showScheduledTasks) {
            if( sort === true) {
                data.sort( compare );
                setSort(false);
            }
            else {
                data.sort( compareOpp );
                setSort(true);
            }
            setScheduledData(data);
        }

        if (showRecurringSchedules) {	
            if (sort === true) {	
                recurringData.sort(compare);	
                setSort(false);	
            } else {	
                recurringData.sort(compareOpp);	
                setSort(true);	
            }	
            setScheduledRecurringData(recurringData);	
        }
    }

    const formatDate = (date) => {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear(),
            hour = '' + d.getHours(),
            minute = '' + d.getMinutes();
            
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
        if (hour.length < 2)
            hour = '0' + hour
        if (minute.length < 2)
            minute = '0' + minute 

        let map = {"MM":month,"YYYY": year, "DD": day};
        let def = [day,month,year];
        let format = dateFormat.split("-");
        let arr = []
        let used = {}
        for (let index in format){
            if (!(format[index] in map) || format[index] in used){
                return def.join('-') + " " + [hour,minute].join(':');
            }
            arr.push(map[format[index]]) 
            used[format[index]] = 1
        }

        return arr.join('-') + " " + [hour,minute].join(':');
    }

    return (
        <>
            {loading?<ScreenOverlay content={loading}/>:null}
            {allocateICE?
                <AllocateICEPopup 
                    SubmitButton={ScheduleTestSuite} 
                    setAllocateICE={setAllocateICE} 
                    allocateICE={allocateICE} 
                    modalTitle={"Allocate Avo Assure Client to Schedule"} 
                    modalButton={"Schedule"}
                    icePlaceholder={'Search'}
                    exeTypeLabel={"Select Schedule type"}
                    exeIceLabel={"Allocate Avo Assure Client"}
                    scheSmartMode={smartMode}
                    currentTask={currentTask}
                />
            :null}
            { showIntegrationModal ? 
                <IntegrationDropDown
                    setshowModal={setShowIntegrationModal} 
                    type={showIntegrationModal} 
                    showIntegrationModal={showIntegrationModal} 
                    appType={appType}
                    setCredentialsExecution={setIntegration}
                    displayError={displayError}
                    browserTypeExe={browserTypeExe}
                />
            :null} 
            
            <div className="s__task_container">
                <div className="s__task_title"> <div className="s__task_name">{ item.executionRequest.configurename } - Schedule</div></div>
                    
                </div>
                <div id="pageContent">
                    <div id="scheduleSuitesTopSection">
                        <select style={{display:"none"}} defaultValue={""} id='syncScenario-schedule' onChange={(event)=>{syncScenarioChange(event.target.value)}} disabled={!syncScenario?true:false} className=" e__btn">
                            <option value="" className="s__disableOption" disabled>Select Integration</option>
                            <option value="1">ALM</option>
                            <option value="0">qTest</option>
                            <option value="2">Zephyr</option>
                        </select>
                        <div id="s__btns">

                            <button className="s__btn-md btnAddToSchedule only_schedule" onClick={()=>{ScheduleTestSuitePopup()}}  title="Add" >Schedule</button>

                        </div>
                        <ScheduleSuitesTopSection closePopups={closePopups} setClosePopups={setClosePopups} setLoading={setLoading} displayError={displayError} moduleScheduledate={moduleScheduledate} setModuleScheduledate={setModuleScheduledate} current_task={currentTask} filter_data={filter_data} scheduleTableData={scheduleTableData}  setScheduleTableData={setScheduleTableData} clearScheduleData={clearScheduleData} item={item} />
                    </div>

                {/* //lower scheduled table Section */}
                <div id="scheduleSuitesBottomSection">
                    <div id="page-taskName">
                        <div>
                        <select value={statusChange} onChange={(event)=>{selectStatus(event.target.value); setStatusChange(event.target.value)}} id="scheduledSuitesFilterData" className="form-control-schedule">
                            <option disabled={true} value={"Select Status"}>Select Status</option>
                            <option value={"Completed"}>Completed</option>
                            <option value={"Inprogress"} >In Progress</option>
                            <option value={"Scheduled"}>Scheduled</option>
                            <option value={"Recurring"}>Recurring</option>
                            <option value={"Terminate"}>Terminated</option>
                            <option value={"Cancelled"}>Cancelled</option>
                            <option value={"Missed"}>Missed</option>
                            <option value={"Failed"}>Failed</option>
                            <option value={"Skipped"}>Skipped</option>
                            <option value={"Show All"}>Show All</option>
                        </select>
                        {/* <div>
                            <CheckBox name='Saucelabs'/>
                        </div> */}
                       
                        </div>
                        </div>

                       
                        
                        
                        <div id="s__btns">
                            <button className={"s__btn-md btnAddToSchedule"+(showRecurringSchedules?" disabled":"")} onClick={() => {handleOnButtonClickScheduled();}} title="Scheduled Tasks">
                                Scheduled Tasks
                            </button>

                        </div>
                        <div id="s__btns">
                            <button className={"s__btn-md btnAddToSchedule"+(showScheduledTasks?" disabled":"")} onClick={() => {handleOnButtonClickRecurring();}} title="Recurring Schedules">
                                Recurring Schedules
                            </button>
                        </div>
                        <div id="s__btns" onClick={()=>{getScheduledDetails(item.configurekey, item.configurename)}} className="fa fa-refresh s__refresh" title="Refresh Scheduled Data" ></div>
                        
                    

                    <div className="scheduleDataTable">
						<div className="scheduleDataHeader">
							<span className="s__Table_date s__table_Textoverflow s__cursor s__Table_border" onClick={()=>{sortDateTime()}} title="Click to sort" ng-click="reverse=!reverse;predicate='scheduledatetime'">Date & Time</span>
							<span className="s__Table_host s__table_Textoverflow s__Table_border" >Host</span>
							{/* <span className="s__Table_scenario s__table_Textoverflow s__Table_border" >Scenario Name</span>
							<span className="s__Table_suite s__table_Textoverflow s__Table_border" >Test Suite</span>
							<span className="s__Table_appType s__table_Textoverflow s__Table_border" >App Type</span>  */}
                            <span className="s__Table_scheduleType s__table_Textoverflow s__Table_border" >Schedule Type</span>
							<span className="s__Table_status s__table_Textoverflow s__Table_border" >Status</span>
						</div>
                        { showScheduledTasks && <div className="s__table_container" >
                            <div className="s__table_contents" >
                                <div className="s__ab">
                                    <div className="s__min">
                                        <div className="s__con">
                                            <div id="scheduledDataBody" className="scheduledDataBody">
                                                <ScrollBar scrollId="scheduledDataBody" thumbColor="#321e4f" trackColor="rgb(211, 211, 211)" >
                                                    <div className='scheduleDataBodyRow'>
                                                        {pageOfItems.map((data,index)=>( data.status != "recurring" && data.recurringpattern == "One Time" &&
                                                            <div key={index} className="scheduleDataBodyRowChild">
                                                                <div data-test = "schedule_data_date" className="s__Table_date s__Table_date-time " title={"Job created on: " +formatDate(data.startdatetime).toString()}>{formatDate(data.scheduledatetime)}</div>
                                                                <div data-test = "schedule_data_target_user" className="s__Table_host">{data.target === nulluser?'Pool: '+ (data.poolname?data.poolname:'Unallocated ICE'):data.target}</div>
                                                                {/* <div data-test = "schedule_data_scenario_name" className="s__Table_scenario" title={data.scenarioname}>{data.scenarioname}</div>
                                                                <div data-test = "schedule_data_date_suite_name" className="s__Table_suite" title={data.testsuitenames[0]} >{data.testsuitenames[0]}</div>
                                                                <div data-test = "schedule_data_browser_type" className="s__Table_appType">
                                                                    {data.browserlist.map((brow,index)=>(
                                                                        <img key={index} src={"static/"+browImg(brow,data.appType)} alt="apptype" className="s__Table_apptypy_img "/>
                                                                    ))}
                                                                </div> */}
                                                                <div data-test="schedule_data_schedule_type" className="s__Table_scheduleType" title={data.recurringstringonhover}>   
                                                                    { data.scheduletype ? data.scheduletype : "One Time"}
                                                                </div>
                                                                <div data-test = "schedule_data_status" className="s__Table_status"  data-scheduledatetime={data.scheduledatetime.valueOf().toString()}>
                                                                    <span style={{color: `rgb(100, 54, 147)`, cursor: 'pointer', fontWeight: 'bold'}} onClick={() => { setShowModuleInfo(true); setScheduledDate(data.getscheduleondate) }}>{data.status === "Terminate" ? "Terminated" : data.status}</span>
                                                                    {(data.status === 'scheduled' || data.status === "recurring")?
                                                                        <span className="fa fa-trash s__cancel" onClick={()=>{cancelThisJob(data.cycleid,data.scheduledatetime,data._id,data.target,data.scheduledby,"cancelled",getScheduledDetails,displayError,item.configurekey,item.configurename)}} title='Cancel Job'/>
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
                        </div> }

                        { showRecurringSchedules && <div className="s__table_container" >
                            <div className="s__table_contents" >
                                <div className="s__ab">
                                    <div className="s__min">
                                        <div className="s__con">
                                            <div id="scheduledDataBody" className="scheduledDataBody">
                                                <ScrollBar scrollId="scheduledDataBody" thumbColor="#321e4f" trackColor="rgb(211, 211, 211)" >
                                                    <div className='scheduleDataBodyRow'>
                                                        {pageOfItems.map((data,index)=>( (data.status == "recurring" || data.status == "cancelled" || data.status == "Failed" || data.status == "Completed") && data.recurringpattern != "One Time" &&
                                                            <div key={index} className="scheduleDataBodyRowChild">
                                                                <div data-test = "schedule_data_date" className="s__Table_date s__Table_date-time " title={"Job created on: " +formatDate(data.startdatetime).toString()}>{formatDate(data.scheduledatetime)}</div>
                                                                <div data-test = "schedule_data_target_user" className="s__Table_host">{data.target === nulluser?'Pool: '+ (data.poolname?data.poolname:'Unallocated ICE'):data.target}</div>
                                                                {/* <div data-test = "schedule_data_scenario_name" className="s__Table_scenario" title={data.scenarioname}>{data.scenarioname}</div>
                                                                <div data-test = "schedule_data_date_suite_name" className="s__Table_suite" title={data.testsuitenames[0]} >{data.testsuitenames[0]}</div>
                                                                <div data-test = "schedule_data_browser_type" className="s__Table_appType">
                                                                    {data.browserlist.map((brow,index)=>(
                                                                        <img key={index} src={"static/"+browImg(brow,data.appType)} alt="apptype" className="s__Table_apptypy_img "/>
                                                                    ))}
                                                                </div> */}
                                                                <div data-test="schedule_data_schedule_type" className="s__Table_scheduleType" title={data.recurringstringonhover}>   
                                                                    { data.scheduletype ? data.scheduletype : "One Time"}
                                                                </div>
                                                                <div data-test = "schedule_data_status" className="s__Table_status"  data-scheduledatetime={data.scheduledatetime.valueOf().toString()}>
                                                                    <span style={{color: `rgb(100, 54, 147)`, cursor: 'pointer', fontWeight: 'bold'}} onClick={() => { setShowModuleInfo(true); setScheduledDate(data.getscheduleondate) }}>{data.status}</span>
                                                                    {(data.status === 'scheduled' || data.status === "recurring")?
                                                                        <span className="fa fa-trash s__cancel" onClick={()=>{cancelThisJob(data.cycleid,data.scheduledatetime,data._id,data.target,data.scheduledby,"cancelled",getScheduledDetails,displayError,item.configurekey,item.configurename)}} title='Cancel Job'/>
                                                                    :null}
                                                                </div> 
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollBar>
                                            </div>
                                        </div>
                                        <Pagination items={scheduledRecurringData} onChangePage={onChangePage} />
                                    </div>
                                </div>
                            </div>
                        </div> }

					</div>
                </div>
            
                {/* Dialog for Schedule module wise info */}
                <Dialog header={ item.executionRequest.configurename + " - Status" } visible={showModuleInfo} style={{ width: '60vw',height:'80rem' }} onHide={() => setShowModuleInfo(false)}><ScheduleContentModuleWise scheduledDate={scheduledDate} configKey={item.configurekey} configName={item.configurename} showScheduledTasks={showScheduledTasks} showRecurringSchedules={showRecurringSchedules} /></Dialog>
                {/* Dialog for Schedule module wise info */}
            </div>
        </>
    );
}
const updateDateTimeValues = (scheduleTableData, setModuleScheduledate) => {
    //setting module date and time props
    let moduleScheduledateTime = {};
    // eslint-disable-next-line
    scheduleTableData.map((rowData)=>{
        if(moduleScheduledateTime[rowData.testsuiteid] === undefined) {
            moduleScheduledateTime[rowData.testsuiteid] = {
                date:"",
                time:"",
                recurringValue: "",
                recurringString: "",
                endAfter: "",
                inputPropstime: {readOnly:"readonly" ,
                    disabled : true,
                    className:"fc-timePicker",
                    placeholder: "Select Time"
                },
                inputPropsdate : {
                    placeholder: "Select Date",
                    readOnly:"readonly" ,
                    className:"fc-datePicker",
                    disabled : true
                },
                inputPropsrecurring: {
                    placeholder: "Select Frequency",
                    readOnly: "readonly",
                    className: "fc-timePicker textbox-container",
                },
                inputPropsEndDate: {readOnly:"readonly" ,
                disabled : true,
                className:"fc-timePicker textbox-container",
                placeholder: "Select End After"
            }
            };
        }
    })
    setModuleScheduledate(moduleScheduledateTime);
}

const cancelThisJob = async (cycleid,scheduledatetime,_id,target,scheduledby,status,getScheduledDetails,displayError,configurekey,configurename) => {
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
        setMsg(MSG.CUSTOM("Job is " + status + ".",VARIANT.SUCCESS));
        // target.innerText = status;
        getScheduledDetails(configurekey, configurename);
    } else if (data === "inprogress") displayError(MSG.SCHEDULE.ERR_JOB_PROGRESS);
    else if (data === "not authorised") displayError(MSG.SCHEDULE.ERR_JOB_CANCEL_AUTH);
    else displayError(MSG.SCHEDULE.ERR_JOB_CANCEL);
}

const SelectBrowserCheck = (appType,browserTypeExe,execAction,displayError,item)=>{ 
    // console.log(item)
    browserTypeExe = browserTypeExe || (item.executionRequest.browserType.length !==0 ? item.executionRequest.browserType : ['1'])
    if ((appType === "Web") && browserTypeExe.length === 0) displayError(MSG.SCHEDULE.WARN_SELECT_BROWSER);
    else if (appType === "Webservice" && browserTypeExe.length === 0) displayError(MSG.SCHEDULE.WARN_SELECT_WEBSERVICE);
    else if (appType === "MobileApp" && browserTypeExe.length === 0) displayError(MSG.SCHEDULE.WARN_SELECT_MOBILE_APP);
    else if (appType === "Desktop" && browserTypeExe.length === 0) displayError(MSG.SCHEDULE.WARN_SELECT_DESKTOP);
    else if (appType === "Mainframe" && browserTypeExe.length === 0) displayError(MSG.SCHEDULE.WARN_SELECT_MAINFRAME);
    else if (appType === "OEBS" && browserTypeExe.length === 0) displayError(MSG.SCHEDULE.WARN_SELECT_OEBS);
    else if (appType === "SAP" && browserTypeExe.length === 0) displayError(MSG.SCHEDULE.WARN_SELECT_SAP);
    else if (appType === "MobileWeb" && browserTypeExe.length === 0) displayError(MSG.SCHEDULE.WARN_SELECT_MOBILE);
    else if (browserTypeExe.length === 0) displayError(MSG.CUSTOM("Please select " + appType + " option", VARIANT.WARNING));
    else if ((appType === "Web") && browserTypeExe.length === 1 && execAction === "parallel") displayError(MSG.SCHEDULE.WARN_SELECT_MULTI_BROWSER);
    else return true;
    return false;
}

const browImg = (brow, appType) => {
    if (appType === "Web") {
        if (parseInt(brow) === 1) return '/imgs/ic-ch-schedule.png';
        else if (parseInt(brow) === 2) return '/imgs/ic-ff-schedule.png';
        else if (parseInt(brow) === 3) return '/imgs/ic-ie-schedule.png';
        else if (parseInt(brow) === 7) return '/imgs/ic-legacy-schedule.png';
        else if (parseInt(brow) === 8) return '/imgs/ic-chromium-schedule.png';
    }
    else if (appType === "Webservice") return '/imgs/webservice.png';
    else if (appType === "MobileApp") return '/imgs/mobileApps.png';
    else if (appType === "System") return '/imgs/desktop.png';
    else if (appType === "Desktop") return '/imgs/desktop.png';
    else if (appType === "SAP") return '/imgs/sapApps.png';
    else if (appType === "Mainframe") return '/imgs/mainframe.png';
    else if (appType === "OEBS") return '/imgs/oracleApps.png';
    else if (appType === "MobileWeb") return '/imgs/MobileWeb.png';
}

const checkSelectedModules = (scheduleTableData, displayError) => {
    let pass = false;
    // eslint-disable-next-line
    scheduleTableData.map((rowData,m)=>{
        const indeterminate = document.getElementById('selectScheduleSuite_' + m).indeterminate;
        const checked = document.getElementById('selectScheduleSuite_' + m).checked;
        if(indeterminate || checked){
            pass = true;
            return null
        } else {}
    })
    if (pass===false) displayError(MSG.SCHEDULE.WARN_SELECT_SCENARIO);
    return pass
} 

const checkDateTimeValues = (eachData, moduleScheduledate, setModuleScheduledate, displayError) => {
    let days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    for(var i =0 ;i<eachData.length;i++){
        for(var j =0 ; j<eachData[i].executestatus.length; j++){
            if(eachData[i].executestatus[j]===1){
                let doNotSchedule = false
                let moduleScheduledateTime = {...moduleScheduledate};
                moduleScheduledateTime[eachData[i].testsuiteid]["inputPropsdate"]["className"]="fc-timePicker";
                moduleScheduledateTime[eachData[i].testsuiteid]["inputPropstime"]["className"]="fc-timePicker";
                moduleScheduledateTime[eachData[i].testsuiteid]["inputPropsrecurring"]["className"] = "fc-timePicker textbox-container";
                moduleScheduledateTime[eachData[i].testsuiteid]["inputPropsEndDate"]["className"]="fc-timePicker textbox-container";

                var dateValue = moduleScheduledate[eachData[i].testsuiteid]["date"];
                var timeValue = moduleScheduledate[eachData[i].testsuiteid]["time"];
                var recurringValue = moduleScheduledate[eachData[i].testsuiteid]["recurringValue"];
                var recurringString = moduleScheduledate[eachData[i].testsuiteid]["recurringString"];
                var recurringStringOnHover = moduleScheduledate[eachData[i].testsuiteid]["recurringStringOnHover"];
                var endAfterValue = moduleScheduledate[eachData[i].testsuiteid]["endAfter"];

                if (recurringValue === "") {
                    // Check if schedule recurring is not empty
                    moduleScheduledateTime[eachData[i].testsuiteid]["inputPropsrecurring"]["className"] = "fc-timePicker textbox-container s__err-Border";
                    doNotSchedule = true;
                } 
                else if (recurringValue == "One Time" && dateValue == "" && timeValue == "") {
                    moduleScheduledateTime[eachData[i].testsuiteid]["inputPropsdate"]["className"] = "fc-datePicker s__err-Border";
                    moduleScheduledateTime[eachData[i].testsuiteid]["inputPropstime"]["className"] = "fc-datePicker s__err-Border";
                    doNotSchedule = true;
                }
                else if (recurringValue != "" && timeValue === "") {
                    moduleScheduledateTime[eachData[i].testsuiteid]["inputPropstime"]["className"] = "fc-datePicker s__err-Border";
                    doNotSchedule = true;
                }
                else if (recurringValue != "" && recurringValue !== "One Time" && timeValue != "" && endAfterValue === "") {
                    moduleScheduledateTime[eachData[i].testsuiteid]["inputPropsEndDate"]["className"] = "fc-datePicker textbox-container s__err-Border";
                    doNotSchedule = true;
                }
                setModuleScheduledate(moduleScheduledateTime);
                if(doNotSchedule) return false

                let currentDate = new Date().toString().split(' ');
                let currentMonth = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(currentDate[1]) / 3 + 1;
                currentDate = currentDate[2] + "-" + ("0"+ currentMonth.toString()).slice(-2) + "-" + currentDate[3]

                const sldate_2 = dateValue ? dateValue.split("-") : currentDate.split('-');
                const sltime_2 = timeValue.split(":");
                const timestamp = new Date(sldate_2[2], (sldate_2[1] - 1), sldate_2[0], sltime_2[0], sltime_2[1]);
                const diff = (timestamp - new Date()) / 60000;
                if (diff < 5 && (recurringString === "One Time" || recurringString === "Every Day" || (recurringString === "Every Week" && (recurringStringOnHover.includes(days[new Date().getDay()]) || recurringStringOnHover === "Occurs every day")) || (recurringString === "Every Month" && (recurringValue.split(' ')[2] == new Date().getDate() || recurringStringOnHover.includes(days[new Date().getDay()]))))) { // Check if schedule time is not ahead of 5 minutes from current time
                    if (recurringValue !== "One Time") {
                        moduleScheduledateTime[eachData[i].testsuiteid]["inputPropstime"]["className"]="fc-timePicker s__err-Border";
                    } else {
                        if (diff < 0) moduleScheduledateTime[eachData[i].testsuiteid]["inputPropsdate"]["className"]="fc-datePicker s__err-Border";
                        moduleScheduledateTime[eachData[i].testsuiteid]["inputPropstime"]["className"]="fc-timePicker s__err-Border";
                    }
                    displayError(MSG.SCHEDULE.WARN_SCHEDULE_TIME);
                    setModuleScheduledate(moduleScheduledateTime);
                    return false
                }
            } 
        }
    }  
    return true  
} 

const parseLogicExecute = (schedulePoolDetails, moduleScheduledate, eachData, current_task, appType, projectdata ) => {
    let moduleInfo = [];
    var j;
    for(var i =0 ;i<eachData.length;i++){
        var testsuiteDetails = current_task.testSuiteDetails[i];
        var suiteInfo = {};
        var selectedRowData = [];
        var relid = testsuiteDetails.releaseid;
        var cycid = testsuiteDetails.cycleid;
        var projectid = testsuiteDetails.projectidts;
        
        for(j =0 ; j<eachData[i].executestatus.length; j++){
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
        suiteInfo.batchname = eachData[i].batchname;
        suiteInfo.domainName = (projectid in projectdata.project) ? projectdata.project[projectid].domain : testsuiteDetails.domainName;
        suiteInfo.projectName = (projectid in projectdata.projectDict) ? projectdata.projectDict[projectid] : testsuiteDetails.projectName;
        suiteInfo.projectId = projectid;
        suiteInfo.releaseId = relid;
        suiteInfo.cycleName = (cycid in projectdata.cycleDict) ? projectdata.cycleDict[cycid] : testsuiteDetails.cycleName;
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
        for(j =0 ; j<eachData[i].executestatus.length; j++){
            if(eachData[i].executestatus[j]===1){
                suiteInfo.date = moduleScheduledate[eachData[i].testsuiteid]["date"];
                suiteInfo.time = moduleScheduledate[eachData[i].testsuiteid]["time"];
                const sldate_2 = suiteInfo.date.split("-");
                const sltime_2 = suiteInfo.time.split(":");
                const timestamp = new Date(sldate_2[2], (sldate_2[1] - 1), sldate_2[0], sltime_2[0], sltime_2[1]);
                suiteInfo.timestamp = timestamp.valueOf().toString();
                suiteInfo.recurringValue = moduleScheduledate[eachData[i].testsuiteid]["recurringValue"];
                suiteInfo.recurringString = moduleScheduledate[eachData[i].testsuiteid]["recurringString"];
                suiteInfo.recurringStringOnHover = moduleScheduledate[eachData[i].testsuiteid][	"recurringStringOnHover"];
                suiteInfo.endAfter = moduleScheduledate[eachData[i].testsuiteid]["endAfter"];
                suiteInfo.clientTime = moduleScheduledate[eachData[i].testsuiteid]["clientTime"];
                suiteInfo.clientTimeZone = moduleScheduledate[eachData[i].testsuiteid]["clientTimeZone"];
            } 
        }
        if(selectedRowData.length !== 0) moduleInfo.push(suiteInfo);
    }
    return moduleInfo;
}

export default ScheduleContent;