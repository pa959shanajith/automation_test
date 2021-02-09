import React, { useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ScreenWrapper from './ScreenWrapper';
import { ScrapeContext } from '../components/ScrapeContext';
import { RedirectPage, ResetSession } from '../../global';
import SubmitTask from '../components/SubmitTask';
import * as api from '../api';
import "../styles/WebserviceScrape.scss";

const WebserviceScrape = () => {

    const { setShowObjModal, setShowPop, setOverlay, saved, setSaved } = useContext(ScrapeContext);
    const disableAction = useSelector(state=>state.scrape.disableAction);
    const certificateInfo = useSelector(state=>state.scrape.cert);
    const [wsdlURL, setwsdlURL] = useState("");
    const [opDropdown, setOpDropdown] = useState("0");
    const [opList, setOpList] = useState([]);
    const [endpointURL, setEndpoinURL] = useState("");
    const [method, setMethod] = useState("0");
    const [opInput, setOpInput] = useState("");
    const [reqHeader, setReqHeader] = useState("");
    const [reqBody, setReqBody] = useState("");
    const [respHeader, setRespHeader] = useState("");
    const [respBody, setRespBody] = useState("");
    const [activeView, setActiveView] = useState("req");
    const history = useHistory();

    const wsdlURLHandler = event => setwsdlURL(event.target.value);
    const opDropdownHandler = event => setOpDropdown(event.target.value);
    const endpointURLHandler = event => setEndpoinURL(event.target.value);
    const methodHandler = event => setMethod(event.target.value);
    const opInputHandler = event => setOpInput(event.target.value);
    const onHeaderChange = event => {
        if (activeView === "req") setReqHeader(event.target.value);
        else setRespHeader(event.target.value);
    }
    const onBodyChange = event => {
        if (activeView === "req") setReqBody(event.target.value);
        else setRespBody(event.target.value);
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
        
        setEndpoinURL("");
        setOpInput("");
        setMethod("0");
        setReqHeader("");
        setReqBody("");
        setRespHeader("");
        setRespBody("");
        
		// remove upper inputs error
		if (!wsdlURL) console.log("wsdlEmpty") //error wsdlURL
		else if (opDropdown==="0") console.log("op empty") //error
		else {
			setOverlay('Please Wait...');
			ResetSession.start();
			api.wsdlAdd(wsdlURL, opDropdown, certificate)
            .then(data => {
                setOverlay("");
                if (data === "Invalid Session") return RedirectPage(history);
                else if (data === "unavailableLocalServer") setShowPop({title: "WSDL-Scrape Screen", content: "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server."});
                else if (data === "scheduleModeOn") setShowPop({ title: "WSDL-Scrape Screen", content: "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed."})
                else if (typeof data === "object") {
                    
                    setEndpoinURL(data.endPointURL);
                    setMethod(data.method[0].toLowerCase());
                    setOpInput(data.operations);
                    setReqHeader(data.header[0].split("##").join("\n"));

                    let localReqBody;
                    if (!data.body[0].indexOf("{") || !data.body[0].indexOf("[")) {
                        let jsonObj = JSON.parse(data.body);
                        let jsonPretty = JSON.stringify(jsonObj, null, '\t');
                        localReqBody = jsonPretty;
                    } else localReqBody = formatXml(data.body[0].replace(/>\s+</g, '><'));
                    
                    setReqBody(localReqBody);
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
                            <input className="ws__input" type='text' placeholder='Enter WSDL Url' onChange={wsdlURLHandler} value={wsdlURL} />
                            <button className="ws__goBtn" onClick={onGo}>Go</button>
                            <select className="ws__select" value={opDropdown} onChange={opDropdownHandler}>
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
                    <input className="ws__input" type='text' placeholder='End Point URL' onChange={endpointURLHandler} value={endpointURL} disabled={disableAction}/>
                    <select className="ws__select" onChange={methodHandler} value={method} disabled={disableAction} >
                        <option value="0">Select Method</option>
                        <option value="get">GET</option>
                        <option value="post">POST</option>
                        <option value="head">HEAD</option>
                        <option value="put">PUT</option>
                        <option value="delete">DELETE</option>
                    </select>
                    <input className="ws__input ws__op_input" type="text" placeholder="Operation" onChange={opInputHandler} value={opInput} disabled={disableAction} />
                    <button className="ws__cert_btn" onClick={()=>setShowObjModal("addCert")}>
                        <img src="static/imgs/certificate_ws.png"/>
                    </button>
                    <button className="ws__action_btn ws__bigBtn" disabled={saved}>Save</button>
                </div>
                
                <textarea 
                    className="ws__rqst_resp_header" 
                    value={activeView === "req" ? reqHeader : respHeader} 
                    placeholder={activeView === "req" ? "Request Header" : 
                        activeView === "param" ? "Request Param" : "Response Header"
                    }
                    onChange={onHeaderChange}
                    disabled={disableAction}
                />
                
                {activeView !== "param" && <textarea 
                    className="ws__rqst_resp_body" 
                    value={activeView === "req" ? reqBody : respBody} 
                    placeholder={activeView === "req" ? "Request Body" : "Response Body"
                    }
                    onChange={onBodyChange}
                    disabled={disableAction}
                />}
            </div>}
        />
    );
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

export default WebserviceScrape;