import React, { useState, useEffect } from 'react';
import { ModalContainer } from '../../global';
import "../styles/LaunchApplication.scss"

const LaunchApplication = props => {

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
        props.appPop.startScrape(scrapeObject);
    }

    const desktopApp = {
        'content': <div className="ss__desktop_dlg">
            <input className='ss__dsktp_wndw_name' placeholder='Enter window name' value={windowName} onChange={windowNameHandler}/>
            <input className="ss__dsktp_prc_id" placeholder='Enter process ID' value={processID} onChange={processIDHandler}/>
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
        props.appPop.startScrape(scrapeObject);
    }

    const sapApp = {
        'content': <input className='ss__sap_input' placeholder='Enter the .exe path;App Name' value={appName} onChange={appNameHandler}/>,
        'footer': <button onClick={onSapLaunch} style={{width: "100px"}}>Launch</button>
    }

    // Mobile App

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
        props.appPop.startScrape(scrapeObject);
    }

    const mobileApp = {
        'content': <div className="ss__mblapp_div">
            <div className="ss__mblapp_inputs">
                <input class="ss__mblapp_input" placeholder="Enter Application path" value={appPath} onChange={appPathHandler}/>
                { appPath.indexOf(".ios") > -1
                ? <>
                    <input class="ss__mblapp_input" placeholder="Enter Application path" value={appPath2} onChange={appPath2Handler}/>
                    <input className="ss__mblapp_input" placeholder='Enter Version Number' value={verNum} onChange={verNumHandler}/>
                    <input className="ss__mblapp_input" placeholder='Enter Device Name'value={deviceName} onChange={deviceNameHandler}/>
                    <input className="ss__mblapp_input" placeholder='Enter UDID' value={uuid} onChange={uuidHandler}/>
                </>
                : <input class="ss__mblapp_input" placeholder="Enter mobile serial number" value={sNum} onChange={sNumHandler} />}
            </div>
            <div className="ss__mblapp_icon">
                { appPath.indexOf(".apk") > -1 ? <img className="ss__mblapp_img" src="static/imgs/ic-andrd-active.png"/> : 
                    appPath.indexOf(".ios") > -1 ? <img className="ss__mblapp_img" src="static/imgs/ic-ios-active.png"/> : null }
            </div>
        </div>,

        'footer': <button onClick={onMobileAppLaunch} style={{width: "100px"}}>Launch</button>
    }
    

    const appDict = {'Desktop': desktopApp, "SAP": sapApp, 'MobileApp': mobileApp}

    return (
        <div className="ss__launch_app_dialog">
            <ModalContainer
                title="Launch Application"
                content={appDict[props.appPop.appType].content}
                footer={appDict[props.appPop.appType].footer}
                close={()=>props.setShow(false)}
            />
        </div> 
    );
}

export default LaunchApplication;