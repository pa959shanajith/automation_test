import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import XMLParser from 'react-xml-parser';
import { useHistory } from 'react-router-dom';
import ScreenWrapper from './ScreenWrapper';
import { ScrapeContext } from '../components/ScrapeContext';
import { RedirectPage, ResetSession } from '../../global';
import SubmitTask from '../components/SubmitTask';
import * as api from '../api';
import * as actions from '../state/action';
import "../styles/WebserviceScrape.scss";

let allXpaths = [];
let allCustnames = [];
let objectLevel = 1;
let xpath = "";

const WebserviceScrape = () => {

    const dispatch = useDispatch();

    const { setShowObjModal, setShowPop, setOverlay, saved, setSaved, fetchScrapeData } = useContext(ScrapeContext);
    const disableAction = useSelector(state=>state.scrape.disableAction);
    const current_task = useSelector(state=>state.plugin.CT);
    const { user_id, role } = useSelector(state=>state.login.userinfo);
    const certificateInfo = useSelector(state=>state.scrape.cert);
    const {endPointURL, method, opInput, reqHeader, reqBody, respHeader, respBody, paramHeader} = useSelector(state=>state.scrape.WsData);
    const actionError = useSelector(state=>state.scrape.actionError);
    const wsdlError = useSelector(state=>state.scrape.wsdlError);
    const [wsdlURL, setwsdlURL] = useState("");
    const [opDropdown, setOpDropdown] = useState("0");
    const [opList, setOpList] = useState([]);
    const [activeView, setActiveView] = useState("req");
    const history = useHistory();

    const wsdlURLHandler = event => setwsdlURL(event.target.value);
    const opDropdownHandler = event => setOpDropdown(event.target.value);
    const endpointURLHandler = event => dispatch({type: actions.SET_WSDATA, payload: {endPointURL : event.target.value}}) //setEndpoinURL(event.target.value);
    const methodHandler = event => dispatch({type: actions.SET_WSDATA, payload: {method : event.target.value}}) //setMethod(event.target.value);
    const opInputHandler = event => dispatch({type: actions.SET_WSDATA, payload: {opInput : event.target.value}}) //setOpInput(event.target.value);
    const onHeaderChange = event => {
        if (activeView === "req") dispatch({type: actions.SET_WSDATA, payload: {reqHeader : event.target.value}}) // setReqHeader(event.target.value);
        else if (activeView === "param") dispatch({type: actions.SET_WSDATA, payload: {paramHeader : event.target.value}}) //setParamHeader(event.target.value);
        else dispatch({type: actions.SET_WSDATA, payload: {respHeader : event.target.value}}) //setRespHeader(event.target.value);
    }
    const onBodyChange = event => {
        if (activeView === "req") dispatch({type: actions.SET_WSDATA, payload: {reqBody : event.target.value}})//setReqBody(event.target.value);
        else dispatch({type: actions.SET_WSDATA, payload: {respBody : event.target.value}})//setRespBody(event.target.value);
    }

    const onSave = () => {
        let arg = {};
        let callApi = true;
		let rReqHeader = reqHeader.replace(/[\n\r]/g, '##').replace(/"/g, '\"');
		let rParamHeader = paramHeader.replace(/[\n\r]/g, '##').replace(/"/g, '\"');
        let rReqBody = reqBody.replace(/[\n\r]/g, '').replace(/\s\s+/g, ' ').replace(/"/g, '\"');
		let rRespHeader = respHeader.replace(/[\n\r]/g, '##').replace(/"/g, '\"');
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
                                    
                                    // NOT IMPLEMENTING PARAM YET
                                    // if (requestedparam.trim() != ""){
                                    //     var reqparams=parseRequestParam(requestedparam);
                                    //     if (reqparams.length>0) viewArray.concat(reqparams);
                                    // }
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
                                    // NOT IMPLEMENTING PARAM YET
                                    // //Parsing Request Parameters
                                    // if (requestedparam.trim() != ""){
                                    //     var reqparams=parseRequestParam(requestedparam);
                                    //     if (reqparams.length>0) viewArray.concat(reqparams);
                                    // }
                                    //Parsing Request Body
                                    let xpaths = parseJsonRequest(rReqBody,"","");
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
                    } else if (method === 'GET' && rParamHeader) {
                        // IMPLEMENTATION FOR PARAMS
                        // try{
                        //     //Parsing Request Parameters
                        //     if (requestedparam.trim() != ""){
                        //         var reqparams=parseRequestParam(requestedparam);
                        //         if (reqparams.length>0){
                        //             scrapedObjects.view=reqparams;
                        //         }
                        //     }	
                        // }catch(Exception){
                        //     logger.error("Invalid Request Header for GET API")
                        //     scrapedObjects="Fail";
                        // }
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
                    "param": "WS_obj"
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
            })
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
                    dispatch({type: actions.SET_WSDATA, payload: {endPointURL : data.endPointURL}});
                    dispatch({type: actions.SET_WSDATA, payload: {method : data.method[0]}});
                    dispatch({type: actions.SET_WSDATA, payload: {opInput : data.operations}});
                    dispatch({type: actions.SET_WSDATA, payload: {reqHeader : data.header[0].split("##").join("\n")}})

                    let localReqBody;
                    if (!data.body[0].indexOf("{") || !data.body[0].indexOf("[")) {
                        let jsonObj = JSON.parse(data.body);
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

    return (
        <ScreenWrapper
            fullHeight = {true}
            webserviceContent = {<div className="ws__mainContainer">
                <div className="ws__row">
                    <div className="ws__url_method">
                        <div className="ws__url_m_wrapper">
                            <label>WSDL</label>
                            <input className={"ws__input"+(wsdlError.includes("wsdlURL")?" ws_eb":"")} type='text' placeholder='Enter WSDL Url' onChange={wsdlURLHandler} value={wsdlURL} />
                            <button className="ws__goBtn" onClick={onGo}>Go</button>
                            <select className={"ws__select"+(wsdlError.includes("opDropdown")?" ws_eb":"")} value={opDropdown} onChange={opDropdownHandler}>
                                <option disabled={true} value="0">Select Operation</option>
                                { opList.map(op => <option value={op}>{op}</option>)}
                            </select>
                            <button className="ws__action_btn ws__bigBtn ws__addBtn" onClick={onAdd}>Add</button>
                        </div>
                    </div>
                    <SubmitTask />
                </div>
                
                <div className="ws__row ws__action_wrapper">
                    <button className={"ws__action_btn" + (activeView==="req" ? " ws__active": "")} onClick={()=>setActiveView("req")}>
                        Request
                        { activeView === "req" && <div className="caret__ws fa fa-caret-down"></div>}
                    </button>
                    <button className={"ws__action_btn" + (activeView==="param" ? " ws__active": "")} onClick={()=>setActiveView("param")}>
                        Params
                        { activeView === "param" && <div className="caret__ws fa fa-caret-down"></div>}
                    </button>
                    <button className={"ws__action_btn" + (activeView==="resp" ? " ws__active": "")} onClick={()=>setActiveView("resp")}>
                        Response
                        { activeView === "resp" && <div className="caret__ws fa fa-caret-down"></div>}
                    </button>
                    <input className={"ws__input"+(actionError.includes("endPointURL")?" ws_eb":"")} type='text' placeholder='End Point URL' onChange={endpointURLHandler} value={endPointURL} disabled={disableAction}/>
                    <select className={"ws__select"+(actionError.includes("method")?" ws_eb":"")} onChange={methodHandler} value={method} disabled={disableAction} >
                        <option value="0">Select Method</option>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="HEAD">HEAD</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                    <input className={"ws__input ws__op_input"+(actionError.includes("opInput")?" ws_eb":"")} type="text" placeholder="Operation" onChange={opInputHandler} value={opInput} disabled={disableAction} />
                    <button className="ws__cert_btn" onClick={()=>setShowObjModal("addCert")}>
                        <img src="static/imgs/certificate_ws.png"/>
                    </button>
                    <button className="ws__action_btn ws__bigBtn" disabled={saved && disableAction } onClick={onSave}>Save</button>
                </div>
                
                <textarea 
                    className={"ws__rqst_resp_header"+(actionError.includes("reqHeader")&&activeView==="req"?" ws_eb":"")}
                    value={activeView === "req" ? reqHeader : activeView === "param" ? paramHeader : respHeader} 
                    placeholder={activeView === "req" ? "Request Header" : 
                        activeView === "param" ? "Request Param" : "Response Header"
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
                />}
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

function parseJsonRequest(requestedBody, base_key, cur_key) {
	let xpaths=[]
	try {
     	for (let key in requestedBody){
			 var value=requestedBody[key];
			 if (typeof(value)==="object" && !(Array.isArray(value))){
				if (base_key!== "")  base_key+='/'+key;
				else  base_key=key;
				xpaths.push(base_key);
				xpaths.concat(parseJsonRequest(value,base_key,key));
				base_key=base_key.slice(0,-key.length-1);
			 } else if (Array.isArray(value)) {
				for (var i=0;i<value.length;i++){
					base_key+=key+"["+i.toString()+"]";
					xpaths.concat(parseJsonRequest(value[i],base_key,key));
				}
			 } else {
				xpaths.push(base_key+'/'+key);
			 }
		 }
		 base_key=base_key.slice(0,-cur_key.length);
	} catch (exception) {
		console.error("Exception in the function parseRequest: ERROR::::", exception);
	}
	return xpaths
}