import { React, useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import '../styles/CaptureScreen.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {Tag} from 'primereact/tag'
import { Card } from 'primereact/card';
import ActionPanel from '../components/ActionPanelObjects';
import { ScrapeData, disableAction, disableAppend, actionError, WsData, wsdlError, objValue ,CompareData,CompareFlag,CompareObj, CompareElementSuccessful} from '../designSlice';
import * as scrapeApi from '../api';
import { Messages as MSG } from '../../global/components/Messages';
import { v4 as uuid } from 'uuid';
import { RedirectPage, ScreenOverlay,ResetSession,setMsg } from '../../global';
import ImportModal from '../../design/containers/ImportModal';
import ExportModal from '../../design/containers/ExportModal';
// import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";
import ModalContainer from '../../global/components/ModalContainer';
import { Toast } from 'primereact/toast';
import { InputText } from "primereact/inputtext";
import { Tooltip } from 'primereact/tooltip';
import AvoModal from "../../../globalComponents/AvoModal";
import { RadioButton } from 'primereact/radiobutton';
// import LaunchApplication from '../components/LaunchApplication';
import "../styles/LaunchApplication.scss";
import {getDeviceSerialNumber_ICE} from "../api";
import { treemapSquarify } from 'd3';
import { TabMenu } from 'primereact/tabmenu';
import WebserviceScrape from './WebServiceCapture';
import EditIrisObject from '../components/EditIrisObject';

const CaptureModal = (props) => {
  const dispatch = useDispatch();
  const history=useNavigate()
  const toast = useRef();
  const objValues = useSelector(state => state.design.objValue);
  const compareSuccessful = useSelector(state => state.design.compareSuccessful);
  const compareFlag = useSelector(state=>state.design.compareFlag);
  const [visible, setVisible] = useState(false);
  const [visibleOtherApp, setVisibleOtherApp] = useState(false);
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
  const certificateInfo = useSelector(state=>state.design.cert);
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
  const[browserName,setBrowserName]=useState(null)
  const [saveDisable,setSaveDisable] = useState(true);
  //element properties states 
  const [elementPropertiesUpdated, setElementPropertiesUpdated] = useState(false)
  const [elementPropertiesVisible, setElementProperties] = useState(false);
  // console.log("elementPropertiesVisible",elementPropertiesVisible)
  const [elementValues, setElementValues] = useState([])
  const [isIdentifierVisible, setIsIdentifierVisible] = useState(false)
  const [regex, setRegex] = useState("")
  const [moveCardUp, setMoveCardUp] = useState(false)
  const [cardBottom, setCardBottom] = useState(null)
  const defaultIdentifier = [{ id: 1, identifier: 'xpath', name: 'Absolute X-Path ' }, { id: 2, identifier: 'id', name: 'ID Attribute' }, { id: 3, identifier: 'rxpath', name: 'Relative X-Path' }, { id: 4, identifier: 'name', name: 'Name Attribute' }, { id: 5, identifier: 'classname', name: 'Classname Attribute' }, { id: 6, identifier: 'cssselector', name: 'CSS Selector' }, { id: 7, identifier: 'href', name: 'Href Attribute' }, { id: 8, identifier: 'label', name: 'Label' }]
  const defaultNames = { xpath: 'Absolute X-Path', id: 'ID Attribute', rxpath: 'Relative X path', name: 'Name Attribute', classname: 'Classname Attribute', cssselector: 'CSS Selector', href: 'Href Attribute', label: 'Label' }
  const [showIdentifierOrder, setShowIdentifierOrder] = useState(false)
  const [identifierList, setIdentifierList] = useState([{ id: 1, identifier: 'xpath', name: 'Absolute X-Path ' }, { id: 2, identifier: 'id', name: 'ID Attribute' }, { id: 3, identifier: 'rxpath', name: 'Relative X-Path' }, { id: 4, identifier: 'name', name: 'Name Attribute' }, { id: 5, identifier: 'classname', name: 'Classname Attribute' }, { id: 6, identifier: 'cssselector', name: 'CSS Selector' }, { id: 7, identifier: 'href', name: 'Href Attribute' }, { id: 8, identifier: 'label', name: 'Label' }]);
  const [identifierModified, setIdentifierModiefied] = useState(false);
  const [parentData, setParentData] = useState({ id: props.fetchingDetails["_id"], name: props.fetchingDetails["name"] });
  const [idx, setIdx] = useState(0);
  const projectAppType = useSelector((state) => state.landing.defaultSelectProject);
  let NameOfAppType = projectAppType
  const imageRef1 = useRef(null);
  const imageRef2 = useRef(null);
  const imageRef3 = useRef(null);
  const imageRef4 = useRef(null);
const {endPointURL, method, opInput, reqHeader, reqBody,paramHeader} = useSelector(state=>state.design.WsData);
  const [cardPosition, setCardPosition] = useState({ left: 0, right: 0, top: 0 });
  const [selectedCapturedElement, setSelectedCapturedElement] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showEmptyMessage, setShowEmptyMessage] = useState(true);
  const [irisObject, setIrisObject] = useState(null);
  const [scrapeDataForIris,setScrapeDataForIris] = useState();
  const [cordData, setCordData] = useState({});
  const [irisScrapedData, setIrisScrapedData] = useState({});
  let addMore = useRef(false);


  useEffect(() => {
    fetchScrapeData()
  }, [parentData])
  useEffect(()=>{
    let browserName = (function (agent) {        

      switch (true) {

      case agent.indexOf("edge") > -1: return {name:"chromium",val:8};
      case agent.indexOf("edg/") > -1: return {name:"chromium",val:8};
      case agent.indexOf("chrome") > -1 && !!window.chrome: return {name:"chrome",val:1};
      case agent.indexOf("firefox") > -1: return {name:"mozilla",val:2};
      default: return "other";
   }

    })(window.navigator.userAgent.toLowerCase());

    setBrowserName(browserName.name)
    setSelectedSpan(browserName.val)
    
  },[])
  useEffect(() => {
    if(compareSuccessful){
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Elements updated successfuly.', life: 10000 });

    }
    if (endScrape || elementPropertiesUpdated || identifierModified||compareSuccessful) {
      fetchScrapeData();
      setEndScrape(false)
      setIdentifierModiefied(false)
      setElementPropertiesUpdated(false)
      dispatch(CompareElementSuccessful(false))
      
    }
  }, [parentData, endScrape, elementPropertiesUpdated, identifierModified,compareSuccessful])

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
  const textline4= {
    borderBottom: '1px solid black',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              width: '70%',
              padding: '0.9rem 0rem 1rem 0rem',
              outline: 'none !important',
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleReset = () => {
    setInputValue('');
  };

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
          setBrowserName("chrome")
          break;
        case 2:
          setBrowserName("mozilla")
          break;
        case 8:
          setBrowserName("chromium")
          break;
      }
    }
  };

  const toastError = (erroMessage) => {
    if (erroMessage && erroMessage.CONTENT) {
      toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(erroMessage), life: 5000 });
  }

  const toastSuccess = (successMessage) => {
    if (successMessage && successMessage.CONTENT) {
      toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'success', summary: 'Success', detail: JSON.stringify(successMessage), life: 5000 });
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

      case "form" || "fieldset":
        return "Forms";

      case "input" || "textarea":
        return "Textbox";

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
      scrapeApi.getScrapeDataScreenLevel_ICE(typesOfAppType, parentData.id, parentData.projectId, "")
        .then(data => {
          // current_task.subTask === "Scrape" (not sure !!)
          if (data.scrapedurl) setScrapedURL(data.scrapedurl);

          if (data === "Invalid Session") return RedirectPage(history);
          else if (typeof data === "object" && typesOfAppType !== "Webservice") {
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
            const irisObjectdata = []; for (let i = 0; i < data.view.length; i++) {   if (data.view[i].xpath === "iris") {     irisObjectdata.push('iris');   } else {     irisObjectdata.push('');   } } ;
           

          }
          else if (typeof data === "object" && typesOfAppType === "Webservice") {
            haveItems = data.view[0].endPointURL && data.view[0].method;
            if (haveItems) {

              let localReqBody = "";
              if (data.view[0].body) localReqBody = getProcessedBody(data.view[0].body, 'fetch');

              let localRespBody = "";
              if (data.view[0].responseBody) localRespBody = getProcessedBody(data.view[0].responseBody, 'fetch');

              dispatch(WsData({
                endPointURL: data.view[0].endPointURL,
                method: data.view[0].method,
                opInput: data.view[0].operations || "",
                reqHeader: data.view[0].header ? data.view[0].header.split("##").join("\n") : "",
                reqBody: localReqBody,
                paramHeader: data.view[0].param ? data.view[0].param.split("##").join("\n") : "",
                respHeader: data.view[0].responseHeader ? data.view[0].responseHeader.split("##").join("\n") : "",
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
          let newData = (viewString.length > 0 && !elementPropertiesUpdated) ? viewString.map((item, itemIdx) => {
            return (
              {
                
                selectall: item.custname,
                objectProperty: elementTypeProp(item.tag),
                screenshots: (item.left && item.top && item.width) ? <span className="btn__screenshot" onClick={item.objId?(event) => {
                  setScreenshotY(event.clientY);
                  setScreenshotData({
                    header: item.custname,
                    imageUrl: data.mirror || "",
                    enable: true
                  });
                  onHighlight();
                  // setHighlight(true);
                }:()=>toastError('Please save element')}>View Screenshot</span> : <span>No Screenshot Available</span>,
                actions: '',
                objectDetails: item,

              }
            )
          }) : newlyScrapeList.map((item) => {
            return (
              {
                selectall: item.custname,
                objectProperty: elementTypeProp(item.tag),
                browserscrape: 'google chrome',
                screenshots: (item.left && item.top && item.width)  ?  <span className="btn__screenshot" onClick={item.objId?() => {
                  setScreenshotData({
                    header: item.custname,
                    imageUrl: mirror.scrape || "",
                    enable: true
                  });
                  onHighlight();
                  setHighlight(true);
                }:()=>toastError('Please save element')}>View Screenshot</span> : <span>No screenshot available</span>,
                actions: '',
                objectDetails: item
              }
            )
          })
          setCaptureData(newData);
          addMore.current=false;
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
      setShowConfirmPop({'title': "Delete Scraped data", 'content': 'Screen has been reused. Are you sure you want to delete scrape objects?', 'onClick': ()=>{setShowConfirmPop(false); onDelete(null, true);}})
      return;
    }
    let deletedArr = [...deleted];
    let scrapeItemsL = [...captureData];
    let newOrderList = [];
    var capturedDataAfterSave = scrapeItemsL.filter(function (item) {

      return !selectedCapturedElement.find(function (objFromB) {
        if (item.objectDetails.val === objFromB.objectDetails.val) {
          if(item.objectDetails.objId){
            deletedArr.push(item.objectDetails.objId)}
          return true
        }
      })
    })
    let notused = scrapeItemsL.filter(item => {
      if (deletedArr.includes(item.objectDetails.custname)) {
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
    setNewScrapedCapturedData({...newScrapedCapturedData,view:newCapturedDataToSave})
    setSelectedCapturedElement([])
    // setNewScrapedCapturedData(newCapturedDataToSave)
    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Element deleted successfully', life: 5000 });
    setSaveDisable(false);
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
    // const newdeleted=deleted.filter(element=>element!==undefined)

    let params = {
      'deletedObj': deleted,
      'modifiedObj': modifiedObjects,
      'addedObj': { ...added, view: views },
      'screenId': parentData.id,
      'userId': userInfo.user_id,
      'roleId': userInfo.role,
      'param': 'saveScrapeData',
      'orderList': orderList
    }

    scrapeApi.updateScreen_ICE(params)
      .then(response => {
        if (response === "Invalid Session") return RedirectPage(history);
        else fetchScrapeData().then(resp => {
          addMore.current=false
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
              : toastSuccess(MSG.SCRAPE.SUCC_OBJ_SAVE);
            let numOfObj = scrapeItemsL.length;
            // setDisableBtns({save: true, delete: true, edit: true, search: false, selAll: numOfObj===0, dnd: numOfObj===0||numOfObj===1 });
          } else { console.error(resp); addMore.current = true; }
        }).catch(error => console.error(error));
      })
      .catch(error => console.error(error))
      setSaveDisable(true);
  }

  const startScrape = (browserType, compareFlag, replaceFlag) => {
    if (typesOfAppType === "Webservice") {
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

      if (error) dispatch(actionError(error));

      if (proceed) {
          dispatch(actionError([]));
          if (auth)
              keywordVal.push(...["addClientCertificate","setBasicAuth"])

          if (wsdlInputs[4]) keywordVal.splice(4, 0, 'setParamValue');
          else wsdlInputs.splice(4, 1);

          setOverlay("Fetching Response Header & Body...");
          ResetSession.start();
          for (let i = 0; i < wsdlInputs.length; i++) {
              if (wsdlInputs[i] !== "") {
                  testCaseWS.push(getWSTestCase(i, typesOfAppType, wsdlInputs[i], keywordVal[i]));
              }
          }
          testCaseWS.push(getWSTestCase(testCaseWS.length, typesOfAppType, "", "executeRequest"));
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
                  dispatch(WsData({respHeader: data.responseHeader[0].split("##").join("\n")}));
                  let localRespBody = getProcessedBody(data.responseBody[0], 'scrape');
                  dispatch(WsData({respBody: localRespBody}));
              } else setMsg(MSG.SCRAPE.ERR_DEBUG_TERMINATE);
          })
          .catch(error => {
              setOverlay("");
              ResetSession.end();
              console.error("Fail to initScrapeWS_ICE. ERROR::::", error);
              setMsg(MSG.SCRAPE.ERR_OPERATION);
          });
      }
  } 
  else{
    let screenViewObject = {};
    let blockMsg = 'Capturing in progress. Please Wait...';
    if (compareFlag) {
      blockMsg = 'Comparing Element in progress...';
      handleClose()
    };
    if (replaceFlag) {
      blockMsg = 'Capture and Replace Element in progress...';
    };
    screenViewObject = getScrapeViewObject(typesOfAppType, browserType, compareFlag, replaceFlag, mainScrapedData, newScrapedData);
    setOverlay(blockMsg);
    scrapeApi.initScraping_ICE(screenViewObject)
      .then(data => {
        let err = null;
        setOverlay("");
        setVisible(false);
        // ResetSession.end();
        if (data === "Invalid Session") return RedirectPage(history);
        else if (data === "Response Body exceeds max. Limit.")
          err = 'Scraped data exceeds max. Limit.' ;
        else if (data === 'scheduleModeOn' || data === "unavailableLocalServer") {
          let scrapedItemsLength = scrapeItems.length;
          if (scrapedItemsLength > 0) dispatch(disableAction(true));
          else dispatch(disableAction(false));
          setSaved({ flag: false });
          err =

              data === 'scheduleModeOn' ?
                MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT :
                MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.CONTENT

          
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
          toastError(err)
          return false;
        }
        //COMPARE & UPDATE SCRAPE OPERATION
        if (data.action === "compare") {
          if (data.status === "SUCCESS") {
              let compareObj = generateCompareObject(data, capturedDataToSave.filter(object => object.xpath.substring(0, 4)==="iris"));
              let [newScrapeList, newOrderList] = generateScrapeItemList(0, mainScrapedData);
          //     setScrapeItems(newScrapeList);
              setOrderList(newOrderList);
              dispatch(CompareFlag(true));
          //     setMirror(oldMirror => ({ ...oldMirror, compare: data.mirror}));
              dispatch(CompareData(data));
              dispatch(CompareObj(compareObj));
              
          // } else {
          //     if (data.status === "EMPTY_OBJECT")
          //         setMsg(MSG.SCRAPE.ERR_UNMAPPED_OBJ);
          //     else
          //         setMsg(MSG.SCRAPE.ERR_COMPARE_OBJ);
          
          }
        }
        else if (data.action === "replace") {
          let viewString = data;
          if (viewString.view.length !== 0){
              let lastIdx = newScrapedData.view ? newScrapedData.view.length : 0;
              let [scrapeItemList, newOrderList] = generateScrapeItemList(lastIdx, viewString, "new");
              setNewScrapedData(scrapeItemList);
              handleDialog("replaceObjectPhase2");
          } else {
              // setMsg(MSG.SCRAPE.ERR_NO_NEW_SCRAPE);
              toastError(MSG.SCRAPE.ERR_NO_NEW_SCRAPE);
            }               
        }
else{
        let viewString = data;
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
          setIrisScrapedData(updatedNewScrapeData);
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
      }
      })
      .catch(error => {
        setOverlay("");
        // ResetSession.end();
        toastError(MSG.SCRAPE.ERR_SCRAPE);
        console.error("Fail to Load design_ICE. Cause:", error);
      });
    }

  }

  const updateScrapeItems = newList => {
    setScrapeItems([...scrapeItems, ...newList])
  }

  const handleMouseEnterRow = (rowData) => {
    setHoveredRow(rowData.index);
  };


  const handleDelete = (rowData,confirmed) => {
    // const updatedData = captureData.filter((item) => item.selectall !== rowData.selectall);
    if (mainScrapedData.reuse && !confirmed) {
      setShowConfirmPop({'title': "Delete Scraped data", 'content': 'Screen has been reused. Are you sure you want to delete scrape objects?', 'onClick': ()=>{setShowConfirmPop(false); onDelete(null, true);}})
      return;
    }
    if(rowData.objectDetails.objId!== undefined && !rowData.objectDetails.duplicate){
    let deletedArr = [...deleted];
    let scrapeItemsL = [...captureData];
    let newOrderList = [];

    const capturedDataAfterDelete = captureData.filter(item =>
      item.objectDetails.objId !== rowData.objectDetails.objId
    );

    deletedArr.push(rowData.objectDetails.objId);

    let notused = scrapeItemsL.filter(item => {
      if (deletedArr.includes(item.objectDetails.objId)) {
        return false
      }
      else {
        newOrderList.push(item.objectDetails.objId)
      }
    })
    let newCapturedDataToSave = capturedDataAfterDelete.map(item => item.objectDetails)
    setCaptureData(capturedDataAfterDelete)
    setDeleted(deletedArr)
    setOrderList(newOrderList)
    setCapturedDataToSave(newCapturedDataToSave)
    setSelectedCapturedElement([])
    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Element deleted successfully', life: 5000 });
  }
  else {
    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Save the captured element before delete', life: 5000 });
  }
    // setCaptureData(updatedData);
    setSaveDisable(false);
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
    setScrapeDataForIris(rowData)
   let scrapeType = rowData?.objectDetails?.xpath?.split(';') !==undefined?rowData?.objectDetails?.xpath?.split(';'):" "
  //  setIrisObject(scrapeType[0]);
    return (
      <div >
        
        
        {!saveDisable?
        <Tooltip target=".edit__icon" position="bottom" content="Please Save Before edit the properties of elements." />:<Tooltip target=".edit__icon" position="bottom" content=" Edit the properties of elements." />}
        {  (scrapeType[0] === "iris" || typesOfAppType==="Web")  && 
        <button
        disabled={!saveDisable}
        onClick={() => {openElementProperties(rowData);}}
      >
        <img
          src="static/imgs/ic-edit.png"
          alt="Edit Icon"
          style={{ height: "20px", width: "20px", opacity: !saveDisable? 0.6 : 1}}
          className="edit__icon"
        />
      </button>
      
        }
        <Tooltip target=".delete__icon" position="bottom" content=" Delete the element." />
        <img

          src="static/imgs/ic-delete-bin.png"
          style={{ height: "20px", width: "20px", marginLeft:"0.5rem"}}
          className="delete__icon" onClick={() => handleDelete(rowData)} />


        

      </div>
    )

  };


  const handleMouseLeaveRow = () => {
    setHoveredRow(null);
  };

  const footerCapture = (
    <div className='footer__capture'>
      {visible === 'capture' && <Button size='small' className='save__btn__cmp' onClick={()=>{ setVisible(false); startScrape(browserName); setSaveDisable(false) }}>Capture</Button>}
      {visible === 'replace' && <Button size='small' className='save__btn__cmp' onClick={()=>{ setVisible(false); startScrape(browserName, '', 'replace'); }}>Replace</Button>}
    </div>
  )
  const footerCompare = (
    <div className='footer__capture'>
      <Button size='small' className='save__btn__cmp' onClick={()=>{ setVisible(false); startScrape(browserName,'compare'); }}>Compare</Button>
      
    </div>
  )

  const footerAddMore = (
    <div className='footer__addmore'>
      <Button size='small' onMouseDownCapture={() => { setVisible(false); startScrape(browserName); setSaveDisable(false) }}>Capture</Button>
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
        {captureData.length > 0 ? <div className='Header__btn'>
          <button className='add__more__btn' onClick={() => { setMasterCapture(false); handleAddMore('add more');}} >Add more</button>
          <Tooltip target=".add__more__btn" position="bottom" content="  Add more elements." />
          <button className="btn-capture" onClick={() => setShowNote(true)} >Capture Elements</button>
          <Tooltip target=".btn-capture" position="bottom" content=" Capture the unique properties of element(s)." />
        </div> : null
        }
      </div>
    </>
  );

  const emptyMessage = (
    <div className='empty_msg1'>
      <div className='empty_msg'>
        <img className="not_captured_ele" src="static/imgs/ic-capture-notfound.png" alt="No data available" />
        <p className="not_captured_message">Elements not captured</p>
        <Button className="btn-capture-single" onClick={() => {handleAddMore('add more');setVisibleOtherApp(true); setSaveDisable(false)}} >Capture Elements</Button>
        <Tooltip target=".btn-capture-single" position="bottom" content=" Capture the unique properties of element(s)." />
      </div>
    </div>
  );

const setAddmoreHandler = () => addMore.current = addMore.current && false;

const elementIdentifier=()=>{
  const identifierList=selectedCapturedElement.length>1?[{id:1,identifier:'xpath',name:'Absolute X-Path '},{id:2,identifier:'id',name:'ID Attribute'},{id:3,identifier:'rxpath',name:'Relative X-Path'},{id:4,identifier:'name',name:'Name Attribute'},{id:5,identifier:'classname',name:'Classname Attribute'},{id:6,identifier:'cssselector',name:'CSS Selector'},{id:7,identifier:'href',name:'Href Attribute'},{id:8,identifier:'label',name:'Label'}]:
  selectedCapturedElement[0].objectDetails.identifier.map(item=>({...item,name:defaultNames[item.identifier]}))
  setIdentifierList(identifierList)
  setShowIdentifierOrder(true)
}  
const footerSave = (
    <>
    {(selectedCapturedElement.length>0 && NameOfAppType.appType == "Web") ?<Button label="Element Identifier Order"onClick={elementIdentifier} ></Button>:null}
    {selectedCapturedElement.length>0?<Button label='Delete' style={{position:'absolute',left:'1rem',background:'#D9342B',border:'none'}}onClick={onDelete} ></Button>:null}
    <Button label='Cancel' outlined onClick={()=>props.setVisibleCaptureElement(false)}></Button>
    <Button label='Save' onClick={onSave} disabled={saveDisable}></Button>
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
    setActiveEye((prevActiveEye) => !prevActiveEye);
    if (activeEye !== false) {
      let objVal = selectedCapturedElement[0].objectDetails || {};
      let objValClone = { ...objVal };
      let keyCount = Object.keys(objVal).length;
      if (keyCount > 0) {
        keyCount++;
        objValClone['keycount'] = keyCount;
      }
      dispatch(objValue(objValClone));
    } else {
      setHighlight(true);
    }
  };

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
      if (ScrapedObject.xpath && !ScrapedObject.xpath.startsWith('iris')) {
        scrapeApi.highlightScrapElement_ICE(ScrapedObject.xpath, ScrapedObject.url, typesOfAppType.toLowerCase(), ScrapedObject.top, ScrapedObject.left, ScrapedObject.width, ScrapedObject.height)
          .then(data => {
            if (data === "Invalid Session") return RedirectPage(history);
            if (data === "fail") return null;
          })
          .catch(error => console.error("Error while highlighting. ERROR::::", error));
      }
    }
    else setHighlight(false);
    //eslint-disable-next-line
  }, [objValues])


  const handleDataTableContentChange = (newData) => {
    setShowEmptyMessage(newData.length === 0);
    setCaptureData(newData); // Assuming setCaptureData is the function to update DataTable content
  };

  const headerScreenshot = (
    <>
    <div className='header__screenshot__eye'>
    <div>
          <img data-test="eyeIcon" className="ss_eye_icon_screen"
            onClick={onHighlight}
            src={!activeEye ?
              "static/imgs/eye-active.svg" :
              "static/imgs/eye_disabled.svg"}
              alt='eyeIcon'
          />
        </div>
      <div className='header__popup screenshot_headerName'>
        <Tooltip target=".screenshot_headerName" content={screenshotData.header} position='bottom' ></Tooltip>
        <span>Screenshot</span> : {(screenshotData && screenshotData.header) ? screenshotData.header : ""}
      </div>
      </div>
    </>
  )
  const handleSave = (value, cellValue, customFlag = '') => {
    let localScrapeItems = [...capturedDataToSave];
    let updNewScrapedData = { ...newScrapedCapturedData };
    let objId = "";
    let isCustom = false;
    let obj = null;
    for (let scrapeItem of localScrapeItems) {
      if (scrapeItem.val === value) {
        scrapeItem.title = cellValue;
        scrapeItem.custname=cellValue
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
        else if (!isCustom) updNewScrapedData.view[scrapeItem.objIdx] = { ...newScrapedCapturedData?.view[scrapeItem.objIdx], custname: cellValue }
        // else only if customFlag is true
      };
    }
    setCapturedDataToSave(localScrapeItems)

    if (objId) {
      let modifiedDict = { ...modified }
      modifiedDict[objId] = obj;
      setModified(modifiedDict);
    }
    else if (!isCustom) setNewScrapedData(updNewScrapedData);
    if (!(cellValue.tag && cellValue.tag.substring(0, 4) === "iris")) setSaved({ flag: false });
    setScrapeItems(localScrapeItems);
    setSaveDisable(false);
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
      objects.isCustom=true
      addElementData.push(objects)
    })
    setCaptureData([...captureData, ...addElementData])
    setCapturedDataToSave([...capturedDataToSave, ...addedElements])
    setSaveDisable(false);
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
      setSelectedCapturedElement([])
  }
  const footerContent = (
    <div>
      <div style={{ position: 'absolute', fontStyle: 'italic' }}><span style={{ color: 'red' }}>*</span>Click on value fields to edit element properties.</div>
      <Button label="Cancel" onClick={() => { setElementProperties(false);setSelectedCapturedElement([]) }} className="p-button-text" style={{ borderRadius: '20px', height: '2.2rem' }} />
      <Button label="Save" onClick={saveElementProperties} autoFocus style={{ height: '2.2rem' }} />
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
    let element = rowdata?.objectDetails?.xpath?.split(';')
    if(element==undefined) return;
    setIrisObject(element[0])
    if(typesOfAppType==="Web" && element[0] !== 'iris' ){
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
    // if(irisObject !== "iris"){
    setElementProperties(true)
  // }

  }
  if(element[0]=="iris"){
    const data = {
      appType: typesOfAppType,
      fetchingDetails: props.fetchingDetails,
      setIdentifierList: setIdentifierList
    };
    
    let modalObject = {};
    
    modalObject = {
      operation: "editIrisObject",
      objectDetails: rowdata.objectDetails,
      modifyScrapeItem: (data, newProperties, customFlag) =>
        modifyScrapeItem(data, newProperties, customFlag),
      cord: (rowdata.objectDetails.objId? mainScrapedData.view : irisScrapedData?.view)[rowdata.objectDetails.objIdx].cord
    };
    
    console.log("Before calling scrapeDataForIris, modalObject:", modalObject);
    setCordData(modalObject)
    setScrapeDataForIris(modalObject);
    
  }

  
  
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
        if (response == "Success") {
          setIdentifierModiefied(true)
          setShowIdentifierOrder(false)
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Element Identifier order updated successfully.', life: 5000 });
          setIdentifierList([{ id: 1, identifier: 'xpath', name: 'Absolute X-Path ' }, { id: 2, identifier: 'id', name: 'ID Attribute' }, { id: 3, identifier: 'rxpath', name: 'Relative X-Path' }, { id: 4, identifier: 'name', name: 'Name Attribute' }, { id: 5, identifier: 'classname', name: 'Classname Attribute' }, { id: 6, identifier: 'cssselector', name: 'CSS Selector' }, { id: 7, identifier: 'href', name: 'Href Attribute' }, { id: 8, identifier: 'label', name: 'Label' }])

        }
      })
      .catch(error => {
        console.log(error)
        setShowIdentifierOrder(false)
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Some Error occured while saving identifier list.', life: 5000 });
        setIdentifierList([{ id: 1, identifier: 'xpath', name: 'Absolute X-Path ' }, { id: 2, identifier: 'id', name: 'ID Attribute' }, { id: 3, identifier: 'rxpath', name: 'Relative X-Path' }, { id: 4, identifier: 'name', name: 'Name Attribute' }, { id: 5, identifier: 'classname', name: 'Classname Attribute' }, { id: 6, identifier: 'cssselector', name: 'CSS Selector' }, { id: 7, identifier: 'href', name: 'Href Attribute' }, { id: 8, identifier: 'label', name: 'Label' }])
      }
      )

  }

  //showing toast msgs for map replace compare and export if the data is not captured:

  const handleCaptureClickToast = () => {
    if (captureData.length === 0 && isWebApp) {
      toast.current.show({
        severity: 'warn',
        summary: 'Capture Data',
        detail: 'Please capture the data before mapping.',
      });
    } else if (isWebApp) {
      handleDialog('mapObject');
    }
  };

  const handleCompareClick = () => {
    if (captureData.length === 0 && isWebApp) {
      toast.current.show({
        severity: 'warn',
        summary: 'Capture Data',
        detail: 'Please capture the data before comparing elements.',
      });
    } else if (isWebApp) {
      setVisible('compare');
    }
  };

  const handleReplaceClick = () => {
    if (captureData.length === 0 && isWebApp) {
      toast.current.show({
        severity: 'warn',
        summary: 'Capture Data',
        detail: 'Please capture the data before replacing elements.',
      });
    } else if (isWebApp) {
      setVisible('replace');
    }
  };

  const handleExportClick = () => {
    if (captureData.length === 0) {
      toast.current.show({
        severity: 'warn',
        summary: 'No Data',
        detail: 'There is no data to export.',
      });
    } else {
      setShowObjModal('exportModal');
    }
  };
  // const typesOfAppType = NameOfAppType.map((item) => item.apptype);
     
  const localStorageDefaultProject = localStorage.getItem('DefaultProject');
  if (localStorageDefaultProject) {
      NameOfAppType = JSON.parse(localStorageDefaultProject);
  }


     const isWebApp = NameOfAppType.appType === "Web";
     const typesOfAppType = NameOfAppType.appType;
     const onLaunchBtn =()=>{
      setVisibleOtherApp(false)
     }
     const items = [
      {label: 'Requests'},
      {label: 'Params'},
      {label: 'Response'},
  ];

     const renderElement=(rowdata, column)=>{
      return (
        <>
        {/* <Tooltip content={rowdata.selectall} target={`.tooltip__target-${rowdata.objectDetails.objId}`} tooltipOptions={{ position: 'right' }}></Tooltip> */}
        <div style={{display:'flex',justifyContent:'space-between'}}>
        <div 
        className={`tooltip__target-${rowdata.objectDetails.objId }
                  ${(rowdata.objectDetails.duplicate ? " ss__red" : "")}
                  ${((!rowdata.objectDetails?.objId && !rowdata.objectDetails.duplicate) ? " ss__newObj" : (!masterCapture && addMore.current && !rowdata.objectDetails?.objId)?" ss__newObj":"" )}`} title={rowdata.selectall}>{rowdata.selectall}</div>
        {rowdata.isCustomCreated && <Tag severity="info" value="Custom"></Tag>}
        {rowdata.objectDetails.isCustom && <Tag severity="primary" value="Proxy"></Tag>}
      </div>
      </>
      )
     }

     const APPtype_name = {
      width: '45.5rem',
      marginTop:'2rem'
    };
    const certificate_password={
      width:"45.5rem",
      marginTop:"2rem"
    }
    const AuthUser={
      width: "45.4rem",
      marginTop: "2rem"
    }
const AuthPassword={
  width: "45.4rem",
  marginTop: "2rem"
}
const headerstyle={
 textAlign: "center !important",
}


  

const modifyScrapeItem = (value, newProperties, customFlag) => {
  let localScrapeItems = [...capturedDataToSave];
  let updNewScrapedData = {...newScrapedCapturedData};
  let objId = "";
  let isCustom = false;
  let obj = null;
  for (let scrapeItem of localScrapeItems){
      if (scrapeItem.val === value) {
          scrapeItem.title = newProperties.custname;
          if (customFlag) {
              scrapeItem.tag = newProperties.tag;
              scrapeItem.url = newProperties.url;
              scrapeItem.xpath = newProperties.xpath;
              scrapeItem.editable = true;
          }
          objId = scrapeItem.objId;
          isCustom = scrapeItem.isCustom; 
          if (objId) obj = {...mainScrapedData.view[scrapeItem.objIdx], ...newProperties};
          else if (!isCustom) updNewScrapedData.view[scrapeItem.objIdx] = {...newScrapedCapturedData.view[scrapeItem.objIdx], ...newProperties}
          // else only if customFlag is true
      };
  }
  
  if (objId) {
      let modifiedDict = {...modified}
      modifiedDict[objId] = obj;
     setModified(modifiedDict);
  }
  else if (!isCustom) setNewScrapedCapturedData(updNewScrapedData);
  if(!(newProperties.tag && newProperties.tag.substring(0, 4) === "iris")) setSaved({ flag: false });
  setCapturedDataToSave(localScrapeItems);
}
  return (
    <>
     {overlay && <ScreenOverlay content={overlay} />}
      {showPop && <PopupDialog />}
      {showConfirmPop && <ConfirmPopup />}
      <Toast ref={toast} position="bottom-center" baseZIndex={1000} style={{ maxWidth: "35rem" }}/>
      <Dialog className='dailog_box' header={headerTemplate} position='right' visible={props.visibleCaptureElement} style={{ width: '73vw', color: 'grey', height: '95vh', margin: 0 }} onHide={() => props.setVisibleCaptureElement(false)} footer={typesOfAppType === "Webservice" ? null : footerSave}>
       <div className="card_modal">
          <Card className='panel_card'>
            <div className="action_panelCard">
              {!showPanel && <div className='insprint__block1'>
                <div>
                <p className='insprint__text1'>In Sprint Automation</p></div>
                </div>}
            {showPanel && <div className='insprint__block'>
                <p className='insprint__text'>In Sprint Automation</p>
                <img className='info__btn_insprint' ref={imageRef1} onMouseEnter={() => handleMouseEnter('insprint')} onMouseLeave={() => handleMouseLeave('insprint')} src="static/imgs/info.png" alt='info' ></img>
                <Tooltip target=".info__btn_insprint" position="bottom" content="Automate test cases of inflight features well within the sprint before application ready" />
                <span className={`insprint_auto ${!isWebApp ? "disabled" : ""}`} onClick={() => isWebApp && handleDialog('addObject')}>
                  <img className='add_obj_insprint' src='static/imgs/ic-add-object.png' alt='add element' />
                  {isWebApp &&  <Tooltip target=".add_obj_insprint" position="bottom" content="Add a placeholder element by specifying the element type." />}
                  <p>Add Element</p>
                </span>
                <span className={`insprint_auto ${!isWebApp ? "disabled" : ""}`} onClick={handleCaptureClickToast}>
                  <img className='map_obj_insprint' src="static/imgs/ic-map-object.png" alt='map element' ></img>
                  {isWebApp  && <Tooltip target=".map_obj_insprint" position="bottom" content=" Map placeholder elements to captured elements." />}

                  <p>Map Element</p>
                </span>
                {/* <Tooltip target=".info__btn" position="left" content="View training videos and documents." /> */}
                {/* {isInsprintHovered &&
               
                (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 100}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>InSprint Automation</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)
                } */}
              </div>}
              {!showPanel && <div className='upgrade__block'>
                <div className='panel_head'>
                <p className='insprint__text'>Upgrade Analyzer</p>
                </div>
                </div> }

              {showPanel && <div className='upgrade__block'>
                <p className='insprint__text'>Upgrade Analyzer</p>
                <img className='info__btn_upgrade' ref={imageRef2} onMouseEnter={() => handleMouseEnter('upgrade')} onMouseLeave={() => handleMouseLeave('upgrade')} src="static/imgs/info.png" ></img>
                <Tooltip target=".info__btn_upgrade" position="bottom" content="  Easily upgrade Test Automation as application changes" />
                <span className={`upgrade_auto ${!isWebApp ? "disabled" : ""}`}  onClick={handleCompareClick}>
                  <img className='add_obj_upgrade' src="static/imgs/ic-compare.png" ></img>
                  {isWebApp && <Tooltip target=".add_obj_upgrade" position="bottom" content="  Analyze screen to compare existing and newly captured element properties." />}
                  <p>Compare Element</p>
                </span>
                <span className={`upgrade_auto ${!isWebApp ? "disabled" : ""}`} onClick={handleReplaceClick}>
                  <img className='map_obj_upgrade' src="static/imgs/ic-replace.png" ></img>
                  {isWebApp && <Tooltip target=".map_obj_upgrade" position="bottom" content=" Replace the existing elements with the newly captured elements." />}
                  <p>Replace Element</p>
                </span>
                {/* {isUpgradeHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 650}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Upgrade Analyzer</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a href='docs.avoautomation.com'>Learn More</a>
                </div>)} */}
              </div>}
              {!showPanel && <div className='utility__block'>
                <div className='panel_head1'>
                <p className='insprint__text text-500'>Capture from PDF</p> </div>
                </div> }
               {showPanel && <div className='utility__block'>
                <p className='insprint__text text-500'>Capture from PDF</p>
                <img className='info__btn_utility' ref={imageRef3} onMouseEnter={() => handleMouseEnter('pdf')} onMouseLeave={() => handleMouseLeave('pdf')} src="static/imgs/info.png" ></img>
                <Tooltip target=".info__btn_utility" position="bottom" content="Capture the elements from a PDF."/>
                <span className="insprint_auto">
                  <img className='add_obj' src="static/imgs/ic-pdf-utility.png"></img>
                  <p className='text-600'>PDF Utility</p>
                </span>
                {/* {isPdfHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 850}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Capture from PDF</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)} */}
              </div>}

              {!showPanel && <div className='createManual__block'>
                <div className='panel_head2'>
                <p className='insprint__text'>Create Manually</p> </div>
                </div>}

              {showPanel && <div className='createManual__block'>
                <p className='insprint__text'>Create Manually</p>
                <img className='info__btn_create' ref={imageRef4} onMouseEnter={() => handleMouseEnter()} onMouseLeave={() => handleMouseLeave()} src="static/imgs/info.png" ></img>
                <Tooltip target=".info__btn_create" position="bottom" content="  Create element manually by specifying properties." />
                <span className={`insprint_auto create__block ${!isWebApp ? "disabled" : ""}`}   onClick={()=> isWebApp &&  handleDialog('createObject')}>
                  <img className='map_obj' src="static/imgs/ic-create-object.png"></img>
                  <p>Create Element</p>
                </span>
                {/* {isCreateHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 1000}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Create Manually</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)} */}
              </div>}

              {showPanel && <div className='imp_exp__block'>
                <span className='insprint_auto'>
                  <span className='import__block' onClick={() => setShowObjModal("importModal")}>
                    <img className=' pi-file-import add_obj_import' src="static/imgs/Import_new_icon_grey.svg"  />
                    {/* <i className="pi pi-file-import add_obj_import "  ></i> */}
                    <Tooltip target=".add_obj_import" position="left" content=" Import elements from json or excel file exported from same/other screens." />
                    <p className='imp__text'>Import Screen</p>
                  </span>
                  <span className="export__block"  onClick={handleExportClick}>
                    <img  className="add_obj_export" src="static/imgs/Export_new_icon_grey.svg" />
                    {/* <i className={`pi pi-file-export add_obj_export ${captureData.length === 0 ? "disabled-image" : ""}`} style={captureData.length === 0 ? { color: "#cccccc" }: {}}  ></i> */}
                    <Tooltip target=".add_obj_export" position="left" content=" Export captured elements as json or excel file to be reused across screens/projects." />
                    <p className='imp__text'>Export Screen</p>

                  </span>
                </span>
              </div>}
                <div style={{ display: 'flex'}}>
                  <span onClick={togglePanel} style={{ cursor: 'pointer' }}>
                  <Tooltip target=".icon-tooltip" content={showPanel ? 'Collapse Action Panel' : 'Expand Action Panel'} position="left" />
                    <i className={showPanel ? 'pi pi-chevron-circle-up up_arrow icon-tooltip' : 'pi pi-chevron-circle-down down_arrow icon-tooltip'} style={{ fontSize: '1rem'}}></i>
                  </span>
                </div>
            </div>

          </Card>
        </div>



        <div className="card-table" style={{ width: '100%', display: "flex",justifyContent:'center'}}>
          {typesOfAppType === "Webservice" ? <><WebserviceScrape setShowObjModal={setShowObjModal} saved={saved} setSaved={setSaved} fetchScrapeData={fetchScrapeData} setOverlay={setOverlay} startScrape={startScrape} setSaveDisable={setSaveDisable} fetchingDetails={props.fetchingDetails} /></> :
          <DataTable
            size="small"
            editMode="cell"
            className='datatable__col'
            value={captureData}
            dragHandleIcon="pi pi-bars"
            resizableColumns
            reorderableRows
            onRowReorder={handleRowReorder}
            showGridlines
            selectionMode={"single"}
            selection={selectedCapturedElement}
            onSelectionChange={onRowClick}
            tableStyle={{ minWidth: '50rem' }}
            headerCheckboxToggleAllDisabled={false}
            emptyMessage={showEmptyMessage ? emptyMessage : null} 
            scrollable 
            scrollHeight="400px"
            columnResizeMode="expand"
            virtualScrollerOptions={{ itemSize: 20 }}
          >
            {/* editMode="cell"
            onCellEdit={(e) => handleCellEdit(e)} */}
            {/* <Column style={{ width: '3em' }} body={renderRowReorderIcon} /> */}
            {/* <Column rowReorder style={{ width: '3rem' }} /> */}
            <Column headerStyle={{ width: '1rem'}} selectionMode='multiple'></Column>
            <Column field="selectall" header="Element Name" headerStyle={{ justifyContent: "center"}} 
              editor={(options) => cellEditor(options)}
              onCellEditComplete={onCellEditComplete}
              bodyStyle={{ cursor: 'url(static/imgs/Pencil24.png) 15 15,auto' }}
              bodyClassName={"ellipsis-column"}
              body={renderElement}
            >
            </Column>
            <Column style={{marginRight:"2rem"}}field="objectProperty" header="Element Type" sortable headerStyle={{ justifyContent: "center"}}></Column>
            <Column field="screenshots" header="Screenshot" headerStyle={{ justifyContent: "center"}}></Column>
            <Column field="actions" header="Actions" body={renderActionsCell} headerStyle={{ justifyContent: "center"}}/>
          </DataTable>
              }
          <Dialog className='screenshot__dialog' header={headerScreenshot} visible={screenshotData && screenshotData.enable} onHide={() => { setScreenshotData({ ...screenshotData, enable: false });setHighlight(false); setActiveEye(false);setSelectedCapturedElement([]) }} style={{height: `${mirrorHeight}px`}}>
              <div data-test="popupSS" className="ref_pop screenshot_pop" style={{height: `${mirrorHeight}px`, width:typesOfAppType==="Web"?'392px':typesOfAppType==="Desktop"?'487px':typesOfAppType==="OEBS"?'462px':typesOfAppType==="SAP"?'492px':""}}>
                <div className="screenshot_pop__content" >
                 <div className="scrsht_outerContainer" id="ss_ssId">
                  <div data-test="ssScroll" className="ss_scrsht_insideScroll">
                  { highlight && <div style={{display: "flex", position: "absolute", ...highlight}}></div>}
                  { (mirror.scrape || (mirror.compare && compareFlag)) ? <img id="ss_screenshot" className="screenshot_img" alt="screenshot" src={`data:image/PNG;base64,${compareFlag ? mirror.compare : mirror.scrape}`} /> : "No Screenshot Available"}
                  </div>
                 </div>
                </div>
            </div>
          </Dialog>
        </div>
      </Dialog>

         {typesOfAppType === "MobileWeb"? <LaunchApplication visible={visible} typesOfAppType={typesOfAppType} setVisible={setVisible} setSaveDisable={setSaveDisable} saveDisable={saveDisable} setShow={()=> setVisibleOtherApp(false)} appPop={{appType: typesOfAppType, startScrape: startScrape}} />: null}
        

        {typesOfAppType === "Desktop"? <LaunchApplication visible={visible} typesOfAppType={typesOfAppType} setVisible={setVisible} setSaveDisable={setSaveDisable} setShow={()=> setVisibleOtherApp(false)} appPop={{appType: typesOfAppType, startScrape: startScrape}} />: null}
        {typesOfAppType === "SAP"? <LaunchApplication visible={visible} typesOfAppType={typesOfAppType} setVisible={setVisible} setSaveDisable={setSaveDisable} setShow={()=> setVisibleOtherApp(false)} appPop={{appType: typesOfAppType, startScrape: startScrape}} />: null}
        {/* {typesOfAppType === "OEBS"? <AvoModal
          visible={visibleOtherApp}
          setVisible={setVisibleOtherApp}
          onModalBtnClick={onLaunchBtn}
          headerTxt="OEBS"
          footerType="Launch"
          modalSytle={{ width: "35vw", height: "29vh", background: "#FFFFFF" }}
         content = {<span className="p-input">
            <InputText placeholder="Enter Window Name" />
           </span>}
         customClass="OEBS"
        />: null} */}
        {typesOfAppType === "OEBS"? <LaunchApplication visible={visible} typesOfAppType={typesOfAppType} setVisible={setVisible} setSaveDisable={setSaveDisable} setShow={()=> setVisibleOtherApp(false)} appPop={{appType: typesOfAppType, startScrape: startScrape}} />: null}
        {typesOfAppType === "Mainframe"? <AvoModal
          visible={visibleOtherApp}
          setVisible={setVisibleOtherApp}
          onModalBtnClick={onLaunchBtn}
          headerTxt="MainFrames"
          footerType="Launch"
          modalSytle={{ width: "32vw", height: "43vh", background: "#FFFFFF" }}
         content = {"hello"}
         customClass="Mainframes"
        />: null}
        {typesOfAppType === "MobileApp"? <LaunchApplication visible={visible} typesOfAppType={typesOfAppType} setVisible={setVisible} setSaveDisable={setSaveDisable} setShow={()=> setVisibleOtherApp(false)} appPop={{appType: typesOfAppType, startScrape: startScrape}} />: null}
        {typesOfAppType === "System"? <AvoModal
          visible={visibleOtherApp}
          setVisible={setVisibleOtherApp}
          onModalBtnClick={onLaunchBtn}
          headerTxt="System_application"
          footerType="Launch"
          modalSytle={{ width: "32vw", height: "43vh", background: "#FFFFFF" }}
         content = {"hello"}
         customClass="MobileWeb"
        />: null}
      {typesOfAppType === "Web"? <Dialog className={"compare__object__modal"} header="Select Browser " style={{ height: "21.06rem", width: "24.06rem" }} visible={visible === 'capture' || visible === 'add more' || visible === 'replace' || visible === 'compare'} onHide={handleBrowserClose} footer={visible==='compare'?footerCompare:footerCapture} draggable={false}>
        <div className={"compare__object"}>
          <span className='compare__btn'>
            <p className='compare__text'>List of Browsers</p>
          </span>
          <span className='browser__col'>
            {/* <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/ic-explorer.png' onClick={() => { startScrape(selectedSpan) }}></img>Internet Explorer {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span> */}
            <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/chrome.png' />Google Chrome {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(2)} className={selectedSpan === 2 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png' />Mozilla Firefox {selectedSpan === 2 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(8)} className={selectedSpan === 8 ? 'browser__col__selected' : 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png' />Microsoft Edge {selectedSpan === 8 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
          </span>
        </div>
        {/* {visible === 'capture' && <div className='recapture__note'><img className='not__captured' src='static/imgs/not-captured.png' /><span style={{ paddingLeft: "0.2rem" }}><strong>Note :</strong>This will completely refresh all Captured Objects on the screen. In case you want to Capture only additional elements use the "Add More" option</span></div>} */}
      </Dialog> : null}
      {/* <ConfirmPopup visible={showNote} onHide={() => setShowNote(false)} message={confirmPopupMsg} icon="pi pi-exclamation-triangle" accept={() => {setMasterCapture(true);handleAddMore('capture')}} reject={()=>setShowNote(false)} position="Center" /> */}
      <AvoConfirmDialog
        visible={showNote}
        onHide={() => setShowNote(false)}
        showHeader={false}
        message={confirmPopupMsg}
        icon="pi pi-exclamation-triangle"
        accept={() => { setMasterCapture(true); handleAddMore('capture'); setSaveDisable(false) }} />
        
        {typesOfAppType === "Web"? <Dialog className={"compare__object__modal"} header={`Capture : ${parentData.name}`} style={{ height: "21.06rem", width: "24.06rem" }} visible={visible === 'add more'} onHide={handleBrowserClose} footer={footerAddMore} draggable={false}>
        <div className={"compare__object"}>
          <span className='compare__btn'>
            <p className='compare__text'>List of Browsers</p>
          </span>
          <span className='browser__col'>
            {/* <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/ic-explorer.png' onClick={() => { startScrape(selectedSpan) }}></img>Internet Explorer {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span> */}
            <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/chrome.png' />Google Chrome {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(2)} className={selectedSpan === 2 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png' />Mozilla Firefox {selectedSpan === 2 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(8)} className={selectedSpan === 8 ? 'browser__col__selected' : 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png' />Microsoft Edge {selectedSpan === 8 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
          </span>
        </div>
      </Dialog> : null}

      {currentDialog === 'addObject' && <ActionPanel
        isOpen={currentDialog}
        OnClose={handleClose}
        addCustomElement={addedCustomElement}
        toastSuccess={toastSuccess}
        toastError={toastError}
        elementTypeProp ={elementTypeProp}
        captureData={captureData}
        capturedDataToSave={capturedDataToSave}
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
        elementTypeProp ={elementTypeProp}
      />}

      {(currentDialog === 'replaceObject' || currentDialog === 'replaceObjectPhase2') && <ActionPanel
        isOpen={currentDialog}
        OnClose={handleClose}
        fetchingDetails={props.fetchingDetails}
        fetchScrapeData={fetchScrapeData}
        captureList={capturedDataToSave}
        setShow={setCurrentDialog}
        newScrapedData={newScrapedData}
        startScrape={startScrape}
        toastSuccess={toastSuccess}
        toastError={toastError}
        setOverlay={setOverlay}
        setShowPop={setShowPop}
        parentData={parentData}
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
        setSaveDisable={setSaveDisable}
      />}

      {(currentDialog === 'compareObject' || compareFlag)&& <ActionPanel 
       isOpen={'compareObject'} 
       OnClose={handleClose} 
      startScrape={startScrape} 
      mainScrapedData={mainScrapedData} 
      fetchingDetails={props.fetchingDetails} 
      orderList={orderList}
      fetchScrapeData={fetchScrapeData}
      setShow={setCurrentDialog}
      toastSuccess={toastSuccess}
      toastError={toastError}
      elementTypeProp={elementTypeProp}
      />}


      {showObjModal === "importModal" && <ImportModal
        fetchScrapeData={fetchScrapeData}
        setOverlay={setOverlay}
        show={showObjModal}
        setShow={setShowObjModal}
        appType={typesOfAppType}
        fetchingDetails={props.fetchingDetails}
        toastSuccess={toastSuccess}
        toastError={toastError}
        setSaveDisable={setSaveDisable}
      />}
      {showObjModal === "exportModal" && <ExportModal appType={typesOfAppType} fetchingDetails={props.fetchingDetails} setOverlay={setOverlay} setShow={setShowObjModal} show={showObjModal} toastSuccess={toastSuccess} toastError={toastError} />}
      {/* //Element properties  */}
      {irisObject === "iris" ? <EditIrisObject utils={scrapeDataForIris} cordData={cordData} setElementProperties={setElementProperties} elementPropertiesVisible={elementPropertiesVisible} setShow={setShowObjModal} setCapturedDataToSave={setCapturedDataToSave} setModified={setModified} capturedDataToSave={capturedDataToSave} setNewScrapedCapturedData={setNewScrapedCapturedData}  toastSuccess={toastSuccess}
        toastError={toastError} newCapturedDataToSave={newScrapedCapturedData} setShowPop={setShowPop} taskDetails={{ projectid: props.fetchingDetails.projectID, screenid: props.fetchingDetails["_id"], screenname: props.fetchingDetails.name, versionnumber: 0 /** version no. not avail. */, appType: typesOfAppType }} />
        :
        <>
        {typesOfAppType ==="Web"?
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
        </Dialog>: null }</>}
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
  compareObj['fullScrapeData'] = data.view[3].newElements;
  return compareObj;
}

const LaunchApplication = props => {

    const [error, setError] = useState({});
    const [serialNumbers, setSerialNumber] = useState([]);
    const [checked, setChecked] = useState(true);
   

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
        if (!windowName && !processID) setError({windowName: !windowName, processID: !processID})
        else {
            setError(false);
            setTimeout(()=>props.appPop.startScrape(scrapeObject), 1);
            props.setSaveDisable(false);
        }
    }

    const desktopApp = {
        'content':<div className='allContent'>
          <div className="flex flex-wrap gap-3">
            <h4>Object Identification :</h4>
            <div className="flex align-items-center">
              <RadioButton data-test="methodA" className="ss__dsktp_method_rad" type="radio" name="method" value="A" checked={selectedMethod === "A"} onChange={onMethodSelect}   />
              <label htmlFor="ingredient1" className="ml-2">Method A</label>
            </div>
            <div className="flex align-items-center">
              <RadioButton data-test="methodB" className="ss__dsktp_method_rad" type="radio" name="method" value="B" checked={selectedMethod === "B"} onChange={onMethodSelect}  />
              <label htmlFor="ingredient2" className="ml-2">Method B</label>
            </div>
          </div>
          <span className="p-input">
                <InputText data-test="windowName" className={'ss__dsktp_wndw_name'+(error.windowName ? " la_invalid": "")} placeholder="Enter Window Name" value={windowName} onChange={windowNameHandler} name="desktopWindowName" />
              </span>
              <span className="p-input">
                <InputText data-test="processID" className={"ss__dsktp_prc_id"+(error.processID ? " la_invalid" : "")} value={processID} onChange={processIDHandler} name="desktopProcessId"  placeholder="Enter Process ID" />
              </span>
        </div>,
        'footer': <div className="ss__sdkpt_footer">
            {/* <span className="ss__dskp_footer_span">
                Object Identification: 
                <label className="ss__dsktp_method">
                    <input data-test="methodA" className="ss__dsktp_method_rad" type="radio" name="method" value="A" checked={selectedMethod === "A"} onChange={onMethodSelect}/>Method A
                </label>
                <label className="ss__dsktp_method">
                    <input data-test="methodB" className="ss__dsktp_method_rad" type="radio" name="method" value="B" checked={selectedMethod === "B"} onChange={onMethodSelect}/>Method B
                </label>
            </span> */}
            <input type="submit" data-test="desktopLaunch" onClick={onDesktopLaunch} style={{width: "100px"}} value="Launch" />
        </div>,
        'footerAction': onDesktopLaunch
    }


    // SAP

    const [appName, setAppName] = useState("");
    const appNameHandler = event => setAppName(event.target.value);

    const onSapLaunch = () => {
        let scrapeObject = {
            'appName' : appName
        }
        if (!appName) setError({appName: !appName})
        else {
            setError(false);
            setTimeout(()=>props.appPop.startScrape(scrapeObject), 1);
            props.setSaveDisable(false)
        }
    }

    const sapApp = {
        'content': <input data-test="exePath" className={'ss__sap_input'+(error.appName ? " la_invalid" : "")} name="sapWindowName" placeholder='Enter the .exe path;App Name' value={appName} onChange={appNameHandler}/>,
        'footer': <input type="submit" data-test="sapLaunch" onClick={onSapLaunch} style={{width: "100px"}} value="Launch" />,
        'footerAction': onSapLaunch
    }

    // Mobile App

    const [os, setOS] = useState("");
    const [checkedForMobApp,setCheckedForMobApp]=useState(false)

    const [appPath, setAppPath] = useState("");
    const appPathHandler = event => {
        let value = event.target.value.trim();
        const appPath = value.toString().replaceAll('"', "");
        setAppPath(appPath);
        }

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
        if ( os === "ios" && (!appPath2 || !verNum | !deviceName || !uuid))
            setError({appPath2: !appPath2, verNum: !verNum, deviceName: !deviceName, uuid: !uuid})
        else if (os === "android" && (!appPath || !sNum))
            setError({appPath: !appPath, sNum: !sNum})
        else {
            setError(false);
            setTimeout(()=>props.appPop.startScrape(scrapeObject), 1);
            props.setSaveDisable(false)
        }
    }

    const handleSerialNumber = () => {
      setOS("android")
      console.log("handleSerial")
        setError(false);
        getDeviceSerialNumber_ICE().then(data => {
            if(data) {}
            setSerialNumber(data);
            console.log(data);
        }).catch(error => {
            console.log(error);
        })
    }

    const MobileApps = {
        'content':<div className={os==="ios"?'inputIos':'inputContent'}>
           <div className="flex flex-wrap gap-3">
  <div className="flex align-items-center">
    <RadioButton
      className="ss__dsktp_method_rad"
      data-test="chooseAndriod"
      type="radio"
      name="method"
      value="A"
      onChange={
        handleSerialNumber
      }
      checked={os === 'android'} 
      // defaultChecked={true} // Set this to true for default selection
      
    />
    <label htmlFor="ingredient1" className="ml-2">
      Android
    </label>
  </div>
  <div className="flex align-items-center">
    <RadioButton
      data-test="chooseAndriod"
      className="ss__dsktp_method_rad"
      type="radio"
      name="method"
      value="B"
      onChange={() => {
        setOS("ios");
        setError(false);
        setCheckedForMobApp(true);
      }}
      checked={os === 'ios'}
    />
    <label htmlFor="ingredient2" className="ml-2">
      iOS
    </label>
  </div>
</div>

          {os === "android" &&
            <div className='AndroidContent'>
                <InputText data-test="andriodAppPath" placeholder="Enter Application Path" value={appPath} onChange={appPathHandler} name="appPath_a" />
              <select data-test="andriodSerialNumber" className='versionSelect' placeholder="Enter mobile serial number" value={sNum} onChange={sNumHandler} name="serNum_a" >
                <option value="" disabled>Select Mobile Serial Number</option>
                {serialNumbers.map((serialNumber) => (
                  <option key={serialNumber} value={serialNumber}>{serialNumber}</option>
                ))}
              </select>
              </div>}
            {os === "ios" &&
          <div className='iOSContent'>
              <InputText data-test="iosApppath"  placeholder="Enter Application path" value={appPath2} onChange={appPath2Handler} name="appPath2_i"  />
              <InputText data-test="iosVersionNumber"  placeholder='Enter Version Number' value={verNum} onChange={verNumHandler} name="verNum_i" />
              <InputText Textdata-test="iosDeviceName"  placeholder='Enter Device Name'value={deviceName} onChange={deviceNameHandler} name="deviceName_i"  />
              <InputText data-test="iosUDID"  placeholder='Enter UUID' value={uuid} onChange={uuidHandler} name="uuidNum_i" />
            </div>}
        </div>,

        'footer': <input type="submit" data-test="mobileAppLaunch" onClick={onMobileAppLaunch} style={{width: "100px"}} value="Launch" />,
        'footerAction': onMobileAppLaunch
    }

    // OEBS

    const [winName, setWinName] = useState("");
    const winNameHandler = event => setWinName(event.target.value);

    const onWinLaunch = () => {
        let scrapeObject = {
            'winName' : winName
        }
        if (!winName) setError({winName: !winName})
        else {
            setError(false);
            setTimeout(()=>props.appPop.startScrape(scrapeObject), 1);
            props.setSaveDisable(false)
        }
    }

    const oebsApp = {
        'content': <input data-test="oebsWinName" className={'ss__oebs_input'+(error.winName ? " la_invalid": "")} placeholder='Enter window name' value={winName} onChange={winNameHandler} name="oebsWindowName" />,
        'footer': <input type="submit" data-test="oebsLaunch" onClick={onWinLaunch} style={{width: "100px"}} value="Launch" />,
        'footerAction': onWinLaunch
    }
    
    
    // Mobile Web

    const [slNum, setSlNum] = useState("");
    const slNumHandler = event => setSlNum(event.target.value);

    const [vernNum, setVernNum] = useState("");
    const vernNumHandler = event => setVernNum(event.target.value);

    const onMobileWebLaunch = () => {
        let scrapeObject = {
            'slNum': slNum,
            'vernNum': vernNum
        }
        if (!slNum || !vernNum) setError({slNum: !slNum, vernNum: !vernNum});
        else {
            setError(false);
            setTimeout(()=>props.appPop.startScrape(scrapeObject), 1);
            props.setSaveDisable(false)
        }
    }

    const mobileWeb = {
        'content': <div className="ss__mblweb_inputs">    
            <input data-test="MWserdev" className={"ss__mblweb_input"+(error.slNum ? " la_invalid": "")} placeholder="AndroidDeviceSerialNumber/iOSDeviceName" value={slNum} onChange={slNumHandler} name="mobWebInput1" /> 
            <input data-test="MWversion" className={"ss__mblweb_input"+(error.vernNum ? " la_invalid": "")} placeholder="Android/iOSVersion;UDID(for iOS device only)" value={vernNum} onChange={vernNumHandler} name="mobWebInput2" />
        </div>,

        'footer': <input type="submit" data-test="MWLaunch" onClick={onMobileWebLaunch} style={{width: "100px"}} value="Launch" />,
        'footerAction': onMobileWebLaunch
    }

    const appDict = {'Desktop': desktopApp, "SAP": sapApp, 'MobileApp': MobileApps, 'OEBS': oebsApp, 'MobileWeb': mobileWeb}

    return (
      <div className="ss__launch_app_dialog">
          <AvoModal
            visible={props.visible}
            setVisible={()=>{}}
            onModalBtnClick={(input)=> input ==="Cancel"  ? props.setVisible(false) : appDict[props.appPop.appType].footerAction() }
            // footer = {appDict[props.appPop.appType].footer}
            headerTxt={props.typesOfAppType}
            footerType="Launch"
            modalSytle={{ width:checkedForMobApp? "34vw" : "32vw", height:props.typesOfAppType === "Desktop" || checkedForMobApp? "53vh" : "33vh", background: "#FFFFFF" }}
            content={appDict[props.appPop.appType].content}
          customClass={props.typesOfAppType}
          />
      </div> 
  );
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

function parseJsonRequest(requestedBody, base_key, cur_key, xpath) {
	let xpaths=xpath;
	try {
     	for (let key in requestedBody){
			 var value=requestedBody[key];
			 if (typeof(value)==="object" && !(Array.isArray(value))){
				if (base_key!== "")  base_key+='/'+key;
				else base_key=key;
				xpaths.push(base_key);
				parseJsonRequest(value,base_key,key,xpaths);
				base_key=base_key.slice(0,-key.length-1);
			 } else if (Array.isArray(value)) {
				for (var i=0;i<value.length;i++){
					base_key+=key+"["+i.toString()+"]";
					parseJsonRequest(value[i],base_key,key,xpaths);
				}
			 } else {
				xpaths.push(base_key+'/'+key);
			 }
		 }
		 base_key=base_key.slice(0,-cur_key.length);
	} catch (exception) {
		console.error("Exception in the function parseRequest: ERROR::::", exception);
	}
	return xpaths;
}

function parseRequestParam(parameters){
	let paramsArray=[];
    try{
		var params=parameters.split('##');
		for (let object of params) {
			object=object.split(":");
			let scrapedObjectsWS = {};
			scrapedObjectsWS.xpath = object[0].trim();
			scrapedObjectsWS.custname = object[0].trim();
			scrapedObjectsWS.tag = "elementWS";
			paramsArray.push(scrapedObjectsWS);
		}
	}catch (Exception){
		console.error(Exception);
	}	
	return paramsArray										
}