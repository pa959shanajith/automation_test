import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { UpperContent, BottomContent } from "../components/ActionBarItems";
import { Header, FooterTwo as Footer, ActionBar, ReferenceBar } from '../../global';
import "../styles/ExecuteHome.scss";
import ExecuteContent from './ExecuteContent';

const ExecuteHome = () => {
    
    const current_task = useSelector(state=>state.plugin.CT)
    const filter_data = useSelector(state=>state.plugin.FD)
	const [browserTypeExe,setBrowserTypeExe] = useState([]); // Contains selected browser id for execution
	const [executionActive,setExecutionActive] = useState(false); 
	const [execAction,setExecAction] = useState("serial"); 
	const [execEnv,setExecEnv] = useState("default");
    const [qccredentials,setQccredentials] = useState({qcurl: "", qcusername: "", qcpassword: "", qctype: ""});
    const [taskName, setTaskName] = useState(null);
    const [status, setStatus] = useState(null);
    const [appType, setAppType] = useState(null);
    const [syncScenario, setSyncScenario] = useState(false);
    const [readTestSuite,setreadTestSuite] = useState("");
    const isMac = navigator.appVersion.indexOf("Mac") !== -1;
    var versionnumber;
    
    useEffect(()=>{
        if (Object.keys(current_task).length!==0 && Object.keys(filter_data).length!==0){
            if(current_task.taskName.indexOf("Execute Batch") < 0) setTaskName("Suite Execution");
            else setTaskName("Batch Execution");
            setStatus(current_task.status);
            setAppType(current_task.appType);
            versionnumber = current_task.versionnumber;
            let readTestSuiteData = current_task.testSuiteDetails;
            if(typeof readTestSuiteData === "string") readTestSuiteData = JSON.parse(current_task.testSuiteDetails);
            for (var rti = 0; rti < readTestSuiteData.length; rti++) {
                readTestSuiteData[rti].versionnumber = parseFloat(versionnumber);
            }
            setreadTestSuite(readTestSuiteData);
        }
    }, [current_task, filter_data]);

    const UpdateBrowserTypeExe = (browserId) => {
        let browserTypeExecute = [...browserTypeExe];
		if (browserId!==undefined && browserTypeExecute.includes(browserId)) {
			var getSpliceIndex = browserTypeExecute.indexOf(browserId);
			browserTypeExecute.splice(getSpliceIndex, 1);
		} else browserTypeExecute.push(browserId); 
        setBrowserTypeExe(browserTypeExecute);
		if (browserTypeExecute.length > 0) setSyncScenario(true);
		else setSyncScenario(false);
    }

    const updateExecAction = () => {
        if (execAction ==="serial") setExecAction("parallel");
		else setExecAction("serial");
    }

    const updateExecEnv = () => {
        if (execEnv ==="default") setExecEnv("Saucelabs");
		else setExecEnv("default");
    }

    return (
        <div className="e__body">
            <Header />
                <div className="e__mid_section">
                    <ActionBar 
                        upperContent={<UpperContent appType={appType} isMac={isMac} browserTypeExe={browserTypeExe} UpdateBrowserTypeExe={UpdateBrowserTypeExe} />}
                        bottomContent={<BottomContent execEnv={execEnv} updateExecEnv={updateExecEnv} appType={appType} execAction={execAction} browserTypeExe={browserTypeExe} UpdateBrowserTypeExe={UpdateBrowserTypeExe} updateExecAction={updateExecAction}/>}/> 
                    <ExecuteContent execEnv={execEnv} setQccredentials={setQccredentials} setBrowserTypeExe={setBrowserTypeExe} setExecAction={setExecAction} setSyncScenario={setSyncScenario} setExecutionActive={setExecutionActive} qccredentials={qccredentials} projectdata={filter_data} execAction={execAction} appType={appType} browserTypeExe={browserTypeExe} syncScenario={syncScenario} taskName={taskName} status={status} readTestSuite={readTestSuite} current_task={current_task} />
                    <ReferenceBar /> 
                </div>
            <div className='e__footer'><Footer/></div>
        </div>
    );
}


export default ExecuteHome;