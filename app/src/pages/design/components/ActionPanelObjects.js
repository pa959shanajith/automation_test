import { React, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux"
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import '../styles/ActionPanelObjects.scss';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";
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
import { ScrollPanel } from 'primereact/scrollpanel';
import CompareElement from './CompareElement';
import AddElement from './AddElement';
import MapElement from './MapElement';



const ActionPanel = (props) => {
  const [selectObjectType, setSelectObjectType] = useState(null);
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
  const [activeIndex, setActiveIndex] = useState("");




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
          if (data === "unavailableLocalServer") {
            props.toastError(MSG.SCRAPE.ERR_CREATE_OBJ);
            return null;
          }
          else if (data === "invalid session") return RedirectPage(history);
          else if (data === "fail") {
            props.toastError(MSG.SCRAPE.ERR_CREATE_OBJ);
            return null;
          }
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
      props.toastError(MSG.SCRAPE.WARN_ADD_PROPERTY);
      return null
    }

    if (!Object.keys(errorObj).length) {
      customFields.push(...[object.url, object.name, object.relXpath, object.absXpath, object.className, object.id, object.qSelect, elementType]);
      userObjectElement_ICE(customFields)
        .then(data => {
          if (data === "unavailableLocalServer") {
            props.toastError(MSG.CUSTOM(`Failed to ${props.editFlag ? "edit" : "create"} object ICE not available`, VARIANT.ERROR));
            return null;
          }
          else if (data === "Invalid Session")
            return RedirectPage(history);
          else if (data === "fail") {
            props.toastError({ VARIANT: VARIANT.ERROR, CONTENT: `Failed to ${props.editFlag ? "edit" : "create"} object` });
            return null;
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
    props.toastError(errorObj)
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
        props.toastError(MSG.CUSTOM(`Object Characteristics are same for ${errorObj.dTitle.split('_')[0]}!`, VARIANT.ERROR));
        // props.toastError("Object Characteristics are same ")
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
        props.toastError(MSG.CUSTOM(`Object Characteristics are same for ${errorObj.dTitle.split('_')[0]}!`, VARIANT.ERROR));
      }
      else if (duplicateFlag) {
        tempIdArr.forEach(tempId => errorObj[tempId] = "objName");
        setError(errorObj);
        props.toastError(MSG.SCRAPE.ERR_DUPLICATE_OBJ);
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
        props.toastError(MSG.SCRAPE.SUCC_OBJ_CREATE);

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

  
  const footerCompare = (
    <div className='footer_compare'>
      <button className='clear__btn__cmp'>Clear</button>
      {props.isOpen === 'replaceObject' && <Button size="small" onClick={replaceButtonClickHandler}>Replace</Button>}
      {props.isOpen === 'compareObject' && <button className='save__btn__cmp' onClick={() => { props.startScrape(browserName, 'compare'); props.OnClose() }}>Compare</button>}
    </div>
  )

  const replaceButtonClickHandler = () => {
    props.startScrape();
    // setReplaceVisible = (true);
}

  // ============================ compare element ==================================

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
      props.toastError('Please select element(s) to update properties.')
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
          props.toastError('Error while updating elements');

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



  return (
    <>
      {props.isOpen === 'addObject' && <AddElement isOpen={props.isOpen}
        OnClose={props.OnClose}
        addCustomElement={props.addCustomElement}
        toastSuccess={props.toastSuccess}
        toastError={props.toastError}
      />
      }

        {/* isOpen={currentDialog}
        OnClose={handleClose}
        captureList={capturedDataToSave}
        fetchingDetails={props.fetchingDetails}
        fetchScrapeData={fetchScrapeData}
        setShow={setCurrentDialog}
        toastSuccess={toastSuccess}
        toastError={toastError} */}

      {props.isOpen === 'mapObject' && <MapElement isOpen={props.isOpen}
        OnClose={props.OnClose}
        captureList={props.captureList}
        fetchingDetails={props.fetchingDetails}
        fetchScrapeData={props.fetchScrapeData}
        setShow={props.setShow}
        toastSuccess={props.toastSuccess}
        toastError={props.toastError}
      />}

      

      {/* Create Element */}
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

      {/* Browser Slection */}
      <Dialog
        className='compare__object__modal'
        header="Select Browser"
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


      {/* COMPARE ELEMENT  */}
      {/* <Dialog className='create__object__modal' draggable={false} header={Header} style={{ height: "40rem", width: "50.06rem", marginRight: "6rem" }} visible={compareFlag} onHide={() => { dispatch(CompareFlag(false)) }} position='right' footer={compareElementfooter}>
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
      </Dialog> */}
      <CompareElement
        screenId={props.fetchingDetails["_id"]}
        mainScrapedData={props.mainScrapedData}
        orderList={props.orderList}
        fetchingDetails={props.fetchingDetails} 
        fetchScrapeData={props.fetchScrapeData}
        toastSuccess={props.toastSuccess}
        toastError={props.toastError}
        OnClose={props.OnClose}
        setShow={props.setShow}
      />
    </>
  );
}

export default ActionPanel;

