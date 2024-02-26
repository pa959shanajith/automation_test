import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import XMLParser from 'react-xml-parser';
import { useNavigate } from 'react-router-dom';
import ScreenWrapper from './ScreenWrapper';
// import ScrapeObject from '../components/ScrapeObject';
import { RedirectPage, ResetSession, Messages as MSG, setMsg } from '../../global';
import { disableAction, actionError, WsData, wsdlError, disableAppend } from '../designSlice';
// import SubmitTask from '../components/SubmitTask';
import * as api from '../api';
import * as scrapeApi from '../api';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import "../styles/WebserviceScrape.scss";
import { InputText } from 'primereact/inputtext';
import { TabMenu } from 'primereact/tabmenu';
import { Checkbox } from 'primereact/checkbox';
import MonacoEditor from 'react-monaco-editor';
import { RadioButton } from "primereact/radiobutton";
import { InputTextarea } from 'primereact/inputtextarea';
import xmlFormatter from 'xml-formatter';


import CertificateModal from './CertificateModal';
let allXpaths = [];
let allCustnames = [];
let objectLevel = 1;
let xpath = "";

const WebserviceScrape = (props) => {

    const dispatch = useDispatch();
    // const appType = useSelector((state)=>state.mindmap.appType)
    const DisableAction = useSelector(state => state.design.disableAction);
    // const DisableAppend = useSelector(state => state.design.disableAppend);
    const [appendCheck, setAppendCheck] = useState(false);
    // const compareFlag = useSelector(state => state.design.compareFlag);
    // const current_task = useSelector(state=>state.plugin.CT);
    // const { user_id, role } = useSelector(state=>state.login.userinfo);
    const userInfo = useSelector((state) => state.landing.userinfo);
    // const certificateInfo = useSelector(state => state.design.cert);
    const { endPointURL, method, opInput, reqHeader, reqBody, respHeader, respBody, paramHeader, reqAuthKeyword, basicAuthPassword, basicAuthUsername} = useSelector(state => state.design.WsData);
    // if (respBody !== "") { console.log(JSON.parse(JSON.stringify(respHeader))) }
    // console.log("prettifyReqBody", prettifyReqBody);
    // const ActionError = useSelector(state => state.design.actionError);
    // const wsdlError = useSelector(state=>state.design.wsdlError);
    const [wsdlURL, setwsdlURL] = useState("");
    // const [opDropdown, setOpDropdown] = useState("0");
    // const [opList, setOpList] = useState([]);
    // const [activeView, setActiveView] = useState("req");
    // const [certificatePopUp, setCertificatePopUp] = useState(false);
    // const [visible, setVisible] = useState(true);
    const history = useNavigate();
    const projectAppType = useSelector((state) => state.landing.defaultSelectProject);
    const [prettifiedRequestBody, setPrettifiedRequestBody] = useState('');
    const [requestActiveIndex, setRequestActiveIndex] = useState(0);
    const [responseActiveIndex, setResponseActiveIndex] = useState(0);
    const [codeLanguage, setCodeLanguage] = useState('json');
    // const wsdlURLHandler = event => setwsdlURL(event.target.value);
    // const opDropdownHandler = event => setOpDropdown(event.target.value);
    const endpointURLHandler = event => {
        dispatch(WsData({ endPointURL: event.target.value }))
        //setEndpoinURL(event.target.value);
    }
    const [authKeyword, setAuthKeyword] = useState('');
    const [authUsername, setAuthUsername] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authInput, setAuthInput] = useState("");
    const [selectedTab, setSelectedTab] = useState("request");
    const [oAuthScope, setOAuthScope] = useState("");
    const [oAuthClientSecret, setOAuthClientSecret] = useState("");
    const [oAuthUrl, setOAuthUrl] = useState("");
    const [oAuthClientId, setOAuthClientId] = useState("");
    const [oAuthGrantTypechange, setOAuthGrantTypechange] = useState("");

    const responseNavItem = [
        { label: 'Body' },
        { label: 'Header' },
    ]

    const webServiceNavItem = [
        { label: 'Request', key: 'request', text: 'Request' },
        { label: 'Response', key: 'response', text: 'Response' },
    ];

    const requestNavItem = [
        { label: 'Header' },
        { label: 'Body' },
        { label: 'Params' },
        { label: 'Authorization' },
        { label: 'Certificate' }
    ];


    const autheniticateList = [
        { value: "setBasicAuth", name: "Basic Auth" },
        { value: "OAuth_2.0", name: "OAuth 2.0" }
    ];

    const methodType = [{ value: "GET", name: "GET" },
    { value: "POST", name: "POST" },
    { value: "HEAD", name: "HEAD" },
    { value: "PUT", name: "PUT" },
    { value: "DELETE", name: "DELETE" }
    ];

    const options = {
        selectOnLineNumbers: true,
        readOnly: false, // Make sure the editor is not in read-only mode
        minimap: {
            enabled: false, // Disable minimap for simplicity
        },
    };

    // }, reqAuthInput)
    // useEffect(() => {
    //     prettyRequestHandler();
    // }, [requestActiveIndex === 1])

    // useEffect(() => {
    //     setAuthKeyword("setBasicAuth");
    // }, [requestActiveIndex === 3])

    const prettyRequestHandler = () => {
        let prettifyReqBody = "";
        if (reqBody !== "") prettifyReqBody = xmlFormatter(reqBody);
        setPrettifiedRequestBody(prettifyReqBody);
    }

    const methodHandler = event => {
        dispatch(WsData({ method: event.target.value }));
        //reset the endpointUrl, response: header, body; request:header, body
        // dispatch(WsData({ endPointURL: '' }));
        // dispatch(WsData({ paramHeader: '' }));
        // dispatch(WsData({ reqHeader: '' }));
        // dispatch(WsData({ reqBody: '' }));
        // dispatch(WsData({ respBody: '' }));
        // dispatch(WsData({ respHeader: '' }));
        //setMethod(event.target.value);
    }
    const opInputHandler = event => {
        dispatch(WsData({ opInput: event.target.value }));
        // dispatch(WsData({ endPointURL: '' }));
        // dispatch(WsData({ paramHeader: '' }));
        // dispatch(WsData({ reqHeader: '' }));
        // dispatch(WsData({ reqBody: '' }));
        // dispatch(WsData({ respBody: '' }));
        // dispatch(WsData({ respHeader: '' }));
        //setOpInput(event.target.value);
    }
    const onRequestHeaderChange = event => {
        dispatch(WsData({ reqHeader: event })) // setReqHeader(event.target.value);
    }

    const onParamChange = event => {
        dispatch(WsData({ paramHeader: event.target.value })); //setParamHeader(event.target.value);
    }

    const onRequestBodyChange = event => {
        dispatch(WsData({ reqBody: event })); //setReqBody(event.target.value);
        // prettyRequestHandler();
    }

    const onResponseBodyChange = event => {
        dispatch(WsData({ respBody: event })); //setRespBody(event.target.value);
    }

    const onResponseHeaderChange = event => {
        dispatch(WsData({ respHeader: event.target.value }));
    }

    const onAuthorisationUsernameChange = event => {
        setAuthUsername(event.target.value);
        if (authKeyword == 'setBasicAuth') {
            setAuthInput(`${event.target.value};${authPassword};`)
        }
        dispatch(WsData({ basicAuthUsername: event.target.value }));
    }

    const onAuthorisationPasswordChange = event => {
        setAuthPassword(event.target.value);
        if (authKeyword == 'setBasicAuth') {
            setAuthInput(`${authUsername};${event.target.value};`)
        }
        dispatch(WsData({ basicAuthPassword: event.target.value }));
    }

    const setAuthorizationKeyWord = event => {
        setAuthKeyword(event.value)
        dispatch(WsData({ reqAuthKeyword: event.value }));
    }

    const onOAuthUrlChange = (value) => {
        setOAuthUrl(value.trim());
    }
    const onOAuthClientIdChange = (value) => {
        setOAuthClientId(value.trim());
    }
    const onOAuthClientSecretChange = (value) => {
        setOAuthClientSecret(value.trim());
    }
    const onOAuthScopeChange = (value) => {
        setOAuthScope(value.trim());
    }
    const onOAuthGrantTypeChange = (value) => {
        setOAuthGrantTypechange(value.trim());
    }
    // const clearFields = () => {
    //     setwsdlURL("");
    //     setOpDropdown("0");
    //     setOpList([]);
    //     dispatch(
    //         WsData
    //             ({
    //                 endPointURL: "",
    //                 method: "0",
    //                 opInput: "",
    //                 reqHeader: "",
    //                 reqBody: "",
    //                 respHeader: "",
    //                 respBody: "",
    //                 paramHeader: "",
    //             })
    //     );
    //     dispatch(disableAction(false));
    //     dispatch(disableAppend(true));
    //     dispatch(actionError([]));
    //     dispatch(wsdlError([]));
    // }

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
        if (!endPointURL ||  method === "0") props.toastError("Please fill the mandatory fields"); // error
        // else if () props.toastError("Please fill the mandatory fields"); // error
        else {
            dispatch(actionError([]));
            let temp_flag = true; // someflag
            try {
                let viewArray = [];
                if (method && rReqHeader && rReqBody) {
                    if (method === 'POST') {
                        if (rReqBody) {
                            if (rReqHeader.indexOf('json') === -1) {
                                if (rReqBody.indexOf('Envelope') !== -1) {
                                    let parsedReqBody = new XMLParser().parseFromString(rReqBody);
                                    if ('root' in parsedReqBody) {
                                        parsedReqBody = parsedReqBody.body;
                                    }
                                    temp_flag = false;
                                    allXpaths = [];
                                    allCustnames = [];

                                    if (rParamHeader.trim() !== "") {
                                        let reqparams = parseRequestParam(rParamHeader);
                                        if (reqparams.length > 0) viewArray = reqparams;
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
                            } else if (rReqHeader.indexOf('json') !== -1) {
                                try {

                                    //Parsing Request Parameters
                                    if (rParamHeader.trim() !== "") {
                                        let reqparams = parseRequestParam(rParamHeader);
                                        if (reqparams.length > 0) viewArray = reqparams;
                                    }
                                    //Parsing Request Body
                                    let xpaths = parseJsonRequest(JSON.parse(rReqBody), "", "", []);
                                    for (let object of xpaths) {
                                        let scrapedObjectsWS = {};
                                        scrapedObjectsWS.xpath = object;
                                        scrapedObjectsWS.custname = object;
                                        scrapedObjectsWS.tag = "elementWS";
                                        viewArray.push(scrapedObjectsWS);
                                    }
                                }
                                catch (Exception) {
                                    props.toastError(MSG.SCRAPE.ERR_REQBODY_INVALID);
                                    console.error("Invalid Request body.");
                                    callApi = false;
                                }
                            }
                        }
                    } else if (method === 'GET' && rParamHeader.trim() !== "") {
                        try {
                            //Parsing Request Parameters
                            if (rParamHeader.trim() !== "") {
                                var reqparams = parseRequestParam(rParamHeader);
                                if (reqparams.length > 0) viewArray = reqparams;
                            }
                        } catch (Exception) {
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
                    "param": rParamHeader,
                    "authKeyword": authKeyword,
                    "authInput": basicAuthPassword && basicAuthPassword ? `${basicAuthUsername+';'}${basicAuthPassword}` : ''
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
                console.error("Exception - WEBSERVICE::::", exception);
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
                            .then(data => props.toastSuccess(MSG.SCRAPE.SUCC_WS_TEMP_SAVE))
                            .catch(error => props.toastError(MSG.SCRAPE.ERR_WS_TEMP_SAVE));
                        // props.startScrape()
                    } else if (data === "Invalid Input") {
                        props.toastError(MSG.SCRAPE.ERR_WS_TEMP_SAVE);
                    } else {
                        props.toastError(MSG.SCRAPE.ERR_WS_TEMP);
                    }
                })
                .catch(error => {
                    console.error("Error::::", error)
                })
        }
    }
    const onGenerateToken = () => {
        api.generateToken({'type':'OAuth2.0'});
    }

    const onAppendchange = (e) => {
        if (e.checked) {
            setAppendCheck(true);
        } else setAppendCheck(false);
    }
    return (

        <div className='webservice_container'>
            <TabMenu model={webServiceNavItem} activeIndex={webServiceNavItem.findIndex((item) => item.key === selectedTab)} onTabChange={(e) => setSelectedTab(webServiceNavItem[e.index].key)} />
            {selectedTab === "request" &&
                <div className='webservice_left_container'>
                    <div className='request_inputfields'>
                        <Dropdown
                            data-test=""
                            id=""
                            defaultValue={""}
                            value={method}
                            options={methodType}
                            optionLabel="name"
                            className={`method_dropdown p-inputtext-sm `}
                            placeholder='Select'
                            style={{ width: "10%" }}
                            onChange={methodHandler}
                            disabled={!appendCheck && method }
                        />
                        <InputText
                            className='p-inputtext-sm'
                            placeholder="Enter URL"
                            type='text'
                            onChange={endpointURLHandler}
                            value={endPointURL} 
                            style={{ width: "50%" }}
                            disabled={!appendCheck && !endPointURL}
                        />
                        <InputText className='p-inputtext-sm '
                            placeholder="operation"
                            type="text"
                            onChange={opInputHandler}
                            value={opInput}
                            style={{ width: "20%" }}
                            disabled={!appendCheck && !opInput}
                        />
                        <div className='flex' style={{ gap: "1rem", width: "fitContent" }}>
                            <Button label="send" size="small"
                                onClick={() => props.startScrape()}
                            ></Button>
                            <Button label="save" size="small"
                                disabled={!appendCheck && !method && !endPointURL}
                                onClick={onSave}
                            ></Button>
                            <div className='flex' style={{ alignItems: "center" }}>
                                <Checkbox label="Append" inputId={"appendChecker"} name="append_checker" value={appendCheck} onChange={onAppendchange} checked={appendCheck} />
                                <span className='pl-1'> Append</span>
                            </div>
                        </div>


                    </div>
                    <div>
                        <TabMenu model={requestNavItem} activeIndex={requestActiveIndex} onTabChange={(e) => setRequestActiveIndex(e.index)} />
                    </div>

                    {/* -----------Header----------------- */}
                    {requestActiveIndex === 0 &&
                        <div style={{ width: "100%", height: "50vh" }}>
                            <MonacoEditor
                                language="javascript"
                                theme="vs-light"
                                value={reqHeader}
                                options={options}
                                onChange={onRequestHeaderChange}
                            />
                        </div>
                    }

                    {/* -----------Body----------------- */}
                    {requestActiveIndex === 1 &&
                        <div style={{ width: "100%", height: "50vh" }}>
                            <MonacoEditor
                                language="xml"
                                theme="vs-light"
                                value={reqBody}
                                options={options}
                                onChange={onRequestBodyChange}
                            />
                        </div>
                    }

                    {/* -----------Params----------------- */}
                    {requestActiveIndex === 2 &&
                        <InputTextarea
                            aria-label="param_details"
                            value={paramHeader}
                            placeholder={"param_name = value"}
                            onChange={onParamChange}
                            rows={10} cols={50}
                        />
                    }

                    {/* -----------Authenticate----------------- */}
                    {requestActiveIndex === 3 && <div style={{ overflow: "auto" }}>
                        <div className='flex flex-column'>
                            <div className='inputs_container'>
                                <label htmlFor={"typeSelect"} className="inputs_container_label" >TYPE</label>
                                <Dropdown
                                    data-test="typeSelect"
                                    id="typeSelect"
                                    value={reqAuthKeyword}
                                    options={autheniticateList}
                                    optionLabel="name"
                                    className={`p-inputtext-sm`}
                                    style={{ width: '70%' }}
                                    placeholder=''
                                    onChange={setAuthorizationKeyWord}
                                    defaultValue={autheniticateList[0]}
                                />
                               { reqAuthKeyword === "OAuth_2.0" &&  <div style={{width:'20%'}}>
                                    <Button size="small" label="Generate Token"></Button>
                                </div>}
                            </div>
                            {reqAuthKeyword === "setBasicAuth" && <>
                                <div className='inputs_container'>
                                    <label htmlFor={"basic_auth_username"} className="inputs_container_label" > Username </label>
                                    <InputText
                                        className=' p-inputtext-sm'
                                        inputId="basic_auth_username"
                                        style={{ width: '70%' }}
                                        value={basicAuthUsername}
                                        onChange={onAuthorisationUsernameChange}
                                    />
                                </div>
                                <div className='inputs_container'>
                                    <label htmlFor={""} className="inputs_container_label" > Password </label>
                                    <InputText
                                        className=' p-inputtext-sm'
                                        inputId="basic_auth_password"
                                        style={{ width: '70%' }}
                                        value={basicAuthPassword}
                                        onChange={onAuthorisationPasswordChange}
                                    />
                                </div>
                            </>}
                            { reqAuthKeyword === "OAuth_2.0" && <>
                                <div className='inputs_container'>
                                    <label htmlFor={"oauth_url"} className="inputs_container_label" > URL </label>
                                    <InputText
                                        className=' p-inputtext-sm'
                                        inputId="oauth_url"
                                        style={{ width: '70%' }}
                                        value={oAuthUrl}
                                        onChange={onOAuthUrlChange}
                                    />
                                    <div style={{width:'20%'}}>
                                    <Button size="small" label="Generate Token" onClick={onGenerateToken}></Button>
                                    </div>
                                </div>
                                <div className='inputs_container'>
                                    <label htmlFor={"oauth_client_id"} className="inputs_container_label" > Client Id </label>
                                    <InputText
                                        className=' p-inputtext-sm'
                                        inputId="oauth_client_id"
                                        style={{ width: '70%' }}
                                        value={oAuthClientId}
                                        onChange={onOAuthClientIdChange}
                                    />
                                </div>
                                <div className='inputs_container'>
                                    <label htmlFor={"oauth_client_secret"} className="inputs_container_label" > Client Secret </label>
                                    <InputText
                                        className=' p-inputtext-sm'
                                        inputId="oauth_client_secret"
                                        style={{ width: '70%' }}
                                        value={oAuthClientSecret}
                                        onChange={onOAuthClientSecretChange}
                                    />
                                </div>
                                <div className='inputs_container'>
                                    <label htmlFor={"oauth_scope"} className="inputs_container_label" > Scope </label>
                                    <InputText
                                        className=' p-inputtext-sm'
                                        inputId="oauth_scope"
                                        style={{ width: '70%' }}
                                        value={oAuthScope}
                                        onChange={onOAuthScopeChange}
                                    />
                                </div>
                                <div className='inputs_container'>
                                    <label htmlFor={"oauth_grant_type"} className="inputs_container_label" >Grant Type</label>
                                    <InputText
                                        className=' p-inputtext-sm'
                                        inputId="oauth_grant_type"
                                        style={{ width: '70%' }}
                                        value={oAuthGrantTypechange}
                                        onChange={onOAuthGrantTypeChange}
                                    />
                                </div>
                                
                            </>}

                            {/* <h4 style={{ marginLeft: "1rem" }}>Current Token</h4>
                            <span style={{ fontSize: "12px", marginLeft: "1rem" }}>The access token is only available to you. Sync the token to let collaborators on this request use it</span>
                            <div className='inputs_container'>
                                <label htmlFor={""} className="inputs_container_label"  >Access Token</label>
                                <div style={{ width: '70%', display: 'flex', gap: '1rem' }} >
                                    <Dropdown

                                        optionLabel="name"
                                        style={{ width: '50%' }}
                                        className={`p-inputtext-sm`}

                                    />
                                    <InputText className={`p-inputtext-sm`} style={{ width: '50%' }} placeholder="Some access tokens" />
                                </div>
                            </div>
                            <div className='inputs_container'>
                                <label htmlFor={""} className="inputs_container_label"  >Header Prefix</label>
                                <InputText className=' p-inputtext-sm' placeholder="Bearer" style={{ width: '70%' }} />
                            </div> */}


                        </div>

                        {/* <h4 style={{ marginLeft: "1rem" }}>Configure New Token</h4> */}
                        {/* <div>
                            <div className='inputs_container'>
                                <label htmlFor={""} className="inputs_container_label"  >Token Name</label>
                                <InputText className='' placeholder="New access token" style={{ width: '70%' }} />
                            </div>
                            <div className='inputs_container'>
                                <label htmlFor={""} className="inputs_container_label"  >Grant Type</label>
                                <Dropdown
                                     optionLabel="name"
                                     style={{ width: '70%' }}
                                     className={`p-inputtext-sm`}
                                     placeholder='Authorization Code'
                                 />
                             </div>
                            <div className='inputs_container'>
                                <label htmlFor={""} className="inputs_container_label"  >Callback URL</label>
                                <div className='flex flex-column' style={{ width: '70%' }}>
                                    <InputText className=' p-inputtext-sm' placeholder="http:localhost:300/redirect" />
                                    <span className='flex flex-row'>
                                        <Checkbox inputId={"editChecker"} name="response_checker" value={""} onChange={""} checked={true} />
                                        <label htmlFor={"editChecker_text"} className="ml-2">Authorize Using Browser</label>
                                    </span>
                                </div>
                            </div>

                            <div className='inputs_container'>
                                <label htmlFor={""} className="inputs_container_label"  >Auth URL</label>
                                <InputText className=' p-inputtext-sm' style={{ width: '70%' }} placeholder="http:localhost:300/auth" />
                            </div>
                            <div className='inputs_container'>
                                <label htmlFor={""} className="inputs_container_label"  >Access Token URL</label>
                                <InputText className=' p-inputtext-sm' placeholder="http:localhost:300/token" style={{ width: '70%' }} />
                            </div>
                        </div> */}
                    </div>}

                    {/* -----------Certificate----------------- */}
                    {requestActiveIndex === 4 && <div className='certificate_container'>
                        <CertificateModal />
                    </div>
                    }

                </div>
            }

            {/* -----------------------------------------------------RESPONSE ----------------------------------------- */}
            {selectedTab === "response" &&
                <div className='webservice_left_container'>
                    <div className='response_container'>
                        <div>
                            <TabMenu model={responseNavItem} activeIndex={responseActiveIndex} onTabChange={(e) => setResponseActiveIndex(e.index)} />
                        </div>

                        <div>
                            {/* -----------Body----------------- */}
                            {responseActiveIndex === 0 &&
                                <div style={{ width: "100%", height: "50vh" }}><MonacoEditor
                                    language={"javascript"}
                                    theme="vs-light"
                                    value={respBody}
                                    options={options}
                                    onChange={onResponseBodyChange}
                                />
                                </div>
                            }

                            {/* -----------Header----------------- */}
                            {responseActiveIndex === 1 &&
                                <div style={{ width: "100%", height: "50vh" }}>
                                    <MonacoEditor
                                        language={"javascript"}
                                        theme="vs-light"
                                        value={respHeader}
                                        options={options}
                                        onChange={onResponseHeaderChange}
                                    />
                                </div>}
                        </div>
                        {/* <div className="card flex justify-content-center">
                            <div className="flex flex-wrap gap-3">
                                <div className="flex align-items-center">
                                    <RadioButton inputId="codeLanguage1" name="pizza" value="json" onChange={(e) => setCodeLanguage(e.value)} checked={codeLanguage === 'json'} />
                                    <label htmlFor="codeLanguage1" className="ml-2">json</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton inputId="codeLanguage2" name="pizza" value="XML" onChange={(e) => setCodeLanguage(e.value)} checked={codeLanguage === 'XML'} />
                                    <label htmlFor="codeLanguage2" className="ml-2">XML</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton inputId="codeLanguage3" name="pizza" value="HTML" onChange={(e) => setCodeLanguage(e.value)} checked={codeLanguage === 'HTML'} />
                                    <label htmlFor="codeLanguage3" className="ml-2">HTML</label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton inputId="codeLanguage4" name="pizza" value="Javascript" onChange={(e) => setCodeLanguage(e.value)} checked={codeLanguage === 'Javascript'} />
                                    <label htmlFor="codeLanguage4" className="ml-2">Javascript</label>
                                </div>
                            </div>
                        </div> */}
                        {/* <div className='flex flex-column justify-content-centre'>
                            <img style={{ height: '24vh' }} alt="no-response-icon" src="static/imgs/no_response_illustration.svg" />
                            <span style={{ textAlign: 'center' }}>No reponse,</span>
                            <span>please send request to get response</span>
                        </div> */}
                    </div>

                </div>
            }
        </div >

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
    let xpaths = xpath;
    try {
        for (let key in requestedBody) {
            var value = requestedBody[key];
            if (typeof (value) === "object" && !(Array.isArray(value))) {
                if (base_key !== "") base_key += '/' + key;
                else base_key = key;
                xpaths.push(base_key);
                parseJsonRequest(value, base_key, key, xpaths);
                base_key = base_key.slice(0, -key.length - 1);
            } else if (Array.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    base_key += key + "[" + i.toString() + "]";
                    parseJsonRequest(value[i], base_key, key, xpaths);
                }
            } else {
                xpaths.push(base_key + '/' + key);
            }
        }
        base_key = base_key.slice(0, -cur_key.length);
    } catch (exception) {
        console.error("Exception in the function parseRequest: ERROR::::", exception);
    }
    return xpaths;
}

function parseRequestParam(parameters) {
    let paramsArray = [];
    try {
        var params = parameters.split('##');
        for (let object of params) {
            object = object.split(":");
            let scrapedObjectsWS = {};
            scrapedObjectsWS.xpath = object[0].trim();
            scrapedObjectsWS.custname = object[0].trim();
            scrapedObjectsWS.tag = "elementWS";
            paramsArray.push(scrapedObjectsWS);
        }
    } catch (Exception) {
        console.error(Exception);
    }
    return paramsArray
}