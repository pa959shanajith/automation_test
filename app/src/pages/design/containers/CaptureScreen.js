import { React, useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux"
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import '../styles/CaptureScreen.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import ActionPanel from '../components/ActionPanelObjects';
import { ScrapeData, disableAction, disableAppend, actionError, WsData, wsdlError } from '../designSlice';
// import { userInfo } from '../../landing/LandingSlice';
import * as scrapeApi from '../api';
import { Messages as MSG } from '../../global/components/Messages';
import { v4 as uuid } from 'uuid'; 
import{ScreenOverlay } from '../../global';
// import * as actionTypes from '../state/action';

// dispatch(ScrapeData(payloadvalue))


const CaptureModal = (props) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [showCaptureData, setShowCaptureData] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const [isInsprintHovered, setIsInsprintHovered] = useState(false);
  const [isUpgradeHovered, setIsUpgradeHovered] = useState(false);
  const [isPdfHovered, setIsPdfHovered] = useState(false);
  const [isCreateHovered, setIsCreateHovered] = useState(false);
  const [currentDialog, setCurrentDialog] = useState(false);
  const [rowClick, setRowClick] = useState(true);
  const [selectedSpan, setSelectedSpan] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [scrapeItems, setScrapeItems] = useState([]);
  const [newScrapedData, setNewScrapedData] = useState({});
  const [scrapedURL, setScrapedURL] = useState("");
  const [mirror, setMirror] = useState({ scrape: null, compare: null });
  const [orderList, setOrderList] = useState([]);
  const [saved, setSaved] = useState({ flag: true });
  const [mainScrapedData, setMainScrapedData] = useState({});
  const [captureButton, setCaptureButton] = useState("chrome");
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [captureData, setCaptureData] = useState([]);
  const[endScrape,setEndScrape]=useState(false)
  const [showObjModal, setShowObjModal] = useState(false);
  const userInfo = useSelector((state) => state.landing.userinfo);
  const [showPop, setShowPop] = useState("");
  const [capturedDataToSave, setCapturedDataToSave] = useState([]);
  const [newScrapedCapturedData, setNewScrapedCapturedData] = useState([]);
  const [masterCapture, setMasterCapture] = useState(false);





  const imageRef1 = useRef(null);
  const imageRef2 = useRef(null);
  const imageRef3 = useRef(null);
  const imageRef4 = useRef(null);

  const [cardPosition, setCardPosition] = useState({ left: 0, right: 0, top: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  console.log(isHovered);

  console.log(userInfo);
useEffect(()=>{
  fetchScrapeData()
},[])
 useEffect(()=>{
  if(endScrape)
  fetchScrapeData();
  setEndScrape(false)
 },[endScrape])

  const togglePanel = () => {
    setShowPanel(!showPanel);
  };

  const handleMouseEnter = (val) => {
    if (val === 'insprint') {
      const rect = imageRef1.current.getBoundingClientRect();
      setCardPosition({ right: rect.right, left: rect.left, top: rect.top });
      setIsInsprintHovered(true);
      setIsUpgradeHovered(false);
      setIsPdfHovered(false);
    }
    else if (val === 'upgrade') {
      const rect = imageRef2.current.getBoundingClientRect();
      setCardPosition({ right: rect.right, top: rect.top });
      setIsUpgradeHovered(true);
      setIsInsprintHovered(false);
      setIsPdfHovered(false);
    }
    else if (val === 'pdf') {
      setIsInsprintHovered(false);
      setIsUpgradeHovered(false);
      const rect = imageRef3.current.getBoundingClientRect();
      setCardPosition({ right: rect.right, top: rect.top });
      setIsPdfHovered(true);
    }
    else {
      setIsInsprintHovered(false);
      setIsUpgradeHovered(false);
      setIsPdfHovered(false);
      const rect = imageRef4.current.getBoundingClientRect();
      setCardPosition({ right: rect.right, top: rect.top });
      setIsCreateHovered(true);
    }
  };

  const handleMouseLeave = (val) => {
    if (val === 'insprint') {
      setIsInsprintHovered(false);
    }
    else if (val === 'upgrade') {
      setIsUpgradeHovered(false);
    }
    else if (val === 'pdf') {
      setIsPdfHovered(false);
    }
    else {
      setIsCreateHovered(false);
    }
  };



  const handleDialog = (id) => {
    setCurrentDialog(id);
  };

  const handleClose = () => {
    setCurrentDialog(null);
  };

  const handleSelectionChange = (e) => {
    setSelectedRow(e.value);
  };

  const handleAddMore = (id) => {
    if (id === 'add more') {
      setVisible(id);
    }
    else if (id === 'capture') {
      setVisible(id);
    }
  }


  const handleBrowserClose = () =>{
      setVisible(false);
  }


  const rowClassName = (rowData) => {
    return selectedRow === rowData ? 'selected-row' : '';
  };

  const handleEdit = () => {
    // Handle edit logic
  };

  const handleDelete = () => {
    // Handle delete logic
  };

  // const handleRowHover = (rowData) => {
  //   const rowIndex = rowData.index
  //   console.log(rowData.index);
  //   setHoveredRow(rowIndex);
  // };


  // const handleMouseEnterRow = (rowData) => {
  //   console.log("mouse entered")
  //   console.log(rowData.index);
  //   const rowIndex = rowData.index
  //   setHoveredRow(rowIndex);
  // };

  // const handleMouseLeaveRow = () => {
  //   setHoveredRow(false);
  // };

  // const renderActionsCell = (rowData) => {

  //   // const handleEdit = () => {
  //   //   // Handle edit logic
  //   // };

  //   // const handleDelete = () => {
  //   //   // Handle delete logic
  //   // };
  //   console.log(rowData)

  //   return (
  //     <div
  //       className="actions-cell"
  //     // onMouseEnter={() => setIsHovered(true)}
  //     // onMouseLeave={() => setIsHovered(false)}
  //     >



  //         <>
  //           <img src='static/imgs/ic-edit.png' className='edit__icon' onClick={() => handleEdit(rowData)} />
  //           <img src='static/imgs/ic-delete-bin.png' className='delete__icon' onClick={() => handleDelete(rowData)} />
  //         </>

  //     </div>
  //   );
  // };



  // const renderEditDelete = (rowData) => {
  //   if (rowData.data) {
  //     return (
  //       <>
  //         <Button
  //           icon="pi pi-pencil"
  //           className="p-button-rounded p-button-secondary"
  //         />
  //         <Button
  //           icon="pi pi-trash"
  //           className="p-button-rounded p-button-danger"
  //         />
  //       </>
  //     );
  //   }
  //   return null;
  // };



  // const renderRowReorderIcon = (rowData) => {
  //   const isChecked = selectedRows.some((selectedRow) => selectedRow === rowData);

  //   if (isChecked) {
  //     return <i className="pi pi-bars"></i>;
  //   }

  //   return null;
  // };

  const handleRowReorder = (event) => {
    setCaptureData(event.value);
  };

  const handleSpanClick = (index) => {
    if (selectedSpan === index) {
      setSelectedSpan(null);
    } else {
      setSelectedSpan(index);
    }
  };


  const onSave = (e, confirmed) => {
       
    let continueSave = true;
    
    // if (mainScrapedData.reuse && !confirmed) {
    //     setShowConfirmPop({'title': "Save Scraped data", 'content': 'Screen has been reused. Are you sure you want to save scrape objects?', 'onClick': ()=>{setShowConfirmPop(false); onSave(null, true);}})
    //     return;
    // }

    let dXpath = false;
    let dCustname = false;
    let uniqueCusts = [];
    let uniqueXPaths = [];
    let dCusts = [];
    let dCusts2 = [];
    let scrapeItemsL = [...capturedDataToSave];

    if (scrapeItemsL.length > 0) {
        for (let scrapeItem of scrapeItemsL) {
            if (uniqueCusts.includes(scrapeItem.title)) {
                dCustname = true;
                scrapeItem.duplicate = true;
                dCusts.push(scrapeItem.title);
            }
            else {
                scrapeItem.duplicate = false;
                uniqueCusts.push(scrapeItem.title);
            }
        }
        if (!dCustname) {
            for (let scrapeItem of scrapeItemsL) {
                if (scrapeItem.xpath === "" || scrapeItem.xpath === undefined) continue;
                let xpath = scrapeItem.xpath;

                if (props.appType === 'MobileWeb') xpath = xpath.split(";")[2];

                if (uniqueXPaths.includes(xpath)) {
                    dXpath = true;
                    scrapeItem.duplicate = true;
                    dCusts2.push(scrapeItem.title);
                }
                else {
                    scrapeItem.duplicate = false;
                    uniqueXPaths.push(xpath);
                }
            }
        }

        // if (dCustname) {
        //     continueSave = false;
        //     setShowPop({
        //         'type': 'modal',
        //         'title': 'Save Scrape data',
        //         'content': <div className="ss__dup_labels">
        //             Please rename/delete duplicate scraped objects
        //             <br/><br/>
        //             Object characterstics are same for:
        //             {/* <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)"> */}
        //                 <div className="ss__dup_scroll">
        //                 { dCusts.map((custname, i) => <span key={i} className="ss__dup_li">{custname}</span>) }
        //                 </div>
        //             {/* </ScrollBar> */}
        //         </div>,
        //         'footer': <button onClick={()=>setShowPop("")}>OK</button>
        //     })
        // } else if (dXpath) {
        //     continueSave = false;
        //     setShowConfirmPop({
        //         'title': 'Save Scrape data',
        //         'content': <div className="ss__dup_labels">
        //             Object characteristics are same for the below list of objects:
        //             {/* <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)"> */}
        //                 <div className="ss__dup_scroll">
        //                 { dCusts2.map((custname, i) => <span key={i} className="ss__dup_li">{custname}</span>) }
        //                 </div>
        //             {/* </ScrollBar> */}
        //             <br/>
        //             Do you still want to continue?
        //         </div>,
        //         'onClick': ()=>{setShowConfirmPop(false); saveScrapedObjects();},
        //         'continueText': "Continue",
        //         'rejectText': "Cancel"
        //     })
        // }
    }

    if (continueSave) saveScrapedObjects();
}


  const fetchScrapeData = () => {
    return new Promise((resolve, reject) => {
      setOverlay("Loading...");

      let viewString = capturedDataToSave;
      let haveItems = viewString.length !== 0;


      // setCapturedDataToSave(viewString);
      // (type, screenId, projectId, testCaseId:optional)
      scrapeApi.getScrapeDataScreenLevel_ICE("web", props.fetchingDetails["_id"], props.fetchingDetails.projectID, "")
        .then(data => {
          // current_task.subTask === "Scrape" (not sure !!)
          if (data.scrapedurl) setScrapedURL(data.scrapedurl);

          if (data === "Invalid Session") return null;
          else if (typeof data === "object" && props.appType !== "Webservice") {
            haveItems = data.view.length !== 0;
            let [newScrapeList, newOrderList] = generateScrapeItemList(0, data);

            setMainScrapedData(data);
            if(capturedDataToSave.length===0)setCapturedDataToSave([...capturedDataToSave,...newScrapeList]);
            setMirror({ scrape: data.mirror, compare: null });
            setNewScrapedData([]);
            setScrapeItems(newScrapeList);
            // setHideSubmit(!haveItems);
            setSaved({ flag: true });
            setOrderList(newOrderList);
            setOverlay("");
            dispatch(disableAction(haveItems));
            dispatch(disableAppend(!haveItems));
          }
          else if (typeof data === "object" && props.appType === "Webservice") {
            haveItems = data.endPointURL && data.method;
            if (haveItems) {

              let localReqBody = "";
              if (data.body) localReqBody = getProcessedBody(data.body, 'fetch');

              let localRespBody = "";
              if (data.responseBody) localRespBody = getProcessedBody(data.responseBody, 'fetch');

              dispatch(WsData({
                endPointURL: data.endPointURL,
                method: data.method,
                opInput: data.operations || "",
                reqHeader: data.header ? data.header.split("##").join("\n") : "",
                reqBody: localReqBody,
                paramHeader: data.param ? data.param.split("##").join("\n") : "",
                respHeader: data.responseHeader ? data.responseHeader.split("##").join("\n") : "",
                respBody: localRespBody
              }));
              setSaved({ flag: true });
              // setHideSubmit(false);
            } else {
              setSaved({ flag: false });
              // setHideSubmit(true);
              dispatch(WsData({
                endPointURL: "", method: "0", opInput: "", reqHeader: "",
                reqBody: "", respHeader: "", respBody: "", paramHeader: "",
              }));
            }
            setOverlay("");
            dispatch(disableAppend(!haveItems));
            dispatch(disableAction(haveItems));
            dispatch(actionError([]));
            dispatch(wsdlError([]));
          }
          else {
            dispatch(disableAction(haveItems));
            dispatch(disableAppend(!haveItems));
            setOverlay("");
            // screenshot
          }
          resolve("success");
          let newData = viewString.length>0?viewString.map((item) => {
            return (
                {
                  selectall: item.custname,
                  objectproperty: item.tag,
                  browserscrape: 'google chrome',
                  screenshots: 'view',
                  actions: '',
                }
              )}):data.view.map((item) => {
                return (
                    {
                      selectall: item.custname,
                      objectproperty: item.tag,
                      browserscrape: 'google chrome',
                      screenshots: 'view',
                      actions: '',
                    }
                  )})
          setCaptureData(newData);
          console.log(newData);
        })
        .catch(error => {
          dispatch(disableAction(haveItems));
          dispatch(disableAppend(!haveItems));
          console.error("error", error);
          setOverlay("");
          reject("fail")
        })
    });
  }


  const saveScrapedObjects = () => {
    let scrapeItemsL = [...capturedDataToSave];
    let added = Object.keys(newScrapedCapturedData).length ? { ...newScrapedCapturedData } : { ...mainScrapedData };
    let views = [];
    let orderList = [];
    // let modifiedObjects = Object.values(modified);

    for (let scrapeItem of scrapeItemsL) {
        if (!scrapeItem.objId) {
            if (scrapeItem.isCustom) views.push({custname: scrapeItem.title, xpath: scrapeItem.xpath, tag: scrapeItem.tag, tempOrderId: scrapeItem.tempOrderId});
            else views.push({...newScrapedCapturedData.view[scrapeItem.objIdx], custname: scrapeItem.title, tempOrderId: scrapeItem.tempOrderId});
            orderList.push(scrapeItem.tempOrderId);
        }
        else orderList.push(scrapeItem.objId);
    }
    
    let params = {
        'deletedObj': [],
        'modifiedObj': [],
        'addedObj': {...added, view: views},
        'screenId': props.fetchingDetails["_id"],
        'userId': userInfo.user_id,
        'roleId': userInfo.role,
        'param': 'saveScrapeData',
        'orderList': orderList
    }

    scrapeApi.updateScreen_ICE(params)
    .then(response => {
        if (response === "Invalid Session") return null;
        else fetchScrapeData().then(resp=>{
            if (resp === 'success' || typeof(resp) === "object"){
                typeof(resp)==="object" && resp.length>0 
                ? <div className="ss__dup_labels">
                                Scraped data saved successfully.
                                <br/><br/>
                                <strong>Warning: Please scrape an IRIS reference object.</strong>
                                <br/><br/>
                                Matching objects found for:
                                {/* <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)"> */}
                                <div className="ss__dup_scroll">
                                { resp.map((custname, i) => <span key={i} className="ss__dup_li">{custname}</span>) }
                                </div>
                                {/* </ScrollBar> */}
                            </div>
                : <div>Scraped Data saved successfull</div>;
                let numOfObj = scrapeItemsL.length;
                // setDisableBtns({save: true, delete: true, edit: true, search: false, selAll: numOfObj===0, dnd: numOfObj===0||numOfObj===1 });
            } else console.error(resp);
        })
        .catch(error => console.error(error));
    })
    .catch(error => console.error(error))
}

  const startScrape = (browserType, compareFlag, replaceFlag) => {
    let screenViewObject = {};
    let blockMsg = 'Scraping in progress. Please Wait...';
    if (compareFlag) {
      blockMsg = 'Comparing objects in progress...';
    };
    if (replaceFlag) {
      blockMsg = 'Scrape and Replace Object in progress...';
    };
    screenViewObject = getScrapeViewObject("web", browserType, compareFlag, replaceFlag, mainScrapedData, newScrapedData);
    setOverlay(blockMsg);
    scrapeApi.initScraping_ICE(screenViewObject)
      .then(data => {
        if(capturedDataToSave.length!==0 && masterCapture){
          let added = Object.keys(newScrapedCapturedData).length ? { ...newScrapedCapturedData } : { ...mainScrapedData };
            let deleted=capturedDataToSave.map(item=>item.objId);
            setCaptureData([]);
            setCapturedDataToSave([]);
         let params = {
                    'deletedObj': deleted,
                    'modifiedObj':[],
                    'addedObj': {...added, view: []},
                    'screenId': props.fetchingDetails["_id"],
                    'userId': userInfo.user_id,
                    'roleId': userInfo.role,
                    'param': 'saveScrapeData',
                    'orderList': []
                }
                scrapeApi.updateScreen_ICE(params)
                .then(response => {
               console.log('done')})
               .catch(error=>console.log(error))
              }
        let err = null;
        setOverlay("");
        console.log(data);
        // ResetSession.end();
        if (data === "Invalid Session") return null;
        else if (data === "Response Body exceeds max. Limit.")
          err = { 'variant': 'Scrape Screen', 'content': 'Scraped data exceeds max. Limit.' };
        else if (data === 'scheduleModeOn' || data === "unavailableLocalServer") {
          let scrapedItemsLength = scrapeItems.length;
          if (scrapedItemsLength > 0) dispatch(disableAction(true));
          else dispatch(disableAction(false));
          setSaved({ flag: false });
          // err = {
          //     'VARIANT':  data === 'scheduleModeOn'?MSG.GENERIC.WARN_UNCHECK_SCHEDULE.VARIANT:MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.VARIANT, 'CONTENT':
          //         data === 'scheduleModeOn' ?
          //             MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT :
          //             MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.CONTENT
          // };
        } else if (data === "fail")
          err = MSG.SCRAPE.ERR_SCRAPE;
        else if (data === "Terminate") {
          setOverlay("");
          err = MSG.SCRAPE.ERR_SCRAPE_TERMINATE;
        }
        else if (data === "wrongWindowName")
          err = MSG.SCRAPE.ERR_WINDOW_NOT_FOUND;
        else if (data === "ExecutionOnlyAllowed")
          err = MSG.GENERIC.WARN_EXECUTION_ONLY;

        if (err) {
          // setMsg(err);
          return false;
        }

        let viewString = data;
        // fetchScrapeData();

        if (viewString.view.length !== 0) {
          let lastIdx = newScrapedData.view ? newScrapedData.view.length : 0;

          let [scrapeItemList, newOrderList] = generateScrapeItemList(lastIdx, viewString, "new");

          let updatedNewScrapeData = { ...newScrapedData };
          if (updatedNewScrapeData.view) {
            let viewArr = [...updatedNewScrapeData.view]
            viewArr.push(...viewString.view);
            updatedNewScrapeData = { ...viewString, view: viewArr };
          }
          else updatedNewScrapeData = viewString;

          setNewScrapedData(updatedNewScrapeData);
          setNewScrapedCapturedData(updatedNewScrapeData);
          masterCapture?setCapturedDataToSave([...scrapeItemList]):setCapturedDataToSave([...capturedDataToSave,...scrapeItemList])
          updateScrapeItems(scrapeItemList);
          setScrapedURL(updatedNewScrapeData.scrapedurl);
          setMirror({ scrape: viewString.mirror, compare: null });
          setOrderList(oldOrderList => [...oldOrderList, ...newOrderList]);

          if (viewString.view.length > 0) setSaved({ flag: false });
          setEndScrape(true)

          
        }
      })
      .catch(error => {
        setOverlay("");
        // ResetSession.end();
        // setMsg(MSG.SCRAPE.ERR_SCRAPE);
        console.error("Fail to Load design_ICE. Cause:", error);
      });
    
  }

 

  

  const updateScrapeItems = newList => {
    setScrapeItems([...scrapeItems, ...newList])
  }


  const footerCapture = (
    <div className='footer__capture'>
      {/* <Button className='btn_clr'>Clear</Button> */}
      <Button className='btn_capture' onMouseDownCapture={() =>{setVisible(false);startScrape(captureButton);}}>Capture</Button>
      {/* {console.log("Capture btn is clicked")} */}
    </div>
  )

  const footerAddMore = (
    <div className='footer__addmore'>
      {/* <Button className='btn_clr'>Clear</Button> */}
      <Button className='btn_capture' onMouseDownCapture={() => {setVisible(false);startScrape(captureButton)}}>Capture</Button>
    </div>
  );

  const headerTemplate = (
    <>
      <div>
        <h5 className='dailog_header1'>Capture Elements</h5>
        <h4 className='dailog_header2'>Signup screen 1</h4>
        <img className="screen_btn" src="static/imgs/ic-screen-icon.png" />
        {/* <Button onclick={startScrape(captureButton)}>Hello</Button> */}
        {captureData.length > 0 ? <div className='Header__btn'>
          <button className='add__more__btn' onClick={() => {setMasterCapture(false);handleAddMore('add more')}}>Add More</button>
          <button className='btn_panel' onClick={togglePanel}>Action Panel</button>
          <button className="btn-capture" onClick={() => {setMasterCapture(true);handleAddMore('capture')}}>Capture Objects</button>
        </div> : <button className='btn_panel__single' onClick={togglePanel}>Action Panel</button>}
      </div>
    </>
  );

  const emptyMessage = (
    <div>
      <img className="not_captured_ele" src="static/imgs/ic-capture-notfound.png" alt="No data available" />
      <p className="not_captured_message">Not Captured</p>
      <button className="btn-capture-single" onClick={() => handleAddMore('add more')}>Capture Objects</button>
    </div>
  );

  const footerSave = (
    <Button small label='Save' onClick={onSave}></Button>
  )




  return (
    <>
     { overlay && <ScreenOverlay content={overlay} />}
      <Dialog className='dailog_box' header={headerTemplate} position='right' visible={props.visibleCaptureElement} style={{ width: '73vw', color: 'grey', height: '95vh', margin: 0 }} onHide={() => props.setVisibleCaptureElement(false)} footer={footerSave}>
        {showPanel && (<div className="card_modal">
          <Card className='panel_card'>
            <div className="action_panelCard">
              <div className='insprint__block'>
                <span className='insprint_auto' onClick={() => handleDialog('addObject')}>
                  <img className='add_obj' title="add object" src="static/imgs/ic-add-object.png"></img>
                  <p>Add Element</p>
                </span>
                <span className='insprint_auto'>
                  <img className='map_obj' title='map object' src="static/imgs/ic-map-object.png" onClick={() => handleDialog('mapObject')}></img>
                  <p>Map Element</p>
                </span>
                <p className='insprint__text'>In Sprint Automation</p>
                <img className='info__btn' ref={imageRef1} onMouseEnter={() => handleMouseEnter('insprint')} onMouseLeave={() => handleMouseLeave('insprint')} src="static/imgs/info.png"></img>
                {isInsprintHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 100}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>InSprint Automation</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)}
              </div>
              <div className='upgrade__block'>
                <span className='upgrade_auto'>
                  <img className='add_obj' src="static/imgs/ic-compare.png" onClick={() => handleDialog('compareObject')}></img>
                  <p>Compare Element</p>
                </span>
                <span className='upgrade_auto'>
                  <img className='map_obj' src="static/imgs/ic-replace.png" onClick={() => handleDialog('replaceObject')}></img>
                  <p>Replace Element</p>
                </span>
                <p className='insprint__text'>Upgrade Analyzer</p>
                <img className='info__btn' ref={imageRef2} onMouseEnter={() => handleMouseEnter('upgrade')} onMouseLeave={() => handleMouseLeave('upgrade')} src="static/imgs/info.png"></img>
                {isUpgradeHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 400}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Upgrade Analyzer</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a href='docs.avoautomation.com'>Learn More</a>
                </div>)}
              </div>
              <div className='utility__block'>
                <span className='insprint_auto'>
                  <img className='add_obj' src="static/imgs/ic-pdf-utility.png"></img>
                  <p>PDF Utility</p>
                </span>
                <p className='insprint__text'>Capture from PDF</p>
                <img className='info__btn' ref={imageRef3} onMouseEnter={() => handleMouseEnter('pdf')} onMouseLeave={() => handleMouseLeave('pdf')} src="static/imgs/info.png"></img>
                {isPdfHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 700}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Capture from PDF</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)}
              </div>
              <div className='utility__block'>
                <span className='insprint_auto create__block'>
                  <img className='map_obj' src="static/imgs/ic-create-object.png" onClick={() => handleDialog('createObject')}></img>
                  <p>Create Element</p>
                </span>
                <p className='insprint__text'>Create Manually</p>
                <img className='info__btn' ref={imageRef4} onMouseEnter={() => handleMouseEnter()} onMouseLeave={() => handleMouseLeave()} src="static/imgs/info.png"></img>
                {isCreateHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 950}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Create Manually</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)}
              </div>
              <div className='imp_exp__block'>
                <span className='insprint_auto'>
                  <span className='import__block'>
                    <img className='add_obj' src="static/imgs/ic-import.png" />
                    <p className='imp__text'>Import Screen</p>
                  </span>
                  <span className='export__block'>
                    <img className='add_obj' src="static/imgs/ic-export.png" />
                    <p className='imp__text'>Export Screen</p>
                  </span>
                </span>
              </div>
            </div>
          </Card>
        </div>)}
        <div className="card-table">

          <DataTable className='datatable__col' value={captureData} dragHandleIcon="pi pi-bars" rowReorder resizableColumns reorderableRows onRowReorder={handleRowReorder} showGridlines selectionMode={"multiple"} selection={selectedRow} onSelectionChange={handleSelectionChange} tableStyle={{ minWidth: '50rem' }} headerCheckboxToggleAllDisabled={false} emptyMessage={emptyMessage}>
            {/* <Column style={{ width: '3em' }} body={renderRowReorderIcon} /> */}
            <Column rowReorder style={{ width: '3rem' }} />
            <Column headerStyle={{ width: '3rem' }} selectionMode='multiple'></Column>
            <Column field="selectall" header="Select all"></Column>
            <Column field="objectProperty" header="ObjectProperty"></Column>
            <Column field="browserscrape" header="Browser Scraped On"></Column>
            <Column field="screenshots" header="Screenshots"></Column>
            <Column field="actions" header="Actions" />
          </DataTable>
        </div>
      </Dialog>
      <Dialog className={visible === 'capture' ? "compare__object__note" : "compare__object__modal"} header="Capture Object:Sign up screen 1" style={{ height: "21.06rem", width: "24.06rem" }} visible={visible === 'capture'} onHide={handleBrowserClose} footer={visible === 'capture' ? footerCapture : footerAddMore}>
        <div className={visible === 'capture' ? "compare__content__adj" : "compare__object"}>
          <span className='compare__btn'>
            <p className='compare__text'>List of Browsers</p>
          </span>
          <span className='browser__col'>
            <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/ic-explorer.png' onClick={() => { startScrape(selectedSpan) }}></img>Internet Explorer {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(2)} className={selectedSpan === 2 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/chrome.png' />Google Chrome {selectedSpan === 2 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(3)} className={selectedSpan === 3 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png' />Mozilla Firefox {selectedSpan === 3 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(4)} className={selectedSpan === 4 ? 'browser__col__selected' : 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png' />Microsoft Edge {selectedSpan === 4 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
          </span>
        </div>
        {visible === 'capture' && <div className='recapture__note'><img className='not__captured' src='static/imgs/not-captured.png' /><span style={{ paddingLeft: "0.2rem" }}><strong>Note :</strong>This will completely refresh all Captured Objects on the screen. In case you want Capture only additional elements use the "Add More" option</span></div>}
      </Dialog>
      <Dialog className={"compare__object__modal"} header="Capture Object:Sign up screen 1" style={{ height: "21.06rem", width: "24.06rem" }} visible={visible === 'add more'} onHide={handleBrowserClose} footer={footerAddMore}>
        <div className={"compare__object"}>
          <span className='compare__btn'>
            <p className='compare__text'>List of Browsers</p>
          </span>
          <span className='browser__col'>
            <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/ic-explorer.png' onClick={() => { startScrape(selectedSpan) }}></img>Internet Explorer {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(2)} className={selectedSpan === 2 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/chrome.png' />Google Chrome {selectedSpan === 2 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(3)} className={selectedSpan === 3 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png' />Mozilla Firefox {selectedSpan === 3 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(4)} className={selectedSpan === 4 ? 'browser__col__selected' : 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png' />Microsoft Edge {selectedSpan === 4 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
          </span>
        </div>
      </Dialog>
      {currentDialog === 'addObject' && <ActionPanel isOpen={currentDialog} OnClose={handleClose} />}
      {currentDialog === 'mapObject' && <ActionPanel isOpen={currentDialog} OnClose={handleClose} />}
      {currentDialog === 'replaceObject' && <ActionPanel isOpen={currentDialog} OnClose={handleClose} />}
      {currentDialog === 'createObject' && <ActionPanel isOpen={currentDialog} OnClose={handleClose} />}
      {currentDialog === 'compareObject' && <ActionPanel isOpen={currentDialog} OnClose={handleClose} />}
    </>
  );
}


export default CaptureModal;


function getScrapeViewObject(appType, browserType, compareFlag, replaceFlag, mainScrapedData, newScrapedData) {
  let screenViewObject = {};
  //For PDF
  if (browserType === "pdf") {
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
      screenViewObject.ipAddress = browserType.uuid;
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
    } else if (replaceFlag) {
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
      let viewString = Object.keys(newScrapedData).length ? { ...newScrapedData, view: [...mainScrapedData.view, ...newScrapedData.view] } : { ...mainScrapedData };
      screenViewObject.viewString = { ...viewString, view: viewString.view.filter(object => object.xpath.substring(0, 4) !== "iris") };
      screenViewObject.action = "compare";
    } else if (replaceFlag) {
      screenViewObject.action = "replace";
    }
    screenViewObject.browserType = browserType;
  }

  return screenViewObject;
}
//  useEffect(()=>{
//     startScrape(captureButton)
//  },[isHovered])


function generateScrapeItemList(lastIdx, viewString, type = "old") {
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
    let scrapeItem = {
      objId: scrapeObject._id,
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
    }
    if (scrapeObject.fullSS != undefined && !scrapeObject.fullSS && scrapeObject.viewTop != undefined) {
      scrapeItem['viewTop'] = scrapeObject.viewTop;
    }


    if (type === "new") scrapeItem.tempOrderId = newUUID;
    if (scrapeObject.hasOwnProperty('editable') || scrapeObject.cord) {
      scrapeItem.editable = true;
    } else {
      let isCustom = scrapeObject.xpath === "";
      scrapeItem.isCustom = isCustom;
    };

    if (scrapeItem.objId) {
      orderDict[scrapeItem.objId] = scrapeItem;
    }
    else orderDict[scrapeItem.tempOrderId] = scrapeItem;

    if (!orderList.includes(scrapeItem.objId)) resetOrder = true;

    lastIdx++;
  }

  if (orderList && orderList.length && !resetOrder)
    orderList.forEach(orderId => orderDict[orderId] ? localScrapeList.push(orderDict[orderId]) : console.error("InConsistent OrderList Found!"))
  else {
    localScrapeList = Object.values(orderDict);
    orderList = Object.keys(orderDict);
  }

  return [localScrapeList, orderList];
}


function getProcessedBody(body, type) {
  let processedBody = body;
  if (body.indexOf("{") === 0 || body.indexOf("[") === 0)
    processedBody = JSON.stringify(JSON.parse(body), null, '\t');
  else
    // processedBody = formatXml(body.replace(/>\s+</g, '><'));

    if (type === 'scrape')
      processedBody = processedBody.replace(/\&gt;/g, '>').replace(/\&lt;/g, '<');
    else if (type === 'fetch' && processedBody === '\r\n')
      processedBody = '';

  return processedBody;
}
