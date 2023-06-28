import { React, useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import '../styles/ActionPanelObjects.scss';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { userObjectElement_ICE } from '../api';
import { Button } from "primereact/button";
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { Messages as MSG, VARIANT } from '../../global/components/Messages';
import RedirectPage from '../../global/components/RedirectPage';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { tagList } from './ListVariables';
import { updateScreen_ICE } from '../api';









const ActionPanel = (props) => {
  const [selectObjectType, setSelectObjectType] = useState(null);
  const toast = useRef();
  const history = useNavigate();

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

  useEffect(() => {
    const toastErrorMsg = (errorMsg) => {
      toast.current.show({ severity: 'error', summary: 'Error', detail: errorMsg, life: 10000 });
    }
  }, [errorMsg])

  const newField = () => {
    let updatedObjects = [...objects];
    let updatedShowFields = [...showFields];
    let newTempId = tempIdCounter + 1;
    updatedObjects.push({ ...customObj, tempId: newTempId });
    updatedShowFields.push(newTempId);
    // setObjects(updatedObjects);
    setShowFields(updatedShowFields);
    setTempIdCounter(newTempId);
  }

  const deleteField = index => {
    let updatedObjects = [...objects];

    updatedObjects.splice(index, 1);

    if (objects[index].tempId in customObjList) {
      let updatedCustomsObjList = { ...customObjList };
      delete updatedCustomsObjList[objects[index].tempId];
      setCustomObjList(updatedCustomsObjList);
    }
    let indexOfId = showFields.indexOf(objects[index].tempId);
    if (indexOfId >= 0) {
      let updatedShowFields = [...showFields];
      updatedShowFields.splice(indexOfId, 1);
      setShowFields(updatedShowFields);
    }
    // setObjects(updatedObjects);
  }

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
            return null;
          // setMsg(MSG.CUSTOM(`Failed to ${props.editFlag ? "edit" : "create"} object ICE not available`,VARIANT.ERROR));

          else if (data === "Invalid Session")
            return RedirectPage(history);
          else if (data === "fail")
            return null;
          // setMsg({VARIANT:VARIANT.ERROR, CONTENT: `Failed to ${props.editFlag ? "edit" : "create"} object`});
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
            onSubmit(customObjectsList);
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
        props.setCapturedDataToSave((oldCapturedDataToSave) => [...oldCapturedDataToSave, {
          isCustom: true,
          ...viewArray[0],
          tempOrderId: newOrderList[0]
        }]);
        props.setCaptureData(oldOrderList => [...oldOrderList, {
          selectall: updatedNewScrapeData.view[0].custname,
          objectProperty: updatedNewScrapeData.view[0].tag,
          browserscrape: 'google chrome',
          screenshots: "",
          actions: '',
          objectDetails: updatedNewScrapeData.view[0]
        }])
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

  const createElementFooter = (
    <div className='save_clear'>
      <button className='add_object_clear' >Clear</button>
      <button className='add_object_save' onClick={() => {
        onSave(0);
        // onSubmit();
      }}>Save</button>
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
  const footerCompare = (
    <div className='footer_compare'>
      <button className='clear__btn__cmp'>Clear</button>
      <button className='save__btn__cmp'>Compare</button>
    </div>
  )

  const renderAccordionHeader = (objName) => {
    return (
      <div className="accordion-header">
        <div style={{ marginTop: "1rem" }}>{(objName === "") ? "Element 1" : objName}</div>
        <div className="accordion-actions">
          <button className=" pi pi-plus button-add" onClick={newField} />
          <button className=" pi pi-trash button-delete" />
        </div>
      </div>
    );
  };


  const onTabChanging = (e) => {
    setSelectedTag(e.originalEvent.currentTarget.innerText);
    console.log("OnTabChange", e);
    console.log("OnTabChange", e.originalEvent.currentTarget.innerText);
  }

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
        <Accordion activeIndex={0}>
          {objects.map((object, index) => (
            <AccordionTab className="accordin__elem" header={renderAccordionHeader(object.objName)}>
              <div className='create_obj'>
                <div className='create__left__panel'>
                  <div className='create-elem'>
                    <span className='object__text'>Element Name <span style={{ color: "red" }}> *</span> </span>
                    <InputText required className='input__text' type='text' name="objName" onChange={(e) => handleInputs(e, 0)} value={object.objName} disabled={!showFields.includes(object.tempId)} />
                  </div>
                  <div className='create-elem'>
                    <p>Select Element Type <span style={{ color: "red" }}> *</span></p>
                    <Dropdown value={object.objType} required onChange={(e) => handleType(e, 0)} disabled={!showFields.includes(object.tempId)} options={
                      objectTypes.map((objectType, i) => (
                        {
                          code: `${objectType.value}-${objectType.typeOfElement}`,
                          name: objectType.name
                        }
                      ))
                    } optionLabel="name"
                      placeholder="Search" className="creat_object_dropdown w-22rem" />
                  </div>
                  {showFields.includes(object.tempId) &&
                    <>
                      <div className='create-elem'>
                        <span className='object__text'>URL <span style={{ color: "red" }}> *</span></span>
                        <InputText required className='input__text' type='text' name="url" onChange={(e) => handleInputs(e, 0)} value={object.url} />
                      </div>
                      <div className='create-elem'>
                        <span className='object__text'>Name <span style={{ color: "red" }}> *</span></span>
                        <InputText className='input__text' type='text' name="name" onChange={(e) => handleInputs(e, 0)} value={object.name} />
                      </div>
                      <div className='create-elem'>
                        <span className='object__text' >Relative Xpath <span style={{ color: "red" }}> *</span></span>
                        <InputText className='input__text' type='text' name="relXpath" onChange={(e) => handleInputs(e, 0)} value={object.relXpath} />
                      </div>
                      <div className='create-elem'>
                        <span className='object__text'>Class Name </span>
                        <InputText className='input__text' type='text' name="className" onChange={(e) => handleInputs(e, 0)} value={object.className} />
                      </div>
                      <div className='create-elem'>
                        <span className='object__text'>ID </span>
                        <InputText required className='input__text' type='text' name="id" onChange={(e) => handleInputs(e, 0)} value={object.id} />
                      </div>
                      <div className='create-elem'>
                        <span className='object__text'>Query Selector</span>
                        <InputText className='input__text' type='text' name="qSelect" onChange={(e) => handleInputs(e, 0)} value={object.qSelect} />
                      </div>
                      <div className='create-elem'>
                        <span className='object__text'>Absolute Xpath</span>
                        <InputText className='input__text' type='text' name="absXpath" onChange={(e) => handleInputs(e, 0)} value={object.absXpath} />
                      </div>
                    </>
                  }
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
        style={{ height: "35.06rem", width: "50.06rem", marginRight: "15rem" }}
        position='right'
        visible={props.isOpen === 'compareObject'}
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


    </>
  );
}

export default ActionPanel;