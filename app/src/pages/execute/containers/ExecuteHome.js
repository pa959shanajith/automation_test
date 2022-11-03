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
	const [execAction,setExecAction] = useState("serial"); 
	const [execEnv,setExecEnv] = useState("default");
    const [taskName, setTaskName] = useState(null);
    const [status, setStatus] = useState(null);
    const [appType, setAppType] = useState(null);
    const [syncScenario, setSyncScenario] = useState(false);
    const [readTestSuite,setreadTestSuite] = useState("");
    const isMac = navigator.appVersion.toLowerCase().indexOf("mac") !== -1;
    var versionnumber;
    
    useEffect(()=>{
        if (Object.keys(current_task).length!==0 && Object.keys(filter_data).length!==0){
            if(current_task.taskName.indexOf("Execute Batch") < 0) setTaskName("Suite Execution");
            else setTaskName("Batch Execution");
            setStatus(current_task.status);
            setAppType(current_task.appType);
            // eslint-disable-next-line
            versionnumber = current_task.versionnumber;
            let readTestSuiteData = current_task.testSuiteDetails;
            if(typeof readTestSuiteData === "string") readTestSuiteData = JSON.parse(current_task.testSuiteDetails);
            for (var rti = 0; rti < readTestSuiteData.length; rti++) {
                readTestSuiteData[rti].versionnumber = parseFloat(versionnumber);
            }
            setreadTestSuite(readTestSuiteData);
            reset();
        }
    }, [current_task, filter_data]);

    const reset = () => {
        setBrowserTypeExe([]);
        if(document.getElementById('syncScenario') != undefined) document.getElementById('syncScenario').value = '';
        setSyncScenario(false);
    }

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
                    {/* <ActionBar  
                        // upperContent={<UpperContent appType={appType} isMac={isMac} browserTypeExe={browserTypeExe} UpdateBrowserTypeExe={UpdateBrowserTypeExe} />}
                        // bottomContent={<BottomContent execEnv={execEnv} updateExecEnv={updateExecEnv} appType={appType} execAction={execAction} browserTypeExe={browserTypeExe} UpdateBrowserTypeExe={UpdateBrowserTypeExe} updateExecAction={updateExecAction}/>}/> */}
                    <ExecuteContent setExecEnv={setExecEnv} execEnv={execEnv} setBrowserTypeExe={setBrowserTypeExe} setExecAction={setExecAction} setSyncScenario={setSyncScenario} projectdata={filter_data} execAction={execAction} appType={appType} browserTypeExe={browserTypeExe} syncScenario={syncScenario} taskName={taskName} status={status} readTestSuite={readTestSuite} current_task={current_task} />
                    {/* <ReferenceBar />  */}
                </div>
            <div className='e__footer' style={{marginTop: '-2rem'}}><Footer/></div>
        </div>
    );
}

export default ExecuteHome;