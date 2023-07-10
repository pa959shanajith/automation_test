import React ,{ useState, useEffect } from 'react';
import {useSelector, useDispatch} from "react-redux"
import {v4 as uuid} from 'uuid';
import { useHistory } from 'react-router-dom';
import ScrapeObjectList from './ScrapeObjectList';
import CompareObjectList from './CompareObjectList';
import WebserviceScrape from './WebserviceScrape';
import RefBarItems from '../components/RefBarItems.js';
import AddObjectModal from '../components/AddObjectModal';
import CompareObjectModal from '../components/CompareObjectModal';
import ReplaceObjectSelBrModal from '../components/ReplaceObjectSelBrModal';
import ReplaceObjectModal from '../components/ReplaceObjectModal';
import MapObjectModal from '../components/MapObjectModal';
import CertificateModal from '../components/CertificateModal';
import EditIrisObject from '../components/EditIrisObject';
import ExportObjectModal from '../components/ExportObjectModal';
import ImportObjectModal from '../components/ImportObjectModal';
import { CreateObjectModal, EditObjectModal } from '../components/CustomObjectModal';
import ActionBarItems from '../components/ActionBarItems';
import LaunchApplication from '../components/LaunchApplication';
import { ScrapeContext } from '../components/ScrapeContext';
import { Header, FooterTwo as Footer, ScreenOverlay, RedirectPage, PopupMsg, ModalContainer, ResetSession, Messages as MSG, setMsg } from '../../global';
import * as scrapeApi from '../api';
import * as actionTypes from '../state/action';
import '../styles/ScrapeScreen.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';


const ScrapeScreen = (props)=>{
    const dispatch = useDispatch();
    const history = useHistory();
    const current_task = useSelector(state=>state.plugin.CT);
    const certificateInfo = useSelector(state=>state.scrape.cert);
    const compareFlag = useSelector(state=>state.scrape.compareFlag);
    const elementPropertiesUpdated= useSelector(state=>state.scrape.elementPropertiesUpdated);
    const selectedModule = useSelector(state=>state.mindmap.selectedModule);
    const { user_id, role } = useSelector(state=>state.login.userinfo);
    const {endPointURL, method, opInput, reqHeader, reqBody, paramHeader} = useSelector(state=>state.scrape.WsData);
    const [overlay, setOverlay] = useState(null);
    const [showPop, setShowPop] = useState("");
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [scrapeItems, setScrapeItems] = useState([]);
    const [mainScrapedData, setMainScrapedData] = useState({});
    const [saved, setSaved] = useState({flag: true});
    const [mirror, setMirror] = useState({scrape: null, compare: null});
    const [showAppPop, setShowAppPop] = useState(false);
    const [isUnderReview, setIsUnderReview] = useState(false);
    const [scrapedURL, setScrapedURL] = useState("");
    const [hideSubmit, setHideSubmit] = useState(true);
    const [showObjModal, setShowObjModal] = useState(false);
    const [newScrapedData, setNewScrapedData] = useState({});
    const [orderList, setOrderList] = useState([]);
    const [displayModal, setDisplayModal] = useState(false);
    const [showTeststeps , setshowTeststeps]=useState([]);
    const [displayTest , setdisplayTest]=useState({});
    const [identifierList, setIdentifierList] = useState([{id:1,identifier:'xpath',name:'Absolute X-Path '},{id:2,identifier:'id',name:'ID Attribute'},{id:3,identifier:'rxpath',name:'Relative X-Path'},{id:4,identifier:'name',name:'Name Attribute'},{id:5,identifier:'classname',name:'Classname Attribute'},{id:6,identifier:'css-selector',name:'CSS Selector'},{id:7,identifier:'href',name:'Href Attribute'},{id:8,identifier:'label',name:'Label'}]);
    const[identifierModified,setIdentifierModiefied]=useState(false)
    const[oldScrapedObjsMap,setoldScrapedObjsMap]=useState({});
    const sony = useSelector(state => state.scrape.sony);


    
    useEffect(() => {
        // if(Object.keys(current_task).length !== 0) {
            fetchScrapeData()
            .then(data => {
                // setIsUnderReview(current_task.status === "underReview")
            })
            .catch(error=> console.log(error));
        // }
        //eslint-disable-next-line
        dispatch({type: actionTypes.SET_ISENABLEIDENTIFIER, payload:false})
        dispatch({type: actionTypes.SET_LISTOFCHECKEDITEMS, payload: []})

    }, [current_task])
    useEffect(()=>{
        if(identifierModified||elementPropertiesUpdated){
            fetchScrapeData()
        .then(data => {
            // setIsUnderReview(current_task.status === "underReview")
        })
        .catch(error=> console.log(error));
    // }
    //eslint-disable-next-line
    setIdentifierModiefied(false)
    dispatch({type: actionTypes.SET_ELEMENT_PROPERTIES, payload:false})
    dispatch({type: actionTypes.SET_LISTOFCHECKEDITEMS, payload: []})
        }
    },[identifierModified,elementPropertiesUpdated])
    useEffect(()=>{
        if (!showObjModal) {
            let selected = 0;
            let selectedObj = null;

            scrapeItems.forEach(item=>{
                if (!item.hide && item.checked) {
                    selected++;
                    selectedObj = item;
                }
            })

            if (selected === 1 && selectedObj && selectedObj.editable && selectedObj.tag && selectedObj.tag.substring(0, 4) === "iris") {
                let localScrapeItems = [...scrapeItems];

                localScrapeItems.forEach(item => { if (!item.hide) {
                    item.checked = false;
                }})
                
                setScrapeItems(localScrapeItems);
            }
        }
    }, [showObjModal])
    useEffect(()=>{
        if(sony){
            dispatch({type:actionTypes.SET_COMPAREFLAG,payload:true})
            dispatch({type:actionTypes.SET_SONY,payload:false})
        }
    },[sony])

    const fetchScrapeData = () => {
		return new Promise((resolve, reject) => {
            setOverlay("Loading...");
            
            let viewString = scrapeItems;
            let haveItems = viewString.length !== 0;

            // (type, screenId, projectId, testCaseId:optional)
            scrapeApi.getScrapeDataScreenLevel_ICE(props.appType, props.fetchingDetails["_id"], props.fetchingDetails.projectID, "")
            .then(data => {
                // current_task.subTask === "Scrape" (not sure !!)
                if (data.scrapedurl) setScrapedURL(data.scrapedurl);
                
                if (data === "Invalid Session") return RedirectPage(history);
                else if (typeof data === "object" && props.appType!=="Webservice") {
                    haveItems = data.view.length !== 0;
                    let [newScrapeList, newOrderList] = generateScrapeItemList(0, data);

                    setMainScrapedData(data);
                    setMirror({scrape: data.mirror, compare: null});
                    setNewScrapedData([]);
                    setScrapeItems(newScrapeList);
                    setHideSubmit(!haveItems);
                    setSaved({ flag: true });
                    setOrderList(newOrderList);
                    setOverlay("");
                    dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                    dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                }
                else if (typeof data === "object" && props.appType==="Webservice"){
                    haveItems = data.endPointURL && data.method;
                    if (haveItems) {
                        
                        let localReqBody = "";
                        if (data.body) localReqBody = getProcessedBody(data.body, 'fetch');
                        
                        let localRespBody = "";
                        if (data.responseBody) localRespBody = getProcessedBody(data.responseBody, 'fetch');

                        dispatch({
                            type: actionTypes.SET_WSDATA, 
                            payload: {
                                endPointURL: data.endPointURL,
                                method : data.method,
                                opInput : data.operations || "",
                                reqHeader : data.header ? data.header.split("##").join("\n"): "",
                                reqBody : localReqBody,
                                paramHeader : data.param ? data.param.split("##").join("\n"): "",
                                respHeader : data.responseHeader ? data.responseHeader.split("##").join("\n") : "",
                                respBody : localRespBody
                            }
                        });
                        setSaved({ flag: true });
                        setHideSubmit(false);
					} else {
                        setSaved({ flag: false });
                        setHideSubmit(true);
                        dispatch({type: actionTypes.SET_WSDATA, payload: {
                            endPointURL: "", method: "0", opInput: "", reqHeader: "",
                            reqBody: "", respHeader: "", respBody: "", paramHeader: "",
                        }});
                    }
                    setOverlay("");
                    dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                    dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                    dispatch({type: actionTypes.SET_ACTIONERROR, payload: []});
                    dispatch({type: actionTypes.SET_WSDLERROR, payload: []});
                }
                else{
                    dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                    dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                    setOverlay("");
                    // screenshot
                }
            resolve("success");
            })
            .catch(error => {
                dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                console.error("error", error);
                setOverlay("");
                reject("fail")
            })
        });
    }

    const startScrape = (browserType, compareFlag, replaceFlag) => {
        let appType = props.appType;
        if (appType === "Webservice") {
            let arg = {}
            let testCaseWS = []
            let keywordVal = ["setEndPointURL", "setMethods", "setOperations", "setHeader", "setWholeBody"];
            let wsdlInputs = [ 
                endPointURL, method, opInput, getFormattedValue(reqHeader), 
                getFormattedValue(paramHeader), getFormattedValue(reqBody, true) 
            ];
            if (Object.keys(certificateInfo).length)
                wsdlInputs.push(...[certificateInfo.certsDetails+";", certificateInfo.authDetails]);

            if (endPointURL.indexOf('https')===0) 
                arg.res = certificateInfo;

            let [ error, auth, proceed ] = validateWebserviceInputs(wsdlInputs);

            if (error) dispatch({type: actionTypes.SET_ACTIONERROR, payload: error});

            if (proceed) {
                dispatch({type: actionTypes.SET_ACTIONERROR, payload: []});
                if (auth)
                    keywordVal.push(...["addClientCertificate","setBasicAuth"])

                if (wsdlInputs[4]) keywordVal.splice(4, 0, 'setParamValue');
                else wsdlInputs.splice(4, 1);

                setOverlay("Fetching Response Header & Body...");
                ResetSession.start();
                for (let i = 0; i < wsdlInputs.length; i++) {
                    if (wsdlInputs[i] !== "") {
                        testCaseWS.push(getWSTestCase(i, appType, wsdlInputs[i], keywordVal[i]));
                    }
                }
                testCaseWS.push(getWSTestCase(testCaseWS.length, appType, "", "executeRequest"));
                arg.testcasename = "";
                arg.apptype = "Webservice";
                arg.testcase = testCaseWS;
                scrapeApi.initScrapeWS_ICE(arg)
                .then(data => {
                    setOverlay("");
                    ResetSession.end();
                    if (data === "Invalid Session") {
                        return RedirectPage(history);
                    } else if (data === "unavailableLocalServer") {
                        setMsg(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER);
                    } else if (data === "scheduleModeOn") {
                        setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
                    } else if (data === "ExecutionOnlyAllowed" || data["responseHeader"] === "ExecutionOnlyAllowed"){
                        setMsg(MSG.SCRAPE.WARN_EXECUTION_ONLY);
                    } else if (typeof data === "object") {
                        setMsg(MSG.SCRAPESUCC_WEBSERVICE_RESP);
                        dispatch({type: actionTypes.SET_WSDATA, payload: {respHeader: data.responseHeader[0].split("##").join("\n")}});
                        let localRespBody = getProcessedBody(data.responseBody[0], 'scrape');
                        dispatch({type: actionTypes.SET_WSDATA, payload: {respBody: localRespBody}});
                    } else setMsg(MSG.SCRAPE.ERR_DEBUG_TERMINATE);
                })
                .catch(error => {
                    setOverlay("");
                    ResetSession.end();
                    console.error("Fail to initScrapeWS_ICE. ERROR::::", error);
                    setMsg(MSG.SCRAPE.ERR_OPERATION);
                });
            }
        } else {
            let screenViewObject = {};
            let blockMsg = 'Scraping in progress. Please Wait...';
            if (compareFlag) {
                blockMsg = 'Comparing objects in progress...';
                setShowObjModal(false);
            };
            if(replaceFlag) {
                blockMsg = 'Scrape and Replace Object in progress...';
                setShowObjModal(false);
            };

            screenViewObject = getScrapeViewObject(props.appType, browserType, compareFlag, replaceFlag, mainScrapedData, newScrapedData);
            setShowAppPop(false);
            setOverlay(blockMsg);

            ResetSession.start();
            scrapeApi.initScraping_ICE(screenViewObject)
            .then(data=> {
                let err = null;
                setOverlay("");
                ResetSession.end();
                if (data === "Invalid Session") return RedirectPage(history);
                else if (data === "Response Body exceeds max. Limit.")
                    err = { 'variant': 'Scrape Screen', 'content': 'Scraped data exceeds max. Limit.' };
                else if (data === 'scheduleModeOn' || data === "unavailableLocalServer") {
                    let scrapedItemsLength = scrapeItems.length;

                    if (scrapedItemsLength > 0) dispatch({ type: actionTypes.SET_DISABLEACTION, payload: true });
                    else dispatch({ type: actionTypes.SET_DISABLEACTION, payload: false });

                    setSaved({ flag: false });
                    err = {
                        'VARIANT':  data === 'scheduleModeOn'?MSG.GENERIC.WARN_UNCHECK_SCHEDULE.VARIANT:MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.VARIANT, 'CONTENT':
                            data === 'scheduleModeOn' ?
                                MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT :
                                MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.CONTENT
                    };
                } else if (data === "fail")
                    err = MSG.SCRAPE.ERR_SCRAPE;
                else if (data === "Terminate") {
                    setOverlay("");
                    err = MSG.SCRAPE.ERR_SCRAPE_TERMINATE;
                }
                else if (data === "wrongWindowName")
                    err =MSG.SCRAPE.ERR_WINDOW_NOT_FOUND;
                else if (data === "ExecutionOnlyAllowed")
                    err = MSG.GENERIC.WARN_EXECUTION_ONLY;

                if (err) {
                    setMsg(err);
                    return false;
                }
                //COMPARE & UPDATE SCRAPE OPERATION
                if (data.action === "compare") {
                    if (data.status === "SUCCESS") {
                        let oldScrapedObjsMapLocal={}
                        let compareObj = generateCompareObject(data, scrapeItems.filter(object => object.xpath.substring(0, 4)==="iris"));
                        let [newScrapeList, newOrderList] = generateScrapeItemList(0, mainScrapedData);
                       newScrapeList.map(object=>{
                            oldScrapedObjsMapLocal[object['xpath']]=true;
                        });
                        setoldScrapedObjsMap(oldScrapedObjsMapLocal)
                        setScrapeItems(newScrapeList);
                        setOrderList(newOrderList);
                        setMirror(oldMirror => ({ ...oldMirror, compare: data.mirror}));
                        dispatch({type: actionTypes.SET_COMPAREDATA, payload: data});
                        dispatch({type: actionTypes.SET_COMPAREOBJ, payload: compareObj});
                        dispatch({type: actionTypes.SET_COMPAREFLAG, payload: true});
                    } else {
                        if (data.status === "EMPTY_OBJECT")
                            setMsg(MSG.SCRAPE.ERR_UNMAPPED_OBJ);
                        else
                            setMsg(MSG.SCRAPE.ERR_COMPARE_OBJ);
                    }
                } else if (data.action === "replace") {
                   let viewString = data;

                    if (viewString.view.length !== 0){
                        let lastIdx = newScrapedData.view ? newScrapedData.view.length : 0;

                        let [scrapeItemList, newOrderList] = generateScrapeItemList(lastIdx, viewString, "new");
                        setNewScrapedData(scrapeItemList);
                        setShowObjModal("replaceObject");
                    } else {
                        setMsg(MSG.SCRAPE.ERR_NO_NEW_SCRAPE);
                    }
                } else {
                    let viewString = data;

                    if (viewString.view.length !== 0){
                        let lastIdx = newScrapedData.view ? newScrapedData.view.length : 0;

                        let [scrapeItemList, newOrderList] = generateScrapeItemList(lastIdx, viewString, "new");

                        let updatedNewScrapeData = {...newScrapedData};
                        if (updatedNewScrapeData.view) {
                            let viewArr = [...updatedNewScrapeData.view]
                            viewArr.push(...viewString.view);
                            updatedNewScrapeData = { ...viewString, view: viewArr};
                        }
                        else updatedNewScrapeData = viewString;

                        setNewScrapedData(updatedNewScrapeData);
                        updateScrapeItems(scrapeItemList);
                        setScrapedURL(updatedNewScrapeData.scrapedurl);
                        setMirror({scrape: viewString.mirror, compare: null});
                        setOrderList(oldOrderList => [...oldOrderList, ...newOrderList]);
                        
                        if (viewString.view.length > 0) setSaved({ flag: false });
                    }                        
                }


            })
            .catch(error => {
                setOverlay("");
                ResetSession.end();
                setMsg(MSG.SCRAPE.ERR_SCRAPE);
                console.error("Fail to Load design_ICE. Cause:", error);
            });
        }
    }

    const PopupDialog = () => (
        <ModalContainer 
            title={showPop.title}
            modalClass="modal-sm"
            close={()=>setShowPop("")}
            content={showPop.content}
            footer={showPop.footer}
        />
    );

    const ConfirmPopup = () => (
        <ModalContainer 
            title={showConfirmPop.title}
            content={showConfirmPop.content}
            close={()=>setShowConfirmPop(false)}
            footer={
                <>
                <button onClick={showConfirmPop.onClick}>
                    {showConfirmPop.continueText ? showConfirmPop.continueText : "Yes"}
                </button>
                <button onClick={()=>setShowConfirmPop(false)}>
                    {showConfirmPop.rejectText ? showConfirmPop.rejectText : "No"}
                </button>
                </>
            }
        />
    )

    const updateScrapeItems = newList => {
        setScrapeItems([...scrapeItems, ...newList])
    }

    const dialogFuncMapS = {
        'displayModal': setDisplayModal
    }
    const onClick = (name) => {
        dialogFuncMapS[`${name}`](true);
    }

    const onHide = (name) => {
        dialogFuncMapS[`${name}`](false);
    }

    const openScreenTestCase =() =>{
        let screenTestcases = {};
        let displayTeststep=[];
        if(selectedModule && selectedModule.children && selectedModule.children.length > 0) {
            for(let scenario of selectedModule.children) {
                if(scenario && scenario.children && scenario.children.length > 0){
                    for(let scr of scenario.children) {
                        if(scr && scr.children && scr.children.length > 0){
                            if (scr["id"] === (props.fetchingDetailsId["id"]?props.fetchingDetailsId["id"]:parseInt(props.fetchingDetailsId))  && scr["_id"]===props.fetchingDetails["_id"] && scenario["_id"] === props.fetchingDetails.parent["_id"]){
                                screenTestcases = scr.children
                                setdisplayTest(screenTestcases);
                                
                                for( let i=0; i<screenTestcases.length; i++){
                                    displayTeststep.push(screenTestcases[i])
                                }
                                setshowTeststeps(displayTeststep)
                            }
                        }
                    }
                }
            }
        }
    if(displayTeststep.length===1 ){
       
            displayTestCase(0,displayTeststep);
        }
        else{
           
           onClick("displayModal")
        }
    }

 const displayTestCase = (value,displayTeststep) => {
    let populateTestcaseDetails = {
        "parent":{
            "_id":props.fetchingDetails["_id"],
            name:props.fetchingDetails["name"],
            projectId:props.fetchingDetails["projectId"],
            "testCaseId":displayTeststep[value]["_id"] ,
            "parent":{"_id":props.fetchingDetails.parent["_id"]}
        },
        "_id":displayTeststep[value]["_id"] ,
        "name":displayTeststep[value]["name"]  }
    props.openScrapeScreen("displayBasic2","","displayBasic",{populateTestcaseDetails})
 }
 const columns = [
   
    {field:'id',header:'Priority'},
    { field: 'name', header: 'Identifier' },
];
const onRowReorder=(e)=>{
    const reorderedProducts=e.value.map((element, idx) => {
    element.id = idx + 1
    return element
})
    setIdentifierList(reorderedProducts)

}
const saveIdentifier=()=>{
    const changedIdentifierScrapedItems=[...scrapeItems]
    const finalScrapedItems=changedIdentifierScrapedItems.filter(object=>object.checked).map(Object=>Object.objId)
    let identifierListUpdated=identifierList.map(({id,identifier})=>({id,identifier}))
    let params = {
        'objectIds':finalScrapedItems,
        'identifiers':identifierListUpdated,
        'param':'updatedIdentifier',
        'userId': user_id,
        'roleId': role,
        
        // 'identifier'
    }
    scrapeApi.updateScreen_ICE(params)
        .then(response => {
            console.log(response)
            if(response == "Success"){
                setIdentifierModiefied(true)
                setShowObjModal('')
                setMsg(MSG.SCRAPE.SUCC_OBJ_IDENTIFIER_LIST);
                setIdentifierList([{id:1,identifier:'xpath',name:'Absolute X-Path '},{id:2,identifier:'id',name:'ID Attribute'},{id:3,identifier:'rxpath',name:'Relative X-Path'},{id:4,identifier:'name',name:'Name Attribute'},{id:5,identifier:'classname',name:'Classname Attribute'},{id:6,identifier:'css-selector',name:'CSS Selector'},{id:7,identifier:'href',name:'Href Attribute'},{id:8,identifier:'label',name:'Label'}])
                
            }
        })
        .catch(error => {
            console.log(error)
            setShowObjModal('')
                setMsg("Some Error occured while saving identifier list.");
                setIdentifierList([{id:1,identifier:'xpath',name:'Absolute X-Path '},{id:2,identifier:'id',name:'ID Attribute'},{id:3,identifier:'rxpath',name:'Relative X-Path'},{id:4,identifier:'name',name:'Name Attribute'},{id:5,identifier:'classname',name:'Classname Attribute'},{id:6,identifier:'css-selector',name:'CSS Selector'},{id:7,identifier:'href',name:'Href Attribute'},{id:8,identifier:'label',name:'Label'}])
        }
        )
        
}
const dynamicColumns = columns.map((col, i) => {
                    return <Column key={col.field} columnKey={col.field} field={col.field} header={col.header} />;
                });

const footerContent = (
                    <div>
                        <div style={{position:'absolute',fontStyle:'italic'}}><span style={{color:'red'}}>*</span>Drag/drop to reorder identifiers.</div>
                        <Button label="No" icon="pi pi-times" onClick={() => setShowObjModal('')} className="p-button-text" />
                        <Button label="Yes" icon="pi pi-check" onClick={() => saveIdentifier()} autoFocus />
                    </div>
)
const Header = () => {
    return (
        <div>Element Identifier Order<span style={{color:'red'}}>*</span></div>
    );
};
    return (
        
        <>
        <Dialog header="Design Test Steps" visible={displayModal} style={{ width: '20vw' }} onHide={() => onHide('displayModal')}>
            {(showTeststeps.length !== 0)?<>{showTeststeps.map((item, idx)=><div >
            {/* <div>{idx+1.}</div> */}
            <div className='Design_test_steps'  value={idx} onClick={(e)=>{displayTestCase(idx,showTeststeps)}}>
           <span>{`${idx+1}.`}</span><span className='Design_test_steps_name' title={item.name}>{item.name}</span>
            </div>
            </div>)}</>:<div>No Test Cases Found</div>}
         </Dialog>
        { overlay && <ScreenOverlay content={overlay} />}
        { showPop && <PopupDialog />}
        { showConfirmPop && <ConfirmPopup /> }
        { showObjModal === "exportObject" && <ExportObjectModal  appType={props.appType}  fetchingDetails={props.fetchingDetails} setMsg={setMsg} setOverlay={setOverlay} setShow={setShowObjModal} />}
        { showObjModal === "importObject" && <ImportObjectModal  fetchScrapeData={fetchScrapeData} setOverlay={setOverlay} setShow={setShowObjModal} appType={props.appType}  fetchingDetails={props.fetchingDetails} />}
        { showObjModal === "mapObject" && <MapObjectModal setShow={setShowObjModal} setShowPop={setShowPop} scrapeItems={scrapeItems} current_task={current_task} fetchScrapeData={fetchScrapeData} history={history} fetchingDetails={props.fetchingDetails}  /> }
        { showObjModal === "addObject" && <AddObjectModal setShow={setShowObjModal} setShowPop={setShowPop} scrapeItems={scrapeItems} setScrapeItems={setScrapeItems} setSaved={setSaved} setOrderList={setOrderList} /> }
        { showObjModal === "compareObject" && <CompareObjectModal fetchingDetails={props.fetchingDetails} setShow={setShowObjModal} startScrape={startScrape} /> }
        { showObjModal === "replaceObjectSelBr" && <ReplaceObjectSelBrModal setShow={setShowObjModal} startScrape={startScrape} /> }
        { showObjModal === "replaceObject" && <ReplaceObjectModal appType={props.appType}  fetchingDetails={props.fetchingDetails} setShow={setShowObjModal} setShowPop={setShowPop} scrapeItems={scrapeItems} current_task={current_task} fetchScrapeData={fetchScrapeData} history={history} newScrapedData={newScrapedData} setOverlay={setOverlay} /> }
        { showObjModal === "createObject" && <CreateObjectModal setSaved={setSaved} setShow={setShowObjModal} scrapeItems={scrapeItems} updateScrapeItems={updateScrapeItems} setShowPop={setShowPop} newScrapedData={newScrapedData} setNewScrapedData={setNewScrapedData} setOrderList={setOrderList} />}
        { showObjModal === "addCert" && <CertificateModal setShow={setShowObjModal} setShowPop={setShowPop} /> }
        { showObjModal.operation === "editObject" && <EditObjectModal utils={showObjModal} setSaved={setSaved} scrapeItems={scrapeItems} setShow={setShowObjModal} setShowPop={setShowPop}/>}
        { showObjModal.operation === "editIrisObject" && <EditIrisObject utils={showObjModal} setShow={setShowObjModal} setShowPop={setShowPop} taskDetails={{projectid: props.fetchingDetails.projectID, screenid: props.fetchingDetails["_id"], screenname: props.fetchingDetails.name,versionnumber:0 /** version no. not avail. */, appType: props.appType}} />}
        <Dialog header={Header} style={{width:'56vw'}} visible={showObjModal === "identifierlis"}  onHide={() => setShowObjModal('')} footer={footerContent} >
        <div className="card" >
        <DataTable  value={identifierList} reorderableColumns reorderableRows onRowReorder={onRowReorder} >
                <Column rowReorder style={{ width: '3rem' }} />
                {dynamicColumns}
        </DataTable>
        </div>
       </Dialog>
        { showAppPop && <LaunchApplication setShow={setShowAppPop} appPop={showAppPop} />}
        <div data-test="ssBody" className="ss__body">
            {/* <Header/> */}
            
            <div data-test="ssMidSection" className="ss__mid_section">
                <ScrapeContext.Provider value={{ startScrape, oldScrapedObjsMap, setScrapedURL, scrapedURL, isUnderReview, fetchScrapeData, setShowObjModal, saved, setShowAppPop, setSaved, newScrapedData, setNewScrapedData, setShowConfirmPop, mainScrapedData, scrapeItems, setScrapeItems, hideSubmit, setOverlay, setShowPop, updateScrapeItems, orderList, setOrderList }}>
                <ActionBarItems appType={props.appType}  fetchingDetails={props.fetchingDetails} />
                    { props.appType === "Webservice" 
                        ? <WebserviceScrape fetchingDetails={props.fetchingDetails}/> 
                        : compareFlag ? <CompareObjectList fetchingDetails={props.fetchingDetails}/> : <ScrapeObjectList fetchingDetails={props.fetchingDetails} appType={props.appType} setIdentifierList={setIdentifierList} />}
                    <RefBarItems hideInfo={true} mirror={mirror} collapse={true} appType={props.appType} openPopup={openScreenTestCase}/>
                </ScrapeContext.Provider>
            </div>
            {/* <div data-test="ssFooter"className='ss__footer'><Footer/></div> */}
        </div>
       
        </>
    );
}

export default ScrapeScreen;


function getScrapeViewObject(appType, browserType, compareFlag, replaceFlag, mainScrapedData, newScrapedData) {
    let screenViewObject = {};
    //For PDF
    if (browserType === "pdf"){
        screenViewObject.appType = browserType;
    }
    //For Desktop
    else if (appType === "Desktop") {
        screenViewObject.appType = appType;
        screenViewObject.applicationPath = browserType.appPath;
        screenViewObject.processID = browserType.processID;
        screenViewObject.scrapeMethod = browserType.method;
    }
    //For SAP
    else if (appType === "SAP") {
        screenViewObject.appType = appType;
        screenViewObject.applicationPath = browserType.appName;
    }
    //For Mobility
    else if (appType === "MobileApp") {
        if (browserType.appPath.toLowerCase().indexOf(".apk") >= 0) {
            screenViewObject.appType = appType;
            screenViewObject.apkPath = browserType.appPath;
            screenViewObject.mobileSerial = browserType.sNum;
        } 
        else {
            screenViewObject.appType = appType;
            screenViewObject.deviceName = browserType.appPath2;
            screenViewObject.versionNumber = browserType.verNum;
            screenViewObject.bundleId = browserType.deviceName;
            screenViewObject.ipAddress =  browserType.uuid;
            screenViewObject.param = 'ios';
        }
    }
    //For Mobility Web
    else if (appType === "MobileWeb") {
        screenViewObject.appType = appType;
        screenViewObject.mobileSerial = browserType.slNum;
        screenViewObject.androidVersion = browserType.vernNum;
        if (compareFlag) {
            screenViewObject.action = "compare";
        } else if(replaceFlag) {
            screenViewObject.action = "replace";
        }
        screenViewObject.browserType = browserType;
    }
    // For OEBS
    else if (appType === "OEBS") {
        screenViewObject.appType = appType;
        screenViewObject.applicationPath = browserType.winName;
    }
    //For Web
    else {
        if (compareFlag) {
            let viewString = Object.keys(newScrapedData).length ? {...newScrapedData, view: [...mainScrapedData.view, ...newScrapedData.view]} : { ...mainScrapedData };
            screenViewObject.viewString = {...viewString, view: viewString.view.filter(object => object.xpath.substring(0, 4)!=="iris")};
            screenViewObject.action = "compare";
        } else if (replaceFlag) {
            screenViewObject.action = "replace";
        }
        screenViewObject.browserType = browserType;
    }

    return screenViewObject;
}

function generateCompareObject(data, irisObjects){
    let compareObj = {};
    if (data.view[0].changedobject.length > 0) {
        let localList = [];
        for (let i = 0; i < data.view[0].changedobject.length; i++) {
            let scrapeItem = getCompareScrapeItem(data.view[0].changedobject[i]);
            localList.push(scrapeItem);
        }
        compareObj.changedObj = localList;
    }
    if (data.view[1].notchangedobject.length > 0) {
        let localList = [];
        for (let i = 0; i < data.view[1].notchangedobject.length; i++) {
            let scrapeItem = getCompareScrapeItem(data.view[1].notchangedobject[i])
            localList.push(scrapeItem);
        }   
        compareObj.notChangedObj = localList;
    }
    if (data.view[2].notfoundobject.length > 0 || irisObjects.length > 0) {
        let localList = [];
        if (data.view[2].notfoundobject.length > 0) {
            for (let i = 0; i < data.view[2].notfoundobject.length; i++) {
                let scrapeItem = getCompareScrapeItem(data.view[2].notfoundobject[i])
                localList.push(scrapeItem);
            }
        }
        compareObj.notFoundObj = [...localList, ...irisObjects];
    }
    compareObj['fullScrapeData'] = data['fullScrapeData']
    return compareObj;
} 

function getCompareScrapeItem(scrapeObject) {
    return {
        ObjId: scrapeObject._id,
        val: uuid(),
        tag: scrapeObject.tag,
        title: scrapeObject.custname.replace(/[<>]/g, '').trim(),
        custname: scrapeObject.custname,
        top: scrapeObject.top,
        left: scrapeObject.left,
        height: scrapeObject.height,
        width: scrapeObject.width,
        xpath: scrapeObject.xpath,
        url: scrapeObject.url,
        checked: false
    }
}

function generateScrapeItemList(lastIdx, viewString, type="old"){
    let localScrapeList = [];
    let orderList = viewString.orderlist || [];
    let orderDict = {};
    let resetOrder = false;
    for (let i = 0; i < viewString.view.length; i++) {
                            
        let scrapeObject = viewString.view[i];
        let newTag = scrapeObject.tag;
        
        if (scrapeObject.cord) {
            scrapeObject.hiddentag = "No";
            newTag = `iris;${(scrapeObject.objectType || "").toLowerCase()}`;
            scrapeObject.url = "";
            // if (scrapeObject.xpath.split(';').length<2)
            scrapeObject.xpath = `iris;${scrapeObject.custname};${scrapeObject.left};${scrapeObject.top};${(scrapeObject.width + scrapeObject.left)};${(scrapeObject.height + scrapeObject.top)};${(scrapeObject.objectType || "").toLowerCase()};${(scrapeObject.objectStatus || "0")};${scrapeObject.tag}`;
        }

        let newUUID = uuid();
        let scrapeItem = {  objId: scrapeObject._id,
                            objIdx: lastIdx,
                            val: newUUID,
                            tag: newTag,
                            hide: false,
                            title: scrapeObject.custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim(),
                            custname: scrapeObject.custname,
                            hiddentag: scrapeObject.hiddentag,
                            checked: false,
                            url: scrapeObject.url,
                            xpath: scrapeObject.xpath,
                            top: scrapeObject.top,
                            left: scrapeObject.left,
                            height: scrapeObject.height,
                            width: scrapeObject.width,
                            identifier:scrapeObject.identifier
                        }
        if (scrapeObject.fullSS != undefined && !scrapeObject.fullSS && scrapeObject.viewTop!=undefined) {
            scrapeItem['viewTop'] = scrapeObject.viewTop;
        }

        
        if (type === "new") scrapeItem.tempOrderId = newUUID;
        if(scrapeObject.hasOwnProperty('editable') || scrapeObject.cord){
            scrapeItem.editable = true;
        } else {
            let isCustom = scrapeObject.xpath === "";
            scrapeItem.isCustom = isCustom;
        };
        
        if(scrapeItem.objId) {
            orderDict[scrapeItem.objId] = scrapeItem;
        }
        else orderDict[scrapeItem.tempOrderId] = scrapeItem;

        if (!orderList.includes(scrapeItem.objId)) resetOrder = true;

        lastIdx++;
    }

    if (orderList && orderList.length && !resetOrder) 
        orderList.forEach(orderId => orderDict[orderId] ? localScrapeList.push(orderDict[orderId]): console.error("InConsistent OrderList Found!"))
    else {
        localScrapeList = Object.values(orderDict);
        orderList = Object.keys(orderDict);
    }

    return [localScrapeList, orderList];
}


function getProcessedBody (body, type) {
    let processedBody = body;
    if (body.indexOf("{") === 0 || body.indexOf("[") === 0) 
        processedBody = JSON.stringify(JSON.parse(body), null, '\t');
    else 
        processedBody = formatXml(body.replace(/>\s+</g, '><'));

    if (type === 'scrape')
        processedBody = processedBody.replace(/\&gt;/g, '>').replace(/\&lt;/g, '<');
    else if (type === 'fetch' && processedBody === '\r\n')
        processedBody = '';

    return processedBody;
}

function getFormattedValue (value, extraspace) {
    if (extraspace) return value.replace(/[\n\r]/g, '').replace(/\s\s+/g, ' ').replace(/"/g, '\"');
    return value.replace(/[\n\r]/g, '##').replace(/"/g, '\"');
}

function validateWebserviceInputs (wsdlInputs) {
    let error = false;
    let auth = false;
    let proceed = false;

    if (!wsdlInputs[0]) error = ["endPointURL"];
    else if (wsdlInputs[1]==="0") error = ["method"];
    else if (wsdlInputs[6]){
        auth = true;
        proceed = true;
    }
    else {
        if (wsdlInputs[1] === "POST") {
            if (!wsdlInputs[3]) error = ["reqHeader"];
            else if (!wsdlInputs[5]) error = ["reqBody"];
            else proceed = true;
        } else proceed = true;
    }

    return [error, auth, proceed];
}

function getWSTestCase (stepNo, appType, input, keyword) {
    return {
        "stepNo": stepNo + 1, "appType": appType, "objectName": "", "inputVal": [input],
        "keywordVal": keyword, "outputVal": "", "url": "", "custname": "", "remarks": [""],
        "addTestCaseDetails": "", "addTestCaseDetailsInfo": ""
    }
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