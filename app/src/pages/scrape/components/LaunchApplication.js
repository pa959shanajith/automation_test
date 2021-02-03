import React, { useState, useEffect } from 'react';
import { ModalContainer } from '../../global';
import "../styles/LaunchApplication.scss"

const LaunchApplication = props => {

    const [error, setError] = useState({});

    // DESKTOP

    const [windowName, setWindowName] = useState("");
    const windowNameHandler = event => setWindowName(event.target.value);

    const [processID, setProcessID] = useState("");
    const processIDHandler = event => {
        let value = event.target.value;
        value = value.replace(/[^0-9]/, "");
        setProcessID(value);
    }

    const [selectedMethod, setSelectedMethod] = useState("A")
    const onMethodSelect = event => {
        setSelectedMethod(event.target.value);
    }

    const onDesktopLaunch = () => {
        let scrapeObject = {
            appPath: windowName,
            processID: processID,
            method: selectedMethod
        }
        if (!windowName && !processID) setError({windowName: !windowName, processID: !processID})
        else {
            setError(false);
            props.appPop.startScrape(scrapeObject);
        }
    }

    const desktopApp = {
        'content': <div className="ss__desktop_dlg">
            <input className={'ss__dsktp_wndw_name'+(error.windowName ? " la_invalid": "")} placeholder='Enter window name' value={windowName} onChange={windowNameHandler}/>
            <input className={"ss__dsktp_prc_id"+(error.processID ? " la_invalid" : "")} placeholder='Enter process ID' value={processID} onChange={processIDHandler}/>
        </div>,
        'footer': <div className="ss__sdkpt_footer">
            <span className="ss__dskp_footer_span">
                Object Identification: 
                <label className="ss__dsktp_method">
                    <input className="ss__dsktp_method_rad" type="radio" name="method" value="A" checked={selectedMethod === "A"} onChange={onMethodSelect}/>Method A
                </label>
                <label className="ss__dsktp_method">
                    <input className="ss__dsktp_method_rad" type="radio" name="method" value="B" checked={selectedMethod === "B"} onChange={onMethodSelect}/>Method B
                </label>
            </span>
            <button onClick={onDesktopLaunch} style={{width: "100px"}}>
                Launch
            </button>
        </div>
    }


    // SAP

    const [appName, setAppName] = useState("");
    const appNameHandler = event => setAppName(event.target.value);

    const onSapLaunch = () => {
        let scrapeObject = {
            'appName' : appName
        }
        if (!appName) setError({appName: !appName})
        else {
            setError(false);
            props.appPop.startScrape(scrapeObject);
        }
    }

    const sapApp = {
        'content': <input className={'ss__sap_input'+(error.appName ? " la_invalid" : "")} placeholder='Enter the .exe path;App Name' value={appName} onChange={appNameHandler}/>,
        'footer': <button onClick={onSapLaunch} style={{width: "100px"}}>Launch</button>
    }

    // Mobile App

    const [os, setOS] = useState(null);

    const [appPath, setAppPath] = useState("");
    const appPathHandler = event => setAppPath(event.target.value);

    const [sNum, setSNum] = useState("");
    const sNumHandler = event => setSNum(event.target.value);

    const [appPath2, setAppPath2] = useState("");
    const appPath2Handler = event => setAppPath2(event.target.value);

    const [verNum, setVerNum] = useState("");
    const verNumHandler = event => setVerNum(event.target.value);

    const [deviceName, setDeviceName] = useState("");
    const deviceNameHandler = event => setDeviceName(event.target.value);

    const [uuid, setUUID] = useState("");
    const uuidHandler = event => setUUID(event.target.value);

    const onMobileAppLaunch = () => {
        let scrapeObject = {
            'appPath': appPath,
            'sNum': sNum,
            'appPath2': appPath2,
            'verNum': verNum,
            'deviceName': deviceName,
            'uuid': uuid
        }
        if ( os === "ios" && (!appPath2 || !verNum | !deviceName || !uuid))
            setError({appPath2: !appPath2, verNum: !verNum, deviceName: !deviceName, uuid: !uuid})
        else if (os === "android" && (!appPath || !sNum))
            setError({appPath: !appPath, sNum: !sNum})
        else {
            setError(false);
            props.appPop.startScrape(scrapeObject);
        }
    }

    const mobileApp = {
        'content': <div className="ss__mblapp_inputs">
                { !os && <div className="ss__mblapp_os_op">Choose OS</div>}
                <div className="ss__mblapp_chooseApp">
                    <button className={"ss__mblapp_os_b"+(os==="android" ? " ss__os_active":"")} onClick={()=>{setOS("android"); setError(false);}}>Android</button>
                    <button className={"ss__mblapp_os_b"+(os==="ios" ? " ss__os_active":"")} onClick={()=>{setOS("ios"); setError(false);}}>iOS</button>
                </div>
                { os === "ios" && <>
                    <input className={"ss__mblapp_input"+(error.appPath2 ? " la_invalid": "")} placeholder="Enter Application path" value={appPath2} onChange={appPath2Handler}/>
                    <input className={"ss__mblapp_input"+(error.verNum ? " la_invalid": "")} placeholder='Enter Version Number' value={verNum} onChange={verNumHandler}/>
                    <input className={"ss__mblapp_input"+(error.deviceName ? " la_invalid": "")} placeholder='Enter Device Name'value={deviceName} onChange={deviceNameHandler}/>
                    <input className={"ss__mblapp_input"+(error.uuid ? " la_invalid": "")} placeholder='Enter UDID' value={uuid} onChange={uuidHandler}/>
                </> }
                { os === "android" && <>
                    <input className={"ss__mblapp_input"+(error.appPath ? " la_invalid": "")} placeholder="Enter Application path" value={appPath} onChange={appPathHandler}/> 
                    <input className={"ss__mblapp_input"+(error.sNum ? " la_invalid": "")} placeholder="Enter mobile serial number" value={sNum} onChange={sNumHandler} />
                </> }
        </div>,

        'footer': <button onClick={onMobileAppLaunch} style={{width: "100px"}}>Launch</button>
    }

    // OEBS

    const [winName, setWinName] = useState("");
    const winNameHandler = event => setWinName(event.target.value);

    const onWinLaunch = () => {
        let scrapeObject = {
            'winName' : winName
        }
        if (!winName) setError({winName: !winName})
        else {
            setError(false);
            props.appPop.startScrape(scrapeObject);
        }
    }

    const oebsApp = {
        'content': <input className={'ss__oebs_input'+(error.winName ? " la_invalid": "")} placeholder='Enter window name' value={winName} onChange={winNameHandler}/>,
        'footer': <button onClick={onWinLaunch} style={{width: "100px"}}>Launch</button>
    }
    
    
    // Mobile Web

    const [slNum, setSlNum] = useState("");
    const slNumHandler = event => setSlNum(event.target.value);

    const [vernNum, setVernNum] = useState("");
    const vernNumHandler = event => setVernNum(event.target.value);

    const onMobileWebLaunch = () => {
        let scrapeObject = {
            'slNum': slNum,
            'vernNum': vernNum
        }
        if (!slNum || !vernNum) setError({slNum: !slNum, vernNum: !vernNum});
        else {
            setError(false);
            props.appPop.startScrape(scrapeObject);
        }
    }

    const mobileWeb = {
        'content': <div className="ss__mblweb_inputs">    
            <input className={"ss__mblweb_input"+(error.slNum ? " la_invalid": "")} placeholder="AndroidDeviceSerialNumber/iOSDeviceName" value={slNum} onChange={slNumHandler}/> 
            <input className={"ss__mblweb_input"+(error.vernNum ? " la_invalid": "")} placeholder="Android/iOSVersion;UDID(for iOS device only)" value={vernNum} onChange={vernNumHandler} />
        </div>,

        'footer': <button onClick={onMobileWebLaunch} style={{width: "100px"}}>Launch</button>
    }

    const appDict = {'Desktop': desktopApp, "SAP": sapApp, 'MobileApp': mobileApp, 'OEBS': oebsApp, 'MobileWeb': mobileWeb}

    return (
        <div className="ss__launch_app_dialog">
            <ModalContainer
                title="Launch Application"
                content={appDict[props.appPop.appType].content}
                footer={appDict[props.appPop.appType].footer}
                close={()=>{
                    props.setShow(false);
                    setError(false);
                }}
            />
        </div> 
    );
}

export default LaunchApplication;