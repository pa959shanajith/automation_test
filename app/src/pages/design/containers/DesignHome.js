import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DesignContent from '../components/DesignContent';
import { UpperContent, BottomContent } from "../components/ActionBarItems";
import { ReferenceContent } from "../components/RefBarItems";
import { Header, FooterTwo as Footer, ActionBar, ReferenceBar } from '../../global';
import "../styles/DesignHome.scss";

const DesignHome = () => {
    
    const current_task = useSelector(state=>state.plugin.CT)

    const [taskName, setTaskName] = useState(null);
    const [appType, setAppType] = useState(null);
    const [isMac, setIsMac] = useState(false);

    useEffect(()=>{
        setTaskName(current_task.taskName);
        setAppType(current_task.appType);
        const macOS = navigator.appVersion.indexOf("Mac") !== -1;
        setIsMac(macOS);
    }, []);


    return (
        <div className="d__body">
            <Header />
                <div className="d__mid_section">
                    <div className="d__leftbar">
                        <ActionBar upperContent={<UpperContent appType={appType} isMac={isMac}/>} bottomContent={<BottomContent />}/>
                    </div>
                    <DesignContent taskName={taskName}/>
                    <div className="d__rightbar">
                        <ReferenceBar><ReferenceContent /></ReferenceBar>
                    </div>
                </div>
                <div className='d__footer'><Footer/></div>
        </div>
    );
}


export default DesignHome;