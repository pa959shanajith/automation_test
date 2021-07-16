import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DesignContent from './DesignContent';
import { UpperContent, BottomContent } from "../components/ActionBarItems";
import DependentTestCaseDialog from '../components/DependentTestCaseDialog';
import { ReferenceContent } from "../components/RefBarItems";
import { Header, FooterTwo as Footer, ActionBar, ScreenOverlay, PopupMsg, ModalContainer } from '../../global';
import "../styles/DesignHome.scss";

/*
    Container: Design Home Container
    Uses: Renders entire design screen
    Props: None
*/

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
    const [dTcFlag, setDTcFlag] = useState(false);
    const [checkedTc, setCheckedTc] = useState({});
    
    useEffect(()=>{
        setIsMac(navigator.appVersion.indexOf("Mac") !== -1);
        setLoading(false);
        setImported(false);
    }, [current_task, filter_data]);

    const PopupDialog = () => (
        <PopupMsg 
            data-test="d__popup"
            variant={showPop.VARIANT || showPop.variant}
            close={()=>setShowPop("")}
            content={showPop.CONTENT || showPop.content}
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
                                scenarioId = {current_task.scenarioId}
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
            <Header data-test="d__header" />
            <div className="d__mid_section">
                
                <ActionBar data-test="d__actionBar" 
                            upperContent={
                                <UpperContent key={777} 
                                    showDlg={showDpndntTcDlg} 
                                    setShowDlg={setShowDpndntTcDlg}
                                    dTcFlag={dTcFlag} 
                                    setDTcFlag={setDTcFlag} 
                                    setCheckedTc={setCheckedTc}
                                    checkedTc={checkedTc} 
                                    isMac={isMac}
                                    disable={disableActionBar} 
                                    setOverlay={setOverlay} 
                                    setShowPop={setShowPop}
                                />
                            } 
                            bottomContent={
                                <BottomContent 
                                    setShowPop={setShowPop} 
                                    disable={disableActionBar}
                                    setImported={setImported} 
                                    setOverlay={setOverlay}
                                    setShowConfirmPop={setShowConfirmPop}
                                />
                            }
                />
                <DesignContent data-test="d__contents" 
                                current_task={current_task} 
                                imported={imported} 
                                setImported={setImported} 
                                setMirror={setMirror} 
                                setShowPop={setShowPop} 
                                setShowConfirmPop={setShowConfirmPop}
                                setDisableActionBar={setDisableActionBar}
                                />
                
                <ReferenceContent data-test="d__refBar" mirror={mirror}/>
                
            </div>
            <div data-test="d__footer" className='d__footer'><Footer/></div>
        </div>
        </>}
        </>
    );
}


export default DesignHome;