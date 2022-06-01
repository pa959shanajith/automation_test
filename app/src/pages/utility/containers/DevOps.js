import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import ReportApi from '../components/ReportApi'
import ExecMetricsApi from '../components/ExecMetricsApi'
import ExecutionApi from '../components/ExecutionApi'
import { ScrollBar, Messages as MSG, setMsg, ModalContainer } from '../../global';
import { SearchBox } from '@avo/designcomponents';


import "../styles/DevOps.scss";
import DevOpsList from '../components/DevOpsList';
import DevOpsConfig from '../components/DevOpsConfig';

const DevOps = props => {
    const [api, setApi] = useState("Execution");
    const [showConfirmPop, setShowConfirmPop] = useState(false);
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
    const [currentIntegration, setCurrentIntegration] = useState(false);

    useEffect(() => {
        // setRequestText("");
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
    const ConfirmPopup = () => (
        <ModalContainer 
            title={showConfirmPop.title}
            content={showConfirmPop.content}
            close={()=>setShowConfirmPop(false)}
            footer={
                <>
                <button onClick={showConfirmPop.onClick}>Yes</button>
                <button onClick={()=>setShowConfirmPop(false)}>No</button>
                </>
            }
        />
    )

    return (<>
        { showConfirmPop && <ConfirmPopup /> }
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
                { currentIntegration ? 'Create New DevOps Integration Configuration' : 'DevOps Integration Configuration'}
                
            </span>
        </div>
        {currentIntegration ? <DevOpsConfig setCurrentIntegration={setCurrentIntegration} /> : <DevOpsList setShowConfirmPop={setShowConfirmPop} setCurrentIntegration={setCurrentIntegration} /> }
{/*         
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
                    {api === "Execution" ? <ExecutionApi integration={integration} setIntegration={setIntegration} reset={resetFields} setResult={setRequest} error={error} resetReqData={resetReqData} /> : null}
                    {api === "Report" ? <ReportApi reset={resetFields} setResult={setRequest} error={error} resetReqData={resetReqData} /> : null}
                    {api === "Execution Metrics" ? <ExecMetricsApi reset={resetFields} setResult={setRequest} error={error} resetReqData={resetReqData} /> : null}
                    <span className={classes["api-ut__inputLabel"]}>Request Body</span>
                    <span className={classes["api-ut__inputLabel"]}><textarea type="text" data-test="req-body-test" className={classes["req-body"]} autoComplete="off" id="request-body" name="request-body" value={requestText} onChange={(e)=>{setRequestText(e.target.value)}} style={{height:"100px"}} placeholder="Click on Generate to generate request body"  />
                        <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                            <ReactTooltip id="download" effect="solid" backgroundColor="black" getContent={[() => { return downloadToolTip }, 0]} />
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
        </div></div></div></div> */}
    </>);
}

export default DevOps;