import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { setMsg, Messages as MSG, VARIANT, Header } from '../../global';
// import ModuleSelection from '../components/ModuleSelection';
import ExecutionsContainer from './ExecutionsContainer';
// import { SearchDropdown, TextField } from '@avo/designcomponents';
import { fetchReportMeta, fetchOpenModuleData, getOpenfetchScenarioInfoDevOps, publicViewReport, getFunctionalReportsDevops} from '../api';
import { prepareOptionLists, prepareModuleList, getFunctionalBarChartValues, prepareExecutionCard, prepareBatchExecutionCard, prepareLogData } from '../containers/ReportUtils';
import "../styles/FunctionalTesting.scss";
import {hideOverlay} from '../reportSlice';
import { InputText } from 'primereact/inputtext';


const DevOpsReport = props => {

    const [reportData, setReportData] = useState({hasData: false, projectid: '',projectname: '', releaseid: '', cycleid: "", cyclename: '', testsuiteid: '', testsuitename: ''});
    const dispatch = useDispatch();
    const urlParams={};
    const params = window.location.search.substring(1);
    params.split('&').forEach((param) => {
        const vars = param.split('=');
        urlParams[vars[0]] = vars[1];
    })
 
    const [dataDict, setDict] = useState({});
    const [selectValues, setSelectValues] = useState([
        { type: 'proj', label: 'Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
        { type: 'rel', label: 'Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
        { type: 'cyc', label: 'Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
        { type: 'mod', label: 'Batch/Module', emptyText: 'No Batch/Module Found', list: [], selected: '', width: '25%', disabled: true, selectedName: '' },
    ]);
    const [executionList, setExecutionList] = useState([]);
    const [selectedExecution, setSelectedExecution] = useState({ id: "", name: "" });
    const [scenarioList, setScenarioList] = useState([]);
    const [BarChartProps, setBarChartProps] = useState({ legends: [{text: "", color: ""}], values: {} });
    const [logPath, setLogPath] = useState("");
    const [logData, setLogData] = useState({});
    const [moduleList, setModuleList] = useState([]);
    const [ urlExecutionList, setUrlExecutionList] = useState([]);

    const hoverUtils = [
        { img: 'static/imgs/json-report.png', onClick: (item, util)=> onExportClick(item, util), type: 'json', title: "Export JSON" },
        { img: 'static/imgs/web-icon.png', onClick: (item)=> onWebClick(item), title: "View HTML Report" },
        { img: 'static/imgs/pdf-report.png', onClick: (item, util)=>onExportClick(item, util), type: 'pdf', title: "Export PDF without screenshots"  },
        { img: 'static/imgs/pdf-with-picture.png', onClick: (item, util)=>onExportClick(item, util), type: 'pdf_ss', title: "Export PDF with screenshots"  }
    ]

    
    const onWebClick = ({reportid, testscenarioid}) => async() => {
        const win = window.open(`/viewReports?reportID=${reportid}&execution=${testscenarioid}&downloadLevel=testCase&viewReport=true`, "_blank"); 
        win.focus();
        localStorage['executionReportId'] = reportid;
        localStorage['logData'] = JSON.stringify(logData[testscenarioid]);
        localStorage['logPath'] = logPath;
        localStorage['reportPage'] = "functionalTest";
    }

    const onExportClick = ({testscenarioname, reportid}, util) => async() => {
        let reportType = util.type;
        let screenshotFlag = false;
        if (reportType === "pdf_ss") {
            reportType = "pdf";
            screenshotFlag = true;
        }
        let reportID = reportid;
        let scName = testscenarioname;
        
        let data =  await publicViewReport(reportID, reportType, screenshotFlag, "testCase");

        if (data.error) {
            console.error(data.error);
            setMsg(MSG.REPORT.ERR_EXPORT_REPORT);
        }
        else {
            if (reportType === "json") data = JSON.stringify(data, undefined, 2);

            let filedata = new Blob([data], { type: "application/"+reportType+";charset=utf-8" });

            if (window.navigator.msSaveOrOpenBlob) window.navigator.msSaveOrOpenBlob(filedata, scName);
            else {
                let a = document.createElement('a');
                a.href = URL.createObjectURL(filedata);
                a.download = scName;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(a.href);
                document.body.removeChild(a);
            }

            setMsg(MSG.REPORT.SUCC_EXPORT_REPORT);
        }
    }

   
  
    const newExecutionList = [];
    useEffect( async () => {
       fetchFunctionalReports(urlParams.configurekey,urlParams.executionListId,''); 
       dispatch(hideOverlay());
    },[]);

    const fetchFunctionalReports = async(projId, relName, cycId) => {
        const reportResponse = await getFunctionalReportsDevops(urlParams.configurekey,urlParams.executionListId,''); //getReportsData_ICE
        if(reportResponse.error){
            console.error(reportResponse.error);
            setMsg(MSG.REPORT.ERR_FETCH_MODULES);
        }
        else {
            const newModuleList = prepareModuleList(reportResponse.rows); 
            setModuleList(newModuleList);
            if(newModuleList.length > 0) {
                newModuleList.map((module) => {
                    fetchModuleInfo(module.key,'module', module.text,newModuleList.length);
                });
            }             
            const newSelectValues = [...selectValues];
            newSelectValues[3].list = newModuleList;

            if (reportData.hasData) {
                newSelectValues[3]['selected'] = reportData.testsuiteid;
                newSelectValues[3]['selectedName'] = reportData.testsuitename;
                fetchModuleInfo(newSelectValues[3]['selected'], 'module');  //getSuiteDetailsInExecution_ICE
            }

            setSelectValues(newSelectValues);
        }
    }


    const fetchModuleInfo = async(moduleId, type, moduleName,moduleLength) => {
        let arg = type === 'batch' ? { 'batchname': moduleId } : { "testsuiteid": moduleId }
        const moduleResponse = await fetchOpenModuleData(arg);   //getSuiteDetailsInExecution_ICE
        if(moduleResponse.error){
            console.error(moduleResponse.error);
            setMsg(MSG.REPORT.ERR_FETCH_EXECUTIONS);
        }
        else {
            if (type === 'batch') {
                newExecutionList = prepareBatchExecutionCard(moduleResponse);
            }
            else {
                let ExecutionList = prepareExecutionCard(moduleResponse, moduleName);
                ExecutionList = ExecutionList.reverse();
                ExecutionList = ExecutionList[0];
                newExecutionList.push(ExecutionList);
                if(newExecutionList.length === moduleLength){
                    setUrlExecutionList(newExecutionList);
                }
            }
        }
        setExecutionList(newExecutionList);
    }

    const fetchScenarioList = (executionId, executionName, selectedIds, batch_id, execution_id) => async() => {
        const scenarioResponse = await getOpenfetchScenarioInfoDevOps(selectedIds);
        if(scenarioResponse.error){
            console.error(scenarioResponse.error);
            setMsg(MSG.REPORT.ERR_FETCH_SCENARIOS);
        }
        else {
            setSelectedExecution({ id: executionId, name: executionName });
            setScenarioList(scenarioResponse);
            const [legends, values] = getFunctionalBarChartValues(scenarioResponse);
            setBarChartProps({legends: legends, values: values});
            // let newLogData = await getLogManifest(`${selectValues[0]['selectedName']}/${batch_id}/${execution_id}`);
            setLogData({});
            setLogPath(`${selectValues[0]['selectedName']}/${batch_id}/${execution_id}`);
        }
    }

 

    return (
        <div className="report__landingContainer" >
            {/* <Header /> */}
            <div className="report__landingContents" >
                <div className="report__landingMainContents" >
                    <div className="report__functionalTestingContainer_DevOps" >
                       
                        <div className="report__module_sel_container">
                        <label htmlFor="username" className="pb-2 font-medium">Configuration Key</label>
                            <InputText 
                                label="Configuration Key" 
                                standard
                                value={urlParams.configurekey}
                                width='17rem'
                            />
                        </div> 
                        { (urlExecutionList.length > 0) && 
                            <ExecutionsContainer 
                                leftList={urlExecutionList}
                                rightList={scenarioList}
                                onExecutionClick={fetchScenarioList}
                                selectedLeftItem={selectedExecution}
                                hoverUtils={hoverUtils}
                                BarChartProps={BarChartProps}
                                />
                        }

                        { 
                            (executionList.length === 0) &&
                            <div className='report_no_reportsWrapper'>
                                <img className='reports_no_reports' src="static/imgs/no-reports.png" />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>     
    );
}

export default DevOpsReport;