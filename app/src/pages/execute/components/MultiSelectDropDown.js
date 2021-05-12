import React ,  { Fragment, useEffect, useState, useRef} from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { ScrollBar } from '../../global';
import '../styles/MultiSelectDropDown.scss'

/*Component MultiSelectDropDown 
  use: select multiple options 
*/

const MultiSelectDropDown = ({accessibilityParameters,setAccessibilityParameters}) => {
    const inputRef = useRef()
    const [dropDown,setDropDown] = useState(false)
    useEffect(()=>{
        inputRef.current.value = (accessibilityParameters.length!==0?accessibilityParameters.length:"") +" Standards Selected";
    },[accessibilityParameters])
    const selectOption = (value, event) =>{
        let acc_param = [...accessibilityParameters];
        if(acc_param.includes(value)){
            var index = acc_param.indexOf(value);
			acc_param.splice(index, 1);
        }
        else {
            acc_param.push(value);
        }
        inputRef.current.value = ((acc_param.length!==0)?acc_param.length:"") + " Standards Selected"
        event.currentTarget.getElementsByTagName('input')[0].checked = !event.currentTarget.getElementsByTagName('input')[0].checked
        setAccessibilityParameters(acc_param);
    }

    const selectOptionCheckBox = (value) => document.getElementById(value).checked = !document.getElementById(value).checked
			
    return(
        <Fragment>
            <ClickAwayListener className="exe__table-multiDropDown-pad" onClickAway={()=>setDropDown(false)}>
            <input ref={inputRef} readOnly={true} className="ms__input" onClick={()=>{setDropDown(true)}} id="userIdName" />
                <div className="ms__dropDown" role="menu" id="multiSelectDropDown" style={{display: (dropDown?"block":"none")}}>
                    <ScrollBar thumbColor="#321e4f" scrollId="multiSelectDropDown" >
                    {paradigmDropdown.map((data,index) => (  
                        <ul key={index} role="presentation" >
                            <li value={data.value} onClick={(event)=>{selectOption(data.value,event)}} title={data.title} >
                                <input id={data.value} defaultChecked checked={accessibilityParameters.includes(data.value)} type="checkbox" style={{ width:"auto"}} onClick={()=>{selectOptionCheckBox(data.value)}} />
                                {"  "}{data.text}
                            </li>
                        </ul>
                    ))}
                    </ScrollBar>
                </div>
            </ClickAwayListener>
        </Fragment>
    )
}

const paradigmDropdown = [{title:"method A", value:"A", text:"A"},
                          {title:"method AA", value:"AA", text:"AA"},
                          {title:"method AAA", value:"AAA", text:"AAA"},
                          {title:"Aria", value:"aria", text:"Aria"},
                          {title:"method 508", value:"508", text:"Section 508"},
                          {title:"method Best Practice", value:"Best Practice",text:"Best Practice"}
                        ]


export default MultiSelectDropDown;