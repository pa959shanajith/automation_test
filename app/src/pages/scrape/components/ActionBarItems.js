import React, { useState, useEffect, Fragment, useContext, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import '../styles/ActionBarItems.scss'
import * as actionTypes from '../state/action';
import { ScrapeContext } from "../components/ScrapeContext";
import * as scrapeApi from '../api';
import { RedirectPage, ActionBar, Thumbnail, Messages as MSG, setMsg } from '../../global';
import MultiSelectDropdown from '../../global/components/MultiSelectDropdown';
import { Button } from 'primereact/button';


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
    const { appType, subTaskId } = useSelector(state => state.plugin.CT);
    const [isMac, setIsMac] = useState(false);
    const [appendCheck, setAppendCheck] = useState(false);
    const [scrapeItemsLength, setScrapeLen] = useState(0);
    const { setShowAppPop, saved, startScrape, setSaved,setShowObjModal,scrapeItems } = useContext(ScrapeContext);
    const [customLen, setCustomLen] = useState(0);
    const [irisLen, setIrisLen] = useState(false);
    const [unsavedObjPresent, setUnsavedObjPresent] = useState(0);
   
    


    useEffect(()=>{
        let customs = 0;
        let savedObjects = 0;
        let unsavedObjects = 0;
        let irisObjects = 0;
        for (let scrapeItem of scrapeItems){
            if( scrapeItem.xpath && scrapeItem.xpath.split(";")[0]==="iris" ) irisObjects++;
            if ( scrapeItem.objId && scrapeItem.isCustom) customs++;
            if (scrapeItem.objId) savedObjects++;
            else unsavedObjects++;
        }
        setScrapeLen(savedObjects);
        setUnsavedObjPresent(unsavedObjects);
        setCustomLen(customs);
        setIrisLen(irisObjects);
    }, [scrapeItems])

    useEffect(() => {
        setIsMac(navigator.appVersion.toLowerCase().indexOf("mac") !== -1);
        if (saved.flag || disableAction) setAppendCheck(false);
        //eslint-disable-next-line
    }, [appType, saved, subTaskId]);


    const WebList = [
        { 'title': "Internet Explorer", 'img': "static/imgs/internet_explorer_logo_new.svg", action: () => startScrape('ie'), 'disable': disableAction || compareFlag },
        { 'title': "Google Chrome", 'img': "static/imgs/chrome_logo_new.svg", action: () => startScrape('chrome'), 'disable': disableAction || compareFlag },
        { 'title': "Safari", 'img': "static/imgs/safari_logo_new.svg", action: () => startScrape('safari'), 'disable': disableAction || compareFlag },
        { 'title': "Mozilla Firefox", 'img': "static/imgs/firefox_logo_new.svg", action: () => startScrape('mozilla'), 'disable': disableAction || compareFlag },
        { 'title': "Microsoft Edge", 'img': "static/imgs/edge_logo_new.svg", action: () => startScrape('edge'), 'disable': disableAction || compareFlag },
        { 'title': "Edge Chromium", 'img': "static/imgs/edge_logo_new.svg", action: () => startScrape('chromium'), 'disable': disableAction || compareFlag }
    ]

    const oebsList = [{ 'title': "OEBS Apps", 'img': 'static/imgs/ic-desktop.png', action: ()=> setShowAppPop({'appType': 'OEBS', 'startScrape': (scrapeObjects)=>startScrape(scrapeObjects)}), 'disable': disableAction }]

    const desktopList = [{ 'title': "Desktop Apps", 'img': 'static/imgs/ic-desktop.png', action: () => setShowAppPop({'appType': 'Desktop', 'startScrape': (scrapeObjects)=>startScrape(scrapeObjects)}), 'disable': disableAction }]

    const sapList = [{ 'title': "SAP Apps", 'img': 'static/imgs/ic-desktop.png', action: () => setShowAppPop({'appType': 'SAP', 'startScrape': (scrapeObjects)=>startScrape(scrapeObjects)}), 'disable': disableAction }]

    const webserviceList = [{ 'title': "Web Services", 'img': 'static/imgs/ic-webservice.png', action: () => startScrape(), 'disable': disableAction }]

    const mobileAppList = [{ 'title': "Mobile Apps", 'img': 'static/imgs/ic-mobility.png', action: () => setShowAppPop({'appType': 'MobileApp', 'startScrape': (scrapeObjects)=>startScrape(scrapeObjects)}), 'disable': disableAction }]

    const mobileWebList = [{ 'title': "Mobile Web", 'img': 'static/imgs/ic-mobility.png', action: () => setShowAppPop({'appType': 'MobileWeb', 'startScrape': (scrapeObjects)=>startScrape(scrapeObjects)}), 'disable': disableAction || compareFlag }]


    const onAppend = event => {
        dispatch({ type: actionTypes.SET_DISABLEACTION, payload: !event.target.checked });
        if (event.target.checked) {
            setAppendCheck(true);
            if (appType==="Webservice") setSaved({ flag: false });
        }
        else setAppendCheck(false);
    }

    let renderComp = [
        // ...[{'title': 'Create Object','id':'addObjDesign', 'img': 'static/imgs/ic-jq-editstep.png', 'action': ()=>setShowObjModal("createObject"), 'show': appType === 'Web' || appType === "MobileWeb", disable: compareFlag}].map((icon,i)=> <Thumbnail data-test="bottomContent" key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable}/>),
        (props.appType === 'Web' || props.appType === "MobileWeb")? <div id='Insprint' data-test="scrapeOnHeading" key="scrapeOn" >Insprint Automation</div>:<></>,
        ...[{'title': 'Add Element', 'img': 'static/imgs/ic-addobject.png', 'action': ()=>setShowObjModal("addObject"), 'show': props.appType === 'Web' || props.appType === "MobileWeb", disable:  compareFlag},
         {'title': 'Map Element', 'img': 'static/imgs/ic-mapobject.png', 'action': ()=>setShowObjModal("mapObject"), 'show': props.appType === 'Web' || props.appType === "MobileWeb", 'disable': customLen <= 0 || scrapeItemsLength-customLen <= 0 || compareFlag}].map((icon,i)=>
        icon.show && <Thumbnail data-test="bottomContent" key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable}/>),
        (props.appType === 'Web' || props.appType === "MobileWeb")?<div id='UpgradeAn' data-test="scrapeOnHeading" key="scrapeOn" >Upgrade Analyzer</div>:<></>,
        ...[{'title': 'Analyze Screen', 'img': 'static/imgs/ic-compareobject.png', 'action': ()=>setShowObjModal("compareObject"), 'show': props.appType === 'Web' || props.appType === "MobileWeb", 'disable': scrapeItemsLength-customLen <= 0 || !disableAction || compareFlag || unsavedObjPresent || !saved.flag },
        {'title': 'Replace Element', 'img': 'static/imgs/ic-replaceobject.png', 'action': ()=>setShowObjModal("replaceObjectSelBr"), 'show': props.appType === 'Web', 'disable': scrapeItemsLength <= 0 || ((scrapeItemsLength) === irisLen) || compareFlag }].map((icon,i)=>
        icon.show && <Thumbnail data-test="bottomContent" key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable}/>),
        // (appType!=="Webservice" && <Thumbnail data-test="pdfUtility" key="pdf-icon-scrape" tooltip= "Launch PDF utility" title="PDF utility" img="static/imgs/ic-pdf_scrape.png" action={() => startScrape("pdf")} disable={disableAction} />),
        
    ];
        //  (appType!=="Webservice" && <Thumbnail data-test="pdfUtility" key="pdf-icon-scrape" tooltip= "Launch PDF utility" title="PDF utility" img="static/imgs/ic-pdf_scrape.png" action={() => startScrape("pdf")} disable={disableAction} />),
        // <div key="append-edit" className={"ss__thumbnail" + (disableAppend || compareFlag ? " disable-thumbnail" : "")}>
        //     <input data-test="appendInput" id="enable_append" type="checkbox" title="Enable Append" onChange={onAppend} checked={appendCheck} />
        //     <span data-test="append" className="ss__thumbnail_title" title="Enable Append">{appType==="Webservice" ? "Edit" : "Append"}</span>
        // </div>
    

    switch (appType) {
        case "Web": renderComp.splice(1, 0, <Fragment key="scrape-upper-section"> {WebList.map((icon, i) => icon.title !== "Safari" || isMac ? <Thumbnail key={i} title={icon.title} tooltip={"Launch "+icon.title} img={icon.img} svg={icon.svg} action={icon.action} disable={icon.disable} /> : null)}</Fragment>);
            break;
        case "OEBS": renderComp.splice(1, 0, <Fragment key="scrape-upper-section">{oebsList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} tooltip={icon.title} action={icon.action} disable={icon.disable} />)}</Fragment>);
            break;
        case "Desktop": renderComp.splice(1, 0, <Fragment key="scrape-upper-section">{desktopList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
            break;
        case "SAP": renderComp.splice(1, 0, <Fragment key="scrape-upper-section">{sapList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
            break;
        case "Webservice": renderComp.splice(1, 0, <Fragment key="scrape-upper-section">{webserviceList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
            break;
        case "MobileApp": renderComp.splice(1, 0, <Fragment key="scrape-upper-section">{mobileAppList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
            break;
        case "MobileWeb": renderComp.splice(1, 0, <Fragment key="scrape-upper-section">{mobileWebList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable} />)}</Fragment>);
            break;
        default: break;
    }

    return renderComp;
}

const BottomContent = (props) => {

    const hiddenInput = useRef();
    let appType = props.appType;
   // let fetchingDetails = props.fetchingDetails;
    
   // const { screenId, screenName, versionnumber, projectId, testCaseId } = useSelector(state => state.plugin.CT);
    const disableAction = useSelector(state => state.scrape.disableAction);
    const enableIdentifier = useSelector(state => state.scrape.enableIdentifier);
    // const {screenId, screenName, versionnumber, projectId, testCaseId }=props.fetchingDetails
    const screenId = props.fetchingDetails["_id"]
    const projectId = props.fetchingDetails.projectID
    const screenName = props.fetchingDetails["name"]
    const versionnumber = 0

    const compareFlag = useSelector(state=>state.scrape.compareFlag);
    const { user_id, role } = useSelector(state=>state.login.userinfo);

    const { setShowObjModal, scrapeItems, fetchScrapeData, setOverlay, saved, startScrape } = useContext(ScrapeContext);
    const [customLen, setCustomLen] = useState(0);
    const [scrapeItemsLength, setScrapeLen] = useState(0);
    const [unsavedObjPresent, setUnsavedObjPresent] = useState(0);
    const [irisLen, setIrisLen] = useState(false);

    const history = useHistory();
    
    useEffect(()=>{
        let customs = 0;
        let savedObjects = 0;
        let unsavedObjects = 0;
        let irisObjects = 0;
        for (let scrapeItem of scrapeItems){
            if( scrapeItem.xpath && scrapeItem.xpath.split(";")[0]==="iris" ) irisObjects++;
            if ( scrapeItem.objId && scrapeItem.isCustom) customs++;
            if (scrapeItem.objId) savedObjects++;
            else unsavedObjects++;
        }
        setScrapeLen(savedObjects);
        setUnsavedObjPresent(unsavedObjects);
        setCustomLen(customs);
        setIrisLen(irisObjects);
    }, [scrapeItems])

    

    const exportScrapeObjects = () => {
        scrapeApi.getScrapeDataScreenLevel_ICE(props.appType, screenId, projectId, "")
        .then(data => {
            if (data === "Invalid Session") return RedirectPage(history);
            let temp = {}
            let responseData;
            let hasData = false;

            if (typeof data === 'object' && data.view.length > 0) { 
                hasData = true;
                if (props.appType === "Webservice"){
                    let {view, reuse, ...info } = data; 
                    temp['scrapeinfo'] = info;
                    temp['reuse'] = reuse;
                    temp['view'] = view;
                } else temp = data;

                temp['appType'] = props.appType;
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
            } else setMsg(MSG.SCRAPE.ERR_NO_OBJ_SCRAPE);
        })
        .catch(error => console.error(error));
    }
    
    const onInputChange = (event) => {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            try{
                hiddenInput.current.value = '';
                if (file.name.split('.').pop().toLowerCase() === "json") {
                    setOverlay("Loading...")
                    let resultString = JSON.parse(reader.result);
                    if (!('appType' in resultString))
                        setMsg(MSG.SCRAPE.ERR_JSON_IMPORT);
                    else if (resultString.appType !== appType)
                        setMsg(MSG.SCRAPE.ERR_NO_MATCH_APPTYPE);
                    else if (resultString.view.length === 0)
                        setMsg(MSG.SCRAPE.ERR_NO_OBJ_IMPORT);
                    else {
                        let objList = {};
                        if ('body' in resultString) {
                            let { reuse, appType, screenId, view, versionnumber, ...scrapeinfo } = resultString; 
                            objList['reuse'] = reuse;
                            objList['appType'] = appType;
                            objList['screenId'] =  screenId;
                            objList['view'] = view;
                            objList['scrapeinfo'] = scrapeinfo;
                        }
                        else objList = resultString;

                        let arg = {
                            projectId: projectId,
                            screenId:  screenId,
                            screenName:screenName ,
                            userId: user_id,
                            roleId: role,
                            param: "importScrapeData",
                            appType:appType,
                            objList: objList
                        };
                        scrapeApi.updateScreen_ICE(arg)
                            .then(data => {
                                if (data === "Invalid Session") return RedirectPage(history);
                                else if (data === "fail") setMsg(MSG.SCRAPE.ERR_SCREEN_IMPORT) 
                                else fetchScrapeData().then(response => {
                                        if (response === "success")
                                            setMsg(MSG.SCRAPE.SUCC_SCREEN_JSON_IMPORT) 
                                        setOverlay("");
                                });
                            })
                            .catch(error => {
                                setOverlay("");
                                setMsg(MSG.SCRAPE.ERR_SCREEN_IMPORT) 
                                console.error(error)
                            });
                    }
                } else setMsg(MSG.SCRAPE.ERR_FILE_FORMAT);
                setOverlay("");
            }
            catch(error){
                setOverlay("");
                if (typeof(error)==="object") setMsg(error);
                else setMsg(MSG.SCRAPE.ERR_SCREEN_IMPORT);
                console.error(error);
            }
        }
        reader.readAsText(file);
    }

    const importTestCase = () => {
        hiddenInput.current.click();
    }
    
    const lowerList =  [

        
        // {'title': 'Add Object','id':'addObjDesign', 'img': 'static/imgs/ic-addobject.png', 'action': ()=>setShowObjModal("addObject"), 'show': props.appType === 'Web' || props.appType === "MobileWeb", disable:  compareFlag}, 
        // {'title': 'Map Object', 'img': 'static/imgs/ic-mapobject.png', 'action': ()=>setShowObjModal("mapObject"), 'show': props.appType === 'Web' || props.appType === "MobileWeb", 'disable': customLen <= 0 || scrapeItemsLength-customLen <= 0 || compareFlag},
        // {'title': 'Compare Object', 'img': 'static/imgs/ic-compareobject.png', 'action': ()=>setShowObjModal("compareObject"), 'show': appType === 'Web' || appType === "MobileWeb", 'disable': scrapeItemsLength-customLen <= 0 || !disableAction || compareFlag || unsavedObjPresent || !saved.flag },
        // {'title': 'Replace Object', 'img': 'static/imgs/ic-replaceobject.svg', 'action': ()=>setShowObjModal("replaceObjectSelBr"), 'show': appType === 'Web', 'disable': scrapeItemsLength <= 0 || ((scrapeItemsLength) === irisLen) || compareFlag },
        // <div id='Insprint' data-test="scrapeOnHeading" key="scrapeOn" className={'ss__scrapeOn' + (disableAction || compareFlag ? " disable-thumbnail" : "")}>Other Actions</div>
         {'title': 'Create Element', 'img': 'static/imgs/ic-jq-editstep.png', 'action': ()=>setShowObjModal("createObject"), 'show': appType === 'Web' || appType === "MobileWeb", disable: compareFlag},
        {'title': 'Export Screen', 'img': 'static/imgs/ic-export-script.png', 'action': ()=>exportScrapeObjects(), 'disable': ((customLen <= 0 && scrapeItemsLength-customLen <= 0) || compareFlag) && appType!=="Webservice", show: (appType!=="Web")},
        {'title': 'Export Screen', 'img': 'static/imgs/ic-export-script.png', 'action': ()=>setShowObjModal("exportObject"), 'disable': ((customLen <= 0 && scrapeItemsLength-customLen <= 0) || compareFlag) && appType==="Web", show: (appType==="Web")},
        {'title': 'Import Screen', 'img': 'static/imgs/ic-import-script.png', 'action': ()=>importTestCase(), show: (props.appType!=="Web"), disable: compareFlag && props.appType!=="Webservice"},
        {'title': 'Import Screen', 'img': 'static/imgs/ic-import-script.png', 'action': ()=>setShowObjModal("importObject"), show: (props.appType==="Web"), disable: compareFlag && props.appType==="Web"}, 
        {'title':'Object Identifier Order','img': enableIdentifier?'static/imgs/identifier-enabled.png':'static/imgs/identifier-disabled.png','action':()=>setShowObjModal("identifierlis"),'show': ((appType === 'Web' || appType === "MobileWeb")),disable:enableIdentifier?false:true}
    ]

    return (
        <>
        <div id='Otherapp' data-test="scrapeOnHeading" key="scrapeOn" >Other Actions</div>
            {lowerList.map((icon, i) => icon.show && <Thumbnail idx={i} data-test="bottomContent" key={i} title={icon.title} tooltip={icon.title} img={icon.img} action={icon.action} disable={icon.disable}/>)}
            {/* {(appType!=="Webservice" && <Thumbnail data-test="pdfUtility" key="pdf-icon-scrape" tooltip= "Launch PDF utility" title="PDF utility" img="static/imgs/ic-pdf_scrape.png" action={() => startScrape("pdf")} disable={disableAction} />)} */}
            <input ref={hiddenInput} data-test="fileInput" id="importScreenField" type="file" style={{display: "none"}} onChange={onInputChange} accept=".json"/>
        </>
        
    );
}


const ActionBarItems = props => {
    // const { appType } = useSelector(state=>state.plugin.CT);
    return (
        <ActionBar
            upperContent={ props.appType === "Mainframe" ? null : <UpperContent fetchingDetails={props.fetchingDetails} appType={props.appType} />}
            bottomContent={ props.appType === "Mainframe" ? null : <BottomContent  fetchingDetails={props.fetchingDetails} appType={props.appType} />}
        />
    )
}

export default ActionBarItems;