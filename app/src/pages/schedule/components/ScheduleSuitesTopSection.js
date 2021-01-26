import React, {useState, useEffect } from 'react';
import {ScreenOverlay, RedirectPage , ScrollBar} from '../../global' 
import Datetime from "react-datetime";
import moment from "moment";
import {readTestSuite_ICE} from '../api';
import { useHistory } from 'react-router-dom';
import "../styles/ScheduleSuitesTopSection.scss";

const ScheduleSuitesTopSection = ({setModuleSceduledate, moduleSceduledate, current_task, filter_data, scheduleTableData, setScheduleTableData}) => {
    
    const history = useHistory();
    const [loading,setLoading] = useState(false)
    const [projectAppType,setProjectApptype] = useState({})
    
    useEffect(()=>{
        if (Object.keys(current_task).length!==0){
        let readTestSuite = current_task.testSuiteDetails;
            if(typeof readTestSuite === "string") readTestSuite = JSON.parse(current_task.testSuiteDetails);
            for (var rti = 0; rti < readTestSuite.length; rti++) {
                readTestSuite[rti].versionnumber = parseFloat(current_task.versionnumber);
            }
            readTestSuiteFunct(readTestSuite);
        }
    }, [current_task]);

    const readTestSuiteFunct = async (readTestSuite) => {
        setLoading("Loading in Progress. Please Wait");
        const result = await readTestSuite_ICE(readTestSuite, "schedule")
        setLoading(false);
        if (result == "Invalid Session")
            return RedirectPage(history);
        else if (result.testSuiteDetails) {
            var data = result.testSuiteDetails;
            var keys = Object.keys(data);
            var dataLen = keys.length;
            var eachData2 = [];
            keys.map(itm => eachData2.push({...data[itm]}));

            //finding distinct projects : helpful for apptype column
            var flags = [], output = [];
            for(var j=0; j<eachData2.length; j++) {
                for(var i=0; i<eachData2[j].projectnames.length; i++) {
                    if( flags[eachData2[j].projectnames[i]]) continue;
                    flags[eachData2[j].projectnames[i]] = true;
                    output.push(eachData2[j].projectnames[i]);
                }
            }
            var projectApptype = {};
            keys.map(itm => {
                for(var i =0 ; i<output.length; i++){
                    for( const [key,value] of Object.entries(filter_data.projectDict)){
                        if(output[i] === value){
                            projectApptype[output[i]]= Object.keys(filter_data.project[key].appType)[0];
                        } 
                    }
                }
            });
            setProjectApptype(projectApptype);
            setScheduleTableData(eachData2);
            updateScenarioStatus(eachData2);
        }
    }

    let inputProps = {
		placeholder: "Select Date",
		readOnly:"readonly" ,
		className:"fc-datePicker"
    };

    let inputProps1 = {
		placeholder: "Select Time",
		readOnly:"readonly" ,
		// disabled : inputProps1Disable,
        className:"fc-timePicker"
    };
    
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
        eachData1.map((rowData,m)=>{
            rowData.scenarioids.map((sid,count)=>{
                changeExecutestatusInitial(eachData1,m);
            })
        })
    }

    const changeExecutestatusInitial = (eachData1,m) => {
        let zeroExist = eachData1[m].executestatus.includes(0);
        let oneExist = eachData1[m].executestatus.includes(1);

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
        if(moduleSceduledate[testsuiteid] === undefined) {
            moduleSceduledate[testsuiteid] = ["",""];
        }
        if(date_time==="date"){
            moduleSceduledate[testsuiteid][0] = value;
        }
        if(date_time==="time"){
            moduleSceduledate[testsuiteid][1] = value;
        }
        setModuleSceduledate(moduleSceduledate);
    }

    return (
        <>
        {loading?<ScreenOverlay content={loading}/>:null}
        <div className="scheduleSuiteTable">
            <ScrollBar thumbColor="#929397" trackColor="rgb(211, 211, 211)">
            {scheduleTableData.map((rowData,i)=>(
                <div className="batchSuite">
                    <div className="scheduleSuite" >
                        <input type="checkbox" onChange={(event)=>{changeSelectALL(i,"selectScheduleSuite_"+i)}} id={"selectScheduleSuite_"+i} className="selectScheduleSuite" />
                        <span className="scheduleSuiteName" data-testsuiteid= {rowData.testsuiteid}>{rowData.testsuitename}</span>
                        <span className="timePicContainer">
                            <Datetime 
                                onChange={(event)=>{updateDateTime("time",event.format("HH:mm" ),rowData.testsuiteid)}} 
                                inputProps={inputProps1} 
                                dateFormat={false} 
                                timeFormat="HH:mm" 
                            /> 
                            <img className="timepickerIcon" src={"static/imgs/ic-timepicker.png"} alt="timepicker" />
						</span>
                        <span className="datePicContainer datePic-cust" >
                            <Datetime 
                                onChange={(event)=>{updateDateTime("date",event.format("DD-MM-YYYY"),rowData.testsuiteid)}} 
                                dateFormat="DD-MM-YYYY" 
                                closeOnSelect={true} 
                                inputProps={inputProps} 
                                timeFormat={false} 
                                id="data-token"
                                isValidDate={valid}
                            /> 
                            <img className="datepickerIcon" src={"static/imgs/ic-datepicker.png"} alt="datepicker" />
						</span>
                        
                    </div>
                    <table className="scenarioSchdCon scenarioSch_' + i + '">
                        <thead className="scenarioHeaders">
                            <tr><td>Sl No.</td><td>Scenario Name</td><td>Data Parameterization</td><td>Condition Check</td><td>Project Name</td><td>App type</td></tr>
                        </thead>
                        <tbody className="scenarioBody scenarioTbCon_' + i + '">
                        {rowData.scenarioids.map((sid,j)=>(
                            <tr>
                                <td><span>{j+1}</span><input type="checkbox" checked={rowData.executestatus[j]?true:false}  onChange={()=>{changeExecutestatus(i,j)}} id={"executestatus_"+i+"_"+j} className="selectToSched"/></td>
								<td data-scenarioid={sid}>{rowData.scenarionames[j]}</td>
								<td style={{padding: "2px 0 2px 0"}}><input type="text" value={rowData.dataparam[j]} disabled/></td>
								<td><select disabled><option value="1" selected={(rowData.condition[j] == 0) ? '' : 'selected'} >True</option><option value="0" selected={(rowData.condition[j] == 0) ? 'selected' : '' }>False</option></select></td>
								<td>{rowData.projectnames[j]}</td> 
                                <td title={rowData.projectnames[j]}>
                                    <img src={"static/imgs/"+details[projectAppType[rowData.projectnames[j]].toLowerCase()]['img']+".png"} alt="apptype"/>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ))}
            
        </ScrollBar>
        </div>
        </>
    );
}

function valid(current) {
    const yesterday = moment().subtract(1, "day");
    return current.isAfter(yesterday);
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