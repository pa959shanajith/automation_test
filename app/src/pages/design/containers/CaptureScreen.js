import { React, useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux"
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
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
import ModalContainer from '../../global/components/ModalContainer';
import { Toast } from 'primereact/toast';
import { InputText } from "primereact/inputtext";
import { Tooltip } from 'primereact/tooltip';



const CaptureModal = (props) => {
  const dispatch = useDispatch();
  const toast = useRef();
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
  const [showConfirmPop, setShowConfirmPop] = useState(false);
  const [modified, setModified] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [deleted, setDeleted] = useState([]);
  const [deletedItems, setDeletedItems] = useState(false)
  const[browserName,setBrowserName]=useState(null)
  //element properties states 
  const [elementPropertiesUpdated, setElementPropertiesUpdated] = useState(false)
  const [elementPropertiesVisible, setElementProperties] = useState(false);
  const [elementValues, setElementValues] = useState([])
  const [isIdentifierVisible, setIsIdentifierVisible] = useState(false)
  const [regex, setRegex] = useState("")
  const [moveCardUp, setMoveCardUp] = useState(false)
  const [cardBottom, setCardBottom] = useState(null)
  const defaultIdentifier = [{ id: 1, identifier: 'xpath', name: 'Absolute X-Path ' }, { id: 2, identifier: 'id', name: 'ID Attribute' }, { id: 3, identifier: 'rxpath', name: 'Relative X-Path' }, { id: 4, identifier: 'name', name: 'Name Attribute' }, { id: 5, identifier: 'classname', name: 'Classname Attribute' }, { id: 6, identifier: 'cssselector', name: 'CSS Selector' }, { id: 7, identifier: 'href', name: 'Href Attribute' }, { id: 8, identifier: 'label', name: 'Label' }]
  const defaultNames = { xpath: 'Absolute X-Path', id: 'ID Attribute', rxpath: 'Relative X path', name: 'Name Attribute', classname: 'Classname Attribute', cssselector: 'CSS Selector', href: 'Href Attribute', label: 'Label' }
  const [showIdentifierOrder, setShowIdentifierOrder] = useState(false)
  const [identifierList, setIdentifierList] = useState([{ id: 1, identifier: 'xpath', name: 'Absolute X-Path ' }, { id: 2, identifier: 'id', name: 'ID Attribute' }, { id: 3, identifier: 'rxpath', name: 'Relative X-Path' }, { id: 4, identifier: 'name', name: 'Name Attribute' }, { id: 5, identifier: 'classname', name: 'Classname Attribute' }, { id: 6, identifier: 'css-selector', name: 'CSS Selector' }, { id: 7, identifier: 'href', name: 'Href Attribute' }, { id: 8, identifier: 'label', name: 'Label' }]);
  const [identifierModified, setIdentifierModiefied] = useState(false);
  const [parentData, setParentData] = useState({ id: props.fetchingDetails["_id"], name: props.fetchingDetails["name"] });
  const [idx, setIdx] = useState(0);


  const imageRef1 = useRef(null);
  const imageRef2 = useRef(null);
  const imageRef3 = useRef(null);
  const imageRef4 = useRef(null);

  const [cardPosition, setCardPosition] = useState({ left: 0, right: 0, top: 0 });
  const [selectedCapturedElement, setSelectedCapturedElement] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  let addMore = useRef(false);

  useEffect(() => {
    fetchScrapeData()
  }, [parentData])
  useEffect(() => {
    if (endScrape || elementPropertiesUpdated || identifierModified) {
      fetchScrapeData();
      setEndScrape(false)
      setIdentifierModiefied(false)
      setElementPropertiesUpdated(false)
    }
  }, [parentData, endScrape, elementPropertiesUpdated, identifierModified])

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


  const parentScreen = props.fetchingDetails["parent"]["children"];
  useEffect(() => {
    const parentScreenId = () => {
      for (let i = 0; i < parentScreen.length; i++) {
        if (props.fetchingDetails["name"] === parentScreen[i].name) {
          //  if (props.fetchingDetails["parent"]["children"][idx]["name"] === parentScreen[i].name) {
          setIdx(i);
          return setParentData({
            name: parentScreen[i].name,
            id: parentScreen[i]._id,
            parentName: props.fetchingDetails["parent"]['name'],
            parent_id: props.fetchingDetails["parent"]['_id'],
            projectId: parentScreen[i].projectID,
          });
          // }
        }
      }
      return 0;
    }
    parentScreenId();
  }, [])


  const onIncreaseScreen = () => {
    setCapturedDataToSave([]);
    for (let i = idx; i < parentScreen.length; i++) {
      if (props.fetchingDetails["parent"]["children"][idx + 1]["name"] === parentScreen[i].name) {
        setParentData({
          name: parentScreen[i].name,
          id: parentScreen[i]._id,
          parentName: props.fetchingDetails["parent"]['name'],
          parent_id: props.fetchingDetails["parent"]['_id'],
          projectId: parentScreen[i].projectID,
        });
        return setIdx(idx + 1);
      }
    }
  }

  const onDecreaseScreen = () => {
    setCapturedDataToSave([]);
    for (let i = idx; i < parentScreen.length; i--) {
      if (props.fetchingDetails["parent"]["children"][idx - 1]["name"] === parentScreen[i].name) {
        setParentData({
          name: parentScreen[i].name,
          id: parentScreen[i]._id,
          parentName: props.fetchingDetails["parent"]['name'],
          parent_id: props.fetchingDetails["parent"]['_id'],
          projectId: parentScreen[i].projectID,
        });
        return setIdx(idx - 1);
      }
    }
  }

  const handleRowReorder = (event) => {
    setCaptureData(event.value);
  };

  const handleSpanClick = (index) => {
    if (selectedSpan === index) {
      setSelectedSpan(null);
    } else {
      setSelectedSpan(index);
      switch (index) {

        case 1:

          setBrowserName("explorer")

          break;

        case 2:

          setBrowserName("chrome")

          break;

        case 3:

          setBrowserName("mozilla")

          break;

        case 4:
          setBrowserName("chromium")
          break;
      }
    }
  };

  const toastError = (erroMessage) => {
    if (erroMessage.CONTENT) {
      toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 10000 });
    }
    else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 10000 });
  }

  const toastSuccess = (erroMessage) => {
    if (erroMessage.CONTENT) {
      toast.current.show({ severity: erroMessage.VARIANT, summary: 'Success', detail: erroMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'success', summary: 'Success', detail: erroMessage, life: 5000 });
  }

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
        if (uniqueCusts.includes(scrapeItem.custname)) {
          dCustname = true;
          scrapeItem.duplicate = true;
          dCusts.push(scrapeItem.custname);
        }
        else {
          scrapeItem.duplicate = false;
          uniqueCusts.push(scrapeItem.custname);
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
            dCusts2.push(scrapeItem.custname);
          }
          else {
            scrapeItem.duplicate = false;
            uniqueXPaths.push(xpath);
          }
        }
      }

      if (dCustname) {
        continueSave = false;
        setShowPop({
          'type': 'modal',
          'title': 'Save Scrape data',
          'content': <div className="ss__dup_labels">
            Please rename/delete duplicate scraped objects
            <br /><br />
            Object characterstics are same for:
            {/* <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)"> */}
            <div className="ss__dup_scroll">
              {dCusts.map((custname, i) => <span key={i} className="ss__dup_li">{custname}</span>)}
            </div>
            {/* </ScrollBar> */}
          </div>,
          'footer': <Button size="small" onClick={() => setShowPop("")}>OK</Button>
        })
      }
      else if (dXpath) {
        continueSave = false;
        setShowConfirmPop({
          'title': 'Save Scrape data',
          'content': <div className="ss__dup_labels">
            Object characteristics are same for the below list of objects:
            {/* <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)"> */}
            <div className="ss__dup_scroll">
              {dCusts2.map((custname, i) => <span key={i} className="ss__dup_li">{custname}</span>)}
            </div>
            {/* </ScrollBar> */}
            <br />
            Do you still want to continue?
          </div>,
          'onClick': () => { setShowConfirmPop(false); saveScrapedObjects(); },
          'continueText': "Continue",
          'rejectText': "Cancel"
        })
      }
    }

    if (continueSave) saveScrapedObjects();
  }

const elementTypeProp =(elementProperty) =>{
  switch(elementProperty) {
    case "abbr" || "acronym" || "aside" || "body" || "data" || "dd" || "dfn" || "div" || "embed" || "figure" || "footer" || "frame" || "head" ||
          "iframe" || "kbd" || "main" || "meta" || "noscript" || "object" || "output" || "param" || "progress" || "rt" || "samp" || "section" || "span"
          || "style" || "td" || "template" :
       return "Content";

    case "a" || "link":
       return "Link";

    case "address" || "article" || "b" || "bdi" || "bdo" || "big" || "blockquote" || "caption" || "center" || "cite" || "code" || "del" || "details" 
         || "dt" || "em" || "figcaption" ||  "h1" || "h2" || "h3" || "h4" || "h5" || "h6" || "header" || "i" || "ins" || "label" || "legend" || "mark" 
         || "noframes" || "p" || "pre" || "q" || "rp" || "ruby" || "s" || "small" || "strike" || "strong" || "sub" || "summary" || "sup" || "th" || "time"
         || "title" || "tt" || "u":
      return "Text";

    case "button" :
      return "Button";
      
    case "img" || "map" || "picture" || "svg" :
      return "Image";

    case "col" || "colgroup" || "nav" :
      return "Navigation Menus";

    case "datalist" || "select" :
      return "Dropdown";

    case "dir" || "dl" || "li" || "ol" || "optgroup" || "option" || "ul" :
      return "List";

    case "form" || "fieldset" :
      return "Forms";
      
    case "input" || "textarea" :
      return "Textbox/Textarea";
      
    case "table" || "tbody" || "tfoot" || "thead" || "tr":
      return "Table";

    default:
      return "Element";
   }
}

  const fetchScrapeData = () => {
    return new Promise((resolve, reject) => {
      setOverlay("Loading...");

      let viewString = capturedDataToSave;
      let haveItems = viewString.length !== 0;
      let newlyScrapeList = [];

      // setCapturedDataToSave(viewString);
      // (type, screenId, projectId, testCaseId:optional)
      scrapeApi.getScrapeDataScreenLevel_ICE("web", parentData.id, parentData.projectId, "")
        .then(data => {
          // current_task.subTask === "Scrape" (not sure !!)
          if (data.scrapedurl) setScrapedURL(data.scrapedurl);

          if (data === "Invalid Session") return null;
          else if (typeof data === "object" && props.appType !== "Webservice") {
            haveItems = data.view.length !== 0;
            let [newScrapeList, newOrderList] = generateScrapeItemList(0, data);
            newlyScrapeList = newScrapeList

            if (!addMore.current) {
              if (newlyScrapeList.length > 0 && capturedDataToSave.length >= 0) {
                setCapturedDataToSave([...newScrapeList]);
                viewString = newScrapeList;
              }
            }

            setMainScrapedData(data);
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
          let newData = (viewString.length > 0 && !elementPropertiesUpdated) ? viewString.map((item) => {
            return (
              {
                selectall: item.custname,
                objectProperty: elementTypeProp(item.tag),
                screenshots: (item.left && item.top && item.width) ? <span className="btn__screenshot" onClick={() => {
                  setScreenshotData({
                    header: item.custname,
                    imageUrl: data.mirror || "",
                    enable: true
                  });
                  onHighlight();
                  setHighlight(true);
                }}>View Screenshot</span> : <span>No Screenshot Available</span>,
                actions: '',
                objectDetails: item

              }
            )
          }) : newlyScrapeList.map((item) => {
            return (
              {
                selectall: item.custname,
                objectProperty: elementTypeProp(item.tag),
                browserscrape: 'google chrome',
                screenshots: (item.left && item.top && item.width) ? <span className="btn__screenshot" onClick={() => {
                  setScreenshotData({
                    header: item.custname,
                    imageUrl: mirror.scrape || "",
                    enable: true
                  });
                  onHighlight();
                  setHighlight(true);
                }}>View Screenshot</span> : <span>No screenshot available</span>,
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
          setOverlay("");
          reject("fail")
        })
    });
  }
  const onDelete = (e, confirmed) => {
    if (mainScrapedData.reuse && !confirmed) {
      return;
    }
    let deletedArr = [...deleted];
    let scrapeItemsL = [...captureData];
    let newOrderList = [];
    var capturedDataAfterSave = scrapeItemsL.filter(function (item) {

      return !selectedCapturedElement.find(function (objFromB) {
        if (item.objectDetails.objId === objFromB.objectDetails.objId) {
          deletedArr.push(item.objectDetails.objId)
          return true
        }
      })
    })
    let notused = scrapeItemsL.filter(item => {
      if (deletedArr.includes(item.objectDetails.objId)) {
        return false
      }
      else {
        newOrderList.push(item.objectDetails.objId)
      }
    })
    let newCapturedDataToSave = capturedDataAfterSave.map(item => item.objectDetails)
    setCaptureData(capturedDataAfterSave)
    setDeleted(deletedArr)
    setOrderList(newOrderList)
    setCapturedDataToSave(newCapturedDataToSave)
    setSelectedCapturedElement([])
    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Element deleted successfully', life: 5000 });
  }
  // {console.log(captureData[0].selectall)}

  const saveScrapedObjects = () => {
    let scrapeItemsL = [...capturedDataToSave];
    let added = Object.keys(newScrapedCapturedData).length ? { ...newScrapedCapturedData } : { ...mainScrapedData };
    let views = [];
    let orderList = [];
    let modifiedObjects = Object.values(modified);

    for (let scrapeItem of scrapeItemsL) {
      if (!Array.isArray(scrapeItem)) {
        if (!scrapeItem.objId) {
          if (scrapeItem.isCustom) views.push({ custname: scrapeItem.custname, xpath: scrapeItem.xpath, tag: scrapeItem.tag, tempOrderId: scrapeItem.tempOrderId });
          else views.push({ ...newScrapedCapturedData.view[scrapeItem.objIdx], custname: scrapeItem.custname, tempOrderId: scrapeItem.tempOrderId });
          orderList.push(scrapeItem.tempOrderId);
        }
        else orderList.push(scrapeItem.objId);
      }

    }

    let params = {
      'deletedObj': deleted,
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
              ? setShowPop({
                title: "Saved Scrape Objects",
                content: <div className="ss__dup_labels">
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
                </div>,
                footer: <Button onClick={() => { setShowPop("") }} >OK</Button>
              })
              : toastSuccess("Scraped Elements saved successfully.");
            let numOfObj = scrapeItemsL.length;
            // setDisableBtns({save: true, delete: true, edit: true, search: false, selAll: numOfObj===0, dnd: numOfObj===0||numOfObj===1 });
          } else { console.error(resp); addMore.current = true; }
        }).catch(error => console.error(error));
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
          toastError({
            'VARIANT': data === 'scheduleModeOn' ? MSG.GENERIC.WARN_UNCHECK_SCHEDULE.VARIANT : MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.VARIANT, 'CONTENT':
              data === 'scheduleModeOn' ?
                MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT :
                MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.CONTENT

          });
          return
        } else if (data === "fail")
          toastError("Error while performing Scrape");
        else if (data === "Terminate") {
          setOverlay("");
          toastError("Scrape Terminated."); 
        }
        else if (data === "wrongWindowName")
          toastError("Window not found - Please provide valid window name.");
        else if (data === "ExecutionOnlyAllowed")
          toastError("ICE is connected in 'Execution Only' mode. Other actions are not permitted.");


        if (err) {
          // setMsg(err);
          return false;
        }

        let viewString = data;
        // fetchScrapeData();
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

          if (masterCapture) { // click on the capture elements button-- it will erase exist data & captures new data
            setCapturedDataToSave([...scrapeItemList])
          }
          else {
            if (capturedDataToSave.length > 0) { //when click on addmore
              addMore.current = true;
              setCapturedDataToSave([...capturedDataToSave, ...scrapeItemList])
            }
            else { // when captured data is empty  
              addMore.current = false;
              setCapturedDataToSave([...scrapeItemList]);
            }
          }
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
        toastError("Error while performing Scrape");
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

  const renderSelectAllCell = (rowData) => {
    if (rowData.editing) {
      return (
        <input
          type="text"
          value={rowData.selectall}
          onChange={(e) => handleSelectAllChange(rowData, e.target.value)}
        />
      );
    }
    return rowData.selectall;
  };


  const renderActionsCell = (rowData) => {
    return (
      <div>
        <img
          src="static/imgs/ic-delete-bin.png"
          style={{ height: "20px", width: "20px" }}
          className="delete__icon" onClick={() => handleDelete(rowData)} />
        <img src="static/imgs/ic-edit.png" title="view/edit element properties"
          style={{ height: "20px", width: "20px" }}
          className="edit__icon" onClick={() => openElementProperties(rowData)} />
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
      <Button onMouseDownCapture={() => { setVisible(false); startScrape(browserName); }}>Capture</Button>
    </div>
  )

  const footerAddMore = (
    <div className='footer__addmore'>
      <Button onMouseDownCapture={() => { setVisible(false); startScrape(browserName); }}>Capture</Button>
    </div>
  );

  const headerTemplate = (
    <>
      <div>
        <h5 className='dailog_header1'>Capture Elements</h5>
        <Tooltip target=".onHoverLeftIcon" position='bottom'>Move to previous capture element screen</Tooltip>
        <Tooltip target=".onHoverRightIcon" position='bottom'>Move to next capture element screen</Tooltip>
        <Tooltip target=".screen__name" position='bottom'>{parentData.name}</Tooltip>
        <h4 className='dailog_header2'><span className='pi pi-angle-left onHoverLeftIcon' style={idx === 0 ? { opacity: '0.3',cursor:'not-allowed' } : { opacity: '1' }} disabled={idx === 0} onClick={onDecreaseScreen} tooltipOptions={{ position: 'bottom' }} tooltip="move to previous capture element screen" /><img className="screen_btn" src="static/imgs/ic-screen-icon.png" /><span className='screen__name'>{parentData.name}</span><span className='pi pi-angle-right onHoverRightIcon' onClick={onIncreaseScreen} style={(idx === parentScreen.length - 1) ? { opacity: '0.3',cursor:'not-allowed' } : { opacity: '1' }} disabled={idx === parentScreen.length - 1} tooltipOptions={{ position: 'bottom' }} tooltip="move to next capture element screen" />
        </h4>
        {/* <img className="screen_btn" src="static/imgs/ic-screen-icon.png" /> */}
        {captureData.length > 0 ? <div className='Header__btn'>
          <button className='btn_panel' onClick={togglePanel}>Action Panel</button>
          <button className='add__more__btn' onClick={() => { setMasterCapture(false); handleAddMore('add more') }}>Add More</button>
          <button className="btn-capture" onClick={() => setShowNote(true)}>Capture Elements</button>
        </div> : <button className='btn_panel__single' onClick={togglePanel}>Action Panel</button>}
      </div>
    </>
  );

  const emptyMessage = (
    <div className='empty_msg1'>
      <div className='empty_msg'>
        <img className="not_captured_ele" src="static/imgs/ic-capture-notfound.png" alt="No data available" />
        <p className="not_captured_message">Not Captured</p>
        <Button className="btn-capture-single" onClick={() => handleAddMore('add more')}>Capture Elements</Button>
      </div>
    </div>
  );

  const setAddmoreHandler = () => addMore.current = addMore.current && false;

  const footerSave = (
    <>
      {selectedCapturedElement?.length > 0 ? <Button label="Element Identifier Order" onClick={() => setShowIdentifierOrder(true)} ></Button> : null}
      {selectedCapturedElement?.length > 0 ? <Button label='Delete' onClick={onDelete} ></Button> : null}
      <Button label='Cancel' outlined onClick={() => props.setVisibleCaptureElement(false)}></Button>
      <Button label='Save' onClick={onSave} ></Button>
    </>
  )
  const PopupDialog = () => (
    <ModalContainer
      show={showPop}
      title={showPop.title}
      close={() => setShowPop(false)}
      content={showPop.content}
      footer={showPop.footer}
    />
  );

  const ConfirmPopup = () => (
    <ModalContainer
      show={showConfirmPop}
      title={showConfirmPop.title}
      content={showConfirmPop.content}
      close={() => setShowConfirmPop(false)}
      footer={
        <>
          <Button onClick={showConfirmPop.onClick}>
            {showConfirmPop.continueText ? showConfirmPop.continueText : "Yes"}
          </Button>
          <Button onClick={() => setShowConfirmPop(false)}>
            {showConfirmPop.rejectText ? showConfirmPop.rejectText : "No"}
          </Button>
        </>
      }
    />
  )

  const confirmPopupMsg = (
    <div> <p>Note :This will completely refresh all <strong>Captured Elements</strong> on the screen. In case you want to Capture only additional elements use the <strong>"Add More"</strong> option </p></div>
  )
  const onHighlight = () => {
    capturedDataToSave.map((object) => {
      if (objValues.val === object.val) setActiveEye(true);
      else if (activeEye) setActiveEye(false);
      setHighlight(true);
    })
    let objVal = selectedCapturedElement[0].objectDetails;
    dispatch(objValue(objVal));
    setHighlight(true);
  }

  useEffect(() => {
    if (mirror.scrape) {
      let mirrorImg = new Image();

      mirrorImg.onload = function () {
        // let aspect_ratio = mirrorImg.height / mirrorImg.width;
        let aspect_ratio = mirrorImg.height / mirrorImg.width;
				let ds_width = 500;
				let ds_height = ds_width * aspect_ratio;
				let ds_ratio = 490 / mirrorImg.width;
				if (ds_height > 300) ds_height = 300;
				ds_height += 45; // popup header size included
        setMirrorHeight(ds_height);
        setImageHeight(mirrorImg.height)
        setDsRatio(ds_ratio);
      }
      mirrorImg.src = `data:image/PNG;base64,${mirror.scrape}`;
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
    <div className='header__screenshot__eye'>
    <div>
          <img data-test="eyeIcon" className="ss_eye_icon"
            onClick={onHighlight}
            src={activeEye ? 
              "static/imgs/eye-active.svg" : 
              "static/imgs/eye_disabled.svg"} 
          />
        </div>
      <div className='header__popup screenshot_headerName'>
        <Tooltip target=".screenshot_headerName" content={screenshotData.header} position='bottom' ></Tooltip>
        <span>View Screenshot</span> : {(screenshotData && screenshotData.header) ? screenshotData.header : ""}
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
        console.log("mainScrapedData.view[scrapeItem.objIdx]", mainScrapedData.view[scrapeItem.objIdx]);
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
      rowData.selectall = newValue;
      handleSave(rowData.objectDetails.val, newValue);
    }
    else event.preventDefault();
  }

  const cellEditor = (options) => {
    return <InputText type="text" className="element_name" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} style={{ width: "25rem" }} tooltip={options.value} tooltipOptions={{ position: 'bottom' }} />;
  };

  const addedCustomElement = (addedElements, orderList) => {
    let addElementData = [];
    addedElements.map(element => {
      let objects = {};
      objects.selectall = element.custname;
      objects.objectProperty = element.tag;
      objects.screenshots = '';
      objects.actions = '';
      objects.objectDetails = {};
      addElementData.push(objects)
    })
    setCaptureData([...captureData, ...addElementData])
    setCapturedDataToSave([...capturedDataToSave, ...addedElements])
  }


  const saveElementProperties = () => {
    let actualXpath = selectedCapturedElement?.[0].objectDetails.xpath.split(';')
    let arr = elementValues.map(element => (
      (element.value === 'None') ? { ...element, value: "null" } : element
    ))
    let obj = arr.reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {});
    let newIdentifierList = arr.map(element => (
      { id: element.id, identifier: element.identifier }
    )).map((element, idx) => {
      element.id = idx + 1
      return element
    })


    let finalXPath = `${obj.xpath};${obj.id};${obj.rxpath};${obj.name};${actualXpath[4]};${obj.classname};${actualXpath[6]};${actualXpath[7]};${actualXpath[8]};${actualXpath[9]};${obj.label};${obj.href};${obj.cssselector}`
    console.log(finalXPath)
    let params = {
      'objectId': selectedCapturedElement.length > 0 ? selectedCapturedElement[0].objectDetails.objId : null,
      'identifiers': newIdentifierList,
      'xpath': finalXPath,
      'param': 'updatedProperties',
      'userId': userInfo.user_id,
      'roleId': userInfo.role,

      // 'identifier'
    }
    scrapeApi.updateScreen_ICE(params)
      .then(response => {
        console.log(response)
        if (response == "Success") {
          setElementPropertiesUpdated(true)
          setElementProperties(false)

          // setMsg(MSG.SCRAPE.SUCC_OBJ_PROPERTIES);
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Element properties updated successfully', life: 5000 });


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
      <div style={{ position: 'absolute', fontStyle: 'italic' }}><span style={{ color: 'red' }}>*</span>Click on value fields to edit element properties.</div>
      <Button label="Cancel" onClick={() => { setElementProperties(false) }} className="p-button-text" style={{ borderRadius: '20px', height: '2.2rem' }} />
      <Button label="Save" onClick={saveElementProperties} autoFocus style={{ borderRadius: '20px', height: '2.2rem' }} />
    </div>
  )
  const onCellEditCompleteElementProperties = (e) => {
    const { key, value } = e.newRowData;
    const elementVals = [...elementValues]


    elementVals.find(v => v.key === key).value = value;


    console.log(elementVals)
  };
  const textEditor = (options) => {
    return <InputText classNametype="text" style={{ width: '100%' }} value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };
  //element properties renderer end 

  //elemenet properties function calls
  const onRowReorder = (e) => {
    setElementValues(e.value)
  }
  const openElementProperties = (rowdata) => {
    console.log(rowdata)
    let element = rowdata.objectDetails.xpath.split(';')
    let dataValue = []
    let elementFinalProperties = {
      xpath: (element[0] === "null" || element[0] === "" || element[0] === "undefined") ? 'None' : element[0],
      id: (element[1] === "null" || element[1] === "" || (element[1] === "undefined")) ? 'None' : element[1],
      rxpath: (element[2] === "null" || element[2] === "" || (element[2] === "undefined")) ? 'None' : element[2],
      name: (element[3] === "null" || element[3] === "" || (element[3] === "undefined")) ? 'None' : element[3],
      classname: (element[5] === "null" || element[5] === "" || (element[5] === "undefined")) ? 'None' : element[5],
      cssselector: (element[12] === "null" || element[12] === "" || (element[12] === "undefined")) ? 'None' : element[12],
      href: (element[11] === "null" || element[11] === "" || (element[11] === "undefined")) ? 'None' : element[11],
      label: (element[10] === "null" || element[10] === "" || (element[10] === "undefined")) ? 'None' : element[10],
    }

    Object.entries(elementFinalProperties).forEach(([key, value], index) => {
      let currindex = rowdata.objectDetails.identifier.filter(element => element.identifier === key)
      dataValue.push({ id: currindex[0].id, identifier: key, key, value, name: defaultNames[key] })
    }
    )
    dataValue.sort((a, b) => a.id - b.id)
    setElementValues(dataValue)
    setElementProperties(true)
  }
  const Header = () => {
    return (
      <div>Element Identifier Order<span style={{ color: 'red' }}>*</span></div>
    );
  };
  const columns = [

    { field: 'id', header: 'Priority' },
    { field: 'name', header: 'Identifier' },
  ];
  const dynamicColumns = columns.map((col, i) => {
    return <Column key={col.field} columnKey={col.field} field={col.field} header={col.header} />;
  });
  const onRowReorderIdentifier = (e) => {
    const reorderedProducts = e.value.map((element, idx) => {
      element.id = idx + 1
      return element
    })
    setIdentifierList(reorderedProducts)

  }
  const footerContentIdentifier = (
    <div>
      <div style={{ position: 'absolute', fontStyle: 'italic' }}><span style={{ color: 'red' }}>*</span>Drag/drop to reorder identifiers.</div>
      <Button label="Cancel" onClick={() => setShowIdentifierOrder(false)} className="p-button-text" />
      <Button label="Save" onClick={() => saveIdentifier()} autoFocus />
    </div>
  )
  const saveIdentifier = () => {
    const finalScrapedItems = selectedCapturedElement.map(element => element.objectDetails.objId)
    let identifierListUpdated = identifierList.map(({ id, identifier }) => ({ id, identifier }))
    let params = {
      'objectIds': finalScrapedItems,
      'identifiers': identifierListUpdated,
      'param': 'updatedIdentifier',
      'userId': userInfo.user_id,
      'roleId': userInfo.role,

      // 'identifier'
    }
    scrapeApi.updateScreen_ICE(params)
      .then(response => {
        console.log(response)
        if (response == "Success") {
          setIdentifierModiefied(true)
          setShowIdentifierOrder(false)
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Element Identifier order updated successfully.', life: 5000 });
          setIdentifierList([{ id: 1, identifier: 'xpath', name: 'Absolute X-Path ' }, { id: 2, identifier: 'id', name: 'ID Attribute' }, { id: 3, identifier: 'rxpath', name: 'Relative X-Path' }, { id: 4, identifier: 'name', name: 'Name Attribute' }, { id: 5, identifier: 'classname', name: 'Classname Attribute' }, { id: 6, identifier: 'css-selector', name: 'CSS Selector' }, { id: 7, identifier: 'href', name: 'Href Attribute' }, { id: 8, identifier: 'label', name: 'Label' }])

        }
      })
      .catch(error => {
        console.log(error)
        setShowIdentifierOrder(false)
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Some Error occured while saving identifier list.', life: 5000 });
        setIdentifierList([{ id: 1, identifier: 'xpath', name: 'Absolute X-Path ' }, { id: 2, identifier: 'id', name: 'ID Attribute' }, { id: 3, identifier: 'rxpath', name: 'Relative X-Path' }, { id: 4, identifier: 'name', name: 'Name Attribute' }, { id: 5, identifier: 'classname', name: 'Classname Attribute' }, { id: 6, identifier: 'css-selector', name: 'CSS Selector' }, { id: 7, identifier: 'href', name: 'Href Attribute' }, { id: 8, identifier: 'label', name: 'Label' }])
      }
      )

  }

  return (
    <>
      {overlay && <ScreenOverlay content={overlay} />}
      {showPop && <PopupDialog />}
      {showConfirmPop && <ConfirmPopup />}
      <Toast ref={toast} position="bottom-center" baseZIndex={1000} />
      <Dialog className='dailog_box' header={headerTemplate} position='right' visible={props.visibleCaptureElement} style={{ width: '73vw', color: 'grey', height: '95vh', margin: 0 }} onHide={() => props.setVisibleCaptureElement(false)} footer={footerSave}>
        {showPanel && (<div className="card_modal">
          <Card className='panel_card'>
            <div className="action_panelCard">
              <div className='insprint__block'>
                <p className='insprint__text'>In Sprint Automation</p>
                <img className='info__btn' ref={imageRef1} onMouseEnter={() => handleMouseEnter('insprint')} onMouseLeave={() => handleMouseLeave('insprint')} src="static/imgs/info.png" title=' Automate test cases of inflight features well within the sprint before application ready'></img>
                <span className='insprint_auto' onClick={() => handleDialog('addObject')}>
                  <img className='add_obj' title=" Add a placeholder element by specifying element type." src="static/imgs/ic-add-object.png"></img>
                  <p>Add Element</p>
                </span>
                <span className='insprint_auto' onClick={() => handleDialog('mapObject')}>
                  <img className='map_obj' title=' Map placeholder elements to captured elements.' src="static/imgs/ic-map-object.png"></img>
                  <p>Map Element</p>
                </span>
                {/* {isInsprintHovered &&
                 
                (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 100}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>InSprint Automation</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)
                } */}
              </div>
              <div className='upgrade__block'>
                <p className='insprint__text'>Upgrade Analyzer</p>
                <img className='info__btn' ref={imageRef2} onMouseEnter={() => handleMouseEnter('upgrade')} onMouseLeave={() => handleMouseLeave('upgrade')} src="static/imgs/info.png" title='Easily upgrade Test Automation as application changes'></img>
                <span className='upgrade_auto' onClick={() => handleDialog('compareObject')}>
                  <img className='add_obj' src="static/imgs/ic-compare.png" title='Analyze screen to compare existing and newly captured element properties.'></img>
                  <p>Compare Element</p>
                </span>
                <span className='upgrade_auto' onClick={() => handleDialog('replaceObject')}>
                  <img className='map_obj' src="static/imgs/ic-replace.png" title=' Replace the existing elements with the newly captured elements.'></img>
                  <p>Replace Element</p>
                </span>
                {/* {isUpgradeHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 650}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Upgrade Analyzer</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a href='docs.avoautomation.com'>Learn More</a>
                </div>)} */}
              </div>
              <div className='utility__block'>
                <p className='insprint__text'>Capture from PDF</p>
                <img className='info__btn' ref={imageRef3} onMouseEnter={() => handleMouseEnter('pdf')} onMouseLeave={() => handleMouseLeave('pdf')} src="static/imgs/info.png" title='Capture the elements from a PDF.'></img>
                <span className='insprint_auto'>
                  <img className='add_obj' src="static/imgs/ic-pdf-utility.png"></img>
                  <p>PDF Utility</p>
                </span>
                {/* {isPdfHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 850}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Capture from PDF</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)} */}
              </div>
              <div className='createManual__block'>
                <p className='insprint__text'>Create Manually</p>
                <img className='info__btn' ref={imageRef4} onMouseEnter={() => handleMouseEnter()} onMouseLeave={() => handleMouseLeave()} src="static/imgs/info.png" title=' Create element manually by specifying properties.'></img>
                <span className='insprint_auto create__block' onClick={() => handleDialog('createObject')}>
                  <img className='map_obj' src="static/imgs/ic-create-object.png"></img>
                  <p>Create Element</p>
                </span>
                {/* {isCreateHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 1000}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Create Manually</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)} */}
              </div>
              <div className='imp_exp__block'>
                <span className='insprint_auto'>
                  <span className='import__block' onClick={() => setShowObjModal("importModal")}>
                    <img className='add_obj' src="static/imgs/ic-import.png" title=' Import elements from json or excel file exported from same/other screens.' />
                    <p className='imp__text'>Import Screen</p>
                  </span>
                  <span className='export__block' onClick={() => setShowObjModal("exportModal")}>
                    <img className='add_obj' src="static/imgs/ic-export.png"  title=' Export captured elements as json or excel file to be reused across screens/projects.'/>
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
            <Column field="selectall" header="Element Name"
              editor={(options) => cellEditor(options)}
              onCellEditComplete={onCellEditComplete}
              bodyStyle={{ cursor: 'url(static/imgs/Pencil24.png) 15 15,auto' }}
              bodyClassName={"ellipsis-column" + (capturedDataToSave.duplicate ? " ss__red" : "")}
            >
            </Column>
            <Column field="objectProperty" header="Element Type"></Column>
            <Column field="screenshots" header="Screenshots"></Column>
            <Column field="actions" header="Actions" body={renderActionsCell} />
          </DataTable>
          <Dialog className="ref_pop screenshot_pop" header={headerScreenshot} visible={screenshotData && screenshotData.enable} onHide={() => { setScreenshotData({ ...screenshotData, enable: false });setHighlight(false); setActiveEye(false) }} style={{ height: `${mirrorHeight}px`, position:"right" }}>
            <div className="screenshot_pop__content" >
              {highlight && <div style={{ display: "flex", position: "absolute", ...highlight }}></div>}
              <img className="screenshot_img" src={`data:image/PNG;base64,${screenshotData.imageUrl}`} alt="Screenshot Image" />
            </div>
          </Dialog>
        </div>
      </Dialog>
      <Dialog className={"compare__object__modal"} header="Capture Object:Sign up screen 1" style={{ height: "21.06rem", width: "24.06rem" }} visible={visible === 'capture'} onHide={handleBrowserClose} footer={visible === 'capture' ? footerCapture : footerAddMore}>
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

      {currentDialog === 'addObject' && <ActionPanel
        isOpen={currentDialog}
        OnClose={handleClose}
        addCustomElement={addedCustomElement}
        toastSuccess={toastSuccess}
        toastError={toastError}
      />}

      {currentDialog === 'mapObject' && <ActionPanel
        isOpen={currentDialog}
        OnClose={handleClose}
        captureList={capturedDataToSave}
        fetchingDetails={props.fetchingDetails}
        fetchScrapeData={fetchScrapeData}
        setShow={setCurrentDialog}
        toastSuccess={toastSuccess}
        toastError={toastError}
      />}

      {currentDialog === 'replaceObject' && <ActionPanel
        isOpen={currentDialog}
        OnClose={handleClose}
        toastSuccess={toastSuccess}
        toastError={toastError}
      />}

      {currentDialog === 'createObject' && <ActionPanel
        isOpen={currentDialog}
        OnClose={handleClose}
        scrapeItems={scrapeItems}
        capturedDataToSave={capturedDataToSave}
        setCapturedDataToSave={setCapturedDataToSave}
        setNewScrapedData={setNewScrapedData}
        updateScrapeItems={updateScrapeItems}
        setOrderList={setOrderList}
        setSaved={setSaved}
        setShow={setCurrentDialog}
        setCaptureData={setCaptureData}
        toastSuccess={toastSuccess}
        toastError={toastError}
      />}

      {currentDialog === 'compareObject' && <ActionPanel
        isOpen={currentDialog}
        OnClose={handleClose}
        toastSuccess={toastSuccess}
        toastError={toastError}
      />}

      {/* {currentDialog === 'importModal' && <ImportModal isOpen={currentDialog} OnClose={handleClose} fetchingDetails={props.fetchingDetails} fetchScrapeData={fetchScrapeData} />} */}
      {showObjModal === "importModal" && <ImportModal
        fetchScrapeData={fetchScrapeData}
        setOverlay={setOverlay}
        show={showObjModal}
        setShow={setShowObjModal}
        appType="Web"
        fetchingDetails={props.fetchingDetails}
        toastSuccess={toastSuccess}
        toastError={toastError}
      />}

      {showObjModal === "exportModal" && <ExportModal appType="Web" fetchingDetails={props.fetchingDetails} setOverlay={setOverlay} setShow={setShowObjModal} show={showObjModal} toastSuccess={toastSuccess} toastError={toastError}/>}
      {/* //Element properties  */}
      <Dialog header={"Element Properties"} draggable={false} position="right" editMode="cell" style={{ width: '66vw', marginRight: '3.3rem' }} visible={elementPropertiesVisible} onHide={() => setElementProperties(false)} footer={footerContent}>
        <div className="card">
          <DataTable value={elementValues} reorderableRows onRowReorder={onRowReorder}  >
            <Column rowReorder style={{ width: '3rem' }} />
            <Column field="id" header="Priority" headerStyle={{ justifyContent: "center", width: '10%', minWidth: '4rem', flexGrow: '0.2' }} bodyStyle={{ textAlign: 'left', flexGrow: '0.2', minWidth: '4rem' }} style={{ minWidth: '3rem' }} />
            {/* <column ></column> */}
            <Column field="name" header="Properties " headerStyle={{ width: '30%', minWidth: '4rem', flexGrow: '0.2' }} bodyStyle={{ flexGrow: '0.2', minWidth: '2rem' }} style={{ width: '20%', overflowWrap: 'anywhere', justifyContent: 'flex-start' }}></Column>
            <Column field="value" header="Value" editor={(options) => textEditor(options)} onCellEditComplete={onCellEditCompleteElementProperties} bodyStyle={{ cursor: 'url(static/imgs/Pencil24.png) 15 15,auto', width: '53%', minWidth: '34rem' }} style={{}}></Column>
          </DataTable>
        </div>
      </Dialog>
      {/* Element reorder */}
      <Dialog header={Header} style={{ width: '52vw', marginRight: '3rem' }} position="right" visible={showIdentifierOrder} onHide={() => setShowIdentifierOrder(false)} footer={footerContentIdentifier} >
        <div className="card" >
          <DataTable value={identifierList} reorderableColumns reorderableRows onRowReorder={onRowReorderIdentifier} >
            <Column rowReorder style={{ width: '3rem' }} />
            {dynamicColumns}
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
      identifier: scrapeObject.identifier
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
