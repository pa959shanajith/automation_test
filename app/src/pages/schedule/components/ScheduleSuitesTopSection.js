import React, { useEffect, useState } from 'react';
import { ScrollBar, CalendarComp, TimeComp, RecurrenceComp} from '../../global'
import {readTestSuite_ICE} from '../api';
import "../styles/ScheduleSuitesTopSection.scss";

const ScheduleSuitesTopSection = ({setModuleScheduledate, moduleScheduledate, current_task, displayError, setLoading, scheduleTableData, setScheduleTableData, closePopups, setClosePopups}) => {

    const [closeCal, setCloseCal] = useState(false);
    
    useEffect(()=>{
        if (Object.keys(current_task).length!==0){
        let readTestSuite = current_task.testSuiteDetails;
            if(typeof readTestSuite === "string") readTestSuite = JSON.parse(current_task.testSuiteDetails);
            for (var rti = 0; rti < readTestSuite.length; rti++) {
                readTestSuite[rti].versionnumber = parseFloat(current_task.versionnumber);
            }
            readTestSuiteFunct(readTestSuite);
        }
        // eslint-disable-next-line
    }, [current_task]);

    useEffect(()=>{
        if (closePopups) {
            setCloseCal(true);
            setClosePopups(false);
        }
    }, [closePopups])

    const readTestSuiteFunct = async (readTestSuite) => {
        setLoading("Loading in Progress. Please Wait");
        const result = await readTestSuite_ICE(readTestSuite, "schedule")
        if(result.error){displayError(result.error);return;}
        else if (result.testSuiteDetails) {
            var data = result.testSuiteDetails;
            var keys = Object.keys(data);
            var tableData = [];
            keys.map(itm => tableData.push({...data[itm]}));

            //setting module date and time props
            let moduleScheduledateTime = {};
            // eslint-disable-next-line
            tableData.map((rowData)=>{
                if(moduleScheduledateTime[rowData.testsuiteid] === undefined) {
                    moduleScheduledateTime[rowData.testsuiteid] = {
                        date:"",time:"",recurringValue: "",recurringString: "",recurringStringOnHover: "",
                        inputPropstime: {readOnly:"readonly" ,
                            disabled : true,
                            className:"fc-timePicker",
                            placeholder: "Select Time",
                            title: "Select Time"
                        },
                        inputPropsdate : {
                            placeholder: "Select Date",
                            readOnly:"readonly" ,
                            disabled: true,
                            className:"fc-datePicker",
                            title:"Select Date"
                        },
                        inputPropsrecurring: {
                          placeholder: "Select Frequency",
                          readOnly: "readonly",
                          disabled: false,
                          className: "fc-timePicker textbox-container",
                          title: "Select Frequency",
                      },
                    };
                }
            })

            //CR 2287 - If a scenario is opened and then navigated to it's scheduling then by default that particular scenario must be selected and rest of the scenarios from the module must be unselected.
            if (current_task.scenarioFlag === 'True') {
                for (var m = 0; m < keys.length; m++) {
                    for (var k = 0; k < tableData[m].scenarioids.length; k++) {
                        if (tableData[m].scenarioids[k] === current_task.assignedTestScenarioIds || tableData[m].scenarioids[k] === current_task.assignedTestScenarioIds[0]) {
                            tableData[m].executestatus[k] = 1;
                        } else tableData[m].executestatus[k] = 0;
                    }
                }
            }
            setModuleScheduledate(moduleScheduledateTime);
            setScheduleTableData(tableData);
            updateScenarioStatus(tableData);
        }
        setLoading(false);
    }
    
    const changeSelectALL = (m,id) => {
        let data = [...scheduleTableData];
        var checkBox = document.getElementById(id);
        let temp = 1; if(checkBox.checked!==true) temp = 0;
        let newExecutestatus = [];
        for(var i =0;i<data[m].scenarioids.length;i++) newExecutestatus.push(temp);
        data[m].executestatus=newExecutestatus;
        setScheduleTableData(data);
        document.getElementById(id).indeterminate = false;
    }
    
    const updateScenarioStatus = (eachData1) => {
        // eslint-disable-next-line
        eachData1.map((rowData,m)=>{
            // eslint-disable-next-line
            rowData.scenarioids.map((sid,count)=>{
                changeExecutestatusInitial(eachData1,m);
            })
        })
    }

    const changeExecutestatusInitial = (eachData1,m) => {
        let zeroExist = eachData1[m].executestatus.includes(0);
        let oneExist = eachData1[m].executestatus.includes(1);
        if(!document.getElementById('selectScheduleSuite_' + m)) return;
        if(zeroExist ===true && oneExist === true) document.getElementById('selectScheduleSuite_' + m).indeterminate = true;
        else if (zeroExist ===false && oneExist === true) {
            document.getElementById('selectScheduleSuite_' + m).indeterminate = false;
            document.getElementById('selectScheduleSuite_' + m).checked = true;
        }
        else if (zeroExist ===true && oneExist === false) {
            document.getElementById('selectScheduleSuite_' + m).indeterminate = false;
            document.getElementById('selectScheduleSuite_' + m).checked = false;
        }
    }

    const changeExecutestatus = (m,count) => {
        let data = [...scheduleTableData];
        var temp = 0;
        if(scheduleTableData[m].executestatus[count] === 0) temp = 1;
        data[m].executestatus[count]=temp;

        let zeroExist = data[m].executestatus.includes(0);
        let oneExist = data[m].executestatus.includes(1);

        if(zeroExist ===true && oneExist === true) document.getElementById('selectScheduleSuite_' + m).indeterminate = true;
        else if (zeroExist ===false && oneExist === true) {
            document.getElementById('selectScheduleSuite_' + m).indeterminate = false;
            document.getElementById('selectScheduleSuite_' + m).checked = true;
        }
        else if (zeroExist ===true && oneExist === false) {
            document.getElementById('selectScheduleSuite_' + m).indeterminate = false;
            document.getElementById('selectScheduleSuite_' + m).checked = false;
        }
        setScheduleTableData(data);
    }

    const updateDateTime = (date_time, value , testsuiteid) => {
        let moduleScheduledateTime = {...moduleScheduledate}
        if(moduleScheduledateTime[testsuiteid] === undefined) {
            moduleScheduledateTime[testsuiteid] = {date:"",time:"",recurringValue: "", recurringString: "", recurringStringOnHover: ""};
        }
        if(date_time==="date"){
            moduleScheduledateTime[testsuiteid]["date"] = value;
            if(moduleScheduledateTime[testsuiteid]["time"] === "") {
                var hr = new Date().getHours();
                var min = parseInt(new Date().getMinutes());
                if(new Date().getHours().toString().length === 1) hr = "0"+hr;
                if(parseInt(new Date().getMinutes()).toString().length === 1) min = "0"+min;
                moduleScheduledateTime[testsuiteid]["time"] = hr  + ':' + min;
            }
            moduleScheduledateTime[testsuiteid]["inputPropstime"]["disabled"]=false;
        }
        else if(date_time==="time"){
            moduleScheduledateTime[testsuiteid]["time"] = value;
        }
        else if (date_time === "recurringValue") {
            moduleScheduledateTime[testsuiteid]["date"] = "";
            moduleScheduledateTime[testsuiteid]["time"] = "";
            moduleScheduledateTime[testsuiteid]["recurringValue"] = value;
            if (moduleScheduledateTime[testsuiteid]["recurringValue"] == "One Time") {
                moduleScheduledateTime[testsuiteid]["inputPropsdate"][
                      "disabled"
                ] = false;
                if (moduleScheduledateTime[testsuiteid]["date"] != "") {
                    moduleScheduledateTime[testsuiteid]["inputPropstime"][
                        "disabled"
                    ] = false;
                    if (moduleScheduledateTime[testsuiteid]["time"] === "") {
                        var hr = new Date().getHours();
                        var min = parseInt(new Date().getMinutes());
                        if (new Date().getHours().toString().length === 1)
                            hr = "0" + hr;
                        if (parseInt(new Date().getMinutes()).toString().length === 1)
                            min = "0" + min;
                        moduleScheduledateTime[testsuiteid]["time"] = hr + ":" + min;
                    }
                }
                else {
                    moduleScheduledateTime[testsuiteid]["inputPropstime"][
                        "disabled"
                    ] = true;
                }
            }
            else {
                if (moduleScheduledateTime[testsuiteid]["recurringValue"] != '') {
                    moduleScheduledateTime[testsuiteid]["date"] = "";
                    moduleScheduledateTime[testsuiteid]["time"] = "";
                    moduleScheduledateTime[testsuiteid]["inputPropsdate"][
                        "disabled"
                    ] = true;
                    if (moduleScheduledateTime[testsuiteid]["time"] === "") {
                        var hr = new Date().getHours();
                        var min = parseInt(new Date().getMinutes());
                        if (new Date().getHours().toString().length === 1)
                            hr = "0" + hr;
                        if (parseInt(new Date().getMinutes()).toString().length === 1)
                            min = "0" + min;
                        moduleScheduledateTime[testsuiteid]["time"] = hr + ":" + min;
                    }
                    moduleScheduledateTime[testsuiteid]["inputPropstime"][
                        "disabled"
                    ] = false;
                }
                else {
                    moduleScheduledateTime[testsuiteid]["date"] = "";
                    moduleScheduledateTime[testsuiteid]["time"] = "";
                    moduleScheduledateTime[testsuiteid]["inputPropsdate"][
                        "disabled"
                    ] = true;
                    moduleScheduledateTime[testsuiteid]["inputPropstime"][
                        "disabled"
                    ] = true;
                }
            }
        }
        else if (date_time === "recurringString") {
            moduleScheduledateTime[testsuiteid]["recurringString"] = value;
            if (moduleScheduledateTime[testsuiteid]["recurringString"] != "One Time") {
                moduleScheduledateTime[testsuiteid]["inputPropsdate"][
                    "disabled"
                ] = true;
                moduleScheduledateTime[testsuiteid]["time"] = "";
                moduleScheduledateTime[testsuiteid]["inputPropstime"][
                    "disabled"
                ] = true;
            }
        }
        else if (date_time === "recurringStringOnHover") {	
            moduleScheduledateTime[testsuiteid]["recurringStringOnHover"] =	value;	
        }
        setModuleScheduledate(moduleScheduledateTime);
    }

    return (
        <>
        <div className="scheduleSuiteTable">
            <div className="s__ab">
                <div className="s__min">
                    <div className="s__con" id="schSuiteTable">
                        <ScrollBar scrollId="schSuiteTable" thumbColor="#321e4f" trackColor="rgb(211, 211, 211)" onScrollY={()=>setCloseCal(true)}>
                        {scheduleTableData.map((rowData,i)=>(
                            <div key={i} className="batchSuite">
                                <div className="scheduleSuite" id={`ss-id${i}`} >
                                    <input type="checkbox" onChange={(event)=>{changeSelectALL(i,"selectScheduleSuite_"+i)}} id={"selectScheduleSuite_"+i} className="selectScheduleSuite" />
                                    <span className="scheduleSuiteName" data-testsuiteid= {rowData.testsuiteid}>{rowData.testsuitename}</span>
                                    <TimeComp idx={i} closeCal={closeCal} setCloseCal={setCloseCal} screen="scheduleSuiteTop" time={moduleScheduledate[rowData.testsuiteid]["time"]} setTime={(val)=>{updateDateTime("time",val,rowData.testsuiteid)}} inputProps={moduleScheduledate[rowData.testsuiteid]["inputPropstime"]} disabled={moduleScheduledate[rowData.testsuiteid]["inputPropstime"].disabled} classTimer="schedule_timer"/>
                                    <CalendarComp idx={i} closeCal={closeCal} setCloseCal={setCloseCal} screen="scheduleSuiteTop" inputProps={moduleScheduledate[rowData.testsuiteid]["inputPropsdate"]} disabled={moduleScheduledate[rowData.testsuiteid]["inputPropsdate"].disabled} date={moduleScheduledate[rowData.testsuiteid]["date"]} setDate={(val)=>{updateDateTime("date",val,rowData.testsuiteid)}} classCalender="schedule_calender"/>
                                    <RecurrenceComp closeCal={closeCal} setCloseCal={setCloseCal} placeholder={moduleScheduledate[rowData.testsuiteid]["inputPropsrecurring"].placeholder} classname={moduleScheduledate[rowData.testsuiteid]["inputPropsrecurring"].className} readonly={moduleScheduledate[rowData.testsuiteid]["inputPropsrecurring"].readOnly } title={moduleScheduledate[rowData.testsuiteid]["recurringStringOnHover"]} disabled={moduleScheduledate[rowData.testsuiteid]["inputPropsrecurring"].disabled } recur={moduleScheduledate[rowData.testsuiteid]["recurringString"]} setRecurringString={(val) => {updateDateTime("recurringString", val, rowData.testsuiteid)}} setRecurringStringOnHover={(val) => {updateDateTime("recurringStringOnHover", val, rowData.testsuiteid)}} setRecurringValue={(val) => {updateDateTime("recurringValue", val, rowData.testsuiteid)}} classTimer="schedule_timer" />
                                </div>
                                <table className="scenarioSchdCon scenarioSch_' + i + '">
                                    <thead className="scenarioHeaders">
                                        <tr><td>Sl No.</td><td>Scenario Name</td><td>Data Parameterization</td><td>Condition Check</td><td>Project Name</td><td>App type</td></tr>
                                    </thead>
                                    <tbody className="scenarioBody scenarioTbCon_' + i + '">
                                    {rowData.scenarioids.map((sid,j)=>(
                                        <tr key={j}>
                                            <td><span>{j+1}</span><input type="checkbox" checked={rowData.executestatus[j]?true:false}  onChange={()=>{changeExecutestatus(i,j)}} id={"executestatus_"+i+"_"+j} className="selectToSched"/></td>
                                            <td data-scenarioid={sid}>{rowData.scenarionames[j]}</td>
                                            <td style={{padding: "2px 0 2px 0"}}><input type="text" value={(rowData.dataparam[j]).trim()} disabled/></td>
                                            <td><select disabled defaultValue={(rowData.condition[j] === 0) ? "0" : "1"} ><option value="1" >True</option><option value="0" >False</option></select></td>
                                            <td>{rowData.projectnames[j]}</td> 
                                            <td title={details[rowData.apptypes[j].toLowerCase()]['data']}>
                                                <img src={"static/imgs/"+details[rowData.apptypes[j].toLowerCase()]['img']+".png"} alt="apptype"/>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                        </ScrollBar>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

var details = {
    web:{"data":"Web","title":"Web","img":"web"},
    "webservice":{"data":"Webservice","title":"Web Service","img":"webservice"},
    "desktop":{"data":"Desktop","title":"Desktop Apps","img":"desktop"},
    "oebs":{"data":"OEBS","title":"Oracle Apps","img":"oracleApps"},
    "mobileapp":{"data":"MobileApp","title":"Mobile Apps","img":"mobileApps"},
    "mobileweb":{"data":"MobileWeb","title":"Mobile Web","img":"mobileWeb"},
    "sap":{"data":"SAP","title":"SAP Apps","img":"sapApps"},
    "system":{"data":"System","title":"System Apps","img":"desktop"},
    "mainframe":{"data":"Mainframe","title":"Mainframe","img":"mainframe"}
};

export default ScheduleSuitesTopSection;