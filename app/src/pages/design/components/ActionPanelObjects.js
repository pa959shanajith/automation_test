import { React, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux"
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import '../styles/ActionPanelObjects.scss';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { userObjectElement_ICE, fetchReplacedKeywords_ICE } from '../api';
import { Button } from "primereact/button";
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { Messages as MSG, VARIANT } from '../../global/components/Messages';
import RedirectPage from '../../global/components/RedirectPage';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { tagList, tagListToReplace } from './ListVariables';
import { updateScreen_ICE } from '../api';
import { CompareFlag } from '../designSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { leastIndex } from 'd3';
import { CompareElementSuccessful } from '../designSlice';
// import { ScrollPanel } from 'primereact/scrollpanel';












const ActionPanel = (props) => {
  const [selectObjectType, setSelectObjectType] = useState(null);
  const toast = useRef();
  const history = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.landing.userinfo);
  const { changedObj, notChangedObj, notFoundObj } = useSelector(state => state.design.compareObj);
  const compareData = useSelector(state => state.design.compareData);
  const compareFlag = useSelector(state => state.design.compareFlag);
  const [selectedNotFoundElements, setSelectedNotFoundElements] = useState(null)

  const customObj = { objName: "", objType: "", url: "", name: "", relXpath: "", absXpath: "", className: "", id: "", qSelect: "" };
  const [tempIdCounter, setTempIdCounter] = useState(1);
  const [objects, setObjects] = useState([{ ...customObj, tempId: tempIdCounter }]);
  const [customObjList, setCustomObjList] = useState({});
  const [error, setError] = useState({ type: '', tempId: '' });
  const [showFields, setShowFields] = useState([tempIdCounter]);

  const [addElementTempIdCounter, setAddElementTempIdCounter] = useState(0);
  const [addElementObjects, setAddElementObjects] = useState([]);
  const [addElementSelectObjectType, setAddElementSelectObjectType] = useState(null);
  const [addElementInputValue, setAddElementInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState("");
  const [scrapedList, setScrapedList] = useState({});
  const [customList, setCustomList] = useState({});
  const [nonCustomList, setNonCustomList] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [map, setMap] = useState({});
  const [showName, setShowName] = useState("");
  const [orderLists, setOrderLists] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [browserName, setBrowserName] = useState(null)
  const [checked, setChecked] = useState([]);


  const [selectCustomObj, setSelectCustomObj] = useState({
    btn1: '',
    btn2: '',
    btn3: '',
    btn4: ''
  });
  const [inputValue, setInputValue] = useState('');
  const [displayedValues, setDisplayedValues] = useState([]);
  const [value, setValue] = useState('');
  const [selectedSpan, setSelectedSpan] = useState(null);
  const customObjects = [
    { name: 'button', code: 'btn' },
    { name: 'textBox', code: 'txt' },
    { name: 'inputType', code: 'inp' },
    { name: 'button', code: 'btnn' }
  ];

  const objectTypes = [
    { value: "a", typeOfElement: "lnk", name: "Link" },
    { value: "input", typeOfElement: "txtbox", name: "Textbox/Textarea" },
    { value: "table", typeOfElement: "tbl", name: "Table" },
    { value: "list", typeOfElement: "lst", name: "List" },
    { value: "select", typeOfElement: "select", name: "Dropdown" },
    { value: "img", typeOfElement: "img", name: "Image" },
    { value: "button", typeOfElement: "btn", name: "Button" },
    { value: "radiobutton", typeOfElement: "radiobtn", name: "Radiobutton" },
    { value: "checkbox", typeOfElement: "chkbox", name: "Checkbox" },
    { value: "Element", typeOfElement: "elmnt", name: "Element" }
  ];

  useEffect(() => {
    if (props.editFlag) {
      let customFields = ['decrypt', props.utils.object.xpath, props.utils.object.url, props.utils.object.tag];

      userObjectElement_ICE(customFields)
        .then(data => {
          if (data === "unavailableLocalServer")
            // setMsg(MSG.SCRAPE.ERR_CREATE_OBJ);
            return null;
          else if (data === "invalid session") return RedirectPage(history);
          else if (data === "fail")
            // setMsg(MSG.SCRAPE.ERR_CREATE_OBJ);
            return null;
          else {
            let custname = props.utils.object.title;
            let newObj = {
              objName: custname.slice(0, custname.lastIndexOf("_")),
              objType: `${data.tag}-${custname.slice(custname.lastIndexOf("_") + 1)}`,
              url: data.url,
              name: data.name,
              relXpath: data.rpath,
              absXpath: data.apath,
              className: data.classname,
              id: data.id,
              qSelect: data.selector
            }
            let obj = [...objects];
            obj[0] = { ...obj[0], ...newObj };
            // setObjects(obj);
          }
        })
        .catch(error => console.log(error));
    }
    //eslint-disable-next-line
  }, [])

  const handleAccordionTabChange = (index) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    let tempScrapeList = {};
    let tempCustomList = {};
    let tempNonCustom = [];
    let tempOrderList = [];
    if (props.captureList && props.captureList.length) {
      props.captureList.forEach(object => {
        let elementType = object.tag;
        elementType = tagList.includes(elementType) ? elementType : 'Element';;
        if (object.objId) {
          if (object.isCustom) {
            if (tempCustomList[elementType]) tempCustomList[elementType] = [...tempCustomList[elementType], object];
            else tempCustomList[elementType] = [object]
            if (!tempScrapeList[elementType]) tempScrapeList[elementType] = []
          }
          else {
            tempNonCustom.push(object);
            if (tempScrapeList[elementType]) tempScrapeList[elementType] = [...tempScrapeList[elementType], object];
            else tempScrapeList[elementType] = [object]
          }
          tempOrderList.push(object.objId);
        }
      });
      setScrapedList(tempScrapeList);
      setCustomList(tempCustomList);
      setNonCustomList(tempNonCustom);
      setOrderLists(tempOrderList);
    }
  }, []);

  // useEffect(() => {

  const toastErrorMsg = (errorMsg) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: errorMsg, life: 10000 });
  }

  // }, [errorMsg])

  const newField = () => {
    let updatedObjects = [...objects];
    let updatedShowFields = [...showFields];
    let newTempId = tempIdCounter + 1;
    updatedObjects.push({ ...customObj, tempId: newTempId });
    updatedShowFields.push(newTempId);
    setObjects(updatedObjects);
    setShowFields(updatedShowFields);
    setTempIdCounter(newTempId);
    setActiveIndex(updatedObjects.length - 1);
  }

  const deleteField = (index) => {
    const updatedObjects = [...objects];
    updatedObjects.splice(index, 1);

    if (objects[index].tempId in customObjList) {
      const updatedCustomsObjList = { ...customObjList };
      delete updatedCustomsObjList[objects[index].tempId];
      setCustomObjList(updatedCustomsObjList);
    }

    const indexOfId = showFields.indexOf(objects[index].tempId);
    if (indexOfId >= 0) {
      const updatedShowFields = [...showFields];
      updatedShowFields.splice(indexOfId, 1);
      setShowFields(updatedShowFields);
    }

    setObjects(updatedObjects);
    setActiveIndex(activeIndex === index ? -1 : activeIndex);
  };

  const handleInputs = (event, index) => {
    let updatedObjects = [...objects];
    updatedObjects[index] = { ...updatedObjects[index], [event.target.name]: event.target.value };
    setObjects(updatedObjects);
  }

  const onEdit = id => {
    let indexOfId = showFields.indexOf(id);
    if (indexOfId < 0) {
      let updatedShowFields = [...showFields];
      updatedShowFields.push(id);
      setShowFields(updatedShowFields)
    }
  }


  const onSave = index => {
    let object = objects[index];
    let [tag, elementType] = object.objType.code.split('-');
    let customFields = ['encrypt'];
    let errorObj = {};

    if (!object.objName || !object.objType.code || !object.url) {
      errorObj = { [object.tempId]: !object.objName ? "objName" : !object.objType.code ? "objType" : "url" };
    } else if (object.name === "" && object.relXpath === "" && object.absXpath === "" && object.className === "" && object.id === "" && object.qSelect === "") {
      errorObj = { missingField: true }
      return null
      // setMsg(MSG.SCRAPE.WARN_ADD_PROPERTY);
    }

    if (!Object.keys(errorObj).length) {
      customFields.push(...[object.url, object.name, object.relXpath, object.absXpath, object.className, object.id, object.qSelect, elementType]);
      userObjectElement_ICE(customFields)
        .then(data => {
          if (data === "unavailableLocalServer")
            // return null;
            toastErrorMsg(" Failed to create element - ICE not available")

          // setMsg(MSG.CUSTOM(`Failed to ${props.editFlag ? "edit" : "create"} object ICE not available`,VARIANT.ERROR));

          else if (data === "Invalid Session")
            return RedirectPage(history);
          else if (data === "fail") {
            // return null;
            // setMsg({VARIANT:VARIANT.ERROR, CONTENT: `Failed to ${props.editFlag ? "edit" : "create"} object`});
            toastErrorMsg(" Failed to create element - ICE not available")
          }
          else {
            let customObject = {
              custname: `${object.objName}_${elementType}`,
              tag: tag,
              url: data.url,
              xpath: data.xpath,
              editable: 'yes'
            };
            let customObjectsList = { ...customObjList, [object.tempId]: customObject };

            let indexOfId = showFields.indexOf(object.tempId);
            let updatedShowFields = [...showFields];
            updatedShowFields.splice(indexOfId, 1);
            setShowFields(updatedShowFields);
            setCustomObjList(customObjectsList);
            // onSubmit(customObjectsList);
          }
        })
        .catch(error => console.error(error));
    }
    setError(errorObj)
  }


  const onSubmit = (newCustomObjectsList) => {
    if (props.editFlag) {
      let errorFlag = null;
      let errorObj = {};
      let custname = customObjList[1].custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim();
      for (let object of props.scrapeItems) {
        if (object.title === custname && object.val !== props.utils.object.val) {
          errorObj = { [customObjList[1].tempId]: "objName", dTitle: custname };
          errorFlag = 'present';
          break;
        }
      }
      if (errorFlag) {
        setError(errorObj);
        // setMsg(MSG.CUSTOM(`Object Characteristics are same for ${errorObj.dTitle.split('_')[0]}!`,VARIANT.ERROR));
        toastErrorMsg("Object Characteristics are same ")
      }
      else {
        props.utils.modifyScrapeItem(props.utils.object.val, {
          custname: custname,
          tag: customObjList[1].tag,
          url: customObjList[1].url,
          xpath: customObjList[1].xpath,
          editable: true
        }, true);
        props.setShow(false);
      }
    }
    else {
      let localScrapeList = [];
      let viewArray = [];
      let lastIdx = (props.capturedDataToSave && props.capturedDataToSave.view && props.capturedDataToSave.view.length) ? props.capturedDataToSave.view.length : 0;


      let duplicateDict = {};
      let tempIdArr = [];
      let duplicateFlag = false;
      let errorFlag = null;
      let errorObj = {};
      let newOrderList = [];
      console.log('hello');
      for (let tempId of Object.keys(newCustomObjectsList)) {
        let custname = newCustomObjectsList[tempId].custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim();

        for (let object of props.scrapeItems) {
          if (object.title === custname) {
            errorObj = { [tempId]: "objName", dTitle: custname };
            errorFlag = 'present';
            break;
          }
        }

        if (errorFlag === 'present') break;

        if (custname in duplicateDict) {
          duplicateDict[custname].push(tempId);
          tempIdArr.push(...duplicateDict[custname]);
          duplicateFlag = true;
        } else duplicateDict[custname] = [tempId]

        let newUUID = uuid();
        localScrapeList.push({
          objId: undefined,
          objIdx: lastIdx,
          val: newUUID,
          hide: false,
          title: custname,
          url: newCustomObjectsList[tempId].url,
          tag: newCustomObjectsList[tempId].tag,
          xpath: newCustomObjectsList[tempId].xpath,
          editable: true,
          tempOrderId: newUUID,
        });
        viewArray.push({
          custname: custname,
          tag: newCustomObjectsList[tempId].tag,
          url: newCustomObjectsList[tempId].url,
          xpath: newCustomObjectsList[tempId].xpath,
          editable: true
        });
        newOrderList.push(newUUID);
        lastIdx++
      }

      if (errorFlag) {
        setError(errorObj);
        // setMsg(MSG.CUSTOM( `Object Characteristics are same for ${errorObj.dTitle.split('_')[0]}!`,VARIANT.ERROR));
      }
      else if (duplicateFlag) {
        tempIdArr.forEach(tempId => errorObj[tempId] = "objName");
        setError(errorObj);
        // setMsg(MSG.SCRAPE.ERR_DUPLICATE_OBJ);
      } else {
        let updatedNewScrapeData = { ...props.capturedDataToSave };
        if (updatedNewScrapeData.view) updatedNewScrapeData.view.push(...viewArray);
        else updatedNewScrapeData = { view: [...viewArray] };
        props.setNewScrapedData(updatedNewScrapeData);
        props.updateScrapeItems(localScrapeList)
        // props.setOrderList(oldOrderList => [...oldOrderList, ...newOrderList])
        props.setCapturedDataToSave((oldCapturedDataToSave) => [...oldCapturedDataToSave, ...viewArray.map((newlyCreatedElem, newlyCreatedElemIndex) => ({
          isCustom: true,
          ...viewArray[newlyCreatedElemIndex],
          tempOrderId: newOrderList[newlyCreatedElemIndex]
        }))
        ]);
        props.setCaptureData(oldOrderList => [...oldOrderList, ...updatedNewScrapeData.view.map((newlyCreatedElem, newlyCreatedElemIndex) => ({
          selectall: updatedNewScrapeData.view[newlyCreatedElemIndex].custname,
          objectProperty: updatedNewScrapeData.view[newlyCreatedElemIndex].tag,
          browserscrape: 'google chrome',
          screenshots: "",
          actions: '',
          objectDetails: updatedNewScrapeData.view[newlyCreatedElemIndex]
        }))
        ]);
        props.setSaved({ flag: false });
        props.setShow(false);
        // setMsg(MSG.SCRAPE.SUCC_OBJ_CREATE);

      }
    }
  }

  const handleType = (event, index) => {
    let updatedObjects = [...objects];
    updatedObjects[index].objType = event.value;
    setObjects(updatedObjects);
  }

  const resetFields = () => {
    let emptyFields = [...objects];
    let showAll = [...showFields];
    for (let i = 0; i < emptyFields.length; i++) {
      emptyFields[i] = { ...emptyFields[i], ...customObj };
      if (!showAll.includes(emptyFields[i].tempId))
        showAll.push(emptyFields[i].tempId)
    }
    // setObjects(emptyFields);
    setShowFields(showAll);
    setError({ type: '', tempId: '' });
  }

  const addElementSaveHandler = () => {
    let newObjects = [];
    let newOrderList = [];

    for (let i = 0; i < addElementObjects.length; i++) {
      let name = addElementObjects[i].objName;
      let type = addElementObjects[i].objType;
      let tempId = addElementObjects[i].tempId;
      let [tag, value] = type.split("-");
      let custname = `${name.trim()}_${value}`;
      let newUUID = uuid();
      newObjects.push({
        custname: name,
        objIdx: i,
        title: name,
        tag: tag,
        xpath: "",
        val: newUUID,
        isCustom: true,
        tempOrderId: newUUID,
      });
      newOrderList.push(newUUID);
    }
    if (newObjects.length > 0) {
      props.addCustomElement(newObjects, newOrderList);
    }
    props.OnClose();
  }


  const handleAddElementInputChange = (e) => {
    setAddElementInputValue(e.target.value);
  };

  const handleAddElementDropdownChange = (e) => {
    setAddElementSelectObjectType(e.value);
  };

  const handleAddElementAdd = () => {
    let updatedObjects = {};
    objectTypes.map(object_type => {
      if (object_type.value === addElementSelectObjectType) {
        updatedObjects["objName"] = addElementInputValue;
        updatedObjects["objType"] = object_type.value + '-' + object_type.typeOfElement;
        updatedObjects["tempId"] = addElementTempIdCounter + 1;

      }
    });
    setAddElementObjects([...addElementObjects, updatedObjects]);
    setAddElementInputValue('');
    setAddElementSelectObjectType('');
    setAddElementTempIdCounter(addElementTempIdCounter + 1);
  };

  const handleAddElementClear = () => {
    setAddElementInputValue('');
    setAddElementSelectObjectType('');
    setAddElementObjects([]);
  }

  const addElementfooter = (
    <div className=''>
      <Button size="small" onClick={handleAddElementClear} text >Clear</Button> {/*className='add_object_clear'*/}
      <Button size="small" onClick={addElementSaveHandler}>Save</Button> {/*className='add_object_save' */}
    </div>
  )
  const compareElementfooter = (
    <div className=''>
      {changedObj && changedObj.length ? <Button onClick={() => updateObjects()} label="Update" className="update-btn" size="small" style={{ borderRadius: '3px' }} /> : <Button label='Cancel' size="small" className="update-btn" onClick={() => { props.OnClose(); dispatch(CompareFlag(false)) }} />}
    </div>
  )


  const createElementFooter = (
    <div className='save_clear'>
      <button className='add_object_clear' >Clear</button>
      <button className='add_object_save' onClick={() => { onSubmit(customObjList); }} disabled={objects.length == 0}>Submit</button>
    </div>
  );
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
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

  // ----------------------map Element ---------------

  const onDragStart = (event, data) => event.dataTransfer.setData("object", JSON.stringify(data))

  const onDragOver = event => event.preventDefault();

  const onDrop = (event, currObject) => {
    if (map[currObject.val]) props.toastError("Object already merged");
    else {
      let draggedObject = JSON.parse(event.dataTransfer.getData("object"));
      let mapping = {
        ...map,
        [currObject.val]: [draggedObject, currObject],
        [draggedObject.val]: null
      }
      setMap(mapping);
    }
  }

  const onUnlink = () => {
    let mapping = { ...map };
    for (let customObjVal of selectedItems) {
      let scrapeObjVal = mapping[customObjVal][0].val
      delete mapping[customObjVal];
      delete mapping[scrapeObjVal];
    }
    setMap(mapping);
    setSelectedItems([]);
    setShowName("");
  }

  const onShowAllObjects = () => setSelectedTag("");

  const submitMap = () => {

    if (!Object.keys(map).length) {
      props.toastError("Please select atleast one object to Map");
      return;
    }

    // let { screenId, screenName, projectId, appType, versionnumber } = props.current_task;
    let appType = props.appType ? props.appType : "web"; //props.appType;
    const screenId = props.fetchingDetails["_id"];
    const projectId = props.fetchingDetails.projectID;
    const screenName = props.fetchingDetails["name"];
    const versionNumber = 0;

    let arg = {
      projectId: projectId,
      screenId: screenId,
      screenName: screenName,
      param: "mapScrapeData",
      appType: appType,
      objList: [],
      orderList: orderLists,
      versionnumber: 0,
    };

    let mapping = { ...map };
    for (let val in mapping) {
      if (mapping[val]) {
        arg.objList.push([mapping[val][0].objId, mapping[val][1].objId, mapping[val][1].custname]);
        arg.orderList.splice(arg.orderList.indexOf(mapping[val][0].objId), 1)
      }
    }

    updateScreen_ICE(arg)
      .then(response => {
        if (response === "Invalid Session") return RedirectPage(props.history);
        else props.fetchScrapeData()
          .then(resp => {
            if (resp === "success") {
              props.toastSuccess(MSG.SCRAPE.SUCC_MAPPED_SCRAPED);
              props.setShow(false);
            }
            else props.toastError(MSG.SCRAPE.ERR_MAPPED_SCRAPE)
          })
          .catch(err => {
            props.toastError(MSG.SCRAPE.ERR_MAPPED_SCRAPE)
            // console.error(err);
          });
      })
      .catch(error => {
        props.toastError(MSG.SCRAPE.ERR_MAPPED_SCRAPE)
        props.toastError(error);
      })
  }

  const onCustomClick = (showName, id) => {
    let updatedSelectedItems = [...selectedItems]
    let indexOfItem = selectedItems.indexOf(id);

    if (indexOfItem > -1) updatedSelectedItems.splice(indexOfItem, 1);
    else updatedSelectedItems.push(id);

    setShowName(showName);
    setSelectedItems(updatedSelectedItems);
  }


  const mapElementFooter = () => (<>
    <Button data-test="showAll" size="small" onClick={onShowAllObjects}>Show All Elements</Button>
    <Button data-test="unLink" size="small" onClick={onUnlink} disabled={!selectedItems.length}>Un-Link</Button>
    <Button data-test="submit" size="small" onClick={submitMap}>Submit</Button>
  </>
  )

  // const replaceButtonClickHandler = ()=>{
  //   props.startScrape();
  //   setReplaceVisible(true);
  // }

  const footerCompare = (
    <div className='footer_compare'>
      {props.isOpen === 'compareObject' ? <>
        <button className='clear__btn__cmp'>Clear</button>
        <button className='save__btn__cmp' onClick={() => { props.OnClose(); props.startScrape(browserName, 'compare'); }}>Compare</button>
      </> :
        <Button onClick={() => { props.startScrape(browserName, '', 'replace'); setReplaceVisible(true); }} label="Replace"></Button>}
    </div>
  )



  const renderAccordionHeader = (objName, index, objects) => {
    return (
      <div className="accordion-header">
        <div style={{ marginTop: "3rem" }}>{(objName === "") ? `Element ${index + 1}` : objName}</div>
        <div className="accordion-actions">
          <Button label="Save" severity="secondary" text className='save-btn' onClick={() => onSave(index)} />
          <button className=" pi pi-plus button-add" onClick={newField} />
          <button className=" pi pi-trash button-delete" disabled={objects.length == 1} onClick={() => deleteField(index)} />
        </div>
      </div>
    );
  };
  const onTabChanging = (e) => {
    setSelectedTag(e.originalEvent.currentTarget.innerText);
    console.log("OnTabChange", e);
    console.log("OnTabChange", e.originalEvent.currentTarget.innerText);
  }

  // checked checkboxes 
  const onCheckCheckbox = (e) => {
    let _selectedCheckbox = [...checked];

    if (e.checked) _selectedCheckbox.push({ element: e.value, checked: true });
    else
      _selectedCheckbox = _selectedCheckbox.filter(
        (element) => element.element.custname !== e.value.custname
      );

    setChecked(_selectedCheckbox);
  };

  // Update compared elements

  const updateObjects = () => {
    if (!checked.length) {
      toastErrorMsg('Please select element(s) to update properties.')
      return
    }
    let viewString = { ...props.mainScrapedData }
    let updatedObjects = [];
    let updatedIds = []
    let updatedCompareData = { ...compareData };

    checked.map((element, index) => {

      let id = viewString.view[updatedCompareData.changedobjectskeys[index]]._id

      updatedObjects.push({ ...updatedCompareData.view[0].changedobject[index], _id: id });
    })


    let arg = {
      'modifiedObj': updatedObjects,
      'screenId': props.fetchingDetails["_id"],
      'userId': userInfo.user_id,
      'roleId': userInfo.role,
      'param': 'saveScrapeData',
      'orderList': props.orderList
    };

    updateScreen_ICE(arg)
      .then(data => {
        if (data.toLowerCase() === "invalid session") return RedirectPage(history);
        if (data.toLowerCase() === 'success') {
          props.OnClose()
          dispatch(CompareFlag(false))
          dispatch(CompareElementSuccessful(true))
        } else {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Error while updating elements.', life: 10000 });

          dispatch(CompareFlag(false))
        }
      })
      .catch(error => console.error(error));
  }

  const oncheckAll = (e) => {
    let checked = []
    if (e.checked) {
      changedObj.map(element => checked.push({ element: element, checked: true }))
      setChecked(checked)

    }
    else {
      setChecked([])
    }

  }

  // Comapre element action templates
  const accordinHedaerChangedElem = () => {
    return (
      <div style={{ marginLeft: '0.5rem' }} className='accordion-header__changedObj' >
        <Checkbox onChange={oncheckAll}
          checked={(checked.length > 0 && changedObj) ? (checked.every(
            (item) => item.checked === true
          ) && checked.length === changedObj.length) : false}
        />
        <span className='header-name__changedObj' style={{ marginLeft: '0.5rem' }}>Changed Elements</span>
      </div>
    );
  };

  const Header = () => {
    return (
      <div>Element Identifier Order</div>
    );
  };


  // ===========================Replace Element ===================================
  const [replaceVisible, setReplaceVisible] = useState(false);
  const [replaceScrapedList, setReplaceScrapedList] = useState({});
  const [allScraped, setAllScraped] = useState([]);
  const [newScrapedList, setNewScrapedList] = useState({});
  const [selectedReplaceTag, setSelectedReplaceTag] = useState("");
  const [replace, setReplace] = useState({});
  const [replaceShowName, setReplaceShowName] = useState("");
  const [selectedReplaceItems, setSelectedReplaceItems] = useState([]);
  const [replaceKeywordVisible, setReplaceKeywordVisible] = useState(false);
  // const [errorMsg, setErrorMsg] = useState("");
  const [custNames, setCustNames] = useState([]);
  const [replacingCustNm, setReplacingCustNm] = useState([]);
  const [activeTab, setActiveTab] = useState("ObjectReplacement");
  const [firstRender, setFirstRender] = useState(true);
  const [CrossObjKeywordMap, setCrossObjKeywordMap] = useState({});
  const [CORData, setCORData] = useState({});
  const [forceRender, setForceRender] = useState(false); // only used to re-render the replace-keyword screen
  const [objectsReplaced, setObjectsReplaced] = useState(false); // used to detect whether any object was replaced or not
  const [dataTableData, setDataTableData] = useState([]);


  useEffect(() => {
    setFirstRender(false);
    let tempScrapeList = {};
    let tempNewScrapedList = {};
    let tempAllScraped = [];
    let tempCustNames = [];
    if (props.captureList && props.captureList.length) {
      props.captureList.forEach(object => {
        let elementType = object.tag;
        elementType = tagListToReplace.includes(elementType) ? elementType : 'Element';
        if (object.objId) {
          if (!(object.xpath && object.xpath.split(";")[0] === "iris")) {
            tempAllScraped.push(object);
            if (tempScrapeList[elementType]) tempScrapeList[elementType] = [...tempScrapeList[elementType], object];
            else tempScrapeList[elementType] = [object]
          }
        }
        tempCustNames.push(object.custname);
      });
      setAllScraped(tempAllScraped);
      setCustNames(tempCustNames);
    }
    if (props.newScrapedData && props.newScrapedData.length) {
      for (let newTempScrapedDataItem in props.newScrapedData) {
        let elementType = props.newScrapedData[newTempScrapedDataItem].tag;
        elementType = tagListToReplace.includes(elementType) ? elementType : 'Element';
        if (tempNewScrapedList[elementType]) tempNewScrapedList[elementType] = [...tempNewScrapedList[elementType], props.newScrapedData[newTempScrapedDataItem]];
        else tempNewScrapedList[elementType] = [props.newScrapedData[newTempScrapedDataItem]];
        if (!tempScrapeList[elementType]) tempScrapeList[elementType] = [];
      }
      // props.newScrapedData.forEach(newObj => {
      //   let elementType = newObj.tag;
      //   elementType = tagListToReplace.includes(elementType) ? elementType : 'Element';
      //   if (tempNewScrapedList[elementType]) tempNewScrapedList[elementType] = [...tempNewScrapedList[elementType], newObj];
      //   else tempNewScrapedList[elementType] = [newObj];
      //   if (!tempScrapeList[elementType]) tempScrapeList[elementType] = [];
      // });
      setNewScrapedList(tempNewScrapedList);
    }
    setReplaceScrapedList(tempScrapeList);
  }, [props.newScrapedData])

  useEffect(() => {
    // updateScrollBar();
    if (activeTab === "keywordsReplacement" && !document.querySelector(".r-group__container")) {
      _handleModalClose()
    }
  }, [replace])

  useEffect(() => {
    if (Object.keys(replace).length > 0) {
      Object.keys(replace).forEach((val_id, idx) => {
        if (replace[val_id] && (tagListToReplace.includes(replace[val_id][0].tag) ? replace[val_id][0].tag : "element") === (tagListToReplace.includes(replace[val_id][1].tag) ? replace[val_id][1].tag : "element")) {
          let keywords = CORData[replace[val_id][0].objId] ? CORData[replace[val_id][0].objId].keywords : []
          keywords.forEach((keyword, idx1) => {
            if (!CrossObjKeywordMap[replace[val_id][0].objId]) {
              CrossObjKeywordMap[replace[val_id][0].objId] = {
                "keywordMap": {
                  [keyword]: keyword
                }
              }
            }
            else {
              CrossObjKeywordMap[replace[val_id][0].objId]["keywordMap"][keyword] = keyword;
            }
            setCrossObjKeywordMap(CrossObjKeywordMap);
          })
        }
      })
    }
  }, [CORData])

  const onReplaceDragStart = (event, data) => event.dataTransfer.setData("object", JSON.stringify(data))

  const onReplaceDragOver = event => event.preventDefault();

  const onReplaceDrop = (event, currObject) => {
    let replacingCusts = [...replacingCustNm];
    if (replace[currObject.val]) setErrorMsg("Object already merged");
    else {
      let draggedObject = JSON.parse(event.dataTransfer.getData("object"));
      let replacing = {
        ...replace,
        [currObject.val]: [draggedObject, currObject],
        [draggedObject.val]: null
      }
      replacingCusts.push(draggedObject.custname);
      setReplacingCustNm(replacingCusts);
      setReplace(replacing);
      setErrorMsg("");
    }
  }

  const onReplaceUnlink = () => {
    let replacing = { ...replace };
    let replacingCusts = [...replacingCustNm];
    for (let customObjVal of selectedReplaceItems) {
      let scrapeObjVal = replacing[customObjVal][0].val;
      let replNm = replacing[customObjVal][0].custname;
      let indexOfItem = replacingCusts.indexOf(replNm);
      if (indexOfItem > -1) replacingCusts.splice(indexOfItem, 1);
      delete replacing[customObjVal];
      delete replacing[scrapeObjVal];
    }
    setReplacingCustNm(replacingCusts);
    setReplace(replacing);
    setSelectedReplaceItems([]);
    setReplaceShowName("");
  }

  const onReplaceShowAllObjects = () => setSelectedTag("");

  const onReplaceCustomClick = (replaceShowName, id) => {
    let updatedSelectedItems = [...selectedReplaceItems]
    let indexOfItem = selectedReplaceItems.indexOf(id);

    if (indexOfItem > -1) updatedSelectedItems.splice(indexOfItem, 1);
    else updatedSelectedItems.push(id);

    setReplaceShowName(replaceShowName);
    setSelectedReplaceItems(updatedSelectedItems);
  }

  const saveGroupItem = (oldObjId, keywordMap, newObjData, val) => {
    // props.setShowPop({
    //   'type': 'modal',
    //   'title': 'Warning !',
    //   'content': <div className="ss__dup_labels">
    //     Do you want to update the object and all dependent testcases ?
    //   </div>,
    //   'footer': <button onClick={() => {
    // props.setShowPop("")
    // let { screenId } = props.current_task;
    const screenId = props.fetchingDetails["_id"];

    let arg = {
      screenId,
      replaceObjList: {
        oldObjId,
        newKeywordsMap: keywordMap,
        "newObjectData": newObjData,
        testcaseIds: !CORData[oldObjId] ? [] : CORData[oldObjId]["testcasesids"],
      },
      param: "crossReplaceScrapeData"
    }
    updateScreen_ICE(arg)
      .then(response => {
        if (response === "Invalid Session") return RedirectPage(props.history);
        if (response === "Success") {
          let rep = { ...replace }
          delete rep[val];
          setReplace({ ...rep })
          setForceRender(!forceRender)
          props.toastSuccess(MSG.SCRAPE.SUCC_OBJ_TESTCASES_REPLACED)
          if (!objectsReplaced)
            setObjectsReplaced(true)
          /** comment the line below when retaining the selected mappings, for deleting only saved object */
          setCrossObjKeywordMap((prevData) => {
            const newData = { ...prevData }
            delete newData[oldObjId]
            return newData;
          })

          /** uncomment the line below when retaining the selected mappings, currently deleting all mappings after saving */
          // setCrossObjKeywordMap({})
        }
        else {
          props.toastError(MSG.SCRAPE.ERR_REPLACE_OBJECT_FAILED)
        }
      })
      .catch(error => {
        props.toastError(MSG.SCRAPE.ERR_REPLACE_OBJECT_FAILED)
        console.err(error);
      })

    // }}>OK</button>
    // })
  }

  const _handleModalClose = () => {
    props.fetchScrapeData()
      .then(resp => {
        if (resp === "success") {
          if (objectsReplaced) // this is required inside only.
            props.toastSuccess(MSG.SCRAPE.SUCC_REPLACE_SCRAPED)
        }
        else props.toastError(MSG.SCRAPE.ERR_REPLACE_SCRtoastErrorPE)
      })
      .catch(err => {
        props.toastError(MSG.SCRAPE.ERR_REPLACE_SCRAPE)
      });
    props.setShow(false)
  }
  const handleSelectChange = (e, keyword, oldObj) => {
    if (e.target.value) e.target.classList.remove("r-group__selectError")
    else return
    if (!CrossObjKeywordMap[oldObj.objId]) {
      CrossObjKeywordMap[oldObj.objId] = {
        "keywordMap": {
          [keyword]: e.target.value
        }
      }
    }
    else {
      CrossObjKeywordMap[oldObj.objId]["keywordMap"][keyword] = e.target.value;
    }
    setCrossObjKeywordMap(CrossObjKeywordMap);
  }
  const handleReplaceKeywordClick = () => {
    if (!Object.keys(replace).length) {
      props.toastError("Please select atleast one object to Replace");
      return;
    }
    let duplicateItm = false;
    let duplicateCusts = [];
    let object_list = []
    let replacing = { ...replace };
    for (let val in replacing) {
      if (replacing[val]) {
        object_list.push([replacing[val][0].objId, replacing[val][1]]);
        if (custNames.includes(replacing[val][1].custname) && !replacingCustNm.includes(replacing[val][1].custname)) {
          duplicateItm = true;
          duplicateCusts.push(replacing[val][1].custname);
        }
      }
    }

    if (duplicateItm) {
      props.setShowPop({
        'type': 'modal',
        'title': 'Replace Scrape data',
        'content': <div className="ss__dup_labels">
          Please rename/delete duplicate scraped objects
          <br /><br />
          Object characterstics are same for:

          <div className="ss__dup_scroll">
            {duplicateCusts.map((custname, i) => <span key={i} className="ss__dup_li">{custname}</span>)}
          </div>

        </div>,
        'footer': <button onClick={() => props.setShowPop("")}>OK</button>
      })
    } else {
      props.setOverlay("Fetching Keywords for selected objects...")

      // let { screenId,appType } = props.current_task;
      const appType = props.appType ? props.appType : 'Web';
      const screenId = props.fetchingDetails["_id"];

      let arg = {
        screenId,
        appType,
        objMap: {},
      };

      let replacing = { ...replace };
      for (let val in replacing) {
        if (replacing[val]) {
          let tag = tagListToReplace.includes(replacing[val][1].tag) ? replacing[val][1].tag : 'element'
          arg.objMap[replacing[val][0].objId] = tag;
        }
      }
      fetchReplacedKeywords_ICE(arg).then((res) => {
        props.setOverlay(null)
        if (!(res === "fail")) {
          setCORData(res);
          setDataTableData(Object.keys(replace).map((val_id, idx) => {
            let tag = "";
            if (replace[val_id]) tag = tagListToReplace.includes(replace[val_id][1].tag) ? replace[val_id][1].tag : 'element';
            const oldObj = replace[val_id] ? replace[val_id][0] : {};
            const newObj = replace[val_id] ? replace[val_id][1] : {};
            const keywords = replace[val_id] && res[replace[val_id][0].objId] ? res[replace[val_id][0].objId].keywords : [];
            const newkeywords = (res.keywordList && res.keywordList[tag] && Object.keys(res.keywordList[tag]).length) ? Object.keys(res?.keywordList[tag]) : [];
            const singleDataTableData = keywords.map((k_word, idx) => {
              const similarTagNames = (tagListToReplace.includes(oldObj.tag) ? oldObj.tag : "element") === (tagListToReplace.includes(newObj.tag) ? newObj.tag : "element")
              return (
                {
                  oldObj: <span title={oldObj.title}>{oldObj.title}</span>,
                  keywords: <span title={k_word}>{k_word}</span>,
                  newObj: <span title={newObj.title}>{newObj.title}</span>,
                  selectKeyword: (
                    <span style={{ width: '40%' }}>
                      <select
                        className="r-group__select"
                        defaultValue={similarTagNames}
                        onFocus={(e) => { e.target.value ? e.target.classList.remove('r-group__selectError') : e.target.classList.add('r-group__selectError') }}
                        onChange={(e) => { handleSelectChange(e, k_word, oldObj) }}
                        style={{ height: '2rem' }}
                      >
                        <option key="notSelected" value="" title="Select keyword" disabled>
                          Select keyword
                        </option>
                        {newkeywords &&
                          newkeywords.map((keyword, i) => (
                            <option key={keyword + i} title={keyword} value={keyword}>
                              {keyword.slice(0, 30) + (keyword.length > 30 ? '...' : '')}
                            </option>
                          ))}
                      </select>
                    </span>
                  )
                }
              );
            });
            return singleDataTableData;
          }).flat());
          setActiveTab("keywordsReplacement")
        }
        else {
          props.toastError(MSG.SCRAPE.ERR_REPLACE_SCRAPE)
        }
      }).catch((err) => {
        props.setOverlay(null)
        console.log(err)
        // props.toastError(MSG.SCRAPE.ERR_REPLACE_SCRAPE)
      });
    }
  }

  const footerReplace = (
    <div className='footer_compare'>
      <Button size='small' onClick={() => { onReplaceUnlink() }} label='Un-link'></Button>
      <Button size='small' label='Replace Keywords' onClick={() => { handleReplaceKeywordClick(); }}></Button>
    </div>
  )
  const footerReplaceKeyword = (
    <div className='footer_compare'>
      <Button size='small' label='Save' onClick={() => {
        Object.keys(replace).map((val_id, idx) => {

          let keywords = replace[val_id] && CORData[replace[val_id][0].objId] ? CORData[replace[val_id][0].objId].keywords : [];
          let oldObj = replace[val_id][0];
          let COKMap = CrossObjKeywordMap;
          let newObj = replace[val_id][1];
          let val = val_id;

          if (keywords.length > 0)
            saveGroupItem(oldObj.objId, COKMap[oldObj.objId]["keywordMap"], newObj, val)
          else
            saveGroupItem(oldObj.objId, [], newObj, val)
        })
      }}></Button>
    </div>
  )


  return (
    <>
      <Toast ref={toast} position="bottom-center" baseZIndex={1200}></Toast>
      <Dialog
        className='add__object__header'
        header='Add Element'
        visible={props.isOpen === 'addObject'}
        onHide={props.OnClose}
        style={{ height: "28.06rem", width: "38.06rem", marginRight: "15rem" }}
        position='right'
        footer={addElementfooter}>
        <div className='card__add_object'>
          <Card className='add_object__left'>
            <div className='flex flex-column'>
              <div className="pb-3">
                <label className='text-left pl-4' htmlFor="object__dropdown">Select Element Type</label>
                <Dropdown value={addElementSelectObjectType} onChange={handleAddElementDropdownChange} options={objectTypes} optionLabel="name"
                  placeholder="Search" className="w-full mt-1 md:w-15rem object__dropdown" />
              </div>
              <div className="pb-5">
                <label className='text-left pl-4' htmlFor="Element_name">Enter Element Name</label>
                <InputText
                  type="text"
                  className='Element_name p-inputtext-sm mt-1'
                  value={addElementInputValue}
                  onChange={handleAddElementInputChange}
                  placeholder='Text Input'
                  style={{ width: "15rem", marginLeft: "1.25rem" }} />
              </div>
              <div style={{ marginLeft: "13.5rem" }}>
                <Button icon="pi pi-plus" size="small" onClick={handleAddElementAdd} ></Button>
              </div>
            </div>
          </Card>
          <Card className='add_object__right' title="Added Elements">
            {addElementObjects.map((value, index) => (
              <div key={index} className='' >
                <p className="text__added__step">{value.objName}</p>
              </div>
            ))}
          </Card>
        </div >
      </Dialog >


      {<Dialog
        className='map__object__header'
        header={"Map Element"}
        style={{ height: "35.06rem", width: "50.06rem", marginRight: "15rem" }}
        position='right'
        visible={props.isOpen === 'mapObject'}
        onHide={props.OnClose}
        footer={mapElementFooter}
      >

        <p> Please select the Element type from the drop down alongside the objects to be mapped to the necessary object types captured in the screen.</p>
        <div className="map_element_content ">
          <div className="captured_elements">
            <span className="header">Captured Elements</span>
            <div className="list">
              {(selectedTag ? scrapedList[selectedTag] : nonCustomList).map((object, i) => {
                let mapped = object.val in map;

                return (<div data-test="mapObjectListItem" key={i} title={object.title} className={"ss__mo_listItem" + (mapped ? " mo_mapped" : "")} draggable={mapped ? "false" : "true"} onDragStart={(e) => onDragStart(e, object)}>
                  {object.custname}
                </div>)
              })
              }
            </div>
          </div>

          <div className="custom_element">
            <span className="header">Custom Elements</span>
            <div className="container">
              {Object.keys(customList).map((elementType, i) => (
                <>
                  <Accordion activeIndex={activeIndex} onTabOpen={(e) => { setActiveIndex(e.index); onTabChanging(e) }} onTabClose={() => { setActiveIndex(""); setSelectedTag("") }}>
                    <AccordionTab header={elementType} >
                      {<div className="mo_tagItemList">

                        {customList[elementType].map((object, j) => (

                          <div data-test="mapObjectCustomListItem"
                            key={j} title={object.title}
                            className={"mo_tagItems" + (selectedItems.includes(object.val) ? " mo_selectedTag" : "")}
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, object)}>

                            {object.val in map ?
                              <>
                                <span data-test="mapObjectMappedName" className="mo_mappedName" onClick={() => onCustomClick("", object.val)}>
                                  {showName === object.val ? object.title : map[object.val][0].title}
                                </span>
                                <span data-test="mapObjectFlipName" className="mo_nameFlip" onClick={() => onCustomClick(object.val, object.val)}></span>
                              </> :
                              <span data-test="h3" className='pl-1'>{object.title}</span>}

                          </div>))}
                      </div>
                      }
                    </AccordionTab>
                  </Accordion>

                  {/* <div data-test="mapObjectTagHead" className="mo_tagHead" onClick={() => setSelectedTag(elementType === selectedTag ? "" : elementType)}>{elementType}</div> */}

                </>))}
            </div>
          </div>
        </div>
      </Dialog >}

      <Dialog
        className='create__object__modal' header='Create Element'
        style={{ height: "35.06rem", width: "50.06rem", marginRight: "15rem" }}
        position='right'
        visible={props.isOpen === 'createObject'}
        onHide={props.OnClose}
        footer={createElementFooter}>
        <Accordion activeIndex={activeIndex}>
          {objects.map((object, index) => (
            <AccordionTab className="accordin__elem" key={object.tempId} header={renderAccordionHeader(object.objName, index, objects)}>
              <div className='create_obj'>
                <div className='create__left__panel'>
                  <div className='create-elem'>
                    <span className='object__text'>Element Name <span style={{ color: "red" }}> *</span> </span>
                    <InputText required className='input__text' type='text' name="objName" onChange={(e) => handleInputs(e, index)} value={object.objName} disabled={!showFields.includes(object.tempId)} />
                  </div>
                  <div className='create-elem'>
                    <p>Select Element Type <span style={{ color: "red" }}> *</span></p>
                    <Dropdown value={object.objType} required onChange={(e) => handleType(e, index)} disabled={!showFields.includes(object.tempId)} options={
                      objectTypes.map((objectType, i) => (
                        {
                          code: `${objectType.value}-${objectType.typeOfElement}`,
                          name: objectType.name
                        }
                      ))
                    } optionLabel="name"
                      placeholder="Search" className="creat_object_dropdown w-22rem" />
                  </div>
                  {/* {showFields.includes(object.tempId) && */}
                  <>
                    <div className='create-elem'>
                      <span className='object__text'>URL <span style={{ color: "red" }}> *</span></span>
                      <InputText required className='input__text' type='text' name="url" onChange={(e) => handleInputs(e, index)} value={object.url} />
                    </div>
                    <div className='create-elem'>
                      <span className='object__text'>Name Attribute <span style={{ color: "red" }}> *</span></span>
                      <InputText className='input__text' type='text' name="name" onChange={(e) => handleInputs(e, index)} value={object.name} />
                    </div>
                    <div className='create-elem'>
                      <span className='object__text' >Relative Xpath</span>
                      <InputText className='input__text' type='text' name="relXpath" onChange={(e) => handleInputs(e, index)} value={object.relXpath} />
                    </div>
                    <div className='create-elem'>
                      <span className='object__text'>Class Name </span>
                      <InputText className='input__text' type='text' name="className" onChange={(e) => handleInputs(e, index)} value={object.className} />
                    </div>
                    <div className='create-elem'>
                      <span className='object__text'>ID Attribute</span>
                      <InputText required className='input__text' type='text' name="id" onChange={(e) => handleInputs(e, index)} value={object.id} />
                    </div>
                    <div className='create-elem'>
                      <span className='object__text'>Query Selector</span>
                      <InputText className='input__text' type='text' name="qSelect" onChange={(e) => handleInputs(e, index)} value={object.qSelect} />
                    </div>
                    <div className='create-elem'>
                      <span className='object__text'>Absolute Xpath</span>
                      <InputText className='input__text' type='text' name="absXpath" onChange={(e) => handleInputs(e, index)} value={object.absXpath} />
                    </div>
                    <div className='create-elem'>
                      <span className='object__text'>CSS Selector</span>
                      <InputText className='input__text' type='text' name="absXpath" onChange={(e) => handleInputs(e, index)} value={object.qSelect} />
                    </div>
                  </>
                  {/* } */}
                </div>
              </div>
            </AccordionTab>

          ))
          }
        </Accordion>

      </Dialog>

      <Dialog
        className='compare__object__modal'
        header="Compare Object:Sign up screen 1"
        style={{ height: "21.06rem", width: "24.06rem" }}
        visible={(props.isOpen === 'compareObject' || props.isOpen === 'replaceObject') && (replaceVisible === false)}
        onHide={props.OnClose} footer={footerCompare}>
        <div className='compare__object'>
          <span className='compare__btn'>
            <p className='compare__text'>List Of Browsers</p>
          </span>
          <span className='browser__col'>
            <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/ic-explorer.png'></img>Internet Explorer {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(2)} className={selectedSpan === 2 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/chrome.png' />Google Chrome {selectedSpan === 2 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(3)} className={selectedSpan === 3 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png' />Mozilla Firefox {selectedSpan === 3 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
            <span onClick={() => handleSpanClick(4)} className={selectedSpan === 4 ? 'browser__col__selected' : 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png' />Microsoft Edge {selectedSpan === 4 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
          </span>
        </div>
      </Dialog>
      {/* COMPARE ELEMENT  */}
      <Dialog className='create__object__modal' draggable={false} header={Header} style={{ height: "40rem", width: "50.06rem", marginRight: "6rem" }} visible={compareFlag} onHide={() => { dispatch(CompareFlag(false)) }} position='right' footer={compareElementfooter}>
        <Accordion multiple activeIndex={[0]}>
          {changedObj && changedObj.length && <AccordionTab contentClassName='' className="accordin__elem" header={accordinHedaerChangedElem()}>
            <div className='accordion_changedObj'>
              {changedObj.map((element, index) => (

                <div className="changed__elem" key={index} style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.3rem' }}>
                  <Checkbox inputId={element.custname}
                    value={element}
                    onChange={onCheckCheckbox}
                    checked={checked.some(
                      (item) => item.element.custname === element.custname
                    )}
                  />
                  <p>{element.custname}</p>
                </div>))}
            </div>


          </AccordionTab>
          }

          {notFoundObj && notFoundObj.length && <AccordionTab contentClassName='' className="accordin__elem" >
            <div className='accordion_notfoundObj'>
              {notFoundObj.map((element, index) => (

                <div className="changed__elem" key={index} style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.3rem' }}>
                  <p>{element.custname}</p>
                </div>

              ))}
            </div>
          </AccordionTab>
          }

          {notChangedObj && notChangedObj.length && <AccordionTab contentClassName='' className="accordin__compare" header="Unchanged Elements">
            <div className='accordion_unchangedObj'>
              {notChangedObj.map((element, index) => (

                <div className="changed__elem" style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.3rem' }} key={index} >
                  <p>{element.custname}</p>
                </div>

              ))}
            </div>
          </AccordionTab>
          }
        </Accordion>
      </Dialog>

      <Dialog
        className='replace__object__modal'
        header="Replace: Sign up screen 1"
        style={{ height: "35.06rem", width: "50.06rem", marginRight: "15rem" }}
        position='right'
        visible={props.isOpen === "replaceObjectPhase2"}
        onHide={props.OnClose} footer={footerReplace}>
        {
          <div data-test="replaceObject" className="ss__replaceObj">

            <>
              {activeTab === "ObjectReplacement" ?
                <>

                  <div className="ss__replaceObjBody">
                    <div data-test="replaceObjectHeading" className="ss__ro_lbl ro__headerMargin">Please select the Element type and then drag and drop the necessary elements to be replaced with the new Elements</div>
                    <div className="ss__ro_lists">
                      <div data-test="replaceObjectScrapeObjectList" className="ss__ro_scrapeObjectList">
                        <div data-test="replaceObjectLabel" className="ss__ro_lbl ro__lblMargin">Captured Elements</div>
                        <div className="ro_scrapeListContainer">
                          <div className="ro_listCanvas">
                            <div className="ro_listMinHeight">
                              <div data-test="replaceObjectListContent" className="ro_listContent" id="roListId">

                                <>
                                  {allScraped.map((object, i) => {
                                    let replaced = object.val in replace;
                                    return (<div data-test="replaceObjectListItem" key={i} title={object.title} className={"ss__ro_listItem" + (replaced ? " ro_replaced" : "")} draggable={replaced ? "false" : "true"} onDragStart={(e) => onReplaceDragStart(e, object)}>
                                      {object.title}
                                    </div>)
                                  })}
                                </>

                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div data-test="replaceObjectCustomObjectList" className="ss__ro_customObjectList">
                        <div data-test="replaceObjectCustomHeading" className="ss__ro_lbl ro__lblMargin">New Captured Elements</div>
                        <div className="ss__ro_customOutContainer">
                          <div className="ro_listCanvas">
                            <div className="ro_listMinHeight">
                              <div className="ro_listContent" id="roListId">
                                <div data-test="replaceObjectCustomContainer" className="ss__ro_customInContainer">
                                  {Object.keys(newScrapedList).map((elementType, i) => (
                                    <div key={i} className='ro_tagHeaderList'>
                                      <div data-test="replaceObjectTagHead" className="ro_tagHead" onClick={() => setSelectedReplaceTag(elementType === selectedReplaceTag ? "" : elementType)}>{elementType}</div>
                                      {selectedReplaceTag === elementType && <div className="ro_tagItemList">
                                        {newScrapedList[selectedReplaceTag].map((object, j) => <div data-test="replaceObjectCustomListItem" key={j} title={object.custname} className={"ro_tagItems" + (selectedReplaceItems.includes(object.val) ? " ro_selectedTag" : "")} onDragOver={onReplaceDragOver} onDrop={(e) => onReplaceDrop(e, object)}>
                                          {object.val in replace ?
                                            <>
                                              <span data-test="replaceObjectReplacedName" className="ro_replacedName" onClick={() => onReplaceCustomClick("", object.val)}>
                                                {replaceShowName === object.val ? object.title : replace[object.val][0].title}
                                              </span>
                                              <span data-test="replaceObjectFlipName" className="ro_nameFlip" onClick={() => onReplaceCustomClick(object.val, object.val)}></span>
                                            </> :
                                            <span data-test="h3">{object.custname}</span>}

                                        </div>)}
                                      </div>}
                                    </div>
                                  ))}
                                </div>

                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </> :
                <Dialog visible={activeTab === "keywordsReplacement"}
                  onHide={props.OnClose} footer={footerReplaceKeyword} header='Replace Keywords'>
                  <div className='ss__ro_lbl'>Please map the keywords of old elements with the new elements</div>
                  <DataTable value={dataTableData} showGridlines>
                    <Column
                      key="oldObj"
                      field="oldObj"
                      header="Old Elements"
                      style={{ width: "14rem" }}
                    />
                    <Column
                      key="keywords"
                      field="keywords"
                      header="Keyword Used"
                      style={{ width: "14rem" }}
                    />
                    <Column
                      key="newObj"
                      field="newObj"
                      header="New Elements"
                      style={{ width: "14rem" }}
                    />
                    <Column
                      key="selectKeyword"
                      field="selectKeyword"
                      header="Select Keyword"
                      style={{ width: "14rem" }}
                    />
                  </DataTable>
                </Dialog>


              }
            </>
          </div>
        }
      </Dialog>
    </>
  );
}

export default ActionPanel;