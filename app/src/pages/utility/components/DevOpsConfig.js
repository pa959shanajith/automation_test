import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import ReportApi from '../components/ReportApi'
import ExecMetricsApi from '../components/ExecMetricsApi'
import ExecutionApi from '../components/ExecutionApi'
import { ScrollBar, Messages as MSG, setMsg, ModalContainer } from '../../global';
import { fetchReportMeta } from '../api';
import { useSelector } from 'react-redux';


// import classes from "../styles/DevOps.scss";
import "../styles/DevOps.scss";
import ReleaseCycleSelection from './ReleaseCycleSelection';
import { prepareOptionLists } from './DevOpsUtils';
import DevOpsModuleList from './DevOpsModuleList';

const DevOpsConfig = props => {
    // const reportData = useSelector(state => state.viewReport.reportData);
    const reportData = {hasData: false};
    const [api, setApi] = useState("Execution");
    const [copyToolTip, setCopyToolTip] = useState("Click To Copy");
    const [request, setRequest] = useState({});
    const [requestText, setRequestText] = useState("");
    const [configName, setConfigName] = useState("");
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [dataDict, setDict] = useState({});
    const [resetFields, setResetFields] = useState(true);
    const [selectValues, setSelectValues] = useState([
        { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
        { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
        { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
    ]);
    const [error, setError] = useState({
        error: false,
        toDate: false,
        fromDate: false,
        LOB: false,
        executionId: false,
        scenarioIds: false,
        source: false,
        exectionMode: false,
        executionEnv: false,
        browserType: false,
        integration: {
            url: false,
            username: false,
            password: false,
            qteststeps: false
        },
        gitInfo: {
            gitConfiguration: false,
            gitbranch: false,
            folderPath: false,
            gitVersion: false
        },
        batchInfo: {
            testsuiteName: false,
            testsuiteId: false,
            versionNumber: false,
            appType: false,
            domainName: false,
            projectName: false,
            projectId: false,
            releaseId: false,
            cycleName: false,
            cycleId: false
        }
    });
    const [integration, setIntegration] = useState(-1);
    useEffect(()=> {
        (async()=>{
            const reportResponse = await fetchReportMeta({ readme: "projects" });
            if (reportResponse.error) {
                console.error(reportResponse.error);
                setMsg(MSG.REPORT.ERR_FETCH_PROJECT);
            }
            else {
                const [projList, newDict] = prepareOptionLists(reportResponse);
                let newSelectValues = [...selectValues];
                newSelectValues[0].list = projList;

                if(reportData.hasData) {
                    // proj
                    newSelectValues[0]['selected'] = reportData.projectid;
                    newSelectValues[0]['selectedName'] = reportData.projectname;

                    // rel
                    newSelectValues[1]['disabled'] = false;
                    newSelectValues[1]['list'] = newDict[reportData.projectid].relList;
                    newSelectValues[1]['selected'] = reportData.releaseid;
                    newSelectValues[1]['selectedName'] = reportData.releaseid;

                    //cyc
                    newSelectValues[2]['disabled'] = false;
                    newSelectValues[2]['list'] = newDict[reportData.projectid].relDict[reportData.releaseid].cycList;
                    newSelectValues[2]['selected'] = reportData.cycleid;
                    newSelectValues[2]['selectedName'] = reportData.cyclename;

                    const projId = newSelectValues[0]['selected'];
                    const relName = newSelectValues[1]['selected'];
                    const cycId = newSelectValues[2]['selected'];

                    // fetchFunctionalReports(projId, relName, cycId);
                }
                
                setDict(newDict);
                setSelectValues(newSelectValues);
            }
        })()
    }, []);
    useEffect(() => {
        setRequestText("");
        setError({
            error: false,
            toDate: false,
            fromDate: false,
            LOB: false,
            executionId: false,
            scenarioIds: false,
            source: false,
            exectionMode: false,
            executionEnv: false,
            browserType: false,
            integration: {
                url: false,
                username: false,
                password: false,
                qteststeps: false
            },
            gitInfo: {
                gitConfiguration: false,
                gitbranch: false,
                folderPath: false,
                gitVersion: false
            },
            batchInfo: {
                testsuiteName: false,
                testsuiteId: false,
                versionNumber: false,
                appType: false,
                domainName: false,
                projectName: false,
                projectId: false,
                releaseId: false,
                cycleName: false,
                cycleId: false
            }
        });
    }, [api])

    const copyTokenFunc = () => {
        console.log(document.getElementById('request-body'));
        const data = requestText;
        if (!data) {
            setCopyToolTip("Nothing to Copy!");
            setTimeout(() => {
                setCopyToolTip("Click to Copy");
            }, 1500);
            return;
        }
        const x = document.getElementById('request-body');
        x.select();
        document.execCommand('copy');
        setCopyToolTip("Copied!");
        setTimeout(() => {
            setCopyToolTip("Click to Copy");
        }, 1500);
    }

    const copyConfigKey = (index) => {
        const x = document.getElementsByClassName('tkn_table_key_value')[index];
        // x.select();
        // document.execCommand('copy');
        setCopyToolTip("Copied!");
        setTimeout(() => {
            setCopyToolTip("Click to Copy");
        }, 1500);
    }

    const handleSubmit = () => {
        try {
            if (api !== "Execution" && api !== "Report" && api !== "Execution Metrics") {
                setMsg(MSG.UTILITY.ERR_SEL_API);
            }
            let obj = validate(request, api, integration);
            setError(obj);
            if (obj.error === true)  return;
            setMsg(MSG.UTILITY.SUCC_REQ_BODY_GEN);
            setRequestText(JSON.stringify(request, undefined, 4));
        } catch (e) {
            setMsg(MSG.UTILITY.ERR_GENERATE_RB);
        }
    }
    const deleteDevOpsConfig = () => {
        setShowConfirmPop({'title': 'Delete DevOps Integration Configuration', 'content': <p>Are you sure, you want to delete <b>Name 1</b> Integration Configuration?</p>, 'onClick': ()=>console.log('Delete config action clicked')});
    }
    // const handleSelect = fieldIndex => (selectedKey) => {
    //     let newSelectValues = [...selectValues];
    //     if (fieldIndex === 0) {
    //         newSelectValues[0]['selected'] = selectedKey.key;
    //         newSelectValues[0]['selectedName'] = selectedKey.text;
    //         newSelectValues[1]['disabled'] = false;
    //         newSelectValues[1]['list'] = dataDict[selectedKey.key].relList;
    //         newSelectValues[1]['selected'] = ""; 
    //         newSelectValues[2]['selected'] = ""; newSelectValues[2]['list'] = []; newSelectValues[2]['disabled'] = true;
    //         newSelectValues[3]['selected'] = ""; newSelectValues[3]['list'] = []; newSelectValues[3]['disabled'] = true;
    //     }
    //     else if (fieldIndex === 1) {
    //         newSelectValues[1]['selected'] = selectedKey.key;
    //         newSelectValues[1]['selectedName'] = selectedKey.text;
    //         newSelectValues[2]['disabled'] = false;
    //         newSelectValues[2]['list'] = dataDict[newSelectValues[0]['selected']].relDict[selectedKey.key].cycList;
    //         newSelectValues[2]['selected'] = ""; 
    //         newSelectValues[3]['selected'] = ""; newSelectValues[3]['list'] = []; newSelectValues[3]['disabled'] = true;
    //     }
    //     else if (fieldIndex === 2) {
    //         newSelectValues[2]['selected'] = selectedKey.key;
    //         newSelectValues[2]['selectedName'] = selectedKey.text;
    //         newSelectValues[3]['disabled'] = false;
    //         newSelectValues[3]['selected'] = "";

    //         const projId = newSelectValues[0]['selected'];
    //         const relName = newSelectValues[1]['selected'];
    //         const cycId = newSelectValues[2]['selected'];

    //         fetchFunctionalReports(projId, relName, cycId);
    //     }
    //     else if (fieldIndex === 3) {
    //         newSelectValues[3]['selected'] = selectedKey.key;
    //         newSelectValues[3]['selectedName'] = selectedKey.text;
    //         fetchModuleInfo(selectedKey.key, selectedKey.type);
    //     }
    //     setBarChartProps({ legends: [{text: "", color: ""}], values: {} });
    //     setSelectedExecution({ id: "", name: "" });
    //     setScenarioList([]);
    //     setSelectValues(newSelectValues);
    // }
    const handleNewSelect = fieldIndex => (selectedKey) => {
        let newSelectValues = [...selectValues];
        if (fieldIndex === 0) {
            newSelectValues[0]['selected'] = selectedKey.key;
            newSelectValues[0]['selectedName'] = selectedKey.text;
            newSelectValues[1]['disabled'] = false;
            newSelectValues[1]['list'] = dataDict[selectedKey.key].relList;
            newSelectValues[1]['selected'] = ""; 
            newSelectValues[2]['selected'] = ""; newSelectValues[2]['list'] = []; newSelectValues[2]['disabled'] = true;
        }
        else if (fieldIndex === 1) {
            newSelectValues[1]['selected'] = selectedKey.key;
            newSelectValues[1]['selectedName'] = selectedKey.text;
            newSelectValues[2]['disabled'] = false;
            newSelectValues[2]['list'] = dataDict[newSelectValues[0]['selected']].relDict[selectedKey.key].cycList;
            newSelectValues[2]['selected'] = ""; 
        }
        else if (fieldIndex === 2) {
            newSelectValues[2]['selected'] = selectedKey.key;
            newSelectValues[2]['selectedName'] = selectedKey.text;

            const projId = newSelectValues[0]['selected'];
            const relName = newSelectValues[1]['selected'];
            const cycId = newSelectValues[2]['selected'];

            // fetchFunctionalReports(projId, relName, cycId);
        }
        // setBarChartProps({ legends: [{text: "", color: ""}], values: {} });
        // setSelectedExecution({ id: "", name: "" });
        // setScenarioList([]);
        setSelectValues(newSelectValues);
    }

    return (<>
        <div>
            <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>Configuration Name : </span>
            <span className="api-ut__inputLabel">
                <input type="text" value={configName} onChange={(event) => setConfigName(event.target.value)} data-test="req-body-test" className="req-body" autoComplete="off" id="request-body" name="request-body" style={{width:"25%"}} placeholder='Enter Configuration Name' />
            </span>
        </div>
        <div className="api-ut__btnGroup">
            {/* <button data-test="submit-button-test" onClick={handleSubmitReset} >Reset</button> */}
            {/* <div className="sessionHeading-ip" data-toggle="collapse" data-target="#activeUsersToken-x">
                <h4 onClick={()=>{setShowList(!showList);}}>ICE Provisions</h4>
                <div className="search-ip">
                    <span className="searchIcon-provision search-icon-ip">
                        <img src={"static/imgs/ic-search-icon.png"} className="search-img-ip" alt="search icon"/>
                    </span>
                    <input value={searchTasks} onChange={(event)=>{ setSearchTasks(event.target.value);searchIceList(event.target.value)}} autoComplete="off" type="text" id="searchTasks" className="searchInput-list-ip searchInput-cust-ip" />
                </div>
            </div> */}
            {/* <div className="sessionHeading-ip" data-toggle="collapse" data-target="#activeUsersToken-x">
                <h4 onClick={()=>{}}>Current DevOps Integration Configurations</h4>
                <div className="search-ip">
                    <span className="searchIcon-provision search-icon-ip">
                        <img src={"static/imgs/ic-search-icon.png"} className="search-img-ip" alt="search icon"/>
                    </span>
                    <input value={''} onChange={(event)=>{}} autoComplete="off" type="text" id="searchTasks" className="searchInput-list-ip searchInput-cust-ip" />
                </div>
            </div> */}
            <button data-test="submit-button-test" onClick={() => props.setCurrentIntegration(false)} >Save</button>
            <button data-test="submit-button-test" onClick={() => props.setCurrentIntegration(false)} >Cancel</button>
        </div>
        <div>
            <ReleaseCycleSelection selectValues={selectValues} handleSelect={handleNewSelect} />
        </div>
        {
            selectValues[2].selected && <div style={{ display: 'flex', justifyContent:'space-between' }}>
                <DevOpsModuleList />
                <div>Hello</div>
            </div>
        }
    </>);
}

const validate = (request, api, integration) => {
    let check = {
        error: false,
        toDate: false,
        fromDate: false,
        LOB: false,
        executionId: false,
        scenarioIds: false,
        source: false,
        exectionMode: false,
        executionEnv: false,
        browserType: false,
        integration: {
            url: false,
            username: false,
            password: false,
            qteststeps: false
        },
        gitInfo: {
            gitConfiguration: false,
            gitbranch: false,
            folderPath: false,
            gitVersion: false
        },
        batchInfo: {
            testsuiteName: false,
            testsuiteId: false,
            versionNumber: false,
            appType: false,
            domainName: false,
            projectName: false,
            projectId: false,
            releaseId: false,
            cycleName: false,
            cycleId: false
        }
    };
    if (api === "Report") {
        if (request["execution_data"].executionId.trim().length === 0) {
            check.executionId = true;
            check.error = true;
        }
        if (request["execution_data"].scenarioIds === undefined || request["execution_data"].scenarioIds.length === 0) {
            check.scenarioIds = true;
            check.error = true;
        }
    }
    else if (api === "Execution Metrics") {
        if (request["metrics_data"].fromDate === undefined || request["metrics_data"].fromDate.length === 0) {
            check.fromDate = true;
            check.error = true;
        }
        if (request["metrics_data"].toDate === undefined || request["metrics_data"].toDate.length === 0) {
            check.toDate = true;
            check.error = true;
        }
        if (request["metrics_data"].LOB === undefined || request["metrics_data"].LOB.length === 0) {
            check.LOB = true;
            check.error = true;
        }
    } else {
        if (request["executionData"].source !== "api") {
            check.source = true;
            check.error = true;
        }
        if (request["executionData"].exectionMode !== "serial" && request["executionData"].exectionMode !== "parallel") {
            check.exectionMode = true;
            check.error = true;
        }
        if (request["executionData"].executionEnv !== "default" && request["executionData"].executionEnv !== "saucelabs") {
            check.executionEnv = true;
            check.error = true;
        }
        if (parseInt(request["executionData"].browserType) < 1 || parseInt(request["executionData"].browserType) > 9) {
            check.browserType = true;
            check.error = true;
        }

        if (integration !== -1 && integration !== "-1") {
            const subrequest = request["executionData"].integration[integration];
            const regex = /^https:\/\//g;
            const regexUrl = /^http:\/\//g;
            if (!(regex.test(subrequest['url']) || regexUrl.test(subrequest['url']))) {
                check.integration.url = true;
                check.error = true;
            }
            if (subrequest.username.length === 0) {
                check.integration.username = true;
                check.error = true;
            }
            if (subrequest.password.length === 0) {
                check.integration.password = true;
                check.error = true;
            }
        }
        if (request["executionData"].gitInfo !== undefined) {
            if (request["executionData"].gitInfo.gitConfiguration.length === 0) {
                check.error = true;
                check.gitInfo.gitConfiguration = true;
            }
            if (request["executionData"].gitInfo.gitbranch.length === 0) {
                check.error = true;
                check.gitInfo.gitbranch = true;
            }
            if (request["executionData"].gitInfo.folderPath.length === 0) {
                check.error = true;
                check.gitInfo.folderPath = true;
            }
            if (request["executionData"].gitInfo.gitVersion.length === 0) {
                check.error = true;
                check.gitInfo.gitVersion = true;
            }
        } else {
            if (!request["executionData"].batchInfo) {
                check.error = true;
                check.batchInfo = true;
            }
        }
    }
    return check;
}

export default DevOpsConfig;