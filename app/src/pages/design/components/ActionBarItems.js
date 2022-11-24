import React, { Fragment, useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch }  from  "react-redux";
import { useHistory } from 'react-router-dom';
import { Thumbnail, ResetSession, RedirectPage, Messages as MSG, setMsg } from '../../global';
import * as DesignApi from "../api";
import * as DesignActions from '../state/action';
import "../styles/ActionBarItems.scss"

/*
    Component: UpperContent , Bottom Content for rendering items on Action Bar
    Uses: Provides Content for Action Bar
    Props: 
    ----------- upperContent ------
        setDTcFlag -> flips the Dependent Test Case Flag
        isMac -> Bool value to check if client is running on Mac
        setOverlay -> overlay msg
        disable -> flag to check if action bar is required to disable
        setShowDlg -> Show Dependent TestCase Dialog State
        dTcFlag -> Dependent TestCase checked/unchecked Flag
        checkedTc -> list of checked test case IDs'
        showDlg -> flag to check if dependenet test Case dialog is visible or not

    ---------- bottomContent ---------
        setImported -> state to switch import status flag
        setShowConfirmPop -> confirmation dialog popup
        disable -> flag to check if action bar is required to disable
*/

const UpperContent = ({setCheckedTc, setDTcFlag, isMac, setOverlay, disable, setShowDlg, dTcFlag, checkedTc, showDlg, fetchingDetails}) => {


    const userInfo = useSelector(state=>state.login.userinfo);
    const current_task = useSelector(state=>state.plugin.CT);
    const mainTestCases = useSelector(state=>state.design.testCases);
    const saveEnable = useSelector(state=>state.design.saveEnable);

    let appType = current_task.appType;
    const history = useHistory();
    const dispatch = useDispatch();

    const [dependCheck, setDependCheck] = useState(false);

    useEffect(()=>{
        if (!showDlg) setDependCheck(dTcFlag);
        //eslint-disable-next-line
    }, [showDlg]);

    useEffect(()=>{
        setDependCheck(false);
        setCheckedTc({});
        //eslint-disable-next-line
    }, [current_task])

    // const WebList = [
        // {'title': "Internet Explorer", 'tooltip':"Debug on Intenet Explorer", 'img': "static/imgs/internet_explorer_logo_new.svg", action: ()=>debugTestCases('3'), 'disable': disable}, 
        // {'title': "Google Chrome", 'tooltip':"Debug on Chrome", 'img': "static/imgs/chrome_logo_new.svg", action: ()=>debugTestCases('1'), 'disable': disable},
        // {'title': "Mozilla Firefox", 'tooltip':"Debug on Firefox", 'img': "static/imgs/firefox_logo_new.svg", action: ()=>debugTestCases('2'), 'disable': disable},
        // {'title': "Microsoft Edge", 'tooltip':"Debug on Microsoft Edge", 'img': "static/imgs/edge_logo_new.svg", action: ()=>debugTestCases('7'), 'disable': disable},
        // {'title': "Edge Chromium", 'tooltip':"Debug on MS Edge Chromium", 'img': "static/imgs/edge_logo_new.svg", action: ()=>debugTestCases('8'), 'disable': disable}
        // ]
    
    const oebsList = [{'title': "OEBS Apps" , 'img': 'static/imgs/ic-desktop.png', action: ()=>debugTestCases('1'), 'disable': disable}]
    
    const desktopList = [{'title': "Desktop Apps" , 'img': 'static/imgs/ic-desktop.png', action: ()=>debugTestCases('1'), 'disable': disable}]
    
    const systemList = [{'title': "System Apps" , 'img': 'static/imgs/ic-desktop.png', action: ()=>debugTestCases('1'), 'disable': disable}]
    
    const sapList = [{'title': "SAP Apps" , 'img': 'static/imgs/ic-desktop.png', action: ()=>debugTestCases('1'), 'disable': disable}]
    
    const webserviceList = [{'title': "Web Services" , 'img': 'static/imgs/ic-webservice.png', action: ()=>debugTestCases('1'), 'disable': disable}]
    
    const mobileAppList = [{'title': "Mobile Apps" , 'img': 'static/imgs/ic-mobility.png', action: ()=>debugTestCases('1'), 'disable': disable}]
    
    const mobileWebList = [{'title': "Mobile Web" , 'img': 'static/imgs/ic-mobility.png', action: ()=>debugTestCases(), 'disable': disable}]
    
    const mainframeList = [{'title': "Mainframe", 'img': "static/imgs/ic-mainframe-o.png", action: ()=>debugTestCases(), 'disable': disable}]

    const addDependentTestCase = event => {
        if (!event.target.checked) {
            setDependCheck(false);
            setDTcFlag(false);
            setCheckedTc({});
        }
        else setShowDlg(true);
    }

    let renderComp = [
                    // <div key={1} className={'d__debugOn' + (disable ? " disable-thumbnail" : "")}>Debug On</div>, 
                    <div key={3} title="Add Dependent Test Cases"  className={"d__thumbnail" + (disable ? " disable-thumbnail" : "")}>
                        <input id="add_depend" type="checkbox" onChange={addDependentTestCase} checked={dependCheck}/>
                        <span className="d__thumbnail_title">Add Dependent Test Cases</span>
                    </div>
                    ];

    const debugTestCases = selectedBrowserType => {
        let testcaseID = [];
        let browserType = [];
        
        if (appType !== "MobileWeb" && appType !== "Mainframe") browserType.push(selectedBrowserType);
        
        // globalSelectedBrowserType = selectedBrowserType;

        if (dTcFlag) testcaseID = Object.values(checkedTc);
        else testcaseID.push(current_task.testCaseId);
        setOverlay('Debug in Progress. Please Wait...');
        ResetSession.start();
        DesignApi.debugTestCase_ICE(browserType, fetchingDetails['_id'], userInfo, appType)
            .then(data => {
                setOverlay("");
                ResetSession.end();
                if (data === "Invalid Session") return RedirectPage(history);
                else if (data === "unavailableLocalServer")  setMsg(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER)
                else if (data === "success") setMsg(MSG.DESIGN.SUCC_DEBUG)
                else if (data === "fail") setMsg(MSG.DESIGN.ERR_DEBUG)
                else if (data === "Terminate") setMsg(MSG.DESIGN.WARN_DEBUG_TERMINATE)
                else if (data === "browserUnavailable") setMsg(MSG.DESIGN.WARN_UNAVAILABLE_BROWSER)
                else if (data === "scheduleModeOn") setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE)
                else if (data === "ExecutionOnlyAllowed") setMsg(MSG.GENERIC.WARN_EXECUTION_ONLY)
                else if (data.status === "success"){
                    let rows={}
                    mainTestCases.forEach((testCase, index) => {
                        if(index+1 in data){
                            rows[testCase.custname]=data[index+1].xpath;
                        }
                    });
                    dispatch({type: DesignActions.SET_MODIFIED, payload: rows});
                    dispatch({type: DesignActions.SET_SAVEENABLE, payload: !saveEnable})
                    setMsg(MSG.DESIGN.SUCC_DEBUG);
                } else {
                    console.log(data);
                }										
            })
            .catch(error => {
                setOverlay("");
                ResetSession.end();
                setMsg(MSG.DESIGN.ERR_DEBUG);
                console.error("Error while traversing while executing debugTestcase method! \r\n " + (error.data));
            });
    };

    
    switch(appType) {
        // case "Web": renderComp.splice(1, 0, <Fragment key={2}> { WebList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.tooltip} img={icon.img} svg={icon.svg} action={icon.action} disable={icon.disable}/>)}
        //                                     { isMac && <Thumbnail title="Safari" img="static/imgs/safari_logo_new.svg" action={()=>debugTestCases('6')} disable={disable}/>}</Fragment>);
        //             break;
        case "OEBS": renderComp.splice(1, 0, <Fragment key={2}>{oebsList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
                    break;
        case "Desktop": renderComp.splice(1, 0, <Fragment key={2}>{desktopList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
                        break;
        case "System": renderComp.splice(1, 0, <Fragment key={2}>{systemList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
                        break;
        case "SAP": renderComp.splice(1, 0, <Fragment key={2}>{sapList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
                    break;
        case "Webservice": renderComp.splice(1, 0, <Fragment key={2}>{webserviceList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable}/>)}</Fragment>);
                            break;
        case "MobileApp": renderComp.splice(1, 0, <Fragment key={2}>{mobileAppList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
                            break;
        case "MobileWeb": renderComp.splice(1, 0, <Fragment key={2}>{mobileWebList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable}/>)}</Fragment>);
                            break;
        case "Mainframe": renderComp.splice(1, 0, <Fragment key={2}>{mainframeList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
                            break;
        default: break;
    }
    
    return renderComp;
};

const BottomContent = ({ setImported, setShowConfirmPop, disable, setOverlay, fetchingDetails, appType}) => {

    const current_task = useSelector(state=>state.plugin.CT);
    const userInfo = useSelector(state=>state.login.userinfo);
    const history = useHistory();
    const hiddenInput = useRef(null);

    const exportTestCase =  () => {
        console.log("this is export test cases");
		let testCaseId = fetchingDetails['_id'];
		let testCaseName = fetchingDetails['name'];
        // let versionnumber = fetchingDetails.versionnumber;
        // console.log("versionNumber.........",versionnumber);
        
		DesignApi.readTestCase_ICE(userInfo, testCaseId, testCaseName, 0)
		.then(response => {
				if (response === "Invalid Session") return RedirectPage(history);
                
                let responseData;
                if (typeof response === 'object') responseData = JSON.stringify(response.testcase, null, 2);
                let filename = testCaseName + ".json";

                let testCaseBlob = new Blob([responseData], {
                    type: "text/json"
                })

				if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(new Blob([responseData], {
                        type: "text/json;charset=utf-8"
                    }), filename);
                }
                else {
                    let a = document.createElement('a');
                    a.download = filename;
                    a.href = window.URL.createObjectURL(testCaseBlob);
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } 
            })
            .catch(error => console.error("ERROR::::", error));
    }
    
    const onInputChange = (event) => {
        let testCaseId = fetchingDetails['_id'];
		let testCaseName = fetchingDetails['name'];
        // let versionnumber = fetchingDetails.versionnumber;
        // let appType = appType;
		let import_status = true;
        let flag = false;

        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            try{
                hiddenInput.current.value = '';
                if (file.name.split('.').pop().toLowerCase() === "json") {
                    setOverlay("Loading...");
                    let resultString = JSON.parse(reader.result);
                    if (!Array.isArray(resultString)) 
                        throw MSG.DESIGN.ERR_FILE_FORMAT
                    for (let i = 0; i < resultString.length; i++) {
                        if (!resultString[i].appType)
                            throw MSG.DESIGN.ERR_JSON_IMPORT
                        if (
                            resultString[i].appType.toLowerCase() !== "generic" && 
                            resultString[i].appType.toLowerCase() !== "pdf" &&
                            resultString[i].appType !== appType
                        ) 
                            throw MSG.DESIGN.ERR_NO_MATCH_APPTYPE
                    }
                    DesignApi.updateTestCase_ICE(testCaseId, testCaseName, resultString, userInfo, 0, import_status)
                        .then(data => {
                            setOverlay("");
                            if (data === "Invalid Session") RedirectPage(history);
                            if (data === "success") setImported(true);
                        })
                        .catch(error => {
                            setOverlay("");
                            console.error("ERROR::::", error)
                        });
                    
                } else throw  setMsg(MSG.DESIGN.ERR_FILE_FORMAT);
            }
            catch(error){
                setOverlay("");
                if (typeof(error)==="object") setMsg(error);
                else setMsg(MSG.DESIGN.ERR_TC_JSON_IMPORT)
                console.error(error);
            }
        }
        reader.readAsText(file);
    }

    const importTestCase = (overWrite) => {
        
        let testCaseId = fetchingDetails['_id'];
		let testCaseName = fetchingDetails['name'];
        // let versionnumber = fetchingDetails.versionnumber;
        if(overWrite) setShowConfirmPop(false);

        // console.log(versionnumber);
        
        DesignApi.readTestCase_ICE(userInfo, testCaseId, testCaseName , 0 )
		.then(response => {
				if (response === "Invalid Session") RedirectPage(history);
                if (response.testcase && response.testcase.length === 0 || overWrite) {
                    hiddenInput.current.click();
                    // document.getElementById("importTestCaseField").click();
                }
                else{
                    setShowConfirmPop({'title': 'Table Consists of Data', 'content': 'Import will erase your old data. Do you want to continue?', 'onClick': ()=>importTestCase(true)});
                }
            })
        .catch(error => console.error("ERROR::::", error));
    }

    const lowerList = [
                        {'title': 'Import Test Case', 'tooltip':'Import TestCase', 'img': 'static/imgs/ic-import-script.png', 'action': ()=>importTestCase()},
                        {'title': 'Export Test Case', 'tooltip':'Export TestCase', 'img': 'static/imgs/ic-export-script.png', 'action': ()=>exportTestCase(), 'disable': disable}
                    ]
                    // <input style="visibility: hidden;" type="file" id="importTestCaseFile" accept=".json"></li>
                    // <li style="visibility: hidden; display: none;"><a href='#' ng-click="importTestCase1($event)"></a><input style="visibility: hidden;" type="file" id="overWriteJson" accept=".json"></li>
    return (
        <>
            {lowerList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.tooltip} img={icon.img} action={icon.action} disable={icon.disable}/>)}
            <input id="importTestCaseField" type="file" style={{display: "none"}} ref={hiddenInput} onChange={onInputChange} accept=".json"/>
        </>
    );
};
export { UpperContent, BottomContent };