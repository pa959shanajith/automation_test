import { React, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import '../styles/ActionPanelObjects.scss';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { v4 as uuid } from 'uuid';






const ActionPanel = (props) => {
  const [addElementTempIdCounter, setAddElementTempIdCounter] = useState(0);
  const [addElementObjects, setAddElementObjects] = useState([]);
  const [addElementSelectObjectType, setAddElementSelectObjectType] = useState(null);
  const [selectCustomObj, setSelectCustomObj] = useState({
    btn1: '',
    btn2: '',
    btn3: '',
    btn4: ''
  });
  const [addElementInputValue, setAddElementInputValue] = useState('');
  // const [dropdownValue, setDropdownValue] = useState('');
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

  const handleSpanClick = (index) => {
    if (selectedSpan === index) {
      setSelectedSpan(null);
    } else {
      setSelectedSpan(index);
    }
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

  const footerCompare = (
    <div className='footer_compare'>
      <button className='clear__btn__cmp'>Clear</button>
      <button className='save__btn__cmp'>Compare</button>
    </div>
  )

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
      </Dialog >
      }
      <Dialog className='map__object__header' header="Replace Object" style={{ height: "28.06rem", width: "38.06rem" }} visible={props.isOpen === 'replaceObject'} onHide={props.OnClose}  >
        <p className='text__content'>Please select the object type from the drop down alongside the objects to be mapped to the necessary object types captured in the screen.</p>
        <card className='map__card'>
          <div className='captured__text'>
            <span>Captured Elements</span>
            <span className='new__captured__text'>Newly Captured Elements</span>
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
      </Dialog>

      <Dialog className='create__object__modal' header='Create Object' style={{ height: "28.06rem", width: "50.06rem" }} visible={props.isOpen === 'createObject'} onHide={props.OnClose} >
        <div className='create_obj'>
          <div className='create__left__panel'>
            <p>Select Object Type</p>
            <Dropdown placeholder="Search" className="w-full creat_object_dropdown w-21rem" />
            <span className='object__text'>Enter URL <img src="static/imgs/more-info.png"></img></span>
            <InputText required className='input__text' type='text' value={value} onChange={(e) => setValue(e.target.value)} />
            <span className='object__text'>Enter Name <img src="static/imgs/more-info.png"></img></span>
            <InputText className='input__text' type='text' value={value} onChange={(e) => setValue(e.target.value)} />
            <span className='object__text' >Enter Relative Xpath</span>
            <InputText className='input__text' type='text' value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className='create__right__panel'>
            <span>Enter Class Name <img src="static/imgs/more-info.png"></img></span>
            <InputText className='input__text' type='text' value={value} onChange={(e) => setValue(e.target.value)} />
            <span className='object__text'>Enter ID <img src="static/imgs/more-info.png"></img></span>
            <InputText required className='input__text' type='text' value={value} onChange={(e) => setValue(e.target.value)} />
            <span className='object__text'>Enter Query Selector</span>
            <InputText className='input__text' type='text' value={value} onChange={(e) => setValue(e.target.value)} />
            <span className='object__text'>Enter Absolute Xpath</span>
            <InputText className='input__text' type='text' value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
        </div>
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