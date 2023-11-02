import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import XMLParser from 'react-xml-parser';
import { useNavigate } from 'react-router-dom';
import ScreenWrapper from './ScreenWrapper';
// import ScrapeObject from '../components/ScrapeObject';
import { RedirectPage, ResetSession, Messages as MSG, setMsg } from '../../global';
import { disableAction,actionError, WsData, wsdlError, disableAppend} from '../designSlice';
// import SubmitTask from '../components/SubmitTask';
import * as api from '../api';
import * as scrapeApi from '../api';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/Dropdown';
import { TabView, TabPanel } from 'primereact/tabview';


// import * as actions from '../state/action';
import "../styles/WebserviceScrape.scss";
// import * as actionTypes from '../state/action';
import { InputText } from 'primereact/inputtext';
import CertificateModal from './CertificateModal';
let allXpaths = [];
let allCustnames = [];
let objectLevel = 1;
let xpath = "";

const WebserviceScrape = (props) => {

    const dispatch = useDispatch();
    // const appType = useSelector((state)=>state.mindmap.appType)
    // const {  setOverlay, saved, setSaved, fetchScrapeData,setShowAppPop,startScrape } = useContext(ScrapeContext);
    const DisableAction = useSelector(state=>state.design.disableAction);
    const DisableAppend = useSelector(state => state.design.disableAppend);
    const [appendCheck, setAppendCheck] = useState(false);
    const compareFlag = useSelector(state=>state.design.compareFlag);
    // const current_task = useSelector(state=>state.plugin.CT);
    // const { user_id, role } = useSelector(state=>state.login.userinfo);
    const userInfo = useSelector((state) => state.landing.userinfo);
    const certificateInfo = useSelector(state=>state.design.cert);
    const {endPointURL, method, opInput, reqHeader, reqBody, respHeader, respBody, paramHeader} = useSelector(state=>state.design.WsData);
    const ActionError = useSelector(state=>state.design.actionError);
    // const wsdlError = useSelector(state=>state.design.wsdlError);
    const [wsdlURL, setwsdlURL] = useState("");
    const [opDropdown, setOpDropdown] = useState("0");
    const [opList, setOpList] = useState([]);
    const [activeView, setActiveView] = useState("req");
    const [certificatePopUp,setCertificatePopUp] = useState(false);
    const [visible, setVisible] = useState(true);
    const history = useNavigate()
    const projectAppType = useSelector((state) => state.landing.defaultSelectProject);
    let NameOfAppType = projectAppType
    const typesOfAppType = NameOfAppType.appType;
   const wsdlURLHandler = event => setwsdlURL(event.target.value);
    const opDropdownHandler = event => setOpDropdown(event.target.value);
    const endpointURLHandler = event => dispatch(WsData ({endPointURL : event.target.value})) //setEndpoinURL(event.target.value);
    const methodHandler = event => dispatch( WsData({method : event.target.value})) //setMethod(event.target.value);
    const opInputHandler = event => dispatch(WsData({opInput : event.target.value})) //setOpInput(event.target.value);
    const onHeaderChange = event => {
        if (activeView === "req") dispatch( WsData({reqHeader : event.target.value})) // setReqHeader(event.target.value);
        else if (activeView === "param") dispatch(WsData ({paramHeader : event.target.value})) //setParamHeader(event.target.value);
        else dispatch(WsData({respHeader : event.target.value})) //setRespHeader(event.target.value);
    }
    const onBodyChange = event => {
        if (activeView === "req") dispatch(WsData({reqBody : event.target.value}))//setReqBody(event.target.value);
        else dispatch(WsData({respBody : event.target.value}))//setRespBody(event.target.value);
    }

    const clearFields = () => {
        setwsdlURL("");
        setOpDropdown("0");
        setOpList([]);
        dispatch(
            WsData
            ({
                endPointURL: "",
                method: "0",
                opInput: "",
                reqHeader: "",
                reqBody: "",
                respHeader: "",
                respBody: "",
                paramHeader: "",
            })
        );
        dispatch(disableAction(false));
        dispatch(disableAppend(true));
        dispatch(actionError([]));
        dispatch(wsdlError([]));
    }

    const onSave = () => {
        let arg = {};
        let callApi = true;
        //eslint-disable-next-line
        let rReqHeader = reqHeader.replace(/[\n\r]/g, '##').replace(/"/g, '\"');
        //eslint-disable-next-line
        let rParamHeader = paramHeader.replace(/[\n\r]/g, '##').replace(/"/g, '\"');
        //eslint-disable-next-line
        let rReqBody = reqBody.replace(/[\n\r]/g, '').replace(/\s\s+/g, ' ').replace(/"/g, '\"').replace(/'+/g, "\"");
        //eslint-disable-next-line
        let rRespHeader = respHeader.replace(/[\n\r]/g, '##').replace(/"/g, '\"');
        //eslint-disable-next-line
		let rRespBody = respBody.replace(/[\n\r]/g, '').replace(/\s\s+/g, ' ').replace(/"/g, '\"');
		if (!endPointURL) dispatch(actionError(["endPointURL"])); // error
		else if (method==="0") dispatch( actionError(["method"])); // error
		else {
            dispatch(actionError([]));
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
                                        if (reqparams.length>0) viewArray = reqparams;
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
                                } else {
                                    console.error("Invalid Request header or Request body for XML");
                                    callApi = false;
                                }
                            } else if(rReqHeader.indexOf('json') !== -1){
                                try{
                                    
                                    //Parsing Request Parameters
                                    if (rParamHeader.trim() !== ""){
                                        let reqparams = parseRequestParam(rParamHeader);
                                        if (reqparams.length > 0) viewArray = reqparams;
                                    }
                                    //Parsing Request Body
                                    let xpaths = parseJsonRequest(JSON.parse(rReqBody),"","", []);
                                    for (let object of xpaths) {
                                        let scrapedObjectsWS = {};
                                        scrapedObjectsWS.xpath = object;
                                        scrapedObjectsWS.custname = object;
                                        scrapedObjectsWS.tag = "elementWS";
                                        viewArray.push(scrapedObjectsWS);
                                    }
                                }
                                catch(Exception){
                                    setMsg(MSG.SCRAPE.ERR_REQBODY_INVALID);
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
                    "userId": userInfo.user_id,
                    "roleId": userInfo.role,
                    "screenId": props.fetchingDetails["_id"],
                    "projectid": props.fetchingDetails["projectId"],
                    "screenname": props.fetchingDetails["name"],
                    "versionnumber": props.fetchingDetails.versionnumber,
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
                    props.fetchScrapeData()
                    .then(data=>setMsg(MSG.SCRAPE.SUCC_WS_TEMP_SAVE))
                    .catch(error => setMsg(MSG.SCRAPE.ERR_WS_TEMP_SAVE));
                } else if(data === "Invalid Input"){
                    setMsg(MSG.SCRAPE.ERR_WS_TEMP_SAVE);
                } else{
                    setMsg(MSG.SCRAPE.ERR_WS_TEMP);
                }
            })
            .catch(error => {
                console.error("Error::::", error)
            })
		}
    }


    const onGo = () => {
		if (!wsdlURL) setMsg(MSG.SCRAPE.ERR_WSDL_URL); 
		else {
			props.setOverlay('Please Wait...');
			ResetSession.start();
			api.launchWSDLGo(wsdlURL)
            .then(data => {
                props.setOverlay("");
                ResetSession.end();
                if (data === "Invalid Session") return RedirectPage(history);
                else if (data === "fail") setMsg(MSG.SCRAPE.ERR_WSDL_URL);
                else if (data === "unavailableLocalServer") setMsg(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER);
                else if (data === "scheduleModeOn") setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
                else if (data === "ExecutionOnlyAllowed") setMsg(MSG.GENERIC.WARN_EXECUTION_ONLY)
                else {
                    let localList = [];
                    for (let i = 0; i < data.listofoperations.length; i++) {
                        localList.push(data.listofoperations[i]);
                    }
                    setOpList(localList);
                }
            })
            .catch(error => {
                props.setOverlay("");
                ResetSession.end();
                setMsg(MSG.SCRAPE.ERR_OPERATION);
                console.error("Fail to launch WSDL_GO. ERROR::::", error);
            });
		}
    }
    
    const onAdd = () => {
		let certificate = '';
        if (Object.keys(certificateInfo).length!==0) certificate = certificateInfo;
        
		if (!wsdlURL) dispatch( WsData(["wsdlURL"])); //error wsdlURL
		else if (opDropdown==="0") dispatch(WsData(["opDropdown"])); //error
		else {
            dispatch( wsdlError([]));
			props.setOverlay('Please Wait...');
			ResetSession.start();
			api.wsdlAdd(wsdlURL, opDropdown, certificate)
        .then(data => {
            props.setOverlay("");
          if (data === "Invalid Session") return RedirectPage(history);
          else if (data === "unavailableLocalServer") setMsg(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER);
          else if (data === "scheduleModeOn") setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE)
          else if (typeof data === "object") {
            dispatch(WsData({ endPointURL: data.endPointURL[0] }));
            dispatch(WsData({ method: data.method[0] }));
            dispatch(WsData({ opInput: data.operations[0] }));
            dispatch(WsData({ reqHeader: data.header[0].split("##").join("\n") }))
            dispatch(WsData({ reqHeader: data.header[0].split("##").join("\n") }))
            if (data.param) dispatch(WsData({ paramHeader: data.param[0].split("##").join("\n") }));

            let localReqBody;
            if (!data.body[0].indexOf("{") || !data.body[0].indexOf("[")) {
              let jsonObj = JSON.parse(data.body[0]);
              let jsonPretty = JSON.stringify(jsonObj, null, '\t');
              localReqBody = jsonPretty;
            } else {
              localReqBody = formatXml(data.body[0].replace(/>\s+</g, '><'));
            }

            dispatch(WsData({ reqBody: localReqBody }));
            props.setSaved({ flag: false });
          }
        })
            .catch(error => {
                props.setOverlay("");
                ResetSession.end();
                setMsg(MSG.SCRAPE.ERR_OPERATION);
                console.error("Fail to Add-Scrape. Error::::", error);
            });
		}
    }
    const onAppend = event => {
        dispatch(disableAction(!event.target.checked));
        if (event.target.checked) {
            setAppendCheck(true);
            if (typesOfAppType==="WebService") props.setSaved({ flag: false });
        }
        else setAppendCheck(false);
    }
    

    return (
        <ScreenWrapper

            fullHeight = {true}
            webserviceContent = {<div className="ws__mainContainer mainContainerAd">
                <div className="ws__row">
                    <div className="ws__url_method">
                        <div className="ws__url_m_wrapper">
                            <label>WSDL</label>
                            <InputText
                                className={"ws__input"
                                //  + (wsdlError && typeof wsdlError === 'string' && wsdlError.includes("wsdlURL") ? " ws_eb" : "")
                            }
                                type='text'
                                placeholder='Enter WSDL URL'
                                onChange={wsdlURLHandler}
                                value={wsdlURL}
                            />

                            <Button className="ws__goBtn" onClick={onGo}>Go</Button>
                            <select className={"ws__select"
                            // +(wsdlError && wsdlError.includes("opDropdown")?" ws_eb":"")
                            } value={opDropdown} onChange={opDropdownHandler}>
                                <option disabled={true} value="0">Select Operation</option>
                                { opList.map((op, i) => <option key={i} value={op}>{op}</option>)}
                            </select>
                            <Button className="ws__action_btn ws__bigBtn ws__addBtn" onClick={onAdd}>Add</Button>
                            </div>
                    </div>
                    <p className={'webservice_btn'}  onClick={() => props.startScrape()} ><img className='webservice_img' src='static/imgs/ic-webservice.png'/><span id='Websevice_name'>WebService</span></p>
                    <div key="append-edit" className={"ss__thumbnail edit__btn" + (DisableAppend || compareFlag ? " disable-thumbnail" : "")}>
                        <input data-test="appendInput" id="enable_append" type="checkbox" title="Enable Append" onChange={onAppend} checked={appendCheck} />
                        <span data-test="append" className="ss__thumbnail_title" title="Enable Append">{typesOfAppType==="WebService" ? "Edit" : "Append"}</span>
                     </div>
        
                    {/* <SubmitTask /> */}
                </div>

                
                <div className="ws__row ws__action_wrapper">
                <Button className={"ws__action_btn" + (activeView==="req" ? " ws__active": "")} onClick={()=>setActiveView("req")}>
                        Request
                        { activeView === "req" && <div className="caret__ws fa fa-caret-down"></div>}
                    </Button>
                    <Button className={"ws__action_btn" + (activeView==="param" ? " ws__active": "")} onClick={()=>setActiveView("param")}>
                        Params
                        { activeView === "param" && <div className="caret__ws fa fa-caret-down"></div>}
                    </Button>
                    <Button className={"ws__action_btn" + (activeView==="resp" ? " ws__active": "")} onClick={()=>setActiveView("resp")}>
                        Response
                        { activeView === "resp" && <div className="caret__ws fa fa-caret-down"></div>}
                    </Button>
                    <InputText className={"ws__input"+(ActionError.includes("endPointURL")?" ws_eb":"")} type='text' placeholder='End Point URL' onChange={endpointURLHandler} value={endPointURL} disabled={DisableAction}/>
                    <select className={"ws__select"+(ActionError.includes("method")?" ws_eb":"")} onChange={methodHandler} value={method} disabled={DisableAction} >
                        <option disabled value="0">Select Method</option>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="HEAD">HEAD</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                    <InputText className={"ws__input ws__op_input"+(ActionError.includes("opInput")?" ws_eb":"")} type="text" placeholder="Operation" onChange={opInputHandler} value={opInput} disabled={DisableAction} />
                    <button className="ws__cert_btn" onClick={()=>{setCertificatePopUp(true);setVisible(true);}}>
                        <img alt="cert-icon" src="static/imgs/certificate_ws.png"/>
                    </button>
                        {/* <img className="ws__cert_btn" onClick={()=>{setCertificatePopUp(true); alert("hi")}} alt="cert-icon" src="static/imgs/certificate_ws.png"/> */}
                        {certificatePopUp && <CertificateModal  visible={visible} setVisible={setVisible}/>}
                    <Button className="ws__action_btn" disabled={props.saved.flag && DisableAction } onClick={onSave}>Save</Button>
                    <Button className="ws__action_btn" disabled={
                        !wsdlURL && opDropdown === "0" && !endPointURL && method === "0" && !opInput && !reqHeader && !reqBody && !respHeader && !respBody && !paramHeader
                    } onClick={clearFields}>Clear</Button>
                </div>
                
                <textarea 
                    className={"ws__rqst_resp_header"+(ActionError.includes("reqHeader")&&activeView==="req"?" ws_eb":"")}
                    value={activeView === "req" ? reqHeader : activeView === "param" ? paramHeader : respHeader} 
                    placeholder={activeView === "req" ? "Request Header" : 
                        activeView === "param" ? "param_name = value" : "Response Header"
                    }
                    onChange={onHeaderChange}
                    disabled={DisableAction || activeView === "resp"}
                />
                
                {activeView !== "param" && <textarea 
                    className={"ws__rqst_resp_body" +(ActionError.includes("reqBody")&&activeView==="req"?" ws_eb":"")}
                    value={activeView === "req" ? reqBody : respBody} 
                    placeholder={activeView === "req" ? "Request Body" : "Response Body"
                    }
                    onChange={onBodyChange}
                    disabled={DisableAction ||activeView === "resp"}
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
				parseJsonRequest(value,base_key,key,xpaths);
				base_key=base_key.slice(0,-key.length-1);
			 } else if (Array.isArray(value)) {
				for (var i=0;i<value.length;i++){
					base_key+=key+"["+i.toString()+"]";
					parseJsonRequest(value[i],base_key,key,xpaths);
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