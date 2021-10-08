import React ,  { Fragment, useEffect, useState, useRef} from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { ScrollBar } from '..';
import '../styles/MultiSelectDropdown.scss'

/*Component MultiSelectDropdown 
  use: select multiple options 
  props:data : array,
        setData: function, 
        inputPlaceholder: string for input field,
        dropdownOptions: options of dropdown (array of objects) 
        reset: function to reset
*/

const MultiSelectDropdown = ({data,setData,inputPlaceholder,dropdownOptions,reset}) => {
    const inputRef = useRef()
    const [dropDown,setDropDown] = useState(false)
    useEffect(()=>{
        inputRef.current.value = (data.length!==0?data.length+" ":"") +inputPlaceholder;
    },[data])
    const selectOption = (value, event) =>{
        let updateData = [...data];
        if(updateData.includes(value)){
            var index = updateData.indexOf(value);
			updateData.splice(index, 1);
        }
        else {
            updateData.push(value);
        }
        inputRef.current.value = ((updateData.length!==0)?updateData.length+" ":"") + inputPlaceholder
        event.currentTarget.getElementsByTagName('input')[0].checked = !event.currentTarget.getElementsByTagName('input')[0].checked
        setData(updateData);
        if (reset) reset();
    }

    const selectOptionCheckBox = (value) => document.getElementById(value).checked = !document.getElementById(value).checked
			
    return(
        <Fragment>
            <ClickAwayListener onClickAway={()=>setDropDown(false)}>
            <input ref={inputRef} readOnly={true} className="global-ms__input" onClick={()=>{setDropDown(true)}} />
                <div className="global-ms__dropDown" role="menu" id="multiSelectDropDown" style={{display: (dropDown?"block":"none")}}>
                    <ScrollBar thumbColor="#321e4f" scrollId="multiSelectDropDown" >
                    {dropdownOptions.map((item,index) => (  
                        <ul key={index} role="presentation" >
                            <li value={item.value} onClick={(event)=>{selectOption(item.value,event)}} title={item.title} >
                                <input id={item.value} defaultChecked checked={data.includes(item.value)} type="checkbox" style={{ width:"auto"}} onClick={()=>{selectOptionCheckBox(item.value)}} />
                                {"  "}{item.text}
                            </li>
                        </ul>
                    ))}
                    </ScrollBar>
                </div>
            </ClickAwayListener>
        </Fragment>
    )
}

export default MultiSelectDropdown;