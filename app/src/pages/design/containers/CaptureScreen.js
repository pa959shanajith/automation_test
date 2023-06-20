import { React, useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux"
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import '../styles/CaptureScreen.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import ActionPanel from '../components/ActionPanelObjects';
import { ScrapeData, disableAction, disableAppend, actionError, WsData, wsdlError, objValue } from '../designSlice';
import * as scrapeApi from '../api';
import { Messages as MSG } from '../../global/components/Messages';
import { v4 as uuid } from 'uuid';
import { ScreenOverlay } from '../../global';
import ImportModal from '../../design/containers/ImportModal';
import ExportModal from '../../design/containers/ExportModal';
// import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";



const CaptureModal = (props) => {
  const toast = useRef(null);
  const dispatch = useDispatch();
  const objValues = useSelector(state => state.design.objValue);
  const [visible, setVisible] = useState(false);
  const [showCaptureData, setShowCaptureData] = useState([]);
  const [showPanel, setShowPanel] = useState(true);
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
  const [screenshotData, setScreenshotData] = useState([]);
  const [endScrape, setEndScrape] = useState(false)
  const [showObjModal, setShowObjModal] = useState(false);
  const userInfo = useSelector((state) => state.landing.userinfo);
  const [showPop, setShowPop] = useState("");
  const [capturedDataToSave, setCapturedDataToSave] = useState([]);
  const [newScrapedCapturedData, setNewScrapedCapturedData] = useState([]);
  const [masterCapture, setMasterCapture] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [screenshotY, setScreenshotY] = useState(null);
  const [mirrorHeight, setMirrorHeight] = useState("0px");
  const [dsRatio, setDsRatio] = useState(1);
  const [highlight, setHighlight] = useState(false);
  const appType = props.appType;
  const [imageHeight, setImageHeight] = useState(0);
  const [activeEye, setActiveEye] = useState(false);
  const [modified, setModified] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
   //element properties states 
   const[elementPropertiesUpdated,setElementPropertiesUpdated]=useState(false)
   const[elementPropertiesVisible,setElementProperties]=useState(false);
   const[elementValues,setElementValues]=useState([])
   const[isIdentifierVisible,setIsIdentifierVisible]=useState(false)
   const[regex,setRegex]=useState("")
   const[moveCardUp,setMoveCardUp]=useState(false)
   const[cardBottom,setCardBottom]=useState(null)
   const defaultIdentifier=[{id:1,identifier:'xpath',name:'Absolute X-Path '},{id:2,identifier:'id',name:'ID Attribute'},{id:3,identifier:'rxpath',name:'Relative X-Path'},{id:4,identifier:'name',name:'Name Attribute'},{id:5,identifier:'classname',name:'Classname Attribute'},{id:6,identifier:'cssselector',name:'CSS Selector'},{id:7,identifier:'href',name:'Href Attribute'},{id:8,identifier:'label',name:'Label'}]
   const defaultNames={xpath:'Absolute X-Path',id:'ID Attribute',rxpath:'Relative X path',name:'Name Attribute',classname:'Classname Attribute',cssselector:'CSS Selector',href:'Href Attribute',label:'Label'}




  const imageRef1 = useRef(null);
  const imageRef2 = useRef(null);
  const imageRef3 = useRef(null);
  const imageRef4 = useRef(null);

  const [cardPosition, setCardPosition] = useState({ left: 0, right: 0, top: 0 });
  const [selectedCapturedElement, setSelectedCapturedElement] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchScrapeData()
  }, [])
  useEffect(() => {
    if (endScrape||elementPropertiesUpdated){
      fetchScrapeData();
      setEndScrape(false)
      setElementPropertiesUpdated(false)
    }
  }, [endScrape,elementPropertiesUpdated])

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

  const onRowClick = (e) => {
    setSelectedCapturedElement(e.value);
  };

  const handleAddMore = (id) => {
    if (id === 'add more') {
      setVisible(id);
    }
    else if (id === 'capture') {
      setVisible(id);
    }
  }


  const handleBrowserClose = () => {
    setVisible(false);
  }



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

    if (true) saveScrapedObjects();
  }


  const fetchScrapeData = () => {
    return new Promise((resolve, reject) => {
      setOverlay("Loading...");

      let viewString = capturedDataToSave;
      let haveItems = viewString.length !== 0;
      let newlyScrapeList = [];

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

            newlyScrapeList = newScrapeList;

            setMainScrapedData(data);
            if (capturedDataToSave.length === 0) setCapturedDataToSave([...capturedDataToSave, ...newScrapeList]);
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
          let newData = (viewString.length > 0 && !elementPropertiesUpdated)? viewString.map((item) => {
            return (
              {
                selectall: item.custname,
                objectProperty: item.tag,
                screenshots: <span className="btn__screenshot" onClick={() => {
                  setScreenshotData({
                    header: item.custname,
                    imageUrl: mirror.scrape || "",
                    enable: true
                  });
                  onHighlight();
                }}>View Screenshot</span>,
                actions: '',
                objectDetails: item

              }
            )
          }) : newlyScrapeList.map((item) => {
            return (
              {
                selectall: item.custname,
                objectProperty: item.tag,
                browserscrape: 'google chrome',
                screenshots: <span className="btn__screenshot" onClick={() => {
                  setScreenshotData({
                    header: item.custname,
                    imageUrl: data.mirror || "",
                    enable: true
                  }); onHighlight();
                }}>View Screenshot</span>,
                actions: '',
                objectDetails: item
              }
            )
          })
          setCaptureData(newData);
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
  // {console.log(captureData[0].selectall)}

  const saveScrapedObjects = () => {
    let scrapeItemsL = [...capturedDataToSave];
    let added = Object.keys(newScrapedCapturedData).length ? { ...newScrapedCapturedData } : { ...mainScrapedData };
    let views = [];
    let orderList = [];
    let modifiedObjects = modified;

    for (let scrapeItem of scrapeItemsL) {
      if (!scrapeItem.objId) {
        if (scrapeItem.isCustom) views.push({ custname: scrapeItem.title, xpath: scrapeItem.xpath, tag: scrapeItem.tag, tempOrderId: scrapeItem.tempOrderId });
        else views.push({ ...newScrapedCapturedData.view[scrapeItem.objIdx], custname: scrapeItem.title, tempOrderId: scrapeItem.tempOrderId });
        orderList.push(scrapeItem.tempOrderId);
      }
      else orderList.push(scrapeItem.objId);
    }

    let params = {
      'deletedObj': [],
      'modifiedObj': modifiedObjects,
      'addedObj': { ...added, view: views },
      'screenId': props.fetchingDetails["_id"],
      'userId': userInfo.user_id,
      'roleId': userInfo.role,
      'param': 'saveScrapeData',
      'orderList': orderList
    }

    scrapeApi.updateScreen_ICE(params)
      .then(response => {
        if (response === "Invalid Session") return null;
        else fetchScrapeData().then(resp => {
          if (resp === 'success' || typeof (resp) === "object") {
            typeof (resp) === "object" && resp.length > 0
              ? <div className="ss__dup_labels">
                Scraped data saved successfully.
                <br /><br />
                <strong>Warning: Please scrape an IRIS reference object.</strong>
                <br /><br />
                Matching objects found for:
                {/* <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)"> */}
                <div className="ss__dup_scroll">
                  {resp.map((custname, i) => <span key={i} className="ss__dup_li">{custname}</span>)}
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
    let blockMsg = 'Capturing in progress. Please Wait...';
    if (compareFlag) {
      blockMsg = 'Comparing objects in progress...';
    };
    if (replaceFlag) {
      blockMsg = 'Capture and Replace Object in progress...';
    };
    screenViewObject = getScrapeViewObject("web", browserType, compareFlag, replaceFlag, mainScrapedData, newScrapedData);
    setOverlay(blockMsg);
    scrapeApi.initScraping_ICE(screenViewObject)
      .then(data => {
        if (capturedDataToSave.length !== 0 && masterCapture) {
          let added = Object.keys(newScrapedCapturedData).length ? { ...newScrapedCapturedData } : { ...mainScrapedData };
          let deleted = capturedDataToSave.map(item => item.objId);
          setCaptureData([]);
          setCapturedDataToSave([]);
          let params = {
            'deletedObj': deleted,
            'modifiedObj': [],
            'addedObj': { ...added, view: [] },
            'screenId': props.fetchingDetails["_id"],
            'userId': userInfo.user_id,
            'roleId': userInfo.role,
            'param': 'saveScrapeData',
            'orderList': []
          }
          scrapeApi.updateScreen_ICE(params)
            .then(response => {
              console.log('done')
            })
            .catch(error => console.log(error))
        }
        let err = null;
        setOverlay("");
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
          masterCapture ? setCapturedDataToSave([...scrapeItemList]) : setCapturedDataToSave([...capturedDataToSave, ...scrapeItemList])
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

  const handleMouseEnterRow = (rowData) => {
    setHoveredRow(rowData.index);
  };


  const handleDelete = (rowData) => {
    const updatedData = captureData.filter((item) => item.selectall !== rowData.selectall);
    setCaptureData(updatedData);
  };

  const handleEdit = (rowData) => {
    const updatedData = captureData.map((item) => {
      if (item.selectall === rowData.selectall) {
        return { ...item, editing: true };
      }
      return item;
    });
    setCaptureData(updatedData);
  }

  const handleSelectAllChange = (rowData, newValue) => {
    const updatedData = captureData.map((item) => {
      if (item.selectall === rowData.selectall) {
        return { ...item, selectall: newValue };
      }
      return item;
    });
    setCaptureData(updatedData);
  };

  // const renderSelectAllCell = (rowData) => {
  //   if (rowData.editing) {
  //     return (
  //       <input
  //         type="text"
  //         value={rowData.selectall}
  //         onChange={(e) => handleSelectAllChange(rowData, e.target.value)}
  //       />
  //     );
  //   }
  //   return rowData.selectall;
  // };



  const renderActionsCell = (rowData) => {
    return (
      <div>
        <img src="static/imgs/ic-edit.png"
          style={{ height: "20px", width: "20px" }}
          className="edit__icon" onClick={() => handleEdit(rowData)} />
        <img
          src="static/imgs/ic-delete-bin.png"
          style={{ height: "20px", width: "20px" }}
          className="delete__icon" onClick={() => handleDelete(rowData)} />
        <img src="static/imgs/ic-edit.png"
          style={{ height: "20px", width: "20px" }}
          className="edit__icon" onClick={() =>openElementProperties(rowData)} />
      </div>
    )

  };


  const handleMouseLeaveRow = () => {
    setHoveredRow(null);
  };



  // const renderIcons = (rowData) => {
  //   if (rowData === hoveredRow) {
  //     return (
  //       <>
  //         <img src='static/imgs/ic-edit.png' style={{height:"20px", width:"20px"}} className='edit__icon' />
  //         <img src='static/imgs/ic-delete-bin.png'  style={{height:"20px", width:"20px"}} className='delete__icon'  />
  //       </>
  //     );
  //   }
  //   return null;
  // };


  const footerCapture = (
    <div className='footer__capture'>
      <Button className='btn_capture' onMouseDownCapture={() => { setVisible(false); startScrape(captureButton); }}>Capture</Button>
    </div>
  )

  const footerAddMore = (
    <div className='footer__addmore'>
      <Button className='btn_capture' onMouseDownCapture={() => { setVisible(false); startScrape(captureButton) }}>Capture</Button>
    </div>
  );

  const headerTemplate = (
    <>
      <div>
        <h5 className='dailog_header1'>Capture Elements</h5>
        <h4 className='dailog_header2'>Signup screen 1</h4>
        <img className="screen_btn" src="static/imgs/ic-screen-icon.png" />
        {captureData.length > 0 ? <div className='Header__btn'>
          <button className='btn_panel' onClick={togglePanel}>Action Panel</button>
          <button className='add__more__btn' onClick={() => { setMasterCapture(false); handleAddMore('add more') }}>Add More</button>
          <button className="btn-capture" onClick={() => setShowNote(true)}>Capture Elements</button>
        </div> : <button className='btn_panel__single' onClick={togglePanel}>Action Panel</button>}
      </div>
    </>
  );

  const emptyMessage = (
    <div>
      <img className="not_captured_ele" src="static/imgs/ic-capture-notfound.png" alt="No data available" />
      <p className="not_captured_message">Not Captured</p>
      <button className="btn-capture-single" onClick={() => handleAddMore('add more')}>Capture Elements</button>
    </div>
  );

  const footerSave = (
    <>
      <Button label='Cancel' outlined onClick={() => props.setVisibleCaptureElement(false)}></Button>
      <Button label='Save' onClick={onSave} ></Button>
    </>
  )

  const confirmPopupMsg = (
    <div> <p>Note :This will completely refresh all <strong>Captured Elements</strong> on the screen. In case you want to Capture only additional elements use the <strong>"Add More"</strong> option </p></div>
  )
  const onHighlight = () => {
    capturedDataToSave.map((object) => {
      if (objValues.val === object.val) setActiveEye(true);
      else if (activeEye) setActiveEye(false);
    })
    let objVal = selectedCapturedElement[0].objectDetails;
    dispatch(objValue(objVal));
  }

  useEffect(() => {
    if (mirror.scrape) {
      let mirrorImg = new Image();

      mirrorImg.onload = function () {
        // let aspect_ratio = mirrorImg.height / mirrorImg.width;
        let aspect_ratio = mirrorImg.width / mirrorImg.height;
        let ds_width = 650;
        let ds_height = ds_width * aspect_ratio;
        let ds_ratio = 800 / mirrorImg.width;
        if (ds_height > 300) ds_height = 300;
        ds_height += 45; // popup header size included
        setMirrorHeight(ds_height);
        setImageHeight(mirrorImg.height)
        setDsRatio(ds_ratio);
      }
    }
    else {
      setMirrorHeight("0px");
      setDsRatio(1);
    }
    dispatch(objValue({ val: null }));
    setHighlight(false);
}, [mirror])


  useEffect(() => {
    if (objValues.val !== null) {
      let ScrapedObject = objValues;

      let top = 0; let left = 0; let height = 0; let width = 0;
      let displayHighlight = true;
      if (appType === 'OEBS' && ScrapedObject.hiddentag === 'True') {
        setHighlight(false)
        // setPopupState({show:true,title:"Element Highlight",content:"Element: " + ScrapedObject.custname + " is Hidden."});
      } else if (ScrapedObject.height && ScrapedObject.width) {
        if (ScrapedObject.viewTop != undefined) {
          if (ScrapedObject.viewTop < imageHeight) {
            // perform highlight
            top = ScrapedObject.viewTop * dsRatio
          }
          else {
            // popup error message
            displayHighlight = false
          }
        }
        else {
          if (ScrapedObject.top < imageHeight) {
            // perform highlight
            top = ScrapedObject.top * dsRatio;
          }
          else {
            // popup error message
            displayHighlight = false
          }
        }
        // ScrapedObject.viewTop != undefined ? top = ScrapedObject.viewTop * dsRatio : top = ScrapedObject.top * dsRatio;
        left = ScrapedObject.left * dsRatio;
        height = ScrapedObject.height * dsRatio;
        width = ScrapedObject.width * dsRatio;

        if (appType === "MobileWeb" && navigator.appVersion.indexOf("Mac") !== -1) {
          top = top + 112;
          left = left + 15;
        }
        else if (appType === "SAP" && mainScrapedData.createdthrough !== 'PD') {
          top = top + 2;
          left = left + 3;
        }
        else if (appType === "OEBS" && mainScrapedData.createdthrough === 'PD') {
          top = top + 35;
          left = left - 36;
        }
        // if (highlight){setHighlight} else{setHighlight(false)}
        if (displayHighlight) {
          setHighlight({
            top: `${Math.round(top)}px`,
            left: `${Math.round(left)}px`,
            height: `${Math.round(height)}px`,
            width: `${Math.round(width)}px`,
            backgroundColor: "yellow",
            border: "1px solid red",
            opacity: "0.7"
          });
        }
        else {
          setHighlight(false);
          // setMsg(Messages.SCRAPE.ERR_HIGHLIGHT_OUT_OF_RANGE);
        }
        // highlightRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'})
      } else setHighlight(false);
      if (!ScrapedObject.xpath.startsWith('iris')) {
        scrapeApi.highlightScrapElement_ICE(ScrapedObject.xpath, ScrapedObject.url, appType, ScrapedObject.top, ScrapedObject.left, ScrapedObject.width, ScrapedObject.height)
          .then(data => {
            if (data === "Invalid Session") return null;
            if (data === "fail") return null;
          })
          .catch(error => console.error("Error while highlighting. ERROR::::", error));
      }
    }
    else setHighlight(false);
    //eslint-disable-next-line
  }, [objValues])




const headerScreenshot = (
  <>
    <div className='header__popup'>
      {(screenshotData && screenshotData.header) ? screenshotData.header : ""}
      <div>
        <img data-test="eyeIcon" className="ss_eye_icon"
          onClick={onHighlight}
          src={activeEye ? "static/imgs/ic-highlight-element-inactive.png" : ""}
          alt="eyeIcon" />
      </div>
    </div>
  </>
)
const handleSave = (value, cellValue, customFlag = '') => {
  let localScrapeItems = [...scrapeItems];
  let updNewScrapedData = { ...newScrapedData };
  let objId = "";
  let isCustom = false;
  let obj = null;
  for (let scrapeItem of localScrapeItems) {
    if (scrapeItem.val === value) {
      scrapeItem.title = cellValue;
      if (customFlag) {
        scrapeItem.tag = cellValue.tag;
        scrapeItem.url = cellValue.url;
        scrapeItem.xpath = cellValue.xpath;
        scrapeItem.editable = true;
      }
      objId = scrapeItem.objId;
      isCustom = scrapeItem.isCustom;
      if (objId) obj = { ...mainScrapedData.view[scrapeItem.objIdx], custname: cellValue };
      else if (!isCustom) updNewScrapedData.view[scrapeItem.objIdx] = { ...newScrapedData.view[scrapeItem.objIdx], custname: cellValue }
      // else only if customFlag is true
    };
  }

  if (objId) {
    let modifiedDict = { ...modified }
    modifiedDict[objId] = obj;
    setModified(modifiedDict);
  }
  else if (!isCustom) setNewScrapedData(updNewScrapedData);
  if (!(cellValue.tag && cellValue.tag.substring(0, 4) === "iris")) setSaved({ flag: false });
  setScrapeItems(localScrapeItems);
}

const onCellEditComplete = (e) => {
  let { rowData, newValue, field, originalEvent: event } = e;
  if (newValue.trim().length > 0) {
    setCellValue(newValue);
    rowData.selectall = newValue;
    handleSave(rowData.objectDetails.val, newValue);

  }
  else event.preventDefault();
}

const cellEditor = (options) => {
  return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
};




const [editing, setEditing] = useState(false);
const [cellValue, setCellValue] = useState(null);
const [showInput, setShowInput] = useState(false);
const [editedObjectValue, setEditedObjectValue] = useState("");
const hoverCellTemplate = (rowData) => {
  setEditedObjectValue(rowData.objectDetails.val);
  setCellValue(rowData.selectall);
  const handleMouseEnter = () => {
    setEditing(true);
  };

  const handleMouseLeave = () => {
    setEditing(false);
  };

  const handleInputChange = (e) => {
    setCellValue(e.target.value);
    rowData.selectall = e.target.value;
  };

  const EditHandler = () => {
    console.log("Inside Input");
    setShowInput(true);
    setEditing(false);
  }



  // console.log("capturedDataToSave",capturedDataToSave);
  // console.log("captureData", captureData);
  // const updateEditedData = [];
  // capturedDataToSave.filter(toSaveData => {
  //   captureData.some(item => {
  //     if(toSaveData.objId === item.objId && toSaveData.custname !== item.selectall) {
  //       updateEditedData.push({...toSaveData, "custname" : item.selectall, "title": item.selectall });
  //     }

  //   })
  // });

  // console.log(updateEditedData);
  // setModifyElementName([...updateEditedData]);
  // setEditing(false);
  // setShowInput(false);

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {editing ? <div>
        <span> {cellValue} </span>
        <Button icon="pi pi-pencil" rounded text onClick={EditHandler} />
      </div> :
        <div>
          {showInput ? <>
            <InputText value={cellValue} onChange={handleInputChange} />
            <Button icon="pi pi-check" rounded text onClick={() => handleSave(editedObjectValue, cellValue)} />
          </> : <span>{cellValue} </span>
          }

        </div>
      }
    </div>
  );
};
const saveElementProperties=()=>{
  let actualXpath=selectedCapturedElement?.[0].objectDetails.xpath.split(';')
  let arr=elementValues.map(element=>(
      (element.value==='None')?{...element,value:"null"}:element
  ))
  let obj=arr.reduce((obj, item) => ({...obj, [item.key]: item.value}) ,{});
  let newIdentifierList=arr.map(element=>(
      {id:element.id,identifier:element.identifier}
  )).map((element,idx)=>{
      element.id=idx+1
      return element
  })
  
  
  let finalXPath=`${obj.xpath};${obj.id};${obj.rxpath};${obj.name};${actualXpath[4]};${obj.classname};${actualXpath[6]};${actualXpath[7]};${actualXpath[8]};${actualXpath[9]};${obj.label};${obj.href};${obj.cssselector}`
  console.log(finalXPath)
  let params = {
      'objectId':selectedCapturedElement.length>0?selectedCapturedElement[0].objectDetails.objId:null,
      'identifiers':newIdentifierList,
      'xpath':finalXPath,
      'param':'updatedProperties',
      'userId': userInfo.user_id,
      'roleId': userInfo.role,
      
      // 'identifier'
  }
  scrapeApi.updateScreen_ICE(params)
      .then(response => {
          console.log(response)
          if(response == "Success"){
              setElementPropertiesUpdated(true)
              setElementProperties(false)
             
              // setMsg(MSG.SCRAPE.SUCC_OBJ_PROPERTIES);
              toast.current.show({severity:'success', summary: 'Success', detail:'Element properties updated successfully', life: 5000});

              
              // setIdentifierList([{id:1,identifier:'xpath',name:'Absolute X-Path '},{id:2,identifier:'id',name:'ID Attribute'},{id:3,identifier:'rxpath',name:'Relative X-Path'},{id:4,identifier:'name',name:'Name Attribute'},{id:5,identifier:'classname',name:'Classname Attribute'}])
              
          }
      })
      .catch(error => {
          console.log(error)
          
              // setMsg("Some Error occured while updating element properties.");
              // setIdentifierList([{id:1,identifier:'xpath',name:'Absolute X-Path '},{id:2,identifier:'id',name:'ID Attribute'},{id:3,identifier:'rxpath',name:'Relative X-Path'},{id:4,identifier:'name',name:'Name Attribute'},{id:5,identifier:'classname',name:'Classname Attribute'}])
      }
      )
}
const footerContent = (
  <div>
      <div style={{position:'absolute',fontStyle:'italic'}}><span style={{color:'red'}}>*</span>Click on value fields to edit element properties.</div>
      <Button label="Cancel" onClick={()=>{setElementProperties(false)}} className="p-button-text" style={{borderRadius:'20px',height:'2.2rem'}} />
      <Button label="Save" onClick={saveElementProperties} autoFocus style={{borderRadius:'20px',height:'2.2rem'}} />
  </div>
)
const onCellEditCompleteElementProperties = (e) => {
const {key,value}=e.newRowData;
const elementVals=[...elementValues]


elementVals.find(v => v.key === key).value = value;


console.log(elementVals)
};
const textEditor = (options) => {
return <InputText classNametype="text" style={{width:'100%'}} value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
};
//element properties renderer end 

//elemenet properties function calls
const onRowReorder=(e)=>{
setElementValues(e.value)
}
const openElementProperties=(rowdata)=>{
console.log(rowdata)
let element=rowdata.objectDetails.xpath.split(';')
let dataValue=[]
let elementFinalProperties={
  xpath:(element[0]==="null"||element[0]===""||element[0]==="undefined")?'None':element[0],
  id:(element[1]==="null"|| element[1]===""||(element[1]==="undefined"))?'None':element[1],
  rxpath:(element[2]==="null"||element[2]===""||(element[2]==="undefined"))?'None':element[2],
  name:(element[3]==="null"||element[3]===""||(element[3]==="undefined"))?'None':element[3],
  classname:(element[5]==="null"||element[5]===""||(element[5]==="undefined"))?'None':element[5],
  cssselector:(element[12]==="null"||element[12]===""||(element[12]==="undefined"))?'None':element[12],
  href:(element[11]==="null"||element[11]===""||(element[11]==="undefined"))?'None':element[11],
  label:(element[10]==="null"||element[10]===""||(element[10]==="undefined"))?'None':element[10],
   }

Object.entries(elementFinalProperties).forEach(([key, value], index) => {
let currindex=rowdata.objectDetails.identifier.filter(element=>element.identifier===key)
dataValue.push({id:currindex[0].id,identifier:key,key,value,name:defaultNames[key]})
}
)
dataValue.sort((a,b)=>a.id-b.id)
setElementValues(dataValue)
setElementProperties(true)
}

return (
  <>
    <Toast ref={toast} position="bottom-center"/>
    {overlay && <ScreenOverlay content={overlay} />}
    <Dialog className='dailog_box' header={headerTemplate} position='right' visible={props.visibleCaptureElement} style={{ width: '73vw', color: 'grey', height: '95vh', margin: 0 }} onHide={() => props.setVisibleCaptureElement(false)} footer={footerSave}>
      {showPanel && (<div className="card_modal">
        <Card className='panel_card'>
          <div className="action_panelCard">
            <div className='insprint__block'>
              <p className='insprint__text'>In Sprint Automation</p>
              <img className='info__btn' ref={imageRef1} onMouseEnter={() => handleMouseEnter('insprint')} onMouseLeave={() => handleMouseLeave('insprint')} src="static/imgs/info.png"></img>
              <span className='insprint_auto' onClick={() => handleDialog('addObject')}>
                <img className='add_obj' title="add object" src="static/imgs/ic-add-object.png"></img>
                <p>Add Element</p>
              </span>
              <span className='insprint_auto' onClick={() => handleDialog('mapObject')}>
                <img className='map_obj' title='map object' src="static/imgs/ic-map-object.png"></img>
                <p>Map Element</p>
              </span>
              {isInsprintHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 100}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                <h3>InSprint Automation</h3>
                <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                <a>Learn More</a>
              </div>)}
            </div>
            <div className='upgrade__block'>
              <p className='insprint__text'>Upgrade Analyzer</p>
              <img className='info__btn' ref={imageRef2} onMouseEnter={() => handleMouseEnter('upgrade')} onMouseLeave={() => handleMouseLeave('upgrade')} src="static/imgs/info.png"></img>
              <span className='upgrade_auto' onClick={() => handleDialog('compareObject')}>
                <img className='add_obj' src="static/imgs/ic-compare.png"></img>
                <p>Compare Element</p>
              </span>
              <span className='upgrade_auto' onClick={() => handleDialog('replaceObject')}>
                <img className='map_obj' src="static/imgs/ic-replace.png"></img>
                <p>Replace Element</p>
              </span>
              {isUpgradeHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 650}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                <h3>Upgrade Analyzer</h3>
                <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                <a href='docs.avoautomation.com'>Learn More</a>
              </div>)}
            </div>
            <div className='utility__block'>
              <p className='insprint__text'>Capture from PDF</p>
              <img className='info__btn' ref={imageRef3} onMouseEnter={() => handleMouseEnter('pdf')} onMouseLeave={() => handleMouseLeave('pdf')} src="static/imgs/info.png"></img>
              <span className='insprint_auto'>
                <img className='add_obj' src="static/imgs/ic-pdf-utility.png"></img>
                <p>PDF Utility</p>
              </span>
              {isPdfHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 850}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                <h3>Capture from PDF</h3>
                <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                <a>Learn More</a>
              </div>)}
            </div>
            <div className='createManual__block'>
              <p className='insprint__text'>Create Manually</p>
              <img className='info__btn' ref={imageRef4} onMouseEnter={() => handleMouseEnter()} onMouseLeave={() => handleMouseLeave()} src="static/imgs/info.png"></img>
              <span className='insprint_auto create__block' onClick={() => handleDialog('createObject')}>
                <img className='map_obj' src="static/imgs/ic-create-object.png"></img>
                <p>Create Element</p>
              </span>
              {isCreateHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 1000}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                <h3>Create Manually</h3>
                <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                <a>Learn More</a>
              </div>)}
            </div>
            <div className='imp_exp__block'>
              <span className='insprint_auto'>
                <span className='import__block' onClick={() => setShowObjModal("importModal")}>
                  <img className='add_obj' src="static/imgs/ic-import.png" />
                  <p className='imp__text'>Import Screen</p>
                </span>
                <span className='export__block' onClick={() => setShowObjModal("exportModal")}>
                  <img className='add_obj' src="static/imgs/ic-export.png" />
                  <p className='imp__text'>Export Screen</p>
                </span>
              </span>
            </div>
          </div>
        </Card>
      </div>)}
      <div className="card-table">

        <DataTable
          size="small"
          editMode="cell"
          className='datatable__col'
          value={captureData}
          dragHandleIcon="pi pi-bars"
          rowReorder resizableColumns
          reorderableRows
          onRowReorder={handleRowReorder}
          showGridlines
          selectionMode={"single"}
          selection={selectedCapturedElement}
          onSelectionChange={onRowClick}
          tableStyle={{ minWidth: '50rem' }}
          headerCheckboxToggleAllDisabled={false}
          emptyMessage={emptyMessage}
        >
          {/* editMode="cell"
            onCellEdit={(e) => handleCellEdit(e)} */}
          {/* <Column style={{ width: '3em' }} body={renderRowReorderIcon} /> */}
          {/* <Column rowReorder style={{ width: '3rem' }} /> */}
          <Column headerStyle={{ width: '3rem' }} selectionMode='multiple'></Column>
          <Column field="selectall" header="Element Name" editor={(options) => cellEditor(options)} onCellEditComplete={onCellEditComplete}></Column>
          <Column field="objectProperty" header="Element Type"></Column>
          <Column field="screenshots" header="Screenshots"></Column>
          <Column field="actions" header="Actions" body={renderActionsCell} />
        </DataTable>
        <Dialog className="ref_pop screenshot_pop" header={headerScreenshot} visible={screenshotData && screenshotData.enable} onHide={() => { setScreenshotData({ ...screenshotData, enable: false }) }} style={{ height: `${mirrorHeight}px` }}>
          <div className="screenshot_pop__content" >
            {highlight && <div style={{ display: "flex", position: "absolute", ...highlight }}></div>}
            <img className="screenshot_img" src={`data:image/PNG;base64,${screenshotData.imageUrl}`} alt="Screenshot Image" />
          </div>
        </Dialog>
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
      {/* {visible === 'capture' && <div className='recapture__note'><img className='not__captured' src='static/imgs/not-captured.png' /><span style={{ paddingLeft: "0.2rem" }}><strong>Note :</strong>This will completely refresh all Captured Objects on the screen. In case you want to Capture only additional elements use the "Add More" option</span></div>} */}
    </Dialog>
    {/* <ConfirmPopup visible={showNote} onHide={() => setShowNote(false)} message={confirmPopupMsg} icon="pi pi-exclamation-triangle" accept={() => {setMasterCapture(true);handleAddMore('capture')}} reject={()=>setShowNote(false)} position="Center" /> */}
    <AvoConfirmDialog
      visible={showNote}
      onHide={() => setShowNote(false)}
      showHeader={false}
      message={confirmPopupMsg}
      icon="pi pi-exclamation-triangle"
      accept={() => { setMasterCapture(true); handleAddMore('capture') }} />
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
    {/* {currentDialog === 'importModal' && <ImportModal isOpen={currentDialog} OnClose={handleClose} fetchingDetails={props.fetchingDetails} fetchScrapeData={fetchScrapeData} />} */}
    {showObjModal === "importModal" && <ImportModal fetchScrapeData={fetchScrapeData} setOverlay={setOverlay} setShow={setShowObjModal} appType="Web" fetchingDetails={props.fetchingDetails} />}
    {showObjModal === "exportModal" && <ExportModal appType="Web" fetchingDetails={props.fetchingDetails} setOverlay={setOverlay} setShow={setShowObjModal} />}
{/* //Element properties  */}
    <Dialog header={"Element Properties"} draggable={false} position="right" editMode="cell" style={{width:'66vw',marginRight:'3.3rem'}} visible={elementPropertiesVisible}  onHide={() =>setElementProperties(false)}  footer={footerContent}>
          <div className="card">
              <DataTable value={elementValues} reorderableRows onRowReorder={onRowReorder}  >
                <Column rowReorder style={{ width: '3rem' }} />
                <Column field="id" header="Priority" headerStyle={{ justifyContent: "center", width: '10%', minWidth: '4rem',  flexGrow: '0.2'}} bodyStyle={{ textAlign: 'left', flexGrow: '0.2', minWidth: '4rem' }} style={{ minWidth: '3rem' }} />
                {/* <column ></column> */}
                <Column field="name" header="Properties " headerStyle={{ width: '30%', minWidth: '4rem',  flexGrow: '0.2'}} bodyStyle={{ flexGrow: '0.2', minWidth: '2rem' }} style={{ width: '20%', overflowWrap: 'anywhere', justifyContent: 'flex-start' }}></Column>
                <Column field="value" header="Value" editor={(options)=>textEditor(options)} onCellEditComplete={onCellEditCompleteElementProperties} bodyStyle={{cursor:'url(static/imgs/Pencil24.png) 15 15,auto',width:'53%',minWidth:'34rem'}} style={{}}></Column>
              </DataTable>
          </div>
    </Dialog>
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
      identifier:scrapeObject.identifier
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
