import React ,  { Fragment, useEffect, useState} from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { ScrollBar, ValidationExpression } from '../../global';

import '../styles/FormComp.scss'

/*Component FormInput
  use: renders input box and label in a form
  props: name: label , placeholder : placeholder text , inpref = ref
*/
    
const FormInput = (props) => {
    const name = props.label
    const type = props.type
    const placeholder = props.placeholder
    const inpRef = props.inpRef
    const validExp = props.validExp
    const upateInput=()=>{
        inpRef.current.value = ValidationExpression(inpRef.current.value,validExp);
    }
    return(
        <Fragment>
            <div className='col-xs-9 form-group input-label'>
                <label>{name}</label>
                <input type={type} ref={inpRef} onChange={()=>{upateInput()}} className={'middle__input__border form-control__conv-project form-control-custom left-opt'} placeholder={placeholder} maxLength={validExp==="poolName" || validExp=== "emailServerName"?"100":""}></input>
            </div>
        </Fragment>
    )
}

/*Component FormSelect
  use: renders select box and label in a form
  props: name: label , option : [option1,option2] , inpRef : [ref1,ref2] , defValue : default value in options

*/
    
const FormSelect = (props) => {
    const name = props.label
    const defValue = props.defValue
    const option = props.option
    const inpRef = props.inpRef
    const onChangeFn = props.onChangeFn
    const inpId = props.inpId
    return(
        <Fragment>
            <div style={props.style} className='col-xs-9 form-group input-label'>
                <label>{name}</label>
                <select data-test="select_comp" onChange={onChangeFn} ref={inpRef} defaultValue={'def-opt'} className={"adminSelect-project-assign form-control__conv-project left-opt"} id={inpId || "selectForm"}>
                    <option key={'def-opt'} value={'def-opt'} disabled={true}>{defValue}</option>
                    {option.map((e,i)=><option key={i+'_def'} value={e}>{e}</option>)}
                </select>            
            </div>
        </Fragment>
    )
}

/*Component FormRadio
  use: renders radio button and label in a form
  props: name: label , option : [option1,option2] , inpRef : [ref1,ref2]
*/

const FormRadio = (props) => {
    const name = props.label
    const option = props.option
    const inpRef = props.inpRef
    return(
        <Fragment>
            <div className='col-xs-9 form-group input-label'>
                <label>{name}</label>
                <div className='conf-radio left-opt'>
                    {Object.keys(inpRef).map((e,i)=>(
                    <span key={"rad_"+name+i}>
                        <input id={name+i} name={name} value={e} ref={inpRef[e]} type="radio"></input>
                        <label htmlFor={name+i}>{option[i]}</label>
                    </span>)
                    )}
                </div>
            </div>
        </Fragment>
    )
}

/*Component FormInpDropDown
  use: renders searchable pool dropdown
*/

const FormInpDropDown = ({data,setFilter,clickInp,inpRef,type,setNewOption,errBorder,setErrBorder}) => {
    const inputRef = inpRef
    const [list,setList] =  useState([])
    const [dropDown,setDropDown] = useState(false)
    useEffect(()=>{
        setList([...data])
        if(setErrBorder) setErrBorder(false)
    },[data])
    const inputFilter = () =>{
        var val = inputRef.current.value
        var items;
        if(type === "Pool") items = [...data].filter((e)=>e[1].poolname.toUpperCase().indexOf(val.toUpperCase())!==-1)
        if(type === "Email") items = [...data].filter((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
        if(type === "emailSearch") items = [...data].filter((e)=>e.groupname.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setList(items)
        setDropDown(true);
    }
    const resetField = () => {
        if(errBorder || type === "Email"){}
        else inputRef.current.value = ""
        setList([...data])
        setDropDown(true)
        if(setErrBorder) setErrBorder(false)
        if(clickInp)clickInp()
    }
    const selectOption = (e) =>{
        var text = e.currentTarget.innerText
        inputRef.current.value = text
        setDropDown(false)
        setFilter(e)
    }
    const selectNewOption = (e,newEmail) =>{
        var text = e.currentTarget.innerText===""?inputRef.current.value:e.currentTarget.innerText 
        if(newEmail) {
            var invalidEmail = setNewOption(e); 
            if(invalidEmail) inputRef.current.value = text
            else inputRef.current.value = ""
            if(setErrBorder) setErrBorder(invalidEmail);
        } else {
            setFilter(e)
            inputRef.current.value = ""
            if(setErrBorder) setErrBorder(false);
        } 
        setDropDown(false)
    }
    const setPlaceholder = () => {
        if(type==="Pool") return "Search ICE Pool.."
        if (type==="Email") return "Add Email.."
        else if (type==="emailSearch") return "Search Email Group.."
    }
    return(
        <Fragment>
            <ClickAwayListener onClickAway={()=>setDropDown(false)}>
            <div>
                <input type={'text'} autoComplete={"off"} ref={inputRef} className={"btn-users edit-user-dropdown-edit"+ (errBorder ? " selectErrorBorder" : "")} onChange={inputFilter} onClick = {resetField} onKeyPress={event => event.key === 'Enter' && type==="Email" && selectNewOption(event,true)} id="userIdName" placeholder={setPlaceholder()}/>
                {type!=="Email" && <div className="form-inp-dropdown" role="menu" aria-labelledby="userIdName" style={{display: (dropDown?"block":"none")}}>
                    <ScrollBar thumbColor="#929397" >
                    {type === "Pool" ?  list.map((e) => (  
                        <option key={e[0]} onClick={selectOption} value={e[0]}> {e[1].poolname}</option> 
                    )):null}
                    {type === "Email" &&  
                        <>
                            { inputRef!==undefined && inputRef.current!==undefined && inputRef.current!==null && inputRef.current.value!=="" && 
                                <option onClick={(e)=>{selectNewOption(e,true)}} value={inputRef.current.value}> {inputRef.current.value}</option>
                            }
                            {list.map((e) => (  
                                <option key={e[0]} onClick={(e)=>{selectNewOption(e,false)}} value={e._id}> {e.name}</option> 
                            ))}
                        </>
                    }
                    {type === "emailSearch" ?  list.map((e) => (  
                        <option key={e._id} onClick={selectOption} value={e._id}> {e.groupname}</option> 
                    )):null}
                    </ScrollBar>
                </div>}
            </div>
            </ClickAwayListener>
        </Fragment>
    )
}


/*Component FormInpDropDownLdap
  use: renders searchable dropdown
*/

const FormInpDropDownLdap = ({data,setFilter,clickInp,inpRef,defVal,ldapEdit,errBorder,resetVal}) => {
    const inputRef = inpRef
    const defaultValue = defVal
    const [list,setList] =  useState([])
    const [dropDown,setDropDown] = useState(false)

    useEffect(()=>{
        if(defaultValue && document.getElementById("ldapServerName").selectedIndex !== 0 && ldapEdit) {
            inputRef.current.value = defaultValue;
            var items = [...data].filter((e)=>e.toUpperCase().indexOf(defaultValue.toUpperCase())!==-1)
            setList(items)
        }
        else {
            var items = [...data].filter((e)=>e.toUpperCase().indexOf(inputRef.current.value.toUpperCase())!==-1)
            setList(items)
        }    
    },[defaultValue, data])

    useEffect(()=>{
        inputRef.current.value = "";
        document.getElementById("ldapServerName").selectedIndex = "0";
        setList([...data]);
    },[resetVal])

    const inputFilter = (e) =>{
        setFilter(e);
        var val = inputRef.current.value
        var items = [...data].filter((e)=>e.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setList(items)
    }
    const resetField = () => {
        setDropDown(true)
        if(clickInp)clickInp()
    }
    const selectOption = (e) =>{
        var text = e.currentTarget.innerText
        inputRef.current.value = text
        setDropDown(false)
        setFilter(e)
    }
    return(
        <Fragment>
            <ClickAwayListener onClickAway={()=>setDropDown(false)}>
            <div>
                <input type={'text'} autoComplete={"off"} ref={inputRef} className={"btn-users edit-user-dropdown-edit"+ (errBorder ? " selectErrorBorder" : "")} onChange={inputFilter} onClick = {resetField} id="userIdName" placeholder="Search Data Fields.."/>
                <div className="form-inp-dropdown form-inp-dropdown-ldap" role="menu" aria-labelledby="userIdName" style={{display: (dropDown?"block":"none")}}>
                    <ScrollBar thumbColor="#929397" >
                    {list.map((e) => (  
                        <option key={e} onClick={selectOption} value={e}> {e}</option> 
                    ))}
                    </ScrollBar>
                </div>
            </div>
            </ClickAwayListener>
        </Fragment>
    )
}

export {FormInput,FormSelect,FormRadio,FormInpDropDown,FormInpDropDownLdap};

