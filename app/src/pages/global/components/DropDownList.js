import React ,  { Fragment, useEffect, useState, useRef} from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { ScrollBar } from '../../global';
import '../styles/DropDownList.scss'

/*Component DropDownList
  use: renders searchable available ice dropdown
*/

const DropDownList = ({data,smartMode,selectedICE, setSelectedICE, placeholder}) => {
    const inputRef = useRef()
    const [list,setList] =  useState([])
    const [dropDown,setDropDown] = useState(false)
    useEffect(()=>{
        setList([...data])
        inputRef.current.value = ""
        if(smartMode==='normal') setSelectedICE("");
        else setSelectedICE({});
        // eslint-disable-next-line
    },[data,smartMode])
    const inputFilter = () =>{
        var val = inputRef.current.value
        var items = [...data].filter((e)=>e.icename.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setList(items)
    }
    const resetField = () => {
        inputRef.current.value = ""
        setList([...data])
        setDropDown(true)
        // if(clickInp)clickInp()
    }

    const selectOption = (icename, event) =>{
        if(smartMode!=='normal'){
            let selectedICEData = {...selectedICE}
			if(selectedICEData[icename]===undefined)selectedICEData[icename]=true;
            else selectedICEData[icename]=!selectedICEData[icename];
            inputRef.current.value = ""
            event.currentTarget.getElementsByTagName('input')[0].checked = !event.currentTarget.getElementsByTagName('input')[0].checked
			setSelectedICE(selectedICEData);
		}else{
			setSelectedICE(icename);
            inputRef.current.value = icename
            setDropDown(false)
		}
    }

    const selectOptionCheckBox = (value) => document.getElementById(value).checked = !document.getElementById(value).checked
			
    return(
        <Fragment>
            <ClickAwayListener onClickAway={()=>setDropDown(false)}>
            <div>
                <input type={'hidden'} autoComplete={"off"} ref={inputRef} className="btn-users dropdown-toggle-edit edit-user-dropdown-edit" onChange={inputFilter} onClick = {resetField} id="userIdName" placeholder={placeholder}/>
                <div className="form-inp-dropdown-popup" role="menu" aria-labelledby="userIdName" style={{display: (dropDown?"block":"none")}}>
                    <ScrollBar thumbColor="#929397" >
                    {list.map((ice,index) => (  
                        <ul key={index} role="presentation" style={{ display: (!(smartMode==='normal') && JSON.parse(ice.statusCode !== "Online") ) ? 'none' : 'block' }} className="dropdown-ul" >
                            <li value={ice.icename} onClick={(event)=>{selectOption(ice.icename,event)}} title={ice.statusCode} className={"dropdown-list-item "+((selectedICE[ice.icename]!==undefined)?" selectedCheckBox":"") } >
                                <input id={ice.icename} checked={selectedICE[ice.icename]} type="checkbox" style={{ width:"auto", display: (smartMode==='normal') ? 'none' : 'block' }} onClick={()=>{selectOptionCheckBox(ice.icename)}} />
                                <span id='status' style={{ backgroundColor: ice.color }}></span>
                                {ice.icename}
                            </li>
                        </ul>
                    ))}
                    </ScrollBar>
                </div>
            </div>
            </ClickAwayListener>
        </Fragment>
    )
}

export default DropDownList;

