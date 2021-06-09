import React ,{ useState, useEffect } from 'react';
import {useSelector, useDispatch} from "react-redux"
import {v4 as uuid} from 'uuid';
import { useHistory } from 'react-router-dom';
import ScrapeObjectList from './ScrapeObjectList';
import CompareObjectList from './CompareObjectList';
import WebserviceScrape from './WebserviceScrape';
import RefBarItems from '../components/RefBarItems.js';
import AddObjectModal from '../components/AddObjectModal';
import CompareObjectModal from '../components/CompareObjectModal';
import MapObjectModal from '../components/MapObjectModal';
import CertificateModal from '../components/CertificateModal';
import EditIrisObject from '../components/EditIrisObject';
import { CreateObjectModal, EditObjectModal } from '../components/CustomObjectModal';
import ActionBarItems from '../components/ActionBarItems';
import LaunchApplication from '../components/LaunchApplication';
import { ScrapeContext } from '../components/ScrapeContext';
import { Header, FooterTwo as Footer, ScreenOverlay, RedirectPage, PopupMsg, ModalContainer, ResetSession } from '../../global';
import * as scrapeApi from '../api';
import * as actionTypes from '../state/action';
import '../styles/ScrapeScreen.scss';

const ScrapeScreen = ()=>{
    const dispatch = useDispatch();
    const history = useHistory();
    const current_task = useSelector(state=>state.plugin.CT);
    const certificateInfo = useSelector(state=>state.scrape.cert);
    const  { user_id, role } = useSelector(state=>state.login.userinfo);
    const compareFlag = useSelector(state=>state.scrape.compareFlag);
    const {endPointURL, method, opInput, reqHeader, reqBody, paramHeader} = useSelector(state=>state.scrape.WsData);

    const [overlay, setOverlay] = useState(null);
    const [showPop, setShowPop] = useState("");
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [scrapeItems, setScrapeItems] = useState([]);
    const [mainScrapedData, setMainScrapedData] = useState({});
    const [saved, setSaved] = useState(true);
    const [mirror, setMirror] = useState({scrape: null, compare: null});
    const [showAppPop, setShowAppPop] = useState(false);
    const [isUnderReview, setIsUnderReview] = useState(false);
    const [scrapedURL, setScrapedURL] = useState("");
    const [hideSubmit, setHideSubmit] = useState(true);
    const [showObjModal, setShowObjModal] = useState(false);
    const [newScrapedData, setNewScrapedData] = useState({});
    const [orderList, setOrderList] = useState([]);

    useEffect(() => {
        if(Object.keys(current_task).length !== 0) {
            fetchScrapeData()
            .then(data => setIsUnderReview(current_task.status === "underReview"))
            .catch(error=> console.log(error));
        }
        //eslint-disable-next-line
    }, [current_task])

    useEffect(()=>{
        if (!showObjModal) {
            let selected = 0;
            let selectedObj = null;

            scrapeItems.forEach(item=>{
                if (!item.hide && item.checked) {
                    selected++;
                    selectedObj = item;
                }
            })

            if (selected === 1 && selectedObj && selectedObj.editable && selectedObj.tag && selectedObj.tag.substring(0, 4) === "iris") {
                let localScrapeItems = [...scrapeItems];

                localScrapeItems.forEach(item => { if (!item.hide) {
                    item.checked = false;
                }})
                
                setScrapeItems(localScrapeItems);
            }
        }
    }, [showObjModal])

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
                    
                    haveItems = viewString.view.length !== 0;
                    
                    if (haveItems) {
                        let [newScrapeList, newOrderList] = generateScrapeItemList(0, viewString);

                        setMainScrapedData(viewString);
                        setMirror({scrape: viewString.mirror, compare: null});
                        setNewScrapedData([]);
                        setScrapeItems(newScrapeList);
                        setHideSubmit(false);
                        setSaved(true);
                        setOrderList(newOrderList);
                    }
                    else {
                        setScrapeItems([]);
                        setMainScrapedData({});
                        setNewScrapedData([]);
                        setMirror({scrape: null, compare: null});
                        setSaved(true);
                        setHideSubmit(true);
                        setOrderList([]);
                    }
                    setOverlay("");
                    dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                    dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                }
                else if (typeof data === "object" && current_task.appType==="Webservice"){
                    haveItems = data.endPointURL && data.method;
                    if (haveItems) {
                        
                        let localReqBody = "";
                        if (data.body) localReqBody = getProcessedBody(data.body, 'fetch');
                        
                        let localRespBody = "";
                        if (data.responseBody) localRespBody = getProcessedBody(data.responseBody, 'fetch');

                        dispatch({
                            type: actionTypes.SET_WSDATA, 
                            payload: {
                                endPointURL: data.endPointURL,
                                method : data.method,
                                opInput : data.operations || "",
                                reqHeader : data.header ? data.header.split("##").join("\n"): "",
                                reqBody : localReqBody,
                                paramHeader : data.param ? data.param.split("##").join("\n"): "",
                                respHeader : data.responseHeader ? data.responseHeader.split("##").join("\n") : "",
                                respBody : localRespBody
                            }
                        });
                        setSaved(true);
                        setHideSubmit(false);
					} else {
                        setSaved(false);
                        setHideSubmit(true);
                        dispatch({type: actionTypes.SET_WSDATA, payload: {
                            endPointURL: "", method: "0", opInput: "", reqHeader: "",
                            reqBody: "", respHeader: "", respBody: "", paramHeader: "",
                        }});
                    }
                    setOverlay("");
                    dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                    dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                    dispatch({type: actionTypes.SET_ACTIONERROR, payload: []});
                    dispatch({type: actionTypes.SET_WSDLERROR, payload: []});
                }
                else{
                    dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                    dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                    setOverlay("");
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
        if (appType === "Webservice") {
            let arg = {}
            let testCaseWS = []
            let keywordVal = ["setEndPointURL", "setMethods", "setOperations", "setHeader", "setWholeBody"];
            let wsdlInputs = [ 
                endPointURL, method, opInput, getFormattedValue(reqHeader), 
                getFormattedValue(paramHeader), getFormattedValue(reqBody, true) 
            ];

            if (Object.keys(certificateInfo).length)
                wsdlInputs.push(...[certificateInfo.certsDetails+";", certificateInfo.authDetails]);

            if (endPointURL.indexOf('https')===0) 
                arg.res = certificateInfo;

            let [ error, auth, proceed ] = validateWebserviceInputs(wsdlInputs);

            if (error) dispatch({type: actionTypes.SET_ACTIONERROR, payload: error});

            if (proceed) {
                dispatch({type: actionTypes.SET_ACTIONERROR, payload: []});
                if (auth)
                    keywordVal.push(...["addClientCertificate","setBasicAuth"])

                if (wsdlInputs[4]) keywordVal.splice(4, 0, 'setParamValue');
                else wsdlInputs.splice(4, 1);

                setOverlay("Fetching Response Header & Body...");
                ResetSession.start();
                for (let i = 0; i < wsdlInputs.length; i++) {
                    if (wsdlInputs[i] !== "") {
                        testCaseWS.push(getWSTestCase(i, appType, wsdlInputs[i], keywordVal[i]));
                    }
                }
                testCaseWS.push(getWSTestCase(testCaseWS.length, appType, "", "executeRequest"));
                arg.testcasename = "";
                arg.apptype = "Webservice";
                arg.testcase = testCaseWS;
                scrapeApi.initScrapeWS_ICE(arg)
                .then(data => {
                    setOverlay("");
                    ResetSession.end();
                    if (data === "Invalid Session") {
                        return RedirectPage(history);
                    } else if (data === "unavailableLocalServer") {
                        setShowPop({title: "Web Service Screen", content: "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server."});
                    } else if (data === "scheduleModeOn") {
                        setShowPop({title: "Web Service Screen", content: "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed."});
                    } else if (data === "ExecutionOnlyAllowed" || data["responseHeader"] === "ExecutionOnlyAllowed"){
                        setShowPop({title: "Web Service Screen", content: "Execution Only Allowed"});
                    } else if (typeof data === "object") {
                        setShowPop({title: "Data Retrieve", content: "Web Service response received successfully"});
                        dispatch({type: actionTypes.SET_WSDATA, payload: {respHeader: data.responseHeader[0].split("##").join("\n")}});
                        let localRespBody = getProcessedBody(data.responseBody[0], 'scrape');
                        dispatch({type: actionTypes.SET_WSDATA, payload: {respBody: localRespBody}});
                    } else setShowPop({title: "Debug Web Service", content: "Debug Terminated."});
                })
                .catch(error => {
                    setOverlay("");
                    ResetSession.end();
                    setShowPop({title: "Web Service Screen", content: "Error while performing operation."});
                    console.error("Fail to initScrapeWS_ICE. ERROR::::", error);
                });
            }
        } else {
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
                    err = { 'title': 'Scrape', 'content': 'Window not found - Please provide valid window name.' };
                else if (data === "ExecutionOnlyAllowed")
                    err = { 'title': 'Scrape Screen', 'content': 'Execution Only Allowed' };

                if (err) {
                    setShowPop(err);
                    return false;
                }
                //COMPARE & UPDATE SCRAPE OPERATION
                if (data.action === "compare") {
                    if (data.status === "SUCCESS") {
                        let compareObj = generateCompareObject(data, scrapeItems.filter(object => object.xpath.substring(0, 4)==="iris"));
                        setMirror(oldMirror => ({ ...oldMirror, compare: data.mirror}));
                        dispatch({type: actionTypes.SET_COMPAREDATA, payload: data});
                        dispatch({type: actionTypes.SET_COMPAREOBJ, payload: compareObj});
                        dispatch({type: actionTypes.SET_COMPAREFLAG, payload: true});
                    } else {
                        if (data.status === "EMPTY_OBJECT")
                            setShowPop({title: "Compare Objects", content: "Failed to compare objects - Unmapped object(s) found"});
                        else
                            setShowPop({title: "Compare Objects", content: "Failed to compare objects"});
                    }
                } else {
                    let viewString = data;

                    if (viewString.view.length !== 0){
                        let lastIdx = newScrapedData.view ? newScrapedData.view.length : 0;

                        let [scrapeItemList, newOrderList] = generateScrapeItemList(lastIdx, viewString, "new");

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
                        setMirror({scrape: viewString.mirror, compare: null});
                        setOrderList(oldOrderList => [...oldOrderList, ...newOrderList]);
                        
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
    }

    const PopupDialog = () => (
        showPop.type === "modal" ? 
        <ModalContainer 
            title={showPop.title}
            modalClass="modal-sm"
            close={()=>setShowPop("")}
            content={showPop.content}
            footer={showPop.footer}
        /> :
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
        { showObjModal === "mapObject" && <MapObjectModal setShow={setShowObjModal} setShowPop={setShowPop} scrapeItems={scrapeItems} current_task={current_task} user_id={user_id} role={role} fetchScrapeData={fetchScrapeData} history={history} orderList={orderList} /> }
        { showObjModal === "addObject" && <AddObjectModal setShow={setShowObjModal} setShowPop={setShowPop} scrapeItems={scrapeItems} setScrapeItems={setScrapeItems} setSaved={setSaved} setOrderList={setOrderList} /> }
        { showObjModal === "compareObject" && <CompareObjectModal setShow={setShowObjModal} startScrape={startScrape} /> }
        { showObjModal === "createObject" && <CreateObjectModal setSaved={setSaved} setShow={setShowObjModal} scrapeItems={scrapeItems} updateScrapeItems={updateScrapeItems} setShowPop={setShowPop} newScrapedData={newScrapedData} setNewScrapedData={setNewScrapedData} setOrderList={setOrderList} />}
        { showObjModal === "addCert" && <CertificateModal setShow={setShowObjModal} setShowPop={setShowPop} /> }
        { showObjModal.operation === "editObject" && <EditObjectModal utils={showObjModal} setSaved={setSaved} scrapeItems={scrapeItems} setShow={setShowObjModal} setShowPop={setShowPop}/>}
        { showObjModal.operation === "editIrisObject" && <EditIrisObject utils={showObjModal} setShow={setShowObjModal} setShowPop={setShowPop} taskDetails={{projectid: current_task.projectId, screenid: current_task.screenId, screenname: current_task.screenName,versionnumber: current_task.versionnumber, appType: current_task.appType}} />}
        { showAppPop && <LaunchApplication setShow={setShowAppPop} appPop={showAppPop} />}
        <div data-test="ssBody" className="ss__body">
            <Header/>
            <div data-test="ssMidSection" className="ss__mid_section">
                <ScrapeContext.Provider value={{ startScrape, setScrapedURL, scrapedURL, isUnderReview, fetchScrapeData, setShowObjModal, saved, setShowAppPop, setSaved, newScrapedData, setNewScrapedData, setShowConfirmPop, mainScrapedData, scrapeItems, setScrapeItems, hideSubmit, setOverlay, setShowPop, updateScrapeItems, orderList }}>
                    <ActionBarItems />
                    { current_task.appType === "Webservice" 
                        ? <WebserviceScrape /> 
                        : compareFlag ? <CompareObjectList /> : <ScrapeObjectList />}
                    <RefBarItems mirror={mirror}/>
                </ScrapeContext.Provider>
            </div>
            <div data-test="ssFooter"className='ss__footer'><Footer/></div>
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
            screenViewObject.viewString = {...viewString, view: viewString.view.filter(object => object.xpath.substring(0, 4)!=="iris")};
            screenViewObject.action = "compare";
        }
        screenViewObject.browserType = browserType;
    }

    return screenViewObject;
}

function generateCompareObject(data, irisObjects){
    let compareObj = {};
    if (data.view[0].changedobject.length > 0) {
        let localList = [];
        for (let i = 0; i < data.view[0].changedobject.length; i++) {
            let scrapeItem = getCompareScrapeItem(uuid(), data.view[0].changedobject[i]);
            localList.push(scrapeItem);
        }
        compareObj.changedObj = localList;
    }
    if (data.view[1].notchangedobject.length > 0) {
        let localList = [];
        for (let i = 0; i < data.view[1].notchangedobject.length; i++) {
            let scrapeItem = getCompareScrapeItem(uuid(), data.view[1].notchangedobject[i])
            localList.push(scrapeItem);
        }   
        compareObj.notChangedObj = localList;
    }
    if (data.view[2].notfoundobject.length > 0 || irisObjects.length > 0) {
        let localList = [];
        if (data.view[2].notfoundobject.length > 0) {
            for (let i = 0; i < data.view[2].notfoundobject.length; i++) {
                let scrapeItem = getCompareScrapeItem(uuid(), data.view[2].notfoundobject[i])
                localList.push(scrapeItem);
            }
        }
        compareObj.notFoundObj = [...localList, ...irisObjects];
    }
    return compareObj;
} 

function getCompareScrapeItem(numValue, scrapeObject) {
    return {
        ObjId: scrapeObject._id,
        val: numValue,
        tag: scrapeObject.tag,
        title: scrapeObject.custname.replace(/[<>]/g, '').trim(),
        custname: scrapeObject.custname,
        top: scrapeObject.top,
        left: scrapeObject.left,
        height: scrapeObject.height,
        width: scrapeObject.width,
        xpath: scrapeObject.xpath,
        url: scrapeObject.url,
    }
}

function generateScrapeItemList(lastIdx, viewString, type="old"){
    let localScrapeList = [];
    let orderList = viewString.orderlist;
    let orderDict = {};
    for (let i = 0; i < viewString.view.length; i++) {
                            
        let scrapeObject = viewString.view[i];
        let newTag = scrapeObject.tag;
        
        if (scrapeObject.cord) {
            scrapeObject.hiddentag = "No";
            newTag = `iris;${(scrapeObject.objectType || "").toLowerCase()}`;
            scrapeObject.url = "";
            // if (scrapeObject.xpath.split(';').length<2)
            scrapeObject.xpath = `iris;${scrapeObject.custname};${scrapeObject.left};${scrapeObject.top};${(scrapeObject.width + scrapeObject.left)};${(scrapeObject.height + scrapeObject.top)};${(scrapeObject.objectType || "").toLowerCase()};${(scrapeObject.objectStatus || "0")};${scrapeObject.tag}`;
        }

        let newUUID = uuid();
        let scrapeItem = {  objId: scrapeObject._id,
                            objIdx: lastIdx,
                            val: newUUID,
                            tag: newTag,
                            hide: false,
                            title: scrapeObject.custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim(),
                            custname: scrapeObject.custname,
                            hiddentag: scrapeObject.hiddentag,
                            checked: false,
                            url: scrapeObject.url,
                            xpath: scrapeObject.xpath,
                            top: scrapeObject.top,
                            left: scrapeObject.left,
                            height: scrapeObject.height,
                            width: scrapeObject.width,
                        }

        
        if (type === "new") scrapeItem.tempOrderId = newUUID;
        if(scrapeObject.hasOwnProperty('editable') || scrapeObject.cord){
            scrapeItem.editable = true;
        } else {
            let isCustom = scrapeObject.xpath === "";
            scrapeItem.isCustom = isCustom;
        };
        
        if(scrapeItem.objId) {
            orderDict[scrapeItem.objId] = scrapeItem;
        }
        else orderDict[scrapeItem.tempOrderId] = scrapeItem;

        lastIdx++;
    }

    if (orderList && orderList.length) 
        orderList.forEach(orderId => localScrapeList.push(orderDict[orderId]))
    else {
        localScrapeList = Object.values(orderDict);
        orderList = Object.keys(orderDict);
    }

    return [localScrapeList, orderList];
}


function getProcessedBody (body, type) {
    let processedBody = body;
    if (body.indexOf("{") === 0 || body.indexOf("[") === 0) 
        processedBody = JSON.stringify(JSON.parse(body), null, '\t');
    else 
        processedBody = formatXml(body.replace(/>\s+</g, '><'));

    if (type === 'scrape')
        processedBody = processedBody.replace(/\&gt;/g, '>').replace(/\&lt;/g, '<');
    else if (type === 'fetch' && processedBody === '\r\n')
        processedBody = '';

    return processedBody;
}

function getFormattedValue (value, extraspace) {
    if (extraspace) return value.replace(/[\n\r]/g, '##').replace(/\s\s+/g, ' ').replace(/"/g, '\"');
    return value.replace(/[\n\r]/g, '##').replace(/"/g, '\"');
}

function validateWebserviceInputs (wsdlInputs) {
    let error = false;
    let auth = false;
    let proceed = false;

    if (!wsdlInputs[0]) error = ["endPointURL"];
    else if (wsdlInputs[1]==="0") error = ["method"];
    else if (wsdlInputs[6]){
        auth = true;
        proceed = true;
    }
    else {
        if (wsdlInputs[1] === "POST") {
            if (!wsdlInputs[3]) error = ["reqHeader"];
            else if (!wsdlInputs[5]) error = ["reqBody"];
            else proceed = true;
        } else proceed = true;
    }

    return [error, auth, proceed];
}

function getWSTestCase (stepNo, appType, input, keyword) {
    return {
        "stepNo": stepNo + 1, "appType": appType, "objectName": "", "inputVal": [input],
        "keywordVal": keyword, "outputVal": "", "url": "", "custname": "", "remarks": [""],
        "addTestCaseDetails": "", "addTestCaseDetailsInfo": ""
    }
}

function formatXml(xml) {
	let formatted = '';
	let reg = /(>)(<)(\/*)/g;
	xml = xml.replace(reg, '$1\r\n$2$3');
	let pad = 0;
	xml.split('\r\n').forEach(function (node, index) {
		let indent = 0;
		if (node.match(/.+<\/\w[^>]*>$/)) {
			indent = 0;
		} else if (node.match(/^<\/\w/)) {
			if (pad !== 0) {
				pad -= 1;
			}
        } //eslint-disable-next-line
        else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
			indent = 1;
		} else {
			indent = 0;
		}
		let padding = '';
		for (let i = 0; i < pad; i++) {
			padding += '  ';
		}
		formatted += padding + node + '\r\n';
		pad += indent;
	});
	return formatted;
}