import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { UpperContent, BottomContent } from "../components/ActionBarItems";
import { Header, FooterTwo as Footer, PopupMsg, ActionBar, ReferenceBar } from '../../global';
import "../styles/ScheduleHome.scss";
import ScheduleContent from './ScheduleContent';

const ScheduleHome = ({item}) => {
    
    const current_task = useSelector(state=>state.plugin.CT)
    const filter_data = useSelector(state=>state.plugin.FD)
    const [browserTypeExe,setBrowserTypeExe] = useState([]);
    const [execAction,setExecAction] = useState("serial");
    const [appType, setAppType] = useState(null);
    const [syncScenario, setSyncScenario] = useState(false);
    const [execEnv,setExecEnv] = useState("default");
    const [smartMode,setSmartMode] = useState('normal')
    const isMac = navigator.appVersion.toLowerCase().indexOf("mac") !== -1;
	
    
    useEffect(()=>{
        if (Object.keys(current_task).length!==0 && Object.keys(filter_data).length!==0){
            setAppType(current_task.appType);
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
        <>
        <div className="s__body">
            {/* {JSON.stringify(item)} */}
            {/* <Header /> */}
                <div className="s__mid_section">
                    <ActionBar 
                    // upperContent={<UpperContent key={666} appType={appType} isMac={isMac}browserTypeExe={browserTypeExe} UpdateBrowserTypeExe={UpdateBrowserTypeExe} />}  
                    bottomContent={<BottomContent smartMode={smartMode} setSmartMode={setSmartMode} execEnv={execEnv} updateExecEnv={updateExecEnv} appType={appType ? appType : item.executionRequest.batchInfo[0].appType} execAction={execAction} browserTypeExe={browserTypeExe} UpdateBrowserTypeExe={UpdateBrowserTypeExe} updateExecAction={updateExecAction} />}/> 
                    <div className="s__content">
                        <ScheduleContent setExecEnv={setExecEnv} smartMode={smartMode} syncScenario={syncScenario} setSyncScenario={setSyncScenario} execEnv={execEnv} setBrowserTypeExe={setBrowserTypeExe} setExecAction={setExecAction} appType={appType} execAction={execAction} item={item} />
                    </div>
                    {/* <ReferenceBar />  */}
                </div>
            {/* <div className='s__footer'><Footer/></div> */}
        </div>
        </>
    );
}

export default ScheduleHome;