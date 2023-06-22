import { React, useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import '../styles/ActionPanelObjects.scss';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";
import { userObjectElement_ICE } from '../../design/api';
import { Button } from "primereact/button";
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { Messages as MSG, VARIANT } from '../../global/components/Messages';
import RedirectPage from '../../global/components/RedirectPage';
import { Accordion, AccordionTab } from 'primereact/accordion';






const ActionPanel = (props) => {
  const [selectObjectType, setSelectObjectType] = useState(null);

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
  const [items, setItems] = useState([{ id: 1, name: 'q_btn', objname: 'btn1' },
  { id: 2, name: 'txt_box', objname: 'btn2' },
  { id: 3, name: 'q_btn', objname: 'btn3' },
  { id: 4, name: 'txt_box', objname: 'btn4' }]);
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

  const handleAdd = () => {
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

  return (
    <>
       <Dialog className='add__object__header' header='Add Element' visible={props.isOpen === 'addObject'} onHide={props.OnClose} style={{ height: "28.06rem", width: "38.06rem" }} position='right' footer={addElementfooter}>
        <div className='card__add_object'>
          <Card className='add_object__left'>
            <div className='flex flex-column'>
              <div  className="pb-3">
                <label className='text-left pl-4' htmlFor="object__dropdown">Select Element Type</label>
                <Dropdown value={addElementSelectObjectType} onChange={handleAddElementDropdownChange} options={objectTypes} optionLabel="name"
                  placeholder="Search" className="w-full md:w-15rem object__dropdown" />
              </div>
              <div className="pb-5">
                <label className='text-left pl-4' htmlFor="Element_name">Enter Element Name</label>
                <InputText
                  type="text"
                  className='Element_name p-inputtext-sm'
                  value={addElementInputValue}
                  onChange={handleAddElementInputChange}
                  placeholder='Text Input'
                  style={{ width: "15rem", marginLeft: "1.25rem" }} />
              </div>
              <div style={{marginLeft:"13.5rem"}}>
                <Button icon="pi pi-plus" size="small" onClick={handleAdd} ></Button>
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


      {< Dialog className='map__object__header' header="Map Object" style={{ height: "28.06rem", width: "38.06rem" }} visible={props.isOpen === 'mapObject'} onHide={props.OnClose}  >
        <p className='text__content'>Please select the object type from the drop down alongside the objects to be mapped to the necessary object types captured in the screen.</p>
        <card className='map__card'>
          <div className='captured__text'>
            <span>Captured Elements</span>
            <span className='custom__obj__text'>Custom Elements</span>
          </div>
          {items.map((item) => {
            return (<div key={item.id} className='object__list'>
              <img className='drag__dots' src='static/imgs/drag-dots.png' />
              <span className='capture__obj'>{item.name}</span>
              <img className='arrow__right' src='static/imgs/arrow-right.png' />

              <Dropdown value={selectCustomObj} name={item.objname} onChange={(e) => setSelectCustomObj(e.value)} options={customObjects} optionLabel="name"
                placeholder="Select a City" className="w-full md:w-14rem custom__objects" />

            </div>
            )
          })}
        </card>
      </Dialog >}

      <Dialog className='create__object__modal' header='Create Element' style={{ height: "40rem", width: "50.06rem" }} visible={props.isOpen === 'createObject'} onHide={props.OnClose} footer={createElementFooter}>
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

      <Dialog className='compare__object__modal' header="Compare Object:Sign up screen 1" style={{ height: "21.06rem", width: "24.06rem" }} visible={props.isOpen === 'compareObject'} onHide={props.OnClose} footer={footerCompare}>
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

export default ActionPanel