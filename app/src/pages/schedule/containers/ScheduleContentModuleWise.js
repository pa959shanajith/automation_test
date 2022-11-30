import React, {useState, useEffect } from 'react';
import {ScreenOverlay, ScrollBar, IntegrationDropDown, Messages as MSG, VARIANT, setMsg} from '../../global' 
import { useSelector } from 'react-redux';
import {getScheduledDetailsOnDate_ICE, cancelScheduledJob_ICE} from '../api';
import "../styles/ScheduleContentModuleWise.scss";
import Pagination from '../components/Pagination';

const ScheduleContentModuleWise = ({scheduledDate, configKey, configName, showScheduledTasks, showRecurringSchedules}) => {

    const nulluser = "5fc137cc72142998e29b5e63";
    const dateFormat = useSelector(state=>state.login.dateformat);
    const [loading,setLoading] = useState(false);
    const [scheduledData,setScheduledData] = useState([]);
    const [scheduledDataOriginal,setScheduledDataOriginal] = useState([]);
    const [pageOfItems,setPageOfItems] = useState([]);
    const [scheduledRecurringData, setScheduledRecurringData] = useState([]);	
    const [scheduledRecurringDataOriginal, setScheduledRecurringDataOriginal] =	useState([]);

    useEffect(()=>{
        getScheduledDetails(scheduledDate, configKey, configName);
    }, []);


    const getScheduledDetails = async (scheduledDate, configKey, configName) => {
        try{
            setLoading('Loading...');
            const result = await getScheduledDetailsOnDate_ICE(scheduledDate, configKey, configName);
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
                var eachScenarioDetails;
                for(var i =result.length-1 ; i>=0  ; i-- ) {
                    eachScenarioDetails = result[i].scenariodetails[0].length>1 ? result[i].scenariodetails[0] : result[i].scenariodetails;
                    eachScenarioDetails = result[i].scenariodetails;
                    for(var j =eachScenarioDetails.length-1 ; j>=0  ; j-- ) {
                        for (var k=eachScenarioDetails[j].length-1 ; k>=0 ; k-- ) {
                            let newScheduledScenario = {};
                            let columnValue = eachScenarioDetails[j][k];
                            newScheduledScenario["target"] = result[i].target;
                            newScheduledScenario["scheduletype"] = result[i].scheduletype ? result[i].scheduletype : "One Time";
                            newScheduledScenario["recurringpattern"] = result[i].recurringpattern ? result[i].recurringpattern : "One Time";	
                            newScheduledScenario["recurringstringonhover"] = result[i].recurringstringonhover ? result[i].recurringstringonhover : "One Time";
                            newScheduledScenario["scheduledby"] = result[i].scheduledby;
                            newScheduledScenario["scheduledatetime"] = result[i].scheduledatetime;
                            newScheduledScenario["startdatetime"] = result[i].startdatetime;
                            newScheduledScenario["testsuitenames"] = [result[i].testsuitenames[j]];
                            newScheduledScenario["browserlist"] = result[i].browserlist;
                            newScheduledScenario["_id"] = result[i]._id;
                            newScheduledScenario["status"] = result[i].status;
                            newScheduledScenario["scenarioname"] = columnValue["scenarioname"];
                            newScheduledScenario["appType"] = columnValue["appType"];
                            newScheduledScenario["poolname"] =  result[i].poolname ? result[i].poolname : 'Unallocated ICE';
                            newScheduledScenario["cycleid"] = columnValue["cycleid"];
                            scheduledDataParsed.push(newScheduledScenario);
                         }
                     }
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

    const onChangePage = (newPageOfItems) => {
        // update state with new page of items
        if(JSON.stringify(pageOfItems) !== JSON.stringify(newPageOfItems))
            setPageOfItems(newPageOfItems);
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
           <div id="scheduleSuitesBottomSection">

                    <div className="scheduleDataTable">
						<div className="scheduleDataHeader">
                            <span className="s__Table_suite s__table_Textoverflow s__Table_border" >Test Suite</span>
							<span className="s__Table_scenario s__table_Textoverflow s__Table_border" >Scenario Name</span>
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
                                                                {/* <div data-test = "schedule_data_date" className="s__Table_date s__Table_date-time " title={"Job created on: " +formatDate(data.startdatetime).toString()}>{formatDate(data.scheduledatetime)}</div>
                                                                <div data-test = "schedule_data_target_user" className="s__Table_host" title={"Ice Pool: " +data.poolname}>{data.target === nulluser?'Pool: '+ (data.poolname?data.poolname:'Unallocated ICE'):data.target}</div> */}
                                                                <div data-test = "schedule_data_date_suite_name" className="s__Table_suite" title={data.testsuitenames[0]} >{data.testsuitenames[0]}</div>
                                                                <div data-test = "schedule_data_scenario_name" className="s__Table_scenario" title={data.scenarioname}>{data.scenarioname}</div>
                                                                {/* <div data-test = "schedule_data_browser_type" className="s__Table_appType">
                                                                    {data.browserlist.map((brow,index)=>(
                                                                        <img key={index} src={"static/"+browImg(brow,data.appType)} alt="apptype" className="s__Table_apptypy_img "/>
                                                                    ))}
                                                                </div>
                                                                <div data-test="schedule_data_schedule_type" className="s__Table_scheduleType" title={data.recurringstringonhover}>   
                                                                    { data.scheduletype ? data.scheduletype : "One Time"}
                                                                </div> */}
                                                                <div data-test = "schedule_data_status" className="s__Table_status"  data-scheduledatetime={data.scheduledatetime.valueOf().toString()}>
                                                                    <span style={{color: `rgb(100, 54, 147)`, cursor: 'pointer', fontWeight: 'bold'}}>{data.status === "Terminate" ? "Terminated" : data.status}</span>
                                                                    {/* {(data.status === 'scheduled' || data.status === "recurring")?
                                                                        <span className="fa fa-close s__cancel" onClick={()=>{cancelThisJob(data.cycleid,data.scheduledatetime,data._id,data.target,data.scheduledby,"cancelled",getScheduledDetails,displayError)}} title='Cancel Job'/>
                                                                    :null} */}
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
                                                                {/* <div data-test = "schedule_data_date" className="s__Table_date s__Table_date-time " title={"Job created on: " +formatDate(data.startdatetime).toString()}>{formatDate(data.scheduledatetime)}</div>
                                                                <div data-test = "schedule_data_target_user" className="s__Table_host" title={"Ice Pool: " +data.poolname}>{data.target === nulluser?'Pool: '+ (data.poolname?data.poolname:'Unallocated ICE'):data.target}</div> */}
                                                                <div data-test = "schedule_data_date_suite_name" className="s__Table_suite" title={data.testsuitenames[0]} >{data.testsuitenames[0]}</div>
                                                                <div data-test = "schedule_data_scenario_name" className="s__Table_scenario" title={data.scenarioname}>{data.scenarioname}</div>
                                                                {/* <div data-test = "schedule_data_browser_type" className="s__Table_appType">
                                                                    {data.browserlist.map((brow,index)=>(
                                                                        <img key={index} src={"static/"+browImg(brow,data.appType)} alt="apptype" className="s__Table_apptypy_img "/>
                                                                    ))}
                                                                </div>
                                                                <div data-test="schedule_data_schedule_type" className="s__Table_scheduleType" title={data.recurringstringonhover}>   
                                                                    { data.scheduletype ? data.scheduletype : "One Time"}
                                                                </div> */}
                                                                <div data-test = "schedule_data_status" className="s__Table_status"  data-scheduledatetime={data.scheduledatetime.valueOf().toString()}>
                                                                    <span style={{color: `rgb(100, 54, 147)`, cursor: 'pointer', fontWeight: 'bold'}}>{data.status === "Terminate" ? "Terminated" : data.status}</span>
                                                                    {/* {(data.status === 'scheduled' || data.status === "recurring")?
                                                                        <span className="fa fa-close s__cancel" onClick={()=>{cancelThisJob(data.cycleid,data.scheduledatetime,data._id,data.target,data.scheduledby,"cancelled",getScheduledDetails,displayError)}} title='Cancel Job'/>
                                                                    :null} */}
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
        </>
    )
};

const cancelThisJob = async (cycleid,scheduledatetime,_id,target,scheduledby,status,getScheduledDetails,displayError) => {
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
        getScheduledDetails();
    } else if (data === "inprogress") displayError(MSG.SCHEDULE.ERR_JOB_PROGRESS);
    else if (data === "not authorised") displayError(MSG.SCHEDULE.ERR_JOB_CANCEL_AUTH);
    else displayError(MSG.SCHEDULE.ERR_JOB_CANCEL);
}

export default ScheduleContentModuleWise;