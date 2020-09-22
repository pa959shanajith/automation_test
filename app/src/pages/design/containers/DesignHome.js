import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { UpperContent, BottomContent } from "../components/ActionBarItems";
import { ReferenceContent } from "../components/RefBarItems";
import { Header, FooterTwo as Footer, ActionBar, ReferenceBar } from '../../global';
import "../styles/DesignHome.scss";

const DesignHome = () => {
    
    const current_task = useSelector(state=>state.plugin.CT)

    const [appType, setAppType] = useState(null);

    useEffect(()=>{
        let getTaskName = current_task.taskName;
        setAppType(current_task.appType);
    }, []);


    return (
        <div className="d__body">
            <Header />
                <div className="d__mid_section">
                    
                        <div className="d__leftbar">
                            <ActionBar upperContent={<UpperContent appType={appType}/>} bottomContent={<BottomContent />}/>
                        </div>
                    
                    <div className="d__content">Content</div>
                    
                        <div className="d__rightbar">
                            <ReferenceBar><ReferenceContent /></ReferenceBar>
                        </div>
                    
                </div>
                <div className='d__footer'><Footer/></div>
        </div>
    );
}


export default DesignHome;