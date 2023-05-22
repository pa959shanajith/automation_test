import React from 'react';
import { Dialog } from 'primereact/dialog';
import { useState } from 'react';
import { Card } from 'primereact/card';
import '../styles/ActionPanelObjects.scss';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";




const ActionPanel = (props) => {
    // const [visible, setVisible] = useState(false);

    // const onHandleHide = ()=>{
    //     console.log("hello this is console log");
    //     // setIsDialogOpen(false)
    const [selectObjectType, setSelectObjectType] = useState(null);
    const [selectCustomObj, setSelectCustomObj] = useState({
      btn1: '',
      btn2: '',
      btn3: '',
      btn4: ''
    });
    const [value, setValue] = useState('');
    const [selectedSpan, setSelectedSpan] = useState(null);
    const [items, setItems] = useState([{id:1, name:'q_btn', objname: 'btn1'},
                                       {id:2, name:'txt_box', objname: 'btn2'},
                                     {id:3, name:'q_btn', objname: 'btn3'},
                                    {id:4, name:'txt_box', objname: 'btn4'} ]);
    const customObjects = [
      {name:'button', code:'btn'},
      {name:'textBox', code:'txt'},
      {name:'inputType',code:'inp'},
      {name:'button',code:'btnn'}
    ];                                
    
    const objectType = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];
   
    const footer =(
        <div>
            <button className='add_object_clear' onClick={handleClear}>Clear</button>
            <button className='add_object_save'>Save</button>
        </div>
    )

    // const onDropdownChange = (e) => {
    //   setSelectCustomObj({
    //     ...selectCustomObj,
    //     [e.target.name] : e.target.value
    //   })
    // }

    const handleSpanClick = (index) => {
      if (selectedSpan === index) {
        setSelectedSpan(null);
      } else {
        setSelectedSpan(index);
      }
    };

    const handleClear=()=>{
          setSelectCustomObj(null);
          setSelectObjectType(null);
    }
    
        console.log(props.isOpen);
    return (
     <>
      <Dialog className='add__object__header'  header='Add Object'  visible={props.isOpen==='addObject'} onHide={props.OnClose} style={{height:"28.06rem", width:"38.06rem"}} position='right' footer={footer}>
        <div className='card__add_object'>
      <Card className='add_object__left' title="Add Object">
      <div>
        <p className='object__type'>Select Object Type</p>
        <Dropdown value={selectObjectType} onChange={(e) => setSelectObjectType(e.value)} options={objectType} optionLabel="name" 
    placeholder="Search" className="w-full md:w-15rem object__dropdown" />
        <p className='object__type__name'>Enter Object Name</p>
        <input className='object__type__input' placeholder='Text Input'/>
        <button className='add_object_btn'>Add</button>
      </div>
       {/* <Card.Footer>
        <small className="p-d-block">Footer text</small>
      </Card.Footer> */}
      </Card>
      <Card className='add_object__right' title="Added Objects">

      </Card>
      </div>
    </Dialog>
  
    { <Dialog className='map__object__header' header="Map Object" style={{height:"28.06rem", width:"38.06rem"}} visible={props.isOpen==='mapObject'} onHide={props.OnClose} footer={footer} > 
     <p className='text__content'>Please select the object type from the drop down alongside the objects to be mapped to the necessary object types captured in the screen.</p>
     <card className='map__card'>
     <div className='captured__text'>
      <span>Captured Objects</span>
      <span className='custom__obj__text'>Custom Objects</span>
     </div>
     {items.map((item)=>{
      return (<div key={item.id} className='object__list'>
        <img className='drag__dots' src='static/imgs/drag-dots.png'/>
        <span className='capture__obj'>{item.name}</span>
        <img className='arrow__right' src='static/imgs/arrow-right.png'/>

        <Dropdown value={selectCustomObj} name={item.objname} onChange={(e) => setSelectCustomObj(e.value)} options={customObjects} optionLabel="name" 
                placeholder="Select a City" className="w-full md:w-14rem custom__objects" />

      </div>
      )
     })}
  
     </card>
    </Dialog>
      }
     <Dialog className='map__object__header' header="Replace Object" style={{height:"28.06rem", width:"38.06rem"}} visible={props.isOpen==='replaceObject'} onHide={props.OnClose} footer={footer} > 
     <p className='text__content'>Please select the object type from the drop down alongside the objects to be mapped to the necessary object types captured in the screen.</p>
     <card className='map__card'>
     <div className='captured__text'>
      <span>Captured Objects</span>
      <span className='new__captured__text'>New Captured Objects</span>
     </div>
     {items.map((item)=>{
      return (<div key={item.id} className='object__list'>
        <img className='drag__dots' src='static/imgs/drag-dots.png'/>
        <span className='capture__obj'>{item.name}</span>
        <img className='arrow__right' src='static/imgs/arrow-right.png'/>

        <Dropdown value={selectCustomObj} name={item.objname} onChange={(e) => setSelectCustomObj(e.value)} options={customObjects} optionLabel="name" 
                placeholder="Select a City" className="w-full md:w-14rem custom__objects" />

      </div>
      )
     })}
  
     </card>
    </Dialog>

    <Dialog className='create__object__modal' header='Create Object' style={{height:"28.06rem", width:"50.06rem"}} visible={props.isOpen==='createObject'} onHide={props.OnClose} footer={footer}>
      <div className='create_obj'>
      <div className='create__left__panel'>
      <p>Select Object Type</p>
      <Dropdown value={selectObjectType} required onChange={(e) => setSelectObjectType(e.value)} options={objectType} optionLabel="name"
    placeholder="Search" className="w-full creat_object_dropdown w-21rem" />
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
   
   <Dialog className='compare__object__modal' header="Compare Object:Sign up screen 1" style={{height: "21.06rem",width: "24.06rem"}} visible={props.isOpen==='compareObject'} onHide={props.OnClose}>
    <div className='compare__object'>
      <span className='compare__btn'>
        <p className='compare__text'>All Browsers</p>
      </span>
      <span className='browser__col'>
      <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1? 'browser__col__selected': 'browser__col__name'}><img className='browser__img' src='static/imgs/ic-explorer.png'></img>Internet Explorer {selectedSpan===1 && <img className='sel__tick' src='static/imgs/ic-tick.png'/>}</span>
        <span onClick={() => handleSpanClick(2)} className={selectedSpan === 2? 'browser__col__selected': 'browser__col__name'}><img className='browser__img' src='static/imgs/chrome.png'/>Google Chrome {selectedSpan===2 && <img className='sel__tick' src='static/imgs/ic-tick.png'/>}</span>
        <span onClick={() => handleSpanClick(3)} className={selectedSpan === 3? 'browser__col__selected': 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png'/>Mozilla Firefox {selectedSpan===3 && <img className='sel__tick' src='static/imgs/ic-tick.png'/>}</span>
        <span onClick={() => handleSpanClick(4)}className={selectedSpan === 4? 'browser__col__selected': 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png'/>Microsoft Edge {selectedSpan===4 && <img className='sel__tick' src='static/imgs/ic-tick.png'/>}</span>
        </span>
    </div>
   </Dialog>
    
     
     </>
    );
}

export default ActionPanel