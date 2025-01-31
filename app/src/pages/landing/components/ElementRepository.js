import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ContextMenu } from 'primereact/contextmenu';
import { Button } from 'primereact/button';
import '../styles/ElementRepository.scss';
import { getScreens } from '../api';
import { useDispatch, useSelector } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { loadUserInfoActions } from '../LandingSlice';
import CaptureModal from '../../design/containers/CaptureScreen';
import { Toast } from 'primereact/toast';
import * as scrapeApi from '../../design/api';
import { v4 as uuid } from 'uuid';
import { insertScreen } from '../../design/api';
import { insertRepository } from '../../design/api';
import { Tag } from 'primereact/tag';
import { ScreenOverlay,RedirectPage } from '../../global';
import { Dialog } from 'primereact/dialog';
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'primereact/tooltip';
import { Card } from 'primereact/card';
import { OverlayPanel } from 'primereact/overlaypanel';

const ElementRepository = (props) => {
  const history = useNavigate();
  const [copiedRow, setCopiedRow] = useState(null);
  const contextMenuRef = useRef(null);
  const [contextMenuModel, setContextMenuModel] = useState([]);
  const [showCaptureElement, setShowCaptureElement] = useState(false);
  const [activeAccordionIndex, setActiveAccordionIndex] = useState(null);
  const [accordionIndex, setAccordionIndex] = useState(null)
  const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
  let defaultselectedProject = reduxDefaultselectedProject;
  const [screenData, setScreenData] =  useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newScreenCount, setNewScreenCount] = useState(1);
  const dispatch = useDispatch();
  const [screenDetails, setScreenDetails] = useState({});
  const captureElements = useSelector((state) => state.landing.openCaptureScreen);
  let userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const toast = useRef();
  const [copiedScreenData, setCopiedScreenData] = useState({});
  const [elementPropertiesVisible, setElementProperties] = useState(false);
  const [selectedCapturedElement, setSelectedCapturedElement] = useState([]);
  const [elementValues, setElementValues] = useState([]);
  const [scrapeDataForIris,setScrapeDataForIris] = useState();
  const [cordData, setCordData] = useState({});
  const defaultNames = { xpath: 'Absolute X-Path', id: 'ID Attribute', rxpath: 'Relative X path', name: 'Name Attribute', classname: 'Classname Attribute', cssselector: 'CSS Selector', href: 'Href Attribute', label: 'Label' }
  const [irisObject, setIrisObject] = useState(null);
  const [reusedDeleteElement, setResusedDeleteElement] = useState(false)
  const [deleteElements, setDeleteElements] = useState(false);
  const [reuseDelMessage, setReuseDelMessage] = useState();
  const [screenBasedElements, setScreenBasedElements] = useState([]);
  const [modified, setModified] = useState([]);
  const [uiniqueElement, setUniqueElement] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [orderList, setOrderList] = useState([]);
  // const [selectedCapturedElement, setSelectedCapturedElement]
  const [value, setValue] =  useState('');
  const [screenId, setScreenId] =  useState(false);
  const refreshRepository = useSelector((state) => state.landing.updateElementRepository);
  const [updatePastedData, setUpdatPastedData] = useState(false);
  const [updateDeleteCurrentElements, setUpdateDeleteCurrentElements] = useState(false);
  const [deleteScreens, setDeleteScreens] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const [screenRename,setScreenRename] =  useState("");
  const [elementPropertiesUpdated, setElementPropertiesUpdated] = useState(false);
  const [pastedData, setPastedData] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] =  useState("");
  // const [showTestCases, setShowTestCases] = useState(false);
  const op = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [repositoryName, setRepositoryName] = useState("");
  const [noRepository, setNoRepoSitory] = useState(false);


  const testcasename=[
    {label:"testcase 1"},
    {label:"testcase 2"},
    {label:"testcase 3"}
  ]


    const localStorageDefaultProject = localStorage.getItem('DefaultProject');
    if (localStorageDefaultProject) {
        defaultselectedProject = JSON.parse(localStorageDefaultProject);
    }


  useEffect(() => {
    (async () => {
        try {
            let params = {
              param : "globalRepo",
              projectId :  defaultselectedProject.projectId
            }

            setOverlay("Fetching Repository Details...")
            const screens = await getScreens(params);
            if(screens === 'fail') {
              setScreenData([]);
              toast.current.show({ severity: 'error', summary: 'Error', detail: 'Empty Element Repository.', life: 5000 });}
            else if(screens === "no orderlist present") {
              setScreenData([]);
              toast.current.show({ severity: 'error', summary: 'Error', detail: 'No orderlist present.', life: 5000 });}
            else if(screens === "invalid session") return RedirectPage(history);
            else {
              setOverlay("")
              setScreenData(screens.screenList.reverse());
              setFilteredData(screens.screenList)
              setScreenId(false);
              setSearchText("");
              setNoRepoSitory(false);
            }
        } catch (error) {
          setOverlay("")
            console.error('Error fetching User list:', error);
        }
    })();
}, [defaultselectedProject.projectId, showCaptureElement,screenId,updatePastedData,updateDeleteCurrentElements]);

  
  const copyRow = (selectedRowData) => {
    setCopiedRow(selectedRowData);
  };


  useEffect(() => {
    if(copiedRow!==null){
    // Assuming copiedScreenData is a state variable
    if(accordionIndex !== null && pastedData){const updatedScreen = screenData[accordionIndex];
    setCopiedScreenData(updatedScreen);
      let orderlist=copiedRow.map(element=>element._id)
    // Now, construct the params object using the updatedScreen
    let params = {
      deletedObj: [],
      modifiedObj: [],
      addedObj: { },
      screenId: updatedScreen["_id"],
      userId: userInfo.user_id,
      roleId: userInfo.role,
      param: 'screenPaste',
      orderList: orderlist
    };

    scrapeApi.updateScreen_ICE(params)
    .then(response =>  {
        if(copiedRow!==null){
        if (response === "fail") toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to paste the Data.', life: 5000 });
        else if(response === "invalid session") return RedirectPage(history);
        else {
          setCopiedRow(null);
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Elements copied.', life: 5000 });
          setUpdatPastedData(true);
          setPastedData(false);
          setSelectedCapturedElement([]);
        }
        
        
  }})
   .catch(error => console.log(error))
    }
  }
    // Use params as needed
  }, [accordionIndex,pastedData]);

  const pasteRow = (targetAccordionIndex) => {
    setAccordionIndex(targetAccordionIndex);
    if (copiedRow !== null) {
      setScreenData((prevScreens) => {
        const updatedScreens = prevScreens.map((screen, index) =>
          index === targetAccordionIndex
            ? {
                ...screen,
                // related_dataobjects: [...screen.related_dataobjects, copiedRow],
                // orderlist: [...screen.orderlist, copiedRow["_id"]],
                related_dataobjects: screen.related_dataobjects.length === 0
                ? [...copiedRow]
                : [...screen.related_dataobjects, ...copiedRow],
              orderlist: screen.orderlist ? [...screen.orderlist, ...copiedRow.map(element=>element._id)] : [...copiedRow.map(element=>element._id)]
              }
            : screen
        );
        console.log(updatedScreens)
        return updatedScreens;
        setPastedData(true)
      });
      setPastedData(true);
    }
    else toast.current.show({ severity: 'error', summary: 'Error', detail: 'Copy any row before pasting.', life: 5000 });
  };


  const renderElementName = (rowData) => {
    const matchingDataArray = screenData.reduce((result, screenItem) => {
      // Check if orderlist exists in screenItem
      if (screenItem.orderlist) {
        const matchingOrderItem = screenItem.orderlist?.find((orderItem) => {
          if(typeof orderItem=="string"){
           return orderItem === rowData?._id
          }
          else{
            return orderItem?._id === rowData?._id && orderItem?.flag === true;
          }
        });
    
        if (matchingOrderItem) {
          result.push(matchingOrderItem);
        }
      }
    
      return result;
    }, []);

    const isUnique = (arr, prop) => {
      const seen = new Set();
      return arr.filter(obj => {
        const value = obj[prop];
        if (!seen.has(value)) {
          seen.add(value);
          return true;
        }
        return false;
      });
    };
    

    const uniqueArray = isUnique(matchingDataArray, '_id');
    console.log(uniqueArray)
    // dispatch(loadUserInfoActions.updateElementRepository(true));
    return (
      <>
        <div className='flex justify-content-between'>
          <div className="flex flex-row" title={rowData.custname}>
          {rowData.custname && rowData.custname.length > 20 ? rowData.custname.substring(0, 20) + '...' : rowData.custname}
          </div>
          <div>{Array.isArray(uniqueArray) && uniqueArray.length > 0 && uniqueArray.map((item)=>(
              item.flag === true ?<img src='static/imgs/Reused_icon.svg' className='reused__icon' /> : ""
            ))}
          </div>
          {/* <div>
            <img src='static/imgs/elements_used_in tescases_icon.svg' className='element_used_testcase' onMouseEnter={(e) => op.current.toggle(e)} onMouseLeave={()=> op.current.hide()}/>
          </div>
            <OverlayPanel ref={op} className='overlay_panel'>
              <div className='flex flex-column'>
                <span className='testcase__name'>TestCase Name</span>
                {testcasename.map((testcase)=>{
                  return <span className='flex flex-column testcase_name_list'>{testcase.label}</span>
                })}
              </div>
            </OverlayPanel> */}
      </div>
      </>
    );
  };



  const handleAddAccordion = () => {

    if(screenData?.map((item)=>item.name).includes(repositoryName)){
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Duplicate repository names are not allowed', life: 5000 });
    }
    else{
    const newScreen = {
      name: repositoryName,
      related_dataobjects: [] // Add your initial data structure here
    };
    setNewScreenCount(newScreenCount + 1);

    let params ={
      projectid: defaultselectedProject.projectId,
      name: newScreen.name,
      versionnumber: 0,
      createdby: userInfo.user_id,
      createdbyrole: userInfo.role,
      param : 'create'
    }
    insertScreen(params)
    // insertRepository(params)
    .then(response =>  {
      if (response == "fail") toast.current.show({ severity: 'error', summary: 'Error', detail: 'Unable to add repository, try again!', life: 5000 });
      else if(response === "invalid session") return RedirectPage(history);
      else {
        const addingScreen = [newScreen,...screenData];
        setScreenData(addingScreen);
        setScreenId(true);
        dispatch(loadUserInfoActions.updateElementRepository(true));
        setRepositoryName("")
        setActiveAccordionIndex(0);
        setShowDialog(false)
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Repository added.', life: 5000 });
      }

    
  })
    
    .catch(error => console.log(error))
}
  };


const handleAccordionNameEdit = (index,e) => {
  if(e.key === 'Enter'){
 
  // setScreenData(updatedScreenData);
  const updatedScreenData = [...screenData];

  const previousName = updatedScreenData[index].name;

    if (!previousName && screenRename.trim() === '') {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Screen name cannot be empty!', life: 5000 });
      setScreenRename(previousName);
      return;
    }
    else{
      setScreenRename(previousName)
    }
 
  let params ={
    projectid: defaultselectedProject.projectId,
    name: screenRename ? screenRename : previousName,
    param : 'update',
    screenid: updatedScreenData[index]["_id"]
  }
 
  insertScreen(params)
  // insertRepository(params)
  .then(response =>  {
    if (response == "fail") toast.current.show({ severity: 'error', summary: 'Error', detail: 'Unabel to rename, try again!', life: 5000 });
    else if(response === "invalid session") return RedirectPage(history);
    else{
      setScreenRename("")
      setEditingIndex(null)
      screenRename && toast.current.show({ severity: 'success', summary: 'Success', detail: 'Repository renamed.', life: 5000 });
    }
  })
  .catch(error => console.log(error))
}
}

const handleEmptyNameCheck = (index, e,screenDetails)=>{
  const filteredName = filteredData.reverse();
const updatedScreenData = [...screenData];
const updatedName = [...filteredName]
const previousName = updatedScreenData[index].name;
  if (!previousName && screenRename.trim() === '')  {
    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Input cannot be empty!', life: 5000 });
    return;
  }
  else{
    return screenDetails.name = updatedName[index].name
  }
}

const handleChangeScreenName=(index,e)=>{
  if (e.target.value.includes(' ') || e.keyCode === 32) {
    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Space are not allowed!', life: 5000 });
    e.preventDefault();
    return;
  }
  setScreenRename(e.target.value)
  const updatedScreenData = [...screenData];
  updatedScreenData[index].name = e.target.value;
  setScreenData(updatedScreenData);
}



  const handleContextMenu = (event, accordionId) => {
    contextMenuRef.current.show(event.originalEvent);

    const selectedRowData = event.data;
    const isSelected = selectedCapturedElement.includes(selectedRowData);

    if (!selectedRowData || Object.keys(selectedRowData).length === 0) {
      // If rowData is empty, show only the 'Paste' option
      setContextMenuModel([
        {
          label: 'Paste',
          icon: <img
                 src="static/imgs/paste_icon.svg" className='paste-icon'
                />,
          command: () => pasteRow(accordionId),
          disabled: (copiedRow === null)
        },
      ]);
    } else {

      setContextMenuModel([
        {
          label: 'Copy',
          icon: 'pi pi-copy',
          command: () => copyRow(selectedCapturedElement),
          disabled:(!isSelected)
        },
        {
          label: 'Paste',
          icon: <img
                  src="static/imgs/paste_icon.svg" className='paste-icon'
                />,
          command: () => pasteRow(accordionId),
          disabled: (copiedRow === null)
        },
      ]);
    }
    contextMenuRef.current.show(event.originalEvent);
  };

  const handleEditClick = (index, details) => {
    setActiveAccordionIndex(index);
    setScreenDetails(details);
    dispatch(loadUserInfoActions.openCaptureScreen(true));
    setShowCaptureElement(true);
  };

  const saveElementProperties = () => {
    let actualXpath = selectedCapturedElement && Array.isArray(selectedCapturedElement) ? selectedCapturedElement[0].xpath.split(';') : selectedCapturedElement?.xpath.split(';');
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
      'objectId':selectedCapturedElement && Array.isArray(selectedCapturedElement) ? selectedCapturedElement[0]["_id"]:selectedCapturedElement["_id"],
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
          setScreenId(true);

          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Element properties updated successfully', life: 6000 });


          

        }
      })
      .catch(error => {
        console.log(error)

     
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

  };
  const textEditor = (options) => {
    return <InputText classNametype="text" style={{ width: '100%' }} value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };


  const onRowReorder = (e) => {
    setElementValues(e.value)
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
  
      case "select" || "datalist" :
        return "Dropdown";
  
      case "list" || "dir" || "dl" || "li" || "ol" || "optgroup" || "option" || "ul" :
        return "List";
  
      case "form" || "fieldset" :
        return "Forms";
        
      case "table" || "tbody" || "tfoot" || "thead" || "tr":
        return "Table";
  
      case "form" || "fieldset":
          return "Forms";
  
      case "input" || "textarea" || "textbox":
          return "Textbox";
  
      default:
          return "Element";
      }
    }

  const openElementProperties = (rowdata) => {
    let element = rowdata?.xpath?.split(';')
    if(element==undefined) return;
    setIrisObject(element[0])
    if(defaultselectedProject.appType === "Web" && element[0] !== 'iris' ){
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
      let currindex = rowdata.identifier.filter(element => element.identifier === key)
      dataValue.push({ id: currindex[0].id, identifier: key, key, value, name: defaultNames[key] })
    }
    )
    dataValue.sort((a, b) => a.id - b.id)
    setElementValues(dataValue)
    // if(irisObject !== "iris"){
    setElementProperties(true)
  // }

  }
  // if(element[0]=="iris"){
  //   const data = {
  //     appType: typesOfAppType,
  //     fetchingDetails: props.fetchingDetails,
  //     setIdentifierList: setIdentifierList
  //   };
    
  //   let modalObject = {};
    
  //   modalObject = {
  //     operation: "editIrisObject",
  //     objectDetails: rowdata.objectDetails,
  //     modifyScrapeItem: (data, newProperties, customFlag) =>
  //       modifyScrapeItem(data, newProperties, customFlag),
  //     cord: (rowdata.objectDetails.objId? mainScrapedData.view : irisScrapedData?.view)[rowdata.objectDetails.objIdx].cord
  //   };
    
  //   console.log("Before calling scrapeDataForIris, modalObject:", modalObject);
  //   setCordData(modalObject)
  //   setScrapeDataForIris(modalObject);
    
  // }
  setElementProperties(true)
}

  const renderActionsCell = (screenDetails,rowData) => {
    if (Object.keys(rowData).length > 0) {
      const isSelected = selectedCapturedElement.includes(rowData);
      let selectedElement = [];
      selectedElement.push(rowData);
      setScrapeDataForIris(rowData);
      let scrapeType =
        rowData?.xpath?.split(';') !== undefined
          ? rowData?.xpath?.split(';')
          : " ";
  
          const result=[];


        const matchingOrderItem = screenDetails.orderlist?.find((orderItem) => {
          // Check if orderItem is not null and if it has _id and flag properties
          if (orderItem && orderItem._id && orderItem.flag) {
              return orderItem._id === rowData._id && orderItem.flag === true;
          } else {
              return false; // Skip null or incomplete orderItem
          }
      });

        if (matchingOrderItem) {
          result.push(matchingOrderItem);
        }
        dispatch(loadUserInfoActions.updateElementRepository(true));

        


      return (
        <div className='flex flex-row justify-content-evenly'>
          {defaultselectedProject.appType === "Web" ? (
            <div>
              <Tooltip target=".pencil-edit" position='bottom' content='Edit'/>
              <i className={`pi pi-pencil pencil-edit ${isSelected ? 'disabled-icon' : ''}`}
                onClick={() => {
                  if(!isSelected){
                    setSelectedCapturedElement(selectedElement);
                    openElementProperties(rowData);
                  }
                }}></i>
          </div>) : null}
          <div>
          <Tooltip target=".trash-icon" position='bottom' content='Delete'/>
          <i
            className={`pi pi-trash trash-icon ${isSelected ? 'disabled-icon' : ''}`}
            onClick={() => {
              if(!isSelected){
              if (result.length>0) {
                setResusedDeleteElement(true);
                setReuseDelMessage(
                  <>
                  <div className="pi pi-exclamation-triangle triangle-color"></div>
                  <span className='resued-msg'>Selected element is re-used.Are you sure you want to delete it?</span>
                  </>
                );
              } else {
                setDeleteElements(true);
                setSelectedCapturedElement(rowData);
              }
            }
            }}
          />
          </div>
        </div>
      );
    }

    return null;
  };
  

  const elementValuetitle=(rowdata)=>{
    return (
      <div className={`tooltip__target-${rowdata.value}`} title={rowdata.value}>{rowdata.value}</div>
    )
   }


   const DelReuseMsgContainer = ({message}) => (
    <p style={{color:'black'}}>
        {message}
    </p>
)




const handleSave = (value, cellValue, customFlag = '') => {
  const filteredScreens = screenData.filter((screenitem) => { return screenitem.related_dataobjects.find((element) => element._id === value)});
  const localScrapeItems = [];
  filteredScreens.forEach(item => {
    console.log(item.related_dataobjects)
    localScrapeItems.push(item.related_dataobjects);
  });

  let objId = "";
  let isCustom = false;
  let obj = null;
  for (let scrapeItem of localScrapeItems) {
    if (Array.isArray(scrapeItem)){
      for (let item of scrapeItem) {
        if (item["_id"] === value) {
          item.title = cellValue;
          item.custname = cellValue;
          objId = item["_id"];
          if (item["_id"]) {
            const id = item["_id"];
            obj = {id,custname: cellValue };
          }
        }
      }
    }
      else if (scrapeItem && typeof scrapeItem === 'object'){
        if (scrapeItem["_id"] === value) {
          scrapeItem.title = cellValue;
          scrapeItem.custname=cellValue
          if (scrapeItem["_id"]) obj = {...scrapeItem["_id"],custname: cellValue };
          
        };
      }
  }
  // setCapturedDataToSave(localScrapeItems)

  if (objId) {
    let modifiedDict = { ...modified }
    modifiedDict[objId] = obj;
    setModified(modifiedDict);
  }
}

  useEffect(()=>{
    if (Object.keys(modified).length > 0) {
    let modifiedObjects = Object.values(modified);
    let params = {
      'modifiedObj': modifiedObjects,
      'userId': userInfo.user_id,
      'roleId': userInfo.role,
      'param': 'renameElenemt',
    }
  
    scrapeApi.updateScreen_ICE(params)
      .then(response =>  {
        if (response == "Success") {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Element renamed.', life: 5000 });
          dispatch(loadUserInfoActions.updateElementRepository(true));
      }
      else {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Unable to rename the element, try again!', life: 5000 });
      }
    })}
  },[modified])


const onCellEditComplete = (e) => {
  let { rowData, newValue, field, originalEvent: event } = e;
  if (newValue.trim().length > 0) {
    rowData.selectall = newValue;
    handleSave(rowData["_id"], newValue);
  }
  else event.preventDefault();
}

const cellEditor = (options) => {
  return <InputText type="text" className="element_name" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} style={{ width: "25rem" }} tooltip={options.value} tooltipOptions={{ position: 'bottom' }} />;
};

const saveElements = (screenDetails,deletedArr) => {
  let params = {
    'deletedObj': deletedArr,
    'modifiedObj': {},
    'addedObj': {view:[]},
    'screenId': screenDetails["_id"],
    'userId': userInfo.user_id,
    'roleId': userInfo.role,
    'param': 'saveScrapeData',
    'orderList': screenDetails.orderlist
  }

  scrapeApi.updateScreen_ICE(params)
    .then(response =>  {
      if (response == "Success") {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Element deleted successfully', life: 5000 });
        dispatch(loadUserInfoActions.updateElementRepository(true));
    }
    else {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Something went wrong', life: 5000 });
    }
  })
}


const saveDeletedElements = (screenDetails,deletedArr) => {
  let params = {
    'deletedObj': deletedArr,
    'modifiedObj': {},
    'addedObj': {view:[]},
    'screenId': screenDetails["_id"],
    'userId': userInfo.user_id,
    'roleId': userInfo.role,
    'param': 'delElement',
    'orderList': screenDetails.orderlist.map(element=> {
      if(typeof element == "string"){
        return element
    }
    else{
      return element._id
    }
  })
  }

  scrapeApi.updateScreen_ICE(params)
    .then(response =>  {
      if (response == "Success") {
        setUpdateDeleteCurrentElements(true);
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Element deleted successfully', life: 5000 });
    }
    else {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Something went wrong', life: 5000 });
    }
    dispatch(loadUserInfoActions.updateElementRepository(true));
  })
}

const saveDeleteAllElements = (deletedArr) => {
  let params = {
    'deletedObj': deletedArr,
    'modifiedObj': {},
    'addedObj': {view:[]},
    'userId': userInfo.user_id,
    'roleId': userInfo.role,
    'param': 'delAllElement',
  }

  scrapeApi.updateScreen_ICE(params)
    .then(response =>  {
      if (response == "Success") {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Element deleted successfully', life: 5000 });
    }
    
    else {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Something went wrong', life: 5000 });
    }
    dispatch(loadUserInfoActions.updateElementRepository(true));
  })
}

const handleDeleteRow = (selectedCapturedElement,screenDetails) => {
  let deletedArr = [...deleted];

  screenData.forEach(screen => {
    // Update orderlist by removing the item
    screen.orderlist = screen.orderlist?.filter(item => {
      return item && (item !== selectedCapturedElement[0]["_id"]);
    })
  
    // Update related_dataobjects by removing the item
    screen.related_dataobjects = screen.related_dataobjects.filter(item => {
      return item && (item._id !== selectedCapturedElement[0]["_id"]);
    });
  })

  screenDetails.orderlist?.filter(item=>{
      return item && (item !== selectedCapturedElement[0]["_id"]);
  })

  screenDetails.related_dataobjects.filter(item => {
    return item && (item._id !== selectedCapturedElement[0]["_id"]);
  })


  deletedArr.push(selectedCapturedElement[0]["_id"]);

  setDeleted(deletedArr)
  saveElements(screenDetails,deletedArr);
  setSelectedCapturedElement([])

}




const onRowClick = (e) => {
  setSelectedCapturedElement(e.value);
};


const deleteCurrentElement = (selectedCapturedElement,screenDetails) =>{
  let deletedArr = [...deleted];
  screenData.forEach(screen => {
    screen.orderlist = screen.orderlist?.filter(item => item && (item._id !== selectedCapturedElement[0]["_id"]));
    // Update related_dataobjects by removing the item
    screen.related_dataobjects = screen.related_dataobjects.filter(item => {
      return item && (item._id !== selectedCapturedElement[0]["_id"]);
    });
  })

  screenDetails.orderlist?.filter(item=>{
      return item && (item._id !== selectedCapturedElement[0]["_id"]);
  })

  screenDetails.related_dataobjects.filter(item => {
    return item && (item._id !== selectedCapturedElement[0]["_id"]);
  })


  deletedArr.push(selectedCapturedElement[0]["_id"]);

  setDeleted(deletedArr)
  saveDeletedElements(screenDetails,deletedArr)
  setSelectedCapturedElement([])
}

const deleteElement = (selectedCapturedElement,screenDeatils) =>{
  let deletedArr = [...deleted];
  screenData.forEach(screen => {
    screen.orderlist = screen.orderlist?.filter(item => item?._id !== selectedCapturedElement[0]["_id"]);
    screen.related_dataobjects = screen.related_dataobjects?.filter(item => item?._id !== selectedCapturedElement[0]["_id"]);
  });


  const updatedDeletedArr = [...deletedArr, selectedCapturedElement[0]["_id"]];
  setDeleted(updatedDeletedArr);

  saveDeleteAllElements(updatedDeletedArr);
  setSelectedCapturedElement([]);
}

const saveScreens = (screenDetails) => {
    let params = {
        repoId: screenDetails._id,
    }
  
    scrapeApi.deleteElementRepo(params)
      .then(response =>  {
        if (response == "success") {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Rpository deleted.', life: 5000 });
      }
      
      else {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Unable to delet the repository, try again!', life: 5000 });
      }
      dispatch(loadUserInfoActions.updateElementRepository(true));
    })
  }

const deleteScreen = (index, screenDetails)=>{
    const updatedScreenData = screenData.filter(screen => screen._id !== screenDetails._id);
      setScreenData(updatedScreenData);
      saveScreens(screenDetails);
      if (activeAccordionIndex === index) {
        setActiveAccordionIndex(null); // Close the deleted accordion
    }

}

const handleSearchChange=(event) => {
  const inputValue= event.toLowerCase();
  setSearchText(inputValue);
  if (inputValue !== "") {
    const filterScreenName = filteredData.filter((item) =>
      item.name.toLowerCase().includes(inputValue)
    );
    if(!filterScreenName.length){
      setNoRepoSitory(true)
    }
    setScreenData(filterScreenName);
  } 
  else {
    setScreenData(filteredData);
    setNoRepoSitory(false);
  }
}

const footer =()=>(
  <Button label='Save' className='repository__save__btn' onClick={()=>handleAddAccordion()} disabled={!repositoryName}/>
)

const handleRepositoryName =(e)=>{
  if (e.target.value.includes(' ') || e.keyCode === 32) {
    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Space are not allowed!', life: 5000 });
    e.preventDefault();
    return;
  }
  // } else if ()
  setRepositoryName(e.target.value)
}



  


  return (
    <>
    {/* {props.overlay && <ScreenOverlay content={props.overlay} />} */}
    {overlay && <ScreenOverlay content={overlay} />}
    <Toast ref={toast} position="bottom-center" baseZIndex={1000} style={{ maxWidth: "35rem" }}/>
    <div className='element-repository'>
      {/* <Card className='add__search__design'> */}
        <div className='flex justify-content-between'>
        {/* <span className='search__button'>
            <Button label={<i className="pi pi-plus"></i>} className='button__elements' onClick={()=>setShowDialog(true)}></Button>
            <Tooltip target=".button__elements" position='bottom'>Add centralized repository to the project.</Tooltip>
        </span> */}
        {(screenData.length>0 || noRepository) &&
        <span className="p-input-icon-left search__class">
              <i className="pi pi-search" />
              <InputText placeholder="Search for element repository" value={searchText} onChange={(event) =>
                        event &&
                        event.target &&
                        handleSearchChange(event.target.value)} />
        </span>}
        {(screenData.length>0 || noRepository) && <Button label='Add Repository' className='button__elements' onClick={()=>setShowDialog(true)}></Button>}
          <Tooltip target=".button__elements" position='bottom'>Add centralized repository to the project.</Tooltip>
        {/* </span>
        <Button label='Design Studio'>
           <img src="static/imgs/design_studio_icon 1.svg" style={{ color: "white", fill: "white", width: "100%" }} />
        </Button>
        <span> */}
        {/* <span>
        <Button type="designStudio" size="small" style={buttonStyle_design} onClick={(e) => handleNext("Design Studio")} >
              <div className='flex justify-content-center align-items-center'>
                <img src="static/imgs/design_studio_icon 1.svg" style={{ color: "white", fill: "white", width: "100%" }} />
              </div>
              <div>Design Studio</div>
        </Button><Dropdown className='overviewDropdown' value={selectOverview} onChange={(e) => setSelectOverview(e.value)} options={optionOverview} optionLabel="name"/>
        </span> */}
          {/* <div>Design Studio</div>
           */}
        {/* </span> */}
        </div>
      {/* </Card> */}
      {screenData?.length === 0 && 
      (<div className='empty_msg flex flex-column align-items-center justify-content-center'>
        <img className="not_captured_ele" src="static/imgs/ic-capture-notfound.png" alt="No data available" />
        <p className="not_captured_message">{noRepository ?"No Element Repository found for entered text":"No element repository created yet."}</p>
        {!noRepository && <Button className='create__btn' label='Create Repository' onClick={()=>setShowDialog(true)} />}
        </div>)}
       <Accordion className='accordion-class p-2' activeIndex={activeAccordionIndex} onTabChange={(e) => setActiveAccordionIndex(e.index)}>
        {screenData?.map((screenDetails,index) => (
          <AccordionTab key={index} header={
            <div className='scenario-accordion'>
              <span
                  className="relative"
                  style={{ top:'0rem', cursor: 'pointer' }}
                  onClick={() => {setEditingIndex(index); setScreenBasedElements(screenDetails.related_dataobjects)}}
                  title={screenDetails.name}
                >
                  {editingIndex === index ? (
                    <InputText
                      className='input__field'
                      value={screenDetails.name}
                      onChange={(e) =>handleChangeScreenName(index,e) }
                      onKeyDown={(e)=>handleAccordionNameEdit(index,e)}
                      onBlur={(e) => {setEditingIndex(null);
                      setValue('');
                      handleEmptyNameCheck(index,e,screenDetails)
                    }}
                      style={{height: '2.3rem', top:'-1.1rem'}}
                    />
                  ) : (
                    <span className='screenname__display'>{screenDetails.name && screenDetails.name.length>30?screenDetails.name.slice(0,30)+'...':screenDetails.name }</span>
                  )}
                </span>
              {activeAccordionIndex === index && (
                <>
              <div className='button-class'>
                <Button label='Capture' onClick={()=>{handleEditClick(index, {
                  "_id": screenDetails["_id"],
                  "name": screenDetails.name,
                  "projectId": defaultselectedProject.projectId
                })}} className='edit-text'/>
                <Button label="Delete" severity="danger" onClick={(e)=>{e.stopPropagation();e.preventDefault();setDeleteScreens(true)}} className='delete-text'/>
                
              </div>
              </>)}
            </div>
           } 
          >
            {/* {screenDetails.related_dataobjects.map((screens)=>( */}
              <DataTable
              value={screenDetails.related_dataobjects.length > 0 ? screenDetails.related_dataobjects : [{}]}
              onContextMenu={(e) => handleContextMenu(e, index)}
              size='small'
              emptyMessage="No data found"
              selection={selectedCapturedElement}
              selectionMode='multiple' 
              className='repo__datatable'
              onSelectionChange={(e)=>onRowClick(e)} 
            >
              <Column selectionMode={screenDetails.related_dataobjects.length === 0?'none':"multiple" } headerStyle={{ width: '1rem' }}></Column>
              <Column field="custname" header="Element Name" body={(rowData) => renderElementName(rowData)}
              editor={(options) => {
                if (!options.rowData || Object.keys(options.rowData).length === 0) {
                return null;
              } 
              else {
                return (
                  cellEditor(options)
                );
              }
                }}
              onCellEditComplete={onCellEditComplete}
              bodyStyle={{ cursor: 'url(static/imgs/Pencil24.png) 15 15,auto' }}></Column>
              <Column field="tag" header="Element Property" body={(rowData) => rowData?.tag?.includes("iris")? elementTypeProp(rowData.tag.split(";")[1]): rowData?.tag ? elementTypeProp(rowData.tag):""}></Column>
              <Column field="actions" header="Actions" body={(rowData)=>renderActionsCell(screenDetails,rowData)} headerStyle={{ justifyContent: "center"}}/>
              {/* <Column field="age" header="Age"></Column> */}
            </DataTable>
            <AvoConfirmDialog
              visible={deleteScreens}
              onHide={() => setDeleteScreens(false)}
              showHeader={false}
              message="Are you sure you want to delete the repository?"
              icon="pi pi-exclamation-triangle"
              accept={()=>deleteScreen(index,screenDetails)} />

            <AvoConfirmDialog
              visible={deleteElements}
              onHide={() => setDeleteElements(false)}
              showHeader={false}
              message="Are you sure you want to delete the element?"
              icon="pi pi-exclamation-triangle"
              accept={()=>handleDeleteRow(selectedCapturedElement,screenDetails)} />
              {reusedDeleteElement && <Dialog className='delete_reuse_dailog' visible={reusedDeleteElement} onHide={()=>setResusedDeleteElement(false)} icon="pi pi-exclamation-triangle" footer={<>
                        <Button label='Delete current' onClick={()=>{setResusedDeleteElement(false);deleteCurrentElement(selectedCapturedElement,screenDetails)}} text/>
                        <Button label='Delete everywhere' onClick={()=>{setResusedDeleteElement(false);deleteElement(selectedCapturedElement,screenDetails)}}/>
                    </>}
                    >
                      <DelReuseMsgContainer message={reuseDelMessage}/>
                    </Dialog>
              }
            {/* ))} */}
            
        </AccordionTab>
        ))}
      </Accordion>
      {showCaptureElement && <CaptureModal fetchingDetails={{
                "_id": screenDetails["_id"],
                "name": screenDetails.name,
                "projectID":defaultselectedProject.projectId
              }} visibleCaptureElement={showCaptureElement} setVisibleCaptureElement={setShowCaptureElement}/>}
      <ContextMenu style={{height: '5.5rem'}} ref={contextMenuRef} model={contextMenuModel} />
      {"Web"?
        <Dialog className='element__properties' header={"Element Properties"} draggable={false} position="right" editMode="cell" style={{ width: '66vw', marginRight: '3.3rem' }} visible={elementPropertiesVisible} onHide={() => setElementProperties(false)} footer={footerContent}>
          <div className="card">
            <DataTable value={elementValues} reorderableRows onRowReorder={onRowReorder}  >
              <Column rowReorder style={{ width: '3rem' }} />
              <Column field="id" header="Priority" headerStyle={{ justifyContent: "center", width: '10%', minWidth: '4rem', flexGrow: '0.2' }} bodyStyle={{ textAlign: 'left', flexGrow: '0.2', minWidth: '4rem' }} style={{ minWidth: '3rem' }} />
              {/* <column ></column> */}
              <Column field="name" header="Properties " headerStyle={{ width: '30%', minWidth: '4rem', flexGrow: '0.2' }} bodyStyle={{ flexGrow: '0.2', minWidth: '2rem' }} style={{ width: '20%', overflowWrap: 'anywhere', justifyContent: 'flex-start' }}></Column>
              <Column field="value" header="Value" editor={(options) => textEditor(options)} onCellEditComplete={onCellEditCompleteElementProperties} bodyStyle={{ width: '53%', minWidth: '34rem'}} style={{textOverflow: 'ellipsis', overflow: 'hidden',maxWidth: '16rem'}} body={elementValuetitle}></Column>
            </DataTable>
          </div>
        </Dialog>: null }
        <Dialog className='RepositoryDailog' header="Add repository" visible={showDialog} onHide={()=>{setRepositoryName("");setShowDialog(false)}} footer={footer}>
            <InputText value={repositoryName} className='repository__input' onChange={handleRepositoryName} placeholder='Enter repository name'/>
          </Dialog>
    </div>
    </>
  );
};

export default ElementRepository;
