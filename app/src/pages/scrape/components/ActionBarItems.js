import React, { useState, useEffect, Fragment, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import '../styles/ActionBarItems.scss'
import * as actionTypes from '../state/action';
import { ScrapeContext } from "../components/ScrapeContext";
import * as scrapeApi from '../api';
import { RedirectPage, ActionBar, Thumbnail } from '../../global';

/*Component LeftBarItems
  use: renders  6 options in design  in the left of screen
  props: 
    setoptions from scrapeHome.js 
*/
const UpperContent = props => {

    const dispatch = useDispatch();
    const disableAction = useSelector(state => state.scrape.disableAction);
    const disableAppend = useSelector(state => state.scrape.disableAppend);
    const compareFlag = useSelector(state=>state.scrape.compareFlag);
    const { appType } = useSelector(state => state.plugin.CT);
    const [isMac, setIsMac] = useState(false);
    const [appendCheck, setAppendCheck] = useState(false);
    const { setShowAppPop, saved, startScrape } = useContext(ScrapeContext);

    useEffect(() => {
        setIsMac(navigator.appVersion.indexOf("Mac") !== -1);
        if (saved || disableAction) setAppendCheck(false);
    }, [appType, saved]);


    const WebList = [
        { 'title': "Internet Explorer", 'img': "static/imgs/ic-ie.png", action: () => startScrape('ie'), 'disable': disableAction || compareFlag },
        { 'title': "Google Chrome", 'img': "static/imgs/ic-chrome.png", action: () => startScrape('chrome'), 'disable': disableAction || compareFlag },
        { 'title': "Safari", 'img': "static/imgs/ic-safari.png", action: () => startScrape('safari'), 'disable': disableAction || compareFlag },
        { 'title': "Mozilla Firefox", 'img': "static/imgs/ic-mozilla.png", action: () => startScrape('mozilla'), 'disable': disableAction || compareFlag },
        { 'title': "Microsoft Edge", 'svg': "static/imgs/ic-edge.svg", action: () => startScrape('edge'), 'disable': disableAction || compareFlag },
        { 'title': "Edge Chromium", 'svg': "static/imgs/ic-edge-chromium.svg", action: () => startScrape('chromium'), 'disable': disableAction || compareFlag }
    ]

    const oebsList = [{ 'title': "OEBS Apps", 'img': 'static/imgs/ic-desktop.png', action: ()=> setShowAppPop({'appType': 'OEBS', 'startScrape': (scrapeObjects)=>startScrape(scrapeObjects)}), 'disable': disableAction }]

    const desktopList = [{ 'title': "Desktop Apps", 'img': 'static/imgs/ic-desktop.png', action: () => setShowAppPop({'appType': 'Desktop', 'startScrape': (scrapeObjects)=>startScrape(scrapeObjects)}), 'disable': disableAction }]

    const sapList = [{ 'title': "SAP Apps", 'img': 'static/imgs/ic-desktop.png', action: () => setShowAppPop({'appType': 'SAP', 'startScrape': (scrapeObjects)=>startScrape(scrapeObjects)}), 'disable': disableAction }]

    const webserviceList = [{ 'title': "Web Services", 'img': 'static/imgs/ic-webservice.png', action: () => console.log(""), 'disable': disableAction }]

    const mobileAppList = [{ 'title': "Mobile Apps", 'img': 'static/imgs/ic-mobility.png', action: () => setShowAppPop({'appType': 'MobileApp', 'startScrape': (scrapeObjects)=>startScrape(scrapeObjects)}), 'disable': disableAction }]

    const mobileWebList = [{ 'title': "Mobile Web", 'img': 'static/imgs/ic-mobility.png', action: () => setShowAppPop({'appType': 'MobileWeb', 'startScrape': (scrapeObjects)=>startScrape(scrapeObjects)}), 'disable': disableAction || compareFlag }]


    const onAppend = event => {
        dispatch({ type: actionTypes.SET_DISABLEACTION, payload: !event.target.checked });
        if (event.target.checked) setAppendCheck(true);
        else setAppendCheck(false);
    }

    let renderComp = [
        <div key={1} className={'ss__scrapeOn' + (disableAction || compareFlag ? " disable-thumbnail" : "")}>Scrape On</div>,
        <Thumbnail title="Launch PDF utility" img="static/imgs/ic-pdf_scrape.png" action={() => startScrape("pdf")} disable={disableAction} />,
        <div key={3} className={"ss__thumbnail" + (disableAppend || compareFlag ? " disable-thumbnail" : "")}>
            <input id="enable_append" type="checkbox" onChange={onAppend} checked={appendCheck} />
            <span className="ss__thumbnail_title">Append</span>
        </div>
    ];

    switch (appType) {
        case "Web": renderComp.splice(1, 0, <Fragment key={2}> {WebList.map((icon, i) => icon.title !== "Safari" || isMac ? <Thumbnail key={i} title={icon.title} img={icon.img} svg={icon.svg} action={icon.action} disable={icon.disable} /> : null)}</Fragment>);
            break;
        case "OEBS": renderComp.splice(1, 0, <Fragment key={2}>{oebsList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
            break;
        case "Desktop": renderComp.splice(1, 0, <Fragment key={2}>{desktopList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} disable={icon.disable} disable={icon.disable} />)}</Fragment>);
            break;
        case "SAP": renderComp.splice(1, 0, <Fragment key={2}>{sapList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
            break;
        case "Webservice": renderComp.splice(1, 0, <Fragment key={2}>{webserviceList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
            break;
        case "MobileApp": renderComp.splice(1, 0, <Fragment key={2}>{mobileAppList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
            break;
        case "MobileWeb": renderComp.splice(1, 0, <Fragment key={2}>{mobileWebList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
            break;
        default: break;
    }

    return renderComp;
}

const BottomContent = () => {

    const { appType, screenId, screenName, versionnumber, projectId, testCaseId } = useSelector(state => state.plugin.CT);
    const disableAction = useSelector(state => state.scrape.disableAction);
    const compareFlag = useSelector(state=>state.scrape.compareFlag);
    const { user_id, role } = useSelector(state=>state.login.userinfo);

    const { setShowObjModal, scrapeItems, setShowPop, fetchScrapeData } = useContext(ScrapeContext);
    const [customLen, setCustomLen] = useState(0);
    const [scrapeItemsLength, setScrapeLen] = useState(0);

    const history = useHistory();
    
    useEffect(()=>{
        let customs = 0;
        for (let scrapeItem of scrapeItems){
            if (scrapeItem.isCustom) customs++;
        }
        setScrapeLen(scrapeItems.length);
        setCustomLen(customs);
    }, [scrapeItems])

    const exportScrapeObjects = () => {
		scrapeApi.getScrapeDataScreenLevel_ICE(appType, screenId, projectId, testCaseId)
        .then(data => {
            if (data === "Invalid Session") return RedirectPage(history);
            let temp, responseData;
            let hasData = false;

            if (typeof data === 'object' && data.view.length > 0) {
                hasData = true;
                temp = data;
                temp['appType'] = appType;
                temp['screenId'] = screenId;
                temp['versionnumber'] = versionnumber;
                responseData = JSON.stringify(temp, undefined, 2);
            }

            if (hasData){
                let filename = "Screen_" + screenName + ".json";

                let objectsBlob = new Blob([responseData], {
                    type: "text/json"
                });

                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(objectsBlob, filename);
                }
                else {
                    let a = window.document.createElement('a');
                    a.href = window.URL.createObjectURL(objectsBlob);
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } 
            } else setShowPop({title: "No Objects found", content: "The screen has no objects to export, please check!"});
        })
        .catch(error => console.error(error));
    }
    
    const onInputChange = (event) => {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            if (file.name.split('.').pop().toLowerCase() === "json") {
                let resultString = JSON.parse(reader.result);
                if (!('appType' in resultString))
                    setShowPop({title: "Import Error", content: "Incorrect JSON imported. Please check the contents!"});
                else if (resultString.appType !== appType)
                    setShowPop({title: "App Type Error", content: "Project application type and Imported JSON application type doesn't match, please check!"});
                else if (resultString.view.length === 0)
                    setShowPop({title: "No Objects found", content: "The file has no objects to import, please check!"});
                else {
                    let arg = {
                        projectId: projectId,
                        screenId: screenId,
                        screenName: screenName,
                        userId: user_id,
                        roleId: role,
                        param: "importScrapeData",
                        appType: appType,
                        versionnumber: versionnumber,
                        objList: resultString
                    };
                    scrapeApi.updateScreen_ICE(arg)
                        .then(data => {
                            // if(appType==="Webservice"){
                            //     angular.element(document.getElementById("left-nav-section")).scope().getWSData();
                            // }
                            // else{
                                if (data === "Invalid Session") return RedirectPage(history);
                                else fetchScrapeData().then(response => (
                                        response === "success" ?
                                        setShowPop({title: "Import Screen", content: "Screen Json imported successfully."}) 
                                        : false
                                    ));
                            // }
                        })
                        .catch(error => console.log(error));
                }
            } else setShowPop({'title': "Import Screen", 'content': "Please Check the file format you have uploaded!"});
        }
        reader.readAsText(file);
    }

    const importTestCase = (overWrite) => {

        // if(overWrite) setShowConfirmPop(false);
        
        // DesignApi.readTestCase_ICE(userInfo, testCaseId, testCaseName, versionnumber)
		// .then(response => {
		// 		if (response === "Invalid Session") RedirectPage(history);
        //         if (response.testcase.length === 0 || overWrite) {
        //             // hiddenInput.current.click();
                    document.getElementById("importScreenField").click();
        //         }
        //         else{
        //             setShowConfirmPop({'title': 'Table Consists of Data', 'content': 'Import will erase your old data. Do you want to continue?', 'onClick': ()=>importTestCase(true)});
        //         }
        //     })
        // .catch(error => console.error("ERROR::::", error));
    }
    
    const lowerList = [
        {'title': 'Add Object', 'img': 'static/imgs/ic-addobject.png', 'action': ()=>setShowObjModal("addObject"), 'show': appType === 'Web' || appType === "MobileWeb", disable:  compareFlag}, 
        {'title': 'Map Object', 'img': 'static/imgs/ic-mapobject.png', 'action': ()=>setShowObjModal("mapObject"), 'show': appType === 'Web' || appType === "MobileWeb", 'disable': customLen <= 0 || scrapeItemsLength-customLen <= 0 || compareFlag},
        {'title': 'Compare Object', 'img': 'static/imgs/ic-compareobject.png', 'action': ()=>setShowObjModal("compareObject"), 'show': appType === 'Web' || appType === "MobileWeb", 'disable': scrapeItemsLength-customLen <= 0 || !disableAction || compareFlag },
        {'title': 'Create Object', 'img': 'static/imgs/ic-jq-editstep.png', 'action': ()=>setShowObjModal("createObject"), 'show': appType === 'Web' || appType === "MobileWeb", disable: compareFlag},
        {'title': 'Import Screen', 'img': 'static/imgs/ic-import-script.png', 'action': ()=>importTestCase(true), show: true, disable: compareFlag},
        {'title': 'Export Screen', 'img': 'static/imgs/ic-export-script.png', 'action': ()=>exportScrapeObjects(), 'disable': (customLen <= 0 && scrapeItemsLength-customLen <= 0) || compareFlag, show: true}
    ]

    return (
        <>
            {lowerList.map((icon, i) => icon.show && <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} disable={icon.disable}/>)}
            <input id="importScreenField" type="file" style={{display: "none"}} onChange={onInputChange} accept=".json"/>
        </>
    );
}


const ActionBarItems = props => {
    const { appType } = useSelector(state=>state.plugin.CT);
    return (
        <ActionBar
            upperContent={ appType === "Mainframe" ? null : <UpperContent />}
            bottomContent={ appType === "Mainframe" ? null : <BottomContent />}
        />
    )
}

export default ActionBarItems;