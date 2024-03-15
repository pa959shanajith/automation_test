import React, { useState, useEffect } from 'react';
import { ModalContainer, ScreenOverlay, Messages as MSG, setMsg } from '../../global'
import '../styles/IntegrationDropDown.scss'
import { loginQCServer_ICE, loginQTestServer_ICE, loginZephyrServer_ICE, getDetails_ZEPHYR, getDetails_Azure, connectAzure_ICE } from '../../execute/api';
import { getDetails_Testrail, getTestPlanDetails, getTestPlansAndRuns } from '../../settings/api';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useSelector } from "react-redux";

/*Component IntegrationDropDown
  use: renders integration popup for ALM/ qTest/ Zypher
*/

const IntegrationDropDown = ({ setshowModal, type, browserTypeExe, appType, integrationCred, setCredentialsExecution, displayError, integrationType }) => {
    const [credentials, setCredentials] = useState({ url: "", userName: "", password: "", apitoken: "", authtype: "basic", testrailUserName: "", testrailApiKey: "" });
    const [urlErrBor, setUrlErrBor] = useState(false)
    const [usernameErrBor, setUserNameErrBor] = useState(false)
    const [passErrBor, setPassErrBor] = useState(false)
    const [authErrBor, setAuthErrBor] = useState(false)
    const [qtestSteps, setqtestSteps] = useState(false)
    const [testrailLoginData, settestrailLoginData] = useState(false);
    const [selectedTestrailRunsPlans, setSelectedTestrailRunsPlans] = useState({
        plan: "",
        run: ""
    });
    const [errorMsg, setErrorMsg] = useState("")
    const [zephAuthType, setZephAuthType] = useState("basic");
    const [isEmpty, setIsEmpty] = useState(true);

    const saveAction = async (autoSaveFlag = false, updatedData = {}) => {
        var integration = {
            alm: { url: "", username: "", password: "" },
            qtest: { url: "", username: "", password: "", qteststeps: "" },
            zephyr: { url: "", username: "", password: "" },
            testrail: { url: "", username: "", password: "" },
            azure: { url: "", username: "", password: "" },
        }
        setCredentialsExecution(integration)

        setPassErrBor(false); setUrlErrBor(false); setUserNameErrBor(false); setAuthErrBor(false); setErrorMsg("");
        const latestCredentialsData = autoSaveFlag ? updatedData : credentials;
        if (type === "Zephyr" && !latestCredentialsData.url) {
            setUrlErrBor(true);
            setErrorMsg("Please " + placeholder[type].url);
        } else if (type === "Zephyr" && latestCredentialsData.authtype === "basic" && !latestCredentialsData.userName) {
            setUserNameErrBor(true);
            setErrorMsg("Please " + placeholder[type].username);
        } else if (type === "Zephyr" && latestCredentialsData.authtype === "basic" && !latestCredentialsData.password) {
            setPassErrBor(true);
            setErrorMsg("Please " + placeholder[type].password);
        } else if (type === "Zephyr" && latestCredentialsData.authtype === "token" && !latestCredentialsData.apitoken) {
            setAuthErrBor(true);
            setErrorMsg("Please " + placeholder[type].apitoken);
        } else if (type !== "Zephyr" && integrationType !== "TestRail" && !latestCredentialsData.url) {
            setUrlErrBor(true);
            setErrorMsg("Please " + placeholder[type].url);
        } else if (type !== "Zephyr" && integrationType !== "TestRail" && !latestCredentialsData.userName) {
            setUserNameErrBor(true);
            setErrorMsg("Please " + placeholder[type].username);
        } else if (type !== "Zephyr" && integrationType !== "TestRail" && !latestCredentialsData.password) {
            setPassErrBor(true);
            setErrorMsg("Please " + placeholder[type].password);
        } else if (appType !== "SAP" && browserTypeExe.length === 0) {
            setshowModal(false);
            displayError(MSG.EXECUTE.WARN_SELECT_BROWSER);
        }
        else {
            setErrorMsg("");
            var data = undefined;
            var apiIntegration = loginQTestServer_ICE;
            if (type === "ALM") apiIntegration = loginQCServer_ICE;
            if (type === "Zephyr") data = await loginZephyrServer_ICE(latestCredentialsData.url, latestCredentialsData.userName, latestCredentialsData.password, latestCredentialsData.apitoken, latestCredentialsData.authtype, type);
            if (type === "Azure") data = await connectAzure_ICE(latestCredentialsData.url, latestCredentialsData.userName, latestCredentialsData.password);
            if (type === "qTest") data = await apiIntegration(latestCredentialsData.url, latestCredentialsData.userName, latestCredentialsData.password, type);
            if (integrationType === "TestRail") {
                data = await getDetails_Testrail(latestCredentialsData.url, latestCredentialsData.testrailUserName, latestCredentialsData.testrailApiKey);
            };
            if (data.error) { displayError(data.error); return; }
            else if (data === "unavailableLocalServer") setErrorMsg("Unavailable LocalServer");
            else if (data === "Invalid Session") setErrorMsg("Invalid Session");
            else if (data === "invalidcredentials") setErrorMsg("Invalid Credentials");
            else if (data === "serverdown") setErrorMsg("Host not serviceable.");
            else if (data === "notreachable") setErrorMsg("Host not reachable.");
            else if (data === "invalidurl") setErrorMsg("Invalid URL");
            else {

                if (type === "ALM") {
                    integration.alm = {
                        url: latestCredentialsData.url,
                        username: latestCredentialsData.userName,
                        password: latestCredentialsData.password
                    }
                    setshowModal(false);
                }
                else if (type === "qTest") {
                    integration.qtest = {
                        url: latestCredentialsData.url,
                        username: latestCredentialsData.userName,
                        password: latestCredentialsData.password,
                        qteststeps: qtestSteps
                    }
                    setshowModal(false);
                }
                else if (type === "Zephyr") {
                    integration.zephyr = {
                        url: latestCredentialsData.url,
                        username: latestCredentialsData.userName,
                        password: latestCredentialsData.password,
                        apitoken: latestCredentialsData.apitoken,
                        authtype: latestCredentialsData.authtype
                    }
                    setshowModal(false);
                }
                else if (type === "Azure") {
                    integration.azure = {
                        url: latestCredentialsData.url,
                        username: latestCredentialsData.userName,
                        password: latestCredentialsData.password
                    }
                    setshowModal(false);
                }
                else if (integrationType === "TestRail") {
                    integration.testrail = {
                        url: latestCredentialsData.url,
                        username: latestCredentialsData.testrailUserName,
                        apitoken: latestCredentialsData.testrailApiKey,
                        runId: selectedTestrailRunsPlans.run.id,
                        planId: selectedTestrailRunsPlans.plan.id,
                        runAndPlanDetails: selectedTestrailRunsPlans
                    }
                    if (Object.keys(selectedTestrailRunsPlans.run).length > 0) {
                        setshowModal(false);
                    } else {
                        setshowModal(true);
                    }
                }
                setCredentialsExecution(integration)
            }
        }
    }

    return (
        <ModalContainer
            className="modal_integration"
            title={integrationType || type}
            show={true}
            footer={submitModal(errorMsg, saveAction, type, isEmpty)}
            close={() => { setshowModal(false) }}
            content={MiddleContent(credentials, setCredentials, urlErrBor, usernameErrBor, passErrBor, authErrBor, type, qtestSteps, setqtestSteps, zephAuthType, setZephAuthType, setErrorMsg, saveAction, setIsEmpty, selectedTestrailRunsPlans, setSelectedTestrailRunsPlans, testrailLoginData, settestrailLoginData, integrationType)}
            modalClass=" i__modal"
        />
    )
}

const submitModal = (errorMsg, saveAction, type, isEmpty) => {
    return (
        <div className="i__popupWrapRow" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="i__error-msg" style={{ marginTop: '-1.4rem' }}>
                {
                    type === "Zephyr" && isEmpty && <><span style={{ color: '#333' }} ><img src={"static/imgs/info.png"} style={{ width: '6%' }} alt={"Tip: "} ></img> Save Credentials in Settings for Auto Login</span><br /></>
                }
                {errorMsg}
            </span>
            <Button type="button" className="save_integration e__btn-md " size='small' onClick={() => { saveAction() }} >Save</Button>
            {/* <div className="i__textFieldsContainer">
            <p align="right" className="i__textFieldsContainer-cust">
                <span className="i__error-msg" style={{ marginTop: '-1.4rem'}}>
                    {
                        type==="Zephyr" && isEmpty && <><span style={{color: '#333'}} ><img src={"static/imgs/info.png"} style={{width: '6%'}} alt={"Tip: "} ></img> Save Credentials in Settings for Auto Login</span><br /></>
                    }
                    {errorMsg}
                </span>
                <button type="button" className="e__btn-md " onClick={()=>{saveAction()}} >Save</button>
            </p>
            </div> */}
        </div>
    )
}

const MiddleContent = (credentials, setCredentials, urlErrBor, usernameErrBor, passErrBor, authErrBor, type, qtestSteps, setqtestSteps, zephAuthType, setZephAuthType, setErrorMsg, saveAction, setIsEmpty, selectedTestrailRunsPlans, setSelectedTestrailRunsPlans, testrailLoginData, settestrailLoginData, integrationType) => {
    const [loading, setLoading] = useState(false);
    const [testrailDetails, setTestrailDetails] = useState([]);
    const [testrailPlans, setTestrailPlans] = useState([]);
    const [testrailRuns, setTestrailRuns] = useState([]);
    const [populateDetails, setPopulateDetails] = useState({});
    const [defaultValues, setDefaultValues] = useState(false);
    const testrailPlanRunDetails = useSelector((state) => state.configsetup.testrailPlanRunIds);
    const editConfig = useSelector((state) => state.configsetup.setEditConfig);

    const populateFields = async (authtype) => {
        setErrorMsg("");
        let tempCredentialsData = {};
        if (authtype === "token") {
            tempCredentialsData.url = (defaultValues.url) ? defaultValues.url : "";
            tempCredentialsData.userName = "";
            tempCredentialsData.password = "";
            tempCredentialsData.apitoken = (defaultValues.apitoken) ? defaultValues.apitoken : "";
            tempCredentialsData.authtype = authtype;
        } else {
            tempCredentialsData.url = (defaultValues.url) ? defaultValues.url : "";
            tempCredentialsData.userName = (defaultValues.userName) ? defaultValues.userName : "";
            tempCredentialsData.password = (defaultValues.password) ? defaultValues.password : "";
            tempCredentialsData.apitoken = "";
            tempCredentialsData.authtype = authtype;
        }
        setZephAuthType(authtype);
        setCredentials({ url: tempCredentialsData.url, userName: tempCredentialsData.userName, password: tempCredentialsData.password, apitoken: tempCredentialsData.apitoken, authtype: authtype });
    }
    const getDetails = async (type) => {
        try {
            setLoading("Loading...")
            if (type == 'Zephyr') {
                const data = await getDetails_ZEPHYR()
                if (data.error) { setMsg(data.error); return; }
                if (data !== "empty") {
                    setIsEmpty(false);
                    let credentialsData = {
                        authtype: 'basic',
                        url: '',
                        apitoken: '',
                        userName: '',
                        password: ''
                    };

                    if (data.zephyrURL) credentialsData['url'] = data.zephyrURL;
                    if (data.zephyrAuthType) credentialsData['authtype'] = data.zephyrAuthType;
                    if (data.zephyrToken) credentialsData['apitoken'] = data.zephyrToken;
                    if (data.zephyrUsername) credentialsData['userName'] = data.zephyrUsername;
                    if (data.zephyrPassword) credentialsData['password'] = data.zephyrPassword;

                    setDefaultValues(credentialsData);
                    // setZephAuthType(credentialsData.authtype);
                    setCredentials(credentialsData);
                    saveAction(true, credentialsData);
                }
            } else if (integrationType == 'TestRail') {
                const data = await getDetails_Testrail();
                if (data.error) { setMsg(data.error); return; }
                if (data !== "empty" || data != {}) {
                    setIsEmpty(false);
                    let credentialsData = {
                        url: '',
                        testrailUserName: '',
                        testrailApiKey: ''
                    };

                    if (data.url) credentialsData['url'] = data.url;
                    if (data.username) credentialsData['testrailUserName'] = data.username;
                    if (data.apiKey) credentialsData['testrailApiKey'] = data.apiKey;

                    setDefaultValues(credentialsData);
                    // setZephAuthType(credentialsData.authtype);
                    setCredentials(credentialsData);
                    saveAction(true, credentialsData);
                }
            } else {
                const data = await getDetails_Azure()
                if (data.error) { setMsg(data.error); return; }
                if (data !== "empty") {
                    setIsEmpty(false);
                    let credentialsData = {
                        // authtype: 'basic',
                        // url: '',
                        // apitoken: '',
                        userName: '',
                        password: '',
                        url: '',
                    };

                    // if(data.zephyrURL) credentialsData['url'] = data.zephyrURL;
                    // if(data.zephyrAuthType) credentialsData['authtype'] = data.zephyrAuthType;
                    // if(data.zephyrToken) credentialsData['apitoken'] = data.zephyrToken;
                    if (data.AzureUsername) credentialsData['userName'] = data.AzureUsername;
                    if (data.AzurePAT) credentialsData['password'] = data.AzurePAT;
                    if (data.AzureURL) credentialsData['url'] = data.AzureURL;

                    setDefaultValues(credentialsData);
                    // setZephAuthType(credentialsData.authtype);
                    setCredentials(credentialsData);
                    saveAction(true, credentialsData);
                }
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }
    useEffect(() => {
        (type === "Zephyr" || type === "Azure" || type == "TestRail") && getDetails(type);
    }, [])

    useEffect(() => {
        const fetchTestplansAndRuns = async () => {
            if (!editConfig) {
                const fetchTestPlans = async () => {
                    try {
                        const data = await getTestPlansAndRuns();
                        setTestrailDetails(() => data);
                        setTestrailPlans(() => data.testPlans?.map((plan) => {
                            return {
                                name: plan.name,
                                id: plan.id
                            }
                        }));
                    } catch (err) {
                        console.log("err", err);
                    }
                }

                if (type === "TestRail") {
                    setSelectedTestrailRunsPlans(testrailPlanRunDetails);
                    fetchTestPlans();
                }
            } else {
                const fetchTestPlans = async () => {
                    try {
                        const data = await getTestPlansAndRuns();
                        setTestrailDetails(() => data);
                        setTestrailPlans(data.testPlans?.map((plan) => {
                            return {
                                name: plan.name,
                                id: plan.id
                            }
                        }));
                    } catch (err) {
                        console.log("err", err);
                    }
                }
                fetchTestPlans();

                setSelectedTestrailRunsPlans((prev) => {
                    return {
                        ...prev,
                        plan: testrailPlanRunDetails?.plan
                    }
                });

                const planDetails = await getTestPlanDetails(testrailPlanRunDetails?.plan.id);
                if(planDetails.length) {
                    const plans = planDetails?.map((plan) => plan?.runs.map((run)=>{
                        return {
                            name: run.name,
                            id: run.id
                        }
                    }));

                    if (plans?.length) {
                        setTestrailRuns((prev) => plans?.flat(Infinity));
                    }
                }
            }
        }

        fetchTestplansAndRuns();
    }, [type]);


    const onDropdownChange = async (e, type) => {
        setPopulateDetails({ e, type });
        if (type == "plan") {
            setSelectedTestrailRunsPlans({
                ...selectedTestrailRunsPlans,
                plan: e
            });

            if (e.name !== "Default") {
                const planDetails = await getTestPlanDetails(e.id);
                const plans = planDetails?.map((plan) => plan?.runs.map((run) => {
                    return {
                        name: run.name,
                        id: run.id
                    }
                }));

                if (plans?.length) {
                    setTestrailRuns((prev) => plans?.flat(Infinity));
                }
            } else {
                setTestrailPlans(testrailDetails.testPlans);
                setTestrailRuns(testrailDetails.testRuns);
            }
        } else if (type == "runs") {
            setSelectedTestrailRunsPlans({
                ...selectedTestrailRunsPlans,
                run: e
            });
        }
    };

    return (
        <div className="popupWrapRow">
            {loading ? <ScreenOverlay content={loading} /> : null}
            <div className="textFieldsContainer">
                {type === "Zephyr" ?
                    <>
                        <div className='ilm__authtype_cont'>
                            <span className="ilm__auth" title="Authentication Type">Authentication Type</span>
                            <label className="authTypeRadio ilm__leftauth">
                                <input type="radio" value="basic" checked={zephAuthType === "basic"} onChange={() => { populateFields("basic") }} className='radio_basic' />
                                <span>Basic</span>
                            </label>
                            <label className="authTypeRadio">
                                <input type="radio" value="token" checked={zephAuthType === "token"} onChange={() => { populateFields("token") }} className='radio_token' />
                                <span>Token</span>
                            </label>
                        </div>
                    </>
                    : null}
                {integrationType !== "TestRail" && <p><input value={credentials?.url} onChange={(event) => { setCredentials({ url: event.target.value, userName: credentials.userName, password: credentials.password, apitoken: credentials.apitoken, authtype: credentials.authtype }) }} type="text" className={(urlErrBor ? " i__inputErrBor " : "") + "i__input-cust i__input e__modal-alm-input "} placeholder={placeholder[type].url} style={{ marginBottom: "1rem" }} /></p>}
                {(type === "Zephyr" && zephAuthType === "basic") ?
                    <>
                        <p className="halfWrap halfWrap-margin" ><input value={credentials.userName} onChange={(event) => { setCredentials({ url: credentials.url, userName: event.target.value, password: credentials.password, apitoken: credentials.apitoken, authtype: credentials.authtype }) }} type="text" className={"i__input-cust i__input e__modal-alm-input" + (usernameErrBor ? " i__inputErrBor" : "")} placeholder={placeholder[type].username} style={{ marginBottom: "1rem" }} /></p>
                        <p className="halfWrap"><input value={credentials.password} onChange={(event) => { setCredentials({ url: credentials.url, userName: credentials.userName, password: event.target.value, apitoken: credentials.apitoken, authtype: credentials.authtype }) }} type="password" className={"i__input-cust i__input e__modal-alm-input" + (passErrBor ? " i__inputErrBor" : "")} placeholder={placeholder[type].password} /></p>
                    </>
                    : null}
                {(type === "Zephyr" && zephAuthType === "token") ?
                    <>
                        <p><input value={credentials.apitoken} onChange={(event) => { setCredentials({ url: credentials.url, userName: credentials.userName, password: credentials.password, apitoken: event.target.value, authtype: credentials.authtype }) }} type="text" className={"i__input-cust i__input e__modal-alm-input" + (authErrBor ? " i__inputErrBor" : "")} placeholder={placeholder[type].apitoken} /></p>
                    </>
                    : null}
                {type === "qTest" ?
                    <p className="qtestSteps"  ><input value={qtestSteps} onChange={() => { setqtestSteps(!qtestSteps) }} type="checkbox" title="Update steps status" style={{ marginTop: "1rem" }} /><span className="i__step">Update step status</span></p>
                    : null}
                {integrationType === "TestRail" ?
                    <>
                        <p className="halfWrap">
                            <input value={credentials.testrailUserName} onChange={(event) => { setCredentials({ url: credentials.url, testrailUserName: event.target.value, testrailApiKey: credentials.testrailApiKey, userName: credentials.userName, }) }} type="text" className={"i__input-cust i__input e__modal-alm-input" + (usernameErrBor ? " i__inputErrBor" : "")} placeholder={placeholder[integrationType].username} style={{ marginBottom: "1rem" }} />
                        </p>
                        <p className="halfWrap">
                            <input value={credentials.testrailApiKey} onChange={(event) => { setCredentials({ url: credentials.url, testrailUserName: credentials.testrailUserName, testrailApiKey: event.target.value, userName: credentials.userName, }) }} type="text" className={"i__input-cust i__input e__modal-alm-input" + (passErrBor ? " i__inputErrBor" : "")} placeholder={placeholder[integrationType].password} />
                        </p>
                        <p><input value={credentials.url} onChange={(event) => { setCredentials({ url: event.target.value, userName: credentials.userName, password: credentials.password, apitoken: credentials.apitoken, authtype: credentials.authtype }) }} type="text" className={(urlErrBor ? " i__inputErrBor " : "") + "i__input-cust i__input e__modal-alm-input "} placeholder={placeholder[integrationType].url} style={{ marginBottom: "1rem" }} /></p>
                        <div style={{ borderTop: "2px solid #c4c4c4", marginTop: "5%", paddingTop: "20px" }}>
                            <label>Select Test Plan / Test Run</label>
                            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", paddingTop: "10px" }}>
                                <Dropdown style={{ width: "45%" }} placeholder="Select Test Plan" optionLabel="name"
                                    options={testrailPlans ? [{ name: "Default", id: 0 }, ...testrailPlans] : [{ name: "Default", id: 0 }]}
                                    value={selectedTestrailRunsPlans?.plan || testrailPlanRunDetails?.plan}
                                    onChange={(e) => onDropdownChange(e.value, "plan")}
                                />
                                <Dropdown disabled={selectedTestrailRunsPlans?.plan == ""} style={{ width: "45%" }}
                                    placeholder="Select Test Run"
                                    options={testrailRuns} optionLabel="name"
                                    value={selectedTestrailRunsPlans?.run || testrailPlanRunDetails.run}
                                    onChange={(e) => onDropdownChange(e.value, "runs")}
                                />
                            </div>
                        </div>
                    </>
                    : null
                }
            </div>
        </div>
    )
}

export default IntegrationDropDown;


const placeholder = {
    Zephyr: { url: "Enter Zephyr URL (Ex. http(s)://SERVER[:PORT])", username: "Enter Zephyr Username", password: "Enter Zephyr Password", apitoken: "Enter API Token" },
    ALM: { url: "Enter ALM Url", username: "Enter User Name", password: "Enter Password" },
    qTest: { url: "Enter qTest Url", username: "Enter User Name", password: "Enter Password" },
    Azure: { url: "Enter Azure Url", username: "Enter User Name", password: "Enter Password" },
    TestRail: { url: "Enter TestRail Url", username: "Enter TestRail Username", password: "Enter TestRail API Keys/Token" },
};