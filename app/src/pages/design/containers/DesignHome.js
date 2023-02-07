import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DesignContent from './DesignContent';
import { UpperContent, BottomContent } from "../components/ActionBarItems";
import DependentTestCaseDialog from '../components/DependentTestCaseDialog';
import { ReferenceContent } from "../components/RefBarItems";
import { Header, FooterTwo as Footer, ActionBar, ScreenOverlay, ModalContainer } from '../../global';
import "../styles/DesignHome.scss";


/*
    Container: Design Home Container
    Uses: Renders entire design screen
    Props: None
*/

const DesignHome = (props) => {
    
    const current_task = useSelector(state=>state.plugin.CT)
    const filter_data = useSelector(state=>state.plugin.FD)
    const selectedModule = useSelector(state=>state.mindmap.selectedModule)

    const [isMac, setIsMac] = useState(false);
    const [loading, setLoading] = useState(true);
    const [overlay, setOverlay] = useState("");
    const [mirror, setMirror] = useState(null);
    const [disableActionBar, setDisableActionBar ] = useState(false);
    const [imported, setImported] = useState(false);
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [showDpndntTcDlg, setShowDpndntTcDlg] = useState(false);
    const [dTcFlag, setDTcFlag] = useState(false);
    const [checkedTc, setCheckedTc] = useState({});
    const [Collapsed, setCollapsed] = useState(false);
    
    useEffect(()=>{
        setIsMac(navigator.appVersion.indexOf("Mac") !== -1);
        setLoading(false);
        setImported(false);
    }, [current_task, filter_data]);

    const closeBar =()=> setCollapsed(!Collapsed);
    
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

    const openScrapeCapture = async() =>{
        let screenCapture = [];
        if(selectedModule && selectedModule.children && selectedModule.children.length > 0) {
            for(let scenario of selectedModule.children) {
                if(scenario && scenario.children && scenario.children.length > 0){
                for(let scr of scenario.children) {
                    if(scr && scr.children && scr.children.length > 0){
                    for(let ts of scr.children) {
                        if(ts["_id"]===props.fetchingDetails["_id"]){
                            screenCapture=ts.parent;
                        }
                        }
                        }
                    }
                }
            }
        }
        

        // await selectedModule.children.some(async (scenario)=>{
        //         await scenario.children.some(async (scr)=>{
        //                 await scr.children.some(async (ts)=>{
        //                     if(ts["_id"]===props.fetchingDetails["_id"]){
        //                         screenCapture=ts.parent
        //                     }
        //                         return ts["_id"]===props.fetchingDetails["_id"]
        //                     })
                            
        //                     return scr["_id"]===props.fetchingDetails.parent["_id"]
        //         })
            
        //     // return scr["_id"]===props.fetchingDetails["_id"]
        // });

        let populateTestcaseDetails = {
            "parent":{"_id":props.fetchingDetails["_id"],name:props.fetchingDetails["name"],projectId:props.fetchingDetails["projectId"],"screenId":screenCapture?screenCapture._id:"","_id":{"_id":props.fetchingDetails.parent["_id"]}},
            "_id":screenCapture._id?screenCapture._id:"",
            "name":screenCapture.name?screenCapture.name:""
        }
        
        props.openScrapeScreen("displayBasic","","displayBasic2",{screenCapture})
    }

    return (
        <>
        {
        !loading &&
        <>
        { overlay && <ScreenOverlay content={overlay} />}
        { showConfirmPop && <ConfirmPopup /> }
        { showDpndntTcDlg && <DependentTestCaseDialog 
                                scenarioId = {props.fetchingDetails.parent.parent["_id"]}
                                setShowDlg={setShowDpndntTcDlg} 
                                checkedTc={checkedTc}
                                setCheckedTc={setCheckedTc} 
                                setDTcFlag={setDTcFlag}
                                taskName={props.fetchingDetails.name}
                                taskId={props.fetchingDetails["_id"]}
                                />
        }
        <div className="d__body">
            {/* <Header data-test="d__header" /> */}
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
                                    appType = {props.appType}
                                    fetchingDetails={props.fetchingDetails}
                                />
                            } 
                            bottomContent={
                                <BottomContent 
                                    disable={disableActionBar}
                                    setImported={setImported} 
                                    setOverlay={setOverlay}
                                    setShowConfirmPop={setShowConfirmPop}
                                    appType = {props.appType}
                                    fetchingDetails={props.fetchingDetails}
                                />
                            }
                />
                <DesignContent data-test="d__contents" 
                                key={777} 
                                showDlg={showDpndntTcDlg} 
                                setShowDlg={setShowDpndntTcDlg}
                                dTcFlag={dTcFlag} 
                                setDTcFlag={setDTcFlag} 
                                setCheckedTc={setCheckedTc}
                                checkedTc={checkedTc} 
                                isMac={isMac}
                                disable={disableActionBar} 
                                setOverlay={setOverlay}

                                current_task={current_task} 
                                imported={imported} 
                                setImported={setImported} 
                                setMirror={setMirror}
                                setShowConfirmPop={setShowConfirmPop}
                                setDisableActionBar={setDisableActionBar}
                                appType = {props.appType}
                                fetchingDetails={props.fetchingDetails}
                                
                                />
                {/* <div style={{ display: 'flex',alignItems:'center', }}>
                    <div >
                <img style={{ height: '1.1rem' }} onClick={closeBar} src={'static/imgs/collapseButton.png'}/></div> */}
                {/* {<div style={{width:Collapsed? '5rem':'0rem'}}> */}
                <div>
                    <ReferenceContent  hideInfo={props.hideInfo} collapse={true} data-test="d__refBar" mirror={mirror} appType={props.appType} openScrapeCapture={openScrapeCapture}/> </div>
                    </div>
                {/* }</div> */}
                
            {/* </div> */}
            {/* <div data-test="d__footer" className='d__footer'><Footer/></div> */}
        </div>
        </>}
        </>
    );
}


export default DesignHome;