import React, { Fragment, useRef, useState, useEffect } from 'react';
import { useSelector }  from  "react-redux";
import { useHistory } from 'react-router-dom';
import { Thumbnail, ResetSession, RedirectPage } from '../../global';
import * as DesignApi from "../api";
import "../styles/ActionBarItems.scss"

const UpperContent = ({setDTcFlag, isMac, disable, setOverlay, setShowPop, setShowDlg, dTcFlag, checkedTc, showDlg}) => {

    const userInfo = useSelector(state=>state.login.userinfo);
    const current_task = useSelector(state=>state.plugin.CT);
    let appType = current_task.appType;
    const history = useHistory();

    const [dependCheck, setDependCheck] = useState(false);

    useEffect(()=>{
        if (!showDlg) setDependCheck(dTcFlag);
    }, [showDlg]);

    const WebList = [
        {'title': "Internet Explorer", 'img': "static/imgs/ic-ie.png", action: ()=>debugTestCases('3')}, 
        {'title': "Google Chrome", 'img': "static/imgs/ic-chrome.png", action: ()=>debugTestCases('1')},
        {'title': "Mozilla Firefox", 'img': "static/imgs/ic-mozilla.png", action: ()=>debugTestCases('2')},
        {'title': "Microsoft Edge", 'svg': "static/imgs/ic-edge.svg", action: ()=>debugTestCases('7')},
        {'title': "Edge Chromium", 'svg': "static/imgs/ic-edge-chromium.svg", action: ()=>debugTestCases('8')}
        ]
    
    const oebsList = [{'title': "OEBS Apps" , 'img': 'static/imgs/ic-desktop.png', action: ()=>debugTestCases('1')}]
    
    const desktopList = [{'title': "Desktop Apps" , 'img': 'static/imgs/ic-desktop.png', action: ()=>debugTestCases('1')}]
    
    const systemList = [{'title': "System Apps" , 'img': 'static/imgs/ic-desktop.png', action: ()=>debugTestCases('1')}]
    
    const sapList = [{'title': "SAP Apps" , 'img': 'static/imgs/ic-desktop.png', action: ()=>debugTestCases('1')}]
    
    const webserviceList = [{'title': "Web Services" , 'img': 'static/imgs/ic-webservice.png', action: ()=>debugTestCases('1')}]
    
    const mobileAppList = [{'title': "Mobile Apps" , 'img': 'static/imgs/ic-mobility.png', action: ()=>debugTestCases('1')}]
    
    const mobileWebList = [{'title': "Mobile Web" , 'img': 'static/imgs/ic-mobility.png', action: ()=>debugTestCases()}]
    
    const mainframeList = [{'title': "Mainframe", 'img': "static/imgs/ic-mainframe-o.png", action: ()=>debugTestCases()}]

    const addDependentTestCase = event => {
        if (!event.target.checked) {
            setDependCheck(false);
            setDTcFlag(false);
        }
        else setShowDlg(true);
    }

    let renderComp = [
                    <div key={1} className='d__debugOn'>Debug On</div>, 
                    <div key={3} className="d__thumbnail">
                        <input id="add_depend" type="checkbox" onChange={addDependentTestCase} checked={dependCheck}/>
                        <span className="d__thumbnail_title">Add Dependent Test Cases</span>
                    </div>
                    ];

    const debugTestCases = selectedBrowserType => {
        let testcaseID = [];
        let browserType = [];
        
        if (appType !== "MobileWeb" && appType !== "Mainframe") browserType.push(selectedBrowserType);
        
        // globalSelectedBrowserType = selectedBrowserType;

        if (dTcFlag) testcaseID = checkedTc;
        else testcaseID.push(current_task.testCaseId);
    
        setOverlay('Debug in Progress. Please Wait...');
        ResetSession.start();
        DesignApi.debugTestCase_ICE(browserType, testcaseID, userInfo, appType)
            .then(data => {
                setOverlay("");
                ResetSession.end();
                if (data === "Invalid Session") return RedirectPage(history);
                else if (data === "unavailableLocalServer")  setShowPop({'title': "Debug Testcase", 'content': "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server."})
                else if (data === "success") setShowPop({'title': "Debug Testcase", 'content': "Debug completed successfully."})
                else if (data === "fail") setShowPop({'title': "Debug Testcase", 'content': "Failed to debug."})
                else if (data === "Terminate") setShowPop({'title': "Debug Testcase", 'content': "Debug Terminated"})
                else if (data === "browserUnavailable") setShowPop({'title': "Debug Testcase", 'content': "Browser is not available"})
                else if (data === "scheduleModeOn") setShowPop({'title': "Debug Testcase", 'content': "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed."})
                else if (data === "ExecutionOnlyAllowed") setShowPop({'title': "Debug Testcase", 'content': "Execution Only Allowed"})
                else if (data.status === "success"){
                    // rows={}
                    // $('tr.ui-widget-content.jqgrow.ui-row-ltr.ui-sortable-handle').each(function () {
                    //     if($(this)[0].id in data){
                    //         $('#jqGrid').jqGrid('setCell', $(this)[0].id, 'objectName', data[$(this)[0].id].xpath);
                    //         // $(this).children()[3].title=data[$(this)[0].id].xpath
                    //         rows[$(this)[0].childNodes[4].innerText]=data[$(this)[0].id].xpath
                    //         // $(this).children()[3].innerText=
                    //         console.log($(this));
                    //     }
                    // });
                    // localStorage['_modified']=JSON.stringify(rows)
                    console.log("populate localstorage[modified]")
                    setShowPop({'title': "Debug Testcase", 'content': "Debug completed successfully."})
                } else {
                    console.log(data);
                }										
            })
            .catch(error => {
                setOverlay("");
                ResetSession.end();
                setOverlay({'title': "Debug Testcase", 'content': "Failed to debug."});
                console.error("Error while traversing while executing debugTestcase method! \r\n " + (error.data));
            });
    };

    
    switch(appType) {
        case "Web": renderComp.splice(1, 0, <Fragment key={2}> { WebList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} svg={icon.svg} action={icon.action}/>)}
                                            { isMac && <Thumbnail title="Safari" img="static/imgs/ic-safari.png" action={()=>debugTestCases('6')}/>}</Fragment>);
                    break;
        case "OEBS": renderComp.splice(1, 0, <Fragment key={2}>{oebsList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} />)}</Fragment>);
                    break;
        case "Desktop": renderComp.splice(1, 0, <Fragment key={2}>{desktopList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} />)}</Fragment>);
                        break;
        case "System": renderComp.splice(1, 0, <Fragment key={2}>{systemList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} />)}</Fragment>);
                        break;
        case "SAP": renderComp.splice(1, 0, <Fragment key={2}>{sapList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} />)}</Fragment>);
                    break;
        case "Webservice": renderComp.splice(1, 0, <Fragment key={2}>{webserviceList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action}/>)}</Fragment>);
                            break;
        case "MobileApp": renderComp.splice(1, 0, <Fragment key={2}>{mobileAppList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} />)}</Fragment>);
                            break;
        case "MobileWeb": renderComp.splice(1, 0, <Fragment key={2}>{mobileWebList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} />)}</Fragment>);
                            break;
        case "Mainframe": renderComp.splice(1, 0, <Fragment key={2}>{mainframeList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} />)}</Fragment>);
                            break;
        default: break;
    }
    
    return renderComp;
};

const BottomContent = ({setShowPop, setImported, setShowConfirmPop}) => {

    const current_task = useSelector(state=>state.plugin.CT);
    const userInfo = useSelector(state=>state.login.userinfo);
    const history = useHistory();
    const hiddenInput = useRef(null);

    const exportTestCase =  () => {
		let testCaseId = current_task.testCaseId;
		let testCaseName = current_task.testCaseName;
        let versionnumber = current_task.versionnumber;
        
		DesignApi.readTestCase_ICE(userInfo, testCaseId, testCaseName, versionnumber)
		.then(response => {
				if (response === "Invalid Session") RedirectPage(history);
                
                let responseData;
                if (typeof response === 'object') responseData = JSON.stringify(response.testcase, null, 2);
                let filename = testCaseName + ".json";

                let testCaseBlob = new Blob([responseData], {
                    type: "text/json;charset=utf-8"
                })

				if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(testCaseBlob, filename);
                }
                else {
                    let a = document.createElement('a');
                    a.download = filename;
                    a.href = 'data:text/json;charset=utf-8,' + responseData;
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } 
            })
            .catch(error => console.error("ERROR::::", error));
    }
    
    const onInputChange = (event) => {
        let testCaseId = current_task.testCaseId;
		let testCaseName = current_task.testCaseName;
        let versionnumber = current_task.versionnumber;
        let appType = current_task.appType;
		let import_status = true;
        let flag = false;

        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            if ((file.name.split('.')[file.name.split('.').length - 1]).toLowerCase() === "json") {
                let resultString = JSON.parse(reader.result);
                for (let i = 0; i < resultString.length; i++) {
                    if (resultString[i].appType.toLowerCase() === "generic" || resultString[i].appType.toLowerCase() === "pdf") {
                        flag = true;
                    } else if (resultString[i].appType === appType) {
                        flag = true;
                        break;
                    } else {
                        flag = false;
                        break;
                    }
                }
                if (flag === false) setShowPop({'title': "App Type Error", 'content': "Project application type and Imported JSON application type doesn't match, please check!"})
                else {
                    DesignApi.updateTestCase_ICE(testCaseId, testCaseName, resultString, userInfo, versionnumber, import_status)
                        .then(data => {
                            if (data == "Invalid Session") RedirectPage(history);
                            if (data === "success") {
                                setImported(true);
                                setShowPop({'title': "Import Testcase", 'content': "TestCase Json imported successfully."});
                            } else setShowPop({'title': "Import Testcase",'content': "Please Check the file format you have uploaded!"});
                        })
                        .catch(error => console.error("ERROR::::", error));
                }
            } else setShowPop({'title': "Import Testcase", 'content': "Please Check the file format you have uploaded!"});
        }
        reader.readAsText(file);
    }

    const importTestCase = (overWrite) => {
        
        let testCaseId = current_task.testCaseId;
		let testCaseName = current_task.testCaseName;
        let versionnumber = current_task.versionnumber;
        if(overWrite) setShowConfirmPop(false);
        
        DesignApi.readTestCase_ICE(userInfo, testCaseId, testCaseName, versionnumber)
		.then(response => {
				if (response === "Invalid Session") RedirectPage(history);
                if (response.testcase.length === 0 || overWrite) {
                    // hiddenInput.current.click();
                    document.getElementById("importTestCaseField").click();
                }
                else{
                    setShowConfirmPop({'title': 'Table Consists of Data', 'content': 'Import will erase your old data. Do you want to continue?', 'onClick': ()=>importTestCase(true)});
                }
            })
        .catch(error => console.error("ERROR::::", error));
    }

    const lowerList = [
                        {'title': 'Import Test Case', 'img': 'static/imgs/ic-import-script.png', 'action': ()=>importTestCase()},
                        {'title': 'Export Test Case', 'img': 'static/imgs/ic-export-script.png', 'action': ()=>exportTestCase()}
                    ]
                    // <input style="visibility: hidden;" type="file" id="importTestCaseFile" accept=".json"></li>
                    // <li style="visibility: hidden; display: none;"><a href='#' ng-click="importTestCase1($event)"></a><input style="visibility: hidden;" type="file" id="overWriteJson" accept=".json"></li>
    return (
        <>
            {lowerList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} importElement={icon.importElement}/>)}
            <input id="importTestCaseField" type="file" style={{display: "none"}} ref={hiddenInput} onChange={onInputChange} accept=".json"/>
        </>
    );
};

export { UpperContent, BottomContent };