import React, { useState, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import ReportApi from '../components/ReportApi'
import ExecMetricsApi from '../components/ExecMetricsApi'
import ExecutionApi from '../components/ExecutionApi'
import { Messages as MSG, VARIANT, setMsg, ModalContainer, ScreenOverlay } from '../../global';


import "../styles/DevOps.scss";
import DevOpsList from '../components/DevOpsList';
import DevOpsConfig from '../components/DevOpsConfig';
import {getProjectList} from '../../mindmap/api';

const DevOps = props => {
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const api = window.location.href.slice(0, -7)+'execAutomation';
    const [currentIntegration, setCurrentIntegration] = useState(false);
    const [loading,setLoading] = useState(false);
    const [projectTypes, setProjectTypes] = useState([]);
    const [projectIds, setProjectIds] = useState([]);
    const [projectIdTypesDicts, setProjectIdTypesDicts] = useState({});
    

    useEffect(async ()=>{
        await getProjectList()
            .then(data => {
                setProjectTypes(data.appTypeName);
                setProjectIds(data.projectId);   
            }
        )
    },[])

    useEffect(()=> {
        let projectIdTypesDict = {}
        for (let key in projectIds){
            for (let value in projectTypes){
                projectIdTypesDict[projectIds[key].toString()] = projectTypes[value]
                projectTypes.shift()
                break
            }
        }
        setProjectIdTypesDicts(projectIdTypesDict);  
    }, [projectTypes, projectIds]);

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
    const showMessageBar = (message, selectedVariant) => (
        setMsg(MSG.CUSTOM(message,VARIANT[selectedVariant]))
    )
    

    return (<>
        { showConfirmPop && <ConfirmPopup /> }
        {loading?<ScreenOverlay content={loading}/>:null}
        {currentIntegration ? <DevOpsConfig url={api} setCurrentIntegration={setCurrentIntegration} currentIntegration={currentIntegration} showMessageBar={showMessageBar} setLoading={setLoading} projectIdTypesDicts={projectIdTypesDicts} /> : <DevOpsList url={api} setShowConfirmPop={setShowConfirmPop} setCurrentIntegration={setCurrentIntegration} showMessageBar={showMessageBar} setLoading={setLoading} projectIdTypesDicts={projectIdTypesDicts} /> }
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