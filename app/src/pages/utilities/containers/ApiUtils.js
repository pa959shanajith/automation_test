import React, { useEffect, useState } from 'react';
// import ReactTooltip from 'react-tooltip';
// import ReportApi from '../components/ReportApi'
// import ExecMetricsApi from '../components/ExecMetricsApi'
// import ExecutionApi from '../components/ExecutionApi'
import { ScrollBar, Messages as MSG, setMsg } from '../../global'

import classes from "../styles/ApiUtils.module.scss";

const ApiUtils = props => {
    const [api, setApi] = useState("Execution");
    const [copyToolTip, setCopyToolTip] = useState("Click To Copy");
    const [downloadToolTip, setDownloadToolTip] = useState("Download Token");
    const [request, setRequest] = useState({});
    const [requestText, setRequestText] = useState("");
    const [resetFields, setResetFields] = useState(true);
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

    const downloadToken = () => {
        const data = requestText;
        if (!data) {
            setDownloadToolTip("Nothing to Download!");
            setTimeout(() => {
                setDownloadToolTip("Download Token");
            }, 1500);
            return;
        }
        const filename = "request.txt";
        var blob = new Blob([data], { type: 'text/json' });
        var e = document.createEvent('MouseEvents');
        var a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initMouseEvent('click', true, true, window,
            0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
        setDownloadToolTip("Downloaded!");
        setTimeout(() => {
            setDownloadToolTip("Download Token");
        }, 1500);
    }

    const copyTokenFunc = () => {
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

    const resetReqData = () => {
        setRequestText("");
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

    const handleSubmitReset = () => {
        setResetFields(!resetFields);
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
    }

    return (<>
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
                Request Body Generator
            </span>
        </div>
        <div className={classes["api-ut__btnGroup"]}>
            <button data-test="submit-button-test" onClick={handleSubmitReset} >Reset</button>
            <button data-test="submit-button-test" onClick={handleSubmit} >Generate</button>
        </div>
        
        <div className={classes["api-ut_contents"]}>
        <div className={classes["api-ut__ab"]}>
        <div className={classes["api-ut__min"]}>
        <div className={classes["api-ut__con"]} id="apiUtilCon">
            <ScrollBar thumbColor="#929397" scrollId="apiUtilCon">
                <div className={classes["api-ut__inputGroup"]}>
                    <span className={classes["api-ut__inputLabel"]}>API Names<span className={classes["api-ut__mandate"]}>*</span></span>
                    <select data-test="api-select-test" value={api} className={classes["api-ut__select"]} onChange={(event) => { setApi(event.target.value); resetReqData(); }}>
                        <option key={0} value="Execution">/ExecuteTestSuite_ICE_SVN</option>
                        <option key={1} value="Report">/getReport_API</option>
                        <option key={2} value="Execution Metrics">/getExecution_metrics_API</option>
                    </select>
                    {/* {api === "Execution" ? <ExecutionApi integration={integration} setIntegration={setIntegration} reset={resetFields} setResult={setRequest} error={error} resetReqData={resetReqData} /> : null}
                    {api === "Report" ? <ReportApi reset={resetFields} setResult={setRequest} error={error} resetReqData={resetReqData} /> : null}
                    {api === "Execution Metrics" ? <ExecMetricsApi reset={resetFields} setResult={setRequest} error={error} resetReqData={resetReqData} /> : null} */}
                    <span className={classes["api-ut__inputLabel"]}>Request Body</span>
                    <span className={classes["api-ut__inputLabel"]}><textarea type="text" data-test="req-body-test" className={classes["req-body"]} autoComplete="off" id="request-body" name="request-body" value={requestText} onChange={(e)=>{setRequestText(e.target.value)}} style={{height:"100px"}} placeholder="Click on Generate to generate request body"  />
                        <label>
                            {/* <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> */}
                            {/* <ReactTooltip id="download" effect="solid" backgroundColor="black" getContent={[() => { return downloadToolTip }, 0]} /> */}
                            <div style={{fontSize:"24px"}}>
                                <i className={`fa fa-files-o ${classes["icon"]}`} style={{fontSize:"24px"}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyTokenFunc() }} ></i>
                            </div>
                            <div>
                                <i className={`fa fa-download ${classes["icon"]}`} style={{fontSize:"24px"}} data-for="download" data-tip={downloadToolTip} onClick={() => { downloadToken() }}></i>
                            </div>
                        </label>
                    </span>
                </div>
            </ScrollBar>
        </div></div></div></div>
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

export default ApiUtils;