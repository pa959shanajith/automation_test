import React ,{ useState, useEffect, useRef } from 'react';
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
import EditIrisObject from '../components/EditIrisObject';
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
    const certificateInfo = useSelector(state=>state.scrape.cert);
    const  { user_id, role } = useSelector(state=>state.login.userinfo);
    const compareFlag = useSelector(state=>state.scrape.compareFlag);
    const {endPointURL, method, opInput, reqHeader, reqBody, respHeader, respBody, paramHeader} = useSelector(state=>state.scrape.WsData);

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
            dispatch({type: actionTypes.SET_COMPAREDATA, payload: {}});
            dispatch({type: actionTypes.SET_COMPAREOBJ, payload: {changedObj: [], notChangedObj: [], notFoundObj: []}});
            dispatch({type: actionTypes.SET_COMPAREFLAG, payload: false});
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
                    if (data.endPointURL && data.method) {
                        dispatch({type: actionTypes.SET_WSDATA, payload: {endPointURL: data.endPointURL}});
                        dispatch({type: actionTypes.SET_WSDATA, payload: {method : data.method}});
                        dispatch({type: actionTypes.SET_WSDATA, payload: {opInput : data.operations || ""}});
                        
                        dispatch({type: actionTypes.SET_WSDATA, payload: {reqHeader : data.header ? data.header.split("##").join("\n"): ""}});
                        dispatch({type: actionTypes.SET_WSDATA, payload: {paramHeader : data.param ? data.param.split("##").join("\n"): ""}});
                        
                        if (data.body){
                            let localReqBody;
                            if (!data.body.indexOf("{") || !data.body.indexOf("[")) {
                                let jsonObj = JSON.parse(data.body);
                                let jsonPretty = JSON.stringify(jsonObj, null, '\t');
                                localReqBody = jsonPretty;
                            } else {
                                localReqBody = formatXml(data.body.replace(/>\s+</g, '><'));
                                if(localReqBody==='\r\n') localReqBody = '';
                            }
                            dispatch({type: actionTypes.SET_WSDATA, payload: {reqBody : localReqBody}});
                        } else dispatch({type: actionTypes.SET_WSDATA, payload: {reqBody : ""}});

                        dispatch({type: actionTypes.SET_WSDATA, payload: {respHeader : data.responseHeader ? data.responseHeader.split("##").join("\n") : ""}});
                        
                        if (data.responseBody) {
                            let localRespBody;
                            if (!data.responseBody.indexOf("{") || !data.responseBody.indexOf("[")) {
                                let jsonObj = JSON.parse(data.responseBody);
                                let jsonPretty = JSON.stringify(jsonObj, null, '\t');
                                localRespBody = jsonPretty;
                            } else {
                                localRespBody = formatXml(data.responseBody.replace(/>\s+</g, '><'));
                                if(localRespBody==='\r\n') localRespBody = '';
                            }
                            dispatch({type: actionTypes.SET_WSDATA, payload: {respBody : localRespBody}});
                        } else dispatch({type: actionTypes.SET_WSDATA, payload: {respBody : ""}});

                        dispatch({type: actionTypes.SET_ACTIONERROR, payload: []});
                        dispatch({type: actionTypes.SET_WSDLERROR, payload: []});
                        setOverlay("");
                        setSaved(true);
                        setHideSubmit(false);
						dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: false});
						dispatch({type: actionTypes.SET_DISABLEACTION, payload: true});
					} else {
                        setSaved(false);
                        setHideSubmit(true);
                        setOverlay("");
                        dispatch({type: actionTypes.SET_ACTIONERROR, payload: []});
                        dispatch({type: actionTypes.SET_WSDLERROR, payload: []});
                        dispatch({type: actionTypes.SET_WSDATA, payload: {
                            endPointURL: "",
                            method: "0",
                            opInput: "",
                            reqHeader: "",
                            reqBody: "",
                            respHeader: "",
                            respBody: "",
                            paramHeader: "",
                        }});
						dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: true});
						dispatch({type: actionTypes.SET_DISABLEACTION, payload: false});
					}
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

            let proceed = false;
            let authCert = false;
            let arg = {}
            let testCaseWS = []
            let keywordVal;
            let wsdlInputs = [ endPointURL, method, opInput ];
            wsdlInputs.push(reqHeader.replace(/[\n\r]/g, '##').replace(/"/g, '\"'));
            wsdlInputs.push(paramHeader.replace(/[\n\r]/g, '##').replace(/"/g, '\"'));
            wsdlInputs.push(reqBody.replace(/[\n\r]/g, '').replace(/\s\s+/g, ' ').replace(/"/g, '\"'));
            if (Object.keys(certificateInfo).length!==0){
                wsdlInputs.push(certificateInfo.certsDetails+";");
                wsdlInputs.push(certificateInfo.authDetails);
            }
            let certURL = endPointURL.indexOf('https')
            if (certURL===0) arg.res = certificateInfo;

            if (!wsdlInputs[0]) dispatch({type: actionTypes.SET_ACTIONERROR, payload: ["endPointURL"]}); // error
            else if (method==="0") dispatch({type: actionTypes.SET_ACTIONERROR, payload: ["method"]}); // error
            else if (wsdlInputs[6]){
                authCert = true;
                proceed = true;
            }
            else {
                if (["GET", "HEAD", "PUT", "DELETE"].includes(wsdlInputs[1])) {
                    if (wsdlInputs[3] && !wsdlInputs[2]) dispatch({type: actionTypes.SET_ACTIONERROR, payload: ["opInput"]}); // error
                    else proceed = true;
                } else if (wsdlInputs[1] === "POST") {
                    if (!wsdlInputs[3]) dispatch({type: actionTypes.SET_ACTIONERROR, payload: ["reqHeader"]}); // error
                    else if (!wsdlInputs[5]) dispatch({type: actionTypes.SET_ACTIONERROR, payload: ["reqBody"]}); // error
                    else proceed = true;
                }
            }
            if (proceed) {
                dispatch({type: actionTypes.SET_ACTIONERROR, payload: []});
                if (authCert){
                    keywordVal = ["setEndPointURL", "setMethods", "setOperations", "setHeader", "setWholeBody","addClientCertificate","setBasicAuth"]
                }else{
                    keywordVal = ["setEndPointURL", "setMethods", "setOperations", "setHeader", "setWholeBody"]
                }
                if (wsdlInputs[4]){
                    keywordVal.splice(4,0,'setParam');
                }
                setOverlay("Fetching Response Header & Body...");
                ResetSession.start();
                for (let i = 0; i < wsdlInputs.length; i++) {
                    if (wsdlInputs[i] !== "") {
                        testCaseWS.push({
                            "stepNo": i + 1,
                            "appType": appType,
                            "objectName": "",
                            "inputVal": [wsdlInputs[i]],
                            "keywordVal": keywordVal[i],
                            "outputVal": "",
                            "url": "",
                            "custname": "",
                            "remarks": [""],
                            "addTestCaseDetails": "",
                            "addTestCaseDetailsInfo": ""
                        })
                    }
                }
                testCaseWS.push({
                    "stepNo": testCaseWS.length + 1,
                    "appType": appType,
                    "objectName": "",
                    "inputVal": [""],
                    "keywordVal": "executeRequest",
                    "outputVal": "",
                    "url": "",
                    "custname": "",
                    "remarks": [""],
                    "addTestCaseDetails": "",
                    "addTestCaseDetailsInfo": ""
                });
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
                        let localRespBody;
                        if (data.responseBody[0].indexOf("{") == 0 || data.responseBody[0].indexOf("[") == 0) {
                            var jsonObj = JSON.parse(data.responseBody[0]);
                            var jsonPretty = JSON.stringify(jsonObj, null, '\t');
                            localRespBody = jsonPretty.replace(/\&gt;/g, '>').replace(/\&lt;/g, '<');
                        } else {
                            localRespBody = formatXml(data.responseBody[0].replace(/>\s+</g, '><'));
                            localRespBody = localRespBody.replace(/\&gt;/g, '>').replace(/\&lt;/g, '<');
                        }
                        dispatch({type: actionTypes.SET_WSDATA, payload: {respBody: localRespBody}});

                    } else {
                        setShowPop({title: "Debug Web Service", content: "Debug Terminated."});
                    }
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
        { showObjModal.operation === "editIrisObject" && <EditIrisObject utils={showObjModal} setShow={setShowObjModal} setShowPop={setShowPop} taskDetails={{projectid: current_task.projectId, screenid: current_task.screenId, screenname: current_task.screenName,versionnumber: current_task.versionnumber}} />}
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
        let newTag = scrapeObject.tag;
        
        if (scrapeObject.cord) {
            scrapeObject.hiddentag = "No";
            newTag = `iris;${scrapeObject.objectType}`;
            scrapeObject.url = "";
            scrapeObject.xpath = `iris;${scrapeObject.custname};${scrapeObject.left};${scrapeObject.top};${(scrapeObject.width + scrapeObject.left)};${(scrapeObject.height + scrapeObject.top)};${scrapeObject.tag}`;
        }

        let scrapeItem = {  objId: scrapeObject._id,
                            objIdx: lastIdx++,
                            val: ++lastVal,
                            tag: newTag,
                            hide: false,
                            title: scrapeObject.custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim(),
                            custname: scrapeObject.custname,
                            hiddentag: scrapeObject.hiddentag,
                            checked: false,
                            url: scrapeObject.url,
                            xpath: scrapeObject.xpath,
                        }

        // if (fetchDataFlag){
            if(scrapeObject.hasOwnProperty('editable') || scrapeObject.cord){
                scrapeItem.editable = true;
            } else {
                let isCustom = scrapeObject.xpath === "";
                scrapeItem.isCustom = isCustom;
            };
        // }
        
        localScrapeList.push(scrapeItem);
    }

    return localScrapeList;
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
			if (pad != 0) {
				pad -= 1;
			}
		} else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
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