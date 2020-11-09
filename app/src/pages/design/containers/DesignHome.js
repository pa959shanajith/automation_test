import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DesignContent from './DesignContent';
import { UpperContent, BottomContent } from "../components/ActionBarItems";
import DependentTestCaseDialog from '../components/DependentTestCaseDialog';
import { ReferenceContent } from "../components/RefBarItems";
import { Header, FooterTwo as Footer, ActionBar, ScreenOverlay, PopupMsg, ModalContainer } from '../../global';
import "../styles/DesignHome.scss";

const DesignHome = () => {
    
    const current_task = useSelector(state=>state.plugin.CT)
    const filter_data = useSelector(state=>state.plugin.FD)

    const [isMac, setIsMac] = useState(false);
    const [loading, setLoading] = useState(true);
    const [overlay, setOverlay] = useState("");
    const [showPop, setShowPop] = useState("");
    const [mirror, setMirror] = useState(null);
    const [disableActionBar, setDisableActionBar ] = useState(false);
    const [imported, setImported] = useState(false);
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [showDpndntTcDlg, setShowDpndntTcDlg] = useState(false);
    const [dpndntTcList, setDpndntTcList] = useState([]);
    const [dTcFlag, setDTcFlag] = useState(false);
    const [checkedTc, setCheckedTc] = useState([]);
    
    useEffect(()=>{
        const macOS = navigator.appVersion.indexOf("Mac") !== -1;
        setIsMac(macOS);
        setLoading(false);
        setImported(false);
    }, [current_task, filter_data]);

    const PopupDialog = () => (
        <PopupMsg 
            title={showPop.title}
            close={()=>setShowPop("")}
            content={showPop.content}
            submitText="OK"
            submit={showPop.onClick ? showPop.onClick : ()=>setShowPop("")}
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
        !loading &&
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
                
                <ActionBar upperContent={<UpperContent key={777} showDlg={showDpndntTcDlg} dTcFlag={dTcFlag} checkedTc={checkedTc} disable={disableActionBar} isMac={isMac} setOverlay={setOverlay} setShowPop={setShowPop} testCaseId={current_task.testCaseId} setTcList={setDpndntTcList} setShowDlg={setShowDpndntTcDlg}/>} 
                            bottomContent={<BottomContent setShowPop={setShowPop} setImported={setImported} setShowConfirmPop={setShowConfirmPop}/>}
                />
                <DesignContent current_task={current_task} imported={imported} setImported={setImported} setMirror={setMirror} setShowPop={setShowPop} setShowConfirmPop={setShowConfirmPop}/>
                
                <ReferenceContent mirror={mirror}/>
                
            </div>
            <div className='d__footer'><Footer/></div>
        </div>
        </>}
        </>
    );
}


export default DesignHome;