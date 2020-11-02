import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DesignContent from '../components/DesignContent';
import { UpperContent, BottomContent } from "../components/ActionBarItems";
import DependentTestCaseDialog from '../components/DependentTestCaseDialog';
import { ReferenceContent } from "../components/RefBarItems";
import { Header, FooterTwo as Footer, ActionBar, ReferenceBar, ScreenOverlay, PopupMsg, ModalContainer } from '../../global';
import "../styles/DesignHome.scss";

const DesignHome = () => {
    
    const current_task = useSelector(state=>state.plugin.CT)
    const filter_data = useSelector(state=>state.plugin.FD)

    const [taskName, setTaskName] = useState(null);
    const [appType, setAppType] = useState(null);
    const [taskInfo, setTaskInfo] = useState(null);
    const [isMac, setIsMac] = useState(false);
    const [loading, setLoading] = useState(false);
    const [overlay, setOverlay] = useState("");
    const [showPop, setShowPop] = useState("");
    const [disableActionBar, setDisableActionBar ] = useState(false);
    const [imported, setImported] = useState(false);
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [showDpndntTcDlg, setShowDpndntTcDlg] = useState(false);
    const [dpndntTcList, setDpndntTcList] = useState([]);
    const [dTcFlag, setDTcFlag] = useState(false);
    const [checkedTc, setCheckedTc] = useState([]);
    
    useEffect(()=>{
        if (Object.keys(current_task).length!==0 && Object.keys(filter_data).length!==0){
            setTaskName(current_task.taskName);
            setAppType(current_task.appType);
            setTaskInfo({
                'Project' : filter_data.projectDict[current_task.projectId],
                'Screen' : current_task.screenName,
                'TestCase' : current_task.testCaseName,
                'Release' : current_task.releaseid,
                'Cycle' : filter_data.cycleDict[current_task.cycleid]
            });
        }

        const macOS = navigator.appVersion.indexOf("Mac") !== -1;
        setIsMac(macOS);
        setLoading(true);
        setImported(false);
    }, [current_task, filter_data]);

    const PopupDialog = () => (
        <PopupMsg 
            title={showPop.title}
            close={()=>setShowPop("")}
            content={showPop.content}
            submitText="OK"
            submit={()=>setShowPop("")}
        />
    );

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

    return (
        <>
        {
        loading &&
        <>
        { overlay && <ScreenOverlay content={overlay} />}
        { showPop && <PopupDialog />}
        { showConfirmPop && <ConfirmPopup /> }
        { showDpndntTcDlg && <DependentTestCaseDialog 
                                testCaseList={dpndntTcList} 
                                setShowDlg={setShowDpndntTcDlg} 
                                checkedTc={checkedTc}
                                setCheckedTc={setCheckedTc}
                                setDTcFlag={setDTcFlag}
                                taskName={current_task.testCaseName}
                                taskId={current_task.testCaseId}
                                setShowPop={setShowPop}
                                />
        }
        <div className="d__body">
            <Header />
                <div className="d__mid_section">
                    
                    <ActionBar upperContent={<UpperContent key={777} showDlg={showDpndntTcDlg} dTcFlag={dTcFlag} checkedTc={checkedTc} disable={disableActionBar} appType={appType} isMac={isMac} setOverlay={setOverlay} setShowPop={setShowPop} testCaseId={current_task.testCaseId} setTcList={setDpndntTcList} setShowDlg={setShowDpndntTcDlg}/>} 
                                bottomContent={<BottomContent setShowPop={setShowPop} setImported={setImported} setShowConfirmPop={setShowConfirmPop}/>}
                    />
                    <DesignContent current_task={current_task} imported={imported} />
                    <ReferenceBar 
                        taskName={taskName}
                        taskInfo={taskInfo}
                        >
                        <ReferenceContent appType={appType} />
                    </ReferenceBar>
                    
                </div>
                <div className='d__footer'><Footer/></div>
        </div>
        </>}
        </>
    );
}


export default DesignHome;