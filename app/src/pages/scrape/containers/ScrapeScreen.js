import React ,{ useState, useEffect } from 'react';
import {useSelector, useDispatch} from "react-redux"
import { useHistory } from 'react-router-dom';
import ScrapeObjectList from './ScrapeObjectList';
import CompareObjectList from './CompareObjectList';
import WebserviceScrape from './WebserviceScrape';
import RefBarItems from '../components/RefBarItems.js';
import AddObjectModal from '../components/AddObjectModal';
import CompareObjectModal from '../components/CompareObjectModal';
import MapObjectModal from '../components/MapObjectModal';
import CertificateModal from '../components/CertificateModal';
import { CreateObjectModal, EditObjectModal } from '../components/CustomObjectModal';
import ActionBarItems from '../components/ActionBarItems';
import LaunchApplication from '../components/LaunchApplication';
import { ScrapeContext } from '../components/ScrapeContext';
import { Header, FooterTwo as Footer, ScreenOverlay, RedirectPage, PopupMsg, ModalContainer, ResetSession } from '../../global';
import * as scrapeApi from '../api';
import * as actionTypes from '../state/action';
import * as pluginActions from "../../plugin/state/action";
import '../styles/ScrapeScreen.scss';

const ScrapeScreen = ()=>{
    const dispatch = useDispatch();
    const history = useHistory();
    const current_task = useSelector(state=>state.plugin.CT);
    const  { user_id, role } = useSelector(state=>state.login.userinfo);
    const compareFlag = useSelector(state=>state.scrape.compareFlag);
    
    const [overlay, setOverlay] = useState(null);
    const [showPop, setShowPop] = useState("");
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [scrapeItems, setScrapeItems] = useState([]);
    const [mainScrapedData, setMainScrapedData] = useState({});
    const [saved, setSaved] = useState(true);
    const [mirror, setMirror] = useState(null);
    const [showAppPop, setShowAppPop] = useState(false);
    const [isUnderReview, setIsUnderReview] = useState(false);
    const [scrapedURL, setScrapedURL] = useState("");
    const [hideSubmit, setHideSubmit] = useState(true);
    const [showObjModal, setShowObjModal] = useState(false);
    const [newScrapedData, setNewScrapedData] = useState({});

    useEffect(() => {
        if(Object.keys(current_task).length != 0) {
            fetchScrapeData()
            .then(data => setIsUnderReview(current_task.status === "underReview"))
            .catch(error=> console.log(error));
        }
    }, [current_task])

    const fetchScrapeData = () => {
		return new Promise((resolve, reject) => {
            setOverlay("Loading...");
            
            let viewString = scrapeItems;
            let haveItems = viewString.length !== 0;

            scrapeApi.getScrapeDataScreenLevel_ICE(current_task.appType, current_task.screenId, current_task.projectId, current_task.testCaseId)
            .then(data => {
                if (current_task.subTask === "Scrape") setScrapedURL(data.scrapedurl);
                
                if (data === "Invalid Session") return RedirectPage(history);
                else if (typeof data === "object" && current_task.appType!=="Webservice") {

                    viewString = data;

                    if(viewString.reuse && current_task.reuse !== viewString.reuse){
                        let task = { ...current_task }
                        task.reuse = true;
                        dispatch({ type: pluginActions.SET_CT, payload: task });
                    }
                    
                    haveItems = viewString.view.length !== 0;
                    
                    if (haveItems) {
                        let newScrapeList = generateScrapeItemList(-1, 0, viewString, true);

                        setMainScrapedData(viewString);
                        setMirror(viewString.mirror);
                        setNewScrapedData([]);
                        setScrapeItems(newScrapeList);
                        setHideSubmit(false);
                        setSaved(true);
                        setOverlay("");
                        dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                        dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                        dispatch({type: actionTypes.SET_COMPAREDATA, payload: {}});
                        dispatch({type: actionTypes.SET_COMPAREOBJ, payload: {changedObj: [], notChangedObj: [], notFoundObj: []}});
                        dispatch({type: actionTypes.SET_COMPAREFLAG, payload: false});
                    }
                    else {
                        setScrapeItems([]);
                        setMainScrapedData({});
                        setNewScrapedData([]);
                        setMirror(null);
                        setSaved(true);
                        setHideSubmit(true);
                        dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                        dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                        dispatch({type: actionTypes.SET_COMPAREDATA, payload: {}});
                        dispatch({type: actionTypes.SET_COMPAREOBJ, payload: {changedObj: [], notChangedObj: [], notFoundObj: []}});
                        dispatch({type: actionTypes.SET_COMPAREFLAG, payload: false});
                        setOverlay("");
                    }
                }
                else if (typeof data === "object" && current_task.appType==="Webservice"){
                    console.log(data);
                    setScrapeItems([]);
                    setMainScrapedData({});
                    setNewScrapedData([]);
                    setMirror(null);
                    setSaved(true);
                    setHideSubmit(true);
                    setOverlay("");
                }
                else{
                    dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                    dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                    // screenshot
                }
            resolve("success");
            })
            .catch(error => {
                dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                console.error("error", error);
                setOverlay("");
                reject("fail")
            })
        });
    }

    const startScrape = (browserType, compareFlag) => {
        let appType = current_task.appType;
        let screenViewObject = {};
        let blockMsg = 'Scraping in progress. Please Wait...';
        if (compareFlag) {
            blockMsg = 'Comparing objects in progress...';
            setShowObjModal(false);
        };

        screenViewObject = getScrapeViewObject(appType, browserType, compareFlag, mainScrapedData, newScrapedData);
        setShowAppPop(false);
        setOverlay(blockMsg);

        ResetSession.start();
        scrapeApi.initScraping_ICE(screenViewObject)
            .then(data=> {
                let err = null;
                setOverlay("");
                ResetSession.end();
                if (data === "Invalid Session") return RedirectPage(history);
                else if (data === "Response Body exceeds max. Limit.")
                    err = { 'title': 'Scrape Screen', 'content': 'Scraped data exceeds max. Limit.' };
                else if (data === 'scheduleModeOn' || data === "unavailableLocalServer") {
                    let scrapedItemsLength = scrapeItems.length;

                    if (scrapedItemsLength > 0) dispatch({ type: actionTypes.SET_DISABLEACTION, payload: true });
                    else dispatch({ type: actionTypes.SET_DISABLEACTION, payload: false });

                    setSaved(false);
                    err = {
                        'title': 'Scrape Screen', 'content':
                            data === 'scheduleModeOn' ?
                                "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed." :
                                "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server."
                    };
                } else if (data === "fail")
                    err = { 'title': 'Scrape', 'content': 'Failed to scrape.' };
                else if (data === "Terminate") {
                    setOverlay("");
                    err = { 'title': 'Scrape Screen', 'content': 'Scrape Terminated' };
                }
                else if (data === "wrongWindowName")
                    err = { 'title': 'Scrape', 'content': 'Wrong window name.' };
                else if (data === "ExecutionOnlyAllowed")
                    err = { 'title': 'Scrape Screen', 'content': 'Execution Only Allowed' };

                if (err) {
                    setShowPop(err);
                    return false;
                }
                //COMPARE & UPDATE SCRAPE OPERATION
                if (data.action == "compare") {
                    if (data.status === "SUCCESS") {
                        let compareObj = generateCompareObject(data);
                        dispatch({type: actionTypes.SET_COMPAREDATA, payload: data});
                        dispatch({type: actionTypes.SET_COMPAREOBJ, payload: compareObj});
                        dispatch({type: actionTypes.SET_COMPAREFLAG, payload: true});
                    } else {
                        if (data.status =="EMPTY_OBJECT")
                            setShowPop({title: "Compare Objects", content: "Failed to compare objects - Unmapped object(s) found"});
                        else
                            setShowPop({title: "Compare Objects", content: "Failed to compare objects"});
                    }
                } else {
                    let viewString = data;

                    if (viewString.view.length !== 0){
                        let lastObj = scrapeItems[scrapeItems.length-1];
                        let lastVal = lastObj ? lastObj.val : 0;
                        let lastIdx = newScrapedData.view ? newScrapedData.view.length : 0;

                        let scrapeItemList = generateScrapeItemList(lastVal, lastIdx, viewString);

                        let updatedNewScrapeData = {...newScrapedData};
                        if (updatedNewScrapeData.view) {
                            let viewArr = [...updatedNewScrapeData.view]
                            viewArr.push(...viewString.view);
                            updatedNewScrapeData = { ...viewString, view: viewArr};
                        }
                        else updatedNewScrapeData = viewString;

                        setNewScrapedData(updatedNewScrapeData);
                        updateScrapeItems(scrapeItemList);
                        setScrapedURL(updatedNewScrapeData.scrapedurl);
                        setMirror(viewString.mirror);
                        
                        if (viewString.view.length > 0) setSaved(false);
                    }                        
                }


            })
            .catch(error => {
                setOverlay("");
                ResetSession.end();
                setShowPop({'title': "Scrape Screen",'content': "Error while performing Scrape."});
                console.error("Fail to Load design_ICE. Cause:", error);
            });
    }

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
                <button onClick={showConfirmPop.onClick}>
                    {showConfirmPop.continueText ? showConfirmPop.continueText : "Yes"}
                </button>
                <button onClick={()=>setShowConfirmPop(false)}>
                    {showConfirmPop.rejectText ? showConfirmPop.rejectText : "No"}
                </button>
                </>
            }
        />
    )

    const updateScrapeItems = newList => {
        setScrapeItems([...scrapeItems, ...newList])
    }

    return (
        <>
        { overlay && <ScreenOverlay content={overlay} />}
        { showPop && <PopupDialog />}
        { showConfirmPop && <ConfirmPopup /> }
        { showObjModal === "mapObject" && <MapObjectModal setShow={setShowObjModal} setShowPop={setShowPop} scrapeItems={scrapeItems} current_task={current_task} user_id={user_id} role={role} fetchScrapeData={fetchScrapeData} history={history} /> }
        { showObjModal === "addObject" && <AddObjectModal setShow={setShowObjModal} setShowPop={setShowPop} scrapeItems={scrapeItems} setScrapeItems={setScrapeItems} setSaved={setSaved}/> }
        { showObjModal === "compareObject" && <CompareObjectModal setShow={setShowObjModal} startScrape={startScrape} /> }
        { showObjModal === "createObject" && <CreateObjectModal setSaved={setSaved} setShow={setShowObjModal} scrapeItems={scrapeItems} updateScrapeItems={updateScrapeItems} setShowPop={setShowPop} newScrapedData={newScrapedData} setNewScrapedData={setNewScrapedData} />}
        { showObjModal === "addCert" && <CertificateModal setShow={setShowObjModal} setShowPop={setShowPop} /> }
        { showObjModal.operation === "editObject" && <EditObjectModal utils={showObjModal} setSaved={setSaved} scrapeItems={scrapeItems} setShow={setShowObjModal} setShowPop={setShowPop}/>}
        { showAppPop && <LaunchApplication setShow={setShowAppPop} appPop={showAppPop} />}
        <div  className="ss__body">
            <Header/>
            <div className="ss__mid_section">
                <ScrapeContext.Provider value={{ startScrape, setScrapedURL, scrapedURL, isUnderReview, fetchScrapeData, setShowObjModal, saved, setShowAppPop, setSaved, newScrapedData, setNewScrapedData, setShowConfirmPop, mainScrapedData, scrapeItems, setScrapeItems, hideSubmit, setOverlay, setShowPop, updateScrapeItems }}>
                    <ActionBarItems />
                    { current_task.appType === "Webservice" 
                        ? <WebserviceScrape /> 
                        : compareFlag ? <CompareObjectList /> : <ScrapeObjectList />}
                    <RefBarItems mirror={mirror}/>
                </ScrapeContext.Provider>
            </div>
            <div className='ss__footer'><Footer/></div>
        </div>
        </>
    );
}

export default ScrapeScreen;


function getScrapeViewObject(appType, browserType, compareFlag, mainScrapedData, newScrapedData) {
    let screenViewObject = {};
    //For PDF
    if (browserType === "pdf"){
        screenViewObject.appType = browserType;
    }
    //For Desktop
    else if (appType === "Desktop") {
        screenViewObject.appType = appType;
        screenViewObject.applicationPath = browserType.appPath;
        screenViewObject.processID = browserType.processID;
        screenViewObject.scrapeMethod = browserType.method;
    }
    //For SAP
    else if (appType === "SAP") {
        screenViewObject.appType = appType;
        screenViewObject.applicationPath = browserType.appName;
    }
    //For Mobility
    else if (appType === "MobileApp") {
        if (browserType.appPath.toLowerCase().indexOf(".apk") >= 0) {
            screenViewObject.appType = appType;
            screenViewObject.apkPath = browserType.appPath;
            screenViewObject.mobileSerial = browserType.sNum;
        } 
        else if (browserType.appPath.toLowerCase().indexOf(".ios") >= 0) {
            screenViewObject.appType = appType;
            screenViewObject.deviceName = browserType.appPath2;
            screenViewObject.versionNumber = browserType.verNum;
            screenViewObject.bundleId = browserType.deviceName;
            screenViewObject.ipAddress =  browserType.uuid;
            screenViewObject.param = 'ios';
        }
        else {
            screenViewObject.appType = appType;
            screenViewObject.apkPath = browserType.appPath;
            screenViewObject.mobileDeviceName = browserType.deviceName;
            screenViewObject.mobileUDID = browserType.uuid;
        }
    }
    //For Mobility Web
    else if (appType === "MobileWeb") {
        screenViewObject.appType = appType;
        screenViewObject.mobileSerial = browserType.slNum;
        screenViewObject.androidVersion = browserType.vernNum;
        if (compareFlag) {
            // screenViewObject.viewString = viewString;
            screenViewObject.action = "compare";
        }
        screenViewObject.browserType = browserType;
    }
    // For OEBS
    else if (appType === "OEBS") {
        screenViewObject.appType = appType;
        screenViewObject.applicationPath = browserType.winName;
    }
    //For Web
    else {
        if (compareFlag) {
            let viewString = Object.keys(newScrapedData).length ? {...newScrapedData, view: [...mainScrapedData.view, ...newScrapedData.view]} : { ...mainScrapedData };
            screenViewObject.viewString = viewString;
            screenViewObject.action = "compare";
        }
        screenViewObject.browserType = browserType;
    }

    return screenViewObject;
}

function generateCompareObject(data){
    let compareObj = {};
    if (data.view[0].changedobject.length > 0) {
        let localList = [];
        for (let i = 0; i < data.view[0].changedobject.length; i++) {
            let scrapeObject = data.view[0].changedobject[i];
            
            let scrapeItem = {
                ObjId: scrapeObject._id,
                objIdx: i,
                val: data.changedobjectskeys[i],
                tag: scrapeObject.tag,
                title: scrapeObject.custname.replace(/[<>]/g, '').trim(),
                custname: scrapeObject.custname,
            }

            localList.push(scrapeItem);
        }
        compareObj.changedObj = localList;
    }
    if (data.view[1].notchangedobject.length > 0) {
        let localList = [];
        for (let i = 0; i < data.view[1].notchangedobject.length; i++) {
            let scrapeObject = data.view[1].notchangedobject[i];
            
            let scrapeItem = {
                ObjId: scrapeObject._id,
                objIdx: i,
                val: i,
                tag: scrapeObject.tag,
                title: scrapeObject.custname.replace(/[<>]/g, '').trim(),
                custname: scrapeObject.custname,
            }

            localList.push(scrapeItem);
        }   
        compareObj.notChangedObj = localList;
    }
    if (data.view[2].notfoundobject.length > 0) {
        let localList = [];
        for (let i = 0; i < data.view[2].notfoundobject.length; i++) {
            let scrapeObject = data.view[2].notfoundobject[i];
            
            let scrapeItem = {
                ObjId: scrapeObject._id,
                objIdx: i,
                val: i,
                tag: scrapeObject.tag,
                title: scrapeObject.custname.replace(/[<>]/g, '').trim(),
                custname: scrapeObject.custname,
            }

            localList.push(scrapeItem);
        }
        compareObj.notFoundObj = localList;
    }
    return compareObj;
} 

function generateScrapeItemList(lastVal, lastIdx, viewString, fetchDataFlag){
    let localScrapeList = [];
    for (let i = 0; i < viewString.view.length; i++) {
                            
        let scrapeObject = viewString.view[i];
        
        if (scrapeObject.cord) {
            scrapeObject.hiddentag = "No";
            scrapeObject.tag = `iris;${scrapeObject.objectType}`;
            scrapeObject.url = "";
            scrapeObject.xpath = `iris;${scrapeObject.custname};${scrapeObject.left};${scrapeObject.top};${(scrapeObject.width + scrapeObject.left)};${(scrapeObject.height + scrapeObject.top)};${scrapeObject.tag}`;
        }

        let scrapeItem = {  objId: scrapeObject._id,
                            objIdx: lastIdx++,
                            val: ++lastVal,
                            tag: scrapeObject.tag,
                            hide: false,
                            title: scrapeObject.custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim(),
                            custname: scrapeObject.custname,
                            hiddentag: scrapeObject.hiddentag,
                            checked: false,
                            url: scrapeObject.url,
                            xpath: scrapeObject.xpath,
                        }

        if (fetchDataFlag){
            if(scrapeObject.hasOwnProperty('editable')){
                scrapeItem.editable = true;
            } else {
                let isCustom = scrapeObject.xpath === "";
                scrapeItem.isCustom = isCustom;
            };
        }
        
        localScrapeList.push(scrapeItem);
    }

    return localScrapeList;
}
