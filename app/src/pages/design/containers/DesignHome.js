import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DesignContent from '../components/DesignContent';
import { UpperContent, BottomContent } from "../components/ActionBarItems";
import { ReferenceContent } from "../components/RefBarItems";
import { Header, FooterTwo as Footer, ActionBar, ReferenceBar } from '../../global';
import "../styles/DesignHome.scss";

const DesignHome = () => {
    
    const current_task = useSelector(state=>state.plugin.CT)
    const filter_data = useSelector(state=>state.plugin.FD)

    const [taskName, setTaskName] = useState(null);
    const [status, setStatus] = useState(null);
    const [appType, setAppType] = useState(null);
    const [taskInfo, setTaskInfo] = useState(null);
    const [isMac, setIsMac] = useState(false);

    useEffect(()=>{
        if (Object.keys(current_task).length!==0 && Object.keys(filter_data).length!==0){
            setTaskName(current_task.taskName);
            setStatus(current_task.status);
            setAppType(current_task.appType);
            setTaskInfo({
                'Project' : filter_data.idnamemapprj[current_task.projectId],
                'Screen' : current_task.screenName,
                'TestCase' : current_task.testCaseName,
                'Release' : filter_data.idnamemaprel[current_task.releaseid],
                'Cycle' : filter_data.idnamemapcyc[current_task.cycleid]
            });
        }

        const macOS = navigator.appVersion.indexOf("Mac") !== -1;
        setIsMac(macOS);
    }, [current_task, filter_data]);


    return (
        <div className="d__body">
            <Header />
                <div className="d__mid_section">
                    
                    <ActionBar upperContent={<UpperContent appType={appType} isMac={isMac}/>} bottomContent={<BottomContent />}/>
                    <DesignContent taskName={taskName} status={status} />
                    <ReferenceBar 
                        taskName={taskName}
                        taskInfo={taskInfo}
                        >
                        <ReferenceContent appType={appType} />
                    </ReferenceBar>
                    
                </div>
                <div className='d__footer'><Footer/></div>
        </div>
    );
}


export default DesignHome;