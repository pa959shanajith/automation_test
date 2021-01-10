import React, { useState, useEffect, Fragment, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import '../styles/ActionBarItems.scss'
import * as actionTypes from '../state/action';
import { ScrapeContext } from "../components/ScrapeContext";
import * as scrapeApi from '../api';
import { RedirectPage, ActionBar, Thumbnail, ResetSession } from '../../global';

/*Component LeftBarItems
  use: renders  6 options in design  in the left of screen
  props: 
    setoptions from scrapeHome.js 
*/
const UpperContent = props => {

    const dispatch = useDispatch();
    const history = useHistory();
    const disableAction = useSelector(state => state.scrape.disableAction);
    const disableAppend = useSelector(state => state.scrape.disableAppend);
    const { appType } = useSelector(state => state.plugin.CT);
    const [isMac, setIsMac] = useState(false);
    const [appendCheck, setAppendCheck] = useState(false);
    const {setShowAppPop, saved, setSaved, setNewScrapedData, scrapeItems, setOverlay, setShowPop, updateScrapeItems, newScrapedData} = useContext(ScrapeContext);

    useEffect(() => {
        setIsMac(navigator.appVersion.indexOf("Mac") !== -1);
        if (saved) setAppendCheck(false);
    }, [appType, saved]);


    const WebList = [
        { 'title': "Internet Explorer", 'img': "static/imgs/ic-ie.png", action: () => initScraping('ie'), 'disable': disableAction },
        { 'title': "Google Chrome", 'img': "static/imgs/ic-chrome.png", action: () => initScraping('chrome'), 'disable': disableAction },
        { 'title': "Safari", 'img': "static/imgs/ic-safari.png", action: () => initScraping('safari'), 'disable': disableAction },
        { 'title': "Mozilla Firefox", 'img': "static/imgs/ic-mozilla.png", action: () => initScraping('mozilla'), 'disable': disableAction },
        { 'title': "Microsoft Edge", 'svg': "static/imgs/ic-edge.svg", action: () => initScraping('edge'), 'disable': disableAction },
        { 'title': "Edge Chromium", 'svg': "static/imgs/ic-edge-chromium.svg", action: () => initScraping('chromium'), 'disable': disableAction }
    ]

    const oebsList = [{ 'title': "OEBS Apps", 'img': 'static/imgs/ic-desktop.png', action: ()=> setShowAppPop({'appType': 'OEBS', 'startScrape': (scrapeObjects)=>initScraping(scrapeObjects)}), 'disable': disableAction }]

    const desktopList = [{ 'title': "Desktop Apps", 'img': 'static/imgs/ic-desktop.png', action: () => setShowAppPop({'appType': 'Desktop', 'startScrape': (scrapeObjects)=>initScraping(scrapeObjects)}), 'disable': disableAction }]

    const sapList = [{ 'title': "SAP Apps", 'img': 'static/imgs/ic-desktop.png', action: () => setShowAppPop({'appType': 'SAP', 'startScrape': (scrapeObjects)=>initScraping(scrapeObjects)}), 'disable': disableAction }]

    const webserviceList = [{ 'title': "Web Services", 'img': 'static/imgs/ic-webservice.png', action: () => console.log(""), 'disable': disableAction }]

    const mobileAppList = [{ 'title': "Mobile Apps", 'img': 'static/imgs/ic-mobility.png', action: () => setShowAppPop({'appType': 'MobileApp', 'startScrape': (scrapeObjects)=>initScraping(scrapeObjects)}), 'disable': disableAction }]

    const mobileWebList = [{ 'title': "Mobile Web", 'img': 'static/imgs/ic-mobility.png', action: () => setShowAppPop({'appType': 'MobileWeb', 'startScrape': (scrapeObjects)=>initScraping(scrapeObjects)}), 'disable': disableAction }]


    const onAppend = event => {
        dispatch({ type: actionTypes.SET_DISABLEACTION, payload: !event.target.checked });
        if (event.target.checked) setAppendCheck(true);
        else setAppendCheck(false);
    }

    let renderComp = [
        <div key={1} className={'ss__scrapeOn' + (disableAction ? " disable-thumbnail" : "")}>Scrape On</div>,
        <Thumbnail title="Launch PDF utility" img="static/imgs/ic-pdf_scrape.png" action={() => initScraping("pdf")} disable={disableAction} />,
        <div key={3} className={"ss__thumbnail" + (disableAppend ? " disable-thumbnail" : "")}>
            <input id="enable_append" type="checkbox" onChange={onAppend} checked={appendCheck} />
            <span className="ss__thumbnail_title">Append</span>
        </div>
    ];

    const initScraping = browserType => {
        // $('#compareObjectModal').modal('hide');
		// $(".addObject span img").removeClass("left-bottom-selection");
		// $(".compareObject span img").removeClass("left-bottom-selection");
        // $(".generateObj span img").removeClass("left-bottom-selection");
        
        let screenViewObject = {}
        let blockMsg = 'Scraping in progress. Please Wait...';
        
        //For Desktop
        if (appType === "Desktop") {
            if (browserType === 'pdf'){
                screenViewObject.appType = browserType;
                // if ($rootScope.compareFlag == true) {
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else {
                    setOverlay(blockMsg);
                //     e.stopImmediatePropagation();
                // }
            } else {
                screenViewObject.appType = appType;
                screenViewObject.applicationPath = browserType.appPath;
                screenViewObject.processID = browserType.processID;
                screenViewObject.scrapeMethod = browserType.method;
                setShowAppPop(false);
                console.log(screenViewObject)
                // if (compareFlag == true) {
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else {
                    setOverlay(blockMsg);
                // }
            }
        }
        // //For Desktop
        // //For SAP
        else if (appType === "SAP") {
            if (browserType === 'pdf'){
                screenViewObject.appType = browserType;
                // if ($rootScope.compareFlag == true) {
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else {
                    setOverlay(blockMsg);
                //     e.stopImmediatePropagation();
                // }
            } else {
                screenViewObject.appType = appType;
                screenViewObject.applicationPath = browserType.appName;
                setShowAppPop(false);
                // if (false && compareFlag == true) {
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else {
                    setOverlay(blockMsg);
                // }
            }
        }

        // //For Mobility
        else if (appType === "MobileApp") {
            if (browserType === 'pdf'){
                screenViewObject.appType = browserType;
                // if ($rootScope.compareFlag == true) {
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else {
                    setOverlay(blockMsg);
                //     e.stopImmediatePropagation();
                // }
            }
            else if (browserType.appPath.toLowerCase().indexOf(".apk") >= 0) {
                screenViewObject.appType = appType;
                screenViewObject.apkPath = browserType.appPath;
                screenViewObject.mobileSerial = browserType.sNum;
                setShowAppPop(false);
                // if ($rootScope.compareFlag == true) {
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else {
                setOverlay(blockMsg);
                //     e.stopImmediatePropagation();
                // }
            } 
            else if (browserType.appPath.toLowerCase().indexOf(".ios") >= 0) {
                screenViewObject.appType = appType;
                screenViewObject.deviceName = browserType.appPath2;
                screenViewObject.versionNumber = browserType.verNum;
                screenViewObject.bundleId = browserType.deviceName;
                screenViewObject.ipAddress =  browserType.uuid;
                screenViewObject.param = 'ios';
                setShowAppPop(false);
                // if( $rootScope.compareFlag == true){
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else{
                    setOverlay(blockMsg);
                //     e.stopImmediatePropagation();
                // }
            }
            else {
                screenViewObject.appType = appType;
                screenViewObject.apkPath = browserType.appPath;
                screenViewObject.mobileDeviceName = browserType.deviceName;
                // screenViewObject.mobileIosVersion = $(document).find("#mobilityiOSVersion").val();
                screenViewObject.mobileUDID = browserType.uuid;
                setShowAppPop(false);
                // if( $rootScope.compareFlag == true){
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else{
                setOverlay(blockMsg);
                //     e.stopImmediatePropagation();                            
                // }
            }
        }
        // //For Mobility

        // //For Mobility Web
        else if (appType === "MobileWeb") {
            if (browserType === 'pdf'){
                screenViewObject.appType = browserType;

                // if ($rootScope.compareFlag == true) {
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else {
                    setOverlay(blockMsg);
                //     e.stopImmediatePropagation();
                // }
            } 
            else {
                screenViewObject.appType = appType;
                screenViewObject.mobileSerial = browserType.slNum;
                screenViewObject.androidVersion = browserType.vernNum;
                
                // if ($rootScope.compareFlag == true) {
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else {
                    setOverlay(blockMsg);
                //     e.stopImmediatePropagation();
                // }
            }
        }
        // //For Mobility Web

        // //For OEBS
        else if (appType === "OEBS") {
            if (browserType === 'pdf'){
                screenViewObject.appType = browserType;
                // if ($rootScope.compareFlag == true) {
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else {
                    setOverlay(blockMsg);
                    // e.stopImmediatePropagation();
                // }
            } 
            else {
                screenViewObject.appType = appType;
                screenViewObject.applicationPath = browserType.winName;
                // if ($rootScope.compareFlag == true) {
                //     blockUI(blockMsg2);
                //     e.stopImmediatePropagation();
                // }
                // else {
                    setOverlay(blockMsg);
                //     e.stopImmediatePropagation();
                // }
            }
        }
        //For PDF
        else if(browserType === "pdf"){
            screenViewObject.appType = browserType;
            // if ($rootScope.compareFlag == true) {
            //     blockUI(blockMsg2);
            //     e.stopImmediatePropagation();
            // }
            // else {
            setOverlay(blockMsg);
            //     e.stopImmediatePropagation();
            // }
        }
        //For Web
        else {
            // if ($rootScope.compareFlag == true) {
            //     screenViewObject.viewString = viewString;
            //     screenViewObject.action = "compare";
            // }
            screenViewObject.browserType = browserType
            
            // if ($rootScope.compareFlag == true) {
            //     blockUI(blockMsg2);
            //     e.stopImmediatePropagation();
            // }
            if (false){}
            else {
                setOverlay(blockMsg);
                // e.stopImmediatePropagation();
            }
        }
        //For Web
        ResetSession.start();
        scrapeApi.initScraping_ICE(screenViewObject)
            .then(data=> {
                console.log("initScraping result: ", data);
                setOverlay("");
                ResetSession.end();
                if (data === "Invalid Session") return RedirectPage(history);
                else if (data === "Response Body exceeds max. Limit.") {
                    setShowPop({ 'title': 'Scrape Screen', 'content': 'Scraped data exceeds max. Limit.' });
                    return false;
                } else if (data === 'scheduleModeOn' || data === "unavailableLocalServer") {
                    let scrapedItemsLength = scrapeItems.length;

                    if (scrapedItemsLength > 0) dispatch({ type: actionTypes.SET_DISABLEACTION, payload: true });
                    else dispatch({ type: actionTypes.SET_DISABLEACTION, payload: false });

                    setSaved(false);
                    setShowPop({
                        'title': 'Scrape Screen', 'content':
                            data === 'scheduleModeOn' ?
                                "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed." :
                                "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server."
                    });
                    return false;
                } else if (data === "fail") {
                    setShowPop({ 'title': 'Scrape', 'content': 'Failed to scrape.' });
                    return false
                } else if (data === "Terminate") {
                    setOverlay("");
                    setShowPop({ 'title': 'Scrape Screen', 'content': 'Scrape Terminated' });
                    return false
                } else if (data === "wrongWindowName") {
                    setShowPop({ 'title': 'Scrape', 'content': 'Wrong window name.' });
                } else if (data === "ExecutionOnlyAllowed") {
                    setShowPop({ 'title': 'Scrape Screen', 'content': 'Execution Only Allowed' });
                    return false
                }
                //COMPARE & UPDATE SCRAPE OPERATION
                if (data.action == "compare") {
                    console.log("compare . to be implemented")
                } else {
                    // saveScrapeDataFlag = false; is this flag necessary?
                    // $('.scrollbar-compare').hide();
                    // if (data.view.length > 0) {
                    //     $("#finalScrap").show();
                    // }
                    let viewString = data;
                    
                    // update Mirror
                    // let combinedViews = [...props.mainScrapedData.view, ...viewString.view]

                    if (viewString.view.length !== 0){
                    //Getting the Existing Scrape Data
                    let localScrapeList = [];
                    let lastObj = scrapeItems[scrapeItems.length-1]
                    let lastVal = lastObj ? lastObj.val : 0;
                    let lastIdx = newScrapedData.view ? newScrapedData.view.length : 0;

                    for (let i = 0; i < viewString.view.length; i++) {
                        
                        let scrapeObject = viewString.view[i];
                        
                        if (scrapeObject.cord) {
                            scrapeObject.hiddentag = "No";
                            scrapeObject.tag = `iris;${scrapeObject.objectType}`;
                            scrapeObject.url = "";
                            scrapeObject.xpath = `iris;${scrapeObject.custname};${scrapeObject.left};${scrapeObject.top};${(scrapeObject.width + scrapeObject.left)};${(scrapeObject.height + scrapeObject.top)};${scrapeObject.tag}`;
                        }

                        let scrapeItem = {  objId: scrapeObject._id,
                                            objIdx: lastIdx,
                                            val: ++lastVal,
                                            hide: false,
                                            title: scrapeObject.custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim(),
                                            custname: scrapeObject.custname
                                        }
                        
                        localScrapeList.push(scrapeItem)
                    }

                    let updatedNewScrapeData = {...newScrapedData};
                    if (updatedNewScrapeData.view) updatedNewScrapeData.view.push(...viewString.view);
                    else updatedNewScrapeData = viewString;
                    // update other properties too
                    setNewScrapedData(updatedNewScrapeData);
                    updateScrapeItems(localScrapeList)
                    
                    if (viewString.view.length > 0) setSaved(false);
                }else{
                    //when viewsstring.view is empty after click and add
                    // save Objects
                    return;
                }                        
                    if (props.appendCheck) {
                        //Autocomplete feature for scrape input fields
                        // $(function(){
                        //     var device_Name = screenViewObject.deviceName
                        //     var version_Number = screenViewObject.versionNumber
                        //     var bundle_Id = screenViewObject.bundleId
                        //     var ip_Address = screenViewObject.ipAddress
                        //     var apk = screenViewObject.apkPath 
                        //     var serial = screenViewObject.mobileSerial

                        //     $("#deviceName").autocomplete({
                        //         source: device_Name
                        //     });
                        //     $("#versionNumber").autocomplete({
                        //         source: version_Number
                        //     });
                        //     $("#bundleId").autocomplete({
                        //         source: bundle_Id
                        //     });
                        //     $("#ipAddress").autocomplete({
                        //         source: ip_Address
                        //     });
                        //     $("#mobilityAPKPath").autocomplete({
                        //         source: apk
                        //     });
                        //     $("#mobilitySerialPath").autocomplete({
                        //         source: serial
                        //     });

                        // });
                    }

                    // $("li.item:visible").each(function () {
                    //     if ($(this).attr('data-xpath') == "" && $(this).attr('data-tag') != "iris") {
                    //         $(this).children().find('span.ellipsis').addClass('customObject');
                    //     }
                    // });
                    
                    //Build Scrape Tree using dmtree.scrapper.js file
                    // $(document).find('#scrapTree').scrapTree({
                    //     multipleSelection: {
                    //         //checkbox : checked,
                    //         classes: ['.item']
                    //     },
                    //     editable: true,
                    //     radio: true
                    // });

                    // if (viewString.view.length > 0) {
                    //     // $("#saveObjects").removeClass('hide');
                    //     //$("#deleteObjects").prop("disabled", false);
                    //     // props.setSave(false);
                    // } else {
                    //     // $("#saveObjects").addClass('hide');
                    // }
                }

                // if('view' in  data)
                // {
                //     if(data.view.length == 0)
                //     {
                //         $(".checkStylebox").prop('disabled', true);
                //     }
                // }

                // if ($("#compareChangedObjectsBox").is(":visible") == true || $("#compareNotFoundObjectsBox").is(":visible") == true) {
                //     $("#saveComparedObjects").show();
                // }
                // else {
                //     $("#saveComparedObjects").hide();
                // }

                // if ($("#compareChangedObjectsBox").is(":visible") == true || $("#compareNotFoundObjectsBox").is(":visible") == true || $("#compareUnchangedObjectsBox").is(":visible") == true) {
                //     $("#viewscrapedObjects").show();
                //     $("#left-top-section,#left-bottom-section").addClass('disableClick');
                //     //  $("a[title='Filter']").parent().removeAttr( 'style' ).css("cursor", "no-drop");
                // }
                // else {
                //     $("#viewscrapedObjects").hide();
                // }

                // $(document).on('click', '#viewscrapedObjects', function () {
                //     $(".scrollbar-compare,.saveCompareDiv").hide(); //Hide Compare Div
                //     angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
                //     $("#scrapTree,.fsScroll").show(); //Show Scraped Objects
                //     $rootScope.compareFlag = false;
                //     $("#left-top-section,#left-bottom-section").removeClass('disableClick');
                // });

            })
            .catch(error => {
                setOverlay("");
                ResetSession.end();
                setShowPop({'title': "Scrape Screen",'content': "Error while performing Scrape."});
                console.error("Fail to Load design_ICE. Cause:", error);
            });
		
    }

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

    const { appType, screenId, screenName, versionnumber, projectId, testCaseId} = useSelector(state => state.plugin.CT);
    const disableAction = useSelector(state => state.scrape.disableAction);
    const { setShowObjModal, scrapeItems, setShowPop } = useContext(ScrapeContext);
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
                    type: "text/json;charset=utf-8"
                });

                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(objectsBlob, filename);
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
            } else setShowPop({title: "No Objects found", content: "The screen has no objects to export, please check!"});
        })
        .catch(error => console.error(error));
	}
    
    const lowerList = [
        {'title': 'Add Object', 'img': 'static/imgs/ic-addobject.png', 'action': ()=>setShowObjModal("addObject"), 'show': appType === 'Web' || appType === "MobileWeb"}, 
        {'title': 'Map Object', 'img': 'static/imgs/ic-mapobject.png', 'action': ()=>setShowObjModal("mapObject"), 'show': appType === 'Web' || appType === "MobileWeb", 'disable': customLen <= 0 || scrapeItemsLength-customLen <= 0},
        {'title': 'Compare Object', 'img': 'static/imgs/ic-compareobject.png', 'action': ()=>setShowObjModal("compareObject"), 'show': appType === 'Web' || appType === "MobileWeb", 'disable': scrapeItemsLength-customLen <= 0 || !disableAction },
        {'title': 'Create Object', 'img': 'static/imgs/ic-jq-editstep.png', 'action': ()=>setShowObjModal("createObject"), 'show': appType === 'Web' || appType === "MobileWeb"},
        {'title': 'Import Screen', 'img': 'static/imgs/ic-import-script.png', 'action': ()=>console.log("Import TestCase"), show: true},
        {'title': 'Export Screen', 'img': 'static/imgs/ic-export-script.png', 'action': ()=>exportScrapeObjects(), 'disable': customLen <= 0 && scrapeItemsLength-customLen <= 0, show: true}
    ]

    return (
        <>
            {lowerList.map((icon, i) => icon.show && <Thumbnail key={i} title={icon.title} img={icon.img} action={icon.action} disable={icon.disable}/>)}
            {/* <input id="importTestCaseField" type="file" style={{display: "none"}} ref={hiddenInput} onChange={onInputChange} accept=".json"/> */}
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