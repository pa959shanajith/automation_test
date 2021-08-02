import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import XMLParser from 'react-xml-parser';
import { useHistory } from 'react-router-dom';
import ScreenWrapper from './ScreenWrapper';
import { ScrapeContext } from '../components/ScrapeContext';
import { RedirectPage, ResetSession } from '../../global';
import SubmitTask from '../components/SubmitTask';
import ScrapeSettings from "../components/ScrapeSettings/ScrapeSettings";
import RequestEditor from "../components/UI/RequestEditor";
import * as api from '../api';
import * as designApi from "../../design/api";
import * as actions from '../state/action';
import "../styles/WebserviceScrape.scss";
import * as scrapeUtils from "../../../utils/scrape";
import RequestBodyEditor from '../components/UI/RequestBodyEditor';
import AuthEditor from "../components/Authorization/AuthEditor";
import Tag from "../components/UI/Tag";
import { combineHeaders } from "./ScrapeScreen";
import Editor from "@monaco-editor/react";
import * as ScrapeSettingsConstants from "../../../constants/ScrapeSettingsConstants";

let allXpaths = [];
let allCustnames = [];
let objectLevel = 1;
let xpath = "";
const CONTENT_TYPE_HEADER_REGEX = /Content-Type:[A-Za-z\/ \-;=_\?\&]*\n?/;
// const BODY_MODE_HEADERS = {
//     "none": "",
//     "form-data" : "", 
//     "x-www-form-urlencoded": "application/x-www-form-urlencoded",
//     "Text": "text/plain",
//     "JSON": "application/json",
//     "Javascript": "application/javascript",
//     "XML": "",
//     "HTML": "text/html"
// }

const BODY_MODE_HEADERS = {
    "none": "",
    "form-data" : "", 
    "x-www-form-urlencoded": "application/x-www-form-urlencoded",
    "Text": "text/plain",
    "JSON": "application/json",
    "Javascript": "application/javascript",
    "XML": "application/xml",
    "HTML": "text/html"
}

const WebserviceScrape = () => {

    const dispatch = useDispatch();

    const { setShowObjModal, setShowPop, setOverlay, saved, setSaved, fetchScrapeData } = useContext(ScrapeContext);
    const disableAction = useSelector(state=>state.scrape.disableAction);
    const current_task = useSelector(state=>state.plugin.CT);
    const { user_id, role } = useSelector(state=>state.login.userinfo);
    const userInfo = useSelector(state=>state.login.userinfo);
    const certificateInfo = useSelector(state=>state.scrape.cert);
    const {endPointURL, method, opInput, reqHeader, reqBody, respHeader, respBody, paramHeader} = useSelector(state=>state.scrape.WsData);
    const actionError = useSelector(state=>state.scrape.actionError);
    const wsdlError = useSelector(state=>state.scrape.wsdlError);
    const [wsdlURL, setwsdlURL] = useState("");
    const [opDropdown, setOpDropdown] = useState("0");
    const [opList, setOpList] = useState([]);
    const [activeView, setActiveView] = useState("req");
    const [reqBodyState, setReqBodyState] = useState({mode: "", rawMode: "", form: "", raw: reqBody});
    const reqAuthHeaders = useSelector(state => state.scrape.reqAuthHeaders);
    const {resCookies, reqCookies, cookieJar, wsCookieJar} = useSelector(state => state.scrape.cookies);
    const config = useSelector(state => state.scrape.config);
    const [cookies, setCookies] = useState([]);
    const history = useHistory();

    useEffect(() => {
        /* function loadCookies() {
            wsCookieJar.getAll(endPointURL).then(cookies => {
                console.log(cookies);
                setCookies(cookies)
            }).catch(err => console.log(err));
        }
        if(activeView === "cookie")
        loadCookies(); */
        setCookies(wsCookieJar.getAllSync(endPointURL));
    }, [activeView, endPointURL, resCookies])

    const reqBodyStateChangeHandler = (state) => {
        if(!config[ScrapeSettingsConstants.DISABLE_AUTO_CONTENT_TYPE_HEADER] 
            && (reqBodyState.mode !== state.mode || reqBodyState.rawMode !== state.rawMode)) {
            // replace content-type header or add one if not present
            const newContentTypeHeader = state.mode === "raw" ? 
                                        BODY_MODE_HEADERS[state.rawMode] : 
                                        BODY_MODE_HEADERS[state.mode];
            const newHeader = newContentTypeHeader ? `Content-Type:${newContentTypeHeader}\n`: ``;
            let newReqHeader;
            if(CONTENT_TYPE_HEADER_REGEX.test(reqHeader)) {
                newReqHeader = newHeader && reqHeader.replace(CONTENT_TYPE_HEADER_REGEX, newHeader);
            } else {
                newReqHeader = newHeader && reqHeader.concat(newHeader);
            }
            newReqHeader = newReqHeader || reqHeader;
            dispatch({type: actions.SET_WSDATA, payload: {reqHeader : newReqHeader}});
        }
        const newReqBody = state.mode === "raw" ? state.raw : state.form;
        setReqBodyState(state);
        dispatch({type: actions.SET_WSDATA, payload: {reqBody : newReqBody}});
    }
    const wsdlURLHandler = event => setwsdlURL(event.target.value);
    const opDropdownHandler = event => setOpDropdown(event.target.value);
    const endpointURLHandler = event => dispatch({type: actions.SET_WSDATA, payload: {endPointURL : event.target.value}}) //setEndpoinURL(event.target.value);
    const methodHandler = event => dispatch({type: actions.SET_WSDATA, payload: {method : event.target.value}}) //setMethod(event.target.value);
    const opInputHandler = event => dispatch({type: actions.SET_WSDATA, payload: {opInput : event.target.value}}) //setOpInput(event.target.value);
    const onHeaderChange = event => {
        let value = "";
        if (typeof event === 'string') {
            value = event;
        } else {
            value = event.target.value;
        }
        if (activeView === "req") dispatch({type: actions.SET_WSDATA, payload: {reqHeader : value}}) // setReqHeader(event.target.value);
        else if (activeView === "param") dispatch({type: actions.SET_WSDATA, payload: {paramHeader : value}}) //setParamHeader(event.target.value);
        else dispatch({type: actions.SET_WSDATA, payload: {respHeader : value}}) //setRespHeader(event.target.value);
    }
    const onBodyChange = event => {
        if (activeView === "req") dispatch({type: actions.SET_WSDATA, payload: {reqBody : event.target.value}})//setReqBody(event.target.value);
        else dispatch({type: actions.SET_WSDATA, payload: {respBody : event.target.value}})//setRespBody(event.target.value);
    }

    const clearFields = () => {
        setwsdlURL("");
        setOpDropdown("0");
        setOpList([]);
        dispatch({
            type: actions.SET_WSDATA, 
            payload:  {
                endPointURL: "",
                method: "0",
                opInput: "",
                reqHeader: "",
                reqBody: "",
                respHeader: "",
                respBody: "",
                paramHeader: "",
            }
        });
        dispatch({type: actions.SET_DISABLEACTION, payload: false});
        dispatch({type: actions.SET_DISABLEAPPEND, payload: true});
        dispatch({type: actions.SET_ACTIONERROR, payload: []});
        dispatch({type: actions.SET_WSDLERROR, payload: []});
    }

    const onSave = () => {
        let arg = {};
        let callApi = true;

        // TODO - reduce checking for cookie jar disable rom 4 places to 2 

        let validatedCookies = !config[ScrapeSettingsConstants.DISABLE_COOKIE_JAR] ? 
            wsCookieJar.getAllSync(endPointURL) : [];
        // process and add external cookies
        let externalCookies = scrapeUtils.removeDisabled(reqCookies);
        externalCookies = externalCookies && externalCookies.split("\n").map(c => c.replace(":", "="));
        if(externalCookies && !config[ScrapeSettingsConstants.DISABLE_COOKIE_JAR])
            wsCookieJar.setAllSync(endPointURL, externalCookies);
        validatedCookies = validatedCookies?.length ? "Cookie: "+ validatedCookies.map(c => c.cookieString()).join(";") : "";

        // process reqBody, headers and params
        let rReqHeader = combineHeaders(reqHeader, reqAuthHeaders, validatedCookies);
        let rParamHeader = scrapeUtils.removeDisabled(paramHeader);
        // convert : to =
        rParamHeader = rParamHeader.replace(/:/g, "=");
        let rReqBody = reqBody;
        const isFormEncoded = scrapeUtils.FORM_URL_ENCODE_REGEX.test(reqHeader);
        if(isFormEncoded)
            rReqBody = scrapeUtils.convertToFormData(reqBody, isFormEncoded);

        //eslint-disable-next-line
        rReqHeader = rReqHeader.replace(/[\n\r]/g, '##').replace(/"/g, '\"');
        //eslint-disable-next-line
        rParamHeader = rParamHeader.replace(/[\n\r]/g, '##').replace(/"/g, '\"');
        //eslint-disable-next-line
        rReqBody = rReqBody.replace(/[\n\r]/g, '').replace(/\s\s+/g, ' ').replace(/"/g, '\"').replace(/'+/g, "\"");
        //eslint-disable-next-line
        let rRespHeader = respHeader.replace(/[\n\r]/g, '##').replace(/"/g, '\"');
        //eslint-disable-next-line
		let rRespBody = respBody.replace(/[\n\r]/g, '').replace(/\s\s+/g, ' ').replace(/"/g, '\"');
		if (!endPointURL) dispatch({type: actions.SET_ACTIONERROR, payload: ["endPointURL"]}); // error
		else if (method==="0") dispatch({type: actions.SET_ACTIONERROR, payload: ["method"]}); // error
		else {
            dispatch({type: actions.SET_ACTIONERROR, payload: []});
            let temp_flag = true; // someflag
            try {
                let viewArray = [];
                if (method && rReqHeader && rReqBody) {
                    if (method === 'POST') {
                        if (rReqBody){
                            if(rReqHeader.indexOf('json') === -1){
                                if (rReqBody.indexOf('Envelope') !== -1) {
                                    let parsedReqBody =  new XMLParser().parseFromString(rReqBody);
                                    if ('root' in parsedReqBody) {
                                        parsedReqBody = parsedReqBody.body;
                                    } 
                                    temp_flag = false;
                                    allXpaths = [];
                                    allCustnames = [];
                                    
                                    if (rParamHeader.trim() !== ""){
                                        let reqparams=parseRequestParam(rParamHeader);
                                        if (reqparams.length>0) viewArray.concat(reqparams);
                                    }
                                    try {
                                        parseRequest(parsedReqBody);
                                    } catch (err) {
                                        console.error("Error While Parsing. ERROR::::", err);
                                        callApi = false;
                                    }

                                    for (let populationindex = 0; populationindex < allXpaths.length; populationindex++) {
                                        let scrapedObjectsWS = {};
                                        scrapedObjectsWS.xpath = allXpaths[populationindex];
                                        scrapedObjectsWS.custname = allCustnames[populationindex];
                                        scrapedObjectsWS.tag = "elementWS";
                                        viewArray.push(scrapedObjectsWS);
                                    }
                                    // scrapedObjects.view = viewArray;
                                    // scrapedObjects = JSON.stringify(scrapedObjects);
                                    // scrapedObjects = scrapedObjects.replace(/'+/g, "''")
                                } else {
                                    console.error("Invalid Request header or Request body for XML");
                                    callApi = false;
                                }
                            } else if(rReqHeader.indexOf('json') !== -1){
                                try{
                                    
                                    //Parsing Request Parameters
                                    if (rParamHeader.trim() !== ""){
                                        let reqparams = parseRequestParam(rParamHeader);
                                        if (reqparams.length > 0) viewArray.concat(reqparams);
                                    }
                                    //Parsing Request Body
                                    let xpaths = parseJsonRequest(rReqBody,"","", []);
                                    for (let object of xpaths) {
                                        let scrapedObjectsWS = {};
                                        scrapedObjectsWS.xpath = object;
                                        scrapedObjectsWS.custname = object;
                                        scrapedObjectsWS.tag = "elementWS";
                                        viewArray.push(scrapedObjectsWS);
                                    }
                                    // if (viewArray.length>0) scrapedObjects.view=viewArray;
                                }
                                catch(Exception){
                                    console.error("Invalid Request body.");
                                    callApi = false;
                                }
                            }
                        }
                    } else if (method === 'GET' && rParamHeader.trim() !== "") {
                        try{
                            //Parsing Request Parameters
                            if (rParamHeader.trim() !== ""){
                                var reqparams=parseRequestParam(rParamHeader);
                                if (reqparams.length>0) viewArray=reqparams;
                            }	
                        } catch(Exception){
                            console.error("Invalid Request Header for GET API");
                            callApi = false;
                        }
                    }
                }
                
                let scrapeData = {
                    "body": rReqBody,
                    "operations": opInput,
                    "responseHeader": rRespHeader,
                    "responseBody": rRespBody,
                    "method": method,
                    "endPointURL": endPointURL,
                    "header": rReqHeader,
                    "param": rParamHeader
                };

                if (viewArray.length > 0) scrapeData.view = viewArray;

                arg = {
                    "scrapedata": JSON.stringify(scrapeData).replace(/'+/g, "''"),
                    "userId": user_id,
                    "roleId": role,
                    "screenId": current_task.screenId,
                    "projectid": current_task.projectId,
                    "screenname": current_task.screenName,
                    "versionnumber": current_task.versionnumber,
                    "param": "WebserviceScrapeData"
                }

                if (!temp_flag) arg["query"] = "updatescreen";

            } catch (exception) {
                console.error("Exception - WEBSERVICE::::",exception);
                callApi = false;
            }

            if (!callApi) return; // Error, do not call API

			api.updateScreen_ICE(arg)
            .then(data => {
                if (data === "Invalid Session") {
                    return RedirectPage(history);
                }
                if (data === "Success") {
                    // $("#enbledWS").prop("checked", false)
                    fetchScrapeData()
                    .then(data=>setShowPop({title: "Save WebService Template", content: "WebService Template saved successfully."}))
                    .catch(error => setShowPop({title: "Save WebService Template", content: "Failed to save WebService Template. Invalid Request Header or Body"}));
                } else if(data === "Invalid Input"){
                    setShowPop({title: "Save WebService Template", content: "Failed to save WebService Template. Invalid Request Header or Body"});
                } else{
                    setShowPop({title: "Save WebService Template", content: "Failed to save WebService Template."});
                }
            })
            .catch(error => {
                console.error("Error::::", error)
            });
            // get testcase for this screen 
            designApi.readTestCaseFromScreen_ICE(userInfo, current_task.screenId, current_task.versionnumber, current_task.screenName)
            .then(data => {
                // add only keywords
                let keywordVal = [{key: "setEndPointURL", value: endPointURL}, {key: "setMethods", value: method}];
                if(opInput) keywordVal.push({key: "setOperations", value: opInput});
                if(rReqHeader) keywordVal.push({key: "setHeader", value: rReqHeader});
                if(rParamHeader) keywordVal.push({key: "setParam", value: rParamHeader});
                if(rReqBody) keywordVal.push({key: "setWholeBody", value: rReqBody});
                // todo params
                keywordVal.push({key: "executeRequest", value: ""});
                const keywords = keywordVal.map(k =>k.key);
                let testCases = keywordVal.map((k,i) => {
                    return {
                        "stepNo": i + 1, "appType": current_task.appType, "objectName": "", "inputVal": [k.value],
                        "keywordVal": k.key, "outputVal": "", "url": "", "custname": "WebService List", "remarks": "",
                        "addTestCaseDetails": "", "addTestCaseDetailsInfo": ""
                    }
                });
                testCases = testCases.concat(
                    data.testcase.filter(el => !keywords.includes(el.keywordVal))
                    );
                // update step numbers
                testCases.forEach((el, i) => el.stepNo = i + 1);
                designApi.updateTestCase_ICE(data.testcaseid, data.testcasename, testCases, userInfo, current_task.versionnumber, false, [])
                .then(res => console.log(res))
                .catch(err => console.error(err));

                console.log(data,testCases);
            })
            .catch(err => console.error(err));
		}
    }


    const onGo = () => {
		if (!wsdlURL) setShowPop({title: "Launch WSDL", content: "Invalid WSDL url."}); 
		else {
			setOverlay('Please Wait...');
			ResetSession.start();
			api.launchWSDLGo(wsdlURL)
            .then(data => {
                setOverlay("");
                ResetSession.end();
                if (data === "Invalid Session") return RedirectPage(history);
                else if (data === "fail") setShowPop({title: "WSDL-Scrape Screen", content: "Invalid WSDL url."});
                else if (data === "unavailableLocalServer") setShowPop({title: "WSDL-Scrape Screen", content: "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server."});
                else if (data === "scheduleModeOn") setShowPop({ title: "WSDL-Scrape Screen", content: "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed."})
                else if (data === "ExecutionOnlyAllowed") setShowPop({title: "WSDL-Scrape Screen", content: "Execution Only Allowed"})
                else {
                    let localList = [];
                    for (let i = 0; i < data.listofoperations.length; i++) {
                        localList.push(data.listofoperations[i]);
                    }
                    setOpList(localList);
                }
            })
            .catch(error => {
                setOverlay("");
                ResetSession.end();
                setShowPop({title: "WSDL-Scrape Screen", content: "Error while performing operation."});
                console.error("Fail to launch WSDL_GO. ERROR::::", error);
            });
		}
    }
    
    const onAdd = () => {
		let certificate = '';
        if (Object.keys(certificateInfo).length!==0) certificate = certificateInfo;
        
		if (!wsdlURL) dispatch({type: actions.SET_WSDLERROR, payload: ["wsdlURL"]}); //error wsdlURL
		else if (opDropdown==="0") dispatch({type: actions.SET_WSDLERROR, payload: ["opDropdown"]}); //error
		else {
            dispatch({type: actions.SET_WSDLERROR, payload: []});
			setOverlay('Please Wait...');
			ResetSession.start();
			api.wsdlAdd(wsdlURL, opDropdown, certificate)
            .then(data => {
                setOverlay("");
                if (data === "Invalid Session") return RedirectPage(history);
                else if (data === "unavailableLocalServer") setShowPop({title: "WSDL-Scrape Screen", content: "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server."});
                else if (data === "scheduleModeOn") setShowPop({ title: "WSDL-Scrape Screen", content: "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed."})
                else if (typeof data === "object") {
                    dispatch({type: actions.SET_WSDATA, payload: {endPointURL : data.endPointURL[0]}});
                    dispatch({type: actions.SET_WSDATA, payload: {method : data.method[0]}});
                    dispatch({type: actions.SET_WSDATA, payload: {opInput : data.operations[0]}});
                    dispatch({type: actions.SET_WSDATA, payload: {reqHeader : data.header[0].split("##").join("\n")}})
                    dispatch({type: actions.SET_WSDATA, payload: {reqHeader : data.header[0].split("##").join("\n")}})
                    if (data.param) dispatch({type: actions.SET_WSDATA, payload: {paramHeader : data.param[0].split("##").join("\n")}});

                    let localReqBody;
                    if (!data.body[0].indexOf("{") || !data.body[0].indexOf("[")) {
                        let jsonObj = JSON.parse(data.body[0]);
                        let jsonPretty = JSON.stringify(jsonObj, null, '\t');
                        localReqBody = jsonPretty;
                    } else {
                        localReqBody = formatXml(data.body[0].replace(/>\s+</g, '><'));
                    }
                    
                    dispatch({type: actions.SET_WSDATA, payload: {reqBody : localReqBody}});
                    setSaved(false);
                }
            })
            .catch(error => {
                setOverlay("");
                ResetSession.end();
                setShowPop({title: "WSDL Add-Scrape Screen", content: "Error while performing operation."});
                console.error("Fail to Add-Scrape. Error::::", error);
            });
		}
    }
    
    const displayTag = (respHeader) => {
        const status = respHeader.substring(respHeader.indexOf("StatusCode"))
                                    .split("\n");
        // StatusCode:200  Reason:OK
        const statusCode = status[0]?.split(":")[1];
        const reason = status[1]?.split(":")[1];
        const color = statusCode?.startsWith("2") ? 'green' : 'red';
        return <Tag bold color={color}  text={statusCode + " "+(reason || '')}/>
    }


    const onCookieChange = (value) => {
        //prevent dispatching null
        if(value)
        dispatch({type: actions.SET_COOKIES, payload: {reqCookies: value}});
    }

    const saveResponse = () => {
        const ext = respHeader.includes("json") ? "json" :
            respHeader.includes("xml") ? "xml" : "txt";
        const response = respBody;
        const filename = current_task.screenName + "." + ext;
        const responseBlob = new Blob([response], {type: 'text/json'});
        const a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(responseBlob);
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    return (
        <ScreenWrapper
            fullHeight = {true}
            webserviceContent = {<div className="ws__mainContainer">
                <div className="ws__row">
                    <div className="ws__url_method">
                        <div className="ws__url_m_wrapper">
                            <label>WSDL</label>
                            <input className={"ws__input"+(wsdlError.includes("wsdlURL")?" ws_eb":"")} type='text' placeholder='Enter WSDL URL' onChange={wsdlURLHandler} value={wsdlURL} />
                            <button className="ws__goBtn" onClick={onGo}>Go</button>
                            <select className={"ws__select"+(wsdlError.includes("opDropdown")?" ws_eb":"")} value={opDropdown} onChange={opDropdownHandler}>
                                <option disabled={true} value="0">Select Operation</option>
                                { opList.map((op, i) => <option key={i} value={op}>{op}</option>)}
                            </select>
                            <button className="ws__action_btn ws__bigBtn ws__addBtn" onClick={onAdd}>Add</button>
                        </div>
                    </div>
                    <SubmitTask />
                </div>
                
                <div className="ws__row ws__action_wrapper">
                    
                    <select className={"ws__select"+(actionError.includes("method")?" ws_eb":"")} onChange={methodHandler} value={method} disabled={disableAction} >
                        <option disabled value="0">Select Method</option>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="HEAD">HEAD</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                        <option value="OPTIONS">OPTIONS</option>
                        <option value="COPY">COPY</option>
                        <option value="LINK">LINK</option>
                        <option value="UNLINK">UNLINK</option>
                        <option value="PURGE">PURGE</option>
                        <option value="LOCK">LOCK</option>
                        <option value="UNLOCK">UNLOCK</option>
                        <option value="PROPFIND">PROPFIND</option>
                        <option value="VIEW">VIEW</option>
                    </select>
                    <input className={"ws__input"+(actionError.includes("endPointURL")?" ws_eb":"")} type='text' placeholder='End Point URL' onChange={endpointURLHandler} value={endPointURL} disabled={disableAction}/>
                    
                    <input className={"ws__input ws__op_input"+(actionError.includes("opInput")?" ws_eb":"")} type="text" placeholder="Operation" onChange={opInputHandler} value={opInput} disabled={disableAction} />
                    <button className="ws__cert_btn" onClick={()=>setShowObjModal("addCert")}>
                        <img alt="cert-icon" src="static/imgs/certificate_ws.png"/>
                    </button>
                    <button className="ws__action_btn ws__bigBtn" disabled={saved && disableAction } onClick={onSave}>Save</button>
                    <button className="ws__action_btn ws__bigBtn" disabled={
                        !wsdlURL && opDropdown === "0" && !endPointURL && method === "0" && !opInput && !reqHeader && !reqBody && !respHeader && !respBody && !paramHeader
                    } onClick={clearFields}>Clear</button>
                </div>
                <div className="ws__row ws__action_options">
                    <button className={"ws__action_btn" + (activeView==="req" ? " ws__active": "") + 
                                        (actionError.includes("reqHeader") ? " ws__action_error" : "")} 
                        onClick={()=>setActiveView("req")}>
                        Header
                        { activeView === "req" && <div className="caret__ws fa fa-caret-down"></div>}
                    </button>
                    <button className={"ws__action_btn" + (activeView==="param" ? " ws__active": "")} 
                            onClick={()=>setActiveView("param")}>
                        Params
                        { activeView === "param" && <div className="caret__ws fa fa-caret-down"></div>}
                    </button>
                    <button className={"ws__action_btn" + (activeView==="body" ? " ws__active": "") + 
                                        (actionError.includes("reqBody") ? " ws__action_error" : "")} 
                            onClick={()=>setActiveView("body")}>
                        Body
                        { activeView === "body" && <div className="caret__ws fa fa-caret-down"></div>}
                    </button>
                    <button className={"ws__action_btn" + (activeView==="auth" ? " ws__active": "")} 
                            onClick={()=>setActiveView("auth")}>
                        Authorization
                        { activeView === "auth" && <div className="caret__ws fa fa-caret-down"></div>}
                    </button>
                    <button className={"ws__action_btn" + (activeView==="cookie" ? " ws__active": "")} 
                            onClick={()=>setActiveView("cookie")}>
                        Cookies
                        { activeView === "cookie" && <div className="caret__ws fa fa-caret-down"></div>}
                    </button>
                    <button className={"ws__action_btn" + (activeView==="config" ? " ws__active": "")} 
                            onClick={()=>setActiveView("config")}>
                        Settings
                        { activeView === "config" && <div className="caret__ws fa fa-caret-down"></div>}
                    </button>
                    <button className={"ws__action_btn" + (activeView==="resp" ? " ws__active": "")} 
                            onClick={()=>setActiveView("resp")}>
                        Response
                        { activeView === "resp" && <div className="caret__ws fa fa-caret-down"></div>}
                    </button>
                </div>

                {activeView === "config" && <ScrapeSettings/>}

                
                {activeView === "resp" ? <>
                <div style={{marginBottom: '10px' }}>
                <div className="ws__heading_grey">
                      STATUS : {" "}
                    </div>
                {displayTag(respHeader)}
                <button className={"ws__action_btn"} 
                            onClick={saveResponse}>
                        Save Response
                </button>
                </div>
                
                {/* <textarea 
                    className={"ws__rqst_resp_header"}
                    value={respHeader} 
                    placeholder={"Response Header"}
                    onChange={onHeaderChange}
                    disabled={activeView === "resp"}
                />
                <textarea 
                    className={"ws__rqst_resp_header"}
                    value={respBody} 
                    placeholder={"Response Body"}
                    onChange={onBodyChange}
                    disabled={activeView === "resp"}
                />*/}
                <div className="ws__heading_grey">
                      RESPONSE HEADERS: 
                </div>
                <Editor
                    height="200px"
                    value={respHeader}
                    options={{
                        contextmenu: false,
                        readOnly: true,
                        lineNumbers: 'off'
                    }}
                />
                <br/><br/>
                <div className="ws__heading_grey">
                      RESPONSE BODY: 
                </div>
                <Editor
                    height="200px"
                    value={respBody}
                    language={respHeader.includes("xml") ? "xml" : respHeader.includes("json") ? "json" : "text"}
                    options={{
                        contextmenu: false,
                        readOnly: true,
                        lineNumbers: 'off'
                    }}
                />
                
                </> : null}

                {/* Display current Auth Headers */}
                {activeView === "req" && 
                    <div className="ws__action_options">
                    <span style={{ fontWeight: "bold", color: "#868686" }}>
                      AUTO GENERATED HEADERS :-{" "}
                    </span>
                    <button className={"ws__action_btn"} 
                            onClick={()=>  {
                                dispatch({type: actions.SET_REQ_AUTH_HEADER, payload: []});
                            }}>
                                Clear
                    </button>
                    <br/>
                    <h6 style={{ color: "#633693" }}>{reqAuthHeaders.length ? reqAuthHeaders.join("\n") : "None"}</h6>
                  </div>
                }

                {activeView === "req" || activeView === "param" ? 
                <RequestEditor
                    value={activeView === "req" ? reqHeader : paramHeader}
                    onChangeHandler={(value) => onHeaderChange(value)} 
                    activeView={activeView}
                    disabled={disableAction}
                    placeholder="key:value"
                    /> : null}
                
                {activeView === "cookie" && 
                    <>
                        <div className="ws__action_options" style={{ maxHeight: "200px" }}>
                            <span style={{ fontWeight: "bold", color: "#868686" }}>
                                RESPONSE COOKIES :-{" "}
                            </span>
                            <button className={"ws__action_btn"} 
                            onClick={()=>  {
                                wsCookieJar.clear(endPointURL);
                                dispatch({type: actions.SET_COOKIES, payload: {resCookies: []}});
                            }}>
                                Clear
                            </button>
                            <br />
                            {
                                cookies.map(cookie => {
                                    return <h6 style={{ color: "#633693" }}>
                                    {cookie.cookieString()}
                                </h6>
                                })
                            }
                        </div>
                        <RequestEditor
                                value={reqCookies}
                                onChangeHandler={(value) => onCookieChange(value)}
                                activeView={activeView}
                                disabled={disableAction}
                                placeholder="key:value"
                            />
                    </>
                }

                {activeView === "body" ? 
                // could manage state on its own??
                <RequestBodyEditor
                state={reqBodyState}
                onStateChange={reqBodyStateChangeHandler}
                /> : null
                }
                {activeView === "auth" && <AuthEditor/>}
                {/* <textarea 
                    className={"ws__rqst_resp_header"+(actionError.includes("reqHeader")&&activeView==="req"?" ws_eb":"")}
                    value={activeView === "req" ? reqHeader : activeView === "param" ? paramHeader : respHeader} 
                    placeholder={activeView === "req" ? "Request Header" : 
                        activeView === "param" ? "param_name = value" : "Response Header"
                    }
                    onChange={onHeaderChange}
                    disabled={disableAction || activeView === "resp"}
                />
                
                {activeView !== "param" && <textarea 
                    className={"ws__rqst_resp_body" +(actionError.includes("reqBody")&&activeView==="req"?" ws_eb":"")}
                    value={activeView === "req" ? reqBody : respBody} 
                    placeholder={activeView === "req" ? "Request Body" : "Response Body"
                    }
                    onChange={onBodyChange}
                    disabled={disableAction || activeView === "resp"}
                />} */}
            </div>}
        />
    );
}

export default WebserviceScrape;


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

function parseRequest(readChild) {
	try {
		if ('name' in readChild) {
			if (xpath === "") {
				xpath = "/" + readChild.name;
					allXpaths.push(xpath);
				allCustnames.push(readChild.name);
			}
			if ('attributes' in readChild) {
				let attrchildren = Object.keys(readChild.attributes);
				if (attrchildren.length >= 1) {
					let basexpath = xpath;
					for (let attrindex = 0; attrindex < attrchildren.length; attrindex++) {
						let newLevel = attrchildren[attrindex];
						if (xpath === undefined) {
							xpath = "";
						}
						let custname = readChild.name + "_" + newLevel;
						xpath = xpath + "/" + newLevel;
						allCustnames.push(custname);
						allXpaths.push(xpath);
						xpath = basexpath;
					}
				}
			}
			if ('children' in readChild) {
				if (readChild.children.length >= 1) {
					var basexpath = xpath;
					for (var childrenindex = 0; childrenindex < readChild.children.length; childrenindex++) {
						objectLevel = objectLevel + 1;
						var newLevel = readChild.children[childrenindex].name;
						if (xpath === undefined || xpath === 'undefined') {
							xpath = "";
						}
						xpath = xpath + "/" + newLevel;
						allCustnames.push(newLevel);
						allXpaths.push(xpath);
						parseRequest(readChild.children[childrenindex]);
						xpath = basexpath;
						objectLevel = objectLevel - 1;
					}
				}
			}
		}
	} catch (exception) {
		console.error("Exception in the function parseRequest: ERROR::::", exception);
	}
}

function parseJsonRequest(requestedBody, base_key, cur_key, xpath) {
	let xpaths=xpath;
	try {
     	for (let key in requestedBody){
			 var value=requestedBody[key];
			 if (typeof(value)==="object" && !(Array.isArray(value))){
				if (base_key!== "")  base_key+='/'+key;
				else base_key=key;
				xpaths.push(base_key);
				xpaths.concat(parseJsonRequest(value,base_key,key,xpaths));
				base_key=base_key.slice(0,-key.length-1);
			 } else if (Array.isArray(value)) {
				for (var i=0;i<value.length;i++){
					base_key+=key+"["+i.toString()+"]";
					xpaths.concat(parseJsonRequest(value[i],base_key,key,xpaths));
				}
			 } else {
				xpaths.push(base_key+'/'+key);
			 }
		 }
		 base_key=base_key.slice(0,-cur_key.length);
	} catch (exception) {
		console.error("Exception in the function parseRequest: ERROR::::", exception);
	}
	return xpaths;
}

function parseRequestParam(parameters){
	let paramsArray=[];
    try{
		var params=parameters.split('##');
		for (let object of params) {
			object=object.split(":");
			let scrapedObjectsWS = {};
			scrapedObjectsWS.xpath = object[0].trim();
			scrapedObjectsWS.custname = object[0].trim();
			scrapedObjectsWS.tag = "elementWS";
			paramsArray.push(scrapedObjectsWS);
		}
	}catch (Exception){
		console.error(Exception);
	}	
	return paramsArray										
}